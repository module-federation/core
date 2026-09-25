# RFC 5036 premise probe results

Generated 2026-09-25T06:37:16.833Z by probe/run.mjs. Cell legend: first char G = implementation module is in the module graph (resolved path from stats, nested/concatenated modules flattened), second char E = its marker string survives in emitted JS. `--` = absent from both.

Modes: M1 = production default; M2 = production, minimize:false; M3 = minimize:false, sideEffects:false, usedExports:false, concatenateModules:false, innerGraph:false (the RFC criterion); M3+se = M3 with optimization.sideEffects back on (the one pass fold-at-parse needs).

Profiles: ALL-OFF = no remotes/shared/exposes + experiments.optimization {disableShared, disableRemote, disableSnapshot, target:web}; DEFAULT = one remote, shared tslib, one expose, no optimization flags; ALL-OFF+cond = ALL-OFF plus resolve.conditionNames = selector conditions + "..."; ALL-OFF+expose = ALL-OFF plus one expose (rspack only inits the runtime when shared or exposes data exists).

Columns "fed mods in chunks" / "fed orphans": federation modules placed in an emitted chunk vs built but left out of every chunk (only inactive connections reach them). Empty on rows from before these columns existed.

Markers: shared -> `Ensure the shared config for` (/runtime-core\/dist\/shared\/index\.(js|cjs)$/); remote -> `preloadRemote failed to load` (/runtime-core\/dist\/remote\/index\.(js|cjs)$/); module -> `remoteEntryExports is undefined` (/runtime-core\/dist\/module\/index\.(js|cjs)$/); snapshot -> `"snapshot-plugin"` (/runtime-core\/dist\/plugins\/snapshot\/index\.(js|cjs)$/); preload -> `generate-preload-assets-plugin` (/runtime-core\/dist\/plugins\/generate-preload-assets\.(js|cjs)$/); container -> `initOptions.shared` (/webpack-bundler-runtime\/dist\/initContainerEntry\.(js|cjs)$/); sdknode -> `Script execution error` (/sdk\/dist\/(node|selectors\/platform-loader\/node)\.(js|cjs)$/)

### main  (origin/main (baseline))

| bundler | profile | mode | shared | remote | module | snapshot | preload | container | sdknode | main bytes | total JS bytes | fed mods in chunks | fed orphans |
|---|---|---|---|---|---|---|---|---|---|---|---|---|---|
| webpack | ALL-OFF | M1 | G- | G- | G- | G- | G- | G- | G- | 28047 | 28198 |  |  |
| webpack | ALL-OFF | M2 | GE | GE | GE | GE | GE | GE | G- | 197034 | 197421 |  |  |
| webpack | ALL-OFF | M3 | GE | GE | GE | GE | GE | GE | G- | 315280 | 315712 |  |  |
| webpack | ALL-OFF | M3+se | GE | GE | GE | GE | GE | GE | G- | 296372 | 296804 |  |  |
| rspack | ALL-OFF | M1 | GE | GE | GE | GE | GE | GE | G- | 107387 | 107556 |  |  |
| rspack | ALL-OFF | M2 | GE | GE | GE | GE | GE | GE | G- | 245801 | 246157 |  |  |
| rspack | ALL-OFF | M3 | GE | GE | GE | GE | GE | GE | G- | 265055 | 265411 |  |  |
| rspack | ALL-OFF | M3+se | GE | GE | GE | GE | GE | GE | G- | 245919 | 246275 |  |  |
| webpack | DEFAULT | M1 | GE | GE | GE | GE | GE | GE | GE | 88470 | 188015 |  |  |
| webpack | DEFAULT | M2 | GE | GE | GE | GE | GE | GE | GE | 206398 | 432882 |  |  |
| webpack | DEFAULT | M3 | GE | GE | GE | GE | GE | GE | GE | 304605 | 628875 |  |  |
| webpack | DEFAULT | M3+se | GE | GE | GE | GE | GE | GE | GE | 306226 | 632117 |  |  |
| rspack | DEFAULT | M1 | GE | GE | GE | GE | GE | GE | GE | 118131 | 247552 |  |  |
| rspack | DEFAULT | M2 | GE | GE | GE | GE | GE | GE | GE | 250693 | 520655 |  |  |
| rspack | DEFAULT | M3 | GE | GE | GE | GE | GE | GE | GE | 250747 | 520736 |  |  |
| rspack | DEFAULT | M3+se | GE | GE | GE | GE | GE | GE | GE | 250747 | 520736 |  |  |

### main-proto  (rfc-probe/fold-at-parse (prototype))

| bundler | profile | mode | shared | remote | module | snapshot | preload | container | sdknode | main bytes | total JS bytes | fed mods in chunks | fed orphans |
|---|---|---|---|---|---|---|---|---|---|---|---|---|---|
| webpack | ALL-OFF | M1 | -- | -- | -- | -- | -- | -- | G- | 27873 | 28024 |  |  |
| webpack | ALL-OFF | M2 | -- | -- | -- | -- | -- | -- | G- | 89236 | 89623 |  |  |
| webpack | ALL-OFF | M3 | GE | GE | GE | GE | GE | GE | G- | 308110 | 308542 |  |  |
| webpack | ALL-OFF | M3+se | -- | -- | -- | -- | -- | -- | G- | 160982 | 161413 |  |  |
| rspack | ALL-OFF | M1 | GE | GE | GE | GE | GE | GE | G- | 107036 | 107205 |  |  |
| rspack | ALL-OFF | M2 | GE | GE | GE | GE | GE | GE | G- | 240926 | 241282 |  |  |
| rspack | ALL-OFF | M3 | GE | GE | GE | GE | GE | GE | G- | 260180 | 260536 |  |  |
| rspack | ALL-OFF | M3+se | GE | GE | GE | GE | GE | GE | G- | 241044 | 241400 |  |  |
| webpack | DEFAULT | M1 | GE | GE | GE | GE | GE | GE | GE | 88383 | 187841 |  |  |
| webpack | DEFAULT | M2 | GE | GE | GE | GE | GE | GE | GE | 201378 | 422842 |  |  |
| webpack | DEFAULT | M3 | GE | GE | GE | GE | GE | GE | GE | 300739 | 621143 |  |  |
| webpack | DEFAULT | M3+se | GE | GE | GE | GE | GE | GE | GE | 279512 | 578689 |  |  |
| rspack | DEFAULT | M1 | GE | GE | GE | GE | GE | GE | GE | 117605 | 246500 |  |  |
| rspack | DEFAULT | M2 | GE | GE | GE | GE | GE | GE | GE | 248848 | 516965 |  |  |
| rspack | DEFAULT | M3 | GE | GE | GE | GE | GE | GE | GE | 248902 | 517046 |  |  |
| rspack | DEFAULT | M3+se | GE | GE | GE | GE | GE | GE | GE | 248902 | 517046 |  |  |

### 07  (origin/rfc5036/07-handler-contracts)

