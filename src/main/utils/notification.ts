import { Notification as ENotification } from 'electron';

/**
 * 显示通知的方法
 */
const Notification = {

  show(title: string, body: string) {

    const notification = new ENotification({ title, body });

    notification.show();

  }

};


export default Notification;
