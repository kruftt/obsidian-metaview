import { App, Plugin, PluginSettingTab, Setting, TFolder, TFile, WorkspaceLeaf, MetadataCache, type FrontMatterCache, Vault } from 'obsidian';
import * as CONST from './const'
import MetaView from "./MetaView"
import store from './data/store.svelte'
import NoteData from 'data/NoteData.svelte';
import { arrayWrap } from './utils'

const DEFAULT_SETTINGS: MVSettings = {
	templatesPath: '',
	typesProperty: 'types',
}

export default class MetaViewPlugin extends Plugin {
	public settings: MVSettings;
		
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
		await this.loadSettings();
		this.addSettingTab(new MetaViewSettingTab(this.app, this));
		this.registerView(CONST.ID, (leaf) => new MetaView(leaf));

		const ribbonIconEl = this.addRibbonIcon('info', CONST.NAME, (evt: MouseEvent) => { this.activateView(); });
		ribbonIconEl.addClass('my-plugin-ribbon-class');

		this.app.workspace.onLayoutReady(() => {
			const app = this.app;
			const { workspace, metadataCache } = app;
			store.init(this);

			const loadFile = (file: TFile | null) => {
				store.updating = true;
				if (file === null || file.extension !== 'md') {
					store.file = store.data = null;
				} else {
					console.log('loading file', file.name);
					store.file = file;
					const fm = this.getFrontMatter(file);
					store.data = (this.isTemplate(file.path))
						? store.getTemplate(file.path)
						: new NoteData(fm, this.settings.typesProperty);
				}
			};
			
			this.registerEvent(workspace.on('file-open', loadFile));

			this.registerEvent(metadataCache.on('changed', (file, data, cache) => {
				console.log('metadata changed', store.updating);
				if (file.extension !== 'md') return;
				const storeData = store.data;

				if (store.updating && file === store.file) {
					store.updating = false;
				} else {
					if (this.isTemplate(file.path)) {
						store.addTemplate(file); // updates template
						// check if current note is a template
						if (file === store.file) store.getTemplate
						if (storeData instanceof NoteData) storeData.updateTypeData(this.settings.typesProperty);
					} else {
						store.removeNote(file, this.getTypes(cache));
						store.addNote(file);
					}
					if (file === store.file) loadFile(file);
				}				
			}));

			this.registerEvent(metadataCache.on('deleted', (file, prevCache) => {
				if (this.isTemplate(file.path)) {
					store.removeTemplate(file.path);
				} else {
					store.removeNote(file, this.getTypes(prevCache?.frontmatter || {}))
				}
			}));

			this.registerEvent(app.vault.on('rename', (file, oldPath) => {
				if (file instanceof TFile) {
					if (oldPath.endsWith('.md')) {
						if (this.isTemplate(oldPath)) store.removeTemplate(oldPath);
						else store.removeNote(file, this.getTypes(this.getFrontMatter(file)));
					}
					if (file.path.endsWith('.md')) {
						if (this.isTemplate(file.path)) store.addTemplate(file);
						else store.addNote(file);
					}
				}
			}));

			loadFile(workspace.getActiveFile());
		});
	}

	onunload() { }

	async loadSettings() {
		this.settings = Object.assign({}, DEFAULT_SETTINGS, await this.loadData());
	}

	async saveSettings() {
		await this.saveData(this.settings);
		store.init(this);
	}

	public getFrontMatter(file: TFile) {
		return this.app.metadataCache.getFileCache(file)?.frontmatter || {};
	}

	public getTypes(fm: FrontMatterCache) {
		return arrayWrap(fm[this.settings.typesProperty]);
	}

	private isTemplate(path: string) {
		return path.startsWith(this.settings.templatesPath);
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
			.setName('Types Property')
			.setDesc("Metadata property to specify a note's types.")
			.addText(text => text
				.setPlaceholder('types')
				.setValue(this.plugin.settings.typesProperty)
				.onChange(async (value) => {
					this.plugin.settings.typesProperty = value;
					await this.plugin.saveSettings();
				}));

		new Setting(containerEl)
			.setName('Templates Directory')
			// .setClass(typeof(TFolder)) // ? doesnt seem to work
			.setDesc('All files in this directory are parsed as templates.')
			.addText(text => text
				.setPlaceholder('')
				.setValue(this.plugin.settings.templatesPath)
				.onChange(async (value) => {
					this.plugin.settings.templatesPath = value;
					await this.plugin.saveSettings();
				}));
	}
}
