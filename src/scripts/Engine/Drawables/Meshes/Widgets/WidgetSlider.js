"use strict";

import { Bind_change_color_rgb } from '../../../BindingFunctions.js';
import { MouseGetPos, MouseGetPosDif } from '../../../Controls/Input/Mouse.js';
import { TimeIntervalsCreate, TimeIntervalsDestroyByIdx } from '../../../Timers/TimeIntervals.js';
import { Geometry2D } from '../../Geometry/Base/Geometry.js';
import { Material } from '../../Material/Base/Material.js';
import { Geometry2D_set_posx, MESH_ENABLE, Mesh } from '../Base/Mesh.js';
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

      this.type |= MESH_TYPES.WIDGET_SLIDER;
      this.type |= geom.type;
      this.type |= mat.type;

      this.Enable(MESH_ENABLE.ATTR_STYLE);
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

      bar.Enable(MESH_ENABLE.ATTR_STYLE);
      bar.SetStyle(0, 3, 2);
      this.AddChild(bar);

      // Set hover_listener to the bar to be able to move the handle
      bar.state2.mask |= MESH_STATE.IS_MOVABLE;
      bar.CreateListenEvent(LISTEN_EVENT_TYPES.HOVER);
      // Store all type's of drawables tha are instantiated for slider's creation.
      bar.type |= MESH_TYPES.WIDGET_SLIDER_BAR | bargeom | barmat;
      bar.SetName();

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

      handle.Enable(MESH_ENABLE.ATTR_STYLE);
      handle.SetStyle(5, 35, 3);
      handle.type |= MESH_TYPES.WIDGET_SLIDER_HANDLE | handlegeom | handlemat;
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

export function Slider_on_update_handle(_params) {

   /**
    * Callback from Event.js for slider handle move
    */

   const bar = _params.params;
   const handle = bar.children.buffer[0];
   const slider_val = bar.children.buffer[1];

   MESH_STATE.Print(bar.state2.mask)
   if ((bar.state2.mask & MESH_STATE.IN_MOVE) === 0) {

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
   const Callback = bar.eventCallbacks.buffer[0].Clbk;
   const params = bar.eventCallbacks.buffer[0].params;
   const paramsClbks = bar.eventCallbacks.buffer[0].paramsClbks;
   Callback(params, paramsClbks, val)

}


/* * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * *
 * Slider Functionality 
 */

function Slider_move_handle(bar, handle) {

   /** Move the handle acoring to the mouse position */
   const barLeft = bar.geom.pos[0] - bar.geom.dim[0];
   const barRight = bar.geom.pos[0] + bar.geom.dim[0];
   const x = MouseGetPos().x;

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

export function Slider_bind_on_value_change(slidermesh, targetToBind, targetClbks) {

   // We need slider's bar, not slider widget.
   const bar = slidermesh.children.buffer[0];
   bar.CreateEvent(Slider_on_value_change, targetToBind, targetClbks);
}

export function Slider_on_value_change(params, paramsClbks, sliderVal) {

   /** Called by 'Slider_on_update_handle()' */
   // params.SetPosX(val * 2 + 150)

   if(Array.isArray(paramsClbks)){

      const len = paramsClbks.length;
      for(let i=0; i<len; i++){

         paramsClbks[i](params, sliderVal, 100);
      }
   }
   else{

      paramsClbks(params, sliderVal, 100);
   }
   // Bind_change_color_rgb(params, sliderVal, 100);
}

