<script lang='ts'>
  import { blurOnEnter } from "../events";
  import Input from "../values/InputValue.svelte";
  import { getStore } from 'data/store.svelte';

  const store = getStore();

  let { template } : { template: MVSelectDef } = $props();
  
  let options: string[] = $state(template.options || []);

  function updateTemplate(e: Event) {
    const target = <HTMLInputElement>e.target;
    const value = target.value;
    if (value) {
      options.push(value);
      template.options = options;
      target.value = '';
      store.commit();
    }
  }
</script>

<div class="mv-content-container">
  {#each template.options as option, i}
    <div class="mv-metadata-property-option">
      <div class="mv-metadata-options-spacer"></div>
      <span onclick={() => { template.options.splice(i, 1); store.commit(); }}>x</span>
      <Input template={{ type: 'text' }} bind:value={template.options[i]} />
    </div>
  {/each}
  <div class="mv-metadata-property-option">
    <input
      type="text"
      onkeypress={blurOnEnter}
      onblur={updateTemplate}
      style:margin-left="var(--size-4-5)"
      placeholder="Add option..."
    />
  </div>
</div>

<style lang='sass'>
</style>