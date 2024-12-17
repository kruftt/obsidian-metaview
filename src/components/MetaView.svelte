<script lang="ts">
  import store from '../store.svelte';
  import FileProp from './FileProp.svelte';
  import JsonProp from './props/JsonProp.svelte';
</script>

<template lang='pug'>
  div.meta-view
    div meta-view
    
    +if ('store.data === null')
      div no active file

      +else
        FileProp(key="aliases", entries="{store.data.aliases}")
        FileProp(key="tags", entries="{store.data.tags}")
        FileProp(key="types", entries="{store.data.types}")

        +if ('store.data.defs')
          span config panel
          
          +else
            +each('store.data.freeProps as key')
              JsonProp({key}, state="{store.data.props}")
</template>

<style lang='sass' scoped>
  // :global(.view-content:has(> div.meta-view))
  //   padding: 0

  .meta-view 
    padding: 0.2em 0.2em 0.2em 0.4em
</style>