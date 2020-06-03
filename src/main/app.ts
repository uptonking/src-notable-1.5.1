import { app, ipcMain as ipc, Event, Menu, MenuItemConstructorOptions, shell } from 'electron';
import { autoUpdater as updater } from 'electron-updater';
import { enforceMacOSAppLocation, is } from 'electron-util';
import * as fs from 'fs';
import pkg from '@root/package.json';
import Config from '@common/config';
import Environment from '@common/environment';
import Notification from '@main/utils/notification';
import UMenu from '@main/utils/menu';
import CWD from './windows/cwd';
import Main from './windows/main';
import Window from './windows/window';

/**
 * notable app 入口，entry point to Electron app。
 */
class App {


  win: Window | undefined;

  constructor() {

    // 准备菜单选项
    this.init();

    // 创建BrowserWindow实例
    this.events();

  }


  init() {

    this.initContextMenu();
    this.initMenu();

  }

  initContextMenu() { }

  initMenu() {

    const template: MenuItemConstructorOptions[] = UMenu.filterTemplate([
      {
        label: pkg.productName,
        submenu: [
          {
            label: 'Open',
            accelerator: 'CmdOrCtrl+O',
            click: this.load.bind(this)
          },
          { role: 'quit' }
        ]
      }
    ]);

    const menu = Menu.buildFromTemplate(template);

    Menu.setApplicationMenu(menu);

  }

  async initDebug() {

    if (!Environment.isDevelopment) return;

    const { default: installExtension, REACT_DEVELOPER_TOOLS } = await import('electron-devtools-installer');

    installExtension(REACT_DEVELOPER_TOOLS);

  }

  events() {

    this.___windowAllClosed();
    this.___activate();
    this.___beforeQuit();
    this.___forceQuit();

    // 创建BrowserWindow
    this.___ready();
    this.___cwdChanged();
    this.___updaterCheck();

  }

  /* WINDOW ALL CLOSED */

  ___windowAllClosed = () => {

    app.on('window-all-closed', this.__windowAllClosed);

  }

  __windowAllClosed = () => {

    if (is.macos) return this.initMenu();

    this.quit();

  }

  /* ACTIVATE */

  ___activate = () => {

    app.on('activate', this.__activate);

  }

  __activate = () => {

    if (this.win && this.win.win) return;

    this.load();

  }

  /* BEFORE QUIT */

  ___beforeQuit = () => {

    app.on('before-quit', this.__beforeQuit);

  }

  ___beforeQuit_off = () => {

    app.removeListener('before-quit', this.__beforeQuit);

  }

  __beforeQuit = (event: Event) => {

    if (!this.win || !this.win.win) return;

    event.preventDefault();

    this.win.win.webContents.send('app-quit');

  }

  /* FORCE QUIT */

  ___forceQuit = () => {

    ipc.on('force-quit', this.__forceQuit);

  }

  __forceQuit = () => {

    this.quit();

  }

  /* READY */

  ___ready = () => {

    app.on('ready', this.__ready);

  }

  __ready = () => {

    enforceMacOSAppLocation();

    this.initDebug();

    // 创建BrowserWindow
    this.load();

  }

  /* CWD CHANGED */

  ___cwdChanged = () => {

    ipc.on('cwd-changed', this.__cwdChanged);

  }

  __cwdChanged = () => {

    if (this.win && this.win.win) {

      this.win.win.once('closed', this.load.bind(this));

      this.win.win.close();

    } else {

      this.load();

    }

  }

  /* UPDATER CHECK */

  ___updaterCheck = () => {

    ipc.on('updater-check', this.__updaterCheck);

  }

  __updaterCheck = async (notifications: Event | boolean = false) => {

    updater.removeAllListeners();

    if (notifications === true) {

      updater.on('update-available', () => Notification.show('A new update is available', 'Downloading it right now...'));
      updater.on('update-not-available', () => Notification.show('No update is available', 'You\'re already using the latest version'));
      updater.on('error', err => {
        Notification.show('An error occurred', err.message);
        Notification.show('Update manually', 'Download the new version manually to update the app');
        shell.openExternal(pkg['download'].url);
      });

    }

    updater.checkForUpdatesAndNotify();

  }

  /* API */

  load() {

    // note文件存放目录  /media/yaoo/win10/active/sharing/note4yaoo
    const cwd = Config.cwd;
    console.log('==cwd, ', cwd)

    if (cwd && fs.existsSync(cwd)) {

      // 准备 首页路由
      this.win = new Main();

    } else {

      this.win = new CWD();

    }

    // 这里创建BrowserWindow,并加载首页ui
    this.win.init();

  }

  quit() {

    global.isQuitting = true;

    this.___beforeQuit_off();

    app.quit();

  }

}

/* EXPORT */

export default App;
