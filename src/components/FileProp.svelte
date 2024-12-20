<script lang="ts">
  import store from 'src/store.svelte'
	let { key, entries }: { key: MVFilePropType, entries: Set<string> } = $props();
  let input: HTMLDivElement;

  function removeEntry(e: InputEvent) {
    const entry = (<HTMLDivElement>e.target).dataset.entry!;
    entries.delete(entry);
    store.removeFilePropValue(key, entry);
  }

  function addEntry() {
    const entry = (input.textContent || '').trim();
    input.textContent = "";
    if (!entry || entries.has(entry)) return;
    entries.add(entry);
    store.insertFilePropValue(key, entry);
  }

  function submitOnEnter(e: KeyboardEvent) {
    if (e.key === 'Enter') {
      e.preventDefault();
      addEntry();
    }
  }
</script>

<template lang="pug">
  div.container
    div.label {key}
    div.entries
      +each("entries as entry (entry)")
        div.entry
          div {entry}
          div.button(
            onclick!="{removeEntry}"
            data-entry="{entry}"
          ) x
      div.input(
        contentEditable
        bind:this="{input}"
        onkeypress="{submitOnEnter}"
        onblur!="{addEntry}"
      )
</template>

<style scoped lang="sass">
  .container
    display: flex

  .label
    color: #AAA
    min-width: 5em

  .entries
    display: flex
    align-items: center
    flex-wrap: wrap
    flex-grow: 1

  .button
    margin-left: 0.2em
    padding: 0 0.3em 0.1em 0.3em
    background-color: #222
    color: #999
    &:hover
      color: #DDD

  .entry
    margin: 0 0.2em
    display: flex
    flex-wrap: nowrap
    color: #EEE
  
  .input
    flex-grow: 1
    background-color: #222
</style>