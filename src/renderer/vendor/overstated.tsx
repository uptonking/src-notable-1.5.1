import { Provider, Subscribe } from "./unstated";
import connect from "./unstated-connect2";
// import * as compose from "./unstated-compose";
import compose from "./unstated-compose";
import autosuspend from "./unstated-suspense-autosuspend";
import { Container as BaseContainer } from "./unstated-suspense-middleware";
import HMR from "./util/unstated-hmr";
/**
 * A wrapper around unstated。
 * All these features are included into overstated, no need to import multiple packages。
 * 几乎重写了unstated的Container。
 */
class Container<
  State extends object = {},
  Context extends object | undefined = undefined
> extends BaseContainer<State> {
  /** 一个对象，保存父容器 */
  ctx!: Context;
  autosuspend?:
    | false
    | Partial<{ bubbles: number; methods: RegExp; middlewares: boolean }>;
}

// export { Container, Provider, Subscribe, autosuspend, compose, connect };
export { Container, Provider, Subscribe, autosuspend, compose, connect, HMR };
