<script lang='ts'>
  import { blurOnEnter } from '../events';

  let input!: HTMLInputElement;
  export const clear = () => input.value = '';

  let { focus, key } : {
    focus?: () => void
    key: string
  } = $props();
</script>

<template lang='pug'>
  div.mv-typed-key(onclick="{focus}") {key}
</template>

<style lang='sass'>
</style>