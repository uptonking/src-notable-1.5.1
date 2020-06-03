import { BrowserWindowConstructorOptions } from 'electron';
import * as windowStateKeeper from 'electron-window-state';
import Route from './route';

/**  */
class CWD extends Route {


  constructor(
    name = 'cwd',
    options: BrowserWindowConstructorOptions = { autoHideMenuBar: true, resizable: false, minWidth: 560, minHeight: 485 },
    stateOptions: windowStateKeeper.Options = { defaultWidth: 560, defaultHeight: 485 }) {

    super(name, options, stateOptions);

  }

}


export default CWD;
