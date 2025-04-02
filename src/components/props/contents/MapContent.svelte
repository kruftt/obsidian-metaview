<script lang='ts'>
  import NoteProp from "../NoteProp.svelte";
  import { createValue } from "utils";
  import NewKey from "../keys/NewKey.svelte"

  let { data = $bindable(), template } : {
    data: Record<string, FrontMatterValue>
    template?: MVMapDef
  } = $props();

  if (!data || typeof data !== 'object') data = {};
  const elementType = template?.elementType;
</script>

<template lang='pug'>
  div.mv-content-container
    +each('Object.keys(data) as key')
      NoteProp(
        context="{data}"
        template="{ elementType }"
        key="{ key }"
      )
    div.metadata-property
      NewKey(
        context="{data}"
        value="{createValue(elementType)}"
      )
</template>

<style lang='sass'>
</style>