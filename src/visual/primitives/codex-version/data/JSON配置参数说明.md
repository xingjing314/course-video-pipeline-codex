# JSON 配置参数说明

本文件集中说明本项目 `data/` 中 JSON 配置的字段含义。随着背景、布局和基本图形逐步加入，继续在本文档中按配置文件分别补充说明。

> 下方带注释的片段使用 **JSONC 仅供阅读**。标准 `.json` 文件不支持 `//` 注释，实际配置请编辑对应 JSON 文件，不要把注释复制进去。

## `_32-backdrop.json`：背景外观

配置文件：[`_32-backdrop.json`](_32-backdrop.json)

该文件控制 32 背景本身的画布、配色、网格、渐晕和四角定位标记。背景是底层，会绘制不透明的 `background` 底色；未来布局层和图形层应保持透明。

| 字段 | 含义 |
| --- | --- |
| `canvas.width` / `canvas.height` | SVG 背景绘制区域的像素宽、高；当前为 1920 × 1080。应与场景画布尺寸一致。 |
| `colors.background` | 背景底色。 |
| `colors.grid` | 普通细网格线颜色。 |
| `colors.gridStrong` | 每隔 `strongEvery` 像素绘制的强调网格线颜色。 |
| `colors.ink` | 渐晕使用的暗色。 |
| `colors.registrationMark` | 四角定位标记的颜色。 |
| `grid.step` | 网格线间距，单位为像素。 |
| `grid.strongEvery` | 强网格线间隔，单位为像素；水平和垂直方向均适用。 |
| `grid.strongWidth` / `grid.thinWidth` | 强网格线和普通网格线的描边宽度，单位为像素。 |
| `grid.breathFrames` | 网格透明度呼吸动画的周期帧数。30 fps 时 180 帧为 6 秒。 |
| `grid.strongBase` / `grid.strongAmp` | 强网格线透明度的基值和正弦振幅；当前透明度范围为 0.6–1.0。 |
| `grid.thinBase` / `grid.thinAmp` | 普通网格线透明度的基值和正弦振幅；当前透明度范围为 0.4–0.7。 |
| `vignette.cycleFrames` | 渐晕动画周期帧数。当前 360 帧，即 30 fps 下 12 秒。 |
| `vignette.cx` / `vignette.cy` | SVG 径向渐变中心位置，以画布百分比表示。 |
| `vignette.radiusBase` / `vignette.radiusAmp` | 渐变半径的基值和正弦振幅，单位为百分比。 |
| `vignette.opacityBase` / `vignette.opacityAmp` | 渐晕覆盖层透明度的基值和正弦振幅。 |
| `vignette.edgeBase` / `vignette.edgeAmp` | 渐晕外缘颜色透明度的基值和正弦振幅。 |
| `vignette.innerStop` / `vignette.outerStop` | 径向渐变从透明到外缘颜色的渐变位置，单位为百分比。 |
| `marks.arm` | 定位标记十字线从中心向两端延伸的长度，单位为像素。 |
| `marks.radius` | 定位标记中心圆的半径，单位为像素。 |
| `marks.points[]` | 定位标记中心点坐标；每项的 `x`、`y` 均为背景画布像素坐标。 |

### 带注释示例（JSONC）

```jsonc
{
  "canvas": {
    "width": 1920, // canvas：背景绘制区域；width：像素宽度
    "height": 1080 // height：像素高度
  },
  "colors": {
    "background": "#F2EFE6", // 底色
    "grid": "#E3DDCE", // 普通网格线
    "gridStrong": "#D5CDB9", // 强网格线
    "ink": "#1B2430", // 渐晕暗色
    "registrationMark": "#A69E8B" // 四角定位标记
  },
  "grid": {
    "step": 48, // 普通网格的间距（像素）
    "strongEvery": 240, // 强网格线的间隔（像素）
    "strongWidth": 1, // 强网格线宽（像素）
    "thinWidth": 0.6, // 普通网格线宽（像素）
    "breathFrames": 180, // 网格呼吸周期（帧）
    "strongBase": 0.8, // 强网格透明度基值
    "strongAmp": 0.2, // 强网格透明度振幅
    "thinBase": 0.55, // 普通网格透明度基值
    "thinAmp": 0.15 // 普通网格透明度振幅
  },
  "vignette": {
    "cycleFrames": 360, // 渐晕呼吸周期（帧）
    "cx": "50%", // 渐变中心的水平位置
    "cy": "46%", // 渐变中心的垂直位置
    "radiusBase": 75, // 渐变半径基值（百分比）
    "radiusAmp": 7, // 渐变半径振幅（百分比）
    "opacityBase": 0.9, // 渐晕覆盖层透明度基值
    "opacityAmp": 0.1, // 渐晕覆盖层透明度振幅
    "edgeBase": 0.07, // 渐晕外缘颜色透明度基值
    "edgeAmp": 0.035, // 渐晕外缘颜色透明度振幅
    "innerStop": 55, // 渐变内侧透明位置（百分比）
    "outerStop": 100 // 渐变外缘位置（百分比）
  },
  "marks": {
    "arm": 12, // 十字线半臂长（像素）
    "radius": 5, // 中心圆半径（像素）
    "points": [ // 各定位标记的画布坐标
      {"x": 72, "y": 72},
      {"x": 1848, "y": 72},
      {"x": 72, "y": 1008},
      {"x": 1848, "y": 1008}
    ]
  }
}
```

## `_32-scene.json`：场景与背景时间轴

配置文件：[`_32-scene.json`](_32-scene.json)

该文件定义 Composition 的画布和时长，并声明当前场景图层顺序。当前依次声明背景层、布局层和 26 对勾图形层。数组顺序即从底到顶的绘制顺序。

| 字段 | 含义 |
| --- | --- |
| `version` | 场景配置格式版本，便于未来调整字段时识别配置版本。 |
| `canvas.width` / `canvas.height` | Composition 输出画布的像素宽、高。 |
| `canvas.fps` | Composition 帧率，单位为帧/秒。 |
| `canvas.durationInFrames` | 整个 Composition 的总帧数；30 fps、360 帧对应 12 秒。它决定最终输出时长。 |
| `layers[]` | 图层列表，顺序表示叠放顺序。当前场景保留背景、布局和 26 对勾图形层。 |
| `layers[].id` | 当前图层的稳定标识。 |
| `layers[].type` | 图层种类；当前使用 `backdrop`、`layout` 和 `shape`。 |
| `layers[].config` | 对应图层配置文件的文件名。当前运行代码通过静态 import 加载配置，该字段暂作场景清单中的配置关联说明，不是动态文件加载器。 |
| `layers[].timeline.startFrame` | 图层时间轴相对于 Composition 的开始帧。 |
| `layers[].timeline.loopDurationInFrames` | 图层局部时间轴循环长度。背景当前为 360 帧；网格的 180 帧呼吸周期在每个背景循环内播放两次。 |
| `layers[].timeline.loop` | 是否循环局部时间轴。为 `true` 时，超过循环长度后从第 0 帧继续。 |

当前背景局部帧计算为 `max(0, 当前 Composition 帧 - startFrame) % loopDurationInFrames`。背景网格和渐晕分别依据自己的 `breathFrames`、`cycleFrames` 动画；矩形或布局的动画进度不会传入背景层。

### 当前图层清单

| 图层 | 配置文件 | 时间轴行为 |
| --- | --- | --- |
| `_32-backdrop` | [`_32-backdrop.json`](_32-backdrop.json) | 从第 0 帧开始，每 360 帧循环；内部网格和渐晕各自按背景参数计算周期。 |
| `_33-layout` | [`_33-layout.json`](_33-layout.json) | 从第 0 帧开始，不循环；分隔线按该层局部帧的帧号播放。 |
| `_26-check` | [`_26-check.json`](_26-check.json) | 独立时间轴；绘制两段相连的透明对勾线条。 |

### 带注释示例（JSONC）

```jsonc
{
  "version": 1, // 场景配置版本
  "canvas": {
    "width": 1920, // Composition 画布宽度（像素）
    "height": 1080, // Composition 画布高度（像素）
    "fps": 30, // 每秒帧数
    "durationInFrames": 360 // Composition 总帧数；30 fps 下为 12 秒
  },
  "layers": [ // 从底层到顶层排列
    {
      "id": "_32-backdrop", // 图层标识
      "type": "backdrop", // 图层类型
      "config": "_32-backdrop.json", // 对应的背景参数文件
      "timeline": {
        "startFrame": 0, // 从 Composition 第 0 帧开始
        "loopDurationInFrames": 360, // 背景局部时间轴长度
        "loop": true // 到达末帧后循环
      }
    },
    {
      "id": "_33-layout", // 布局层标识
      "type": "layout", // 图层类型
      "config": "_33-layout.json", // 对应的布局参数文件
      "timeline": {
        "startFrame": 0, // 布局局部时间轴起点
        "loopDurationInFrames": 360, // 局部时长；loop=false 时不用于回绕
        "loop": false // 布局分隔线只播放一次
      }
    },
    {
      "id": "_26-check", // 26 对勾层标识
      "type": "shape", // 图形图层
      "config": "_26-check.json", // 对应的对勾参数文件
      "timeline": {
        "startFrame": 0, // 图层局部时间轴起点
        "loopDurationInFrames": 360, // 局部时间轴长度；loop=false 时不回绕
        "loop": false // 对勾绘制动画不循环
      }
    }
  ]
}
```

## `_33-layout.json`：三段式布局层

配置文件：[`_33-layout.json`](_33-layout.json)

该层只保留页眉、主体、页脚的分区边界，不绘制底色，因此可透明叠加在背景上。页面标题、参数表、中心卡片、教学文字、页码和角标都不属于布局层，当前不绘制。

| 字段 | 含义 |
| --- | --- |
| `canvas.width` / `canvas.height` | 布局 SVG 的画布像素宽、高，应与场景画布一致。 |
| `bands.header` | 页眉区域高度；第一条水平分隔线位于该 y 坐标。 |
| `bands.footer` | 页脚区域高度；第二条水平分隔线位于 `canvas.height - footer`。 |
| `divider.color` | 两条分隔线的颜色。 |
| `divider.width` | 分隔线宽度，单位为像素。 |
| `divider.opacity` | 分隔线透明度。 |
| `timing.headerStartFrame` / `headerDurationInFrames` | 页眉边界线在布局局部时间轴中的开始帧与绘制时长。 |
| `timing.footerStartFrame` / `footerDurationInFrames` | 页脚边界线在布局局部时间轴中的开始帧与绘制时长。 |

两条分隔线采用 ease-in-out 的描边揭示动画。调整 `bands` 改变三段区域尺寸；调整 `timing` 只改变布局线条动画，不影响背景时间轴或其他图形的时间轴。

### 带注释示例（JSONC）

```jsonc
{
  "canvas": {"width": 1920, "height": 1080}, // 布局绘制画布（像素）
  "bands": {
    "header": 120, // 页眉高度；第一条分隔线 y=120
    "footer": 140 // 页脚高度；第二条分隔线 y=1080-140=940
  },
  "divider": {
    "color": "#1B2430", // 分隔线颜色
    "width": 1.4, // 分隔线宽度（像素）
    "opacity": 0.65 // 分隔线透明度
  },
  "timing": {
    "headerStartFrame": 36, // 页眉线开始绘制帧
    "headerDurationInFrames": 22, // 页眉线绘制时长（帧）
    "footerStartFrame": 46, // 页脚线开始绘制帧
    "footerDurationInFrames": 22 // 页脚线绘制时长（帧）
  }
}
```

## `_01-rect.json`：01 直角矩形

配置文件：[`_01-rect.json`](_01-rect.json)

该文件控制 01 矩形的几何、填充、描边、阴影，以及矩形自身的出现动画。矩形层画布透明；`rect.fill` 是矩形形状自身的填充色，不是图层底色。位置和尺寸沿用旧版 `RectZeroRadius` 的主体矩形；不包含红色标注框、尺寸标注、矩形内部文案、90°角度标记和角点标记。

| 字段 | 含义 |
| --- | --- |
| `canvas.width` / `canvas.height` | 矩形 SVG 图层画布像素宽、高，与场景画布一致。 |
| `rect.x` / `rect.y` | 矩形左上角相对于画布左上角的位置，单位为像素。 |
| `rect.width` / `rect.height` | 矩形宽、高，单位为像素。 |
| `rect.radius` | 矩形圆角半径，单位为像素；01 直角矩形设为 `0`。 |
| `rect.fill` | 矩形自身的填充颜色。 |
| `rect.stroke` | 矩形描边颜色。 |
| `rect.strokeWidth` | 描边宽度，单位为像素。 |
| `rect.shadow.x` / `y` | 投影水平和垂直偏移，单位为像素。 |
| `rect.shadow.blur` | 投影模糊半径，单位为像素。 |
| `rect.shadow.color` | 投影颜色，支持 CSS 颜色格式。 |
| `animation.outlineStartFrame` | 矩形描边开始绘制的局部帧。 |
| `animation.outlineDurationInFrames` | 描边沿矩形周长完成绘制所用帧数。 |
| `animation.fillStartFrame` | 矩形填充开始淡入的局部帧。 |
| `animation.fillDurationInFrames` | 填充从透明到完整显示所用帧数。 |

### 带注释示例（JSONC）

```jsonc
{
  "canvas": {"width": 1920, "height": 1080}, // 矩形层画布（像素）
  "rect": {
    "x": 750, // 左上角 x 坐标
    "y": 290, // 左上角 y 坐标
    "width": 860, // 矩形宽度
    "height": 460, // 矩形高度
    "radius": 0, // 圆角半径；0 表示直角
    "fill": "#FCFAF4", // 矩形本体填充
    "stroke": "#1B2430", // 描边颜色
    "strokeWidth": 3, // 描边宽度（像素）
    "shadow": {
      "x": 0, // 阴影水平偏移（像素）
      "y": 26, // 阴影垂直偏移（像素）
      "blur": 48, // 阴影模糊（像素）
      "color": "rgba(27,36,48,0.10)" // 阴影颜色和透明度
    }
  },
  "animation": {
    "outlineStartFrame": 58, // 描边开始帧
    "outlineDurationInFrames": 74, // 描边绘制时长
    "fillStartFrame": 114, // 填充淡入开始帧
    "fillDurationInFrames": 30 // 填充淡入时长
  }
}
```

## `_02-rounded-rect.json`：02 圆角矩形

配置文件：[`_02-rounded-rect.json`](_02-rounded-rect.json)

该配置驱动 02 圆角矩形透明图层。它沿用 01 的位置、尺寸、填充、描边、阴影和入场动画，只将圆角半径设为 `16`。实际 renderer 使用 SVG `<rect rx={radius}>` 绘制轮廓和填充。

| 字段 | 含义 |
| --- | --- |
| `canvas.width` / `canvas.height` | 图形 SVG 图层的像素宽、高，与 Composition 画布一致。 |
| `rect.x` / `rect.y` | 图形左上角在画布中的像素坐标。 |
| `rect.width` / `rect.height` | 图形宽、高，单位为像素。 |
| `rect.radius` | 四角圆角半径，单位为像素；当前 `16`。 |
| `rect.fill` | 图形自身填充色；图层其余区域透明。 |
| `rect.stroke` / `rect.strokeWidth` | 描边颜色和宽度；宽度单位为像素。 |
| `rect.shadow.x` / `y` / `blur` / `color` | 形状投影的水平偏移、垂直偏移、模糊值（像素）和 CSS 颜色。 |
| `animation.outlineStartFrame` / `outlineDurationInFrames` | 图形局部时间轴中描边动画的起始帧和持续帧数。 |
| `animation.fillStartFrame` / `fillDurationInFrames` | 图形局部时间轴中填充淡入动画的起始帧和持续帧数。 |

### 带注释示例（JSONC）

```jsonc
{
  "canvas": {"width": 1920, "height": 1080}, // 圆角矩形图层画布尺寸（像素）
  "rect": {
    "x": 750, "y": 290, // 左上角坐标（像素）
    "width": 860, "height": 460, // 图形尺寸（像素）
    "radius": 16, // 圆角半径（像素）
    "fill": "#FCFAF4", // 图形填充色
    "stroke": "#1B2430", // 描边颜色
    "strokeWidth": 3, // 描边宽度（像素）
    "shadow": {"x": 0, "y": 26, "blur": 48, "color": "rgba(27,36,48,0.10)"} // 投影
  },
  "animation": {
    "outlineStartFrame": 58, "outlineDurationInFrames": 74, // 描边动画起始帧、帧数
    "fillStartFrame": 114, "fillDurationInFrames": 30 // 填充淡入起始帧、帧数
  }
}
```

该 JSONC 示例用于解释字段，不能直接当作 `.json` 内容使用；实际配置必须是合法 JSON。

## `_03-capsule.json`：03 胶囊形

配置文件：[`_03-capsule.json`](_03-capsule.json)

该配置驱动 03 胶囊形透明图层，沿用 01 的位置、尺寸、配色、阴影和入场动画。胶囊的固定形态规则是 `radius = height / 2`；当前高度为 460，所以 JSON 中半径为 230。renderer 使用 SVG `<rect rx={radius}>` 绘制。

| 字段 | 含义 |
| --- | --- |
| `canvas.width` / `canvas.height` | 图形 SVG 图层的像素宽、高，与 Composition 画布一致。 |
| `rect.x` / `rect.y` | 形状左上角在画布中的像素坐标。 |
| `rect.width` / `rect.height` | 形状宽、高，单位为像素。 |
| `rect.radius` | 圆角半径，单位为像素；胶囊形固定为高度的一半。修改高度时需同步更新半径。 |
| `rect.fill` | 形状自身填充色；图层其余区域透明。 |
| `rect.stroke` / `rect.strokeWidth` | 描边颜色和宽度；宽度单位为像素。 |
| `rect.shadow.x` / `y` / `blur` / `color` | 形状投影的水平偏移、垂直偏移、模糊值（像素）和 CSS 颜色。 |
| `animation.outlineStartFrame` / `outlineDurationInFrames` | 图形局部时间轴中描边动画的起始帧和持续帧数。 |
| `animation.fillStartFrame` / `fillDurationInFrames` | 图形局部时间轴中填充淡入动画的起始帧和持续帧数。 |

### 带注释示例（JSONC）

```jsonc
{
  "canvas": {"width": 1920, "height": 1080}, // 胶囊形图层画布尺寸（像素）
  "rect": {
    "x": 750, "y": 290, // 左上角坐标（像素）
    "width": 860, "height": 460, // 形状尺寸（像素）
    "radius": 230, // 胶囊半径 = height / 2
    "fill": "#FCFAF4", // 形状填充色
    "stroke": "#1B2430", // 描边颜色
    "strokeWidth": 3, // 描边宽度（像素）
    "shadow": {"x": 0, "y": 26, "blur": 48, "color": "rgba(27,36,48,0.10)"} // 投影
  },
  "animation": {
    "outlineStartFrame": 58, "outlineDurationInFrames": 74, // 描边动画起始帧、帧数
    "fillStartFrame": 114, "fillDurationInFrames": 30 // 填充淡入起始帧、帧数
  }
}
```

该 JSONC 示例用于解释字段，不能直接当作 `.json` 内容使用；实际配置必须是合法 JSON。

