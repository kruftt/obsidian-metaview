// TODO: redo all "startsWith" logic using getTypeName

import { TAbstractFile, TFile, TFolder, type FrontMatterCache } from 'obsidian'
import type MetaViewPlugin from '../main'
// import { KEY_SEPARATOR } from './constants'

const arrayWrap = (v: unknown) => Array.isArray(v) ? v : (v === undefined) ? [] : [v];
const makeBoolMap = (map: Record<string, boolean>, v: string) => { map[v] = true; return map; };
// const TYPE_NAME_REGEX = /^(?:.*\/)?(.+).md$/;
const VALID_TYPES: Record<string, boolean> = {
  'boolean': true,
  'number': true,
  'text': true,
  'date': true,
  'datetime': true,
  'time': true,
  'month': true,
  'year': true,
  'link': true,
  'select': true,
  'multi': true,
  'array': true,
  'tuple': true,
  'record': true,
  'json': true,
};

let activeFile: TFile | null;
let plugin: MetaViewPlugin;
let updating: boolean = false;
let typeCache: Record<string, MVTypeData> = $state({});

let typeRegex: RegExp;
const TYPE_NAME_REGEX = "(?:.*\/)?(.+).md$";
const getTypeName = (path: string) => typeRegex.exec(path)![1];


const subscribers: Array<(data: MVFileData | null) => void> = [];

function subscribe(subscriber: (data: MVFileData | null) => void): () => void {
  subscribers.push(subscriber);
  return() => subscribers.remove(subscriber);
};

function notify(data: MVFileData | null) {
  for (let subscriber of subscribers) {
    subscriber(data);
  }
  console.log('notify', data);
};

function makeTypeData(file: TFile) {
  const frontmatter = plugin.app.metadataCache.getFileCache(file)?.frontmatter || {};
  const defs: Record<string, MVPropDef> = {};
  // const props: Record<string, JSONValue> = {};
  const typeData: MVTypeData = {
    types: [],
    aliases: [],
    tags: [],
    cssclasses: [],
    // props,
    defs,
  };

  for (let [k, v] of Object.entries(frontmatter)) {
    switch (k) {
      case 'aliases':
      case 'types':
      case 'tags':
      case 'cssclasses':
        if (Array.isArray(v)) typeData[k].push(...v);
        else typeData[k].push(v);
        break;
      default:
        // Validate type
        defs[k] = extractPropConfig(v);
        // const config = extractPropConfig(v);
        // if (config) configs[k] = config;
        // else props[k] = v;
        // else props[k] = { type: 'json', value: v };
        break;
    }
  }

  typeCache[getTypeName(file.path)] = typeData;
  return typeData;
};

function extractPropConfig(v: JSONValue): MVPropDef {
  if (typeof v !== 'object' || v === null || !('type' in v)) return makeJsonProp(v);
  const type = v.type;
  if (typeof type !== 'string' || !VALID_TYPES[type]) return makeJsonProp(v);
  v;
  let config;
  switch (type) {
    case 'boolean':
      return {
        type,
        checked: extractBool(v.checked),
      };
    case 'text':
      return {
        type,
        value: extractString(v.value),
        minlength: extractNumber(v.minlength),
        maxlength: extractNumber(v.maxlength),
        pattern: extractString(v.pattern),
      };
    case 'number':
      return {
        type,
        value: extractNumber(v.value),
        min: extractNumber(v.min),
        max: extractNumber(v.max),
        step: extractNumber(v.step),
      };
    case 'date':
    case 'datetime':
    case 'time':
    case 'month':
      return {
        type,
        value: extractString(v.value),
        min: extractString(v.min),
        max: extractString(v.max),
        step: extractString(v.step),
      };
    case 'link':
      return {
        type,
        target: extractString(v.target),
      };
    case 'select':
    case 'multi':
      if (v.options instanceof Array) {
        return {
          type,
          options: v.options.reduce(
            (opts: Array<boolean | number | string>, v) => {
              const t = typeof v;
              if (t === 'boolean' || t === 'number' || t === 'string')
                opts.push(<boolean | number | string>v);
              return opts;
            }, []
          ),
        };
      }
      return makeJsonProp(v);
    case 'array':
      config = extractPropConfig(v.elementType);
      if (config === null) return makeJsonProp(v);
      return {
        type,
        elementType: config,
      };
    case 'tuple':
      config = [];
      for (let t of <Array<JSONValue>>v.elementTypes) {
        let c = extractPropConfig(t);
        if (c === null) return makeJsonProp(v);
        config.push(c);
      }
      return {
        type,
        elementTypes: config,
      };
    case 'record':
      const configs = v.entries;
      if (typeof configs !== 'object') return makeJsonProp(v);
      config = <Record<string, MVPropDef>>{};
      for (let [key, value] of Object.entries(<Record<string, JSONValue>>configs)) {
        let c = extractPropConfig(value);
        if (c === null) return makeJsonProp(v);
        config[key] = c;
      }
      return {
        type,
        entries: config,
      };
    case 'json':
      return {
        type,
        value: v,
      };
    default:
      return makeJsonProp(v);
  }
}

