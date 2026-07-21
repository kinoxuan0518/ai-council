# BOSS直聘JD发布表单自动化详细指南

版本：1.2.0 | 基于 2026-06-12 实测（含CGEvent点击 + 招呼语设置闭环）

## 页面架构

### SPA结构
- 主页面：`https://www.zhipin.com/web/chat/index`
- 职位管理iframe：`https://www.zhipin.com/web/frame/job/list-new?jobversion=10248`
- 所有表单操作在 iframe 内执行

### SPA冷启动
```
1. 导航到 https://www.zhipin.com/web/chat/index
2. 等待 bodyLen > 2000
3. 通过左侧导航链接进入职位管理（点击链接，不要直接goto URL）
```

### iframe访问模式
```javascript
var iframe = document.querySelector('iframe');
var doc = iframe.contentDocument || iframe.contentWindow.document;
// 所有选择器从 doc 而非主页面 document 查询
```

## 表单字段填充参考

### 已确认可自动化的字段

| 字段 | 选择器 | 填充方式 | 注意事项 |
|------|--------|----------|----------|
| 职位名称 | `input[placeholder*="职位名称"]` | 原生setter + input/change事件 | 15字以内 |
| 职位描述 | `textarea` | 原生setter + input/change事件 | 5000字上限，支持`\n`换行 |
| 经验 | `.ui-select-item` 文本匹配 | 找到对应LI点击 | 选项：不限/1年以内/1-3年/3-5年/5-10年/10年以上 |
| 学历 | `.ui-select-item` 文本匹配 | 找到对应LI点击 | 选项：不限/初中及以下/中专/高中/大专/本科/硕士/博士 |
| 最低月薪 | `.ui-select` 第一个薪资select | 点击selection→在可见dropdown中点击目标LI | 选项：1k-250k，梯度递增 |
| 最高月薪 | `.ui-select` 第二个薪资select | 同上 | **必须先设min再设max**，BOSS会自动联动 |
| 工作地址 | `input[placeholder*="工作地点"]` | 通常自动填充公司注册地址 | 验证即可 |

### 薪资设置关键步骤

```javascript
// 1. 找到所有 .ui-select.ui-select-single
var selects = doc.querySelectorAll('.ui-select.ui-select-single');
// selects[2] = 最低月薪, selects[3] = 最高月薪, selects[4] = 薪数

// 2. 点击 selection 打开dropdown
var minSel = selects[2].querySelector('.ui-select-selection');
minSel.click();

// 3. 在可见的dropdown中找目标值
var dropdowns = doc.querySelectorAll('.ui-select-dropdown');
for (var i = 0; i < dropdowns.length; i++) {
  if (dropdowns[i].offsetHeight > 0) {
    // 在这个dropdown中找目标LI
    var items = dropdowns[i].querySelectorAll('.ui-select-item');
    for (var j = 0; j < items.length; j++) {
      if (items[j].innerText.trim() === '30k') {
        items[j].click();
      }
    }
  }
}
```

**注意**：全局 `doc.querySelectorAll('.ui-select-item')` 会匹配所有select的选项（包括不可见的）。必须限定在**可见的dropdown**（`offsetHeight > 0`）中查找。

### 已知限制字段（已突破）

### 职位类型 Cascader — System Events 绕过方案

`input[name="jobCategory"]` 是readonly，依赖Vue cascader组件。JS程序化点击被isTrusted检查拦截。

**突破方法：使用 AppleScript System Events 执行真实鼠标点击。**

```applescript
-- 1. 通过JS计算元素的绝对屏幕坐标
tell application "Google Chrome"
  tell tab 1 of window 1
    execute javascript "
(function(){
  var f = document.querySelector('iframe');
  var d = f.contentDocument || f.contentWindow.document;
  var t = d.querySelector('input[name=jobCategory]');
  var r = t.getBoundingClientRect();
  var fr = f.getBoundingClientRect();
  var ch = window.outerHeight - window.innerHeight;
  var sx = Math.round(window.screenX + fr.left + r.left + r.width/2);
  var sy = Math.round(window.screenY + ch + fr.top + r.top + r.height/2);
  return sx + ',' + sy;
})()
"
  end tell
end tell

-- 2. 用 System Events 点击该坐标
tell application "System Events"
  click at {sx, sy}
end tell
```

**Cascader渲染位置**：点击后cascader渲染在**主文档**（非iframe内），作为`.dialog-wrap.active`弹窗出现。

**Cascader结构**：
```
dialog-wrap.active
├── .position-selecter
│   ├── LI.cur — 一级类目 (如 "互联网/AI")
│   ├── SPAN.stage-three — 二级子类 (如 "后端开发", "人工智能")
│   └── DIV.position-select-item — 三级终选 (如 "全栈工程师", "Python")
│       └── SPAN.position-text — 文本标签
```

**选择流程**：
1. System Events点击input → cascader弹窗在主文档出现
2. 一级类目默认选中（`.cur`），二级子类自动展开
3. 点击二级SPAN（`stage-three`）→ 三级选项展开
4. 点击三级DIV（`position-select-item`） → 选择完成，input值更新
5. 弹窗需手动关闭或点击页面其他区域

