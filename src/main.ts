import { Plugin } from 'obsidian';

export default class BlurOb extends Plugin {
  async onload() {
    console.log('BlurOb plugin loaded');
  }

  onunload() {
    console.log('BlurOb plugin unloaded');
  }
}
