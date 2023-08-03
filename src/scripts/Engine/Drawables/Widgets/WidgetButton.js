"use strict";

import { Widget_Text_Label } from './WidgetTextLabel.js';

export class Widget_Button extends Widget_Text_Label {

   constructor(text, pos, fontSize=10, scale=[1,1], color=WHITE,  padding=10, boldness=4) {
      super(text, pos, fontSize, scale)
      this.type |= MESH_TYPES.BUTTON;
   }

   CheckHover() {
      super.CheckHover();
   }

   OnHover(){
      console.log('Button OnHover()')
   }

}