| bundler | profile | mode | shared | remote | module | snapshot | preload | container | sdknode | main bytes | total JS bytes | fed mods in chunks | fed orphans |
|---|---|---|---|---|---|---|---|---|---|---|---|---|---|
| webpack | ALL-OFF | M1 | G- | G- | G- | G- | G- | G- | G- | 30902 | 31053 |  |  |
| webpack | ALL-OFF | M2 | GE | GE | GE | GE | GE | GE | G- | 205626 | 206013 |  |  |
| webpack | ALL-OFF | M3 | GE | GE | GE | GE | GE | GE | G- | 333933 | 334365 |  |  |
| webpack | ALL-OFF | M3+se | GE | GE | GE | GE | GE | GE | G- | 315235 | 315667 |  |  |
| rspack | ALL-OFF | M1 | GE | GE | GE | GE | GE | GE | G- | 115174 | 115343 |  |  |
| rspack | ALL-OFF | M2 | GE | GE | GE | GE | GE | GE | G- | 259897 | 260253 |  |  |
| rspack | ALL-OFF | M3 | GE | GE | GE | GE | GE | GE | G- | 279151 | 279507 |  |  |
| rspack | ALL-OFF | M3+se | GE | GE | GE | GE | GE | GE | G- | 260015 | 260371 |  |  |
| webpack | ALL-OFF+cond | M1 | -- | -- | -- | -- | -- | -- | -- | 30799 | 30950 |  |  |
| webpack | ALL-OFF+cond | M2 | -- | -- | -- | -- | -- | -- | -- | 103986 | 104373 |  |  |
| webpack | ALL-OFF+cond | M3 | -- | -- | -- | -- | -- | -- | -- | 202933 | 203365 |  |  |
| webpack | ALL-OFF+cond | M3+se | -- | -- | -- | -- | -- | -- | -- | 182918 | 183350 |  |  |
| rspack | ALL-OFF+cond | M1 | -- | -- | -- | -- | -- | -- | -- | 64653 | 64822 |  |  |
| rspack | ALL-OFF+cond | M2 | -- | -- | -- | -- | -- | -- | -- | 146101 | 146457 |  |  |
| rspack | ALL-OFF+cond | M3 | -- | -- | -- | -- | -- | -- | -- | 165355 | 165711 |  |  |
| rspack | ALL-OFF+cond | M3+se | -- | -- | -- | -- | -- | -- | -- | 146219 | 146575 |  |  |
| webpack | DEFAULT | M1 | GE | GE | GE | GE | GE | GE | GE | 90766 | 192607 |  |  |
| webpack | DEFAULT | M2 | GE | GE | GE | GE | GE | GE | GE | 214962 | 450010 |  |  |
| webpack | DEFAULT | M3 | GE | GE | GE | GE | GE | GE | GE | 323003 | 665671 |  |  |
| webpack | DEFAULT | M3+se | GE | GE | GE | GE | GE | GE | GE | 324623 | 668911 |  |  |
| rspack | DEFAULT | M1 | GE | GE | GE | GE | GE | GE | GE | 124258 | 259810 |  |  |
| rspack | DEFAULT | M2 | GE | GE | GE | GE | GE | GE | GE | 264579 | 548431 |  |  |
| rspack | DEFAULT | M3 | GE | GE | GE | GE | GE | GE | GE | 264633 | 548512 |  |  |
| rspack | DEFAULT | M3+se | GE | GE | GE | GE | GE | GE | GE | 264633 | 548512 |  |  |

### main-rspack-esm  (origin/main + rspack ESM alias knob)

| bundler | profile | mode | shared | remote | module | snapshot | preload | container | sdknode | main bytes | total JS bytes | fed mods in chunks | fed orphans |
|---|---|---|---|---|---|---|---|---|---|---|---|---|---|
| rspack | ALL-OFF | M1 | G- | G- | GE | G- | G- | -- | G- | 49582 | 49751 | 65 | 12 |
| rspack | ALL-OFF | M2 | GE | GE | GE | GE | GE | -- | G- | 208830 | 209186 | 65 | 12 |
| rspack | ALL-OFF | M3+se | GE | GE | GE | GE | GE | -- | G- | 263613 | 263969 | 65 | 12 |
| rspack | ALL-OFF+expose | M1 | G- | G- | GE | G- | G- | GE | G- | 50537 | 101584 | 66 | 11 |
| rspack | ALL-OFF+expose | M2 | GE | GE | GE | GE | GE | GE | G- | 211103 | 423196 | 66 | 11 |
| rspack | ALL-OFF+expose | M3+se | GE | GE | GE | GE | GE | GE | G- | 266193 | 533332 | 66 | 11 |
| rspack | DEFAULT | M1 | GE | GE | GE | GE | GE | GE | GE | 89400 | 189965 | 66 | 11 |
| rspack | DEFAULT | M2 | GE | GE | GE | GE | GE | GE | GE | 216494 | 451936 | 66 | 11 |
| rspack | DEFAULT | M3+se | GE | GE | GE | GE | GE | GE | GE | 271557 | 562031 | 66 | 11 |

### proto-rspack-esm  (rfc-probe/fold-at-parse + rspack ESM alias knob)

| bundler | profile | mode | shared | remote | module | snapshot | preload | container | sdknode | main bytes | total JS bytes | fed mods in chunks | fed orphans |
|---|---|---|---|---|---|---|---|---|---|---|---|---|---|
| rspack | ALL-OFF | M1 | -- | -- | -- | -- | -- | -- | G- | 33480 | 33649 | 38 | 37 |
| rspack | ALL-OFF | M2 | -- | -- | -- | -- | -- | -- | G- | 104579 | 104935 | 38 | 37 |
| rspack | ALL-OFF | M3+se | -- | -- | -- | -- | -- | -- | G- | 153464 | 153820 | 44 | 31 |
| rspack | ALL-OFF+expose | M1 | -- | -- | -- | -- | -- | GE | G- | 34435 | 69380 | 39 | 36 |
| rspack | ALL-OFF+expose | M2 | -- | -- | -- | -- | -- | GE | G- | 106852 | 214694 | 39 | 36 |
| rspack | ALL-OFF+expose | M3+se | -- | -- | -- | -- | -- | GE | G- | 156042 | 313030 | 45 | 30 |
| rspack | DEFAULT | M1 | GE | GE | GE | GE | GE | GE | GE | 89317 | 189799 | 59 | 16 |
| rspack | DEFAULT | M2 | GE | GE | GE | GE | GE | GE | GE | 213223 | 445394 | 59 | 16 |
| rspack | DEFAULT | M3+se | GE | GE | GE | GE | GE | GE | GE | 265480 | 549877 | 61 | 14 |

### proto-rspack2-esm  (rfc-probe/fold-at-parse + rspack ESM alias knob, @rspack/core 2.1.8)

| bundler | profile | mode | shared | remote | module | snapshot | preload | container | sdknode | main bytes | total JS bytes | fed mods in chunks | fed orphans |
|---|---|---|---|---|---|---|---|---|---|---|---|---|---|
| rspack | ALL-OFF | M1 | -- | -- | -- | -- | -- | -- | G- | 31353 | 31502 | 38 | 6 |
| rspack | ALL-OFF | M2 | -- | -- | -- | -- | -- | -- | G- | 106147 | 106442 | 38 | 6 |
| rspack | ALL-OFF | M3+se | -- | -- | -- | -- | -- | -- | G- | 144482 | 144821 | 42 | 2 |
| rspack | ALL-OFF+expose | M1 | -- | -- | -- | -- | -- | GE | G- | 32308 | 65253 | 39 | 6 |
| rspack | ALL-OFF+expose | M2 | -- | -- | -- | -- | -- | GE | G- | 108420 | 218051 | 39 | 6 |
| rspack | ALL-OFF+expose | M3+se | -- | -- | -- | -- | -- | GE | G- | 147020 | 294928 | 43 | 2 |
| rspack | DEFAULT | M1 | GE | GE | GE | GE | GE | GE | GE | 89424 | 190305 | 59 | 2 |
| rspack | DEFAULT | M2 | GE | GE | GE | GE | GE | GE | GE | 214677 | 448894 | 59 | 2 |
| rspack | DEFAULT | M3+se | GE | GE | GE | GE | GE | GE | GE | 252306 | 523828 | 59 | 2 |

### kernel-root  (rfc-probe/kernel-split, root (legacy) bootstrap, @rspack/core 1.x default)

