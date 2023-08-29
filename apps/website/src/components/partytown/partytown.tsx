import {
  partytownSnippet,
  PartytownConfig,
} from '@builder.io/partytown/integration';

/**
 * Props for `<QwikPartytown/>`, which extends the Partytown Config.
 *
 * https://github.com/BuilderIO/partytown#config
 *
 * @public
 */
// eslint-disable-next-line @typescript-eslint/no-empty-interface
export interface PartytownProps extends PartytownConfig {}

/**
 * @public
 * You can pass setting with props
 */
export const QwikPartytown = (props: PartytownProps): any => {
  return <script dangerouslySetInnerHTML={partytownSnippet(props)} />;
};
