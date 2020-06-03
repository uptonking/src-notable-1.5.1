import React from "react";
import { Subscribe } from "./unstated";

/**
 * 一个会返回高阶组件的方法,高阶组件会用unstated的Subscribe组件包裹输入组件,目的是减少使用Subscribe这个难用的api。
 * Higher-Order Component for subscribing to containers.
 * Simplifies your components, removing the need to constantly use the Subscribe component.
 * @param Containers 接收传入多个Container参数，作为Subscribe组件的prop
 */
function withContainers(...Containers) {
  // 返回的是一个高阶组件
  return function wrapper(WrappedComponent) {
    return class ContainersSubscribed extends React.Component<any, any> {
      // 传入状态管理对象
      render() {
        return (
          <Subscribe to={[...Containers]}>
            {(...containers) => (
              <WrappedComponent
                containers={containers}
                container={containers[0]}
                {...this.props}
              />
            )}
          </Subscribe>
        );
      }
    } as any;
  };
}

export default withContainers;
