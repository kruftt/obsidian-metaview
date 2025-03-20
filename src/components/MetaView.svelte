<script lang="ts">
  import store from '../data/store.svelte';
  import TemplateData from 'data/TemplateData.svelte';
  import NoteData from 'data/NoteData.svelte';
  import NullView from './NullView.svelte';
  import NoteView from './NoteView.svelte';
  import TemplateView from './TemplateView.svelte';

  let data = $derived(store.data);
  let filename = $derived(store.file ? store.file.name : '');
  const freeTemplate = { type: 'json', default: '' };

  $effect(() => store.sync());
</script>

<template lang='pug'>
  div.metadata-container 
    +startif('data === null')
      NullView

    +else
      div { filename }
      +startif("data instanceof NoteData")
        NoteView({data})
      +else
        TemplateView({data})
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

  .mv-metadata-file-props
    margin-bottom: 4px
</style>