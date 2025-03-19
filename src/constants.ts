export const ID = "metaview";
export const NAME = "MetaView";
export const TEMPLATE_NAME_REGEX = "(?:\/)?(.+).md$";
export const VALID_TYPES: Record<string, true> = {
  'boolean': true,
  'number': true,
  'text': true,
  'date': true,
  'datetime-local': true,
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
  'aliases': true,
  'cssclasses': true,
  'tags': true,
}
export const TYPE_ICONS: Record<string, string> = {
  'boolean': 'square-check',
  'number': 'binary',
  'text': 'pencil',
  'date': 'calendar-days',
  'datetime-local': 'calendar-clock',
  'time': 'clock-2',
  'month': 'calendar-x',
  'year': 'calendar',
  'link': 'link',
  'select': 'list-check',
  'multi': 'list-checks',
  'array': 'list-ordered',
  'tuple': 'align-justify',
  'record': 'list',
  'json': 'braces',
};