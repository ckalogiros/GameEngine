"use strict";

import { CopyArr1_3, CopyArr2 } from "../../../../Helpers/Math/MathOperations";
import { MouseGetPos, MouseGetPosDif } from "../../../Controls/Input/Mouse";
import { Gfx_generate_context } from "../../../Interfaces/Gfx/GfxContext";
import { Scenes_store_gfx_to_buffer } from "../../../Scenes";
import { TimeIntervalsCreate, TimeIntervalsDestroyByIdx } from "../../../Timers/TimeIntervals";
import { Check_intersection_point_rect } from "../../Operations/Collisions";
import { MESH_ENABLE } from "../Base/Mesh";
import { Rect } from "../Rect_Mesh";
import { Section } from "../Section";


/** ### Scroller Widget
 *    Scroller is used for almost in any case of the construction of 
 *    a group of meshes/widgets.
 * 
 *    It has 3 main parts:
 *       1. The outer section.
 *       2. The scrolled section.
 *       3. The scroll bar and handle.
 * 
 *    The outer section is fixed height OR should not exceed certain height (not more than the canvas height).
 *    The scroll bar has the same height as the outer section.
 *    The scrolled section holds (grouped) widgets/meshes. It can grow in height and in width.
 * 
 *    Both scrolled section and scroll bar are direct childs of scroller widget.
 * 
 *    The outer section:
 *       Must Align the Both scrolled section and scroll bar.
 *       Must grow in width according to the arbitary width of the scrooled section.
 * 
 *    Construction:
 *       Can be both on demand and automatic???
 *       If a type of 'Section' is passed to the constructor, the that section is copied to the scrooled section of the class.
 *       Else the scrolled section is initialized as a 'Section' in the constructor.
 *       After scroller widget construction, the only way to add widget/meshes/items to the group (scrolled section)
 *          is by using the apropriate class method AddTo...().
 *    
 *    Adding items to scrolled section:
 *       Check if the new item's width is larger, in that case sroller must resize and re-align Both scrolled section and scroll bar.
 *    Deleting items from scrolled section:
 *       ???
 * 
 * 
 *    GFX:
 *       All meshes (scroller widget, scrolled section, scroll bar and handle)
 *       can be stored in the same gfx buffers.
 *       If the bar and handle is not to be shown, then use the alpha color.
 *    
 */
let SCROLL_MESH_IDX = INT_NULL;
let SCROLL_BAR_IDX = INT_NULL;


// export class Widget_Scroller extends Rect{
export class Widget_Scroller extends Section {

   scrolled_section;
   scroll_bar;

