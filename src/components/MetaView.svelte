<script lang="ts">
  import { setIcon } from 'obsidian';
  import { onMount } from 'svelte'

  import store from '../data/store.svelte';
  import TemplateData from 'data/TemplateData.svelte';
  import NoteData from 'data/NoteData.svelte';

  import FileProp from "./props/FileProp.svelte";
  import NoteProp from './props/NoteProp.svelte';
  import TemplateProp from './props/TemplateProp.svelte';
  import EditableKey from './props/keys/EditableKey.svelte';
  import NewKey from './props/keys/NewKey.svelte';
  import createExpand from './expand.svelte';
  
  $effect(() => store.sync());

  let data = $derived(store.data);
  let filename = $derived(store.file ? store.file.name : '');
  const freeTemplate = { type: 'json', default: '' };
  const expand = createExpand();

  function addTemplateProp(key: string, target: HTMLInputElement) {
    data!.props[key] = { type: 'text' };
  }
</script>

<template lang='pug'>
  div.metadata-container 
    +if("data !== null")
      div.mv-filename(onclick!="{expand.toggle}")
        span.metadata-property-icon(bind:this="{expand.icon}")
        | { filename }

      div.mv-metadata-file-props
        +if("expand.open")
          FileProp(key="aliases", entries="{data.fileProps.aliases}")
          FileProp(key="tags", entries="{data.fileProps.tags}")
          FileProp(key="cssclasses", entries="{data.fileProps.cssclasses}")
          +if("data instanceof NoteData")
            FileProp(key="types", entries="{data.types}")

      div.metadata-content
        +startif("data instanceof NoteData")
          +each("data.freeProps as key")
            NoteProp({key} context="{data.props}")
          div.metadata-property
            NewKey(context="{data.props}" value="''")
          +each("Object.entries(data.typeData) as [name, typeData]")
            div.mv-properties-title {name}
            +each("Object.entries(typeData.props) as [key, template]")
              NoteProp({key} {template} context="{data.props}")
        +else
          +each("Object.keys(data.props) as key (key)")
            TemplateProp({key} context="{data.props}" editable)
          div.metadata-property
            NewKey(context="{data.props}" value="{{ type: 'text' }}")
        +endif
</template>

<style lang='sass'>
  .mv-filename
    display: flex
    align-items: center
    gap: 4px

    &:hover
      color: var(--text-normal)

  .mv-metadata-file-props
    padding-bottom: 0.4em
    margin-bottom: 0.6em
    // border-bottom: var(--border-width) solid var(--metadata-divider-color)


  * :global
          
    select
      flex-grow: 1
      border: none
      &:focus
        box-shadow: none

    .metadata-property
      border: none
      margin: 0
      border-bottom: var(--border-width) solid var(--metadata-divider-color)
    
    .metadata-property-key
      border: none
      min-width: var(--metadata-label-width) 
      color: var(--metadata-label-text-color)
      font-size: var(--metadata-label-font-size)
      font-weight: var(--metadata-label-font-weight)
      margin-right: 0.2em
      padding-left: 0.1em
      align-items: center
      height: var(--input-height)
    
    .metadata-property-key-input
      margin: 0 var(--size-4-1)
  
    .metadata-property-value
      border: none

    .metadata-property-value-input
      width: 100%
      
    .metadata-property-value-input[type='checkbox']
      width: var(--checkbox-size)
      height: var(--checkbox-size)

    .mv-properties-title
      margin: 1.0em 0 0.4em 0.5em

    .mv-value-wrapper
      display: flex
      align-items: center
      flex: 1 1 auto
      padding-left: var(--size-4-1)

    input.metadata-property-value-input
      border-radius: var(--input-radius)
    
    .mv-content-container
      margin-left: var(--size-4-4)

    input
      background: var(--metadata-input-background)
      // color: var(--text-faint)
      font-variant-numeric: tabular-nums
      // border: none
      font-family: inherit
      outline: none

    input[type='month']
      border: none
      color: var(--text-normal)
      -webkit-app-region: no-drag
      position: relative
      padding: var(--size-4-1) var(--size-4-2)
      padding-inline-start: var(--size-4-6)
      &::-webkit-calendar-picker-indicator
        position: absolute
        left: var(--size-4-1)
        right: auto
        opacity: 0.5
    
    input[type='time']
      border: none
      color: var(--text-normal)
      -webkit-app-region: no-drag
      position: relative
      padding: var(--size-4-1) var(--size-4-2)
      padding-inline-start: var(--size-4-6)
      &::-webkit-calendar-picker-indicator
        position: absolute
        left: -5px
        right: auto
        opacity: 0.5
    
    .mv-content-container
      padding-bottom: var(--size-4-1)

    .mv-icon-tray
      display: flex
</style>
