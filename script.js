const storageKey = "stack-front-daily-posts";
const draftKey = "stack-front-draft";
const interactionKey = "stack-front-interactions";
const postsPerPage = 4;

const coverPool = [
  "https://images.unsplash.com/photo-1461749280684-dccba630e2f6?auto=format&fit=crop&w=1200&q=80",
  "https://images.unsplash.com/photo-1516321318423-f06f85e504b3?auto=format&fit=crop&w=1200&q=80",
  "https://images.unsplash.com/photo-1515879218367-8466d910aaa4?auto=format&fit=crop&w=1200&q=80",
  "https://images.unsplash.com/photo-1517180102446-f3ece451e9d8?auto=format&fit=crop&w=1200&q=80",
  "https://images.unsplash.com/photo-1504639725590-34d0984388bd?auto=format&fit=crop&w=1200&q=80"
];

const weeklyIdeas = [
  "把容器查询写进组件库，哪些场景最值回票价？",
  "表单交互里，什么时候该即时校验，什么时候该延后提示？",
  "CSS Layers 和设计系统一起用，会带来哪些维护收益？",
  "Vite 项目里按页面拆分资源，怎么避免首屏脚本越滚越大？"
];

const seedPosts = [
  {
    id: "2026-07-03-scroll-state-queries",
    title: "Scroll State Queries：让滚动状态自己暴露出来",
    date: "2026-07-03",
    createdAt: Date.parse("2026-07-03T15:00:00+08:00"),
    tags: ["CSS", "滚动", "交互"],
    cover: coverPool[0],
    excerpt: "Chrome 133 引入 scroll-state 查询后，sticky 是否吸顶、snap 项是否命中、容器还能不能继续滚动，都可以先交给 CSS 判断。",
    content: `
## 为什么值得单独写一篇

很多页面交互只是想知道一件小事：这个标题是不是已经吸顶了？这个横向列表现在命中了哪张卡片？这个容器右侧还有没有内容可以滚？

以前这些问题通常交给 JavaScript：监听滚动、算位置、维护 class，再小心处理节流和边界。Chrome 133 开始支持的 \`@container scroll-state()\`，让浏览器已经知道的滚动状态可以直接进入 CSS。

## 最小写法

先把会暴露滚动状态的元素声明为 scroll-state 容器：

\`\`\`css
.sticky-shell {
  position: sticky;
  top: 0;
  container-type: scroll-state;
}

@container scroll-state(stuck: top) {
  .sticky-title {
    box-shadow: 0 8px 20px rgb(15 23 42 / 14%);
    background: #fff;
  }
}
\`\`\`

这段代码回答的是“sticky 元素现在是否卡在顶部”。如果卡住了，标题加阴影；如果没有卡住，就保持普通状态。

## 三类很实用的状态

目前最值得先记住的是这几类：

- \`stuck\`：判断 sticky 元素是否贴住某个边
- \`snapped\`：判断滚动吸附项是否处在 snap 状态
- \`scrollable\`：判断容器在某个方向是否还有可滚动内容

横向卡片列表可以这样写：

\`\`\`css
.snap-card {
  scroll-snap-align: center;
  container-type: scroll-state;
}

@container scroll-state(snapped: inline) {
  .snap-card-inner {
    transform: scale(1.04);
    border-color: #2563eb;
  }
}
\`\`\`

这个写法不需要自己维护“当前卡片索引”。谁被浏览器吸附住，谁就得到增强样式。

## 它不是所有滚动 JS 的替代品

如果你要做复杂统计、懒加载、埋点，IntersectionObserver 和滚动事件仍然有位置。\`scroll-state()\` 更适合处理视觉反馈：吸顶后加背景、snap 后高亮、可滚动时显示提示。

我的使用边界是：

- 只影响样式时，优先考虑 CSS
- 需要写业务数据或触发请求时，继续用 JS
- 把它作为渐进增强，不让核心流程依赖单一浏览器能力

## 最后一句

\`scroll-state()\` 的意义，是把“浏览器已经知道的滚动事实”开放给 CSS。少写一点位置计算，页面就少一点滚动时的状态同步成本。`
  },
  {
    id: "2026-07-03-css-carousels",
    title: "CSS Carousel：少写一套轮播状态机",
    date: "2026-07-03",
    createdAt: Date.parse("2026-07-03T14:00:00+08:00"),
    tags: ["CSS", "滚动", "可访问性"],
    cover: coverPool[1],
    excerpt: "Chrome 135 的 ::scroll-button() 和 ::scroll-marker() 让很多横向轮播可以从 JS 组件回到原生滚动容器。",
    content: `
## 轮播为什么总是容易写重

轮播组件看起来简单，真正做完却经常很厚：上一张、下一张、禁用状态、分页点、键盘顺序、屏幕阅读器名称、触摸滚动、滚动吸附，每一项都要补。

Chrome 135 开始支持的一组 CSS Overflow 5 能力，把这件事往原生平台推进了一步。核心是 \`::scroll-button()\` 和 \`::scroll-marker()\`：浏览器可以为滚动区域生成上一页、下一页按钮和位置标记。

## 先从普通 scroller 开始

轮播的基础仍然应该是可滚动内容：

\`\`\`css
.carousel {
  display: grid;
  grid-auto-flow: column;
  grid-auto-columns: minmax(240px, 80%);
  gap: 16px;
  overflow-x: auto;
  scroll-snap-type: x mandatory;
}

.carousel > * {
  scroll-snap-align: center;
}
\`\`\`

这一步本身已经可用。没有增强能力时，用户依然可以横向滚动。

## 加上滚动按钮

\`\`\`css
.carousel::scroll-button(left) {
  content: "‹" / "上一项";
}

.carousel::scroll-button(right) {
  content: "›" / "下一项";
}
\`\`\`

浏览器生成的不是纯装饰，而是带状态的交互按钮。到达开头或结尾时，它可以自动处理不可用状态，这一点以前通常需要组件自己维护。

## 再加滚动标记

\`\`\`css
.carousel::scroll-marker-group {
  display: flex;
  justify-content: center;
  gap: 8px;
}

.carousel > *::scroll-marker {
  content: "";
  inline-size: 8px;
  block-size: 8px;
  border-radius: 50%;
  background: #b8c1cc;
}

.carousel > *::scroll-marker:target-current {
  background: #2563eb;
}
\`\`\`

这类分页点不再只是“看起来像按钮”的 span，而是和滚动位置有关联的标记。

## 适合先落地在哪

我会优先用它做这些低风险场景：

- 文章推荐卡片
- 产品截图横滑
- 案例作品集
- 小型图片画廊
- 移动端横向分类列表

如果轮播需要自动播放、复杂虚拟列表或跨浏览器完全一致的控件外观，传统组件仍然更可控。但如果只是让一组内容横向浏览，原生滚动加 CSS 轮播已经很值得考虑。

## 最后一句

好的轮播不应该先从“组件状态机”开始，而应该先从“这就是一组可滚动内容”开始。CSS Carousel 的价值，是让平台替我们补上按钮、标记和状态这层常见 UI。`
  },
  {
    id: "2026-07-03-command-commandfor",
    title: "command 和 commandfor：按钮行为也能声明式",
    date: "2026-07-03",
    createdAt: Date.parse("2026-07-03T13:00:00+08:00"),
    tags: ["HTML", "交互", "可访问性"],
    cover: coverPool[2],
    excerpt: "Chrome 135 引入 command 和 commandfor 后，按钮可以声明式控制 dialog 和 popover，少写一层状态同步脚本。",
    content: `
## 为什么按钮需要新能力

按钮是页面里最常见的交互入口，但很多按钮其实控制的是另一个元素：打开菜单、关闭弹窗、显示确认框、切换 popover。

过去我们常写一段 JS，把按钮和目标元素绑起来，再同步 \`aria-expanded\`、焦点和关闭逻辑。Chrome 135 引入的 \`command\` 和 \`commandfor\`，让这类关系可以直接写在 HTML 里。

## 打开一个 popover

\`\`\`html
<button commandfor="more-menu" command="show-popover">
  更多操作
</button>

<div id="more-menu" popover>
  <button>编辑</button>
  <button>复制</button>
  <button>删除</button>
</div>
\`\`\`

\`commandfor\` 指向目标元素的 id，\`command\` 描述要执行的动作。浏览器负责把按钮行为映射到对应 API，比如 \`showPopover()\`。

## 控制 dialog 也一样

\`\`\`html
<button commandfor="confirm" command="show-modal">
  删除记录
</button>

<dialog id="confirm">
  <p>确认删除这条记录吗？</p>
  <button commandfor="confirm" command="close" value="cancel">取消</button>
  <button commandfor="confirm" command="close" value="delete">删除</button>
</dialog>
\`\`\`

这类代码最直接的收益，是状态关系更靠近 HTML 语义。按钮控制谁、做什么事，不再藏在某个事件监听器里。

## 它替代了什么

\`command\` 和 \`commandfor\` 可以看作更通用的声明式按钮机制。它覆盖了很多 \`popovertarget\` 和 \`popovertargetaction\` 的使用场景，并扩展到 dialog 等元素。

它适合：

- 打开或关闭 popover
- 打开 modal dialog
- 关闭 dialog
- 给设计系统里的按钮建立更清楚的目标关系

不适合：

- 需要复杂业务判断的提交流程
- 打开前必须异步校验权限的操作
- 状态完全由框架路由或全局 store 控制的页面

## 渐进增强思路

因为兼容性还需要检查，生产里可以先保留 JS 行为，再逐步把简单控制迁到声明式属性。对设计系统来说，最适合先做的是菜单、确认框、帮助提示这些固定模式。

## 最后一句

\`commandfor\` 最吸引我的地方，是它让按钮重新像按钮：不是一个等待 JS 解释的空壳，而是能在 HTML 里直接说明“我要控制谁、做什么”。这会让交互关系更容易读，也更接近可访问的默认行为。`
  },
  {
    id: "2026-07-03-anchor-positioning",
    title: "CSS Anchor Positioning：弹层终于能跟着锚点走",
    date: "2026-07-03",
    createdAt: Date.parse("2026-07-03T12:00:00+08:00"),
    tags: ["CSS", "弹层", "布局"],
    cover: coverPool[3],
    excerpt: "CSS Anchor Positioning 让 tooltip、菜单和浮层可以直接相对某个元素定位，很多浮层不再需要 JS 反复测量坐标。",
    content: `
## 弹层定位为什么麻烦

tooltip、下拉菜单、浮动工具栏都离不开一个问题：浮层要相对某个按钮或输入框出现。过去这通常需要 JS 读取 \`getBoundingClientRect()\`，再考虑滚动、窗口边界、resize 和翻转方向。

CSS Anchor Positioning 的目标，就是让浮层可以直接锚定到页面上的另一个元素。

## 一个基础例子

\`\`\`html
<button class="help-button">说明</button>
<div class="help-popover" popover>
  这里是更详细的说明。
</div>
\`\`\`

\`\`\`css
.help-button {
  anchor-name: --help;
}

.help-popover {
  position: absolute;
  position-anchor: --help;
  position-area: bottom center;
  margin-top: 8px;
}
\`\`\`

按钮声明自己是一个锚点，浮层声明自己跟着这个锚点定位。阅读代码时，关系非常直接。

## 它解决的是测量代码

很多浮层组件里最脆弱的部分，不是展示本身，而是位置计算：

- 目标元素滚动后坐标变了
- 页面缩放后尺寸变了
- 右侧空间不足需要翻转
- 弹层进入 top layer 后参考关系变了
- resize 时要重新计算

Anchor Positioning 把这些问题的一部分交给布局系统。浏览器比我们更知道元素当前在哪里，也更适合在布局阶段处理位置。

## 和 Popover API 组合更顺手

Anchor Positioning 只负责位置，Popover API 负责显示、隐藏、顶层和轻量关闭。两者组合起来，能覆盖很多日常 UI：

\`\`\`html
<button popovertarget="profile-card" class="avatar-button">
  打开资料卡
</button>

<aside id="profile-card" popover class="profile-card">
  用户资料
</aside>
\`\`\`

\`\`\`css
.avatar-button {
  anchor-name: --avatar;
}

.profile-card {
  position-anchor: --avatar;
  position-area: bottom right;
}
\`\`\`

这比“按钮点击后 JS 算 top/left”更接近平台能力。

## 现在怎么用更稳

我会把它用在可渐进增强的浮层里：

- tooltip
- hover card
- 菜单
- 小型操作面板
- 输入框旁的解释提示

对于复杂拖拽、跨窗口边界或高度定制的编辑器浮层，成熟 JS 定位库仍然有价值。Anchor Positioning 更适合逐步替换那些重复的轻量定位代码。

## 最后一句

浮层本来就是“某个东西旁边的东西”。Anchor Positioning 终于让 CSS 也能直接表达这层关系。少测一次坐标，就少一个在滚动和缩放时跑偏的机会。`
  },
  {
    id: "2026-07-03-interpolate-size",
    title: "interpolate-size：终于能顺滑过渡到 height: auto",
    date: "2026-07-03",
    createdAt: Date.parse("2026-07-03T11:00:00+08:00"),
    tags: ["CSS", "动画", "交互"],
    cover: coverPool[4],
    excerpt: "interpolate-size 和 calc-size() 让元素可以从固定尺寸过渡到 auto、max-content 等内在尺寸，折叠面板不必再靠 max-height 取巧。",
    content: `
## 为什么 height: auto 一直让人头疼

折叠面板、FAQ、导航展开，最自然的状态其实是 \`height: auto\`。但传统 CSS 过渡不能在固定长度和 \`auto\` 之间顺滑插值，于是很多项目会用 \`max-height: 999px\`、JS 测量高度，或者干脆放弃动画。

\`interpolate-size\` 和 \`calc-size()\` 给了 CSS 一条更干净的路：显式允许内在尺寸关键字参与动画。

## 全局开启关键字插值

Chrome 文档建议可以在根上启用：

\`\`\`css
:root {
  interpolate-size: allow-keywords;
}
\`\`\`

这样浏览器可以在长度和内在尺寸关键字之间做插值，比如 \`auto\`、\`min-content\`、\`max-content\`。

一个折叠面板可以这样写：

\`\`\`css
.answer {
  height: 0;
  overflow: clip;
  transition: height 0.25s ease;
}

.faq-item[open] .answer {
  height: auto;
}
\`\`\`

在支持的浏览器里，展开就不再是瞬间跳开。

## calc-size() 适合更精确的计算

如果你不想全局开启，也可以在具体属性里用 \`calc-size()\`：

\`\`\`css
.panel {
  height: calc-size(auto, size);
}
\`\`\`

\`calc-size()\` 的第二个参数可以基于 \`size\` 做计算，这让内在尺寸不只是“原样使用”，还可以参与更受控的公式。

## 它替代了哪些旧技巧

我最想替换的是这些写法：

- \`max-height: 999px\` 的折叠动画
- 展开前用 JS 读取 \`scrollHeight\`
- 为不同内容长度写多个固定高度 class
- 因为动画不好做而把交互做成瞬间切换

新能力并不意味着所有地方都要动。老浏览器仍然需要兜底，但新浏览器可以得到更自然的体验。

## 渐进增强写法

\`\`\`css
.answer {
  max-height: 0;
  overflow: clip;
  transition: max-height 0.25s ease;
}

.faq-item[open] .answer {
  max-height: 720px;
}

@supports (interpolate-size: allow-keywords) {
  :root {
    interpolate-size: allow-keywords;
  }

  .answer {
    height: 0;
    max-height: none;
    transition-property: height;
  }

  .faq-item[open] .answer {
    height: auto;
  }
}
\`\`\`

兜底先保证能展开，增强再追求更自然的动画。

## 最后一句

\`height: auto\` 的动画不是炫技问题，而是很多真实交互的基础质感。能把它交还给 CSS，折叠面板和内容渐显这类组件就少了一大块测量代码。`
  },
  {
    id: "2026-07-03-css-custom-functions",
    title: "CSS @function：把重复的样式计算留在原生 CSS",
    date: "2026-07-03",
    createdAt: Date.parse("2026-07-03T09:30:00+08:00"),
    tags: ["CSS", "设计系统", "工程化"],
    cover: coverPool[2],
    excerpt: "Chrome 139 开始支持 CSS 自定义函数 @function。它能把颜色透明度、主题切换、尺寸计算这类重复逻辑封装在原生 CSS 里。",
    content: `
## 今天为什么值得关注

CSS 变量解决了“把值存起来”的问题，但没有很好解决“把一段计算逻辑复用起来”的问题。于是我们会在项目里反复写 \`color-mix()\`、\`clamp()\`、相对颜色语法，或者把这些逻辑交给 Sass、Less、CSS-in-JS 工具链。

\`@function\` 的出现，让 CSS 开始拥有原生自定义函数。Chrome 的 Web UI 更新里提到，它从 Chrome 139 开始支持；MDN 也把它标成实验性能力，提醒生产环境要谨慎检查兼容性。

换句话说，它现在最适合做预研、设计系统实验和渐进增强，而不是立刻替换所有预处理器函数。

## 最小写法

一个自定义函数以双横线开头，参数也用自定义属性的形式传入，最后用 \`result\` 描述符给出返回值。

\`\`\`css
@function --transparent(--color, --alpha) {
  result: oklch(from var(--color) l c h / var(--alpha));
}

.card {
  background: --transparent(#2563eb, 0.12);
}
\`\`\`

这段代码做的事情很朴素：传入一个颜色和透明度，返回一个带 alpha 的颜色值。以前这种逻辑经常散落在多个组件里，现在可以收成一个有名字的函数。

## 更贴近设计系统的例子

很多设计系统里都会有一组“阴影、边框、背景”的半透明派生色。如果每次都手写，时间久了很容易出现细微不一致。

\`\`\`css
@function --surface-border(--color) {
  result: color-mix(in oklch, var(--color), white 72%);

  @media (prefers-color-scheme: dark) {
    result: color-mix(in oklch, var(--color), black 54%);
  }
}

.panel {
  --brand: #2563eb;
  border-color: --surface-border(var(--brand));
}
\`\`\`

这里函数内部可以包含条件规则。浅色模式和深色模式的计算逻辑被放在同一个函数里，组件只需要关心“我要一个适合当前主题的边框色”。

## 它和 CSS 变量的关系

\`@function\` 不是 \`var()\` 的替代品。更准确地说，它们应该一起用：

- \`var()\` 适合保存可被层叠和覆盖的值
- \`@function\` 适合复用一段从输入到输出的计算
- \`@property\` 适合给自定义属性补类型、初始值和动画能力
- \`if()\` 适合在单个属性值里做条件分支

如果只是换一个主题色，用变量就够了。如果是“输入品牌色，产出一组符合规则的派生色”，函数会更清楚。

## 什么时候值得用

我会优先把它放在这些重复逻辑里试：

- 根据品牌色生成半透明背景
- 根据字号档位计算行高和间距
- 把浅色/深色模式下的返回值收在一起
- 封装流式排版里的 \`clamp()\` 公式
- 给组件库暴露更少、更稳定的样式入口

但也有边界：如果函数逻辑已经需要大量分支，或者团队成员看一眼很难判断最终结果，说明它可能不该藏在 CSS 函数里。CSS 的可维护性，很多时候来自“看见声明就知道大概效果”。

## 渐进增强怎么写

因为 \`@function\` 仍然是新能力，落地时要先给默认值，再在支持环境里开启增强。

\`\`\`css
.badge {
  background: rgb(37 99 235 / 12%);
}

@supports at-rule(@function) {
  @function --wash(--color) {
    result: color-mix(in oklch, var(--color), white 84%);
  }

  .badge {
    background: --wash(#2563eb);
  }
}
\`\`\`

这类写法的好处是：旧浏览器仍然有稳定样式，新浏览器得到更统一的设计系统计算。

## 最后一句

\`@function\` 真正让人期待的，不是“CSS 也能写函数了”这句话本身，而是它让设计系统里的很多重复计算有机会回到浏览器原生层。能少依赖一层构建时转换，样式规则就离最终运行环境更近一步。`
  },
  {
    id: "2026-07-02-scroll-target-group",
    title: "scroll-target-group：两行 CSS 做目录高亮",
    date: "2026-07-02",
    createdAt: Date.parse("2026-07-02T09:30:00+08:00"),
    tags: ["CSS", "滚动", "可访问性"],
    cover: coverPool[3],
    excerpt: "Chrome 的 Web UI 更新里继续强调原生滚动能力：用 scroll-target-group 和 :target-current，可以不写滚动监听就做出目录自动高亮。",
    content: `
## 今天为什么值得写它

Chrome 团队在 2026 年 7 月 1 日发布的 Web UI 更新里，把 \`scroll-target-group: auto\` 放进了“减少噪音、最大化内容”的能力清单。它解决的是一个非常常见的小需求：文章目录、文档导航、长页面锚点列表，怎么随着滚动自动高亮当前章节？

过去我们一般会写 \`IntersectionObserver\`，观察每个标题的位置，再给对应链接加 \`active\` class。逻辑不复杂，但每个项目都要重新写一遍，而且还要处理阈值、滚动容器、初始状态和回退。

\`scroll-target-group\` 的思路更直接：让浏览器把一组锚点链接当成滚动标记，并自动判断哪一个目标当前在视口里。

## 最小可用结构

先保留普通、语义清楚的目录链接：

\`\`\`html
<nav class="toc" aria-label="文章目录">
  <ol>
    <li><a href="#intro">为什么要关注</a></li>
    <li><a href="#usage">怎么使用</a></li>
    <li><a href="#fallback">如何回退</a></li>
  </ol>
</nav>

<article>
  <h2 id="intro">为什么要关注</h2>
  <p>...</p>
  <h2 id="usage">怎么使用</h2>
  <p>...</p>
  <h2 id="fallback">如何回退</h2>
  <p>...</p>
</article>
\`\`\`

然后在目录列表上开启滚动目标分组：

\`\`\`css
.toc ol {
  scroll-target-group: auto;
}

.toc a:target-current {
  color: #2563eb;
  font-weight: 700;
}
\`\`\`

这就是核心。目录里的 \`a[href^="#"]\` 会参与浏览器的滚动目标判断；当前目标对应的链接会匹配 \`:target-current\`，你就可以直接写高亮样式。

## 它真正省掉的是什么

这不是为了少写两行 JS 而已。更重要的是，它把“当前滚动目标是谁”这个判断交回给浏览器。

过去做目录高亮时，常见的边界包括：

- 标题高度不一致，阈值很难一把梭
- 页面里有固定顶部导航，需要手动补偏移
- 内容懒加载后，观察区域会变化
- 滚动容器不是 \`window\`，逻辑要再分支
- 目录链接和标题关系要自己维护

原生方案不会让所有边界消失，但它让基础状态管理更可靠：目录本来就是锚点链接，浏览器本来就知道这些链接指向哪里，现在只是在这个关系上补了一层“当前项”状态。

## 和 aria-current 的关系

Chrome 的说明里提到，浏览器可以自动给当前链接设置 \`aria-current="true"\`，同时应用 \`:target-current\`。这点很重要，因为目录高亮不应该只是视觉效果。

也就是说，增强后的目录不只是“看起来有高亮”，辅助技术也能知道当前所在章节。对长文、文档、设置页这类内容，这比单纯加一个 \`.active\` class 更接近正确语义。

不过我还是会保留一个原则：HTML 先写成没有增强也能用的目录。即使浏览器不支持 \`scroll-target-group\`，这些锚点链接依然可以点击、可以跳转、可以被读出来。

## 现在怎么落地更稳

它目前还不是所有主流浏览器都稳定支持，所以更适合当渐进增强：

\`\`\`css
.toc a {
  color: #526173;
  text-decoration: none;
}

@supports (scroll-target-group: auto) {
  .toc ol {
    scroll-target-group: auto;
  }

  .toc a:target-current {
    color: #2563eb;
    font-weight: 700;
    text-decoration: underline;
    text-underline-offset: 4px;
  }
}
\`\`\`

我会优先把它放在这些地方：

- 博客文章目录
- 文档站侧边导航
- 设置页分组导航
- 长表单的步骤定位
- 作品集或案例页的章节跳转

如果页面需要兼容所有浏览器都显示实时高亮，那就继续保留 JS 方案。但如果高亮只是增强体验，这个 CSS 能让代码少很多。

## 最后一句

\`scroll-target-group\` 让我喜欢的地方，是它没有要求我们放弃语义化 HTML。目录还是目录，链接还是链接，只是浏览器终于能帮我们识别“现在读到哪一节”。这类小能力一多，前端页面就会从“到处补状态”慢慢回到“让平台自己表达状态”。`
  },
  {
    id: "2026-07-01-css-if-function",
    title: "CSS if()：把条件样式写回属性值里",
    date: "2026-07-01",
    createdAt: Date.parse("2026-07-01T09:30:00+08:00"),
    tags: ["CSS", "条件样式", "工程化"],
    cover: coverPool[4],
    excerpt: "Chrome 137 开始可以尝试 CSS if()。它让 media、supports 和 style 查询进入单个属性值，很多动态样式不用再拆成一堆重复规则。",
    content: `
## 今天为什么值得写它

CSS 过去并不缺条件判断，但大多数条件都写在规则外面：\`@media\` 一层、\`@supports\` 一层、容器或样式查询再来一层。规则一多，真正变化的可能只是一个颜色、一个间距或一个图标位置，代码却被拆得很散。

Chrome 137 开始可以尝试 \`if()\` 函数。它把条件判断放回属性值里，让“这个属性在不同条件下取什么值”变得更集中。

## 基本写法

\`if()\` 的结构是一组条件和值：

\`\`\`css
.card {
  color: if(
    media(width > 720px): #172033;
    else: #263241
  );
}
\`\`\`

你可以把它理解成 CSS 属性值里的轻量分支。条件从前往后判断，命中第一个就使用对应的值；没有命中时，可以用 \`else\` 给一个兜底。

## 它适合解决什么问题

最适合先用 \`if()\` 的，是那些“只有一个值跟着条件变”的场景。

例如主题色切换：

\`\`\`css
.notice {
  --tone: warning;
  border-color: if(
    style(--tone: warning): #f59e0b;
    style(--tone: danger): #ef4444;
    else: #2563eb
  );
}
\`\`\`

或者把能力检测收进单个声明：

\`\`\`css
.panel {
  backdrop-filter: if(
    supports(backdrop-filter: blur(12px)): blur(12px);
    else: none
  );
}
\`\`\`

以前这类代码常常要拆成多段规则。拆开当然能工作，但读代码的人需要来回跳，才能知道一个属性完整的决策逻辑。

## 和 @media、@supports 不是替代关系

\`if()\` 不是要替代 \`@media\` 或 \`@supports\`。如果一个条件会影响很多属性，外层规则依然更清楚：

\`\`\`css
@media (width > 720px) {
  .layout {
    grid-template-columns: 240px 1fr;
    gap: 24px;
    align-items: start;
  }
}
\`\`\`

但如果只是一个属性值在变，把条件写在属性里会更贴近维护者的阅读路径。

我的判断是：

- 影响一组布局规则时，用 \`@media\`、\`@supports\` 或容器查询
- 只影响单个属性值时，可以考虑 \`if()\`
- 条件超过两三层时，优先拆回更直观的规则
- 需要长期兼容旧浏览器时，先写普通声明，再用支持检测增强

## 渐进增强怎么写

因为 \`if()\` 还不是所有浏览器都能稳定使用，落地时要给兜底值：

\`\`\`css
.badge {
  background: #2563eb;
}

@supports (background: if(media(width > 1px): red; else: blue)) {
  .badge {
    background: if(
      style(--level: important): #dc2626;
      else: #2563eb
    );
  }
}
\`\`\`

这段代码的重点不是炫技，而是顺序：先保证默认体验可用，再给支持新语法的浏览器更精细的表达。

## 最后一句

\`if()\` 最有价值的地方，是让 CSS 里那些很小的条件判断不再被迫拆散。它不会让样式逻辑变少，但能让逻辑更靠近真正变化的属性。少一点跨规则跳转，维护时就少一点心智负担。`
  },
  {
    id: "2026-06-30-grid-lanes",
    title: "Grid Lanes：CSS 瀑布流终于不用再靠脚本补位",
    date: "2026-06-30",
    createdAt: Date.parse("2026-06-30T11:00:00+08:00"),
    tags: ["CSS", "布局", "响应式", "Safari"],
    cover: coverPool[0],
    excerpt: "Safari 26.4 已经支持 Grid Lanes，Safari 27 的 WebKit 更新也继续重点展示它：用几行 CSS 做出瀑布流和砖块布局，同时保留 Grid 的轨道能力。",
    content: `
## 今天为什么值得记一笔

WebKit 在 WWDC26 的 Safari 27 更新里继续重点展示了 Grid Lanes，而且它已经在 Safari 26.4 可用。它想解决的是一个老问题：Pinterest 式瀑布流布局为什么到今天还常常要靠 JavaScript 测高度、算列位、再手动补位？

Grid Lanes 的方向很清楚：继续用 CSS Grid 的轨道模型，但让子项可以自动填入“车道”，形成垂直瀑布流或水平砖块流。对博客卡片、图片墙、作品集、菜谱列表、时间线这类高度不一致的内容，它比传统 grid 更贴近真实排版需求。

## 最小写法长这样

WebKit 的示例里，最核心的代码非常短：

\`\`\`css
.gallery {
  display: grid-lanes;
  grid-template-columns: repeat(3, 1fr);
  gap: 16px;
}
\`\`\`

子元素不需要自己计算落在哪一列。浏览器会根据可用轨道和内容高度，把它们放进更合适的位置。

如果要做响应式，也还是熟悉的 Grid 写法：

\`\`\`css
.gallery {
  display: grid-lanes;
  grid-template-columns: repeat(auto-fit, minmax(180px, 1fr));
  gap: 16px;
}
\`\`\`

这就是它让人兴奋的地方：不是发明一套完全陌生的新布局语言，而是在 Grid 的语法体系里补上“内容高度不一致时怎么自然排布”这一块。

## 它和普通 Grid 差在哪

普通 Grid 更像整齐的表格：每一行的高度通常会被同一行里最高的元素撑开。内容差异一大，卡片之间就容易出现大片空白。

Grid Lanes 更像把每一列看成独立的流。短卡片下面可以继续接下一张，不必等旁边最高的卡片结束。这正是瀑布流布局以前需要 JS 帮忙的地方。

适合优先尝试的场景包括：

- 图片比例不一致的相册和作品集
- 卡片摘要长短不同的文章列表
- 内容块高度天然不稳定的资源导航
- 时间线、菜谱、灵感板这类重浏览的页面

## 别忽略顺序和可访问性

瀑布流布局最容易踩的坑，是视觉顺序和源码顺序差得太远。用户用键盘 Tab 浏览时，如果焦点路线跳来跳去，体验会非常别扭。

Grid Lanes 里提到的 \`flow-tolerance\` 就是一个值得关注的点。它让你控制子项为了填补空位可以偏离源码顺序到什么程度。也就是说，你可以在“排得更紧”和“顺序更稳定”之间留出一个明确的调节点。

这类能力很重要，因为瀑布流不是单纯把空白塞满。真正可用的布局，还要让阅读顺序、键盘顺序和视觉感受尽量不要互相打架。

## 现在怎么落地更稳

我会把 Grid Lanes 当成一个适合预研和渐进增强的能力，而不是马上替换所有线上布局。

更稳的做法是：

- 默认先写一个普通 Grid 或多列布局作为兜底
- 用 \`@supports (display: grid-lanes)\` 包住增强样式
- 别让关键业务流程依赖瀑布流排序
- 优先用在图片墙、灵感板、非线性浏览内容里
- 测试键盘焦点顺序，尤其是卡片里有链接或按钮的时候

示例结构可以这样组织：

\`\`\`css
.gallery {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(180px, 1fr));
  gap: 16px;
}

@supports (display: grid-lanes) {
  .gallery {
    display: grid-lanes;
    flow-tolerance: 2em;
  }
}
\`\`\`

## 最后一句

Grid Lanes 的意义，不只是“CSS 终于能做瀑布流”。更大的价值是，浏览器开始把过去前端反复手写的布局算法，收回到标准布局系统里。少一段测量和重排脚本，页面就少一层容易抖动的复杂度。`
  },
  {
    id: "2026-06-30-customizable-select",
    title: "Customizable Select：原生下拉框终于能认真设计了",
    date: "2026-06-30",
    createdAt: Date.parse("2026-06-30T09:30:00+08:00"),
    tags: ["HTML", "CSS", "表单", "可访问性"],
    cover: coverPool[2],
    excerpt: "Safari 27 beta 把可定制的原生 select 放到台前，Chrome 也已经开始支持。现在值得重新评估那些用 div 和 JS 重写的下拉框了。",
    content: `
## 今天为什么值得关注

截至 2026 年 6 月 30 日，表单控件里最值得前端留意的新变化之一，是 Customizable Select 正在从“只能看演示”走向“可以开始做渐进增强”。

Chrome 135 已经支持用 CSS 定制原生 \`<select>\`，Safari 27 beta 也把它列为重点能力。它解决的不是一个小审美问题，而是一个长期工程问题：过去想把下拉框做得和设计系统一致，常常要用一堆 \`div\`、键盘事件、焦点管理和 ARIA 重新造一个控件。

现在更好的方向是：保留真正的 \`select\`，把视觉增强交给 CSS。

## 最小可用写法

核心开关是 \`appearance: base-select\`。它让浏览器把 \`select\` 切到一个更适合定制的基础形态，同时暴露出 picker、图标、选中态等可样式化的部分。

\`\`\`html
<label class="field">
  <span>文章分类</span>
  <select class="topic-select" name="topic">
    <option value="css">
      <span class="swatch css"></span>
      <span>CSS</span>
    </option>
    <option value="react">
      <span class="swatch react"></span>
      <span>React</span>
    </option>
    <option value="html">
      <span class="swatch html"></span>
      <span>HTML</span>
    </option>
  </select>
</label>
\`\`\`

\`\`\`css
@supports (appearance: base-select) {
  .topic-select,
  .topic-select::picker(select) {
    appearance: base-select;
  }

  .topic-select {
    min-inline-size: 220px;
    border: 1px solid #d7dee8;
    border-radius: 10px;
    padding: 10px 12px;
    background: #fff;
  }

  .topic-select::picker(select) {
    border: 1px solid #d7dee8;
    border-radius: 12px;
    padding: 6px;
    box-shadow: 0 18px 48px rgb(15 23 42 / 18%);
  }

  .topic-select option {
    display: grid;
    grid-template-columns: 12px 1fr;
    align-items: center;
    gap: 10px;
    padding: 10px;
  }
}
\`\`\`

## 它真正省掉的成本

以前定制下拉框，最麻烦的不是画一个漂亮面板，而是补齐浏览器原生控件已经处理过的细节：

- 键盘上下选择、回车确认、Esc 关闭
- 表单提交时的值同步
- 焦点状态和可访问性语义
- 弹层不被父容器 \`overflow\` 裁掉
- 移动端和辅助技术里的基础行为

Customizable Select 的价值，是让我们可以少写一层“假控件”，多保留一层浏览器原生能力。设计系统依然能有自己的样式，但不必每次都重新实现交互底座。

## 最重要的规则：别删文字

WebKit 最近特别强调了一条规则：选项里可以加图标、色块、图片，但不要用它们替代文字。

也就是说，下面这种思路更稳：

\`\`\`html
<option value="photo">
  <img src="photo.svg" alt="">
  <span>摄影</span>
</option>
\`\`\`

而不是只留下一个图标。原因很直接：屏幕阅读器需要可读名称；不支持新能力的浏览器会回退到普通 \`select\`；CSS 加载失败时，文字也是最后的兜底体验。

图标是增强，文字才是基线。

## 现在该怎么用

我的判断是：它已经适合放进实验性页面、后台工具、设计系统预研和低风险表单里试用，但还不适合无条件替换所有线上复杂选择器。

落地时可以按这个顺序来：

- 默认先写一个语义完整的原生 \`select\`
- 用 \`@supports (appearance: base-select)\` 包住增强样式
- 保留每个 \`option\` 的文本内容
- 测键盘、屏幕阅读器、SSR 水合和旧浏览器回退
- 只在确实不需要搜索、虚拟列表、复杂多选时替换自定义组件

## 最后一句

Customizable Select 不是让所有下拉框都立刻变花，而是给我们一个机会：把“原生控件”和“设计系统表达”重新接回同一条路上。能少造一个假控件，就少维护一整套边界条件。`
  },
  {
    id: "2026-06-29-css-has-state",
    title: "用 :has() 把状态样式交还给 CSS",
    date: "2026-06-29",
    tags: ["CSS", "选择器", "交互"],
    cover: coverPool[1],
    excerpt: "很多为了父级高亮、表单反馈和卡片状态写的 JS，现在可以先问一句：这是不是 CSS :has() 就能表达？",
    content: `
## 为什么今天值得写它

过去处理“父元素根据子元素状态变样式”，经常要给父级补一个 class，或者写 JS 监听 input、hover、aria 状态再同步到外层。

\`:has()\` 的价值在于，它让 CSS 可以根据内部结构、子元素状态或相邻元素关系来选择外层元素。很多只是为了视觉反馈存在的轻状态，就不用再交给 JavaScript 管了。

## 典型用法一：表单分组自己响应

一个输入框聚焦、校验失败、被勾选时，通常真正要变化的是整组表单区域，而不是 input 本身。

\`\`\`css
.field {
  border: 1px solid #d6dde3;
  background: #fff;
}

.field:has(input:focus-visible) {
  border-color: #2563eb;
  box-shadow: 0 0 0 3px rgb(37 99 235 / 12%);
}

.field:has(input:invalid:not(:placeholder-shown)) {
  border-color: #dc2626;
}
\`\`\`

这类逻辑以前常常会变成 \`is-focused\`、\`is-error\` 之类的 class。现在如果状态本来就在 DOM 里，就可以让 CSS 自己读出来。

## 典型用法二：卡片根据内容调整

有些卡片带徽标，有些没有；有些卡片有操作区，有些只是纯展示。用 \`:has()\` 可以让同一个组件根据实际内容调整密度。

\`\`\`css
.article-card:has(.badge) {
  padding-top: 18px;
}

.article-card:has(.actions) {
  grid-template-rows: 1fr auto;
}
\`\`\`

它很适合处理“有这个内容就改变一点样式”的场景，比再额外传一个 \`variant\` 更直观。

## 别把选择器写得太宽

\`:has()\` 很强，但不要随手写成全局扫描。尽量把锚点限制在具体组件上，内部条件也优先用直接子元素或相邻元素关系。

\`\`\`css
/* 不推荐：影响范围太大 */
body:has(.modal-open) {
  overflow: hidden;
}

/* 更稳：把判断收在组件边界里 */
.tabs:has(> .tab[aria-selected="true"]) {
  border-color: #2563eb;
}
\`\`\`

如果页面会频繁插入、删除节点，过宽的 \`:has()\` 可能让浏览器反复重新计算匹配关系。组件级、局部化，是它最舒服的使用方式。

## 我的使用规则

- 用它处理视觉状态，不把核心业务状态藏进 CSS
- 锚点选具体组件，少用 \`body\`、\`:root\`、\`*\`
- 内部选择器尽量具体，能写 \`>\` 或 \`+\` 就少写宽泛后代选择器
- 关键体验保留默认样式，增强效果再交给 \`:has()\`

## 最后一句

\`:has()\` 不是为了取代 JS，而是把“本来只是样式响应”的部分还给 CSS。少一段状态同步代码，组件就少一个容易跑偏的地方。
`
  },
  {
    id: "2026-06-28-container-queries",
    title: "Container Queries 真正好用的时刻",
    date: "2026-06-28",
    tags: ["CSS", "响应式", "组件"],
    cover: coverPool[0],
    excerpt: "把响应式判断从整个页面宽度，转到单个组件本身的可用空间，很多布局瞬间就顺手了。",
    content: `
## 为什么现在值得用

过去我们写响应式，经常只盯着 viewport。问题是一个卡片放在首页、侧栏、弹窗里，宽度完全不同，但组件代码却被迫共享同一套媒体查询。

Container Queries 解决的是组件级响应式。它让组件根据自己的容器宽度调整布局，而不是跟着整个页面跑。

## 最先受益的场景

- 卡片组件既会出现在两列区，也会出现在四列区
- 侧边栏里的统计面板需要根据容器切换信息密度
- 设计系统里同一个组件会被多个页面复用

## 一个足够实用的写法

\`\`\`css
.post-list {
  container-type: inline-size;
}

.post-card {
  display: grid;
  gap: 12px;
}

@container (min-width: 560px) {
  .post-card {
    grid-template-columns: 180px 1fr;
    align-items: center;
  }
}
\`\`\`

## 写法上的提醒

给容器命名会更稳，尤其在复杂页面里：

\`\`\`css
.post-list {
  container: postlist / inline-size;
}

@container postlist (min-width: 560px) {
  .post-card {
    grid-template-columns: 180px 1fr;
  }
}
\`\`\`

> 当组件会在很多上下文里复用时，Container Queries 往往比加更多变体 props 更轻。

## 最后的判断标准

如果你发现“同一个组件在不同位置需要不同排版”，而且这个差异主要由可用空间决定，那就很适合用容器查询。
`
  },
  {
    id: "2026-06-27-view-transitions",
    title: "View Transitions 不只适合酷炫动画",
    date: "2026-06-27",
    tags: ["CSS", "交互", "动画"],
    cover: coverPool[1],
    excerpt: "真正有价值的不是花哨，而是页面切换时信息关系更连续，用户更容易跟上内容变化。",
    content: `
## 先别急着把它当成特效

很多人第一次看到 View Transitions，会先想到页面转场动画。但它更有价值的地方，其实是帮助用户理解“原来的元素去哪了”。

当列表点进详情页、筛选条件切换、或者局部面板重排时，这种连续感很重要。

## 最适合先尝试的三个场景

- 文章卡片切换到正文详情
- 仪表盘列表重新排序
- 筛选条件变化导致结果区块重排

## 最小可用版本

\`\`\`js
const updatePosts = async () => {
  if (!document.startViewTransition) {
    renderPosts();
    return;
  }

  document.startViewTransition(() => {
    renderPosts();
  });
};
\`\`\`

\`\`\`css
.post-card {
  view-transition-name: post-card;
}
\`\`\`

## 两个实践上的边界

- 如果内容变化过于剧烈，转场会比直接更新更乱
- 动画不是默认都要有，节奏应该跟信息更新速度匹配

## 我更在意的体验收益

用户不是来看你做了多复杂的动画，而是希望切换时不丢上下文。能让人少花一秒重新理解页面，就已经值了。
`
  },
  {
    id: "2026-06-26-css-layers",
    title: "用 CSS Layers 收拾样式优先级",
    date: "2026-06-26",
    tags: ["CSS", "工程化", "设计系统"],
    cover: coverPool[2],
    excerpt: "当项目越来越大，样式顺序比选择器更容易失控。Layers 可以把这件事重新拉回秩序里。",
    content: `
## 为什么大型项目会越来越难管

样式冲突常常不是因为某个选择器写得太野，而是因为来源太多：基础样式、组件库、业务覆盖、临时修补，一层一层叠起来，最后没人敢动。

## Layers 的基本思路

你先定义层级顺序，再把样式放进去。浏览器按层级判断优先级，而不是单纯靠谁后写。

\`\`\`css
@layer reset, tokens, base, components, utilities, overrides;

@layer base {
  body {
    margin: 0;
    color: #243139;
  }
}

@layer components {
  .button {
    border-radius: 8px;
  }
}
\`\`\`

## 它最适合解决什么问题

- 三方样式和业务样式打架
- 组件库升级后出现不可预期覆盖
- 项目里到处堆着 \`!important\`

## 我自己的经验

在团队里推进 Layers 时，先别追求一步到位。先把 reset、base、components、overrides 四层定住，就已经能让很多问题显著收敛。
`
  },
  {
    id: "2026-06-25-react-render-budget",
    title: "给 React 页面一点明确的渲染预算",
    date: "2026-06-25",
    tags: ["React", "性能优化", "调试"],
    cover: coverPool[3],
    excerpt: "别一上来就堆 memo。先知道哪些更新值得发生，哪些只是组件在空转，优化才会更稳。",
    content: `
## 性能问题经常不是“慢”，而是“糊”

很多页面不是单次渲染特别重，而是会在用户一次操作里触发太多没有必要的更新，结果整个界面都显得黏。

## 先建立预算意识

我通常会先问三个问题：

- 这次交互，哪些区域应该更新？
- 哪些组件只是父级变化被顺带重渲了？
- 这次更新能不能控制在用户几乎察觉不到的时间里？

## 排查时很好用的一段逻辑

\`\`\`jsx
const ArticleList = React.memo(function ArticleList({ posts, activeId, onSelect }) {
  return posts.map((post) => (
    <ArticleCard
      key={post.id}
      post={post}
      isActive={post.id === activeId}
      onSelect={onSelect}
    />
  ));
});
\`\`\`

## 重点不是 memo 本身

\`React.memo\` 只是一个放大镜。它帮助你确认“传给组件的输入是否稳定”。如果 props 每次都新建，memo 只是给问题贴了个创可贴。

## 更稳的优化顺序

1. 先找更新源头
2. 再减少无关组件跟着刷新
3. 最后才是把热点组件做缓存和拆分
`
  },
  {
    id: "2026-06-24-vite-code-splitting",
    title: "Vite 项目里，别让首屏脚本偷偷变胖",
    date: "2026-06-24",
    tags: ["Vite", "工程化", "性能优化"],
    cover: coverPool[4],
    excerpt: "页面越做越多时，首屏资源常常不是一下子变大的，而是在每次顺手 import 里慢慢积累出来的。",
    content: `
## 首屏变慢，常常不是某一次大改动

更常见的情况是：图表库先来一点，编辑器再来一点，埋点助手也顺手放进去，最后首页明明只展示一行摘要，却背了很多不该在首屏出现的逻辑。

## 最直接的切法

\`\`\`js
const EditorPanel = lazy(() => import("./EditorPanel"));
const ChartPanel = lazy(() => import("./ChartPanel"));
\`\`\`

## 但拆分不是越细越好

如果一个页面首屏就一定会用到某个模块，把它强行拆成异步资源，只会把等待改成另一种等待。

## 更适合长期维护的做法

- 以路由为第一层拆分
- 以重量级功能块为第二层拆分
- 定期检查分析包结果，而不是等线上变慢才回头找

## 一个很朴素的提醒

凡是“平时可能用不上”的模块，都值得问一句：它真的该出现在首屏里吗？
`
  }
];

