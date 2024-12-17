import { TAbstractFile, TFile, TFolder } from 'obsidian'
import { SvelteSet } from 'svelte/reactivity'
import type MetaViewPlugin from '../main'

class MVStore {
  public data = $state.raw <MVFileData | null>(null);
  
  private templateCache = $state<Record<string, MVTemplateData>>({});  
  private templateNameRegex: RegExp;
  private updating: Boolean = false;
  
  private _file: TFile | null = null;
  get file(): TFile | null { return this._file; }
  set file(file: TFile | null) {
    this._file = file;
    if (file === null || file.extension !== 'md') {
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
    const props: Record<string, MVPropDef> = $state({});
    const data = $state({ aliases, types, cssclasses, tags, props });
    
    for (let [k, v] of Object.entries(frontmatter)) {
      switch (k) {
        case 'aliases':
        case 'types':
        case 'tags':
        case 'cssclasses':
          if (Array.isArray(v)) {
            const target = data[k];
            v.forEach((v) => v && target.add(v));
          }
          else data[k].add(v);
          break;
        default:
          props[k] = extractPropConfig(v);
          break;
      }
    }

    const templateName = this.getTemplateName(file.path);
    this.removeTemplate(templateName);   
    this.addTemplate(templateName, data);
    return data;
  }

  private removeTemplate(name: string) {
    const templateCache = this.templateCache;
    let template = templateCache[name];
    if (!template) return;
    
    delete templateCache[name];
    for (let alias of template.aliases) {
      delete templateCache[alias];
    }
  }

  private addTemplate(name: string, template: MVTemplateData) {
    const templateCache = this.templateCache;
    templateCache[name] = template;
    for (let alias of template.aliases) {
      templateCache[alias] = template;
    }
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
    const frontmatter = this._plugin.app.metadataCache.getFileCache(file)?.frontmatter || {};
    // if (!frontmatter) return null;
    const types = new SvelteSet(arrayWrap(frontmatter.types).filter(truthy));
    const aliases = new SvelteSet(arrayWrap(frontmatter.aliases).filter(truthy));
    const tags = new SvelteSet(arrayWrap(frontmatter.tags).filter(truthy));
    const cssclasses = new SvelteSet(arrayWrap(frontmatter.cssclasses).filter(truthy));

    const props: Record<string, FMValue> = $state({ ...frontmatter });
    delete props['aliases'];
    delete props['tags'];
    delete props['cssclasses'];
    delete props['types'];

    const data = <MVNoteData><unknown>{
      types,
      aliases,
      tags,
      cssclasses,
      props,
    };
    
    this.updateTypeData(data);
    return data;
  }

  private updateTypeData(data: MVNoteData = <MVNoteData>this.data) {
    const templateCache = this.templateCache;
    const freeProps: Set<string> = new SvelteSet(Object.keys(data.props));
    const typeData: Record<string, MVTemplateData> = $state({});

    const typeQueue: string[] = [...data.types];
    const completedTypes: Record<string, boolean> = {};
    let type: string | undefined;
    let templateData: MVTemplateData;

    while (type = typeQueue.pop()) {
      if (completedTypes[type]) continue;
      completedTypes[type] = true;
      templateData = templateCache[type];
      if (!templateData) continue;
      typeData[type] = templateData;
      for (let propKey of Object.keys(templateData.props)) {
        freeProps.delete(propKey);
      }
    }

    data.freeProps = freeProps;
    data.typeData = typeData;
  }

  public updateFile(file: TFile) {
    if (file.extension !== 'md') return;
    if (file === this._file && this.updating) {
      this.updating = false;
      return;
    }

    if (file.path.startsWith(this._plugin.settings.templatesPath)) {
      this.makeTemplate(file);
      if (this.data && (<MVNoteData>this.data).typeData) {
        this.updateTypeData();
      }
    }

    if (file === this._file) this.file = file; // triggers data update
  }

  public renameFile(file: TAbstractFile, oldPath: string) {
    if (!(file instanceof TFile)) return;
    const { templatesPath } = this._plugin.settings;
    const templateCache = this.templateCache;

    if (oldPath.startsWith(templatesPath)) {
      const oldName = this.getTemplateName(oldPath);
      if (file.path.startsWith(templatesPath)) {
        templateCache[this.getTemplateName(file.path)] = templateCache[oldName];
        delete templateCache[oldName];
      } else {
        this.removeTemplate(oldName);
      }
    } else {
      if (file.path.startsWith(templatesPath)) {
        this.makeTemplate(<TFile>file);
      }
    }

    if (this.data && (<MVNoteData>this.data).typeData) {
      this.updateTypeData();
    }
  }

  public deleteFile(file: TFile) {
    if (file.extension === 'md' && file.path.startsWith(this._plugin.settings.templatesPath)) {
      this.removeTemplate(this.getTemplateName(file.path));
    }
  }

  public setProperty(key: string, value: FMValue | null, address: string[] = []) {
    this.updating = true;

    this._plugin.app.fileManager!.processFrontMatter(this._file!, (frontmatter) => {
      let target = frontmatter;
      for (let k of address) target = <Record<string, Record<string, FMValue>>>target[k];
      if (value !== null) {
        target[key] = value;
      } else {
        delete target[key];
        if (address.length == 0) {
          const freeProps = (<MVNoteData>this.data!).freeProps;
          if (freeProps) freeProps.delete(key);
        }
      }
    });
  }

  public insertFilePropValue(prop: MVFilePropType, value: string) {
    if (prop === 'aliases') {
      if (this._file!.path.startsWith(this._plugin.settings.templatesPath)) {
        this.templateCache[value] = <MVTemplateData>this.data;
      }
    } else if (prop === 'types') {
      if (!this._file!.path.startsWith(this._plugin.settings.templatesPath)) {
        this.updateTypeData();
      }
    }

    this.updating = true;
    this._plugin.app.fileManager!.processFrontMatter(this._file!, (frontmatter) => {
      frontmatter[prop] = Array.from((this.data!)[prop]);
    });
  }

  public removeFilePropValue(prop: MVFilePropType, value: string) {
    if (prop === 'aliases') {
      if (this._file!.path.startsWith(this._plugin.settings.templatesPath)) {
        delete this.templateCache[value];
      }
    } else if (prop === 'types') {
      if (!this._file!.path.startsWith(this._plugin.settings.templatesPath)) {
        this.updateTypeData();
      }
    }

    this.updating = true;
    this._plugin.app.fileManager!.processFrontMatter(this._file!, (frontmatter) => {
      const valueArray = Array.from((this.data!)[prop]);
      if (valueArray.length > 0) frontmatter[prop] = Array.from((this.data!)[prop]);
      else delete frontmatter[prop];
    });
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
const truthy = (v: any) => v;

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
        default: extractBool(v.checked),
      };
    case 'text':
      return {
        type,
        default: extractString(v.value),
        minlength: extractNumber(v.minlength),
        maxlength: extractNumber(v.maxlength),
        pattern: extractString(v.pattern),
      };
    case 'number':
      return {
        type,
        default: extractNumber(v.value),
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
        default: extractString(v.value),
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
        default: v,
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
  return { type: 'json', default: v };
}


export default new MVStore();
