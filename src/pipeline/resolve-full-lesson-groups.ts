import type { CompositionSpec } from "../visual/composition-types.ts";

/** 整课组装记录里，分组与 Composition 对齐所需的字段。 */
export type AssemblyGroupRef = {
  id: string;
  composition: string;
  from: number;
  durationInFrames: number;
};

export type ResolvedFullLessonGroup<T extends AssemblyGroupRef> = {
  group: T;
  spec: CompositionSpec;
  from: number;
  durationInFrames: number;
  props: CompositionSpec["defaultProps"];
};

/**
 * 按组装记录已有的 composition id 查找分组组件。
 * 顺序、起始帧和时长沿用组装记录；组件参数沿用匹配到的 CompositionSpec。
 */
export const resolveFullLessonGroups = <T extends AssemblyGroupRef>(
  lessonId: string,
  groups: readonly T[],
  specs: readonly CompositionSpec[],
): ResolvedFullLessonGroup<T>[] =>
  groups.map((group) => {
    const spec = specs.find((item) => item.id === group.composition);
    if (!spec) {
      throw new Error(
        `课时 ${lessonId} 的分组 ${group.id} 找不到 composition「${group.composition}」。`,
      );
    }
    return {
      group,
      spec,
      from: group.from,
      durationInFrames: group.durationInFrames,
      props: spec.defaultProps,
    };
  });

/**
 * 单组预览：没有预览数据时不注册。
 * 有数据时才调用 create，避免在数据缺失时读取时间轴。
 */
export const groupPreviewSpecs = <T>(
  data: T | null | undefined,
  create: (data: NonNullable<T>) => CompositionSpec,
): CompositionSpec[] => {
  if (data == null) return [];
  return [create(data)];
};
