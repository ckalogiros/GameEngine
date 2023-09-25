"use strict";

import { CopyArr3 } from "../../../../../Helpers/Math/MathOperations.js";
import { Check_intersection_point_rect } from "../../../Operations/Collisions.js";
import { MouseGetPos, MouseGetPosDif } from "../../../../Controls/Input/Mouse.js";
import { M_Buffer } from "../../../../Core/Buffers.js";
import { Debug_get_event_listeners, Listener_deactivate_children_events_buffer, Listener_recover_children_buffer, Listener_reset_children_buffer, Listeners_copy_event_children_buffer } from "../../../../Events/EventListeners.js";
import { Gfx_activate, Gfx_deactivate_no_listeners_touch, Gfx_end_session } from "../../../../Interfaces/Gfx/GfxContext.js";
import { MESH_ENABLE } from "../../Base/Mesh.js";
import { Widget_Button } from "../WidgetButton.js";
import { Widget_Label } from "../WidgetLabel.js";
import { Align } from "../../../Operations/Alignment.js";
import { TimeIntervalsDestroyByIdx } from "../../../../Timers/TimeIntervals.js";
import { Scenes_remove_root_mesh } from "../../../../Scenes.js";



export class Widget_Menu_Bar extends Widget_Label {

   constructor(text, Align, pos, col = GREY3, text_col = WHITE, pad = [14, 6], bold = .4, style = [2, 5, 2], font = TEXTURES.SDF_CONSOLAS_LARGE) {

      // text, Align, pos, col = GREY3, text_col = WHITE, pad = [0, 0], bold = .4, style = [2, 5, 2], font
      super(text, Align, pos, 4, col, text_col, pad, bold, font, style);

      this.area_mesh.EnableGfxAttributes(MESH_ENABLE.GFX.ATTR_STYLE);
      this.area_mesh.SetStyle(style);
      this.area_mesh.SetName('Widget_Menu_Bar');
      this.type |= MESH_TYPES_DBG.WIDGET_MENU_BAR;

   }

   AddCloseButton(root, text, fontsize = 0, col = GREY3, text_col = WHITE, pad = [4, 2], bold = .4, style = [6, 5, 3], font = TEXTURES.SDF_CONSOLAS_LARGE) {

      if (!fontsize) fontsize = this.text_mesh.geom.dim[0];

      const pos = [0, 0, 0];
      CopyArr3(pos, this.area_mesh.geom.pos)
      pos[2] += 1; // Put close button in front of the parent widget.

      const close_btn = new Close_Button(root, text, pos, fontsize, col, text_col, pad, bold, style, font);
      close_btn.area_mesh.SetName('close_btn')

      this.area_mesh.geom.dim[0] += close_btn.area_mesh.geom.dim[0];
      this.area_mesh.geom.dim[1] = (this.area_mesh.geom.dim[1] < close_btn.area_mesh.geom.dim[1]) ? close_btn.area_mesh.geom.dim[1] + this.pad[1] : this.area_mesh.geom.dim[1];

      this.area_mesh.AddChild(close_btn);

      // Realign menu's children
      this.ReAlign();
   }

   AddMinimizeButton(root, pos, fontsize, col = GREY3, text_col = WHITE, scale = [1, 1], pad = [4, 2], bold = .4, font = TEXTURES.SDF_CONSOLAS_LARGE, style = [6, 5, 3]) {

      CopyArr3(pos, this.area_mesh.geom.pos);
      pos[2] += 1; // Put close button in front of the parent widget.

      const minimize_btn = new Widget_Minimize(root, pos, fontsize, col, text_col, scale, pad, bold);
      minimize_btn.area_mesh.SetName('minimize_btn')

      this.area_mesh.geom.dim[0] += minimize_btn.area_mesh.geom.dim[0];
      this.area_mesh.geom.dim[1] = (this.area_mesh.geom.dim[1] < minimize_btn.area_mesh.geom.dim[1]) ? minimize_btn.area_mesh.geom.dim[1] + this.pad[1] : this.area_mesh.geom.dim[1];

      this.AddChild(minimize_btn);

      // Realign menu's children
      // this.ReAlign();
   }

   Destroy(_this) {

      for(let i=0; i<_this.area_mesh.children.boundary; i++){

         const widget_child = _this.area_mesh.children.buffer[i];
         widget_child.Destroy();
      }
      // _this.Destroy();
      const sceneidx = this.area_mesh.sceneidx;
      _this.text_mesh.Destroy();
      _this.area_mesh.Destroy();
      Scenes_remove_root_mesh(_this, sceneidx);
      _this.text_mesh = null;
      _this.area_mesh = null;
   }

