"use strict";

import { PrintAttributes, PrintIndexBufferAll, PrintVertexBufferAll, PrintVertexBufferAllPretty } from "../../../Graphics/Z_Debug/GfxDebug.js";
import { ListenersGetListenersBuffer } from "../../Events/EventListeners.js";
import { RenderQueueGet } from "../../Renderers/Renderer/RenderQueue.js";
import { ScenesPrintAllMeshes } from "../../Scenes.js";
import { FpsGet } from "../../Timers/Time.js";
import { TimeIntervalsPrintAll } from "../../Timers/TimeIntervals.js";


export function OnKeyDown(e){

   e.stopPropagation();
   // e.preventDefault();

   // console.log(e.key)

   switch(e.key){
      case ('p'):{
         console.log(e.key);
         if(g_state.game.paused) g_state.game.paused = false
         else g_state.game.paused = true
         break;
      }
      case ('x'):{
         console.log(e.key);
         PrintVertexBufferAll();
         break;
      }
      case ('c'):{
         console.log(e.key);
         PrintIndexBufferAll();
         break;
      }
      case ('z'):{
         console.log(e.key);
         PrintAttributes();
         break;
      }
      case ('r'):{
         console.log(e.key);
         RenderQueueGet().PrintAll();
         break;
      }
      case ('R'):{
         console.log(e.key);
         RenderQueueGet().PrintActive();
         break;
      }
      case ('f'):{
         const fps = FpsGet();
         console.log(`Avg:${fps.GetAvg()}, Avg 1s: ${fps.GetAvg_1S()}`)
         break;
      }
      case ('i'):{
         TimeIntervalsPrintAll()
         break;
      }
      case ('e'):{
         const listeners = ListenersGetListenersBuffer();
         listeners.PrintAll();
         break;
      }
      case ('E'):{
         const listeners = ListenersGetListenersBuffer();
         console.log('---------- All meshes with hover listeners ----------')
         listeners.PrintAllListenersMeshes();
         break;
      }
      case ('s'):{
         ScenesPrintAllMeshes(STATE.scene.active.children, 0)
         break;
      }
      case ('S'):{
         console.log('STATE.mesh:', STATE.mesh)
         break;
      }
   }
}
export function OnKeyUp(e){

   e.stopPropagation();
   // e.preventDefault();

}