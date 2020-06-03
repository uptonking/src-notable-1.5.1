import { BrowserWindowConstructorOptions, Menu, MenuItemConstructorOptions } from 'electron';
import * as windowStateKeeper from 'electron-window-state';
import pkg from '@root/package.json';
import UMenu from '@main/utils/menu';
import Route from './route';


class About extends Route {


  constructor(name = 'about', options: BrowserWindowConstructorOptions = { frame: true, autoHideMenuBar: true, fullscreenable: false, minimizable: false, maximizable: false, resizable: false, backgroundColor: '#ececec', title: 'About', titleBarStyle: 'default', minWidth: 284, minHeight: 160 }, stateOptions: windowStateKeeper.Options = { defaultWidth: 284, defaultHeight: 160 }) {

    super(name, options, stateOptions);

  }


  initMenu() {

    const template: MenuItemConstructorOptions[] = UMenu.filterTemplate([
      {
        label: pkg.productName,
        submenu: [
          { role: 'close' }
        ]
      }
    ]);

    const menu = Menu.buildFromTemplate(template);

    Menu.setApplicationMenu(menu);

  }

}


export default About;
