<script lang="ts">
  import TemplateData from 'src/TemplateData.svelte';
  import store from '../store.svelte';
  import FileProp from './FileProp.svelte';
  import JsonProp from './props/JsonProp.svelte';
</script>

<template lang='pug'>
  div.meta-view
    div meta-view
    
    +startif('store.data === null')
      div no active file

    +else
      FileProp(key="aliases", entries="{store.data.aliases}")
      FileProp(key="tags", entries="{store.data.tags}")
      FileProp(key="types", entries="{store.data.types}")

      +startif('store.data instanceof TemplateData')
        div config panel
        
      +else
        +each('store.data.freeProps as key')
          JsonProp({key}, state="{store.data.props}")

        //- +each('store.data.typeData.entries() as [type, data]')
        //-   div {type}
        //-   +each('Object.entries(data.props) as [key, def]')
        //-     JsonProp({key}, state="{store.data.props}" template="{def}")

        +each('Object.entries(store.data.typeData) as [name, data]')
          div {name}
          +each('Object.entries(data.props) as [key, def]')
            JsonProp({key}, state="{store.data.props}" template="{def}")

      +endif
    +endif
</template>

<style lang='sass' scoped>
  // :global(.view-content:has(> div.meta-view))
  //   padding: 0

  .meta-view 
    padding: 0.2em 0.2em 0.2em 0.4em
</style>