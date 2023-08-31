"use strict";

import { Check_intersection_point_rect } from '../../../Collisions.js';
import { MouseGetPos } from '../../../Controls/Input/Mouse.js';
import { Gfx_generate_context2 } from '../../../Interface/GfxCtx2.js';
import { Widget_Label_Text_Mesh } from './WidgetLabelText.js';

export class Widget_Button_Mesh extends Widget_Label_Text_Mesh {

   constructor(text, pos, fontSize = 10, color = GREY3, colorText = WHITE, scale = [1, 1], pad, bold, font, style) {

      super(text, pos, fontSize, color, colorText, scale, pad, bold, font, style)

      this.type |= MESH_TYPES_DBG.WIDGET_BUTTON;
      this.SetName();

   }

   OnClick(params) {

      const point = MouseGetPos();
      const m = params.source_params.geom;

      if (Check_intersection_point_rect(m.pos, m.dim, point)) {

         console.log('CLICKED!!! Btn:', params.source_params.name);
         STATE.mesh.SetClicked(params.source_params);

         if (params.source_params.eventCallbacks.count) {
            for (let i = 0; i < params.source_params.eventCallbacks.count; i++) {

               const Func = params.source_params.eventCallbacks.buffer[i].Clbk;
               const parameters = params.source_params.eventCallbacks.buffer[i].target;
               Func(parameters);
            }
         }

         return true;
      }

      return false;
   }

   SetZindex(params) {
      params.mesh.children.buffer[0].SetZindex(params.z)
   }

   GenGfxCtx(FLAGS = GFX.ANY, gfxidx = [INT_NULL, INT_NULL]) {


      super.GenGfxCtx(FLAGS = GFX.ANY, gfxidx = [INT_NULL, INT_NULL]);
      // this.gfx = Gfx_generate_context2(this.sid, this.sceneIdx, this.mat.num_faces, FLAGS, gfxidx);



      return this.gfx;
  }

}


export class Widget_Switch_Mesh extends Widget_Button_Mesh {

   isOn;
   state_text;

   constructor(pos, fontSize = 5, color = GREY1, colorText = WHITE, scale, pad = [fontSize, fontSize], bold, font, style = [3, 6, 2]) {

      super('off', pos, fontSize, color, colorText, scale, pad, bold, font, style)

      this.isOn = 0x0;
      this.state_text = ['off', 'on'];
      this.type |= MESH_TYPES_DBG.WIDGET_BUTTON;
      this.SetName('Switch');

   }

   OnClick(params) {

      const mesh = params.source_params;
      const point = MouseGetPos();
      const m = mesh.geom;

      // console.log('click')
      if (Check_intersection_point_rect(m.pos, m.dim, point, [0, 0])) {


         mesh.isOn ^= 0x1;
         mesh.UpdateText(mesh.state_text[mesh.isOn]);
         STATE.mesh.SetClicked(mesh);

         /**
          * For popup menu options and slider connections.
          * If the option is clicked, then we must call the slider connect function
          */
         if (params.target_params) {

            const target_params = {

               targetBindingFunctions: params.target_params.targetBindingFunctions,
               self_mesh: params.target_params.clicked_mesh,
               target_mesh: params.target_params.target_mesh,
               event_type: params.event_type,
                  /*FOR DEBUG*/clicked_mesh: mesh,
            }
            const EventClbk = params.target_params.EventClbk;
            // console.log('OnClick callback IN. meshId ', mesh.id)
            EventClbk(target_params);
            // console.log('OnClick callback OUT. meshId ', mesh.id)
         }

         return true;
      }

      return false;
   }
}
   



