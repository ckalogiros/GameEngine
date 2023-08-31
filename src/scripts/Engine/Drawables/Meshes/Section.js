"use strict";

import { CopyArr2, CopyArr3 } from "../../../Helpers/Math/MathOperations.js";
import { Check_intersection_point_rect } from "../../Collisions.js";
import { MouseGetPos, MouseGetPosDif } from "../../Controls/Input/Mouse.js";
import { TimeIntervalsCreate, TimeIntervalsDestroyByIdx } from "../../Timers/TimeIntervals.js";
import { Geometry2D } from "../Geometry/Base/Geometry.js";
import { Material } from "../Material/Base/Material.js";
import { MESH_ENABLE, Mesh } from "./Base/Mesh.js";




/**
 * TODO: 
 *    Implement: 
 *       Add_pre. add a mesh at the start of the children's buffer.
 *       Add_specific. add a mesh at a specific index of the children's buffer.
 */
export class Section extends Mesh {

   options; // Stores some state of 'this'.
   margin; // [1,1] Stores the x-y margins
   padding; // [1,1] Stores padding for the meshes in-between space.
   max_size;

   constructor(options = (SECTION.VERTICAL), margin = [4, 4], pos = [200, 400, 0], dim = [40, 40], col = TRANSPARENCY(BLUE, .6)) {

      const geom = new Geometry2D(pos, dim);
      const mat = new Material(col);

      super(geom, mat);
      this.EnableGfxAttributes(MESH_ENABLE.GFX.ATTR_STYLE);

      this.options = options;
      this.margin = margin;
      this.max_size = [0, 0];

      this.type |= MESH_TYPES_DBG.SECTION_MESH;
      this.SetName();

      this.SetStyle([0, 3.5, 2.]);
   }

   AddItem(mesh, options) {

      this.options |= options;
      const idx = this.children.Add(mesh);

      if (mesh.type & MESH_TYPES_DBG.SECTION_MESH) { // Handle other sections

         if (options & SECTION.FIT) {

            TODO: implement
         }
         else if (options & SECTION.ITEM_FIT) {

            CopyArr3(mesh.geom.pos, this.geom.pos);
            // mesh.geom.pos[2] += 1;
         }
      }
      else { // Handle Items 

         // CopyArr3(mesh.geom.pos, this.geom.pos);
         CopyArr2(this.geom.pos, mesh.geom.pos);
         // mesh.geom.pos[2] += 1;
      }
   }

   AddItemRecursive(_mesh, options) {

      let new_section = null;
      for (let i = 0; i < _mesh.children.count; i++) {

         const mesh = _mesh.children.buffer[i];

         if (mesh.children.active_count && mesh.type) {

            this.AddItemRecursive(mesh, sceneIdx);
         }
         if (options & SECTION.OPTIONS.WITH_NEW_SECTION) {
            new_section = new Section(SECTION.HORIZONTAL, [2, 2], [100, 100, 0], [20, 20], TRANSPARENCY(GREY2, .7))
            new_section.AddItem(mesh);
         }
         else {

            this.AddItem(mesh);
         }
         if (new_section) this.AddItem(new_section);
      }

   }

   Calc(options) {

      const section = this;

      let top = section.geom.pos[1]; // Top starting position
      let left = section.geom.pos[0]; // Left starting position

      Calculate_sizes_recursive(section, top, left, options)
      CopyArr2(section.geom.dim, section.max_size); // Set size for the root.

      Calculate_positions_recursive(section, options);

      section.SetMargin()
      section.geom.pos[1] += section.margin[1];
      section.geom.pos[0] += section.margin[1];

   }

   Recalc(options) {

      const section = this;

      this.Reset(section)
      this.Calc(options)

   }

   Reset(section) {

      for (let i = 0; i < section.children.count; i++) {

         const mesh = section.children.buffer[i];
         if (mesh.children.active_count && mesh.type & MESH_TYPES_DBG.SECTION_MESH) {
            this.Reset(mesh);
         }

      }
      section.max_size[0] = 0;
      section.max_size[1] = 0;

   }

   UpdateGfx(section) {

      this.UpdateGfxRecursive(section); // Looks like this approach is faster!!!?
      // this.UpdateGfxRecursive_bottomUpTraverse(section);

      if (!section.gfx) section.GenGfx(); // Add any un-added meshes.
      section.UpdatePosXY(); // Update for the root
      section.UpdateDim(); // Update for the root
   }

