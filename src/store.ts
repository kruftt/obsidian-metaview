import { warn } from "console";
import { App, FrontmatterLinkCache, EventRef, LinkCache, TFolder, TFile } from "obsidian";
import { DataviewApi, getAPI, Link } from "obsidian-dataview";
import { Subscriber } from "svelte/motion";
import { Writable, writable } from "svelte/store";

type MV_ActiveFileStore = Writable<MV_FileData>

const TYPE_REGEX = /^{{\s*(?:(\w+)|(\w+)\s*\[\]|\[\s*(\w+)\s*\])\s*}}$/;
const EMPTY_STORE: MV_FileData = {
  types: [],
  tags: [],
  aliases: [],
  cssclasses: [],
  inlineTags: [],
  freeProps: [],
  boundProps: [],
  freelinks: [],
  backlinks: [],
  embeds: []
};


let _app: App;
let _typeCache: MV_TypeCache
let _activeFile: TFile | null;
let _activeFileStore: MV_ActiveFileStore;


export async function initialize(app: App) {
  _app = app;
  _activeFile = app.workspace.getActiveFile();

  let stale = true;
  let store: Writable<MV_FileData>;
  let refOpen: EventRef;
  let refChanged: EventRef;

  const setData = (fileData: MV_FileData) => {
    store.set(fileData);
    stale = false;
    return fileData;
  };

  _activeFileStore = store = writable(EMPTY_STORE, (set, update) => {

    refOpen = app.workspace.on("file-open", (file) => {
      _activeFile = file;
      refreshActiveFile().then(setData);
    });

    // @ts-ignore
    const settings: MV_Settings = app.plugins.plugins['MetadataView'].settings;

    if (getAPI(app)) {
      //@ts-ignore
      refChanged = app.metadataCache.on('dataview:metadata-change', (type, file) => {
        if (file.path.startsWith(settings.templatesDir)) cacheFile(file);
        if (file === _activeFile && !stale) {
          stale = true;
          refreshActiveFile().then(setData);
        }
      });
    } else {
      refChanged = app.metadataCache.on("changed", (file) => {
        if (file.path.startsWith(settings.templatesDir)) cacheFile(file);
        if (file === _activeFile && !stale) {
          stale = true;
          refreshActiveFile().then(setData);
        }
      });
    }

    return () => {
      app.workspace.offref(refOpen);
      app.metadataCache.offref(refChanged);
    };
  });

  buildTypeCache();
  return await refreshActiveFile().then(setData);
}


export function subscribe(app: App, run: Subscriber<MV_FileData>) {
  return _activeFileStore.subscribe(run);
}


function buildTypeCache() {
  const app = _app;
  // @ts-ignore
  const settings: MetadataViewSettings = app.plugins.plugins['MetadataView'].settings;
  // @ts-ignore
  const templatesDir: TFolder = app.vault.getFolderByPath(settings.templatesDir);
  const folderQueue = [templatesDir];
  
  _typeCache = { byName: {}, byPath: {} };

  let current: TFolder | undefined;
  while ((current = folderQueue.pop())) {
    for (let child of current.children) {
      if (child instanceof TFile) {
        cacheFile(child);
      } else if (child instanceof TFolder) {
        folderQueue.push(child);
      }
    }
  }
}


function cacheFile(file: TFile): void {
  const app = _app;
  // @ts-ignore
  const settings: MV_Settings = app.plugins.plugins['MetadataView'].settings;
  
  const metadataCache = app.metadataCache;
  let _fm = metadataCache.getFileCache(file)?.frontmatter;
  if (!_fm) return;  // TODO: Emit Warning
  
  const props: Record<string, MV_PropDef> = {};
  const typeDef: MV_TypeDef = {
    name: file.basename,
    props,
    types: [],
    tags: [],
    aliases: [],
    cssclasses: [],
  };
  
  Object.entries(_fm).forEach(([key, value]) => {
    switch (key) {
      case settings.typesProp:
        typeDef.types = arrayWrap(value);
        break;
      case 'tags':
      case 'aliases':
      case 'cssclasses':
        typeDef[key] = arrayWrap(value);
        break;
      default:
        if (Array.isArray(value)) {
          props[key] = { key, default: value, type: 'multi' };
        } else {
          const extractedType = TYPE_REGEX.exec(value);
          if (extractedType) {
            let _default = extractedType[1];
            if (_default) {
              props[key] = { key, default: _default, type: 'composite' };
            } else {
              _default = extractedType[2] || extractedType[3];
              props[key] = { key, default: _default, type: 'multicomposite' };
            }
          } else {
            props[key] = { key, default: value, type: 'single' };
          }
        }
        break;
    }
  });

  const typeCache = _typeCache;
  typeCache.byName[file.basename] = typeDef;
  typeCache.byPath[file.path] = typeDef;
}


