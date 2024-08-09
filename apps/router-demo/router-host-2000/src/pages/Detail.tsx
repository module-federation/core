import { loadRemote } from '@module-federation/enhanced/runtime';
import Button from 'remote1/button';

// console.log('loadRemote', loadRemote);
// loadRemote("remote1/button").then((m) => {
// 	console.log(m);
// });

function Detail() {
  return (
    <div>
      Detail
      <h5>Remote Button</h5>
      <Button />
    </div>
  );
}

export default Detail;
