<script lang="ts">
  import { Menu, setIcon } from 'obsidian';
  import { TYPE_ICONS } from 'const';
  import { blurOnEnter } from '../events';

  let { context, key, template = { type: "text" } } : {
    context: FrontMatter,
    key: string,
    template: MVPropDef,
  } = $props();


  // let Value = $derived(values[template.type as keyof typeof values] || null);
  
  let icon!: HTMLElement;
  $effect(() => setIcon(icon, TYPE_ICONS[template.type]));
  
  function openContextMenu(e: MouseEvent) {
    const menu = new Menu();

    if ('default' in template) {
      menu.addItem((item) => item
        .setTitle('Default')
        .setIcon('rotate-ccw')
        .setSection('danger')
        .setWarning(true)
        .onClick(() => context[key] = template.default!)
      );
    }

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
    const newValue = target.value;
    context[key] = newValue;
  }
</script>

<template lang="pug">
  div.metadata-property
    div.metadata-property-key
      span.metadata-property-icon(bind:this="{icon}" onclick="{openContextMenu}")
      input.metadata-property-key-input(
        value="{key}"
        onkeypress="{blurOnEnter}"
        onblur="{updateKey}"
      )
    //- div.metadata-property-value
      //- div { context[key] }
    input.metadata-property-value-input(
      value="{context[key]}"
      onkeypress="{blurOnEnter}"
      onblur="{updateValue}"
    )
</template>

<style lang="sass">
  .context
    background-color: #fff
    width: 1em
    height: 1em
    

</style>