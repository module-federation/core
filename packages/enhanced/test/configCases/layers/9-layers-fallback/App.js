import lodash from 'lodash';
import ComponentA from './ComponentA';
import ComponentB from './ComponentB';

export default function App() {
  const lodashVersion = lodash.VERSION || 'unknown';
  return `App (no layer) with lodash ${lodashVersion}: ${ComponentA()} | ${ComponentB()}`;
}
