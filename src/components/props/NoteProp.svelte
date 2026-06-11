<script lang="ts">
import { setIcon } from "obsidian";
import type { Component } from "svelte";
import { blurOnEnter, createContextMenuCallback } from "./events";
import { getStore } from "data/store.svelte";
import { TYPE_ICONS } from "const";
import Values from "./values";
import ContentContainers from "./contents";
import PropKey from "./keys/PropKey.svelte";
import createExpand from "components/expand.svelte";

let {
	context,
	editable = false,
	key,
	remove,
	template,
}: {
	context: FrontMatter | FrontMatterValue[];
	editable?: boolean;
	key: string | number;
	remove?: () => void;
	template?: MVPropDef;
} = $props();

const store = getStore();

// `context` is an object (string keys) or an array (numeric keys); both
// index to a FrontMatterValue slot at runtime.
let slot = $derived(
	context as unknown as Record<string | number, FrontMatterValue>,
);
// svelte-ignore state_referenced_locally
const removeSlot =
	remove ??
	(() => {
		delete slot[key];
	});

let icon!: HTMLElement;
$effect(() => setIcon(icon, TYPE_ICONS[template?.type || "json"]));

// biome-ignore lint/suspicious/noExplicitAny: dynamically selected value component with varying props
let Value: Component<any> = $derived(Values[template?.type || ""]);
// biome-ignore lint/suspicious/noExplicitAny: dynamically selected content component with varying props
let Contents = $derived.by((): Component<any> | null => {
	if (template) {
		const t = template.type;
		const C = ContentContainers[<keyof typeof ContentContainers>t];
		if (C) return C;
		if (t !== "json") return null;
	}
	if (typeof slot[key] === "object") {
		return Array.isArray(slot[key])
			? ContentContainers.array
			: ContentContainers.map;
	}
	return null;
});

const expand = createExpand();
// svelte-ignore state_referenced_locally
const inputDefault = (<MVInputDef>template)?.default;
const openContextMenu = createContextMenuCallback(
	store,
	removeSlot,
	inputDefault
		? () => {
				slot[key] = inputDefault;
			}
		: undefined,
);
</script>

<div class="mv-note-property">
  <div class="metadata-property">
    <div class="mv-icon-tray">
      <!-- Kept (not unmounted) when there are no nested contents so the icon slot
           stays aligned, but made inert: invisible, unfocusable, non-interactive. -->
      <button
        type="button"
        class="metadata-property-icon mv-icon-button"
        aria-label="Toggle nested properties"
        aria-hidden={!Contents}
        tabindex={Contents ? 0 : -1}
        bind:this={expand.icon}
        onclick={expand.toggle}
        style:opacity={Contents ? 1 : 0}
        style:pointer-events={Contents ? null : 'none'}
      ></button>
      <button
        type="button"
        class="metadata-property-icon mv-type-icon mv-icon-button"
        aria-label="Property options"
        bind:this={icon}
        onclick={openContextMenu}
      ></button>
    </div>

    <div class="metadata-property-key {template ? 'mv-bound-key' : 'mv-free-key'}">
      <PropKey {context} {key} {editable} />
    </div>

    <div class="metadata-property-value">
      <Value {template} name={String(key)} bind:value={slot[key]} />
    </div>
  </div>

  {#if expand.open && Contents}
    <Contents {template} bind:data={slot[key]} />
  {/if}
</div>

<style lang="sass">
  .mv-note-property
    border-bottom: var(--border-width) solid var(--metadata-divider-color)

  .mv-bound-key
    flex: 0 0 auto

  .mv-free-key
    flex: 0 0 min-content !important

  .mv-type-icon
    margin-right: var(--size-4-1)
</style>