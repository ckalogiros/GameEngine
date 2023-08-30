"use strict";

import { PrintAttributes, PrintIndexBufferAll, PrintVertexBufferDataAndNames, PrintVertexDataAll } from "../../../Graphics/Z_Debug/GfxDebug.js";
import { Listener_debug_print_all } from "../../Events/EventListeners.js";
import { Gfx_pool_print } from "../../MenuOptions/MenuOptionsBuilder.js";
import { RenderQueueGet } from "../../Renderers/Renderer/RenderQueue.js";
import { ScenesPrintAllMeshes, ScenesPrintSceneMeshes } from "../../Scenes.js";
import { FpsGet } from "../../Timers/Time.js";
import { TimeIntervalsPrintAll } from "../../Timers/TimeIntervals.js";

export const DEBUG_PRINT_KEYS = [

   {
      key: 'p',
      discr: 'PAUSE APP',
      func: (e)=>{
         console.log(e.key);
         if(STATE.loop.paused) STATE.loop.paused = false
         else STATE.loop.paused = true
      },
   },
   {
      key: 'x',
      discr: 'PrintVertexBufferAll()',
      func: (e)=>{
         console.log(e.key);
         PrintVertexDataAll();
      },
   },
   {
      key: 'X',
      discr: 'PrintVertexBufferDataAndNames()',
      func: (e)=>{
         console.log(e.key);
         PrintVertexBufferDataAndNames();
      },
   },
   {
      key: 'c',
      discr: 'PrintIndexBufferAll()',
      func: (e)=>{
         console.log(e.key);
         PrintIndexBufferAll();
      },
   },
   {
      key: 'z',
      discr: 'PrintAttributes()',
      func: (e)=>{
         console.log(e.key);
         PrintAttributes();
      },
   },
   {
      key: 'r',
      discr: 'RenderQueue PrintAll()',
      func: (e)=>{
         console.log(e.key);
         RenderQueueGet().PrintAll();
      },
   },
   {
      key: 'R',
      discr: 'RenderQueue PrintActive()',
      func: (e)=>{
         console.log(e.key);
         RenderQueueGet().PrintActive();
      },
   },
   {
      key: 'f',
      discr: 'NULL',
      func: (e)=>{
         const fps = FpsGet();
         console.log(`Avg:${fps.GetAvg()}, Avg 1s: ${fps.GetAvg_1S()}`)
      },
   },
   {
      key: 'i',
      discr: 'TimeIntervalsPrintAll',
      func: (e)=>{
         TimeIntervalsPrintAll()
      },
   },
   {
      key: 'e',
      discr: 'Listener_debug_print_all',
      func: (e)=>{
         Listener_debug_print_all()
      },
   },
   {
      key: 'E',
      discr: 'Listener_debug_print_all',
      func: (e)=>{
         Listener_debug_print_all();
      },
   },
   {
      key: 'm',
      discr: 'ScenesPrintAllMeshes',
      func: (e)=>{
         let cnt = 0;
         const count = ScenesPrintAllMeshes(STATE.scene.active.children, cnt);
         console.log('Count: ', count)
      },
   },
   {
      key: 'M',
      discr: 'ScenesPrintSceneMeshes',
      func: (e)=>{
         const count = console.log(ScenesPrintSceneMeshes(STATE.scene.active.children))
         console.log('Count: ', count)
      },
   },
   {
      key: 'S',
      discr: 'STATE',
      func: (e)=>{
         console.log('STATE.mesh:', STATE.mesh)
      },
   },
   {
      key: 'L',
      discr: 'NULL',
      func: (e)=>{
         // Listener_hover_Print();
      },
   },
   {
      key: 'g',
      discr: 'Gfx_pool_print',
      func: (e)=>{
         Gfx_pool_print();
      },
   },

];



console.log(DEBUG_PRINT_KEYS)
export function OnKeyDown(e){

   e.stopPropagation();

   let i=0;
   switch(e.key){

      case ('p'):{ DEBUG_PRINT_KEYS[0].func(e); break; }
      case ('x'):{ DEBUG_PRINT_KEYS[1].func(e); break; }
      case ('X'):{ DEBUG_PRINT_KEYS[2].func(e); break; }
      case ('c'):{ DEBUG_PRINT_KEYS[3].func(e); break; }
      case ('z'):{ DEBUG_PRINT_KEYS[4].func(e); break; }
      case ('r'):{ DEBUG_PRINT_KEYS[5].func(e); break; }
      case ('R'):{ DEBUG_PRINT_KEYS[6].func(e); break; }
      case ('f'):{ DEBUG_PRINT_KEYS[7].func(e); break; }
      case ('i'):{ DEBUG_PRINT_KEYS[8].func(e); break; }
      case ('e'):{ DEBUG_PRINT_KEYS[9].func(e); break; }
      case ('E'):{ DEBUG_PRINT_KEYS[10].func(e); break; }
      case ('m'):{ DEBUG_PRINT_KEYS[11].func(e); break; }
      case ('M'):{ DEBUG_PRINT_KEYS[12].func(e); break; }
      case ('S'):{ DEBUG_PRINT_KEYS[13].func(e); break; }
      case ('L'):{ DEBUG_PRINT_KEYS[14].func(e); break; }
      case ('g'):{ DEBUG_PRINT_KEYS[15].func(e); break; }

   }
}
export function OnKeyUp(e){

   e.stopPropagation();
   // e.preventDefault();

}