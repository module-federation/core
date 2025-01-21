import './App.css';
import Header from 'provider/Header';
import Description from 'provider/Description';
import Footer from 'provider/Footer';

const App = () => {
  return (
    <div className="content">
      <Header />
      <Description />
      <Footer />
    </div>
  );
};

export default App;
