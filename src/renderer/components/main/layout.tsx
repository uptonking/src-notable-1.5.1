import React from "react";
import * as ReactDOM from "react-dom";
import Utils from "@renderer/utils/utils";

interface LayoutProps {
  className?: string;
  direction: string;
  resizable: boolean;
  isFocus?: boolean;
  isZen?: boolean;
  hasSidebar?: boolean;
}
/**
 * 笔记首页布局
 */
class Layout extends React.Component<LayoutProps, {}> {
  /**本Layout组件的DOM引用, 在componentDidMount中初始化 */
  $layout;
  dimensions?: number[];

  /** didMount和didUpdate后都会执行的方法, 用来更新布局 */
  update = async () => {
    const { resizable } = this.props;

    if (!resizable) return;

    const $children = await Utils.qsaWait(
      `:scope > .layout, :scope > .layout-content`,
      this.$layout
    );

    // 若$children不存在
    if (!$children || !$children.length) return;

    if ($children.length === 1) {
      // Saving state 若$children只有一个

      this.dimensions = this.$layout.layoutResizable("getDimensions");

      this.$layout.layoutResizable("destroy");
    } else {
      // Resetting 若$children有多个

      this.$layout.layoutResizable("destroy").layoutResizable();

      if (this.dimensions) {
        // Restoring state

        this.$layout.layoutResizable("setDimensions", this.dimensions);
      }
    }
  };

  __resize = (event: Event) => {
    if (event.target === this.$layout[0]) return;

    this.$layout.layoutResizable("instance").__resize();
  };

  componentDidMount() {
    // 指向本组件dom
    this.$layout = $(ReactDOM.findDOMNode(this));

    $(".layout.resizable")
      .not(this.$layout)
      .on("layoutresizable:resize", this.__resize);

    this.update();
  }

  componentDidUpdate() {
    this.update();
  }

  componentWillUnmount() {
    this.$layout.layoutResizable("destroy");

    $(".layout.resizable")
      .not(this.$layout)
      .off("layoutresizable:resize", this.__resize);
  }

  render() {
    const { className, direction, resizable, children } = this.props;

    return (
      <div
        className={`layout
        ${direction} ${resizable ? "resizable" : ""}
        ${className || ""}`}
      >
        {children}
      </div>
    );
  }
}

/* DEFAULT */

export default Layout;
