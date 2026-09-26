import type {
  createScriptNode as NodeScriptFactory,
  loadScriptNode as NodeScriptLoader,
} from '../../node';

const disabledMessage =
  'Node script loading is disabled by module-federation:target-web.';

export const createScriptNode: typeof NodeScriptFactory = (_url, callback) => {
  callback(new Error(disabledMessage));
};

export const loadScriptNode: typeof NodeScriptLoader = async () => {
  return Promise.reject(new Error(disabledMessage));
};