   constructor(scrolled_mesh, dim = [100, 50], col = TRANSPARENCY(GREY5, .5)) {

      const pos = [200, 400, 0];

      super(SECTION.HORIZONTAL, [10, 0], pos, dim);
      this.EnableGfxAttributes(MESH_ENABLE.GFX.ATTR_STYLE);
      this.SetStyle([0, 6, 2]);
      this.SetName('Widget_Scroller');
      this.StateEnable(MESH_STATE.HAS_POPUP);
      this.type |= MESH_TYPES_DBG.WIDGET_SCROLLER;
      
      // If there is a group (section) passed by the user, use that section as scrolled section.
      if(scrolled_mesh && (scrolled_mesh.type & MESH_TYPES_DBG.SECTION_MESH)){
         
         this.scrolled_section = scrolled_mesh;
         this.geom.pos[0] = (this.scrolled_section.geom.pos[0] - this.scrolled_section.geom.dim[0]) - this.margin[0]; // Include the margin in the calculation
         // this.geom.pos[0] = (this.scrolled_section.geom.pos[0] - this.scrolled_section.geom.dim[0]); // Include the margin in the calculation
         this.geom.pos[1] = (this.scrolled_section.geom.pos[1] - this.scrolled_section.geom.dim[1]) + this.margin[1]; 
      }
      else{ // else create a new scrolled section.
         
         // this.scrolled_section = new Section(SECTION.VERTICAL, [10, 10], pos, [0, 0], TRANSPARENCY(GREY1, .6));
         
         // We need to calculate the sizes correctly.
         // E.x. we need to create a new scrolled_section section, add the items, calculate with .Calc() and get the size to use for aligning the scroller and the scroll bar...
         console.error('IMPLEMENT this.')
      }

      // Calculate the bar's and handle's horizontal pading.
      const pad = [1.4, 1.4];


      /* * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * */
      // Scroller Bar: Bar is child of 'this'

      // Calculate bar's dimentions and position.
      const barpos = [pos[0], pos[1] + this.geom.dim[1], pos[2]]
      const barMetrics = this.#CalculateBarArea(barpos, [10, dim[1]], pad)
      

      const bar = new Rect(barMetrics.pos, barMetrics.dim, PINK_240_60_160);

      bar.type |= MESH_TYPES_DBG.WIDGET_SCROLLER_BAR | bar.geom | bar.mat;
      bar.EnableGfxAttributes(MESH_ENABLE.GFX.ATTR_STYLE);
      bar.SetStyle([0, 3, 2]);
      bar.SetName('Scroll bar');


      /* * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * */
      // Scroller Handle: Handle is a child of the bar mesh

      const handleMetrics = this.#CalculateHandleArea(bar.geom.pos, bar.geom.dim, pad)
      const handle = new Rect(handleMetrics.pos, handleMetrics.dim, BLUE_10_120_220);
      handle.type |= MESH_TYPES_DBG.WIDGET_SCROLLER_HANDLE | handle.geom | handle.mat;
      handle.EnableGfxAttributes(MESH_ENABLE.GFX.ATTR_STYLE);
      handle.SetStyle([4, 5, 1.9]);
      handle.StateEnable(MESH_STATE.IS_MOVABLE);
      handle.CreateListenEvent(LISTEN_EVENT_TYPES.HOVER)
      handle.SetName('Scroll handle');


      // Make the vertical area of the bar larger for hover and handle grabing.
      bar.hover_margin = [0, handle.geom.dim[1] + 4];


      /* * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * */
      // Align

      // Calculate the scroller's width
      this.geom.dim[0] = this.scrolled_section.geom.dim[0] + barMetrics.dim[0] + this.margin[0];
      this.geom.pos[0] += this.geom.dim[0]; // Correct the scrollers pos now that we know its width.
      this.geom.pos[1] += this.geom.dim[1]; // Correct the scrollers pos now that we know its height.

      // Calculate bar's position
      const bar_xpos = this.scrolled_section.geom.pos[0] + this.scrolled_section.geom.dim[0] + (barMetrics.dim[0])
      bar.geom.pos[0] = bar_xpos;
      bar.geom.pos[1] = this.geom.pos[1];
      
      // Calculate handle's position, from bar's position
      handle.geom.pos[0] = bar.geom.pos[0];
      handle.geom.pos[1] = bar.geom.pos[1];
      console.log(bar.geom.pos)
      console.log(handle.geom.pos)

      bar.AddChild(handle);
      this.scroll_bar = bar;


      // Add the scrolled mesh
      SCROLL_MESH_IDX = this.AddItem(this.scrolled_section);
      SCROLL_BAR_IDX = this.AddItem(this.scroll_bar);

      console.log('Scroller Dim:', this.geom.dim)

      console.log(this.scrolled_section.geom.pos[1])
   }

   AddToScrolledSection(mesh){

      /**DEBUG*/if(ERROR_NULL(mesh)) { console.error('AddToScrolledSection(), the mesh to be added is null or undefined'); return; }

      this.scrolled_section.AddItem(mesh);
      
      const size = this.scrolled_section.Recalc();
      if(size[0] > this.geom.dim[0]){
         
         this.#RecalculateWidth(size[0]);
      }
      this.#Reposition();
      
      // Set scroller's y pos
      this.geom.pos[1] = (this.scrolled_section.geom.pos[1] - this.scrolled_section.geom.dim[1]) + this.geom.dim[1] + this.margin[1]; 

      // Set the bar and handle y pos
      this.scroll_bar.SetPosY(this.geom.pos[1]);
      const handle = this.scroll_bar.children.buffer[0];
      handle.SetPosY(this.geom.pos[1]);

      console.log('+++')
   }

