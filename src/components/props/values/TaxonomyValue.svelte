<script lang="ts">
import { prepareFuzzySearch } from "obsidian";
import { getStore } from "data/store.svelte";
import ListValue from "./ListValue.svelte";

const store = getStore();

let {
	name,
	value = $bindable(),
}: {
	name?: string;
	template: MVTaxonomyDef;
	value: FrontMatterValue;
} = $props();

// Taxonomy values are a list of `/`-delimited hierarchical paths.
if (!Array.isArray(value)) value = [];

/**
 * Fuzzy-rank the property's existing vault-wide paths against the query (empty
 * query / focus shows all). Typing a new path that matches nothing still commits
 * as a new term, so the hierarchy can grow.
 */
function suggestions(query: string, exclude: string[]): string[] {
	const all = store
		.getPropertyValues(name ?? "")
		.filter((p) => !exclude.includes(p));
	const q = query.trim();
	if (!q) return all.slice(0, 20);
	const search = prepareFuzzySearch(q);
	return all
		.map((p) => ({ p, match: search(p) }))
		.filter((x) => x.match !== null)
		.sort((a, b) => (b.match?.score ?? 0) - (a.match?.score ?? 0))
		.slice(0, 20)
		.map((x) => x.p);
}
</script>

<ListValue entries={value as string[]} editable={true} {suggestions} />