| bundler | profile | mode | shared | remote | module | snapshot | preload | container | sdknode | main bytes | total JS bytes | fed mods in chunks | fed orphans |
|---|---|---|---|---|---|---|---|---|---|---|---|---|---|
| webpack | ALL-OFF | M1 | G- | G- | G- | G- | G- | G- | G- | 28740 | 28891 | 86 | 0 |
| webpack | ALL-OFF | M2 | G- | G- | GE | G- | G- | GE | G- | 132706 | 133093 | 86 | 0 |
| webpack | ALL-OFF | M3 | GE | GE | GE | GE | GE | GE | G- | 332122 | 332554 | 86 | 0 |
| webpack | ALL-OFF | M3+se | GE | GE | GE | GE | GE | GE | G- | 313575 | 314007 | 86 | 0 |
| rspack | ALL-OFF | M1 | GE | GE | GE | GE | GE | GE | G- | 114659 | 114828 | 87 | 0 |
| rspack | ALL-OFF | M2 | GE | GE | GE | GE | GE | GE | G- | 256896 | 257252 | 87 | 0 |
| rspack | ALL-OFF | M3 | GE | GE | GE | GE | GE | GE | G- | 276150 | 276506 | 87 | 0 |
| rspack | ALL-OFF | M3+se | GE | GE | GE | GE | GE | GE | G- | 257014 | 257370 | 87 | 0 |
| webpack | DEFAULT | M1 | GE | GE | GE | GE | GE | GE | GE | 89069 | 189213 | 86 | 0 |
| webpack | DEFAULT | M2 | GE | GE | GE | GE | GE | GE | GE | 208233 | 436552 | 86 | 0 |
| webpack | DEFAULT | M3 | GE | GE | GE | GE | GE | GE | GE | 321527 | 662719 | 86 | 0 |
| webpack | DEFAULT | M3+se | GE | GE | GE | GE | GE | GE | GE | 323839 | 667343 | 86 | 0 |
| rspack | DEFAULT | M1 | GE | GE | GE | GE | GE | GE | GE | 123594 | 258478 | 87 | 0 |
| rspack | DEFAULT | M2 | GE | GE | GE | GE | GE | GE | GE | 261789 | 542847 | 87 | 0 |
| rspack | DEFAULT | M3 | GE | GE | GE | GE | GE | GE | GE | 261843 | 542928 | 87 | 0 |
| rspack | DEFAULT | M3+se | GE | GE | GE | GE | GE | GE | GE | 261843 | 542928 | 87 | 0 |

### composed  (rfc-probe/kernel-split (kernel + capability subpaths, composed bootstrap), @rspack/core 2.1.8)

| bundler | profile | mode | shared | remote | module | snapshot | preload | container | sdknode | main bytes | total JS bytes | fed mods in chunks | fed orphans | rcRoot | sdkRoot | rtRoot | wbrRoot |
|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|
| webpack | ALL-OFF | M1 | -- | -- | -- | -- | -- | -- | -- | 17917 | 18068 | 46 | 0 | - | - | - | - |
| webpack | ALL-OFF | M2 | -- | -- | -- | -- | -- | -- | -- | 71250 | 71637 | 46 | 0 | - | - | - | - |
| webpack | ALL-OFF | M3 | -- | -- | -- | -- | -- | -- | -- | 148931 | 149363 | 46 | 0 | - | - | - | - |
| webpack | ALL-OFF | M3+se | -- | -- | -- | -- | -- | -- | -- | 128945 | 129376 | 46 | 0 | - | - | - | - |
| rspack | ALL-OFF | M1 | -- | -- | -- | -- | -- | -- | -- | 21274 | 21423 | 31 | 5 | - | - | - | - |
| rspack | ALL-OFF | M2 | -- | -- | -- | -- | -- | -- | -- | 69719 | 70014 | 31 | 5 | - | - | - | - |
| rspack | ALL-OFF | M3 | -- | -- | -- | -- | -- | -- | -- | 136404 | 136744 | 47 | 0 | - | - | - | - |
| rspack | ALL-OFF | M3+se | -- | -- | -- | -- | -- | -- | -- | 89239 | 89578 | 33 | 3 | - | - | - | - |
| webpack | remotes-only | M1 | -- | GE | GE | -- | -- | -- | -- | 56449 | 56600 | 68 | 0 | - | - | - | - |
| webpack | remotes-only | M2 | -- | GE | GE | -- | -- | -- | -- | 158492 | 158879 | 68 | 0 | - | - | - | - |
| webpack | remotes-only | M3 | -- | GE | GE | -- | -- | -- | -- | 255505 | 255937 | 68 | 0 | - | - | - | - |
| webpack | remotes-only | M3+se | -- | GE | GE | -- | -- | -- | -- | 236579 | 237011 | 68 | 0 | - | - | - | - |
| rspack | remotes-only | M1 | -- | GE | GE | -- | -- | -- | -- | 58782 | 58931 | 52 | 8 | - | - | - | - |
| rspack | remotes-only | M2 | -- | GE | GE | -- | -- | -- | -- | 158609 | 158904 | 52 | 8 | - | - | - | - |
| rspack | remotes-only | M3 | -- | GE | GE | -- | -- | -- | -- | 233110 | 233450 | 69 | 0 | - | - | - | - |
| rspack | remotes-only | M3+se | -- | GE | GE | -- | -- | -- | -- | 199189 | 199529 | 57 | 3 | - | - | - | - |
| webpack | ALL-OFF+expose | M1 | -- | -- | -- | -- | -- | GE | -- | 23225 | 47286 | 54 | 0 | - | - | - | - |
| webpack | ALL-OFF+expose | M2 | -- | -- | -- | -- | -- | GE | -- | 84659 | 171390 | 54 | 0 | - | - | - | - |
| webpack | ALL-OFF+expose | M3 | -- | -- | -- | -- | -- | GE | -- | 166071 | 313023 | 54 | 0 | - | - | - | - |
| webpack | ALL-OFF+expose | M3+se | -- | -- | -- | -- | -- | GE | -- | 146236 | 293671 | 54 | 0 | - | - | - | - |
| rspack | ALL-OFF+expose | M1 | -- | -- | -- | -- | -- | GE | -- | 26497 | 53795 | 39 | 5 | - | - | - | - |
| rspack | ALL-OFF+expose | M2 | -- | -- | -- | -- | -- | GE | -- | 83307 | 168162 | 39 | 5 | - | - | - | - |
| rspack | ALL-OFF+expose | M3 | -- | -- | -- | -- | -- | GE | -- | 152476 | 286765 | 55 | 0 | - | - | - | - |
| rspack | ALL-OFF+expose | M3+se | -- | -- | -- | -- | -- | GE | -- | 105298 | 211488 | 41 | 3 | - | - | - | - |
| webpack | DEFAULT | M1 | GE | GE | GE | GE | GE | GE | -- | 83410 | 177895 | 81 | 0 | - | - | - | - |
| webpack | DEFAULT | M2 | GE | GE | GE | GE | GE | GE | -- | 195641 | 411368 | 81 | 0 | - | - | - | - |
| webpack | DEFAULT | M3 | GE | GE | GE | GE | GE | GE | -- | 285211 | 590087 | 81 | 0 | - | - | - | - |
| webpack | DEFAULT | M3+se | GE | GE | GE | GE | GE | GE | -- | 287284 | 594233 | 81 | 0 | - | - | - | - |
| rspack | DEFAULT | M1 | GE | GE | GE | GE | GE | GE | -- | 84652 | 180761 | 70 | 3 | - | - | - | - |
| rspack | DEFAULT | M2 | GE | GE | GE | GE | GE | GE | -- | 207407 | 434354 | 70 | 3 | - | - | - | - |
| rspack | DEFAULT | M3 | GE | GE | GE | GE | GE | GE | -- | 259591 | 538398 | 82 | 0 | - | - | - | - |
| rspack | DEFAULT | M3+se | GE | GE | GE | GE | GE | GE | -- | 245313 | 509842 | 70 | 3 | - | - | - | - |

### main-rspack2  (origin/main base 6bd7ea0aa (legacy bootstrap), @rspack/core 2.1.8)

