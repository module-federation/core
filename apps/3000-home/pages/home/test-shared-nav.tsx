import { useRouter } from 'next/compat/router';
import SharedNav from '../../components/SharedNav';

export default function TestSharedNav() {
  const router = useRouter();
  const resolvedPath =
    router?.asPath || router?.pathname || '/home/test-shared-nav';
  return (
    <div>
      <SharedNav currentPath={resolvedPath} />
    </div>
  );
}
