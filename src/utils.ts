import { VALID_TYPES } from './const';

export const arrayWrap = (v: unknown) => Array.isArray(v) ? v : (v === undefined) ? [] : [v];
export const truthy = (v: any) => v;

export function makePropTemplate(v: FrontMatterValue): MVPropDef | null {
  let t = typeof v;
  switch(t) {
    case 'boolean':
    case 'number':
    case 'string':
      return {
        type: (t === 'string') ? 'text' : t,
        default: <any>v,
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
            (opts: Array<string>, v) => {
              const t = typeof v;
              if (t === 'string')
                opts.push(<string>v);
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

    case 'map':
      config = makePropTemplate(v.elementType);
      return {
        type,
        elementType: config || { type: 'text' },
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


export function createValue(template: MVPropDef = { type: 'json' }) {
  switch (template.type) {
    case 'boolean':
      return template.default || false;
    case 'number':
      return template.default || 0;
    case 'text':
      return template.default || '';
    case 'date':
      return template.default || '';
    case 'datetime-local':
      return template.default || '';
    case 'time':
      return template.default || '';
    case 'month':
      return template.default || '';
    case 'select':
      return '';
    case 'multi':
      return [];
    case 'link':
      return null;
    case 'array':
      return [];
    case 'tuple':
      return [];
    case 'map':
      return {};
    case 'record':
      return {};
    case 'json':
      return template.default || '';
    default:
      return null;
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
