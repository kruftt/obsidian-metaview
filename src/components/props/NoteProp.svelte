<script lang="ts">
  import { setIcon } from 'obsidian';
  import type { Component } from 'svelte';
  import { blurOnEnter, createContextMenuCallback } from './events';
  import { TYPE_ICONS } from 'const';
  import Values from './values'
  import ContentContainers from './contents'
  import PropKey from './keys/PropKey.svelte';
  import createExpand from 'components/expand.svelte';

  let { context, editable = false, key, remove, template } : {
    context: FrontMatter | FrontMatterValue[]
    editable?: boolean
    key: string | number
    remove?: () => void
    template?: MVPropDef
  } = $props();

  // `context` is an object (string keys) or an array (numeric keys); both
  // index to a FrontMatterValue slot at runtime.
  let slot = $derived(context as unknown as Record<string | number, FrontMatterValue>);
  const removeSlot = remove ?? (() => { delete slot[key]; });

  let icon!: HTMLElement;
  $effect(() => setIcon(icon, TYPE_ICONS[template?.type || 'json']));

  let Value: Component<any> = $derived(Values[template?.type || '']);
  let Contents = $derived.by((): Component<any> | null => {
    if (template) {
      const t = template.type;
      const C = ContentContainers[<keyof typeof ContentContainers>t];
      if (C) return C;
      if (t !== "json") return null;
    }
    if (typeof slot[key] === 'object') {
      return slot[key] instanceof Array ? ContentContainers.array : ContentContainers.map;
    }
    return null;
  });

  const expand = createExpand();
  const openContextMenu = createContextMenuCallback(removeSlot,
    (<MVInputDef>template)?.default ? () => { slot[key] = (<MVInputDef>template)?.default! } : undefined);
</script>

<div class="mv-note-property">
  <div class="metadata-property">
    <div class="mv-icon-tray">
      <div
        class="metadata-property-icon"
        bind:this={expand.icon}
        onclick={expand.toggle}
        style:opacity={Contents ? 1 : 0}
      ></div>
      <div class="metadata-property-icon mv-type-icon" bind:this={icon} onclick={openContextMenu}></div>
    </div>

    <div class="metadata-property-key {template ? 'mv-bound-key' : 'mv-free-key'}">
      <PropKey {context} {key} {editable} />
    </div>

    <div class="metadata-property-value">
      <Value {template} name={String(key)} bind:value={slot[key]} />
    </div>
  </div>

  {#if expand.open && Contents}
    <Contents {template} bind:data={slot[key]} />
  {/if}
</div>

<style lang="sass">
  .mv-note-property
    border-bottom: var(--border-width) solid var(--metadata-divider-color)

  .mv-bound-key
    flex: 0 0 auto

  .mv-free-key
    flex: 0 0 min-content !important

  .mv-type-icon
    margin-right: var(--size-4-1)
</style>