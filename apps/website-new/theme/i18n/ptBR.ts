import { EN_US } from './enUS';

export const PT_BR: Record<keyof typeof EN_US, string> = {
  Configuration: 'Configuração',
  coldStart: 'Inicialização fria',
  coldBuild: 'Build frio',
  hmrRoot: 'HMR(raiz alterada)',
  hmrLeaf: 'HMR(folha alterada)',
  moduleCount: 'Contagem de módulos',
  guide: 'Guia',
  quickStart: 'Primeiros passos',
  features: 'Recursos',
  compatibility: 'Compatibilidade',
  migration: 'Migração',
  cli: 'CLI',
  friendLink: 'Ecossistema',
  community: 'Comunidade',
  benchmarkTitle: 'Performance de build',
  benchmarkDesc:
    'Combinando TypeScript e Rust com uma arquitetura paralelizada para oferecer uma excelente experiência de desenvolvimento.',
  benchmarkDetail: 'Ver detalhes do benchmark',
  announcementVideo:
    'https://module-federation-assest.netlify.app/document/announcement/blog/announcement/announcement-video.mp4',
  announcementVideoPoster:
    'https://module-federation-assest.netlify.app/document/announcement/blog/announcement/announcement-video-poster.png',
};
