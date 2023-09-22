"use strict";

import { PrintVertexDataAll } from "../../../../../Graphics/Z_Debug/GfxDebug";
import { GetRandomColor } from "../../../../../Helpers/Helpers";
import { MouseGetPosDif } from "../../../../Controls/Input/Mouse";
import { M_Buffer } from "../../../../Core/Buffers";
import { Gfx_activate, Gfx_deactivate, Gfx_deactivate_no_listeners_touch, Gfx_end_session, Gfx_generate_context } from "../../../../Interfaces/GfxContext";
import { TimeIntervalsCreate, TimeIntervalsDestroyByIdx } from "../../../../Timers/TimeIntervals";
import { MESH_ENABLE } from "../../Base/Mesh";
import { Section } from "../../Section";
import { Widget_Button } from "../WidgetButton";
import { Widget_Text } from "../WidgetText";

let _root = null;
export function Drop_down_set_root_for_debug(mesh){_root = mesh;}
let _root_dropdown = new M_Buffer();

export function Drop_down_set_root(root, dropdown){ 
   dropdown.rootidx = _root_dropdown.Add(root);
}
function Drop_down_set_root_local(root){ return _root_dropdown.Add(root); }
function Dropdown_get_root_by_idx(rootidx){ 
   
   const root = _root_dropdown.buffer[rootidx];
   return root;
}


const temp_transparency = .02;
export class Widget_Drop_Down extends Section {

   isOn;
   menu; // Keep state of the section menu for any given dropdown; 
   rootidx; // Store the root's dropdown index (of the '_root_dropdown');

   constructor(text, Align, pos, dim, col1 = GREY3, col2 = PINK_240_60_160, text_col = WHITE, scale = [1, 1], btn_pad = [0, 0], bold = .4, font = TEXTURES.SDF_CONSOLAS_LARGE, style = [2, 5, 2]) {

      super(SECTION.VERTICAL, [0, 0], pos, [10, 10], col2);

      this.isOn = 0x0;
      this.EnableGfxAttributes(MESH_ENABLE.GFX.ATTR_STYLE);
      this.SetStyle(style);
      this.SetName('Widget_Drop_Down');
      this.type |= MESH_TYPES_DBG.WIDGET_DROP_DOWN;
      this.menu = null;
      this.rootidx = INT_NULL;

      const btn = new Widget_Button(text, ALIGN.RIGHT, pos, 4, col1, text_col, scale, btn_pad, bold, font, style);
      btn.CreateListenEvent(LISTEN_EVENT_TYPES.HOVER); btn.StateEnable(MESH_STATE.IS_HOVER_COLORABLE);

      const text_symbol = new Widget_Text('+', pos);
      text_symbol.Align_pre(btn, ALIGN.LEFT, [5, 0])
      text_symbol.SetName('DropDown symbol');
      btn.AddChild(text_symbol);
      this.AddItem(btn);

      this.menu = new Section(SECTION.VERTICAL, [10, 2], [OUT_OF_VIEW, OUT_OF_VIEW, 0], [1, 1], TRANSPARENCY(GetRandomColor(), temp_transparency));
      this.menu.type |= MESH_TYPES_DBG.DROP_DOWN_MENU;
      const params = { // Build the parameters for the OnClick callback function.
         drop_down: this,
         menu: this.menu,
      }

      btn.CreateListenEvent(LISTEN_EVENT_TYPES.CLICK_DOWN, this.OnClick, params)
   }

   AddToMenu(mesh) {
      this.menu.AddItem(mesh);
      // if(mesh.type & MESH_TYPES_DBG.WIDGET_DROP_DOWN) 
      //    mesh.rootidx = Drop_down_set_root_local(this);
      if(mesh.type & MESH_TYPES_DBG.WIDGET_DROP_DOWN) 
         Drop_down_set_root(Dropdown_get_root_by_idx(this.rootidx), mesh);
   }
   AddToMenuAndGenGfx(mesh) {
      this.menu.AddItem(mesh);
      mesh.GenGfxCtx(GFX.PRIVATE);
   }

   DeactivateMenu(){
      
      if(this.menu.gfx)
         Gfx_deactivate(this.menu);
         // Gfx_deactivate_no_listeners_touch(this.menu);
   }

