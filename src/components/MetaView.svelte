<script lang="ts">
  import { setIcon } from 'obsidian';
  import { onMount } from 'svelte'

  import store from '../data/store.svelte';
  import TemplateData from 'data/TemplateData.svelte';
  import NoteData from 'data/NoteData.svelte';

  import FileProp from "./props/FileProp.svelte";
  import FreeProp from './props/FreeProp.svelte';
  import TypedProp from './props/TypedProp.svelte';
  import TemplateProp from './props/TemplateProp.svelte';

  $effect(() => store.sync());

  let data = $derived(store.data);
  let filename = $derived(store.file ? store.file.name : 'Awaiting file...');
  const freeTemplate = { type: 'json', default: '' };

  let expanded = $state(true);
  let expandedIcon!: HTMLElement;
  $effect(() => setIcon(expandedIcon, expanded ? 'chevron-down' : 'chevron-right'));
</script>

<template lang='pug'>
  div.metadata-container 
    div.mv-filename(onclick!="{() => { expanded = !expanded; console.log(expandedIcon); }}")
      span.metadata-property-icon(bind:this="{expandedIcon}")
      | { filename }

    +if("data !== null")
      div.mv-metadata-file-props
        +if("expanded")
          FileProp(key="aliases", entries="{data.fileProps.aliases}")
          FileProp(key="tags", entries="{data.fileProps.tags}")
          FileProp(key="cssclasses", entries="{data.fileProps.cssclasses}")
        +if("data instanceof NoteData")
          FileProp(key="types", entries="{data.types}")

      div.metadata-content
        +startif("data instanceof NoteData")
          +each("data.freeProps as key")
            FreeProp({key} context="{data.props}")
          +each("Object.entries(data.typeData) as [name, typeData]")
            div.mv-properties-title {name}
            +each("Object.entries(typeData.props) as [key, template]")
              TypedProp({key} {template} context="{data.props}")
        +else
          +each("Object.keys(data.props) as key (key)")
            TemplateProp({key} context="{data.props}")
          TemplateProp(context="{data.props}")
        +endif
</template>

<style lang='sass' scoped>
  .mv-filename
    display: flex
    align-items: center
    gap: 4px

    &:hover
      color: var(--text-normal)

  
  // .mv-types-prop
  //   border-top: var(--border-width) solid var(--metadata-divider-color)

  .mv-metadata-file-props
    padding-bottom: 0.4em
    margin-bottom: 0.6em
    border-bottom: var(--border-width) solid var(--metadata-divider-color)
    // background-color: var(--metadata-label-background-active)
    // box-shadow: -0.1em -0.2em #0006 inset
    // border-bottom-left-radius: 0.5em
    // border-bottom-right-radius: 0.5em

  * :global
          
    select
      flex-grow: 1
      border: none
      &:focus
        box-shadow: none

    .metadata-property
      // padding: var(--size-4-1) 0
      margin: var(--size-4-1) 0
      border: none
    
    .metadata-property-key
      border: none
      font-size: var(--metadata-label-font-size)
      font-weight: var(--metadata-label-font-weight)
      // background-color: #522
    
    .metadata-property-key-input
      margin: 0 var(--size-4-1)
  
    .metadata-property-value
      border: none
      // background-color: #255

    .metadata-property-value-input
      // border: none
      width: 100%

    .mv-properties-title
      margin: 1.0em 0 0.4em 0.5em

    .mv-value-wrapper
      display: flex
      align-items: center
      flex: 1 1 auto
      padding-left: var(--size-4-1)

    input.metadata-property-value-input
      border-radius: var(--input-radius)

</style>