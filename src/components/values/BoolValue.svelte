<script lang="ts">
  let { value = $bindable() } : { value: boolean } = $props();
</script>

<template lang="pug">
  input(
    type="checkbox"
    bind:checked="{ value }"
  )
</template>

<style scoped lang="sass">
  
</style>