## `_04-solid-circle.json`：04 实心圆

配置文件：[`_04-solid-circle.json`](_04-solid-circle.json)

该配置驱动 04 实心圆透明图层。圆心与半径沿用旧版 `Circle04` 的基础圆形几何（圆心 `(1150, 470)`、半径 `170`），填充、描边、阴影和描边绘制/填充淡入沿用本项目 01 图形层效果。当前只画一个填充圆；不包含空心圆、同心圆、刻度、圆心标记或说明文字。圆形使用 `<circle>` 原生几何，外侧区域透明。

| 字段 | 含义 |
| --- | --- |
| `canvas.width` / `canvas.height` | 圆形 SVG 图层的像素宽、高，与 Composition 画布一致。 |
| `circle.cx` / `circle.cy` | 圆心在画布中的 x、y 坐标，单位为像素。 |
| `circle.radius` | 圆半径，单位为像素；直径为半径的两倍。 |
| `circle.fill` | 实心圆的填充颜色。 |
| `circle.stroke` / `circle.strokeWidth` | 圆形轮廓描边颜色与宽度；宽度单位为像素。 |
| `circle.shadow.x` / `y` / `blur` / `color` | 圆形投影的水平偏移、垂直偏移、模糊值（像素）和 CSS 颜色。 |
| `animation.outlineStartFrame` / `outlineDurationInFrames` | 图形局部时间轴中圆周描边动画的起始帧和持续帧数。 |
| `animation.fillStartFrame` / `fillDurationInFrames` | 图形局部时间轴中填充淡入动画的起始帧和持续帧数。 |

### 带注释示例（JSONC）

```jsonc
{
  "canvas": {"width": 1920, "height": 1080}, // 实心圆图层画布尺寸（像素）
  "circle": {
    "cx": 1150, "cy": 470, // 圆心坐标（像素）
    "radius": 170, // 圆半径（像素）
    "fill": "#FCFAF4", // 实心填充色
    "stroke": "#1B2430", // 圆周描边颜色
    "strokeWidth": 3, // 描边宽度（像素）
    "shadow": {"x": 0, "y": 26, "blur": 48, "color": "rgba(27,36,48,0.10)"} // 投影
  },
  "animation": {
    "outlineStartFrame": 58, "outlineDurationInFrames": 74, // 描边动画起始帧、帧数
    "fillStartFrame": 114, "fillDurationInFrames": 30 // 填充淡入起始帧、帧数
  }
}
```

该 JSONC 示例用于解释字段，不能直接当作 `.json` 内容使用；实际配置必须是合法 JSON。

## `_04-hollow-circle.json`：04 空心圆

配置文件：[`_04-hollow-circle.json`](_04-hollow-circle.json)

该配置使用与 04 实心圆相同的圆心和半径，只绘制圆周描边。圆心区域不绘制填充，所以可以透出下面的背景和布局。参数由 `HollowScene04` 和 `HollowCircle04` 消费。

| 字段 | 含义 |
| --- | --- |
| `canvas.width` / `canvas.height` | 圆形 SVG 图层的像素宽、高。 |
| `circle.cx` / `circle.cy` | 圆心的画布坐标，单位为像素。 |
| `circle.radius` | 圆半径，单位为像素。 |
| `circle.stroke` / `circle.strokeWidth` | 圆周描边颜色和宽度；宽度单位为像素。内部始终透明，不配置填充。 |
| `circle.shadow.x` / `y` / `blur` / `color` | 圆周投影的偏移、模糊值（像素）和 CSS 颜色。 |
| `animation.outlineStartFrame` / `outlineDurationInFrames` | 圆周描边在图层局部时间轴中的开始帧和绘制帧数。 |

### 带注释示例（JSONC）

```jsonc
{
  "canvas": {"width": 1920, "height": 1080}, // 透明圆形图层画布
  "circle": {
    "cx": 1150, "cy": 470, // 圆心坐标（像素）
    "radius": 170, // 半径（像素）
    "stroke": "#1B2430", // 圆周描边颜色
    "strokeWidth": 3, // 描边宽度（像素）
    "shadow": {"x": 0, "y": 26, "blur": 48, "color": "rgba(27,36,48,0.10)"} // 描边投影
  },
  "animation": {"outlineStartFrame": 58, "outlineDurationInFrames": 74} // 描边绘制时间
}
```

## `_04-concentric-circles.json`：04 同心圆

配置文件：[`_04-concentric-circles.json`](_04-concentric-circles.json)

该配置由 `ConcentricScene04` 和 `ConcentricCircles04` 消费。它绘制三个圆周共用一个圆心；半径及线宽沿用旧版 `Circle04` 同心圆形态。只保留圆周，不绘制中心点、刻度、填充或文字。每层圆周从外向内错开 `staggerFrames` 帧开始描边动画。

| 字段 | 含义 |
| --- | --- |
| `canvas.width` / `canvas.height` | SVG 图层画布尺寸，单位为像素。 |
| `center.cx` / `center.cy` | 所有圆周共用的圆心坐标，单位为像素。 |
| `circles[]` | 圆周配置数组；数组顺序决定绘制及动画先后顺序。 |
| `circles[].radius` | 单个圆周的半径，单位为像素。 |
| `circles[].strokeWidth` | 单个圆周的描边宽度，单位为像素。 |
| `style.stroke` | 所有圆周共用的描边颜色。 |
| `style.shadow.x` / `y` / `blur` / `color` | 圆周投影的偏移、模糊值（像素）和 CSS 颜色。 |
| `animation.outlineStartFrame` | 最外层圆周开始绘制的局部帧。 |
| `animation.outlineDurationInFrames` | 每个圆周描边的动画持续帧数。 |
| `animation.staggerFrames` | 相邻圆周错开的起始帧数；第 n 个圆周从 `outlineStartFrame + n × staggerFrames` 开始。 |

### 带注释示例（JSONC）

```jsonc
{
  "canvas": {"width": 1920, "height": 1080}, // 透明同心圆图层画布
  "center": {"cx": 1150, "cy": 470}, // 三个圆共用的圆心
  "circles": [
    {"radius": 170, "strokeWidth": 3}, // 外圆
    {"radius": 115.6, "strokeWidth": 2.4}, // 中圆
    {"radius": 61.2, "strokeWidth": 2.2} // 内圆
  ],
  "style": {
    "stroke": "#1B2430", // 圆周描边颜色
    "shadow": {"x": 0, "y": 26, "blur": 48, "color": "rgba(27,36,48,0.10)"} // 投影
  },
  "animation": {
    "outlineStartFrame": 58, // 外圆开始帧
    "outlineDurationInFrames": 74, // 每个圆的描边时长
    "staggerFrames": 7 // 相邻圆错开帧数
  }
}
```

以上 JSONC 仅解释字段；实际 `.json` 配置必须保持合法 JSON。

## `_05-ellipse.json`：05 椭圆

配置文件：[`_05-ellipse.json`](_05-ellipse.json)

该配置驱动 05 椭圆透明图层。几何沿用旧版 `Ellipse05` 最终展示状态：中心 `(1150, 450)`，半长轴 `250`、半短轴 `150`；不包含坐标轴、焦点、轨迹、尺寸标注或文字。图层保留本项目图形的填充、描边、投影以及描边绘制/填充淡入动画。

| 字段 | 含义 |
| --- | --- |
| `canvas.width` / `canvas.height` | 椭圆 SVG 图层的像素宽、高。 |
| `ellipse.cx` / `ellipse.cy` | 椭圆中心坐标，单位为像素。 |
| `ellipse.radiusX` / `ellipse.radiusY` | 水平半径和垂直半径，单位为像素；半径不相等时为椭圆。 |
| `ellipse.fill` | 椭圆本体填充颜色；图层其他区域透明。 |
| `ellipse.stroke` / `ellipse.strokeWidth` | 轮廓描边颜色和宽度；宽度单位为像素。 |
| `ellipse.shadow.x` / `y` / `blur` / `color` | 椭圆投影偏移、模糊值（像素）和 CSS 颜色。 |
| `animation.outlineStartFrame` / `outlineDurationInFrames` | 局部时间轴中的椭圆描边起始帧和绘制帧数。 |
| `animation.fillStartFrame` / `fillDurationInFrames` | 局部时间轴中的填充淡入起始帧和持续帧数。 |

### 带注释示例（JSONC）

```jsonc
{
  "canvas": {"width": 1920, "height": 1080}, // 透明椭圆图层画布
  "ellipse": {
    "cx": 1150, "cy": 450, // 中心坐标（像素）
    "radiusX": 250, "radiusY": 150, // 水平、垂直半径（像素）
    "fill": "#FCFAF4", // 本体填充色
    "stroke": "#1B2430", // 描边颜色
    "strokeWidth": 3, // 描边宽度（像素）
    "shadow": {"x": 0, "y": 26, "blur": 48, "color": "rgba(27,36,48,0.10)"} // 投影
  },
  "animation": {
    "outlineStartFrame": 58, "outlineDurationInFrames": 74, // 描边动画
    "fillStartFrame": 114, "fillDurationInFrames": 30 // 填充淡入
  }
}
```

该 JSONC 示例用于解释字段，不能直接当作 `.json` 内容使用；实际配置必须是合法 JSON。

## 06 线型配置：三组独立 JSON 与 renderer

06 按“直线”“折线”“虚线/点线”拆成三组，各自独立配置并由 Scene06 叠加；每个图形层画布透明，只绘制线本身，不包含标签、端点、尺寸标注或教学元素。

### `_06-straight-line.json`：直线

配置文件：[`_06-straight-line.json`](_06-straight-line.json)，由 `StraightLine06` 消费。

| 字段 | 含义 |
| --- | --- |
| `canvas.width` / `canvas.height` | SVG 图层画布尺寸，单位为像素。 |
| `line.from` / `line.to` | 线段起点和终点的绝对画布坐标 `[x, y]`。 |
| `line.stroke` / `line.strokeWidth` | 描边颜色和线宽；线宽单位为像素。 |
| `line.linecap` | 端点样式：`butt`、`round` 或 `square`。 |
| `animation.startFrame` / `durationInFrames` | 当前图层局部时间轴中的描边起始帧和绘制持续帧数。 |

### `_06-polyline.json`：折线

配置文件：[`_06-polyline.json`](_06-polyline.json)，由 `Polyline06` 消费。

| 字段 | 含义 |
| --- | --- |
| `canvas.width` / `canvas.height` | SVG 图层画布尺寸，单位为像素。 |
| `polyline.points` | 顶点数组 `[[x, y], ...]`；按数组顺序连接，至少三个点，坐标为画布绝对像素坐标。 |
| `polyline.stroke` / `strokeWidth` | 描边颜色和线宽；线宽单位为像素。 |
| `polyline.linecap` / `linejoin` | 端点和转角样式。 |
| `animation.startFrame` / `durationInFrames` | 当前图层局部时间轴中的描边起始帧和绘制持续帧数。 |

### `_06-dash-dot.json`：虚线与点线

配置文件：[`_06-dash-dot.json`](_06-dash-dot.json)，由 `DashDot06` 消费。

| 字段 | 含义 |
| --- | --- |
| `canvas.width` / `canvas.height` | SVG 图层画布尺寸，单位为像素。 |
| `style.stroke` / `style.strokeWidth` | 两种线样例共用的描边颜色和线宽。 |
| `lines[]` | 虚线和点线样例；每项独立声明坐标和笔触。 |
| `lines[].points` | 线段端点的绝对画布坐标。 |
| `lines[].dashArray` | SVG 线段/间隔的重复长度（像素）；`[14, 9]` 为虚线，`[0.1, 12]` 配合圆头为点线。 |
| `lines[].linecap` | 端点样式；点线使用 `round`。 |
| `lines[].startFrame` | 该条线在图层局部时间轴中的开始绘制帧。 |
| `animation.durationInFrames` | 每条线绘制持续帧数。 |

三组图层分别使用遮罩控制描边揭示进度，因此线型定义不会被绘制动画覆盖。

## `_07-one-way-arrow.json`：07 单向箭头

配置文件：[`_07-one-way-arrow.json`](_07-one-way-arrow.json)，由 `Scene07` 导入并交给 `OneWayArrow07` 绘制。该层透明叠加在背景和布局之上，只绘制一条线段箭身与终点处的开放 V 形箭头头部；不绘制起点箭头、双向箭头、块状箭头、顶点、标注或文字。箭头几何、样式和两个绘制阶段的时间均由 JSON 配置。

| 字段 | 含义 |
| --- | --- |
| `canvas.width` / `canvas.height` | SVG 图层画布的像素宽、高，应与 Composition 画布一致。 |
| `arrow.from` / `arrow.to` | 箭身起点与终点的画布坐标 `[x, y]`；箭头头部固定绘制在 `to` 端，方向由起终点向量决定。 |
| `arrow.stroke` | 箭身和箭头头部共用的描边颜色。 |
| `arrow.strokeWidth` | 箭身和箭头头部的描边宽度，单位为像素。 |
| `arrow.linecap` | 线端样式；可用 `butt`（平头）、`round`（圆头）或 `square`（方头）。 |
| `arrow.headLength` | 箭头头部从尖端到两侧基点的长度，单位为像素。 |
| `arrow.headWidth` | 箭头两侧基点间的总宽度，单位为像素；renderer 各取其一半计算两侧翼。 |
| `animation.shaftStartFrame` / `shaftDurationInFrames` | 箭身描边动画在图形局部时间轴中的开始帧与持续帧数。 |
| `animation.headStartFrame` / `headDurationInFrames` | 箭头头部描边动画在图形局部时间轴中的开始帧与持续帧数；可与箭身动画分开设置。 |

箭头采用 SVG 开放路径，head 端在 `to` 坐标处形成尖端；侧翼位置按起终点方向向量及 `headLength`、`headWidth` 自动计算。箭身和箭头头部使用 ease-in-out 描边揭示动画，透明背景不会遮挡背景/布局层。

### 带注释示例（JSONC）

```jsonc
{
  "canvas": {
    "width": 1920, // 箭头 SVG 图层画布宽度（像素）
    "height": 1080 // 箭头 SVG 图层画布高度（像素）
  },
  "arrow": {
    "from": [620, 500], // 箭身起点坐标 [x, y]；单位为画布像素
    "to": [1480, 500], // 箭身终点及箭头尖端坐标；箭头朝向 from → to
    "stroke": "#1B2430", // 箭身、箭头头部共用的描边颜色
    "strokeWidth": 4.5, // 描边宽度（像素）
    "linecap": "round", // 线端样式：butt 平头、round 圆头、square 方头
    "headLength": 55, // 箭头尖端到侧翼基点的长度（像素）
    "headWidth": 90 // 左右侧翼基点之间的总宽度（像素）
  },
  "animation": {
    "shaftStartFrame": 40, // 箭身在图形局部时间轴中的开始帧
    "shaftDurationInFrames": 40, // 箭身描边持续帧数
    "headStartFrame": 80, // 箭头头部开始绘制帧；默认接在箭身动画之后
    "headDurationInFrames": 32 // 箭头头部描边持续帧数
  }
}
```

该 JSONC 示例用于说明字段，不能直接作为 `.json` 配置使用；实际配置必须保持合法 JSON。当前实现仅绘制单向线箭头，不包含双向或块状箭头。

## `_07-two-way-arrow.json`：07 双向箭头

配置文件：[`_07-two-way-arrow.json`](_07-two-way-arrow.json)，由 `Scene07` 导入并交给 `TwoWayArrow07` 绘制。该图层透明叠加在背景和布局之上，只绘制一条线段箭身，以及起点和终点两个开放 V 形箭头头部；不包含块状箭身、顶点标识、尺寸标注或文字。箭身起终点、箭头头部尺寸、笔触样式和动画时间均由 JSON 配置。

### 参数含义

| 字段 | 含义 |
| --- | --- |
| `canvas.width` / `canvas.height` | SVG 图层画布的像素宽、高，应与 Composition 画布一致。 |
| `arrow.from` / `arrow.to` | 箭身起点和终点坐标 `[x, y]`；起点、终点各绘制一个箭头头部，箭头方向彼此相反。 |
| `arrow.stroke` | 箭身和两个箭头头部共用的描边颜色。 |
| `arrow.strokeWidth` | 箭身和箭头头部的描边宽度，单位为像素。 |
| `arrow.linecap` | 线端样式；可用 `butt`（平头）、`round`（圆头）或 `square`（方头）。 |
| `arrow.headLength` | 每个箭头头部从尖端到两侧基点的长度，单位为像素。 |
| `arrow.headWidth` | 每个箭头头部两侧基点间的总宽度，单位为像素；renderer 向垂直于箭身的两侧各延伸其一半。 |
| `animation.shaftStartFrame` / `shaftDurationInFrames` | 箭身描边动画在图形局部时间轴中的开始帧与持续帧数。 |
| `animation.headsStartFrame` / `headsDurationInFrames` | 两端箭头头部共同使用的描边开始帧与持续帧数；两个头部同时绘制。 |

箭头头部朝向由 `from` → `to` 的方向向量计算：起点头指向 `from` 外侧，终点头指向 `to` 外侧。箭身绘制完成后，两端头部按共同的 ease-in-out 动画同时显现；图层背景透明。

### 带注释示例（JSONC）

```jsonc
{
  "canvas": {
    "width": 1920, // 双向箭头 SVG 图层画布宽度（像素）
    "height": 1080 // 双向箭头 SVG 图层画布高度（像素）
  },
  "arrow": {
    "from": [620, 500], // 箭身起点坐标 [x, y]；此端也生成一个向外的箭头头部
    "to": [1480, 500], // 箭身终点坐标 [x, y]；此端生成朝相反方向的箭头头部
    "stroke": "#1B2430", // 箭身和两端箭头头部共用的描边颜色
    "strokeWidth": 4.5, // 描边宽度（像素）
    "linecap": "round", // 线端样式：butt 平头、round 圆头、square 方头
    "headLength": 55, // 两个箭头头部的尖端到侧翼基点长度（像素）
    "headWidth": 90 // 每个箭头头部左右侧翼基点间的总宽度（像素）
  },
  "animation": {
    "shaftStartFrame": 40, // 箭身在图形局部时间轴中的开始帧
    "shaftDurationInFrames": 40, // 箭身描边持续帧数
    "headsStartFrame": 80, // 两端箭头头部共同的开始帧
    "headsDurationInFrames": 32 // 两端箭头头部同时描边的持续帧数
  }
}
```

该 JSONC 示例用于说明字段，不能直接作为 `.json` 配置使用；实际配置必须保持合法 JSON。当前实现绘制双向线箭头，不包含单向箭头配置的可选开关，也不包含块状箭头。

## `_08-curve-connector.json`：08 曲线连线

配置文件：[`_08-curve-connector.json`](_08-curve-connector.json)，由 `Scene08` 导入并交给 `CurveConnector08` 绘制。该图层透明叠加在背景和布局之上，只绘制一条三次贝塞尔曲线；不绘制端点节点、控制柄、控制多边形、箭头、尺寸标注或文字。曲线的两个端点与两个控制点、描边样式和描边动画时间均由 JSON 配置。当前默认控制点形成一条先上弯再下弯的 S 形连接线。

