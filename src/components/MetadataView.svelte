<script lang="ts">
	import { DataviewApi } from 'obsidian-dataview';
  import { updateField } from '../store';
  import {
    MetadataField,
    MetadataLink,
    MetadataEmbed,
  } from './properties';

  export let fileData: FileData;
    
  let fileClassAlias: string | undefined;
  let fileClassField: FieldData | undefined;
  let fields: FieldData[];
  let classData: FileClassData[];
  let links: InlineLinkData[];
  let backlinks: InlineLinkData[];
  let embeds: EmbedData[];
  
  $: ({ fileClassAlias, fileClassField, fields, classData, links, backlinks, embeds } = fileData);
</script>

<template lang="pug">
  div(class='metadata-view')
    +if('fileClassAlias')
      div(class='classlist')
        +if('fileClassField')
          MetadataField(type='Multi' data="{fileClassField}")
          +else()
            div(class='classlist__bar' on:click!="{() => updateField(fileClassAlias, '')}")
              | Add {fileClassAlias}
        
    div(class="section_header")
      div 
        b Fields
      +each('fields as fieldData')
        MetadataField(data='{fieldData}')
    br/

    +each('classData as data')
      div(class="section_header")
        div 
          b { data.name.replace() }
        +each('data.fields as fieldData')
          MetadataField(data='{fieldData}')
      br/
    
    div(class="section_header")
      div 
        b Links
      +each('links as link')
        MetadataLink(data='{link}')
    br/

    div(class="section_header")
      div 
        b Backlinks
      +each('backlinks as link')
        MetadataLink( data='{link}' backlink=true)
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