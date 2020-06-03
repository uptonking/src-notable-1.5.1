import * as _ from 'lodash';
import React from 'react';

/**
 * 一个会返回高阶组件的方法,高阶组件会为输入组件添加shouldComponentUpdate()方法.
 * Higher-Order Component for adding shouldComponentUpdate to components.
 * It supports easy to set shortcuts.
 *
 * shouldComponentUpdate ( 'myprop.foo' )( MyComponent );
 * Updates the component if the prop at `path` changed
 *
 * shouldComponentUpdate ( ['myprop.foo', 'foo'] )( MyComponent );
 * Updates the component if the prop at `path` becomes equal-to/different-from the prop at `valuePath`
 * This is useful when your component should be re-rendered only when it gets selected/unselected
 *
 * function myFn ( props, nextProps ) { // Update logic here }
 * shouldComponentUpdate ( myFn )( MyComponent );
 * Updates the component if `myFn` returns true
 *
 * shouldComponentUpdate ( 'myprop.bar', ['myprop.foo', 'foo'], myFn )( MyComponent );
 * Updates the component if at least one updating rule passes
 *
 * @param rules state中的一部分值所在的路径,若这部分变化了才会执行update
 */
function shouldComponentUpdate(...rules) {

  //
  return function wrapper(WrappedComponent) {
    return class PropsChangeComponent extends React.Component<any, any> {
      changedRules = {}; // path => value
      toggledRules = {}; // path => toggled (boolean)

      constructor(props) {
        super(props);

        rules.filter(_.isString).forEach((rule: string) => {
          // Getting initial values

          this.changedRules[rule] = _.get(props, rule);
        });
      }

      isRuleChanged(nextProps, rule) {
        if (_.isString(rule)) {
          // rule => path, checking if props changed

          const value = _.get(nextProps, rule);

          if (this.changedRules[rule] === value) return false;

          this.changedRules[rule] = value;

          return true;
        } else if (_.isArray(rule)) {
          // rule => [path, valuePath], checking if prop's toggle status changed

          const [path, valuePath] = rule,
            toggled = _.get(nextProps, path) === _.get(nextProps, valuePath);

          if (this.toggledRules[path] === toggled) return false;

          this.toggledRules[path] = toggled;

          return true;
        } else if (_.isFunction(rule)) {
          // Custom logic

          return !!rule(this.props, nextProps);
        } else if (_.isBoolean(rule)) {
          // Constant result

          return rule;
        }

        return false;
      }

      shouldComponentUpdate(nextProps) {
        return !!rules.find(rule => this.isRuleChanged(nextProps, rule));
      }

      render() {
        return <WrappedComponent {...this.props} />;
      }
    } as any;
  };
}


export default shouldComponentUpdate;
