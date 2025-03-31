<script lang='ts'>
  import { OPTIONS_TYPES } from "const";
  import Input from "../values/InputValue.svelte";
  
  let { template } : { template: MVInputDef } = $props();

  let options = $derived(OPTIONS_TYPES[<keyof typeof OPTIONS_TYPES>template.type]);
</script>

<template lang='pug'>
  div.mv-content-container
    +each("options as option")
      div.mv-metadata-property-option
        div.mv-metadata-options-spacer
        label(for="{option.name}") {option.name}:
        Input(
          name="{option.name}"
          type="{option.type}"
          bind:value="{template[option.name]}"
        )
</template>

<style lang='sass'>
</style>