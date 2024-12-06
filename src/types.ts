/**
 * dont put meta props in type sections, but use them as a multiselect
 */

interface MVSettings {
  typesPath: string;
}

interface MVFileDataBase {
  types: string[]
  aliases: string[] // Aliases for this type? object/person person
  tags: string[]
  cssclasses: string[]
  // props: Record<string, JSONValue> // in a template these are default values?
}

// configs stored by path with template and .md removed
interface MVTypeData extends MVFileDataBase {
  defs: Record<string, MVPropDef>
}

interface MVNoteData extends MVFileDataBase {
  props: Record<string, JSONValue>
  boundAliases: Record<string, Record<string, boolean>> // type: alias: active?
  boundTags: Record<string, Record<string, boolean>> 
  boundCss: Record<string, Record<string, boolean>> 
  boundProps: Record<string, Record<string, MVPropData>> // type: key: data
}

type MVFileData = MVNoteData | MVTypeData;

// interface MVStoreState {
//   data: MVFileData | null
//   isTypeDef: boolean
// }

interface MVPropData {
  value: JSONValue
  def: MVPropDef
}

type MVPropDef =
  | MVJsonDef
  | MVBoolDef
  | MVNumberDef
  | MVTextDef
  | MVDateDef
  | MVDateTimeDef
  | MVTimeDef
  | MVMonthDef
  | MVLinkDef
  | MVSelectDef
  | MVMultiDef
  // | MVOptionsDef
  | MVArrayDef
  | MVTupleDef
  | MVRecordDef

interface MVPropDefBase {
  // key: string
  // address: string 
  // Here or provided by component, what about free props?
  // free props are json props .. 
  // what about nested property addresses?
  // The config prop itself must have an address .. so to be uniform it cannot use the def
}

interface MVJsonDef extends MVPropDefBase {
  type: 'json'
  value: JSONValue
}

interface MVBoolDef extends MVPropDefBase {
  type: 'boolean'
  checked: boolean | null
}

interface MVNumberDef extends MVPropDefBase {
  type: 'number'
  value: number | null
  min: number | null
  max: number | null
  step: number | null
}

interface MVTextDef extends MVPropDefBase {
  type: 'text'
  value: string | null
  minlength: number | null
  maxlength: number | null
  pattern: string | null
}

// interface MVDateTimeDef extends MVPropDefBase {
//   type: 'date' | 'datetime' | 'time' | 'month'
//   value: string | null
//   min: string | null
//   max: string | null
//   step: string | null
// }

interface MVDateDef extends MVPropDefBase {
  type: 'date'
  value: string | null
  min: string | null
  max: string | null
  step: string | null
}

interface MVDateTimeDef extends MVPropDefBase {
  type: 'datetime'
  value: string | null
  min: string | null
  max: string | null
  step: string | null
}

interface MVTimeDef extends MVPropDefBase {
  type: 'time'
  value: string | null
  min: string | null
  max: string | null
  step: string | null
}

interface MVMonthDef extends MVPropDefBase {
  type: 'month'
  value: string | null
  min: string | null
  max: string | null
  step: string | null
}

interface MVLinkDef extends MVPropDefBase {
  type: 'link'
  target: string | null
}

// interface MVOptionsDef extends MVPropDefBase {
//   type: 'select' | 'multi'
//   options: Array<boolean | number | string>
// }

interface MVSelectDef extends MVPropDefBase {
  type: 'select'
  options: Array<boolean | number | string>
}

interface MVMultiDef extends MVPropDefBase {
  type: 'multi'
  options: Array<boolean | number | string>
}

interface MVArrayDef extends MVPropDefBase {
  type: 'array'
  elementType: MVPropDef
}

interface MVTupleDef extends MVPropDefBase {
  type: 'tuple'
  elementTypes: MVPropDef[]
}

interface MVRecordDef extends MVPropDefBase {
  type: 'record'
  entries: Record<string, MVPropDef>
}

type JSONValue =
  | string
  | number
  | boolean
  | null
  | JSONValue[]
  | { [key: string]: JSONValue }
