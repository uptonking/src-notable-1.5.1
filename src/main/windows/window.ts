import * as _ from 'lodash';
import * as path from 'path';
import { BrowserWindow, BrowserWindowConstructorOptions } from 'electron';
import { is } from 'electron-util';
import * as windowStateKeeper from 'electron-window-state';
import pkg from '@root/package.json';
import Environment from '@common/environment';
import Settings from '@common/settings';

/**
 * 管理BrowserWindow的创建与初始化
 */
class Window {

  name: string;
  win: BrowserWindow = {} as BrowserWindow;
  options: BrowserWindowConstructorOptions;
  stateOptions: windowStateKeeper.Options;
  _didFocus: boolean = false;


  constructor(name: string, options: BrowserWindowConstructorOptions = {}, stateOptions: windowStateKeeper.Options = {}) {
    this.name = name;
    this.options = options;
    this.stateOptions = stateOptions;
  }


  /** 初始化任务列表，依次执行 */
  init() {

    this.initWindow();
    this.initDebug();
    this.initLocalShortcuts();
    this.initMenu();

    this.load();
    this.events();

  }

  /** 创建BrowserWindow对象的入口 */
  initWindow() {

    this.win = this.make();

  }


  /** 设置参数并创建BrowserWindow对象 */
  make(id = this.name, options = this.options, stateOptions = this.stateOptions) {

    stateOptions = _.merge({
      file: `${id}.json`,
      defaultWidth: 600,
      defaultHeight: 600
    }, stateOptions);

    const state = windowStateKeeper(stateOptions);
    const dimensions = _.pick(state, ['x', 'y', 'width', 'height']);

    options = _.merge(dimensions, {
      frame: !is.macos,
      backgroundColor: (Settings.get('theme') === 'light') ? '#F7F7F7' : '#0F0F0F', //TODO: This won't scale with custom themes
      icon: path.join(__static, 'images', `icon.${is.windows ? 'ico' : 'png'}`),
      show: false,
      title: pkg.productName,
      titleBarStyle: 'hiddenInset',
      webPreferences: {
        nodeIntegration: true,
        webSecurity: false
      }
    }, options);

    // 创建BrowserWindow
    const win = new BrowserWindow(options);

    state.manage(win);

    return win;

  }

  /** 空的模板方法,由子类Route实现，用来指定要加载的首页路径 */
  load() { }


  initDebug() {

    if (!Environment.isDevelopment) return;

    this.win.webContents.openDevTools({
      mode: 'undocked'
    });

    this.win.webContents.on('devtools-opened', () => {

      this.win.focus();

      setImmediate(() => this.win.focus());

    });

  }

  initMenu() { }

  initLocalShortcuts() { }

  /** 执行didFinishLoad,closed,focused */
  events() {

    this.___didFinishLoad();
    this.___closed();
    this.___focused();

  }

  cleanup() {

    this.win.removeAllListeners();

  }

  /* READY TO SHOW */

  ___didFinishLoad = () => {

    this.win.webContents.on('did-finish-load', this.__didFinishLoad);

  }

  __didFinishLoad = () => {

    if (this._didFocus) return;

    this.win.show();
    this.win.focus();

  }

  /* CLOSED */

  ___closed = () => {

    this.win.on('closed', this.__closed);

  }

  __closed = () => {

    this.cleanup();

    // 删除const/let/var属性均会返回false
    // delete this.win;

  }

  /* FOCUSED */

  ___focused = () => {

    this.win.on('focus', this.__focused);

  }

  __focused = () => {

    this._didFocus = true;

    this.initMenu();

  }

}


export default Window;
