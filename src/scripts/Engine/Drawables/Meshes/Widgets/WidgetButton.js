"use strict";

import { Check_intersection_point_rect } from '../../../Collisions.js';
import { MouseGetPos } from '../../../Controls/Input/Mouse.js';
import { Widget_Label } from './WidgetLabel.js';



export class Widget_Button extends Widget_Label {

   constructor(text, Align=(ALIGN.HOR_CENTER | ALIGN.VERT_CENTER), pos, fontSize = 10, color = BLUE_10_120_220, colorText = WHITE, scale = [1, 1], pad, bold, font, style) {

      super(text, Align, pos, fontSize, color, colorText, scale, pad, bold, font, style)

      this.type |= MESH_TYPES_DBG.WIDGET_BUTTON;
      this.SetName(text);

   }
   
   GenGfxCtx(FLAGS=GFX.ANY, gfxIdx){

      super.GenGfxCtx(FLAGS, gfxIdx);
      return this.gfx;
   }

   AddToGfx(){

      super.AddToGfx()
   }

   OnClick(params) {

      const point = MouseGetPos();
      const m = params.source_params.geom;
      let ret = false;

      if (Check_intersection_point_rect(m.pos, m.dim, point)) {

         // console.log('CLICKED!!! Btn:', params.source_params.name);
         STATE.mesh.SetClicked(params.source_params);

         if (params.source_params.eventCallbacks.count) {
            for (let i = 0; i < params.source_params.eventCallbacks.count; i++) {

               const Func = params.source_params.eventCallbacks.buffer[i].Clbk;
               const parameters = {
                  source_params: params.source_params.eventCallbacks.buffer[i].source_params,
                  target_params: params.source_params.eventCallbacks.buffer[i].target_params,
               }
               ret = Func(parameters);
            }
         }
      }

      return ret;
   }

   SetZindex(params) {
      params.mesh.children.buffer[0].SetZindex(params.z)
   }

}

export class Widget_Switch extends Widget_Button {

   isOn;
   state_text;

   constructor(text_on, text_off, pos, fontSize = 5, color = GREY1, colorText = WHITE, pad = [fontSize, fontSize], bold, font, style = [3, 6, 2], scale) {

      super(text_off, (ALIGN.HOR_CENTER|ALIGN.VERT_CENTER), pos, fontSize, color, colorText, scale, pad, bold, font, style)

      this.isOn = 0x0;
      this.state_text = [text_off, text_on];
      this.type |= MESH_TYPES_DBG.WIDGET_BUTTON;
      this.SetName('Switch');

   }

   OnClick(params) {

      const mesh = params.source_params;

      mesh.isOn ^= 0x1;
      mesh.UpdateText(mesh.state_text[mesh.isOn]);
      STATE.mesh.SetClicked(mesh);

      /**
       * For popup menu options and slider connections.
       * If the option is clicked, then we must call the slider connect function
       */

      if (params.target_params) {

         // const target_params = {

         //    targetBindingFunctions: params.target_params.targetBindingFunctions,
         //    self_mesh: params.target_params.clicked_mesh,
         //    target_mesh: params.target_params.target_mesh,
         //    event_type: params.event_type,
         //       /*FOR DEBUG*/clicked_mesh: mesh,
         // }
         const EventClbk = params.target_params.EventClbk;
         console.log('OnClick callback IN. meshId ', mesh.id)
         // EventClbk(target_params);
         EventClbk(params.target_params);
         // console.log('OnClick callback OUT. meshId ', mesh.id)
      }

      return true;
   }

   Bind(EventClbk, targetBindingFunctions, _params){

      const target_params = {
         EventClbk: EventClbk,
         targetBindingFunctions: targetBindingFunctions,
         clicked_mesh: this,
         target_mesh: null,
         params: _params,
      }
      
      this.CreateListenEvent(LISTEN_EVENT_TYPES.CLICK_DOWN, this.OnClick, target_params)
   }
}




