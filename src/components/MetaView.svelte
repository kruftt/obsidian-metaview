<script lang="ts">
  import store from '../store.svelte';
  import TemplateData from 'src/TemplateData.svelte';
  import NoteData from 'src/NoteData.svelte';
  // import FileProp from './FileProp.svelte';
  // import TemplateProp from './TemplateProp.svelte';
  import NoteProp from './NoteProp.svelte';

  let data = $derived(store.data);
  let props = $derived(data ? data.props : null);
  let filename = $derived(store.file ? store.file.name : '');

  const freeTemplate = { type: 'json', default: '' };

  // $derived(data && store.sync());

  $effect(() => {
    console.log('change');
    if (data !== null) {
      console.log('sync');
      store.sync();
    }
  });

  // split into EmptyView, NoteView, TemplateView
  // each with their own sync effect?
</script>

<template lang='pug'>
  div.metadata-container 
    +startif('data === null')
      div (No file)

    +else
      div { filename }

      div.metadata-content
        div.metadata-file-props
          //-     FileProp(key="aliases", entries="{data.aliases}")
          //-     FileProp(key="tags", entries="{data.tags}")
          //-     FileProp(key="types", entries="{data.types}")
            
          //- +startif("data instanceof TemplateData")
          //-     +each("Object.keys(props) as key (key)")
          //-       TemplateProp({key} context="{props}")
          //-     TemplateProp(context="{props}")
          div template
          //- +else
          
        +startif("data instanceof NoteData")
          +each("data.freeProps as key")
            NoteProp({key} context="{props}")
            //-     +each("Object.entries(data.typeData) as [name, typeData]")
            //-       div.metadata-properties-title {name}

            //-       +each("Object.entries(typeData.props) as [key, template]")
            //-         NoteProp({key} {template} context="{props}")
        +endif
    +endif
</template>

<style lang='sass' scoped>
  * :global
    .metadata-properties-title
      margin: 1.0em 0 0 0.5em

    .metadata-property
      div
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

  .metadata-file-props
    margin-bottom: 4px
</style>