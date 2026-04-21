declare module "nitropack/runtime" {
  export interface NitroAppPlugin {
    (...args: any[]): void;
  }

  export function defineNitroPlugin(def: NitroAppPlugin): NitroAppPlugin;
}