### 参数含义

| 字段 | 含义 |
| --- | --- |
| `canvas.width` / `canvas.height` | SVG 图层画布的像素宽、高，应与 Composition 画布一致。 |
| `curve.start` | 三次贝塞尔曲线起点 `P0=[x,y]`，单位为画布像素。 |
| `curve.control1` | 第一控制点 `P1=[x,y]`，主要影响曲线从起点离开时的切线方向和弯曲程度。 |
| `curve.control2` | 第二控制点 `P2=[x,y]`，主要影响曲线接近终点时的切线方向和弯曲程度。 |
| `curve.end` | 三次贝塞尔曲线终点 `P3=[x,y]`，单位为画布像素。 |
| `curve.stroke` | 曲线描边颜色。 |
| `curve.strokeWidth` | 曲线描边宽度，单位为像素。 |
| `curve.linecap` | 曲线两端的端点样式；可用 `butt`（平头）、`round`（圆头）或 `square`（方头）。 |
| `animation.drawStartFrame` | 曲线在图形局部时间轴中的描边开始帧。 |
| `animation.drawDurationInFrames` | 曲线从起点绘制到终点的持续帧数。 |

renderer 将四个点转换成 SVG 三次贝塞尔路径 `M P0 C P1 P2 P3`，以 ease-in-out 遮罩揭示路径。四个点都可独立修改，因此可形成拱形、反向拱形或 S 形；目前不含控制点可视化、锚点、箭头或曲率动画。

### 带注释示例（JSONC）

```jsonc
{
  "canvas": {
    "width": 1920, // 曲线 SVG 图层画布宽度（像素）
    "height": 1080 // 曲线 SVG 图层画布高度（像素）
  },
  "curve": {
    "start": [860, 470], // 起点 P0 的画布坐标 [x, y]
    "control1": [1000, 360], // 控制点 P1；影响曲线起始切线与弯曲
    "control2": [1200, 580], // 控制点 P2；影响曲线结束切线与弯曲
    "end": [1340, 470], // 终点 P3 的画布坐标 [x, y]
    "stroke": "#1B2430", // 曲线描边颜色
    "strokeWidth": 3.2, // 描边宽度（像素）
    "linecap": "round" // 端点样式：butt 平头、round 圆头、square 方头
  },
  "animation": {
    "drawStartFrame": 50, // 曲线在图形局部时间轴中的开始帧
    "drawDurationInFrames": 30 // 曲线描边动画持续帧数
  }
}
```

该 JSONC 示例用于说明字段，不能直接作为 `.json` 配置使用；实际配置必须保持合法 JSON。
## `_11-trapezoid.json`：11 梯形

配置文件：[`_11-trapezoid.json`](_11-trapezoid.json)，由 `Scene11` 导入并交给 `Trapezoid11` 绘制。该图层背景透明，只绘制一个梯形的填充和轮廓；不包含平行复制、翻转拼接、面积公式、尺寸标注、直角标识或文字。位置、上下底宽、高度、上底相对偏移、填充描边样式和出现动画均由 JSON 配置。默认几何对应旧版 `Trapezoid11` 的初始梯形：上底 320、下底 520、高 240，上底居中。

### 参数含义

| 字段 | 含义 |
| --- | --- |
| `canvas.width` / `canvas.height` | SVG 图层画布的像素宽、高，应与 Composition 画布一致。 |
| `trapezoid.x` / `trapezoid.y` | 梯形外接范围左上角的画布坐标，单位为像素。 |
| `trapezoid.bottomWidth` | 下底宽度，单位为像素；同时作为梯形外接范围的宽度。 |
| `trapezoid.topWidth` | 上底宽度，单位为像素。 |
| `trapezoid.topOffset` | 上底左端相对外接范围左边缘的水平偏移，单位为像素；上底右端位置为 `x + topOffset + topWidth`。 |
| `trapezoid.height` | 两条平行底边之间的垂直距离，单位为像素。 |
| `trapezoid.fill` | 梯形区域填充颜色。 |
| `trapezoid.stroke` / `trapezoid.strokeWidth` | 梯形轮廓描边颜色和宽度；宽度单位为像素。 |
| `trapezoid.linejoin` | 四条边相接处的连接样式：`miter`（尖角）、`round`（圆角）或 `bevel`（斜切）。 |
| `animation.outlineStartFrame` / `outlineDurationInFrames` | 梯形轮廓描边动画的图形局部开始帧和持续帧数。 |
| `animation.fillStartFrame` / `fillDurationInFrames` | 梯形填充从透明到完整显示的图形局部开始帧和持续帧数。 |

renderer 通过外接范围和 `topOffset` 生成四个顶点：上底为 `[x+topOffset, y]` 至 `[x+topOffset+topWidth, y]`，下底横跨 `x` 至 `x+bottomWidth`，下边 y 坐标为 `y+height`。要保持有效梯形，应满足 `bottomWidth > 0`、`topWidth > 0`、`height > 0`、`topOffset >= 0` 且 `topOffset + topWidth <= bottomWidth`。不对称的 `topOffset` 也可表达直角梯形等偏斜轮廓。

### 带注释示例（JSONC）

```jsonc
{
  "canvas": {
    "width": 1920, // 梯形 SVG 图层画布宽度（像素）
    "height": 1080 // 梯形 SVG 图层画布高度（像素）
  },
  "trapezoid": {
    "x": 870, // 外接范围左上角 x 坐标
    "y": 440, // 外接范围左上角 y 坐标
    "bottomWidth": 520, // 下底宽度（像素），也是外接范围宽度
    "topWidth": 320, // 上底宽度（像素）
    "topOffset": 100, // 上底左端距外接范围左边缘 100 像素；两端均留 100 像素
    "height": 240, // 平行上、下底之间的垂直距离（像素）
    "fill": "#FCFAF4", // 梯形区域填充色
    "stroke": "#1B2430", // 轮廓描边颜色
    "strokeWidth": 3, // 描边宽度（像素）
    "linejoin": "miter" // 连接样式：miter 尖角、round 圆角、bevel 斜切
  },
  "animation": {
    "outlineStartFrame": 34, // 梯形轮廓开始绘制帧
    "outlineDurationInFrames": 44, // 轮廓绘制持续帧数
    "fillStartFrame": 78, // 梯形内部开始填充帧
    "fillDurationInFrames": 22 // 填充淡入持续帧数
  }
}
```

该 JSONC 示例用于说明字段，不能直接作为 `.json` 配置使用；实际配置必须保持合法 JSON。

## `_10-irregular-region.json`：10 不规则闭合区域

配置文件：[`_10-irregular-region.json`](_10-irregular-region.json)，由 `Scene10` 导入并交给 `IrregularRegion10` 绘制。该图层背景透明，只绘制不规则闭合区域的填充与描边；不绘制控制多边形、锚点、区域内文字或标注。顶点坐标、平滑强度、填充描边样式，以及区域出现、平滑和填充动画都由 JSON 配置。当前默认使用旧版 `Region10` 的六个锚点，平滑后呈闭合曲线轮廓。

### 参数含义

| 字段 | 含义 |
| --- | --- |
| `canvas.width` / `canvas.height` | SVG 图层画布的像素宽、高，应与 Composition 画布一致。 |
| `region.points[]` | 按顺序连接并闭合的顶点列表，每个顶点为 `[x,y]` 画布绝对像素坐标；至少需要 3 个点。 |
| `region.tension` | 目标平滑强度，范围 `0–1`；`0` 表示直边多边形，`1` 表示完整 Catmull–Rom 平滑。 |
| `region.fill` | 区域内部填充颜色。 |
| `region.stroke` / `region.strokeWidth` | 区域轮廓描边颜色与宽度；宽度单位为像素。 |
| `region.linejoin` | 闭合轮廓连接样式：`miter`（尖角）、`round`（圆角）或 `bevel`（斜切）。 |
| `animation.appearStartFrame` / `appearDurationInFrames` | 区域整体透明度从 0 到 1 的开始帧与持续帧数。 |
| `animation.smoothStartFrame` / `smoothDurationInFrames` | 轮廓从直边形态向 `region.tension` 目标平滑度过渡的开始帧与持续帧数。 |
| `animation.fillStartFrame` / `fillDurationInFrames` | 区域填充从透明到完整显示的开始帧与持续帧数；轮廓描边单独保持显示。 |

平滑轮廓使用闭合 Catmull–Rom 转三次贝塞尔：每段控制点根据相邻顶点及当前 tension 计算。顶点坐标为画布绝对坐标，不是 bbox 内的归一化比例。当前不包含形变动画、顶点控制柄、孔洞或区域内子图形。

### 带注释示例（JSONC）

```jsonc
{
  "canvas": {
    "width": 1920, // 区域 SVG 图层画布宽度（像素）
    "height": 1080 // 区域 SVG 图层画布高度（像素）
  },
  "region": {
    "points": [ // 闭合轮廓锚点；数组顺序为沿边界的连接顺序
      [1150, 268], // 顶部锚点 [x, y]
      [1345, 372], // 右上侧锚点
      [1330, 606], // 右下侧锚点
      [1112, 706], // 底部锚点
      [962, 568], // 左下侧锚点
      [1006, 362] // 左上侧锚点；renderer 自动连接回首点
    ],
    "tension": 1, // 目标平滑强度：0 为直边，1 为完全平滑
    "fill": "#FCFAF4", // 区域填充色
    "stroke": "#1B2430", // 轮廓描边颜色
    "strokeWidth": 3, // 描边宽度（像素）
    "linejoin": "round" // 连接样式：miter 尖角、round 圆角、bevel 斜切
  },
  "animation": {
    "appearStartFrame": 30, // 区域开始淡入帧
    "appearDurationInFrames": 14, // 整体淡入持续帧数
    "smoothStartFrame": 100, // 轮廓平滑变化开始帧
    "smoothDurationInFrames": 70, // 轮廓过渡持续帧数
    "fillStartFrame": 112, // 区域内部填充开始淡入帧
    "fillDurationInFrames": 22 // 填充淡入持续帧数
  }
}
```

该 JSONC 示例用于说明字段，不能直接作为 `.json` 配置使用；实际配置必须保持合法 JSON。

## `_09-curve-band.json`：09 曲线带

配置文件：[`_09-curve-band.json`](_09-curve-band.json)，由 `Scene09` 导入并交给 `CurveBand09` 绘制。该图层背景透明，只绘制曲线带的闭合填充轮廓与描边；不绘制中心线、控制多边形、控制点、端点标记或文字。中心线四个贝塞尔点、带宽、收窄比例、填充描边样式和展开/收窄动画均由 JSON 配置。

### 参数含义

| 字段 | 含义 |
| --- | --- |
| `canvas.width` / `canvas.height` | SVG 图层画布的像素宽、高，应与 Composition 画布一致。 |
| `centerline.start` | 中心线起点 `P0=[x,y]`，单位为画布像素。 |
| `centerline.control1` | 中心线第一贝塞尔控制点 `P1=[x,y]`，决定起始段的切线与弯曲方向。 |
| `centerline.control2` | 中心线第二贝塞尔控制点 `P2=[x,y]`，决定末段的切线与弯曲方向。 |
| `centerline.end` | 中心线终点 `P3=[x,y]`，单位为画布像素。 |
| `band.width` | 带子的最大目标宽度，单位为像素。动画完成且处于宽度峰值的位置达到该宽度。 |
| `band.taper` | 沿路径收窄轮廓的强度，范围 `0–1`；`0` 为等宽，`1` 完全采用正弦宽度轮廓。 |
| `band.minimumWidthRatio` | 两端最小宽度相对于 `band.width` 的比例，范围 `0–1`；只在收窄轮廓启用时参与计算。 |
| `band.fill` | 曲线带闭合区域的填充颜色。 |
| `band.stroke` / `band.strokeWidth` | 闭合轮廓描边颜色和宽度；宽度单位为像素。 |
| `band.linejoin` | 轮廓折点连接样式，可用 `miter`（尖角）、`round`（圆角）或 `bevel`（斜切）；轮廓由采样点近似生成。 |
| `animation.growthStartFrame` / `growthDurationInFrames` | 曲线带从中心线向两侧扩展到目标宽度的开始帧和持续帧数。 |
| `animation.taperStartFrame` / `taperDurationInFrames` | 宽度从等宽过渡到 `band.taper` 目标轮廓的开始帧和持续帧数。 |

renderer 使用三次贝塞尔公式计算中心线与切线，再按单位法线向两侧偏移一半带宽，生成闭合多边形。宽度轮廓为 `width × (1 - taper + taper × (minimumWidthRatio + (1 - minimumWidthRatio) × sin(πt)))`；t 从起点 0 变化到终点 1。当前不配置渐变、箭头或可视控制柄。

### 带注释示例（JSONC）

```jsonc
{
  "canvas": {
    "width": 1920, // 曲线带 SVG 图层画布宽度（像素）
    "height": 1080 // 曲线带 SVG 图层画布高度（像素）
  },
  "centerline": {
    "start": [620, 540], // 中心线起点 P0 的画布坐标 [x, y]
    "control1": [860, 240], // 第一控制点 P1，控制曲线起始弯曲
    "control2": [1220, 780], // 第二控制点 P2，控制曲线末段弯曲
    "end": [1480, 500] // 中心线终点 P3 的画布坐标 [x, y]
  },
  "band": {
    "width": 90, // 带子最大目标宽度（像素）
    "taper": 1, // 收窄轮廓强度：0 等宽，1 完全应用宽度曲线
    "minimumWidthRatio": 0.35, // 两端最小宽度为最大目标宽度的 35%
    "fill": "#FCFAF4", // 闭合带区域填充色
    "stroke": "#1B2430", // 闭合轮廓描边颜色
    "strokeWidth": 2.6, // 描边宽度（像素）
    "linejoin": "round" // 轮廓连接：miter 尖角、round 圆角、bevel 斜切
  },
  "animation": {
    "growthStartFrame": 100, // 带宽从零向外扩展的开始帧
    "growthDurationInFrames": 50, // 扩展至目标宽度的持续帧数
    "taperStartFrame": 155, // 从等宽向收窄宽度轮廓过渡的开始帧
    "taperDurationInFrames": 55 // 宽度轮廓过渡持续帧数
  }
}
```

该 JSONC 示例用于说明字段，不能直接作为 `.json` 配置使用；实际配置必须保持合法 JSON。

## `_12-storage-cylinder.json`：12 圆柱形存储

配置文件：[`_12-storage-cylinder.json`](_12-storage-cylinder.json)，由 `Scene12` 导入并交给 `StorageCylinder12` 绘制。该图层背景透明，只绘制圆柱存储图形：椭圆顶面、两侧柱身、底部前弧和可配置的内部水平分层弧线；不包含虚线后底椭圆、数据库文字、尺寸标注或说明文字。圆柱位置、宽高、椭圆扁率、分层位置、填充描边及各部分动画时间均由 JSON 配置。

### 参数含义

| 字段 | 含义 |
| --- | --- |
| `canvas.width` / `canvas.height` | SVG 图层画布的像素宽、高，应与 Composition 画布一致。 |
| `cylinder.cx` | 圆柱中心轴的水平画布坐标，单位为像素。 |
| `cylinder.topY` / `cylinder.bottomY` | 圆柱顶面和底面的中心 y 坐标，单位为像素；二者差值为柱体总高。 |
| `cylinder.radiusX` | 顶面椭圆的水平半径，也是圆柱柱身的半宽，单位为像素。 |
| `cylinder.radiusY` | 顶面椭圆的垂直半径，单位为像素；椭圆总高为其两倍。 |
| `cylinder.fill` | 圆柱柱身与顶面的填充颜色。 |
| `cylinder.stroke` / `cylinder.strokeWidth` | 外轮廓颜色与宽度，单位为像素。 |
| `cylinder.sectionRatios[]` | 内部分层弧线的垂直比例列表；每项范围 `0–1`，表示从 `topY` 到 `bottomY` 的相对位置。 |
| `cylinder.sectionStrokeWidth` | 内部分层弧线描边宽度，单位为像素。 |
| `animation.outlineStartFrame` / `outlineDurationInFrames` | 顶面、侧边和底部前弧的轮廓绘制开始帧与持续帧数。 |
| `animation.fillStartFrame` / `fillDurationInFrames` | 柱身和顶面填充淡入的开始帧与持续帧数。 |
| `animation.sectionStartFrame` / `sectionDurationInFrames` | 内部分层弧线开始绘制的帧与持续帧数。 |

圆柱的水平范围为 `cx ± radiusX`，总高为 `bottomY - topY`；顶、底面使用 `radiusX × radiusY` 的椭圆。内部弧线按 `topY + (bottomY - topY) × ratio` 定位，并仅绘制前半段。为保持几何合理，`radiusX`、`radiusY` 应大于 0，`bottomY` 应大于 `topY`，分层比例应位于 `0–1`。

### 带注释示例（JSONC）

```jsonc
{
  "canvas": {
    "width": 1920, // 圆柱 SVG 图层画布宽度（像素）
    "height": 1080 // 圆柱 SVG 图层画布高度（像素）
  },
  "cylinder": {
    "cx": 1150, // 圆柱中心轴的水平坐标（像素）
    "topY": 300, // 顶面椭圆中心的 y 坐标（像素）
    "bottomY": 640, // 底部椭圆中心的 y 坐标（像素）；柱高为 340
    "radiusX": 170, // 顶面椭圆水平半径，同时是柱身半宽（像素）
    "radiusY": 46, // 顶面椭圆垂直半径；椭圆总高为 92 像素
    "fill": "#FCFAF4", // 柱身与顶面填充色
    "stroke": "#1B2430", // 外轮廓和分层弧线颜色
    "strokeWidth": 3, // 圆柱外轮廓描边宽度（像素）
    "sectionRatios": [0.3333, 0.6667], // 分层弧线位置比例：约位于柱高的 1/3 和 2/3
    "sectionStrokeWidth": 2.2 // 内部分层弧线描边宽度（像素）
  },
  "animation": {
    "outlineStartFrame": 40, // 外轮廓开始绘制帧
    "outlineDurationInFrames": 80, // 外轮廓绘制持续帧数
    "fillStartFrame": 155, // 柱身和顶面开始填充帧
    "fillDurationInFrames": 27, // 填充淡入持续帧数
    "sectionStartFrame": 190, // 分层弧线开始绘制帧
    "sectionDurationInFrames": 25 // 分层弧线绘制持续帧数
  }
}
```

该 JSONC 示例用于说明字段，不能直接作为 `.json` 配置使用；实际配置必须保持合法 JSON。

## `_13-cloud.json`：13 云形

配置文件：[`_13-cloud.json`](_13-cloud.json)，由 `Scene13` 导入并交给 `Cloud13` 绘制。该图层背景透明，只绘制云形主体；不包含构造阶段的虚线圆、尾部小圆、标题、标注或文字。几何参数沿用旧版 `Cloud13`：4 个圆与一个圆角底座共用旧版局部坐标和整体变换。renderer 先绘制深色形状，再按相同顺序用纸白填充覆盖，以隐藏相交区域内的线条；这与旧版实现一致，不是贝塞尔云形路径或布尔运算。

### 参数含义

