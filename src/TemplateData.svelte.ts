import { SvelteSet } from 'svelte/reactivity'
import { arrayWrap, truthy } from './utils';
import { VALID_TYPES } from './constants';

export default class TemplateData {
  public types: SvelteSet<string>;
  public aliases: SvelteSet<string>;
  public cssclasses: SvelteSet<string>;
  public tags: SvelteSet<string>;
  public props: Record<string, MVPropDef> = $state({});

  constructor(frontmatter: FrontMatter) {
    const { types, aliases, tags, cssclasses, ...props } = frontmatter;

    this.types = new SvelteSet(arrayWrap(types).filter(truthy));
    this.aliases = new SvelteSet(arrayWrap(aliases).filter(truthy));
    this.tags = new SvelteSet(arrayWrap(tags).filter(truthy));
    this.cssclasses = new SvelteSet(arrayWrap(cssclasses).filter(truthy));

    const p = this.props;
    for (let [k,v] of Object.entries(props)) {
      p[k] = extractPropConfig(v);
    }
  }
}

function extractPropConfig(v: FrontMatterValue): MVPropDef {
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
      for (let t of <Array<FrontMatterValue>>v.elementTypes) {
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
      for (let [key, value] of Object.entries(<FrontMatter>configs)) {
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
        default: v.default,
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

function makeJsonProp(v: FrontMatterValue): MVJsonDef {
  return { type: 'json', default: v };
}
