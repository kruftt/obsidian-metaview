<script lang="ts">
  let { value = $bindable() } : { value: boolean } = $props();
</script>

<template lang="pug">
  div.mv-value-wrapper
    input(
      type="checkbox"
      bind:checked="{ value }"
    )
</template>

<style scoped lang="sass">
  
</style>