const elements = {
  metricPosts: document.getElementById("metric-posts"),
  metricTags: document.getElementById("metric-tags"),
  metricStreak: document.getElementById("metric-streak"),
  featuredStory: document.getElementById("featured-story"),
  hotTags: document.getElementById("hot-tags"),
  ideaList: document.getElementById("idea-list"),
  tagStrip: document.getElementById("tag-strip"),
  postGrid: document.getElementById("post-grid"),
  postPager: document.getElementById("post-pager"),
  readerPanel: document.getElementById("reader-panel"),
  archiveList: document.getElementById("archive-list"),
  rhythmList: document.getElementById("rhythm-list"),
  searchInput: document.getElementById("search-input"),
  composeForm: document.getElementById("compose-form"),
  postDate: document.getElementById("post-date"),
  postTitle: document.getElementById("post-title"),
  postTags: document.getElementById("post-tags"),
  postCover: document.getElementById("post-cover"),
  postExcerpt: document.getElementById("post-excerpt"),
  postContent: document.getElementById("post-content"),
  draftStatus: document.getElementById("draft-status"),
  prefillButton: document.getElementById("prefill-button"),
  clearButton: document.getElementById("clear-button")
};

const state = {
  search: "",
  activeTag: "全部",
  posts: [],
  activePostId: "",
  currentPage: 1,
  interactions: {},
  viewedInSession: new Set()
};

