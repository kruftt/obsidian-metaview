import type TemplateData from "./TemplateData.svelte";
import store from './store.svelte';
import { arrayWrap, truthy } from "./utils";

export default class NoteData {
  props: FrontMatter = $state({});
  types: string[] = $state([]);
  
  freeProps: Array<string> = $state([]);
  typeData: Record<string, TemplateData> = $state.raw({});
  
  constructor(frontmatter: FrontMatter, typesProperty: string) {
    const { [typesProperty]: types, ...props } = frontmatter;
    this.types.push(...arrayWrap(types).filter(truthy));
    this.props = props;
    this.updateTypeData();
  }

  // Add / Remove Prop?
  // in order to update type data?
  // sln: effect
  // freeProps, boundProps could be derived state (they are anyway)
  // They are currently sets because
  // - it removes duplicate values
  // - more simple add/remove

  public updateTypeData() {
    const typeData: Record<string, TemplateData> = this.typeData = {};
    const freeProps = { ...this.props };
    
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
