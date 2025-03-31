<script lang="ts">
  let {
    name,
    value = $bindable(),
    options = [],
    multiple
  } : {
    name?: string,
    value: any,
    options: string[],
    multiple: boolean
  } = $props();

  if (!value) value = multiple ? [] : '';
</script>

<template lang="pug">
  +startif('multiple')
    select.dropdown(name="{name}" bind:value="{value}" multiple)
      option(value="" disabled selected hidden) Select an option...
      +each('options as option')
        option(value="{option}") {option}
  +else
    select.dropdown(name="{name}" bind:value="{value}")
        option(value="" disabled selected hidden) Select an option...
        +each('options as option')
          option(value="{option}") {option}
  +endif
</template>

<style lang="sass">
</style>