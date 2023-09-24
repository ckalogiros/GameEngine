"use strict";

import { GfxSetVbRender, GlGenerateContext, GlResetIndexBuffer, GlResetVertexBuffer, GlSetVertexBufferPrivate } from "../../../Graphics/Buffers/GlBuffers.js";
import { GlCheckSid } from "../../../Graphics/GlProgram.js";
import { M_Buffer } from "../../Core/Buffers.js";
import { Info_listener_dispatch_event } from "../../DebugInfo/InfoListeners.js";


let _sessionId = 0;

export class Gfx_Pool extends M_Buffer {

   session;

   constructor() {
      super();
      this.session = []; // SEE ## Gfx_Pool.session
   }

   GenerateGfxCtx(sid, sceneIdx, mesh_count, FLAGS, gfxIdx=[INT_NULL, INT_NULL]) {

      /** Case we have an open session and we dont want to pass any FLAGS 
       * to the rest of the mesh until the session is over. 
       * We look if a session is active and if the FLAGS is 'ANY', which is the default
       * value if nothing is passed as FLAGS param. 
       */
      if(this.session[0] !== undefined && FLAGS & GFX.ANY) FLAGS = GFX.PRIVATE;

      if (FLAGS & GFX.NEW) {

         const gfx = GlGenerateContext(sid, sceneIdx, FLAGS, NO_SPECIFIC_GL_BUFFER, mesh_count);
         gfx.gfx_ctx.idx = this.#StoreGfx(gfx);
         return gfx;
      }
      else { // ... case specific or any gfx buffer is acceptable ...

         if (FLAGS & GFX.ANY) { // ... if mesh could be added to any gfx buffer ... 

            // ... Check if an available gfx buffer exists ...
            const found = this.#GetNotPrivateBySid(sid);
            if (found) {

               const gfx = GlGenerateContext(sid, sceneIdx, GFX.SPECIFIC, found.vbidx, mesh_count);
               return gfx;
            }
            else { // ... else if pool didn't find any buffer, create a new one ...

               const gfx = GlGenerateContext(sid, sceneIdx, GFX.NEW, NO_SPECIFIC_GL_BUFFER, mesh_count);
               gfx.gfx_ctx.idx = this.#StoreGfx(gfx, FLAGS & GFX.PRIVATE);
               return gfx;
            }
         }
         /** TODO: We want the case that a specific buffer was rewuested but at the FLAGS is passed 'PRIVATE'
          * Maybe re-implement by resolve the 'FLASGS' state at the begining of the function,
          * and use a simpler flag in all if statements.
          */
         else if((FLAGS & GFX.SPECIFIC) ||
            (FLAGS & GFX.PRIVATE) && gfxIdx[0] !== INT_NULL && gfxIdx[1] !== INT_NULL){
            
            const gfx_idx = this.FindGfx(gfxIdx[0], gfxIdx[1]);
            if(gfx_idx){
               
               const gfx = GlGenerateContext(sid, sceneIdx, GFX.SPECIFIC, gfx_idx.vbidx, mesh_count);
               gfx.gfx_ctx.idx = this.#StoreGfx(gfx);
               return gfx;
            }
            /*DEBUG:Wrong use of gfxidx.*/
            else console.error('Could not locate specific buffer. gfxIdx:', gfxIdx, ' @ GenerateGfxCtx(), GfxCtx2.js')
         }
         else if(FLAGS & GFX.PRIVATE){
            
            // ... Check if an available Private gfx buffer exists ...
            const foundIdx = this.#GetInactiveAndPrivateBySid(sid);
            if (foundIdx !== INT_NULL) {

               const vbidx = this.buffer[foundIdx].vbidx
               const gfx = GlGenerateContext(sid, sceneIdx, GFX.SPECIFIC, vbidx, mesh_count);
               gfx.gfx_ctx.idx = foundIdx;
               // Add this gfx to the session
               const idx = this.FindGfxIdx(gfx.prog.idx, gfx.vb.idx)
               /*DEBUG*/ ERROR_NULL(idx);
               this.session.push(idx);
               
               gfx.gfx_ctx.sessionId = this.buffer[idx].sessionId;

               GfxSetVbRender(gfx.prog.idx, gfx.vb.idx, true); // Corrects the none rendering of the deactivated popup's [0] vertex buffer

               return gfx;
            }
            else { // ... else if pool didn't find any Private buffer, create a new one ...

               const gfx = GlGenerateContext(sid, sceneIdx, GFX.NEW, NO_SPECIFIC_GL_BUFFER, mesh_count);
               gfx.gfx_ctx.idx = this.#StoreGfx(gfx, FLAGS & GFX.PRIVATE);
               gfx.gfx_ctx.sessionId = _sessionId; // MAYBE BUG. Better to extract sessionId from 'this.buffer[gfx.gfx_ctx.idx].sessionId'
               // Info_listener_dispatch_event(INFO_LISTEN_EVENT_TYPE.GFX, {added_gfx:this.buffer[gfx.gfx_ctx.idx]});
               return gfx;
            }
         }
      }
   }

