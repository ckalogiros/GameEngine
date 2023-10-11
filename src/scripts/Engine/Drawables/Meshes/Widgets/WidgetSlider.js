"use strict";

import { AddArr3, CopyArr2 } from '../../../../Helpers/Math/MathOperations.js';
import { Check_intersection_point_rect } from '../../Operations/Collisions.js';
import { MouseGetPos, MouseGetPosDif } from '../../../Controls/Input/Mouse.js';
import { TimeIntervalsCreate, TimeIntervalsDestroyByIdx } from '../../../Timers/TimeIntervals.js';
import { MESH_ENABLE } from '../Base/Mesh.js';
import { Rect } from '../Rect_Mesh.js';
import { Text_Mesh } from '../Text_Mesh.js';

import { Widget_popup_handler_onclick_event } from './WidgetPopup.js';
import { Widget_Label } from './WidgetLabel.js';
import { Gfx_generate_context } from '../../../Interfaces/Gfx/GfxContext.js';
import { Scenes_store_gfx_to_buffer } from '../../../Scenes.js';


/**
 * Slider's tree structure
 * 
 * slider.
 *    ->bar.
 *       -->handle.
 *       -->value-text.
 *    ->name-text.
 * 
 * 
 * TODO: Create a ui slider binding.
 * If slider is onHover and right click event, show a menu of: \
 *    1. slider's binding points.
 *    2. all meshes of the current scene tha can be bound to a slider.
 *    3. all meshe's binding points. 
 * 
 */

let BAR_IDX = INT_NULL;

// export class Widget_Slider extends Widget_Label {
export class Widget_Slider extends Rect {

   text_mesh;

   constructor(pos, dim, col = TRANSPARENCY(GREY1, .6), hover_margin = [0, 0]) {


      // Calculate the bar's and handle's horizontal pading.
      const ratio = dim[0] / dim[1];
      const pad = [dim[0] * 0.5, dim[1] / 2.8];
      pad[0] /= ratio;

      // Calculate the font size of the sliders texts, base on the sliders dimentions
      const min_font_size = 4, max_font_size = 10;
      const r = 3;
      const fontSize = max_font_size < (dim[1] / r) ? max_font_size : (min_font_size > (dim[1] / r) ? min_font_size : (dim[1] / r));


      // Create slider_name_text (it is the text_mesh of the extended Widget_Label class)
      const name_text = new Text_Mesh('Slider', pos, fontSize, WHITE, .4);


      /** Label area mesh */
      super(pos, dim, col);
      this.EnableGfxAttributes(MESH_ENABLE.GFX.ATTR_STYLE);
      this.SetStyle([0, 6, 2]);
      this.SetName('Widget_Slider');
      this.StateEnable(MESH_STATE.HAS_POPUP);
      // this.CreateListenEvent(LISTEN_EVENT_TYPES.CLICK_UP, this.OnClick)
      this.CreateListenEvent(LISTEN_EVENT_TYPES.HOVER)
      this.type |= MESH_TYPES_DBG.WIDGET_SLIDER;


      /* * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * */
      // Slider Bar: Bar is child of the slider mesh

      // Calculate bar's dimentions and position.
      const barpos = [pos[0], pos[1] + this.geom.dim[1], pos[2]]
      const barMetrics = this.#CalculateBarArea(barpos, dim, pad)

      const bar = new Rect(barMetrics.pos, barMetrics.dim, GREY3);

      bar.type |= MESH_TYPES_DBG.WIDGET_SLIDER_BAR | bar.geom | bar.mat;
      bar.EnableGfxAttributes(MESH_ENABLE.GFX.ATTR_STYLE);
      bar.SetStyle([0, 3, 2]);
      bar.StateEnable(MESH_STATE.IS_GRABABLE | MESH_STATE.IS_HOVER_COLORABLE);
      bar.CreateListenEvent(LISTEN_EVENT_TYPES.HOVER)
      bar.SetName('Bar');


      /* * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * */
      // Slider Handle: Handle is a child of the bar mesh

      pad[1] = dim[1] / 10;
      const handleMetrics = this.#CalculateHandleArea(bar.geom.pos, dim, pad)

      const handle = new Rect(handleMetrics.pos, handleMetrics.dim, BLUE_10_120_220);

      handle.type |= MESH_TYPES_DBG.WIDGET_SLIDER_HANDLE | handle.geom | handle.mat;
      handle.EnableGfxAttributes(MESH_ENABLE.GFX.ATTR_STYLE);
      handle.SetStyle([5, 35, 3]);
      handle.StateEnable(MESH_STATE.IS_MOVABLE);
      handle.SetName('handle');


      // Create value_text
      const value_text = new Text_Mesh('0000', pos, fontSize, WHITE, .4);
      value_text.SetName(this.name + ' - value_text');


      // Make the vertical area of the bar larger for hover and handle moving.
      bar.hover_margin = handle.geom.dim[1] + 4;


      /* * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * */
      // Align
      const totalheight = (handle.geom.dim[1] + name_text.geom.dim[1] + value_text.geom.dim[1]);
      this.geom.dim[1] = totalheight;

      bar.geom.pos[0] = this.geom.pos[0];
      bar.geom.pos[1] = this.geom.pos[1] + this.geom.dim[1] - handle.geom.dim[1] - pad[1];

      handle.geom.pos[0] = bar.geom.pos[0];
      handle.geom.pos[1] = bar.geom.pos[1];

      value_text.geom.pos[1] = handle.geom.pos[1] - handle.geom.dim[1] - value_text.geom.dim[1]
      value_text.geom.pos[0] = bar.geom.pos[0] + bar.geom.dim[0] - (value_text.geom.CalcTextWidth());
      value_text.geom.pos[2] = bar.geom.pos[2] + 1;

      name_text.geom.pos[1] = handle.geom.pos[1] - handle.geom.dim[1] - name_text.geom.dim[1]
      name_text.geom.pos[0] = bar.geom.pos[0] - bar.geom.dim[0] + name_text.geom.dim[0];
      name_text.geom.pos[2] = this.geom.pos[2] + 1;

      BAR_IDX = this.AddChild(bar)
      this.AddChild(name_text)
      bar.AddChild(handle)
      bar.AddChild(value_text)

      this.text_mesh = name_text;

   }

