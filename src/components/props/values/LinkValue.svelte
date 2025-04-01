<script lang="ts">
  import store from 'data/store.svelte'
  let {
    name,
    target = '',
    value = $bindable()
  } : {
    name?: string,
    target: string
    value: any,
  } = $props();

  if (!value) value = '';
  const options = store.getNotesByType(target);
</script>

<template lang="pug">
  select.dropdown(name="{name}" bind:value="{value}")
    option(value="" disabled selected hidden) Select an option...
    +each('options as option')
      option(value="{option}") {option}
</template>

<style lang="sass">
</style>