import { SvelteMap, SvelteSet } from "svelte/reactivity";
import type TemplateCache from "./TemplateCache.svelte";
import type TemplateData from "./TemplateData.svelte";

export default class NoteData {
  types: SvelteSet<string>;
  aliases: SvelteSet<string>;
  tags: SvelteSet<string>;
  cssclasses: SvelteSet<string>;
  props: FrontMatter = $state({});
  typeData: Record<string, TemplateData> = $state.raw({});
  // typeData: SvelteMap<string, TemplateData>;
  freeProps: SvelteSet<string>;

  constructor(frontmatter: FrontMatter, cache: TemplateCache) {
    this.types = new SvelteSet(arrayWrap(frontmatter.types).filter(truthy));
    this.aliases = new SvelteSet(arrayWrap(frontmatter.aliases).filter(truthy));
    this.tags = new SvelteSet(arrayWrap(frontmatter.tags).filter(truthy));
    this.cssclasses = new SvelteSet(arrayWrap(frontmatter.cssclasses).filter(truthy));
    this.props = { ...frontmatter };
    // this.typeData = new SvelteMap();
    this.freeProps = new SvelteSet();
    
    const props = this.props;
    delete props['aliases'];
    delete props['tags'];
    delete props['cssclasses'];
    delete props['types'];

    this.updateTypeData(cache);
  }

  public updateTypeData(cache: TemplateCache) {
    // this.typeData.clear();
    const typeData: Record<string, TemplateData> = {};
    this.freeProps.clear();
    const freeProps = { ...this.props };
    const typeQueue: string[] = [...this.types].reverse();

    const completedTypes: Record<string, boolean> = {};
    let type: string | undefined;
    let templateData: TemplateData;
    // const typeData = this.typeData;

    while (type = typeQueue.pop()) {
      if (completedTypes[type]) continue;
      completedTypes[type] = true;
      templateData = cache.get(type);
      if (!templateData) continue;
      typeData[type] = templateData;
      // typeData.set(type, templateData);
      typeQueue.push(...[...templateData.types].reverse());
      for (let propKey of Object.keys(templateData.props)) {
        delete freeProps[propKey];
      }
    }

    Object.keys(freeProps).forEach(this.freeProps.add, this.freeProps);
    this.typeData = typeData;
  }
}

const arrayWrap = (v: unknown) => Array.isArray(v) ? v : (v === undefined) ? [] : [v];
const truthy = (v: any) => v;