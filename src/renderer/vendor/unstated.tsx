import React from "react";

/** 保存状态信息的context,初始状态为null */
const StateContext = React.createContext(null);

type Listener = () => any;

/**
 * 普通的class,作为存放及更新state的容器,不包含ui组件,最终会放入到context的value中.
 * 将setState从具体的某个UI组件上剥离，形成一个数据对象实体，可以被注入到任何组件。
 */
export class Container<State extends object> {
  /** 组件要用的状态,类似react的api,不要直接修改this.state,要使用this.setState */
  state!: State;
  /**
   * 存储的其实是当前绑定的组件onUpdate更新state的方法，然后在setState时主动触发对应组件的渲染,
   * 每次更新状态时都会执行,每次状态改变(不管是否相等)，都会重新渲染,
   * 每个状态管理实例存在一个默认监听函数onUpdate，作用就是调用React的setState强制视图重新渲染。
   */
  // _listeners: Array<Listener> = [];
  _listeners: Array<any> = [];

  constructor() {
    CONTAINER_DEBUG_CALLBACKS.forEach((cb) => cb(this));
  }

  /**
   * 类似于react的setState,异步执行, mimics React's setState() method.
   * unlike React's setState(), Unstated's setState() returns a promise, so you can await it.
   * 这里通过Promise.resolve().then模拟this.setState的异步执行
   */
  setState(updater, callback?: () => void): Promise<void> {
    return Promise.resolve().then(() => {
      let nextState;

      // 获取state对象的新属性
      if (typeof updater === "function") {
        nextState = updater(this.state);
      } else {
        nextState = updater;
      }

      if (nextState == null) {
        if (callback) callback();
        return undefined;
      }

      this.state = Object.assign({}, this.state, nextState);

      // 这里会调用监听器函数,即onUpdate(),会调用setState更新Subscribe组件
      let promises = this._listeners.map((listener) => listener());

      return Promise.all(promises).then(() => {
        // 全部listener执行完毕，执行回调
        if (callback) {
          return callback();
        }
      });
    });
  }

  /** 将函数fn加入_listeners数组 */
  subscribe(fn: () => any): void {
    this._listeners.push(fn);
  }

  /** 从_listeners数组中移除fn */
  unsubscribe(fn: () => any): void {
    this._listeners = this._listeners.filter((f) => f !== fn);
  }
}

// export type ContainerType = Container<Object>;
/**
 * 只定义构造方法的类型,实例方法的类型要定义在单独的接口.
 * 不能直接implement构造方法接口.
 * https://www.typescriptlang.org/docs/handbook/interfaces.html#class-types
 */
export interface ContainerType<State extends object> {
  new (...args: any[]): Container<State>;
}

interface SubscribeProps {
  /** 存放ui组件需要使用的状态管理类或实例,即对应的Container状态对象或类 */
  to: (ContainerType<any> | Container<any>)[];
  /** children属性是函数,接受状态数据对象,返回渲染后的组件 */
  children(...instances: Container<any>[]): React.ReactNode;
}

// const DUMMY_STATE = {};
/** 用在subscribe组件的onUpdate方法,虽然内容相同,但每次this.state都是Object.assign之后的，引用不相等 */
const DUMMY_STATE = { dummy: true };

/**
 * React.Component的子类,introduce our state back into the tree,
 * Subscribe will automatically construct our container and listen for changes.
 * 通过render props的方式暴露 StateContext.Consumer
 */
export class Subscribe extends React.Component<SubscribeProps, {}> {
  state = {};
  // instances: Array<ContainerType> = [];
  /**
   * 存放当前组件的状态管理实例,
   * 如果当前的状态管理实例是共享的，会不会有影响呢？
   * 不会的。往后看可以知道，当state每次更新，都会重新创建新的状态管理实例
   */
  instances: Array<Container<any>> = [];
  unmounted = false;

  componentWillUnmount() {
    // console.log('==== subscribe unmounting')
    this.unmounted = true;
    this._unsubscribe();
  }

  // shouldComponentUpdate(nextProps, nextState) {
  //   console.log("==subscribe this.props === nextProps ");
  //   console.log(this.props === nextProps);
  //   // console.log(this.props);
  //   // console.log(nextProps);

  //   console.log("==subscribe this.state === nextState ");
  //   console.log(this.state === nextState);
  //   console.log(this.state);
  //   console.log(nextState);

  //   if (this.props !== nextProps) {
  //     return true;
  //   }

  //   if (this.state !== nextState) {
  //     return true;
  //   }

  //   return false;
  // }

