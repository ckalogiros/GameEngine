"use strict";

import { Gl_remove_geometry } from "../../../Graphics/Buffers/GlBufferOps.js";
import { Gl_create_shader_program, Gl_create_vertex_buffer, Gl_generate_context, ProgramExists } from "../../../Graphics/Buffers/GlBuffers.js";
import { Gl_progs_get_prog_byidx, Gl_set_vb_show } from "../../../Graphics/GlProgram.js";
import { M_Buffer } from "../../Core/Buffers.js";
import { Renderqueue_Add } from "../../Renderers/Renderer/RenderQueue.js";


/**
 * ### Tracing data
 * 
 * Any gfx in gfx pool is set to active, by the 'inUse' variable: 
 *    in 'Store()', when new gfx buffer is created.
 *    in 'Gfx_generate_context()'.
 * Any gfx in gfx pool is set to inactive:
 *    in 'Gfx_remove_geometry()' 
 */

const _gfx_pool_index_buffers = new M_Buffer();

export function Gfx_create_group_buffer(groupidx) {
   const idx = _gfx_pool_index_buffers.Add(new M_Buffer());
   /**DEBUG */ if (idx !== groupidx)
      alert('ERROR: the index created for the Scenes programs group is not as the index of the program group that was created')
}

export function Gfx_create_program_buffer(groupidx, progidx) {
   const idx = _gfx_pool_index_buffers.buffer[groupidx].Add(new M_Buffer());
   /**DEBUG */ if (idx !== progidx)
      alert('ERROR: the index created for the Scenes program is not as the index of the shader program that was created')
}

export function Gfx_create_vertexbuffer_buffer(groupidx, progidx, vbidx) {
   const idx = _gfx_pool_index_buffers.buffer[groupidx].buffer[progidx].Add(new M_Buffer());
   /**DEBUG */ if (idx !== vbidx)
      alert('ERROR: the index created for the Scenes vertex buffer is not as the index of the vertex buffer that was created')
}

function Gfx_create_gfx_data_buffer(groupidx, progidx, vbidx, sceneidx, inUse = true, isPrivate) {
   const data = {
      groupidx: groupidx,
      progidx: progidx,
      vbidx: vbidx,
      sceneidx: sceneidx,
      inUse: inUse,
      isPrivate: (isPrivate) ? true : false,
   }
   _gfx_pool_index_buffers.buffer[groupidx].buffer[progidx].buffer[vbidx] = data;
}

function Gfx_find_notActive_and_private_vb(groupidx, progidx){
if(groupidx === 0 && progidx === 3)
console.log()
   const vbcount = _gfx_pool_index_buffers.buffer[groupidx].buffer[progidx].boundary;
   for(let i=0; i<vbcount; i++){
      const data = _gfx_pool_index_buffers.buffer[groupidx].buffer[progidx].buffer[i];
      if(!data.inUse && data.isPrivate) return data;
   }
   return null;
}

function Gfx_find_notActive_and_notPrivate_vb(groupidx, progidx){

   const vbcount = _gfx_pool_index_buffers.buffer[groupidx].buffer[progidx].boundary;
   for(let i=0; i<vbcount; i++){
      const data = _gfx_pool_index_buffers.buffer[groupidx].buffer[progidx].buffer[i];
      if(!data.inUse && !data.isPrivate) return data;
   }
   return null;
}

export function Gfx_remove_geometry(gfx, num_faces) {
   const ret = Gl_remove_geometry(gfx, num_faces);
   if (ret.empty) { // If the vertex buffer is empty, then set it as not active, so it can be used by other gfx demands.
      _gfx_pool_index_buffers.buffer[gfx.prog.groupidx].buffer[gfx.prog.idx].buffer[gfx.vb.idx].inUse = false;
      Gl_set_vb_show(gfx.prog.groupidx, gfx.prog.idx, gfx.vb.idx, false);
   }
   return ret;
}