function safeReadJson(key, fallback) {
  try {
    const raw = localStorage.getItem(key);
    return raw ? JSON.parse(raw) : fallback;
  } catch (error) {
    return fallback;
  }
}

function safeWriteJson(key, value) {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch (error) {
    // Ignore write failures in locked-down browser contexts.
  }
}

function sanitizeInteractionRecord(record) {
  const comments = Array.isArray(record?.comments)
    ? record.comments
      .map((comment) => ({
        id: String(comment.id || `comment-${Date.now()}`),
        name: String(comment.name || "匿名读者").trim().slice(0, 24) || "匿名读者",
        content: String(comment.content || "").trim().slice(0, 280),
        createdAt: Number(comment.createdAt || Date.now())
      }))
      .filter((comment) => comment.content)
    : [];

  return {
    views: Math.max(0, Number(record?.views || 0)),
    likes: Math.max(0, Number(record?.likes || 0)),
    liked: Boolean(record?.liked),
    comments
  };
}

function bootInteractions() {
  const raw = safeReadJson(interactionKey, {});
  state.interactions = Object.fromEntries(
    Object.entries(raw).map(([postId, record]) => [postId, sanitizeInteractionRecord(record)])
  );
}

function getInteraction(postId) {
  if (!state.interactions[postId]) {
    state.interactions[postId] = sanitizeInteractionRecord({});
  }

  return state.interactions[postId];
}

