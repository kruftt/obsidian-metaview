interface MVSettings {
  templatesPath: string;
}

interface MVTemplate {
  name: string // not used
  types: string[]
  aliases: string[]
  tags: string[]
  cssclasses: string[]
  props: Record<string, MVPropDef>
}

interface MVFileData {
  name: string
  types: string[]
  aliases: MVMetaData
  tags: MVMetaData
  cssclasses: MVMetaData
  props: Record<string, unknown>
  typeData: Record<string, Record<string, MVPropData>>
}

interface MVMetaData {
  bound: Record<string, boolean> 
  free: string[]
}

interface MVPropData {
  def: MVPropDef
  value: unknown
}

interface MVBoolData { def: MVBoolDef, value?: boolean }


type MVPropDef =
  | MVJsonDef
  | MVBoolDef
  | MVNumberDef
  | MVStringDef
  | MVDateDef
  | MVDateTimeDef
  | MVTimeDef
  | MVMonthDef
  | MVYearDef
  | MVLinkDef
  | MVSelectDef
  | MVMultiDef
  | MVArrayDef
  | MVTupleDef
  | MVRecordDef

interface MVJsonDef {
  type: 'json'
  default?: string
}

interface MVBoolDef {
  type: 'boolean'
  default?: boolean
}

interface MVNumberDef {
  type: 'number'
  default?: number
}

interface MVStringDef {
  type: 'string'
  default?: string
}

interface MVDateDef {
  type: 'date'
  format?: string
}

interface MVDateTimeDef {
  type: 'datetime'
  format?: string
}

interface MVTimeDef {
  type: 'time'
  format?: string
}

interface MVMonthDef {
  type: 'month'
  format?: string
}

interface MVYearDef {
  type: 'year'
  format?: string
}

interface MVLinkDef {
  type: 'link'
  noteType?: string
}

interface MVSelectDef {
  type: 'select'
  values: Array<boolean|number|string>
}

interface MVMultiDef {
  type: 'multi'
  elementType: MVSelectDef
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
