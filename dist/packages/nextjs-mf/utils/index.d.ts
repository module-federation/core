import * as React from 'react';
export { extractUrlAndGlobal, injectScript, } from '@module-federation/utilities';
export { flushChunks } from '@module-federation/node/utils';
export declare const revalidate: () => Promise<any>;
export interface FlushedChunksProps {
    chunks: string[];
}
export declare const FlushedChunks: {
    ({ chunks }: FlushedChunksProps): React.FunctionComponentElement<{
        children?: React.ReactNode;
    }>;
    defaultProps: FlushedChunksProps;
};
