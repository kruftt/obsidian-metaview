import { TFile, TFolder } from 'obsidian'
import refs from './refs'
import { arrayWrap } from './utils'

const TYPE_REGEX = /^{\s*([^\[\]\s{}:]+)(?::(.*?))?\s*}$/;

export default {
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
    case 'boolean':
      return {
        type: 'boolean',
        default: arg ? (arg === 'false') ? false : true : false,
        // default: arg ? true : (arg === undefined) ? arg : false,
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
    case 'time':
      return {
        type: 'time',
        format: arg,
      };
    case 'month':
      return {
        type: 'month',
        format: arg,
      };
    case 'year':
      return {
        type: 'year',
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
