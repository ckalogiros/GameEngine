"use strict";

import { CopyArr3 } from '../../../../Helpers/Math/MathOperations.js';
import { Bind_change_brightness, Bind_change_color_rgb } from '../../../BindingFunctions.js';
import { MouseGetPos, MouseGetPosDif } from '../../../Controls/Input/Mouse.js';
import { FontGetFontDimRatio } from '../../../Loaders/Font/Font.js';
import { Scenes_get_children } from '../../../Scenes.js';
import { TimeIntervalsCreate, TimeIntervalsDestroyByIdx } from '../../../Timers/TimeIntervals.js';
import { Geometry2D } from '../../Geometry/Base/Geometry.js';
import { Material } from '../../Material/Base/Material.js';
import { MESH_ENABLE, Mesh } from '../Base/Mesh.js';
import { Widget_Label_Text_Mesh_Menu_Options } from './WidgetLabelText.js';
import { Widget_Text_Mesh } from './WidgetText.js';

/**
 * Slider's root mesh is a rectangle, that will hold all other meshes as children.
 * 
 * slider.
 * ->bar.
 *    ->handle.
 *    ->text-value.
 * ->text-name.
 * 
 * 
 * TODO: Create a ui slider binding.
 * If slider is onHover and right click event, show a menu of: \
 *    1. slider's binding points.
 *    2. all meshes of the current scene tha can be bound to a slider.
 *    3. all meshe's binding points. 
 * 
 */


export class Widget_Slider extends Mesh {

   constructor(pos, dim, color) {

      const geom = new Geometry2D(pos, dim);
      const mat = new Material(color)

      super(geom, mat);

      this.type |= MESH_TYPES_DBG.WIDGET_SLIDER | geom.type | mat.type;
      this.EnableGfxAttributes(MESH_ENABLE.GFX.ATTR_STYLE);
      this.SetStyle(1, 8, 3);

      /**
       * Slider Bar
       * Bar is child of the slider mesh
       */
      // Calculate the bar's and handle's horizontal pading.
      const ratio = dim[0] / dim[1];
      const pad = [dim[0] * 0.5, dim[1] / 2.8];
      pad[0] /= ratio;

      // Calculate bar's dimentions and position.
      const barpos = [this.geom.pos[0], this.geom.pos[1], this.geom.pos[2]]
      const barMetrics = this.#CalculateBarArea(barpos, this.geom.dim, pad)

      // Create slider_bar mesh 
      const bargeom = new Geometry2D(barMetrics.pos, barMetrics.dim);
      const barmat = new Material(YELLOW_240_240_10)
      const bar = new Mesh(bargeom, barmat);

      bar.type |= MESH_TYPES_DBG.WIDGET_SLIDER_BAR | bargeom | barmat;
      bar.EnableGfxAttributes(MESH_ENABLE.GFX.ATTR_STYLE);
      bar.SetStyle(0, 3, 2);
      bar.StateEnable(MESH_STATE.IS_GRABABLE | MESH_STATE.HAS_HOVER_COLOR | MESH_STATE.HAS_POPUP);
      // bar.StateEnable(MESH_STATE.IS_GRABABLE);
      // bar.StateEnable(MESH_STATE.HAS_HOVER_COLOR)
      bar.CreateListenEvent(LISTEN_EVENT_TYPES.HOVER);
      
      bar.SetName();
      this.AddChild(bar);

      /**
       * Slider Handle
       * Handle is a child of the bar mesh
      */
      pad[1] = dim[1] / 10;
      const handleMetrics = this.#CalculateHandleArea(bargeom.pos, this.geom.dim, pad)

      // Create hndle_bar mesh 
      const handlegeom = new Geometry2D(handleMetrics.pos, handleMetrics.dim);
      const handlemat = new Material(YELLOW_240_220_10)
      const handle = new Mesh(handlegeom, handlemat);

      handle.EnableGfxAttributes(MESH_ENABLE.GFX.ATTR_STYLE);
      handle.StateEnable(MESH_STATE.IS_MOVABLE);
      handle.SetStyle(5, 35, 3);
      handle.type |= MESH_TYPES_DBG.WIDGET_SLIDER_HANDLE | handlegeom | handlemat;
      handle.SetName();

      bar.AddChild(handle); // The handle is added as a child to the bar mesh.

      /**
       * Text Meshes
       * Create slider_name_text and slider_value_text.
       * Text's are children of the slider mesh
       */
      const min_font_size = 7, max_font_size = 10;
      const fontSize = max_font_size < (dim[1] / 3) ? max_font_size : (min_font_size > (dim[1] / 3) ? min_font_size : (dim[1] / 3));
      pos[0] -= this.geom.dim[0];
      pos[1] -= this.geom.dim[1] + fontSize + 4;


      // Create slider_name_text
      const slider_name_text = new Widget_Text_Mesh('Slider', pos, fontSize, [1, 1], GREEN_140_240_10, .4);
      slider_name_text.SetName()
      this.AddChild(slider_name_text);

      pos[0] += this.geom.dim[0] * 2;
      // Create slider_value_text
      const slider_value_text = new Widget_Text_Mesh('0000', pos, fontSize, [1, 1], YELLOW_240_220_10, .4);
      slider_value_text.SetName();
      // Let bar handle the value text, because the mesh bar has the hover listener.
      bar.AddChild(slider_value_text);


      // Make the vertical area of the bar larger for hover and handle moving.
      bar.hoverMargin = handle.geom.dim[1] - bar.geom.dim[1];


      /** Timed Events */
      // Reposition slider's value_text to the left by half it's width.
      const w = slider_value_text.CalcTextWidth()
      const width = w + slider_value_text.geom.dim[0] * 2;
      const params = {

         Clbk: Geometry2D_set_posx,
         params: {
            x: - width,
            mesh: slider_value_text,
         }
      }
      this.timedEvents.Add(params)

      // this.ListenersReconstruct();
   }

