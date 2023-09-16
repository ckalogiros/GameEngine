"use strict";

import { AddArr3, CopyArr2, CopyArr3 } from "../../../Helpers/Math/MathOperations.js";
import { Check_intersection_point_rect } from "../../Collisions.js";
import { MouseGetPos, MouseGetPosDif } from "../../Controls/Input/Mouse.js";
import { Gfx_end_session, Gfx_generate_context } from "../../Interfaces/GfxContext.js";
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

   options; // Stores some state of 'this'.
   margin; // [1,1] Stores the x-y margins
   padding; // [1,1] Stores padding for the meshes in-between space.
   max_size;

   constructor(options = (SECTION.VERTICAL), margin = [4, 4], pos = [200, 400, 0], dim = [40, 40], col = TRANSPARENCY(BLUE, .6)) {

      super(pos, dim, col)

      this.EnableGfxAttributes(MESH_ENABLE.GFX.ATTR_STYLE);

      this.options = options;
      this.margin = margin;
      this.max_size = [0, 0];

      this.type |= MESH_TYPES_DBG.SECTION_MESH;
      this.SetName(this.name);

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
         
         CopyArr2(this.geom.pos, mesh.geom.pos);
         // if(mesh.StateCheck(MESH_STATE.CHILDREN_HAVE_CLICK_EVENT)){
   
         //    this.StateEnable(MESH_STATE.CHILDREN_HAVE_CLICK_EVENT)
         // }
      }
   }

   Calc(options = SECTION.INHERIT) {

      const section = this;

      let top = section.geom.pos[1]; // Top starting position
      let left = section.geom.pos[0]; // Left starting position
      let h = section.geom.dim[1]-section.margin[1];
      
      const accum = Calculate_sizes_recursive(section, top, left, options)
      CopyArr2(section.geom.dim, section.max_size); // Set size for the root.
      
      
      if(section.geom.dim[1] > h){
         
         section.geom.pos[1] += accum.size[1];
         section.geom.pos[1] += section.margin[1]+accum.margin[1]*2 + section.margin[1]*2;
         section.geom.pos[0] += section.margin[0]+accum.margin[0]*2 + section.margin[0]*2;
         // console.log('111111', accum, section.geom.dim[1], h)
      }
      else if(section.geom.dim[1] < h){
         // console.log('222222', accum, section.geom.dim[1], h)
         
         section.geom.pos[1] -= accum.size[1];
         section.geom.pos[1] -= section.margin[1]+accum.margin[1]*2 + section.margin[1]*2;
         section.geom.pos[0] -= section.margin[0]+accum.margin[0]*2 + section.margin[0]*2;
      }
      section.SetMargin()

      // section.geom.pos[1] += section.margin[1];
      // section.geom.pos[0] += section.margin[0];
      const accum_ypos = Calculate_positions_recursive(section, options);
      


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

   UpdateGfxPosRecursive_bottomUpTraverse(mesh) {

      if (mesh.gfx !== null) {
         mesh.UpdatePosXYZ();
      }
      else {
         mesh.GenGfxCtx(FLAGS, gfxidx); // Add any none-added meshes.
      }

      for (let i = 0; i < mesh.children.count; i++) {

         const child = mesh.children.buffer[i];

         if (child && child.type & MESH_TYPES_DBG.SECTION_MESH)
            this.UpdateGfxPosRecursive_bottomUpTraverse(child);
      }

   }

   UpdateGfxPosDimRecursive(mesh) {

      for (let i = 0; i < mesh.children.count; i++) {

         const child = mesh.children.buffer[i];

         if (child.children.active_count && child.type & MESH_TYPES_DBG.SECTION_MESH)
            this.UpdateGfxPosDimRecursive(child);

         if (mesh.gfx !== null) {

            mesh.UpdatePosXYZ();
            mesh.UpdateDim();
         }
         else {
            mesh.GenGfxCtx(FLAGS, gfxidx); // Add any none-added meshes.
         }
      }
   }

   GenGfxCtx(FLAGS, gfxidx) {

      super.GenGfxCtx(FLAGS, gfxidx);
      // this.gfx = Gfx_generate_context(this.sid, this.sceneIdx, this.mat.num_faces, FLAGS, gfxidx);
      // Gfx_end_session(true)
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
      /** DO NOT DELETE: Save OnClick */
      // OnClick(params) {
   
      //    const section = params.source_params;
      //    const point = MouseGetPos();
      //    const m = section.geom;
   
      //    if (Check_intersection_point_rect(m.pos, m.dim, point, [0, 8])) {
   
      //       /**
      //        * Efficiency.
      //        * If current mesh has children with click event, check them first.
      //        */
   
      //       let children_event = false;
   
      //       if (section.StateCheck(MESH_STATE.CHILDREN_HAVE_CLICK_EVENT)) {
   
      //          for (let i = 0; i < section.children.count; i++) {
   
      //             const child = section.children.buffer[i];
      //             if (child.listeners[LISTEN_EVENT_TYPES_INDEX.CLICK] !== INT_NULL) {
   
      //                   console.log('FOUND!!!')
      //                   const dispatch_params = {
      //                      source_params: child.listeners[LISTEN_EVENT_TYPES_INDEX.CLICK].buffer[i].source_params,
      //                      target_params: child.listeners[LISTEN_EVENT_TYPES_INDEX.CLICK].buffer[i].target_params,
      //                      trigger_params: trigger_params,
      //                      event_type: LISTEN_EVENT_TYPES_INDEX.CLICK,
      //                   }
                        
      //                   // // const success = this.event_type[TYPE_IDX].buffer[i].Clbk(dispatch_params);
      //                   children_event = section.event_type[LISTEN_EVENT_TYPES_INDEX.CLICK].buffer[i].Clbk(dispatch_params);
      //             }
      //          }
      //       }
      //       if (!children_event) {
   
      //          STATE.mesh.SetClicked(section);
   
      //          if (section.timeIntervalsIdxBuffer.count <= 0) {
   
      //             /**
      //              * Create move event.
      //              * The move event runs only when the mesh is GRABED.
      //              * That means that the timeInterval is created and destroyed upon 
      //              * onClickDown and onClickUp respectively.
      //              */
                  
      //             if (section.StateCheck(MESH_STATE.IS_GRABABLE)) {
                     
      //                const idx = TimeIntervalsCreate(5, 'Move Section Mesh', TIME_INTERVAL_REPEAT_ALWAYS, Section_move_section, section);
      //                section.timeIntervalsIdxBuffer.Add(idx);
      //                STATE.mesh.SetGrabed(section);
      //                section.StateEnable(MESH_STATE.IN_GRAB);
      //             }
   
      //             /** Code left for implementing popup for Sections */
      //             // Handle any menu (on leftClick only)
      //             // if (section.StateCheck(MESH_STATE.HAS_POPUP)) {
   
      //             //    const btnId = params.trigger_params;
      //             //    Widget_popup_handler_onclick_event(section, btnId)
      //             // }
   
      //             return true;
      //          }
      //       }
      //    }
      //    return false;
      // }
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

   // console.log('MOVING SECTION', section.name, mouse_pos)
   console.log('MOVING SECTION', section.name)
   section.MoveRecursive(mouse_pos.x, -mouse_pos.y);

   // const mouse_pos = MouseGetPos();
   // // mouse_pos[0] -= section.geom.pos[0];
   // // mouse_pos[1] -= section.geom.pos[1];
   // section.SetPosXYRecursiveMove(mouse_pos);
   // // section.SetPos(mouse_pos);

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

function Calculate_positions_recursive(parent, options = SECTION.INHERIT, _accum_ypos = [parent.geom.pos[1], 0]) {

   const padding = [0, 0]
   const cur_pos = [parent.geom.pos[0], parent.geom.pos[1]];
   const accum_ypos = _accum_ypos;

   for (let i = 0; i < parent.children.count; i++) {

      const mesh = parent.children.buffer[i];
      let continue_recur = true;
      let opt = options
      if(options & SECTION.INHERIT) opt = parent.options

      // CopyArr2(mesh.geom.pos, parent.geom.pos)

      if (parent.type & MESH_TYPES_DBG.SECTION_MESH) { // For meshes with a parent of type Section


         const new_pos = [cur_pos[0] - parent.geom.dim[0] + mesh.geom.dim[0] + parent.margin[0],
                           cur_pos[1] - parent.geom.dim[1] + mesh.geom.dim[1] + parent.margin[1],
                           // cur_pos[1] + parent.geom.dim[1] + mesh.geom.dim[1] + parent.margin[1],
                           parent.geom.pos[2]+1,];

         if ((mesh.type & MESH_TYPES_DBG.SECTION_MESH) === 0) {
            
            const pos_dif = [new_pos[0] - mesh.geom.pos[0], new_pos[1] - mesh.geom.pos[1], new_pos[2] + 1];
            UpdaterAdd(mesh, 0, null, pos_dif)
            
            if(mesh.type & MESH_TYPES_DBG.WIDGET_MENU_BAR){

               mesh.geom.dim[0] = mesh.parent.geom.dim[0] + parent.margin[0];
               mesh.geom.pos[0] += mesh.pad[0];
               mesh.geom.pos[1] -= parent.margin[1];
               mesh.ReAlign();
            }

            continue_recur = false; // Stop recursion for meshe's children, let the mesh deal with it's children.
         }
         else {

            CopyArr3(mesh.geom.pos, new_pos);
         }
      }

      else if (mesh.type & MESH_TYPES_DBG.TEXT_MESH) { // For text meshes

         const num_chars = mesh.mat.num_faces
         mesh.geom.pos[0] = cur_pos[0] - (mesh.geom.dim[0] * num_chars) + mesh.geom.dim[0];
         mesh.geom.pos[1] = cur_pos[1];
         mesh.geom.pos[2] = parent.geom.pos[2] + 1;
      }

      if (continue_recur)
         Calculate_positions_recursive(mesh, options, accum_ypos)

      // if (parent.options & SECTION.VERTICAL) {
      if (opt & SECTION.VERTICAL) {
         cur_pos[1] += mesh.geom.dim[1] * 2;
         accum_ypos[0] += mesh.geom.pos[1];
         accum_ypos[1]++;
      }
      // else if (parent.options & SECTION.HORIZONTAL) {
      else if (opt & SECTION.HORIZONTAL) {
         cur_pos[0] += mesh.geom.dim[0] * 2
      }
   }

   return accum_ypos;
}

function Calculate_sizes_recursive(section, top, left, options, accumulative_margin = [0, 0]) {

   const padding = [0, 0]
   const margin = accumulative_margin;
   const accum_size = [0, 0]

   for (let i = 0; i < section.children.count; i++) {

      let opt = options
      if(options & SECTION.INHERIT) 
         opt = section.options

      const mesh = section.children.buffer[i];
      if (mesh.children.active_count && mesh.type & MESH_TYPES_DBG.SECTION_MESH) {

         margin[1] += mesh.margin[1];
         margin[0] += mesh.margin[0];
         Calculate_sizes_recursive(mesh, top, left, SECTION.INHERIT, margin);

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
      else if (mesh.type & MESH_TYPES_DBG.TEXT_MESH) { // Case the current item does not have children.

         if (opt & SECTION.VERTICAL) {
            accum_size[1] += mesh.geom.dim[1]
            accum_size[0] = mesh.geom.dim[0] * mesh.mat.num_faces
            section.max_size[1] += mesh.geom.dim[1];
            if (section.max_size[0] < accum_size[0]) section.max_size[0] = mesh.geom.dim[0] * mesh.mat.num_faces
         }
         else if (opt & SECTION.HORIZONTAL) {
            accum_size[0] += mesh.geom.dim[0] * mesh.mat.num_faces
            accum_size[1] = mesh.geom.dim[1]
            section.max_size[0] += mesh.geom.dim[0] * mesh.mat.num_faces
            if (section.max_size[1] < accum_size[1]) section.max_size[1] = mesh.geom.dim[1]
         }
      }
      else { // Case the current item does not have children.

         if (opt & SECTION.VERTICAL) {
            accum_size[1] += mesh.geom.dim[1]
            accum_size[0] = mesh.geom.dim[0]
            section.max_size[1] += mesh.geom.dim[1];
            if (section.max_size[0] < accum_size[0]) section.max_size[0] = mesh.geom.dim[0]
         }
         else if (opt & SECTION.HORIZONTAL) {
            accum_size[0] += mesh.geom.dim[0]
            accum_size[1] = mesh.geom.dim[1]
            section.max_size[0] += mesh.geom.dim[0]
            if (section.max_size[1] < accum_size[1]) section.max_size[1] = mesh.geom.dim[1]
         }
      }
   }

   // return [accum_size, margin];
   return {size:accum_size, margin:margin};
}

