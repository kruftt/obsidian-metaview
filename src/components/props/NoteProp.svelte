<script lang="ts">
  import { setIcon } from 'obsidian';
  import { blurOnEnter, createContextMenuCallback } from './events';
  import { INPUT_TYPES, TYPE_ICONS } from 'const';
  import InputValue from './values/InputValue.svelte';
  import LinkValue from './values/LinkValue.svelte';
  import JsonValue from './values/JsonValue.svelte';
  import SelectValue from './values/SelectValue.svelte';
  import ContentContainers from './contents'
  import EditableKey from './keys/EditableKey.svelte';
  import createExpand from 'components/expand.svelte';

  let { context, key, remove = () => delete context[key], template } : {
    context: FrontMatter
    key: string
    remove?: () => void
    template?: MVPropDef
  } = $props();

  let icon!: HTMLElement;
  $effect(() => setIcon(icon, TYPE_ICONS[template?.type || 'json']));

  let inputType = $derived(INPUT_TYPES[template?.type || '']);
  let Contents = $derived.by(() => {
    if (template) {
      const t = template.type;
      const C = ContentContainers[<keyof typeof ContentContainers>t];
      if (C) return C;
      if (t !== "json") return null;
    }
    if (typeof context[key] === 'object') {
      return context[key] instanceof Array ? ContentContainers.array : ContentContainers.map;
    }
    return null;
  });

  const expand = createExpand();
  const openContextMenu = createContextMenuCallback(remove,
    (<MVInputDef>template)?.default ? () => { context[key] = (<MVInputDef>template)?.default! } : undefined);
</script>

<template lang="pug">
  div.metadata-property
    div.metadata-property-key(class="{template ? 'mv-bound-key' : 'mv-free-key'}")
      div.metadata-property-icon(
        bind:this="{expand.icon}"
        onclick!="{expand.toggle}"
        style:opacity="{Contents ? 1 : 0}"
      )

      span.metadata-property-icon(bind:this="{icon}" onclick="{openContextMenu}")
      +startif('template')
        label.mv-typed-key(for="{key}") {key}
      +else
        EditableKey({context} {key})
      +endif
    div.metadata-property-value
      +startif('inputType === "input"')
        InputValue(name="{key}" type="{template.type}" bind:value="{context[key]}")
      +elseif('inputType === "link"')
        LinkValue(name="{key}" bind:value="{context[key]}" target="{template.target}")
      +elseif('inputType === "select"')
        SelectValue(
          name="{key}"
          bind:value="{context[key]}"
          options="{template.options}"
          multiple="{template.type === 'multi'}"
        )
      +else
        JsonValue(bind:value="{context[key]}" editable!="{!template || template.type === 'json'}")
      +endif

  +if("expand.open && Contents") 
    Contents({template} bind:data="{context[key]}")
</template>

<style lang="sass">
  .mv-bound-key
    flex: 0 0 auto

  .mv-free-key
    flex: 0 0 min-content !important
    
</style>