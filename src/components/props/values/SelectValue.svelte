<script lang="ts">
import { getStore } from "data/store.svelte";

const store = getStore();

let {
	name,
	options,
	template,
	value = $bindable(),
}: {
	name?: string;
	options?: string[];
	template?: MVSelectDef;
	// biome-ignore lint/suspicious/noExplicitAny: bound value may be undefined (e.g. an unset link target)
	value: any;
} = $props();

let resolvedOptions = $derived(options ?? template?.options ?? []);
if (!value) value = "";
</script>

<select class="dropdown" name={name} bind:value={value} onchange={() => store.commit()}>
  <option value="" disabled selected hidden>Select an option...</option>
  {#each resolvedOptions as option}
    <option value={option}>{option}</option>
  {/each}
</select>

<style lang="sass">
</style>