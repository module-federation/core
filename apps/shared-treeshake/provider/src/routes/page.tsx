import { Button } from 'antd';
import { foo } from './test';
// @ts-ignore
window.Button = Button;

// @ts-ignore
window.foo = foo;
const App = () => {
  return (
    <div className="content">
      <Button>1231231243</Button>
      <p>Start building amazing things with Rsbuild.</p>
    </div>
  );
};

export default App;
