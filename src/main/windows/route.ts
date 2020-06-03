import * as path from 'path';
import { format as formatURL } from 'url';
import Environment from '@common/environment';
import Settings from '@common/settings';
import Window from './window';

/**
 * 仅一个方法load()， 由此子类指定要加载的首页路径
 */
class Route extends Window {


  /** 加载首页ui */
  load() {


    const route = this.name,
      theme = Settings.get('theme');

    if (Environment.isDevelopment) {

      const { protocol, hostname, port } = Environment.wds;

      // http://localhost:9080?route=main&theme=light
      const windowURL = `${protocol}://${hostname}:${port}?route=${route}&theme=${theme}`;
      console.log('==windowURL, ', windowURL)

      this.win.loadURL(windowURL);

    } else {

      this.win.loadURL(formatURL({
        pathname: path.join(__dirname, 'index.html'),
        protocol: 'file',
        slashes: true,
        query: {
          route,
          theme
        }
      }));

    }

  }

}


export default Route;
