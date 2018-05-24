/**
 * Describes static application info information
 * Object of this class is to be injected via webpack
 */
export abstract class AppInfo {
  gitVersion: string;
  buildVersion: string;
  name: string;
  description: string;
  version: string;
  isDevBuild: boolean;
  builtOn: string;
}
