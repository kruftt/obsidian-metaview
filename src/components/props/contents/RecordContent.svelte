<script lang='ts'>
  import NoteProp from "../NoteProp.svelte";
  let { data = $bindable(), template } : {
    data: Record<string, FrontMatterValue>
    template: MVRecordDef
  } = $props();

  if (!data || typeof data !== 'object') data = {};
  const entries = template.entries;  
</script>

<template lang='pug'>
  div.mv-content-container
    +each('Object.entries(entries) as [key, entry]')
      NoteProp(
        context="{ data }"
        template="{ entry }"
        key="{ key }"
      )
</template>

<style lang='sass'>
</style>