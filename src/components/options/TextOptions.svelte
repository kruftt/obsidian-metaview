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
        type="text"
        bind:value="{template.default}"
      )
    div.mv-metadata-property-option
      div.mv-metadata-options-spacer
      label(for="minlength") minlength:
      input(
        name="minlength"
        type="text"
        bind:value="{template.minlength}"
      )
    div.mv-metadata-property-option
      div.mv-metadata-options-spacer
      label(for="maxlength") maxlength:
      input(
        name="maxlength"
        type="text"
        bind:value="{template.maxlength}"
      )
    div.mv-metadata-property-option
      div.mv-metadata-options-spacer
      label(for="pattern") pattern:
      input(
        name="pattern"
        type="text"
        bind:value="{template.pattern}"
      )
</template>