  /**
   * 遍历instances,逐个调用unsubscribe()方法,清空container对应的listeners数组
   */
  _unsubscribe() {
    this.instances.forEach((container) => {
      // 删除listeners中的this.onUpdate
      container.unsubscribe(this.onUpdate);
    });
  }

  /**
   * 创建状态管理组件时默认传递的监听函数,最终被Ccontainer的this.setState方法调用.
   * onUpdate就是创建状态管理组件时默认传递的监听函数，用的是React的setState更新一个DUMMY_STATE(空对象{})。
   */
  onUpdate: Listener = () => {
    return new Promise((resolve) => {
      if (!this.unmounted) {
        // 未卸载时执行

        // 会强制调用render方法，更新Subscribe组件
        this.setState(DUMMY_STATE, resolve);
      } else {
        // 卸载时执行

        resolve();
      }
    });
  };

  /**
   * 创建状态管理对象. 先利用instanceof通过Class类找到对应的实例，
   * 并通过subscribe将自己组件的onUpdate函数传递给对应Store的_listeners，
   * 在解除绑定时调用unsubscribe解绑，防止不必要的renrender
   * @param map 类型可为null或Map<any, ContainerType>
   * @param containers 类型是Array<ContainerType>
   */
  _createInstances(map: Map<any, Container<any>>, containers: Array<any>) {
    // 首先instance解除订阅，清空container对应的listener
    this._unsubscribe();

    // console.log(map.size);

    // 必须存在map,必须被Provider包裹才会有map
    if (map === null) {
      throw new Error(
        "You must wrap your <Subscribe> components with a <Provider>"
      );
    }

    let safeMap = map;

    // 根据to传入的数组,创建当前组件的状态管理对象,每次调用此方法都会创建新的
    let instances = containers.map((ContainerItem) => {
      let instance;

      if (
        typeof ContainerItem === "object" &&
        ContainerItem instanceof Container
      ) {
        // 传入的是Container实例，则直接使用

        instance = ContainerItem;
      } else {
        // 传入的不是Container实例，可能是其他自定义组件等等(需要用new执行)，尝试获取

        // 如果传入的是Class(共享状态组件)，会尝试通过查询map
        instance = safeMap.get(ContainerItem);

        // 若不存在，则以它为key创建实例，value是新的Container实例
        if (!instance) {
          instance = new ContainerItem();
          safeMap.set(ContainerItem, instance);
        }
      }

      // 每次创建时，都会先unsubscribe再subscribe，确保不会重复添加监听函数。
      instance.unsubscribe(this.onUpdate);
      // 每个container的实例都会保存一个onUpdate()到_listeners
      // 当container实例调用setState方法时，就会触发Subscribe组件调用render
      instance.subscribe(this.onUpdate);

      return instance;
    });

    // console.log(map.size);

    this.instances = instances;
    return instances;
  }

  // 其实是 render props，作用是将状态管理实例传入children()函数进行渲染。
  // 每一次render，通常都会创建新的状态管理实例，若已存在则使用已有的。
  render() {
    // const in =

    return (
      <StateContext.Consumer>
        {(map: any) =>
          this.props.children.apply(
            null,
            this._createInstances(map, this.props.to)
          )
        }
      </StateContext.Consumer>
    );
  }
}

export interface ProviderProps {
  /**  从外部注入的状态管理实例,可使用已有的,继承Container的Class实例可作为Store */
  inject?: Container<any>[];
  children: React.ReactNode;
}

/**
 * 通过render props的方式暴露 StateContext.Provider,
 * Provider是解决单例Store的最佳方案
 */
export function Provider(props: ProviderProps) {
  return (
    <StateContext.Consumer>
      {(parentMap) => {
        // 存放键值对：对象的构造函数，对象实例
        let childMap = new Map(parentMap);

        // console.log("==parentMap");
        // console.log(parentMap);
        // console.log(childMap);

        // 外部注入的状态管理实例
        if (props.inject) {
          props.inject.forEach((instance) => {
            // console.log("==childMap");

            childMap.set(instance.constructor, instance);
          });
        }

        return (
          <StateContext.Provider value={childMap as any}>
            {props.children}
          </StateContext.Provider>
        );
      }}
    </StateContext.Consumer>
  );
}

let CONTAINER_DEBUG_CALLBACKS: Function[] = [];

// If your name isn't Sindre, this is not for you.
// I might ruin your day suddenly if you depend on this without talking to me.
export function __SUPER_SECRET_CONTAINER_DEBUG_HOOK__(
  callback: (container: Container<any>) => any
) {
  CONTAINER_DEBUG_CALLBACKS.push(callback);
}