export function Gfx_activate(mesh) {

   for (let i = 0; i < mesh.children.boundary; i++) {

      const child = mesh.children.buffer[i];
      if (child) Gfx_activate(child)
   }

   if (!mesh.gfx) console.log('DEACTIVATING MESH - GFX NOT FOUND:', mesh.name, mesh)
   else {
      const groupidx = mesh.gfx.prog.groupidx;
      const progidx = mesh.gfx.prog.idx;
      const vbidx = mesh.gfx.vb.idx;

      console.log('SetActive ', progidx, vbidx)
      _gfx_pool_index_buffers.buffer[groupidx].buffer[progidx].buffer[vbidx].inUse = true;
   }

}

export function Gfx_generate_context(sid, sceneidx, mesh_count, FLAGS, spesific_gfx_idxs) {

   let groupidx = INT_NULL;
   let progidx = INT_NULL;
   let vbidx = INT_NULL;

   // Find program
   progidx = ProgramExists(sid);

   // If shader program does not exist, create.
   if (progidx === INT_NULL) {

      const gfx_idxs = Gl_create_shader_program(sid);
      
      groupidx = gfx_idxs.groupidx;
      progidx = gfx_idxs.progidx;
   }

   /*************************************************************************************************************************************************/
   // SPECIFIC VERTEX BUFFER
   if (FLAGS & GFX_CTX_FLAGS.SPECIFIC) {

      /**DEBUG */ if (!spesific_gfx_idxs) console.error('Specific gfxctx was asked but spesific_gfx_idxs is null. @GenerateGfxCtx2().');
      groupidx = PROGRAMS_GROUPS.GetIdxByMask(sid.progs_group);
      progidx = spesific_gfx_idxs[0];
      vbidx = spesific_gfx_idxs[1];
   }
   /*************************************************************************************************************************************************/
   // NEW OR ANY VERTEX BUFFER
   else {

      groupidx = PROGRAMS_GROUPS.GetIdxByMask(sid.progs_group);
      const prog = Gl_progs_get_prog_byidx(groupidx, progidx);

      let vbfound = null;
      
      if (FLAGS & GFX_CTX_FLAGS.NEW){
         vbfound = Gfx_find_notActive_and_private_vb(groupidx, progidx);
         
      }
      else if(FLAGS & GFX_CTX_FLAGS.ANY){
         vbfound = Gfx_find_notActive_and_notPrivate_vb(groupidx, progidx);
      }

      if (!vbfound) { // If no matching vb found, create new vertex buffer
         const vb = Gl_create_vertex_buffer(sid, sceneidx, prog, groupidx);
         vb.SetPrivate(FLAGS & GFX_CTX_FLAGS.PRIVATE);
         vbidx = vb.idx;

         // Add the new vertexBuffer to the render queue
         Renderqueue_Add(groupidx, progidx, vbidx, vb.show);
      }
      else { // Else if an existing buffer is not in use, use it
         groupidx = vbfound.groupidx;
         progidx = vbfound.progidx;
         vbidx = vbfound.vbidx;

      }

   }

   const gfx = Gl_generate_context(sid, sceneidx, groupidx, progidx, vbidx, mesh_count);
   Gfx_create_gfx_data_buffer(groupidx, progidx, vbidx, sceneidx, true, FLAGS & GFX_CTX_FLAGS.PRIVATE)
   
   if(_gfx_pool_index_buffers.buffer[groupidx].buffer[progidx].buffer[vbidx].isPrivate === false)
   console.log();

   return gfx;
}

/** DEBUG PRINT */
export function Gfx_pool_print() {

   console.log('Gfx Pool: ');
   for (let i = 0; i < _gfx_pool_index_buffers.boundary; i++) {
      for (let j = 0; j < _gfx_pool_index_buffers.buffer[i].boundary; j++) {
         for (let k = 0; k < _gfx_pool_index_buffers.buffer[i].buffer[j].boundary; k++) {
            console.log(
               'group:',    _gfx_pool_index_buffers.buffer[i].buffer[j].buffer[k].groupidx,
               ' prog:',    _gfx_pool_index_buffers.buffer[i].buffer[j].buffer[k].progidx,
               ' vb:',      _gfx_pool_index_buffers.buffer[i].buffer[j].buffer[k].vbidx,
               ' active:',  _gfx_pool_index_buffers.buffer[i].buffer[j].buffer[k].inUse,
               ' private:', _gfx_pool_index_buffers.buffer[i].buffer[j].buffer[k].isPrivate,
            );
         }
      }
   }
}
