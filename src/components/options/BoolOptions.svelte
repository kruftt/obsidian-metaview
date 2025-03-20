<script lang="ts">
  let { template }: { template: MVBoolDef } = $props();
</script>

<template lang="pug">
  div.mv-options-container
    div.mv-metadata-property-option
      div.mv-metadata-options-spacer
      label(for="default") default:
      input(
        name="default"
        type="checkbox"
        bind:checked="{template.default}"
        style="flex: 0 0 auto"
      )
</template>
