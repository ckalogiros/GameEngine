"use strict";

import { AddArr3, CopyArr } from '../../../../Helpers/Math/MathOperations.js';
import { Check_intersection_point_rect } from '../../../Collisions.js';
import { MouseGetPos, MouseGetPosDif } from '../../../Controls/Input/Mouse.js';
import { TimeIntervalsCreate, TimeIntervalsDestroyByIdx } from '../../../Timers/TimeIntervals.js';
import { Geometry2D } from '../../Geometry/Base/Geometry.js';
import { Material } from '../../Material/Base/Material.js';
import { MESH_ENABLE, Mesh } from '../Base/Mesh.js';
import { I_Text, Rect } from '../Rect.js';
import { Section } from '../Section.js';
import { Widget_Label } from './WidgetLabel.js';
import { Widget_popup_handler_onclick_event } from './WidgetPopup.js';
import { Widget_Text } from './WidgetText.js';

/**
 * Slider's tree structure
 * 
 * slider.
 *    ->bar.
 *       ->handle.
 *    ->value-text.
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
      name_text.geom.pos[1] = handle.geom.pos[1] - handle.geom.dim[1] - name_text.geom.dim[1]
      name_text.geom.pos[0] = bar.geom.pos[0] - bar.geom.dim[0] + name_text.geom.dim[0];
      value_text.geom.pos[1] = handle.geom.pos[1] - handle.geom.dim[1] - value_text.geom.dim[1]
      value_text.geom.pos[0] = bar.geom.pos[0] + bar.geom.dim[0] - (value_text.CalcTextWidth() );


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


   OnHover(params) {
      console.log('Slider Hover!!!')
   }

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

   SetPosXYZFromDif(pos_dif){

      const bar = this.children.buffer[BAR_IDX];
      {
         const new_pos = AddArr3(bar.geom.pos, pos_dif)
         bar.SetPosXYZ(new_pos);
      }
      {
         const handle = bar.children.buffer[BAR_IDX];
         const new_pos = AddArr3(handle.geom.pos, pos_dif)
         handle.SetPosXYZ(new_pos);
      }      
      {
         const name_text = this.children.buffer[BAR_IDX+1];
         const new_pos = AddArr3(name_text.geom.pos, pos_dif)
         name_text.SetPosXYZ(new_pos);
      }
      {
         const value_text = bar.children.buffer[1];
         const new_pos = AddArr3(value_text.geom.pos, pos_dif)
         value_text.SetPosXYZ(new_pos);
      }
   }

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

   // const mouse_pos = MouseGetPos();
   // // mouse_pos[0] -= slider.geom.pos[0];
   // // mouse_pos[1] -= slider.geom.pos[1];
   // slider.SetPosXYRecursiveMove(mouse_pos);
   // // slider.SetPos(mouse_pos);

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

   // MESH_STATE.Print(bar.state.mask)
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

function Geometry2D_set_posx(params) {

   /**
    * This function is run as callback from the 'mesh-created' event,
    * to set the slider's value_text mesh position alligned with the 
    * right side of the slider.
    */
   params.mesh.MoveRecursive(params.x, 0)
}


/* * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * *
 * Slider Specific Menu Options - Constructor Functions 
 */

// _cnt = 0;

// const SLIDER_MENU_OPTIONS = {
//    OPTION_1: _cnt++,

//    SIZE: _cnt,
// };

// const _slider_options = []; // Stores the state of the options for the popup menu or any other menu for that matter.

// export function Slider_menu_create_options(clickedMesh, _pos) {

//    /** Main Options */
//    const font = MENU_FONT_IDX;
//    const fontSize = MENU_FONT_SIZE;
//    const topPad = 12, pad = 5;
//    const height = fontSize * FontGetFontDimRatio(font);
//    const textlabelpad = [2, 2];
//    let maxWidth = 0;
//    const options = [];
//    const pos = [0, 0, 0];


//    let totalHeight = 0;

//    CopyArr3(pos, _pos);
//    pos[0] += pad + textlabelpad[0];
//    pos[1] += height + topPad + pad + textlabelpad[1];
//    pos[2] += 1;

//    totalHeight += height + topPad + pad + textlabelpad[1];


//    if (clickedMesh.menu_options.idx > INT_NULL) {

//       const saved = _slider_options[clickedMesh.menu_options.idx];
//       const count = saved.count;
//       for (let i = 0; i < count; i++) {

//          CopyArr3(pos, _pos);
//          pos[0] += pad + textlabelpad[0] + saved.buffer[i].geom.dim[0];
//          pos[1] = saved.buffer[i].geom.pos[1];
         
//          saved.buffer[i].SetPosRecursive(pos);
//       }

//       return _slider_options[clickedMesh.menu_options.idx]
//    }

//    const meshes = Scenes_get_children(STATE.scene.active_idx);

//    for (let i = 0; i < meshes.count; i++) {

//       const mesh = meshes.buffer[i];
//       ERROR_NULL(mesh)

//       if (i === 0)
//          var option = new Widget_Switch(pos, fontSize, GREY3, WHITE, [1, 1], textlabelpad, .4, font, [2, 3, 2]);
//       else
//          var option = new Widget_Label_Text_Mesh_Menu_Options(`Mesh id: ${mesh.id}`, pos, fontSize, GREY3, WHITE, [1, 1], textlabelpad, .4, font, [2, 3, 2]);

//       option.SetName();

//       if (maxWidth < option.geom.dim[0])
//          maxWidth = option.geom.dim[0];

//       CopyArr3(pos, _pos);
//       pos[0] += pad + textlabelpad[0];
//       pos[1] = option.geom.pos[1] + pad + textlabelpad[1] + height * 2 + 2;
//       pos[2] += 1;

//       totalHeight += option.geom.dim[1];

//       options[i] = option;
//    }

//    const menu = {

//       buffer: options,
//       targets: meshes.buffer.slice(0, options.length),
//       maxWidth: maxWidth,
//       count: options.length,
//       totalHeight: totalHeight,
//       params: {

//          targetBindingFunctions: Bind_change_brightness,
//          EventClbk: Slider_connect,
//          clicked_mesh: clickedMesh,
//          target_mesh: null,
//       },
//    }

//    const idx = _slider_options.push(menu);
//    clickedMesh.menu_options.idx = idx - 1; // Store the index of the menu options in the owner mesh.

//    return menu;
// }

