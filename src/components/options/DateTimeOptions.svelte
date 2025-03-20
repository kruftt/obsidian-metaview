<script lang="ts">
  let { template }: { template: MVTextDef } = $props();
</script>

<template lang="pug">
  div.mv-options-container
    div.mv-metadata-property-option
      div.mv-metadata-options-spacer
      label(for="default") default:
      input(
        name="default"
        type="{template.type}"
        bind:value="{template.default}"
      )
    div.mv-metadata-property-option
      div.mv-metadata-options-spacer
      label(for="min") min:
      input(
        name="min"
        type="{template.type}"
        bind:value="{template.min}"
      )
    div.mv-metadata-property-option
      div.mv-metadata-options-spacer
      label(for="max") max:
      input(
        name="max"
        type="{template.type}"
        bind:value="{template.max}"
      )
    div.mv-metadata-property-option
      div.mv-metadata-options-spacer
      label(for="step") step:
      input(
        name="step"
        type="number"
        bind:value="{template.step}"
      )
</template>
