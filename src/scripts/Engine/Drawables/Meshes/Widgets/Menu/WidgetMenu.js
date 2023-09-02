"use strict";

import { GlResetIndexBuffer, GlResetVertexBuffer } from "../../../../../Graphics/Buffers/GlBuffers.js";
import { Check_intersection_point_rect } from "../../../../Collisions.js";
import { MouseGetPos } from "../../../../Controls/Input/Mouse.js";
import { M_Buffer } from "../../../../Core/Buffers.js";
import { Listener_debug_print_all } from "../../../../Events/EventListeners.js";
import { Gfx_activate, Gfx_deactivate, Gfx_deactivate_no_listeners_touch, Gfx_deactivate_no_member_listeners_touch, Gfx_end_session } from "../../../../Interface/GfxContext.js";
import { Geometry2D } from "../../../Geometry/Base/Geometry.js";
import { MESH_ENABLE, Mesh, Remove_event_listeners_no_member_listeners_touch_recursive, } from "../../Base/Mesh.js";
import { I_Text } from "../../Rect.js";
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


export class Widget_Minimize extends Widget_Button {

   restore_pos;
   toggle;
   temp;

   constructor(pos, fontSize, col = GREY3, text_col, scale, pad = [6, 2], bold = .5, font, style = [0, 4, 1.8]) {


      super('-', pos, fontSize, TRANSPARENCY(col, .05), text_col, scale, pad, bold, font, style);

      this.restore_pos = [0, 0, 0];
      this.toggle = false;
      this.temp = null;

   }

   OnClick(params) {

      const mesh = params.source_params;
      const point = MouseGetPos();
      const m = mesh.geom;

      // console.log('click')
      if (Check_intersection_point_rect(m.pos, m.dim, point, [0, 0])) {

         console.log('I am a Minimizer button:', mesh.name, mesh.parent.name)

         // mesh.isOn ^= 0x1;
         // mesh.UpdateText(mesh.state_text[mesh.isOn]);
         STATE.mesh.SetClicked(mesh);


         if (mesh.parent) {

            const parent = mesh.parent;
            // Remove parent from the render buffers: Choose a way todo this.
            // Remove any parent listeners?? Yes so the parent does not interfere with the scene
            // Store the current positions, if necessary.
            // Replace with this minimizer plus some parents discriptive text.
            // Move the minimized widget to the bottom of the screen?? OR leave it at the current position.

            if (!mesh.toggle) {

               /**
                * Deactivating the rendering of the vertex buffer is rather ineficient
                * because we are gonna use the same (root's mesh gfx) vertex buffer for
                * the minimized mesh.
                * TODO: Reset the vertex buffer and index buffer
                * AND set the root's 'gfx.isActive' in Gfx_pool buffer to false,
                * so that the 'GenGfxCtx(GFX.PRIVATE)' function call will be able
                * to find this deactivated private buffer for reuse.
               */

               mesh.temp = new M_Buffer;
               mesh.temp.Init(parent.children.size)
               for (let i = 0; i < parent.children.count; i++){
                  mesh.temp.buffer[i] = parent.children.buffer[i];
               }
               mesh.temp.count = parent.children.count;
               mesh.temp.active_count = parent.children.active_count;
               mesh.temp.size = parent.children.size;

               Gfx_deactivate_no_listeners_touch(parent); // Reset root mesh(top parent) vertex and index buffers. Also removes all listeners(NOT wanted, FIX) 
               // Gfx_deactivate(parent); // Reset root mesh(top parent) vertex and index buffers. Also removes all listeners(NOT wanted, FIX) 
               
               // We want to remove the listen events from the EventListeners buffer,
               // but keep the meshe's member 'listeners' an-touched. 
               Remove_event_listeners_no_member_listeners_touch_recursive(parent)

               // For clarity!
               const clarify = new Widget_Label(parent.name, [0, 0, 0], 4);
               const minimize_mesh = parent.children.buffer[0]; // TODO: First childe suppose to be the minimize button. What happens if the btn is at a different index???
               minimize_mesh.UpdateText('+')
               
               parent.children.Reset();
               
               parent.AddChild(clarify);
               parent.AddChild(minimize_mesh);

               Listener_debug_print_all()
               console.log('---------------------')
               
               // Set click event back.
               // parent.CreateListenEvent(LISTEN_EVENT_TYPES.HOVER);
               // parent.CreateListenEvent(LISTEN_EVENT_TYPES.CLICK_DOWN, parent.OnClick);
               minimize_mesh.CreateListenEvent(LISTEN_EVENT_TYPES.HOVER);
               minimize_mesh.CreateListenEvent(LISTEN_EVENT_TYPES.CLICK_DOWN, minimize_mesh.OnClick);
               
               Listener_debug_print_all()

               parent.Recalc(SECTION.HORIZONTAL);

               // Set Graphics
               parent.GenGfxCtx(GFX.PRIVATE);
               parent.AddToGfx();

               Gfx_end_session(true);

               Gfx_activate(parent); // Re-enable the rendering of the vertex buffers.

               minimize_mesh.toggle = true;

               console.log('MINIMIZED')
            }
            else {

               // Gfx_deactivate_no_listeners_touch(parent); // Reset root mesh(top parent) vertex and index buffers.
               Gfx_deactivate(parent); // Reset root mesh(top parent) vertex and index buffers.

               parent.children.Reset();
               parent.children = mesh.temp;
               
               parent.RecreateListenEvents(parent)
               
               // Set the Move event for the parent
               // parent.CreateListenEvent(LISTEN_EVENT_TYPES.MOVE, parent.OnClick);
               // parent.CreateListenEvent(LISTEN_EVENT_TYPES.HOVER);
               const minimize_btn = parent.children.buffer[0];
               minimize_btn.CreateListenEvent(LISTEN_EVENT_TYPES.CLICK_DOWN, minimize_btn.OnClick);
               minimize_btn.CreateListenEvent(LISTEN_EVENT_TYPES.HOVER);
               
               parent.children.buffer[0].UpdateText('-'); // Set 

               parent.SetDefaultPosXY();

               parent.Recalc();

               // Insert the minimized mesh
               parent.GenGfxCtx(GFX.PRIVATE);
               parent.AddToGfx();

               Gfx_end_session(true);

               Gfx_activate(parent); // Re-enable the rendering of the vertex buffers.

               mesh.toggle = false;

               console.log('MAXIMIZED')
            }
         }

         return true;
      }

      return false;
   }
}