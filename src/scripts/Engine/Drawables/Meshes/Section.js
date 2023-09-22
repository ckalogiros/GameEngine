"use strict";

import { AddArr2, CopyArr2, CopyArr3 } from "../../../Helpers/Math/MathOperations.js";
import { Check_intersection_point_rect } from "../../Collisions.js";
import { MouseGetPos, MouseGetPosDif } from "../../Controls/Input/Mouse.js";
import { UpdaterAdd } from "../../Scenes.js";
import { TimeIntervalsCreate, TimeIntervalsDestroyByIdx } from "../../Timers/TimeIntervals.js";
import { MESH_ENABLE } from "./Base/Mesh.js";
import { Rect } from "./Rect.js";




/**
 * TODO: 
 *    Implement: 
 *       Add_pre. add a mesh at the start of the children's buffer.
 *       Add_specific. add a mesh at a specific index of the children's buffer.
 */
export class Section extends Rect {

   options;  // Stores some state of 'this'.
   margin;   // [1,1] Stores the x-y margins
   padding;  // [1,1] Stores padding for the meshes in-between space.
   max_size; // [1,1] Stores the max x-y size of all children meshes (not accumulative).

   constructor(options = (SECTION.VERTICAL), margin = [4, 4], pos = [200, 400, 0], dim = [40, 40], col = TRANSPARENCY(BLUE, .6), name='') {

      super(pos, dim, col)

      this.EnableGfxAttributes(MESH_ENABLE.GFX.ATTR_STYLE);

      this.options = options;
      this.margin = margin;
      this.max_size = [0, 0];

      this.type |= MESH_TYPES_DBG.SECTION_MESH;

      if(name !== '') this.SetName(name)
      else this.SetName(this.name);

      this.SetStyle([0, 3.5, 2.]);
   }

   AddItem(mesh, options) {

      this.options |= options;
      this.AddChild(mesh);

      if (mesh.type & MESH_TYPES_DBG.SECTION_MESH) { // Handle other sections

         if (options & SECTION.FIT) {

            TODO: implement
         }
         else if (options & SECTION.ITEM_FIT) {

            CopyArr3(mesh.geom.pos, this.geom.pos);
         }
      }
      else { // Handle Items 
         
         // CopyArr3(mesh.geom.pos, this.geom.pos);
         // CopyArr2(this.geom.pos, mesh.geom.pos);
      }
   }

