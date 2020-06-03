import * as React from "react";
import { connect } from "overstated";
import Main from "@renderer/containers/main";
import Content from "./content";
import Toolbar from "./toolbar";

/**
 * The sidebar is where all your notes are categorized.
 */
const Sidebar = ({ isFocus, isZen, hasSidebar }) => {
  // 满足下列条件之一， 则不显示分类条
  if (isFocus || isZen || !hasSidebar) return null;

  return (
    <div className="sidebar layout column">
      {/* macOS独有的工具条 */}
      <Toolbar />
      <Content />
    </div>
  );
};

export default connect({
  container: Main,
  selector: ({ container }) => ({
    isFocus: container.window.isFocus(),
    isZen: container.window.isZen(),
    hasSidebar: container.window.hasSidebar(),
  }),
})(Sidebar);
