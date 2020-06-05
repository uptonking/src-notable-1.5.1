import React from "react";
import { connect } from "overstated";
import MainContainer from "@renderer/containers/main";
import Layout from "./layout";
import Mainbar from "./mainbar";
import Middlebar from "./middlebar";
import Sidebar from "./sidebar";
import ContextMenu from "./extra/context_menu";
import EditorPlugins from "./extra/editor_plugins";
import GlobalPlugins from "./extra/global_plugins";
import IPC from "./extra/ipc";
import PreviewPlugins from "./extra/preview_plugins";
import Shortcuts from "./extra/shortcuts";
import QuickPanel from "./modals/quick_panel";

interface MainProps {
  loading: boolean;
  refresh: Function;
  listen: Function;
  isFocus: boolean;
  isFullscreen: boolean;
  isZen: boolean;
  hasSidebar: boolean;
}

/**
 * 笔记默认首页的react组件, 主要分3部分,sidebar,middlebar,mainbar
 */
class MainDefaultPage extends React.Component<MainProps, {}> {
  async componentDidMount() {
    if (this.props.loading) {
      await this.props.refresh();
    }

    await this.props.listen();
  }

  render() {
    const { isFocus, isFullscreen, isZen, hasSidebar } = this.props;

    return (
      <>
        {/* 从下面开始一直到Shortcuts组件，都是纯容器组件，用来处理右键菜单、弹出层等功能 */}
        <ContextMenu />
        <EditorPlugins />
        <GlobalPlugins />
        <IPC />
        <PreviewPlugins />
        <Shortcuts />
        {/* 弹出的快捷面板 */}
        <QuickPanel />
        <Layout
          className={`main app-wrapper
          ${isFullscreen ? "fullscreen" : ""}
          ${hasSidebar ? "focus" : ""}
          ${isZen ? "zen" : ""}`}
          direction="horizontal"
          resizable={true}
          isFocus={isFocus}
          isZen={isZen}
          hasSidebar={hasSidebar}
        >
          <Sidebar />
          <Middlebar />
          <Mainbar />
        </Layout>
      </>
    );
  }
}

export default connect({
  container: MainContainer,
  selector: ({ container }) => ({
    listen: container.listen,
    refresh: container.refresh,
    loading: container.loading.get(),
    isFocus: container.window.isFocus(),
    isFullscreen: container.window.isFullscreen(),
    isZen: container.window.isZen(),
    hasSidebar: container.window.hasSidebar(),
  }),
})(MainDefaultPage);
