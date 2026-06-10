<script lang="ts">
  import { setIcon } from 'obsidian';
  import { onMount } from 'svelte'

  import store from '../data/store.svelte';
  import TemplateData from 'data/TemplateData.svelte';
  import NoteData from 'data/NoteData.svelte';

  import FileProp from "./props/FileProp.svelte";
  import NoteProp from './props/NoteProp.svelte';
  import TemplateProp from './props/TemplateProp.svelte';
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
          FileProp(key="aliases", context="{data.fileProps}")
          FileProp(key="tags", context="{data.fileProps}")
          FileProp(key="cssclasses", context="{data.fileProps}")
          +if("data instanceof NoteData")
            FileProp(key="types", context="{data}")

      div.metadata-content
        +startif("data instanceof NoteData")
          +each("data.freeProps as key")
            NoteProp({key} context="{data.props}" editable)
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
    gap: var(--size-4-1)

    &:hover
      color: var(--text-normal)

  .mv-metadata-file-props
    padding-bottom: 0.4em
    margin-bottom: 0.6em
</style>
