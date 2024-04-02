import { getUrl } from './index';

const postMessageUrl = getUrl('post-message.js');
const script = document.createElement('script');
script.src = postMessageUrl;
document.getElementsByTagName('html')[0].appendChild(script);
