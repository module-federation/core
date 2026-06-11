import Button from 'antd/lib/button';
import version from 'antd/lib/version';
import stuff from './stuff.module.css';

export default function ButtonOldAnt() {
  return <Button className={stuff.test}>Button from antd@{version}</Button>;
}