   OnClick(params) {

      
      const dropdown_mesh = params.target_params.drop_down;
      // if(dropdown_mesh.rootidx === INT_NULL) alert('Root for dropdown must be set. ', dropdown_mesh.name)
      const menu = params.target_params.menu;
      const btn = params.source_params;
      const text_symbol = btn.children.buffer[1];

      if (!dropdown_mesh.isOn) {
         text_symbol.UpdateTextFromVal('-');

         if (menu) {

            dropdown_mesh.AddItem(menu); // Add the menu which is a storage of Widget_Drop_Down only as a child to the drop_down
            PrintVertexDataAll();
            menu.gfx = Gfx_generate_context(menu.sid, menu.sceneIdx, menu.mat.num_faces, GFX.PRIVATE);

            let params = {
               gather_gfx_idxs: [],
               // menu_id: ''
            };

            params.gather_gfx_idxs.push({ progidx: menu.gfx.prog.idx, vbidx: menu.gfx.vb.idx, name: `menu:${menu.name}` });
            
            // Here we have to gfxGen all menus children, NOT private
            for(let i=0; i<menu.children.count; i++){
               
               const child = menu.children.buffer[i];
               if(child.type & MESH_TYPES_DBG.WIDGET_DROP_DOWN){
                  
                  child.gfx = Gfx_generate_context(child.sid, child.sceneIdx, child.mat.num_faces, GFX.SPECIFIC, [menu.gfx.prog.idx, menu.gfx.vb.idx]);
                  params.gather_gfx_idxs.push({ progidx: child.gfx.prog.idx, vbidx: child.gfx.vb.idx, name: `dp-child:${child.name}`});
                  const btn = child.children.buffer[0];
                  btn.GenGfxCtx(GFX.PRIVATE);
                  params.gather_gfx_idxs.push({ progidx: btn.gfx.prog.idx, vbidx: btn.gfx.vb.idx, name: 'btn'});
                  
                  const menu2 = child.menu;
                  if(menu2.isOn){
                     menu2.gfx = Gfx_generate_context(menu2.sid, menu2.sceneIdx, menu2.mat.num_faces, GFX.PRIVATE);
                     params.gather_gfx_idxs.push({ progidx: child.gfx.prog.idx, vbidx: child.gfx.vb.idx, name: `menu-2:${menu2.name}`});
                  }
                  
               }
               else{
                  
                  const gfx = child.GenGfxCtx(GFX.PRIVATE);
                  params.gather_gfx_idxs.push({ progidx: gfx.prog.idx, vbidx: gfx.vb.idx, name: `widget-child:${child.name}`});
               }

 
               
            }
            
            menu.AddToGfx(); // Add to the vertex buffers
            Gfx_end_session(true, true);

            const root = Dropdown_get_root_by_idx(dropdown_mesh.rootidx);
            root.Recalc(SECTION.INHERIT | SECTION.TOP_DOWN);
            root.UpdateGfxPosDimRecursive(root);

            Gfx_activate(dropdown_mesh); // activate the gfx buffers

         }

      }
      else {

         text_symbol.UpdateTextFromVal('+');

         if (menu) {

            Gfx_deactivate_no_listeners_touch(menu); // Deactivates the gfx buffers.
            dropdown_mesh.RemoveChildByIdx(menu.idx); // Remove menu from drop down
            
            const root = Dropdown_get_root_by_idx(dropdown_mesh.rootidx);
            root.Recalc(SECTION.INHERIT | SECTION.TOP_DOWN);
            root.UpdateGfxPosDimRecursive(root);
         }
      }
      
      STATE.mesh.SetClicked(text_symbol);

      dropdown_mesh.isOn ^= 0x1;

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

   GenGfxCtx() {

      const btn = this.children.buffer[0];
      
      this.gfx = Gfx_generate_context(this.sid, this.sceneIdx, this.mat.num_faces, GFX.PRIVATE);
      btn.GenGfxCtx(GFX.PRIVATE); // Set button's area gfx same with dropDown mesh 
      Gfx_end_session(true, true);

      return this.gfx;
   }

   AddToGfx(){

      super.AddToGfx();
   }

}



