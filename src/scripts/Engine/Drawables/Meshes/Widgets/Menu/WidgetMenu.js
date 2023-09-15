"use strict";

import { CopyArr2, CopyArr3 } from "../../../../../Helpers/Math/MathOperations.js";
import { Check_intersection_point_rect } from "../../../../Collisions.js";
import { MouseGetPos } from "../../../../Controls/Input/Mouse.js";
import { M_Buffer } from "../../../../Core/Buffers.js";
import { Debug_get_event_listeners, Listener_deactivate_children_events_buffer, Listener_recover_children_buffer, Listener_reset_children_buffer, Listeners_copy_event_children_buffer } from "../../../../Events/EventListeners.js";
import { Gfx_activate, Gfx_deactivate_no_listeners_touch, Gfx_end_session } from "../../../../Interfaces/GfxContext.js";
import { MESH_ENABLE } from "../../Base/Mesh.js";
import { Widget_Button } from "../WidgetButton.js";
import { Widget_Label } from "../WidgetLabel.js";



export class Widget_Menu_Bar extends Widget_Label {
      
   constructor(text, Align, pos, dim, col = GREY3, text_col = WHITE, scale = [1, 1], pad = [0, 0], bold = .4, font = TEXTURES.SDF_CONSOLAS_LARGE, style = [2, 5, 2]) {
         
      super(text, Align, pos, 5, col, text_col, scale, pad, bold, font, style);

      this.EnableGfxAttributes(MESH_ENABLE.GFX.ATTR_STYLE);
      this.SetStyle(style);
      this.SetName('Widget_Menu_Bar');
      this.type |= MESH_TYPES_DBG.WIDGET_MENU_BAR;

   }

   AddCloseButton(root, text, pos, fontSize, col = GREY3, text_col = WHITE, scale = [1, 1], pad = [4, 2], bold = .4, font = TEXTURES.SDF_CONSOLAS_LARGE, style = [6, 5, 3]) {

      CopyArr3(pos, this.geom.pos);
      pos[2] += 1; // Put close button in front of the parent widget.

      const close_btn = new Close_Button(root, text, pos, fontSize, col, text_col, scale, pad, bold, font, style);
      close_btn.SetName('close_btn')

      this.geom.dim[0] += close_btn.geom.dim[0];
      this.geom.dim[1] = (this.geom.dim[1] < close_btn.geom.dim[1]) ? close_btn.geom.dim[1] + this.pad[1] : this.geom.dim[1];
      
      this.AddChild(close_btn);

      // Realign menu's children
      this.ReAlign();
   }

   AddMinimizeButton(root, pos, fontSize, col = GREY3, text_col = WHITE, scale = [1, 1], pad = [4, 2], bold = .4, font = TEXTURES.SDF_CONSOLAS_LARGE, style = [6, 5, 3]) {
      
      CopyArr3(pos, this.geom.pos);
      pos[2] += 1; // Put close button in front of the parent widget.
      
      const minimize_btn = new Widget_Minimize(root, pos, fontSize, col, text_col, scale, pad, bold);
      minimize_btn.SetName('minimize_btn')

      this.geom.dim[0] += minimize_btn.geom.dim[0];
      this.geom.dim[1] = (this.geom.dim[1] < minimize_btn.geom.dim[1]) ? minimize_btn.geom.dim[1] + this.pad[1] : this.geom.dim[1];

      this.AddChild(minimize_btn);

      // Realign menu's children
      this.ReAlign();
   }

   ReAlign(){
      
      // Realign menu's text
      const text_mesh = this.children.buffer[0];
      text_mesh.Align_pre(this, ALIGN.LEFT, this.pad);

      let pad = [this.pad[0], this.pad[1]];

      for(let i=1; i<this.children.count; i++){

         const b = this.children.buffer[i];
         b.Align_pre(this, ALIGN.RIGHT | ALIGN.VERT_CENTER, pad);
         pad[0] += this.children.buffer[i].geom.dim[0]*2;
      }

   }

   GenGfxCtx(FLAGS, gfxidx) {

      const gfx = super.GenGfxCtx(FLAGS, gfxidx);
      return gfx;
  }

}

/**
 * @param {*pointer} parent Must pass the parent so the close button can destroy all parent's meshes
 */
export class Close_Button extends Widget_Button {

   constructor(root, text, pos, fontSize, col = GREY3, text_col = WHITE, scale = [1, 1], pad = [0, 0], bold = .4, font = TEXTURES.SDF_CONSOLAS_LARGE, style = [6, 5, 3]){

      super(text, ALIGN.RIGHT, pos, fontSize, col, text_col, scale, pad, bold, font, style);

      this.CreateListenEvent(LISTEN_EVENT_TYPES.HOVER)
      this.StateEnable(MESH_STATE.IS_HOVER_COLORABLE);
      this.CreateListenEvent(LISTEN_EVENT_TYPES.CLICK_DOWN, this.OnClick)
      const params = { 
         source_params: this, 
         target_params: root, 
         Clbk: this.OnDestroy, 
      }
      this.eventCallbacks.Add(params); // Pass the root and the callback for destroying the parent widget

   }

   OnDestroy(params) {
      return params.target_params.RecursiveDestroy()
   }
}


export class Widget_Minimize extends Widget_Button {

   toggle; // On/Off
   stored_children_meshes; // Store all children meshes of the root, to maximize the widget back to normal. 
   stored_children_events; // Store the 'children' buffer of the roots EventListeners (class).
   
