import { App, Plugin, PluginSettingTab, Setting, TFile, WorkspaceLeaf, type FrontMatterCache } from 'obsidian';
import * as CONST from './const'
import MetaView from "./MetaView"
import { MVIndex, type MVSession } from './data/store.svelte'
import { arrayWrap } from './utils'

const DEFAULT_SETTINGS: MVSettings = {
	templatesPath: '',
	typesProperty: 'types',
}

export default class MetaViewPlugin extends Plugin {
	declare settings: MVSettings;
	index!: MVIndex;
	private readonly sessions = new Set<MVSession>();

	/** Register a view's session so it receives workspace/metadata event notifications. */
	public registerSession(session: MVSession) {
		this.sessions.add(session);
	}

	public unregisterSession(session: MVSession) {
		this.sessions.delete(session);
	}

	/** Reload every live session against its file (pinned) or the active file (following). */
	private refreshSessions() {
		const active = this.app.workspace.getActiveFile();
		for (const s of this.sessions) s.loadFile(s.pinned ? s.file : active);
	}

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
		this.index = new MVIndex(this);
		this.addSettingTab(new MetaViewSettingTab(this.app, this));
		this.registerView(CONST.ID, (leaf) => new MetaView(leaf, this));

		const ribbonIconEl = this.addRibbonIcon('info', CONST.NAME, (evt: MouseEvent) => { this.activateView(); });
		ribbonIconEl.addClass('my-plugin-ribbon-class');

		this.app.workspace.onLayoutReady(() => {
			const app = this.app;
			const { workspace, metadataCache } = app;
			const index = this.index;
			index.scan();

			this.registerEvent(workspace.on('file-open', (file) => {
				for (const s of this.sessions) s.onActiveFile(file);
			}));

			this.registerEvent(metadataCache.on('changed', (file, data, cache) => {
				if (file.extension !== 'md') return;
				const isTemplate = index.isTemplate(file.path);

				if (isTemplate) index.addTemplate(file);
				else index.reindexNote(file);

				const fm = cache.frontmatter || {};
				for (const s of this.sessions) s.onMetadataChanged(file, fm, isTemplate);
			}));

			this.registerEvent(metadataCache.on('deleted', (file, prevCache) => {
				if (index.isTemplate(file.path)) {
					index.removeTemplate(file.path);
				} else {
					index.removeNote(file, this.getTypes(prevCache?.frontmatter || {}))
				}
				for (const s of this.sessions) s.onFileDeleted(file);
			}));

			this.registerEvent(app.vault.on('rename', (file, oldPath) => {
				if (file instanceof TFile) {
					if (oldPath.endsWith('.md')) {
						if (index.isTemplate(oldPath)) index.removeTemplate(oldPath);
						else index.removeNote(file, this.getTypes(this.getFrontMatter(file)));
					}
					if (file.path.endsWith('.md')) {
						if (index.isTemplate(file.path)) index.addTemplate(file);
						else index.addNote(file);
					}
					for (const s of this.sessions) s.onFileRenamed(file, oldPath);
				}
			}));

			this.refreshSessions();
		});
	}

	onunload() {
		for (const s of this.sessions) s.flushNow();
	}

	async loadSettings() {
		this.settings = Object.assign({}, DEFAULT_SETTINGS, await this.loadData());
	}

	async saveSettings() {
		await this.saveData(this.settings);
		this.index.scan();
		this.refreshSessions();
	}

	public getFrontMatter(file: TFile) {
		return this.app.metadataCache.getFileCache(file)?.frontmatter || {};
	}

	public getTypes(fm: FrontMatterCache) {
		return arrayWrap(fm[this.settings.typesProperty]);
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
