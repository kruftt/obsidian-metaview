set list=Multi Cycle Boolean Number File MultiFile Media MultiMedia Date Lookup Formula Canvas CanvasGroup CanvasGroupLink YAML JSON Object ObjectList
for %%n in (%list%) do call :makeFile %%n

:makeFile
set outfile=.\Metadata%1.svelte
copy .\MetadataInput.svelte %outfile%