   Calc(options = SECTION.INHERIT) {

      const section = this;

      let top = section.geom.pos[1]; // Top starting position
      let left = section.geom.pos[0]; // Left starting position

      const total_size = [0, 0],  total_margin = [0, 0]
      const old_sizey = section.geom.dim[1];
      const old_sizex = section.geom.dim[0];
      const s = Calculate_sizes_recursive(section, top, left, options, total_margin, total_size)
      CopyArr2(section.geom.dim, section.max_size); // Set size for the root.
      
      if(options & SECTION.TOP_DOWN){
         const y = section.geom.pos[1]+(section.max_size[1]-old_sizey);
         const x = section.geom.pos[0]+(section.max_size[0]-old_sizex);
         section.SetPosXY([x, y]);
      }

      section.SetMargin()
      const accum_pos = Calculate_positions_recursive(section, options);

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

   // UpdateGfxPosRecursive_bottomUpTraverse(mesh) {

   //    if (mesh.gfx !== null) {
   //       mesh.UpdatePosXYZ();
   //    }
   //    else {
   //       mesh.GenGfxCtx(FLAGS, gfxidx); // Add any none-added meshes.
   //    }

   //    for (let i = 0; i < mesh.children.count; i++) {

   //       const child = mesh.children.buffer[i];

   //       if (child && child.type & MESH_TYPES_DBG.SECTION_MESH)
   //          this.UpdateGfxPosRecursive_bottomUpTraverse(child);
   //    }

   // }

   UpdateGfxPosDimRecursive(mesh) {
      
      for (let i = 0; i < mesh.children.count; i++) {

         const child = mesh.children.buffer[i];

         if (child.children.active_count && child.type & MESH_TYPES_DBG.SECTION_MESH)
            this.UpdateGfxPosDimRecursive(child);
         if (mesh.gfx !== null) {

            mesh.UpdatePosXYZ();
            mesh.UpdateDim();
         }
      }
   }

   GenGfxCtx(FLAGS, gfxidx) {

      return super.GenGfxCtx(FLAGS, gfxidx);
   }

   AddToGfx() {

      super.AddToGfx();
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

            if (section.StateCheck(MESH_STATE.IS_GRABABLE)) {

               const idx = TimeIntervalsCreate(5, 'Move Section Mesh', TIME_INTERVAL_REPEAT_ALWAYS, Section_move_section, section);
               section.timeIntervalsIdxBuffer.Add(idx);
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

function Section_move_section(_params) {
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
   const mouse_pos = MouseGetPosDif();
   if (mouse_pos.x === 0 && mouse_pos.y === 0) return;

   section.MoveRecursive(mouse_pos.x, -mouse_pos.y);
   CopyArr3(section.geom.defPos, section.geom.pos);
}

function Expand2(section, options) {

   for (let i = 0; i < section.children.count; i++) {

      const mesh = section.children.buffer[i];

      if (section.type & MESH_TYPES_DBG.SECTION_MESH) {

         if (mesh.options & SECTION.EXPAND) {

            // if(mesh.max_size[0] < section.max_size[0])
            //    mesh.geom.dim[0] = mesh.max_size[0] 
            // mesh.geom.pos[0] += mesh.geom.dim[0]/4
         }
      }

      Expand2(mesh, options)

      if (section.options & SECTION.VERTICAL) {
      }
      else if (section.options & SECTION.HORIZONTAL) {
      }
   }
}


function Calculate_positions_recursive(parent, options = SECTION.INHERIT, _accum_pos = [parent.geom.pos[1], 0] ) {

   const padding = [0, 0]
   const cur_pos = [parent.geom.pos[0], parent.geom.pos[1]];
   const accum_pos = _accum_pos;


   for (let i = 0; i < parent.children.count; i++) {

      const mesh = parent.children.buffer[i];
      let continue_recur = true;
      let opt = options

      if (options & SECTION.INHERIT) opt = parent.options

      if (parent.type & MESH_TYPES_DBG.SECTION_MESH) { // For meshes with a parent of type Section

         const c_x = cur_pos[0];          const c_y = cur_pos[1];
         const p_dx = parent.geom.dim[0]; const p_dy = parent.geom.dim[1];
         const p_mx = parent.margin[0];   const p_my = parent.margin[1];

         const new_pos = [ c_x - p_dx + mesh.geom.dim[0] + p_mx,
                           c_y - p_dy + mesh.geom.dim[1] + p_my,
                           parent.geom.pos[2] + 1, ];

         if ((mesh.type & MESH_TYPES_DBG.SECTION_MESH) === 0) { // Case mesh not of type section, have it update it's new pos-dim on a later when it's gfx exists.
            
            const pos_dif = [new_pos[0] - mesh.geom.pos[0], new_pos[1] - mesh.geom.pos[1], new_pos[2] + 1];
            UpdaterAdd(mesh, 0, null, pos_dif);
            
            continue_recur = false; // Stop recursion for meshe's children. Let the mesh deal with it's children.
         }
         else { // Case  mesh is of type section  

            // CopyArr3(mesh.geom.pos, new_pos);
            CopyArr2(mesh.geom.pos, new_pos);
         }
      }


      if (continue_recur)
         Calculate_positions_recursive(mesh, options, accum_pos)

      if (opt & SECTION.VERTICAL) {
         cur_pos[1] += mesh.geom.dim[1] * 2;
         accum_pos[0] += mesh.geom.pos[0];
         accum_pos[1]++;
      }
      else if (opt & SECTION.HORIZONTAL) {
         cur_pos[0] += mesh.geom.dim[0] * 2;
         // parent.geom.dim[0] += mesh.geom.dim[0] * mesh.mat.num_faces
      }
   }

   return accum_pos;
}

function Calculate_sizes_recursive(section, top, left, options, total_margin = [0, 0], total_size = [0, 0]) {

   const padding = [0, 0]
   const margin = total_margin;
   const accum_size = [0, 0];

   for (let i = 0; i < section.children.count; i++) {

      let opt = options
      if (options & SECTION.INHERIT)
         opt = section.options

      const mesh = section.children.buffer[i];
      if (mesh.children.active_count && mesh.type & MESH_TYPES_DBG.SECTION_MESH) {

         margin[1] += mesh.margin[1]*2;
         margin[0] += mesh.margin[0];
         const temp = Calculate_sizes_recursive(mesh, top, left, SECTION.INHERIT, margin, total_size);
         total_size[0] += temp[0];
         total_size[1] += temp[1];

         mesh.geom.dim[0] = mesh.max_size[0]
         mesh.geom.dim[1] = mesh.max_size[1]

         mesh.SetMargin();

         if (opt & SECTION.VERTICAL) {
            if (section.max_size[0] < mesh.geom.dim[0]) section.max_size[0] = mesh.geom.dim[0]
            section.max_size[1] += mesh.geom.dim[1]
         }
         else if (opt & SECTION.HORIZONTAL) {
            section.max_size[0] += mesh.geom.dim[0]
            if (section.max_size[1] < mesh.geom.dim[1]) section.max_size[1] = mesh.geom.dim[1]
         }
      }
      else if (mesh.type & (MESH_TYPES_DBG.TEXT_MESH | MESH_TYPES_DBG.WIDGET_TEXT_DYNAMIC)) { // Case the current item is of type text.

         if (opt & SECTION.VERTICAL) {
            accum_size[1] += mesh.geom.dim[1];
            accum_size[0] = mesh.geom.dim[0] * mesh.mat.num_faces;
            section.max_size[1] += mesh.geom.dim[1];
            if (section.max_size[0] < accum_size[0]) 
               section.max_size[0] = mesh.geom.dim[0] * mesh.mat.num_faces;  // Keep the max width of all meshes in Vertical mode.
         }
         else if (opt & SECTION.HORIZONTAL) {
            accum_size[0] += mesh.geom.dim[0] * mesh.mat.num_faces;
            accum_size[1] = mesh.geom.dim[1];
            section.max_size[0] += mesh.geom.dim[0] * mesh.mat.num_faces;
            if (section.max_size[1] < accum_size[1]) 
               section.max_size[1] = mesh.geom.dim[1];  // Keep the max height of all meshes in Horizontal mode.
         }
      }
      else { // Case the current item does not have children.

         if (opt & SECTION.VERTICAL) {
            accum_size[1] += mesh.geom.dim[1]
            accum_size[0] = mesh.geom.dim[0]
            section.max_size[1] += mesh.geom.dim[1];
            if (section.max_size[0] < accum_size[0]) section.max_size[0] = mesh.geom.dim[0]; // Keep the max width of all meshes
         }
         else if (opt & SECTION.HORIZONTAL) {
            accum_size[0] += mesh.geom.dim[0] 
            accum_size[1] = mesh.geom.dim[1]
            section.max_size[0] += mesh.geom.dim[0]
            if (section.max_size[1] < accum_size[1]) section.max_size[1] = mesh.geom.dim[1];  // Keep the max height of all meshes
         }
      }
   }

   AddArr2(total_size, accum_size);
   return total_size;
}

