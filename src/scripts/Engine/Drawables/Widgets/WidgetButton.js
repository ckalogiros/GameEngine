"use strict";

import { Widget_Label_Text } from './WidgetLabelText.js';

export class Widget_Button extends Widget_Label_Text {

   constructor(text, pos, fontSize = 10, scale = [1, 1], color = WHITE, pad, bold) {
      super(text, pos, fontSize, scale, pad, bold)
      this.type |= MESH_TYPES.BUTTON;
   }

}



