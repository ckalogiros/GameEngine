"use strict";

import { CopyArr3 } from "../../../../../Helpers/Math/MathOperations.js";
import { Check_intersection_point_rect } from "../../../Operations/Collisions.js";
import { MouseGetPos, MouseGetPosDif } from "../../../../Controls/Input/Mouse.js";
import { M_Buffer } from "../../../../Core/Buffers.js";
import { Debug_get_event_listeners, Listener_events_set_mesh_events_active, Listener_recover_children_buffer, Listener_reset_children_buffer, Listeners_copy_event_children_buffer } from "../../../../Events/EventListeners.js";
import { Gfx_activate } from "../../../../Interfaces/Gfx/GfxContextCreate.js";
import { MESH_ENABLE } from "../../Base/Mesh.js";
import { Widget_Button } from "../WidgetButton.js";
import { Widget_Label } from "../WidgetLabel.js";
import { Align } from "../../../Operations/Alignment.js";
import { TimeIntervalsDestroyByIdx } from "../../../../Timers/TimeIntervals.js";


export class Widget_Menu_Bar extends Widget_Label {

   close_btn_idx;
   minimize_btn_idx;

   constructor(text, Align, pos, col = GREY3, text_col = WHITE, pad = [14, 6], bold = .4, style = [2, 5, 2], font = FONTS.SDF_CONSOLAS_LARGE) {

      super(text, Align, pos, 4, col, text_col, pad, bold, font, style);

      this.EnableGfxAttributes(MESH_ENABLE.GFX.ATTR_STYLE);
      this.SetStyle(style);
      this.SetName('Widget_Menu_Bar');
      this.type |= MESH_TYPES_DBG.WIDGET_MENU_BAR;

      this.close_btn_idx = INT_NULL;
      this.minimize_btn_idx = INT_NULL;
   }

   AddCloseButton(root, text, fontsize = 0, col = GREY3, text_col = WHITE, pad = [4, 2], bold = .4, style = [6, 5, 3], font = FONTS.SDF_CONSOLAS_LARGE) {

      if (!fontsize) fontsize = this.text_mesh.geom.dim[0];

      const pos = [0, 0, 0];
      CopyArr3(pos, this.geom.pos)
      pos[2] += 1; // Put close button in front of the parent widget.

      const close_btn = new Close_Button(root, text, pos, fontsize, col, text_col, pad, bold, style, font);
      close_btn.SetName('close_btn');

      this.geom.dim[0] += close_btn.geom.dim[0];
      this.geom.dim[1] = (this.geom.dim[1] < close_btn.geom.dim[1]) ? close_btn.geom.dim[1] + this.pad[1] : this.geom.dim[1];

      this.close_btn_idx = this.AddChild(close_btn);
      this.CreateListenEvent(LISTEN_EVENT_TYPES.CLICK_UP);

      // Realign menu's children
      this.ReAlign();
   }

   AddMinimizeButton(root, pos, fontsize, col = GREY3, text_col = WHITE, pad = [4, 2], bold = .4, font = FONTS.SDF_CONSOLAS_LARGE, style = [6, 5, 3]) {

      CopyArr3(pos, this.geom.pos);
      pos[2] += 1; // Put close button in front of the parent widget.

      const minimize_btn = new Widget_Minimize(root, pos, fontsize, col, text_col, pad, bold);
      minimize_btn.SetName('minimize_btn')

      this.geom.dim[0] += minimize_btn.geom.dim[0];
      this.geom.dim[1] = (this.geom.dim[1] < minimize_btn.geom.dim[1]) ? minimize_btn.geom.dim[1] + this.pad[1] : this.geom.dim[1];

      this.minimize_btn_idx = this.AddChild(minimize_btn);

   }

   Destroy(_this) {

      // Menu's children(close/minimize etc) destruction
      for (let i = 0; i < _this.children.boundary; i++) {

         const child = _this.children.buffer[i];
         child.Destroy();
      }

      // Menus's destruction
      super.Destroy();
   }

   /*******************************************************************************************************************************************************/
   // Graphics
   GenGfxCtx(FLAGS, gfxidx) {

      const gfx = super.GenGfxCtx(FLAGS, gfxidx); // For the menu meshes

      for (let i = 0; i < this.children.boundary; i++) { // For the children meshes
         const child = this.children.buffer[i];
         child.GenGfxCtx(FLAGS, gfxidx)
      }
      return gfx;
   }

   Render() {

      super.Render(); // For the menu meshes

      for (let i = 0; i < this.children.boundary; i++) { // For the children meshes

         const child = this.children.buffer[i];
         if (!child.is_gfx_inserted) { child.Render(); child.is_gfx_inserted = true }
         if (!child.text_mesh.is_gfx_inserted) { child.text_mesh.Render(); child.text_mesh.is_gfx_inserted = true }
      }
   }

   /*******************************************************************************************************************************************************/
   // Setters-Getters

   /** Return type: Array. Returns an array of all widgets meshes */
   GetAllMeshes() {

      let all_meshes = [this, this.text_mesh];
      for (let i = 0; i < this.children.boundary; i++) {
         const child = this.children.buffer[i]
         all_meshes = child.GetAllMeshes(all_meshes)
      }
      return all_meshes;
   }

