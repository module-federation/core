import './App.css';
import { ComponentInspector } from './components/ComponentInspector';
import Header from 'provider/Header';
import Description from 'provider/Description';
import Footer from 'provider/Footer';

const App = () => {
  return (
    <div className="content">
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
  );
};

export default App;
