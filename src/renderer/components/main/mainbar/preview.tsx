import React from "react";
import Idle from "react-idle-render";
import { connect } from "overstated";
import Markdown from "@renderer/utils/markdown";
import Main from "@renderer/containers/main";

/**
 * markdown预览器，通过dangerouslySetInnerHTML改变div的内容为md转换后的html。
 *
 */
const Preview = ({ content }) => (
  <Idle timeout={150}>
    {() => {
      // 将md内容字符串转换成html
      const html = Markdown.render(content);
      return (
        <div
          className="layout-content preview"
          dangerouslySetInnerHTML={{ __html: html }}
        ></div>
      );
    }}
  </Idle>
);

export default connect({
  container: Main,
  selector: ({ container, content }) => ({
    content: content || container.note.getPlainContent(),
  }),
})(Preview);
