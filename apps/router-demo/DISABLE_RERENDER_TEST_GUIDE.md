# disableRerender 功能测试指南

## 🚀 快速开始

### 1. 启动应用

```bash
# 终端 1: 启动 Remote1 应用（端口 2001）
cd apps/router-demo/router-remote1-2001
npm run dev

# 终端 2: 启动 Host 应用（端口 2000）
cd apps/router-demo/router-host-2000
npm run dev
```

### 2. 访问测试页面

打开浏览器访问：`http://localhost:2000/remote1`

## 🔬 测试步骤

### 场景 1：禁用 disableRerender（默认行为）

1. **打开浏览器控制台**（F12 或右键 → 检查）
2. **确保 "启用 disableRerender" 复选框未选中**
3. **点击 "点击增加 Count" 按钮**多次
4. **观察控制台日志**

**预期结果：**
```
🏠 [Host] Remote1Route render, count: 0 disableRerender: false
🔄 [Remote1] App render >>>>>> {name: 'Ming', age: 12, count: 0} timestamp: 2025-11-10T...
🏠 [Remote1] Home component render {name: 'Ming', age: 12}

// 点击按钮后
🏠 [Host] Remote1Route render, count: 1 disableRerender: false
🔄 [Remote1] App render >>>>>> {name: 'Ming', age: 12, count: 1} timestamp: 2025-11-10T...
🏠 [Remote1] Home component render {name: 'Ming', age: 12}

// 再次点击
🏠 [Host] Remote1Route render, count: 2 disableRerender: false
🔄 [Remote1] App render >>>>>> {name: 'Ming', age: 12, count: 2} timestamp: 2025-11-10T...
🏠 [Remote1] Home component render {name: 'Ming', age: 12}
```

✅ **每次点击都会触发远程应用重新渲染**

---

### 场景 2：启用 disableRerender（优化模式）

1. **清空控制台日志**（点击 🚫 按钮）
2. **勾选 "启用 disableRerender" 复选框**
3. **等待远程应用重新加载**
4. **点击 "点击增加 Count" 按钮**多次
5. **观察控制台日志**

**预期结果：**
```
// 首次加载
🏠 [Host] Remote1Route render, count: 0 disableRerender: true
🔄 [Remote1] App render >>>>>> {name: 'Ming', age: 12, count: 0} timestamp: 2025-11-10T...
🏠 [Remote1] Home component render {name: 'Ming', age: 12}
RemoteAppWrapper mark as rendered (disableRerender=true, hasRenderedRef set to true) >>>

// 点击按钮后
🏠 [Host] Remote1Route render, count: 1 disableRerender: true
RemoteAppWrapper React.memo preventing re-render (disableRerender=true) >>>

// 再次点击
🏠 [Host] Remote1Route render, count: 2 disableRerender: true
RemoteAppWrapper React.memo preventing re-render (disableRerender=true) >>>

// 远程应用的日志不再出现！
```

✅ **远程应用只渲染一次，后续点击不会重新渲染**

---

## 📊 对比观察

### 视觉观察

在远程应用的页面中，有一个蓝色提示：

```
🔍 观察点：当宿主的 count 变化时，这个组件应该不会重新渲染（如果启用了 disableRerender）
```

#### 禁用 disableRerender 时：
- Link 中显示的 count 值会**实时更新**
- 每次点击都会看到页面闪烁（组件重新渲染）

#### 启用 disableRerender 时：
- Link 中显示的 count 值**保持为 0**（初始值）
- 点击按钮不会导致页面闪烁

---

## 🎯 关键观察点

### 1. 控制台日志

| 场景 | 宿主日志 | 远程日志 | Bridge 日志 |
|------|---------|---------|------------|
| 禁用优化 | 每次都有 | 每次都有 | mark as rendered |
| 启用优化 | 每次都有 | **只有首次** | React.memo preventing |

### 2. 页面行为

| 场景 | Count 值更新 | 页面重渲染 | 性能 |
|------|-------------|-----------|------|
| 禁用优化 | ✅ 实时更新 | ✅ 每次重渲染 | ⚠️ 较慢 |
| 启用优化 | ❌ 保持初始值 | ❌ 不重渲染 | ✅ 快速 |

### 3. 性能指标

使用 React DevTools Profiler 观察：

1. **打开 React DevTools** → **Profiler** 标签
2. **点击录制按钮** ⏺️
3. **点击 Count 按钮 10 次**
4. **停止录制** ⏹️
5. **查看 Flamegraph**

