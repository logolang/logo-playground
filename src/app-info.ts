/**
 * Declaration for app info object injected by webpack
 */
declare const APP_WEBPACK_STATIC_INFO: {
  gitVersion: string;
  buildVersion: string;
  name: string;
  description: string;
  version: string;
  isDevBuild: boolean;
  builtOn: string;
};
export const APP_INFO = APP_WEBPACK_STATIC_INFO;
