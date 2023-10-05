"use strict";

import { Listener_events_set_mesh_events_active } from "../../Events/EventListeners.js";
import { Gfx_deactivate, Gfx_generate_context, Gfx_remove_geometry } from "../../Interfaces/Gfx/GfxContext.js";
import { Scenes_remove_mesh_from_gfx, Scenes_remove_root_mesh, Scenes_store_gfx_to_buffer, Scenes_update_all_gfx_starts } from "../../Scenes.js";
import { TimeIntervalsDestroyByIdx } from "../../Timers/TimeIntervals.js";
import { Info_listener_dispatch_event } from "../DebugInfo/InfoListeners.js";
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

      // console.log('rect_mesh destroy:', this.name);

      
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

      // Remove from gfx buffers.
      // Remove from scene
      Scenes_remove_root_mesh(this, this.sceneidx);
      const error = Scenes_remove_mesh_from_gfx(this.sceneidx, this.gfx.prog.idx, this.gfx.vb.idx, this.gfx.scene_gfx_mesh_idx); // Remove mesh from the scene's gfx buffer
      if(error){ console.error('ERROR REMOVING RECT_MESH: ', this.name); }
      const ret = Gfx_remove_geometry(this.gfx, this.geom.num_faces)
      Scenes_update_all_gfx_starts(this.sceneidx, this.gfx.prog.idx, this.gfx.vb.idx, ret); // Update the gfx.start of all meshes that are inserted in the same vertex buffer.

      if (this.parent) this.parent.RemoveChildByIdx(this.idx); // Remove the current mesh from the parent

   }

   /*******************************************************************************************************************************************************/
   // Graphics
   GenGfxCtx(FLAGS = GFX.ANY, gfxidx = [INT_NULL, INT_NULL]) {

      this.gfx = Gfx_generate_context(this.sid, this.sceneidx, this.geom.num_faces, FLAGS, gfxidx);
      Scenes_store_gfx_to_buffer(this.sceneidx, this);
      return this.gfx;
   }

   AddToGfx() {
      
      this.geom.AddToGraphicsBuffer(this.sid, this.gfx, this.name);
      const start = this.mat.AddToGraphicsBuffer(this.sid, this.gfx);

      const params = {
            progidx: this.gfx.prog.idx,
            vbidx: this.gfx.vb.idx,
            sceneidx: this.sceneidx,
            isActive: true,
            isPrivate: (FLAGS & GFX.PRIVATE) ? true : false,
            type: INFO_LISTEN_EVENT_TYPE.GFX.UPDATE_VB,
         }
      Info_listener_dispatch_event(INFO_LISTEN_EVENT_TYPE.GFX.UPDATE, params);

      return start;
   }

	DeactivateGfx(){

      if (this.listeners.active_count) {
         Listener_events_set_mesh_events_active(LISTENERS_FLAGS.ALL, this.listeners, false);
      }
      Gfx_deactivate(this.gfx);
      this.is_gfx_inserted = false;
   }   


   /*******************************************************************************************************************************************************/
   // Setters-Getters
   SetSceneIdx(sceneidx) { this.sceneidx = sceneidx; }

   GetTotalWidth(){ return this.geom.dim[0]; }

   GetTotalHeight(){ return this.geom.dim[1]; }
   
   GetCenterPosX(){ return this.geom.pos[0]; }

   GetCenterPosY(){ return this.geom.pos[1]; }

   /** Return type: Array. Returns an array of all widgets meshes */
   GetAllMeshes() { return [this]; }

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