**禁用 disableRerender：**
- 远程应用组件在每次提交中都会高亮显示
- 提交次数 = 点击次数
- 总渲染时间 = 10 × 单次渲染时间

**启用 disableRerender：**
- 远程应用组件**不会**高亮显示
- 提交次数 = 0（仅宿主更新）
- 总渲染时间 ≈ 0

---

## 🔍 深度调试

### 启用详细日志

如果想看到更多内部日志，可以在控制台执行：

```javascript
// 启用 bridge-react 调试日志
localStorage.setItem('debug', 'module-federation:*');
// 刷新页面
location.reload();
```

### 预期的详细日志流程

#### 启用 disableRerender 时：

```
1. RemoteAppWrapper instance from props >>>
2. RemoteAppWrapper useEffect triggered >>> 
   { initialized: false, hasRenderedRef: false, disableRerender: true }
3. RemoteAppWrapper useEffect triggered >>> 
   { initialized: true, hasRenderedRef: false, disableRerender: true }
4. 🔄 [Remote1] App render >>>>>> 
5. 🏠 [Remote1] Home component render
6. RemoteAppWrapper mark as rendered (disableRerender=true, hasRenderedRef set to true) >>>

// 点击 count 按钮
7. 🏠 [Host] Remote1Route render, count: 1
8. RemoteAppWrapper React.memo preventing re-render (disableRerender=true) >>>
   { propsChanged: ['count'] }

// 远程应用不会重新渲染
```

---

## 🐛 常见问题

### 问题 1：启用 disableRerender 后，远程应用还是在重新渲染

**可能原因：**
1. 路由组件使用了内联函数
2. 关键 props（moduleName, basename, memoryRoute）发生了变化

**检查方法：**
```javascript
// 在控制台查看是否有这些日志
// 如果看到这个，说明组件被完全重新创建了
"RemoteAppWrapper useEffect triggered >>> { initialized: false }"
```

**解决方案：**
- 确保 Remote1Route 是命名组件，不是内联函数
- 确保 basename 等关键 props 不变

### 问题 2：远程应用没有显示最新的 count 值

**这是正常行为！**

启用 `disableRerender` 后：
- 初始 props（count: 0）会被使用
- 后续 count 变化不会传递到远程应用
- 这就是优化的目的：避免不必要的重新渲染

如果需要更新远程应用的数据，考虑使用：
- 事件总线
- URL 参数
- 共享状态管理

### 问题 3：看不到 bridge 的日志

**解决方法：**

```javascript
// 在控制台执行
import { LoggerInstance } from '@module-federation/bridge-react';
LoggerInstance.enable();
```

或者在代码中添加：
```typescript
import { LoggerInstance } from '@module-federation/bridge-react';
LoggerInstance.enable();
```

---

## 📈 性能测试

### 简单性能测试

```javascript
// 在控制台执行
console.time('100次点击');
for(let i = 0; i < 100; i++) {
  document.querySelector('button').click();
}
console.timeEnd('100次点击');
```

**预期结果：**
- 禁用优化：~500-1000ms
- 启用优化：~50-100ms
- **性能提升：5-10倍**

---

## ✅ 测试清单

完成以下测试以验证功能：

- [ ] 禁用 disableRerender，点击按钮，远程应用重新渲染
- [ ] 启用 disableRerender，点击按钮，远程应用不重新渲染
- [ ] 控制台日志符合预期
- [ ] React DevTools Profiler 显示性能提升
- [ ] 切换 disableRerender 后，行为正确切换
- [ ] 页面视觉行为符合预期（count 值显示）
- [ ] 远程应用的其他功能正常（路由导航等）

---

## 📝 测试报告模板

```markdown
## disableRerender 测试报告

**测试日期：** 2025-11-10
**测试人员：** [你的名字]
**浏览器：** [Chrome/Firefox/Safari] 版本

### 场景 1：禁用 disableRerender
- ✅/❌ 远程应用重新渲染
- ✅/❌ 控制台日志正确
- ✅/❌ Count 值实时更新

### 场景 2：启用 disableRerender  
- ✅/❌ 远程应用不重新渲染
- ✅/❌ React.memo 日志出现
- ✅/❌ Count 值保持初始值

### 性能测试
- 禁用优化：[X]ms
- 启用优化：[Y]ms
- 性能提升：[X/Y]倍

### 问题记录
[记录遇到的任何问题]

### 结论
✅ 功能正常 / ❌ 存在问题
```

---

**祝测试顺利！** 🎉

如有问题，请查看：
- 控制台错误日志
- React DevTools
- Network 面板（确认远程模块已加载）
