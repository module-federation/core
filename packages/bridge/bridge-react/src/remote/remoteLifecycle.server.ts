import { useContext } from 'react';
import { BridgeSSRContext, getBridgeSSRRenderParams } from '../ssr';
import { collectRemoteStylesheetHrefs } from './stylesheetAssets';
import type {
  UseRemoteLifecycle,
  UseRemoteSSRRegistration,
} from './lifecycleTypes';

export const useRemoteSSRRegistration: UseRemoteSSRRegistration = (
  instanceId,
  factory,
  props,
  options,
) => {
  const ssr = useContext(BridgeSSRContext);
  if (!ssr) return;
  if (!instanceId) {
    throw new Error(
      'Independent Bridge SSR requires React 18 or newer in the host.',
    );
  }
  ssr.register(instanceId, factory, getBridgeSSRRenderParams(props), options);
};

/** Selected only for Node builds by the framework's Bridge SSR integration. */
export const useRemoteLifecycle: UseRemoteLifecycle = (props, instanceId) => {
  useRemoteSSRRegistration(instanceId, props.providerInfo, props);
  const ssr = useContext(BridgeSSRContext);
  const stylesheetHrefs = ssr
    ? collectRemoteStylesheetHrefs(props.moduleName)
    : [];
  if (ssr?.registerStyles && instanceId) {
    ssr.registerStyles(instanceId, stylesheetHrefs);
  }
  return {
    serverHTML: null,
    // A streaming adapter owns these links and gates its HTML on stylesheet load.
    // Other integrations retain the stylesheet component in the shared shell.
    stylesheetHrefs: ssr?.registerStyles ? [] : stylesheetHrefs,
  };
};
