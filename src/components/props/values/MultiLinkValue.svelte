<script lang="ts">
import { Keymap, setIcon } from "obsidian";
import { getStore } from "data/store.svelte";
import { TextInputSuggest } from "TextInputSuggest";
import { activateOnKey } from "../events";

const store = getStore();

let {
	template,
	value = $bindable(),
}: {
	template: MVMultiLinkDef;
	value: FrontMatterValue;
} = $props();

let input = $state<HTMLDivElement>();
let target = $derived(template.target);

/** The list of `[[path]]` wikilink strings (tolerates a non-array stored value). */
let links = $derived(Array.isArray(value) ? (value as string[]) : []);

function pathOf(link: FrontMatterValue): string {
	if (typeof link !== "string") return "";
	const inner = link.match(/^\[\[(.*)\]\]$/)?.[1] ?? link;
	return inner.split(/[|#]/)[0].trim();
}
const basename = (p: string) => p.split("/").pop() ?? p;

/** Append a note as a full-path wikilink (no duplicates). */
function addLink(p: string) {
	if (!p) return;
	const link = `[[${p}]]`;
	if (!Array.isArray(value)) value = [];
	if (!(value as string[]).includes(link)) {
		(value as string[]).push(link);
		store.commit();
	}
}

function removeLink(i: number) {
	(value as string[]).splice(i, 1);
	store.commit();
}

function follow(e: MouseEvent | KeyboardEvent, p: string) {
	e.preventDefault();
	e.stopPropagation();
	store.app.workspace.openLinkText(
		p,
		store.file?.path ?? "",
		Keymap.isModEvent(e as MouseEvent),
	);
}

$effect(() => {
	if (!input) return;
	const el = input;
	const suggest = new TextInputSuggest(
		store.app,
		el,
		(query) => {
			const q = query.toLowerCase();
			return store
				.getNotesByType(target)
				.filter(
					(p) => p.toLowerCase().includes(q) && !links.includes(`[[${p}]]`),
				)
				.slice(0, 20);
		},
		(p) => {
			el.textContent = "";
			addLink(p);
		},
	);
	return () => suggest.close();
});
</script>

<div class="metadata-property-value">
  <!-- svelte-ignore a11y_click_events_have_key_events -->
  <!-- svelte-ignore a11y_no_static_element_interactions -->
  <div class="multi-select-container" onclick={() => input?.focus()}>
    {#each links as link, i}
      {@const p = pathOf(link)}
      <div class="multi-select-pill">
        <a
          class="multi-select-pill-content internal-link"
          href={p}
          data-href={p}
          onclick={(e) => follow(e, p)}
          onkeydown={activateOnKey((e) => follow(e, p))}
        >{basename(p)}</a>
        <button
          type="button"
          class="multi-select-pill-remove-button mv-icon-button"
          aria-label="Remove link"
          use:setIcon={'x'}
          onclick={(e) => { e.stopPropagation(); removeLink(i); }}
        ></button>
      </div>
    {/each}
    <div
      class="multi-select-input"
      role="textbox"
      tabindex="0"
      aria-label="Add link"
      contenteditable
      bind:this={input}
      onblur={(e) => { (e.currentTarget as HTMLDivElement).textContent = ''; }}
    ></div>
  </div>
</div>
