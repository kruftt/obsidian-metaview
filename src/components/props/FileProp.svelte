<script lang="ts">
  import ListValue from './values/ListValue.svelte';
  import { setIcon } from 'obsidian';
	let { key, entries }: { key: MVFilePropType, entries: string[] } = $props();
  let input!: HTMLDivElement;
  import StaticKey from './keys/StaticKey.svelte';
</script>

<template lang="pug">
  div.metadata-property(data-property-key="{key}")
    //- div.mv-file-key.metadata-property-key {key}
    div.mv-file-key.metadata-property-key
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
  
  .metadata-property
    --pill-padding-x: var(--tag-padding-x)
    --pill-padding-y: var(--tag-padding-y)

  .metadata-property[data-property-key="aliases"]
    --pill-background: rgba(168, 130, 255, 0.1)

  .metadata-property[data-property-key="cssclasses"]
    --pill-background: rgba(224, 222, 113, 0.1)

  .metadata-property[data-property-key="types"]
    --pill-background: rgba(68, 207, 110, 0.1)
</style>
