<script lang="ts">
	import { DataviewApi } from 'obsidian-dataview';
  import { } from '../store';
  import MetadataProp from './MetadataProp.svelte';

  export let fileData: MV_FileData;
    
  let types: string[];
  let tags: string[];
  let aliases: string[];
  let cssclasses: string[];
  let inlineTags: InlineTagData[];
  let freeProps: MV_PropData[];
  let boundProps: MV_GroupData[];
  let freelinks: LinkCache[];
  let backlinks: BacklinkData[];
  let embeds: EmbedData[];
  
  $: ({ types, tags, aliases, cssclasses, inlineTags, freeProps, boundProps, freelinks, backlinks, embeds } = fileData);
</script>

<template lang="pug">
  div(class='metadata-view')
    h4 MetaView
    div { types }
    div { tags }

    div(class="section_header")
      +each('Object.values(freeProps) as prop')
        MetadataProp(data='{prop}')
    br/

    +each('boundProps as propGroup')
      div(class="section_header")
        div 
          b { propGroup.name }
        +each('Object.values(propGroup.props) as prop')
          MetadataProp(data='{prop}')
      br/
</template>

<style lang='stylus'>
  :global(.view-content:has(> div.metadata-view))
    padding: 0

  .metadata-view
    padding: 0

  .section_header
    color: #8AE;

  .classlist
    padding: 0.8em
    border-bottom: 1px solid var(--tab-outline-color)

  .classlist__bar
    margin: 0.8em
    display: flex
    width: 100%
    gap: 0.2em
    align-items: center
    flex-flow: row nowrap
    height: 1.6em
</style>