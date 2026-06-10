<script lang='ts'>
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
  .mv-bound-key
    min-width: calc(var(--metadata-label-width) * 0.6)
    flex: 0 0 min-content !important
</style>