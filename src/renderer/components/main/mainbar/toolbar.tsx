import { is } from "electron-util";
import React from "react";
import { connect } from "overstated";
import Main from "@renderer/containers/main";
import AttachmentsButton from "./toolbar_button_attachments";
import EditorButton from "./toolbar_button_editor";
import FavoriteButton from "./toolbar_button_favorite";
import OpenButton from "./toolbar_button_open";
import PinButton from "./toolbar_button_pin";
import SplitEditorButton from "./toolbar_button_split_editor";
import TagsButton from "./toolbar_button_tags";
import TrashButton from "./toolbar_button_trash";
import TrashPermanentlyButton from "./toolbar_button_trash_permanently";

/**
 * 编辑区上方的工具条
 */
const Toolbar = ({ hasNote, isFocus, isFullscreen, isZen, isSplit }) => {
  if (isZen)
    return is.macos ? <div className="layout-header toolbar"></div> : null;

  return (
    <div className="layout-header toolbar">
      <div className={`${!hasNote ? "disabled" : ""} multiple grow`}>
        {!isFocus || isFullscreen || !is.macos ? null : (
          <div className="toolbar-semaphore-spacer"></div>
        )}

        {/* 编辑与查看状态切换/标签/附件的图标 */}
        <div className="multiple joined">
          {isSplit ? <SplitEditorButton /> : <EditorButton />}
          <TagsButton />
          <AttachmentsButton />
        </div>

        {/* 收藏/置顶的图标 */}
        <div className="multiple joined">
          <FavoriteButton />
          <PinButton />
        </div>

        {/* 删除的图标 */}
        <div className="multiple joined">
          <TrashButton />
          <TrashPermanentlyButton />
        </div>
        <div className="spacer"></div>

        {/* 最右侧图标，使用系统默认程序打开本文档 */}
        <OpenButton />
      </div>
    </div>
  );
};

export default connect({
  container: Main,
  selector: ({ container }) => ({
    hasNote: !!container.note.get(),
    isFocus: container.window.isFocus(),
    isFullscreen: container.window.isFullscreen(),
    isZen: container.window.isZen(),
    isSplit: container.editor.isSplit(),
  }),
})(Toolbar);
