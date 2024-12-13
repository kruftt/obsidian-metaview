import { TAbstractFile, TFile, TFolder } from 'obsidian'
import { SvelteSet } from 'svelte/reactivity'
import type MetaViewPlugin from '../main'

class MVStore {
  public data: MVFileData | null = $state.raw(null);
  
  private templateCache: Record<string, MVTemplateData> = $state({});
  // private templateCache: SvelteMap<string, MVTemplateData> = new SvelteMap();
  private templateNameRegex: RegExp;
  private updating: Boolean = false;
  
  private _file: TFile | null = null;
  get file(): TFile | null { return this._file; }
  set file(file: TFile | null) {
    this._file = file;
    if (file === null || file.extension !== '.md') {
      this.data = null;
    } else if (file.path.startsWith(this._plugin.settings.templatesPath)) {
      this.data = this.templateCache[this.getTemplateName(file.path)];
    } else {
      this.data = this.makeNoteData(file);
    }
  }

  private _plugin: MetaViewPlugin;
  // get plugin(): MetaViewPlugin { return this._plugin }
  set plugin(plugin: MetaViewPlugin) {
    this._plugin = plugin;
    this.templateNameRegex = new RegExp(
      '^' + plugin.settings.templatesPath + TEMPLATE_NAME_REGEX
    );
    this.makeCache();
  }

  private getTemplateName(path: string) {
    return this.templateNameRegex.exec(path)![1];
  }

  public makeTemplate(file: TFile) {
    const frontmatter = this._plugin.app.metadataCache.getFileCache(file)?.frontmatter || {};
    
    const types: SvelteSet<string> = new SvelteSet();
    const aliases: SvelteSet<string> = new SvelteSet();
    const cssclasses: SvelteSet<string> = new SvelteSet();
    const tags: SvelteSet<string> = new SvelteSet();
    const defs: Record<string, MVPropDef> = $state({});
    const data = $state({ aliases, types, cssclasses, tags, defs });
    
    for (let [k, v] of Object.entries(frontmatter)) {
      switch (k) {
        case 'aliases':
        case 'types':
        case 'tags':
        case 'cssclasses':
          if (Array.isArray(v)) {
            const target = data[k];
            v.forEach((v) => target.add(v));
          }
          else data[k].add(v);
          break;
        default:
          defs[k] = extractPropConfig(v);
          break;
      }
    }

    this.removeTemplate(file);    

    const templateCache = this.templateCache;
    const templateName = this.getTemplateName(file.path);

    for (let alias of aliases) {
      templateCache[alias] = data;
    }

    templateCache[templateName] = data;
    return data;
  }

  public removeTemplate(file: TFile) {
    const templateCache = this.templateCache;
    const templateName = this.getTemplateName(file.path);
    let template = templateCache[templateName];
    let alias: string;

    if (template) {
      for (alias of template.aliases) {
        delete templateCache[alias];
      }
    }
    
    delete templateCache[templateName];
  }

  private makeCache() {
    const plugin = this._plugin;
    const { templatesPath } = plugin.settings;
    this.templateCache = {};

    const typesDir = plugin.app.vault.getFolderByPath(templatesPath);
    if (typesDir === null) {
      console.warn("MV: Could not find templates directory: ", templatesPath);
      return;
    }

    const directoryQueue: TFolder[] = [typesDir];
    let currentDirectory: TFolder | undefined;

    while (currentDirectory = directoryQueue.pop()) {
      for (let entry of currentDirectory.children) {
        if (entry instanceof TFile) {
          this.makeTemplate(entry);
        } else {
          directoryQueue.push(<TFolder>entry);
        }
      }
    }
  }

  private makeNoteData(file: TFile): MVNoteData {
    const frontmatter = this._plugin.app.metadataCache.getFileCache(file)?.frontmatter;
    // if (!frontmatter) return null;
    
    // const types: string[] = $state(arrayWrap(frontmatter!.types));
    // const aliases: string[] = $state(arrayWrap(frontmatter!.aliases));
    const types = new SvelteSet(arrayWrap(frontmatter!.types));
    const aliases = new SvelteSet(arrayWrap(frontmatter!.aliases));
    
    const tags = new SvelteSet(arrayWrap(frontmatter!.tags));
    const cssclasses = new SvelteSet(arrayWrap(frontmatter!.cssclasses));

    const props: Record<string, FMValue> = $state({ ...frontmatter! });
    delete props['aliases'];
    delete props['tags'];
    delete props['cssclasses'];

    const data = <MVNoteData><unknown>$state.raw({
      types,
      aliases,
      tags,
      cssclasses,
      props,
    });
    
    const templateCache = this.templateCache;

    $effect(() => {
      const freeProps: Set<string> = new SvelteSet(Object.keys(props));
      const typeData: Record<string, MVTemplateData> = $state({});

      const typeQueue: string[] = [...types];  
      const completedTypes: Record<string, boolean> = {};
      let type: string | undefined;
      let templateData: MVTemplateData;
      
      while (type = typeQueue.pop()) {
        if (completedTypes[type]) continue;
        completedTypes[type] = true;
        templateData = templateCache[type];
        if (!templateData) continue;
        typeData[type] = templateData;
        for (let propKey of Object.keys(templateData.defs)) {
          freeProps.delete(propKey);
        }
      }

      data.freeProps = freeProps;
      data.typeData = typeData;
    });

    // console.log('built note data');
    return data;
  }

