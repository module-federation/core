import { Button, Badge } from 'antd';
// @ts-ignore
window.Button = Button;

const App = () => {
  return (
    <div className="content">
      <Button>1231231243</Button>
      <p>Start building amazing things with Rsbuildss.</p>
      <Badge count={25} />
    </div>
  );
};

export default App;
