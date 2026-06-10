import { ItemView, TFile, type ViewStateResult, type WorkspaceLeaf } from "obsidian";
import { mount, unmount } from "svelte";
import Component from "./components/MetaView.svelte";
import { MVSession } from "./data/store.svelte";
import type MetaViewPlugin from "./Plugin";
import * as CONST from "./const";

export default class MetaView extends ItemView {
	component: ReturnType<typeof mount>;
	private readonly plugin: MetaViewPlugin;
	private readonly session: MVSession;

	constructor(leaf: WorkspaceLeaf, plugin: MetaViewPlugin) {
		super(leaf);
		this.plugin = plugin;
		this.session = new MVSession(plugin.index, plugin, leaf);
		this.navigation = false;
	}

	getViewType() {
		return CONST.ID;
	}

	getDisplayText(): string {
		return CONST.NAME;
	}

	async onOpen() {
		this.contentEl.addClass("mv-view");
		this.plugin.registerSession(this.session);
		// Mirror the leaf's native pin into the session (the tab's "Pin" menu and our header
		// toggle both flow through here).
		this.registerEvent(this.leaf.on("pinned-change", (pinned) => this.session.setPinned(pinned)));
		// Follow the active file unless we are (or are being restored) pinned; setState restores
		// the pinned file.
		this.session.onActiveFile(this.app.workspace.getActiveFile());
		this.component = mount(Component, { target: this.contentEl, props: { store: this.session } });
	}

	async onClose() {
		this.session.flushNow();
		this.plugin.unregisterSession(this.session);
		unmount(this.component);
	}

	/** Persist the displayed file so a pinned pane reopens on the same file (native pin only
	 *  persists the flag, not which file our view shows). */
	getState() {
		const state = super.getState();
		state.file = this.session.file?.path ?? null;
		return state;
	}

	async setState(state: { file?: string | null }, result: ViewStateResult) {
		await super.setState(state, result);
		if (this.session.pinned && state?.file) {
			const file = this.app.vault.getAbstractFileByPath(state.file);
			if (file instanceof TFile) this.session.loadFile(file);
		}
	}
}