| bundler | profile | mode | shared | remote | module | snapshot | preload | container | sdknode | main bytes | total JS bytes | fed mods in chunks | fed orphans |
|---|---|---|---|---|---|---|---|---|---|---|---|---|---|
| rspack | ALL-OFF | M1 | GE | GE | GE | GE | GE | GE | G- | 107010 | 107160 | 79 | 0 |
| rspack | ALL-OFF | M2 | GE | GE | GE | GE | GE | GE | G- | 241371 | 241667 | 79 | 0 |
| rspack | ALL-OFF | M3 | GE | GE | GE | GE | GE | GE | G- | 260454 | 260794 | 79 | 0 |
| rspack | ALL-OFF | M3+se | GE | GE | GE | GE | GE | GE | G- | 241358 | 241698 | 79 | 0 |
| rspack | remotes-only | M1 | GE | GE | GE | GE | GE | GE | G- | 107440 | 107590 | 79 | 0 |
| rspack | remotes-only | M2 | GE | GE | GE | GE | GE | GE | G- | 242098 | 242394 | 79 | 0 |
| rspack | remotes-only | M3 | GE | GE | GE | GE | GE | GE | G- | 261181 | 261521 | 79 | 0 |
| rspack | remotes-only | M3+se | GE | GE | GE | GE | GE | GE | G- | 242085 | 242425 | 79 | 0 |
| rspack | DEFAULT | M1 | GE | GE | GE | GE | GE | GE | GE | 117729 | 247098 | 79 | 0 |
| rspack | DEFAULT | M2 | GE | GE | GE | GE | GE | GE | GE | 249360 | 518585 | 79 | 0 |
| rspack | DEFAULT | M3 | GE | GE | GE | GE | GE | GE | GE | 249116 | 517773 | 79 | 0 |
| rspack | DEFAULT | M3+se | GE | GE | GE | GE | GE | GE | GE | 249116 | 517773 | 79 | 0 |

### attach  (rfc-probe/kernel-split + slots/attach (composed bootstrap))

| bundler | profile | mode | shared | remote | module | snapshot | preload | container | sdknode | main bytes | total JS bytes | fed mods in chunks | fed orphans | rcRoot | sdkRoot | rtRoot | wbrRoot |
|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|
| webpack | ALL-OFF | M1 | -- | -- | -- | -- | -- | -- | -- | 17916 | 18067 | 46 | 0 | - | - | - | - |
| webpack | ALL-OFF | M3 | -- | -- | -- | -- | -- | -- | -- | 148931 | 149363 | 46 | 0 | - | - | - | - |
| webpack | remotes-only | M1 | -- | GE | GE | -- | -- | -- | -- | 56449 | 56600 | 68 | 0 | - | - | - | - |
| webpack | remotes-only | M3 | -- | GE | GE | -- | -- | -- | -- | 255505 | 255937 | 68 | 0 | - | - | - | - |
| webpack | ALL-OFF+expose | M1 | -- | -- | -- | -- | -- | GE | -- | 23225 | 47286 | 54 | 0 | - | - | - | - |
| webpack | ALL-OFF+expose | M3 | -- | -- | -- | -- | -- | GE | -- | 166071 | 313023 | 54 | 0 | - | - | - | - |
| webpack | DEFAULT | M1 | GE | GE | GE | GE | GE | GE | -- | 83410 | 177895 | 81 | 0 | - | - | - | - |
| webpack | DEFAULT | M3 | GE | GE | GE | GE | GE | GE | -- | 285211 | 590087 | 81 | 0 | - | - | - | - |

## Resolved federation modules per cell

