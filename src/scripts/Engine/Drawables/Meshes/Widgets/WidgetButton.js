"use strict";

import { Widget_Label_Text_Mesh } from './WidgetLabelText.js';

export class Widget_Button_Mesh extends Widget_Label_Text_Mesh {

   constructor(text, pos, fontSize = 10, scale = [1, 1], color = WHITE, pad, bold) {
      super(text, pos, fontSize, scale, pad, bold)
      this.type |= MESH_TYPES.WIDGET_BUTTON;
   }

}



