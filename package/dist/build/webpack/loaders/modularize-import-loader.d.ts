export type ModularizeImportLoaderOptions = {
    name: string;
    join?: string;
    from: 'default' | 'named';
    as: 'default' | 'named';
};
/**
 * This loader is to create special re-exports from a specific file.
 * For example, the following loader:
 *
 * modularize-import-loader?name=Arrow&from=Arrow&as=default&join=./icons/Arrow!lucide-react
 *
 * will be used to create a re-export of:
 *
 * export { Arrow as default } from "join(resolve_path('lucide-react'), '/icons/Arrow')"
 *
 * This works even if there's no export field in the package.json of the package.
 */
export default function transformSource(this: any): string;
