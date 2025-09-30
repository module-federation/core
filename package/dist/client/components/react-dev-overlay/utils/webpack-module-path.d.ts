export declare function isWebpackInternalResource(file: string): boolean;
/**
 * Format the webpack internal id to original file path
 *
 * webpack-internal:///./src/hello.tsx => ./src/hello.tsx
 * webpack://_N_E/./src/hello.tsx => ./src/hello.tsx
 * webpack://./src/hello.tsx => ./src/hello.tsx
 * webpack:///./src/hello.tsx => ./src/hello.tsx
 */
export declare function formatFrameSourceFile(file: string): string;
