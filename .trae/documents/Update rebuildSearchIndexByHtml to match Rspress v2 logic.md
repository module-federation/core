我将修改 `/Users/bytedance/outter/core/packages/rspress-plugin/src/rebuildSearchIndexByHtml.ts`，使其与 Rspress v2 的新搜索索引生成逻辑保持一致。

主要变更点：
1.  **引入 `crypto`**：实现 `createHash` 方法，确保生成逻辑与核心代码一致。
2.  **更新 `rebuildSearchIndexByHtml` 函数**：
    -   采用 `createPageData.ts` 中的分组（grouping）和数据清理（`deletePrivateField`）逻辑，确保生成的 JSON 内容符合 Rspress v2 的预期。
    -   优化文件写入逻辑：
        -   基于 HTML 生成新的搜索索引内容。
        -   根据版本（version）和语言（lang）查找现有的搜索索引文件（忽略文件名中的哈希值）。
        -   **覆盖**现有文件的内容。这将确保索引内容与 HTML 产物同步，同时避免因修改文件名而破坏 HTML 中的引用。
    -   保留 `extractPageDataFromHtml` 逻辑，用于从 HTML 中提取数据。

这个方案满足了“拿到构建后的 html，然后再执行一遍原先的生成 searchIndex 逻辑”的需求。