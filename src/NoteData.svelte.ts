import { SvelteSet } from "svelte/reactivity";
import type TemplateCache from "./TemplateCache.svelte";
import type TemplateData from "./TemplateData.svelte";

export default class NoteData {
  types: SvelteSet<string>;
  aliases: SvelteSet<string>;
  tags: SvelteSet<string>;
  cssclasses: SvelteSet<string>;
  props: FrontMatter = $state({});
  freeProps: SvelteSet<string>;
  typeData: Record<string, TemplateData> = $state.raw({});

  constructor(frontmatter: FrontMatter, cache: TemplateCache) {
    this.types = new SvelteSet(arrayWrap(frontmatter.types).filter(truthy));
    this.aliases = new SvelteSet(arrayWrap(frontmatter.aliases).filter(truthy));
    this.tags = new SvelteSet(arrayWrap(frontmatter.tags).filter(truthy));
    this.cssclasses = new SvelteSet(arrayWrap(frontmatter.cssclasses).filter(truthy));
    this.props = { ...frontmatter };
    
    const props = this.props;
    delete props['aliases'];
    delete props['tags'];
    delete props['cssclasses'];
    delete props['types'];

    this.updateTypeData(cache);
  }

  public updateTypeData(cache: TemplateCache) {
    const freeProps = new SvelteSet(Object.keys(this.props));
    const typeData: Record<string, TemplateData> = {};

    const typeQueue: string[] = [...this.types];
    const completedTypes: Record<string, boolean> = {};
    let type: string | undefined;
    let templateData: TemplateData;

    while (type = typeQueue.pop()) {
      if (completedTypes[type]) continue;
      completedTypes[type] = true;
      templateData = cache.get(type);
      if (!templateData) continue;
      typeData[type] = templateData;
      for (let propKey of Object.keys(templateData.props)) {
        freeProps.delete(propKey);
      }
    }

    this.freeProps = freeProps;
    this.typeData = typeData;
  }
}

const arrayWrap = (v: unknown) => Array.isArray(v) ? v : (v === undefined) ? [] : [v];
const truthy = (v: any) => v;