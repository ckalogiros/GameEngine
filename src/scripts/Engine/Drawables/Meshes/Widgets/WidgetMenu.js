"use strict";

import { Geometry2D } from '../../Geometry/Base/Geometry.js';
import { Material } from '../../Material/Base/Material.js';
import { MESH_ENABLE, Mesh } from '../Base/Mesh.js';
import { Widget_Label_Text_Mesh } from './WidgetLabelText.js';

export class Widget_Menu extends Mesh{

   constructor(pos, dim, color) {

      const geom = new Geometry2D(pos, dim);
      const mat = new Material(color)

      super(geom, mat);

      this.type |= MESH_TYPES.WIDGET_MENU;
      this.type |= geom.type;
      this.type |= mat.type;

      this.Enable(MESH_ENABLE.ATTR_STYLE);
      this.SetStyle(6, 4, 3);

      const fontSize = 8;
      pos[0] -= this.geom.dim[0] - 6;
      pos[1] -= this.geom.dim[1] - fontSize *2 - 8;
      pos[2] += 1;
      const option1 = new Widget_Label_Text_Mesh('option 1', pos, fontSize, [1, 1], 2, .4);
      option1.CreateListenEvent(LISTEN_EVENT_TYPES.HOVER);
      option1.CreateEvent(TEMP);
      this.AddChild(option1)
   }

   AddToGraphicsBuffer(sceneIdx){

      const gfx = [0, 0];

      gfx[0] = super.AddToGraphicsBuffer(sceneIdx);

      const option1 = this.children.buffer[0];
      gfx[1] = option1.AddToGraphicsBuffer(sceneIdx);
   }



}

function TEMP(){
   console.log('EVENT TRIGGER!!!')
}