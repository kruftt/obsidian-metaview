<script lang='ts'>
  import { setIcon } from 'obsidian';
  import { blurOnEnter } from '../events';
	import { on } from 'svelte/events'
	let { editable, entries }: { editable: boolean, entries: string[] } = $props();
  let input!: HTMLDivElement;

  function removeEntry(this: HTMLElement, e: InputEvent) {
    const entry = this.dataset.entry!;
    entries.remove(entry);
    e.stopPropagation();
  }

  function newEntry(e: UIEvent) {
    addEntry(<HTMLDivElement>e.target);
    (<HTMLDivElement>e.target).textContent = '';
  }

  function addEntry(target: HTMLDivElement): boolean {
    const entry = (target.textContent || '').trim();
    if (entry && !entries.includes(entry)) {
      entries.push(entry);
      return true;
    }
    return false;
  }

  // function submit(e: KeyboardEvent) {
  //   // e.preventDefault();
  //   // e.stopPropagation();
  //   const k = e.key;
  //   if (k === ' ' || k === 'Enter') {
  //     addEntry(<HTMLDivElement>e.target);
  //   }
  // }

  let editing: boolean = $state(false);
  function editPill(e: PointerEvent) {
    const target = <HTMLDivElement>e.target;
    if (addEntry(target)) {
      target.textContent = '';
    }
  }

  const focus = (node: HTMLElement) => node.focus();
  const edit = (e: UIEvent) => {
    if (editable) editing = true;
    e.stopPropagation();
  };

  function stopProp(el: HTMLElement) {
    on(el, 'click', (e: UIEvent) => {
      e.stopPropagation();
    });
  }
</script>

<template lang='pug'>
  div.metadata-property-value
    div.multi-select-container(onclick!="{() => {input.focus(); console.log('focus')}}")
      +each("entries as entry (entry)")
        div.multi-select-pill(tabindex="0")
          +startif("editing")
            div.multi-select-input(
              tabIndex="0"  
              contentEditable
              blurOnEnter
              onfocusout="{editPill}"
              use:stopProp
            ) {entry}
          +else
            div.multi-select-pill-content(
              use:stopProp
              ondblclick="{edit}"
            ) {entry}
          +endif
          div.multi-select-pill-remove-button(
            use:setIcon="{'x'}"
            onclick="{removeEntry}"
            data-entry="{entry}"
          )
      div.multi-select-input(
        contentEditable
        bind:this="{input}"
        onkeypress="{blurOnEnter}"
        onblur!="{addEntry}"
      )
</template>

<style lang='sass'>
  .multi-select-input
  .multi-select-container
    flex: 1 1 auto
    &:hover
      background-color: var(--metadata-input-background-active)
  
  .multi-select-input
    background-color: transparent
</style>