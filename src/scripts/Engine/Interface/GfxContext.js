"use strict";

import { GfxSetVbRender, GlGenerateContext, GlResetIndexBuffer, GlResetVertexBuffer, GlSetVertexBufferPrivate } from "../../Graphics/Buffers/GlBuffers.js";
import { GlCheckSid } from "../../Graphics/GlProgram.js";
import { M_Buffer } from "../Core/Buffers.js";


class Gfx_Pool extends M_Buffer {

   session;

   constructor() {
      super();
      this.session = []; // SEE ## Gfx_Pool.session
   }

   GenerateGfxCtx(sid, sceneIdx, useSpecificVertexBuffer, mesh_count) {

      if (useSpecificVertexBuffer === GL_VB.NEW) {

         const gfx = GlGenerateContext(sid, sceneIdx, useSpecificVertexBuffer, NO_SPECIFIC_GL_BUFFER, mesh_count);
         this.#StoreGfx(gfx);
         return gfx;
      }
      else { // ... case specific or any gfx buffer is acceptable ...

         if (useSpecificVertexBuffer === GL_VB.ANY) { // ... if mesh could be added to any gfx buffer ... 

            // ... Check if an avaliable gfx buffer exists ...
            const found = this.#GetNotPrivateBySid(sid);
            if (found) {

               const gfx = GlGenerateContext(sid, sceneIdx, GL_VB.SPECIFIC, found.vbidx, mesh_count);
               return gfx;
            }
            else { // ... else if pool didn't find any buffer, create a new one ...

               const gfx = GlGenerateContext(sid, sceneIdx, GL_VB.NEW, NO_SPECIFIC_GL_BUFFER, mesh_count);
               this.#StoreGfx(gfx);
               return gfx;
            }
         }
      }
   }
   // TODO: If we ask for a new buffer IMPLEMENT in what buffers the children will be set
   GenerateAndAddGfxCtx(mesh, useSpecificVertexBuffer) {

      if (useSpecificVertexBuffer === GL_VB.NEW) { // Create new buffer but not private

         mesh.gfx = GlGenerateContext(mesh.sid, mesh.sceneIdx, useSpecificVertexBuffer, NO_SPECIFIC_GL_BUFFER, mesh.num_faces);
         this.#StoreGfx(mesh.gfx);
         mesh.AddToGfx();
      }
      else { // ... case specific or any gfx buffer is acceptable ...
         
         if (useSpecificVertexBuffer === GL_VB.ANY) { // ... if mesh could be added to any gfx buffer ... 
            
            // ... Check if an avaliable gfx buffer exists ...
            const found = this.#GetNotPrivateBySid(mesh.sid);
            if (found) {
               
               mesh.gfx = GlGenerateContext(mesh.sid, mesh.sceneIdx, GL_VB.SPECIFIC, found.vbidx, mesh.num_faces);
               mesh.AddToGfx();
            }
            else { // ... else if pool didn't find any buffer, create a new one ...
               
               mesh.gfx = GlGenerateContext(mesh.sid, mesh.sceneIdx, GL_VB.NEW, NO_SPECIFIC_GL_BUFFER, mesh.num_faces);
               this.#StoreGfx(mesh.gfx);
               mesh.AddToGfx();
            }
         }
      }
   }

   // Activates the rendering of the gfx buffers
   ActivateRecursive(mesh) {

      for (let i = 0; i < mesh.children.count; i++) {

         const child = mesh.children.buffer[i];
         if (child) this.ActivateRecursive(child)
      }

      const progidx = mesh.gfx.prog.idx;
      const vbidx = mesh.gfx.vb.idx;

      this.#ActDeactFromPool(progidx, vbidx, true);
      GfxSetVbRender(progidx, vbidx, true);

   }

   DeactivateRecursive(mesh) {

      for (let i = 0; i < mesh.children.count; i++) {

         const child = mesh.children.buffer[i];
         if (child) this.DeactivateRecursive(child)
      }

      const progidx = mesh.gfx.prog.idx;
      const vbidx = mesh.gfx.vb.idx;

      this.#ActDeactFromPool(progidx, vbidx, false);
      GlResetVertexBuffer(mesh.gfx);
      GlResetIndexBuffer(mesh.gfx);
      GfxSetVbRender(progidx, vbidx, false);

      mesh.RemoveAllListenEvents();

   }

