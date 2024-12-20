export const ID = "metaview";
export const NAME = "MetaView";
export const VALID_TYPES: Record<string, true> = {
  'boolean': true,
  'number': true,
  'text': true,
  'date': true,
  'datetime': true,
  'time': true,
  'month': true,
  'year': true,
  'link': true,
  'select': true,
  'multi': true,
  'array': true,
  'tuple': true,
  'record': true,
  'json': true,
};
export const FILE_PROPS: Record<string, true> = {
  'types': true,
  'aliases': true,
  'cssclasses': true,
}