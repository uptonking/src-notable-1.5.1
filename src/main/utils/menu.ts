import * as _ from 'lodash';
import { MenuItemConstructorOptions } from 'electron';

/**
 * 右键菜单选项根据visible属性进行过滤
 */
const Menu = {

  /** 返回的仍然是一个函数 */
  filterTemplate(template: MenuItemConstructorOptions[]): MenuItemConstructorOptions[] {

    /**
     * val类型要为数组
     */
    return _.cloneDeepWith(template, val => {

      if (!_.isArray(val)) return;

      // Removes items with `visible == false`
      return val.filter(ele => ele && (!ele.hasOwnProperty('visible') || ele.visible)).map(Menu.filterTemplate);

    });

  }

};


export default Menu;
