"use strict";

import { PrintAttributes, PrintIndexBufferAll, PrintVertexBufferDataAndNames, PrintVertexDataAll } from "../../../Graphics/Z_Debug/GfxDebug.js";
import { Listener_debug_print_all } from "../../Events/EventListeners.js";
import { RenderQueueGet } from "../../Renderers/Renderer/RenderQueue.js";
import { ScenesPrintAllMeshes, ScenesPrintSceneMeshes, Scenes_get_scene_by_idx } from "../../Scenes.js";
import { FpsGet } from "../../Timers/Time.js";
import { TimeIntervalsPrintAll } from "../../Timers/TimeIntervals.js";
import { Gfx_pool_print } from "../../Interfaces/GfxContext.js";
import { Mesh_print_all_mesh_listeners } from "../../Drawables/Meshes/Base/Mesh.js";

_cnt = 0;
const p = _cnt++;
const x = _cnt++;
const X = _cnt++;
const c = _cnt++;
const z = _cnt++;
const r = _cnt++;
const R = _cnt++;
const f = _cnt++;
const i = _cnt++;
const E = _cnt++;
const m = _cnt++;
const M = _cnt++;
const S = _cnt++;
const sm = _cnt++;
const L = _cnt++;
const g = _cnt++;
const em = _cnt++;

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
      key: 'E',
      discr: 'Listener_debug_print_all',
      func: (e)=>{
         console.log('-- Listener_debug_print_all --')
         Listener_debug_print_all();
      },
   },
   {
      key: 'm',
      discr: 'ScenesPrintAllMeshes',
      func: (e)=>{
         let cnt = 0;
         console.log('-- Scene\'s All meshes (recursive) --')
         const count = ScenesPrintAllMeshes(STATE.scene.active.children, cnt);
         console.log('Count: ', count)
      },
   },
   {
      key: 'M',
      discr: 'ScenesPrintSceneMeshes',
      func: (e)=>{
         console.log('-- Scene\'s direct children meshes --')
         const count = ScenesPrintSceneMeshes(STATE.scene.active.children);
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
      key: 'sm',
      discr: 'STATE',
      func: (e)=>{
         const scene = Scenes_get_scene_by_idx(STATE.scene.active_idx);
         scene.PrintMeshInGfx();
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
   { 
      key: 'em',
      discr: 'Mesh_print_all_mesh_listeners',
      func: (e)=>{
         Mesh_print_all_mesh_listeners();
      },
   },

];


let _keys_buffer = [];

console.log(DEBUG_PRINT_KEYS)
export function OnKeyDown(e){

   e.stopPropagation();

   if(!e.repeat){

      _keys_buffer.push({
         key: e.key,
         ctrl:e.ctrlKey,
         shift:e.shiftKey,
         alt:e.altKey,
      })
   }
}
export function OnKeyUp(e){
   
   e.stopPropagation();


   const len = _keys_buffer.length-1;

   if(len === 1){
      
      if (_keys_buffer[0].key === 'e' && _keys_buffer[1].key === 'm') { 
         
         const idx = 'e'.charCodeAt(0) + 'm'.charCodeAt(0) - CHAR_ARRAY_LETTERS_START_OFFSET;
         DEBUG_PRINT_KEYS[em].func(e);  
      }
      else if  (_keys_buffer[len].key === 'M' && _keys_buffer[0].key === 'Shift') { 
         DEBUG_PRINT_KEYS[M].func(e); 
      }
      else if  (_keys_buffer[len].key === 'S' && _keys_buffer[0].key === 'Shift') { 
         DEBUG_PRINT_KEYS[S].func(e); 
      }
      else if  (_keys_buffer[len].key === 'L' && _keys_buffer[0].key === 'Shift') { 
         DEBUG_PRINT_KEYS[L].func(e); 
      }
      else if  (_keys_buffer[len].key === 'R' && _keys_buffer[0].key === 'Shift') { 
         DEBUG_PRINT_KEYS[R].func(e);  
      }
      else if  (_keys_buffer[len].key === 'X' && _keys_buffer[0].key === 'Shift') { 
         DEBUG_PRINT_KEYS[X].func(e);  
      }
      else if  (_keys_buffer[len].key === 'm' && _keys_buffer[0].key === 's') { 
         DEBUG_PRINT_KEYS[sm].func(e);  
      }
   }
   else if(len === 0){

      if       (_keys_buffer[len].key === 'p') { DEBUG_PRINT_KEYS[p].func(e);  }
      else if  (_keys_buffer[len].key === 'x') { DEBUG_PRINT_KEYS[x].func(e);  }
      else if  (_keys_buffer[len].key === 'c') { DEBUG_PRINT_KEYS[c].func(e);  }
      else if  (_keys_buffer[len].key === 'z') { DEBUG_PRINT_KEYS[z].func(e);  }
      else if  (_keys_buffer[len].key === 'r') { DEBUG_PRINT_KEYS[r].func(e);  }
      else if  (_keys_buffer[len].key === 'f') { DEBUG_PRINT_KEYS[f].func(e);  }
      else if  (_keys_buffer[len].key === 'i') { DEBUG_PRINT_KEYS[i].func(e);  }
      else if  (_keys_buffer[len].key === 'e') { DEBUG_PRINT_KEYS[E].func(e);  }
      // else if  (_keys_buffer[len].key === 'E') { DEBUG_PRINT_KEYS[E].func(e); }
      else if  (_keys_buffer[len].key === 'm') { DEBUG_PRINT_KEYS[m].func(e); }
      else if  (_keys_buffer[len].key === 'g') { DEBUG_PRINT_KEYS[g].func(e); }
   }

   // e.preventDefault();
   console.log(_keys_buffer)
   _keys_buffer = [];

}