| 字段 | 含义 |
| --- | --- |
| `canvas.width` / `canvas.height` | SVG 图层画布的像素宽、高，应与 Composition 画布一致。 |
| `cloud.origin.x` / `cloud.origin.y` | 旧版局部几何原点在画布上的位置，单位为像素。 |
| `cloud.scale` | 对底座及 4 个圆统一应用的缩放比例。 |
| `cloud.base.x` / `y` | 圆角底座左上角相对旧版局部原点的坐标。 |
| `cloud.base.width` / `height` | 圆角底座宽度和高度，单位为旧版局部坐标单位。 |
| `cloud.base.radius` | 圆角底座的圆角半径，单位为旧版局部坐标单位。 |
| `cloud.circles` | 组成云形的圆列表；每一项的 `x`、`y` 是圆心的旧版局部坐标，`radius` 是半径。列表顺序与旧版绘制顺序一致。 |
| `cloud.fill` | 云形主体的纸白填充颜色；用于覆盖交叠区域中的内部描边。 |
| `cloud.stroke` / `cloud.strokeWidth` | 深色描边的颜色和宽度；描边宽度使用旧版局部坐标单位。 |
| `animation.solidStartFrame` | 云形主体淡入开始帧，使用图形图层的局部时间轴。 |
| `animation.solidDurationInFrames` | 云形主体淡入持续帧数。 |

云形的轮廓完全由 `base` 和 `circles` 决定，修改这些字典项即可调整底座或任一云瓣。当前不含旧版演示用构造虚线和思考气泡尾点。

### 带注释示例（JSONC）

```jsonc
{
  "canvas": {
    "width": 1920, // 云形 SVG 图层画布宽度（像素）
    "height": 1080 // 云形 SVG 图层画布高度（像素）
  },
  "cloud": {
    "origin": {"x": 1150, "y": 500}, // 旧版局部坐标原点映射到画布的位置
    "scale": 1.15, // 底座和圆共同使用的整体缩放比例
    "base": {
      "x": -215, // 底座左上角相对局部原点的 x 坐标
      "y": 10, // 底座左上角相对局部原点的 y 坐标
      "width": 430, // 底座宽度
      "height": 90, // 底座高度
      "radius": 38 // 底座圆角半径
    },
    "circles": [ // 按旧版绘制顺序排列；每项包含圆心坐标和半径
      {"x": -132, "y": 28, "radius": 68}, // 左侧圆：圆心 x、圆心 y、半径
      {"x": -30, "y": -5, "radius": 92}, // 左中圆：圆心 x、圆心 y、半径
      {"x": 95, "y": 5, "radius": 78}, // 右中圆：圆心 x、圆心 y、半径
      {"x": 190, "y": 45, "radius": 50} // 右侧圆：圆心 x、圆心 y、半径
    ],
    "fill": "#FCFAF4", // 云形纸白填充，也用于遮盖交叠处内部描边
    "stroke": "#1B2430", // 深色外轮廓描边颜色
    "strokeWidth": 7 // 描边宽度，使用旧版局部坐标单位
  },
  "animation": {
    "solidStartFrame": 90, // 云形主体开始淡入帧
    "solidDurationInFrames": 45 // 云形主体淡入持续帧数
  }
}
```

该 JSONC 示例用于说明字段，不能直接作为 `.json` 配置使用；实际配置必须保持合法 JSON。

## `_14-rhombus.json`：14 菱形

配置文件：[`_14-rhombus.json`](_14-rhombus.json)，由 `Scene14` 导入并交给 `Rhombus14` 绘制。该图层背景透明，只绘制菱形的填充和外轮廓；不包含对角线、等长标记、尺寸标注、铺砖复制或公式文字。中心位置、水平和垂直对角线长度、填充描边样式及绘制动画均由 JSON 配置。默认几何沿用旧版 `Rhombus14` 的中心和两条对角线。

### 参数含义

| 字段 | 含义 |
| --- | --- |
| `canvas.width` / `canvas.height` | SVG 图层画布的像素宽、高，应与 Composition 画布一致。 |
| `rhombus.center` | 菱形中心 `[x,y]` 的画布绝对坐标，单位为像素；两条对角线在此相交并互相平分。 |
| `rhombus.diagonalWidth` | 水平对角线长度，单位为像素。 |
| `rhombus.diagonalHeight` | 垂直对角线长度，单位为像素。 |
| `rhombus.fill` | 菱形内部填充颜色。 |
| `rhombus.stroke` / `rhombus.strokeWidth` | 菱形外轮廓描边颜色和宽度；宽度单位为像素。 |
| `rhombus.linejoin` | 四条边连接处的样式：`miter`（尖角）、`round`（圆角）或 `bevel`（斜切）。 |
| `animation.outlineStartFrame` / `outlineDurationInFrames` | 菱形外轮廓描边动画在图形局部时间轴中的开始帧与持续帧数。 |
| `animation.fillStartFrame` / `fillDurationInFrames` | 菱形填充从透明到完整显示的开始帧与持续帧数。 |

renderer 将中心点和两条对角线换算为四个顶点：左、上、右、下。对角线分别为 `diagonalWidth` 和 `diagonalHeight`，边长由两者共同决定；当两条对角线相等时，菱形为正方形旋转 45°。两条对角线长度应大于 0。

### 带注释示例（JSONC）

```jsonc
{
  "canvas": {
    "width": 1920, // 菱形 SVG 图层画布宽度（像素）
    "height": 1080 // 菱形 SVG 图层画布高度（像素）
  },
  "rhombus": {
    "center": [1150, 480], // 菱形中心坐标 [x, y]
    "diagonalWidth": 640, // 水平对角线长度（像素）
    "diagonalHeight": 400, // 垂直对角线长度（像素）
    "fill": "#FCFAF4", // 菱形内部填充色
    "stroke": "#1B2430", // 外轮廓描边颜色
    "strokeWidth": 3, // 描边宽度（像素）
    "linejoin": "miter" // 连接样式：miter 尖角、round 圆角、bevel 斜切
  },
  "animation": {
    "outlineStartFrame": 36, // 菱形轮廓开始绘制帧
    "outlineDurationInFrames": 96, // 轮廓绘制持续帧数
    "fillStartFrame": 132, // 菱形填充开始淡入帧
    "fillDurationInFrames": 24 // 填充淡入持续帧数
  }
}
```

该 JSONC 示例用于说明字段，不能直接作为 `.json` 配置使用；实际配置必须保持合法 JSON。

## `_15-parallelogram.json`：15 平行四边形

配置文件：[`_15-parallelogram.json`](_15-parallelogram.json)，由 `Scene15` 导入并交给 `Parallelogram15` 绘制。该图层背景透明，只绘制平行四边形本身的填充和外轮廓；不包含旧版教学动画中的剪切分解、三角形平移、梯形、尺寸标注、公式或说明文字。参数沿用旧版 `Parallelogram15` 的最终基础轮廓：左下角 `(710,700)`、右下角 `(1310,700)`、左上角 `(850,440)`、右上角 `(1450,440)`。图形坐标、填充描边样式及轮廓绘制/填充淡入时间由 JSON 驱动。

| 字段 | 含义 |
| --- | --- |
| `canvas.width` / `canvas.height` | SVG 图层画布的像素宽、高，应与 Composition 画布一致。 |
| `parallelogram.x` / `parallelogram.y` | 图形几何包围盒左上角在画布中的坐标，单位为像素。 |
| `parallelogram.width` / `parallelogram.height` | 几何包围盒的宽、高，单位为像素。 |
| `parallelogram.skew` | 水平错切量，单位为像素；本例顶边相对包围盒左侧向右偏移 `140`，底边与顶边长度均为 `width - skew`。 |
| `parallelogram.fill` | 平行四边形内部填充颜色；图层其余区域透明。 |
| `parallelogram.stroke` / `parallelogram.strokeWidth` | 外轮廓描边颜色与宽度；宽度单位为像素。 |
| `parallelogram.linejoin` | 顶点连接样式：`miter`（尖角延伸）、`round`（圆角）、`bevel`（斜切）。 |
| `animation.outlineStartFrame` / `outlineDurationInFrames` | 外轮廓绘制动画在图形局部时间轴中的开始帧与持续帧数。 |
| `animation.fillStartFrame` / `fillDurationInFrames` | 填充从透明到完整显示的开始帧与持续帧数。 |

renderer 按固定顶点规则生成轮廓：`[x+skew,y]`、`[x+width,y]`、`[x+width-skew,y+height]`、`[x,y+height]`，即顶边相对底边向右平移 `skew`。为保持当前这种非退化形态，宽、高需大于 0，`skew` 应大于 0 且小于 `width`。默认值 `x=710, y=440, width=740, height=260, skew=140` 与旧版四个基础顶点一致。

### 带注释示例（JSONC）

```jsonc
{
  "canvas": {
    "width": 1920, // 平行四边形 SVG 图层画布宽度（像素）
    "height": 1080 // 平行四边形 SVG 图层画布高度（像素）
  },
  "parallelogram": {
    "x": 710, // 几何包围盒左上角 x 坐标（像素）
    "y": 440, // 几何包围盒左上角 y 坐标（像素）
    "width": 740, // 几何包围盒宽度（像素），底边和顶边长度为 width - skew
    "height": 260, // 几何包围盒高度（像素）
    "skew": 140, // 水平错切量（像素）；顶边向右偏移该值，需满足 0 < skew < width
    "fill": "#FCFAF4", // 图形内部填充色
    "stroke": "#1B2430", // 外轮廓描边颜色
    "strokeWidth": 3, // 描边宽度（像素）
    "linejoin": "miter" // 顶点连接样式：miter 尖角延伸、round 圆角、bevel 斜切
  },
  "animation": {
    "outlineStartFrame": 58, // 外轮廓开始绘制帧（图形局部时间轴）
    "outlineDurationInFrames": 74, // 外轮廓绘制持续帧数
    "fillStartFrame": 114, // 填充开始淡入帧（图形局部时间轴）
    "fillDurationInFrames": 30 // 填充淡入持续帧数
  }
}
```

该 JSONC 示例用于说明字段，不能直接作为 `.json` 配置使用；实际配置必须保持合法 JSON。

## `_16-triangle.json`：16 三角形

配置文件：[`_16-triangle.json`](_16-triangle.json)，由 `Scene16` 导入并交给 `Triangle16` 绘制。该图层背景透明，只绘制三角形本身的填充和外轮廓；不包含旧版教学动画中的复制、翻转、平移拼接、尺寸标注、锚点标记或说明文字。三个顶点沿用旧版 `Triangle16` 的基础几何：`(820,560)`、`(1420,560)`、`(1080,240)`。三个顶点、填充描边样式及轮廓绘制/填充淡入时间均由 JSON 配置；可通过三个坐标表达不要求是正三角形的三角形。

### 参数含义

| 字段 | 含义 |
| --- | --- |
| `canvas.width` / `canvas.height` | SVG 图层画布的像素宽、高，应与 Composition 画布一致。 |
| `triangle.points` | 三个顶点的画布坐标，格式为 `[[x1,y1],[x2,y2],[x3,y3]]`，坐标单位为像素；renderer 按给定顺序依次连接，并从第三点闭合回第一点。 |
| `triangle.fill` | 三角形内部填充颜色；图层其余区域透明。 |
| `triangle.stroke` / `triangle.strokeWidth` | 外轮廓描边颜色和宽度；宽度单位为像素。 |
| `triangle.linejoin` | 三个顶点的连接样式：`miter`（尖角延伸）、`round`（圆角）、`bevel`（斜切）。 |
| `animation.outlineStartFrame` / `outlineDurationInFrames` | 外轮廓绘制动画在图形局部时间轴中的开始帧与持续帧数。 |
| `animation.fillStartFrame` / `fillDurationInFrames` | 填充从透明到完整显示的开始帧与持续帧数。 |

三个顶点应互不重合且不共线，否则会退化为点或线段而不是有效三角形。顶点顺序决定轮廓绘制方向；修改任一坐标即可调整三角形大小、位置和形状。renderer 不会自动将顶点归一化为正三角形。

### 带注释示例（JSONC）

```jsonc
{
  "canvas": {
    "width": 1920, // 三角形 SVG 图层画布宽度（像素）
    "height": 1080 // 三角形 SVG 图层画布高度（像素）
  },
  "triangle": {
    "points": [[820, 560], [1420, 560], [1080, 240]], // 三个顶点 [x, y]，按数组顺序连接并闭合
    "fill": "#FCFAF4", // 三角形内部填充色
    "stroke": "#1B2430", // 外轮廓描边颜色
    "strokeWidth": 3, // 描边宽度（像素）
    "linejoin": "miter" // 顶点连接样式：miter 尖角延伸、round 圆角、bevel 斜切
  },
  "animation": {
    "outlineStartFrame": 58, // 外轮廓开始绘制帧（图形局部时间轴）
    "outlineDurationInFrames": 74, // 外轮廓绘制持续帧数
    "fillStartFrame": 114, // 填充开始淡入帧（图形局部时间轴）
    "fillDurationInFrames": 30 // 填充淡入持续帧数
  }
}
```

该 JSONC 示例用于说明字段，不能直接作为 `.json` 配置使用；实际配置必须保持合法 JSON。

## `_17-pentagon.json`：17 正五边形

配置文件：[`_17-pentagon.json`](_17-pentagon.json)，由 `Scene17` 导入并交给 `Pentagon17` 绘制。该图层背景透明，只绘制正五边形本身的填充和外轮廓；不包含旧版正多边形 Composition 中其他多边形、圆、顶点标记、角度标注、蜂窝平铺或文字。正五边形由 renderer 固定生成五个等角顶点，中心、外接圆半径、起始顶点朝向、外观及绘制动画由 JSON 配置。几何生成沿用旧版 `Polygon17` 的等分圆周公式；默认中心 `(1150,480)` 和半径 `175` 是单图层展示的画布位置与尺寸。

### 参数含义

| 字段 | 含义 |
| --- | --- |
| `canvas.width` / `canvas.height` | SVG 图层画布的像素宽、高，应与 Composition 画布一致。 |
| `pentagon.center` | 正五边形中心 `[x,y]` 的画布坐标，单位为像素。 |
| `pentagon.radius` | 外接圆半径，单位为像素；五个顶点到中心的距离均为该值。 |
| `pentagon.rotationDegrees` | 第一个顶点相对水平正方向的角度，单位为度；`-90` 表示第一个顶点朝正上方，之后每个顶点按顺时针方向间隔 `72°`。 |
| `pentagon.fill` | 正五边形内部填充颜色；图层其余区域透明。 |
| `pentagon.stroke` / `pentagon.strokeWidth` | 外轮廓描边颜色与宽度；宽度单位为像素。 |
| `pentagon.linejoin` | 五个顶点的连接样式：`miter`（尖角延伸）、`round`（圆角）、`bevel`（斜切）。 |
| `animation.outlineStartFrame` / `outlineDurationInFrames` | 外轮廓绘制动画在图形局部时间轴中的开始帧与持续帧数。 |
| `animation.fillStartFrame` / `fillDurationInFrames` | 填充从透明到完整显示的开始帧与持续帧数。 |

五边形边数固定为 `5`，不是 JSON 参数；本配置只生成正五边形。renderer 根据 `center`、`radius` 和 `rotationDegrees` 均分 `360°` 生成五个顶点，所以图形保持正多边形。半径需大于 0。

### 带注释示例（JSONC）

```jsonc
{
  "canvas": {
    "width": 1920, // 正五边形 SVG 图层画布宽度（像素）
    "height": 1080 // 正五边形 SVG 图层画布高度（像素）
  },
  "pentagon": {
    "center": [1150, 480], // 正五边形中心坐标 [x, y]
    "radius": 175, // 外接圆半径（像素），中心到每个顶点的距离
    "rotationDegrees": -90, // 第一个顶点角度（度）；-90 表示顶点朝上，其余顶点顺时针每隔 72°
    "fill": "#FCFAF4", // 五边形内部填充色
    "stroke": "#1B2430", // 外轮廓描边颜色
    "strokeWidth": 3, // 描边宽度（像素）
    "linejoin": "miter" // 顶点连接样式：miter 尖角延伸、round 圆角、bevel 斜切
  },
  "animation": {
    "outlineStartFrame": 58, // 外轮廓开始绘制帧（图形局部时间轴）
    "outlineDurationInFrames": 74, // 外轮廓绘制持续帧数
    "fillStartFrame": 114, // 填充开始淡入帧（图形局部时间轴）
    "fillDurationInFrames": 30 // 填充淡入持续帧数
  }
}
```

该 JSONC 示例用于说明字段，不能直接作为 `.json` 配置使用；实际配置必须保持合法 JSON。

## `_17-hexagon.json`：17 正六边形

配置文件：[`_17-hexagon.json`](_17-hexagon.json)，由 `Scene17Hexagon` 导入并交给 `Hexagon17` 绘制。该图层背景透明，只绘制正六边形本身的填充和外轮廓；不包含旧版 Composition 中的正五边形、正八边形、圆、顶点标记、角度标注、蜂窝平铺或文字。正六边形由 renderer 固定生成六个等角顶点，中心、外接圆半径、起始顶点朝向、外观及绘制动画由 JSON 配置。几何生成沿用旧版 `Polygon17` 的等分圆周公式；默认中心 `(1150,480)` 和半径 `175` 对应旧版聚焦图形的中心与外接圆半径。

### 参数含义

| 字段 | 含义 |
| --- | --- |
| `canvas.width` / `canvas.height` | SVG 图层画布的像素宽、高，应与 Composition 画布一致。 |
| `hexagon.center` | 正六边形中心 `[x,y]` 的画布坐标，单位为像素。 |
| `hexagon.radius` | 外接圆半径，单位为像素；六个顶点到中心的距离均为该值。 |
| `hexagon.rotationDegrees` | 第一个顶点相对水平正方向的角度，单位为度；`-90` 表示第一个顶点朝正上方，之后每个顶点按顺时针方向间隔 `60°`。 |
| `hexagon.fill` | 正六边形内部填充颜色；图层其余区域透明。 |
| `hexagon.stroke` / `hexagon.strokeWidth` | 外轮廓描边颜色与宽度；宽度单位为像素。 |
| `hexagon.linejoin` | 六个顶点的连接样式：`miter`（尖角延伸）、`round`（圆角）、`bevel`（斜切）。 |
| `animation.outlineStartFrame` / `outlineDurationInFrames` | 外轮廓绘制动画在图形局部时间轴中的开始帧与持续帧数。 |
| `animation.fillStartFrame` / `fillDurationInFrames` | 填充从透明到完整显示的开始帧与持续帧数。 |

六边形边数固定为 `6`，不是 JSON 参数；本配置只生成正六边形，不包含正八边形。renderer 根据 `center`、`radius` 和 `rotationDegrees` 均分 `360°` 生成六个顶点，所以图形保持正多边形。半径需大于 0。

### 带注释示例（JSONC）

