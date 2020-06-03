import React from "react";
import { connect } from "overstated";
import CWD from "@renderer/containers/cwd";

const Footer = ({ select, selectDefault }) => (
  <div className="layout-footer toolbar">
    <div className="multiple fluid center-y">
      <div className="button default no-grow" onClick={selectDefault}>
        <span>Use Default</span>
        <span className="xsmall disabled">~/.notable</span>
      </div>
      <div className="spacer"></div>
      <div className="button no-grow accent" onClick={select}>
        Select
      </div>
    </div>
  </div>
);

export default connect({
  container: CWD,
  selector: ({ container }) => ({
    select: container.select,
    selectDefault: container.selectDefault,
  }),
})(Footer);
