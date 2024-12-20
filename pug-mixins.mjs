export default `
mixin startif(condition)
  | {#if !{condition}}
  block

mixin endif
  | {/if}

mixin metadataProperty(key)
  div.metadata-property
    div.metadata-property-key
      input.metadata-property-key-input(value="{key}")
    div.metadata-property-value
      block
`