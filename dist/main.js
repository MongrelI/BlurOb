"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
const obsidian_1 = require("obsidian");
const fs = __importStar(require("fs"));
const path = __importStar(require("path"));
const DEFAULT_SETTINGS = {
    videoPath: '',
    opacity: [],
    blurLeft: 0,
    blurCenter: 0,
    blurRight: 0,
};
class BlurOb extends obsidian_1.Plugin {
    constructor() {
        super(...arguments);
        this.settings = DEFAULT_SETTINGS;
        this.wallpapersDir = '';
    }
    async onload() {
        console.log('BlurOb plugin loaded');
        await this.loadSettings();
        // Determine plugin wallpapers directory
        const baseDir = this.app.vault.configDir || '';
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
exports.default = BlurOb;
class BlurObSettingTab extends obsidian_1.PluginSettingTab {
    constructor(app, plugin) {
        super(app, plugin);
        this.plugin = plugin;
    }
    display() {
        const { containerEl } = this;
        const el = containerEl;
        el.empty();
        el.createEl('h2', { text: 'BlurOb Settings' });
        // --- Upload video wallpaper ---
        el.createEl('h3', { text: 'Upload video wallpaper' });
        const fileInput = el.createEl('input', { type: 'file', attr: { accept: 'video/*' } });
        const current = el.createEl('div');
        current.textContent = this.plugin.settings.videoPath || 'No video selected';
        fileInput.onchange = async () => {
            var _a;
            const file = (_a = fileInput.files) === null || _a === void 0 ? void 0 : _a[0];
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
                const rowDiv = table.createDiv({ cls: 'opacity-row' });
                const text = rowDiv.createEl('input', { type: 'text', value: row.selector });
                text.onchange = () => {
                    row.selector = text.value;
                    this.plugin.saveSettings();
                };
                const slider = rowDiv.createEl('input', { type: 'range', attr: { min: '0', max: '1', step: '0.05', value: String(row.value) } });
                slider.oninput = () => {
                    row.value = parseFloat(slider.value);
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
        const makeSlider = (label, key) => {
            const wrap = el.createDiv();
            wrap.createEl('label', { text: label });
            const slider = wrap.createEl('input', { type: 'range', attr: { min: '0', max: '100', value: String(this.plugin.settings[key]) } });
            slider.oninput = () => {
                this.plugin.settings[key] = parseInt(slider.value);
                this.plugin.saveSettings();
            };
        };
        makeSlider('Left', 'blurLeft');
        makeSlider('Center', 'blurCenter');
        makeSlider('Right', 'blurRight');
    }
}