**关键代码**：
```javascript
// 点击二级子类 "后端开发"
var spans = document.querySelectorAll('.position-selecter .stage-three');
for (var i = 0; i < spans.length; i++) {
  if (spans[i].innerText.trim() === '后端开发') { spans[i].click(); }
}

// 点击三级终选 "全栈工程师"
var items = document.querySelectorAll('.position-select-item');
for (var i = 0; i < items.length; i++) {
  var span = items[i].querySelector('.position-text');
  if (span && span.innerText.trim() === '全栈工程师') {
    items[i].dispatchEvent(new MouseEvent('click', {bubbles: true}));
  }
}
```

### 职位关键词 — 选填

关键词字段标记为`[选填]`，即使为空也不影响发布。如需添加，等职位类型选择后手动操作。

### 提交确认弹窗

点击"发布"后会弹出确认框："同意并继续发布职位"（`.btn.btn-sure`）。需点击确认后职位才真正发布。发布成功后出现"审核通过"弹窗。

### Vue组件分析

```html
<!-- 职位类型cascader结构 -->
<div class="job-position-container">
  <input name="jobCategory" readonly placeholder="选择职位类型" class="ipt error">
  <div class="publish-card">
    <div class="job-name-cascader-container" style="display: none;">
      <!-- Vue组件内容，初始为空，点击后渲染 -->
    </div>
  </div>
</div>

<!-- 职位关键词结构 -->
<div class="publish-edit-form-row-skill">
  <div class="job-skill-content">
    <div class="add-skill"><i class="iboss-plus"></i></div>
    <!-- 选择职位类型后出现推荐标签 -->
  </div>
</div>
```

## 表单验证状态

在提交前检查：
- 职位名称：非空
- 职位描述：非空（但无最低字数限制）
- 职位类型：不可为error状态（`.ipt.error` → 需选择）
- 经验：已选择
- 学历：已选择
- 薪资：min < max
- 工作地址：非空

## 提交流程

表单完全填充后：
```
1. 勾选底部复选框："已阅读并遵守 《招聘行为管理规范》"
2. 点击"发布"按钮
3. 等待成功提示（通常跳转回职位列表或显示成功toast）
```

## 常见问题与解决

| 问题 | 原因 | 解决 |
|------|------|------|
| SPA bodyLen < 500 | 冷启动未完成 | 从index页重新导航 |
| iframe内容为空 | 页面未完全加载 | 等待3-5秒，检查iframe.src |
| 薪资设置联动异常 | 先设max导致min自动调整 | 始终先设min，再设max |
| Vue cascader不出现 | 程序化事件isTrusted=false | System Events或CGEvent点击 |
| 表单提交按钮disabled | 有必填字段未填 | 检查`.ipt.error`元素 |
| `.more-operate`三点按钮不响应 | Vue isTrusted保护 | CGEvent（Swift CoreGraphics） |
| 元素点击坐标偏移 | iframe偏移被重复计算 | `screenX = window.screenX + vpX`（不加iframe偏移） |

---

## CGEvent：绕过isTrusted的终极方案

当System Events点击也无效时（如`.more-operate`三点按钮），使用macOS原生CoreGraphics事件。

```swift
// /tmp/click.swift
import CoreGraphics

let point = CGPoint(x: 1354, y: 381)

// Mouse down
if let down = CGEvent(mouseEventSource: nil, mouseType: .leftMouseDown, 
                       mouseCursorPosition: point, mouseButton: .left) {
    down.post(tap: .cghidEventTap)
}
usleep(150000)

// Mouse up
if let up = CGEvent(mouseEventSource: nil, mouseType: .leftMouseUp,
                     mouseCursorPosition: point, mouseButton: .left) {
    up.post(tap: .cghidEventTap)
}
```

执行：`swift /tmp/click.swift`

**注意**：
- CGEvent坐标是屏幕绝对坐标，不是视口坐标
- 优先级链条：JS events → System Events → CGEvent（仅在前两者都失败时使用）
- CGEvent会真实移动鼠标并点击，确保执行前用户知情

## 坐标计算铁律

**iframe内元素的getBoundingClientRect()返回的是视口坐标，已经包含了iframe的位置偏移。**

```javascript
// ❌ 错误：重复加iframe偏移
screenX = window.screenX + iframeRect.left + rect.left

// ✅ 正确：rect.left已经是视口坐标
screenX = window.screenX + rect.left
screenY = window.screenY + (outerHeight - innerHeight) + rect.top
```

## 自定义打招呼语设置

### 导航路径

左侧栏"更多" → 工具箱 → 自定义打招呼语 → 去设置

### URL直达

1. 工具箱：`https://www.zhipin.com/web/chat/toolbox_v2`（内容iframe: `/web/frame/info_v2/toolbox`）
2. 招呼设置：`https://www.zhipin.com/web/chat/set/greeting`（内容iframe: `/web/frame/info/set/greeting`）

### 操作流程

```
1. 导航到 /web/chat/set/greeting
2. 在iframe（src="/web/frame/info/set/greeting"）中操作
3. 点击"按职位设置招呼语"tab
4. 点击"添加打招呼语"按钮
5. 在职位列表中找到目标岗位，点击选中
6. 填写招呼语（0/100字符限制）
7. 点击"保存"
```

### 招呼语模板

100字符内必须包含：公司+事项+邀请。参考：
```
你好，黑湖科技在用AI重构产研协作方式，从0到1搭建内部AI原生平台。看到你的背景很匹配，方便聊聊吗？
```
