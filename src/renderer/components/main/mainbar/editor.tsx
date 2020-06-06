import { ipcRenderer as ipc } from "electron";
import React from "react";
import { connect } from "overstated";
import Main from "@renderer/containers/main";
import Monaco from "./monaco";

interface EditorProps {
  onChange: Function;
  onUpdate: Function;
  filePath: string;
  content: string;
  theme: string;
  autosave: Function;
  getMonaco: Function;
  setMonaco: Function;
  hasFocus: Function;
  forget: Function;
  focus: Function;
  save: Function;
  restore: Function;
  reset: Function;
}

/**
 * markdown编辑器, render返回的是自定义Monaco组件。
 * 管理编辑器的挂载与卸载、onChange、update、scroll等事件。
 */
class Editor extends React.Component<EditorProps, {}> {
  _wasWindowBlurred: boolean = false;

  componentDidMount() {
    this.props.focus();

    ipc.addListener("window-blur", this.__windowBlur);
  }

  componentWillUnmount() {
    ipc.removeListener("window-blur", this.__windowBlur);
  }

  __windowBlur = () => {
    this._wasWindowBlurred = true;
  };

  __mount = (editor: MonacoEditor) => {
    this.props.setMonaco(editor);

    if (!this.props.restore()) this.props.reset();
  };

  __unmount = () => {
    this.props.autosave();
    this.props.setMonaco();
  };

  __editorChange = () => {
    this.props.autosave();
  };

  __change = (content: string) => {
    if (!this.props.onChange) return;

    this.props.onChange(content);
  };

  __blur = () => {
    this.props.save();
    this.props.autosave();
  };

  __focus = () => {
    if (!this._wasWindowBlurred) return;

    this._wasWindowBlurred = false;

    this.props.restore();
  };

  __scroll = () => {
    if (
      !this.props.getMonaco() ||
      (!this._wasWindowBlurred && this.props.hasFocus())
    )
      return;

    this.props.forget();
  };

  __update = (content: string) => {
    this.props.reset();

    if (!this.props.onUpdate) return;

    this.props.onUpdate(content);
  };

  render() {
    const { filePath, content, theme } = this.props;

    return (
      <Monaco
        className="layout-content editor"
        filePath={filePath}
        language="markdown"
        theme={theme}
        value={content}
        editorDidMount={this.__mount}
        editorWillUnmount={this.__unmount}
        editorWillChange={this.__editorChange}
        onBlur={this.__blur}
        onFocus={this.__focus}
        onChange={this.__change}
        onUpdate={this.__update}
        onScroll={this.__scroll}
      />
    );
  }
}

export default connect({
  container: Main,
  selector: ({ container, onChange, onUpdate }) => {
    const note = container.note.get();

    return {
      onChange,
      onUpdate,
      filePath: note.filePath,
      content: container.note.getPlainContent(note),
      theme: container.theme.get(),
      autosave: container.note.autosave,
      getMonaco: container.editor.getMonaco,
      setMonaco: container.editor.setMonaco,
      hasFocus: container.editor.hasFocus,
      forget: container.editor.editingState.forget,
      focus: container.editor.editingState.focus,
      save: container.editor.editingState.save,
      restore: container.editor.editingState.restore,
      reset: container.editor.editingState.reset,
    };
  },
})(Editor);
