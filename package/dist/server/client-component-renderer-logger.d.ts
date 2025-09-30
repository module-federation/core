import type { AppPageModule } from './route-modules/app-page/module';
export declare function wrapClientComponentLoader(ComponentMod: AppPageModule): AppPageModule['__next_app__'];
export declare function getClientComponentLoaderMetrics(options?: {
    reset?: boolean;
}): {
    clientComponentLoadStart: number;
    clientComponentLoadTimes: number;
    clientComponentLoadCount: number;
} | undefined;
