"use strict";

import { Section } from "../../Section.js";
import { GetRandomColor } from "../../../../../Helpers/Helpers.js";
import { MouseGetPosDif } from "../../../../Controls/Input/Mouse.js";
import { M_Buffer } from "../../../../Core/Buffers.js";
import { Gfx_activate, Gfx_deactivate, Gfx_end_session, Gfx_generate_context } from "../../../../Interfaces/Gfx/GfxContext.js";
import { TimeIntervalsCreate, TimeIntervalsDestroyByIdx } from "../../../../Timers/TimeIntervals.js";
import { MESH_ENABLE } from "../../Base/Mesh.js";
import { Widget_Button } from "../WidgetButton.js";
import { Scenes_store_gfx_to_buffer } from "../../../../Scenes.js";
import { Listener_events_set_mesh_events_active } from "../../../../Events/EventListeners.js";

/**
 * SEE: ### Widget_Dropdown
 */

/**
 * We keep all root-dropdown widgets of the App in a buffer of this file's compilation unit.
 * The reason being not to store a reference pointer of the root in the  dropdown, 
 * rather an index to a buffer of all root-dropdowns. (?Does it worthh it?)
 */
let _root_dropdown = new M_Buffer();

export function Drop_down_set_root(root, dropdown) {
   dropdown.rootidx = _root_dropdown.Add(root);
}
function Dropdown_get_root_by_idx(rootidx) {

   const root = _root_dropdown.buffer[rootidx];
   return root;
}


const temp_transparency = .02;
export class Widget_Dropdown extends Section {

   isOn; // Bool for checking a dropdown's menu expanded/contructed.
   menu; // SEE ## Dropdown Menu 
   rootidx; // Store the root's dropdown index (of the '_root_dropdown');
   dp_symbols; // Text symbols for denoting a dropdown's Expanded/contracted menu. TODO: Add textured symbols OR create a font texture with symbols for dropdown expansion/contraction.

   constructor(text, pos, dim, col1 = GREY3, col2 = PINK_240_60_160, text_col = WHITE, btn_pad = [0, 0], bold = .4, font = TEXTURES.SDF_CONSOLAS_LARGE, style = [2, 5, 2]) {

      super(SECTION.VERTICAL, [0, 0], pos, [10, 10], col2);

      this.isOn = 0x0;
      this.EnableGfxAttributes(MESH_ENABLE.GFX.ATTR_STYLE);
      this.SetStyle(style);
      this.SetName('Widget_Dropdown');
      this.type |= MESH_TYPES_DBG.WIDGET_DROP_DOWN;
      this.menu = null;
      this.rootidx = INT_NULL;

      this.dp_symbols = ['+', '-'];
      const btn = new Widget_Button(`${this.dp_symbols[0]} ${text}`, ALIGN.RIGHT, pos, 4, col1, text_col, btn_pad, bold, style, font);

      this.AddItem(btn);

      this.menu = new Section(SECTION.VERTICAL, [10, 2], [OUT_OF_VIEW, OUT_OF_VIEW, 0], [1, 1], TRANSPARENCY(GetRandomColor(), temp_transparency));
      this.menu.type |= MESH_TYPES_DBG.DROP_DOWN_MENU;

   }

   AddToMenu(mesh) {

      this.menu.AddItem(mesh);
      if (mesh.type & MESH_TYPES_DBG.WIDGET_DROP_DOWN)
         Drop_down_set_root(Dropdown_get_root_by_idx(this.rootidx), mesh);
   }


   /*******************************************************************************************************************************************************/
   // Graphics

   GenGfxCtx(FLAGS = GFX.PRIVATE, gfx_idxs) {

      const btn = this.children.buffer[0];

      this.gfx = Gfx_generate_context(this.sid, this.sceneidx, this.geom.num_faces, FLAGS, gfx_idxs);
      Scenes_store_gfx_to_buffer(this.sceneidx, this);
      btn.GenGfxCtx(GFX.PRIVATE); // Set button's area gfx same with dropDown mesh 
      Gfx_end_session(true, true);

      return this.gfx;
   }

   Render() {

      super.Render();
   }

