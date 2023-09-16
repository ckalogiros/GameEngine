"use strict";

import { GetRandomColor } from "../../../../../Helpers/Helpers";
import { MouseGetPosDif } from "../../../../Controls/Input/Mouse";
import { Info_listener_dispatch_event } from "../../../../DebugInfo/InfoListeners";
import { Debug_get_event_listeners, Listener_remove_event_by_idx } from "../../../../Events/EventListeners";
import { Gfx_activate, Gfx_deactivate, Gfx_deactivate_no_listeners_touch, Gfx_end_session } from "../../../../Interfaces/GfxContext";
import { RenderQueueGet } from "../../../../Renderers/Renderer/RenderQueue";
import { TimeIntervalsCreate, TimeIntervalsDestroyByIdx } from "../../../../Timers/TimeIntervals";
import { MESH_ENABLE } from "../../Base/Mesh";
import { Section } from "../../Section";
import { Widget_Button } from "../WidgetButton";
import { Widget_Label } from "../WidgetLabel";
import { Widget_Text } from "../WidgetText";



export class Widget_Drop_Down extends Section {

   isOn;
   menu;

   constructor(text, Align, pos, dim, col1 = GREY3, col2 = PINK_240_60_160, text_col = WHITE, scale = [1, 1], pad = [0, 0], bold = .4, font = TEXTURES.SDF_CONSOLAS_LARGE, style = [2, 5, 2]) {

      super(SECTION.VERTICAL, [4, 4], pos, [10, 10], col2);

      this.isOn = 0x0;
      this.EnableGfxAttributes(MESH_ENABLE.GFX.ATTR_STYLE);
      this.SetStyle(style);
      this.SetName('Widget_Drop_Down');
      this.type |= MESH_TYPES_DBG.WIDGET_MENU_BAR;
      this.menu = null;

      const btn = new Widget_Button(text, Align, pos, 4, col1, text_col, scale, pad, bold, font, style);
      btn.CreateListenEvent(LISTEN_EVENT_TYPES.HOVER);
      btn.StateEnable(MESH_STATE.IS_HOVER_COLORABLE);

      const text_symbol = new Widget_Text('>', pos);
      text_symbol.Align_pre(btn, ALIGN.RIGHT, [0, 0])
      text_symbol.SetName('DropDown symbol');
      btn.AddChild(text_symbol);
      this.AddItem(btn);

      this.menu = new Section(SECTION.VERTICAL, [14, 4], [0, 0, 0], [0, 0], TRANSPARENCY(GetRandomColor(), .7));
      const params = { // Build the parameters for the OnClick callback function.
         drop_down: this,
         menu: this.menu,
      }

      btn.CreateListenEvent(LISTEN_EVENT_TYPES.CLICK_DOWN, this.OnClick, params)
   }

   AddToMenu(mesh) {
      this.menu.AddItem(mesh);
      // this.AddChild(mesh);
   }
   TempAct() {

      const drop_down_mesh = this;
      const menu = this.menu;

      if (menu) {

         drop_down_mesh.AddItem(menu); // Add the menu which is a storage of Widget_Drop_Down only as a child to the drop_down
         menu.GenGfxCtx(GFX.PRIVATE); // Generate gfx context since the 'menu does not exist in the vertex buffers'
         Gfx_end_session(true, true);
         menu.AddToGfx(); // Add to the vertex buffers

         // drop_down_mesh.Calc();
         // drop_down_mesh.UpdateGfxPosDimRecursive(drop_down_mesh);

      }
   }
   TempDeact() {

      const drop_down_mesh = this;
      const menu = this.menu;

      if (menu) {
         const l = Debug_get_event_listeners();
         // Gfx_deactivate(menu); // Also deactivates the gfx buffers.
         Gfx_deactivate_no_listeners_touch(menu); // Also deactivates the gfx buffers.
         drop_down_mesh.RemoveChildByIdx(menu.idx)

         // drop_down_mesh.Calc();
         // drop_down_mesh.UpdateGfxPosDimRecursive(drop_down_mesh);
      }
   }

   OnClick(params) {

      const drop_down_mesh = params.target_params.drop_down;
      const menu = params.target_params.menu;
      const btn = params.source_params;
      const text_symbol = btn.children.buffer[1];

      if (!drop_down_mesh.isOn) {
         text_symbol.UpdateTextFromVal('v');

         if (menu) {
            console.log('1 :', drop_down_mesh.name, ' menu:', menu.name)
            drop_down_mesh.AddItem(menu); // Add the menu which is a storage of Widget_Drop_Down only as a child to the drop_down
            menu.GenGfxCtx(GFX.PRIVATE); // Generate gfx context since the 'menu does not exist in the vertex buffers'
            Gfx_end_session(true, true);
            menu.AddToGfx(); // Add to the vertex buffers

            // const trigger_params = { info: 'This is the update info' }
            // const info_event_type = INFO_LISTEN_EVENT_TYPE.GFX | INFO_LISTEN_EVENT_TYPE.GFX_EVT_TYPE.VB;
            // Info_listener_dispatch_event(info_event_type, trigger_params);

            drop_down_mesh.Recalc();
            drop_down_mesh.UpdateGfxPosDimRecursive(drop_down_mesh);

            RenderQueueGet().SetPriority('first', 0, 0)
         }

      }
      else {

         text_symbol.UpdateTextFromVal('>');

         if (menu) {

            console.log('2 :', drop_down_mesh.name, ' menu:', menu.name)
            // Gfx_deactivate(menu); // Also deactivates the gfx buffers.
            Gfx_deactivate_no_listeners_touch(menu); // Also deactivates the gfx buffers.
            drop_down_mesh.RemoveChildByIdx(menu.idx)
            drop_down_mesh.Recalc();
            // menu.RemoveAllListenEvents();
            // Listener_remove_event_by_idx(TYPE_IDX, idx)
            drop_down_mesh.UpdateGfxPosDimRecursive(drop_down_mesh);
         }
      }
      STATE.mesh.SetClicked(text_symbol);

      drop_down_mesh.isOn ^= 0x1;

      return true;
   }

