import type { webpack } from 'next/dist/compiled/webpack/webpack';
declare const flightServerReferenceProxyLoader: webpack.LoaderDefinitionFunction<{
    id: string;
    name: string;
}>;
export default flightServerReferenceProxyLoader;
