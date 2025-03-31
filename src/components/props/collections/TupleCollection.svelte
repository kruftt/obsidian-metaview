<script lang='ts'>
  console.log('TupleCollection');
  import NoteProp from "../NoteProp.svelte";
  let { data = $bindable(), template } : {
    data: FrontMatterValue[]
    template: MVTupleDef
  } = $props();

  
  if (!data || !(data instanceof Array)) data = [];
  const types = template.elementTypes;
</script>

<template lang='pug'>
  div.mv-content-container
    +each('types as t, i')
      NoteProp(
        context="{ data }"
        key="{ i }"
        template="{ t }"
      )
</template>

<style lang='sass'>
</style>