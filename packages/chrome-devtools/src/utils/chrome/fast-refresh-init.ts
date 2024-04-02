import { getUrl } from './index';

const fastRefreshMessageUrl = getUrl('fast-refresh.js');
const script = document.createElement('script');
script.src = fastRefreshMessageUrl;
document.getElementsByTagName('html')[0].appendChild(script);
