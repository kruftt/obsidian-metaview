<script lang='ts'>
import { blurOnEnter } from "../events";
import { getStore } from "data/store.svelte";

const store = getStore();

let {
	context,
	editable,
	key,
}: {
	// biome-ignore lint/suspicious/noExplicitAny: reused across frontmatter, prop-def, and file-prop containers
	context: Record<string, any>;
	editable?: boolean;
	key: string | number;
} = $props();

const setKey = (e: Event) => {
	const target = <HTMLInputElement>e.target;
	const newKey = target.value;
	if (!newKey || newKey === key) return;
	if (newKey in context) {
		target.value = String(key);
	} else {
		context[newKey] = context[key];
		delete context[key];
		key = newKey;
		store.commit();
	}
};
</script>

{#if context && editable}
  <input
    class="metadata-property-key-input"
    value={String(key)}
    onkeypress={blurOnEnter}
    onblur={setKey}
    placeholder="PropKey"
  />
{:else}
  <div>{key}</div>
{/if}

<style lang='sass'>
</style>