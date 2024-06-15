<script lang="ts">
	import { DataviewApi } from 'obsidian-dataview';
  import { updateField } from '../store';
  import MetadataProp from './MetadataProp.svelte';

  export let fileData: MDV_File;
    
  let types: string[];
  let tags: string[];
  let inlineTags: InlineTagData[];
  let propGroups: MDV_PropGroup[];
  let freelinks: LinkCache[];
  let backlinks: BacklinkData[];
  let embeds: EmbedData[];
  
  $: ({ types, tags, inlineTags, propGroups, freelinks, backlinks, embeds } = fileData);
</script>

<template lang="pug">
  div(class='metadata-view')
    div { types }
    div { tags }

    +each('propGroups as propGroup')
      div(class="section_header")
        div 
          b { propGroup.name }
        +each('propGroup.props as prop')
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