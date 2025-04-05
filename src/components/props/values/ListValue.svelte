<script lang='ts'>
  import { blurOnSpace } from '../events';
  import ListItem from './ListItem.svelte';

	let { editable, entries }: {
    editable: boolean
    entries: string[]
  } = $props();
  
  let input!: HTMLDivElement;
  
  function createEntry(this: HTMLDivElement, e: UIEvent) {
    const entry = (this.textContent || '').trim();
    if (entry && !entries.includes(entry)) {
      entries.push(entry);
      this.textContent = '';
    }
  }
</script>

<template lang='pug'>
  div.metadata-property-value
    div.multi-select-container(onclick!="{() => {input.focus(); console.log('focus')}}")
      +each("entries as entry, i")
        ListItem({entry} {editable} {entries})

      div.multi-select-input(
        contentEditable
        bind:this="{input}"
        onkeypress="{blurOnSpace}"
        onblur!="{createEntry}"
      )
</template>

<style lang='sass'>
  // .multi-select-input
  // .multi-select-container
  //   flex: 1 1 auto
  //   &:hover
  //     background-color: var(--metadata-input-background-active)
  
  // .multi-select-input
  //   background-color: transparent
</style>