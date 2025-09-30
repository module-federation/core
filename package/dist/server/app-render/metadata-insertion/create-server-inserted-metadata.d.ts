import React from 'react';
export declare function createServerInsertedMetadata(nonce: string | undefined): {
    ServerInsertedMetadataProvider: ({ children, }: {
        children: React.ReactNode;
    }) => import("react/jsx-runtime").JSX.Element;
    getServerInsertedMetadata(): Promise<string>;
};