   TempRecalcAll(size){

      if(size[0] > this.geom.dim[0]){
         
         // this.#RecalculateWidth(size[0]);
      }
      // this.#Reposition();
      

      // Set the bar and handle y pos
      this.scroll_bar.SetPosY(this.geom.pos[1]);
      const handle = this.scroll_bar.children.buffer[0];
      handle.SetPosY(this.geom.pos[1]);

      console.log('***')
   }

   Destroy() {

      const scrolled_mesh = this.children.buffer[SCROLL_MESH_IDX];
      const bar = this.children.buffer[SCROLL_BAR_IDX];
      const handle = bar.children.buffer[0];

      scrolled_mesh.Destroy();
      handle.Destroy();
      bar.Destroy();

      // Scrollers's rect_mesh destruction
      super.Destroy();
   }

   /*******************************************************************************************************************************************************/
   // Graphics
   GenGfxCtx(FLAGS = GFX.ANY, gfxidx = [INT_NULL, INT_NULL]) {

      this.gfx = Gfx_generate_context(this.sid, this.sceneidx, this.geom.num_faces, FLAGS, gfxidx);

      this.scrolled_section.GenGfxCtx(FLAGS, gfxidx); // Let widget_Dynamic_Text to handle the gfx generation

      this.scroll_bar.gfx = Gfx_generate_context(this.scroll_bar.sid, this.scroll_bar.sceneidx, this.scroll_bar.geom.num_faces, FLAGS, gfxidx);
      Scenes_store_gfx_to_buffer(this.scroll_bar.sceneidx, this.scroll_bar);

      const handle = this.scroll_bar.children.buffer[0];
      handle.gfx = Gfx_generate_context(handle.sid, handle.sceneidx, handle.geom.num_faces, FLAGS, gfxidx);
      Scenes_store_gfx_to_buffer(handle.sceneidx, handle);

      return this.gfx;
   }

   Render() {

      if (!this.is_gfx_inserted) { this.AddToGfx(); this.is_gfx_inserted = true }

      if (!this.scrolled_section.is_gfx_inserted) { this.scrolled_section.Render(); this.scrolled_section.is_gfx_inserted = true }

      const bar = this.scroll_bar;
      if (!bar.is_gfx_inserted) { bar.AddToGfx(); bar.is_gfx_inserted = true }

      const handle = bar.children.buffer[0];
      if (!handle.is_gfx_inserted) { handle.AddToGfx(); handle.is_gfx_inserted = true }

   }

   DeactivateGfx() {

      // const bar = this.children.buffer[SCROLL_BAR_IDX];
      // const handle = bar.children.buffer[0];

      // bar.DeactivateGfx();
      // handle.DeactivateGfx();
      // super.DeactivateGfx()

   }

   /*******************************************************************************************************************************************************/
   // Transformations
   Move(x, y) {

   }

   /*******************************************************************************************************************************************************/
   // Events Handling
   // OnClick(params) {

   //    const scroller = params.target_params.target_mesh;

   //    const point = MouseGetPos();
   //    const g = scroller.geom;
   //    if (Check_intersection_point_rect(g.pos, g.dim, point, [0, 8])) {

   //       STATE.mesh.SetClicked(scroller);
   //       console.log('Clicked:', scroller.name)

   //       if (scroller.timeIntervalsIdxBuffer.boundary <= 0) {

   //          /**
   //           * Create Move event.
   //           * The Move event runs only when the mesh is GRABED. That means that the timeInterval 
   //           * is created and destroyed upon 'onClickDown' and 'onClickUp' respectively.
   //           */
   //          const idx = TimeIntervalsCreate(10, 'Move Widget_Text', TIME_INTERVAL_REPEAT_ALWAYS, scroller.OnMove, scroller);
   //          scroller.timeIntervalsIdxBuffer.Add(idx);

   //          if (scroller.StateCheck(MESH_STATE.IS_GRABABLE)) {

   //             STATE.mesh.SetGrabed(scroller);
   //             scroller.StateEnable(MESH_STATE.IN_GRAB);
   //          }

   //       }
   //       return true;
   //    }

   // }

