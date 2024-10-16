import { App, CachedMetadata, Plugin, PluginSettingTab, Setting, TFolder, TFile, WorkspaceLeaf } from 'obsidian';
import * as CONST from './src/constants'
import refs from './src/refs'
import { FILENAME_REGEX } from './src/utils'
import MetaView from "./src/MetaView"
import { templateCache, fileStore } from './src/templateCache'

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
			refs.init(this);
			const app = this.app;
			const workspace = app.workspace;
			const metadataCache = app.metadataCache;
			
			templateCache.buildCache();
			fileStore.set(workspace.getActiveFile());
			
			this.registerEvent(workspace.on('file-open', (file) => fileStore.set(file)));
						
			this.registerEvent(metadataCache.on('changed',
				(file: TFile, data: string, cache: CachedMetadata) => {
					if (fileStore.updating) {
						fileStore.updating = false;
						return;
					}
					
					if (file.extension !== 'md') return;
					const { templatesPath } = this.settings;

					if (file.path.startsWith(templatesPath)) {
						templateCache.buildTemplate(file);
					}

					if (file === fileStore.activeFile) {
						fileStore.set(file);
					}
				}
			));
						
			this.registerEvent(metadataCache.on('deleted',
				(file: TFile, prevCache: CachedMetadata | null) => {
					if (file.extension !== 'md') return;
					if (file.path.startsWith(this.settings.templatesPath)) {
						delete templateCache.templates[file.basename];
					}
				}
			));
						
			this.registerEvent(app.vault.on('rename', 
				(file: TFile, oldPath: string) => {
					const { templatesPath } = this.settings;
					const templates = templateCache.templates;

					if (oldPath.startsWith(templatesPath)) {
						const oldBase = FILENAME_REGEX.exec(oldPath)?.[1];
						if (oldBase) delete templates[oldBase];
					}

					if (file.path.startsWith(templatesPath)) {
						templateCache.buildTemplate(file);
					}
				}
			));
		});
	}

	onunload() {
		refs.clear();
	}

	async loadSettings() {
		this.settings = Object.assign({}, DEFAULT_SETTINGS, await this.loadData());
	}

	async saveSettings() {
		// TODO: Reload plugin?
		await this.saveData(this.settings);
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
			.setName('Meta Template Directory')
			// .setClass(typeof(TFolder)) // ? doesnt seem to work
			.setDesc('Search for template type files in this directory.')
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
