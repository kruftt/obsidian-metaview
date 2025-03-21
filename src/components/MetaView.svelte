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

  let data = $derived(store.data);
  let filename = $derived(store.file ? store.file.name : 'Awaiting file...');
  const freeTemplate = { type: 'json', default: '' };

  $effect(() => store.sync());

  let expanded = $state(true);
  let expandedIcon!: HTMLElement;
  

  console.log('initializing', expandedIcon);

  onMount(() => {
    console.log('mounted', expandedIcon);

    $effect(() => {
      console.log(expandedIcon);
      setIcon(expandedIcon, expanded ? 'chevron-down' : 'chevron-right')
    });
  });
</script>

<template lang='pug'>
  div.metadata-container 
    div.mv-metadata-filename(onclick!="{() => { expanded = !expanded; console.log(expandedIcon); }}")
      span.metadata-property-icon(bind:this="{expandedIcon}")
      | { filename }

    +if("data !== null")
      +if("expanded")
        div.mv-metadata-file-props
          FileProp(key="aliases", entries="{data.fileProps.aliases}")
          FileProp(key="tags", entries="{data.fileProps.tags}")
          FileProp(key="cssclasses", entries="{data.fileProps.cssclasses}")
          +if("data instanceof NoteData")
            FileProp(key="types", entries="{data.types}")

      div.metadata-content
        +startif("data instanceof NoteData")
          div note
          +each("data.freeProps as key")
            FreeProp({key} context="{data.props}")
            +each("Object.entries(data.typeData) as [name, typeData]")
              div.metadata-properties-title {name}
              +each("Object.entries(typeData.props) as [key, template]")
                TypedProp({key} {template} context="{data.props}")
        +else
          +each("Object.keys(data.props) as key (key)")
            TemplateProp({key} context="{data.props}")
        +endif
</template>

<style lang='sass' scoped>
  * :global
    .metadata-properties-title
      margin: 1.0em 0 0 0.5em
    
    .mv-metadata-filename
      display: flex
      align-items: center
      gap: 4px

      &:hover
        color: var(--text-normal)

    .metadata-property > div
      border: none

    .metadata-property-key
      min-width: var(--size-4-3)
      flex: 0 1.2 auto
        //- padding-bottom: 1px
  
    .mv-options-container
      display: flex
      flex-direction: column

    .mv-metadata-property-option
      display: flex
      margin-top: var(--size-4-1)
      font-size: var(--metadata-label-font-size)
      align-items: center
      gap: var(--size-4-2)

      label
        //- width: calc(var(--metadata-label-width) * 0.8)
        width: var(--size-4-16)
        text-align: right
        flex: 0 0 auto
      input
        flex: 1 1 auto
        min-width: 0

    .mv-metadata-options-spacer
      flex: 0 2 var(--size-4-4)

  .mv-metadata-file-props
    padding-bottom: 0.4em
    margin-bottom: 0.6em
    // border-bottom: var(--border-width) solid var(--background-modifier-border)
</style>