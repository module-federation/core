import { Helmet } from '@modern-js/runtime/head';
import './index.css';
import { ComponentInspector } from '../components/ComponentInspector';
import Header from '../components/Header';
import Description from '../components/Description';
import Footer from '../components/Footer';

const Index = () => (
  <div className="container-box">
    <Helmet>
      <link
        rel="icon"
        type="image/x-icon"
        href="https://lf3-static.bytednsdoc.com/obj/eden-cn/uhbfnupenuhf/favicon.ico"
      />
    </Helmet>

    <div className="landing-page">
      <ComponentInspector componentName="Header" mfName="provider">
        <Header />
      </ComponentInspector>

      <ComponentInspector componentName="Description" mfName="provider">
        <Description />
      </ComponentInspector>

      <ComponentInspector componentName="Footer" mfName="provider">
        <Footer />
      </ComponentInspector>
    </div>
  </div>
);

export default Index;
