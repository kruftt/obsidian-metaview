<script lang="ts">
  let {
    name,
    options = [],
    value = $bindable(),
    values = options,
    multiple
  } : {
    name?: string,
    options: string[],
    value: any,
    values: any[],
    multiple: boolean
  } = $props();

  if (!value) value = multiple ? [] : '';
</script>

<template lang="pug">
  +startif('multiple')
    select.dropdown(name="{name}" bind:value="{value}" multiple)
      option(value="" disabled selected hidden) Select an option...
      +each('options as option, i')
        option(value="{values[i]}") {option}
  +else
    select.dropdown(name="{name}" bind:value="{value}")
      option(value="" disabled selected hidden) Select an option...
      +each('options as option, i')
        option(value="{values[i]}") {option}
  +endif
</template>

<style lang="sass">
</style>