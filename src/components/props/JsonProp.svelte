<script lang="ts">
  import store from '../../store.svelte'

  let { address, key, value, template = { type: 'json', value: '' }}:
      { address: string, key: string, value: unknown, template: MVJsonDef } = $props();

  function onBlur(e: InputEvent) {
    const target = e.target;
    if (target instanceof HTMLElement) {
      store.setProperty(address, target.innerText);
    }
  }

  function onKeyDown(e: KeyboardEvent) {
    e.stopPropagation();
    const target = e.target;
    if (target instanceof HTMLElement) {
      if (e.key === 'Enter') target.blur();
    }
  }
</script>

<template lang="pug">
  //- div.metadata-property
  //-   span.metadata-property-key {key}
  //-   div.metadata-property-value {value}
  div.entry
    div
      b {key}:
    div.value(contentEditable on:keydown="{onKeyDown}" on:blur="{onBlur}") {value}
</template>

<style lang="sass" scoped>
  .entry
    display: flex
    margin: 0.2em

  .value
    margin-left: 1em
    background-color: #111
    flex: 1
    padding-left: 0.2em
    user-select: text
    -webkit-user-select: text
  // .metadata-property-key 
  //   width: calc(var(--metadata-label-width) * 0.6)
  //   min-width: calc(var(--metadata-label-width) * 0.6)
</style>