```jsonc
{
  "canvas": {
    "width": 1920, // 正六边形 SVG 图层画布宽度（像素）
    "height": 1080 // 正六边形 SVG 图层画布高度（像素）
  },
  "hexagon": {
    "center": [1150, 480], // 正六边形中心坐标 [x, y]
    "radius": 175, // 外接圆半径（像素），中心到每个顶点的距离
    "rotationDegrees": -90, // 第一个顶点角度（度）；-90 表示顶点朝上，其余顶点顺时针每隔 60°
    "fill": "#FCFAF4", // 六边形内部填充色
    "stroke": "#1B2430", // 外轮廓描边颜色
    "strokeWidth": 3, // 描边宽度（像素）
    "linejoin": "miter" // 顶点连接样式：miter 尖角延伸、round 圆角、bevel 斜切
  },
  "animation": {
    "outlineStartFrame": 58, // 外轮廓开始绘制帧（图形局部时间轴）
    "outlineDurationInFrames": 74, // 外轮廓绘制持续帧数
    "fillStartFrame": 114, // 填充开始淡入帧（图形局部时间轴）
    "fillDurationInFrames": 30 // 填充淡入持续帧数
  }
}
```

该 JSONC 示例用于说明字段，不能直接作为 `.json` 配置使用；实际配置必须保持合法 JSON。

## `_17-octagon.json`：17 正八边形

配置文件：[`_17-octagon.json`](_17-octagon.json)，由 `Scene17Octagon` 导入并交给 `Octagon17` 绘制。该图层背景透明，只绘制正八边形本身的填充和外轮廓；不包含旧版 Composition 中的正五边形、正六边形、圆、顶点标记、角度标注、蜂窝平铺或文字。正八边形由 renderer 固定生成八个等角顶点，中心、外接圆半径、起始顶点朝向、外观及绘制动画由 JSON 配置。几何生成沿用旧版 `Polygon17` 的等分圆周公式；默认中心 `(1150,480)` 和半径 `175` 使用与 17 正五边形、正六边形一致的单图层展示坐标与尺寸。

### 参数含义

| 字段 | 含义 |
| --- | --- |
| `canvas.width` / `canvas.height` | SVG 图层画布的像素宽、高，应与 Composition 画布一致。 |
| `octagon.center` | 正八边形中心 `[x,y]` 的画布坐标，单位为像素。 |
| `octagon.radius` | 外接圆半径，单位为像素；八个顶点到中心的距离均为该值。 |
| `octagon.rotationDegrees` | 第一个顶点相对水平正方向的角度，单位为度；`-90` 表示第一个顶点朝正上方，之后每个顶点按顺时针方向间隔 `45°`。 |
| `octagon.fill` | 正八边形内部填充颜色；图层其余区域透明。 |
| `octagon.stroke` / `octagon.strokeWidth` | 外轮廓描边颜色与宽度；宽度单位为像素。 |
| `octagon.linejoin` | 八个顶点的连接样式：`miter`（尖角延伸）、`round`（圆角）、`bevel`（斜切）。 |
| `animation.outlineStartFrame` / `outlineDurationInFrames` | 外轮廓绘制动画在图形局部时间轴中的开始帧与持续帧数。 |
| `animation.fillStartFrame` / `fillDurationInFrames` | 填充从透明到完整显示的开始帧与持续帧数。 |

八边形边数固定为 `8`，不是 JSON 参数；本配置只生成正八边形。renderer 根据 `center`、`radius` 和 `rotationDegrees` 均分 `360°` 生成八个顶点，所以图形保持正多边形。半径需大于 0。

### 带注释示例（JSONC）

```jsonc
{
  "canvas": {
    "width": 1920, // 正八边形 SVG 图层画布宽度（像素）
    "height": 1080 // 正八边形 SVG 图层画布高度（像素）
  },
  "octagon": {
    "center": [1150, 480], // 正八边形中心坐标 [x, y]
    "radius": 175, // 外接圆半径（像素），中心到每个顶点的距离
    "rotationDegrees": -90, // 第一个顶点角度（度）；-90 表示顶点朝上，其余顶点顺时针每隔 45°
    "fill": "#FCFAF4", // 八边形内部填充色
    "stroke": "#1B2430", // 外轮廓描边颜色
    "strokeWidth": 3, // 描边宽度（像素）
    "linejoin": "miter" // 顶点连接样式：miter 尖角延伸、round 圆角、bevel 斜切
  },
  "animation": {
    "outlineStartFrame": 58, // 外轮廓开始绘制帧（图形局部时间轴）
    "outlineDurationInFrames": 74, // 外轮廓绘制持续帧数
    "fillStartFrame": 114, // 填充开始淡入帧（图形局部时间轴）
    "fillDurationInFrames": 30 // 填充淡入持续帧数
  }
}
```

该 JSONC 示例用于说明字段，不能直接作为 `.json` 配置使用；实际配置必须保持合法 JSON。

## `_18-semicircle.json`：18 半圆

配置文件：[`_18-semicircle.json`](_18-semicircle.json)，由 `Scene18Semicircle` 导入并交给 `Semicircle18` 绘制。该图层背景透明，只绘制半圆区域的填充和外轮廓；不包含旧版 `Sector18` 中的复制旋转、四分扇形、角度读数、圆心标记或说明文字。此配置只负责半圆；单独的扇形图形使用 [`_18-sector.json`](_18-sector.json)。半圆的圆心、半径、朝向、填充描边样式及轮廓绘制/填充淡入时间由 JSON 配置。默认圆心 `(1150,470)`、半径 `200` 沿用旧版半圆基础几何。

### 参数含义

| 字段 | 含义 |
| --- | --- |
| `canvas.width` / `canvas.height` | SVG 图层画布的像素宽、高，应与 Composition 画布一致。 |
| `semicircle.center` | 半圆圆心 `[x,y]` 的画布坐标，单位为像素；默认位于直径中点。 |
| `semicircle.radius` | 半圆半径，单位为像素；直径长度为其两倍。 |
| `semicircle.rotationDegrees` | 半圆整体旋转角度，单位为度；`0` 表示弧线向上、直径位于下侧，正值按 SVG 坐标系顺时针旋转。 |
| `semicircle.fill` | 半圆内部填充颜色；图层其余区域透明。 |
| `semicircle.stroke` / `semicircle.strokeWidth` | 半圆弧线及直径的描边颜色和宽度；宽度单位为像素。 |
| `semicircle.linejoin` | 弧线与直径在两个端点处的连接样式：`miter`（尖角延伸）、`round`（圆角）、`bevel`（斜切）。 |
| `animation.outlineStartFrame` / `outlineDurationInFrames` | 半圆弧线和直径的整体轮廓绘制动画在图形局部时间轴中的开始帧与持续帧数。 |
| `animation.fillStartFrame` / `fillDurationInFrames` | 半圆填充从透明到完整显示的开始帧与持续帧数。 |

半圆的圆心角固定为 `180°`，不作为 JSON 参数；`rotationDegrees` 只旋转半圆整体，不改变圆心角。半径需大于 0。轮廓由半圆弧和直径闭合组成，周长为 `π × radius + 2 × radius`。

### 带注释示例（JSONC）

```jsonc
{
  "canvas": {
    "width": 1920, // 半圆 SVG 图层画布宽度（像素）
    "height": 1080 // 半圆 SVG 图层画布高度（像素）
  },
  "semicircle": {
    "center": [1150, 470], // 圆心/直径中点坐标 [x, y]
    "radius": 200, // 半圆半径（像素）
    "rotationDegrees": 0, // 整体旋转角度；0 时弧线向上、直径位于下侧
    "fill": "#FCFAF4", // 半圆内部填充色
    "stroke": "#1B2430", // 弧线及直径的描边颜色
    "strokeWidth": 3, // 描边宽度（像素）
    "linejoin": "miter" // 端点连接样式：miter 尖角延伸、round 圆角、bevel 斜切
  },
  "animation": {
    "outlineStartFrame": 58, // 外轮廓开始绘制帧（图形局部时间轴）
    "outlineDurationInFrames": 74, // 外轮廓绘制持续帧数
    "fillStartFrame": 114, // 填充开始淡入帧（图形局部时间轴）
    "fillDurationInFrames": 30 // 填充淡入持续帧数
  }
}
```

该 JSONC 示例用于说明字段，不能直接作为 `.json` 配置使用；实际配置必须保持合法 JSON。

## `_18-sector.json`：18 扇形

配置文件：[`_18-sector.json`](_18-sector.json)，由 `Scene18Sector` 导入并交给 `Sector18` 绘制。该图层背景透明，只绘制扇形本身的填充、圆弧和两条半径边；不包含圆心标记、角度读数、其他扇区或说明文字。扇形的圆心、半径、起始角、扫过角、填充描边样式及轮廓绘制/填充淡入时间由 JSON 配置。默认圆心 `(1150,470)`、半径 `200` 沿用旧版 `Sector18` 的圆形基础几何，默认角度取其右上四分之一扇区 `Q.tr`。

### 参数含义

| 字段 | 含义 |
| --- | --- |
| `canvas.width` / `canvas.height` | SVG 图层画布的像素宽、高，应与 Composition 画布一致。 |
| `sector.center` | 扇形圆心 `[x,y]` 的画布坐标，单位为像素。 |
| `sector.radius` | 圆弧半径，单位为像素；两条半径边长度均为该值。 |
| `sector.startAngleDegrees` | 起始半径的方向角，单位为度；`0` 指向右侧，`90` 指向下方，按 SVG 画布坐标系顺时针增加。 |
| `sector.sweepAngleDegrees` | 从起始角沿圆弧扫过的有符号角度，单位为度；正值顺时针，负值逆时针，绝对值范围为 `(0,360]`。 |
| `sector.fill` | 扇形内部填充颜色；图层其余区域透明。 |
| `sector.stroke` / `sector.strokeWidth` | 圆弧及两条半径边的描边颜色与宽度；宽度单位为像素。 |
| `sector.linejoin` | 两条半径边与圆弧连接处的样式：`miter`（尖角延伸）、`round`（圆角）、`bevel`（斜切）。 |
| `animation.outlineStartFrame` / `outlineDurationInFrames` | 扇形闭合外轮廓的绘制动画在图形局部时间轴中的开始帧与持续帧数。 |
| `animation.fillStartFrame` / `fillDurationInFrames` | 扇形填充从透明到完整显示的开始帧与持续帧数。 |

扇形的起止半径由 `startAngleDegrees` 和 `sweepAngleDegrees` 决定，圆心角大小为 `abs(sweepAngleDegrees)`；扫过角绝对值为 `180` 时是半圆，为 `360` 时是整圆。起始角可以超出 `[-360°,360°]`，其方向按周期角度计算；半径需大于 0。此配置实现的是一个扇形，不包含圆环或环形扇区。

### 带注释示例（JSONC）

```jsonc
{
  "canvas": {
    "width": 1920, // 扇形 SVG 图层画布宽度（像素）
    "height": 1080 // 扇形 SVG 图层画布高度（像素）
  },
  "sector": {
    "center": [1150, 470], // 扇形圆心坐标 [x, y]
    "radius": 200, // 圆弧半径（像素）
    "startAngleDegrees": -90, // 起始半径方向角；-90° 指向上方
    "sweepAngleDegrees": 90, // 扫过角；正值顺时针，负值逆时针，默认得到右上 90° 扇区
    "fill": "#FCFAF4", // 扇形内部填充色
    "stroke": "#1B2430", // 圆弧和两条半径边的描边颜色
    "strokeWidth": 3, // 描边宽度（像素）
    "linejoin": "miter" // 边连接样式：miter 尖角延伸、round 圆角、bevel 斜切
  },
  "animation": {
    "outlineStartFrame": 58, // 外轮廓开始绘制帧（图形局部时间轴）
    "outlineDurationInFrames": 74, // 外轮廓绘制持续帧数
    "fillStartFrame": 114, // 填充开始淡入帧（图形局部时间轴）
    "fillDurationInFrames": 30 // 填充淡入持续帧数
  }
}
```

该 JSONC 示例用于说明字段，不能直接作为 `.json` 配置使用；实际配置必须保持合法 JSON。

## `_19-arc.json`：19 圆弧

配置文件：[`_19-arc.json`](_19-arc.json)，由 `Scene19` 导入并交给 `Arc19` 绘制。该图层背景透明，只绘制开放圆弧的描边；不绘制填充、圆心到端点的半径线、辅助整圆、角度读数、进度轨道或文字。圆心、半径、起始角、扫过角、描边样式及描边出现动画由 JSON 配置。默认圆心 `(1150,470)`、半径 `195` 沿用旧版 `Arc19` 的基础几何；默认弧线从正上方起始，顺时针扫过 `270°`。

### 参数含义

| 字段 | 含义 |
| --- | --- |
| `canvas.width` / `canvas.height` | SVG 图层画布的像素宽、高，应与 Composition 画布一致。 |
| `arc.center` | 圆弧圆心 `[x,y]` 的画布坐标，单位为像素。 |
| `arc.radius` | 圆弧半径，单位为像素；圆弧上任意点到圆心的距离均为该值。 |
| `arc.startAngleDegrees` | 圆弧起点相对水平正方向的角度，单位为度；`0` 指向右侧，`-90` 指向上方，角度正向按 SVG 坐标系顺时针。 |
| `arc.sweepAngleDegrees` | 从起点沿弧线扫过的有符号角度，单位为度；正值顺时针，负值逆时针，绝对值需大于 `0` 且小于 `360`，从而保持开放圆弧而非整圆。 |
| `arc.stroke` | 圆弧描边颜色。 |
| `arc.strokeWidth` | 圆弧描边宽度，单位为像素。 |
| `arc.linecap` | 圆弧两端的端帽样式：`butt`（平头）、`round`（圆头）、`square`（方头）。 |
| `animation.outlineStartFrame` | 圆弧描边动画在图形局部时间轴中的开始帧。 |
| `animation.outlineDurationInFrames` | 圆弧从起点绘制到终点所用的帧数。 |

圆弧保持开放路径，不会自动闭合成扇形；它没有填充字段。renderer 按 `startAngleDegrees` 和 `sweepAngleDegrees` 计算圆弧两端，再依据扫过角选择 SVG 大弧标志与方向。半径需大于 0，扫过角范围为 `(-360°,0°) ∪ (0°,360°)`。

### 带注释示例（JSONC）

```jsonc
{
  "canvas": {
    "width": 1920, // 圆弧 SVG 图层画布宽度（像素）
    "height": 1080 // 圆弧 SVG 图层画布高度（像素）
  },
  "arc": {
    "center": [1150, 470], // 圆弧圆心坐标 [x, y]
    "radius": 195, // 圆弧半径（像素）
    "startAngleDegrees": -90, // 起点方向；-90° 指向上方
    "sweepAngleDegrees": 270, // 有符号扫过角；正值顺时针，绝对值必须小于 360°
    "stroke": "#1B2430", // 圆弧描边颜色
    "strokeWidth": 3, // 描边宽度（像素）
    "linecap": "round" // 端帽样式：butt 平头、round 圆头、square 方头
  },
  "animation": {
    "outlineStartFrame": 34, // 圆弧开始绘制帧（图形局部时间轴）
    "outlineDurationInFrames": 96 // 圆弧绘制持续帧数
  }
}
```

该 JSONC 示例用于说明字段，不能直接作为 `.json` 配置使用；实际配置必须保持合法 JSON。

## `_20-ring.json`：20 圆环

配置文件：[`_20-ring.json`](_20-ring.json)，由 `Scene20` 导入并交给 `Ring20` 绘制。该图层背景透明，只绘制圆环带的填充、外圆轮廓和内圆轮廓；圆环内部孔洞保持透明。不包含旧版 `Ring20` 中的环宽尺寸线、圆心标记、环形扇区拆分、分离动画或说明文字。圆心、外半径、环宽、填充描边和轮廓/填充动画均由 JSON 配置。默认几何沿用旧版圆环中心 `(1150,470)`、外半径 `200` 和最终内半径 `120`（环宽 `80`）。

### 参数含义

| 字段 | 含义 |
| --- | --- |
| `canvas.width` / `canvas.height` | SVG 图层画布的像素宽、高，应与 Composition 画布一致。 |
| `ring.center` | 圆环中心 `[x,y]` 的画布坐标，单位为像素。 |
| `ring.outerRadius` | 外圆半径，单位为像素。 |
| `ring.thickness` | 环带宽度，单位为像素；内圆半径由 `outerRadius - thickness` 计算。 |
| `ring.fill` | 环带区域的填充颜色；孔洞和图层其余区域透明。 |
| `ring.stroke` | 内、外圆轮廓的描边颜色。 |
| `ring.strokeWidth` | 内、外圆轮廓的描边宽度，单位为像素。 |
| `animation.outlineStartFrame` / `outlineDurationInFrames` | 内外轮廓从各自顶部起点同步绘制的局部开始帧和持续帧数。 |
| `animation.fillStartFrame` / `fillDurationInFrames` | 环带填充从透明到完整显示的局部开始帧和持续帧数。 |

renderer 通过 `innerRadius = outerRadius - thickness` 得到内圆半径，并使用偶奇填充规则构造透明孔洞。为保持环形区域有效，`outerRadius` 需大于 0，`thickness` 需大于 0 且小于 `outerRadius`。本配置只生成完整 360° 圆环，不生成环形扇区。

### 带注释示例（JSONC）

```jsonc
{
  "canvas": {
    "width": 1920, // 圆环 SVG 图层画布宽度（像素）
    "height": 1080 // 圆环 SVG 图层画布高度（像素）
  },
  "ring": {
    "center": [1150, 470], // 圆环中心坐标 [x, y]
    "outerRadius": 200, // 外圆半径（像素）
    "thickness": 80, // 环带宽度（像素）；内半径为 outerRadius - thickness，即 120
    "fill": "#FCFAF4", // 环带填充色，中心孔洞保持透明
    "stroke": "#1B2430", // 内、外轮廓描边颜色
    "strokeWidth": 3 // 内、外轮廓描边宽度（像素）
  },
  "animation": {
    "outlineStartFrame": 58, // 内外轮廓同步开始绘制帧（图形局部时间轴）
    "outlineDurationInFrames": 74, // 内外轮廓绘制持续帧数
    "fillStartFrame": 114, // 环带开始淡入帧（图形局部时间轴）
    "fillDurationInFrames": 30 // 环带填充淡入持续帧数
  }
}
```

该 JSONC 示例用于说明字段，不能直接作为 `.json` 配置使用；实际配置必须保持合法 JSON。

## `_20-annular-sector.json`：20 环形扇区

配置文件：[`_20-annular-sector.json`](_20-annular-sector.json)，由 `Scene20AnnularSector` 导入并交给 `AnnularSector20` 绘制。该图层背景透明，只绘制环形扇区带的填充、内外圆弧和两端径向边；环带以内和外部区域均透明。不包含旧版 `Ring20` 中的其他扇区、分离动画、尺寸线、圆心标记或说明文字。中心、内外半径、起始角、扫过角、填充描边样式及轮廓/填充动画均由 JSON 配置。默认内外半径 `120/200` 沿用旧版最终圆环厚度，默认角度沿用旧版右上四分之一环形扇区。

### 参数含义

