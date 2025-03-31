<script lang='ts'>
  import NoteProp from "../NoteProp.svelte";
  import { createValue } from "utils";
  
  let { data = $bindable(), template } : {
    data?: FrontMatterValue[]
    template?: MVArrayDef
  } = $props();

  if (!data || !(data instanceof Array)) data = [];
  const elementType = template?.elementType;
</script>

<template lang='pug'>
  div.mv-content-container
    +each('data as value, i')
      NoteProp(
        context="{data}"
        key="{ i }"
        template="{ elementType }"
      )
    div.metadata-property
      button(onclick!="{() => (data || (data = [])).push(createValue(elementType))}") Add Element
</template>

<style lang='sass'>
</style>