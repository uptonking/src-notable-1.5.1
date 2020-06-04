import { Container as BaseContainer } from './unstated';

/**
 * 支持暂停更新状态的container，几乎重写了unstated的container。
 * Suspend/unsuspend updates propagation from your containers.
 * It allows you to update the state multiple times while still triggering only one update of the components.
 * Note: If you call suspend N times you should call unsuspend N time also to resume updates propagation.
 */
class Container<State extends object> extends BaseContainer<State> {
  _listeners!: Function[];
  _suspendNr = 0;
  _updateSuspended = false;

  /** 重写了unstated中container的setState */
  async setState(
    updater: ((prevState: Readonly<State>) => Partial<State> | State | null) | Partial<State> | State | null,
    callback?: Function,
  ): Promise<void> {
    let nextState;

    if (typeof updater === 'function') {
      nextState = (updater as Function)(this.state); //TSC
    } else {
      nextState = updater;
    }

    if (nextState == null) {
      if (callback) callback();
      return;
    }

    this.state = Object.assign({}, this.state, nextState);

    // 若是暂停状态,则不会执行_listeners监听器
    this._updateEmit(callback);
  }

  /** 执行暂停，实际任务只有将暂停标记+1 */
  suspend(): void {
    this._suspendNr++;
  }

  /** 取消暂停，会将暂停标记-1，再执行_updateEmit()方法 */
  unsuspend(callback?: Function): void {
    if (!this._suspendNr) return;
    this._suspendNr--;

    // _suspendNr是0且_updateSuspended真，if条件才为true
    if (!this._suspendNr && this._updateSuspended) {
      this._updateEmit(callback);
    }
  }

  /**
   * 获取暂停状态,然后若非暂停,则执行callback
   * @param callback setState的第二个参数callback
   */
  _updateEmit(callback?: Function): void {
    this._updateSuspended = !!this._suspendNr;

    if (this._updateSuspended) return;

    // 强制调用setState，会导致再次执行Subscribe组件的render()方法，
    const promises = this._listeners.map((listener) => listener());

    Promise.all(promises).then(() => {
      if (callback) callback();
    });
  }
}

export { Container };