function persistInteractions() {
  safeWriteJson(interactionKey, state.interactions);
}

function getPostStats(postId) {
  const record = getInteraction(postId);
  return {
    views: record.views,
    likes: record.likes,
    liked: record.liked,
    comments: record.comments.length
  };
}

function renderStatPills(postId) {
  const stats = getPostStats(postId);
  return `
    <span>阅读 ${stats.views}</span>
    <span>点赞 ${stats.likes}</span>
    <span>评论 ${stats.comments}</span>
  `;
}

function formatDate(dateString) {
  return new Intl.DateTimeFormat("zh-CN", {
    year: "numeric",
    month: "long",
    day: "numeric"
  }).format(new Date(dateString));
}

function formatArchiveMonth(dateString) {
  return new Intl.DateTimeFormat("zh-CN", {
    year: "numeric",
    month: "long"
  }).format(new Date(dateString));
}

function todayIso() {
  return new Date().toLocaleDateString("sv-SE");
}

function readingMinutes(text) {
  const plain = text.replace(/```[\s\S]*?```/g, " ").replace(/\s+/g, "");
  return Math.max(3, Math.round(plain.length / 220));
}

function normalizeTags(tags) {
  if (Array.isArray(tags)) {
    return [...new Set(tags.map((item) => String(item).trim()).filter(Boolean))];
  }

  return [...new Set(
    String(tags || "")
      .split(/[，,]/)
      .map((item) => item.trim())
      .filter(Boolean)
  )];
}

