import Button from 'antd/lib/button';
import antdPackage from 'antd/package.json';
import stuff from './stuff.module.css';

const { version } = antdPackage;
export default function ButtonOldAnt() {
  return (
    <span suppressHydrationWarning>
      <Button className={stuff.test}>Button from antd@{version}</Button>
    </span>
  );
}
