<script lang="ts">
  import { Menu } from 'obsidian';
  import { blurOnEnter } from '../events';

  let { context, key } : {
    context: FrontMatter,
    key: string,
  } = $props();

  let stringifiedValue = $derived(JSON.stringify(context[key]).replace(/^"|"$/g, ''));
  
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

  function updateValue(e: FocusEvent) {
    console.log("updating value");
    const target = <HTMLInputElement>e.target;
    try {
      const newValue = JSON.parse(target.value);
      context[key] = newValue;
    } catch (e) {
      if (e instanceof SyntaxError) {
        console.log('mv: caught json syntax error')
        context[key] = target.value;
      } else throw(e);
    }
    target.value = stringifiedValue;
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
    //- div.metadata-property-value
      //- div { context[key] }
    input.metadata-property-value-input(
      value="{stringifiedValue}"
      onkeypress="{blurOnEnter}"
      onblur="{updateValue}"
    )
</template>

<style lang="sass">
  .context
    background-color: #fff
    width: 1em
    height: 1em
    
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