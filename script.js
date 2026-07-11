const storageKey = "stack-front-daily-posts";
const draftKey = "stack-front-draft";
const interactionKey = "stack-front-interactions";
const defaultPostsPerPage = 4;

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
  "CSS Carousel 适合替换哪些轻量轮播和推荐位组件？"
];

const seedPosts = [
  {
    id: "2026-07-11-css-scope",
    title: "CSS @scope：把样式影响范围写清楚",
    date: "2026-07-11",
    createdAt: Date.parse("2026-07-11T10:00:00+08:00"),
    tags: ["CSS", "组件样式", "工程化"],
    cover: coverPool[1],
    excerpt: "@scope 让 CSS 可以声明一段规则只在指定根节点内生效。组件、文章内容和后台页面里那些怕串样式的选择器，可以少靠命名约定硬撑。",
    content: `
## 为什么值得关注

CSS 最强的地方是层叠，最容易失控的地方也是层叠。一个选择器写得太宽，可能影响到页面里远处的同名元素；一个组件搬到新区域，可能因为外层选择器不同而样式变形。

过去我们常用 BEM、CSS Modules、Shadow DOM 或更严格的命名规范来控制影响范围。这些方案都有效，但它们主要靠构建工具、封装边界或团队纪律。

\`@scope\` 提供的是原生 CSS 层面的边界声明：这组规则只在某个作用域根节点内匹配。它不会替你设计组件架构，但能让样式文件更明确地表达“这些规则属于哪里”。

## 最小写法

\`\`\`css
@scope (.profile-card) {
  :scope {
    border: 1px solid #d7dee8;
    border-radius: 16px;
    padding: 20px;
  }

  .title {
    font-size: 1.125rem;
    font-weight: 700;
  }
}
\`\`\`

这段规则只会影响 \`.profile-card\` 里面的 \`.title\`。页面其他地方即使也有 \`.title\`，不会被这段作用域规则命中。

\`:scope\` 指向当前作用域根，也就是 \`.profile-card\` 本身。它适合写组件容器的边框、间距、背景和布局规则。

## 作用域不是简单加前缀

很多人第一眼会把 \`@scope\` 理解成自动给选择器加前缀。它确实能解决一部分前缀问题，但更重要的是它引入了“接近度”这个判断。

当两个作用域规则都能匹配同一个元素时，离这个元素更近的作用域根会获胜。也就是说，CSS 不只看选择器特异性，还会考虑规则来自哪个更贴近的作用域。

\`\`\`css
@scope (.page) {
  .note { color: #475569; }
}

@scope (.editor-panel) {
  .note { color: #b45309; }
}
\`\`\`

如果 \`.note\` 同时位于 \`.page\` 和 \`.editor-panel\` 内，后者通常更接近，样式也更符合局部组件预期。

## 可以设置结束边界

\`@scope\` 还可以写一个上限和一个下限，表示规则从哪里开始，到哪里停止：

\`\`\`css
@scope (.article-body) to (.related-links) {
  a {
    color: #2563eb;
    text-decoration-thickness: 0.08em;
  }
}
\`\`\`

这个例子里，文章正文里的链接会被统一处理，但进入 \`.related-links\` 后规则停止生效。对 CMS 内容、富文本正文、文档页面和帮助中心很有价值：正文样式可以集中管理，周边组件不会被一起卷进去。

## 它适合放在哪些地方

我会优先在这些场景使用 \`@scope\`：

- 文章正文、Markdown 渲染区、CMS 富文本
- 后台页面里的局部业务模块
- 不想引入 Shadow DOM 的轻量组件
- 第三方片段周围的隔离样式
- 设计系统示例区和文档 demo

它不一定替代 CSS Modules 或组件库样式方案。更现实的方式是把它当成一层原生边界：工具负责组织文件，\`@scope\` 负责把浏览器可理解的作用域写出来。

## 和 CSS Layers 一起用

\`@layer\` 解决的是“这类规则的优先级属于哪一层”，\`@scope\` 解决的是“这组规则影响哪一块 DOM”。两者不是竞争关系。

\`\`\`css
@layer components {
  @scope (.settings-panel) {
    :scope { display: grid; gap: 16px; }
    .field { display: grid; gap: 6px; }
  }
}
\`\`\`

这样读代码时很清楚：它属于组件层，并且只作用在设置面板内部。大型样式表最需要的不是更多技巧，而是更多可读边界。

## 渐进增强

如果目标浏览器还不完全支持，可以先保留传统写法，再把新模块逐步迁进 \`@scope\`：

\`\`\`css
.profile-card .title {
  font-weight: 700;
}

@scope (.profile-card) {
  .title { font-weight: 700; }
}
\`\`\`

不支持 \`@scope\` 的浏览器会忽略这块 at-rule，继续使用前面的传统选择器。实际项目里不要为了用新语法而重复维护两套复杂规则，适合先从新模块、文档页或低风险页面试起。

## 最后一句

\`@scope\` 的价值，是让 CSS 里的“边界”从命名习惯变成语言能力。组件样式不应该只靠选择器越写越长来获得安全感；能把影响范围声明出来，维护成本就会低很多。`
  },
  {
    id: "2026-07-10-dialog-closedby",
    title: "dialog closedby：弹窗轻关闭终于能写在 HTML 里",
    date: "2026-07-10",
    createdAt: Date.parse("2026-07-10T10:00:00+08:00"),
    tags: ["HTML", "交互", "可访问性"],
    cover: coverPool[0],
    excerpt: "closedby 属性让 dialog 可以声明哪些用户动作能关闭弹窗：点遮罩、按 Esc、系统返回手势，或者只能点明确按钮。少写一层监听，也少一点边界状态。",
    content: `
## 为什么值得写它

弹窗最麻烦的地方，往往不是“怎么打开”，而是“怎么被关闭”。用户可能点关闭按钮，可能按 \`Esc\`，可能点遮罩，也可能在移动端用系统返回手势。过去这些行为经常被拆散在事件监听、状态变量和组件库配置里。

\`closedby\` 给原生 \`<dialog>\` 补上一个很直接的声明：这个弹窗允许哪些用户动作把它关掉。它不是替代业务确认逻辑，而是把常见关闭策略交还给 HTML。

## 最小写法

\`\`\`html
<button commandfor="settings" command="show-modal">
  打开设置
</button>

<dialog id="settings" closedby="any">
  <h2>设置</h2>
  <p>点击遮罩、按 Esc 或点按钮都可以关闭。</p>
  <button commandfor="settings" command="close">关闭</button>
</dialog>
\`\`\`

\`closedby="any"\` 表示三类关闭都允许：轻关闭、平台关闭和开发者指定关闭。轻关闭就是点击或触摸弹窗外部；平台关闭包括桌面端 \`Esc\`、移动端返回或关闭手势；开发者指定关闭则是按钮、表单或脚本调用。

## 三个值怎么选

\`\`\`html
<dialog closedby="any">...</dialog>
<dialog closedby="closerequest">...</dialog>
<dialog closedby="none">...</dialog>
\`\`\`

- \`any\`：适合轻量设置、预览、帮助说明、非破坏性确认
- \`closerequest\`：允许 \`Esc\` 或系统返回，但不允许点遮罩关闭
- \`none\`：只能通过明确按钮、表单或脚本关闭

如果没有写有效的 \`closedby\`，用 \`showModal()\` 打开的模态弹窗默认更接近 \`closerequest\`；非模态弹窗默认更接近 \`none\`。所以想要“点外面关闭”，最好明确写出 \`closedby="any"\`。

## 和 command 属性一起用更干净

之前打开和关闭 \`dialog\` 常常要写一小段 JavaScript：

\`\`\`js
openButton.addEventListener("click", () => dialog.showModal());
closeButton.addEventListener("click", () => dialog.close());
\`\`\`

现在很多简单弹窗可以变成纯声明式：

\`\`\`html
<button commandfor="confirm-delete" command="show-modal">
  删除项目
</button>

<dialog id="confirm-delete" closedby="closerequest">
  <p>这个操作不可撤销。</p>
  <button commandfor="confirm-delete" command="close">取消</button>
  <button data-action="delete">确认删除</button>
</dialog>
\`\`\`

这里我会选择 \`closerequest\`，而不是 \`any\`。危险操作不适合让用户误点遮罩就消失，但允许按 \`Esc\` 或系统返回取消，仍然符合很多人的操作预期。

## 表单弹窗也更顺手

\`<form method="dialog">\` 仍然是关闭原生弹窗的好搭档：

\`\`\`html
<dialog id="profile-editor" closedby="any">
  <form method="dialog">
    <label>
      昵称
      <input name="name" autofocus>
    </label>
    <button value="cancel">取消</button>
    <button value="save">保存</button>
  </form>
</dialog>
\`\`\`

用户点保存或取消时，表单会关闭弹窗；用户点外面时，也能因为 \`closedby="any"\` 关闭。你仍然可以读取 \`dialog.returnValue\` 判断用户点了哪个按钮。

## 可访问性上要注意什么

\`closedby\` 能减少很多关闭监听，但不代表可以省掉明确的关闭入口。弹窗里最好仍然有一个可聚焦、可读屏识别的关闭按钮，尤其是在移动端、辅助技术环境或复杂表单里。

另外，确认删除、支付、权限变更这类高风险弹窗，不建议使用 \`closedby="any"\`。轻关闭适合“退一步也没损失”的界面；关键决策仍然要给用户一个清楚的按钮。

## 最后一句

\`closedby\` 的价值不大张旗鼓，却很实用：把“这个弹窗应该怎么关”从零散脚本变成 HTML 语义。交互策略写在元素上，浏览器负责处理常见用户动作，组件代码就能少一点状态同步。`
  },
  {
    id: "2026-07-08-css-if-function",
    title: "CSS if()：把单个属性的条件判断写回样式表",
    date: "2026-07-08",
    createdAt: Date.parse("2026-07-08T10:00:00+08:00"),
    tags: ["CSS", "条件样式", "设计系统"],
    cover: coverPool[4],
    excerpt: "CSS if() 函数可以根据 style、media 或 supports 条件返回不同属性值。状态色、响应式间距和能力检测，不一定都要拆成整段 @media 或 JavaScript。",
    content: `
## 为什么它很有意思

CSS 以前当然能写条件：\`@media\`、\`@supports\`、容器查询都已经很成熟。但这些条件通常包住的是一整组规则。如果你只是想让一个属性值根据状态变化，就会显得有点重。

\`if()\` 函数把条件判断放进属性值里。它会按顺序检查一组条件，返回第一个命中的值，也可以提供 \`else\` 作为兜底。对组件来说，这很适合处理“只有一个值需要变”的场景。

## 基本语法

\`\`\`css
.card {
  padding: if(
    media(width < 720px): 12px;
    else: 24px;
  );
}
\`\`\`

这里的意思很直接：窄屏用 \`12px\`，其他情况用 \`24px\`。注意 \`if\` 和左括号之间不能有空格；每个条件和值之间用冒号，分支之间用分号。

## 和自定义属性配合

最顺手的用法，是把组件状态存在自定义属性里，再让 \`if()\` 根据状态返回不同值。

\`\`\`css
.notice {
  --tone: info;
  border-color: if(
    style(--tone: danger): #ef4444;
    style(--tone: success): #16a34a;
    else: #2563eb;
  );
}

.notice[data-tone="danger"] {
  --tone: danger;
}
\`\`\`

这样组件不需要为每个状态重复一整段选择器。状态 token 负责表达“当前是什么”，\`if()\` 负责把它翻译成具体视觉值。

## 它能判断三类条件

\`if()\` 目前主要接受三类测试：

- \`style()\`：检查自定义属性值，适合组件状态和主题 token
- \`media()\`：检查媒体条件，适合单个响应式值
- \`supports()\`：检查能力支持，适合新旧语法的值级切换

比如颜色可以这样渐进增强：

\`\`\`css
.badge {
  color: if(
    supports(color: oklch(70% 0.16 250)): oklch(70% 0.16 250);
    else: #2563eb;
  );
}
\`\`\`

如果浏览器支持 \`oklch()\`，就用更现代的颜色空间；否则退回十六进制颜色。

## 可以只控制值的一部分

\`if()\` 不一定要占据整个属性值，也可以放在简写属性的一部分里：

\`\`\`css
.panel {
  --emphasis: high;
  border: 1px solid if(
    style(--emphasis: high): #0f172a;
    else: #cbd5e1;
  );
}
\`\`\`

这类写法能减少很多“为了换一个颜色而复制整条 border”的代码。它不是替代 \`@media\` 或 \`@supports\`，而是补上值级条件判断这一层。

## 回退要写清楚

\`if()\` 还不是所有主流浏览器都可用，所以生产环境要先写稳定声明，再写增强声明。

\`\`\`css
.toolbar {
  gap: 16px;
  gap: if(
    media(width < 720px): 10px;
    else: 20px;
  );
}
\`\`\`

不支持 \`if()\` 的浏览器会忽略第二条声明，继续使用 \`16px\`。支持它的浏览器则会根据条件覆盖前面的值。

另外，实际使用时尽量写 \`else\`。如果没有任何条件命中，又没有兜底值，这个函数会返回无效值，最后可能让整条声明失效。

## 最后一句

\`if()\` 适合处理小而清楚的条件分叉：状态色、单个间距、某个阴影强度、一个边框颜色。真正需要改一组布局规则时，还是让 \`@media\`、\`@container\` 或 \`@supports\` 出场。好用的条件样式，不是把所有逻辑塞进一行，而是让每种工具站在合适的位置。`
  },
  {
    id: "2026-07-07-css-custom-functions",
    title: "CSS @function：把可复用计算留在原生样式里",
    date: "2026-07-07",
    createdAt: Date.parse("2026-07-07T10:00:00+08:00"),
    tags: ["CSS", "设计系统", "工程化"],
    cover: coverPool[3],
    excerpt: "CSS 自定义函数让样式表可以定义带参数和返回值的函数。 spacing、透明色、响应式尺寸这类 token 计算，终于不一定要交给预处理器了。",
    content: `
## 为什么值得关注

CSS 过去也能复用值：自定义属性、\`calc()\`、\`clamp()\`、\`color-mix()\` 已经覆盖了很多场景。但一旦计算规则需要参数，团队通常会把逻辑放到 Sass 函数、构建脚本或组件 JS 里。

\`@function\` 想补上的就是这块：在原生 CSS 里声明一个带参数、可返回值的自定义函数，然后在任意属性值里调用它。对设计系统来说，这意味着 spacing、颜色透明度、动画 shorthand、响应式尺寸这些规则可以更靠近最终样式。

## 最小写法

\`\`\`css
@function --space(--step <integer>: 1) returns <length> {
  result: calc(var(--step) * 4px);
}

.card {
  padding: --space(6);
  gap: --space(3);
}
\`\`\`

函数名需要以 \`--\` 开头，参数也按自定义属性的形式声明。函数体里用 \`result\` 返回最终值，调用时像普通 CSS 函数一样写。

这个例子里，设计系统只暴露“步进值”，而不是让每个组件自己写 \`calc(6 * 4px)\`。规则变了，只改函数。

## 参数可以有类型和默认值

\`@function\` 的一个重点是类型约束。你可以告诉浏览器某个参数应该是 \`<color>\`、\`<number>\`、\`<length>\`，也可以指定返回值类型。

\`\`\`css
@function --surface-alpha(
  --color <color>,
  --alpha <number>: 0.88
) returns <color> {
  result: oklch(from var(--color) l c h / var(--alpha));
}

.panel {
  background: --surface-alpha(#2563eb, 0.12);
}
\`\`\`

这类写法比到处复制相对颜色语法更清楚：组件关心的是“我要某个主题色的半透明表面”，具体怎么算留给函数。

## 它和自定义属性不是替代关系

自定义属性更像数据，\`@function\` 更像规则。比较舒服的组合是：token 放在变量里，规则放在函数里。

\`\`\`css
:root {
  --space-base: 4px;
  --radius-base: 8px;
}

@function --radius(--level <integer>: 1) returns <length> {
  result: calc(var(--radius-base) + var(--level) * 2px);
}

.dialog {
  border-radius: --radius(4);
}
\`\`\`

这样组件仍然读得到全局 token，但不会把计算过程散落到每个选择器里。

## 可以承载条件逻辑

函数体里可以写更复杂的逻辑，比如根据媒体条件返回不同结果：

\`\`\`css
@function --compact-or-roomy(--compact, --roomy) {
  result: var(--roomy);

  @media (width < 720px) {
    result: var(--compact);
  }
}

.toolbar {
  padding-inline: --compact-or-roomy(12px, 24px);
}
\`\`\`

注意它不是 JavaScript 函数，没有“提前 return”的心智模型。CSS 仍然按层叠和顺序处理，后面的 \`result\` 会覆盖前面的结果。

## 渐进增强怎么写

目前 \`@function\` 还属于需要谨慎试用的新能力。生产里更适合先写稳定回退，再检测支持：

\`\`\`css
.card {
  padding: 24px;
  border-radius: 16px;
}

@supports at-rule(@function) {
  @function --space(--step <integer>: 1) returns <length> {
    result: calc(var(--step) * 4px);
  }

  .card {
    padding: --space(6);
  }
}
\`\`\`

如果浏览器不认识 \`@function\`，它仍然会使用前面的普通 CSS。新浏览器则获得更集中、更可维护的计算规则。

## 最后一句

\`@function\` 最吸引我的地方，不是让 CSS 变成另一种编程语言，而是让设计系统里那些重复的“小计算”有了原生落点。变量负责表达值，函数负责表达规则，组件就能少带一点历史包袱。`
  },
  {
    id: "2026-07-06-css-corner-shape",
    title: "corner-shape：圆角不只能是圆的",
    date: "2026-07-06",
    createdAt: Date.parse("2026-07-06T11:00:00+08:00"),
    tags: ["CSS", "UI", "设计系统"],
    cover: coverPool[2],
    excerpt: "corner-shape 建立在 border-radius 之上，可以把圆角变成 squircle、notch、scoop 或 bevel。卡片和按钮终于不用靠 SVG 蒙版做特殊角了。",
    content: `
## 为什么值得写它

\`border-radius\` 很好用，但它只回答一个问题：角有多圆。真实设计系统里，角的气质往往不止“圆或不圆”：有些产品喜欢更柔和的 squircle，有些卡片想要内凹的 scoop，有些按钮需要切角 bevel，有些标签想做 notch。

过去这些效果经常要靠 SVG、mask、伪元素或者图片资源来补。Chrome 139 开始支持的 \`corner-shape\`，让我们可以在已有 \`border-radius\` 的基础上，继续指定角的几何形状。

## 最小写法

\`\`\`css
.card {
  border-radius: 24px;
  corner-shape: squircle;
}
\`\`\`

这段代码里，\`border-radius\` 仍然决定角的尺寸，\`corner-shape\` 决定角的形态。没有非零的 \`border-radius\`，\`corner-shape\` 不会产生效果。

几个常见值很直观：

- \`round\`：默认圆角
- \`squircle\`：介于方和圆之间的柔和角
- \`bevel\`：切角
- \`scoop\`：内凹弧形
- \`notch\`：内切缺口
- \`square\`：即使有半径也保持直角

## 单独控制每个角

\`corner-shape\` 和 \`border-radius\` 类似，可以写一到四个值：

\`\`\`css
.ticket {
  border-radius: 20px;
  corner-shape: scoop notch squircle bevel;
}
\`\`\`

也可以使用长属性单独控制：

\`\`\`css
.callout {
  border-radius: 18px;
  corner-top-left-shape: notch;
  corner-bottom-right-shape: scoop;
}
\`\`\`

这对状态卡片、票券、提示框和品牌化按钮很有用。不同角可以承担不同语义，比如“可拖拽”“高优先级”“折角标记”。

## 为什么它比蒙版更舒服

使用 \`corner-shape\` 时，背景、边框、阴影、outline、overflow 等效果会跟随角形状。也就是说，它仍然属于盒模型的一部分，而不是在盒子外面贴一层遮罩。

\`\`\`css
.panel {
  border: 1px solid #d7dee8;
  border-radius: 28px;
  corner-shape: scoop;
  box-shadow: 0 18px 48px rgb(15 23 42 / 14%);
}
\`\`\`

这比 SVG mask 更容易维护，也更容易和主题色、hover、focus-visible 等状态一起工作。

## 设计系统里怎么用

我会把它当成“角形 token”的一部分，而不是到处随手写：

\`\`\`css
:root {
  --shape-soft: squircle;
  --shape-action: bevel;
  --shape-note: scoop;
}

.button {
  border-radius: 12px;
  corner-shape: var(--shape-action);
}
\`\`\`

这样团队讨论的就不是“这个角要不要用某个 mask 文件”，而是“这个组件应该用哪种角形语义”。

## 渐进增强

因为支持还需要看目标浏览器，先写普通圆角，再增强：

\`\`\`css
.card {
  border-radius: 24px;
}

@supports (corner-shape: squircle) {
  .card {
    corner-shape: squircle;
  }
}
\`\`\`

旧浏览器看到稳定圆角，新浏览器得到更有品牌感的角形。

## 兼容性提醒

现阶段更适合把 \`corner-shape\` 用在装饰性增强上：卡片、徽章、提示框、营销位都可以先试；强依赖形状表达状态的关键控件，仍然要确保普通圆角版本也能清楚传达信息。

## 最后一句

\`corner-shape\` 的意义不是让每个盒子都变花，而是把“角的风格”变成 CSS 可以直接表达的设计语言。少一个蒙版资源，少一段伪元素补丁，UI 组件就更接近原生盒模型。`
  },
  {
    id: "2026-07-06-css-text-box",
    title: "CSS text-box：终于不用再靠魔法数垂直居中文字",
    date: "2026-07-06",
    createdAt: Date.parse("2026-07-06T10:00:00+08:00"),
    tags: ["CSS", "排版", "设计系统"],
    cover: coverPool[1],
    excerpt: "text-box、text-box-trim 和 text-box-edge 可以裁掉字体上下多余的 leading，让按钮、标签和标题的视觉居中更接近设计稿。",
    content: `
## 为什么文字总是看起来“不居中”

很多前端都遇到过一个小别扭：按钮明明用了 \`align-items: center\`，文字看起来还是偏上或偏下。原因不一定是布局错了，而是字体本身带有上下留白，也就是 line box 里的 leading。

过去我们常用一些不太优雅的办法修：调 \`line-height\`、给文字加一点 \`transform\`、单独为中文和英文写不同 padding，或者在设计系统里藏几个经验值。

\`text-box\` 这组属性想解决的正是这个问题：让 CSS 可以明确裁掉文本框上下多余空间，让视觉对齐更接近字形本身。

## 最小写法

\`\`\`css
.chip {
  display: inline-flex;
  align-items: center;
  min-block-size: 32px;
  padding-inline: 12px;
  text-box: trim-both cap alphabetic;
}
\`\`\`

\`text-box\` 是一个简写，可以同时控制裁剪方向和参考边缘。你也可以拆开写：

\`\`\`css
.chip {
  text-box-trim: trim-both;
  text-box-edge: cap alphabetic;
}
\`\`\`

这类写法对按钮、徽标、导航标签尤其有用。它不是改变字体本身，而是让布局时参与对齐的文本框更贴近真实可见字形。

## 它最适合哪些地方

我会优先在这些组件里试：

- 小按钮和图标按钮里的文字
- 标签、徽章、状态 pill
- 大标题和图片边缘的精确对齐
- 表格单元格里的紧凑文本
- 设计系统里的 typography token

它的价值不是让所有文字都变紧，而是减少那些“看起来差 1 到 2 像素”的手工补丁。

## 和 line-height 的关系

\`line-height\` 仍然重要，它控制多行文本的节奏和阅读舒适度。\`text-box\` 更像是对单行或关键排版场景的精细修正。

我的经验是：

- 正文段落不要轻易裁得太狠
- UI 控件里的单行文本更适合使用
- 大标题可以小范围试，尤其是和图片、边框对齐时
- 多语言项目要测试中文、英文、数字和符号混排

## 渐进增强

\`\`\`css
.badge {
  display: inline-flex;
  align-items: center;
  min-block-size: 28px;
  padding-inline: 10px;
}

@supports (text-box-trim: trim-both) {
  .badge {
    text-box: trim-both cap alphabetic;
  }
}
\`\`\`

旧浏览器仍然使用传统居中，新浏览器得到更精准的视觉对齐。

## 最后一句

\`text-box\` 解决的是一个长期存在但很难说清的小痛点：不是布局没居中，而是文字盒子本身不等于可见字形。把这个能力交给 CSS，比继续在组件里堆魔法数要稳得多。`
  },
  {
    id: "2026-07-06-scroll-triggered-animations",
    title: "Scroll-triggered Animations：滚到位置再触发动画",
    date: "2026-07-06",
    createdAt: Date.parse("2026-07-06T09:00:00+08:00"),
    tags: ["CSS", "动画", "滚动"],
    cover: coverPool[4],
    excerpt: "Scroll-driven animation 让动画进度跟随滚动，scroll-triggered animation 则更像“滚到某个位置后播放一次”。两者解决的是不同交互。",
    content: `
## 先分清两个概念

滚动动画已经有一条很清晰的路线：scroll-driven animations 让动画进度跟着滚动位置走。你滚到一半，动画也走到一半；往回滚，动画也倒回去。

但很多产品页面想要的不是这种进度绑定，而是“滚到这里以后触发一次动画”：卡片淡入、数字开始跳动、步骤线逐段出现。Chrome 团队把这类能力称为 scroll-triggered animations，并计划在 2026 年继续推进。

简单说：

- scroll-driven：滚动控制动画进度
- scroll-triggered：跨过某个滚动位置后触发动画

## 过去我们怎么做

最常见方案是 IntersectionObserver：

\`\`\`js
const observer = new IntersectionObserver((entries) => {
  entries.forEach((entry) => {
    if (entry.isIntersecting) {
      entry.target.classList.add("is-visible");
    }
  });
});

document.querySelectorAll(".reveal").forEach((item) => observer.observe(item));
\`\`\`

这套方案很成熟，但每个项目都要重复写一遍：观察元素、加 class、取消观察、处理阈值和一次性触发。

scroll-triggered animations 的方向，是把这类“滚过阈值后播放动画”的常见模式放进平台能力里。

## 它适合的交互

我会把它用在这些地方：

- 首屏之后的内容淡入
- 时间线节点进入视口后播放
- 数据卡片滚到可见区域后强调
- 长文里的章节插图轻微进入
- 产品介绍页的步骤动画

这些动画通常不需要和滚动进度一一绑定，只需要在合适时机开始。

## 设计上要克制

滚动触发动画很容易过量。页面每滚一屏都有一堆元素飞进来，用户很快会累。

我会遵守几个规则：

- 动画只服务信息层级，不把每个元素都做成特效
- 延迟要短，尽量不阻挡阅读
- 关键内容不要依赖动画结束才可见
- 尊重 \`prefers-reduced-motion\`

\`\`\`css
@media (prefers-reduced-motion: reduce) {
  .reveal {
    animation: none;
    opacity: 1;
    transform: none;
  }
}
\`\`\`

## 和现有能力怎么配合

在 scroll-triggered animations 完全稳定之前，IntersectionObserver 仍然是生产里的可靠选择。已经能用 CSS scroll-driven animations 的地方，也不需要硬换。

我的判断是：

- 进度条、视差、阅读进度，用 scroll-driven
- 进入视口后播放一次，用 scroll-triggered
- 需要复杂业务判断，用 JavaScript
- 低风险视觉增强，优先渐进增强

## 最后一句

滚动动画不应该只有“滚动绑定进度”这一种模型。很多时候我们只是想让内容在合适的时机开始出现。scroll-triggered animations 如果进入稳定阶段，会让这类页面少写一大段观察和状态同步代码。`
  },
  {
    id: "2026-07-05-css-reading-flow",
    title: "reading-flow：让视觉顺序和键盘顺序重新对齐",
    date: "2026-07-05",
    createdAt: Date.parse("2026-07-05T10:00:00+08:00"),
    tags: ["CSS", "可访问性", "布局"],
    cover: coverPool[3],
    excerpt: "Flex 和 Grid 很容易把视觉顺序排得很漂亮，却让键盘 Tab 顺序还停在 DOM 顺序里。reading-flow 和 reading-order 正是为这个断层补位。",
    content: `
## 为什么这个问题值得单独记

现代布局很自由。我们可以用 Grid 把卡片放到任意区域，也可以用 Flex 的 \`order\` 或 \`row-reverse\` 调整视觉顺序。问题是，视觉顺序变了以后，键盘 Tab 顺序、辅助技术读取顺序往往仍然跟着 DOM 走。

这就会出现一个很别扭的体验：用户看到焦点应该从左到右、从上到下移动，但实际按 Tab 时，焦点突然跳到另一个区域。页面越像仪表盘、卡片墙、编辑器面板，这种断层越明显。

\`reading-flow\` 和 \`reading-order\` 的目标，就是让 CSS 能明确表达“这个布局的线性阅读顺序应该怎么走”。

## Flex 里的基础写法

假设视觉上用了反向排列：

\`\`\`css
.toolbar {
  display: flex;
  flex-direction: row-reverse;
  reading-flow: flex-visual;
}
\`\`\`

\`reading-flow: flex-visual\` 表达的是：顺序跟着视觉结果走。这样用户看到的顺序和键盘导航顺序更接近，不会因为 DOM 原始顺序而突然跳动。

如果你更希望顺序跟着 flex 布局流，而不是最终视觉位置，也可以考虑 \`flex-flow\`。关键是别让浏览器和维护者猜。

## Grid 里的常见场景

Grid 更容易出现问题，因为一个元素可以被放到任意行列：

\`\`\`css
.dashboard {
  display: grid;
  grid-template-columns: 2fr 1fr;
  gap: 16px;
  reading-flow: grid-rows;
}
\`\`\`

\`grid-rows\` 更适合多数从上到下阅读的内容区。如果你的界面更像列式面板，也可以考虑 \`grid-columns\`。

这类属性的价值，不是让你随便打乱 DOM，而是在视觉布局确实需要重排时，给键盘和辅助技术一个更合理的线性顺序。

## 手动指定顺序

当自动规则还不够时，可以使用 \`reading-order\`：

\`\`\`css
.layout {
  reading-flow: source-order;
}

.summary {
  reading-order: 1;
}

.details {
  reading-order: 2;
}

.actions {
  reading-order: 3;
}
\`\`\`

这很适合仪表盘、复杂表单和编辑器工具区。你可以保留结构清晰的 HTML，同时把实际交互顺序声明出来。

## 它不是重排 DOM 的借口

我的原则是：能用合理 DOM 顺序解决，就先用 DOM。CSS 阅读顺序应该是补充，不是把混乱结构藏起来。

更稳的使用边界：

- 内容本身有明确阅读顺序时，优先让 DOM 和视觉一致
- 复杂 Grid 或 Flex 重排后，再用 \`reading-flow\` 校正导航顺序
- 交互控件多的区域一定要实际按 Tab 测一遍
- 不要为了视觉炫技制造新的可访问性负担

## 渐进增强

旧浏览器不支持时，页面仍然会按 DOM 顺序工作。所以落地前最重要的是保证 DOM 顺序本身不离谱，然后再增强：

\`\`\`css
@supports (reading-flow: grid-rows) {
  .dashboard {
    reading-flow: grid-rows;
  }
}
\`\`\`

## 最后一句

\`reading-flow\` 解决的不是“布局怎么摆”，而是“用户怎么走过这个布局”。当前端开始认真处理键盘路径和辅助技术路径，页面才不只是看起来有秩序，而是真的可用。`
  },
  {
    id: "2026-07-05-css-sibling-functions",
    title: "sibling-index()：纯 CSS 做动态错峰动画",
    date: "2026-07-05",
    createdAt: Date.parse("2026-07-05T09:00:00+08:00"),
    tags: ["CSS", "动画", "组件"],
    cover: coverPool[4],
    excerpt: "sibling-index() 和 sibling-count() 能让 CSS 知道元素在兄弟节点里的位置和总数。列表错峰动画、分布式延迟和动态装饰可以少写一层 JS。",
    content: `
## 为什么它很顺手

列表动画经常需要“第几个元素延迟多少毫秒”。过去常见做法是给每个子项写 \`style="--i: 3"\`，或者由 JS 遍历节点加索引。能用，但总有一点像为了样式效果额外搬状态。

\`sibling-index()\` 和 \`sibling-count()\` 把这件事留给 CSS：浏览器本来就知道一个元素是第几个兄弟，也知道兄弟总数，现在这些数字可以直接参与计算。

## 最常见的错峰动画

\`\`\`css
.menu[open] > * {
  opacity: 0;
  transform: translateY(8px);
  animation: item-in 0.36s ease forwards;
  animation-delay: calc(sibling-index() * 48ms);
}

@keyframes item-in {
  to {
    opacity: 1;
    transform: translateY(0);
  }
}
\`\`\`

这段代码不需要手动维护 \`--index\`。菜单里有 3 项就是 3 项的节奏，有 8 项就是 8 项的节奏。

## 用总数做分布

\`sibling-count()\` 适合处理“根据总数均匀分布”的场景，比如一组装饰点、评分星星、步骤条：

\`\`\`css
.step {
  --progress: calc(sibling-index() / sibling-count());
  opacity: calc(0.4 + var(--progress) * 0.6);
}
\`\`\`

它不是只能做动画，也能参与透明度、偏移、旋转、颜色混合等计算。只要这个样式和“当前元素在一组元素里的位置”有关，就可以考虑它。

## 组件里最有价值

我最想把它放进这些组件：

- 弹窗内容逐项进入
- 下拉菜单错峰显示
- 卡片墙轻微错位
- 时间线节点渐进出现
- 标签云按位置调整轻重

这些地方以前常常要在模板层生成索引。现在如果只是视觉表现，CSS 自己就能完成。

## 注意节奏别过量

错峰动画很容易写得太“演”。尤其是操作型界面，延迟太长会让用户觉得反应慢。我的经验是：

- 单项延迟控制在 30ms 到 60ms 左右
- 总延迟不要随着项目数无限增长
- 重要操作按钮不要被过长动画挡住
- 尊重 \`prefers-reduced-motion\`

\`\`\`css
@media (prefers-reduced-motion: reduce) {
  .menu[open] > * {
    animation: none;
    opacity: 1;
    transform: none;
  }
}
\`\`\`

## 渐进增强

目前这仍然属于新能力，最好给一个无索引的默认体验：

\`\`\`css
.menu[open] > * {
  animation: item-in 0.36s ease forwards;
}

@supports (animation-delay: calc(sibling-index() * 1ms)) {
  .menu[open] > * {
    animation-delay: calc(sibling-index() * 48ms);
  }
}
\`\`\`

旧浏览器看到的是统一动画，新浏览器得到更细腻的节奏。

## 最后一句

\`sibling-index()\` 最让我喜欢的地方，是它把“第几个元素”这个纯结构信息交给 CSS 使用。为了动画而给 DOM 塞索引的情况会少一些，组件模板也能更干净。`
  },
  {
    id: "2026-07-04-css-shape-function",
    title: "CSS shape()：把不规则图形写进样式里",
    date: "2026-07-04",
    createdAt: Date.parse("2026-07-04T10:00:00+08:00"),
    tags: ["CSS", "图形", "布局"],
    cover: coverPool[1],
    excerpt: "CSS shape() 让 clip-path、shape-outside 这类图形能力更接近真实设计稿。不规则裁切、文字绕排和装饰形状，可以少依赖 SVG 和额外资源。",
    content: `
## 为什么值得关注

网页布局长期以来默认是矩形思维：盒子、卡片、图片、按钮，大多都沿着直角边界排布。可真实设计里经常有波浪、斜切、气泡、弧形边缘和不规则图片裁切。过去要实现这些效果，常见做法是准备 SVG、图片蒙版，或者写一串很难读的 \`path()\`。

\`shape()\` 的价值，是让 CSS 可以用更接近 CSS 语法的方式描述几何路径。它能和 \`clip-path\`、\`shape-outside\` 等属性配合，让“不规则图形”不再一定要跑到外部资源里。

## 一个基础例子

\`\`\`css
.cover {
  clip-path: shape(
    from 0 12%,
    curve to 100% 0 with 42% 0,
    line to 100% 100%,
    line to 0 100%,
    close
  );
}
\`\`\`

这段代码描述的是一个顶部带弧线的裁切区域。相比把一整段 SVG path 字符串塞进 CSS，\`shape()\` 的语义更容易读：从哪里开始、怎么弯、连到哪里、最后闭合。

## 和文字绕排一起用

\`shape-outside\` 是另一个很适合搭配的地方。比如让正文沿着图片的波浪边绕排：

\`\`\`css
.float-art {
  float: left;
  inline-size: 260px;
  aspect-ratio: 1;
  shape-outside: shape(
    from 0 0,
    curve to 100% 20% with 70% 0,
    curve to 85% 100% with 120% 70%,
    line to 0 100%,
    close
  );
}
\`\`\`

这种效果以前经常需要设计和工程之间反复对齐资源。现在如果形状只是布局表达，CSS 自己就能承接一部分。

## 它适合哪些场景

我会优先在这些地方试：

- 营销页的图片裁切
- 文章封面的波浪边缘
- 头像或徽章的特殊轮廓
- 图文混排里的文字绕排
- 设计系统里的轻量装饰形状

不太适合的场景是复杂插画。复杂图形还是交给 SVG 更稳，尤其当路径很多、需要复用、需要独立编辑时。

## 渐进增强思路

新图形能力最好先写一个保底样式：

\`\`\`css
.cover {
  border-radius: 16px;
}

@supports (clip-path: shape(from 0 0, line to 100% 0, close)) {
  .cover {
    border-radius: 0;
    clip-path: shape(
      from 0 12%,
      curve to 100% 0 with 42% 0,
      line to 100% 100%,
      line to 0 100%,
      close
    );
  }
}
\`\`\`

旧浏览器看到的是规整圆角，新浏览器得到更接近设计稿的形状。

## 最后一句

\`shape()\` 不是为了替代 SVG，而是把一类“本来就是样式表达”的几何形状留在 CSS 里。能少引入一张资源，就少一层维护和加载成本。`
  },
  {
    id: "2026-07-04-advanced-css-attr",
    title: "增强版 attr()：HTML 属性终于能参与更多样式计算",
    date: "2026-07-04",
    createdAt: Date.parse("2026-07-04T09:00:00+08:00"),
    tags: ["CSS", "HTML", "组件"],
    cover: coverPool[0],
    excerpt: "Chrome 133 升级了 CSS attr()：不再只能用于 content，也不再只能当字符串。组件可以把 data-* 属性更自然地映射进样式。",
    content: `
## 老版 attr() 的限制

\`attr()\` 很早就存在，但以前最常见的用法几乎只有一种：在伪元素的 \`content\` 里读 HTML 属性。

\`\`\`css
button::after {
  content: attr(data-count);
}
\`\`\`

这当然有用，但范围太窄。真实组件里，我们更常想把属性值用于颜色、尺寸、间距、进度、层级，而不只是展示一段文本。

Chrome 133 开始支持增强版 \`attr()\`，它可以用于更多 CSS 属性，也可以把属性解析成指定类型。

## 读取颜色

\`\`\`html
<article class="note" data-accent="#2563eb">
  ...
</article>
\`\`\`

\`\`\`css
.note {
  border-color: attr(data-accent type(<color>), #64748b);
}
\`\`\`

这里的 \`type(<color>)\` 告诉浏览器：把 \`data-accent\` 按颜色解析。如果属性不存在或解析失败，就用后面的兜底值。

## 读取数字和尺寸

评分、进度、强调程度这类数据，也可以更自然地从 HTML 映射到样式：

\`\`\`html
<div class="meter" data-value="72"></div>
\`\`\`

\`\`\`css
.meter {
  --value: attr(data-value type(<number>), 0);
  inline-size: calc(var(--value) * 1%);
}
\`\`\`

这让简单组件少了一些“为了样式同步而写的 JS”。HTML 负责表达状态，CSS 负责消费状态。

## 它和 CSS 变量怎么分工

\`attr()\` 和 \`var()\` 不是竞争关系。

- \`attr()\` 适合从 HTML 属性读取组件实例数据
- \`var()\` 适合在 CSS 层级里传递设计令牌和可覆盖值
- 两者可以组合：先用 \`attr()\` 读入，再赋给自定义属性

\`\`\`css
.badge {
  --tone: attr(data-tone type(<custom-ident>), info);
}
\`\`\`

这类写法让组件 API 更贴近 HTML：一个 \`data-tone\` 属性就能影响样式，不一定非要额外生成 class。

## 使用时要谨慎的点

我会注意几个边界：

- 外部输入的属性值不要直接控制高风险样式
- 一定给兜底值
- 不要把复杂业务状态全塞进 \`data-*\`
- 需要跨浏览器稳定时，用 \`@supports\` 包一层增强

例如：

\`\`\`css
.note {
  border-color: #64748b;
}

@supports (color: attr(data-color type(<color>), red)) {
  .note {
    border-color: attr(data-accent type(<color>), #64748b);
  }
}
\`\`\`

## 最后一句

增强版 \`attr()\` 让 HTML 属性和 CSS 样式之间多了一条原生通道。它最适合处理组件级的小状态：颜色、进度、密度、强调程度。少一点同步 class，组件就更像一个自描述的 HTML 片段。`
  },
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
  postListPanel: document.querySelector(".post-list-panel"),
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
  postsPerPage: defaultPostsPerPage,
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

function ensureActivePostInPage(pagedPosts) {
  if (!pagedPosts.length) {
    return;
  }

  const exists = pagedPosts.some((post) => post.id === state.activePostId);
  if (!exists) {
    state.activePostId = pagedPosts[0].id;
  }
}

function getPageCount(posts) {
  return Math.max(1, Math.ceil(posts.length / state.postsPerPage));
}

function clampCurrentPage(posts) {
  state.currentPage = Math.min(Math.max(1, state.currentPage), getPageCount(posts));
}

function getPagedPosts(posts) {
  clampCurrentPage(posts);
  const start = (state.currentPage - 1) * state.postsPerPage;
  return posts.slice(start, start + state.postsPerPage);
}

function setPageForPost(postId, posts = getFilteredPosts()) {
  const index = posts.findIndex((post) => post.id === postId);
  if (index >= 0) {
    state.currentPage = Math.floor(index / state.postsPerPage) + 1;
  }
}

function getGridColumnCount() {
  if (!elements.postGrid) {
    return 1;
  }

  const columns = getComputedStyle(elements.postGrid).gridTemplateColumns;
  return Math.max(1, columns.split(" ").filter(Boolean).length);
}

function estimatePostsPerPage() {
  if (!elements.postListPanel || !elements.postGrid || window.innerWidth <= 1080) {
    return defaultPostsPerPage;
  }

  const panelHeight = Number.parseFloat(getComputedStyle(elements.postListPanel).getPropertyValue("--post-list-height"));
  if (!Number.isFinite(panelHeight) || panelHeight <= 0) {
    return defaultPostsPerPage;
  }

  const sampleCard = elements.postGrid.querySelector(".post-card");
  if (!sampleCard) {
    return defaultPostsPerPage;
  }

  const gridStyle = getComputedStyle(elements.postGrid);
  const panelStyle = getComputedStyle(elements.postListPanel);
  const hasPager = Boolean(elements.postPager?.textContent.trim());
  const pagerHeight = hasPager ? elements.postPager.offsetHeight : 0;
  const rowGap = Number.parseFloat(gridStyle.rowGap || gridStyle.gap) || 0;
  const panelGap = hasPager ? Number.parseFloat(panelStyle.rowGap || panelStyle.gap) || 0 : 0;
  const availableHeight = Math.max(0, panelHeight - pagerHeight - panelGap);
  const cardHeight = sampleCard.getBoundingClientRect().height;

  if (!cardHeight) {
    return defaultPostsPerPage;
  }

  const rows = Math.max(1, Math.floor((availableHeight + rowGap) / (cardHeight + rowGap)));
  return Math.max(defaultPostsPerPage, rows * getGridColumnCount());
}

function updatePostsPerPage() {
  const nextPostsPerPage = estimatePostsPerPage();
  if (nextPostsPerPage !== state.postsPerPage) {
    const activePostId = state.activePostId;
    state.postsPerPage = nextPostsPerPage;
    setPageForPost(activePostId);
    return true;
  }

  return false;
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

function syncPostListHeight() {
  if (!elements.postListPanel || !elements.readerPanel) {
    return;
  }

  if (window.innerWidth <= 1080) {
    elements.postListPanel.style.removeProperty("--post-list-height");
    return;
  }

  requestAnimationFrame(() => {
    const readerHeight = Math.ceil(elements.readerPanel.getBoundingClientRect().height);
    elements.postListPanel.style.setProperty("--post-list-height", `${Math.max(540, readerHeight)}px`);
  });
}

function refreshPaginationSize() {
  syncPostListHeight();
  requestAnimationFrame(() => {
    if (updatePostsPerPage()) {
      renderAll();
    }
  });
}

function syncPostListHeightAfterReaderMediaLoad() {
  elements.readerPanel.querySelectorAll("img").forEach((image) => {
    if (!image.complete) {
      image.addEventListener("load", refreshPaginationSize, { once: true });
      image.addEventListener("error", refreshPaginationSize, { once: true });
    }
  });
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
  ensureActivePost(filteredPosts);
  clampCurrentPage(filteredPosts);
  let pagedPosts = getPagedPosts(filteredPosts);
  ensureActivePostInPage(pagedPosts);
  let activePost = filteredPosts.find((post) => post.id === state.activePostId);

  renderMetrics(state.posts);
  renderFeatured(filteredPosts[0]);
  renderHotTags(state.posts);
  renderIdeas();
  renderTagStrip(state.posts);
  renderPostGrid(pagedPosts);
  renderPostPager(filteredPosts);
  renderReader(activePost);
  syncPostListHeight();
  syncPostListHeightAfterReaderMediaLoad();

  requestAnimationFrame(() => {
    if (updatePostsPerPage()) {
      pagedPosts = getPagedPosts(filteredPosts);
      ensureActivePostInPage(pagedPosts);
      activePost = filteredPosts.find((post) => post.id === state.activePostId);
      renderPostGrid(pagedPosts);
      renderPostPager(filteredPosts);
      renderReader(activePost);
      syncPostListHeight();
      syncPostListHeightAfterReaderMediaLoad();
      syncHashToActivePost();
    }
  });

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

function syncHashToActivePost() {
  if (state.activePostId && location.hash.replace("#", "") !== state.activePostId) {
    history.pushState(null, "", `#${state.activePostId}`);
  }
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
      syncHashToActivePost();
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
      syncHashToActivePost();
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
    syncHashToActivePost();
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
      setPageForPost(postId);
      trackView(postId);
      renderAll();
    }
  });

  window.addEventListener("resize", refreshPaginationSize);
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
    setPageForPost(hashPostId);
  } else if (state.posts.length) {
    state.activePostId = state.posts[0].id;
  }
  trackView(state.activePostId);
  renderAll();
  wireEvents();
}

init();
