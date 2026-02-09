import { sharing } from "@rspack/core";
import path from 'path';
import CollectPlugin from "./Collect";
import EmitManifest from './EmitManifest';


const SECONDARY_TREE_SHAKING = Boolean(process.env.SECONDARY_TREE_SHAKING)

const mfConfig = ${ MF_CONFIG };

module.exports = {
	entry: './index.ts',
	output:{
		path: path.resolve(process.cwd(), SECONDARY_TREE_SHAKING ? 'dist' : 'full-shared'),
	},
	plugins: [
		new EmitManifest(SECONDARY_TREE_SHAKING),
		new sharing.TreeShakingSharedPlugin({
			secondary: SECONDARY_TREE_SHAKING,
			plugins: ${ PLUGINS },
			mfConfig,
		}),
		!SECONDARY_TREE_SHAKING && new CollectPlugin({
			libs: Object.entries(mfConfig.shared).map(([k, v]) => {
				if(!v.treeShaking) {
					return null;
				}
				return k;
			}).filter(Boolean),
			filename: "shared-tree-shaking-report.json",
		}),
	]
};
