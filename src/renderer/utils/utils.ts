import CallsBatch from 'calls-batch';
import * as os from 'os';

/**
 * 工具方法对象
 */
const Utils = {

  pathSepRe: /(?:\/|\\)+/g,

  batchify(batch: CallsBatch.type, fn: Function) {

    return function (...args: any[]) {
      batch.add(fn, args);
    };

  },

  encodeFilePath(filePath: string): string {

    return encodeURI(filePath.replace(Utils.pathSepRe, '/'));

  },

  getFirstUnemptyLine(str: string): string | null {

    const match = str.match(/^.*?\S.*$/m);

    return match && match[0];

  },

  normalizeFilePaths(filePaths: string[]): string[] {

    if (os.platform() !== 'win32') return filePaths;

    return filePaths.map(filePath => filePath.replace(Utils.pathSepRe, '\\'));

  },
  /**
   * Return the found elements as soon as they appear in the DOM, using jquery
   * @param selector  css选择器
   * @param context By default, selectors perform their searches within the DOM starting at the document root
   */
  qsaWait(selector: string, context?: HTMLElement): Promise<Cash | undefined> {

    let iteration = 0;

    return new Promise(resolve => {

      const loop = () => {

        if (iteration++ >= 2500) return resolve(); // Something unexpected probably happened, stop checking

        const $ele = $(selector, context);

        if (!$ele.length) return requestAnimationFrame(loop);

        resolve($ele);

      };

      loop();

    });

  }

};


export default Utils;
