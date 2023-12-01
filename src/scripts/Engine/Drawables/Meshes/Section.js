"use strict";

import { AddArr2, AddArr3, CopyArr2, CopyArr3 } from "../../../Helpers/Math/MathOperations.js";
import { Check_intersection_point_rect } from "../Operations/Collisions.js";
import { MouseGetPos, MouseGetPosDif } from "../../Controls/Input/Mouse.js";
import { UpdaterAdd } from "../../Scenes.js";
import { TimeIntervalsCreate, TimeIntervalsDestroyByIdx } from "../../Timers/TimeIntervals.js";
import { MESH_ENABLE } from "./Base/Mesh.js";
import { Rect } from "./Rect_Mesh.js";




/**
 * // TODO: 
 *    Implement: 
 *       Add_pre. add a mesh at the start of the children's buffer.
 *       Add_specific. add a mesh at a specific index of the children's buffer.
 */
export class Section extends Rect {

   options;  // Stores some state of 'this'.
   margin;   // [1,1] Stores the x-y margins
   padding;  // [1,1] Stores padding for the meshes in-between space.
   max_size; // [1,1] Stores the max x-y size of all children meshes (not accumulative).

   constructor(options = (SECTION.VERTICAL), margin = [4, 4], pos = [200, 400, 0], dim = [40, 40], col = TRANSPARENCY(BLUE, .6), name = '') {

      super(pos, dim, col)

      this.EnableGfxAttributes(MESH_ENABLE.GFX.ATTR_STYLE);

      this.options = options;
      this.margin = margin;
      this.max_size = [0, 0];

      this.type |= MESH_TYPES_DBG.SECTION_MESH;

      if (name !== '') this.SetName(name)
      else this.SetName(this.name);

      this.SetStyle([0, 3.5, 2.]);
   }

   Destroy() {

      // Any children destruction
      for (let i = 0; i < this.children.boundary; i++) {

         const child = this.children.buffer[i];
         if (child) child.Destroy(child);
      }

      // section's destruction
      super.Destroy();
   }

   AddItem(mesh, options) {

      this.options |= options;
      const idx = this.AddChild(mesh);

      if (mesh.type & MESH_TYPES_DBG.SECTION_MESH) { // Handle other sections

         if (options & SECTION.FIT) {

            // TODO: implement
         }
         else if (options & SECTION.ITEM_FIT) {

            CopyArr3(mesh.geom.pos, this.geom.pos);
         }
      }
      else { // Handle Items 

         // CopyArr3(mesh.geom.pos, this.geom.pos);
         // CopyArr2(this.geom.pos, mesh.geom.pos);
      }

      return idx;
   }

   Calc(options = SECTION.INHERIT) {

      const section = this;

      let top = section.geom.pos[1]; // Top starting position
      let left = section.geom.pos[0]; // Left starting position

      const total_size = [0, 0], total_margin = [0, 0]
      const old_sizey = section.geom.dim[1];
      const old_sizex = section.geom.dim[0];
      Calculate_sizes_recursive(section, top, left, options, total_margin, total_size)
      CopyArr2(section.geom.dim, section.max_size); // Set size for the root.

      if (options & SECTION.TOP_DOWN) {
         const y = section.geom.pos[1] + (section.max_size[1] - old_sizey);
         const x = section.geom.pos[0] + (section.max_size[0] - old_sizex);
         section.SetPosXY([x, y]);
      }

      section.SetMargin()
      Calculate_positions_recursive(section, options);

      return section.max_size;

   }

   Recalc(options) {

      const section = this;

      this.Reset(section);
      return this.Calc(options);

   }

