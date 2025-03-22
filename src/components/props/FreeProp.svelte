<script lang="ts">
  import { Menu } from 'obsidian';
  import { blurOnEnter } from '../events';
  import JsonValue from '../values/JsonValue.svelte';

  let { context, key } : {
    context: FrontMatter,
    key: string,
  } = $props();

  function openContextMenu(e: MouseEvent) {
    const menu = new Menu();
    menu.addItem((item) => item
      .setTitle('Remove')
      .setIcon('trash-2')
      .setSection('danger')
      .setWarning(true)
      .onClick(() => {
        delete context[key];
      })
    );
    menu.showAtMouseEvent(e);
  }

  function updateKey(e: FocusEvent) {
    console.log("updating key");
    const target = <HTMLInputElement>e.target;
    const newKey = target.value;
    if (newKey in context) {
      // temporary red outline / shake
      target.value = key;
    } else {
      context[newKey] = context[key];
      delete context[key];
    }
  }

</script>

<template lang="pug">
  div.metadata-property
    div.metadata-property-key.mv-free-key
      input.metadata-property-key-input(
        value="{key}"
        onkeypress="{blurOnEnter}"
        onblur="{updateKey}"
      )
    JsonValue(bind:value!="{context[key]}")
</template>

<style lang="sass">
  .mv-free-key
    align-items: center
    min-width: calc(var(--metadata-label-width) * 0.8)
    color: var(--metadata-label-text-color)
    font-size: var(--metadata-label-font-size)
    font-weight: var(--metadata-label-font-weight)
    height: var(--input-height)
    flex: 0 0 min-content !important
    margin-right: 0.2em
    padding-left: 0.5em
</style>