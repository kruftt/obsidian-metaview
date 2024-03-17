import { EventRef, ItemView, WorkspaceLeaf } from "obsidian";
import { initialize, subscribe } from './store';

import Component from "./components/MetadataView.svelte";
import { Unsubscriber } from "svelte/store";

const UPDATE_EVENTS = ["file-open", "window-open", "editor-change"];
export const METADATA_VIEW = "metadata-view";


export class MetadataView extends ItemView {
    component: Component;
    unsub: Unsubscriber;

    constructor(leaf: WorkspaceLeaf) {
    super(leaf);
        this.navigation = false;
    }

    getViewType() {
        return METADATA_VIEW;
    }

    getDisplayText(): string {
        return "Metadata View"
    }

    async onOpen() {
        this.component = new Component({
            target: this.contentEl,
            props: { fileData: await initialize(this.app) }
        });

        this.unsub = subscribe(this.app, (fileData) => {
            this.component.$set({fileData})
        });
    }
    
    async onClose() {
        this.component.$destroy();
    }
}
