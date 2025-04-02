import { ItemView, WorkspaceLeaf } from 'obsidian';
import * as CONST from './const';
import Component from './components/MetaView.svelte';
import { mount, unmount } from 'svelte';

export default class MetaView extends ItemView {
    component: Component;

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
        // @ts-ignore
        this.component = mount(Component, { target: this.contentEl });
    }
    
    async onClose() {
        unmount(this.component);
    }
}
