import withNextFederation from './withNextFederation';

export type {
  NextFederationCompilerContext,
  NextFederationMode,
  NextFederationOptionsV9,
} from './types';

export { withNextFederation };
export default withNextFederation;

module.exports = withNextFederation;
module.exports.withNextFederation = withNextFederation;
