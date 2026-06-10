<script lang='ts'>
  import NoteProp from "../NoteProp.svelte";
  import { createValue } from "utils";
  import NewKey from "../keys/NewKey.svelte"

  let { data = $bindable(), template } : {
    data: Record<string, FrontMatterValue>
    template?: MVMapDef
  } = $props();

  if (!data || typeof data !== 'object') data = {};
  const elementType = template?.elementType;
</script>

<div class="mv-content-container">
  {#each Object.keys(data) as key}
    <NoteProp context={data} template={elementType} key={key} editable />
  {/each}
  <div class="metadata-property">
    <NewKey context={data} value={createValue(elementType)} />
  </div>
</div>

<style lang='sass'>
</style>