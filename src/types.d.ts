type FieldType =
    | "Input"
    | "Number"
    | "Select"
    | "Cycle"
    | "Boolean"
    | "Date"
    | "DateTime"
    | "Time"
    | "Multi"
    | "File"
    | "MultiFile"
    | "Media"
    | "MultiMedia"
    | "Canvas"
    | "CanvasGroup"
    | "CanvasGroupLink"
    | "Formula"
    | "Lookup"
    | "JSON"
    | "YAML"
    | "Object"
    | "ObjectList"

interface IFieldInfo {
    id: string,
    name: string,
    type: FieldType
    value: string;
    indexedPath: string | undefined
    sourceType: "fileClass" | "settings"
    fileClassName: string | undefined;
    isValid: boolean;
    options: Record<string, any>
    ignoredInMenu: boolean;
}

type FieldPayload = {
    value: any,
    addToCurrentValues?: boolean,
    style?: Record<string, boolean>
}

type IndexedFieldsPayload = Array<{
    indexedPath: string, //is the indexedPath of the field in the note, not the fieldId per say
    payload: FieldPayload
}>

type NamedFieldsPayload = Array<{
    name: string,
    payload: FieldPayload
}>

type TFile = import('obsidian').TFile

interface IMetadataMenuApi {
    getValues: (fileOrFilePath: TFile | string, attribute: string) => Promise<string[]>;
    getValuesForIndexedPath: (fileOrFilePath: TFile | string, indexedPath: string) => Promise<string>;
    fileFields: (fileOrFilePath: TFile | string) => Promise<Record<string, IFieldInfo>>;
    namedFileFields: (fileOrFilePath: TFile | string) => Promise<Record<string, IFieldInfo>>;
    fieldModifier: (dv: any, p: any, fieldName: string, attrs?: { cls?: string, attr?: Record<string, string>, options?: Record<string, string> }) => HTMLElement;
    insertMissingFields: (fileOrFilePath: string | TFile, lineNumber: number, asList: boolean, asBlockquote: boolean, fileClassName?: string) => Promise<void>;
    postValues: (fileOrFilePath: TFile | string, payload: IndexedFieldsPayload, lineNumber?: number, asList?: boolean, asBlockquote?: boolean) => Promise<void>;
    postNamedFieldsValues: (fileOrFilePath: TFile | string, payload: NamedFieldsPayload, lineNumber?: number, asList?: boolean, asBlockquote?: boolean) => Promise<void>;
}

interface FileData {
    fileClassAlias?: string
    fileClassField?: FieldData
    fields: FieldData[]
    classData: FileClassData[]
    links: InlineLinkData[]
    backlinks: InlineLinkData[]
    embeds: EmbedData[]
}

interface FileClassData {
    name: string
    fields: FieldData[]
}

interface FieldDataBase {
    key: string
    links?: LinkData[]
    backlinks?: InlineLinkData[]
    embeds?: EmbedData
    options?: unknown
}

interface LinkData {
    displayText: string
    link: string
}

interface InlineLinkData extends LinkData {
    filename: string
    line: number
}

interface EmbedData extends LinkData {
}

type FieldValueType =
    | "text"
    | "multitext"
    | "number"
    | "checkbox"
    | "date"
    | "datetime"


interface InputFieldData extends FieldDataBase {
    type: 'Input'
    value: unknown
    options: any
    // options: Record<string, unknown> | Array<string>
}

interface SelectFieldData extends FieldDataBase {
    type: 'Select'
    value: unknown[]
    options: Array<string>
}

interface MultiFieldData extends FieldDataBase {
    type: 'Multi'
    value: unknown
    // options: Record<string, unknown> | Array<string>
}

interface CycleFieldData extends FieldDataBase {
    type: 'Cycle'
    value: unknown
    // options: Record<string, unknown> | Array<string>
}

interface BooleanFieldData extends FieldDataBase {
    type: 'Boolean'
    value: unknown
    // options: Record<string, unknown> | Array<string>
}

interface NumberFieldData extends FieldDataBase {
    type: 'Number'
    value: unknown
    // options: Record<string, unknown> | Array<string>
}

interface FileFieldData extends FieldDataBase {
    type: 'File'
    value: unknown
    // options: Record<string, unknown> | Array<string>
    link: LinkData
}

