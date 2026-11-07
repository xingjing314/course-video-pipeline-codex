import React from "react";
import { AbsoluteFill, Audio, Sequence, staticFile } from "remotion";
import { CaptionsOverlay } from "../../../visual/shell/CaptionsOverlay";
import { resolveFullLessonGroups } from "../../../pipeline/resolve-full-lesson-groups";
import { TEST01_L01_GROUP_COMPOSITIONS } from "./groups";
import assembly from "../../../../workspaces/test01/full/assembly.json";
import { captions } from "../../../../workspaces/test01/full/captions.json";

export const Test01L01Full: React.FC<{ silentClean?: boolean }> = ({ silentClean = false }) => (
  <AbsoluteFill>
    {resolveFullLessonGroups(assembly.lessonId, assembly.groups, TEST01_L01_GROUP_COMPOSITIONS).map(({ group, spec, from, durationInFrames, props }) => {
      const Group = spec.component;
      return (
        <Sequence key={group.id} name={`${group.id} ${group.scenes.join(" ")}`} from={from} durationInFrames={durationInFrames}>
          <Group {...props} includeAudio={false} includeCaptions={false} />
        </Sequence>
      );
    })}
    {!silentClean && <Audio src={staticFile(assembly.audio.replace(/^public\//u, ""))} />}
    {!silentClean && <CaptionsOverlay captions={captions} />}
  </AbsoluteFill>
);
