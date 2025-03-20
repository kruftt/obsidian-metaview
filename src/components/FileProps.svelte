<script lang="ts">
  import FileProp from "./props/FileProp.svelte";
	import type NoteData from "data/NoteData.svelte";
	import type TemplateData from "data/NoteData.svelte";

  let { data } : { data: TemplateData | NoteData } = $props();
</script>

<template lang="pug">
  div.metadata-file-props
    FileProp(key="types", entries="{data.types}")
    FileProp(key="aliases", entries="{data.fileProps.aliases}")
    FileProp(key="cssclasses", entries="{data.fileProps.cssclasses}")
    FileProp(key="tags", entries="{data.fileProps.tags}")
</template>