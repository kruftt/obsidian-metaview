type TFile = import('obsidian').TFile
type LinkCache = import('obsidian').LinkCache
type MetadataCache = import('obsidian').MetadataCache

interface MetadataViewSettings {
    templatesDir: string;
    typesProp: string;
}

interface MDV_File {
    types: string[]
    tags: string[]
    inlineTags: InlineTagData[]
    propGroups: MDV_PropGroup[]
    freelinks: LinkCache[]
    backlinks: BacklinkData[]
    embeds: EmbedData[]
}

interface MDV_Prop {
    key: string
    value?: unknown
    default: unknown
    type: FieldValueType
    backlinks?: BacklinkData[]
    embeds?: EmbedData[]
}

interface MDV_PropGroup {
    name?: string
    props: Record<string, MDV_Prop>
}

interface MDV_Type {
    name: string
    deps: string[]
    fields: MDV_Prop[]
}

interface MetadataSelectOption { name: string, selected: boolean }

interface Position {
    start: PositionBoundary
    end: PositionBoundary
}

interface PositionBoundary {
    line: number
    col: number
    offset: number
}

interface InlineTagData {
    tag: string
    position: Position
}

interface LinkData {
    displayText: string
    link: string
    original: string
    position: Position
}

interface BacklinkData extends LinkCache {
    key?: string
}

interface EmbedData {
    link: string
    position: Position
}

interface PropertyInfo {
    name: string
    type: FieldValueType
    count: number
}

type FieldValueType =
    | "text"
    | "multitext"
    | "number"
    | "checkbox"
    | "date"
    | "datetime"

interface MDV_MetadataCache extends MetadataCache {
    getAllPropertyInfos(): Record<string, PropertyInfo>
}