   /*******************************************************************************************************************************************************/
   // Graphics
   GenGfxCtx(FLAGS, gfxidx) {

      const gfx = super.GenGfxCtx(FLAGS, gfxidx); // For the menu meshes

      for (let i = 0; i < this.area_mesh.children.boundary; i++) { // For the children meshes
         const child = this.area_mesh.children.buffer[i];
         child.GenGfxCtx(FLAGS, gfxidx)
      }
      return gfx;
   }

   Render() {

      super.Render(); // For the menu meshes

      for (let i = 0; i < this.area_mesh.children.boundary; i++) { // For the children meshes

         const child = this.area_mesh.children.buffer[i];
         if (!child.area_mesh.is_gfx_inserted) { child.area_mesh.AddToGfx(); child.area_mesh.is_gfx_inserted = true }
         if (!child.text_mesh.is_gfx_inserted) { child.text_mesh.AddToGfx(); child.text_mesh.is_gfx_inserted = true }
      }
   }

   /*******************************************************************************************************************************************************/
   // Events
   OnMove(params) {

      // The 'OnMove' function is called by the timeInterval.
      // The timeInterval has been set by the 'OnClick' event.
      const widget_menu = params.params;
      const area_mesh = widget_menu.area_mesh;
      const text_mesh = widget_menu.text_mesh;

      // Destroy the time interval and the Move operation, if the mesh is not grabed
      // MESH_STATE.IN_GRAB is deactivated upon mouse click up in Events.js.
      if (area_mesh.StateCheck(MESH_STATE.IN_GRAB) === 0) {

         const intervalIdx = area_mesh.timeIntervalsIdxBuffer.buffer[0];// HACK !!!: We need a way to know what interval is what, in the 'timeIntervalsIdxBuffer' in a mesh. 
         TimeIntervalsDestroyByIdx(intervalIdx);
         area_mesh.timeIntervalsIdxBuffer.RemoveByIdx(0); // HACK

         return;
      }

      // Move menu widget
      const mouse_pos = MouseGetPosDif();
      area_mesh.geom.MoveXY(mouse_pos.x, -mouse_pos.y, area_mesh.gfx);
      text_mesh.geom.MoveXY(mouse_pos.x, -mouse_pos.y, text_mesh.gfx);


      // Move menu children widgets(close/minimize buttons)
      for (let i = 0; i < area_mesh.children.boundary; i++) {

         const widget_child = area_mesh.children.buffer[i];
         widget_child.area_mesh.geom.MoveXY(mouse_pos.x, -mouse_pos.y, widget_child.area_mesh.gfx);
         widget_child.text_mesh.geom.MoveXY(mouse_pos.x, -mouse_pos.y, widget_child.text_mesh.gfx);
      }

   }


   /*******************************************************************************************************************************************************/
   // Helpers
   ReAlign() {

      // Realign menu's text
      this.Align(ALIGN.LEFT, this.pad);

      let pad = [this.pad[0], this.pad[1]];

      for (let i = 0; i < this.area_mesh.children.boundary; i++) {

         const c = this.area_mesh.children.buffer[i];
         Align(ALIGN.RIGHT, this.area_mesh.geom, c.area_mesh.geom, pad); // Align the close/minimize buttons area_mesh to the menu area mesh.
         c.Align(ALIGN.HOR_CENTER, pad); // Also we need to update the close/minimize buttons text_mesh position(by aligning)
         pad[0] += this.area_mesh.children.buffer[i].area_mesh.geom.dim[0] * 2; // Each child widget of the menu is positioned relative to the previous child.
      }

   }

}

/**
 * @param {*pointer} parent Must pass the parent so the close button can destroy all parent's meshes
 */
export class Close_Button extends Widget_Button {

   constructor(root, text, pos, fontsize, col = GREY3, text_col = WHITE, pad = [0, 0], bold = .4, style = [6, 5, 3], font = TEXTURES.SDF_CONSOLAS_LARGE) {

      super(text, ALIGN.RIGHT, pos, fontsize, col, text_col, pad, bold, style, font);

      this.CreateListenEvent(LISTEN_EVENT_TYPES.HOVER)
      this.area_mesh.StateEnable(MESH_STATE.IS_HOVER_COLORABLE);
      this.CreateListenEvent(LISTEN_EVENT_TYPES.CLICK_DOWN, this.OnClick)
      
      // Set a callback function for the destruction of the menu and its window on clicking the close button.
      const params = {
         source_params: this,
         target_params: root, // root should be the root widget from which the recursive destruction should start.
         Clbk: root.OnCloseButtonClick, // The callback tha will destroy the root and all of its children(recursive)
      }
      this.area_mesh.eventCallbacks.Add(params); // Pass the root and the callback for destroying the parent widget

   }

