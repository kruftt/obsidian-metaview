<script lang='ts'>
  import store from "data/store.svelte";
  import Select from "../values/SelectValue.svelte";
  
  let { template } : { template: MVLinkDef } = $props();
</script>

<template lang='pug'>
  div.mv-content-container
    div.mv-metadata-property-option
      div.mv-metadata-options-spacer
      label(for="target") target:
      Select(
        name="target"
        bind:value="{template.target}"
        options="{Object.keys(store.templates)}"
      )
</template>

<style lang='sass'>
</style>