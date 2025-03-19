interface MVSettings {
  templatesPath: string
  // templatesPrefix: string
  typesProperty: string
}

type MVContainerType = "free" | "record" | "array"
type MVFilePropType = 'types' | 'aliases' | 'cssclasses'

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
  default?: FrontMatterValue | null
}

interface MVBoolDef {
  type: 'boolean'
  default?: boolean | null
}

interface MVNumberDef {
  type: 'number'
  default?: number | null
  min?: number | null
  max?: number | null
  step?: number | null
}

interface MVTextDef {
  type: 'text'
  default?: string | null
  minlength?: number | null
  maxlength?: number | null
  pattern?: string | null
}

interface MVDateDef {
  type: 'date'
  default?: string | null
  min?: string | null
  max?: string | null
  step?: string | null
}

interface MVDateTimeDef {
  type: 'datetime-local'
  default?: string | null
  min?: string | null
  max?: string | null
  step?: string | null
}

interface MVTimeDef {
  type: 'time'
  default?: string | null
  min?: string | null
  max?: string | null
  step?: string | null
}

interface MVMonthDef {
  type: 'month'
  default?: string | null
  min?: string | null
  max?: string | null
  step?: string | null
}

interface MVLinkDef {
  type: 'link'
  target?: string | null
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

type FrontMatterValue =
  | null
  | string
  | number
  | boolean
  | FrontMatterValue[]
  | { [key: string]: FrontMatterValue }

type FrontMatter = Record<string, FrontMatterValue>