   SetOnMove(params) {

      const mesh = params.source_params;
      STATE.mesh.SetClicked(mesh);

      if (mesh.timeIntervalsIdxBuffer.count <= 0) {

         const idx = TimeIntervalsCreate(10, 'Move Widget_Text', TIME_INTERVAL_REPEAT_ALWAYS, mesh.OnMove, mesh);
         mesh.timeIntervalsIdxBuffer.Add(idx);

         if (mesh.StateCheck(MESH_STATE.IS_GRABABLE)) {

            STATE.mesh.SetGrabed(mesh);
            mesh.StateEnable(MESH_STATE.IN_GRAB);
         }

      }

   }
   OnMove(params) {

      /**
       * The function is called by the timeInterval.
       * The timeInterval has been set by the 'OnClick' event.
       */

      const mesh = params.params;

      // Destroy the time interval calling this function if the mesh is not grabed.
      if (mesh.StateCheck(MESH_STATE.IN_GRAB) === 0) {

         const intervalIdx = mesh.timeIntervalsIdxBuffer.buffer[0];// HACK !!!: We need a way to know what interval is what, in the 'timeIntervalsIdxBuffer' in a mesh. 
         TimeIntervalsDestroyByIdx(intervalIdx);
         mesh.timeIntervalsIdxBuffer.RemoveByIdx(0); // HACK

         return;
      }

      // Move the mesh
      // console.log('MOVING Widget_Drop_Down:', mesh.name)
      const mouse_pos = MouseGetPosDif();
      mesh.MoveRecursive(mouse_pos.x, -mouse_pos.y);

   }

   // AddCloseButton(root, text, pos, fontSize, col = GREY3, text_col = WHITE, scale = [1, 1], pad = [4, 2], bold = .4, font = TEXTURES.SDF_CONSOLAS_LARGE, style = [6, 5, 3]) {

   //    CopyArr3(pos, this.geom.pos);
   //    pos[2] += 1; // Put close button in front of the parent widget.

   //    const close_btn = new Close_Button(root, text, pos, fontSize, col, text_col, scale, pad, bold, font, style);
   //    close_btn.SetName('close_btn')

   //    this.geom.dim[0] += close_btn.geom.dim[0];
   //    this.geom.dim[1] = (this.geom.dim[1] < close_btn.geom.dim[1]) ? close_btn.geom.dim[1] + this.pad[1] : this.geom.dim[1];

   //    this.AddChild(close_btn);

   //    // Realign menu's children
   //    this.ReAlign();
   // }

   // AddMinimizeButton(root, pos, fontSize, col = GREY3, text_col = WHITE, scale = [1, 1], pad = [4, 2], bold = .4, font = TEXTURES.SDF_CONSOLAS_LARGE, style = [6, 5, 3]) {

   //    CopyArr3(pos, this.geom.pos);
   //    pos[2] += 1; // Put close button in front of the parent widget.

   //    const minimize_btn = new Widget_Minimize(root, pos, fontSize, col, text_col, scale, pad, bold);
   //    minimize_btn.SetName('minimize_btn')

   //    this.geom.dim[0] += minimize_btn.geom.dim[0];
   //    this.geom.dim[1] = (this.geom.dim[1] < minimize_btn.geom.dim[1]) ? minimize_btn.geom.dim[1] + this.pad[1] : this.geom.dim[1];

   //    this.AddChild(minimize_btn);

   //    // Realign menu's children
   //    this.ReAlign();
   // }

   ReAlign() {

      // Realign menu's text
      const text_mesh = this.children.buffer[0];
      text_mesh.Align_pre(this, ALIGN.LEFT, this.pad);

      let pad = [this.pad[0], this.pad[1]];

      for (let i = 1; i < this.children.count; i++) {

         const b = this.children.buffer[i];
         b.Align_pre(this, ALIGN.RIGHT | ALIGN.VERT_CENTER, pad);
         pad[0] += this.children.buffer[i].geom.dim[0] * 2;
      }

   }

   GenGfxCtx(FLAGS, gfxidx) {

      const gfx = super.GenGfxCtx(FLAGS, gfxidx);
      return gfx;
   }

}