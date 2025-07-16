import { DATA_FETCH_FUNCTION } from '../constant';
import { dataFetchFunction } from './inject-data-fetch';

export async function callDataFetch() {
  const dataFetch = globalThis[DATA_FETCH_FUNCTION];
  if (dataFetch) {
    await Promise.all(
      dataFetch.map(async (options) => {
        await dataFetchFunction(options);
      }),
    );
  }
}
