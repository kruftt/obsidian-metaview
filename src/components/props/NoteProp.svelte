<script lang="ts">
  import { setIcon } from 'obsidian';
  import { blurOnEnter, createContextMenuCallback } from './events';
  import { TYPE_ICONS } from 'const';
  import Values from './values'
  import ContentContainers from './contents'
  import EditableKey from './keys/EditableKey.svelte';
  import StaticKey from './keys/StaticKey.svelte';
  import createExpand from 'components/expand.svelte';

  let { context, key, remove = () => delete context[key], template } : {
    context: FrontMatter
    key: string
    remove?: () => void
    template?: MVPropDef
  } = $props();

  let icon!: HTMLElement;
  $effect(() => setIcon(icon, TYPE_ICONS[template?.type || 'json']));

  let Value = $derived(Values[template?.type || '']);
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
      +startif('template')
        StaticKey({key})
      +else
        EditableKey({context} {key})
      +endif
    div.metadata-property-value
      div.metadata-property-icon(bind:this="{icon}" onclick="{openContextMenu}")
      Value({template} name="{key}" bind:value="{context[key]}")

  +if("expand.open && Contents") 
    Contents({template} bind:data="{context[key]}")
</template>

<style lang="sass">
  .mv-bound-key
    flex: 0 0 auto

  .mv-free-key
    flex: 0 0 min-content !important
</style>