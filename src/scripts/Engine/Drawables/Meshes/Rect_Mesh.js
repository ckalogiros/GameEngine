"use strict";

import { Gfx_generate_context } from "../../Interfaces/Gfx/GfxContextCreate.js";
import { Gfx_add_geom_mat_to_vb, Gfx_set_vb_show } from "../../Interfaces/Gfx/GfxInterfaceFunctions.js";
import { Scenes_store_mesh_in_gfx } from "../../Scenes.js";
import { Find_gfx_from_parent_ascend_descend } from "../../Interfaces/Gfx/GfxContextFindMatch.js";
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
   GenGfxCtx(FLAGS = GFX_CTX_FLAGS.ANY, gfxidx = null) {

      if (FLAGS & GFX_CTX_FLAGS.PRIVATE) {

         const gfxidxs = Find_gfx_from_parent_ascend_descend(this, this.parent);
         FLAGS |= gfxidxs.rect.FLAGS; // NOTE: The only way to pass .PRIVATE to 'Gfx_generate_context()'
         this.gfx = Gfx_generate_context(this.sid, this.sceneidx, this.geom.num_faces, FLAGS, gfxidxs.rect.idxs);
         // this.gfx = Gfx_generate_context(this.sid, this.sceneidx, this.geom.num_faces, gfxidxs.rect.FLAGS, gfxidxs.rect.idxs);
      }
      else {
         this.gfx = Gfx_generate_context(this.sid, this.sceneidx, this.geom.num_faces, FLAGS, gfxidx);
      }
      return this.gfx;
   }

   AddToGfx() {

      this.gfx.vb.start = Gfx_add_geom_mat_to_vb(this.sid, this.gfx, this.geom, this.mat, this.type & MESH_TYPES_DBG.UI_INFO_GFX, this.name, this.idx);
      this.is_gfx_inserted = true;

      Scenes_store_mesh_in_gfx(this.sceneidx, this); // For storing meshes by its gfx

      // Gfx_set_vb_show(this.gfx.progs_groupidx,  this.gfx.prog.idx, this.gfx.vb.idx, true);

      const params = {
         progidx: this.gfx.prog.idx,
         vbidx: this.gfx.vb.idx,
         sceneidx: this.sceneidx,
         isActive: true,
         isPrivate: (FLAGS & GFX_CTX_FLAGS.PRIVATE) ? true : false,
         type: INFO_LISTEN_EVENT_TYPE.GFX.UPDATE_VB,
      }
      Info_listener_dispatch_event(INFO_LISTEN_EVENT_TYPE.GFX.UPDATE, params);
   }

   /*******************************************************************************************************************************************************/
   // Alignment
   Reposition_post(dif_pos) {

      this.MoveXYZ(dif_pos);

      for (let i = 0; i < this.children.boundary; i++) {
         this.children.buffer[i].MoveXYZ(dif_pos);
      }
   }

   /*******************************************************************************************************************************************************/
   // Setters-Getters
   GetMaxWidth() { return this.geom.dim[0]; }

   GetTotalHeight() { return this.geom.dim[1]; }

   GetCenterPosX() { return this.geom.pos[0]; }

   GetCenterPosY() { return this.geom.pos[1]; }

   /** Return type: Array. Returns an array of all widgets meshes */
   GetAllMeshes() { return [this]; }

}
