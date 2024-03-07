const o = {
    'en-US': {
      lang: 'en-US',
      currency: 'USD',
      timeZone: 'America/Los_Angeles',
    },
    'pt-BR': { lang: 'pt-BR', currency: 'BRL', timeZone: 'America/Sao_Paulo' },
    'zh-CN': { lang: 'zh-CN', currency: 'CNY', timeZone: 'Asia/Shanghai' },
  },
  l = {
    defaultLocale: o['en-US'],
    supportedLocales: Object.values(o),
    assets: [
      'app',
      'contact',
      'banner',
      'discord',
      'doc-summary',
      'evolving',
      'explore',
      'footer',
      'hero',
      'medusa',
      'navbar',
      'showcase',
      'sponsor',
      'subscribe',
      'showcase-page',
    ],
  },
  i = (e, s) => {
    const n = e.startsWith('/') ? e : `/${e}`,
      c = n.endsWith('/') ? n : `${n}/`,
      a = `${
        l.defaultLocale.lang === s.locale.lang ? '' : `/${s.locale.lang}`
      }${c}`;
    return a.includes('/#') ? a.slice(0, -1) : a;
  };
export { o as L, l as c, i as l };
