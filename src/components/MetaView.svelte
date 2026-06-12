<script lang="ts">
import { setIcon } from "obsidian";

import { activateOnKey } from "./props/events";
import { type MVSession, setStore } from "../data/store.svelte";
import NoteData from "data/NoteData.svelte";

import FileProp from "./props/FileProp.svelte";
import NoteProp from "./props/NoteProp.svelte";
import TemplateProp from "./props/TemplateProp.svelte";
import NewKey from "./props/keys/NewKey.svelte";
import createExpand from "./expand.svelte";
import { createValue } from "utils";

let { store }: { store: MVSession } = $props();
// svelte-ignore state_referenced_locally
setStore(store);

let data = $derived(store.data);
let filename = $derived(store.filename);
const expand = createExpand();

const FILE_PROP_KEYS = ["types", "tags", "aliases", "cssclasses"] as const;
/** Per-prop pin: a pinned file prop stays visible even when the section is collapsed. */
let pinnedFileProps = $state<Record<string, boolean>>({ "types": true, "tags": true });
function toggleFilePropPin(key: string) {
	pinnedFileProps[key] = !pinnedFileProps[key];
}

let pinIcon = $state<HTMLElement>();
$effect(() => {
	if (pinIcon) setIcon(pinIcon, "pin");
});

/** Fill in default values for a type's props, leaving any already-present props untouched. */
function fillDefaults(typeProps: Record<string, MVPropDef>) {
	if (!(data instanceof NoteData)) return;
	const props = data.props;
	for (const [key, template] of Object.entries(typeProps)) {
		if (!(key in props)) props[key] = createValue(template);
	}
	store.commit();
}
</script>

<div class="metadata-container">
  {#if data !== null}
    <div
      class="mv-filename"
      role="button"
      tabindex="0"
      onclick={expand.toggle}
      onkeydown={activateOnKey(expand.toggle)}
    >
      <span class="metadata-property-icon" bind:this={expand.icon}></span>
      <span class="mv-filename-text">{filename}</span>
      <button
        type="button"
        class="mv-pin clickable-icon"
        class:mv-pinned={store.pinned}
        aria-label={store.pinned ? 'Unpin' : 'Pin to this file'}
        bind:this={pinIcon}
        onclick={(e) => { e.stopPropagation(); store.togglePin(); }}
      ></button>
    </div>

    <div class="mv-metadata-file-props">
      {#each FILE_PROP_KEYS as key}
        {#if expand.open || pinnedFileProps[key]}
          <div class="mv-file-prop">
            <button
              type="button"
              class="mv-icon-button mv-fileprop-pin"
              class:mv-pinned={pinnedFileProps[key]}
              aria-label={pinnedFileProps[key] ? 'Unpin property' : 'Pin property'}
              use:setIcon={'pin'}
              onclick={() => toggleFilePropPin(key)}
            ></button>
            <FileProp {key} context={key === 'types' ? data : data.fileProps} />
          </div>
        {/if}
      {/each}
    </div>

    <div class="metadata-content">
      {#if data instanceof NoteData}
        {#each data.freeProps as key}
          <NoteProp {key} context={data.props} editable />
        {/each}
        <div class="metadata-property">
          <NewKey context={data.props} value="''" />
        </div>
        {#each Object.entries(data.typeData) as [name, typeProps]}
          <div class="mv-properties-title">
            <span>{name}</span>
            <button
              type="button"
              class="mv-icon-button mv-fill-defaults"
              aria-label="Fill in default values"
              use:setIcon={'wand-2'}
              onclick={() => fillDefaults(typeProps)}
            ></button>
          </div>
          {#each Object.entries(typeProps) as [key, template]}
            <NoteProp {key} {template} context={data.props} />
          {/each}
        {/each}
      {:else}
        {#each Object.keys(data.props) as key (key)}
          <TemplateProp {key} context={data.props} editable />
        {/each}
        <div class="metadata-property">
          <NewKey context={data.props} value={{ type: 'text' }} />
        </div>
      {/if}
    </div>
  {/if}
</div>

<style lang='sass'>
  .mv-filename
    display: flex
    align-items: center
    gap: var(--size-4-1)

    &:hover
      color: var(--text-normal)

  .mv-filename-text
    overflow: hidden
    text-overflow: ellipsis
    white-space: nowrap

  .mv-pin
    margin-left: auto
    flex: 0 0 auto
    opacity: 0
    color: var(--text-muted)

  .mv-filename:hover .mv-pin
    opacity: 0.7

  .mv-pin.mv-pinned
    opacity: 1
    color: var(--text-accent)

  .mv-metadata-file-props
    padding-bottom: 0.4em
    margin-bottom: 0.6em
</style>
