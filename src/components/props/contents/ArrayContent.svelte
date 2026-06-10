<script lang='ts'>
  import NoteProp from "../NoteProp.svelte";
  import { createValue } from "utils";
  
  let { data = $bindable(), template } : {
    data?: FrontMatterValue[]
    template?: MVArrayDef | MVJsonDef
  } = $props();

  if (!data || !(data instanceof Array)) data = [];
  const elementType = template?.type !== 'json' ? template?.elementType : template;
</script>

<template lang='pug'>
  div.mv-content-container
    +each('data as value, i')
      NoteProp(
        context="{data}"
        key="{ i }"
        template="{ elementType }"
        remove!="{() => data.splice(i, 1)}"
      )
    div.metadata-property
      div.mv-add-element(onclick!="{() => (data || (data = [])).push(createValue(elementType))}")
        div [+] Add Element
</template>

<style lang='sass'>
  .mv-add-element
    color: var(--text-muted)
    font-size: var(--metadata-label-font-size)
    font-weight: var(--metadata-label-font-weight)
    height: var(--input-height)
    width: 100%
    display: flex
    align-items: center
    padding-left: var(--size-4-6)

    &:hover
      color: var(--text-normal)
</style>