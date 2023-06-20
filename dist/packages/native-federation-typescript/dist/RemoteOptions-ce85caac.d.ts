interface HostOptions {
    moduleFederationConfig: any;
    typesFolder?: string;
    deleteTypesFolder?: boolean;
}

interface RemoteOptions {
    moduleFederationConfig: any;
    tsConfigPath?: string;
    typesFolder?: string;
    compiledTypesFolder?: string;
    deleteTypesFolder?: boolean;
    additionalFilesToCompile?: string[];
    compilerInstance?: 'tsc' | 'vue-tsc';
}

export { HostOptions as H, RemoteOptions as R };
