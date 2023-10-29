"use strict";

import { MouseGetPos, MouseGetPosDif } from "../../../Controls/Input/Mouse";
import { Gfx_generate_context } from "../../../Interfaces/Gfx/GfxContext";
import { Scenes_store_gfx_to_buffer } from "../../../Scenes";
import { TimeIntervalsCreate, TimeIntervalsDestroyByIdx } from "../../../Timers/TimeIntervals";
import { Check_intersection_point_rect } from "../../Operations/Collisions";
import { MESH_ENABLE } from "../Base/Mesh";
import { Rect } from "../Rect_Mesh";
import { Section } from "../Section";


let SCROLL_MESH_IDX = INT_NULL;
let SCROLL_BAR_IDX = INT_NULL;


// export class Widget_Scroller extends Rect{
export class Widget_Scroller extends Section{

   scroller;

   constructor(scrolled_mesh, initial_dim=[10,10], col=TRANSPARENCY(GREY5, .5)){

      const pos = scrolled_mesh.geom.pos;
      // const dim = dim;
      const dim = scrolled_mesh.geom.dim;

      // Calculate the bar's and handle's horizontal pading.
      const ratio = dim[0] / dim[1];
      // const pad = [dim[0] * 0.5, dim[1] / 2.8];
      // const pad = [dim[0] / 10.28, dim[1]*.1];
      // const pad = [dim[0], dim[1]];
      const pad = [10, 0];
      // pad[0] /= ratio;

      /** Label area mesh */
      // options = (SECTION.VERTICAL), margin = [4, 4], pos = [200, 400, 0], dim = [40, 40], col = TRANSPARENCY(BLUE, .6), name = ''
      super(SECTION.HORIZONTAL, [10, 10], pos, dim);
      this.EnableGfxAttributes(MESH_ENABLE.GFX.ATTR_STYLE);
      this.SetStyle([0, 6, 2]);
      this.SetName('Widget_Scroller');
      this.StateEnable(MESH_STATE.HAS_POPUP);
      // this.CreateListenEvent(LISTEN_EVENT_TYPES.HOVER);
      // this.StateEnable(MESH_STATE.IS_HOVER_COLORABLE);
      this.type |= MESH_TYPES_DBG.WIDGET_SCROLLER_BAR;

      // Add the scrolled mesh
      SCROLL_MESH_IDX = this.AddItem(scrolled_mesh);


      /* * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * */
      // Scroller Bar: Bar is child of the scroller mesh

      // Calculate bar's dimentions and position.
      const barpos = [pos[0], pos[1] + this.geom.dim[1], pos[2]]
      // const barpos = [pos[0], pos[1], pos[2]]
      const barMetrics = this.#CalculateBarArea(barpos, [20, dim[1]], pad)

      const bar = new Rect(barMetrics.pos, barMetrics.dim, PINK_240_60_160);

      bar.type |= MESH_TYPES_DBG.WIDGET_SLIDER_BAR | bar.geom | bar.mat;
      bar.EnableGfxAttributes(MESH_ENABLE.GFX.ATTR_STYLE);
      bar.SetStyle([0, 3, 2]);
      bar.StateEnable(MESH_STATE.IS_GRABABLE | MESH_STATE.IS_HOVER_COLORABLE);
      bar.CreateListenEvent(LISTEN_EVENT_TYPES.HOVER)
      bar.SetName('Scroll bar');
      
      
      /* * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * */
      // Scroller Handle: Handle is a child of the bar mesh
      
      pad[0] = dim[1] / 5;
      const handleMetrics = this.#CalculateHandleArea(bar.geom.pos, bar.geom.dim, pad)
      
      const handle = new Rect(handleMetrics.pos, handleMetrics.dim, BLUE_10_120_220);

      handle.type |= MESH_TYPES_DBG.WIDGET_SLIDER_HANDLE | handle.geom | handle.mat;
      handle.EnableGfxAttributes(MESH_ENABLE.GFX.ATTR_STYLE);
      handle.SetStyle([4, 5, 1.9]);
      handle.StateEnable(MESH_STATE.IS_MOVABLE);
      handle.CreateListenEvent(LISTEN_EVENT_TYPES.HOVER)
      handle.SetName('Scroll handle');


      // Make the vertical area of the bar larger for hover and handle moving.
      bar.hover_margin = [0, handle.geom.dim[1] + 4];


      /* * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * */
      // Align
      bar.geom.pos[0] = this.geom.pos[0];
      bar.geom.pos[1] = this.geom.pos[1] + this.geom.dim[1] - handle.geom.dim[1] - pad[1];

      handle.geom.pos[0] = bar.geom.pos[0];
      handle.geom.pos[1] = bar.geom.pos[1];
      console.log(bar.geom.pos)
      console.log(handle.geom.pos)

      bar.AddChild(handle);
      SCROLL_BAR_IDX = this.AddItem(bar);
      // this.Recalc();
   }

   
   Destroy() {

      const scrolled_mesh = this.children.buffer[SCROLL_MESH_IDX];
      const bar = this.children.buffer[SCROLL_BAR_IDX];
      const handle = bar.children.buffer[0];

      scrolled_mesh.Destroy();
      handle.Destroy();
      bar.Destroy();

      // Sliders's rect_mesh destruction
      super.Destroy();
   }