   Destroy() {

      const bar = this.children.buffer[BAR_IDX];
      const name_text = this.text_mesh;
      const handle = bar.children.buffer[0];
      const value_text = bar.children.buffer[1];

      value_text.Destroy();
      handle.Destroy();
      name_text.Destroy();
      bar.Destroy();

      // Sliders's rect_mesh destruction
      super.Destroy();
   }

   /*******************************************************************************************************************************************************/
   // Graphics
   GenGfxCtx(FLAGS = GFX.ANY, gfxidx = [INT_NULL, INT_NULL]) {

      this.gfx = Gfx_generate_context(this.sid, this.sceneidx, this.geom.num_faces, FLAGS, gfxidx);
      this.text_mesh.gfx = Gfx_generate_context(this.text_mesh.sid, this.text_mesh.sceneidx, this.text_mesh.geom.num_faces, FLAGS, gfxidx);
      Scenes_store_gfx_to_buffer(this.sceneidx, this);

      const bar = this.children.buffer[BAR_IDX];
      bar.gfx = Gfx_generate_context(bar.sid, bar.sceneidx, bar.geom.num_faces, FLAGS, gfxidx);
      Scenes_store_gfx_to_buffer(bar.sceneidx, bar);
      
      const handle = bar.children.buffer[0];
      handle.gfx = Gfx_generate_context(handle.sid, handle.sceneidx, handle.geom.num_faces, FLAGS, gfxidx);
      Scenes_store_gfx_to_buffer(handle.sceneidx, handle);
      
      const value_text = bar.children.buffer[1];
      value_text.gfx = Gfx_generate_context(value_text.sid, value_text.sceneidx, value_text.geom.num_faces, FLAGS, gfxidx);
      Scenes_store_gfx_to_buffer(value_text.sceneidx, value_text);

      return this.gfx;
   }

