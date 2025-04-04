<script lang="ts">
  import ListValue from './values/ListValue.svelte';
  import { setIcon } from 'obsidian';
	let { key, entries }: { key: MVFilePropType, entries: string[] } = $props();
  let input!: HTMLDivElement;
  import StaticKey from './keys/StaticKey.svelte';
</script>

<template lang="pug">
  div.metadata-property
    //- div.mv-file-key.metadata-property-key {key}
    StaticKey({key})
    ListValue({entries} editable="{true}")
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