| 字段 | 含义 |
| --- | --- |
| `canvas.width` / `canvas.height` | SVG 图层画布的像素宽、高，应与 Composition 画布一致。 |
| `annularSector.center` | 环形扇区圆心 `[x,y]` 的画布坐标，单位为像素。 |
| `annularSector.outerRadius` | 外圆弧半径，单位为像素。 |
| `annularSector.innerRadius` | 内圆弧半径，单位为像素；它与外半径之间构成环带宽度。 |
| `annularSector.startAngleDegrees` | 起始径向边的方向角，单位为度；`0` 指向右侧，`-90` 指向上方，角度正向按 SVG 坐标系顺时针。 |
| `annularSector.sweepAngleDegrees` | 从起始角沿外圆弧扫过的有符号角度，单位为度；正值顺时针、负值逆时针，绝对值范围为 `(0,360)`。 |
| `annularSector.fill` | 环形扇区带的填充颜色；内孔和图层其余区域透明。 |
| `annularSector.stroke` / `annularSector.strokeWidth` | 内外圆弧及两端径向边的描边颜色和宽度；宽度单位为像素。 |
| `annularSector.linejoin` | 圆弧与径向边相接处的样式：`miter`（尖角延伸）、`round`（圆角）、`bevel`（斜切）。 |
| `animation.outlineStartFrame` / `outlineDurationInFrames` | 闭合环形扇区外轮廓的绘制动画在图形局部时间轴中的开始帧和持续帧数。 |
| `animation.fillStartFrame` / `fillDurationInFrames` | 环带填充从透明到完整显示的局部开始帧和持续帧数。 |

renderer 从起始角计算外圆弧起点，沿 `sweepAngleDegrees` 到外弧终点，再连接对应内弧终点，沿内圆弧反向返回并闭合。需要满足 `outerRadius > innerRadius > 0`，且扫过角绝对值大于 `0°`、小于 `360°`；完整 `360°` 圆环由 [`_20-ring.json`](_20-ring.json) 配置。

### 带注释示例（JSONC）

```jsonc
{
  "canvas": {
    "width": 1920, // 环形扇区 SVG 图层画布宽度（像素）
    "height": 1080 // 环形扇区 SVG 图层画布高度（像素）
  },
  "annularSector": {
    "center": [1150, 470], // 环形扇区圆心坐标 [x, y]
    "outerRadius": 200, // 外圆弧半径（像素）
    "innerRadius": 120, // 内圆弧半径（像素），小于 outerRadius
    "startAngleDegrees": -90, // 起始径向边角度；-90° 指向上方
    "sweepAngleDegrees": 90, // 扫过角；正值顺时针，负值逆时针，绝对值小于 360°
    "fill": "#FCFAF4", // 环带填充色，内孔保持透明
    "stroke": "#1B2430", // 内外圆弧和径向边的描边颜色
    "strokeWidth": 3, // 描边宽度（像素）
    "linejoin": "miter" // 边连接样式：miter 尖角延伸、round 圆角、bevel 斜切
  },
  "animation": {
    "outlineStartFrame": 58, // 外轮廓开始绘制帧（图形局部时间轴）
    "outlineDurationInFrames": 74, // 外轮廓绘制持续帧数
    "fillStartFrame": 114, // 环带填充开始淡入帧（图形局部时间轴）
    "fillDurationInFrames": 30 // 环带填充淡入持续帧数
  }
}
```

该 JSONC 示例用于说明字段，不能直接作为 `.json` 配置使用；实际配置必须保持合法 JSON。

## `_21-callout-bubble.json`：21 标注气泡

配置文件：[`_21-callout-bubble.json`](_21-callout-bubble.json)，由 `Scene21` 导入并交给 `CalloutBubble21` 绘制。该图层背景透明，只绘制圆角矩形气泡主体和与主体连成一体的底部尾端；不包含气泡文字、指向目标的圆点、第二目标位置或尾端滑动动画。主体位置、尺寸、圆角、尾端基点与尖端坐标、填充描边及描边/填充动画由 JSON 配置。默认主体与尾端基础几何沿用旧版 `Bubble21` 的初始状态。

### 参数含义

| 字段 | 含义 |
| --- | --- |
| `canvas.width` / `canvas.height` | SVG 图层画布的像素宽、高，应与 Composition 画布一致。 |
| `callout.x` / `callout.y` | 圆角矩形主体左上角的画布坐标，单位为像素。 |
| `callout.width` / `callout.height` | 气泡主体的宽、高，单位为像素；不包含尾端向下延伸的长度。 |
| `callout.radius` | 主体四角的圆角半径，单位为像素。 |
| `callout.fill` | 气泡主体和尾端内部的填充颜色；图层其他区域透明。 |
| `callout.stroke` / `callout.strokeWidth` | 气泡主体和尾端连贯外轮廓的描边颜色与宽度；宽度单位为像素。 |
| `callout.linejoin` | 尾端尖角等路径连接处的样式：`miter`（尖角延伸）、`round`（圆角）、`bevel`（斜切）。 |
| `callout.tail.baseCenterX` | 尾端与主体底边连接区间的水平中心坐标，单位为画布像素。 |
| `callout.tail.width` | 尾端在主体底边上的基底宽度，单位为像素；基底端点位于 `baseCenterX ± width/2`。 |
| `callout.tail.tip` | 尾端尖点的画布坐标 `[x,y]`，单位为像素。 |
| `animation.outlineStartFrame` / `outlineDurationInFrames` | 气泡完整外轮廓开始绘制的局部帧与持续帧数。 |
| `animation.fillStartFrame` / `fillDurationInFrames` | 气泡填充从透明到完整显示的局部开始帧和持续帧数。 |

本配置的尾端固定从主体底边伸出；`tail.baseCenterX` 应使尾端基底位于圆角转折范围以内，避免压到圆角区，尖点通常应位于主体下方（`tip.y > y + height`）。主体宽、高应大于 0，圆角半径不应大于主体高度或宽度的一半，尾端宽度应大于 0。

### 带注释示例（JSONC）

```jsonc
{
  "canvas": {
    "width": 1920, // 标注气泡 SVG 图层画布宽度（像素）
    "height": 1080 // 标注气泡 SVG 图层画布高度（像素）
  },
  "callout": {
    "x": 820, // 主体左上角 x 坐标（像素）
    "y": 300, // 主体左上角 y 坐标（像素）
    "width": 480, // 圆角矩形主体宽度（像素）
    "height": 180, // 圆角矩形主体高度（像素，不含尾端）
    "radius": 26, // 主体四角圆角半径（像素）
    "fill": "#FCFAF4", // 主体和尾端的填充色
    "stroke": "#1B2430", // 连续外轮廓描边颜色
    "strokeWidth": 3, // 描边宽度（像素）
    "linejoin": "miter", // 路径连接样式：miter 尖角延伸、round 圆角、bevel 斜切
    "tail": {
      "baseCenterX": 1090, // 尾端基底中心的画布 x 坐标
      "width": 60, // 尾端在主体底边上的基底宽度（像素）
      "tip": [1180, 610] // 尾端尖点坐标 [x, y]（像素）
    }
  },
  "animation": {
    "outlineStartFrame": 58, // 外轮廓开始绘制帧（图形局部时间轴）
    "outlineDurationInFrames": 74, // 外轮廓绘制持续帧数
    "fillStartFrame": 114, // 填充开始淡入帧（图形局部时间轴）
    "fillDurationInFrames": 30 // 填充淡入持续帧数
  }
}
```

该 JSONC 示例用于说明字段，不能直接作为 `.json` 配置使用；实际配置必须保持合法 JSON。

## `_22-curly-brace.json`：22 大括号

配置文件：[`_22-curly-brace.json`](_22-curly-brace.json)，由 `Scene22` 导入并交给 `CurlyBrace22` 绘制。该图层背景透明，只绘制一条开放的大括号曲线；不包含方括号图形、圆括号、被括内容、对照卡片或说明文字。位置、宽高、描边样式和描边绘制动画由 JSON 配置。默认曲线范围和形态沿用旧版 `Bracket22` 的大括号路径；大括号开口朝右，中部尖点朝左。方括号另有独立配置 [`_22-square-bracket.json`](_22-square-bracket.json)。

### 参数含义

| 字段 | 含义 |
| --- | --- |
| `canvas.width` / `canvas.height` | SVG 图层画布的像素宽、高，应与 Composition 画布一致。 |
| `brace.x` / `brace.y` | 大括号曲线边界框左上角的画布坐标，单位为像素。 |
| `brace.width` / `brace.height` | 大括号曲线边界框的宽、高，单位为像素；renderer 按固定比例生成曲线控制点。 |
| `brace.stroke` | 大括号曲线的描边颜色。 |
| `brace.strokeWidth` | 曲线描边宽度，单位为像素。 |
| `brace.linecap` | 开放路径两端的端帽样式：`butt`（平头）、`round`（圆头）、`square`（方头）。 |
| `animation.outlineStartFrame` | 大括号曲线开始绘制的图形局部帧。 |
| `animation.outlineDurationInFrames` | 大括号曲线从上端到下端完整绘制所用帧数。 |

该大括号是开放描边路径，没有填充字段。renderer 固定按 `width`、`height` 的比例生成上下两段弯曲线和中间内收尖点，开口方向固定朝右；宽、高需大于 0。调整边界框会等比例缩放曲线构造。

### 带注释示例（JSONC）

```jsonc
{
  "canvas": {
    "width": 1920, // 大括号 SVG 图层画布宽度（像素）
    "height": 1080 // 大括号 SVG 图层画布高度（像素）
  },
  "brace": {
    "x": 660, // 曲线边界框左上角 x 坐标（像素）
    "y": 300, // 曲线边界框左上角 y 坐标（像素）
    "width": 80, // 曲线边界框宽度（像素）
    "height": 400, // 曲线边界框高度（像素）
    "stroke": "#1B2430", // 大括号描边颜色
    "strokeWidth": 3, // 描边宽度（像素）
    "linecap": "round" // 端帽样式：butt 平头、round 圆头、square 方头
  },
  "animation": {
    "outlineStartFrame": 58, // 曲线开始绘制帧（图形局部时间轴）
    "outlineDurationInFrames": 74 // 曲线绘制持续帧数
  }
}
```

该 JSONC 示例用于说明字段，不能直接作为 `.json` 配置使用；实际配置必须保持合法 JSON。

## `_22-square-bracket.json`：22 方括号

配置文件：[`_22-square-bracket.json`](_22-square-bracket.json)，由 `Scene22SquareBracket` 导入并交给 `SquareBracket22` 绘制。该图层背景透明，只绘制由三段直线组成的开放方括号路径；不包含大括号、圆括号、被括内容、对照卡片或说明文字。边界框位置与尺寸、描边样式及路径绘制动画由 JSON 配置。默认路径沿用旧版 `Bracket22` 的方括号基础几何，开口朝右；圆括号另有独立配置 [`_22-round-bracket.json`](_22-round-bracket.json)。

### 参数含义

| 字段 | 含义 |
| --- | --- |
| `canvas.width` / `canvas.height` | SVG 图层画布的像素宽、高，应与 Composition 画布一致。 |
| `bracket.x` / `bracket.y` | 方括号路径边界框左上角的画布坐标，单位为像素。 |
| `bracket.width` / `bracket.height` | 方括号路径边界框的宽、高，单位为像素；横线伸出长度为 `width`，竖线长度为 `height`。 |
| `bracket.stroke` | 方括号描边颜色。 |
| `bracket.strokeWidth` | 方括号描边宽度，单位为像素。 |
| `bracket.linecap` | 开放路径两端的端帽样式：`butt`（平头）、`round`（圆头）、`square`（方头）。 |
| `bracket.linejoin` | 三段直线连接处的样式：`miter`（尖角延伸）、`round`（圆角）、`bevel`（斜切）。 |
| `animation.outlineStartFrame` | 方括号路径开始绘制的图形局部帧。 |
| `animation.outlineDurationInFrames` | 路径从上端起点绘制到下端终点所用帧数。 |

方括号是无填充的开放路径，几何顺序固定为右上端点 → 左上端点 → 左下端点 → 右下端点，因此开口朝右。`width` 和 `height` 应大于 0。

### 带注释示例（JSONC）

```jsonc
{
  "canvas": {
    "width": 1920, // 方括号 SVG 图层画布宽度（像素）
    "height": 1080 // 方括号 SVG 图层画布高度（像素）
  },
  "bracket": {
    "x": 690, // 路径左上角 x 坐标（像素）
    "y": 300, // 路径左上角 y 坐标（像素）
    "width": 50, // 水平短边伸出长度（像素）
    "height": 400, // 垂直长边长度（像素）
    "stroke": "#1B2430", // 描边颜色
    "strokeWidth": 3.4, // 描边宽度（像素）
    "linecap": "round", // 端帽样式：butt 平头、round 圆头、square 方头
    "linejoin": "round" // 转角样式：miter 尖角延伸、round 圆角、bevel 斜切
  },
  "animation": {
    "outlineStartFrame": 58, // 路径开始绘制帧（图形局部时间轴）
    "outlineDurationInFrames": 74 // 路径绘制持续帧数
  }
}
```

该 JSONC 示例用于说明字段，不能直接作为 `.json` 配置使用；实际配置必须保持合法 JSON。

## `_22-round-bracket.json`：22 圆括号

配置文件：[`_22-round-bracket.json`](_22-round-bracket.json)，由 `Scene22RoundBracket` 导入并交给 `RoundBracket22` 绘制。该图层背景透明，只绘制一条开放的三次贝塞尔圆括号曲线；不包含大括号、方括号、被括内容、对照卡片或说明文字。边界框位置与尺寸、描边样式及曲线绘制动画由 JSON 配置。默认路径沿用旧版 `Bracket22` 的圆括号基础曲线，端点位于右侧，弧线向左侧鼓出。

### 参数含义

| 字段 | 含义 |
| --- | --- |
| `canvas.width` / `canvas.height` | SVG 图层画布的像素宽、高，应与 Composition 画布一致。 |
| `roundBracket.x` / `roundBracket.y` | 圆括号曲线边界框左上角的画布坐标，单位为像素。 |
| `roundBracket.width` / `roundBracket.height` | 曲线边界框的宽、高，单位为像素；宽度控制左右端点与弧线最大鼓出距离，高度控制上下端点距离。 |
| `roundBracket.stroke` | 圆括号曲线的描边颜色。 |
| `roundBracket.strokeWidth` | 曲线描边宽度，单位为像素。 |
| `roundBracket.linecap` | 开放路径两端的端帽样式：`butt`（平头）、`round`（圆头）、`square`（方头）。 |
| `animation.outlineStartFrame` | 圆括号曲线开始绘制的图形局部帧。 |
| `animation.outlineDurationInFrames` | 曲线从上端点绘制到下端点所用帧数。 |

圆括号是无填充的开放三次贝塞尔曲线。renderer 固定使用一个三次贝塞尔段连接右上和右下端点，两个控制点按边界框比例设置在左侧，因此弧线向左鼓出。宽、高应大于 0。

### 带注释示例（JSONC）

```jsonc
{
  "canvas": {
    "width": 1920, // 圆括号 SVG 图层画布宽度（像素）
    "height": 1080 // 圆括号 SVG 图层画布高度（像素）
  },
  "roundBracket": {
    "x": 650, // 曲线边界框左上角 x 坐标（像素）
    "y": 300, // 曲线边界框左上角 y 坐标（像素）
    "width": 90, // 左右端点和弧线鼓出量的水平范围（像素）
    "height": 400, // 上下端点距离（像素）
    "stroke": "#1B2430", // 曲线描边颜色
    "strokeWidth": 3.4, // 描边宽度（像素）
    "linecap": "round" // 端帽样式：butt 平头、round 圆头、square 方头
  },
  "animation": {
    "outlineStartFrame": 58, // 曲线开始绘制帧（图形局部时间轴）
    "outlineDurationInFrames": 74 // 曲线绘制持续帧数
  }
}
```

该 JSONC 示例用于说明字段，不能直接作为 `.json` 配置使用；实际配置必须保持合法 JSON。

## `_23-star.json`：23 星形

配置文件：[`_23-star.json`](_23-star.json)，由 `Scene23` 导入并交给 `Star23` 绘制。该图层背景透明，只绘制星形本身的填充与外轮廓；不包含旧版 `Star23` 中的四角星芒、外接圆、顶点标记、内半径刻度、星形阵列或说明文字。中心、角数、内外半径比例、朝向、填充描边和轮廓/填充动画由 JSON 配置。默认几何沿用旧版五角星状态：中心 `(1150,470)`、外半径 `220`、内半径比例 `0.5`、顶点朝上。

| 字段 | 含义 |
| --- | --- |
| `canvas.width` / `canvas.height` | SVG 图层画布的像素宽、高，应与 Composition 画布一致。 |
| `star.center` | 星形中心 `[x,y]` 的画布坐标，单位为像素。 |
| `star.points` | 外角数量；必须是整数且至少为 `5`。renderer 会将小于 5 的值提升为 5，因此不会生成四角星芒。 |
| `star.outerRadius` | 外角到中心的半径，单位为像素。 |
| `star.innerRadiusRatio` | 内半径与外半径的比例，范围为 `(0,1)`；实际内半径为 `outerRadius × innerRadiusRatio`。数值越小，内角越深、星角越尖。 |
| `star.rotationDegrees` | 第一个外角相对水平正方向的角度，单位为度；`-90` 表示第一个外角朝正上方，后续外角均匀分布。 |
| `star.fill` | 星形内部填充颜色；图层其他区域透明。 |
| `star.stroke` / `star.strokeWidth` | 星形外轮廓描边颜色与宽度；宽度单位为像素。 |
| `star.linejoin` | 外角与内角顶点连接样式：`miter`（尖角延伸）、`round`（圆角）、`bevel`（斜切）。 |
| `animation.outlineStartFrame` / `outlineDurationInFrames` | 外轮廓绘制动画的图形局部开始帧和持续帧数。 |
| `animation.fillStartFrame` / `fillDurationInFrames` | 星形填充从透明到完整显示的局部开始帧和持续帧数。 |

renderer 按“外角、内角”交替生成顶点，共 `points × 2` 个点；外角均匀分布在外接圆上，内角使用 `outerRadius × innerRadiusRatio`。`outerRadius` 应大于 0，`innerRadiusRatio` 应大于 0 且小于 1。该任务只实现五角及更多角数的星形，不实现四角星芒。

### 带注释示例（JSONC）

```jsonc
{
  "canvas": {
    "width": 1920, // 星形 SVG 图层画布宽度（像素）
    "height": 1080 // 星形 SVG 图层画布高度（像素）
  },
  "star": {
    "center": [1150, 470], // 星形中心坐标 [x, y]
    "points": 5, // 外角数量，最小为 5；不生成四角星芒
    "outerRadius": 220, // 中心到外角的半径（像素）
    "innerRadiusRatio": 0.5, // 内半径 / 外半径；0.5 表示内角半径为 110 像素
    "rotationDegrees": -90, // 第一个外角朝向；-90° 表示顶角朝上
    "fill": "#FCFAF4", // 星形内部填充色
    "stroke": "#1B2430", // 外轮廓描边颜色
    "strokeWidth": 3, // 描边宽度（像素）
    "linejoin": "miter" // 顶点连接样式：miter 尖角延伸、round 圆角、bevel 斜切
  },
  "animation": {
    "outlineStartFrame": 58, // 外轮廓开始绘制帧（图形局部时间轴）
    "outlineDurationInFrames": 74, // 外轮廓绘制持续帧数
    "fillStartFrame": 114, // 填充开始淡入帧（图形局部时间轴）
    "fillDurationInFrames": 30 // 填充淡入持续帧数
  }
}
```

