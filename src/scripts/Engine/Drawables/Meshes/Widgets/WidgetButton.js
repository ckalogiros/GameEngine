"use strict";

import { Widget_Label } from './WidgetLabel.js';



export class Widget_Button extends Widget_Label {

   constructor(text, Align = (ALIGN.HOR_CENTER | ALIGN.VERT_CENTER), pos = [200, 300, 0], fontSize = 4.4, col = GREY1, textCol = WHITE, pad = [10, 5], bold = .4, style = [0, 6, 2], font = TEXTURES.SDF_CONSOLAS_LARGE) {

      super(text, Align, pos, fontSize, col, textCol, pad, bold, style, font)

      this.type |= MESH_TYPES_DBG.WIDGET_BUTTON;

   }

}

export class Widget_Switch extends Widget_Button {

   isOn;
   state_text;

   constructor(text_on, text_off, pos, fontSize = 5, color = GREY1, colorText = WHITE, pad = [fontSize, fontSize], bold, style = [3, 6, 2], font) {

      super(text_off, (ALIGN.HOR_CENTER | ALIGN.VERT_CENTER), pos, fontSize, color, colorText, pad, bold, style, font)

      this.isOn = 0x0;
      this.state_text = [text_off, text_on];
      this.type |= MESH_TYPES_DBG.WIDGET_BUTTON;
      this.SetName('Switch');

   }

   /*******************************************************************************************************************************************************/
   // Events
   /**
     * @param {*} event_type typeof 'LISTEN_EVENT_TYPES'
     * @param {*} Clbk          User may choose the callback for the
     */
   CreateListenEvent(event_type, Clbk = null, target_params = null) {

      if (Clbk && target_params) { this.AddEventListener(event_type, Clbk, target_params); return; }
      if (Clbk) {this.AddEventListener(event_type, Clbk, this); return;};
      this.AddEventListener(event_type, this.OnClick, this); return;
   }

   OnClick(params) {

      const mesh = params.target_params.target_mesh;
      const text_mesh = mesh.text_mesh;
      console.log('Switch: ', mesh.state_text[mesh.isOn])

      mesh.isOn ^= 0x1;
      text_mesh.UpdateText(mesh.state_text[mesh.isOn]);
      STATE.mesh.SetClicked(mesh);

      /**
       * For popup menu options and slider connections.
       * If the option is clicked, then we must call the slider connect function
       */

      if (params.target_params.EventClbk) {

         const EventClbk = params.target_params.EventClbk;
         console.log('Widget_Switch-OnClick()');
         EventClbk(params.target_params);
      }

      return true;
   }

   /*******************************************************************************************************************************************************/
   // Misc
   Bind(EventClbk, targetBindingFunctions, params) {

      const target_params = {
         EventClbk: EventClbk,
         targetBindingFunctions: targetBindingFunctions,
         target_mesh: this,
         params: params,
      }

      this.CreateListenEvent(LISTEN_EVENT_TYPES.CLICK_DOWN, this.OnClick, target_params)
   }
}




