<script lang="ts">
import { blurOnEnter } from "../events";
import { getStore } from "data/store.svelte";

const store = getStore();

let {
	name,
	template,
	value = $bindable(),
}: {
	name: string;
	template?: MVJsonDef | MVCollectionDef | MVSelectMultiDef;
	value: FrontMatterValue;
} = $props();

let stringifiedValue = $derived(
	JSON.stringify(value || "").replace(/^"|"$/g, ""),
);
let editable = $derived(!template || template.type === "json");

function updateValue(e: FocusEvent) {
	const target = <HTMLInputElement>e.target;
	const text = target.value;

	try {
		const newValue = JSON.parse(text);
		value = newValue;
	} catch (e) {
		if (e instanceof SyntaxError) {
			value = text;
		} else throw e;
	}
	target.value = stringifiedValue;
	store.commit();
}
</script>

{#if editable}
  <input
    class="metadata-property-value-input"
    value={stringifiedValue}
    onkeypress={blurOnEnter}
    onblur={updateValue}
    type="text"
  />
{:else}
  <div class="mv-static-json">{stringifiedValue}</div>
{/if}

<style lang="sass" scoped>
  .mv-static-json
    color: var(--text-warning)
    font-size: var(--metadata-input-font-size)
</style>