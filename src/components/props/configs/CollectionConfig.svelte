<script lang='ts'>
  import TemplateProp from "../TemplateProp.svelte";
  import NewKey from "../keys/NewKey.svelte";
  let { template } : { template: MVCollectionDef } = $props();
</script>

<div class="mv-content-container">
  <div class="mv-metadata-property-option">
    <div class="mv-metadata-options-spacer">
      {#if template.type === "array"}
        <TemplateProp context={template} key="elementType" />
      {:else if template.type === "map"}
        <TemplateProp context={template} key="elementType" />
      {:else if template.type === "tuple"}
        {#each template.elementTypes as type, i}
          <TemplateProp
            context={template.elementTypes}
            key={i}
            remove={() => template.elementTypes.splice(i, 1)}
          />
        {/each}
        <div class="metadata-property">
          <div class="metadata-property-key" onclick={() => template.elementTypes.push({ type: 'text' })}>Add Entry</div>
        </div>
      {:else}
        {#each Object.keys(template.entries) as key}
          <TemplateProp context={template.entries} key={key} editable />
        {/each}
        <div class="metadata-property">
          <NewKey context={template.entries} value={{ type: 'text' }} />
        </div>
      {/if}
    </div>
  </div>
</div>

<style lang='sass'>
</style>