   // SEE: ## ActivateMenu() 
   ActivateMenu() {

      const menu = this.menu;
      const btn = this.children.buffer[0];
      const dp_symbols = this.dp_symbols;

      btn.text_mesh.UpdateTextCharacter(dp_symbols[1], 0);

      if (menu) {
         console.log('----------------------- Activating secondary menus')

         menu.gfx = Gfx_generate_context(menu.sid, menu.sceneidx, menu.geom.num_faces, GFX.PRIVATE);
         Scenes_store_gfx_to_buffer(menu.sceneidx, menu);

         // Here we have to gfxGen all menus children, NOT private
         for (let i = 0; i < menu.children.boundary; i++) {

            const child = menu.children.buffer[i];
            if (child.type & MESH_TYPES_DBG.WIDGET_DROP_DOWN) { // Case child is another dropdown

               child.gfx = Gfx_generate_context(child.sid, child.sceneidx, child.geom.num_faces, GFX.SPECIFIC, [menu.gfx.prog.idx, menu.gfx.vb.idx]);
               Scenes_store_gfx_to_buffer(child.sceneidx, child);
               
               const btn = child.children.buffer[0];
               btn.GenGfxCtx(GFX.PRIVATE);

               // Create Click events for any meshes of type Dropdown
               child.CreateClickEvent();

               console.log(btn.text_mesh.mat.text)
               if (child.isOn) {
                  // If the menu was deactivated while open, then on activation keep its '-' expansion symbol
                  const child_btn = child.children.buffer[0];
                  console.log(child_btn.text_mesh.mat.text)
                  child_btn.text_mesh.mat.text = `${this.dp_symbols[1]} ${child_btn.text_mesh.mat.text.slice(2)}`;
                  Gfx_end_session(true, true); // Must call end gfx private session for each next dropdown menu gfx activation
                  child.ActivateMenu();
               }
            }
            else { // Case: Generate gfx for children widget meshes 

               child.GenGfxCtx(GFX.PRIVATE);
            }

         }
      }
   }

   DeactivateMenu(dp) {

      const menu = dp.menu;

      for (let j = 0; j < menu.children.boundary; j++) {

         const menu_child = menu.children.buffer[j];

         // If the menu's child mesh is of type dropdown, run recursively to deactivate mesh's menu.
         if (menu_child.type & MESH_TYPES_DBG.WIDGET_DROP_DOWN && dp.isOn) {

            this.DeactivateMenu(menu_child); // Run recursive for every dropdown in every menu

            // Deactivate the dropdown's button
            const btn = menu_child.children.buffer[0];
            if (btn.listeners.active_count) {

               // btn.RemoveAllListenEvents();
               Listener_events_set_mesh_events_active(LISTENERS_FLAGS.ALL, btn.listeners, false);
            }
            
            if (btn.gfx) btn.DeactivateGfx();
         }

         // Deactivate gfx for menu's children meshes.
         if (menu_child.gfx) menu_child.DeactivateGfx();

      }

      // Deactivate gfx for menu mesh.
      if (menu.gfx) menu.DeactivateGfx();

   }

   DeactivateGfx() {
      if (this.gfx) Gfx_deactivate(this.gfx);
   }

   Destroy() {

      for (let i = 0; i < this.children.boundary; i++) {

         const child = this.children.buffer[i];
         child.Destroy();
      }
      super.Destroy();
   }

   CreateClickEvent() {

      const btn = this.children.buffer[0];
      const params = { // Build the parameters for the OnClick callback function.
         drop_down: this,
         menu: this.menu,
      }

      // Case listener already been set but deactivated
      if(btn.listeners.active_count){
         Listener_events_set_mesh_events_active(LISTENERS_FLAGS.ALL, btn.listeners, true);
      }else{
         btn.CreateListenEvent(LISTEN_EVENT_TYPES.CLICK_UP, this.OnClick, params);
      }

   }


   /*******************************************************************************************************************************************************/
   // Events

