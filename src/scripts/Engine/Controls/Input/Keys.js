"use strict";

import { PrintAttributes, PrintIndexBufferAll, PrintVertexBufferAll, PrintVertexBufferAllPretty } from "../../../Graphics/Z_Debug/GfxDebug.js";
import { Listener_debug_print_all, Listener_hover_Print, ListenersGetListenersBuffer } from "../../Events/EventListeners.js";
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
         console.log('---------- Print Render Queue ----------')
         console.log(e.key);
         RenderQueueGet().PrintAll();
         break;
      }
      case ('R'):{
         console.log('---------- Print Active Render Queue ----------')
         console.log(e.key);
         RenderQueueGet().PrintActive();
         break;
      }
      case ('f'):{
         console.log('---------- Print FPS ----------')
         const fps = FpsGet();
         console.log(`Avg:${fps.GetAvg()}, Avg 1s: ${fps.GetAvg_1S()}`)
         break;
      }
      case ('i'):{
         TimeIntervalsPrintAll()
         break;
      }
      case ('e'):{
         console.log('---------- Print All Old Listeners Buffer ----------')
         const listeners = ListenersGetListenersBuffer();
         listeners.PrintAll();
         break;
      }
      case ('E'):{
         console.log('---------- Print All Event Listeners ----------')
         // const listeners = ListenersGetListenersBuffer();
         // listeners.PrintAllListenersMeshes();
         
         Listener_debug_print_all();
         break;
      }
      case ('s'):{
         console.log('---------- Scenes Print All Meshes ----------')
         let cnt = 0;
         const count = ScenesPrintAllMeshes(STATE.scene.active.children, 0, cnt);
         // const scene = STATE.scene.active;
         console.log('Count: ', count)
         break;
      }
      case ('S'):{
         console.log('---------- Print Global STATE ----------')
         console.log('STATE.mesh:', STATE.mesh)
         break;
      }
      case ('L'):{
         console.log('---------- Print Hover Event Listeners ----------')
         Listener_hover_Print();
         break;
      }
   }
}
export function OnKeyUp(e){

   e.stopPropagation();
   // e.preventDefault();

}