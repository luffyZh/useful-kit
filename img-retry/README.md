## image-retry —— 快手图片失败重试机制

在大流量 C 端场景下，为了用户能拥有更好的体验，要想尽一切办法来优化体验。

 - 图片加载失败，显示一个闪电图，布局发生错乱 — 体验**差**
 - 图片加载失败，显示一个兜底图，布局正常 — 体验**良**
 - 图片加载失败，兜底图展示并且进行重试（有重试方案），重试成功，显示图片 — 体验**优**

 ### 实现思路

实现图片重试大概有两个思路：
  1 - 相同图片失败重试1～N次，类似 request retry
  2 - 不同图片源相同路径失败重试（多CDN）

这里重点是点第二个，第一个思路基本一样。

#### 不同图片源失败重试

**需要准备如下：**
 1 - 一张兜底图
 2 - 多个cdn地址，除了前缀不同，后缀都是相同的

  - 第一步：图片加载过程中，默认兜底图片展示，占位

  - 第二步：图片加载成功，替换占位图片 —— 过程结束

  - 第三步：图片加载失败，使用 `Promise.race(cdnArrImages)` 进行失败重试

  - 第四步：最优先加载成功的那张图片返回展示，如果都失败，默认展示兜底图
