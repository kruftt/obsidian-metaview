<script lang="ts">
import ListValue from "./values/ListValue.svelte";
import type NoteData from "data/NoteData.svelte";
import type TemplateData from "data/TemplateData.svelte";
import { getStore } from "data/store.svelte";

const store = getStore();

let {
  key,
  context,
}: {
  key: MVFilePropType;
  context: Record<string, string[]> | NoteData | TemplateData;
} = $props();
let entries = $derived((context as unknown as Record<string, string[]>)[key]);

// `key` is the canonical file-prop id (drives autocomplete, expansion, pill colour);
// the displayed name for `types` is the configurable frontmatter property.
let label = $derived(key === "types" ? store.typesProperty : key);

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

// Add-time "inheritance": when a type is added, also seed the types its template
// declares (transitively), materializing the full set into the note's `types`.
function expandType(type: string) {
  const templates = store.templates;
  const seen = new Set<string>();
  const queue = [type];
  while (queue.length > 0) {
    const t = queue.pop();
    if (t === undefined || seen.has(t)) continue;
    seen.add(t);
    const td = templates[t];
    if (!td) continue;
    for (const seed of td.types) {
      if (!entries.includes(seed)) entries.push(seed);
      queue.push(seed);
    }
  }
}
</script>

<div class="metadata-property" data-property-key={key}>
  <div class="mv-file-key metadata-property-key">{label}</div>
  <ListValue {entries} editable={true} {suggestions} onAdd={key === 'types' ? expandType : undefined} />
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
    --pill-background: rgba(var(--color-purple-rgb), 0.2)
    --pill-background-hover: rgba(var(--color-purple-rgb), 0.1)

  .metadata-property[data-property-key="cssclasses"]
    --pill-background: rgba(var(--color-yellow-rgb), 0.2)
    --pill-background-hover: rgba(var(--color-yellow-rgb), 0.1)

  .metadata-property[data-property-key="types"]
    --pill-background: rgba(var(--color-green-rgb), 0.2)
    --pill-background-hover: rgba(var(--color-green-rgb), 0.1)

  .metadata-property[data-property-key="tags"]
    --pill-background: rgba(var(--color-purple-rgb), 0.2)
    --pill-background-hover: rgba(var(--color-purple-rgb), 0.1)
</style>
