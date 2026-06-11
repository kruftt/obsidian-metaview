<script lang="ts">
import ListValue from "./values/ListValue.svelte";
import type NoteData from "data/NoteData.svelte";
import type TemplateData from "data/TemplateData.svelte";
import { getStore } from "data/store.svelte";
import PropKey from "./keys/PropKey.svelte";

const store = getStore();

let {
	key,
	context,
}: {
	key: MVFilePropType;
	context: Record<string, string[]> | NoteData | TemplateData;
} = $props();
let entries = $derived((context as unknown as Record<string, string[]>)[key]);

// Vault-wide option sources for the file props that benefit from autocomplete;
// `aliases` is note-specific, so it stays free text.
const optionSources: Partial<Record<MVFilePropType, () => string[]>> = {
	tags: () => store.getVaultTags(),
	cssclasses: () => store.getCssClasses(),
	types: () => store.getTypeOptions(),
};

const suggestions = $derived.by(() => {
	const source = optionSources[key];
	if (!source) return undefined;
	return (query: string, exclude: string[]) => {
		const q = query.toLowerCase();
		return source()
			.filter((o) => !exclude.includes(o) && o.toLowerCase().includes(q))
			.slice(0, 8);
	};
});
</script>

<div class="metadata-property" data-property-key={key}>
  <div class="mv-file-key metadata-property-key">
    <PropKey {context} {key} />
  </div>
  <ListValue entries={entries} editable={true} {suggestions} />
</div>

<style scoped lang="sass">
  .mv-file-key
    align-items: center
    color: var(--metadata-label-text-color)
    font-size: var(--metadata-label-font-size)
    font-weight: var(--metadata-label-font-weight)
    height: var(--input-height)
    min-width: calc(var(--metadata-label-width) * 0.6)
    flex: 0 0 min-content !important
    padding-left: 0.5em

  .metadata-property
    --pill-padding-x: var(--tag-padding-x)
    --pill-padding-y: var(--tag-padding-y)

  .metadata-property[data-property-key="aliases"]
    --pill-background: rgba(var(--color-purple-rgb), 0.1)

  .metadata-property[data-property-key="cssclasses"]
    --pill-background: rgba(var(--color-yellow-rgb), 0.1)

  .metadata-property[data-property-key="types"]
    --pill-background: rgba(var(--color-green-rgb), 0.1)
</style>
