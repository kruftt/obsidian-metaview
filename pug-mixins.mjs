export default `
mixin startif(condition)
  | {#if !{condition}}
  block

mixin endif
  | {/if}
`