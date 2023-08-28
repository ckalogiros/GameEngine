"use strict";

import { Geometry2D } from "../../../Geometry/Base/Geometry.js";
import { Material } from "../../../Material/Base/Material.js";
import { MESH_ENABLE, Mesh } from "../../Base/Mesh.js";
import { Widget_Button_Mesh } from "../WidgetButton.js";



export class Widget_Menu_Bar extends Mesh{

   constructor(text, pos, dim, col = GREY3, textCol = WHITE, scale = [1, 1], pad = [0, 0], bold = .4, font = TEXTURES.SDF_CONSOLAS_LARGE, style = [2, 5, 2]){

      const areageom = new Geometry2D(pos, dim, scale);
      const areamat = new Material(col)

      super(areageom, areamat);

      this.EnableGfxAttributes(MESH_ENABLE.GFX.ATTR_STYLE);
      this.SetStyle(style[0], style[1], style[2]);

   }

   AddCloseButton(text, pos, fontSize, col = GREY3, textCol = WHITE, scale = [1, 1], pad = [0, 0], bold = .4, font = TEXTURES.SDF_CONSOLAS_LARGE, style = [6, 5, 3]){
      
      pos[2] += 1; // Put in front of the bar.

      const btn = new Widget_Button_Mesh(text, pos, fontSize, col, textCol, scale, pad, bold, font, style);
      btn.Align_pre(this, ALIGN.VERT_CENTER | ALIGN.RIGHT);

      const params = {
         target: this,
         Clbk: this.Destroy,
      }
      btn.eventCallbacks.Add(params);

      this.AddChild(btn);
      
      btn.CreateListenEvent(LISTEN_EVENT_TYPES.CLICK_DOWN, btn.OnClick, btn);
   }

   Destroy(target){
      target.RecursiveDestroy()
      console.log('DESTROY!!!')
   }

   GenGfx() {

      const gfx = []
      gfx[0] = super.GenGfx();

      for(let i=0; i<this.children.count; i++){

         const child = this.children.buffer[i];
         child.GenGfx();
      }

      return gfx;
   }
} 