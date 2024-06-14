import { warn } from "console";
import { App, FrontmatterLinkCache, EventRef } from "obsidian";
import { DataviewApi, getAPI, Link } from "obsidian-dataview";
import { Subscriber } from "svelte/motion";
import { Writable, writable } from "svelte/store";

type MetadataViewStore = Writable<FileData>

const INPUT = 'Input';
const DATE = 'Date';
const MULTI = 'Multi';
const NUMBER = 'Number';
const BOOLEAN = 'Boolean';

const EMPTY_STORE: FileData = {
  fileClassAlias: '',
  fileClassField: undefined,
  fields: [],
  classData: [],
  links: [],
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
  let store: Writable<FileData>;
  let refOpen: EventRef;
  let refChanged: EventRef;

  const setData = (fileData: FileData) => {
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

export function subscribe(app: App, run: Subscriber<FileData>) {
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


async function refresh() {
  const app = _app;
  const activeFile = _activeFile;
  if (!activeFile) return EMPTY_STORE;
  const metadataCache = app.metadataCache;
  const fileCache = metadataCache.getFileCache(activeFile);
  const frontmatter = fileCache?.frontmatter || {};
  if (!fileCache) {
    warn('MDV: FileCache not Found');
    return EMPTY_STORE;
  }
  
  const dv = getAPI(this.app);
  const page = dv?.page(activeFile.path);
  // @ts-ignore
  const mdm = app.plugins.plugins["metadata-menu"];
  
  const mdmFieldsMap: Record<string, IFieldInfo> = {};
  const fieldArray: FieldData[] = [];
  const fileClassArray: FileClassData[] = [];
  const fileClassMap: Record<string, FileClassData> = {};
  const fileClassAlias = mdm?.settings.fileClassAlias as string | undefined;
  
  const frontmatterLinksMap: Record<string, FrontmatterLinkCache> = (fileCache.frontmatterLinks || []).reduce(
    (frontmatterLinksMap, link) => {
      frontmatterLinksMap[link.key] = link;
      return frontmatterLinksMap;
    }, {} as Record<string, FrontmatterLinkCache>);
    
    // @ts-ignore
    const propertyInfos: Record<string, PropertyInfo> = metadataCache.getAllPropertyInfos();
    const inlineLinksArray: InlineLinkData[] = fileCache.links?.map((linkCache) => {
      return {
        filename: activeFile.name,
        displayText: linkCache.displayText || linkCache.original,
        link: linkCache.link,
        line: linkCache.position.start.line,
      }
    }) || [];
    
    const frontmatterBacklinksMap: Record<string, InlineLinkData[]> = {};
    const inlineBacklinksArray: InlineLinkData[] = [];
    
    // @ts-ignore
    Object.entries((metadataCache.getBacklinksForFile(activeFile).data as Record<string, RawBacklinkData[]>))
    .forEach(([filename, fileData]) => {
      for (let { displayText, key, original, link, position } of fileData) {
        const backlinkData = {
          filename,
          displayText: displayText || original,
          link: link,
          line: position.start.line,
        };
        if (key) {
          const [k, i] = key.split('.');
          const keyBacklinks = frontmatterBacklinksMap[k] || (frontmatterBacklinksMap[k] = []);
          keyBacklinks.push(backlinkData);
        } else {
          inlineBacklinksArray.push(backlinkData);
        }
      }
    });
    
    if (mdm) {
      await mdm.api.fileFields(activeFile).then((fileFields: Record<string, IFieldInfo>) => {
        Object.values(fileFields).forEach((field) => {
          mdmFieldsMap[field.name] = field;
          if (field.name === fileClassAlias) {
            const value = frontmatter[field.name] as (string | string[]);
            if (typeof value === 'string') {
              if (!value) return; // skip empty string
              const fileClassData = fileClassMap[value] = {
                name: value,
                fields: [],
              };
              fileClassArray.push(fileClassData);
            } else {
              value.forEach(fileclass => {
                if (!fileclass) return; // skip empty strings
                const fileClassData = fileClassMap[fileclass] = {
                  name: fileclass,
                  fields: [],
                };
                fileClassArray.push(fileClassData);
              });
            }
          }
        });
      });
    }
    
    let fileClassField: FieldData | undefined;
    
    // Q: what is the point of checking the page object? A: Inline fields
    const keys: string[] = [];
    const usedKeysMap: Record<string, boolean> = { file: true };
    if (page) {
      Object.keys(page).sort().forEach((key) => {
        if (usedKeysMap[key.toLowerCase()]) return;
        usedKeysMap[key.toLowerCase()] = true;

        keys.push(key);
      });
    }
    
    Object.keys(frontmatter).forEach((key) => {
      if (usedKeysMap[key.toLowerCase()]) return;
      usedKeysMap[key.toLowerCase()] = true;
      keys.push(key);
    }); 

    keys.forEach((key) => {
      let value = frontmatter[key];
      if (value === undefined) value = (page ? page[key] : undefined);
      // const value = frontmatter[key] || (page ? page[key] : undefined); // prefer values from frontmatter.

      let { indexedPath, type, fileClassName, options } = mdmFieldsMap[key] || {};
      let fieldData: FieldData;
      
      // Search for type info for non-class fields
      if (!type) {
        const propertyInfo = propertyInfos[key];
        if (propertyInfo) {
          switch (propertyInfo.type) {
            case 'text':
            type = INPUT;
            break
            case 'multitext':
            type = MULTI;
            break
            case 'number':
            type = NUMBER;
            break
            case 'checkbox':
            type = BOOLEAN;
            break
            case 'date':
            type = DATE;
            break
            case 'datetime':
            type = DATE;
            break
            default:
            type = INPUT;
          }
        } else {
          type = INPUT;
        }
      }
      
      // @ts-ignore
      fieldData = { indexedPath, type, key, value, options };
      
      if (value instanceof Array) {
        if (isLink(value[0])) {
          const links: LinkData[] = fieldData.links = [];
          (value as Link[]).forEach((v, i) => {
            value[i] = v.markdown();
            links.push({
              displayText: v.display || v.toString(),
              link: v.obsidianLink(),
            });
          });
        } else {
          let fml = frontmatterLinksMap[`${key}.0`];
          if (frontmatterLinksMap[`${key}.0`]) {
            const links: LinkData[] = fieldData.links = [];
            value.forEach((v, i) => {
              fml = frontmatterLinksMap[`${key}.${i}`];
              // TODO: use obsidian's Reference objects directly?
              if (fml) {
                links[i] = {
                  displayText: fml.displayText || fml.link,
                  link: fml.link,
                };
              }
            });
          }
        }
      } else if (isLink(value)) {
        fieldData.links = [{
          displayText: (value as Link).display || (value as Link).toString(),
          link: (value as Link).obsidianLink(),
        }];
      } else {
        const fml = frontmatterLinksMap[key];
        if (fml) {
          fieldData.links = [{
            displayText: fml.displayText || fml.link,
            link: fml.link,
          }];
        }
      }
      
      // frontmatterBacklinksMap[key] && (fieldData.backlinks = frontmatterBacklinksMap[key]);
      fieldData.backlinks = frontmatterBacklinksMap[key];
      
      if (key === fileClassAlias) {
        if (typeof fieldData.value === 'string')
          fieldData.value = [fieldData.value];
        fileClassField = fieldData;
      } else if (fileClassName) {
        fileClassMap[fileClassName].fields.push(fieldData);
      } else {
        fieldArray.push(fieldData);
      }
      
      // fieldMap[key] = fieldData;
    });
    
    const data: FileData = {
      fileClassAlias,
      fileClassField,
      fields: fieldArray,
      classData: fileClassArray,
      links: inlineLinksArray,
      backlinks: inlineBacklinksArray,
      embeds: [],
    };
    
    console.log('store:', data);
    return data;
  }
  