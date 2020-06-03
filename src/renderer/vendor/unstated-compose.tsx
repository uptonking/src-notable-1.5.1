import { Container } from "./unstated";

class ChildContainer<
  Context extends object,
  State extends object
> extends Container<State> {
  ctx!: Context;
}

class ParentContainer<
  Context extends object,
  State extends object
> extends Container<State> {
  ctx!: Context;
  [index: string]:
    | Container<State>[keyof Container<State>]
    | Context[keyof Context]
    | Context; //FIXME: Should be `[key in keyof Children]: Children[keyof Children]` instead
}
/**
 * 一个高阶方法，会接收输入的多个状态对象，然后合并到MainContainer这个参数对象上。
 * Compose multiple containers into one.
 * This is useful when you want to have a single container, perhaps subscribed to via unstated-connect2, but it starts to become too big.
 *  This package allows you to refactor it into multiple separate containers that can still be merged back together.
 * @param containers
 */
function compose(containers: object) {
  // 一个高阶组件,会合并传入的状态对象为一个
  return function (MainContainer) {

    /** 返回的类只修改了构造方法 */
    return class ComposedContainer extends MainContainer {

      constructor() {
        super();

        this.state = {};
        this.ctx = {};

        for (let name in containers) {
          const container = new containers[name]();

          container.ctx = this;

          this[name] = container;
          this.state[name] = Object.assign({}, container.state);
          this.ctx[name] = container;

          // 先保存原来的setState，在更新当前container对象的setState
          const setState = container.setState;
          container.setState = async (...args) => {
            await setState.apply(container, args);

            const state = Object.assign({}, container.state);

            this.setState({ [name]: state });
          };
        }
      }
    } as any;
  };
}

const exp = Object.assign(compose, {
  compose,
  ChildContainer,
  ParentContainer,
});

export default exp;
