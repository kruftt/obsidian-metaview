import { ItemView, type WorkspaceLeaf } from "obsidian";
import { mount, unmount } from "svelte";
import Component from "./components/MetaView.svelte";
import type { MVStore } from "./data/store.svelte";
import * as CONST from "./const";

export default class MetaView extends ItemView {
	component: ReturnType<typeof mount>;
	private readonly store: MVStore;

	constructor(leaf: WorkspaceLeaf, store: MVStore) {
		super(leaf);
		this.store = store;
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
		this.component = mount(Component, { target: this.contentEl, props: { store: this.store } });
	}

	async onClose() {
		unmount(this.component);
	}
}