interface MultiFileFieldData extends FieldDataBase {
    type: 'MultiFile'
    value: unknown
    // options: Record<string, unknown> | Array<string>
    links: LinkData[]
}

interface MediaFieldData extends FieldDataBase {
    type: 'Media'
    value: unknown
    // options: Record<string, unknown> | Array<string>
}

interface MultiMediaFieldData extends FieldDataBase {
    type: 'MultiMedia'
    value: unknown
    // options: Record<string, unknown> | Array<string>
}

interface DateFieldData extends FieldDataBase {
    type: 'Date'
    value: unknown
    // options: Record<string, unknown> | Array<string>
}

interface LookupFieldData extends FieldDataBase {
    type: 'Lookup'
    value: unknown
    // options: Record<string, unknown> | Array<string>
}

interface FormulaFieldData extends FieldDataBase {
    type: 'Formula'
    value: unknown
    // options: Record<string, unknown> | Array<string>
}

interface CanvasFieldData extends FieldDataBase {
    type: 'Canvas'
    value: unknown
    // options: Record<string, unknown> | Array<string>
}

interface CanvasGroupFieldData extends FieldDataBase {
    type: 'CanvasGroup'
    value: unknown
    // options: Record<string, unknown> | Array<string>
}

interface CanvasGroupLinkFieldData extends FieldDataBase {
    type: 'CanvasGroupLink'
    value: unknown
    // options: Record<string, unknown> | Array<string>
}

interface YAMLFieldData extends FieldDataBase {
    type: 'YAML'
    value: unknown
    // options: Record<string, unknown> | Array<string>
}

interface JSONFieldData extends FieldDataBase {
    type: 'JSON'
    value: unknown
    // options: Record<string, unknown> | Array<string>
}

interface ObjectFieldData extends FieldDataBase {
    type: 'Object'
    value: unknown
    // options: Record<string, unknown> | Array<string>
}

interface ObjectListFieldData extends FieldDataBase {
    type: 'ObjectList'
    value: unknown
    // options: Record<string, unknown> | Array<string>
}

type FieldData = InputFieldData | SelectFieldData | MultiFieldData | CycleFieldData | BooleanFieldData | NumberFieldData | FileFieldData | MultiFileFieldData | MediaFieldData | MultiMediaFieldData | DateFieldData | LookupFieldData | FormulaFieldData | CanvasFieldData | CanvasGroupFieldData | CanvasGroupLinkFieldData | YAMLFieldData | JSONFieldData | ObjectFieldData | ObjectListFieldData

interface MetadataSelectOption { name: string, selected: boolean }

interface PropertyInfo {
    name: string
    type: FieldValueType
    count: string
}

interface LinkPosition {
    line: number
    col: number
    offset: number
}

interface RawLinkData {
    displayText: string
    link: string
    original: string
    position: {
        end: LinkPosition
        start: LinkPosition
    }
}

interface RawBacklinkData {
    key?: string
    displayText?: string
    link: string
    original: string
    position: {
        end: LinkPosition
        start: LinkPosition
    }
}


// enum FieldDataType {
//     Input = "Input",
//     Select = "Select",
//     Multi = "Multi",
//     Cycle = "Cycle",
//     Boolean = "Boolean",
//     Number = "Number",
//     File = "File",
//     MultiFile = "MultiFile",
//     Media = "Media",
//     MultiMedia = "MultiMedia",
//     Date = "Date",
//     Lookup = "Lookup",
//     Formula = "Formula",
//     Canvas = "Canvas",
//     CanvasGroup = "CanvasGroup",
//     CanvasGroupLink = "CanvasGroupLink",
//     YAML = "YAML",
//     JSON = "JSON",
//     Object = "Object",
//     ObjectList = "ObjectList",
// }

// enum FieldValueType {
//     Text = "text",
//     Multitext = "multitext",
//     Number = "number",
//     Checkbox = "checkbox",
//     Date = "date",
//     DateTime = "datetime",
// }

// function extractLink(v: Link): LinkData {
//     return {
//         displayText: v.display || v.toString(),
//         link: v.obsidianLink(),
//     }
// }

// function extractInlineLink(v: RawLinkData): InlineLinkData {
//     return {
        
//         displayText: v.displayText,
//         link: v.link,
//         line: v.position.start.line,
//     }
// }