import { ItemView, type WorkspaceLeaf } from "obsidian";
import { mount, unmount } from "svelte";
import Component from "./components/MetaView.svelte";
import * as CONST from "./const";

export default class MetaView extends ItemView {
	component: ReturnType<typeof mount>;

	constructor(leaf: WorkspaceLeaf) {
		super(leaf);
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
		this.component = mount(Component, { target: this.contentEl });
	}

	async onClose() {
		unmount(this.component);
	}
}
