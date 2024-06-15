import { warn } from "console";
import { App, FrontmatterLinkCache, EventRef, LinkCache, TFolder, TFile } from "obsidian";
import { DataviewApi, getAPI, Link } from "obsidian-dataview";
import { Subscriber } from "svelte/motion";
import { Writable, writable } from "svelte/store";

type MetadataViewStore = Writable<MDV_File>

const EMPTY_STORE: MDV_File = {
  types: [],
  tags: [],
  inlineTags: [],
  propGroups: [],
  freelinks: [],
  backlinks: [],
  embeds: []
};

/**
 * Functions
 * refresh()
 * 
 * Exports:
 * subscribe(app) : used by View 
 * updateField(k, v) : used by Component
 * 
 * Variables:
 * _app
 * _activeFile?
 * _store
 */

let _app: App;
let _activeFile: TFile | null;
let _store: MetadataViewStore;

export async function initialize(app: App) {
  _app = app;
  _activeFile = app.workspace.getActiveFile();

  let stale = true;
  let store: Writable<MDV_File>;
  let refOpen: EventRef;
  let refChanged: EventRef;

  const setData = (fileData: MDV_File) => {
    store.set(fileData);
    stale = false;
    return fileData;
  };

  _store = store = writable(EMPTY_STORE, (set, update) => {

    refOpen = app.workspace.on("file-open", (file) => {
      _activeFile = file;
      refresh().then(setData);
    });

    // TODO: refChanged = (getAPI()) ? md-change : change;

    if (getAPI(app)) {
      // // @ts-ignore
      // app.metadataCache.on('dataview:index-ready', () => console.log('dataview:index-ready'));
      //@ts-ignore
      refChanged = app.metadataCache.on('dataview:metadata-change', (type, file) => {
        if (file === _activeFile && !stale) {
          stale = true;
          refresh().then(setData);
        }
      });
    } else {
      refChanged = app.metadataCache.on("changed", (file) => {
        if (file === _activeFile && !stale) {
          stale = true;
          refresh().then(setData);
        }
      });
    }

    return () => {
      app.workspace.offref(refOpen);
      app.metadataCache.offref(refChanged);
    };
  });

  return await refresh().then(setData);
}

export function subscribe(app: App, run: Subscriber<MDV_File>) {
  return _store.subscribe(run);
}


export async function updateField(name: string, value: string | string[]) {
  if (!_activeFile) {
    warn('MDV: Attempted to updateField without activeFile');
    return;
  }

  // @ts-ignore
  const mdm: IMetadataMenuApi = _app.plugins.plugins["metadata-menu"].api;

  if (mdm) {
    await mdm.postNamedFieldsValues(_activeFile.path, [{ name, payload: { value } }]);
  } else {
    await _app.fileManager.processFrontMatter(_activeFile, (fm) => {
      fm[name] = value;
    });
  }
}



function isLink(v?: any): boolean {
  if (!v) return false;
  return v[0]?.constructor?.name === 'Link'
}

function getTemplatesMap(dir: TFolder) {
  const map: Record<string, TFile> = {};
  const folderQueue = [dir];
  let currentDir: TFolder | undefined;
  while ((currentDir = folderQueue.pop())) {
    for (let child of currentDir.children) {
      if (child instanceof TFile) {
        map[child.name] = child;
      } else if (child instanceof TFolder) {
        folderQueue.push(child);
      }
    }
  }
  return map;
}

function getPropertyInfo(propertyInfos: any, key: string, value: any) {
  const propertyInfo = propertyInfos[key];
  return propertyInfo
    ? propertyInfo.type
    : (Array.isArray(value))
      ? "multitext"
      : "text";
}

// function (key) => {
//   const _k = key.toLowerCase();
//   if (usedKeysMap[_k]) return;
//   usedKeysMap[_k] = true;
//   keys.push(key);
// }


