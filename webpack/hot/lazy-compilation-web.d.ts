export function keepAlive(options: {
  data: string;
  onError: (err: Error) => void;
  active: boolean;
  module: NodeModule;
}): () => void;