   Render() {

      if (!this.is_gfx_inserted) { this.AddToGfx(); this.is_gfx_inserted = true }
      if (!this.text_mesh.is_gfx_inserted) { this.text_mesh.AddToGfx(); this.text_mesh.is_gfx_inserted = true }

      const bar = this.children.buffer[BAR_IDX];
      if (!bar.is_gfx_inserted) { bar.AddToGfx(); bar.is_gfx_inserted = true }

      const handle = bar.children.buffer[0];
      if (!handle.is_gfx_inserted) { handle.AddToGfx(); handle.is_gfx_inserted = true }

      const value_text = bar.children.buffer[1];
      if (!value_text.is_gfx_inserted) { value_text.AddToGfx(); value_text.is_gfx_inserted = true }
   }

   DeactivateGfx() {

      const bar = this.children.buffer[BAR_IDX];
      const name_text = this.text_mesh;
      const handle = bar.children.buffer[0];
      const value_text = bar.children.buffer[1];

      bar.DeactivateGfx();
      name_text.DeactivateGfx();
      handle.DeactivateGfx();
      value_text.DeactivateGfx();
      super.DeactivateGfx()

   }

   /*******************************************************************************************************************************************************/
   // Events
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
      
      const bar = mesh.children.buffer[BAR_IDX];
		bar.geom.MoveXY(mouse_pos.x, -mouse_pos.y, bar.gfx);
      const name_text = mesh.text_mesh;
		name_text.geom.MoveXY(mouse_pos.x, -mouse_pos.y, name_text.gfx);
      const handle = bar.children.buffer[0];
		handle.geom.MoveXY(mouse_pos.x, -mouse_pos.y, handle.gfx);
      const value_text = bar.children.buffer[1];
		value_text.geom.MoveXY(mouse_pos.x, -mouse_pos.y, value_text.gfx);

	}

   CreateMoveHandleEvent(parent_event) {

      const handle = this.children.buffer[0];

      if(handle.listeners.buffer[LISTEN_EVENT_TYPES_INDEX.CLICK] === INT_NULL)
         this.CreateListenEvent(LISTEN_EVENT_TYPES.CLICK_UP, this.OnClick, parent_event);

   }
   CreateMoveSliderEvent() {

      this.CreateListenEvent(LISTEN_EVENT_TYPES.CLICK_UP, this.OnClick);
      this.StateEnable(MESH_STATE.IS_GRABABLE);

   }


   /*******************************************************************************************************************************************************/
   // Setters-Getters

   /** Return type: Array. Returns an array of all widgets meshes */
   GetAllMeshes(parent_meshes_buf) {

      // If a parent mesh called this method, all_meshes buffer should include the parents all_meshes (put at the start of the buffer)
      const all_meshes = parent_meshes_buf ? parent_meshes_buf : [];

      all_meshes.push(this);
      all_meshes.push(this.text_mesh);

      const bar = this.children.buffer[BAR_IDX];
      all_meshes.push(bar);
      const handle = bar.children.buffer[0];
      all_meshes.push(handle);
      const value_text = bar.children.buffer[1];
      all_meshes.push(value_text);

      return all_meshes;
   }

   SetMenuOptionsClbk(ClbkFunction) {

      const bar = this.children.buffer[BAR_IDX].children.buffer[0];
      bar.menu_options.Clbk = ClbkFunction;
   }

   /*******************************************************************************************************************************************************/
   // Alignment
   Reposition_post(dif_pos) {

      this.MoveXYZ(dif_pos);
      const bar = this.children.buffer[0];
      bar.MoveXYZ(dif_pos);
      const handle = bar.children.buffer[0];
      handle.MoveXYZ(dif_pos);
      const value = bar.children.buffer[1];
      value.MoveXYZ(dif_pos);
      const name = this.children.buffer[1];
      name.MoveXYZ(dif_pos);
   }

   /** Private Methods */
   #CalculateBarArea(_pos, _dim, pad) {

      const dim = [_dim[0] - (pad[0] * 2), _dim[1] - (pad[1] * 2)];
      // const pos = [_pos[0] + pad[0], _pos[1] + pad[1]];
      const pos = [_pos[0], _pos[1], _pos[2] + 1]; // Does not need to change for center positioning.

      return {
         pos: pos,
         dim, dim,
      };
   }
   #CalculateHandleArea(_pos, _dim, pad) {

      const dim = [0, _dim[1] - (pad[1] * 2)];
      dim[0] = dim[1];
      const pos = [_pos[0], _pos[1], _pos[2] + 1]; // Does not need to change for center positioning.

      return {
         pos: pos,
         dim, dim,
      };
   }

   // TODO!!!: the widget is passed in 'params.target_params.target_mesh', so REMOVE the 'params.source_params' tha has the slider.area_mesh is not needed. 
   OnClick(params) {

      const mesh = params.target_params.target_mesh;
      // const mesh = widg.area_mesh;
      const point = MouseGetPos();
      const g = mesh.geom;

      if (Check_intersection_point_rect(g.pos, g.dim, point, [0, 0])) {

         // Check if the click happened on bar
         const bar = mesh.children.buffer[BAR_IDX];
         if (point[1] > bar.geom.pos[1] - bar.hover_margin) { // TODO!!! The only thing currently that seperates handle-move from slider-move is the fact that this if fails for 'hover_margin=0'. Create a more apropriate check.

            STATE.mesh.SetClicked(bar);

            if (bar.type & MESH_TYPES_DBG.WIDGET_SLIDER_BAR && bar.StateCheck(MESH_STATE.IS_GRABABLE) && bar.timeIntervalsIdxBuffer.boundary <= 0) {

               const idx = TimeIntervalsCreate(10, 'Move Slider Handle', TIME_INTERVAL_REPEAT_ALWAYS, Slider_on_update_handle, bar);
               bar.timeIntervalsIdxBuffer.Add(idx);

               STATE.mesh.SetGrabed(bar);
               bar.StateEnable(MESH_STATE.IN_GRAB);
            }

            return true;

         }
         else {

            STATE.mesh.SetClicked(bar);

            // Move Slider 
            if ((mesh.type & MESH_TYPES_DBG.WIDGET_SLIDER) && mesh.StateCheck(MESH_STATE.IS_GRABABLE) && mesh.timeIntervalsIdxBuffer.boundary <= 0) {

               const idx = TimeIntervalsCreate(10, 'Move Slider', TIME_INTERVAL_REPEAT_ALWAYS, Slider_move_event, mesh);
               mesh.timeIntervalsIdxBuffer.Add(idx);

               STATE.mesh.SetGrabed(mesh);
               mesh.StateEnable(MESH_STATE.IN_GRAB);
            }

            // Handle any menu (on leftClick only)
            if (mesh.StateCheck(MESH_STATE.HAS_POPUP)) {

               const btnId = params.trigger_params;
               Widget_popup_handler_onclick_event(mesh, btnId)
            }
            return true;
         }
      }
      return false;
   }
}

