import * as _ from "lodash";
import selectr from "./react-selectr";
import shouldComponentUpdate from "./react-should-component-update";
import withContainers from "./unstated-with-containers";

interface OptionsType {
  /** 函数返回的对象会作为组件的状态，常用于指定状态对象的其中一部分属性注入到组件来防止不必要的rerender */
  selector?: Function;
  pure?: boolean;
  shouldComponentUpdate?: any;
  /** Container数组 */
  containers?: any[];
  /** 单个Container */
  container?: any;
}

/**
 * 一个高阶函数,为传入组件添加状态检查与更新规则,封装了unstated库的subscribe组件。
 * 对传入组件依次调用selectr, shouldComponentUpdate, withContainers 高阶方法。
 * Connect containers to components.
 * This library combines together react-selectr, react-should-component-update and unstated-with-containers together.
 * @param options 指定与组件状态及操作相关的各种参数
 */
export function connect(options: OptionsType = {}) {
  // options也可以直接传人单个Container组件或数组作为参数
  if (_.isArray(options)) {
    options = { containers: options };
  } else if (_.isFunction(options)) {
    options = { container: options };
  }

  return function wrapper(WrappedComponent) {
    let ConnectedComponent = WrappedComponent;

    // 检查部分状态数据的变化
    if (options.selector) {
      // options.pure默认为true
      const pure = _.isBoolean(options.pure) ? options.pure : true;
      // 判断状态对象的指定部分是否变化
      ConnectedComponent = selectr(options.selector, { pure })(
        ConnectedComponent
      );
    }

    // 检查指定路径的状态更新
    if (options.hasOwnProperty("shouldComponentUpdate")) {
      ConnectedComponent = shouldComponentUpdate(
        ..._.castArray(options.shouldComponentUpdate)
      )(ConnectedComponent);
    }

    // 包裹状态管理对象
    if (options.containers) {
      // 传入Container数组作为多个参数
      ConnectedComponent = withContainers(...options.containers)(
        ConnectedComponent
      );
    } else if (options.container) {
      ConnectedComponent = withContainers(options.container)(
        ConnectedComponent
      );
    }

    return ConnectedComponent;
  };
}

export default connect;
