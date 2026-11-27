export function keepAlive(options: {
    data: string;
    onError: (err: Error) => void;
    active: boolean;
    module: NodeJS.Module;
}): () => void;
export function setUrl(value: string): void;
