/*
	MIT License http://www.opensource.org/licenses/mit-license.php
	Author Zackary Jackson @ScriptedAlchemy
*/
import path from 'path';
import { TEMP_DIR as BasicTempDir } from '@module-federation/sdk';

const FEDERATION_SUPPORTED_TYPES = ['script'];
const TEMP_DIR = path.join(`${process.cwd()}/node_modules`, BasicTempDir);

export { FEDERATION_SUPPORTED_TYPES, TEMP_DIR };
