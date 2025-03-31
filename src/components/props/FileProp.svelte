<script lang="ts">
  import { setIcon } from 'obsidian';
	let { key, entries }: { key: MVFilePropType, entries: string[] } = $props();
  let input!: HTMLDivElement;

  function removeEntry(this: HTMLElement, e: InputEvent) {
    const entry = this.dataset.entry!;
    entries.remove(entry);
    e.stopPropagation();
  }

  function addEntry() {
    const entry = (input.textContent || '').trim();
    input.textContent = '';
    if (entry && !entries.includes(entry)) entries.push(entry);
  }

  function submit(e: KeyboardEvent) {
    // e.preventDefault();
    // e.stopPropagation();
    const k = e.key;
    if (k === ' ' || k === 'Enter') {
      addEntry();
    }
  }
</script>

<template lang="pug">
  div.metadata-property
    div.mv-file-key.metadata-property-key {key}
    div.metadata-property-value
      div.multi-select-container(onclick!="{() => input.focus()}")
        +each("entries as entry (entry)")
          div.multi-select-pill(tabindex="0")
            div.multi-select-pill-content {entry}
            div.multi-select-pill-remove-button(
              use:setIcon="{'x'}"
              onclick="{removeEntry}"
              data-entry="{entry}"
            )
        div.multi-select-input(
          contentEditable
          bind:this="{input}"
          onkeypress="{submit}"
          onblur!="{addEntry}"
        )
</template>

<style scoped lang="sass">
  .mv-file-key
    align-items: center
    min-width: calc(var(--metadata-label-width) * 0.6)
    color: var(--metadata-label-text-color)
    font-size: var(--metadata-label-font-size)
    font-weight: var(--metadata-label-font-weight)
    height: var(--input-height)
    flex: 0 0 min-content !important
    padding-left: 0.5em
  
  .multi-select-container
    flex: 1 1 auto
    &:hover
      background-color: var(--metadata-input-background-active)
  
  .multi-select-input
    background-color: transparent
</style>
