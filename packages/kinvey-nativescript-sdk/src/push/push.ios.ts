import { Promise } from 'es6-promise';
import { KinveyError } from './kinvey-nativescript-sdk';
import { PushCommon } from './common';
import { PushConfig, IOSPushConfig } from './';
// tslint:disable-next-line:variable-name
let PushPlugin;

try {
  PushPlugin = require('nativescript-push-notifications');
} catch (e) {
  // Just catch the error
}

class IOSPush extends PushCommon {
  protected _registerWithPushPlugin(options = <PushConfig>{}): Promise<string> {
    const config = options.ios || <IOSPushConfig>{};

    return new Promise((resolve, reject) => {
      if (!PushPlugin) {
        return reject(new KinveyError('NativeScript Push Plugin is not installed.',
          'Please refer to http://devcenter.kinvey.com/nativescript/guides/push#ProjectSetUp for help with'
          + ' setting up your project.'));
      }

      const usersNotificationCallback = config.notificationCallbackIOS;
      config.notificationCallbackIOS = (message: any) => {
        if (typeof usersNotificationCallback === 'function') {
          usersNotificationCallback(message);
        }

        if (typeof options.notificationCallback === 'function') {
          // let's transform the "foreground" ("0" / "1") into a proper boolean value
          message.foreground = message.foreground === "1";
          options.notificationCallback(message);
        }

        (this as any).emit('notification', message);
      };

      PushPlugin.register(config, (token) => {
        if (config.interactiveSettings) {
          PushPlugin.registerUserNotificationSettings(() => {
            resolve(token);
          }, (error) => {
            // do something with error
            resolve(token);
          });
        } else {
          resolve(token);
        }
      }, reject);
    });
  }

  protected _unregisterWithPushPlugin(options = <PushConfig>{}): Promise<null> {
    const config = options.ios || <IOSPushConfig>{};

    return new Promise((resolve, reject) => {
      if (!PushPlugin) {
        return reject(new KinveyError('NativeScript Push Plugin is not installed.',
          'Please refer to http://devcenter.kinvey.com/nativescript/guides/push#ProjectSetUp for help with'
          + ' setting up your project.'));
      }

      PushPlugin.unregister(resolve, reject, config);
    });
  }
}

// tslint:disable-next-line:variable-name
const Push = new IOSPush();
export { Push };
