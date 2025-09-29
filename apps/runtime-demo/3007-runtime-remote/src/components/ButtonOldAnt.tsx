import Button from 'antd/lib/button';
import antdPackage from 'antd/package.json';
import stuff from './stuff.module.css';

const { version } = antdPackage;

export default function ButtonOldAnt() {
  return (
    <Button className={stuff['test-remote2'] + ' test-remote2'}>
      Button from antd@{version}
    </Button>
  );
}