function Slider_move_event(params) {
   /**
    * The function is called by the timeInterval.
    * The timeInterval has been set by the 'OnClick' event.
    */

   const slider = params.params;

   // Destroy the time interval calling this function if the mesh is not grabed.
   if (slider.StateCheck(MESH_STATE.IN_GRAB) === 0 && slider.timeIntervalsIdxBuffer.boundary) {

      const intervalIdx = slider.timeIntervalsIdxBuffer.buffer[0];// HACK !!!: We need a way to know what interval is what, in the 'timeIntervalsIdxBuffer' in a mesh. 
      TimeIntervalsDestroyByIdx(intervalIdx);
      slider.timeIntervalsIdxBuffer.RemoveByIdx(0); // HACK

      return;
   }

   // Move the mesh
   const mouse_pos = MouseGetPosDif();
   if (mouse_pos.x === 0 && mouse_pos.y === 0) return;

   // console.log('MOVING SECTION', slider.name, mouse_pos)
   console.log('MOVING SLIDER', slider.name)

   slider.MoveXY(mouse_pos.x, -mouse_pos.y);
   const bar = slider.children.buffer[0];
   bar.MoveXY(mouse_pos.x, -mouse_pos.y);
   const handle = bar.children.buffer[0];
   handle.MoveXY(mouse_pos.x, -mouse_pos.y);
   const value = bar.children.buffer[1];
   value.MoveXY(mouse_pos.x, -mouse_pos.y);
   const name = slider.children.buffer[1];
   name.MoveXY(mouse_pos.x, -mouse_pos.y);

}