function normalizePost(post, index) {
  return {
    id: post.id || `post-${Date.now()}-${index}`,
    title: String(post.title || "").trim(),
    date: String(post.date || todayIso()),
    tags: normalizeTags(post.tags),
    cover: String(post.cover || coverPool[index % coverPool.length]),
    excerpt: String(post.excerpt || "").trim(),
    content: String(post.content || "").trim(),
    readingMinutes: post.readingMinutes || readingMinutes(String(post.content || "")),
    local: Boolean(post.local),
    createdAt: post.createdAt || Date.now()
  };
}

function sortPosts(posts) {
  return posts.sort((left, right) => {
    const byDate = new Date(right.date) - new Date(left.date);
    if (byDate !== 0) {
      return byDate;
    }
    return (right.createdAt || 0) - (left.createdAt || 0);
  });
}

function bootPosts() {
  const localPosts = safeReadJson(storageKey, []).map((post, index) => normalizePost({ ...post, local: true }, index));
  const basePosts = seedPosts.map((post, index) => normalizePost(post, index));
  state.posts = sortPosts([...localPosts, ...basePosts]);
}

function getAllTags(posts) {
  return [...new Set(posts.flatMap((post) => post.tags))];
}

function computeStreak(posts) {
  const uniqueDates = [...new Set(posts.map((post) => post.date))].sort((a, b) => new Date(b) - new Date(a));

  if (!uniqueDates.length) {
    return 0;
  }

  let streak = 1;
  let cursor = new Date(uniqueDates[0]);

  for (let index = 1; index < uniqueDates.length; index += 1) {
    const next = new Date(uniqueDates[index]);
    const previousDay = new Date(cursor);
    previousDay.setDate(previousDay.getDate() - 1);

    if (next.toDateString() === previousDay.toDateString()) {
      streak += 1;
      cursor = next;
    } else {
      break;
    }
  }

  return streak;
}

