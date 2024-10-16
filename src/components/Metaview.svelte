<script lang="ts">
  import fileStore from '../fileStore';
  import JsonProp from './JsonProp.svelte';
  
  let data: MVFileData | null;
  fileStore.subscribe((d) => { data = d; });
</script>

<template lang='pug'>
  div.meta-view
    +if('data === null')
      div no file
      +else
        div.metadata-properties { data.name }
        +each('Object.entries(data.props) as [key, value]')
          JsonProp(address="{[key]}", {value})
    
</template>

<style lang='sass' scoped>
  // :global(.view-content:has(> div.meta-view))
  //   padding: 0

  .meta-view 
    padding: 0.2em 0.2em 0.2em 0.4em
</style>