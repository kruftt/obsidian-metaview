<script lang="ts">
  import { setIcon } from 'obsidian';
  import { blurOnEnter, createContextMenuCallback } from './events';
  import { INPUT_TYPES, TYPE_ICONS } from 'const';
  import InputValue from './values/InputValue.svelte';
  import LinkValue from './values/LinkValue.svelte';
  import JsonValue from './values/JsonValue.svelte';
  import SelectValue from './values/SelectValue.svelte';
  import Collections from './collections'
  import EditableKey from './keys/EditableKey.svelte';

  let { context, key, remove = () => delete context[key], template } : {
    context: FrontMatter
    key: string
    remove?: () => void
    template?: MVPropDef
  } = $props();

  let icon!: HTMLElement;
  $effect(() => setIcon(icon, TYPE_ICONS[template?.type || 'json']));

  let inputType = $derived(INPUT_TYPES[template?.type || '']);
  let Collection = $derived.by(() => {
    if (template) {
      const t = template.type;
      const C = Collections[<keyof typeof Collections>t];
      if (C) return C;
      if (t !== "json") return null;
    }
    if (typeof context[key] === 'object') {
      return context[key] instanceof Array ? Collections.array : Collections.map;
    }
    return null;
  });

  const openContextMenu = createContextMenuCallback(remove,
    (<MVInputDef>template)?.default ? () => { context[key] = (<MVInputDef>template)?.default! } : undefined);
</script>

<template lang="pug">
  div.metadata-property
    div.metadata-property-key
      span.metadata-property-icon(bind:this="{icon}" onclick="{openContextMenu}")
      +startif('template')
        label(name="{key}") {key}
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
        JsonValue(bind:value="{context[key]}")
      +endif

  +if("Collection") 
    Collection({template} bind:data="{context[key]}")
</template>

<style lang="sass">
  .mv-typed-key
    padding-left: 0.1em
    align-items: center
    flex: 0 0 auto
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