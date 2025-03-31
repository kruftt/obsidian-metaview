<script lang='ts'>
  import TemplateProp from "../TemplateProp.svelte";
  import NewKey from "../keys/NewKey.svelte";
  let { template } : { template: MVCollectionDef } = $props();
</script>

<template lang='pug'>
  div.mv-content-container
    div.mv-metadata-property-option
      div.mv-metadata-options-spacer
        +startif('template.type === "array"')
          TemplateProp(
            context="{template}"
            key="elementType"
          )
        +elseif('template.type === "map"')
          TemplateProp(
            context="{template}"
            key="elementType"
            editable
          )
        +elseif('template.type === "tuple"')
          +each('template.elementTypes as type, i')
            TemplateProp(
              context="{template.elementTypes}"
              key="{i}"
              remove!="{() => template.elementTypes.splice(i, 1)}"
            )
          
          div.metadata-property
            div.metadata-property-key(
              onclick!="{() => template.elementTypes.push({ type: 'text' })}"
            ) Add Entry

        +else
          +each('Object.keys(template.entries) as key')
            TemplateProp(
              context="{template.entries}"
              key="{key}"
              editable
            )
          div.metadata-property
            NewKey(
              context="{template.entries}"
              value="{{ type: 'text' }}"
            )
        +endif

</template>

<style lang='sass'>
</style>