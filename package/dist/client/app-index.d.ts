import '../build/polyfills/polyfill-module';
import './components/globals/patch-console';
import './components/globals/handle-global-errors';
type FlightSegment = [isBootStrap: 0] | [isNotBootstrap: 1, responsePartial: string] | [isFormState: 2, formState: any] | [isBinary: 3, responseBase64Partial: string];
type NextFlight = Omit<Array<FlightSegment>, 'push'> & {
    push: (seg: FlightSegment) => void;
};
declare global {
    interface Window {
        __next_f: NextFlight;
    }
}
export type ClientInstrumentationHooks = {
    onRouterTransitionStart?: (url: string, navigationType: 'push' | 'replace' | 'traverse') => void;
};
export declare function hydrate(instrumentationHooks: ClientInstrumentationHooks | null): void;
export {};
