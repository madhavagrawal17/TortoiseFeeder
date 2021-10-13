import { API, PlatformPluginConstructor } from 'homebridge';

import { PLATFORM_NAME } from './settings';
import { RaspberryPiHomebridgePlatform } from './platform';

/**
 * This method registers the platform with Homebridge
 */
export = (api: API) => {
  // @ts-ignore: Known error
  var platformPlugin: PlatformPluginConstructor = RaspberryPiHomebridgePlatform;
  api.registerPlatform(PLATFORM_NAME, platformPlugin);
};
