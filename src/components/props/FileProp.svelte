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
    if (!entry || entries.includes(entry)) return;
    entries.push(entry);
  }

  function submitOnEnter(e: KeyboardEvent) {
    if (e.key === 'Enter') {
      e.preventDefault();
      e.stopPropagation();
      addEntry();
    }
  }

  function focus(this: HTMLElement, e: InputEvent) {
    this.focus();
    e.stopPropagation();
  }

  function focusLast(this: HTMLElement, e: InputEvent) {
    const children = this.children;
    ;(<HTMLElement>children[children.length - 1]).focus();
    e.stopPropagation();
  }
</script>

<template lang="pug">
  div.metadata-property
    div.metadata-property-key {key}
    div.metadata-property-value
      div.multi-select-container(onclick="{focusLast}")
        +each("entries as entry (entry)")
          div.multi-select-pill(tabindex="0" onclick="{focus}")
            div.multi-select-pill-content {entry}
            div.multi-select-pill-remove-button(
              use:setIcon="{'x'}"
              onclick="{removeEntry}"
              data-entry="{entry}"
            )
        div.multi-select-input(
          contentEditable
          bind:this="{input}"
          onkeypress="{submitOnEnter}"
          onblur!="{addEntry}"
        )
</template>

<style scoped lang="sass">
  .metadata-property-key
    border: none
    background-color: transparent
    align-items: center
    width: calc(var(--metadata-label-width) / 2)
    min-width: calc(var(--metadata-label-width) / 2)
    color: var(--metadata-label-text-color)
    font-size: var(--metadata-label-font-size)
    font-weight: var(--metadata-label-font-weight)
    height: var(--input-height)
    flex: 0 0 auto

  .metadata-property
    div
      border: none
  
  .multi-select-container
    flex: 1 1 auto
</style>