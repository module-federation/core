import { EN_US } from './enUS';

export const ZH_CN: Record<keyof typeof EN_US, string> = {
  Configuration: '配置',
  coldStart: '冷启动（dev）',
  coldBuild: '冷构建',
  hmrRoot: '热更新（根模块变动）',
  hmrLeaf: '热更新（叶子模块变动）',
  moduleCount: '模块数量',
  guide: '指南',
  quickStart: '快速开始',
  features: '核心特性',
  compatibility: '对 webpack 的兼容性',
  migration: '迁移指南',
  cli: 'CLI 接口',
  friendLink: '友情链接',
  community: '社区',
  benchmarkTitle: '极快的构建速度',
  benchmarkDesc:
    '基于 Rust 和 TypeScript 的高度并行、增量编译架构，构建速度非常快，带给你极致的开发体验。',
  benchmarkDetail: '参见 Benchmark 详情',
  announcementVideo:
    'https://module-federation-assest.netlify.app/document/announcement/blog/announcement/announcement-video.mp4',
  announcementVideoPoster:
    'https://module-federation-assest.netlify.app/document/announcement/blog/announcement/announcement-video-poster.png',
};
