import { TFile, TFolder } from 'obsidian'
import refs from './refs'
import { arrayWrap, TYPE_REGEX } from './utils'


export const templateCache = {
  templates: <Record<string, MVTemplate>> {},

  buildCache() {
    const { templatesPath } = refs.settings!;
    this.templates = {};

    const templateDir = refs.vault!.getFolderByPath(templatesPath);
    if (templateDir === null) {
      console.warn("MV: Could not find templates directory: ", templatesPath);
      return;
    }

    const directoryQueue: TFolder[] = [templateDir];
    let currentDirectory: TFolder | undefined;

    while (currentDirectory = directoryQueue.pop()) {
      for (let entry of currentDirectory.children) {
        if (entry instanceof TFile) {
          this.buildTemplate(entry);
        } else {
          directoryQueue.push(<TFolder>entry);
        }
      }
    }

    console.log('built templateCache');
  },

  buildTemplate(file: TFile) {
    if (file.extension !== 'md') return;
    const frontmatter = refs.metadataCache!.getFileCache(file)?.frontmatter || {};
    const props: Record<string, MVPropDef> = {};

    for (let [k, v] of Object.entries(frontmatter)) {
      switch (k) {
        case 'aliases':
        case 'types':
        case 'tags':
        case 'cssclasses':
          break;
        default:
          props[k] = parseValue(v);
      }
    }

    this.templates[file.basename] = {
      name: file.basename,
      types: arrayWrap(frontmatter.types),
      aliases: arrayWrap(frontmatter.aliases),
      tags: arrayWrap(frontmatter.tags),
      cssclasses: arrayWrap(frontmatter.cssclasses),
      props,
    };
  },
}


export const fileStore = {
  subscribers: <Array<(data: MVFileData) => void>>[],
  activeFile: <TFile | null> null,
  updating: <boolean> false,

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


function parseValue(value: unknown): MVPropDef {
  switch (typeof value) {
    case 'boolean':
      return {
        type: 'boolean',
        default: value,
      };
    case 'number':
      return {
        type: 'number',
        default: value,
      };
    case 'string':
      return parseString(value);
    case 'object':
      if (value === null) return { type: 'json' };
      return parseObject(value);
    default:
      return {
        type: 'json'
      }
  }
}


function parseString(value: string): MVPropDef {
  const extracted = TYPE_REGEX.exec(value);
  if (extracted === null) {
    return {
      type: 'string',
      default: value,
    };
  }
  const type = extracted[1];
  const arg = extracted[2];
  switch (type) {
    case 'bool':
      return {
        type: 'boolean',
        default: arg ? true : (arg === undefined) ? arg : false,
      };
    case 'number':
      return {
        type: 'number',
        default: Number(arg),
      };
    case 'string':
      return {
        type: 'string',
        default: arg,
      };
    case 'link':
      return {
        type: 'link',
        noteType: arg,
      };
    case 'date':
      return {
        type: 'date',
        format: arg,
      };
    case 'datetime':
      return {
        type: 'datetime',
        format: arg,
      };
    default:
      let v = type.split(',');
      if (v.length > 1) {
        try {
          v = v.map((_) => JSON.parse(_.trim()));
          return {
            type: 'select',
            values: v,
          };
        } catch { }
      }
      return {
        type: 'string',
        default: value,
      };
  }
}


function parseObject(value: object): MVPropDef {
  if (Array.isArray(value)) {
    if (value.length > 1) {
      return {
        type: 'tuple',
        elementTypes: value.map(parseValue),
      };
    } else {
      const elementType = parseValue(value[0]);
      if (elementType.type === 'select') {
        return {
          type: 'multi',
          elementType,
        }
      }
      return {
        type: 'array',
        elementType,
      };
    }
  } else {
    return {
      type: 'record',
      entries: Object.entries(value).reduce((record, [k, v]) => {
        record[k] = parseValue(v);
        return record;
      }, {} as Record<string, MVPropDef>),
    };
  }
}
