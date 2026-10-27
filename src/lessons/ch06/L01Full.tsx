import React from "react";
import {AbsoluteFill, Audio, Sequence, staticFile, useVideoConfig} from "remotion";
import {L01FullPlayback} from "./L01FullPlayback";
import {Ch06L01Opening} from "./L01OpeningPreview";
import {Ch06L01Preview} from "./L01Preview";
import {Ch06L01Traits} from "./L01TraitsPreview";
import {Ch06L01Quiz} from "./L01QuizPreview";
import {Ch06L01Success} from "./L01SuccessPreview";
import {Ch06L01Relations} from "./L01RelationsLesson";
import {Ch06L01Quiz69} from "./L01Quiz69Preview";
import {Ch06L01Environment} from "./L01EnvironmentPreview";
import {Ch06L01Systems} from "./L01SystemsPreview";
import {Ch06L01EnvironmentQuiz} from "./L01EnvironmentQuiz";
import {Ch06L01Closing} from "./L01ClosingPreview";
import assembly from "../../../workspaces/ch06-L01-full/assembly.json";

const parts=[Ch06L01Opening,()=> <Ch06L01Preview showProgress={false}/>,Ch06L01Traits,Ch06L01Quiz,Ch06L01Success,Ch06L01Relations,Ch06L01Quiz69,Ch06L01Environment,Ch06L01Systems,Ch06L01EnvironmentQuiz,Ch06L01Closing];
export const CH06_FULL_FRAMES=assembly.totalFrames;
export const Ch06L01Full:React.FC<{includeAudio?:boolean;includeCaptions?:boolean}>=({includeAudio=true,includeCaptions=true})=>{
 const {fps}=useVideoConfig();
 return <AbsoluteFill style={{background:"#081426"}}>
  {includeAudio&&<Audio src={staticFile("audio/ch06-L01-full/narration.wav")}/>}
  {assembly.segments.map((s,i)=>{
   const Part=parts[i];
   return <Sequence key={s.key} name={s.title} from={s.fromFrame} durationInFrames={s.durationInFrames} premountFor={fps}>
    <L01FullPlayback.Provider value={{sceneOffset:s.sceneOffset,totalScenes:assembly.totalScenes,includeCaptions}}><Part/></L01FullPlayback.Provider>
   </Sequence>;
  })}
 </AbsoluteFill>;
};
