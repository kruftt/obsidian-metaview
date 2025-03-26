<script lang="ts">
  import { Menu, setIcon } from 'obsidian';
  import { TYPE_ICONS } from 'const';
  import { blurOnEnter, getContextMenuCallback } from '../events';
  import Containers from 'components/containers';
  import Values from 'components/values';

  let { context, key, template = { type: "text" } } : {
    context: FrontMatter,
    key: string,
    template: MVPropDef,
  } = $props();

  // let Value = $derived(values[template.type as keyof typeof values] || null);

  let input!: HTMLElement;

  let containerType = $derived.by(() => {
    switch (template.type) {
      case 'record':
      case 'map':
      case 'array':
      case 'tuple':
        return template.type;
      case 'json':
        const v = context[key];
        return v instanceof Object ? v instanceof Array ? 'array' : 'map' : null;
      default:
        return null;
    }
  });
  
  let Container = $derived(Containers[containerType as keyof typeof Containers] || null);
  let Value = $derived(Values[template.type as keyof typeof Values] || null);
  
  let icon!: HTMLElement;
  $effect(() => setIcon(icon, TYPE_ICONS[template.type]));
  
  const openContextMenu = getContextMenuCallback(context, key, template);

  function updateValue(e: FocusEvent) {
    const target = <HTMLInputElement>e.target;
    const newValue = target.value;
    context[key] = newValue;
  }
</script>

<template lang="pug">
  div.metadata-property
    div.metadata-property-key.mv-typed-key(onclick!="{ () => input.focus() }")
      span.metadata-property-icon(bind:this="{icon}" onclick="{openContextMenu}")
      div.metadata-property-key-input { key } 
      //- div.metadata-property-value
      //- div { context[key] }
    
    //- delegate to value component
    div.metadata-property-value
      +startif('Value')
        Value(
          bind:this="{input}"
          bind:value="{context[key]}"
          )
      +else
        input.metadata-property-value-input(
          bind:this="{input}"
          value="{context[key] || ''}"
          onkeypress="{blurOnEnter}"
          onblur="{updateValue}"
          type="text"
        )
      +endif
  
  +startif('containerType === "array" || containerType === "map"')
    Container(container="{context[key]}")
  +elseif('containerType === "record" || containerType === "tuple"')
    Container(container="{context[key]}" template="{template.props[key]}")
  +endif()

</template>

<style scoped lang="sass">
  .mv-typed-key
    padding-left: 0.1em
    align-items: center
    flex: 0 0 auto
</style>