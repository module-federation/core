import Button from 'antd/lib/button';
import { version } from 'antd/package.json';
import { Suspense } from 'react';
import { usePrefetch } from '@module-federation/enhanced/prefetch';
import { Await } from 'react-router-dom';

import stuff from './stuff.module.css';

interface UserInfo {
  id: number;
  title: string;
}
const reFetchParams = {
  data: {
    id: 2,
    title: 'Another Prefetch Title',
  },
};
export default function ButtonOldAnt() {
  const [prefetchResult, reFetchUserInfo] = usePrefetch<UserInfo>({
    // Corresponds to (name + expose) in the producer mf config, e.g. `rspack_provider/ButtonOldAnt` for consuming `ButtonOldAnt.prefetch.ts`
    id: 'rspack_provider/ButtonOldAnt',
    // Optional parameter, required after using defer
    deferId: 'userInfo',
  });

  return (
    <>
      <button onClick={() => reFetchUserInfo(reFetchParams)}>
        Resend the request with parameters
      </button>
      <Suspense fallback={<p>Loading...</p>}>
        <Await
          resolve={prefetchResult}
          children={(userInfo) => {
            return (
              <div>
                <div>{userInfo.data.id}</div>
                <div>{userInfo.data.title}</div>
              </div>
            );
          }}
        ></Await>
      </Suspense>
      <Button className={stuff['test-remote2'] + ' test-remote2'}>
        Button from antd@{version}
      </Button>
    </>
  );
}
