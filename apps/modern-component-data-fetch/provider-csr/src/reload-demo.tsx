import type { ReloadDemoData } from './reload-demo.data';

const ReloadDemo = ({ mfData }: { mfData?: ReloadDemoData }): JSX.Element => (
  <div id="provider-csr-reload-demo">
    <p id="data-loader-request-count">
      DataLoader requests: {mfData?.requestCount ?? 0}
    </p>
    <p id="data-loader-fetched-at">
      Fetched at: {mfData?.fetchedAt ?? 'waiting'}
    </p>
  </div>
);

export default ReloadDemo;