   OnClick(params) {

      const mesh = params.target_params.target_mesh;
      const point = MouseGetPos();

      // Check if the click happened on bar
      const bar = mesh.children.buffer[SCROLL_BAR_IDX];
      if (point[0] > bar.geom.pos[0] - bar.geom.dim[0] + bar.hover_margin[0]) { // Check only if click is on the right of the left side of the bar mesh

         STATE.mesh.SetClicked(bar);

         if ((bar.type & MESH_TYPES_DBG.WIDGET_SCROLLER_BAR) && bar.timeIntervalsIdxBuffer.boundary <= 0) {

            const idx = TimeIntervalsCreate(10, 'Move Scroller Handle', TIME_INTERVAL_REPEAT_ALWAYS, Scroller_on_update_handle, bar);
            bar.timeIntervalsIdxBuffer.Add(idx);

            STATE.mesh.SetGrabed(bar);
            bar.StateEnable(MESH_STATE.IN_GRAB);
         }

         return true;
      }
      else {

         STATE.mesh.SetClicked(bar);

         // Move Scroller 
         if ((mesh.type & MESH_TYPES_DBG.WIDGET_SCROLLER) && mesh.StateCheck(MESH_STATE.IS_GRABABLE) && mesh.timeIntervalsIdxBuffer.boundary <= 0) {

            // const idx = TimeIntervalsCreate(10, 'Move Scroller', TIME_INTERVAL_REPEAT_ALWAYS, Scroller_move_event, mesh);
            const idx = TimeIntervalsCreate(10, 'Move Scroller', TIME_INTERVAL_REPEAT_ALWAYS, mesh.OnMove, mesh);
            mesh.timeIntervalsIdxBuffer.Add(idx);

            STATE.mesh.SetGrabed(mesh);
            mesh.StateEnable(MESH_STATE.IN_GRAB);
         }

         return true;
      }
      return false;
   }

   OnMove(params) {

      const mesh = params.params;

      // Destroy the time interval and the Move operation, if the mesh is not grabed
      // MESH_STATE.IN_GRAB is deactivated upon mouse click up in Events.js.
      if (mesh.StateCheck(MESH_STATE.IN_GRAB) === 0 && mesh.timeIntervalsIdxBuffer.boundary) {

         const intervalIdx = mesh.timeIntervalsIdxBuffer.buffer[0];// HACK !!!: We need a way to know what interval is what, in the 'timeIntervalsIdxBuffer' in a mesh. 
         TimeIntervalsDestroyByIdx(intervalIdx);
         mesh.timeIntervalsIdxBuffer.RemoveByIdx(0); // HACK

         return;
      }

      const mouse_pos = MouseGetPosDif();

      // Move 'this' text
      mesh.geom.MoveXY(mouse_pos.x, -mouse_pos.y, mesh.gfx);

      const scrolled_mesh = mesh.children.buffer[SCROLL_MESH_IDX];
      scrolled_mesh.Move(mouse_pos.x, -mouse_pos.y); // Let the scrolled mesh handle the Move().

      const bar = mesh.children.buffer[SCROLL_BAR_IDX];
      bar.geom.MoveXY(mouse_pos.x, -mouse_pos.y, bar.gfx);

      const handle = bar.children.buffer[0];
      handle.geom.MoveXY(mouse_pos.x, -mouse_pos.y, handle.gfx);

   }


   /*******************************************************************************************************************************************************/
   // Alignment
   // Reposition_post(dif_pos) {

   //    this.MoveXYZ(dif_pos);
   //    // const scrolled_mesh = this.children.buffer[SCROLL_MESH_IDX];
   //    // scrolled_mesh.MoveXYZ(dif_pos);
   //    // const bar = this.children.buffer[SCROLL_BAR_IDX];
   //    // bar.MoveXYZ(dif_pos);
   //    const handle = bar.children.buffer[0];
   //    handle.MoveXYZ(dif_pos);
   // }

   /*******************************************************************************************************************************************************/
   // Private Methods 
   #CalculateBarArea(_pos, _dim, pad) {

      const dim = [_dim[0], _dim[1]];
      const pos = [_pos[0], _pos[1], _pos[2] + 1]; // Does not need to change for center positioning.

