// Copies the built plugin (main.js, manifest.json, styles.css) into another
// vault's plugins folder. Target vault is resolved from, in order:
//   1. a CLI arg:        npm run deploy -- "C:\path\to\Vault"
//   2. env var:          MV_DEPLOY_VAULT
//   3. deploy.config.json at the repo root:  { "vault": "C:\\path\\to\\Vault" }
// The destination folder is <vault>/.obsidian/plugins/<manifest.id>.

import {
	copyFileSync,
	existsSync,
	mkdirSync,
	readFileSync,
} from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const root = dirname(fileURLToPath(import.meta.url));
const FILES = ["main.js", "manifest.json", "styles.css"];

function resolveVault() {
	if (process.argv[2]) return process.argv[2];
	if (process.env.MV_DEPLOY_VAULT) return process.env.MV_DEPLOY_VAULT;
	const cfgPath = join(root, "deploy.config.json");
	if (existsSync(cfgPath)) {
		try {
			const cfg = JSON.parse(readFileSync(cfgPath, "utf8"));
			if (cfg.vault) return cfg.vault;
		} catch {
			// fall through to the usage error below
		}
	}
	return null;
}

const vault = resolveVault();
if (!vault) {
	console.error(
		'No target vault specified. Provide one of:\n' +
			'  npm run deploy -- "C:\\path\\to\\Vault"\n' +
			"  set MV_DEPLOY_VAULT\n" +
			'  create deploy.config.json: { "vault": "C:\\\\path\\\\to\\\\Vault" }',
	);
	process.exit(1);
}

if (!existsSync(join(vault, ".obsidian"))) {
	console.error(`"${vault}" doesn't look like a vault (no .obsidian folder).`);
	process.exit(1);
}

const manifest = JSON.parse(readFileSync(join(root, "manifest.json"), "utf8"));
const dest = join(vault, ".obsidian", "plugins", manifest.id);
mkdirSync(dest, { recursive: true });

for (const file of FILES) {
	const src = join(root, file);
	if (!existsSync(src)) {
		console.error(`Missing ${file} — run the build first (npm run build).`);
		process.exit(1);
	}
	copyFileSync(src, join(dest, file));
}

console.log(`Deployed ${manifest.id} -> ${dest}`);
console.log("Reload it in that vault (toggle the plugin off/on, or Ctrl+R).");
