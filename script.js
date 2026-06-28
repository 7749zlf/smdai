const storageKey = "stack-front-daily-posts";
const draftKey = "stack-front-draft";

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
  activePostId: ""
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
      <div class="tag-row">
        ${post.tags.map((tag) => `<button class="tag-chip ${state.activeTag === tag ? "active" : ""}" type="button" data-tag="${tag}">${tag}</button>`).join("")}
      </div>
      <div class="post-body">${markdownToHtml(post.content)}</div>
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
  ensureActivePost(filteredPosts);
  const activePost = filteredPosts.find((post) => post.id === state.activePostId);

  renderMetrics(state.posts);
  renderFeatured(filteredPosts[0]);
  renderHotTags(state.posts);
  renderIdeas();
  renderTagStrip(state.posts);
  renderPostGrid(filteredPosts);
  renderReader(activePost);
  renderArchive(state.posts);
  renderRhythm(state.posts);
}

function setActivePost(postId) {
  state.activePostId = postId;
  location.hash = postId;
  renderAll();
  const readerTop = elements.readerPanel.getBoundingClientRect().top + window.scrollY - 24;
  if (window.innerWidth < 1080) {
    window.scrollTo({ top: readerTop, behavior: "smooth" });
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

function wireEvents() {
  document.addEventListener("click", (event) => {
    const tagButton = event.target.closest("[data-tag]");
    if (tagButton) {
      state.activeTag = tagButton.getAttribute("data-tag");
      renderAll();
      return;
    }

    const postButton = event.target.closest("[data-open-post]");
    if (postButton) {
      setActivePost(postButton.getAttribute("data-open-post"));
      return;
    }

    const deleteButton = event.target.closest("[data-delete-post]");
    if (deleteButton) {
      deletePost(deleteButton.getAttribute("data-delete-post"));
    }
  });

  elements.searchInput.addEventListener("input", (event) => {
    state.search = event.target.value.trim();
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
  hydrateDraft();
  const hashPostId = location.hash.replace("#", "");
  if (hashPostId && state.posts.some((post) => post.id === hashPostId)) {
    state.activePostId = hashPostId;
  } else if (state.posts.length) {
    state.activePostId = state.posts[0].id;
  }
  renderAll();
  wireEvents();
}

init();
