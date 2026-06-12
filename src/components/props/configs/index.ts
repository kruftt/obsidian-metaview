import CollectionConfig from "./CollectionConfig.svelte";
import EmptyConfig from "./EmptyConfig.svelte";
import InputConfig from "./InputConfig.svelte";
import LinkConfig from "./LinkConfig.svelte";
import SelectConfig from "./SelectConfig.svelte";

export default {
	json: InputConfig,
	text: InputConfig,
	number: InputConfig,
	boolean: InputConfig,
	date: InputConfig,
	"datetime-local": InputConfig,
	time: InputConfig,
	month: InputConfig,

	link: LinkConfig,
	multilink: LinkConfig,

	taxonomy: EmptyConfig,

	select: SelectConfig,
	multi: SelectConfig,

	tuple: CollectionConfig,
	record: CollectionConfig,
	array: CollectionConfig,
	map: CollectionConfig,
};
