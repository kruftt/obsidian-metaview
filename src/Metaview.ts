import { ItemView, WorkspaceLeaf } from 'obsidian';
import * as CONST from './constants'
import Component from './components/MetaView.svelte';

const UPDATE_EVENTS = ["file-open", "window-open", "editor-change"];

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
        console.log('View Open');
        this.component = new Component({
            target: this.contentEl
        });
    }
    
    async onClose() {
        console.log('View Close');
        this.component.$destroy();
    }
}
