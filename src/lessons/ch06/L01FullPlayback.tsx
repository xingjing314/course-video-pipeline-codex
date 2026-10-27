import React, {createContext, useContext} from "react";
import {Audio} from "remotion";
import {CaptionsOverlay} from "../../visual/shell/CaptionsOverlay";
import {HeaderBreadcrumb} from "../../visual/shell/HeaderBreadcrumb";

// 整课串联时统一导航和音轨；单段预览沿用已审核的表现。
export const L01FullPlayback = createContext<{sceneOffset:number;totalScenes:number;includeCaptions:boolean}|null>(null);
export const L01Header:React.FC<React.ComponentProps<typeof HeaderBreadcrumb>>=(props)=>{
 const full=useContext(L01FullPlayback);
 const order=props.sceneOrder+(full?.sceneOffset??0);
 return <HeaderBreadcrumb {...props} {...(full?{sceneId:`S${String(order).padStart(2,"0")}`,sceneOrder:order,totalScenes:full.totalScenes}:{})}/>;
};
export const L01Audio:React.FC<React.ComponentProps<typeof Audio>>=(props)=>useContext(L01FullPlayback)?null:<Audio {...props}/>;
export const L01Captions:React.FC<React.ComponentProps<typeof CaptionsOverlay>>=(props)=>useContext(L01FullPlayback)?.includeCaptions===false?null:<CaptionsOverlay {...props}/>;
