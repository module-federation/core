import React from 'react';
import './index.css';
import Image from '../components/Image';

const Index = () => (
  <div className="container-box">
    <React.Suspense>
      <Image />
    </React.Suspense>
  </div>
);

export default Index;
