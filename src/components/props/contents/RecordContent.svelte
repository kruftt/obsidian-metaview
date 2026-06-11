<script lang='ts'>
import NoteProp from "../NoteProp.svelte";
let {
	data = $bindable(),
	template,
}: {
	data: Record<string, FrontMatterValue>;
	template: MVRecordDef;
} = $props();

if (!data || typeof data !== "object") data = {};
let entries = $derived(template.entries);
</script>

<div class="mv-content-container">
  {#each Object.entries(entries) as [key, entry]}
    <NoteProp context={data} template={entry} key={key} />
  {/each}
</div>

<style lang='sass'>
</style>