import esbuild from "esbuild";
import esbuildSvelte from "esbuild-svelte";
import { sveltePreprocess } from "svelte-preprocess";
import process from "process";
import builtins from "builtin-modules";
import pugMixins from "./pug-mixins.mjs";

const banner =
`/*
THIS IS A GENERATED/BUNDLED FILE BY ESBUILD
if you want to view the source, please visit the github repository of this plugin
*/
`;

const prod = (process.argv[2] === "production");

const context = await esbuild.context({
	banner: {
		js: banner,
	},
	entryPoints: ["src/Plugin.ts"],
	bundle: true,
	conditions: [ "development"	],
	external: [
		"obsidian",
		"electron",
		"@codemirror/autocomplete",
		"@codemirror/collab",
		"@codemirror/commands",
		"@codemirror/language",
		"@codemirror/lint",
		"@codemirror/search",
		"@codemirror/state",
		"@codemirror/view",
		"@lezer/common",
		"@lezer/highlight",
		"@lezer/lr",
		...builtins],
	format: "cjs",
	target: "es2022",
	// target: "es2018",
	logLevel: "info",
	// logOverride: {
		// "attribute-quoted": "silent",
		// "esbuild-svelte": "silent",
	// },
	plugins: [
		esbuildSvelte({
			compilerOptions: { css: "injected", runes: true },
			preprocess: [
				sveltePreprocess({
					pug: {
						prependData: pugMixins,
					},
					// replace: [[/\"\{.+?\}\"/g, (s) => s.substring(1, s.length-1)]]
				})
			],
		})
	],
	sourcemap: prod ? false : "inline",
	treeShaking: true,
	outfile: "main.js",
});

if (prod) {
	await context.rebuild();
	process.exit(0);
} else {
	await context.watch();
}
