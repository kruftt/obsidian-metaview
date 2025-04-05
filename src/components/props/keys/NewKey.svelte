<script lang='ts'>
  import { blurOnEnter } from '../events';
  

  let { context, value } : {
    context: Record<string, any>
    value: any
  } = $props();

  const setKey = (e: Event) => {
    const target = <HTMLInputElement>e.target;
    const newKey = target.value;
    if (!newKey) return;
    if (!(newKey in context)) {
      context[newKey] = value;
    } 
    target.value = '';
  };
</script>

<template lang='pug'>
  input.metadata-property-key-input(
    onkeypress="{blurOnEnter}"
    onblur!="{setKey}"
    placeholder="Add Property"
  )
</template>

<style lang='sass'>
</style>