function getFilteredPosts() {
  return state.posts.filter((post) => {
    const matchesTag = state.activeTag === "全部" || post.tags.includes(state.activeTag);
    const haystack = `${post.title} ${post.excerpt} ${post.tags.join(" ")} ${post.content}`.toLowerCase();
    const matchesSearch = !state.search || haystack.includes(state.search.toLowerCase());
    return matchesTag && matchesSearch;
  });
}

function ensureActivePost(filteredPosts) {
  if (!filteredPosts.length) {
    state.activePostId = "";
    return;
  }

  const exists = filteredPosts.some((post) => post.id === state.activePostId);
  if (!exists) {
    state.activePostId = filteredPosts[0].id;
  }
}

function getPageCount(posts) {
  return Math.max(1, Math.ceil(posts.length / postsPerPage));
}

function clampCurrentPage(posts) {
  state.currentPage = Math.min(Math.max(1, state.currentPage), getPageCount(posts));
}

function getPagedPosts(posts) {
  clampCurrentPage(posts);
  const start = (state.currentPage - 1) * postsPerPage;
  return posts.slice(start, start + postsPerPage);
}

function setPageForPost(postId, posts = getFilteredPosts()) {
  const index = posts.findIndex((post) => post.id === postId);
  if (index >= 0) {
    state.currentPage = Math.floor(index / postsPerPage) + 1;
  }
}