该 JSONC 示例用于说明字段，不能直接作为 `.json` 配置使用；实际配置必须保持合法 JSON。

## `_24-plus.json`：24 加号

配置文件：[`_24-plus.json`](_24-plus.json)，由 `Scene24` 导入并交给 `Plus24` 绘制。该图层背景透明，只绘制一条水平线和一条垂直线组成的加号；方向固定为水平/垂直，不提供旋转角度，因此不会变成 45° 叉号。本项不包含矩形加号、线段叉号、矩形叉号、按钮容器、角度标记、锚点或说明文字。中心、单侧臂长、笔触样式，以及横线和竖线各自的绘制时间由 JSON 配置。

| 字段 | 含义 |
| --- | --- |
| `canvas.width` / `canvas.height` | 加号 SVG 图层画布的像素宽、高，应与 Composition 画布一致。 |
| `plus.center` | 加号中心 `[x,y]` 的画布坐标，单位为像素；水平线和垂直线相交于此点。 |
| `plus.armLength` | 中心到每个线段端点的距离，单位为像素；每条线段的总长度为 `armLength × 2`。 |
| `plus.stroke` | 两条线共用的笔触颜色。 |
| `plus.strokeWidth` | 两条线共用的笔触宽度，单位为像素；本例为 `6`，形成线形加号。 |
| `plus.linecap` | 线段端帽样式：`butt`（平头，不延伸出端点）、`round`（圆头）、`square`（方头，延伸半个线宽）。 |
| `animation.horizontalStartFrame` / `horizontalDurationInFrames` | 横线绘制动画的图形局部开始帧和持续帧数。 |
| `animation.verticalStartFrame` / `verticalDurationInFrames` | 竖线绘制动画的图形局部开始帧和持续帧数；可与横线分开设置。 |

renderer 使用两条固定方向的 SVG 线段：横线从 `(cx - armLength, cy)` 延伸至 `(cx + armLength, cy)`，竖线从 `(cx, cy - armLength)` 延伸至 `(cx, cy + armLength)`。`armLength` 和 `strokeWidth` 应大于 0。两条线分别由各自的局部帧参数驱动描边揭示；Scene JSON 的图层时间轴负责把 Composition 帧换算为本层局部帧。线段叉号和矩形叉号分别由 `_24-cross.json` 和 `_24-rect-cross.json` 配置。

### 带注释示例（JSONC）

```jsonc
{
  "canvas": {
    "width": 1920, // 加号 SVG 图层画布宽度（像素）
    "height": 1080 // 加号 SVG 图层画布高度（像素）
  },
  "plus": {
    "center": [1150, 500], // 两条线相交处的中心坐标 [x, y]
    "armLength": 260, // 中心到端点的距离（像素）；每条线总长为 520 像素
    "stroke": "#1B2430", // 横线和竖线共用的颜色
    "strokeWidth": 6, // 横线和竖线共用的线宽（像素）
    "linecap": "butt" // 端帽样式：butt 平头、round 圆头、square 方头
  },
  "animation": {
    "horizontalStartFrame": 34, // 横线开始绘制帧（图形局部时间轴）
    "horizontalDurationInFrames": 28, // 横线绘制持续帧数
    "verticalStartFrame": 58, // 竖线开始绘制帧（图形局部时间轴）
    "verticalDurationInFrames": 22 // 竖线绘制持续帧数
  }
}
```

该 JSONC 示例用于说明字段，不能直接作为 `.json` 配置使用；实际配置必须保持合法 JSON。

## `_24-rect-plus.json`：24 矩形加号

配置文件：[`_24-rect-plus.json`](_24-rect-plus.json)，由 `Scene24RectPlus` 导入并交给 `RectPlus24` 绘制。该透明图层用两个 SVG 矩形分别绘制横臂和竖臂，并以闭合路径描画合并后的外轮廓；轮廓路径只负责描边，不代替矩形填充。它与 `_24-plus.json` 的线段加号是两种独立实现。

### 参数含义

| 字段 | 含义 |
| --- | --- |
| `canvas.width` / `canvas.height` | SVG 图层画布的像素宽、高，应与 Composition 画布一致。 |
| `plus.center` | 两个矩形臂交叠中心 `[x,y]` 的画布坐标，单位为像素。 |
| `plus.armLength` | 中心到每个矩形臂外端的距离，单位为像素；每个矩形臂总长为 `armLength × 2`。 |
| `plus.armWidth` | 横臂高度和竖臂宽度的共同值，单位为像素。 |
| `plus.fill` | 两个矩形臂的填充颜色。 |
| `plus.stroke` / `plus.strokeWidth` | 合并后加号外轮廓的描边颜色与宽度，宽度单位为像素；两条矩形本身不各自描边，因此交叠处不会出现内缝。 |
| `plus.linejoin` | 合并外轮廓顶点连接样式：`miter`（尖角延伸）、`round`（圆角）、`bevel`（斜切）。 |
| `animation.horizontalStartFrame` / `horizontalDurationInFrames` | 横向矩形臂淡入的图形局部开始帧和持续帧数。 |
| `animation.verticalStartFrame` / `verticalDurationInFrames` | 纵向矩形臂淡入的图形局部开始帧和持续帧数。 |
| `animation.outlineStartFrame` / `outlineDurationInFrames` | 合并外轮廓描边动画的图形局部开始帧和持续帧数。 |

renderer 将 `armLength`、`armWidth` 转换为两个重叠的矩形：横臂宽 `2 × armLength`、高 `armWidth`；竖臂宽 `armWidth`、高 `2 × armLength`。`armLength`、`armWidth` 应大于 0，且 `armWidth < 2 × armLength` 才能保持加号凹口。填充只由两个 `<rect>` 绘制，闭合路径只提供无内缝的外轮廓描边。

### 带注释示例（JSONC）

```jsonc
{
  "canvas": {
    "width": 1920, // 矩形加号 SVG 图层画布宽度（像素）
    "height": 1080 // 矩形加号 SVG 图层画布高度（像素）
  },
  "plus": {
    "center": [1150, 500], // 横向和纵向矩形臂交叠的中心坐标 [x, y]
    "armLength": 260, // 中心到每个矩形臂外端的距离；矩形总长为 520 像素
    "armWidth": 110, // 横臂的高度及竖臂的宽度（像素）
    "fill": "#1B2430", // 两个矩形臂的填充颜色
    "stroke": "#1B2430", // 合并后加号外轮廓的描边颜色
    "strokeWidth": 3, // 合并后外轮廓的描边宽度（像素）
    "linejoin": "miter" // 顶点连接样式：miter 尖角、round 圆角、bevel 斜切
  },
  "animation": {
    "horizontalStartFrame": 58, // 横向矩形臂开始淡入帧（图形局部时间轴）
    "horizontalDurationInFrames": 40, // 横向矩形臂淡入持续帧数
    "verticalStartFrame": 80, // 纵向矩形臂开始淡入帧（图形局部时间轴）
    "verticalDurationInFrames": 40, // 纵向矩形臂淡入持续帧数
    "outlineStartFrame": 58, // 合并外轮廓开始绘制帧（图形局部时间轴）
    "outlineDurationInFrames": 74 // 合并外轮廓绘制持续帧数
  }
}
```

该 JSONC 示例用于说明字段，不能直接作为 `.json` 配置使用；实际配置必须保持合法 JSON。

## `_24-rect-cross.json`：24 矩形叉号

配置文件：[`_24-rect-cross.json`](_24-rect-cross.json)，由 `Scene24RectCross` 导入并交给 `RectCross24` 绘制。该透明图层由两条相交的旋转矩形组成叉号；两条矩形分别描边，所以交叠处保留矩形边界，明确表现“矩形组成”的结构。不包含线段叉号、水平/垂直加号、角度标记、锚点或说明文字。中心、矩形长宽、旋转角、填充描边样式以及两条矩形各自的淡入时间由 JSON 配置。

### 参数含义

| 字段 | 含义 |
| --- | --- |
| `canvas.width` / `canvas.height` | SVG 图层画布的像素宽、高，应与 Composition 画布一致。 |
| `crossRect.center` | 两条矩形交叠中心 `[x,y]` 的画布坐标，单位为像素。 |
| `crossRect.armLength` | 每条矩形中心到端部的距离，单位为像素；矩形总长为 `armLength × 2`。 |
| `crossRect.armWidth` | 每条矩形的宽度，单位为像素。 |
| `crossRect.rotationDegrees` | 第一条矩形相对水平正方向的旋转角度，单位为度；第二条矩形使用相反角度。 |
| `crossRect.fill` | 两条矩形共用的填充颜色。 |
| `crossRect.stroke` / `crossRect.strokeWidth` | 两条矩形共用的轮廓描边颜色和宽度，宽度单位为像素；矩形交叠处会保留各自的描边线。 |
| `animation.firstRectStartFrame` / `firstRectDurationInFrames` | 第一条矩形淡入的图形局部开始帧和持续帧数。 |
| `animation.secondRectStartFrame` / `secondRectDurationInFrames` | 第二条矩形淡入的图形局部开始帧和持续帧数。 |

renderer 以 `center` 为中心创建两个尺寸相同的 SVG 矩形：宽为 `2 × armLength`、高为 `armWidth`，分别旋转 `rotationDegrees` 和 `-rotationDegrees`。`armLength`、`armWidth` 和 `strokeWidth` 应大于 0。两条矩形分别由局部时间轴控制透明度；Scene JSON 的图层时间轴负责把 Composition 帧换算为本层局部帧。

### 带注释示例（JSONC）

```jsonc
{
  "canvas": {
    "width": 1920, // 矩形叉号 SVG 图层画布宽度（像素）
    "height": 1080 // 矩形叉号 SVG 图层画布高度（像素）
  },
  "crossRect": {
    "center": [1150, 500], // 两条矩形交叠中心的画布坐标 [x, y]
    "armLength": 260, // 中心到矩形端部的距离；每条矩形总长为 520 像素
    "armWidth": 110, // 每条矩形的宽度（像素）
    "rotationDegrees": 45, // 第一条矩形旋转角；第二条使用 -45 度
    "fill": "#1B2430", // 两条矩形共用的填充颜色
    "stroke": "#1B2430", // 两条矩形共用的轮廓描边颜色
    "strokeWidth": 3 // 两条矩形共用的描边宽度（像素）
  },
  "animation": {
    "firstRectStartFrame": 58, // 第一条矩形开始淡入帧（图形局部时间轴）
    "firstRectDurationInFrames": 40, // 第一条矩形淡入持续帧数
    "secondRectStartFrame": 80, // 第二条矩形开始淡入帧（图形局部时间轴）
    "secondRectDurationInFrames": 40 // 第二条矩形淡入持续帧数
  }
}
```

该 JSONC 示例用于说明字段，不能直接作为 `.json` 配置使用；实际配置必须保持合法 JSON。

## `_24-cross.json`：24 叉号

配置文件：[`_24-cross.json`](_24-cross.json)，由 `Scene24Cross` 导入并交给 `Cross24` 绘制。该图层背景透明，只绘制两条交叉线组成的叉号；默认旋转角为 `45°`。它与两条旋转矩形组成的 [`_24-rect-cross.json`](_24-rect-cross.json) 是独立示例。本项不包含水平/垂直方向的加号状态、按钮容器、角度标记、锚点或说明文字。中心、单侧臂长、旋转角、笔触样式，以及两条线各自的绘制时间由 JSON 配置。

| 字段 | 含义 |
| --- | --- |
| `canvas.width` / `canvas.height` | 叉号 SVG 图层画布的像素宽、高，应与 Composition 画布一致。 |
| `cross.center` | 叉号中心 `[x,y]` 的画布坐标，单位为像素；两条线在此点相交。 |
| `cross.armLength` | 中心到每个线段端点的距离，单位为像素；每条线的总长度为 `armLength × 2`。 |
| `cross.rotationDegrees` | 第一条线相对水平正方向的角度，单位为度；本例为 `45`，另一条线与其垂直。 |
| `cross.stroke` | 两条交叉线共用的笔触颜色。 |
| `cross.strokeWidth` | 两条交叉线共用的笔触宽度，单位为像素；本例为 `6`，保持线形而非块状。 |
| `cross.linecap` | 线段端帽样式：`butt`（平头，不延伸出端点）、`round`（圆头）、`square`（方头，延伸半个线宽）。 |
| `animation.firstLineStartFrame` / `firstLineDurationInFrames` | 第一条线绘制动画的图形局部开始帧和持续帧数。 |
| `animation.secondLineStartFrame` / `secondLineDurationInFrames` | 第二条线绘制动画的图形局部开始帧和持续帧数；可与第一条线分开设置。 |

renderer 根据 `rotationDegrees` 计算第一条线的方向向量，再生成与其垂直的第二条线；两条线都以 `center` 为中点，端点距离由 `armLength` 决定。`armLength` 和 `strokeWidth` 应大于 0。默认 `rotationDegrees=45` 形成叉号；线宽保持 `6`，本配置不把笔触扩展为块状图形，也不包含按钮容器。两条线的描边揭示分别由各自的局部帧参数驱动；Scene JSON 的图层时间轴负责把 Composition 帧换算为本层局部帧。

### 带注释示例（JSONC）

```jsonc
{
  "canvas": {
    "width": 1920, // 叉号 SVG 图层画布宽度（像素）
    "height": 1080 // 叉号 SVG 图层画布高度（像素）
  },
  "cross": {
    "center": [1150, 500], // 两条线的交点坐标 [x, y]
    "armLength": 260, // 中心到端点的距离（像素）；每条线总长 520 像素
    "rotationDegrees": 45, // 第一条线相对水平向右方向的角度；另一条线与其垂直
    "stroke": "#1B2430", // 两条线共用的颜色
    "strokeWidth": 6, // 两条线共用的线宽（像素）；保持线段式叉号
    "linecap": "butt" // 端帽样式：butt 平头、round 圆头、square 方头
  },
  "animation": {
    "firstLineStartFrame": 34, // 第一条线开始绘制帧（图形局部时间轴）
    "firstLineDurationInFrames": 28, // 第一条线绘制持续帧数
    "secondLineStartFrame": 58, // 第二条线开始绘制帧（图形局部时间轴）
    "secondLineDurationInFrames": 22 // 第二条线绘制持续帧数
  }
}
```

该 JSONC 示例用于说明字段，不能直接作为 `.json` 配置使用；实际配置必须保持合法 JSON。

## `_25-document.json`：25 折角文档

配置文件：[`_25-document.json`](_25-document.json)，由 `Scene25Document` 导入并交给 `Document25` 绘制。该图层背景透明，只绘制切角纸张主体、右上折角片和折线；不包含旧版 `Document25` 中的内容线、标题、角标、参数卡片或说明文字。纸张中心、宽高、折角大小、纸张及折角片颜色、描边和各部分出现动画由 JSON 配置。默认几何沿用旧版基础状态：纸张 `520 × 640`，折角 `100`，中心 `(1150,455)`。

| 字段 | 含义 |
| --- | --- |
| `canvas.width` / `canvas.height` | 折角文档 SVG 图层画布的像素宽、高，应与 Composition 画布一致。 |
| `document.center` | 纸张包围盒中心 `[x,y]` 的画布坐标，单位为像素。 |
| `document.width` / `document.height` | 纸张包围盒宽、高，单位为像素。 |
| `document.fold` | 右上角折角沿上边和右边的长度，单位为像素；本例为 `100`。 |
| `document.fill` | 纸张主体和折角片的基础填充颜色；图层其他区域透明。 |
| `document.foldTint` | 折角片叠加的色调颜色。 |
| `document.foldTintOpacity` | 折角色调透明度，范围为 `0` 到 `1`；`0.1` 表示 10% 覆盖。 |
| `document.stroke` / `document.strokeWidth` | 纸张外轮廓、折角内边和折线共用的描边颜色与宽度；宽度单位为像素。 |
| `document.linejoin` | 描边顶点连接样式：`miter`（尖角延伸）、`round`（圆角）、`bevel`（斜切）。 |
| `animation.outlineStartFrame` / `outlineDurationInFrames` | 外轮廓和折线描边动画的图形局部开始帧与持续帧数。 |
| `animation.fillStartFrame` / `fillDurationInFrames` | 纸张主体填充淡入动画的图形局部开始帧与持续帧数。 |
| `animation.flapStartFrame` / `flapDurationInFrames` | 折角片及其色调淡入动画的图形局部开始帧与持续帧数。 |

renderer 根据中心和宽高计算纸张包围盒；右上角沿上边和右边各切去 `fold` 长度，形成五边形主体。折角片是位于纸张内侧的直角三角形，两条直角边贴住切角主体，斜边是折线。`width`、`height`、`fold` 和 `strokeWidth` 应大于 0，且 `fold < min(width,height)`。折角色调透明度须在 `0–1` 范围内。Scene JSON 的图层时间轴先将 Composition 帧转换为本层局部帧，再由局部帧驱动轮廓、填充与折角片动画。

### 带注释示例（JSONC）

```jsonc
{
  "canvas": {
    "width": 1920, // 折角文档 SVG 图层画布宽度（像素）
    "height": 1080 // 折角文档 SVG 图层画布高度（像素）
  },
  "document": {
    "center": [1150, 455], // 纸张包围盒中心坐标 [x, y]
    "width": 520, // 纸张宽度（像素）
    "height": 640, // 纸张高度（像素）
    "fold": 100, // 右上折角沿纸张两边切入的长度（像素）
    "fill": "#FCFAF4", // 纸张和折角片的基础填充色
    "foldTint": "#D9482F", // 折角片叠加的色调颜色
    "foldTintOpacity": 0.1, // 折角色调透明度（0–1）
    "stroke": "#1B2430", // 纸张轮廓和折线颜色
    "strokeWidth": 3, // 轮廓与折线宽度（像素）
    "linejoin": "miter" // 顶点连接样式：miter 尖角延伸、round 圆角、bevel 斜切
  },
  "animation": {
    "outlineStartFrame": 58, // 外轮廓和折线开始绘制帧（图形局部时间轴）
    "outlineDurationInFrames": 74, // 外轮廓和折线绘制持续帧数
    "fillStartFrame": 114, // 纸张填充开始淡入帧（图形局部时间轴）
    "fillDurationInFrames": 30, // 纸张填充淡入持续帧数
    "flapStartFrame": 94, // 折角片开始淡入帧（图形局部时间轴）
    "flapDurationInFrames": 38 // 折角片淡入持续帧数
  }
}
```

该 JSONC 示例用于说明字段，不能直接作为 `.json` 配置使用；实际配置必须保持合法 JSON。

## `_26-check.json`：26 线段对勾

配置文件：[`_26-check.json`](_26-check.json)，由 `Scene26Check` 导入并交给 `Check26` 绘制。矩形版本由独立的 [`_26-rect-check.json`](_26-rect-check.json) 配置。该图层背景透明，只绘制由三个点连接而成的两段对勾线条；不包含旧版 `Check26` 中的锚点、点位字母、折角角度标记、圆形/圆角方框/胶囊容器、状态文字或说明文字。对勾中心、三个顶点偏移、笔触样式和描边绘制时间由 JSON 配置。默认几何沿用旧版基础对勾：三个相对中心的顶点偏移为 `(-200,0)`、`(-90,140)`、`(210,-140)`，中心 `(1150,520)`。

