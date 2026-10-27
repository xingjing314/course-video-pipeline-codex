/**
 * 视觉语义转译器（visual-transpiler.ts）。
 *
 * 将《讲师口播与画面分镜合一稿V0.1.md》第 3 列的自然语言结构化视觉指令，
 * 确定性编译为 11 类强类型 VisualSpecUnion 载荷与 CuePointSpec 语音触发锚点。
 */
import type {
  CuePointSpec,
  QuizOption,
  ToneName,
  VisualSpecUnion,
} from "../../../contracts/visual-props.schema.ts";
import type { SplitStoryboardUnit } from "./subscene-splitter.ts";

const stripMd = (s: string): string =>
  s
    .replace(/\*\*([^*]+)\*\*/g, "$1")
    .replace(/\*([^*]+)\*/g, "$1")
    .replace(/`([^`]+)`/g, "$1")
    .replace(/^>\s*/gm, "")
    .trim();

const truncate = (s: string, maxLen: number): string => {
  const clean = stripMd(s).replace(/\s+/g, " ").trim();
  if (clean.length <= maxLen) return clean || "—";
  return `${clean.slice(0, maxLen - 1)}…`;
};

const extractWarningBanner = (visualBody: string): string | undefined => {
  const match =
    visualBody.match(/(?:⚠️|🚨|❌\s*绝不|💡)[^\n]+/) ??
    visualBody.match(/考场防坑[:：][^\n]+/);
  return match ? truncate(match[0], 220) : undefined;
};

const detectCorrectOptionKey = (
  visualBody: string,
  narration: string,
): "A" | "B" | "C" | "D" => {
  const patterns = [
    /([ABCD])\s*(?:选项|项)?\s*高亮打勾/,
    /选\s*([ABCD])\s*[✓！!。]/,
    /直接选\s*([ABCD])/,
    /稳稳选\s*([ABCD])/,
    /不正确的选\s*([ABCD])/,
    /\*\*([ABCD])\.\s*[^*\n]+✓/,
  ];
  for (const pat of patterns) {
    const m = visualBody.match(pat) ?? narration.match(pat);
    if (m && (m[1] === "A" || m[1] === "B" || m[1] === "C" || m[1] === "D")) {
      return m[1];
    }
  }
  return "C";
};

const parseQuizOptionsFromBlock = (
  blockText: string,
  correctKey: "A" | "B" | "C" | "D",
): QuizOption[] => {
  const keys: Array<"A" | "B" | "C" | "D"> = ["A", "B", "C", "D"];
  const options: QuizOption[] = [];

  for (const key of keys) {
    const lineRegex = new RegExp(
      `(?:^|\\n|>\\s*|\\/\\s*|\\*\\*)${key}[.、．]\\s*([^\\n|/]+)`,
    );
    const match = blockText.match(lineRegex);
    let rawOptText = match ? stripMd(match[1]).replace(/✓/g, "").trim() : `选项 ${key}`;

    // 检查是否有批注或排错说明
    let critiqueNote: string | undefined;
    const inlineCritique = rawOptText.match(/（❌([^）]+)）|\(❌([^)]+)\)/);
    if (inlineCritique) {
      critiqueNote = truncate(inlineCritique[1] ?? inlineCritique[2], 120);
      rawOptText = rawOptText.replace(inlineCritique[0], "").trim();
    } else {
      const externalCritique = blockText.match(
        new RegExp(`${key}\\s*项[^\\n]*?(?:批注|→|\\\\rightarrow)\\s*[:：]?\\s*([^\\n]+)`),
      );
      if (externalCritique) {
        critiqueNote = truncate(externalCritique[1], 120);
      }
    }

    const explicitlyCorrect =
      match?.[0]?.includes("✓") ||
      new RegExp(`\\*\\*${key}[.、]`).test(blockText) ||
      key === correctKey;

    options.push({
      key,
      text: truncate(rawOptText, 220),
      isCorrect: explicitlyCorrect && key === correctKey,
      critiqueNote: key === correctKey ? undefined : critiqueNote,
    });
  }

  if (!options.some((o) => o.isCorrect)) {
    const target = options.find((o) => o.key === correctKey) ?? options[0];
    target.isCorrect = true;
  }

  return options;
};

const extractMarkdownTable = (
  text: string,
): { headers: string[]; rows: string[][] } | undefined => {
  const lines = text
    .split("\n")
    .map((l) => l.trim())
    .filter((l) => l.startsWith("|") && l.endsWith("|"));
  if (lines.length < 3) return undefined;

  const parseRow = (line: string) =>
    line
      .slice(1, -1)
      .split("|")
      .map((c) => truncate(c, 160));

  const headers = parseRow(lines[0]);
  const dataLines = lines.slice(2).filter((l) => !l.includes("---"));
  const rows = dataLines
    .map(parseRow)
    .filter((r) => r.length === headers.length);

  if (headers.length < 2 || rows.length === 0) return undefined;
  return { headers, rows };
};

export const transpileVisualAndCues = (
  unit: SplitStoryboardUnit,
): VisualSpecUnion & { cueSpecs: CuePointSpec[] } => {
  const body = unit.visualBlockBody;
  const narration = unit.narration;
  const title = truncate(
    unit.visualBlockTitle.replace(/^画面\s*\d*[A-Z]?\s*(?:上半部|下半部|左半部|右半部|切换|叠加)?\s*[:：]\s*/, ""),
    120,
  );
  const subtitle = truncate(unit.pedagogicalIntent, 200);

  // 统计真题题头数量：如 【2023年11月第3批次·第21题】
  const examBadges = [...body.matchAll(/【(\d{4}年[^】]*?第\d+题)】/g)];

  /* ------------------- 1. 双真题同屏对决卡 (dual-quiz-battle) ------------------- */
  if (examBadges.length >= 2) {
    const firstIdx = examBadges[0].index!;
    const secondIdx = examBadges[1].index!;
    const leftBlock = body.slice(firstIdx, secondIdx);
    const rightBlock = body.slice(secondIdx);

    const leftCorrect = detectCorrectOptionKey(leftBlock, narration);
    const rightCorrect = detectCorrectOptionKey(rightBlock, narration);

    const extractStem = (blk: string, badge: string) => {
      const afterBadge = blk.replace(`【${badge}】`, "").trim();
      const firstLine = afterBadge
        .split("\n")
        .map((l) => stripMd(l))
        .find((l) => l.length > 4 && !/^[ABCD][.、]/.test(l));
      return truncate(firstLine ?? `${badge} 核心考点辨析`, 240);
    };

    const topTable = extractMarkdownTable(body);

    const cueSpecs: CuePointSpec[] = [
      {
        id: `${unit.sceneId}-left-reveal`,
        action: "eliminate-option",
        targetId: "left",
        matchPhrase: `选 ${leftCorrect}`,
        fallbackRatio: 0.42,
      },
      {
        id: `${unit.sceneId}-right-reveal`,
        action: "reveal-answer",
        targetId: "right",
        matchPhrase: `选 ${rightCorrect}`,
        fallbackRatio: 0.75,
      },
    ];

    return {
      visualType: "dual-quiz-battle",
      payload: {
        title,
        subtitle,
        topComparisonTable:
          topTable && topTable.headers.length <= 4
            ? {
                headers: topTable.headers.slice(0, 4),
                rows: topTable.rows.slice(0, 6).map((r) => r.slice(0, 4)),
              }
            : undefined,
        leftQuiz: {
          examMeta: examBadges[0][1],
          stem: extractStem(leftBlock, examBadges[0][1]),
          options: parseQuizOptionsFromBlock(leftBlock, leftCorrect),
        },
        rightQuiz: {
          examMeta: examBadges[1][1],
          stem: extractStem(rightBlock, examBadges[1][1]),
          options: parseQuizOptionsFromBlock(rightBlock, rightCorrect),
          extraNote: examBadges[2] ? `同源串联：${examBadges[2][1]}` : undefined,
        },
      },
      cueSpecs,
    };
  }

  /* ---------------------- 2. 单道真题互动解析卡 (exam-quiz) ---------------------- */
  if (examBadges.length === 1 || /历年真题锚点/.test(unit.visualBlockTitle)) {
    const examMeta = examBadges[0]?.[1] ?? "历年高频真题实战";
    const correctKey = detectCorrectOptionKey(body, narration);
    const options = parseQuizOptionsFromBlock(body, correctKey);

    // 提取题干行
    const quoteLines = body
      .split("\n")
      .filter((l) => l.trim().startsWith(">"))
      .map((l) => stripMd(l));
    const stemCandidate =
      quoteLines.find(
        (l) =>
          !l.includes(examMeta) &&
          !/^[①②③④⑤]/.test(l) &&
          !/^[ABCD][.、]/.test(l) &&
          l.length > 4,
      ) ?? `${examMeta}：请选择最符合教材观点的选项。`;

    // 提取 ①②③④⑤ 组合项（如 L01 S02-3）
    const numberedMatches = [...body.matchAll(/([①②③④⑤⑥])\s*([^\s①②③④⑤⑥\n]+)/g)];
    const seenNums = new Set<string>();
    const numberedStatements = numberedMatches
      .filter((m) => {
        if (seenNums.has(m[1])) return false;
        seenNums.add(m[1]);
        return true;
      })
      .map((m) => ({
        id: m[1],
        text: truncate(m[2], 60),
        eliminated: body.includes(`${m[1]}${m[2]}`) && body.includes("划上红叉") && m[1] === "②",
      }));

    // 提取同源题小卡（如 2023年11月第4批次·第21题：干扰项 A 初步可行性研究）
    const siblingMatches = [
      ...body.matchAll(/`(\d{4}年[^`]+题)`\s*[:：]\s*([^\n]+)/g),
    ];
    const siblingQuestions = siblingMatches.map((m) => ({
      examMeta: truncate(m[1], 80),
      trapNote: truncate(m[2], 160),
    }));

    const tipBanner = extractWarningBanner(body);

    const cueSpecs: CuePointSpec[] = [
      {
        id: `${unit.sceneId}-eliminate`,
        action: "eliminate-option",
        matchPhrase: "干扰项",
        fallbackRatio: 0.42,
      },
      {
        id: `${unit.sceneId}-reveal`,
        action: "reveal-answer",
        targetId: correctKey,
        matchPhrase: `选 ${correctKey}`,
        fallbackRatio: 0.62,
      },
    ];
    if (tipBanner) {
      cueSpecs.push({
        id: `${unit.sceneId}-tip`,
        action: "show-tip",
        matchPhrase: "教材",
        fallbackRatio: 0.78,
      });
    }

    return {
      visualType: "exam-quiz",
      payload: {
        title,
        subtitle,
        examMeta,
        stem: truncate(stemCandidate, 300),
        stemHighlights: [],
        numberedStatements: numberedStatements.length >= 3 ? numberedStatements : undefined,
        options,
        siblingQuestions: siblingQuestions.length > 0 ? siblingQuestions : undefined,
        tipBanner,
      },
      cueSpecs,
    };
  }

  /* ------------------------ 3. 对比表格模板 (table) ------------------------ */
  const mdTable = extractMarkdownTable(body);
  if (mdTable) {
    return {
      visualType: "table",
      payload: {
        title,
        subtitle,
        headers: mdTable.headers,
        rows: mdTable.rows,
        highlightRowIndices: [1],
        footerBanner: extractWarningBanner(body),
      },
      cueSpecs: [],
    };
  }

  /* ---------------- 4. 流程阶梯与裁剪轨道 (process-timeline) ---------------- */
  if (/时间轴|阶梯|裁剪轨道|6\s*步程序|闯关与交接总图/.test(unit.visualBlockTitle + body)) {
    const bulletLines = body
      .split("\n")
      .map((l) => l.trim())
      .filter((l) => /^[-*]|^\d+\./.test(l));

    // 判断是否为带 3 条裁剪轨道的 S02-2
    if (/裁剪轨道/.test(unit.visualBlockTitle)) {
      const rails = bulletLines
        .filter((l) => /第一条|第二条|第三条/.test(l))
        .map((l, idx) => {
          const parts = stripMd(l.replace(/^[-*]\s*/, "")).split(/[:：]/);
          return {
            label: truncate(parts[0] ?? `规则 ${idx + 1}`, 80),
            rule: truncate(parts.slice(1).join("：") || l, 220),
            tone: (idx === 0 ? "gold" : idx === 1 ? "cyan" : "green") as ToneName,
          };
        });

      return {
        visualType: "process-timeline",
        payload: {
          title,
          subtitle,
          orientation: "horizontal",
          steps: [
            { label: "① 项目建议与立项申请", description: "提交立项申请报告", emphasis: false },
            { label: "② 初步可行性研究", description: "可视规模与详细可研合并", emphasis: false },
            {
              label: "③ 详细可行性研究",
              description: "全面技术与经济测算",
              emphasis: true,
              stampText: "★ 不可缺少（核心必做）",
            },
            { label: "④ 评估与决策", description: "第三方审查与拍板立项", emphasis: false },
          ],
          comparisonRails: rails.length > 0 ? rails : undefined,
        },
        cueSpecs: [],
      };
    }

    // 检查是否有箭头串联行 `A ➔ B ➔ C`
    const arrowLine = body
      .split("\n")
      .find((l) => l.includes("➔") && l.split("➔").length >= 3);
    if (arrowLine && bulletLines.length < 3) {
      const parts = stripMd(arrowLine)
        .split("➔")
        .map((p) => p.trim())
        .filter(Boolean);
      const steps = parts.slice(0, 8).map((p, idx) => {
        const matchParen = p.match(/^([^（(]+)[（(]([^）)]+)[）)]/);
        return {
          label: truncate(matchParen ? matchParen[1] : p, 80),
          description: matchParen ? truncate(matchParen[2], 140) : undefined,
          emphasis: p.includes("详细可研") || p.includes("第 7 章") || idx === parts.length - 1,
        };
      });
      if (steps.length >= 2) {
        return {
          visualType: "process-timeline",
          payload: {
            title,
            subtitle,
            orientation: "horizontal",
            steps,
            warningBanner: extractWarningBanner(body),
          },
          cueSpecs: [],
        };
      }
    }

    // 常规多步阶梯提取
    const stepItems = bulletLines
      .filter((l) => !l.includes("⚠️") && !l.includes("顶部标签"))
      .slice(0, 6)
      .map((l) => {
        const clean = stripMd(l.replace(/^[-*\d.]+\s*/, ""));
        const matchParen = clean.match(/^([^（(：:]+)[（(：:](.+?)[）)]?$/);
        const label = truncate(matchParen ? matchParen[1] : clean, 80);
        const desc = matchParen ? truncate(matchParen[2], 160) : undefined;
        const isCore = clean.includes("详细可研") || clean.includes("不可缺少") || clean.includes("第 7 章");
        return {
          label,
          description: desc,
          emphasis: isCore,
          stampText: isCore ? "★ 核心必抓" : undefined,
        };
      });

    if (stepItems.length >= 2) {
      return {
        visualType: "process-timeline",
        payload: {
          title,
          subtitle,
          orientation: "horizontal",
          steps: stepItems,
          warningBanner: extractWarningBanner(body),
        },
        cueSpecs: [],
      };
    }
  }

  /* ------------- 5. 分层结构卡 (layered-architecture) ------------- */
  if (/身份证卡|四笔账.*结构表|内\s*5\s*＋\s*外\s*5|铁三角|运行环境.*其他/.test(unit.visualBlockTitle)) {
    const rawLines = body
      .split("\n")
      .map((l) => l.trim())
      .filter((l) => /^[-*]|^\d+\./.test(l));

    const layers: Array<{ label: string; items: string[]; tone?: ToneName }> = [];
    const tones: ToneName[] = ["cyan", "gold", "blue", "green", "purple"];

    for (const line of rawLines) {
      const clean = stripMd(line.replace(/^[-*\d.]+\s*/, ""));
      if (clean.includes("🚨") || clean.includes("红字小注")) continue;
      const [head, ...rest] = clean.split(/[:：]/);
      if (rest.length > 0) {
        const rhs = rest.join("：").trim();
        const items = rhs
          .split(/[、；;｜|]/)
          .map((s) => truncate(s, 90))
          .filter(Boolean)
          .slice(0, 6);
        layers.push({
          label: truncate(head, 70),
          items: items.length > 0 ? items : [truncate(rhs, 120)],
          tone: tones[layers.length % tones.length],
        });
      } else if (layers.length > 0 && layers[layers.length - 1].items.length < 6) {
        layers[layers.length - 1].items.push(truncate(clean, 100));
      } else {
        layers.push({
          label: truncate(clean, 70),
          items: [truncate(unit.sceneTitle, 90)],
          tone: tones[layers.length % tones.length],
        });
      }
      if (layers.length >= 5) break;
    }

    if (layers.length >= 2) {
      return {
        visualType: "layered-architecture",
        payload: {
          title,
          subtitle,
          layers,
          warningBanner: extractWarningBanner(body),
        },
        cueSpecs: [],
      };
    }
  }

  /* ------------------- 6. 通用多卡片宫格 (multi-cards) ------------------- */
  const bulletLines = body
    .split("\n")
    .map((l) => l.trim())
    .filter((l) => /^[-*]|^\d+\./.test(l) && !l.includes("屏幕") && !l.includes("画面"));

  const tones: ToneName[] = ["cyan", "gold", "blue", "green", "purple", "orange"];
  const cards = bulletLines.slice(0, 6).map((line, idx) => {
    const clean = stripMd(line.replace(/^[-*\d.]+\s*/, ""));
    const [head, ...rest] = clean.split(/[:：—]/);
    const heading = truncate(head || `要点 ${idx + 1}`, 70);
    const bodyText = truncate(rest.join("：") || clean, 240);
    const isTrap = clean.includes("★") || clean.includes("⭐") || clean.includes("不可缺少");
    return {
      heading,
      body: bodyText,
      tone: (isTrap ? "gold" : tones[idx % tones.length]) as ToneName,
      badge: isTrap ? "★ 高频核心" : undefined,
    };
  });

  while (cards.length < 2) {
    cards.push({
      heading: unit.sceneTitle,
      body: truncate(unit.narration, 220),
      tone: "cyan",
      badge: "核心要点",
    });
  }

  return {
    visualType: "multi-cards",
    payload: {
      title,
      subtitle,
      cards: cards.slice(0, 6),
      warningBanner: extractWarningBanner(body),
    },
    cueSpecs: [],
  };
};
