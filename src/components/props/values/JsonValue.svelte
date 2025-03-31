<script lang="ts">
  import { blurOnEnter } from '../events';

  let { value = $bindable() } : { value: any } = $props();
  let stringifiedValue = $derived(JSON.stringify(value).replace(/^"|"$/g, ''));
  
  function updateValue(e: FocusEvent) {
    const target = <HTMLInputElement>e.target;
    const text = target.value;
    
    try {
      const newValue = JSON.parse(text);
      value = newValue;
    } catch (e) {
      if (e instanceof SyntaxError) {
        value = text;
      } else throw(e);
    }
    target.value = stringifiedValue;
  }
</script>

<template lang="pug">
  input.metadata-property-value-input(
    value="{stringifiedValue}"
    onkeypress="{blurOnEnter}"
    onblur="{updateValue}"
    type="text"
  )
</template>

<style lang="sass" scoped>
</style>