   AddToGraphicsBuffer(sceneIdx) {

      /**
       * TODO: Implement an automatic adding to the graphics pipeline.
       */
      const gfx = []
      gfx[0] = super.AddToGraphicsBuffer(sceneIdx);

      const bar = this.children.buffer[0];
      const handle = bar.children.buffer[0];
      gfx[1] = bar.AddToGraphicsBuffer(sceneIdx);
      gfx[2] = handle.AddToGraphicsBuffer(sceneIdx);

      const slider_name_text = this.children.buffer[1];
      gfx[3] = slider_name_text.AddToGraphicsBuffer(sceneIdx);

      // const slider_value_text = this.children.buffer[2];
      const slider_value_text = bar.children.buffer[1];
      gfx[4] = slider_value_text.AddToGraphicsBuffer(sceneIdx);

      return gfx;

   }

   GetOptions() {
      return 'Widget_Slider Options'
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

}

export function Slider_create_dispatch_event(sliderBar) {

   const idx = TimeIntervalsCreate(10, 'Move Mesh', TIME_INTERVAL_REPEAT_ALWAYS, Slider_on_update_handle, sliderBar);
   sliderBar.timeIntervalsIdxBuffer.Add(idx);
}

export function Slider_create_on_click_event(slidermesh, targetToBind, targetClbks) {

   // We need slider's bar, not slider widget.
   const bar = slidermesh.children.buffer[0];
   // bar.CreateEvent(_Slider_create_on_click_event, bar, null);
   bar.CreateEvent({
      params:{
         Clbk: _Slider_create_on_click_event,
         target:  bar,
         targetClbks: null,
      }
   });
   
}

function _Slider_create_on_click_event(params) {

   const sliderBar = params.params.target;
   if (sliderBar.timeIntervalsIdxBuffer.count <= 0) {

      const idx = TimeIntervalsCreate(10, 'Move Mesh', TIME_INTERVAL_REPEAT_ALWAYS, Slider_on_update_handle, sliderBar);
      sliderBar.timeIntervalsIdxBuffer.Add(idx);
   }
}

// export function Slider_connect(slider, target, targetClbk){
export function Slider_connect(params){

   const target = params.params.target1;
   const slider = params.params.target2;
   const Bind_function = params.params.Clbk;
   // Slider_create_on_click_event(slider, null, null);
   // Slider_bind_on_value_change(slider, target, targetClbk);
   // Slider_bind_on_value_change(slider, target, Bind_change_brightness);
   // Slider_bind_on_value_change(slider, target, Bind_function);
   // Slider_bind_on_value_change(params.params.target1, params.params.target2, params.params.Clbk);
   Slider_bind_on_value_change(params.params.target1, params.params.target2, Bind_change_brightness);
   // Slider_bind_on_value_change(slider, target, [Bind_change_brightness, Bind_change_pos_x]);
}

export function Slider_menu_options(clickedMesh, _pos){

   let i = 0;
   let totalHeight = 0;

   const meshes = Scenes_get_children(STATE.scene.idx);

   /** Main Options */
   // 1. 
   const font = MENU_FONT_IDX;
   const fontSize = MENU_FONT_SIZE;
   const topPad = 12, pad = 5;
   const height = fontSize * FontGetFontDimRatio(font);
   const textlabelpad = 2;
   const pos = [0,0,0];
   CopyArr3(pos, _pos); 
   pos[0] += pad+textlabelpad; 
   pos[1] += height+topPad+pad+textlabelpad;
   pos[2] += 1;
   
   totalHeight += height+topPad+pad+textlabelpad;


   const options1 = new Widget_Label_Text_Mesh_Menu_Options(`Mesh id: ${meshes[0].id}`, pos, fontSize, GREY3, WHITE, [1, 1], textlabelpad, .4, font, [2, 3, 2]);
   options1.CreateListenEvent(LISTEN_EVENT_TYPES.HOVER);
   options1.StateEnable(MESH_STATE.HAS_HOVER_COLOR)
   options1.SetName();
   
   i++;
   totalHeight += options1.geom.dim[1] *2;

   const menu = {

      // We shold add a refference to a 
      buffer: [options1],
      maxWidth: options1.geom.dim[0],
      count: i,
      totalHeight: totalHeight,
      Clbk: Slider_connect,
      target1: clickedMesh,
      target2: meshes[1],
   }
   return menu;
} 

export function Slider_on_update_handle(_params) {

   /**
    * The function is called by the timeInterval.
    * The timeInterval has been set by the 'Slider_create_on_click_event',
    * that is called from 'HandleEvents()' 
    * as 'mesh.eventCallbacks.buffer[i].Clbk(target, targetClbks);'
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

   slider_val.UpdateText(val); // Change the text mesh to the current slider's value

   // Run the callback for the sliders target mesh.
   
   const len = bar.eventCallbacks.count;
   if (len) {

      for (let i = 1; i < len; i++) {

         // const Callback = bar.eventCallbacks.buffer[i].Clbk;
         // const target = bar.eventCallbacks.buffer[i].target;
         // const targetClbks = bar.eventCallbacks.buffer[i].targetClbks;
         const Callback    = bar.eventCallbacks.buffer[i].params.Clbk;
         const target      = bar.eventCallbacks.buffer[i].params.target;
         const targetClbks = bar.eventCallbacks.buffer[i].params.targetClbks;
         Callback(target, targetClbks, val)
         // Callback(bar.eventCallbacks.buffer[i].params)
      }
   }

}

export function Slider_bind_on_value_change(sliderBar, targetToBind, targetClbks) {

   // We need slider's bar, not slider widget.
   const bar = sliderBar;
   // bar.CreateEvent(Slider_on_value_change, targetToBind, targetClbks);
   bar.CreateEvent({
      params:{
         Clbk: Slider_on_value_change,
         target:  targetToBind,
         targetClbks: targetClbks,
      }
   });
   
}

export function Slider_on_value_change(params, paramsClbks, sliderVal) {

   /** Set by 'Slider_bind_on_value_change()', called when the slider's bar 'eventCallbacks' buffer will run.
    * Here we set the callbacks that the slider value will be implemented to.
    * 
    * TODO: The literal int 100 represents the slider's
    * value 'width', that is the max value the slider can have all way to the right.
    * We must find a way of passing the max val from the event system, when the 'eventCallbacks' run.
    */

   if (Array.isArray(paramsClbks)) {

      const len = paramsClbks.length;
      for (let i = 0; i < len; i++) {

         paramsClbks[i](params, sliderVal, 100);
      }
   }
   else {

      // params.targetClbks(params, sliderVal, 100);
      paramsClbks(params, sliderVal, 100);
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
   const mesh = params.mesh;
   const x = params.x;
   mesh.Move(x, 0)
}


