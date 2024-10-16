interface MVSettings {
  templatesPath: string;
}

interface MVTemplate {
  name: string
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
  typeData: Record<string, MVTypeData>
}

interface MVMetaData {
  bound: Record<string, boolean> 
  free: string[]
}

interface MVTypeData {
  name: string
  props: Record<string, MVPropData>
}

interface MVPropData {
  template: MVPropDef
  value: unknown
}


type MVPropDef =
  | MVJsonDef
  | MVBoolDef
  | MVNumberDef
  | MVStringDef
  | MVDateDef
  | MVDateTimeDef
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
