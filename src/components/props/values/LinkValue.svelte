<script lang="ts">
import { Keymap, setIcon } from "obsidian";
import { getStore } from "data/store.svelte";
import { TextInputSuggest } from "TextInputSuggest";
import { activateOnKey } from "../events";

const store = getStore();

let {
	name,
	template,
	value = $bindable(),
}: {
	name?: string;
	template: MVLinkDef;
	value: FrontMatterValue;
} = $props();

let input = $state<HTMLDivElement>();
let target = $derived(template.target);

/** Link target stored in `value` (the path inside `[[ ]]`, sans `|alias`/`#heading`). */
let path = $derived.by(() => {
	if (typeof value !== "string") return "";
	const inner = value.match(/^\[\[(.*)\]\]$/)?.[1] ?? value;
	return inner.split(/[|#]/)[0].trim();
});
/** Short name shown on the pill; the full path stays in `value` for correctness. */
let displayName = $derived(path.split("/").pop() ?? path);

/** Store the chosen note as a full-path wikilink so Obsidian renders a real link. */
function setLink(p: string) {
	value = p ? `[[${p}]]` : "";
	store.commit();
}

/** Follow the link like a native internal link (mod-click opens in a new tab/split). */
function follow(e: MouseEvent | KeyboardEvent) {
	e.preventDefault();
	e.stopPropagation();
	store.app.workspace.openLinkText(
		path,
		store.file?.path ?? "",
		Keymap.isModEvent(e as MouseEvent),
	);
}

// Attach the note suggester to the add-input. Selecting replaces the current link.
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
				.filter((p) => p.toLowerCase().includes(q))
				.slice(0, 20);
		},
		(p) => {
			el.textContent = "";
			setLink(p);
		},
	);
	return () => suggest.close();
});
</script>

<div class="metadata-property-value">
  <!-- svelte-ignore a11y_click_events_have_key_events -->
  <!-- svelte-ignore a11y_no_static_element_interactions -->
  <div
    class="multi-select-container"
    onclick={() => input?.focus()}
  >
    {#if path}
      <div class="multi-select-pill" data-property-key={name}>
        <a
          class="multi-select-pill-content internal-link"
          href={path}
          data-href={path}
          onclick={follow}
          onkeydown={activateOnKey(follow)}
        >{displayName}</a>
        <button
          type="button"
          class="multi-select-pill-remove-button mv-icon-button"
          aria-label="Remove link"
          use:setIcon={'x'}
          onclick={(e) => { e.stopPropagation(); setLink(''); }}
        ></button>
      </div>
    {/if}
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