   // SEE: ## OnClick()
   OnClick(params) {

      if (!params.target_params.params){

         console.error('Target_params.params is null. mesh:', params.target_params);
         return;
      }
      const dropdown_mesh = params.target_params.params.drop_down;
      /*DEBUG*/if (dropdown_mesh.rootidx === INT_NULL) alert('Root for dropdown must be set. ', dropdown_mesh.name)

      const menu = params.target_params.params.menu;
      const btn = params.source_params;
      const dp_symbols = dropdown_mesh.dp_symbols;

      /** If the menu for the clicked dropdown is not activated, activate it and add it to the gfx buffers  */
      if (!dropdown_mesh.isOn) {

         btn.text_mesh.UpdateTextCharacter(dp_symbols[1], 0); // Update the symbol text.
         dropdown_mesh.AddItem(menu); // Add the menu, which is a storage of Widget_Dropdown only, as a child to the drop_down
         menu.gfx = Gfx_generate_context(menu.sid, menu.sceneidx, menu.geom.num_faces, GFX.PRIVATE);
         Scenes_store_gfx_to_buffer(menu.sceneidx, menu);


         // Add any menu children items(in private gfx buffers)
         for (let i = 0; i < menu.children.boundary; i++) {

            const child = menu.children.buffer[i];
            if (child.type & MESH_TYPES_DBG.WIDGET_DROP_DOWN) { // Case child is another dropdown

               // child.GenGfxCtx(GFX.PRIVATE);
               child.gfx = Gfx_generate_context(child.sid, child.sceneidx, child.geom.num_faces, GFX.SPECIFIC, [menu.gfx.prog.idx, menu.gfx.vb.idx]);
               Scenes_store_gfx_to_buffer(child.sceneidx, child);
               
               const child_btn = child.children.buffer[0];
               child_btn.GenGfxCtx(GFX.PRIVATE);


               // Create Click events for any meshes of type Dropdown
               child.CreateClickEvent();


               if (child.isOn) { // Case the dropdown has an 'active' menu.

                  // If the menu was deactivated while open, then on activation keep its '-' symbol
                  child_btn.text_mesh.mat.text = `${dropdown_mesh.dp_symbols[1]} ${child_btn.text_mesh.mat.text.slice(2)}`;
                  Gfx_end_session(true, true); // Must call end gfx private session for each next dropdown menu gfx activation
                  child.ActivateMenu();
               }

            }
            else { // Case: Generate gfx for any other children meshes 

               child.GenGfxCtx(GFX.PRIVATE);
            }

         }
         /**
          * What we want is to regenerate gfx, find a private buffer from scratch,
          * NOT reuse the prog and vb that pre-exists in the menu mesh.
          */
         menu.Render(); // Add to the vertex buffers
         Gfx_end_session(true, true);

         const root = Dropdown_get_root_by_idx(dropdown_mesh.rootidx);
         root.Recalc(SECTION.INHERIT | SECTION.TOP_DOWN);
         root.UpdateGfxPosDimRecursive(root);

         Gfx_activate(dropdown_mesh); // activate the gfx buffers

      }
      /** Else dropdown button click and it's menu is active, deactivate it */
      else {

         btn.text_mesh.UpdateTextCharacter(dp_symbols[0], 0);
         // Need to update the symbol of the text(not only the gfx buffers), 
         // because when the btn will be activated it will be re-inserted in the gfx buffers 
         // and it will use the text_mesh's  string (wich is currently the '-' synmbol).
         btn.text_mesh.mat.text = `${dp_symbols[0]} ${btn.text_mesh.mat.text.slice(2)}`;

         if (menu) {

            dropdown_mesh.DeactivateMenu(dropdown_mesh);
            dropdown_mesh.RemoveChildByIdx(menu.idx); // Remove menu from drop down

            const root = Dropdown_get_root_by_idx(dropdown_mesh.rootidx);
            root.Recalc(SECTION.INHERIT | SECTION.TOP_DOWN);
            root.UpdateGfxPosDimRecursive(root);
         }
      }

      STATE.mesh.SetClicked(btn);
      dropdown_mesh.isOn ^= 0x1;

      return true;
   }

   SetOnMove(params) {

      const mesh = params.source_params;
      STATE.mesh.SetClicked(mesh);

      if (mesh.timeIntervalsIdxBuffer.boundary <= 0) {

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
      if (mesh.StateCheck(MESH_STATE.IN_GRAB) === 0 && mesh.timeIntervalsIdxBuffer.boundary) {

         const intervalIdx = mesh.timeIntervalsIdxBuffer.buffer[0];// HACK !!!: We need a way to know what interval is what, in the 'timeIntervalsIdxBuffer' in a mesh. 
         TimeIntervalsDestroyByIdx(intervalIdx);
         mesh.timeIntervalsIdxBuffer.RemoveByIdx(0); // HACK

         return;
      }

      // Move the mesh
      const mouse_pos = MouseGetPosDif();
      mesh.MoveRecursive(mouse_pos.x, -mouse_pos.y);

   }


   /*******************************************************************************************************************************************************/
   // Alignment
   ReAlign() {

      // Realign menu's text
      const text_mesh = this.children.buffer[0];
      text_mesh.Align_pre(this, ALIGN.LEFT, this.pad);

      let pad = [this.pad[0], this.pad[1]];

      for (let i = 1; i < this.children.boundary; i++) {

         const b = this.children.buffer[i];
         b.Align_pre(this, ALIGN.RIGHT | ALIGN.VERT_CENTER, pad);
         pad[0] += this.children.buffer[i].geom.dim[0] * 2;
      }

   }


}



