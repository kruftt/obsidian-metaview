<script lang='ts'>
  let { data = $bindable(), template } : {
    data: unknown
    template: MVSelectMultiDef
  } = $props();

  if (!(data instanceof Array)) data = [];
</script>

<template lang='pug'>
  div.mv-content-container
    select.multi(name="{name}" bind:value="{data}" multiple)
      option(value="" disabled selected hidden) Select an option...
      +each('template.options as option')
        option(value="{option}") {option}
</template>

<style lang='sass'>
  .multi
    height: auto
    width: 100%

    option
      
</style>