   constructor(root, pos=[100,200,0], fontSize=5, col = GREY3, text_col, scale, pad = [6, 2], bold = .5, font, style = [0, 4, 1.8]) {
      
      super('-', ALIGN.RIGHT, pos, fontSize, col, text_col, scale, pad, bold, font, style);
      
      this.toggle = false;
      this.store_children_meshes = null;
      this.stored_children_events = new Array(LISTEN_EVENT_TYPES_INDEX.SIZE); // Store the 'children' buffer of the roots EventListeners (class). 
      
      this.CreateListenEvent(LISTEN_EVENT_TYPES.HOVER)
      this.StateEnable(MESH_STATE.IS_HOVER_COLORABLE);
      this.CreateListenEvent(LISTEN_EVENT_TYPES.CLICK_DOWN, this.OnClick)
      const params = { 
         source_params: this, 
         target_params: root, 
         Clbk: this.OnMinimize, 
      }

      // The eventCallbacks are going to run from the OnClick() in Widget_Button class.
      this.eventCallbacks.Add(params); // Pass the root and the callback for destroying the parent widget

   }

   OnMinimize(params) {

      const minim_mesh = params.source_params;
      const root = params.target_params;
      const point = MouseGetPos();
      const m = minim_mesh.geom;

      if (Check_intersection_point_rect(m.pos, m.dim, point, [0, 0])) {

         STATE.mesh.SetClicked(minim_mesh);


         if (root) {

            if (!minim_mesh.toggle) {  // Maximize - toggle on

               // Copy root's children
               minim_mesh.stored_children_meshes = new M_Buffer(root.children);
                             
               Gfx_deactivate_no_listeners_touch(root); // Reset root minim_mesh(top root) vertex and index buffers.
               
               { // Store widget's children events(for recovering widgets children events on maximize)
                  const click_event_type =  LISTEN_EVENT_TYPES_INDEX.CLICK;
                  const click_event_idx =  root.listeners.buffer[LISTEN_EVENT_TYPES_INDEX.CLICK];
                  const hover_event_type =  LISTEN_EVENT_TYPES_INDEX.HOVER;
                  const hover_event_idx =  root.listeners.buffer[LISTEN_EVENT_TYPES_INDEX.HOVER];
                  
                  minim_mesh.stored_children_events[click_event_type] = Listeners_copy_event_children_buffer(click_event_type, click_event_idx);
                  // Delete all children events of the root's EventListener.
                  Listener_reset_children_buffer(click_event_type, click_event_idx);
                  minim_mesh.stored_children_events[hover_event_type] = Listeners_copy_event_children_buffer(hover_event_type, hover_event_idx);
                  // Delete all children events of the root's EventListener.
                  Listener_reset_children_buffer(hover_event_type, hover_event_idx);
                  Listener_deactivate_children_events_buffer(LISTENERS_FLAGS.ALL, root.listeners);
               }

               { // Create new minimized widget and add to the root
                  
                  const menu_bar = root.children.buffer[0]; // TODO: First child suppose to be the menu_bar. What happens if the btn is at a different index???
                  
                  root.children.Reset();
                  root.AddChild(menu_bar);
                  
                  minim_mesh.UpdateText('+')
                  // Set click event, back to the minimizer.
                  minim_mesh.CreateListenEvent(LISTEN_EVENT_TYPES.HOVER);
                  minim_mesh.CreateListenEvent(LISTEN_EVENT_TYPES.CLICK_DOWN, minim_mesh.OnClick);
                  minim_mesh.toggle = true;
              
                  root.Reconstruct_listeners_recursive();

                  CopyArr3(root.geom.defPos, root.geom.pos); // Set current pos as the default pos.
                  // Reposition minimized widget
                  root.geom.pos[1] -= root.geom.dim[1]-20;
                  root.geom.pos[0] -= root.geom.dim[0]/2-32.5;
                  root.Recalc(SECTION.HORIZONTAL);

                  // Set Graphics
                  root.GenGfxCtx(GFX.PRIVATE);
                  root.AddToGfx();
                  Gfx_end_session(true);
                  Gfx_activate(root); // Re-enable the rendering of the vertex buffers.
               }

               const l = Debug_get_event_listeners()
               console.log(l.event_type[1])
               
            }
            else { // Maximize - toggle off
               
               // /*DEBUG*/ const l = Debug_get_event_listeners();
               Gfx_deactivate_no_listeners_touch(root);
               
               root.children.Reset();
               root.children = minim_mesh.stored_children_meshes;
               
               
               { // Recover widget's events
                  const click_event_type =  LISTEN_EVENT_TYPES_INDEX.CLICK;
                  const click_event_idx =  root.listeners.buffer[LISTEN_EVENT_TYPES_INDEX.CLICK];
                  const hover_event_type =  LISTEN_EVENT_TYPES_INDEX.HOVER;
                  const hover_event_idx =  root.listeners.buffer[LISTEN_EVENT_TYPES_INDEX.HOVER];
                  Listener_recover_children_buffer(click_event_type, click_event_idx, minim_mesh.stored_children_events[click_event_type]);
                  Listener_recover_children_buffer(hover_event_type, hover_event_idx, minim_mesh.stored_children_events[hover_event_type]);
               }
               
               minim_mesh.UpdateText('-');

               { // Set widget pos and render
                  root.geom.pos[1] = root.geom.defPos[1]-15;
                  root.geom.pos[0] = root.geom.defPos[0]-15;

                  root.Recalc(SECTION.INHERIT); // Recalculate all widgets children pos and dim.
                 
                  // Add to gfx
                  root.GenGfxCtx(GFX.PRIVATE);
                  root.AddToGfx();
                  Gfx_end_session(true);
                  Gfx_activate(root); // Re-enable the rendering of the vertex buffers.
               }
               
               minim_mesh.toggle = false;
               const l = Debug_get_event_listeners()
               console.log(l.event_type[1])
            }
         }

         return true;
      }

      return false;
   }
}
   

