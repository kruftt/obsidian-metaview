<script lang='ts'>
  import { blurOnEnter } from "../events";
  import Input from "../values/InputValue.svelte";

  let { template } : { template: MVSelectDef } = $props();
  
  let options: string[] = $state(template.options || []);

  function updateTemplate(e: Event) {
    const target = <HTMLInputElement>e.target;
    const value = target.value;
    if (value) {
      options.push(value);
      template.options = options;
      target.value = '';
    }
  }
</script>

<template lang='pug'>
  div.mv-content-container Options:
    +each('template.options as option, i')    
      div.mv-metadata-property-option
        div.mv-metadata-options-spacer
        span(onclick!="{() => template.options.splice(i, 1)}") x
        Input(
          type="text"
          bind:value="{template.options[i]}"
        )
    
    input(
      type="text"
      onkeypress="{blurOnEnter}"
      onblur="{updateTemplate}"
    )
</template>

<style lang='sass'>
</style>