- main/webpack/ALL-OFF/M1: 830.js=150, main.js=28047 ; modules in out/main/webpack/ALL-OFF/M1/modules.json
- main/webpack/ALL-OFF/M2: 830.js=386, main.js=197034 ; modules in out/main/webpack/ALL-OFF/M2/modules.json
- main/webpack/ALL-OFF/M3: 830.js=431, main.js=315280 ; modules in out/main/webpack/ALL-OFF/M3/modules.json
- main/webpack/ALL-OFF/M3+se: 830.js=431, main.js=296372 ; modules in out/main/webpack/ALL-OFF/M3+se/modules.json
- main/rspack/ALL-OFF/M1: 763.js=168, main.js=107387 ; modules in out/main/rspack/ALL-OFF/M1/modules.json
- main/rspack/ALL-OFF/M2: 763.js=355, main.js=245801 ; modules in out/main/rspack/ALL-OFF/M2/modules.json
- main/rspack/ALL-OFF/M3: 763.js=355, main.js=265055 ; modules in out/main/rspack/ALL-OFF/M3/modules.json
- main/rspack/ALL-OFF/M3+se: 763.js=355, main.js=245919 ; modules in out/main/rspack/ALL-OFF/M3+se/modules.json
- main/webpack/DEFAULT/M1: 449.js=161, 830.js=154, 959.js=11205, main.js=88470, remoteEntry.js=88021 ; modules in out/main/webpack/DEFAULT/M1/modules.json
- main/webpack/DEFAULT/M2: 449.js=434, 830.js=390, 959.js=20328, main.js=206398, remoteEntry.js=205328 ; modules in out/main/webpack/DEFAULT/M2/modules.json
- main/webpack/DEFAULT/M3: 830.js=431, 959.js=20329, main.js=304605, remoteEntry.js=303507 ; modules in out/main/webpack/DEFAULT/M3/modules.json
- main/webpack/DEFAULT/M3+se: 830.js=431, 959.js=20329, main.js=306226, remoteEntry.js=305128 ; modules in out/main/webpack/DEFAULT/M3+se/modules.json
- main/rspack/DEFAULT/M1: 141.js=11115, 763.js=168, main.js=118131, remoteEntry.js=118135 ; modules in out/main/rspack/DEFAULT/M1/modules.json
- main/rspack/DEFAULT/M2: 141.js=19143, 763.js=355, main.js=250693, remoteEntry.js=250461 ; modules in out/main/rspack/DEFAULT/M2/modules.json
- main/rspack/DEFAULT/M3: 141.js=19143, 763.js=355, main.js=250747, remoteEntry.js=250488 ; modules in out/main/rspack/DEFAULT/M3/modules.json
- main/rspack/DEFAULT/M3+se: 141.js=19143, 763.js=355, main.js=250747, remoteEntry.js=250488 ; modules in out/main/rspack/DEFAULT/M3+se/modules.json
- main-proto/webpack/ALL-OFF/M1: 830.js=150, main.js=27873 ; modules in out/main-proto/webpack/ALL-OFF/M1/modules.json
- main-proto/webpack/ALL-OFF/M2: 830.js=386, main.js=89236 ; modules in out/main-proto/webpack/ALL-OFF/M2/modules.json
- main-proto/webpack/ALL-OFF/M3: 830.js=431, main.js=308110 ; modules in out/main-proto/webpack/ALL-OFF/M3/modules.json
- main-proto/webpack/ALL-OFF/M3+se: 830.js=430, main.js=160982 ; modules in out/main-proto/webpack/ALL-OFF/M3+se/modules.json
- main-proto/rspack/ALL-OFF/M1: 763.js=168, main.js=107036 ; modules in out/main-proto/rspack/ALL-OFF/M1/modules.json
- main-proto/rspack/ALL-OFF/M2: 763.js=355, main.js=240926 ; modules in out/main-proto/rspack/ALL-OFF/M2/modules.json
- main-proto/rspack/ALL-OFF/M3: 763.js=355, main.js=260180 ; modules in out/main-proto/rspack/ALL-OFF/M3/modules.json
- main-proto/rspack/ALL-OFF/M3+se: 763.js=355, main.js=241044 ; modules in out/main-proto/rspack/ALL-OFF/M3+se/modules.json
- main-proto/webpack/DEFAULT/M1: 449.js=161, 830.js=154, 959.js=11205, main.js=88383, remoteEntry.js=87934 ; modules in out/main-proto/webpack/DEFAULT/M1/modules.json
- main-proto/webpack/DEFAULT/M2: 449.js=434, 830.js=390, 959.js=20328, main.js=201378, remoteEntry.js=200308 ; modules in out/main-proto/webpack/DEFAULT/M2/modules.json
- main-proto/webpack/DEFAULT/M3: 830.js=431, 959.js=20329, main.js=300739, remoteEntry.js=299641 ; modules in out/main-proto/webpack/DEFAULT/M3/modules.json
- main-proto/webpack/DEFAULT/M3+se: 830.js=431, 959.js=20329, main.js=279512, remoteEntry.js=278414 ; modules in out/main-proto/webpack/DEFAULT/M3+se/modules.json
- main-proto/rspack/DEFAULT/M1: 141.js=11115, 763.js=168, main.js=117605, remoteEntry.js=117609 ; modules in out/main-proto/rspack/DEFAULT/M1/modules.json
- main-proto/rspack/DEFAULT/M2: 141.js=19143, 763.js=355, main.js=248848, remoteEntry.js=248616 ; modules in out/main-proto/rspack/DEFAULT/M2/modules.json
- main-proto/rspack/DEFAULT/M3: 141.js=19143, 763.js=355, main.js=248902, remoteEntry.js=248643 ; modules in out/main-proto/rspack/DEFAULT/M3/modules.json
- main-proto/rspack/DEFAULT/M3+se: 141.js=19143, 763.js=355, main.js=248902, remoteEntry.js=248643 ; modules in out/main-proto/rspack/DEFAULT/M3+se/modules.json
- 07/webpack/ALL-OFF/M1: 830.js=150, main.js=30902 ; modules in out/07/webpack/ALL-OFF/M1/modules.json
- 07/webpack/ALL-OFF/M2: 830.js=386, main.js=205626 ; modules in out/07/webpack/ALL-OFF/M2/modules.json
- 07/webpack/ALL-OFF/M3: 830.js=431, main.js=333933 ; modules in out/07/webpack/ALL-OFF/M3/modules.json
- 07/webpack/ALL-OFF/M3+se: 830.js=431, main.js=315235 ; modules in out/07/webpack/ALL-OFF/M3+se/modules.json
- 07/rspack/ALL-OFF/M1: 763.js=168, main.js=115174 ; modules in out/07/rspack/ALL-OFF/M1/modules.json
- 07/rspack/ALL-OFF/M2: 763.js=355, main.js=259897 ; modules in out/07/rspack/ALL-OFF/M2/modules.json
- 07/rspack/ALL-OFF/M3: 763.js=355, main.js=279151 ; modules in out/07/rspack/ALL-OFF/M3/modules.json
- 07/rspack/ALL-OFF/M3+se: 763.js=355, main.js=260015 ; modules in out/07/rspack/ALL-OFF/M3+se/modules.json
- 07/webpack/ALL-OFF+cond/M1: 830.js=150, main.js=30799 ; modules in out/07/webpack/ALL-OFF+cond/M1/modules.json
- 07/webpack/ALL-OFF+cond/M2: 830.js=386, main.js=103986 ; modules in out/07/webpack/ALL-OFF+cond/M2/modules.json
- 07/webpack/ALL-OFF+cond/M3: 830.js=431, main.js=202933 ; modules in out/07/webpack/ALL-OFF+cond/M3/modules.json
- 07/webpack/ALL-OFF+cond/M3+se: 830.js=431, main.js=182918 ; modules in out/07/webpack/ALL-OFF+cond/M3+se/modules.json
- 07/rspack/ALL-OFF+cond/M1: 763.js=168, main.js=64653 ; modules in out/07/rspack/ALL-OFF+cond/M1/modules.json
- 07/rspack/ALL-OFF+cond/M2: 763.js=355, main.js=146101 ; modules in out/07/rspack/ALL-OFF+cond/M2/modules.json
- 07/rspack/ALL-OFF+cond/M3: 763.js=355, main.js=165355 ; modules in out/07/rspack/ALL-OFF+cond/M3/modules.json
- 07/rspack/ALL-OFF+cond/M3+se: 763.js=355, main.js=146219 ; modules in out/07/rspack/ALL-OFF+cond/M3+se/modules.json
- 07/webpack/DEFAULT/M1: 449.js=161, 830.js=154, 959.js=11205, main.js=90766, remoteEntry.js=90317 ; modules in out/07/webpack/DEFAULT/M1/modules.json
- 07/webpack/DEFAULT/M2: 449.js=434, 830.js=390, 959.js=20328, main.js=214962, remoteEntry.js=213892 ; modules in out/07/webpack/DEFAULT/M2/modules.json
- 07/webpack/DEFAULT/M3: 830.js=431, 959.js=20329, main.js=323003, remoteEntry.js=321905 ; modules in out/07/webpack/DEFAULT/M3/modules.json
- 07/webpack/DEFAULT/M3+se: 830.js=431, 959.js=20329, main.js=324623, remoteEntry.js=323525 ; modules in out/07/webpack/DEFAULT/M3+se/modules.json
- 07/rspack/DEFAULT/M1: 141.js=11115, 763.js=168, main.js=124258, remoteEntry.js=124266 ; modules in out/07/rspack/DEFAULT/M1/modules.json
- 07/rspack/DEFAULT/M2: 141.js=19143, 763.js=355, main.js=264579, remoteEntry.js=264351 ; modules in out/07/rspack/DEFAULT/M2/modules.json
- 07/rspack/DEFAULT/M3: 141.js=19143, 763.js=355, main.js=264633, remoteEntry.js=264378 ; modules in out/07/rspack/DEFAULT/M3/modules.json
- 07/rspack/DEFAULT/M3+se: 141.js=19143, 763.js=355, main.js=264633, remoteEntry.js=264378 ; modules in out/07/rspack/DEFAULT/M3+se/modules.json
- main-rspack-esm/rspack/ALL-OFF/M1: 763.js=168, main.js=49582 ; modules in out/main-rspack-esm/rspack/ALL-OFF/M1/modules.json
- main-rspack-esm/rspack/ALL-OFF/M2: 763.js=355, main.js=208830 ; modules in out/main-rspack-esm/rspack/ALL-OFF/M2/modules.json
- main-rspack-esm/rspack/ALL-OFF/M3+se: 763.js=355, main.js=263613 ; modules in out/main-rspack-esm/rspack/ALL-OFF/M3+se/modules.json
- main-rspack-esm/rspack/ALL-OFF+expose/M1: 763.js=168, main.js=50537, remoteEntry.js=50877 ; modules in out/main-rspack-esm/rspack/ALL-OFF+expose/M1/modules.json
- main-rspack-esm/rspack/ALL-OFF+expose/M2: 763.js=355, main.js=211103, remoteEntry.js=211736 ; modules in out/main-rspack-esm/rspack/ALL-OFF+expose/M2/modules.json
- main-rspack-esm/rspack/ALL-OFF+expose/M3+se: 763.js=355, main.js=266193, remoteEntry.js=266782 ; modules in out/main-rspack-esm/rspack/ALL-OFF+expose/M3+se/modules.json
- main-rspack-esm/rspack/DEFAULT/M1: 141.js=11115, 763.js=168, main.js=89400, remoteEntry.js=89279 ; modules in out/main-rspack-esm/rspack/DEFAULT/M1/modules.json
- main-rspack-esm/rspack/DEFAULT/M2: 141.js=19143, 763.js=355, main.js=216494, remoteEntry.js=215941 ; modules in out/main-rspack-esm/rspack/DEFAULT/M2/modules.json
- main-rspack-esm/rspack/DEFAULT/M3+se: 141.js=19143, 763.js=355, main.js=271557, remoteEntry.js=270973 ; modules in out/main-rspack-esm/rspack/DEFAULT/M3+se/modules.json
- proto-rspack-esm/rspack/ALL-OFF/M1: 763.js=168, main.js=33480 ; modules in out/proto-rspack-esm/rspack/ALL-OFF/M1/modules.json
- proto-rspack-esm/rspack/ALL-OFF/M2: 763.js=355, main.js=104579 ; modules in out/proto-rspack-esm/rspack/ALL-OFF/M2/modules.json
- proto-rspack-esm/rspack/ALL-OFF/M3+se: 763.js=355, main.js=153464 ; modules in out/proto-rspack-esm/rspack/ALL-OFF/M3+se/modules.json
- proto-rspack-esm/rspack/ALL-OFF+expose/M1: 763.js=168, main.js=34435, remoteEntry.js=34775 ; modules in out/proto-rspack-esm/rspack/ALL-OFF+expose/M1/modules.json
- proto-rspack-esm/rspack/ALL-OFF+expose/M2: 763.js=355, main.js=106852, remoteEntry.js=107485 ; modules in out/proto-rspack-esm/rspack/ALL-OFF+expose/M2/modules.json
- proto-rspack-esm/rspack/ALL-OFF+expose/M3+se: 763.js=355, main.js=156042, remoteEntry.js=156631 ; modules in out/proto-rspack-esm/rspack/ALL-OFF+expose/M3+se/modules.json
- proto-rspack-esm/rspack/DEFAULT/M1: 141.js=11115, 763.js=168, main.js=89317, remoteEntry.js=89196 ; modules in out/proto-rspack-esm/rspack/DEFAULT/M1/modules.json
- proto-rspack-esm/rspack/DEFAULT/M2: 141.js=19143, 763.js=355, main.js=213223, remoteEntry.js=212670 ; modules in out/proto-rspack-esm/rspack/DEFAULT/M2/modules.json
- proto-rspack-esm/rspack/DEFAULT/M3+se: 141.js=19143, 763.js=355, main.js=265480, remoteEntry.js=264896 ; modules in out/proto-rspack-esm/rspack/DEFAULT/M3+se/modules.json
- proto-rspack2-esm/rspack/ALL-OFF/M1: 299.js=148, main.js=31353 ; modules in out/proto-rspack2-esm/rspack/ALL-OFF/M1/modules.json
- proto-rspack2-esm/rspack/ALL-OFF/M2: 299.js=294, main.js=106147 ; modules in out/proto-rspack2-esm/rspack/ALL-OFF/M2/modules.json
- proto-rspack2-esm/rspack/ALL-OFF/M3+se: 299.js=338, main.js=144482 ; modules in out/proto-rspack2-esm/rspack/ALL-OFF/M3+se/modules.json
- proto-rspack2-esm/rspack/ALL-OFF+expose/M1: 299.js=148, 680.js=155, main.js=32308, remoteEntry.js=32639 ; modules in out/proto-rspack2-esm/rspack/ALL-OFF+expose/M1/modules.json
- proto-rspack2-esm/rspack/ALL-OFF+expose/M2: 299.js=294, 680.js=338, main.js=108420, remoteEntry.js=108996 ; modules in out/proto-rspack2-esm/rspack/ALL-OFF+expose/M2/modules.json
- proto-rspack2-esm/rspack/ALL-OFF+expose/M3+se: 299.js=338, main.js=147020, remoteEntry.js=147568 ; modules in out/proto-rspack2-esm/rspack/ALL-OFF+expose/M3+se/modules.json
- proto-rspack2-esm/rspack/DEFAULT/M1: 299.js=148, 420.js=11100, 680.js=155, main.js=89424, remoteEntry.js=89474 ; modules in out/proto-rspack2-esm/rspack/DEFAULT/M1/modules.json
- proto-rspack2-esm/rspack/DEFAULT/M2: 299.js=294, 420.js=19112, 680.js=338, main.js=214677, remoteEntry.js=214469 ; modules in out/proto-rspack2-esm/rspack/DEFAULT/M2/modules.json
- proto-rspack2-esm/rspack/DEFAULT/M3+se: 299.js=339, 420.js=19113, main.js=252306, remoteEntry.js=252067 ; modules in out/proto-rspack2-esm/rspack/DEFAULT/M3+se/modules.json
- kernel-root/webpack/ALL-OFF/M1: 830.js=150, main.js=28740 ; modules in out/kernel-root/webpack/ALL-OFF/M1/modules.json
- kernel-root/webpack/ALL-OFF/M2: 830.js=386, main.js=132706 ; modules in out/kernel-root/webpack/ALL-OFF/M2/modules.json
- kernel-root/webpack/ALL-OFF/M3: 830.js=431, main.js=332122 ; modules in out/kernel-root/webpack/ALL-OFF/M3/modules.json
- kernel-root/webpack/ALL-OFF/M3+se: 830.js=431, main.js=313575 ; modules in out/kernel-root/webpack/ALL-OFF/M3+se/modules.json
- kernel-root/rspack/ALL-OFF/M1: 763.js=168, main.js=114659 ; modules in out/kernel-root/rspack/ALL-OFF/M1/modules.json
- kernel-root/rspack/ALL-OFF/M2: 763.js=355, main.js=256896 ; modules in out/kernel-root/rspack/ALL-OFF/M2/modules.json
- kernel-root/rspack/ALL-OFF/M3: 763.js=355, main.js=276150 ; modules in out/kernel-root/rspack/ALL-OFF/M3/modules.json
- kernel-root/rspack/ALL-OFF/M3+se: 763.js=355, main.js=257014 ; modules in out/kernel-root/rspack/ALL-OFF/M3+se/modules.json
- kernel-root/webpack/DEFAULT/M1: 449.js=161, 830.js=154, 959.js=11205, main.js=89069, remoteEntry.js=88620 ; modules in out/kernel-root/webpack/DEFAULT/M1/modules.json
- kernel-root/webpack/DEFAULT/M2: 449.js=434, 830.js=390, 959.js=20328, main.js=208233, remoteEntry.js=207163 ; modules in out/kernel-root/webpack/DEFAULT/M2/modules.json
- kernel-root/webpack/DEFAULT/M3: 830.js=431, 959.js=20329, main.js=321527, remoteEntry.js=320429 ; modules in out/kernel-root/webpack/DEFAULT/M3/modules.json
- kernel-root/webpack/DEFAULT/M3+se: 830.js=431, 959.js=20329, main.js=323839, remoteEntry.js=322741 ; modules in out/kernel-root/webpack/DEFAULT/M3+se/modules.json
- kernel-root/rspack/DEFAULT/M1: 141.js=11115, 763.js=168, main.js=123594, remoteEntry.js=123598 ; modules in out/kernel-root/rspack/DEFAULT/M1/modules.json
- kernel-root/rspack/DEFAULT/M2: 141.js=19143, 763.js=355, main.js=261789, remoteEntry.js=261557 ; modules in out/kernel-root/rspack/DEFAULT/M2/modules.json
- kernel-root/rspack/DEFAULT/M3: 141.js=19143, 763.js=355, main.js=261843, remoteEntry.js=261584 ; modules in out/kernel-root/rspack/DEFAULT/M3/modules.json
- kernel-root/rspack/DEFAULT/M3+se: 141.js=19143, 763.js=355, main.js=261843, remoteEntry.js=261584 ; modules in out/kernel-root/rspack/DEFAULT/M3+se/modules.json
- composed/webpack/ALL-OFF/M1: 830.js=150, main.js=17917 ; modules in out/composed/webpack/ALL-OFF/M1/modules.json
- composed/webpack/ALL-OFF/M2: 830.js=386, main.js=71250 ; modules in out/composed/webpack/ALL-OFF/M2/modules.json
- composed/webpack/ALL-OFF/M3: 830.js=431, main.js=148931 ; modules in out/composed/webpack/ALL-OFF/M3/modules.json
- composed/webpack/ALL-OFF/M3+se: 830.js=430, main.js=128945 ; modules in out/composed/webpack/ALL-OFF/M3+se/modules.json
- composed/rspack/ALL-OFF/M1: 299.js=148, main.js=21274 ; modules in out/composed/rspack/ALL-OFF/M1/modules.json
- composed/rspack/ALL-OFF/M2: 299.js=294, main.js=69719 ; modules in out/composed/rspack/ALL-OFF/M2/modules.json
- composed/rspack/ALL-OFF/M3: 299.js=339, main.js=136404 ; modules in out/composed/rspack/ALL-OFF/M3/modules.json
- composed/rspack/ALL-OFF/M3+se: 299.js=338, main.js=89239 ; modules in out/composed/rspack/ALL-OFF/M3+se/modules.json
- composed/webpack/remotes-only/M1: 830.js=150, main.js=56449 ; modules in out/composed/webpack/remotes-only/M1/modules.json
- composed/webpack/remotes-only/M2: 830.js=386, main.js=158492 ; modules in out/composed/webpack/remotes-only/M2/modules.json
- composed/webpack/remotes-only/M3: 830.js=431, main.js=255505 ; modules in out/composed/webpack/remotes-only/M3/modules.json
- composed/webpack/remotes-only/M3+se: 830.js=431, main.js=236579 ; modules in out/composed/webpack/remotes-only/M3+se/modules.json
- composed/rspack/remotes-only/M1: 299.js=148, main.js=58782 ; modules in out/composed/rspack/remotes-only/M1/modules.json
- composed/rspack/remotes-only/M2: 299.js=294, main.js=158609 ; modules in out/composed/rspack/remotes-only/M2/modules.json
- composed/rspack/remotes-only/M3: 299.js=339, main.js=233110 ; modules in out/composed/rspack/remotes-only/M3/modules.json
- composed/rspack/remotes-only/M3+se: 299.js=339, main.js=199189 ; modules in out/composed/rspack/remotes-only/M3+se/modules.json
- composed/webpack/ALL-OFF+expose/M1: 449.js=163, 830.js=156, main.js=23225, remoteEntry.js=23739 ; modules in out/composed/webpack/ALL-OFF+expose/M1/modules.json
- composed/webpack/ALL-OFF+expose/M2: 449.js=436, 830.js=392, main.js=84659, remoteEntry.js=85900 ; modules in out/composed/webpack/ALL-OFF+expose/M2/modules.json
- composed/webpack/ALL-OFF+expose/M3: 830.js=433, main.js=166071, remoteEntry.js=146517 ; modules in out/composed/webpack/ALL-OFF+expose/M3/modules.json
- composed/webpack/ALL-OFF+expose/M3+se: 830.js=433, main.js=146236, remoteEntry.js=147000 ; modules in out/composed/webpack/ALL-OFF+expose/M3+se/modules.json
- composed/rspack/ALL-OFF+expose/M1: 299.js=150, 680.js=157, main.js=26497, remoteEntry.js=26988 ; modules in out/composed/rspack/ALL-OFF+expose/M1/modules.json
- composed/rspack/ALL-OFF+expose/M2: 299.js=296, 680.js=340, main.js=83307, remoteEntry.js=84216 ; modules in out/composed/rspack/ALL-OFF+expose/M2/modules.json
- composed/rspack/ALL-OFF+expose/M3: 299.js=341, main.js=152476, remoteEntry.js=133946 ; modules in out/composed/rspack/ALL-OFF+expose/M3/modules.json
- composed/rspack/ALL-OFF+expose/M3+se: 299.js=340, main.js=105298, remoteEntry.js=105848 ; modules in out/composed/rspack/ALL-OFF+expose/M3+se/modules.json
- composed/webpack/DEFAULT/M1: 449.js=161, 830.js=154, 959.js=11205, main.js=83410, remoteEntry.js=82961 ; modules in out/composed/webpack/DEFAULT/M1/modules.json
- composed/webpack/DEFAULT/M2: 449.js=434, 830.js=390, 959.js=20328, main.js=195641, remoteEntry.js=194571 ; modules in out/composed/webpack/DEFAULT/M2/modules.json
- composed/webpack/DEFAULT/M3: 830.js=431, 959.js=20329, main.js=285211, remoteEntry.js=284113 ; modules in out/composed/webpack/DEFAULT/M3/modules.json
- composed/webpack/DEFAULT/M3+se: 830.js=431, 959.js=20329, main.js=287284, remoteEntry.js=286186 ; modules in out/composed/webpack/DEFAULT/M3+se/modules.json
- composed/rspack/DEFAULT/M1: 299.js=148, 420.js=11100, 680.js=155, main.js=84652, remoteEntry.js=84702 ; modules in out/composed/rspack/DEFAULT/M1/modules.json
- composed/rspack/DEFAULT/M2: 299.js=294, 420.js=19112, 680.js=338, main.js=207407, remoteEntry.js=207199 ; modules in out/composed/rspack/DEFAULT/M2/modules.json
- composed/rspack/DEFAULT/M3: 299.js=339, 420.js=19113, main.js=259591, remoteEntry.js=259352 ; modules in out/composed/rspack/DEFAULT/M3/modules.json
- composed/rspack/DEFAULT/M3+se: 299.js=339, 420.js=19113, main.js=245313, remoteEntry.js=245074 ; modules in out/composed/rspack/DEFAULT/M3+se/modules.json
- main-rspack2/rspack/ALL-OFF/M1: 299.js=149, main.js=107010 ; modules in out/main-rspack2/rspack/ALL-OFF/M1/modules.json
- main-rspack2/rspack/ALL-OFF/M2: 299.js=295, main.js=241371 ; modules in out/main-rspack2/rspack/ALL-OFF/M2/modules.json
- main-rspack2/rspack/ALL-OFF/M3: 299.js=339, main.js=260454 ; modules in out/main-rspack2/rspack/ALL-OFF/M3/modules.json
- main-rspack2/rspack/ALL-OFF/M3+se: 299.js=339, main.js=241358 ; modules in out/main-rspack2/rspack/ALL-OFF/M3+se/modules.json
- main-rspack2/rspack/remotes-only/M1: 299.js=149, main.js=107440 ; modules in out/main-rspack2/rspack/remotes-only/M1/modules.json
- main-rspack2/rspack/remotes-only/M2: 299.js=295, main.js=242098 ; modules in out/main-rspack2/rspack/remotes-only/M2/modules.json
- main-rspack2/rspack/remotes-only/M3: 299.js=339, main.js=261181 ; modules in out/main-rspack2/rspack/remotes-only/M3/modules.json
- main-rspack2/rspack/remotes-only/M3+se: 299.js=339, main.js=242085 ; modules in out/main-rspack2/rspack/remotes-only/M3+se/modules.json
- main-rspack2/rspack/DEFAULT/M1: 299.js=149, 420.js=11101, 680.js=156, main.js=117729, remoteEntry.js=117959 ; modules in out/main-rspack2/rspack/DEFAULT/M1/modules.json
- main-rspack2/rspack/DEFAULT/M2: 299.js=295, 420.js=19113, 680.js=339, main.js=249360, remoteEntry.js=249474 ; modules in out/main-rspack2/rspack/DEFAULT/M2/modules.json
- main-rspack2/rspack/DEFAULT/M3: 299.js=339, 420.js=19113, main.js=249116, remoteEntry.js=249202 ; modules in out/main-rspack2/rspack/DEFAULT/M3/modules.json
- main-rspack2/rspack/DEFAULT/M3+se: 299.js=339, 420.js=19113, main.js=249116, remoteEntry.js=249202 ; modules in out/main-rspack2/rspack/DEFAULT/M3+se/modules.json
- attach/webpack/ALL-OFF/M1: 830.js=150, main.js=17916 ; modules in out/attach/webpack/ALL-OFF/M1/modules.json
- attach/webpack/ALL-OFF/M3: 830.js=431, main.js=148931 ; modules in out/attach/webpack/ALL-OFF/M3/modules.json
- attach/webpack/remotes-only/M1: 830.js=150, main.js=56449 ; modules in out/attach/webpack/remotes-only/M1/modules.json
- attach/webpack/remotes-only/M3: 830.js=431, main.js=255505 ; modules in out/attach/webpack/remotes-only/M3/modules.json
- attach/webpack/ALL-OFF+expose/M1: 449.js=163, 830.js=156, main.js=23225, remoteEntry.js=23739 ; modules in out/attach/webpack/ALL-OFF+expose/M1/modules.json
- attach/webpack/ALL-OFF+expose/M3: 830.js=433, main.js=166071, remoteEntry.js=146517 ; modules in out/attach/webpack/ALL-OFF+expose/M3/modules.json
- attach/webpack/DEFAULT/M1: 449.js=161, 830.js=154, 959.js=11205, main.js=83410, remoteEntry.js=82961 ; modules in out/attach/webpack/DEFAULT/M1/modules.json
- attach/webpack/DEFAULT/M3: 830.js=431, 959.js=20329, main.js=285211, remoteEntry.js=284113 ; modules in out/attach/webpack/DEFAULT/M3/modules.json

