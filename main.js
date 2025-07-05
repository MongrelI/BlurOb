"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const obsidian_1 = require("obsidian");
class BlurOb extends obsidian_1.Plugin {
    async onload() {
        console.log('BlurOb plugin loaded');
    }
    onunload() {
        console.log('BlurOb plugin unloaded');
    }
}
exports.default = BlurOb;
