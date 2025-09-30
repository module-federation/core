import fs from 'fs';
import path from 'path';
import crypto from 'crypto';
import { promisify } from 'util';
import globOriginal from 'next/dist/compiled/glob';
import { Sema } from 'next/dist/compiled/async-sema';
import { getNextConfigEnv, getStaticEnv } from './static-env';
const glob = promisify(globOriginal);
export async function inlineStaticEnv({ distDir, config }) {
    const nextConfigEnv = getNextConfigEnv(config);
    const staticEnv = getStaticEnv(config);
    const serverDir = path.join(distDir, 'server');
    const serverChunks = await glob('**/*.{js,json,js.map}', {
        cwd: serverDir
    });
    const clientDir = path.join(distDir, 'static');
    const clientChunks = await glob('**/*.{js,json,js.map}', {
        cwd: clientDir
    });
    const manifestChunks = await glob('*.{js,json,js.map}', {
        cwd: distDir
    });
    const inlineSema = new Sema(8);
    const nextConfigEnvKeys = Object.keys(nextConfigEnv).map((item)=>item.split('process.env.').pop());
    const builtRegEx = new RegExp(`[\\w]{1,}(\\.env)?\\.(?:NEXT_PUBLIC_[\\w]{1,}${nextConfigEnvKeys.length ? '|' + nextConfigEnvKeys.join('|') : ''})`, 'g');
    const changedClientFiles = [];
    const filesToCheck = new Set(manifestChunks.map((f)=>path.join(distDir, f)));
    for (const [parentDir, files] of [
        [
            serverDir,
            serverChunks
        ],
        [
            clientDir,
            clientChunks
        ]
    ]){
        await Promise.all(files.map(async (file)=>{
            await inlineSema.acquire();
            const filepath = path.join(parentDir, file);
            const content = await fs.promises.readFile(filepath, 'utf8');
            const newContent = content.replace(builtRegEx, (match)=>{
                let normalizedMatch = `process.env.${match.split('.').pop()}`;
                if (staticEnv[normalizedMatch]) {
                    return JSON.stringify(staticEnv[normalizedMatch]);
                }
                return match;
            });
            await fs.promises.writeFile(filepath, newContent);
            if (content !== newContent && parentDir === clientDir) {
                changedClientFiles.push({
                    file,
                    content: newContent
                });
            }
            filesToCheck.add(filepath);
            inlineSema.release();
        }));
    }
    const hashChanges = [];
    // hashes need updating for any changed client files
    for (const { file, content } of changedClientFiles){
        var _file_match;
        // hash is 16 chars currently for all client chunks
        const originalHash = ((_file_match = file.match(/([a-z0-9]{16})\./)) == null ? void 0 : _file_match[1]) || '';
        if (!originalHash) {
            throw Object.defineProperty(new Error(`Invariant: client chunk changed but failed to detect hash ${file}`), "__NEXT_ERROR_CODE", {
                value: "E663",
                enumerable: false,
                configurable: true
            });
        }
        const newHash = crypto.createHash('sha256').update(content).digest('hex').substring(0, 16);
        hashChanges.push({
            originalHash,
            newHash
        });
        const filepath = path.join(clientDir, file);
        const newFilepath = filepath.replace(originalHash, newHash);
        filesToCheck.delete(filepath);
        filesToCheck.add(newFilepath);
        await fs.promises.rename(filepath, newFilepath);
    }
    // update build-manifest and webpack-runtime with new hashes
    for (let file of filesToCheck){
        const content = await fs.promises.readFile(file, 'utf-8');
        let newContent = content;
        for (const { originalHash, newHash } of hashChanges){
            newContent = newContent.replaceAll(originalHash, newHash);
        }
        if (content !== newContent) {
            await fs.promises.writeFile(file, newContent);
        }
    }
}

//# sourceMappingURL=inline-static-env.js.map