import * as os from 'os';
import * as Store from 'electron-store';
import { darkMode } from 'electron-util';

/**
 * 初始默认值, 包含位置、编辑器设置
 */
const Settings = new Store({
  name: '.notable',
  cwd: os.homedir(),
  defaults: {
    cwd: undefined,
    monaco: {
      editorOptions: {
        minimap: {
          enabled: false
        },
        wordWrap: 'bounded'
      }
    },
    sorting: {
      by: 'title',
      type: 'ascending'
    },
    theme: darkMode.isEnabled ? 'dark' : 'light',
    tutorial: false // Did we import the tutorial yet?
  }
});


export default Settings;