   UpdateGfxRecursive_bottomUpTraverse(mesh) {

      console.log(mesh.geom.pos[1])
      if (mesh.gfx !== null) {

         if (mesh.type & MESH_TYPES_DBG.TEXT_MESH)
            mesh.UpdatePosXYZ();
         else
            mesh.UpdatePosXYZ();
      }
      else {
         // console.log(mesh.name)
         mesh.GenGfx(); // Add any none-added meshes.
      }

      for (let i = 0; i < mesh.children.count; i++) {

         const child = mesh.children.buffer[i];

         if (child && child.type & MESH_TYPES_DBG.SECTION_MESH)
            this.UpdateGfxRecursive_bottomUpTraverse(child);
      }

   }

   UpdateGfxRecursive(mesh) {

      for (let i = 0; i < mesh.children.count; i++) {

         const child = mesh.children.buffer[i];

         if (child.children.active_count && child.type & MESH_TYPES_DBG.SECTION_MESH)
            this.UpdateGfxRecursive(child);

         // console.log(child.geom.pos[1])

         if (child.gfx !== null) {

            if (child.type & MESH_TYPES_DBG.TEXT_MESH)
               child.UpdatePosXYZ();
            else
               child.UpdatePosXYZ();
         }
         else {
            // console.log(mesh.name)
            child.GenGfx(); // Add any none-added meshes.
         }
      }

   }


   GenGfx(useSpecificVertexBuffer = GL_VB.ANY) {

      const gfx = super.GenGfx(useSpecificVertexBuffer);
      super.AddToGfx();
      // for (let i = this.children.count - 1; i >= 0; i--) {

      //    const child = this.children.buffer[i];
      //    if (child)
      //       var ggg = child.GenGfx(sceneIdx, useSpecificVertexBuffer, vertexBufferIdx);
      // }

      return gfx;
   }

   SetMargin() {
      this.geom.dim[0] += this.margin[0];
      this.geom.dim[1] += this.margin[1];
   }

   OnClick(params) {

      const section = params.source_params;
      const point = MouseGetPos();
      const m = section.geom;

      if (Check_intersection_point_rect(m.pos, m.dim, point, [0, 8])) {

         STATE.mesh.SetClicked(section);

         if (section.timeIntervalsIdxBuffer.count <= 0) {

            /**
             * Create move event.
             * The move event runs only when the mesh is GRABED.
             * That means that the timeInterval is created and destroyed upon 
             * onClickDown and onClickUp respectively.
             */
            const idx = TimeIntervalsCreate(5, 'Move Section Mesh', TIME_INTERVAL_REPEAT_ALWAYS, Section_move_event, section);
            section.timeIntervalsIdxBuffer.Add(idx);

            if (section.StateCheck(MESH_STATE.IS_GRABABLE)) {

               STATE.mesh.SetGrabed(section);
               section.StateEnable(MESH_STATE.IN_GRAB);
            }

            /** Code left for implementing popup for Sections */
            // Handle any menu (on leftClick only)
            // if (section.StateCheck(MESH_STATE.HAS_POPUP)) {

            //    const btnId = params.trigger_params;
            //    Widget_popup_handler_onclick_event(section, btnId)
            // }

            return true;
         }
      }
      return false;
   }

}

function Section_move_event(_params) {
   /**
    * The function is called by the timeInterval.
    * The timeInterval has been set by the 'OnClick' event.
    */

   const section = _params.params;

   // Destroy the time interval calling this function if the mesh is not grabed.
   if (section.StateCheck(MESH_STATE.IN_GRAB) === 0) {

      const intervalIdx = section.timeIntervalsIdxBuffer.buffer[0];// HACK !!!: We need a way to know what interval is what, in the 'timeIntervalsIdxBuffer' in a mesh. 
      TimeIntervalsDestroyByIdx(intervalIdx);
      section.timeIntervalsIdxBuffer.RemoveByIdx(0); // HACK

      return;
   }

   // Move the mesh
   console.log('MOVING SECTION', section.name)
   const mouse_pos = MouseGetPosDif();
   section.MoveRecursive(mouse_pos.x, -mouse_pos.y);

   // const mouse_pos = MouseGetPos();
   // // mouse_pos[0] -= section.geom.pos[0];
   // // mouse_pos[1] -= section.geom.pos[1];
   // section.SetPosXYRecursiveMove(mouse_pos);
   // // section.SetPos(mouse_pos);

}

function Expand(section, options) {

   for (let i = 0; i < section.children.count; i++) {

      const mesh = section.children.buffer[i];

      if (section.type & MESH_TYPES_DBG.SECTION_MESH) {

         if (mesh.options & SECTION.EXPAND) {

            // if(mesh.max_size[0] < section.max_size[0])
            //    mesh.geom.dim[0] = mesh.max_size[0] 
            // mesh.geom.pos[0] += mesh.geom.dim[0]/4
         }
      }

      Expand(mesh, options)

      if (section.options & SECTION.VERTICAL) {
      }
      else if (section.options & SECTION.HORIZONTAL) {
      }
   }
}