## rspack on the ESM runtime entries (labels main-rspack-esm, proto-rspack-esm, proto-rspack2-esm)

Question: rspack removed nothing in any earlier cell because @rspack/core's native MF plugin bundles the .cjs runtime. If rspack consumes the ESM entries instead, does it (a) fold the inlined `typeof FEDERATION_*` checks at parse time and (b) prune the side-effect-free implementation modules, and does its federation runtime hoist inactive-connection modules back in?

### The knob

`@rspack/core` (1.3.9 and 2.1.8 alike, `ModuleFederationPlugin.apply`, the inner `paths` function) computes
`bundlerRuntimePath = require.resolve('@module-federation/webpack-bundler-runtime', { paths: [runtimeToolsPath] })` and
`runtimePath = require.resolve('@module-federation/runtime', { paths: [runtimeToolsPath] })`. Node's `require.resolve` applies the `require` export condition, so both land on `dist/index.cjs` whatever `implementation` points at. The generated entry (`@module-federation/runtime/rspack.js!=!data:text/javascript,import __module_federation_bundler_runtime__ from "<abs .cjs path>" ...`) imports that absolute path, and the plugin sets `resolve.alias['@module-federation/runtime'] = <abs .cjs path>` with the user's alias spread after it. `conditionNames` never gets a say: absolute paths bypass exports. `implementation` only moves the `paths:` base, not the condition. packages/rspack's own `'@module-federation/runtime$'` alias loses to the plugin's non-`$` key, which sits first in the object.

