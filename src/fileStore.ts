import { TFile } from 'obsidian'
import refs from './refs'
import { arrayWrap } from './utils'
import templateCache from './templateCache';

export default {
  subscribers: <Array<(data: MVFileData) => void>>[],
  activeFile: <TFile | null>null,
  updating: <boolean>false,

  subscribe(subscriber: (data: MVFileData | null) => void): () => void {
    this.subscribers.push(subscriber);
    subscriber(null);
    return () => this.subscribers.remove(subscriber);
  },

  notify(data: MVFileData | null) {
    for (let subscriber of this.subscribers) {
      subscriber(data);
    }
  },

  set(file: TFile | null) {
    this.activeFile = file;
    if (file === null) {
      this.notify(null);
      return;
    }

    const fileCache = refs.metadataCache!.getFileCache(file);
    if (!fileCache) {
      console.warn('MV: FileCache not found!');
      this.notify(null);
      return;
    }

    const frontmatter = fileCache.frontmatter || {};

    const types = arrayWrap(frontmatter.types);
    const boundAliases: Record<string, boolean> = {};
    const freeAliases: string[] = [];
    const boundTags: Record<string, boolean> = {};
    const freeTags: string[] = [];
    const boundCss: Record<string, boolean> = {};
    const freeCss: string[] = [];
    const props: Record<string, unknown> = {};
    const typeData: Record<string, MVTypeData> = {};

    const typeQueue: string[] = [...types];
    let type: string | undefined;
    const propMap: Record<string, MVPropData> = {};
    while (type = typeQueue.pop()) {
      if (typeData[type]) continue;
      const template = templateCache.templates[type];
      if (!template) continue;
      typeQueue.push(...template.types);

      let k, v;
      for (v of template.aliases) { boundAliases[v] = false; }
      for (v of template.tags) { boundTags[v] = false; }
      for (v of template.cssclasses) { boundCss[v] = false; }

      const props: Record<string, MVPropData> = {};
      for ([k, v] of Object.entries(template.props)) {
        propMap[k] = props[k] = { template: v, value: null };
      }

      typeData[type] = {
        name: template.name,
        props,
      };
    }

    let propData;
    for (let [k, v] of Object.entries(frontmatter)) {
      switch (k) {
        case 'types':
          break;
        case 'aliases':
          for (let alias of arrayWrap(v)) {
            if (boundAliases[alias] === false) boundAliases[alias] = true;
            else freeAliases.push(alias);
          }
          break;
        case 'tags':
          for (let tag of arrayWrap(v)) {
            if (boundTags[tag] === false) boundTags[tag] = true;
            else freeTags.push(tag);
          }
          break;
        case 'cssclasses':
          for (let cssclass of arrayWrap(v)) {
            if (boundCss[cssclass] === false) boundCss[cssclass] = true;
            else freeCss.push(cssclass);
          }
          break;
        default:
          propData = propMap[k];
          if (propData) propData.value = v;
          else props[k] = v;
          break;
      }
    }

    const data: MVFileData = {
      name: file.basename,
      types,
      aliases: { bound: boundAliases, free: freeAliases },
      tags: { bound: boundTags, free: freeTags },
      cssclasses: { bound: boundCss, free: freeCss },
      typeData,
      props,
    };

    console.log('built store');
    this.notify(data);
  },
};
