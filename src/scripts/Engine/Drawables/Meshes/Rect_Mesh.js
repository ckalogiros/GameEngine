"use strict";

import { Listener_events_set_mesh_events_active } from "../../Events/EventListeners.js";
import {  Gfx_generate_context } from "../../Interfaces/Gfx/GfxContext.js";
import { Gfx_add_geom_mat_to_vb } from "../../Interfaces/Gfx/GfxInterfaceFunctions.js";
import { Scenes_store_gfx_to_buffer } from "../../Scenes.js";
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

   /*******************************************************************************************************************************************************/
   // Graphics
   GenGfxCtx(FLAGS = GFX.ANY, gfxidx = [INT_NULL, INT_NULL]) {

      this.gfx = Gfx_generate_context(this.sid, this.sceneidx, this.geom.num_faces, FLAGS, gfxidx);
      Scenes_store_gfx_to_buffer(this.sceneidx, this);
      return this.gfx;
   }

   AddToGfx() {

      this.gfx.vb.start = Gfx_add_geom_mat_to_vb(this.sid, this.gfx, this.geom, this.mat, this.type & MESH_TYPES_DBG.UI_INFO_GFX, this.name);

      // if (this.listeners.active_count) {
      //    Listener_events_set_mesh_events_active(LISTENERS_FLAGS.ALL, this.listeners, true);
      // }

      const params = {
         progidx: this.gfx.prog.idx,
         vbidx: this.gfx.vb.idx,
         sceneidx: this.sceneidx,
         isActive: true,
         isPrivate: (FLAGS & GFX.PRIVATE) ? true : false,
         type: INFO_LISTEN_EVENT_TYPE.GFX.UPDATE_VB,
      }
      Info_listener_dispatch_event(INFO_LISTEN_EVENT_TYPE.GFX.UPDATE, params);
   }

   /*******************************************************************************************************************************************************/
   // Alignment
   Reposition_post(dif_pos) {

      this.MoveXYZ(dif_pos);
      
      for(let i=0; i<this.children.boundary; i++){
         this.children.buffer[i].MoveXYZ(dif_pos);
      }
   }

   /*******************************************************************************************************************************************************/
   // Setters-Getters
   GetTotalWidth() { return this.geom.dim[0]; }

   GetTotalHeight() { return this.geom.dim[1]; }

   GetCenterPosX() { return this.geom.pos[0]; }

   GetCenterPosY() { return this.geom.pos[1]; }

   /** Return type: Array. Returns an array of all widgets meshes */
   GetAllMeshes() { return [this]; }

   /*******************************************************************************************************************************************************/
   // Events
   /**
    * @param {*} event_type typeof 'LISTEN_EVENT_TYPES'
    * @param {*} Clbk User may choose the callback for the listen event.
    */
   CreateListenEvent(event_type, Clbk, parent_event) {

      const target_params = {
         EventClbk: null,
         targetBindingFunctions: null,
         // clicked_mesh: this.area_mesh,
         target_mesh: this,
         params: null,
      }

      if (Clbk) this.AddEventListener(event_type, Clbk, target_params, parent_event);
      else this.AddEventListener(event_type, this.OnClick, target_params, parent_event);
   }

}
