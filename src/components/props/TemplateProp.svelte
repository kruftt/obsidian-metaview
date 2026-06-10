<script lang="ts">
  import { setIcon } from 'obsidian';
  import type { Component } from 'svelte';
  import { blurOnEnter, createContextMenuCallback } from './events';
  import { makePropTemplate } from 'utils';
  import { PROPERTY_TYPES, TYPE_ICONS } from 'const';
  import PropKey from './keys/PropKey.svelte';
  import SelectValue from './values/SelectValue.svelte';
  import Configs from './configs';
  import createExpand from 'components/expand.svelte';
  import store from 'data/store.svelte';
  
  let { context, key, editable = false, remove } : {
    context: Record<string, MVPropDef> | MVPropDef[] | MVCollectionDef,
    key: string | number,
    editable?: boolean,
    remove?: () => void
  } = $props();

  // `context` holds prop definitions keyed by name (object) or index
  // (array/tuple); both resolve to an MVPropDef slot at runtime.
  let ctx = $derived(context as unknown as Record<string | number, MVPropDef>);
  const removeSlot = remove ?? (() => { delete ctx[key]; });

  let template = $derived(ctx[key]);

  let typeIcon!: HTMLElement;
  $effect(() => setIcon(typeIcon, TYPE_ICONS[template.type]));

  const expand = createExpand();
  const openContextMenu = createContextMenuCallback(removeSlot);

  let selectedType = $state(template.type);
  let Config: Component<any> = $derived(Configs[template.type]);
  $effect(() => { if (selectedType !== template.type) { ctx[key] = makePropTemplate({ type: selectedType })!; store.commit(); } });
</script>

<div class="mv-template-property">
  <div class="metadata-property">
    <div class="mv-icon-tray">
      <div class="metadata-property-icon" bind:this={expand.icon} onclick={expand.toggle}></div>
      <div
        class="metadata-property-icon"
        bind:this={typeIcon}
        style:display={key ? 'flex' : 'none'}
        onclick={openContextMenu}
        oncontextmenu={openContextMenu}
      ></div>
    </div>

    <div class="metadata-property-key">
      <PropKey {context} {key} {editable} />
    </div>

    <div class="metadata-property-value">
      <SelectValue bind:value={selectedType} options={PROPERTY_TYPES} />
    </div>
  </div>

  {#if expand.open}
    <Config {template} />
  {/if}
</div>

<style scoped lang="sass">
  .metadata-property
    padding: 1px 0

  .mv-template-property
    border-bottom: var(--border-width) solid var(--metadata-divider-color)
</style>