import { EN_US } from './enUS';

export const ES_ES: Record<keyof typeof EN_US, string> = {
  Configuration: 'Configuración',
  coldStart: 'Arranque en frío',
  coldBuild: 'Build en frío',
  hmrRoot: 'HMR(raíz modificada)',
  hmrLeaf: 'HMR(hoja modificada)',
  moduleCount: 'Número de módulos',
  guide: 'Guía',
  quickStart: 'Inicio rápido',
  features: 'Características',
  compatibility: 'Compatibilidad',
  migration: 'Migración',
  cli: 'CLI',
  friendLink: 'Ecosistema',
  community: 'Comunidad',
  benchmarkTitle: 'Rendimiento de build',
  benchmarkDesc:
    'Usamos TypeScript y Rust y ejecutamos tareas en paralelo durante el build.',
  benchmarkDetail: 'Ver detalles del benchmark',
  announcementVideo:
    'https://module-federation-assest.netlify.app/document/announcement/blog/announcement/announcement-video.mp4',
  announcementVideoPoster:
    'https://module-federation-assest.netlify.app/document/announcement/blog/announcement/announcement-video-poster.png',
};
