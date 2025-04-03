<script lang="ts">
  let {
    name,
    options,
    template,
    value = $bindable(),
  } : {
    name?: string
    options?: string[]
    template?: MVSelectDef
    value: any,
  } = $props();

  if (!options) options = template?.options || [];
  if (!value) value = '';
</script>

<template lang="pug">
  select.dropdown(name="{name}" bind:value="{value}")
    option(value="" disabled selected hidden) Select an option...
    +each('options as option')
      option(value="{option}") {option}
</template>

<style lang="sass">
</style>