   // Enable gfx generation (for new meshes) from existing private gfx buffers.
   SessionOpen(idxs){

      /**
       * Deactivate temporarely the vrtex buffers given in the param:vbidxs,
       * so that the GfxCtx can generate gfx context on exixting gfx buffers.
       */

      console.log('GfxCtx-SessionOpen->gfx_idxs:', idxs)


      // Must not run if session is already open.
      /** DEBUG*/if(this.session[0]){
         
         console.error('Gfx Session is already open')
         console.log('session:', this.session, this.buffer)
      } 

      const count = idxs.length;
      for(let i=0; i<count; i++){

         const idx = this.FindGfxIdx(idxs.progidx, idxs.vbidx);
         if(idx !== INT_NULL){ // If the progidx-vbidx is not found, that probably means that the new vertex buffer is not yet added, and that the dispatch event to the debug_info_ui hapened first(before the gfx generation) 

            this.buffer[idx].isActive = false;
            this.session.push(idx); // Push the existing gfx buffer indexes to the session, so that they can be deactivated with 'Session_end...()'.
         }
      }
   }

   SessionEnd(setPrivate, setActive=true) {

      const count = this.session.length;

      /*DEBUG*/if(count < 1) console.error('No elesments in gfx session buffer. Something went wrong');

      for (let i = 0; i < count; i++) {

         const idx = this.session[i];

         this.buffer[idx].isActive = setActive;
         this.buffer[idx].isPrivate = setPrivate;

         
         const progidx = this.buffer[idx].progidx,
         vbidx = this.buffer[idx].vbidx;
         if(progidx === 0 && vbidx === 6)
            console.log()
         if (setPrivate)
            GlSetVertexBufferPrivate(progidx, vbidx);

      }

      this.session = [];
      _sessionId++; // A session just completed, so we need to increment for the next session.
   }

   #StoreGfx(gfx, isPrivate) { // Does not store duplicates

