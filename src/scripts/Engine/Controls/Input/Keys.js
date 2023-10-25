"use strict";

import { PrintAttributes, PrintIndexBuffer, PrintIndexBufferAll, PrintVertexBufferDataAndNames, PrintVertexDataAll } from "../../../Graphics/Z_Debug/GfxDebug.js";
import { Listener_debug_print_all, Listener_debug_print_info } from "../../Events/EventListeners.js";
import { Renderqueue_get } from "../../Renderers/Renderer/RenderQueue.js";
import { ScenesPrintAllMeshes, ScenesPrintRootMeshes, Scenes_get_scene_by_idx } from "../../Scenes.js";
import { FpsGet } from "../../Timers/Time.js";
import { TimeIntervalsPrintAll } from "../../Timers/TimeIntervals.js";
import { Gfx_pool_print } from "../../Interfaces/Gfx/GfxContext.js";
import { Mesh_print_all_mesh_listeners } from "../../Drawables/Meshes/Base/Mesh.js";

_cnt = 0;
const em = _cnt++;
const p = _cnt++;
const x = _cnt++;
const X = _cnt++;
const c = _cnt++;
const C = _cnt++;
const z = _cnt++;
const r = _cnt++;
const R = _cnt++;
const f = _cnt++;
const i = _cnt++;
const ee = _cnt++;
const E = _cnt++;
const m = _cnt++;
const M = _cnt++;
const S = _cnt++;
const s3 = _cnt++;
const s4 = _cnt++;
const L = _cnt++;
const g = _cnt++;

export const DEBUG_PRINT_KEYS = [

   { 
      key: 'em',
      discr: 'Mesh_print_all_mesh_listeners',
      func: (e)=>{
         console.log('------------------ Mesh_print_all_mesh_listeners ------------------')
         Mesh_print_all_mesh_listeners();
      },
   },
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
      key: 'C',
      discr: 'PrintIndexBuffer()',
      func: (e)=>{
         console.log('e.key');
         PrintIndexBuffer();
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
         Renderqueue_get().PrintAll();
      },
   },
   {
      key: 'R',
      discr: 'RenderQueue PrintActive()',
      func: (e)=>{
         console.log(e.key);
         Renderqueue_get().PrintActive();
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
         console.log('------------------ Listener_debug_print_all ------------------')
         Listener_debug_print_all();
      },
   },
   {
      key: 'E',
      discr: '-- Listener_debug_print_info--',
      func: (e)=>{
         console.log('------------------ Listener_debug_print_all ------------------')
         Listener_debug_print_info();

      },
   },
   {
      key: 'm',
      discr: 'ScenesPrintAllMeshes',
      func: (e)=>{
         let cnt = 0;
         console.log('------------------ Scene\'s All meshes (recursive) ------------------')
         const count = ScenesPrintAllMeshes(STATE.scene.active.root_meshes, cnt);
         console.log('Count: ', count)
      },
   },
   {
      key: 'M',
      discr: 'ScenesPrintRootMeshes',
      func: (e)=>{
         console.log('------------------ Scene\'s root children meshes ------------------')
         const count = ScenesPrintRootMeshes(STATE.scene.active.root_meshes);
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
      key: 's3',
      discr: 'Scene:PrintGfxStorageBuffer()',
      func: (e)=>{
         console.log('------------------ Scene:PrintGfxStorageBuffer() ------------------');
         const scene = Scenes_get_scene_by_idx(STATE.scene.active_idx);
         scene.PrintGfxStorageBuffer();
      },
   },
   {
      key: 's4',
      discr: 'Scene:PrintRootMeshBuffer()',
      func: (e)=>{
         console.log('------------------ Scene:PrintRootMeshBuffer() ------------------');
         const scene = Scenes_get_scene_by_idx(STATE.scene.active_idx);
         scene.PrintRootMeshBuffer();
      },
   },
   {
      key: 'L',
      discr: 'NULL',
      func: (e)=>{
         console.log('------------------ UN-ASSIGNED ------------------');
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
      else if  (_keys_buffer[len].key === 'C' && _keys_buffer[0].key === 'Shift') { 
         DEBUG_PRINT_KEYS[C].func(e);  
      }
      else if  (_keys_buffer[len].key === 'E' && _keys_buffer[0].key === 'Shift') { 
         DEBUG_PRINT_KEYS[E].func(e);  
      }
      else if  (_keys_buffer[0].key === 's') { 

         if       (_keys_buffer[len].key === '3') DEBUG_PRINT_KEYS[s3].func(e);  
         else if  (_keys_buffer[len].key === '4') DEBUG_PRINT_KEYS[s4].func(e);  
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
      else if  (_keys_buffer[len].key === 'e') { DEBUG_PRINT_KEYS[ee].func(e);  }
      else if  (_keys_buffer[len].key === 'm') { DEBUG_PRINT_KEYS[m].func(e); }
      else if  (_keys_buffer[len].key === 'g') { DEBUG_PRINT_KEYS[g].func(e); }
   }

   // e.preventDefault();
   // console.log(_keys_buffer)
   _keys_buffer = [];

}