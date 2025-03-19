import { VALID_TYPES } from './constants';

export const arrayWrap = (v: unknown) => Array.isArray(v) ? v : (v === undefined) ? [] : [v];
export const truthy = (v: any) => v;

export function makePropTemplate(v: FrontMatterValue): MVPropDef | null {
  switch(typeof v) {
    case 'boolean':
      return {
        type: 'boolean',
        default: v,
      };
    case 'number':
      return {
        type: 'number',
        default: v,
      };
    case 'string':
      return {
        type: 'text',
        default: v,
      };
    
    case 'object':
      return parseObject(v as Record<string, FrontMatterValue>);

    default:
      return null;
  }
}

function parseObject(v: Record<string, FrontMatterValue>): MVPropDef | null {
  if (v === null || !('type' in v)) return null;
  
  const type = v.type;
  if (typeof type !== 'string' || !VALID_TYPES[type]) return null;
  
  let config;
  
  switch (type) {
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
      } else {
        return {
          type,
          options: []
        };
      }

    case 'array':
      config = makePropTemplate(v.elementType);
      return {
        type,
        elementType: config || { type:'text' },
      };

    case 'tuple':
      let types = v.elementTypes;
      if (!(types instanceof Array)) types = [];
      config = [];

      for (let t of types) {
        let c = makePropTemplate(t);
        if (c) config.push(c);
      }

      return {
        type,
        elementTypes: config,
      };

    case 'record':
      let configs = v.entries;
      if (typeof configs !== 'object') configs = {};
      config = <Record<string, MVPropDef>>{};
      
      for (let [key, value] of Object.entries(<FrontMatter>configs)) {
        let c = makePropTemplate(value);
        if (c) config[key] = c;
      }

      return {
        type,
        entries: config,
      };

    default:
      return <MVPropDef><unknown>v;
  }
}

// function extractBool(def: Record<string, unknown>, k: string, v: unknown) {
//   if (typeof v === 'boolean') def[k] = v;
// }

// function extractNumber(v: unknown): number | null {
//   if (typeof v === 'number') return v;
//   return null;
// }

// function extractString(v: unknown): string | null {
//   if (typeof v === 'string') return v;
//   return null;
// }

// function makeJsonProp(v: FrontMatterValue): MVJsonDef {
//   return { type: 'json', default: v };
// }