   /*******************************************************************************************************************************************************/
   // Events
   /**
    * @param {*} event_type typeof 'LISTEN_EVENT_TYPES'
    * @param {*} Clbk User may choose the callback for the listen event.
    */
   CreateListenEvent(event_type, Clbk = null, root) {

      const target_params = {
         EventClbk: null,
         targetBindingFunctions: null,
         target_mesh: this,
         params: null,
      }

      if (Clbk) this.area_mesh.AddEventListener(event_type, Clbk, target_params);
      else this.area_mesh.AddEventListener(event_type, this.OnClick, target_params);
   }

   OnClick(params) {

      const widget_close_btn = params.target_params.target_mesh;
      widget_close_btn.OnClose();
   }
   
   OnClose() {
      
      console.log('OnClose', this);

      /** The Scema of the 'params', constructed for the 'eventCallbacks'
         source_params: this,
         target_params: root,
         Clbk: this.OnDestroy,
       */
      const params = this.area_mesh.eventCallbacks.buffer[0]; // TODO: HACK: We must set up an index clarification for eventCallbacks buffer. 
      // const OnCloseClbk = params.Clbk;
      // // OnCloseClbk(params.target_params);
      const root = params.target_params
      root.Destroy(root);

   }

}


export class Widget_Minimize extends Widget_Button {

   toggle; // On/Off
   stored_children_meshes; // Store all children meshes of the root, to maximize the widget back to normal. 
   stored_children_events; // Store the 'children' buffer of the roots EventListeners (class).

   constructor(root, pos = [100, 200, 0], fontsize = 5, col = GREY3, text_col, pad = [6, 2], bold = .5, style = [0, 4, 1.8], font) {

      super('-', ALIGN.RIGHT, pos, fontsize, col, text_col, pad, bold, style, font);

      this.toggle = false;
      this.store_children_meshes = null;
      this.stored_children_events = new Array(LISTEN_EVENT_TYPES_INDEX.SIZE); // Store the 'children' buffer of the roots EventListeners (class). 

      this.area_mesh.StateEnable(MESH_STATE.IS_HOVER_COLORABLE);

      this.CreateListenEvent(LISTEN_EVENT_TYPES.HOVER)
      this.CreateListenEvent(LISTEN_EVENT_TYPES.CLICK_DOWN, this.OnClick)
      const params = {
         source_params: this,
         target_params: root,
         Clbk: this.OnMinimize,
      }
      // The eventCallbacks are going to run from the OnClick() in Widget_Button class.
      this.area_mesh.eventCallbacks.Add(params); // Pass the root and the callback for destroying the parent widget

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
                  const click_event_type = LISTEN_EVENT_TYPES_INDEX.CLICK;
                  const click_event_idx = root.listeners.buffer[LISTEN_EVENT_TYPES_INDEX.CLICK];
                  const hover_event_type = LISTEN_EVENT_TYPES_INDEX.HOVER;
                  const hover_event_idx = root.listeners.buffer[LISTEN_EVENT_TYPES_INDEX.HOVER];

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
                  root.geom.pos[1] -= root.geom.dim[1] - 20;
                  root.geom.pos[0] -= root.geom.dim[0] / 2 - 32.5;
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
                  const click_event_type = LISTEN_EVENT_TYPES_INDEX.CLICK;
                  const click_event_idx = root.listeners.buffer[LISTEN_EVENT_TYPES_INDEX.CLICK];
                  const hover_event_type = LISTEN_EVENT_TYPES_INDEX.HOVER;
                  const hover_event_idx = root.listeners.buffer[LISTEN_EVENT_TYPES_INDEX.HOVER];
                  Listener_recover_children_buffer(click_event_type, click_event_idx, minim_mesh.stored_children_events[click_event_type]);
                  Listener_recover_children_buffer(hover_event_type, hover_event_idx, minim_mesh.stored_children_events[hover_event_type]);
               }

               minim_mesh.UpdateText('-');

               { // Set widget pos and render
                  root.geom.pos[1] = root.geom.defPos[1] - 15;
                  root.geom.pos[0] = root.geom.defPos[0] - 15;

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


