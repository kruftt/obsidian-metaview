<script lang="ts">
  import store from '../store.svelte';
  import ConfigPanel from './ConfigPanel.svelte';
  import NotePanel from './NotePanel.svelte';
  
  let data: MVFileData | null = $state.raw(null);
  store.subscribe((d) => data = d);
</script>

<template lang='pug'>
  div.meta-view
    div meta-view
    +if ('data === null')
      div no file
      +else
        //- 
        +if ('data.defs')
          //- ConfigPanel({data})
          span config panel
          //- +each ("Object.entries(data.defs) as [key, def]")
            //- ConfigProp(address="{key}", {key}, {def})
          +else
            //- NotePanel({data})
            div
              span note panel
              //- +each('Object.entries(data.props) as [key, value]')
              //-   JsonProp(address="{key}", {key}, {value})
</template>

<style lang='sass' scoped>
  // :global(.view-content:has(> div.meta-view))
  //   padding: 0

  .meta-view 
    padding: 0.2em 0.2em 0.2em 0.4em
</style>