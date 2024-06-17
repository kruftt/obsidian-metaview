type TFile = import('obsidian').TFile
type LinkCache = import('obsidian').LinkCache
type MetadataCache = import('obsidian').MetadataCache

interface MV_Settings {
    templatesDir: string;
    typesProp: string;
}

interface MV_FileData {
    types: string[]
    tags: string[]
    aliases: string[]
    cssclasses: string[]
    inlineTags: InlineTagData[]
    freeProps: MV_PropData[]
    boundProps: MV_GroupData[]
    freelinks: LinkCache[]
    backlinks: BacklinkData[]
    embeds: EmbedData[]
}

interface MV_GroupData {
    name: string
    props: MV_PropData[]
}

interface MV_PropData {
    value: unknown
    backlinks: BacklinkData[]
    def: MV_PropDef | MV_CompositePropDef
}

type MV_PropDef =
    | MV_SinglePropDef
    | MV_MultiPropDef
    | MV_CompositePropDef
    | MV_MultiCompositePropDef
    | MV_FreePropDef

interface MV_PropDefBase {
    key: string
    default: unknown
}

interface MV_FreePropDef extends MV_PropDefBase { type: 'free' }
interface MV_SinglePropDef extends MV_PropDefBase { type: 'single' }
interface MV_MultiPropDef extends MV_PropDefBase { type: 'multi' }
interface MV_CompositePropDef extends MV_PropDefBase { type: 'composite' }
interface MV_MultiCompositePropDef extends MV_PropDefBase { type: 'multicomposite' }

interface MV_TypeDef {
    name: string
    props: Record<string, MV_PropDef | MV_CompositePropDef>
    types: string[]
    tags: string[]
    aliases: string[]
    cssclasses: string[]
}

interface MV_TypeCache {
    byName: { [key: string]: MV_TypeDef }
    byPath: { [key: string]: MV_TypeDef }
}

interface MV_SelectOption { name: string, selected: boolean }

// interface MV_MetadataCache extends MetadataCache {
//     getAllPropertyInfos(): Record<string, PropertyInfo>
// }


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

// interface PropertyInfo {
//     name: string
//     type: PropValueType
//     count: number
// }

// type PropValueType =
//     | "text"
//     | "multitext"
//     | "number"
//     | "checkbox"
//     | "date"
//     | "datetime"

type PropCompositeType =
    | "composite"
    | "multicomposite"

type MV_PropType = 
    | "single"
    | "multi"
    | "type"
    | "multitype"