   Reset(section) {

      for (let i = 0; i < section.children.boundary; i++) {

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

   //    for (let i = 0; i < mesh.children.boundary; i++) {

   //       const child = mesh.children.buffer[i];

   //       if (child && child.type & MESH_TYPES_DBG.SECTION_MESH)
   //          this.UpdateGfxPosRecursive_bottomUpTraverse(child);
   //    }

   // }

   UpdateGfxPosDimRecursive(mesh) {

      for (let i = 0; i < mesh.children.boundary; i++) {

         const child = mesh.children.buffer[i];

         if (child.children.active_count && child.type & MESH_TYPES_DBG.SECTION_MESH)
            this.UpdateGfxPosDimRecursive(child);
         if (mesh.gfx !== null) {

            mesh.UpdatePosXYZ();
            mesh.UpdateDim();
         }
      }
   }

   /*******************************************************************************************************************************************************/
   // Graphics
   GenGfxCtx(FLAGS, gfxidx) {

      const gfx = super.GenGfxCtx(FLAGS, gfxidx);

      for (let i = 0; i < this.children.boundary; i++) {

         const child = this.children.buffer[i];
         if (child) child.GenGfxCtx(FLAGS, gfxidx);
      }

      return gfx;
   }

   Render() {

      super.AddToGfx();
      for (let i = 0; i < this.children.boundary; i++) {

         const child = this.children.buffer[i];
         if (child) child.Render();
      }
   }

   RenderToDebugGfx() {

		this.sid.progs_group = PROGRAMS_GROUPS.DEBUG.MASK;
		for (let i = 0; i < this.children.boundary; i++) {
			const child = this.children.buffer[i];
			// child.sid.progs_group = PROGRAMS_GROUPS.DEBUG.MASK;
			child.RenderToDebugGfx();
		}
	}

   DeactivateGfx() {

      super.DeactivateGfx();

      for (let i = 0; i < this.children.boundary; i++) {

         const child = this.children.buffer[i];
         if (child) child.DeactivateGfx();
      }
   }

   /*******************************************************************************************************************************************************/
   // Setters-Getters

   /** Return type: Array. Returns an array of all widgets meshes */
   GetAllMeshes(parent_meshes_buf) {

      let all_meshes = parent_meshes_buf ? parent_meshes_buf : [];
      all_meshes.push(this)

      for (let i = 0; i < this.children.boundary; i++) {

         const child = this.children.buffer[i];
         if (child) all_meshes = child.GetAllMeshes(all_meshes);
      }

      // return [this];
      return all_meshes;
   }

   SetMargin() {
      this.geom.dim[0] += this.margin[0];
      this.geom.dim[1] += this.margin[1];
   }

   /*******************************************************************************************************************************************************/
   // Listeners
   OnClick(params) {

      const section = params.target_params.target_mesh;

      const point = MouseGetPos();
      const g = section.geom;
      if (Check_intersection_point_rect(g.pos, g.dim, point, [0, 8])) {

         STATE.mesh.SetClicked(section);
         console.log('Clicked:', section.name)

         if (section.timeIntervalsIdxBuffer.boundary <= 0) {

            /**
             * Create Move event.
             * The Move event runs only when the mesh is GRABED. That means that the timeInterval 
             * is created and destroyed upon 'onClickDown' and 'onClickUp' respectively.
             */
            const idx = TimeIntervalsCreate(10, 'Move Widget_Text', TIME_INTERVAL_REPEAT_ALWAYS, Section_on_move_section, section);
            section.timeIntervalsIdxBuffer.Add(idx);

            if (section.StateCheck(MESH_STATE.IS_GRABABLE)) {

               STATE.mesh.SetGrabed(section);
               section.StateEnable(MESH_STATE.IN_GRAB);
            }

         }
         return true;
      }

   }

   // Create all listen events recursively for all children, from each mesh's listeners buffer.
   ConstructListeners(_root = null, _Clbk = null) {

      const mesh = this; // If in recursion, use as the current mesh the passed param. 
      const root = (_root) ? _root : this; // If in recursion, use as root the passed param. 
      // console.log('****', mesh.name, mesh.listeners.buffer)

      // Create listen events for the section
      const root_evt = root.listeners.buffer;
      for (let etypeidx = 0; etypeidx < mesh.listeners.boundary; etypeidx++) {

         const evt = mesh.listeners.buffer[etypeidx];

         if (evt) { // If mesh has events to add...
            const target_params = {
               EventClbk: null,
               targetBindingFunctions: null,
               target_mesh: mesh,
               // target_mesh: root,
               params: null,
            }
            const Clbk = (_Clbk) ? _Clbk : mesh.OnClick;
            mesh.AddListenEvent(etypeidx, Clbk, target_params, root_evt);
         }
      }

      // Construct listen events for each section's item.
      for (let i = 0; i < mesh.children.boundary; i++) {
         const child = mesh.children.buffer[i];
         if (child) {

            /**
             * Create a Fake listen event as a parent event, if the section has no listen events,
             * so that the actual listen events of the section's children meshes have a parent event to be grouped.
             * 
             * // TODO!!: IMPORTANT!
             * 1. We create Fake event only for click events.
             * 2. We create Fake event despite the fact that there may not be any children events.
             */

            const parent_root = root.parent ? root.parent : root

            // Case item is of type section, run recursively.
            // If the root mesh does not have an event, create a fake event to store the children events to. 
            if (root.listeners.buffer[1] === null) {

               root.CreateListenEvent(LISTEN_EVENT_TYPES.CLICK_UP, true);
               root.AddListenEvent(1, null, null, parent_root.listeners.buffer);
            }
            if (child.type & MESH_TYPES_DBG.SECTION_MESH) {
               // child.ConstructListeners(child); // Recursive call. Passes the child section as the root for the parent event of the next recursion.
               child.ConstructListeners(mesh); // Recursive call. Passes the child section as the root for the parent event of the next recursion.
            }
            else if (child.ConstructListeners) // Call the widget's specific .ConstructListeners() to handle the widget's listen events creation
               child.ConstructListeners(root);

            // else console.error('NO LISTEN EVENTS CONSTRUCTION OCCURED for mesh:', child.name, child)
         }
      }
   }

   // SEE ### OnMove Events Implementation Logic
   // OnMove(params) {

   //    const section = params.params;

   //    // Destroy the time interval and the Move operation, if the mesh is not grabed
   //    if (section.StateCheck(MESH_STATE.IN_GRAB) === 0 && section.timeIntervalsIdxBuffer.boundary) {

   //       const intervalIdx = section.timeIntervalsIdxBuffer.buffer[0];// HACK !!!: We need a way to know what interval is what, in the 'timeIntervalsIdxBuffer' in a mesh. 
   //       TimeIntervalsDestroyByIdx(intervalIdx);
   //       section.timeIntervalsIdxBuffer.RemoveByIdx(0); // HACK

   //       return;
   //    }
   //    console.error('CALING SECTIONS\'S OnMove FUNCTION')

   //    // Move 
   //    const mouse_pos = MouseGetPosDif();
   //    section.geom.MoveXY(mouse_pos.x, -mouse_pos.y, section.gfx);

   // }

   /*******************************************************************************************************************************************************/
   // Transformations
   Move(x, y) { Section_move_children_recursive(x, y, this); }
   SetPosX(){} // TODO: IMPLEMENT
   SetPosY(y){ Section_set_posy_children_recursive(y, this); }
   SetColorAlpha(alpha){

      super.SetColorAlpha(0);

      for (let i = 0; i < this.children.boundary; i++) {
         const child = this.children.buffer[i];
         child.SetColorAlpha(alpha, alpha)
      }
   }
}


function Section_move_children_recursive(x, y, mesh) {

   for (let i = 0; i < mesh.children.boundary; i++) {

      const child = mesh.children.buffer[i];

      if (child.type & MESH_TYPES_DBG.SECTION_MESH) { // Case anothe section, run recursively
         const params = { params: child, };
         Section_move_children_recursive(x, y, child);
      }
      else { // To avoid moving section twice (as a child and as a section from recursion)

         /**DEBUG ERROR*/ if (!child.Move) { console.error('OnMove function is missing. @ Section.Move(), mesh:', child.name, child); return; }
         child.Move(x, y);
      }
   }

   mesh.geom.MoveXY(x, y, mesh.gfx);

}

function Section_set_posy_children_recursive(y, mesh) {

   for (let i = 0; i < mesh.children.boundary; i++) {

      const child = mesh.children.buffer[i];

      if (child.type & MESH_TYPES_DBG.SECTION_MESH) { // Case anothe section, run recursively
         Section_set_posy_children_recursive(y, child);
      }
      else { // To avoid moving section twice (as a child and as a section from recursion)

         // /**DEBUG ERROR*/ if (!child.Move) { console.error('OnMove function is missing. @ Section.Move(), mesh:', child.name, child); return; }
         // child.SetPosY(y);
         child.MoveY(y);
         console.log()
      }
   }

   mesh.geom.SetPosY(y, mesh.gfx);

}

function Section_on_move_section(params) {
   /**
    * The function is called by the timeInterval.
    * The timeInterval has been set by the 'OnClick' event.
    */

   const section = params.params;

   // Destroy the time interval calling this function if the mesh is not grabed.
   if (section.StateCheck(MESH_STATE.IN_GRAB) === 0 && section.timeIntervalsIdxBuffer.boundary) {

      const intervalIdx = section.timeIntervalsIdxBuffer.buffer[0]; // HACK !!!: We need a way to know what interval is what, in the 'timeIntervalsIdxBuffer' in a mesh. 
      TimeIntervalsDestroyByIdx(intervalIdx);
      section.timeIntervalsIdxBuffer.RemoveByIdx(0); // HACK

      return;
   }

   const mouse_pos = MouseGetPosDif();
   // console.log(mouse_pos)
   if (mouse_pos.x === 0 && mouse_pos.y === 0) return;

   // Move section
   if(section.gfx) section.MoveXY(mouse_pos.x, -mouse_pos.y, section.gfx);
   // if(section.gfx) section.MoveXY(mouse_pos.x, -mouse_pos.y);

   // Run children's OnMove event
   for (let i = 0; i < section.children.boundary; i++) {

      const child = section.children.buffer[i];
      if (child) { // Check for null children element

         if (child.type & MESH_TYPES_DBG.SECTION_MESH) { // Case another section, run recursively
            const params = { params: child, };
            Section_on_move_section(params);
         }
         else { // To avoid moving section twice (as a child and as a section from recursion)

            /**DEBUG ERROR*/ if (!child.Move) {
               console.error('OnMove function is missing. @ Section.Move(), mesh:', child.name, child);
               return;
            }
            if(child.gfx)child.Move(mouse_pos.x, -mouse_pos.y);
         }

      }
   }
}

function Expand2(section, options) {

   for (let i = 0; i < section.children.boundary; i++) {

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

function Calculate_positions_recursive(parent, options = SECTION.INHERIT, _accum_pos = [parent.geom.pos[1], 0]) {

   const padding = [0, 0]
   const cur_pos = [parent.geom.pos[0], parent.geom.pos[1]];
   const accum_pos = _accum_pos;


   for (let i = 0; i < parent.children.boundary; i++) {

      const mesh = parent.children.buffer[i];
      let continue_recur = true;
      let opt = options
      // console.log('[', mesh.name, ']')

      if (options & SECTION.INHERIT) opt = parent.options

      if (parent.type & MESH_TYPES_DBG.SECTION_MESH) { // For meshes with a parent of type Section

         const c_x = cur_pos[0]; const c_y = cur_pos[1];
         const p_dx = parent.GetTotalWidth(); const p_dy = parent.GetTotalHeight();
         const p_mx = parent.margin[0]; const p_my = parent.margin[1];

         const new_pos = [c_x - p_dx + mesh.GetTotalWidth() + p_mx, c_y - p_dy + mesh.GetTotalHeight() + p_my, parent.geom.pos[2] + 1,];

         if ((mesh.type & MESH_TYPES_DBG.SECTION_MESH) === 0) { // Case mesh not of type section, have it update it's new pos-dim on a later when it's gfx exists.

            const pos_dif = [new_pos[0] - mesh.GetCenterPosX(), new_pos[1] - mesh.GetCenterPosY(), new_pos[2] + 1];

            // console.log('Reposition:', mesh.name, mesh.geom.pos,  pos_dif)
            if (mesh.gfx){
               mesh.Reposition_post(pos_dif);
            }
            else {
               mesh.Reposition_pre(pos_dif);
            }

            continue_recur = false; // Stop recursion for meshe's children. Let the mesh deal with it's children.
         }
         else { // Case  mesh is of type section  

            // CopyArr3(mesh.geom.pos, new_pos);
            CopyArr2(mesh.geom.pos, new_pos);
         }
      }


      if (continue_recur)
         Calculate_positions_recursive(mesh, options, accum_pos)

      const mesh_width = mesh.GetTotalWidth();
      const mesh_height = mesh.GetTotalHeight();

      if (opt & SECTION.VERTICAL) {
         cur_pos[1] += mesh_height * 2;
         accum_pos[0] += mesh_width;
      }
      else if (opt & SECTION.HORIZONTAL) {
         cur_pos[0] += mesh_width * 2;
      }
   }

   return accum_pos;
}

function Calculate_sizes_recursive(section, top, left, options, total_margin = [0, 0], total_size = [0, 0]) {

   const padding = [0, 0]
   const margin = total_margin;
   const accum_size_per_section = [0, 0];

   for (let i = 0; i < section.children.boundary; i++) {

      let opt = options
      if (options & SECTION.INHERIT)
         opt = section.options

      const mesh = section.children.buffer[i];
      // if (mesh.type & MESH_TYPES_DBG.WIDGET_DROP_DOWN) { // Case the current item is of widget dropdown.

      //    const dp_size = mesh.GetSize();

      //    if (opt & SECTION.VERTICAL) {
      //       accum_size_per_section[1] += dp_size[1];
      //       accum_size_per_section[0] = dp_size[0];
      //       section.max_size[1] += dp_size[1];
      //       if (section.max_size[0] < accum_size_per_section[0])
      //          section.max_size[0] = dp_size[0];
      //    }
      //    else if (opt & SECTION.HORIZONTAL) {
      //       accum_size_per_section[0] += dp_size[0];
      //       accum_size_per_section[1] = dp_size[1];
      //       section.max_size[0] += dp_size[0];
      //       if (section.max_size[1] < accum_size_per_section[1])
      //          section.max_size[1] = dp_size[1];  // Keep the max height of all meshes in Horizontal mode.
      //    }
      // }
      // else 
      if (mesh.children.active_count && (mesh.type & MESH_TYPES_DBG.SECTION_MESH)) {

         margin[1] += mesh.margin[1] * 2;
         margin[0] += mesh.margin[0];
         const size = Calculate_sizes_recursive(mesh, top, left, SECTION.INHERIT, margin, total_size); // Recurse if child mesh is of type of Section
         total_size[0] += size[0];
         total_size[1] += size[1];

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
            accum_size_per_section[1] += mesh.geom.dim[1];
            accum_size_per_section[0] = mesh.geom.dim[0] * mesh.geom.num_faces;
            section.max_size[1] += mesh.geom.dim[1];
            if (section.max_size[0] < accum_size_per_section[0])
               section.max_size[0] = mesh.geom.dim[0] * mesh.geom.num_faces;  // Keep the max width of all meshes in Vertical mode.
         }
         else if (opt & SECTION.HORIZONTAL) {
            accum_size_per_section[0] += mesh.geom.dim[0] * mesh.geom.num_faces;
            accum_size_per_section[1] = mesh.geom.dim[1];
            section.max_size[0] += mesh.geom.dim[0] * mesh.geom.num_faces;
            if (section.max_size[1] < accum_size_per_section[1])
               section.max_size[1] = mesh.geom.dim[1];  // Keep the max height of all meshes in Horizontal mode.
         }
      }
      else { // Case the current item does not have children.

         if (opt & SECTION.VERTICAL) {
            accum_size_per_section[1] += mesh.geom.dim[1]
            accum_size_per_section[0] = mesh.geom.dim[0]
            section.max_size[1] += mesh.geom.dim[1];
            if (section.max_size[0] < accum_size_per_section[0]) section.max_size[0] = mesh.geom.dim[0]; // For horizontal, grow to the max width of all meshes
         }
         else if (opt & SECTION.HORIZONTAL) {
            accum_size_per_section[0] += mesh.geom.dim[0]
            accum_size_per_section[1] = mesh.geom.dim[1]
            section.max_size[0] += mesh.geom.dim[0]
            if (section.max_size[1] < accum_size_per_section[1]) section.max_size[1] = mesh.geom.dim[1];  // For horizontal, grow to the max height of all meshes
         }
      }
   }

   AddArr2(total_size, accum_size_per_section);
   return total_size;
}
