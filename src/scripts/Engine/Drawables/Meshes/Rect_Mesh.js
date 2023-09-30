"use strict";

import { GfxSetVbRender, GlResetIndexBuffer, GlResetVertexBuffer, Gl_remove_geometry } from "../../../Graphics/Buffers/GlBuffers.js";
import { Gfx_deactivate, Gfx_generate_context } from "../../Interfaces/Gfx/GfxContext.js";
import { Scenes_remove_mesh, Scenes_update_all_gfx_starts } from "../../Scenes.js";
import { TimeIntervalsDestroyByIdx } from "../../Timers/TimeIntervals.js";
import { Geometry2D } from "../Geometry/Base/Geometry.js";
import { Material } from "../Material/Base/Material.js";
import { Mesh } from "./Base/Mesh.js";


export class Rect extends Mesh {

   constructor(pos = POSITION_CENTER, dim = [10, 10], col = BLUER3) {

      const geom = new Geometry2D(pos, dim);
      const mat = new Material(col);

      super(geom, mat);

      this.type |= MESH_TYPES_DBG.RECT_MESH;
   }

   AddChild(mesh) {

      mesh.idx = this.children.Add(mesh);
      mesh.parent = this;
      return mesh.idx;
   }

   Destroy() {

      console.log('rect_mesh destroy:', this.name);

      // Remove from gfx buffers.
      const ret = Gl_remove_geometry(this.gfx, this.geom.num_faces)
      Scenes_update_all_gfx_starts(this.sceneidx, this.gfx.prog.idx, this.gfx.vb.idx, ret);

      // Remove event listeners
      this.RemoveAllListenEvents();

      // Remove time intervals
      if (this.timeIntervalsIdxBuffer.active_count) {

         for (let i = 0; i < this.timeIntervalsIdxBuffer.boundary; i++) {

            const intervalIdx = this.timeIntervalsIdxBuffer.buffer[i];
            TimeIntervalsDestroyByIdx(intervalIdx);
            this.timeIntervalsIdxBuffer.RemoveByIdx(i);
         }
      }

      if (this.parent) this.parent.RemoveChildByIdx(this.idx); // Remove the current mesh from the parent

      // Remove from scene
      Scenes_remove_mesh(this);

   }

   /*******************************************************************************************************************************************************/
   // Graphics
   GenGfxCtx(FLAGS = GFX.ANY, gfxidx = [INT_NULL, INT_NULL]) {

      this.gfx = Gfx_generate_context(this.sid, this.sceneidx, this.mat.num_faces, FLAGS, gfxidx);
      return this.gfx;
   }

   AddToGfx() {
      
      this.geom.AddToGraphicsBuffer(this.sid, this.gfx, this.name);
      const start = this.mat.AddToGraphicsBuffer(this.sid, this.gfx);
      return start;
   }

	DeactivateGfx(){

      Gfx_deactivate(this.gfx);
      this.is_gfx_inserted = false;
   }   


   /*******************************************************************************************************************************************************/
   // Setters-Getters
   SetSceneIdx(sceneidx) {
      this.sceneidx = sceneidx;
   }

   /** Return type: Array. Returns an array of all widgets meshes */
   GetAllMeshes() {

      return [this];
   }

   /*******************************************************************************************************************************************************/
   // Events
   /**
    * @param {*} event_type typeof 'LISTEN_EVENT_TYPES'
    * @param {*} Clbk User may choose the callback for the listen event.
    */
   CreateListenEvent(event_type, Clbk = null) {

      const target_params = {
         EventClbk: null,
         targetBindingFunctions: null,
         // clicked_mesh: this.area_mesh,
         target_mesh: this,
         params: null,
      }

      if (Clbk) this.AddEventListener(event_type, Clbk, target_params);
      else this.AddEventListener(event_type, this.OnClick, target_params);
   }

}
