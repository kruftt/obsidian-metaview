<script lang="ts">
  import { setIcon } from 'obsidian';
  import { blurOnEnter, createContextMenuCallback } from './events';
  import { makePropTemplate } from 'utils';
  import { PROPERTY_TYPES, TYPE_ICONS } from 'const';
  import StaticKey from './keys/StaticKey.svelte';
  import EditableKey from './keys/EditableKey.svelte';
  import SelectValue from './values/SelectValue.svelte';
  import Configs from './configs';
  import createExpand from 'components/expand.svelte';
  
  let { context, key, editable = false, remove = () => delete context[key] } : {
    context: Record<string, MVPropDef>,
    key: string,
    editable?: boolean,
    remove?: () => void
  } = $props();

  let template = $derived(context[key]);
  
  let typeIcon!: HTMLElement;
  $effect(() => setIcon(typeIcon, TYPE_ICONS[template.type]));
  
  const expand = createExpand();
  const openContextMenu = createContextMenuCallback(remove);

  let selectedType = $state(template.type);
  let Config = $derived(Configs[template.type]);
  $effect(() => { if (selectedType !== template.type) context[key] = makePropTemplate({ type: selectedType })! });
</script>

<template lang="pug">
  div.metadata-template-property
    div.metadata-property
      div.mv-icon-tray 
        div.metadata-property-icon(
          bind:this="{expand.icon}"
          onclick!="{expand.toggle}"
        )
        div.metadata-property-icon(
          bind:this="{typeIcon}"
          style:display="{key ? 'flex' : 'none'}"
          onclick="{openContextMenu}"
          oncontextmenu="{openContextMenu}"
        )
      div.metadata-property-key
        +startif("editable")
          EditableKey({context} {key})
        +else
          StaticKey({key})
        +endif      
      div.metadata-property-value
        SelectValue(bind:value="{selectedType}" options="{PROPERTY_TYPES}")
          
    +if('expand.open')
      Config({template})
</template>

<style scoped lang="sass">
  .mv-metadata-options-spacer
    flex: 0 2 var(--size-4-4)

  .metadata-property
    padding: 1px 0

  * :global
    .mv-content-container
      display: flex
      flex-direction: column

    .mv-metadata-property-option
      display: flex
      margin-top: var(--size-4-1)
      font-size: var(--metadata-label-font-size)
      align-items: center
      gap: var(--size-4-2)

      label
        width: var(--size-4-16)
        text-align: right
        flex: 0 0 auto
      
      input
        flex: 1 1 auto
        min-width: 0    
</style>