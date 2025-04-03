interface MVSettings {
  templatesPath: string
  // templatesPrefix: string
  typesProperty: string
}

type MVFilePropType = 'types' | 'aliases' | 'cssclasses' | 'tags'

type MVInputDef =
| MVBoolDef
| MVNumberDef
| MVTextDef
| MVDateDef
| MVDateTimeDef
| MVTimeDef
| MVMonthDef

type MVSelectDef =
| MVSelectSingleDef
| MVSelectMultiDef

type MVCollectionDef =
| MVArrayDef
| MVTupleDef
| MVMapDef
| MVRecordDef

type MVPropDef = MVInputDef | MVLinkDef | MVSelectDef | MVCollectionDef | MVJsonDef

interface MVJsonDef {
  type: 'json'
  default?: FrontMatterValue | null
}

interface MVBoolDef {
  type: 'boolean'
  default?: boolean | null
  props?: {}
}

interface MVNumberDef {
  type: 'number'
  default?: number | null
  props?: {
    min?: number | null
    max?: number | null
    step?: number | null
  }
}

interface MVTextDef {
  type: 'text'
  default?: string | null
  props?: {
    minlength?: number | null
    maxlength?: number | null
    pattern?: string | null
  }
}

interface MVDateDef {
  type: 'date'
  default?: string | null
  props?: {
    min?: string | null
    max?: string | null
    step?: string | null
  }
}

interface MVDateTimeDef {
  type: 'datetime-local'
  default?: string | null
  props?: {
    min?: string | null
    max?: string | null
    step?: string | null
  }
}

interface MVTimeDef {
  type: 'time'
  default?: string | null
  props?: {
    min?: string | null
    max?: string | null
    step?: string | null
  }
}

interface MVMonthDef {
  type: 'month'
  default?: string | null
  props?: {
    min?: string | null
    max?: string | null
    step?: string | null
  }
}

interface MVLinkDef {
  type: 'link'
  target?: string | null
}

interface MVSelectSingleDef {
  type: 'select'
  options: Array<string>
}

interface MVSelectMultiDef {
  type: 'multi'
  options: Array<string>
}

interface MVArrayDef {
  type: 'array'
  elementType: MVPropDef
}

interface MVTupleDef {
  type: 'tuple'
  elementTypes: MVPropDef[]
}

interface MVMapDef {
  type: 'map'
  elementType: MVPropDef
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