function Calculate_positions_recursive(parent, options) {

   const padding = [0, 0]
   const cur_pos = [parent.geom.pos[0], parent.geom.pos[1]]

   for (let i = 0; i < parent.children.count; i++) {

      const mesh = parent.children.buffer[i];

      if (parent.type & MESH_TYPES_DBG.SECTION_MESH) {

         mesh.geom.pos[0] = cur_pos[0] - parent.geom.dim[0] + mesh.geom.dim[0] + parent.margin[0];
         mesh.geom.pos[1] = cur_pos[1] - parent.geom.dim[1] + mesh.geom.dim[1] + parent.margin[1];
         mesh.geom.pos[2] = parent.geom.pos[2]+1;
         // console.log(mesh.name, mesh.geom.pos[2])
      }
      else {

         if (mesh.type & MESH_TYPES_DBG.TEXT_MESH) {

            const num_chars = mesh.mat.num_faces
            mesh.geom.pos[0] = cur_pos[0] - mesh.geom.dim[0] * num_chars + parent.pad[0] / 2;// Fixes the button mis-alignment
            mesh.geom.pos[1] = cur_pos[1];
            mesh.geom.pos[2] = parent.geom.pos[2]+1;
            // console.log(mesh.name, mesh.geom.pos[2])
         }
         else {
            
            mesh.geom.pos[0] = cur_pos[0] - mesh.geom.dim[0] * 3;// Fixes the button mis-alignment
            mesh.geom.pos[1] = cur_pos[1];// Fixes the button mis-alignment
            mesh.geom.pos[2] = parent.geom.pos[2]+1;
            // console.log(mesh.name, mesh.geom.pos[2])
         }
      }

      Calculate_positions_recursive(mesh, options)

      if (parent.options & SECTION.VERTICAL) {
         cur_pos[1] += mesh.geom.dim[1] * 2
      }
      else if (parent.options & SECTION.HORIZONTAL) {
         cur_pos[0] += mesh.geom.dim[0] * 2
      }
   }

   return cur_pos;
}

function Calculate_sizes_recursive(section, top, left, options, accumulative_margin = [0, 0]) {

   const padding = [0, 0]
   const margin = accumulative_margin;
   let accum_size = [0, 0]

   for (let i = 0; i < section.children.count; i++) {

      const mesh = section.children.buffer[i];
      if (mesh.children.active_count && mesh.type & MESH_TYPES_DBG.SECTION_MESH) {

         margin[1] += mesh.margin[1];
         margin[0] += mesh.margin[0];
         Calculate_sizes_recursive(mesh, top, left, options, margin);

         mesh.geom.dim[0] = mesh.max_size[0]
         mesh.geom.dim[1] = mesh.max_size[1]

         mesh.SetMargin();

         if (section.options & SECTION.VERTICAL) {
            if (section.max_size[0] < mesh.geom.dim[0]) section.max_size[0] = mesh.geom.dim[0]
            section.max_size[1] += mesh.geom.dim[1]
         }
         else if (section.options & SECTION.HORIZONTAL) {
            section.max_size[0] += mesh.geom.dim[0]
            if (section.max_size[1] < mesh.geom.dim[1]) section.max_size[1] = mesh.geom.dim[1]
         }

      }
      else if (mesh.type & MESH_TYPES_DBG.TEXT_MESH) { // Case the current item does not have children.

         if (section.options & SECTION.VERTICAL) {
            accum_size[1] += mesh.geom.dim[1]
            accum_size[0] = mesh.geom.dim[0]
            if (section.max_size[0] < accum_size[0]) section.max_size[0] = mesh.geom.dim[0]
            section.max_size[1] += mesh.geom.dim[1]
         }
         else if (section.options & SECTION.HORIZONTAL) {
            accum_size[0] += mesh.geom.dim[0] * mesh.mat.num_faces
            accum_size[1] = mesh.geom.dim[1]
            section.max_size[0] += mesh.geom.dim[0] * mesh.mat.num_faces
            if (section.max_size[1] < accum_size[1]) section.max_size[1] = mesh.geom.dim[1]
         }
      }
      else { // Case the current item does not have children.

         if (section.options & SECTION.VERTICAL) {
            accum_size[1] += mesh.geom.dim[1]
            accum_size[0] = mesh.geom.dim[0]
            if (section.max_size[0] < accum_size[0]) section.max_size[0] = mesh.geom.dim[0]
            section.max_size[1] += mesh.geom.dim[1]
         }
         else if (section.options & SECTION.HORIZONTAL) {
            accum_size[0] += mesh.geom.dim[0]
            accum_size[1] = mesh.geom.dim[1]
            section.max_size[0] += mesh.geom.dim[0]
            if (section.max_size[1] < accum_size[1]) section.max_size[1] = mesh.geom.dim[1]
         }
      }

   }
}

