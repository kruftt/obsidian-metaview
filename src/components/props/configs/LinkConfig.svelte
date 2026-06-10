<script lang='ts'>
  import store from "data/store.svelte";
  import Select from "../values/SelectValue.svelte";
  
  let { template } : { template: MVLinkDef } = $props();
</script>

<div class="mv-content-container">
  <div class="mv-metadata-property-option">
    <div class="mv-metadata-options-spacer"></div>
    <label for="target">target:</label>
    <Select name="target" bind:value={template.target} options={Object.keys(store.templates)} />
  </div>
</div>

<style lang='sass'>
</style>