  public updateFile(file: TFile) {
    if (file.extension !== 'md') return;
    if (file === this._file && this.updating) {
      this.updating = false;
      return;
    }

    if (file.path.startsWith(this._plugin.settings.templatesPath)) {
      this.makeTemplate(file);
    }

    if (file === this._file) this.file = file; // triggers data update
  }

  public renameFile(file: TFile, oldPath: string) {
    const { templatesPath } = this._plugin.settings;
    const templateCache = this.templateCache;

    if (oldPath.startsWith(templatesPath)) {
      const oldName = this.getTemplateName(oldPath);
      if (file.path.startsWith(templatesPath)) {
        templateCache[this.getTemplateName(file.path)] = templateCache[oldName];
      }
      delete templateCache[oldName];
    } else {
      if (file.path.startsWith(templatesPath)) {
        this.makeTemplate(<TFile>file);
      }
    }
  }

  public setProperty(address: string[], key: string, value: FMValue | null = null) {
    this.updating = true;
    // const keys = address.split(KEY_SEPARATOR);
    // const key = <string>keys.pop();

    this._plugin.app.fileManager!.processFrontMatter(this._file!, (frontmatter) => {
      let target = frontmatter;
      for (let k of address) target = <Record<string, Record<string, FMValue>>>target[k];
      if (value === null) delete target[key];
      else target[key] = value;
    });
  }

  public insertMetaValue(prop: string, value: string) {
    this.updating = true;
    this._plugin.app.fileManager!.processFrontMatter(this._file!, (frontmatter) => { frontmatter[prop].push(value); });
    if (prop === 'aliases' && this._file!.path.startsWith(this._plugin.settings.templatesPath)) {
      this.templateCache[value] = <MVTemplateData>this.data;
    }
  }

  public removeMetaValue(prop: string, value: string) {
    this.updating = true;
    this._plugin.app.fileManager!.processFrontMatter(this._file!, (frontmatter) => {
      const arr = frontmatter[prop];
      const idx = arr.indexOf(prop);
      if (idx > -1) arr.splice(idx, 1);
    });
    if (prop === 'aliases' && this._file!.path.startsWith(this._plugin.settings.templatesPath)) {
      delete this.templateCache[value];
    }
  }
}


const TEMPLATE_NAME_REGEX = "(?:\/)?(.+).md$";
const VALID_TYPES: Record<string, true> = {
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
}

const arrayWrap = (v: unknown) => Array.isArray(v) ? v : (v === undefined) ? [] : [v];
const reduceTrue = (record: Record<string, boolean>, v: string) => { record[v] = true; return record; };
const makeRecord = (v: undefined | string | string[]) => { return arrayWrap(v).reduce(reduceTrue, {}); }

function extractPropConfig(v: FMValue): MVPropDef {
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
      // if (config === null) return null;
      if (config === null) return makeJsonProp(v);
      return {
        type,
        elementType: config,
      };
    case 'tuple':
      config = [];
      for (let t of <Array<FMValue>>v.elementTypes) {
        let c = extractPropConfig(t);
        // if (c === null) return null;
        if (c === null) return makeJsonProp(v);
        config.push(c);
      }
      return {
        type,
        elementTypes: config,
      };
    case 'record':
      const configs = v.entries;
      // if (typeof configs !== 'object') return null;
      if (typeof configs !== 'object') return makeJsonProp(v);
      config = <Record<string, MVPropDef>>{};
      for (let [key, value] of Object.entries(<Record<string, FMValue>>configs)) {
        let c = extractPropConfig(value);
        // if (c === null) return null;
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
      // return null;
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

function makeJsonProp(v: FMValue): MVJsonDef {
  return { type: 'json', value: v };
}


export default new MVStore();
