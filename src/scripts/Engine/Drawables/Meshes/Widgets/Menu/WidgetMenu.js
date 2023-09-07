"use strict";

import { Check_intersection_point_rect } from "../../../../Collisions.js";
import { MouseGetPos } from "../../../../Controls/Input/Mouse.js";
import { M_Buffer } from "../../../../Core/Buffers.js";
import { Listener_debug_print_all } from "../../../../Events/EventListeners.js";
import { Gfx_activate, Gfx_deactivate, Gfx_deactivate_no_listeners_touch, Gfx_end_session } from "../../../../Interfaces/GfxContext.js";
import { Geometry2D } from "../../../Geometry/Base/Geometry.js";
import { MESH_ENABLE, Mesh, Remove_event_listeners_no_member_listeners_touch_recursive, } from "../../Base/Mesh.js";
import { Widget_Button } from "../WidgetButton.js";
import { Widget_Label } from "../WidgetLabel.js";



export class Widget_Menu_Bar extends Mesh {

   constructor(text, pos, dim, col = GREY3, textCol = WHITE, scale = [1, 1], pad = [0, 0], bold = .4, font = TEXTURES.SDF_CONSOLAS_LARGE, style = [2, 5, 2]) {

      const areageom = new Geometry2D(pos, dim, scale);
      const areamat = new Material(col)

      super(areageom, areamat);

      this.EnableGfxAttributes(MESH_ENABLE.GFX.ATTR_STYLE);
      this.SetStyle(style);

   }

   AddCloseButton(text, pos, fontSize, col = GREY3, textCol = WHITE, scale = [1, 1], pad = [0, 0], bold = .4, font = TEXTURES.SDF_CONSOLAS_LARGE, style = [6, 5, 3]) {

      pos[2] += 1; // Put in front of the bar.

      const btn = new Widget_Button(text, pos, fontSize, col, textCol, scale, pad, bold, font, style);
      btn.Align_pre(this, ALIGN.VERT_CENTER | ALIGN.RIGHT);

      const params = {
         target: this,
         Clbk: this.Destroy,
      }
      btn.eventCallbacks.Add(params);

      this.AddChild(btn);

      btn.CreateListenEvent(LISTEN_EVENT_TYPES.CLICK_DOWN, btn.OnClick);
   }

   Destroy(target) {
      target.RecursiveDestroy()
      console.log('DESTROY!!!')
   }

   GenGfxCtx(FLAGS, gfxidx) {

      const gfx = []
      gfx[0] = super.GenGfxCtx(FLAGS, gfxidx);

      for (let i = 0; i < this.children.count; i++) {

         const child = this.children.buffer[i];
         child.GenGfxCtx(FLAGS, gfxidx);
      }

      return gfx;
   }
}
