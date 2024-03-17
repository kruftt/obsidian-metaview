// import { FieldDataType } from '../../../MetadataView'
import MetadataInput from './MetadataInput.svelte'
import MetadataSelect from './MetadataSelect.svelte'
import MetadataMulti from './MetadataMulti.svelte'
import MetadataCycle from './MetadataCycle.svelte'
import MetadataBoolean from './MetadataBoolean.svelte'
import MetadataNumber from './MetadataNumber.svelte'
import MetadataFile from './MetadataFile.svelte'
import MetadataMultiFile from './MetadataMultiFile.svelte'
import MetadataMedia from './MetadataMedia.svelte'
import MetadataMultiMedia from './MetadataMultiMedia.svelte'
import MetadataDate from './MetadataDate.svelte'
import MetadataLookup from './MetadataLookup.svelte'
import MetadataFormula from './MetadataFormula.svelte'
import MetadataCanvas from './MetadataCanvas.svelte'
import MetadataCanvasGroup from './MetadataCanvasGroup.svelte'
import MetadataCanvasGroupLink from './MetadataCanvasGroupLink.svelte'
import MetadataYAML from './MetadataYAML.svelte'
import MetadataJSON from './MetadataJSON.svelte'
import MetadataObject from './MetadataObject.svelte'
import MetadataObjectList from './MetadataObjectList.svelte'

export default {
    'Input': MetadataInput,
    'Select': MetadataSelect,
    'Multi': MetadataMulti,
    'Cycle': MetadataCycle,
    'Boolean': MetadataBoolean,
    'Number': MetadataNumber,
    'File': MetadataFile,
    'MultiFile': MetadataMultiFile,
    'Media': MetadataMedia,
    'MultiMedia': MetadataMultiMedia,
    'Date': MetadataDate,
    'Lookup': MetadataLookup,
    'Formula': MetadataFormula,
    'Canvas': MetadataCanvas,
    'CanvasGroup': MetadataCanvasGroup,
    'CanvasGroupLink': MetadataCanvasGroupLink,
    'YAML': MetadataYAML,
    'JSON': MetadataJSON,
    'Object': MetadataObject,
    'ObjectList': MetadataObjectList,
}