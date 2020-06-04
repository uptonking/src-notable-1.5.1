import { Container as BaseContainer } from "./unstated-suspense";

/**
 * Add middlewares support to `unstated-suspense`.
 * 几乎重写了container,会在setState后,unsuspend前,依次执行middlewares数组中的方法
 */
class Container<State extends object> extends BaseContainer<State> {
  /** 中间件就是待执行的方法构成的数组 */
  private _middlewares: Function[] = [];
  private _running = false;
  private _middlewaresSuspendNr = 0;
  private _middlewaresSuspendedState?: State;
  private _middlewaresSuspended = false;

  constructor() {
    super();

    // 初始化时就执行所有中间件函数
    this.middlewares();
  }

  /** 空的模板方法，由子类实现，用来添加注册中间件方法，多次调用addMiddleware */
  middlewares() {}

  addMiddleware(middleware: Function) {
    this._middlewares.push(middleware);
  }

  removeMiddleware(middleware: Function) {
    this._middlewares = this._middlewares.filter((m) => m !== middleware);
  }

  suspendMiddlewares(): void {
    this._middlewaresSuspendNr++;
  }

  unsuspendMiddlewares(): void {
    if (!this._middlewaresSuspendNr) return;
    this._middlewaresSuspendNr--;
    if (
      !this._middlewaresSuspendNr &&
      this._middlewaresSuspended &&
      this._middlewaresSuspendedState
    ) {
      this._middlewaresRun(this._middlewaresSuspendedState);
      this._middlewaresSuspendedState = undefined;
    }
  }

  /** 重写unstated-suspense的setState */
  async setState(
    updater:
      | ((prevState: Readonly<State>) => Partial<State> | State | null)
      | Partial<State>
      | State
      | null,
    callback?: Function
  ): Promise<void> {
    // 先暂停
    this.suspend();

    let prevState = this.state;

    // 然后计算新state
    await super.setState(updater, callback);

    // 执行中间件方法
    await this._middlewaresRun(prevState);

    // 取消暂停
    this.unsuspend();
  }

  /** 遍历中间件方法并执行，中间件的返回值会直接更新this.state */
  private async _middlewaresRun(prevState: State) {
    this._middlewaresSuspended = !!this._middlewaresSuspendNr;

    if (this._middlewaresSuspended) {
      this._middlewaresSuspendedState =
        this._middlewaresSuspendedState || prevState;

      return;
    }

    if (!this._middlewares.length) return;

    const isRunConcurrent = this._running;

    if (isRunConcurrent) return;

    this._running = true;

    this.suspend();

    for (let i = 0, l = this._middlewares.length; i < l; i++) {
      const middleware = this._middlewares[i];

      // 用middleware修改state数据
      this.state = (await middleware.call(this, prevState)) || this.state;
    }

    this._running = false;

    this.unsuspend();
  }
}

export { Container };
