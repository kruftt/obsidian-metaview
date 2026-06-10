<script lang='ts'>
  import { OPTIONS_TYPES } from "const";
  import InputValue from "../values/InputValue.svelte";

  let { template } : { template: MVInputDef | MVJsonDef } = $props();

  let options = $derived(OPTIONS_TYPES[<keyof typeof OPTIONS_TYPES>template.type]);
  let inputProps = $state<Record<string, FrontMatterValue | null | undefined>>(
    template.type === 'json' ? {} : ((template.props ??= {}) as Record<string, FrontMatterValue | null | undefined>)
  );
  let valueTemplate = $derived({ type: template.type === 'json' ? 'text' : template.type } as MVInputDef);
</script>

<div class="mv-content-container">
  <div class="mv-metadata-property-option">
    <div class="mv-metadata-options-spacer"></div>
    <label for="default">default:</label>
    <InputValue template={valueTemplate} name="default" bind:value={template.default} />
  </div>
  {#each options as option}
    <div class="mv-metadata-property-option">
      <div class="mv-metadata-options-spacer"></div>
      <label for={option.name}>{option.name}:</label>
      <InputValue name={option.name} template={{ type: option.type } as MVInputDef} bind:value={inputProps[option.name]} />
    </div>
  {/each}
</div>

<style lang='sass'>
</style>