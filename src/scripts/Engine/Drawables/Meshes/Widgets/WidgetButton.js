"use strict";

import { Check_intersection_point_rect } from '../../../Collisions.js';
import { MouseGetPos } from '../../../Controls/Input/Mouse.js';
import { Widget_Label_Text_Mesh } from './WidgetLabelText.js';

export class Widget_Button_Mesh extends Widget_Label_Text_Mesh {

   constructor(text, pos, fontSize = 10, color = GREY3, colorText = WHITE, scale = [1, 1], pad, bold, font, style=[0,0,0]) {

      super(text, pos, fontSize, color, colorText, scale, pad, bold, font, style)

      this.type |= MESH_TYPES_DBG.WIDGET_BUTTON;
      this.SetName();

   }

   OnClick(params){

      const point = MouseGetPos();
      const m = params.self_params.geom;
      
      if(Check_intersection_point_rect(m.pos, m.dim, point)){
          
         console.log('CLICKED!!! Btn:', params.self_params.name);
         // console.log('CLICKED!!! Btn:', params.self_params.name, ' params:', params);
         STATE.mesh.SetClicked(params.self_params);

         if(params.self_params.eventCallbacks.count){
            for(let i=0; i< params.self_params.eventCallbacks.count; i++){

               const Func = params.self_params.eventCallbacks.buffer[i].Clbk;
               const parameters = params.self_params.eventCallbacks.buffer[i].target;
               Func(parameters);            
               // console.log(params.self_params.eventCallbacks.buffer[i])            
            }
         }
      }
   }

   SetZindex(params){
      params.mesh.children.buffer[0].SetZindex(params.z)
   }
}


export class Widget_Switch_Mesh extends Widget_Button_Mesh {

   isOn;
   state_text;

   constructor(pos, fontSize = 5, color = GREY1, colorText = WHITE, scale, pad=[5,7], bold, font, style = [3,6,2]) {

      super('off', pos, fontSize, color, colorText, scale, pad, bold, font, style)
      
      this.isOn = 0x0;
      this.state_text = ['off', 'on'];

      this.type |= MESH_TYPES_DBG.WIDGET_BUTTON;

      this.SetName();
   }

   OnClick(params){

      const theThis = params.self_params;
      const point = MouseGetPos();
      const m = theThis.geom;
      
      if(Check_intersection_point_rect(m.pos, m.dim, point)){
   
         theThis.isOn ^= 0x1;
         theThis.UpdateText(theThis.state_text[theThis.isOn]);

         STATE.mesh.SetClicked(params.self_params);
         console.log('CLICKED!!! Switch:', theThis.isOn)
      }
   }
}



