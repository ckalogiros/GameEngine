"use strict";

import { AddArr3, CopyArr2 } from '../../../../Helpers/Math/MathOperations.js';
import { Check_intersection_point_rect } from '../../../Collisions.js';
import { MouseGetPos, MouseGetPosDif } from '../../../Controls/Input/Mouse.js';
import { TimeIntervalsCreate, TimeIntervalsDestroyByIdx } from '../../../Timers/TimeIntervals.js';
import { MESH_ENABLE } from '../Base/Mesh.js';
import { I_Text, Rect } from '../Rect.js';

import { Widget_popup_handler_onclick_event } from './WidgetPopup.js';


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

export class Widget_Slider extends Rect {

   constructor(pos, dim, color=TRANSPARENCY(GREY1, .6), hover_margin = [0,0]) {

      super(pos, dim, color)

      this.type |= MESH_TYPES_DBG.WIDGET_SLIDER | this.geom.type | this.mat.type;
      this.EnableGfxAttributes(MESH_ENABLE.GFX.ATTR_STYLE);
      this.SetStyle([0, 6, 2]);
      this.SetName('Slider');
      // this.CreateListenEvent(LISTEN_EVENT_TYPES.MOVE, this.OnClick)
      this.StateEnable(MESH_STATE.HAS_POPUP);
      this.CreateListenEvent(LISTEN_EVENT_TYPES.CLICK_DOWN, this.OnClick)
      this.CreateListenEvent(LISTEN_EVENT_TYPES.HOVER)


      // Calculate the bar's and handle's horizontal pading.
      const ratio = dim[0] / dim[1];
      const pad = [dim[0] * 0.5, dim[1] / 2.8];
      pad[0] /= ratio;
      
      /* * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * */
      // Slider Bar: Bar is child of the slider mesh

       // Calculate bar's dimentions and position.
      const barpos = [pos[0], pos[1]+this.geom.dim[1], pos[2]]
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


      /* * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * *
      * Text Meshes
      * Create slider_name_text and slider_value_text.
      * Text's are children of the slider mesh
     */

      // Calculate the font size of the sliders texts, base on the sliders dimentions
      const min_font_size = 4, max_font_size = 10;
      const r = 3;
      const fontSize = max_font_size < (dim[1] / r) ? max_font_size : (min_font_size > (dim[1] / r) ? min_font_size : (dim[1] / r));


      // Create slider_name_text
      const name_text = new I_Text('Slider', pos, fontSize, [1, 1], WHITE, .4);
      name_text.SetName(this.name + ' - name_text')

      // Create value_text
      const value_text = new I_Text('0000', pos, fontSize, [1, 1], WHITE, .4);
      value_text.SetName(this.name + ' - value_text');


      // Make the vertical area of the bar larger for hover and handle moving.
      bar.hover_margin = handle.geom.dim[1]+4;


      // Align
      const totalheight = (handle.geom.dim[1] + name_text.geom.dim[1] + value_text.geom.dim[1]);
      this.geom.dim[1] = totalheight;

      bar.geom.pos[0] = this.geom.pos[0];
      bar.geom.pos[1] = this.geom.pos[1] + this.geom.dim[1]- handle.geom.dim[1] - pad[1];
      
      handle.geom.pos[0] = bar.geom.pos[0];
      handle.geom.pos[1] = bar.geom.pos[1];
   
      value_text.geom.pos[1] = handle.geom.pos[1] - handle.geom.dim[1] - value_text.geom.dim[1]
      value_text.geom.pos[0] = bar.geom.pos[0] + bar.geom.dim[0] - (value_text.CalcTextWidth() );
      value_text.geom.pos[2] = bar.geom.pos[2] + 1;
      
      name_text.geom.pos[1] = handle.geom.pos[1] - handle.geom.dim[1] - name_text.geom.dim[1]
      name_text.geom.pos[0] = bar.geom.pos[0] - bar.geom.dim[0] + name_text.geom.dim[0];
      name_text.geom.pos[2] = this.geom.pos[2] + 1;

      // console.log('slider:', this.geom.pos)
      // console.log('bar:', bar.geom.pos)
      // console.log('bhandlear:', handle.geom.pos)
      // console.log('value:', value_text.geom.pos)
      // console.log('name:', name_text.geom.pos)

      BAR_IDX = this.AddChild(bar)
      this.AddChild(name_text)
      bar.AddChild(handle)
      bar.AddChild(value_text)

   }

   GenGfxCtx(FLAGS, gfxIdx){

      super.GenGfxCtx(FLAGS, gfxIdx);
   }

   AddToGfx(){

      super.AddToGfx()
   }

   SetMenuOptionsClbk(ClbkFunction) {

      const bar = this.children.buffer[BAR_IDX];
      bar.menu_options.Clbk = ClbkFunction;
   }