function escapeHtml(text) {
  return text
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

function inlineMarkdown(text) {
  return text
    .replace(/`([^`]+)`/g, "<code>$1</code>")
    .replace(/\*\*([^*]+)\*\*/g, "<strong>$1</strong>");
}

function markdownToHtml(markdown) {
  const lines = escapeHtml(markdown).split(/\r?\n/);
  const html = [];
  let inList = false;
  let inCode = false;
  let codeLines = [];

  const closeList = () => {
    if (inList) {
      html.push("</ul>");
      inList = false;
    }
  };

  const closeCode = () => {
    if (inCode) {
      html.push(`<pre><code>${codeLines.join("\n")}</code></pre>`);
      inCode = false;
      codeLines = [];
    }
  };

  lines.forEach((line) => {
    if (line.trim().startsWith("```")) {
      closeList();
      if (inCode) {
        closeCode();
      } else {
        inCode = true;
      }
      return;
    }

    if (inCode) {
      codeLines.push(line);
      return;
    }

    if (!line.trim()) {
      closeList();
      return;
    }

    if (line.startsWith("## ")) {
      closeList();
      html.push(`<h2>${inlineMarkdown(line.slice(3))}</h2>`);
      return;
    }

    if (line.startsWith("### ")) {
      closeList();
      html.push(`<h3>${inlineMarkdown(line.slice(4))}</h3>`);
      return;
    }

    if (line.startsWith("> ")) {
      closeList();
      html.push(`<blockquote>${inlineMarkdown(line.slice(2))}</blockquote>`);
      return;
    }

    if (/^[-*] /.test(line)) {
      if (!inList) {
        html.push("<ul>");
        inList = true;
      }
      html.push(`<li>${inlineMarkdown(line.slice(2))}</li>`);
      return;
    }

    closeList();
    html.push(`<p>${inlineMarkdown(line)}</p>`);
  });

  closeList();
  closeCode();
  return html.join("");
}

function renderMetrics(posts) {
  elements.metricPosts.textContent = String(posts.length);
  elements.metricTags.textContent = String(getAllTags(posts).length);
  elements.metricStreak.textContent = String(computeStreak(posts));
}

function renderFeatured(post) {
  if (!post) {
    elements.featuredStory.innerHTML = `<div class="empty-state">没有符合筛选条件的文章。</div>`;
    return;
  }

  elements.featuredStory.innerHTML = `
    <div class="featured-cover">
      <img src="${post.cover}" alt="${post.title}">
    </div>
    <div class="featured-copy">
      <div class="meta-row">
        <span>${formatDate(post.date)}</span>
        <span>${post.readingMinutes} 分钟</span>
      </div>
      <div class="stat-row">${renderStatPills(post.id)}</div>
      <h3>${post.title}</h3>
      <p>${post.excerpt}</p>
      <div class="tag-row" style="margin-top: 20px;">
        ${post.tags.map((tag) => `<button class="tag-chip ${state.activeTag === tag ? "active" : ""}" type="button" data-tag="${tag}">${tag}</button>`).join("")}
      </div>
      <div style="margin-top: 26px;">
        <button class="primary-button" type="button" data-open-post="${post.id}">阅读全文</button>
      </div>
    </div>
  `;
}

function renderHotTags(posts) {
  const counts = new Map();
  posts.forEach((post) => {
    post.tags.forEach((tag) => {
      counts.set(tag, (counts.get(tag) || 0) + 1);
    });
  });

  const ranked = [...counts.entries()].sort((a, b) => b[1] - a[1]).slice(0, 8);
  elements.hotTags.innerHTML = ranked
    .map(([tag, count]) => `<button class="tag-chip ${state.activeTag === tag ? "active" : ""}" type="button" data-tag="${tag}">${tag} · ${count}</button>`)
    .join("");
}

function renderIdeas() {
  elements.ideaList.innerHTML = weeklyIdeas.map((item) => `<li>${item}</li>`).join("");
}

function renderTagStrip(posts) {
  const tags = ["全部", ...getAllTags(posts)];
  elements.tagStrip.innerHTML = tags
    .map((tag) => `<button class="tag-chip ${state.activeTag === tag ? "active" : ""}" type="button" data-tag="${tag}">${tag}</button>`)
    .join("");
}

function renderPostGrid(posts) {
  if (!posts.length) {
    elements.postGrid.innerHTML = `<div class="empty-state">没有找到对应内容，换个关键词试试。</div>`;
    return;
  }

  elements.postGrid.innerHTML = posts.map((post) => `
    <article class="post-card ${state.activePostId === post.id ? "is-active" : ""}">
      <div class="post-cover">
        <img src="${post.cover}" alt="${post.title}">
      </div>
      <div class="post-card-body">
        <div class="meta-row">
          <span>${formatDate(post.date)}</span>
          <span>${post.readingMinutes} 分钟</span>
        </div>
        <div class="stat-row compact">${renderStatPills(post.id)}</div>
        <h3>${post.title}</h3>
        <p>${post.excerpt}</p>
      </div>
      <div class="post-card-footer">
        <div class="tag-row">
          ${post.tags.slice(0, 2).map((tag) => `<span class="tag-pill">${tag}</span>`).join("")}
        </div>
        <button class="text-button" type="button" data-open-post="${post.id}">阅读</button>
      </div>
    </article>
  `).join("");
}

function renderPostPager(posts) {
  const totalPages = getPageCount(posts);
  if (!posts.length || totalPages <= 1) {
    elements.postPager.innerHTML = "";
    return;
  }

  const pages = Array.from({ length: totalPages }, (_, index) => index + 1);
  elements.postPager.innerHTML = `
    <button class="pager-button" type="button" data-page-action="previous" ${state.currentPage === 1 ? "disabled" : ""}>上一页</button>
    <div class="pager-pages" aria-label="文章分页">
      ${pages.map((page) => `
        <button class="pager-button ${page === state.currentPage ? "is-active" : ""}" type="button" data-page="${page}" aria-current="${page === state.currentPage ? "page" : "false"}">${page}</button>
      `).join("")}
    </div>
    <button class="pager-button" type="button" data-page-action="next" ${state.currentPage === totalPages ? "disabled" : ""}>下一页</button>
  `;
}

function renderReader(post) {
  if (!post) {
    elements.readerPanel.innerHTML = `
      <div class="reader-placeholder">
        <p class="reader-label">阅读区</p>
        <h3>当前筛选下没有文章。</h3>
      </div>
    `;
    return;
  }

  const interaction = getInteraction(post.id);
  const commentItems = interaction.comments
    .slice()
    .sort((left, right) => right.createdAt - left.createdAt)
    .map((comment) => `
      <article class="comment-item">
        <div class="comment-head">
          <strong>${escapeHtml(comment.name)}</strong>
          <span>${new Intl.DateTimeFormat("zh-CN", {
            month: "long",
            day: "numeric",
            hour: "2-digit",
            minute: "2-digit"
          }).format(new Date(comment.createdAt))}</span>
        </div>
        <p>${escapeHtml(comment.content)}</p>
      </article>
    `)
    .join("");

  elements.readerPanel.innerHTML = `
    <div class="reader-cover">
      <img src="${post.cover}" alt="${post.title}">
    </div>
    <div class="reader-content">
      <p class="reader-label">阅读区</p>
      <div class="meta-row">
        <span>${formatDate(post.date)}</span>
        <span>${post.readingMinutes} 分钟</span>
      </div>
      <h3>${post.title}</h3>
      <div class="reader-stats">
        <span>阅读 ${interaction.views}</span>
        <button class="like-button ${interaction.liked ? "is-liked" : ""}" type="button" data-like-post="${post.id}">
          ${interaction.liked ? "已点赞" : "点赞"} · ${interaction.likes}
        </button>
        <span>评论 ${interaction.comments.length}</span>
      </div>
      <div class="tag-row">
        ${post.tags.map((tag) => `<button class="tag-chip ${state.activeTag === tag ? "active" : ""}" type="button" data-tag="${tag}">${tag}</button>`).join("")}
      </div>
      <div class="post-body">${markdownToHtml(post.content)}</div>
      <section class="comment-box" aria-label="评论区">
        <div class="comment-box-head">
          <h4>评论</h4>
          <span>${interaction.comments.length} 条</span>
        </div>
        <form class="comment-form" data-comment-form="${post.id}">
          <input name="name" type="text" maxlength="24" placeholder="昵称">
          <textarea name="content" rows="3" maxlength="280" placeholder="写下你的想法" required></textarea>
          <button class="primary-button" type="submit">发布评论</button>
        </form>
        <div class="comment-list">
          ${commentItems || `<p class="comment-empty">还没有评论，先留下一句吧。</p>`}
        </div>
      </section>
      <div class="reader-actions">
        <span class="reader-origin">${post.local ? "你刚刚发布的文章" : "示例文章"}</span>
        ${post.local ? `<button class="text-button" type="button" data-delete-post="${post.id}">删除</button>` : `<button class="text-button" type="button" data-open-post="${post.id}">保持选中</button>`}
      </div>
    </div>
  `;
}

function groupByMonth(posts) {
  return posts.reduce((groups, post) => {
    const key = post.date.slice(0, 7);
    if (!groups[key]) {
      groups[key] = [];
    }
    groups[key].push(post);
    return groups;
  }, {});
}

function renderArchive(posts) {
  const groups = groupByMonth(posts);
  const sortedKeys = Object.keys(groups).sort((a, b) => new Date(`${b}-01`) - new Date(`${a}-01`));

  elements.archiveList.innerHTML = sortedKeys.map((key) => `
    <section class="archive-group">
      <div class="archive-group-header">${formatArchiveMonth(`${key}-01`)}</div>
      ${groups[key].map((post) => `
        <div class="archive-item">
          <button type="button" data-open-post="${post.id}">${post.title}</button>
          <span>${post.date.slice(5).replace("-", "/")}</span>
        </div>
      `).join("")}
    </section>
  `).join("");
}

