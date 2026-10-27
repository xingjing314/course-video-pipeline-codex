/**
 * MasterCanvas 全局母版骨架。
 *
 * 1. 全局唯一挂载一次 TechNetwork 动态背景（跨分镜绝不卸载或闪烁）；
 * 2. 按 includeAudio 开关控制是否挂载真实 WAV 音轨；
 * 3. 按分镜帧区间挂载 HeaderBreadcrumb 与 SceneRouter；
 * 4. 按 includeCaptions 开关控制底部口播字幕层。
 */
import React from "react";
import { AbsoluteFill, Audio, Sequence, staticFile } from "remotion";
import type { CompiledLesson } from "../../../contracts/compiled-lesson.schema";
import { TechNetwork } from "../backgrounds/tech-network/TechNetwork";
import { techNetworkSchema } from "../backgrounds/tech-network/schema";
import { HeaderBreadcrumb } from "./HeaderBreadcrumb";
import { CaptionsOverlay } from "./CaptionsOverlay";
import { SceneRouter } from "../templates/SceneRouter";
import { CHAPTERS } from "../../lessons/registry";

const defaultBgProps = techNetworkSchema.parse({ type: "tech-network" });

export type CourseVideoProps = {
  lesson: CompiledLesson;
  includeAudio: boolean;
  includeCaptions: boolean;
};

export const MasterCanvas: React.FC<CourseVideoProps> = ({
  lesson,
  includeAudio,
  includeCaptions,
}) => {
  const totalScenes = lesson.scenes.length;

  return (
    <AbsoluteFill
      style={{
        fontFamily:
          '"Noto Sans CJK SC", "Source Han Sans SC", "PingFang SC", "Microsoft YaHei", sans-serif',
      }}
    >
      {/* 全局唯一一层动态背景 TechNetwork */}
      <TechNetwork {...defaultBgProps} />

      {/* 音频轨道：仅 includeAudio=true 时挂载 */}
      {includeAudio && lesson.meta.audioPublicSrc ? (
        <Audio src={staticFile(lesson.meta.audioPublicSrc)} />
      ) : null}

      {/* 分镜序列 */}
      {lesson.scenes.map((scene, index) => (
        <Sequence
          key={scene.id}
          from={scene.fromFrame}
          durationInFrames={scene.durationInFrames}
          name={`${scene.id}: ${scene.sceneTitle}`}
        >
          <AbsoluteFill>
            {scene.headerMode === "chapter" ? null : (
            <HeaderBreadcrumb
              lessonId={lesson.lessonId}
              lessonTitle={lesson.lessonTitle}
              sceneId={scene.id}
              sceneOrder={index + 1}
              totalScenes={totalScenes}
              segmentTitle={scene.segmentTitle}
            />
            )}
            <SceneRouter scene={scene} chapter={CHAPTERS[lesson.lessonId]} />
          </AbsoluteFill>
        </Sequence>
      ))}

      {/* 底部口播字幕轨：仅 includeCaptions=true 时显示 */}
      {includeCaptions ? <CaptionsOverlay captions={lesson.captions} /> : null}
    </AbsoluteFill>
  );
};
