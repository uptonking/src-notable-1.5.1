import React from "react";
import isShallowEqual from "./util/shallowequal";

/**
 * 一个会返回高阶组件的方法,高阶组件会先判断指定部分状态数据是否变化.
 * Using this library you can pass your components only the props they need to render, instead of the whole state.
 * This will avoid unnecessary re-renders and therefore improve performance.
 *
function propsSelector ( props ) {
  return {
    foo: props.foo,
    bar: props.getBar ()
  };
}

// Pure components
selectr ( propsSelector )( MyComponent );
MyComponent will only receive the selected props, and if they don't change it won't be re-rendered

// Unpure components
selectr ( propsSelector, { pure: false } )( MyComponent ); //
 MyComponent will only receive the selected props, but even if they don't change it will always re-render


 * @param selector
 * @param options
 */
function selectr(selector: Function, options = { pure: true }) {
  //
  return function wrapper(WrappedComponent) {
    return class SelectorComponent extends React.Component<any, any> {
      // 获取props中指定的属性
      selectedProps = selector(this.props);

      shouldComponentUpdate(nextProps) {
        const nextSelectedProps = selector(nextProps);

        // 只比较指定的部分
        if (
          options.pure &&
          isShallowEqual(
            this.selectedProps,
            nextSelectedProps,
            undefined,
            undefined
          )
        ) {
          return false;
        }

        this.selectedProps = nextSelectedProps;

        return true;
      }

      render() {
        return <WrappedComponent {...this.selectedProps} />;
      }
    } as any;
  };
}

export default selectr;
