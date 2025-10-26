---
'@module-federation/bridge-react': patch
---

fix: support React Router v6 in peer dependencies

Update react-router peer dependency from "^7" to "^6 || ^7" to fix npm install failures for projects using React Router v6.