function extractBool(v: unknown): boolean | null {
  if (typeof v === 'boolean') return v;
  return false;
}

function extractNumber(v: unknown): number | null {
  if (typeof v === 'number') return v;
  return null;
}

function extractString(v: unknown): string | null {
  if (typeof v === 'string') return v;
  return null;
}

function makeJsonProp(v: JSONValue): MVJsonDef {
  return { type: 'json', value: v };
}

function makeTypeCache() {
  const { typesPath } = plugin.settings;
  typeCache = {};

  const typesDir = plugin.app.vault.getFolderByPath(typesPath);
  if (typesDir === null) {
    console.warn("MV: Could not find templates directory: ", typesPath);
    return;
  }

  const directoryQueue: TFolder[] = [typesDir];
  let currentDirectory: TFolder | undefined;

  while (currentDirectory = directoryQueue.pop()) {
    for (let entry of currentDirectory.children) {
      if (entry instanceof TFile) {
        makeTypeData(entry);
      } else {
        directoryQueue.push(<TFolder>entry);
      }
    }
  }
};

function makeNoteData(file: TFile) {
  const frontmatter = plugin.app.metadataCache.getFileCache(file)?.frontmatter;
  if (!frontmatter) return null;
  const types = arrayWrap(frontmatter.types);

  const props: Record<string, JSONValue> = { ...frontmatter };
  const aliases: Record<string, boolean> = arrayWrap(props.aliases).reduce(makeBoolMap, {});
  const tags: Record<string, boolean> = arrayWrap(props.tags).reduce(makeBoolMap, {});
  const cssclasses: Record<string, boolean> = arrayWrap(props.cssclasses).reduce(makeBoolMap, {});

  delete props['aliases'];
  delete props['tags'];
  delete props['cssclasses'];

  const boundAliases: Record<string, Record<string, boolean>> = {};
  const boundTags: Record<string, Record<string, boolean>> = {};
  const boundCss: Record<string, Record<string, boolean>> = {};
  const boundProps: Record<string, Record<string, MVPropData>> = {};

  const aliasUsed: Record<string, boolean> = { ...aliases };
  const tagUsed: Record<string, boolean> = { ...tags };
  const cssUsed: Record<string, boolean> = { ...cssclasses };

  const typeQueue: string[] = [...types];
  const completedTypes: Record<string, boolean> = {};
  let type: string | undefined;
  let typeData: MVTypeData;

  while (type = typeQueue.pop()) {
    if (completedTypes[type]) continue;
    completedTypes[type] = true;
    typeData = typeCache[type];
    if (!typeData) continue;

    const typeAliases: Record<string, boolean> = boundAliases[type] = {};
    const typeTags: Record<string, boolean> = boundTags[type] = {};
    const typeCss: Record<string, boolean> = boundCss[type] = {};

    let key, def;
    for (key of typeData.aliases) { typeAliases[key] = aliasUsed[key]; delete aliases[key]; }
    for (key of typeData.tags) { typeTags[key] = tagUsed[key]; delete tags[key]; }
    for (key of typeData.cssclasses) { typeCss[key] = cssUsed[key]; delete cssclasses[key]; }

    const typeProps: Record<string, MVPropData> = boundProps[type] = {};

    for ([key, def] of Object.entries(typeData.defs)) {
      typeProps[key] = {
        def,
        value: props[key]
      };
      delete props[key];
    }
  }

  const data: MVNoteData = {
    types,
    aliases: Object.keys(aliases),
    tags: Object.keys(tags),
    cssclasses: Object.keys(cssclasses),
    props,
    boundAliases,
    boundTags,
    boundCss,
    boundProps,
  };

  // console.log('built note data');
  return data;
}

