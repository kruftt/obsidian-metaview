<script lang='ts'>
  import { blurOnEnter } from '../events';

  let input!: HTMLInputElement;
  export const clear = () => input.value = '';

  let { context, key } : {
    context: Record<string, any>
    key: string
  } = $props();

  const setKey = (e: Event) => {
    const target = <HTMLInputElement>e.target;
    const newKey = target.value;
    if (!newKey || newKey === key) return;
    if (newKey in context) {
      target.value = key;
    } else {
      context[newKey] = context[key];
      delete context[key];
      key = newKey;
    }
  };
</script>

<template lang='pug'>
  input.metadata-property-key-input(
    bind:this="{input}"
    value="{key}"
    onkeypress="{blurOnEnter}"
    onblur!="{setKey}"
    placeholder="PropKey"
  )
</template>

<style lang='sass'>
</style>