async function refreshActiveFile() {
  const app = _app;
  const activeFile = _activeFile;
  
  if (!activeFile) {
    console.warn('MV: No active file.') 
    return EMPTY_STORE;
  }
  
  // @ts-ignore
  const settings: MV_Settings = app.plugins.plugins['MetadataView'].settings;
  const metadataCache = app.metadataCache;
  const fileCache = metadataCache.getFileCache(activeFile);
  
  if (!fileCache) {
    console.warn('MV: FileCache not found');
    return EMPTY_STORE;
  }
  
  const frontmatter = fileCache.frontmatter || {};
  const page = getAPI(app)?.page(activeFile.path);

  const types: string[] = [];
  const tags: string[] = [];
  const aliases: string[] = [];
  const cssclasses: string[] = [];
  const inlineTags: InlineTagData[] = [];
  const freeProps: MV_PropData[] = [];
  const boundProps: MV_GroupData[] = [];
  const propGroupMap: Record<string, MV_GroupData> = {};
  const freelinks: LinkCache[] = fileCache.links || [];
  const backlinks: BacklinkData[] = [];
  const backlinksMap: Record<string, BacklinkData[]> = {};
  const embeds: EmbedData[] = [];
  const embedsMap: Record<string, EmbedData[]> = {};
  
  // @ts-ignore
  Object.entries((metadataCache.getBacklinksForFile(activeFile).data as Record<string, BacklinkData[]>))
  .forEach(([filename, fileData]) => {
    for (let backlinkData of fileData) {
      let key = backlinkData.key;
      if (key) {
        const [k, i] = key.split('.');
        const keyBacklinks = backlinksMap[k] || (backlinksMap[k] = []);
        keyBacklinks.push(backlinkData);
      } else {
        backlinks.push(backlinkData);
      }
    }
  });
  
  const props: Record<string, unknown> = {};
  const usedKeysMap: Record<string, boolean> = { file: true };
  const registerEntry = ([key, value]: [string, unknown]) => {
    const _k = key.toLowerCase();
    if (usedKeysMap[_k]) return;
    usedKeysMap[_k] = true;
    props[key] = (value);
  };

  if (page) Object.entries(page).sort().forEach(registerEntry);
  Object.entries(frontmatter).forEach(registerEntry);
  
  if (usedKeysMap[settings.typesProp.toLowerCase()]) {
    const typeQueue: string[] = [...arrayWrap(frontmatter[settings.typesProp])];
    const visitedType: Record<string, true> = {};
    
    let _t: string | undefined;
    while ((_t = typeQueue.pop())) {
      if (visitedType[_t]) continue;
      visitedType[_t] = true;
      types.push(_t);
    
      const typeDef = _typeCache.byName[_t];
      typeQueue.push(...typeDef.types);

      const propGroupProps: MV_PropData[] = [];
      const propGroup: MV_GroupData = { name: _t, props: propGroupProps };
      boundProps.push(propGroup);

      for (let [propName, propDef] of Object.entries(typeDef.props)) {
        propGroupMap[propName] = propGroup;
        const propData: MV_PropData = {
          value: props[propName],
          def: propDef,
          backlinks: backlinksMap[propName] || [] 
        };
        propGroupProps.push(propData);
        delete props[propName];
      }

      tags.push(...typeDef.tags);
      aliases.push(...typeDef.aliases);
      cssclasses.push(...typeDef.cssclasses);
    }
  }
  
  // remaining local props
  Object.entries(props).forEach(([key, value]) => {
    freeProps.push({
      value,
      def: { key, default: undefined, type: 'free' },
      backlinks: backlinksMap[key] || []
    });
  });
  
  const data: MV_FileData = {
    types,
    tags,
    aliases,
    cssclasses,
    inlineTags,
    freeProps,
    boundProps,
    freelinks,
    backlinks,
    embeds
  };

  console.log('store:', data);
  return data;
}


function arrayWrap(v: any) {
  return Array.isArray(v) ? v : (v === undefined) ? [] : [v];
}


function fileInFolder(file: TFile, folder: TFolder | null) {
  if (!folder) return false;
  for (let child of folder.children) {
    if (child instanceof TFile) {
      if (file === child) return true;
    } else if (child instanceof TFolder) {
      if (fileInFolder(file, child)) return true;
    }
  }
  return false;
}
