/* IMPORT */

import { is } from "electron-util";
import * as React from "react";
import { connect } from "overstated";
import Main from "@renderer/containers/main";
import Search from "./toolbar_search";
import NewButton from "./toolbar_button_new";

/** 搜索工具条 */
const Toolbar = ({ isFullscreen, hasSidebar }) => (
  <div className="layout-header toolbar">
    {/* macOS工具条 */}
    <div className="multiple grow">
      {isFullscreen || hasSidebar || !is.macos ? null : (
        <div className="toolbar-semaphore-spacer"></div>
      )}
      <Search />
      <NewButton />
    </div>
  </div>
);

/* EXPORT */

export default connect({
  container: Main,
  selector: ({ container }) => ({
    isFullscreen: container.window.isFullscreen(),
    hasSidebar: container.window.hasSidebar(),
  }),
})(Toolbar);
