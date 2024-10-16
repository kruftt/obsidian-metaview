export const TYPE_REGEX = /^{{\s*([^\[\]{}:]+)(?::(.*?))?\s*}}$/;
export const FILENAME_REGEX = /^(?:.*\/)?(.+).md$/;
export const arrayWrap = (v: any) => Array.isArray(v) ? v : (v === undefined) ? [] : [v];
