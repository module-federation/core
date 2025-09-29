import Button from 'antd/lib/button';
import antdPackage from 'antd/package.json';
import * as stuff from './stuff.module.css';

const { version } = antdPackage;

export default function ButtonOldAnt() {
  return (
    // @ts-ignore
    <Button className={stuff['test-remote2'] + ' test-remote2'}>
      Button from antd@{version}
    </Button>
  );
}