   RequestPrivateGfxCtx(mesh, flags, handler_progidx = INT_NULL, handler_vbidx = INT_NULL) {

      this.#ResolveGfxCtxRecursive(mesh, flags, handler_progidx, handler_vbidx);
   }

   SessionEnd(setPrivate) {

      const count = this.session.length;
      for (let i = 0; i < count; i++) {

         const idx = this.session[i];

         this.buffer[idx].isActive = true;
         this.buffer[idx].isPrivate = setPrivate;

         const progidx = this.buffer[idx].progidx,
            vbidx = this.buffer[idx].vbidx;
         if (setPrivate)
            GlSetVertexBufferPrivate(progidx, vbidx);
      }

      this.session = [];
   }

   #StoreGfx(gfx) { //Does not store duplicates

      // Store it, if not stored.
      if (this.#FindGfxNotPrivate(gfx.prog.idx, gfx.vb.idx) === INT_NULL) {
         const idx = this.#Store(gfx.prog.idx, gfx.vb.idx, gfx.sceneIdx, true, false)
         return idx;
      }
   }

   #Store(progidx, vbidx, isPrivate, isActive = true) {

      const idx = this.Add({
         progidx: progidx,
         vbidx: vbidx,
         sceneidx: vbidx,
         isActive: isActive,
         isPrivate: isPrivate,
      });

      this.session.push(idx);

      return idx;
   }

   #ActDeactFromPool(progidx, vbidx, flag) {
      for (let i = 0; i < this.count; i++) {
         if (this.buffer[i].progidx === progidx && this.buffer[i].vbidx === vbidx) {
            this.buffer[i].isActive = flag;
            return true;
         }
      }
      console.error('No such gl program found. @ MenuOptionsHandler.js Deactivate()');
   }

   #ResolveGfxCtxRecursive(mesh, flags, progidx, vbidx, COUNTER = null) {

      /*DEBUG*/if(COUNTER === null) COUNTER = 0;

      if (flags & (GFX_CTX_FLAGS.PRIVATE | GFX_CTX_FLAGS.INACTIVE)) {

         for (let i = 0; i < mesh.children.count; i++) {
            /*DEBUG*/COUNTER++;

            const child = mesh.children.buffer[i];
            if (child) {
               // if(DEBUG.GFX.ADD_MESH) console.log(COUNTER, 'traversing... child:', child.name)
               this.#ResolveGfxCtxRecursive(child, flags, progidx, vbidx, COUNTER)
            }
         }

         if (!mesh.gfx) { // ... Case its a newly created mesh and looking to be added to gfx ...

            const gfx = this.#GetInactiveAndPrivateBySid(mesh.sid); // ... Check if we have a buffer for the request...

            if (gfx) { // ... If we have, use it...
               // use specific gfx context
               mesh.gfx = GlGenerateContext(mesh.sid, mesh.sceneIdx, GL_VB.SPECIFIC, gfx.vbidx, mesh.mat.num_faces);
               // console.log(mesh.name, mesh.mat.num_faces)
            }
            else { // ... else create a new buffer and register it to the pool...

               // Create new buffers
               mesh.gfx = GlGenerateContext(mesh.sid, mesh.sceneIdx, GL_VB.NEW, NO_SPECIFIC_GL_BUFFER, mesh.mat.num_faces)
               this.#Store(mesh.gfx.prog.idx, mesh.gfx.vb.idx, true, false)
            }
         }
         // ... case the mesh already has a gfx and matches the root's mesh gfx.
         else if (mesh.gfx.prog.idx === progidx, mesh.gfx.vb.idx === vbidx) {

            mesh.gfx = GlGenerateContext(mesh.sid, mesh.sceneIdx, GL_VB.SPECIFIC, vbidx, mesh.mat.num_faces); // we pass the roots vbidx
            const gfx = this.#FindGfx(progidx, vbidx)
         }
         else{
            // TODO: Else the mesh already has a gfx but we have to check if it belongs to a private buffer.
            // If NOT, then we must create one
            // 'Η αλλιως μπορουμε να κανουμε το check στοαρχικο if statement: if(!mesh.gfx || mesh.gfx && mesh.gfx  is in private buffer)
         }
         if(DEBUG.GFX.ADD_MESH) console.log(COUNTER, 'Adding mesh:', mesh.name, 'vbidx:', mesh.gfx.prog.idx, mesh.gfx.vb.idx, 'At:', mesh.gfx.vb.start)
         mesh.AddToGfx();
      }

   }

   #GetInactiveAndPrivateBySid(sid) {

      for (let i = 0; i < this.count; i++) {
         if (!this.buffer[i].isActive && this.buffer[i].isPrivate && GlCheckSid(sid, this.buffer[i].progidx))
            return this.buffer[i];
      }
      console.warn('No inactive vbidx found. @ MenuOptionsHandler.js GetInactiveBySid(). Buffer:', this.buffer, ' looking for sid:', sid);
      return null;
   }

   #GetNotPrivateBySid(sid) {

      for (let i = 0; i < this.count; i++) {
         if (!this.buffer[i].isPrivate && GlCheckSid(sid, this.buffer[i].progidx))
            return this.buffer[i];
      }
      console.warn('No inactive vbidx found. @ MenuOptionsHandler.js GetInactiveBySid(). Buffer:', this.buffer, ' looking for sid:', sid);
      return null;
   }

   #FindGfx(progidx, vbidx) {

      for (let i = 0; i < this.count; i++)
         if (this.buffer[i].progidx === progidx &&
            this.buffer[i].vbidx === vbidx)
            return this.buffer[i];

      return null
   }

   #FindGfxNotPrivate(progidx, vbidx) {

      for (let i = 0; i < this.count; i++)
         if (!this.buffer[i].isPrivate &&
            this.buffer[i].progidx === progidx &&
            this.buffer[i].vbidx === vbidx)
            return i;

      return INT_NULL
   }


   // #GetInactiveBySid(sid) {

   //    for (let i = 0; i < this.count; i++) {
   //       if (!this.buffer[i].isActive && GlCheckSid(sid, this.buffer[i].progidx))
   //          return this.buffer[i];
   //    }
   //    console.warn('No inactive vbidx found. @ MenuOptionsHandler.js GetInactiveBySid(). Buffer:', this.buffer, ' looking for sid:', sid);
   //    return null;
   // }

   // FindGfxInactive(progidx, vbidx) {

   //    for (let i = 0; i < this.count; i++)
   //       if (!this.buffer[i].isActive &&
   //          this.buffer[i].progidx === progidx &&
   //          this.buffer[i].vbidx === vbidx)
   //          return i;

   //    return INT_NULL
   // }

   // FindGfxInactivePrivate(progidx, vbidx) {

   //    for (let i = 0; i < this.count; i++)
   //       if (!this.buffer[i].isActive &&
   //          this.buffer[i].isPrivate &&
   //          this.buffer[i].progidx === progidx &&
   //          this.buffer[i].vbidx === vbidx)
   //          return i;

   //    return INT_NULL
   // }
};


