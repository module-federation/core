import path from 'path';
import isDockerFunction from 'next/dist/compiled/is-docker';
export function getStorageDirectory(distDir) {
    const isLikelyEphemeral = isDockerFunction();
    if (isLikelyEphemeral) {
        return undefined;
    }
    return path.join(distDir, 'cache');
}

//# sourceMappingURL=cache-dir.js.map