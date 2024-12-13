/**
 * dont put meta props in type sections, but use them as a multiselect
 */

interface MVSettings {
  templatesPath: string;
}

interface MVFileBase {
  // types: string[] // use set for all these to standardize component
  // aliases: string[]
  types: Set<string>
  aliases: Set<string>
  tags: Set<string>
  cssclasses: Set<string>
}

// configs stored by path with template and .md removed
interface MVTemplateData extends MVFileBase {  
  // tags: string[]
  // cssclasses: string[]
  defs: Record<string, MVPropDef>
}

interface MVNoteData extends MVFileBase {
  // tags: Set<string>
  // cssclasses: Set<string>
  props: Record<string, FMValue>
  
  // derive these after adding or removing type
  freeProps: Set<string>
  typeData: Record<string, MVTemplateData>
}

// what happens when an active note's type is changed in an external app?
// 

type MVFileData = MVNoteData | MVTemplateData;

interface MVPropData {
  value: FMValue
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

interface MVJsonDef {
  type: 'json'
  value: FMValue
}

interface MVBoolDef {
  type: 'boolean'
  checked: boolean | null
}

interface MVNumberDef {
  type: 'number'
  value: number | null
  min: number | null
  max: number | null
  step: number | null
}

interface MVTextDef {
  type: 'text'
  value: string | null
  minlength: number | null
  maxlength: number | null
  pattern: string | null
}

// interface MVDateTimeDef {
//   type: 'date' | 'datetime' | 'time' | 'month'
//   value: string | null
//   min: string | null
//   max: string | null
//   step: string | null
// }

interface MVDateDef {
  type: 'date'
  value: string | null
  min: string | null
  max: string | null
  step: string | null
}

interface MVDateTimeDef {
  type: 'datetime'
  value: string | null
  min: string | null
  max: string | null
  step: string | null
}

interface MVTimeDef {
  type: 'time'
  value: string | null
  min: string | null
  max: string | null
  step: string | null
}

interface MVMonthDef {
  type: 'month'
  value: string | null
  min: string | null
  max: string | null
  step: string | null
}

interface MVLinkDef {
  type: 'link'
  target: string | null
}

// interface MVOptionsDef {
//   type: 'select' | 'multi'
//   options: Array<boolean | number | string>
// }

interface MVSelectDef {
  type: 'select'
  options: Array<boolean | number | string>
}

interface MVMultiDef {
  type: 'multi'
  options: Array<boolean | number | string>
}

interface MVArrayDef {
  type: 'array'
  elementType: MVPropDef
}

interface MVTupleDef {
  type: 'tuple'
  elementTypes: MVPropDef[]
}

interface MVRecordDef {
  type: 'record'
  entries: Record<string, MVPropDef>
}

type FMValue =
  | string
  | number
  | boolean
  | FMValue[]
  | { [key: string]: FMValue }