const _gfx_pool = new Gfx_Pool;


export function Gfx_get_pool() { return _gfx_pool; }

/** Finish the session by setting all the assigned gfx buffers to active. Also sets private all the gfx buffers  */
export function Gfx_end_session(setPrivate) { return _gfx_pool.SessionEnd(setPrivate); }

// mesh_count is nesessary for calculating vertex buffer attribute offset for Text Meshes
export function Gfx_generate_context(sid, sceneIdx, useSpecificVertexBuffer, mesh_count) {
   return _gfx_pool.GenerateGfxCtx(sid, sceneIdx, useSpecificVertexBuffer, mesh_count);
}
// TODO!!! LOK the implementation
export function Gfx_generate_context_and_add(mesh, useSpecificVertexBuffer) {
   return _gfx_pool.GenerateAndAddGfxCtx(mesh, useSpecificVertexBuffer);
}
/** Also adds all meshes recursively to the gfx pipeline, so we need to pass the root mesh for the function to work */
export function Request_private_gfx_ctx(mesh, flags, progidx, vbidx) {
   return _gfx_pool.RequestPrivateGfxCtx(mesh, flags, progidx, vbidx);
}

/** Activates the gfx buffers recursively for all the children meshes. */
export function Gfx_activate(mesh) { _gfx_pool.ActivateRecursive(mesh); }
export function Gfx_deactivate(mesh) { _gfx_pool.DeactivateRecursive(mesh); }


// export function Gfx_store(gfx) {
//    _gfx_pool.StoreGfx(gfx);
// }

export function Gfx_pool_print() {

   // console.log('Gfx Pool: ', _gfx_pool);
   for (let i = 0; i < _gfx_pool.count; i++) {

      console.log('Gfx Pool: ', _gfx_pool.buffer[i]);
   }
}