   Reposition_post(dif_pos){

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


   // OnHover(params) {
   //    console.log('Slider Hover!!!')
   // }

   OnClick(params) {

      const mesh = params.source_params;
      const point = MouseGetPos();
      const m = mesh.geom;

      if (Check_intersection_point_rect(m.pos, m.dim, point, [0, 0])) {

         // Check if the click happened on bar
         const bar = mesh.children.buffer[BAR_IDX];
         if(point[1] > bar.geom.pos[1] - bar.hover_margin){

            STATE.mesh.SetClicked(bar);
            
            if(bar.type & MESH_TYPES_DBG.WIDGET_SLIDER_BAR && bar.StateCheck(MESH_STATE.IS_GRABABLE) && bar.timeIntervalsIdxBuffer.count <= 0){
               
               const idx = TimeIntervalsCreate(10, 'Move Slider Handle', TIME_INTERVAL_REPEAT_ALWAYS, Slider_on_update_handle, bar);
               bar.timeIntervalsIdxBuffer.Add(idx);
               
               STATE.mesh.SetGrabed(bar);
               bar.StateEnable(MESH_STATE.IN_GRAB);
            }

            return true;

         }
         else{ 
            
            STATE.mesh.SetClicked(bar);
            
            // Move Slider
            if(mesh.type & MESH_TYPES_DBG.WIDGET_SLIDER && mesh.StateCheck(MESH_STATE.IS_GRABABLE) && mesh.timeIntervalsIdxBuffer.count <= 0){

               const idx = TimeIntervalsCreate(10, 'Move Slider', TIME_INTERVAL_REPEAT_ALWAYS, Slider_move_event, mesh);
               mesh.timeIntervalsIdxBuffer.Add(idx);
               
               STATE.mesh.SetGrabed(mesh);
               mesh.StateEnable(MESH_STATE.IN_GRAB);
            }
            
            console.log('&777777777777777', mesh.StateCheck(MESH_STATE.HAS_POPUP))
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

   // SetPosXYZFromDif(pos_dif){

   //    const bar = this.children.buffer[BAR_IDX];
   //    {
   //       const new_pos = AddArr3(bar.geom.pos, pos_dif)
   //       bar.SetPosXYZ(new_pos);
   //    }
   //    {
   //       const handle = bar.children.buffer[BAR_IDX];
   //       const new_pos = AddArr3(handle.geom.pos, pos_dif)
   //       handle.SetPosXYZ(new_pos);
   //    }      
   //    {
   //       const name_text = this.children.buffer[BAR_IDX+1];
   //       const new_pos = AddArr3(name_text.geom.pos, pos_dif)
   //       name_text.SetPosXYZ(new_pos);
   //    }
   //    {
   //       const value_text = bar.children.buffer[1];
   //       const new_pos = AddArr3(value_text.geom.pos, pos_dif)
   //       value_text.SetPosXYZ(new_pos);
   //    }
   // }

}

function Slider_move_event(params) {
   /**
    * The function is called by the timeInterval.
    * The timeInterval has been set by the 'OnClick' event.
    */

   const slider = params.params;

   // Destroy the time interval calling this function if the mesh is not grabed.
   if (slider.StateCheck(MESH_STATE.IN_GRAB) === 0) {

      const intervalIdx = slider.timeIntervalsIdxBuffer.buffer[0];// HACK !!!: We need a way to know what interval is what, in the 'timeIntervalsIdxBuffer' in a mesh. 
      TimeIntervalsDestroyByIdx(intervalIdx);
      slider.timeIntervalsIdxBuffer.RemoveByIdx(0); // HACK

      return;
   }

   // Move the mesh
   const mouse_pos = MouseGetPosDif();
   if(mouse_pos.x === 0 && mouse_pos.y === 0) return;
   
   // console.log('MOVING SECTION', slider.name, mouse_pos)
   console.log('MOVING SLIDER', slider.name)
   slider.MoveRecursive(mouse_pos.x, -mouse_pos.y);

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
   // sliderBar.eventCallbacks.Add(params);
   // sliderBar.CreateEvent(params);
   sliderBar.eventCallbacks.Add(params);
   // console.log('Slider bar:', sliderBar.name, sliderBar.eventCallbacks)

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

   if (bar.StateCheck(MESH_STATE.IN_GRAB) === 0) {

      // If bar out of hover, delete the timeInterval for moving the handle
      const intervalIdx = bar.timeIntervalsIdxBuffer.buffer[0];// HACK !!!: We need a way to know what interval is what, in the 'timeIntervalsIdxBuffer' in a mesh. 
      TimeIntervalsDestroyByIdx(intervalIdx);
      bar.timeIntervalsIdxBuffer.RemoveByIdx(0); // HACK

      return;
   }

   Slider_move_handle(bar, handle);

   const val = Slider_calculate_value(bar, handle); // Calculate slider's value based on the handles position.

   slider_val.UpdateTextFromVal(val); // Change the text mesh to the current slider's value
   // console.log('Slider bar:', bar.name, bar.eventCallbacks)
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
   // console.log(`val:${val}, handlexpos:${handlexpos}, barwidth:${barwidth}, barleft:${barleft}`)
   // console.log(sliderVal)

   return sliderVal;
}

// function Geometry2D_set_posx(params) {

//    /**
//     * This function is run as callback from the 'mesh-created' event,
//     * to set the slider's value_text mesh position alligned with the 
//     * right side of the slider.
//     */
//    params.mesh.MoveRecursive(params.x, 0)
// }