      return {
         pos: pos,
         dim, dim,
      };
   }

   #CalculateHandleArea(_pos, _dim, pad) {

      const dim = [_dim[0] - (pad[0] * 2), 0];
      dim[1] = dim[0];
      const pos = [_pos[0], _pos[1], _pos[2] + 1]; // Pos does not need to change for positioning in the center.

      return {
         pos: pos,
         dim, dim,
      };
   }

   #RecalculateWidth(scrolled_section_width){

      const new_width = scrolled_section_width + this.scroll_bar.geom.dim[0] + this.margin[0]*2;
      this.SetDim([new_width, UNCHANGED]);
   }

   // Reposition scroller arround the scrolled_section
   #Reposition(){

      const x = this.scrolled_section.geom.pos[0] + this.scrolled_section.geom.dim[0] + (this.scroll_bar.geom.dim[0])
      this.scroll_bar.SetPosX(x);
      const handle = this.scroll_bar.children.buffer[0];
      handle.SetPosX(x);
      
   }

}


export function Scroller_on_update_handle(_params) {

   /**
    * The function is called by the timeInterval.
    * The timeInterval has been set by the 'Scroller_create_on_click_event',
    * that is called from 'HandleEvents()' 
    * as 'mesh.eventCallbacks.buffer[i].Clbk(target, Clbk);'
    * The 'HandleEvents()' passes the param '_params' to this function.
    */

   const bar = _params.params;
   const handle = bar.children.buffer[0];

   if (bar.StateCheck(MESH_STATE.IN_GRAB) === 0 && bar.timeIntervalsIdxBuffer.boundary) {

      // If bar out of hover, delete the timeInterval for moving the handle
      const intervalIdx = bar.timeIntervalsIdxBuffer.buffer[0];// HACK !!!: We need a way to know what interval is what, in the 'timeIntervalsIdxBuffer' in a mesh. 
      TimeIntervalsDestroyByIdx(intervalIdx);
      bar.timeIntervalsIdxBuffer.RemoveByIdx(0); // HACK

      return;
   }

   Scroller_move_handle(bar, handle);

   const val = Scroller_calculate_value(bar, handle); // Calculate slider's value based on the handles position.
   // console.log(val)
   /**
    * IMPLEMENT:
    * the transformation of the scrollers section (.children.buffer[0])
    * according to the 'val' of the scroll-hanndle
   */
   const scroller = bar.parent;
   const scrolled_section = scroller.children.buffer[SCROLL_MESH_IDX];
   // move ratio is: hidden (scrolled_section height - scroller widget height) / handle max-val
   const move_ratio = ((scrolled_section.geom.dim[1] *2)-scroller.geom.dim[1]*2) / 100;
   
   // Calculate the absolute position for the scrolled mesh. (Can't use the scolled_section's pos because it changes).
   const scroller_top = scroller.geom.pos[1]- scroller.geom.dim[1];
   const posy = (move_ratio * -val) + scroller_top + scrolled_section.geom.dim[1]; 
   // scrolled_section.SetPosY(posy);
   const ydif = posy - scrolled_section.geom.pos[1]
   scrolled_section.Move(0, ydif);

   // console.log('scroller.geom.pos[1]:', scroller.geom.pos[1], ' scrolled_section.geom.pos[1]:', scrolled_section.geom.pos[1])

}


/* * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * *
 * Scroller Functionality 
 */

function Scroller_move_handle(bar, handle) {

   /** Move the handle acoring to the mouse position */
   const barupper = bar.geom.pos[1] - bar.geom.dim[1];
   const barlower = bar.geom.pos[1] + bar.geom.dim[1];
   const y = MouseGetPos()[1];

   if (y > barupper && y < barlower)
      handle.geom.SetPosY(y, handle.gfx)

   else if (y > barlower)
      handle.geom.SetPosY(barlower, handle.gfx)

   else if (y < barupper)
      handle.geom.SetPosY(barupper, handle.gfx)

   return true;
}

function Scroller_calculate_value(bar, handle) {

   const handleypos = handle.geom.pos[1];
   const barheight = bar.geom.dim[1] * 2;
   const bartop = bar.geom.pos[1] - bar.geom.dim[1];

   const val = handleypos - bartop;

   const max = 100; // Set the max value the scroller will interpolate to.
   // Interpolate to a 0-max value.
   const scrollerVal = (val * max) / (barheight);

   return scrollerVal;
}