export function Slider_connect(_params) {

   const sliderBar = _params.self_mesh.children.buffer[BAR_IDX];
   const target = _params.target_mesh;
   const Binding_function = _params.targetBindingFunctions;

   /*FOR DEBUG*/const clicked_mesh = _params.clicked_mesh

   // Check if the connection already exists
   for (let i = 0; i < sliderBar.eventCallbacks.count; i++) {

      if (sliderBar.eventCallbacks.buffer[i] !== null) {

         var newTargetId = _params.target_mesh.id;
         var existingTargetId = sliderBar.eventCallbacks.buffer[i].target.id;

         // The connection already exists
         if (newTargetId === existingTargetId) {

            console.log('Disconnecting target:', sliderBar.eventCallbacks.buffer[i].target.name, ' clicked:', STATE.mesh.clickedId);
            /*FOR DEBUG*/clicked_mesh.SetColor(RED)

            // Disconnect
            sliderBar.eventCallbacks.RemoveByIdx(i);
            return;
         }
      }

   }

   console.log('Connecting target:', target.name, ' clicked:', STATE.mesh.clickedId);
   /*FOR DEBUG*/clicked_mesh.SetColor(GREEN)

   const params = {
      target: target,
      Clbk: Binding_function,
   }
   sliderBar.eventCallbacks.Add(params);

}

export function Slider_bind_on_value_change(sliderBar, target, Clbk) {

   const params = {
      target: target,
      Clbk: Binding_function,
   }
   sliderBar.eventCallbacks.Add(params);

}

export function Slider_on_update_handle(_params) {

   /**
    * The function is called by the timeInterval.
    * The timeInterval has been set by the 'Slider_create_on_click_event',
    * that is called from 'HandleEvents()' 
    * as 'mesh.eventCallbacks.buffer[i].Clbk(target, Clbk);'
    * The 'HandleEvents()' passes the param '_params' to this function.
    */

   const bar = _params.params;
   const handle = bar.children.buffer[0];
   const slider_val = bar.children.buffer[1];

   if (bar.StateCheck(MESH_STATE.IN_GRAB) === 0 && bar.timeIntervalsIdxBuffer.boundary) {

      // If bar out of hover, delete the timeInterval for moving the handle
      const intervalIdx = bar.timeIntervalsIdxBuffer.buffer[0];// HACK !!!: We need a way to know what interval is what, in the 'timeIntervalsIdxBuffer' in a mesh. 
      TimeIntervalsDestroyByIdx(intervalIdx);
      bar.timeIntervalsIdxBuffer.RemoveByIdx(0); // HACK

      return;
   }

   Slider_move_handle(bar, handle);

   const val = Slider_calculate_value(bar, handle); // Calculate slider's value based on the handles position.

   slider_val.UpdateText(val); // Change the text mesh to the current slider's value

   /**
    * Dispatch all callbacks for all targets, that is
    * found on every eventCallbacks[] buffer.  
    */
   if (bar.eventCallbacks.count) {
      for (let i = 0; i < bar.eventCallbacks.count; i++) {

         if (bar.eventCallbacks.buffer[i] !== null) {

            const target = bar.eventCallbacks.buffer[i].target;
            const TargetClbk = bar.eventCallbacks.buffer[i].Clbk;
            TargetClbk(target, val, 100);
         }
      }
   }

}


/* * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * *
 * Slider Functionality 
 */

function Slider_move_handle(bar, handle) {

   /** Move the handle acoring to the mouse position */
   const barLeft = bar.geom.pos[0] - bar.geom.dim[0];
   const barRight = bar.geom.pos[0] + bar.geom.dim[0];
   const x = MouseGetPos()[0];

   if (x > barLeft && x < barRight)
      handle.geom.SetPosX(x, handle.gfx)

   else if (x > barRight)
      handle.geom.SetPosX(barRight, handle.gfx)

   else if (x < barLeft)
      handle.geom.SetPosX(barLeft, handle.gfx)

   return true;
}

function Slider_calculate_value(bar, handle) {

   const handlexpos = handle.geom.pos[0];
   const barwidth = bar.geom.dim[0] * 2;
   const barleft = bar.geom.pos[0] - bar.geom.dim[0];

   const val = handlexpos - barleft;

   const max = 100; // Set the max value the slider will interpolate to.
   // Interpolate to a 0-max value.
   const sliderVal = (val * max) / (barwidth);

   return sliderVal;
}