Two `resolve.alias` entries flip the whole chain to ESM (`rspackEsmAlias` in run.mjs; found with knob.mjs):

- `[<abs path of webpack-bundler-runtime/dist/index.cjs>]: <abs path of webpack-bundler-runtime/dist/index.js>` (rspack's resolver aliases absolute requests)
- `'@module-federation/runtime': <abs path of runtime/dist/index.js>` (overrides the plugin's value; runtime-core and sdk then resolve through the `import` condition on their own, no alias needed)

Knob sweep on origin/main, ALL-OFF M2: none = 78 cjs modules; wbr alias only = wbr ESM but runtime/runtime-core/sdk still cjs (main.js grows to 396 KB, two copies); wbr + runtime alias = 60 ESM modules, 0 cjs; adding runtime-core$/sdk$ aliases changes nothing.

### Results (ALL-OFF main.js bytes, six implementations G/E)

| build | M1 | M2 | M3+se |
|---|---|---|---|
| main, rspack 1.3.9, cjs (earlier) | 107387, all GE | 245801, all GE | 245919, all GE |
| main + ESM knob | 49582, five G-, container -- | 208830, five GE, container -- | 263613, five GE, container -- |
| proto (fold) + ESM knob, rspack 1.3.9 | 33480, all -- | 104579, all -- | 153464, all -- |
| proto (fold) + ESM knob, rspack 2.1.8 | 31353, all -- | 106147, all -- | 144482, all -- |
| proto, webpack (earlier) | 27873, all -- | 89236, all -- | 160982, all -- |

DEFAULT stays all GE on every rspack row, as it must; its orphans are exactly `shared/disabled.js`, `remote/disabled.js`, `snapshot/disabled.js` plus sdk types (the mirror image of ALL-OFF).

ESM alone (main + knob) already lets the SWC minifier strip the marker strings in M1 (`G-`, same as webpack main M1) and prunes `initContainerEntry`, whose check on main is already a single inline `typeof` expression. The other five stay in the graph because main's `const USE_* = typeof ... ? ... : true` at module top does not fold across statements. The fold-at-parse prototype closes that gap: rspack emits `this.sharedHandler = ( false) ? 0 : new DisabledSharedHandler();` and the import of `SharedHandler` is dead, so with `sideEffects` on the module leaves every chunk.

### Smoke

rspack's `moduleFederationDefaultRuntime` only calls `runtime.init` when `__webpack_require__.initializeSharingData || __webpack_require__.initializeExposesData` exists, so a host with no shared and no exposes never creates an instance on rspack (both 1.3.9 and 2.1.8; this is why every earlier rspack ALL-OFF smoke read "no federation instance"). The `ALL-OFF+expose` profile adds one expose; its instance lives in remoteEntry.js, not main.js. `smoke-rspack-esm.txt`:

- proto-rspack-esm ALL-OFF+expose M2 and M3+se remoteEntry.js: `sharedHandler=DisabledSharedHandler remoteHandler=DisabledRemoteHandler`; M1 the same under minified names.
- proto-rspack2-esm ALL-OFF+expose M2: same.
- proto-rspack-esm DEFAULT M1: throws the expected `loadShareSync` RUNTIME-006 under the DOM stub, as webpack does (the real handlers are live).
- main-rspack-esm ALL-OFF+expose M2: Disabled* handlers too (runtime selection was always right; only the bundle size was wrong).

### Hoisting

@rspack/core 1.3.9 has no hoisting pass: the binding contains no `HoistContainerReferencesPlugin`; the federation entry is a global `EntryPlugin` plus a `FederationRuntimeModule`. 2.1.8's binding does contain `HoistContainerReferencesPlugin` and `EmbedFederationRuntime`. Neither re-includes modules that only inactive connections reach: the chunk module sets for proto ALL-OFF M2 are identical between 1.3.9 and 2.1.8 (38 federation modules), and 2.1.8 does not even keep the pruned modules in `compilation.modules` (6 orphans vs 37). The enhanced guard in the prototype (`connection.getActiveState(undefined) === false` skip in `getAllReferencedModules`) has no rspack counterpart to fix.

### Verdict

(a) Yes. With the ESM entries rspack's parser folds the inlined `typeof FEDERATION_* === 'boolean' ? !FEDERATION_* : true` checks at parse time, in M1, M2 and M3+se.
(b) Yes. With `sideEffects` on, the six disabled implementations leave the module graph, matching webpack's proto rows; ALL-OFF M1 main.js drops from 107 KB to 33 KB (31 KB on 2.1.8) versus webpack's 28 KB.
Hoisting: no force-include on either rspack version.

Upstream @rspack/core change: in `ModuleFederationPlugin.apply`'s `paths` function, resolve `@module-federation/webpack-bundler-runtime` and `@module-federation/runtime` with an `import`-condition resolver (or try the `/bundler` subpath export, `@module-federation/webpack-bundler-runtime/bundler` and `@module-federation/runtime/bundler`, before falling back to `require.resolve`), and put the runtime alias under a `$` exact key so a wrapper can override it. Until then, packages/rspack can do it alone today in its existing `afterPlugins` tap: alias the absolute `.cjs` path it can recompute with `require.resolve('@module-federation/webpack-bundler-runtime', { paths: [implementationPath] })` to `dist/index.js`, and set the non-`$` `'@module-federation/runtime'` key instead of `'@module-federation/runtime$'`.
