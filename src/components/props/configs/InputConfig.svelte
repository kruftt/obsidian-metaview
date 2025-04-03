<script lang='ts'>
  import { OPTIONS_TYPES } from "const";
  import InputValue from "../values/InputValue.svelte";

  let { template } : { template: MVInputDef } = $props();

  let options = $derived(OPTIONS_TYPES[<keyof typeof OPTIONS_TYPES>template.type]);
  let inputProps = $state(template.props || <MVInputDef["props"]>(template.props = {}));
</script>

<template lang='pug'>
  div.mv-content-container
    div.mv-metadata-property-option
      div.mv-metadata-options-spacer
      label(for="default") default:
      InputValue(
        template="{{ type: template.type }}"
        name="default"
        bind:value="{template.default}"
      )
    +each("options as option")
      div.mv-metadata-property-option
        div.mv-metadata-options-spacer
        label(for="{option.name}") {option.name}:
        InputValue(
          name="{option.name}"
          template="{option}"
          bind:value="{inputProps[option.name]}"
        )
</template>

<style lang='sass'>
</style>