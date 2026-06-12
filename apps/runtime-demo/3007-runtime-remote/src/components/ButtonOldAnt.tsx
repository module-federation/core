import Button from 'antd/lib/button';
import { version } from 'antd';
import stuff from './stuff.module.css';

export default function ButtonOldAnt() {
  return (
    <Button className={stuff['test-remote2'] + ' test-remote2'}>
      Button from antd@{version}
    </Button>
  );
}
