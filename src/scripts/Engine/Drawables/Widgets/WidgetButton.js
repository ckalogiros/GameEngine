"use strict";

import { Widget_Text_Label } from './WidgetTextLabel.js';

export class Widget_Button extends Widget_Text_Label {

   constructor(text, pos, fontSize = 10, scale = [1, 1], color = WHITE, pad, bold) {
      super(text, pos, fontSize, scale, pad, bold)
      this.type |= MESH_TYPES.BUTTON;
   }

}



