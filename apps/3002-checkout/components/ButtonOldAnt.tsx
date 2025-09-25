import { Button } from 'antd';
import antdPkg from 'antd/package.json';
import stuff from './stuff.module.css';
export default function ButtonOldAnt() {
  const version = (antdPkg as any).version;
  return <Button className={stuff.test}>Button from antd@{version}</Button>;
}
