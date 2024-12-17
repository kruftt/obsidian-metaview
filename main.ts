import { App, Plugin, PluginSettingTab, Setting, TFolder, TFile, WorkspaceLeaf } from 'obsidian';
import * as CONST from './src/constants'
import MetaView from "./src/MetaView"
import store from './src/store.svelte'

// const FILENAME_REGEX = /^(?:.*\/)?(.+).md$/;
const DEFAULT_SETTINGS: MVSettings = {
	templatesPath: '',
}

export default class MetaViewPlugin extends Plugin {
	settings: MVSettings;
		
	async activateView() {
		const { workspace } = this.app;
		const leaves = workspace.getLeavesOfType(CONST.ID);
		let leaf: WorkspaceLeaf | null = null;
		
		if (leaves.length > 0) {
			leaf = leaves[0];
		} else {
			leaf = <WorkspaceLeaf>workspace.getRightLeaf(false);
			await leaf.setViewState({ type: CONST.ID, active: true });
		}

		workspace.revealLeaf(leaf);
	}

	async onload() {
		// console.log('Plugin load');
		await this.loadSettings();
		this.addSettingTab(new MetaViewSettingTab(this.app, this));
		this.registerView(CONST.ID, (leaf) => new MetaView(leaf));

		const ribbonIconEl = this.addRibbonIcon('info', CONST.NAME, (evt: MouseEvent) => { this.activateView(); });
		ribbonIconEl.addClass('my-plugin-ribbon-class');

		this.app.workspace.onLayoutReady(() => {
			const app = this.app;
			const workspace = app.workspace;
			const metadataCache = app.metadataCache;
			store.plugin = this;
			store.file = workspace.getActiveFile();
			
			this.registerEvent(workspace.on('file-open', (file) => store.file = file));
			this.registerEvent(metadataCache.on('changed', (file) => store.updateFile(file)));
			this.registerEvent(metadataCache.on('deleted', (file) => store.deleteFile(file)));
			this.registerEvent(app.vault.on('rename', (file, oldPath) => store.renameFile(file, oldPath)));
		});
	}

	onunload() { }

	async loadSettings() {
		this.settings = Object.assign({}, DEFAULT_SETTINGS, await this.loadData());
	}

	async saveSettings() {
		await this.saveData(this.settings);
		store.plugin = this;
	}
}

class MetaViewSettingTab extends PluginSettingTab {
	plugin: MetaViewPlugin;

	constructor(app: App, plugin: MetaViewPlugin) {
		super(app, plugin);
		this.plugin = plugin;
	}

	display(): void {
		const {containerEl} = this;
		containerEl.empty();

		new Setting(containerEl)
			.setName('Meta Types Directory')
			// .setClass(typeof(TFolder)) // ? doesnt seem to work
			.setDesc('Directory in which type definitions are stored.')
			.addText(text => text
				.setPlaceholder('')
				.setValue(this.plugin.settings.templatesPath)
				.onChange(async (value) => {
					this.plugin.settings.templatesPath = value;
					await this.plugin.saveSettings();
				}));

		// new Setting(containerEl)
		// 	.setName('Types Property Name')
		// 	.setDesc('Set the name of the property used to track data types.')
		// 	.addText(text => text
		// 		.setPlaceholder('types')
		// 		.setValue(this.plugin.settings.typesPropName)
		// 		.onChange(async (value) => {
		// 			this.plugin.settings.typesPropName = value;
		// 			await this.plugin.saveSettings();
		// 		}));
	}
}
