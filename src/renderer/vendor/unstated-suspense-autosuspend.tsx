// import isFunction = require('lodash/isFunction');
import isFunction from "lodash/isFunction";

const defaultOptions = {
  // How many levels to bubble up the suspension
  bubbles: Infinity,
  // Methods matching this regex will be autosuspended
  methods: /^(?!_|middleware|(?:(?:get|is|has)(?![a-z0-9])))/,
  // Suspend middlewares as well
  middlewares: true,
};

enum Methods {
  "suspend",
  "unsuspend",
  "suspendMiddlewares",
  "unsuspendMiddlewares",
}

/**
 * 会修改传入的container状态管理对象.
 * Automatically use unstated-suspense on all your container's API methods.
 * It supports methods returning promises, and it supports bubbling up the suspension to parent containers (in case of using unstated-compose).
 * Only methods defined in your container, and not somewhere further down in its prototype chain, will be autosuspended.
 * @param container
 * @param options
 */
export function autosuspend(container, options = container.autosuspend) {
  if (options === false) return; // Disabled

  options = options
    ? Object.assign({}, defaultOptions, options)
    : defaultOptions;

  const proto = Object.getPrototypeOf(container);

  /** 保存键值对 {方法:container} */
  const targets = {};

  // 本页剩下的所有代码都是container对象的处理逻辑
  // 遍历container,在执行修改state的方法时加入自动暂停和取消暂停
  Object.keys(container).forEach((key) => {
    //  获取待执行的方法method
    const method = container[key];

    // Not an API method. 不匹配规则的方法不会suspend
    if (!isFunction(method) || proto[key] || !options.methods.test(key)) {
      return;
    }

    /** 获取方法对应的父container对象 */
    function getTarget(method) {
      if (targets[method]) return targets[method];

      let target = container,
        bubbles = options.bubbles;

      // 向上循环查找到方法所属的父container
      while (bubbles && target.ctx && target.ctx[method]) {
        target = target.ctx;
        bubbles -= 1;
      }

      targets[method] = target;

      return target;
    }

    /** 实际执行suspend()或unsuspend()的方法 */
    function trigger(id: Methods) {
      const method = Methods[id],
        target = getTarget(method);

      // 先通过可计算属性名获取暂停或取消暂停的方法,再执行该方法
      target[method]();
    }

    /** 开始执行unsuspend() */
    function handleResult(result) {
      if (options.middlewares) {
        trigger(Methods.unsuspendMiddlewares);
      }

      trigger(Methods.unsuspend);

      return result;
    }

    function handleError(err) {
      if (options.middlewares) {
        trigger(Methods.unsuspendMiddlewares);
      }

      trigger(Methods.unsuspend);

      throw err;
    }

    /** 再执行method时加入自动suspend()或unsuspend()的流程 */
    // function autosuspendWrapper() {
    function autosuspendWrapper(this: any) {
      try {
        // 限制性中间件
        if (options.middlewares) {
          trigger(Methods.suspendMiddlewares);
        }

        //执行暂停
        trigger(Methods.suspend);

        // 实际执行方法,一般是修改state
        const result = method.apply(this, arguments);

        // 触发更新
        if (result instanceof Promise) {
          return result.then(handleResult).catch(handleError);
        } else {
          return handleResult(result);
        }
      } catch (err) {
        return handleError(err);
      }
    }

    // 用封装过后的method替换原method
    container[key] = autosuspendWrapper;
  });
}

export default autosuspend;