| 字段 | 含义 |
| --- | --- |
| `canvas.width` / `canvas.height` | 对勾 SVG 图层画布的像素宽、高，应与 Composition 画布一致。 |
| `check.center` | 对勾中心 `[x,y]` 的画布坐标，单位为像素；各顶点偏移都相对该点计算。 |
| `check.points` | 按绘制顺序排列的三个顶点偏移 `[[x1,y1],[x2,y2],[x3,y3]]`，单位为像素；形成短臂转折点和长臂端点。正 y 向下。 |
| `check.stroke` | 对勾线条颜色。 |
| `check.strokeWidth` | 对勾线条宽度，单位为像素。开放折线不使用填充。 |
| `check.linecap` | 线段端帽样式：`butt`（平头，不延伸出端点）、`round`（圆头）、`square`（方头，延伸半个线宽）。 |
| `check.linejoin` | 两段线交接处的连接样式：`miter`（尖角延伸）、`round`（圆角）、`bevel`（斜切）。 |
| `animation.startFrame` | 对勾开始绘制的图形局部帧。 |
| `animation.durationInFrames` | 对勾沿两个线段依次绘制完成所用的帧数。 |

renderer 将 `check.points` 中的相对坐标分别加到 `check.center` 上，并依次连接成开放 SVG 路径；不闭合路径，也不生成填充区域。中心坐标和顶点偏移均为像素；`strokeWidth` 与 `durationInFrames` 应大于 0。Scene JSON 的图层时间轴先把 Composition 帧转换为本层局部帧，再由该局部帧驱动整条对勾路径的绘制进度。

### 带注释示例（JSONC）

```jsonc
{
  "canvas": {
    "width": 1920, // 对勾 SVG 图层画布宽度（像素）
    "height": 1080 // 对勾 SVG 图层画布高度（像素）
  },
  "check": {
    "center": [1150, 520], // 对勾局部坐标原点在画布中的位置 [x, y]
    "points": [ // 按路径顺序排列的三个顶点偏移（像素）
      [-200, 0], // 第一端点：短臂起点
      [-90, 140], // 第二点：折角
      [210, -140] // 第三点：长臂终点
    ],
    "stroke": "#1B2430", // 对勾线条颜色
    "strokeWidth": 11, // 对勾线宽（像素）
    "linecap": "round", // 端帽：butt 平头、round 圆头、square 方头
    "linejoin": "round" // 转角：miter 尖角延伸、round 圆角、bevel 斜切
  },
  "animation": {
    "startFrame": 34, // 绘制开始帧（图形局部时间轴）
    "durationInFrames": 46 // 两段线绘制完成所用帧数
  }
}
```

该 JSONC 示例用于说明字段，不能直接作为 `.json` 配置使用；实际配置必须保持合法 JSON。

## 后续图形配置文档约定

新增图形 JSON 后，在本文档继续追加对应的小节，至少说明：

1. 配置文件名及它在场景 `layers` 中的图层类型。
2. 每个参数的含义、单位、坐标系和允许范围；没有写入配置的固定形态规则也要注明。
3. 动画参数的帧单位、局部时间轴以及循环/起止行为。
4. JSON 配置最终由哪个 parser、scene 或 renderer 消费。
5. 配置示例使用带注释的 JSONC，并明确指出实际 `.json` 文件必须保持合法 JSON。

图形实例建议记录几何与外观字段，例如位置、尺寸、旋转、填充、描边和图形专属参数。只把实际已实现并被 renderer 消费的字段记为可配置参数；预留字段需标注为“尚未生效”。

## `_26-rect-check.json`：26 矩形对勾

配置文件：[`_26-rect-check.json`](_26-rect-check.json)，由 `Scene26RectCheck` 导入并交给 `RectCheck26` 绘制。该图层背景透明，按“短臂矩形、折角扇形、长臂矩形”的顺序绘制对勾；扇形圆心在共享折角，半径为矩形臂宽的一半，用于填补两臂之间的接缝。几何顶点与线段版 `_26-check.json` 一致。不包含锚点、角度标记、容器或说明文字。

| 字段 | 含义 |
| --- | --- |
| `canvas.width` / `canvas.height` | 矩形对勾 SVG 图层画布的像素宽、高，应与 Composition 画布一致。 |
| `checkRect.center` | 对勾局部坐标原点 `[x,y]` 在画布中的位置，单位为像素。 |
| `checkRect.points` | 对勾三个顶点相对 `center` 的偏移，依次表示短臂起点、折角和长臂终点；单位为像素。 |
| `checkRect.armWidth` | 两段矩形臂共用的宽度，单位为像素。 |
| `checkRect.fill` | 两段矩形臂共用的填充颜色。 |
| `checkRect.stroke` / `checkRect.strokeWidth` | 两段矩形臂共用的描边颜色与宽度；宽度单位为像素。 |
| `animation.firstRectStartFrame` / `firstRectDurationInFrames` | 短臂矩形淡入的图形局部开始帧和持续帧数。 |
| `animation.fanStartFrame` / `fanDurationInFrames` | 折角扇形从共享顶点向外扩展的图形局部开始帧和持续帧数。 |
| `animation.secondRectStartFrame` / `secondRectDurationInFrames` | 长臂矩形淡入的图形局部开始帧和持续帧数；应在扇形动画结束后开始。 |

renderer 将三个顶点偏移加到中心坐标上，再按每一段的端点计算矩形长度和旋转角；扇形的朝向由两段方向推导，半径为 `armWidth / 2`。短臂完成后扇形展开，扇形完成后长臂开始淡入。`armWidth` 和 `strokeWidth` 应大于 0；`points` 必须定义两个非零长度的线段。Scene JSON 的图层时间轴先把 Composition 帧换算为本层局部帧。

### 带注释示例（JSONC）

```jsonc
{
  "canvas": {
    "width": 1920, // 矩形对勾 SVG 图层画布宽度（像素）
    "height": 1080 // 矩形对勾 SVG 图层画布高度（像素）
  },
  "checkRect": {
    "center": [1150, 520], // 对勾局部坐标原点在画布中的位置 [x, y]
    "points": [[-200, 0], [-90, 140], [210, -140]], // 短臂起点、折角和长臂终点相对中心的偏移
    "armWidth": 24, // 两段矩形臂的宽度（像素）
    "fill": "#1B2430", // 两段矩形臂和折角扇形共用的填充颜色
    "stroke": "#1B2430", // 两段矩形臂共用的描边颜色
    "strokeWidth": 3 // 两段矩形臂共用的描边宽度（像素）
  },
  "animation": {
    "firstRectStartFrame": 34, // 短臂矩形开始淡入帧（图形局部时间轴）
    "firstRectDurationInFrames": 30, // 短臂矩形淡入持续帧数
    "fanStartFrame": 64, // 折角扇形开始展开帧（图形局部时间轴）
    "fanDurationInFrames": 12, // 折角扇形展开持续帧数
    "secondRectStartFrame": 76, // 长臂矩形开始淡入帧，应在扇形展开后
    "secondRectDurationInFrames": 34 // 长臂矩形淡入持续帧数
  }
}
```

该 JSONC 示例用于说明字段，不能直接作为 `.json` 配置使用；实际配置必须保持合法 JSON。

## `_28-row-selection.json`：28 行、列与单元格选中 / 取消 / 多选

配置文件：[`_28-row-selection.json`](_28-row-selection.json)，由 `Scene28RowSelection` 导入并交给 `RowSelection28` 绘制。表格与行选中动作沿用旧版手写 [`Table28.tsx`](/projects/gaoxiang/remotion-experiment/deepseek/shape-showcase/src/Table28.tsx)，列选中动作参照 [`Table29.tsx`](/projects/gaoxiang/remotion-experiment/deepseek/shape-showcase/src/Table29.tsx)，单元格选中动作参照 [`Table30.tsx`](/projects/gaoxiang/remotion-experiment/deepseek/shape-showcase/src/Table30.tsx)；三组动作依次放在同一场景和同一份配置中。本层保持透明，背景和布局仍由 32、33 层提供。左侧说明栏、标题、教学字幕、鼠标光标和点击波纹不属于表格层。行、列、单元格索引都从 `0` 开始。

| 字段 | 含义 |
| --- | --- |
| `canvas.width` / `canvas.height` | 表格 SVG 图层的画布像素宽、高，应与 Composition 画布一致。 |
| `table.x` / `table.y` | 表格左上角在画布中的像素坐标。 |
| `table.columns[]` | 表格列定义数组，依次决定列标题、列宽、文本对齐、字体和特殊文本颜色。 |
| `table.columns[].label` | 列标题文字。 |
| `table.columns[].width` | 列宽，单位为像素；所有列宽之和为表格总宽。 |
| `table.columns[].align` | 列内文字对齐方式：`left` 左对齐、`center` 居中、`right` 右对齐；省略时按左对齐处理。 |
| `table.columns[].mono` | 是否使用等宽字体；`true` 使用等宽字体，`false` 或省略使用无衬线字体。 |
| `table.columns[].fontSize` | 该列数据文字字号，单位为像素。 |
| `table.columns[].accentValues[]` | 该列需要使用强调色的文字值；未列出的内容使用普通文字色。 |
| `table.rows[][]` | 表格数据行；每个内层数组依列顺序提供单元格文字。 |
| `table.headerHeight` / `table.rowHeight` | 表头和数据行高度，单位为像素。 |
| `table.headerFontSize` | 表头文字字号，单位为像素。 |
| `table.style.ink` | 表格文字、表头和网格线颜色。 |
| `table.style.accent` | 行/列悬停与选中底色、行左侧选中条、列顶部标记及特殊单元格文字的强调色。 |
| `table.style.headerTintOpacity` | 表头强调底色的最大透明度。 |
| `table.style.selectionOpacity` | 选中行底色的最大透明度。 |
| `table.style.hoverOpacity` | 悬停行底色的最大透明度。 |
| `table.style.columnHoverOpacity` | 悬停列底色的最大透明度。 |
| `table.style.columnMarkerHoverOpacity` | 悬停列上方短标记的最大透明度。 |
| `table.style.cellSelectionOpacity` | 选中单元格底色的最大透明度。 |
| `table.style.cellHoverOpacity` | 悬停单元格底色的最大透明度。 |
| `table.style.internalLineOpacity` | 内部网格线透明度；外框与表头分隔线保持不透明。 |
| `animation.horizontalGridStartFrame` / `verticalGridStartFrame` | 横向、纵向网格线揭示动画的起始局部帧；各线按序错开 2 帧，每条线持续 18 帧。 |
| `animation.headerStartFrame` / `headerTextStartFrame` | 表头底色和表头文字的显示起始局部帧。 |
| `animation.headerDurationInFrames` | 表头底色及文字淡入持续帧数。 |
| `animation.rowsStartFrame` | 第一行内容开始显示的局部帧。 |
| `animation.rowRevealDurationInFrames` | 每行文字淡入和轻微上移的持续帧数。 |
| `animation.rowStaggerInFrames` | 相邻两行文字出现的间隔帧数。 |
| `animation.hoverRowIndex` | 短暂悬停高亮的行索引。 |
| `animation.hoverStartFrame` / `hoverEndFrame` | 行悬停底色从出现到达到最大强度的局部帧范围；选中行后悬停高亮淡出。 |
| `animation.hoverColumnIndex` | 短暂悬停高亮的列索引。 |
| `animation.hoverColumnStartFrame` / `hoverColumnEndFrame` | 列悬停底色和上方标记从出现到达到最大强度的局部帧范围。 |
| `animation.hoverCell.row` / `animation.hoverCell.column` | 短暂悬停单元格的行索引和列索引。 |
| `animation.hoverCellStartFrame` / `hoverCellEndFrame` | 单元格悬停底色从出现到达到最大强度的局部帧范围；单元格选中后悬停底色淡出。 |
| `selection.transitionDurationInFrames` | 每次行或列选中集合变化时，高亮淡入/淡出的持续帧数。 |
| `selection.keyframes[]` | 行、列选中状态关键帧数组，按 `atFrame` 升序排列。每个关键帧同时完整声明行、列集合。 |
| `selection.keyframes[].atFrame` | 该状态开始的图形局部帧。 |
| `selection.keyframes[].rows` | 该时刻完整的选中行索引集合；数组为空表示没有行被选中。 |
| `selection.keyframes[].columns` | 该时刻完整的选中列索引集合；数组为空表示没有列被选中。选中列以整列浅色底纹和列顶部强调条表示。 |
| `selection.keyframes[].cells` | 该时刻完整的选中单元格集合，每项用 `row` 和 `column` 指定数据行与列；空数组表示没有单元格被选中。 |
| `selection.keyframes[].cells[].row` / `column` | 单元格所在数据行索引、列索引；不包含表头行。 |

renderer 沿用原版的 ease-in-out 选中变化和逐条网格动画。Composition 为 30 fps、480 帧。第 106 帧选中第 2 行，第 140 帧追加第 4 行，第 175 帧追加第 5 行，第 205 帧取消第 4 行；第 222 帧清除行选择，随后第 230 帧选中第 2 列（数量），第 260 帧追加第 3 列（占比），第 292 帧追加第 4 列（状态），第 323 帧取消第 3 列。第 335 帧清除列选择；第 360、392、424 帧依次选中三个单元格，第 455 帧取消中间单元格。行用底色和左侧强调条表示，列用整列浅色底纹和列顶部强调条表示，单元格用格内浅色底纹表示。

### 带注释示例（JSONC）

```jsonc
{
  "canvas": {"width": 1920, "height": 1080}, // 表格图层画布宽、高（像素）
  "table": {
    "x": 600, // 表格左上角 x 坐标（像素）
    "y": 280, // 表格左上角 y 坐标（像素）
    "columns": [
      {"label": "项目", "width": 280, "align": "left", "fontSize": 17}, // align: left 左对齐、center 居中、right 右对齐；mono: true 等宽字体、false/省略无衬线字体
      {"label": "数量", "width": 260, "align": "right", "mono": true, "fontSize": 15},
      {"label": "占比", "width": 180, "align": "right", "mono": true, "fontSize": 15},
      {"label": "状态", "width": 240, "align": "center", "fontSize": 15, "accentValues": ["观察"]} // accentValues: 此列中按强调色显示的单元格文字
    ],
    "rows": [
      ["甲", "1,280", "32%", "正常"],
      ["乙", "960", "24%", "正常"],
      ["丙", "720", "18%", "观察"],
      ["丁", "1,040", "26%", "正常"],
      ["戊", "480", "12%", "正常"]
    ],
    "headerHeight": 60, // 表头高度（像素）
    "rowHeight": 60, // 数据行高度（像素）
    "headerFontSize": 14, // 表头字号（像素）
    "style": {
      "ink": "#1B2430", // 表格文字、表头和网格线颜色
      "accent": "#D9482F", // 行状态覆盖层、选中条及特殊单元格文字颜色
      "headerTintOpacity": 0.05, // 表头底色最大透明度
      "selectionOpacity": 0.08, // 选中行底色最大透明度
      "hoverOpacity": 0.03, // 悬停行底色最大透明度
      "columnHoverOpacity": 0.04, // 悬停列底色最大透明度
      "columnMarkerHoverOpacity": 0.3, // 悬停列顶部标记最大透明度
      "cellSelectionOpacity": 0.1, // 选中单元格底色最大透明度
      "cellHoverOpacity": 0.04, // 悬停单元格底色最大透明度
      "internalLineOpacity": 0.55 // 内部网格线透明度
    }
  },
  "animation": {
    "horizontalGridStartFrame": 34, // 横向网格揭示动画起始局部帧
    "verticalGridStartFrame": 46, // 纵向网格揭示动画起始局部帧
    "headerStartFrame": 58, // 表头底色淡入开始帧
    "headerTextStartFrame": 62, // 表头文字淡入开始帧
    "headerDurationInFrames": 14, // 表头淡入持续帧数
    "rowsStartFrame": 64, // 第一行数据文字开始出现的帧
    "rowRevealDurationInFrames": 16, // 每行数据文字淡入时长
    "rowStaggerInFrames": 4, // 行与行之间的错开帧数
    "hoverRowIndex": 1, // 悬停行索引（从 0 开始）
    "hoverStartFrame": 92, // 悬停开始帧
    "hoverEndFrame": 102, // 悬停增强到最大值的帧
    "hoverColumnIndex": 1, // 悬停列索引（从 0 开始）
    "hoverColumnStartFrame": 216, // 列悬停开始帧
    "hoverColumnEndFrame": 228, // 列悬停增强到最大值的帧
    "hoverCell": {"row": 1, "column": 1}, // 悬停数据行和列索引（都从 0 开始）
    "hoverCellStartFrame": 348, // 单元格悬停开始帧
    "hoverCellEndFrame": 358 // 单元格悬停增强到最大值的帧
  },
  "selection": {
    "transitionDurationInFrames": 8, // 每次行或列选择状态变化的渐变帧数
    "keyframes": [
      {"atFrame": 0, "rows": [], "columns": [], "cells": []}, // 初始无选中行、列、单元格
      {"atFrame": 106, "rows": [1], "columns": [], "cells": []}, // 选中第二行
      {"atFrame": 140, "rows": [1, 3], "columns": [], "cells": []}, // 追加选中第四行
      {"atFrame": 175, "rows": [1, 3, 4], "columns": [], "cells": []}, // 再追加选中第五行
      {"atFrame": 205, "rows": [1, 4], "columns": [], "cells": []}, // 取消第四行
      {"atFrame": 222, "rows": [], "columns": [], "cells": []}, // 清除行选择
      {"atFrame": 230, "rows": [], "columns": [1], "cells": []}, // 选中第二列
      {"atFrame": 260, "rows": [], "columns": [1, 2], "cells": []}, // 追加选中第三列
      {"atFrame": 292, "rows": [], "columns": [1, 2, 3], "cells": []}, // 再追加选中第四列
      {"atFrame": 323, "rows": [], "columns": [1, 3], "cells": []}, // 取消第三列
      {"atFrame": 335, "rows": [], "columns": [], "cells": []}, // 清除列选择
      {"atFrame": 360, "rows": [], "columns": [], "cells": [{"row": 1, "column": 1}]}, // 选中第二行第二列
      {"atFrame": 392, "rows": [], "columns": [], "cells": [{"row": 1, "column": 1}, {"row": 2, "column": 2}]}, // 追加第三行第三列
      {"atFrame": 424, "rows": [], "columns": [], "cells": [{"row": 1, "column": 1}, {"row": 2, "column": 2}, {"row": 3, "column": 3}]}, // 再追加第四行第四列
      {"atFrame": 455, "rows": [], "columns": [], "cells": [{"row": 1, "column": 1}, {"row": 3, "column": 3}]} // 取消第三行第三列
    ]
  }
}
```

该 JSONC 示例用于说明字段，不能直接作为 `.json` 配置使用；实际配置必须保持合法 JSON。