function setProperty(address: string[], key: string, value: JSONValue = null) {
  updating = true;
  // const keys = address.split(KEY_SEPARATOR);
  // const key = <string>keys.pop();

  plugin.app.fileManager!.processFrontMatter(activeFile!, (frontmatter) => {
    let target = frontmatter;
    for (let k of address) target = <Record<string, Record<string, JSONValue>>>target[k];
    if (value === null) delete target[key];
    else target[key] = value;
  });
}

function insertMetaValue(prop: string, value: string) {
  updating = true;
  plugin.app.fileManager!.processFrontMatter(activeFile!, (frontmatter) => { frontmatter[prop].push(value); }
  );
}

function removeMetaValue(prop: string, value: string) {
  updating = true;
  plugin.app.fileManager!.processFrontMatter(activeFile!, (frontmatter) => {
    const arr = frontmatter[prop];
    const idx = arr.indexOf(prop);
    if (idx > -1) arr.splice(idx, 1);
  });
}

function update(file: TFile) {
  if (file.extension !== 'md') return;

  if (updating) {
    updating = false;
    return;
  }

  if (file.path.startsWith(plugin.settings.typesPath)) {
    const data = makeTypeData(file);
    if (file === activeFile) {
      notify(data);
    }
  } else if (file === activeFile) {
    notify(makeNoteData(file));
  }
}

function set(file: TFile | null) {
  activeFile = file;

  if (file === null || file.extension !== 'md') {
    notify(null);
  } else if (file.path.startsWith(plugin.settings.typesPath)) {
    notify(typeCache[getTypeName(file.path)]) // Is this guarantted?
  } else {
    notify(makeNoteData(file));
  }

  // if (file === null || file.extension !== 'md') {
  //   notify({ data: null, isTypeDef: false });
  // } else if (file.path.startsWith(plugin.settings.typesPath)) {
  //   notify({ data: typeCache[getTypeName(file.path)], isTypeDef: true }) // Is this guarantted?
  // } else {
  //   notify({ data: makeNoteData(file), isTypeDef: false });
  // }

  // notify((file === null || file.extension !== 'md')
  //   ? { data: null, isTypeDef: false}
  //   : file.path.startsWith(plugin.settings.typesPath)
  //     ? { data: makeTypeData(file), isTypeDef: true } // Check cache!
  //     : { data: makeNoteData(file), isTypeDef: false }
  // );
}

function remove(file: TFile) {
  if (file.extension !== 'md') return;
  if (file.path.startsWith(plugin.settings.typesPath)) {
    delete typeCache[getTypeName(file.path)];
  }
}

function rename(file: TAbstractFile, oldPath: string) {
  if (file instanceof TFolder) return;
  const { typesPath } = plugin.settings;
  
  if (oldPath.startsWith(typesPath)) {
    const oldName = getTypeName(oldPath);
    if (file.path.startsWith(plugin.settings.typesPath)) {
      typeCache[getTypeName(file.path)] = typeCache[oldName];
    }
    delete typeCache[oldName];
  } else {
    if (file.path.startsWith(typesPath)) {
      makeTypeData(<TFile>file);
    }
  }
}


export default {
  get plugin() { return plugin; },
  set plugin(p: MetaViewPlugin) {
    plugin = p;
    typeRegex = new RegExp('^' + p.settings.typesPath + TYPE_NAME_REGEX);
  },

  subscribe,
  makeTypeData,
  makeTypeCache,
  
  update,
  set,
  remove,
  rename,

  setProperty,
  insertMetaValue,
  removeMetaValue,
};