async function refresh() {
  const app = _app;
  const activeFile = _activeFile;
  console.log('refreshing -1', activeFile);
  if (!activeFile) return EMPTY_STORE;
  
  const metadataCache = app.metadataCache as MDV_MetadataCache;
  const fileCache = metadataCache.getFileCache(activeFile);
  // @ts-ignore
  const settings: MetadataViewSettings = app.plugins.plugins['MetadataView'].settings;
  console.log('refreshing 01');
  // @ts-ignore
  const templatesDir: TFolder = app.vault.getFolderByPath(settings.templatesDir);
  console.log('refreshing 02');
  if (!fileCache || !templatesDir) {
    console.warn('MDV: FileCache or templates directory not Found');
    return EMPTY_STORE;
  }
  
  const frontmatter = fileCache.frontmatter || {};
  const page = getAPI(app)?.page(activeFile.path);
  const types: string[] = [];
  const tags: string[] = [];
  const inlineTags: InlineTagData[] = [];
  const propGroups: MDV_PropGroup[] = [{ name: '', props: {} }];
  const propGroupMap: Record<string, MDV_PropGroup> = { '': propGroups[0] };
  const propGroupKeyMap: Record<string, MDV_PropGroup> = {};
  const freelinks: LinkCache[] = fileCache.links || [];
  const backlinks: BacklinkData[] = [];
  const embeds: EmbedData[] = [];
  console.log('refreshing 04');
  const propertyInfos = metadataCache.getAllPropertyInfos();
  const frontmatterBacklinksMap: Record<string, BacklinkData[]> = {};
  const embedsMap: Record<string, EmbedData[]> = {};

  const templateMap: Record<string, TFile> = getTemplatesMap(templatesDir);
  
  console.log('refreshing0');
  // @ts-ignore
  Object.entries((metadataCache.getBacklinksForFile(activeFile).data as Record<string, BacklinkData[]>))
    .forEach(([filename, fileData]) => {
      for (let backlinkData of fileData) {
        let key = backlinkData.key;
        if (key) {
          const [k, i] = key.split('.');
          const keyBacklinks = frontmatterBacklinksMap[k] || (frontmatterBacklinksMap[k] = []);
          keyBacklinks.push(backlinkData);
        } else {
          backlinks.push(backlinkData);
        }
      }
    });

  // Q: what is the point of checking the page object? A: Inline fields
  const keys: string[] = [];
  const usedKeysMap: Record<string, boolean> = { file: true };
  const registerKey = (key: string) => {
    const _k = key.toLowerCase();
    if (usedKeysMap[_k]) return;
    usedKeysMap[_k] = true;
    keys.push(key);
    console.log('adding key', key);
  };
  
  if (page) Object.keys(page).sort().forEach(registerKey);
  Object.keys(frontmatter).forEach(registerKey);
  
  console.log('refreshing1');
  
  if (usedKeysMap[settings.typesProp.toLowerCase()]) {
    console.log('detected types prop');
    let _types: string[] = frontmatter[settings.typesProp];
    // @ts-ignore
    if (!Array.isArray(_types)) _types = [_types];
    const typeQueue: string[] = [..._types];
    const visited: Record<string, true> = {};
    
    let _t: string | undefined;
    while ((_t = typeQueue.pop())) {
      console.log('processing', _t);
      // Get TFILE + cache
      if (visited[_t]) continue;
      visited[_t] = true;
      let _f : TFile = templateMap[_t + '.md'];
      if (!_f) continue;  // TODO: Emit Warning
      let _fm = metadataCache.getFileCache(_f)?.frontmatter;
      if (!_fm) continue;  // TODO: Emit Warning

      console.log('found file', _t);
      types.push(_t);

      // Initialize propGroup
      const props: Record<string, MDV_Prop> = {};
      const propGroup : MDV_PropGroup = { name: _t, props };
      propGroupMap[_t] = propGroup;
      propGroups.push(propGroup);

      for (let [key, value] of Object.entries(_fm)) {
        // Either add key to type group or add types to queue
        if (key === settings.typesProp) {
          if (Array.isArray(value)) {
            value.reduce((q, c) => { q.push(c); return q; }, typeQueue);
          } else if (typeof(value) === "string") {
            typeQueue.push(value);
          }
        } else if (key === "tag") {
          tags.push(value);
        } else if (key === "tags") {
          ;(value as string[]).reduce((tags, v) => { tags.push(v); return tags; }, tags);
        } else {
          console.log('adding to default group', key);
          props[key] = { key, default: value, type: getPropertyInfo(propertyInfos, key, value) };
          propGroupKeyMap[key] = propGroup;
        }
      }
    }

    keys.remove(settings.typesProp);
    keys.remove("tag");
    keys.remove("tags");
  }
  
  console.log('refreshing2');
  
  keys.forEach((key) => {
    // let value = frontmatter[key];
    // if (value === undefined) value = (page ? page[key] : undefined); // prefer values from frontmatter.
    let value = frontmatter[key] || (page ? page[key] : undefined); // prefer values from frontmatter.
    const _type: FieldValueType = getPropertyInfo(propertyInfos, key, value);
    const props = (propGroupMap[key] || propGroupMap['']).props;
    const prop = props[key] || (props[key] = { key, value, default: '', type: "text" });
    prop.value = value;
    prop.backlinks = frontmatterBacklinksMap[key];
    prop.embeds = embedsMap[key];
  });
  
  // backlinks?
  // embeds?

  const data: MDV_File = {
    types,
    tags,
    inlineTags,
    propGroups,
    freelinks,
    backlinks,
    embeds
  };

  console.log('store:', data);
  return data;
}
