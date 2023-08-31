"use strict";

import { Check_intersection_point_rect } from "../../../../Collisions.js";
import { MouseGetPos } from "../../../../Controls/Input/Mouse.js";
import { Gfx_activate, Gfx_deactivate, Gfx_end_session, Request_private_gfx_ctx } from "../../../../Interface/GfxContext.js";
import { Geometry2D } from "../../../Geometry/Base/Geometry.js";
import { MESH_ENABLE, Mesh, } from "../../Base/Mesh.js";
import { Widget_Button_Mesh } from "../WidgetButton.js";



export class Widget_Menu_Bar extends Mesh{

   constructor(text, pos, dim, col = GREY3, textCol = WHITE, scale = [1, 1], pad = [0, 0], bold = .4, font = TEXTURES.SDF_CONSOLAS_LARGE, style = [2, 5, 2]){

      const areageom = new Geometry2D(pos, dim, scale);
      const areamat = new Material(col)

      super(areageom, areamat);

      this.EnableGfxAttributes(MESH_ENABLE.GFX.ATTR_STYLE);
      this.SetStyle(style);

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
      
      btn.CreateListenEvent(LISTEN_EVENT_TYPES.CLICK_DOWN, btn.OnClick);
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


export class Widget_Minimize extends Widget_Button_Mesh{

   restore_pos;
   toggle;
   minimized_mesh;
   
   constructor(pos, fontSize, col=GREY3, text_col, scale, pad=[6, 2], bold=.5, font, style=[0, 4, 1.8]){
      
      
      super('-', pos, fontSize, TRANSPARENCY(col, .05), text_col, scale, pad, bold, font, style);
      
      this.restore_pos = [0,0,0];
      this.toggle = false;
      this.minimized_mesh = null;

   }

   OnClick(params){

      const mesh = params.source_params;
      const point = MouseGetPos();
      const m = mesh.geom;
      
      // console.log('click')
      if (Check_intersection_point_rect(m.pos, m.dim, point, [0, 0])) {
         
         console.log('I am a Minimizer button:', this.name, this.parent)

         // mesh.isOn ^= 0x1;
         // mesh.UpdateText(mesh.state_text[mesh.isOn]);
         STATE.mesh.SetClicked(mesh);


         if(mesh.parent){
   
            console.log(mesh.parent.name)
            // Remove parent from the render buffers: Choose a way todo this.
            // Remove any parent listeners?? Yes so the parent doe not interfere with the scene
            // Store the current positions, if necessary.
            // Replace with this minimizer plus some parents discriptive text.
            // Move the minimized widget to the bottom of the screen?? OR leave it at the current position.

            if(!mesh.toggle){

               Gfx_deactivate(mesh); // Recursively deactivates the private buffers of popup and all its options 
               // mesh.RemoveChildren();
               // mesh.RemoveAllListenEvents()
               // mesh.children.buffer[0].RemoveAllListenEvents()
               mesh.children.buffer[0].CreateListenEvent(LISTEN_EVENT_TYPES.CHOVER)
               mesh.toggle = true;

               mesh.minimized_mesh = new Widget_Button_Mesh('Minimized', mesh.geom.pos, 3, mesh.mat.col, WHITE);
               mesh.minimized_mesh.SetName('minimized_mesh')
               Request_private_gfx_ctx(mesh.minimized_mesh, GFX_CTX_FLAGS.INACTIVE | GFX_CTX_FLAGS.PRIVATE, INT_NULL, INT_NULL);
               console.log(mesh.gfx)
               Gfx_end_session(true);
            }
            else{
               
               Gfx_activate(mesh); // Recursively deactivates the private buffers of popup and all its options 
               // mesh.children.buffer[0].CreateListenEvent(LISTEN_EVENT_TYPES.CLICK_DOWN, mesh.OnClick)
               mesh.CreateListenEvent(LISTEN_EVENT_TYPES.CHOVER)
               mesh.toggle = false;
            }
         }

         return true;
      }

      return false;
   }
}