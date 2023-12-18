"use strict";

import { GlSetAttrTex, GlSetTex } from "../../../Graphics/Buffers/GlBufferOps.js";
import { Gl_add_geom_mat_to_vb } from "../../../Graphics/Buffers/GlBuffers.js";
import { Gl_progs_set_vb_texidx } from "../../../Graphics/GlProgram.js";
import { MouseGetPos, MouseGetPosDif } from "../../Controls/Input/Mouse.js";
import { Gfx_generate_context } from "../../Interfaces/Gfx/GfxContextCreate.js";
import { Find_gfx_from_parent_ascend_descend } from "../../Interfaces/Gfx/GfxContextFindMatch.js";
import { Scenes_store_mesh_in_gfx } from "../../Scenes.js";
import { TimeIntervalsCreate, TimeIntervalsDestroyByIdx } from "../../Timers/TimeIntervals.js";
import { Geometry2D } from "../Geometry/Base/Geometry.js";
import { Texture_Material } from "../Material/Base/Material.js";
import { Check_intersection_point_rect } from "../Operations/Collisions.js";
import { Mesh } from "./Base/Mesh.js";



export class Textured_Mesh extends Mesh {

   constructor(pos=[0,0,0], dim, color=WHITE, textureid=INT_NULL, name='UNDEFINED_TEXTURED_MESH_NAME') {

      const mat = new Texture_Material(color, textureid);
      const geom = new Geometry2D(pos, dim);

      super(geom, mat);
      this.SetName(name);
      this.type |= MESH_TYPES_DBG.TEXT_MESH;

   }

   /*******************************************************************************************************************************************************/
   // Graphics
   GenGfxCtx(FLAGS, gfxidx) {

      if (FLAGS & GFX_CTX_FLAGS.PRIVATE) {

         const gfxidxs = Find_gfx_from_parent_ascend_descend(this, this.parent);
         FLAGS |= gfxidxs.text.FLAGS; // NOTE: The only way to pass .PRIVATE to 'Gfx_generate_context()'
         this.gfx = Gfx_generate_context(this.sid, this.sceneidx, this.geom.num_faces, FLAGS, gfxidxs.text.idxs);
      }
      else {
         this.gfx = Gfx_generate_context(this.sid, this.sceneidx, this.geom.num_faces, FLAGS, gfxidx);
      }

      return this.gfx;
   }

   Render() {

      // Get the starting index of the text in the vertex buffer.

      this.gfx.vb.start = Gl_add_geom_mat_to_vb(this.sid, this.gfx, this.geom, this.mat, this.type & MESH_TYPES_DBG.UI_INFO_GFX, this.name);

      Scenes_store_mesh_in_gfx(this.sceneidx, this); // For storing meshes by its gfx

      // If texture exists, store texture index, else if font texture exists, store font texture index, else store null
      // BUG: Make sure the below statement makes sense for Texture_Material(it is copied from the Font_Material)
      this.gfx.tb.idx = (this.mat.texidx !== INT_NULL) ? this.mat.texidx : ((this.mat.uvIdx !== INT_NULL) ? this.mat.uvIdx : INT_NULL);

      Gl_progs_set_vb_texidx(this.gfx.prog.groupidx, this.gfx.prog.idx, this.gfx.vb.idx, this.gfx.tb.idx); // Update the vertex buffer to store the texture index

      return this.gfx;
   }

/********************************************************************************************************************************************************************** */
// TODO: The: ConstructListeners(), OnClick() and OnMove(), belong to a widget rather than a _Mesh. Neither Text_Mesh or Rect_Mesh have these functions. Maybe create the apropriate widget for the Textured_mesh too.
ConstructListeners(_root = null) {
   
   const mesh = this; // If in recursion, use as the current mesh the passed param. 
   const root = (_root) ? _root : this; // If in recursion, use as the current mesh the passed param. 
   // console.log('****', mesh.name, mesh.listeners.buffer)
   
   const root_evt = root.listeners.buffer;
   
   for (let etypeidx = 0; etypeidx < mesh.listeners.boundary; etypeidx++) {
      
      const evt = mesh.listeners.buffer[etypeidx];
      if (evt) { // If event is not null
         const target_params = {
            EventClbk: null,
            targetBindingFunctions: null,
            target_mesh: mesh,
            params: null,
         }
         mesh.AddListenEvent(etypeidx, mesh.OnClick, target_params, root_evt);
      }
   }
}

OnClick(params) {

   const mesh = params.target_params.target_mesh;
   const OnMoveFn = mesh.OnMove;

   const point = MouseGetPos();
   const g = mesh.geom;
   if (Check_intersection_point_rect(g.pos, g.dim, point, [0, 8])) {

       STATE.mesh.SetClicked(mesh);
       console.log('Clicked:', mesh.name)

       if (mesh.timeIntervalsIdxBuffer.boundary <= 0) {

           /**
            * Create Move event.
            * The Move event runs only when the mesh is GRABED. That means that the timeInterval 
            * is created and destroyed upon 'onClickDown' and 'onClickUp' respectively.
           */
           const idx = TimeIntervalsCreate(10, 'Move Widget_Text', TIME_INTERVAL_REPEAT_ALWAYS, OnMoveFn, mesh);
           console.log('Time interval idx:', idx)
           mesh.timeIntervalsIdxBuffer.Add(idx);

           if (mesh.StateCheck(MESH_STATE.IS_GRABABLE)) {

               STATE.mesh.SetGrabed(mesh);
               mesh.StateEnable(MESH_STATE.IN_GRAB);
           }

       }
       return true;
   }
   return false;
}

// SEE ### OnMove Events Implementation Logic
OnMove(params) {

   // The 'OnMove' function is called by the timeInterval.
   // The timeInterval has been set by the 'OnClick' event.
   const mesh = params.params;

   // Destroy the time interval and the Move operation, if the mesh is not grabed
   // MESH_STATE.IN_GRAB is deactivated upon mouse 'click up' in Events.js.
   if (mesh.StateCheck(MESH_STATE.IN_GRAB) === 0 && mesh.timeIntervalsIdxBuffer.boundary) {

       const intervalIdx = mesh.timeIntervalsIdxBuffer.buffer[0];// HACK !!!: We need a way to know what interval is what, in the 'timeIntervalsIdxBuffer' in a mesh. 
       TimeIntervalsDestroyByIdx(intervalIdx);
       mesh.timeIntervalsIdxBuffer.RemoveByIdx(0); // HACK

       return;
   }

   // Move 
   const mouse_pos = MouseGetPosDif();
   // mesh.geom.MoveXY(mouse_pos.x, -mouse_pos.y, mesh.gfx);

   // HACK: temporarely use the move to chnge the uv coordinates
   mesh.mat.uv[0] += -mouse_pos.x *.001;
   mesh.mat.uv[1] += -mouse_pos.x *.001;
   mesh.mat.uv[2] += mouse_pos.y  *.001;
   mesh.mat.uv[3] += mouse_pos.y  *.001;
   GlSetTex(mesh.gfx, mesh.mat.uv);
}

/********************************************************************************************************************************************************************** */
SetZindex(z) {
   this.geom.SetZindex(z, this.gfx, this.geom.num_faces);
   }

   UpdateUvCoordinates(val) {
      TODO: Implement
   }


   /*******************************************************************************************************************************************************/
   // Setters-Getters



   /*******************************************************************************************************************************************************/
   // Alignment

   Reposition_pre(pos_dif) {
      // TODO: If needed: implemnt. Else Delete
   }


   /*******************************************************************************************************************************************************/
   // Helpers


}



