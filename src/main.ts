import { Plugin, PluginSettingTab } from 'obsidian';
import * as fs from 'fs';
import * as path from 'path';

interface BlurObSettings {
  videoPath: string;
  opacity: { selector: string; value: number }[];
  blurLeft: number;
  blurCenter: number;
  blurRight: number;
}

const DEFAULT_SETTINGS: BlurObSettings = {
  videoPath: '',
  opacity: [],
  blurLeft: 0,
  blurCenter: 0,
  blurRight: 0,
};

export default class BlurOb extends Plugin {
  settings: BlurObSettings = DEFAULT_SETTINGS;
  wallpapersDir: string = '';

  async onload() {
    console.log('BlurOb plugin loaded');
    await this.loadSettings();

    // Determine plugin wallpapers directory
    const baseDir = (this.app as any).vault.configDir || '';
    this.wallpapersDir = path.join(baseDir, 'plugins', this.manifest.id, 'wallpapers');
    fs.mkdirSync(this.wallpapersDir, { recursive: true });

    this.addSettingTab(new BlurObSettingTab(this.app, this));
  }

  onunload() {
    console.log('BlurOb plugin unloaded');
  }

  async loadSettings() {
    this.settings = Object.assign({}, DEFAULT_SETTINGS, await this.loadData());
  }

  async saveSettings() {
    await this.saveData(this.settings);
  }
}

class BlurObSettingTab extends PluginSettingTab {
  plugin: BlurOb;

  constructor(app: any, plugin: BlurOb) {
    super(app, plugin);
    this.plugin = plugin;
  }

  display(): void {
    const { containerEl } = this;
    const el = containerEl as any;
    el.empty();
    el.createEl('h2', { text: 'BlurOb Settings' });

    // --- Upload video wallpaper ---
    el.createEl('h3', { text: 'Upload video wallpaper' });
    const fileInput = el.createEl('input', { type: 'file', attr: { accept: 'video/*' } });
    const current = el.createEl('div');
    current.textContent = this.plugin.settings.videoPath || 'No video selected';
    fileInput.onchange = async () => {
      const file = (fileInput as HTMLInputElement).files?.[0];
      if (file) {
        const arrayBuffer = await file.arrayBuffer();
        const dest = path.join(this.plugin.wallpapersDir, file.name);
        fs.writeFileSync(dest, Buffer.from(arrayBuffer));
        this.plugin.settings.videoPath = dest;
        current.textContent = dest;
        await this.plugin.saveSettings();
      }
    };

    // --- Opacity table ---
    el.createEl('h3', { text: 'Opacity table' });
    const table = el.createDiv();

    const renderTable = () => {
      table.empty();
      this.plugin.settings.opacity.forEach((row, index) => {
        const rowDiv = (table as any).createDiv({ cls: 'opacity-row' });
        const text = rowDiv.createEl('input', { type: 'text', value: row.selector });
        text.onchange = () => {
          row.selector = text.value;
          this.plugin.saveSettings();
        };
        const slider = rowDiv.createEl('input', { type: 'range', attr: { min: '0', max: '1', step: '0.05', value: String(row.value) } });
        slider.oninput = () => {
          row.value = parseFloat((slider as HTMLInputElement).value);
          this.plugin.saveSettings();
        };
        const removeBtn = rowDiv.createEl('button', { text: 'Remove' });
        removeBtn.onclick = () => {
          this.plugin.settings.opacity.splice(index, 1);
          renderTable();
          this.plugin.saveSettings();
        };
      });
    };

    const addBtn = el.createEl('button', { text: 'Add' });
    addBtn.onclick = () => {
      this.plugin.settings.opacity.push({ selector: '', value: 1 });
      renderTable();
      this.plugin.saveSettings();
    };

    renderTable();

    // --- Blur zones ---
    el.createEl('h3', { text: 'Blur zones' });

    const makeSlider = (label: string, key: 'blurLeft' | 'blurCenter' | 'blurRight') => {
      const wrap = el.createDiv();
      wrap.createEl('label', { text: label });
      const slider = wrap.createEl('input', { type: 'range', attr: { min: '0', max: '100', value: String(this.plugin.settings[key]) } });
      slider.oninput = () => {
        this.plugin.settings[key] = parseInt((slider as HTMLInputElement).value);
        this.plugin.saveSettings();
      };
    };

    makeSlider('Left', 'blurLeft');
    makeSlider('Center', 'blurCenter');
    makeSlider('Right', 'blurRight');
  }
}
