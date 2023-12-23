"use strict";

import { MouseGetPos, MouseGetPosDif } from "../../../Controls/Input/Mouse";
import { Gfx_generate_context } from "../../../Interfaces/Gfx/GfxContextCreate";
import { TimeIntervalsCreate, TimeIntervalsDestroyByIdx } from "../../../Timers/TimeIntervals";
import { Find_gfx_from_parent_ascend_descend, Find_textgfx_from_parent_descending } from "../../../Interfaces/Gfx/GfxContextFindMatch";
import { MESH_ENABLE } from "../Base/Mesh";
import { Rect } from "../Rect_Mesh";
import { Section } from "../Section";
import { Gl_progs_get_vb_byidx } from "../../../../Graphics/GlProgram";
import { BatchStore } from "../../../Batch/Batch";


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


export class Widget_Scroller extends Section {

   scrolled_section;
   scroll_bar;

   constructor(scrolled_mesh, dim = [100, 50], col = TRANSPARENCY(GREY5, .5)) {

      const pos = [200, 400, 0];

      super(SECTION.HORIZONTAL, [10, 10], pos, dim, col);
      this.EnableGfxAttributes(MESH_ENABLE.GFX.ATTR_STYLE);
      this.SetStyle([0, 6, 2]);
      this.SetName('Widget_Scroller');
      this.StateEnable(MESH_STATE.HAS_POPUP);
      this.type |= MESH_TYPES_DBG.WIDGET_SCROLLER;
      
      // If there is a group (section) passed by the user, use that section as scrolled section.
      if(scrolled_mesh && (scrolled_mesh.type & MESH_TYPES_DBG.SECTION_MESH)){
         
         this.scrolled_section = scrolled_mesh;
         // Calculate the scroller's initial position
         this.geom.pos[0] = (this.scrolled_section.geom.pos[0] - this.scrolled_section.geom.dim[0]) - this.margin[0]; // Include the margin in the calculation
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
      // const barMetrics = this.#CalculateBarArea(barpos, [dim[0], dim[1]], pad)
      

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
      handle.SetName('Scroll handle');
      handle.CreateListenEvent(LISTEN_EVENT_TYPES.HOVER);
      handle.StateEnable(MESH_STATE.IS_MOVABLE); // No event is created, cause the handle move event is handled by the OnClick() class method
      

      // Make the vertical area of the bar larger for hover and handle grabing.
      bar.hover_margin = [0, handle.geom.dim[1] + 4];


      /* * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * */
      // Align

      // Calculate the scroller's width
      // this.geom.dim[0] = this.scrolled_section.geom.dim[0] + barMetrics.dim[0] + this.margin[0];
      // this.geom.dim[0] = this.scrolled_section.geom.dim[0] + 200;
      this.geom.pos[0] += this.geom.dim[0]; // Correct the scrollers pos now that we know its width.
      this.geom.pos[1] += this.geom.dim[1]; // Correct the scrollers pos now that we know its height.

      // Calculate bar's position
      const bar_xpos = this.scrolled_section.geom.pos[0] + this.scrolled_section.geom.dim[0] + (barMetrics.dim[0])
      // bar.geom.pos[0] = bar_xpos;
      // bar.geom.pos[1] = this.geom.pos[1];
      
      // Calculate handle's position, from bar's position
      handle.geom.pos[0] = bar.geom.pos[0];
      handle.geom.pos[1] = bar.geom.pos[1];

      bar.AddChild(handle);
      this.scroll_bar = bar;


      // Add the scrolled mesh
      SCROLL_MESH_IDX = this.AddItem(this.scrolled_section);
      SCROLL_BAR_IDX = this.AddItem(this.scroll_bar);

      console.log('Scroller Dim:', this.geom.dim)
      console.log(this.scrolled_section.geom.pos[1])
   }

   AddItemToScrolledSection(mesh){

      /**DEBUG*/if(ERROR_NULL(mesh)) { console.error('AddItemToScrolledSection(), the mesh to be added is null or undefined'); return; }

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
   }

   TempRecalcAll(max_width){

      const left = (this.geom.pos[0]-this.geom.dim[0])
      this.SetDim([max_width, UNCHANGED]);
      this.SetPosX(this.geom.pos[0] + (max_width - this.geom.dim[0]) - this.margin[0]);
      // this.SetPosX(this.geom.pos[0] + max_width/2 - this.margin[0]);
      // this.SetPosX(this.geom.pos[0] + max_width/4);

      // // Set the bar and handle y pos
      // this.scroll_bar.SetPosY(this.geom.pos[1]);
      // const handle = this.scroll_bar.children.buffer[0];
      // handle.SetPosY(this.geom.pos[1]);
      // // this.geom.dim[0] = max_width;
      // console.log(max_width)

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
   GenGfxCtx(FLAGS = GFX_CTX_FLAGS.ANY, gfxidx = null) {

      if (FLAGS & GFX_CTX_FLAGS.PRIVATE) {

         const gfxidxs = Find_gfx_from_parent_ascend_descend(this, this.parent);
         FLAGS |= gfxidxs.rect.FLAGS; // NOTE: The only way to pass .PRIVATE to 'Gfx_generate_context()'

         this.gfx = Gfx_generate_context(this.sid, this.sceneidx, this.geom.num_faces, FLAGS, gfxidxs.rect.idxs);

         // We already have a vertex buffer for rect and text rendering
         const rect_gfxidxs = [this.gfx.prog.idx, this.gfx.vb.idx];

         this.scrolled_section.GenGfxCtx(FLAGS, rect_gfxidxs); 
   
         this.scroll_bar.gfx = Gfx_generate_context(this.scroll_bar.sid, this.scroll_bar.sceneidx, this.scroll_bar.geom.num_faces, FLAGS | GFX_CTX_FLAGS.SPECIFIC, rect_gfxidxs);
   
         const handle = this.scroll_bar.children.buffer[0];
         handle.gfx = Gfx_generate_context(handle.sid, handle.sceneidx, handle.geom.num_faces, FLAGS | GFX_CTX_FLAGS.SPECIFIC, rect_gfxidxs);

      }
      else {
         this.gfx = Gfx_generate_context(this.sid, this.sceneidx, this.geom.num_faces, FLAGS, gfxidx);
         
         this.scrolled_section.GenGfxCtx(FLAGS, gfxidx); // Let widget_Dynamic_Text to handle the gfx generation
   
         this.scroll_bar.gfx = Gfx_generate_context(this.scroll_bar.sid, this.scroll_bar.sceneidx, this.scroll_bar.geom.num_faces, FLAGS, gfxidx);
   
         const handle = this.scroll_bar.children.buffer[0];
         handle.gfx = Gfx_generate_context(handle.sid, handle.sceneidx, handle.geom.num_faces, FLAGS, gfxidx);
      }

      return this.gfx;
   }

   Render() {

      if (!this.is_gfx_inserted) { this.AddToGfx(); this.is_gfx_inserted = true }

      if (!this.scrolled_section.is_gfx_inserted) { this.scrolled_section.Render(); this.scrolled_section.is_gfx_inserted = true }

      const bar = this.scroll_bar;
      if (!bar.is_gfx_inserted) { bar.AddToGfx(); bar.is_gfx_inserted = true }

      const handle = bar.children.buffer[0];
      if (!handle.is_gfx_inserted) { handle.AddToGfx(); handle.is_gfx_inserted = true }

      this.SetScissorBox();
   }

   SetScissorBox(){

      // Enable scissoring
      const vb = Gl_progs_get_vb_byidx(this.gfx.prog.groupidx, this.gfx.prog.idx, this.gfx.vb.idx);
      /**DEBUG */ if(!vb) alert('SetScissorBox() in Scroller cannot resolve vertex buffer');
      const scissorbox = [
         this.geom.pos[0] - this.geom.dim[0],
         // this.geom.pos[1] - this.geom.dim[1],
         this.geom.pos[1] + this.geom.dim[1],
         this.geom.dim[0] *2,
         this.geom.dim[1] *2,
         // (this.geom.dim[1] *2) - this.margin[1]*10,
         // (this.geom.dim[1] *2) - this.margin[1]*2,
      ];
      vb.EnableScissorBox();
      vb.SetScissorBox(scissorbox);
      
      const textgfx = Find_textgfx_from_parent_descending(this);
      if(textgfx){
         const vb_text = Gl_progs_get_vb_byidx(textgfx.prog.groupidx, textgfx.prog.idx, textgfx.vb.idx);
         /**DEBUG */ if(!vb_text) alert('SetScissorBox() in Scroller cannot resolve vertex buffer for text');
         vb_text.EnableScissorBox();
         vb_text.SetScissorBox(scissorbox);
      }
      else console.log('{}{}{}{}}}{}{}} TEXT BUFFER NNOT FOUND')
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

   /*******************************************************************************************************************************************************/
   // Events Handling

   OnClick(params) {

      const mesh = params.target_params.target_mesh;
      const point = MouseGetPos();
      console.log('::::::::::::::::::::::::: mesh:', mesh.name)

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

            const idx = TimeIntervalsCreate(10, 'Move Scroller', TIME_INTERVAL_REPEAT_ALWAYS, mesh.OnMove, mesh);
            mesh.timeIntervalsIdxBuffer.Add(idx);

            STATE.mesh.SetGrabed(mesh);
            mesh.StateEnable(MESH_STATE.IN_GRAB);
         }

         return true;
      }
   }

   // SEE ### OnMove Events Implementation Logic
   OnMove(params) {

      // const scroller = params.target_params;
      const scroller = params.params;

      // Destroy the time interval and the Move operation, if the scroller is not grabed
      // MESH_STATE.IN_GRAB is deactivated upon mouse click up in Events.js.
      if (scroller.StateCheck(MESH_STATE.IN_GRAB) === 0 && scroller.timeIntervalsIdxBuffer.boundary) {

         const intervalIdx = scroller.timeIntervalsIdxBuffer.buffer[0];// HACK !!!: We need a way to know what interval is what, in the 'timeIntervalsIdxBuffer' in a mesh. 
         TimeIntervalsDestroyByIdx(intervalIdx);
         scroller.timeIntervalsIdxBuffer.RemoveByIdx(0); // HACK

         return;
      }

      const mouse_pos = MouseGetPosDif();

      // Move 'this' text
		// scroller.geom.pos[0] += mouse_pos.x; 
      // scroller.geom.pos[1] += -mouse_pos.y; 
      BatchStore(scroller, BATCH_TYPE.MOVE, [mouse_pos.x, -mouse_pos.y]);
      
      const scrolled_mesh = scroller.children.buffer[SCROLL_MESH_IDX];
      scrolled_mesh.Move(mouse_pos.x, -mouse_pos.y); // Let the scrolled mesh handle the Move().
      
      const bar = scroller.children.buffer[SCROLL_BAR_IDX];
		// bar.geom.pos[0] += mouse_pos.x; 
      // bar.geom.pos[1] += -mouse_pos.y; 
      BatchStore(bar, BATCH_TYPE.MOVE, [mouse_pos.x, -mouse_pos.y]);
      
      const handle = bar.children.buffer[0];
		// handle.geom.pos[0] += mouse_pos.x; 
      // handle.geom.pos[1] += -mouse_pos.y; 
      BatchStore(handle, BATCH_TYPE.MOVE, [mouse_pos.x, -mouse_pos.y]);

      scroller.SetScissorBox();

   }

   ConstructListeners(_root=null){
      
      const scroller = this;
      const bar = this.scroll_bar; 
      const handle = bar.children.buffer[0]; 
      const scrolled_section = this.scrolled_section; 

      const root_evt = _root ? _root.listeners.buffer : null; 

      // Create hover events
      if(scroller.listeners.buffer[LISTEN_EVENT_TYPES_INDEX.HOVER]) scroller.AddListenEvent(LISTEN_EVENT_TYPES_INDEX.HOVER);
      if(handle.listeners.buffer[LISTEN_EVENT_TYPES_INDEX.HOVER]) handle.AddListenEvent(LISTEN_EVENT_TYPES_INDEX.HOVER);
      if(bar.listeners.buffer[LISTEN_EVENT_TYPES_INDEX.HOVER]) bar.AddListenEvent(LISTEN_EVENT_TYPES_INDEX.HOVER);

      const target_params = {
         EventClbk: null,
         targetBindingFunctions: null,
         target_mesh: scroller,
         params: null,
      }
      if(scroller.listeners.buffer[LISTEN_EVENT_TYPES_INDEX.CLICK]){ // This is a check mainly if the user has activated the 'Move' event for the scroller.

         scroller.CreateListenEvent(LISTEN_EVENT_TYPES.MOVE, false);
         scroller.AddListenEvent(LISTEN_EVENT_TYPES_INDEX.CLICK, scroller.OnClick, target_params, root_evt);
      }
      else{

         // Create a Fake click event with no callback and params, but any root events.  
         scroller.CreateListenEvent(LISTEN_EVENT_TYPES.CLICK_UP, true);
         scroller.AddListenEvent(LISTEN_EVENT_TYPES_INDEX.CLICK, null, null, root_evt); 
      }
      bar.CreateListenEvent(LISTEN_EVENT_TYPES.CLICK_UP);
      bar.AddListenEvent(LISTEN_EVENT_TYPES_INDEX.CLICK, scroller.OnClick, target_params, scroller.listeners.buffer);

      scrolled_section.ConstructListeners(this);

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