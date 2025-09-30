import type { webpack } from 'next/dist/compiled/webpack/webpack';
export type NextFlightActionEntryLoaderOptions = {
    actions: string;
};
export type FlightActionEntryLoaderActions = [
    path: string,
    actions: {
        id: string;
        exportedName: string;
    }[]
][];
declare function nextFlightActionEntryLoader(this: webpack.LoaderContext<NextFlightActionEntryLoaderOptions>): string;
export default nextFlightActionEntryLoader;