function renderRhythm(posts) {
  elements.rhythmList.innerHTML = posts.slice(0, 5).map((post) => `
    <div class="rhythm-item">
      <strong>${post.title}</strong>
      <span>${post.date.slice(5).replace("-", "/")}</span>
    </div>
  `).join("");
}

function renderAll() {
  const filteredPosts = getFilteredPosts();
  clampCurrentPage(filteredPosts);
  const pagedPosts = getPagedPosts(filteredPosts);
  ensureActivePost(filteredPosts);
  const activePost = filteredPosts.find((post) => post.id === state.activePostId);

  renderMetrics(state.posts);
  renderFeatured(filteredPosts[0]);
  renderHotTags(state.posts);
  renderIdeas();
  renderTagStrip(state.posts);
  renderPostGrid(pagedPosts);
  renderPostPager(filteredPosts);
  renderReader(activePost);
  renderArchive(state.posts);
  renderRhythm(state.posts);
}

function trackView(postId) {
  if (!postId || state.viewedInSession.has(postId)) {
    return;
  }

  const interaction = getInteraction(postId);
  interaction.views += 1;
  state.viewedInSession.add(postId);
  persistInteractions();
}

function scrollToReader() {
  const getDocumentTop = (element) => {
    let top = 0;
    let node = element;

    while (node) {
      top += node.offsetTop || 0;
      node = node.offsetParent;
    }

    return top;
  };

  requestAnimationFrame(() => {
    requestAnimationFrame(() => {
      window.scrollTo({
        top: Math.max(0, getDocumentTop(elements.readerPanel) - 24),
        behavior: "smooth"
      });
    });
  });
}

function setActivePost(postId) {
  state.activePostId = postId;
  setPageForPost(postId);
  trackView(postId);
  history.pushState(null, "", `#${postId}`);
  renderAll();
  scrollToReader();
}

function persistPosts() {
  const localPosts = state.posts.filter((post) => post.local);
  safeWriteJson(storageKey, localPosts);
}

function writeDraftStatus(text) {
  elements.draftStatus.textContent = text;
}

function readDraft() {
  return safeReadJson(draftKey, null);
}

function saveDraft() {
  const draft = {
    date: elements.postDate.value,
    title: elements.postTitle.value,
    tags: elements.postTags.value,
    cover: elements.postCover.value,
    excerpt: elements.postExcerpt.value,
    content: elements.postContent.value,
    savedAt: Date.now()
  };

  safeWriteJson(draftKey, draft);
  writeDraftStatus(`草稿已保存 · ${new Intl.DateTimeFormat("zh-CN", {
    hour: "2-digit",
    minute: "2-digit"
  }).format(new Date(draft.savedAt))}`);
}

function fillForm(data) {
  elements.postDate.value = data.date || todayIso();
  elements.postTitle.value = data.title || "";
  elements.postTags.value = data.tags || "";
  elements.postCover.value = data.cover || "";
  elements.postExcerpt.value = data.excerpt || "";
  elements.postContent.value = data.content || "";
}

function prefillTodayTemplate() {
  fillForm({
    date: todayIso(),
    title: "今天学到的一个前端细节",
    tags: "前端, 实战",
    cover: "",
    excerpt: "先用两三句话概括你今天最想记录的一个结论。",
    content: `## 背景

这个问题是在什么场景下出现的？

## 解决思路

- 先做了什么判断
- 为什么选择这个方案
- 有没有踩坑

## 代码片段

\`\`\`js
// 把今天最关键的一段代码贴在这里
\`\`\`

## 最后的结论

这件事最值得以后复用的经验是什么？`
  });
  saveDraft();
}

function clearDraft() {
  fillForm({
    date: todayIso(),
    title: "",
    tags: "",
    cover: "",
    excerpt: "",
    content: ""
  });
  safeWriteJson(draftKey, null);
  writeDraftStatus("草稿已清空");
}

function publishPost(event) {
  event.preventDefault();

  const post = normalizePost({
    id: `local-${Date.now()}`,
    title: elements.postTitle.value,
    date: elements.postDate.value,
    tags: elements.postTags.value,
    cover: elements.postCover.value || coverPool[state.posts.length % coverPool.length],
    excerpt: elements.postExcerpt.value,
    content: elements.postContent.value,
    local: true,
    createdAt: Date.now()
  }, state.posts.length);

  state.posts = sortPosts([post, ...state.posts]);
  persistPosts();
  safeWriteJson(draftKey, null);
  writeDraftStatus("已发布");
  elements.composeForm.reset();
  elements.postDate.value = todayIso();
  state.search = "";
  state.activeTag = "全部";
  state.currentPage = 1;
  elements.searchInput.value = "";
  setActivePost(post.id);
}

function deletePost(postId) {
  const target = state.posts.find((post) => post.id === postId);
  if (!target || !target.local) {
    return;
  }

  const confirmed = window.confirm(`确认删除《${target.title}》吗？`);
  if (!confirmed) {
    return;
  }

  state.posts = state.posts.filter((post) => post.id !== postId);
  persistPosts();
  state.activePostId = "";
  renderAll();
}

function toggleLike(postId) {
  const interaction = getInteraction(postId);
  interaction.liked = !interaction.liked;
  interaction.likes = Math.max(0, interaction.likes + (interaction.liked ? 1 : -1));
  persistInteractions();
  renderAll();
}

function publishComment(event) {
  event.preventDefault();

  const form = event.target;
  const postId = form.getAttribute("data-comment-form");
  const formData = new FormData(form);
  const content = String(formData.get("content") || "").trim();

  if (!postId || !content) {
    return;
  }

  const interaction = getInteraction(postId);
  interaction.comments.push({
    id: `comment-${Date.now()}`,
    name: String(formData.get("name") || "匿名读者").trim().slice(0, 24) || "匿名读者",
    content: content.slice(0, 280),
    createdAt: Date.now()
  });

  persistInteractions();
  renderAll();
}

function wireEvents() {
  document.addEventListener("click", (event) => {
    const tagButton = event.target.closest("[data-tag]");
    if (tagButton) {
      state.activeTag = tagButton.getAttribute("data-tag");
      state.currentPage = 1;
      renderAll();
      return;
    }

    const pageButton = event.target.closest("[data-page], [data-page-action]");
    if (pageButton) {
      const totalPages = getPageCount(getFilteredPosts());
      const page = pageButton.getAttribute("data-page");
      const action = pageButton.getAttribute("data-page-action");

      if (page) {
        state.currentPage = Number(page);
      } else if (action === "previous") {
        state.currentPage = Math.max(1, state.currentPage - 1);
      } else if (action === "next") {
        state.currentPage = Math.min(totalPages, state.currentPage + 1);
      }

      renderAll();
      return;
    }

    const postButton = event.target.closest("[data-open-post]");
    if (postButton) {
      setActivePost(postButton.getAttribute("data-open-post"));
      return;
    }

    const likeButton = event.target.closest("[data-like-post]");
    if (likeButton) {
      toggleLike(likeButton.getAttribute("data-like-post"));
      return;
    }

    const deleteButton = event.target.closest("[data-delete-post]");
    if (deleteButton) {
      deletePost(deleteButton.getAttribute("data-delete-post"));
    }
  });

  document.addEventListener("submit", (event) => {
    if (event.target.matches("[data-comment-form]")) {
      publishComment(event);
    }
  });

  elements.searchInput.addEventListener("input", (event) => {
    state.search = event.target.value.trim();
    state.currentPage = 1;
    renderAll();
  });

  elements.composeForm.addEventListener("submit", publishPost);

  [elements.postDate, elements.postTitle, elements.postTags, elements.postCover, elements.postExcerpt, elements.postContent]
    .forEach((field) => {
      field.addEventListener("input", saveDraft);
    });

  elements.prefillButton.addEventListener("click", prefillTodayTemplate);
  elements.clearButton.addEventListener("click", clearDraft);

  window.addEventListener("hashchange", () => {
    const postId = location.hash.replace("#", "");
    if (postId && state.posts.some((post) => post.id === postId)) {
      state.activePostId = postId;
      trackView(postId);
      renderAll();
    }
  });
}

function hydrateDraft() {
  const draft = readDraft();
  if (draft && typeof draft === "object") {
    fillForm(draft);
    if (draft.savedAt) {
      writeDraftStatus(`已恢复草稿 · ${new Intl.DateTimeFormat("zh-CN", {
        month: "numeric",
        day: "numeric",
        hour: "2-digit",
        minute: "2-digit"
      }).format(new Date(draft.savedAt))}`);
      return;
    }
  }

  elements.postDate.value = todayIso();
}

function init() {
  bootPosts();
  bootInteractions();
  hydrateDraft();
  const hashPostId = location.hash.replace("#", "");
  if (hashPostId && state.posts.some((post) => post.id === hashPostId)) {
    state.activePostId = hashPostId;
  } else if (state.posts.length) {
    state.activePostId = state.posts[0].id;
  }
  trackView(state.activePostId);
  renderAll();
  wireEvents();
}

init();