   /*******************************************************************************************************************************************************/
   // Events Handling
   
   // SEE ### OnMove Events Implementation Logic
   OnMove(params) {

      // The 'OnMove' function is called by the timeInterval.
      // The timeInterval has been set by the 'OnClick' event.
      const menu = params.params;
      const text_mesh = menu.text_mesh;

      // Destroy the time interval and the Move operation, if the mesh is not grabed
      // MESH_STATE.IN_GRAB is deactivated upon mouse click up in Events.js.
      if (menu.StateCheck(MESH_STATE.IN_GRAB) === 0 && menu.timeIntervalsIdxBuffer.boundary) {

         const intervalIdx = menu.timeIntervalsIdxBuffer.buffer[0];// HACK !!!: We need a way to know what interval is what, in the 'timeIntervalsIdxBuffer' in a mesh. 
         TimeIntervalsDestroyByIdx(intervalIdx);
         menu.timeIntervalsIdxBuffer.RemoveByIdx(0); // HACK

         return;
      }

      // Move menu widget
      const mouse_pos = MouseGetPosDif();
      menu.geom.MoveXY(mouse_pos.x, -mouse_pos.y, menu.gfx);
      text_mesh.geom.MoveXY(mouse_pos.x, -mouse_pos.y, text_mesh.gfx);


      // Move menu children widgets(close/minimize buttons)
      for (let i = 0; i < menu.children.boundary; i++) {

         const widget_child = menu.children.buffer[i];
         widget_child.geom.MoveXY(mouse_pos.x, -mouse_pos.y, widget_child.gfx);
         widget_child.text_mesh.geom.MoveXY(mouse_pos.x, -mouse_pos.y, widget_child.text_mesh.gfx);
      }

   }

   // Create all listen events recursively for all children, from each mesh's listeners buffer.
   ConstructListeners(_root = null) {

      // const mesh = (_mesh) ? _mesh : this; // If in recursion, use as the current mesh the passed param. 
      const mesh = this; // If in recursion, use as the current mesh the passed param. 
      const root = (_root) ? _root : this; // If in recursion, use as the current mesh the passed param. 
      console.log('****', mesh.name, mesh.listeners.buffer)

      const root_evt = root.listeners.buffer;

      for (let etypeidx = 0; etypeidx < mesh.listeners.boundary; etypeidx++) {

         for (let i = 0; i < mesh.children.boundary; i++) {

            const child = mesh.children.buffer[i];
            if (child) {
               const evt = child.listeners.buffer[etypeidx];
               if (evt) { // If event is not null
                  const target_params = {
                     EventClbk: null,
                     targetBindingFunctions: null,
                     target_mesh: child,
                     params: null,
                  }
                  child.AddListenEvent(etypeidx, child.OnClick, target_params, root_evt);
               }
            }
         }
      }
   }

   /*******************************************************************************************************************************************************/
   // Alignment
   ReAlign() {

      // Realign menu's text
      this.Align(ALIGN.LEFT, this.pad);

      let pad = [this.pad[0], this.pad[1]];

      for (let i = 0; i < this.children.boundary; i++) {

         const c = this.children.buffer[i];
         Align(ALIGN.RIGHT, this.geom, c.geom, pad); // Align the close/minimize buttons area_mesh to the menu area mesh.
         c.Align(ALIGN.HOR_CENTER, pad); // Also we need to update the close/minimize buttons text_mesh position(by aligning)
         pad[0] += this.children.buffer[i].geom.dim[0] * 2; // Each child widget of the menu is positioned relative to the previous child.
      }

   }

   Reposition_post(dif_pos) {

      this.MoveXYZ(dif_pos);
      this.text_mesh.MoveXYZ(dif_pos);

      // Menu's children(close/minimize etc) destruction
      for (let i = 0; i < this.children.boundary; i++) {

         const child = this.children.buffer[i];
         child.Reposition_post(dif_pos);
      }
   }

   /*******************************************************************************************************************************************************/
   // Transformations
   Move(x, y) {

      // Move 'this' text
      this.geom.MoveXY(x, y, this.gfx);
      this.text_mesh.geom.MoveXY(x, y, this.text_mesh.gfx);

      // Move menu children widgets(close/minimize buttons)
      for (let i = 0; i < this.children.boundary; i++) {

         const widget_child = this.children.buffer[i];
         widget_child.geom.MoveXY(x, y, widget_child.gfx);
         widget_child.text_mesh.geom.MoveXY(x, y, widget_child.text_mesh.gfx);
      }
   }

}


export class Close_Button extends Widget_Button {

