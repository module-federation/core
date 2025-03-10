export const getDataFetchInfo = ({
  name,
  alias,
  id,
}: {
  id: string;
  name: string;
  alias?: string;
}) => {
  const regex = new RegExp(`^${name}(/[^/].*|)$`);
  const nameOrAlias = regex.test(id) ? name : alias || name;
  const DATA_FETCH = 'data';

  const expose = id.replace(nameOrAlias, '');
  let dataFetchName = '';
  let dataFetchId = '';
  if (expose.startsWith('/')) {
    dataFetchName = `${expose.slice(1)}.${DATA_FETCH}`;
    dataFetchId = `${id}.${DATA_FETCH}`;
  } else if (expose === '') {
    dataFetchName = DATA_FETCH;
    dataFetchId = `${id}/${DATA_FETCH}`;
  } else {
    return;
  }

  if (!dataFetchName || !dataFetchId) {
    return;
  }

  return {
    dataFetchName,
    dataFetchId,
  };
};
