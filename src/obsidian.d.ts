declare module 'obsidian' {
  export class Plugin {
    app: any;
    manifest: any;
    addSettingTab(tab: PluginSettingTab): void;
    loadData(): Promise<any>;
    saveData(data: any): Promise<void>;
  }

  export class PluginSettingTab {
    app: any;
    plugin: Plugin;
    containerEl: HTMLElement;
    constructor(app: any, plugin: Plugin);
    display(): void;
  }
}
