import { connect } from "overstated";
import { Component } from "react-component-renderless";
import Main from "@renderer/containers/main";
/**
 * 给md编辑器添加update监听器
 */
class EditorPlugins extends Component<{}, {}> {
  componentWillMount() {
    $.$window.on("resize", this.__editorUpdate);
    $.$document.on("layoutresizable:resize", this.__editorUpdate);
  }

  componentWillUnmount() {
    $.$window.off("resize", this.__editorUpdate);
    $.$document.off("layoutresizable:resize", this.__editorUpdate);
  }

  componentDidUpdate() {
    this.__editorUpdate();
  }

  __editorUpdate = () => {
    $.$window.trigger("monaco:update");
  };
}

export default connect({
  container: Main,
  selector: ({ container }) => ({
    isFocus: container.window.isFocus(),
    isFullscreen: container.window.isFullscreen(),
    isSplit: container.editor.isSplit(),
    isZen: container.window.isZen(),
    hasSidebar: container.window.hasSidebar(),
  }),
})(EditorPlugins);
