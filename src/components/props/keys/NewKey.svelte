<script lang='ts'>
import { blurOnEnter } from "../events";
import { getStore } from "data/store.svelte";

const store = getStore();

let {
	context,
	value,
}: {
	// biome-ignore lint/suspicious/noExplicitAny: reused across frontmatter, prop-def, and file-prop containers
	context: Record<string, any>;
	// biome-ignore lint/suspicious/noExplicitAny: new-key default can be a frontmatter value or a prop def
	value: any;
} = $props();

const setKey = (e: Event) => {
	const target = <HTMLInputElement>e.target;
	const newKey = target.value;
	if (!newKey) return;
	if (!(newKey in context)) {
		context[newKey] = value;
		store.commit();
	}
	target.value = "";
};
</script>

<input
  class="metadata-property-key-input"
  onkeypress={blurOnEnter}
  onblur={setKey}
  placeholder="Add Property"
/>

<style lang='sass'>
</style>