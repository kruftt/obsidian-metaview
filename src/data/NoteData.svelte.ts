import type TemplateData from "./TemplateData.svelte";
import store from './store.svelte';
import { arrayWrap, truthy } from "../utils";

export default class NoteData {
  props: FrontMatter = $state({});
  fileProps: Record<string, string[]> = $state({});
  types: string[] = $state([]);
  
  freeProps: Array<string> = $state([]);
  typeData: Record<string, TemplateData> = $state.raw({});
  
  constructor(frontmatter: FrontMatter, typesProperty: string) {
    const { [typesProperty]: types, aliases, cssclasses, tags, ...props } = frontmatter;
    
    this.types = arrayWrap(types).filter(truthy);
    const fileProps = this.fileProps;
    fileProps.aliases = arrayWrap(aliases).filter(truthy);
    fileProps.cssclasses = arrayWrap(cssclasses).filter(truthy);
    fileProps.tags = arrayWrap(tags).filter(truthy);
    this.props = props;
    this.updateTypeData(typesProperty);
  }

  public updateTypeData(typesProperty: string) {
    const typeData: Record<string, TemplateData> = this.typeData = {};
    const freeProps = { ...this.props };

    delete freeProps.aliases;
    delete freeProps.cssclasses;
    delete freeProps.tags;
    
    let type: string | undefined;
    let templateData: TemplateData;

    for (type of this.types) {
      templateData = store.templates[type];
      if (!templateData) continue;
      typeData[type] = templateData;
      for (let propKey of Object.keys(templateData.props)) {
        delete freeProps[propKey];
      }
    }

    this.freeProps = Object.keys(freeProps);

    // const typeQueue: string[] = [...this.types].reverse();
    // const completedTypes: Record<string, boolean> = {};
    // let type: string | undefined;
    // let templateData: TemplateData;
    // const templates = store.templates;

    // while (type = typeQueue.pop()) {
    //   if (completedTypes[type]) continue;
    //   completedTypes[type] = true;
    //   templateData = templates[type];
    //   if (!templateData) continue;
    //   typeData[type] = templateData;
    //   typeQueue.push(...[...templateData.types].reverse());
    //   for (let propKey of Object.keys(templateData.props)) {
    //     delete freeProps[propKey];
    //     this.boundProps.add(propKey);
    //   }
    // }

  }
}
