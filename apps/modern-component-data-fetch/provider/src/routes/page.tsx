import { useLoaderData } from '@modern-js/runtime/router';
import Content from '../components/BasicComponent';
import './index.css';
import type { Data } from './page.data';

const Index = () => {
  const data = useLoaderData() as Data;
  console.log('page data', data);

  return (
    <div className="container-box">
      <Content mfData={data} />
    </div>
  );
};

export default Index;
