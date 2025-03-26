<script lang="ts">
  import { Menu } from 'obsidian';
  import { blurOnEnter, getContextMenuCallback, getSetKeyCallback } from '../events';
  import JsonValue from '../values/StructuredValue.svelte';

  let { context, key } : {
    context: FrontMatter,
    key: string,
  } = $props();

  const openContextMenu = getContextMenuCallback(context, key);
  const setKey = getSetKeyCallback(context, key);
</script>

<template lang="pug">
  div.metadata-property
    div.metadata-property-key.mv-free-key
      input.metadata-property-key-input(
        value="{key}"
        onkeypress="{blurOnEnter}"
        onblur="{setKey}"
        type="text"
      )
    div.metadata-property-value
      JsonValue(bind:value!="{context[key]}")
      div(contentEditable="true" style:overflow="scroll") my placeholder text
</template>

<style lang="sass">
  .mv-free-key
    align-items: center
    min-width: var(--metadata-label-width) 
    color: var(--metadata-label-text-color)
    font-size: var(--metadata-label-font-size)
    font-weight: var(--metadata-label-font-weight)
    height: var(--input-height)
    flex: 0 0 min-content !important
    margin-right: 0.2em
    padding-left: 0.1em
</style>