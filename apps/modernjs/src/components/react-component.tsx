import { Suspense } from 'react';
import { usePrefetch } from '@module-federation/enhanced/prefetch';
import { Await } from '@modern-js/runtime/router';

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

const ReactComponent = () => {
  const [prefetchResult, reFetchUserInfo] = usePrefetch<UserInfo>({
    id: 'app1/react-component',
    // Optional parameters, required after using defer
    deferId: 'userInfo',
  });

  return (
    <>
      <button onClick={() => reFetchUserInfo(reFetchParams)}>
        Resend request with parameters
      </button>
      <Suspense fallback={<p>Loading...</p>}>
        <Await
          resolve={prefetchResult}
          // eslint-disable-next-line react/no-children-prop
          children={userInfo => (
            <div>
              <div>{userInfo.data.id}</div>
              <div>{userInfo.data.title}</div>
            </div>
          )}
        />
      </Suspense>
    </>
  );
};

export default ReactComponent;
