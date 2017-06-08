import assign from 'lodash/assign';
import isString from 'lodash/isString';
import isNumber from 'lodash/isNumber';

import { KinveyError } from 'src/errors';
import { Log, isDefined } from 'src/utils';
import { CacheRequest } from './request';

let sharedInstance = null;

/**
 * The Client class stores information about your application on the Kinvey platform. You can create mutiple clients
 * to send requests to different environments on the Kinvey platform.
 */
export default class Client {
  /**
   * Creates a new instance of the Client class.
   *
   * @param {Object}    options                                            Options
   * @param {string}    [options.apiHostname='https://baas.kinvey.com']    Host name used for Kinvey API requests
   * @param {string}    [options.micHostname='https://auth.kinvey.com']    Host name used for Kinvey MIC requests
   * @param {string}    [options.appKey]                                   App Key
   * @param {string}    [options.appSecret]                                App Secret
   * @param {string}    [options.masterSecret]                             App Master Secret
   * @param {string}    [options.encryptionKey]                            App Encryption Key
   * @param {string}    [options.appVersion]                               App Version
   * @return {Client}                                                      An instance of the Client class.
   *
   * @example
   * var client = new Kinvey.Client({
   *   appKey: '<appKey>',
   *   appSecret: '<appSecret>'
   * });
   */
  constructor(options = {}) {
    options = assign({
      apiHostname: 'https://baas.kinvey.com',
      micHostname: 'https://auth.kinvey.com',
      liveServiceHostname: 'https://kls.kinvey.com',
      defaultTimeout: 60000
    }, options);

    if (options.apiHostname && isString(options.apiHostname)) {
      let apiHostname = options.apiHostname;

      if (/^https?:\/\//i.test(apiHostname) === false) {
        apiHostname = `https://${apiHostname}`;
      }

      const apiHostnameParsed = url.parse(apiHostname);

      /**
       * @type {string}
       */
      this.apiProtocol = apiHostnameParsed.protocol;

      /**
       * @type {string}
       */
      this.apiHost = apiHostnameParsed.host;
    }
    this.apiHostname = apiHostname.replace(/\/+$/, '');

    if (options.micHostname && isString(options.micHostname)) {
      let micHostname = options.micHostname;

      if (/^https?:\/\//i.test(micHostname) === false) {
        micHostname = `https://${micHostname}`;
      }

      const micHostnameParsed = url.parse(micHostname);

      /**
       * @type {string}
       */
      this.micProtocol = micHostnameParsed.protocol;

      /**
       * @type {string}
       */
      this.micHost = micHostnameParsed.host;
    }
    this.micHostname = micHostname.replace(/\/+$/, '');

    let liveServiceHostname = options.liveServiceHostname;
    if (isString(liveServiceHostname) === false) {
      liveServiceHostname = String(liveServiceHostname);
    }

    /**
     * @type {string}
     */
    this.liveServiceProtocol = options.liveServiceProtocol;

    /**
     * @type {string}
     */
    this.liveServiceHost = options.liveServiceHost;

    /**
     * @type {?string}
     */
    this.appKey = options.appKey;

    /**
     * @type {?string}
     */
    this.appSecret = options.appSecret;

    /**
     * @type {?string}
     */
    this.masterSecret = options.masterSecret;

    /**
     * @type {?string}
     */
    this.encryptionKey = options.encryptionKey;

    if (isDefined(options.appVersion)) {
      let appVersion = options.appVersion;

      if (isString(appVersion) === false) {
        appVersion = String(appVersion);
      }

      /**
       * The version of your app. It will sent with Kinvey API requests
       * using the X-Kinvey-Api-Version header.
       * @type {?string}
       */
      this.appVersion = appVersion;
    }

    if (isDefined(options.defaultTimeout)) {
      let timeout = parseInt(options.defaultTimeout, 10);

      if (isNumber(timeout) === false || isNaN(timeout)) {
        throw new KinveyError('Invalid timeout. Timeout must be a number.');
      }

      if (timeout < 0) {
        Log.info('Default timeout is less than 0. Setting default timeout to 60000ms.');
        timeout = 60000;
      }

      /**
       * @type {?number}
       */
      this.defaultTimeout = timeout;
    }
  }

  /**
   * Get the active user.
   */
  get activeUser() {
    return CacheRequest.getActiveUser(this);
  }

  /**
   * Returns an object containing all the information for this Client.
   *
   * @return {Object} Object
   */
  toPlainObject() {
    return {
      apiHostname: this.apiHostname,
      micHostname: this.micHostname,
      liveServiceHostname: this.liveServiceHostname,
      appKey: this.appKey,
      appSecret: this.appSecret,
      masterSecret: this.masterSecret,
      encryptionKey: this.encryptionKey,
      appVersion: this.appVersion,
      defaultTimeout: this.defaultTimeout
    };
  }

  /**
   * Initializes the Client class by creating a new instance of the
   * Client class and storing it as a shared instance. The returned promise
   * resolves with the shared instance of the Client class.
   *
   * @param {Object}    options                                            Options
   * @param {string}    [options.apiHostname='https://baas.kinvey.com']    Host name used for Kinvey API requests
   * @param {string}    [options.micHostname='https://auth.kinvey.com']    Host name used for Kinvey MIC requests
   * @param {string}    [options.appKey]                                   App Key
   * @param {string}    [options.appSecret]                                App Secret
   * @param {string}    [options.masterSecret]                             App Master Secret
   * @param {string}    [options.encryptionKey]                            App Encryption Key
   * @param {string}    [options.appVersion]                               App Version
   * @return {Promise}                                                     A promise.
   */
  static initialize(options) {
    const client = new Client(options);
    sharedInstance = client;
    return CacheRequest.loadActiveUser(client)
      .then(() => client);
  }

  /**
   * Returns the shared instance of the Client class used by the SDK.
   *
   * @throws {KinveyError} If a shared instance does not exist.
   *
   * @return {Client} The shared instance.
   *
   * @example
   * var client = Kinvey.Client.sharedInstance();
   */
  static sharedInstance() {
    if (isDefined(sharedInstance) === false) {
      throw new KinveyError('You have not initialized the library. ' +
        'Please call Kinvey.init() to initialize the library.');
    }

    return sharedInstance;
  }
}
