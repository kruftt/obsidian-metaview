<script lang="ts">
import { setIcon } from "obsidian";
import type { Component } from "svelte";
import { createContextMenuCallback } from "./events";
import { makePropTemplate } from "utils";
import { PROPERTY_TYPES, TYPE_ICONS } from "const";
import PropKey from "./keys/PropKey.svelte";
import SelectValue from "./values/SelectValue.svelte";
import Configs from "./configs";
import createExpand from "components/expand.svelte";
import { getStore } from "data/store.svelte";

const store = getStore();

let {
	context,
	key,
	editable = false,
	remove,
}: {
	context: Record<string, MVPropDef> | MVPropDef[] | MVCollectionDef;
	key: string | number;
	editable?: boolean;
	remove?: () => void;
} = $props();

// `context` holds prop definitions keyed by name (object) or index
// (array/tuple); both resolve to an MVPropDef slot at runtime.
let ctx = $derived(context as unknown as Record<string | number, MVPropDef>);
// svelte-ignore state_referenced_locally
const removeSlot =
	remove ??
	(() => {
		delete ctx[key];
	});

let template = $derived(ctx[key]);

let typeIcon!: HTMLElement;
$effect(() => setIcon(typeIcon, TYPE_ICONS[template.type]));

const expand = createExpand();
const openContextMenu = createContextMenuCallback(store, removeSlot);

// svelte-ignore state_referenced_locally
let selectedType = $state(template.type);
// biome-ignore lint/suspicious/noExplicitAny: dynamically selected config component with varying props
let Config: Component<any> = $derived(Configs[template.type]);
$effect(() => {
	if (selectedType !== template.type) {
		const newTemplate = makePropTemplate({ type: selectedType });
		if (newTemplate) ctx[key] = newTemplate;
		store.commit();
	}
});
</script>

<div class="mv-template-property">
  <div class="metadata-property">
    <div class="mv-icon-tray">
      <button
        type="button"
        class="metadata-property-icon mv-icon-button"
        aria-label="Toggle config"
        bind:this={expand.icon}
        onclick={expand.toggle}
      ></button>
      <button
        type="button"
        class="metadata-property-icon mv-icon-button"
        aria-label="Property options"
        bind:this={typeIcon}
        style:display={key ? 'flex' : 'none'}
        onclick={openContextMenu}
        oncontextmenu={openContextMenu}
      ></button>
    </div>

    <div class="metadata-property-key">
      <PropKey {context} {key} {editable} />
    </div>

    <div class="metadata-property-value">
      <SelectValue bind:value={selectedType} options={PROPERTY_TYPES} />
    </div>
  </div>

  {#if expand.open}
    <Config {template} />
  {/if}
</div>

<style scoped lang="sass">
  

  .mv-template-property
    border-bottom: var(--border-width) solid var(--metadata-divider-color)
</style>