<script lang="ts">
  import { Menu, setIcon } from 'obsidian';
  import { TYPE_ICONS } from 'const';
  import { blurOnEnter } from '../events';
  import Containers from 'components/containers';
  import Values from 'components/values';

  let { context, key, template = { type: "text" } } : {
    context: FrontMatter,
    key: string,
    template: MVPropDef,
  } = $props();

  // let Value = $derived(values[template.type as keyof typeof values] || null);

  let containerType = $derived.by(() => {
    switch (template.type) {
      case 'record':
      case 'map':
      case 'array':
      case 'tuple':
        return template.type;
      case 'json':
        const v = context[key];
        return v instanceof Array ? 'array'
          : v instanceof Object ? 'map'
          : null;
      default:
        return null;
    }
  });
  
  let Container = $derived(Containers[containerType as keyof typeof Containers] || null);
  let Value = $derived(Values[template.type as keyof typeof Values] || null);
  
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
      target.value = key;
      // temporary red outline / shake
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
    
    //- delegate to value component
    div.metadata-property-value
      +startif('Value')
        Value(bind:value="{context[key]}")
      +else
        input.metadata-property-value-input(
          value="{context[key] || ''}"
          onkeypress="{blurOnEnter}"
          onblur="{updateValue}"
        )
      +endif
  
  +startif('containerType === "array" || containerType === "map"')
    Container(container="{context[key]}")
  +elseif('containerType === "record" || containerType === "tuple"')
    Container(container="{context[key]}" template="{template.props[key]}")
  +endif()

</template>

<style lang="sass">
  .metadata-property-key-input
    padding-left: 0.5em
</style>