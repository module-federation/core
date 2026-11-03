import { EN_US } from './enUS';

export const DE_DE: Record<keyof typeof EN_US, string> = {
  Configuration: 'Konfiguration',
  coldStart: 'Kaltstart',
  coldBuild: 'Build ohne Cache',
  hmrRoot: 'HMR (Root geändert)',
  hmrLeaf: 'HMR (Leaf geändert)',
  moduleCount: 'Anzahl der Module',
  guide: 'Leitfaden',
  quickStart: 'Schnellstart',
  features: 'Funktionen',
  compatibility: 'Kompatibilität',
  migration: 'Migration',
  cli: 'CLI',
  friendLink: 'Ökosystem',
  community: 'Community',
  benchmarkTitle: 'Build-Performance',
  benchmarkDesc:
    'TypeScript und Rust mit einer parallelen Architektur für effizientes Entwickeln.',
  benchmarkDetail: 'Benchmark-Details ansehen',
  announcementVideo:
    'https://module-federation-assest.netlify.app/document/announcement/blog/announcement/announcement-video.mp4',
  announcementVideoPoster:
    'https://module-federation-assest.netlify.app/document/announcement/blog/announcement/announcement-video-poster.png',
};
