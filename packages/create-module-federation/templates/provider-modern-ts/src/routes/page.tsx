import { Helmet } from '@modern-js/runtime/head';
import './index.css';
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
      <Header />
      <Description />
      <Footer />
    </div>
  </div>
);

export default Index;
