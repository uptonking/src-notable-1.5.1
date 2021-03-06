import * as _ from "lodash";
import CallsBatch from "calls-batch";
import watcher from "chokidar-watcher";
import Dialog from "electron-dialog";
import glob from "tiny-glob";
import { Container, autosuspend } from "overstated";
import Config from "@common/config";
import File from "@renderer/utils/file";
import Utils from "@renderer/utils/utils";

/**
 * 负责监听所有笔记文件的更新，并将最新的notes数据保存到state
 */
class Notes extends Container<NotesState, MainCTX> {
  _listener?: import("chokidar").FSWatcher;

  state = {
    /** k是一个笔记文件路径，v是文件内容数据 */
    notes: {} as NotesObj,
  };

  constructor() {
    super();
    autosuspend(this);
  }

  /* LIFECYCLE */

  /** 异步读取所有笔记文件内容数据，保存到state */
  refresh = async () => {
    // 类似  /media/win10/active/sharing/note4yaoo/notes
    const notesPath = Config.notes.path;
    // console.log("==notesPath ", notesPath);

    if (!notesPath || !(await File.exists(notesPath))) return;
    // 类似 ["/path/to/notes/app-amazing.md", "/notes/cli-options.md", "/notes/log-dev.md"]
    const filePaths = Utils.normalizeFilePaths(
      await glob(Config.notes.glob, {
        cwd: notesPath,
        absolute: true,
        filesOnly: true,
      })
    );
    // console.log("==filePaths ", filePaths);

    const notes: NotesObj = {};

    await Promise.all(
      filePaths.map(async (filePath) => {
        // 执行读取笔记文件的入口
        const note = await this.ctx.note.read(filePath);

        if (!note) return;

        notes[filePath] = note;
      })
    );

    // 保存到this.state
    return this.set(notes);
  };

  /** 监听指定目录下笔记文件的变化 */
  listen = () => {
    // In order to better support HMR
    if (this._listener) this._listener.close();

    const batch = new CallsBatch({
      preflush: () => {
        this.ctx.suspend();
        this.ctx.suspendMiddlewares();
        optimizeBatch(batch);
      },
      postflush: () => {
        this.ctx.unsuspend();
        this.ctx.unsuspendMiddlewares();
      },
      wait: 100,
    });

    const optimizeBatch = (batch: CallsBatch.type) => {
      /* GET */
      let queueNext = batch.get();
      /* SKIPPING UPDATES ON MULTIPLE ADDITIONS */
      const lastAddIndex = _.findLastIndex(
        queueNext,
        (call) => call[0] === add
      );
      queueNext = queueNext.map((call, index: number) => {
        if (call[0] === add && index < lastAddIndex) {
          if (!call[1]) call[1] = [];
          call[1][1] = false;
        }
        return call;
      });
      /* SKIPPING UPDATES ON MULTIPLE DELETIONS */
      const lastDeleteIndex = _.findLastIndex(
        queueNext,
        (call) => call[0] === unlink
      );
      queueNext = queueNext.map((call, index: number) => {
        if (call[0] === unlink && index < lastDeleteIndex) {
          if (!call[1]) call[1] = [];
          call[1][1] = false;
        }
        return call;
      });
      /* SKIPPING UPDATES ON MULTIPLE CHANGES & MULTIPLE CONSECUTIVE CHANGES TO THE SAME FILE */
      const lastChangeIndex = _.findLastIndex(
        queueNext,
        (call) => call[0] === change
      );
      queueNext = queueNext
        .filter((call, index: number) => {
          const callNext = queueNext[index + 1];
          return (
            !callNext ||
            call[0] !== callNext[0] ||
            (call[1] && callNext[1] && call[1][0] !== callNext[1][0])
          );
        })
        .map((call, index: number) => {
          if (call[0] === change && index < lastChangeIndex) {
            if (!call[1]) call[1] = [];
            call[1][1] = false;
          }
          return call;
        });
      /* SET */
      batch.set(queueNext);
    };

    function isFilePathSupported(filePath: string) {
      return Config.notes.re.test(filePath);
    }

    const add = async (filePath: string, _refresh?: boolean) => {
      if (!isFilePathSupported(filePath)) return;
      const note = await this.ctx.note.read(filePath);
      if (!note) return;
      const prevNote = this.ctx.note.get(filePath);
      if (prevNote) return;
      await this.ctx.note.add(note, _refresh);
    };

    const change = async (filePath: string, _refresh?: boolean) => {
      if (!isFilePathSupported(filePath)) return;
      await rename(filePath, filePath, _refresh);
    };

    const rename = async (
      filePath: string,
      nextFilePath: string,
      _refresh?: boolean
    ) => {
      if (!isFilePathSupported(nextFilePath)) {
        if (isFilePathSupported(filePath)) return unlink(filePath);
        return;
      }
      const nextNote = await this.ctx.note.read(nextFilePath);
      if (!nextNote) return;
      const note = this.ctx.note.get(filePath);
      if (!note) return add(nextFilePath);
      if (this.ctx.note.is(note, nextNote)) return;
      if (
        note.metadata.modified.getTime() > nextNote.metadata.modified.getTime()
      )
        return;
      if (
        !nextNote.content.length &&
        Math.abs(
          note.metadata.modified.getTime() -
          nextNote.metadata.modified.getTime()
        ) < 1500
      )
        return; //FIXME: For some reason some times the note gets read as an empty string, maybe we are reading and writing at "the same" time and the file gets cleared?
      const editorData = this.ctx.editor.getData();
      if (editorData && editorData.filePath === filePath) {
        // The current note has been renamed
        if (editorData.content !== nextNote.plainContent) {
          // Changes to the current note
          const choice = Dialog.choice(
            "This note has been updated on disk, do you want to overwrite your current changes or keep them?",
            ["Overwrite Changes", "Keep Changes"]
          );
          if (choice === 1) return await this.ctx.note.autosave(true);
        }
      }
      await this.ctx.note.replace(note, nextNote, _refresh);
    };

    const unlink = async (filePath: string, _refresh?: boolean) => {
      if (!isFilePathSupported(filePath)) return;
      const note = this.ctx.note.get(filePath);
      if (!note) return;
      await this.ctx.note.delete(note, true, _refresh);
    };

    const notesPath = Config.notes.path;

    if (!notesPath) return;

    this._listener = watcher(
      notesPath,
      {},
      {
        add: Utils.batchify(batch, add),
        change: Utils.batchify(batch, change),
        rename: Utils.batchify(batch, rename),
        unlink: Utils.batchify(batch, unlink),
      }
    );
  };

  /* API */

  get = (): NotesObj => {
    return this.state.notes;
  };

  set = (notes: NotesObj) => {
    return this.setState({ notes });
  };
}

export default Notes;
