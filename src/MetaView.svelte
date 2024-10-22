<script lang="ts">
  import fileStore from './fileStore';
  import JsonProp from './props/JsonProp.svelte';
  import components from './props'
  
  let fileData: MVFileData | null;
  fileStore.subscribe((d) => { fileData = d; });

  // console.log('props', props);
  // console.log('boolean', props.boolean);
</script>

<template lang='pug'>
  div.meta-view
    +if('fileData === null')
      div no file
      +else
        div.metadata-properties { fileData.name }
        
        +each('Object.entries(fileData.props) as [key, value]')
          JsonProp(address="{[key]}", {value})
        
        +each('Object.entries(fileData.typeData) as [name, props]')
          div
            b { name }
          +each('Object.entries(props) as [key, data]')
            svelte:component(this="{components[data.def.type]}", address="{[key]}", {data})
    
</template>

<style lang='sass' scoped>
  // :global(.view-content:has(> div.meta-view))
  //   padding: 0

  .meta-view 
    padding: 0.2em 0.2em 0.2em 0.4em
</style>