   constructor(root, text, pos, fontsize, col = GREY3, text_col = WHITE, pad = [0, 0], bold = .4, style = [6, 5, 3], font = FONTS.SDF_CONSOLAS_LARGE) {

      super(text, ALIGN.RIGHT, pos, fontsize, col, text_col, pad, bold, style, font);

      this.CreateListenEvent(LISTEN_EVENT_TYPES.HOVER)
      this.StateEnable(MESH_STATE.IS_HOVER_COLORABLE);
      this.CreateListenEvent(LISTEN_EVENT_TYPES.CLICK_UP)

      // Set a callback function for the destruction of the menu and its window on clicking the close button.
      const params = {
         source_params: this,
         target_params: root, // root should be the root widget from which the recursive destruction should start.
         Clbk: root.OnCloseButtonClick, // The callback tha will destroy the root and all of its children(recursive)
      }
      this.eventCallbacks.Add(params); // Pass the root and the callback for destroying the parent widget

   }

   /*******************************************************************************************************************************************************/
   // Events handling

   OnClick(params) {

      const widget_close_btn = params.target_params.target_mesh;
      widget_close_btn.OnClose();
      return true; // Needed for the listen event not to propagate further, after widget destruction
   }

   OnClose() {

      console.log('OnClose', this);

      /** The Scema of the 'params', constructed for the 'eventCallbacks'
         source_params: this,
         target_params: root,
         Clbk: this.OnDestroy,
       */
      const params = this.eventCallbacks.buffer[0]; // HACK: We must set up an index clarification for eventCallbacks buffer. 
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

      this.StateEnable(MESH_STATE.IS_HOVER_COLORABLE);

      // this.CreateListenEvent(LISTEN_EVENT_TYPES.HOVER)
      this.CreateListenEvent(LISTEN_EVENT_TYPES.CLICK_UP, this.OnClick)
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
                  const click_event_type = LISTEN_EVENT_TYPES_INDEX.CLICK;
                  const click_event_idx = root.listeners.buffer[LISTEN_EVENT_TYPES_INDEX.CLICK].idx;
                  const hover_event_type = LISTEN_EVENT_TYPES_INDEX.HOVER;
                  const hover_event_idx = root.listeners.buffer[LISTEN_EVENT_TYPES_INDEX.HOVER].idx;

                  minim_mesh.stored_children_events[click_event_type] = Listeners_copy_event_children_buffer(click_event_type, click_event_idx);
                  // Delete all children events of the root's EventListener.
                  Listener_reset_children_buffer(click_event_type, click_event_idx);
                  minim_mesh.stored_children_events[hover_event_type] = Listeners_copy_event_children_buffer(hover_event_type, hover_event_idx);
                  // Deactivate all children events of the root's EventListener.
                  Listener_reset_children_buffer(hover_event_type, hover_event_idx);
                  Listener_events_set_mesh_events_active(LISTENERS_FLAGS.ALL, root.listeners, false);
               }

               { // Create new minimized widget and add to the root

                  const menu_bar = root.children.buffer[0]; // TODO: First child suppose to be the menu_bar. What happens if the btn is at a different index???

                  root.children.Reset();
                  root.AddChild(menu_bar);

                  minim_mesh.UpdateText('+')
                  // Set click event, back to the minimizer.
                  minim_mesh.CreateListenEvent(LISTEN_EVENT_TYPES.HOVER);
                  minim_mesh.CreateListenEvent(LISTEN_EVENT_TYPES.CLICK_UP);
                  minim_mesh.toggle = true;

                  CopyArr3(root.geom.defPos, root.geom.pos); // Set current pos as the default pos.
                  // Reposition minimized widget
                  root.geom.pos[1] -= root.geom.dim[1] - 20;
                  root.geom.pos[0] -= root.geom.dim[0] / 2 - 32.5;
                  root.Recalc(SECTION.HORIZONTAL);

                  // Set Graphics
                  root.GenGfxCtx(GFX_CTX_FLAGS.PRIVATE);
                  root.Render();
                  //*Gfx_end_session(true);
                  Gfx_activate(root); // Re-enable the rendering of the vertex buffers.
               }

               const l = Debug_get_event_listeners()
               console.log(l.event_type[1])

            }
            else { // Maximize - toggle off

               Gfx_deactivate_no_listeners_touch(root);

               root.children.Reset();
               root.children = minim_mesh.stored_children_meshes;


               { // Recover widget's events
                  const click_event_type = LISTEN_EVENT_TYPES_INDEX.CLICK;
                  const click_event_idx = root.listeners.buffer[LISTEN_EVENT_TYPES_INDEX.CLICK].idx;
                  const hover_event_type = LISTEN_EVENT_TYPES_INDEX.HOVER;
                  const hover_event_idx = root.listeners.buffer[LISTEN_EVENT_TYPES_INDEX.HOVER].idx;
                  Listener_recover_children_buffer(click_event_type, click_event_idx, minim_mesh.stored_children_events[click_event_type]);
                  Listener_recover_children_buffer(hover_event_type, hover_event_idx, minim_mesh.stored_children_events[hover_event_type]);
               }

               minim_mesh.UpdateText('-');

               { // Set widget pos and render
                  root.geom.pos[1] = root.geom.defPos[1] - 15;
                  root.geom.pos[0] = root.geom.defPos[0] - 15;

                  root.Recalc(SECTION.INHERIT); // Recalculate all widgets children pos and dim.

                  // Add to gfx
                  root.GenGfxCtx(GFX_CTX_FLAGS.PRIVATE);
                  root.Render();
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


