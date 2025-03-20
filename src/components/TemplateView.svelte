<script lang="ts">
	import type TemplateData from "data/TemplateData.svelte";
  import FileProps from "./FileProps.svelte";
  import TemplateProp from "./props/TemplateProp.svelte";

  let { data } : { data: TemplateData } = $props();
</script>

<template lang='pug'>
  div.metadata-content
    FileProps({data})
    +each("Object.keys(data.props) as key (key)")
      TemplateProp({key} context="{data.props}")
</template>
