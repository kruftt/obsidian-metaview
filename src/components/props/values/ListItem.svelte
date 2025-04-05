<script lang='ts'>
  import { on } from 'svelte/events'
  import { setIcon } from 'obsidian';
  import { blurOnSpace } from '../events';

  let { editable, entries, entry }: {
    editable: boolean
    entries: string[]
    entry: string
  } = $props();

  let editing: boolean = $state(false);

  function removeEntry(this: HTMLElement, e: InputEvent) {
    e.stopPropagation();
    entries.remove(entry);
  }

  function editEntry(this: HTMLDivElement, e: UIEvent) {
    const edit = (this.textContent || '').trim();
    const i = entries.indexOf(entry);
    if (edit && !entries.includes(edit)) {
      entries[i] = edit;
    } else {
      this.textContent = entries[i];
    }
    editing = false;
  }

  const startEdit = (e: UIEvent) => {
    e.stopPropagation();
    if (editable) editing = true;
  };

  function stopProp(el: HTMLElement) {
    on(el, 'click', (e: UIEvent) => {
      e.stopPropagation();
    });
  }
</script>

<template lang='pug'>
  +startif("editing")
    div.multi-select-input(
      tabIndex="0"
      contentEditable
      use:stopProp
      onkeypress="{blurOnSpace}"
      onfocusout="{editEntry}"
    ) {entry}

  +else
    div.multi-select-pill(
      tabindex="0"
    )
      div.multi-select-pill-content(
        use:stopProp
        ondblclick="{startEdit}"
      )
        span {entry}
      div.multi-select-pill-remove-button(
        use:setIcon="{'x'}"
        onclick="{removeEntry}"
      )
  +endif
</template>

<style lang='sass'>
  .multi-select-input
    background-color: var(--metadata-input-background-active)
    // border-radius: var(--input-radius)
    // margin: var(--size-4-1)
</style>