      // Store it, if not stored.
      if (this.FindGfxIdx(gfx.prog.idx, gfx.vb.idx) === INT_NULL) {
         const idx = this.#Store(gfx.prog.idx, gfx.vb.idx, gfx.sceneIdx, true, isPrivate);
         return idx;
      }
   }

   /** This function is called only if progidx and vbidx have not been added. i.e. Does not run for duplicates  */
   #Store(progidx, vbidx, sceneIdx, isActive = true, isPrivate) {

      const obj = {
         progidx: progidx,
         vbidx: vbidx,
         sceneidx: sceneIdx,
         isActive: (isPrivate > 0) ? false : true,
         isPrivate: (isPrivate > 0) ? true : false,
         sessionId:  INT_NULL,
      }

      const idx = this.Add(obj);

      if(isPrivate){

         this.session.push(idx);
         this.sessionId = _sessionId; // It remains the same id until SessionEnd() is called by the caller.
      }

      Info_listener_dispatch_event(INFO_LISTEN_EVENT_TYPE.GFX, {added_gfx:obj});

      return idx;
   }

   #ActDeactFromPool(progidx, vbidx, flag) {
      for (let i = 0; i < this.boundary; i++) {
         if (this.buffer[i].progidx === progidx && this.buffer[i].vbidx === vbidx) {
            this.buffer[i].isActive = flag;
            return true;
         }
      }
      console.error('No such gl program found. @ MenuOptionsHandler.js Deactivate()');
   }

   #GetInactiveAndPrivateBySid(sid) {

      for (let i = 0; i < this.boundary; i++) {
         if (!this.buffer[i].isActive && this.buffer[i].isPrivate && GlCheckSid(sid, this.buffer[i].progidx))
            return i;
      }
      console.warn('No inactive vbidx found. @ MenuOptionsHandler.js GetInactiveBySid(). Buffer:', this.buffer, ' looking for sid:', sid);
      return INT_NULL;
   }

   #GetNotPrivateBySid(sid) {

      for (let i = 0; i < this.boundary; i++) {
         if (!this.buffer[i].isPrivate && GlCheckSid(sid, this.buffer[i].progidx))
            return this.buffer[i];
      }
      console.warn('No inactive vbidx found. @ MenuOptionsHandler.js GetInactiveBySid(). Buffer:', this.buffer, ' looking for sid:', sid);
      return null;
   }

   FindGfx(progidx, vbidx) {

      for (let i = 0; i < this.boundary; i++)
         if (this.buffer[i].progidx === progidx &&
            this.buffer[i].vbidx === vbidx)
            return this.buffer[i];

      return null
   }

   FindGfxIdx(progidx, vbidx) {

      for (let i = 0; i < this.boundary; i++)
         if (this.buffer[i].progidx === progidx &&
            this.buffer[i].vbidx === vbidx)
            return i;

      return INT_NULL
   }

   #FindGfxNotPrivate(progidx, vbidx) {

      for (let i = 0; i < this.boundary; i++)
         if (!this.buffer[i].isPrivate &&
            this.buffer[i].progidx === progidx &&
            this.buffer[i].vbidx === vbidx)
            return i;

      return INT_NULL
   }

   // Activates rendering of the meshe's gfx buffers
   ActivateRecursive(mesh) {

      for (let i = 0; i < mesh.children.boundary; i++) {

         const child = mesh.children.buffer[i];
         if (child) this.ActivateRecursive(child)
      }

      if(!mesh.gfx) console.log(mesh.name, mesh)
      else{
         const progidx = mesh.gfx.prog.idx;
         const vbidx = mesh.gfx.vb.idx;

         this.#ActDeactFromPool(progidx, vbidx, true);
         GfxSetVbRender(progidx, vbidx, true);
      }

   }

   /** */
   DeactivateRecursive(mesh) {

      for (let i = 0; i < mesh.children.boundary; i++) {

         const child = mesh.children.buffer[i];
         if (child) 
            this.DeactivateRecursive(child)
      }

      if(!mesh.gfx) console.log(mesh.name, mesh)
      // else
      {

         const progidx = mesh.gfx.prog.idx;
         const vbidx = mesh.gfx.vb.idx;

         this.#ActDeactFromPool(progidx, vbidx, false);
         GlResetVertexBuffer(mesh.gfx);
         GlResetIndexBuffer(mesh.gfx);
         GfxSetVbRender(progidx, vbidx, false);

         mesh.RemoveAllListenEvents();
      }

   }

   DeactivateRecursive_no_listeners_touch(mesh) {

      for (let i = 0; i < mesh.children.boundary; i++) {

         const child = mesh.children.buffer[i];
         if (child) 
            this.DeactivateRecursive_no_listeners_touch(child)
      }

      // if(mesh.gfx)
      if(!mesh.gfx) console.log(mesh.name, mesh)
      else
      {
         const progidx = mesh.gfx.prog.idx;
         const vbidx = mesh.gfx.vb.idx;
   
         this.#ActDeactFromPool(progidx, vbidx, false);
         GlResetVertexBuffer(mesh.gfx);
         GlResetIndexBuffer(mesh.gfx);
         GfxSetVbRender(progidx, vbidx, false);
      }
   }
};


const _gfx_pool = new Gfx_Pool;


/** Finish the session by setting all the assigned gfx buffers to active. Also sets private all the gfx buffers  */
export function Gfx_end_session(setPrivate, setActive) { return _gfx_pool.SessionEnd(setPrivate, setActive); }
export function Gfx_open_session(gfx_idxs) { return _gfx_pool.SessionOpen(gfx_idxs); }

/* mesh_count is nesessary for calculating vertex buffer attribute offset for Text Meshes */
export function Gfx_generate_context(sid, sceneIdx, mesh_count, FLAGS, gfxidx) {
   return _gfx_pool.GenerateGfxCtx(sid, sceneIdx, mesh_count, FLAGS, gfxidx);
}

/** Activates the gfx buffers recursively for all the children meshes. */
export function Gfx_activate(mesh) { _gfx_pool.ActivateRecursive(mesh); }
export function Gfx_deactivate(mesh) { _gfx_pool.DeactivateRecursive(mesh); }
export function Gfx_deactivate_no_listeners_touch(mesh) { _gfx_pool.DeactivateRecursive_no_listeners_touch(mesh); }

export function Gfx_is_private_vb(progidx, vbidx){
   
   const gfx = _gfx_pool.FindGfx(progidx, vbidx);
   if(gfx.isPrivate) return true;
   return false;
}


/** DEBUG PRINT */
export function Gfx_pool_print() {

   for (let i = 0; i < _gfx_pool.boundary; i++) {

      console.log('Gfx Pool: ', _gfx_pool.buffer[i]);
   }
}