   /*******************************************************************************************************************************************************/
   // Graphics
   GenGfxCtx(FLAGS = GFX.ANY, gfxidx = [INT_NULL, INT_NULL]) {

      this.gfx = Gfx_generate_context(this.sid, this.sceneidx, this.geom.num_faces, FLAGS, gfxidx);

      const scrolled_mesh = this.children.buffer[SCROLL_MESH_IDX];
      scrolled_mesh.GenGfxCtx(FLAGS, gfxidx); // Let widget_Dynamic_Text to handle the gfx generation
      
      const bar = this.children.buffer[SCROLL_BAR_IDX];
      bar.gfx = Gfx_generate_context(bar.sid, bar.sceneidx, bar.geom.num_faces, FLAGS, gfxidx);
      Scenes_store_gfx_to_buffer(bar.sceneidx, bar);
      
      const handle = bar.children.buffer[0];
      handle.gfx = Gfx_generate_context(handle.sid, handle.sceneidx, handle.geom.num_faces, FLAGS, gfxidx);
      Scenes_store_gfx_to_buffer(handle.sceneidx, handle);
      
      return this.gfx;
   }

   Render() {

      if (!this.is_gfx_inserted) { this.AddToGfx(); this.is_gfx_inserted = true }

      const scrolled_mesh = this.children.buffer[SCROLL_MESH_IDX];
      if (!scrolled_mesh.is_gfx_inserted) { scrolled_mesh.Render(); scrolled_mesh.is_gfx_inserted = true }
      
      const bar = this.children.buffer[SCROLL_BAR_IDX];
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
   Move(x, y){

   }

   /*******************************************************************************************************************************************************/
   // Events Handling
   OnClick(params) {

      const scroller = params.target_params.target_mesh;

      const point = MouseGetPos();
      const g = scroller.geom;
      if (Check_intersection_point_rect(g.pos, g.dim, point, [0, 8])) {

         STATE.mesh.SetClicked(scroller);
         console.log('Clicked:', scroller.name)

         if (scroller.timeIntervalsIdxBuffer.boundary <= 0) {

            /**
             * Create Move event.
             * The Move event runs only when the mesh is GRABED. That means that the timeInterval 
             * is created and destroyed upon 'onClickDown' and 'onClickUp' respectively.
             */
            const idx = TimeIntervalsCreate(10, 'Move Widget_Text', TIME_INTERVAL_REPEAT_ALWAYS, scroller.OnMove, scroller);
            scroller.timeIntervalsIdxBuffer.Add(idx);

            if (scroller.StateCheck(MESH_STATE.IS_GRABABLE)) {

               STATE.mesh.SetGrabed(scroller);
               scroller.StateEnable(MESH_STATE.IN_GRAB);
            }

         }
         return true;
      }

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
   Reposition_post(dif_pos) {

      this.MoveXYZ(dif_pos);
      // const scrolled_mesh = this.children.buffer[SCROLL_MESH_IDX];
      // scrolled_mesh.MoveXYZ(dif_pos);
      // const bar = this.children.buffer[SCROLL_BAR_IDX];
      // bar.MoveXYZ(dif_pos);
      const handle = bar.children.buffer[0];
      handle.MoveXYZ(dif_pos);
   }

   /*******************************************************************************************************************************************************/
   // Private Methods 
   #CalculateBarArea(_pos, _dim, pad) {

      // const dim = [_dim[0] - (pad[0] * 2), _dim[1] - (pad[1] * 2)];
      // const dim = [_dim[0] - (pad[0] * 2), _dim[1] - (pad[1] * 2)];
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
      const pos = [_pos[0], _pos[1], _pos[2] + 1]; // Does not need to change for center positioning.

      return {
         pos: pos,
         dim, dim,
      };
   }


}