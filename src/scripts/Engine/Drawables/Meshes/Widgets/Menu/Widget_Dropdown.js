"use strict";

import { Section } from "../../Section.js";
import { GetRandomColor } from "../../../../../Helpers/Helpers.js";
import { MouseGetPosDif } from "../../../../Controls/Input/Mouse.js";
import { M_Buffer } from "../../../../Core/Buffers.js";
import { Gfx_activate, Gfx_end_session, Gfx_generate_context } from "../../../../Interfaces/Gfx/GfxContext.js";
import { TimeIntervalsCreate, TimeIntervalsDestroyByIdx } from "../../../../Timers/TimeIntervals.js";
import { MESH_ENABLE } from "../../Base/Mesh.js";
import { Widget_Button } from "../WidgetButton.js";
import { Scenes_store_gfx_to_buffer } from "../../../../Scenes.js";
import { Listener_remove_children_event_by_idx, Listener_remove_event_by_idx } from "../../../../Events/EventListeners.js";

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
   return dropdown.rootidx;
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

      super(SECTION.VERTICAL, [5, 5], pos, [10, 10], col2);

      this.isOn = 0x0;
      this.EnableGfxAttributes(MESH_ENABLE.GFX.ATTR_STYLE);
      this.SetStyle(style);
      this.SetName(`DP-${text}`);
      this.type |= MESH_TYPES_DBG.WIDGET_DROP_DOWN;
      this.menu = null;
      this.rootidx = INT_NULL;

      this.dp_symbols = ['+', '-'];
      const btn = new Widget_Button(`${this.dp_symbols[0]} ${text}`, ALIGN.RIGHT, pos, 4, col1, text_col, btn_pad, bold, style, font);

      this.AddItem(btn);

      this.menu = new Section(SECTION.VERTICAL, [10, 2], [OUT_OF_VIEW, OUT_OF_VIEW, 0], [1, 1], TRANSPARENCY(GetRandomColor(), temp_transparency));
      this.menu.type |= MESH_TYPES_DBG.DROP_DOWN_MENU;
      this.menu.parent = this;
      this.menu.SetName(`menu:${this.name}`)

   }

   AddToMenu(mesh) {

      this.menu.AddItem(mesh);
      if (mesh.type & MESH_TYPES_DBG.WIDGET_DROP_DOWN){

         if(this.rootidx === INT_NULL){
            // Create a reference for each root dropdown menu in a Scene
            /* IMPORTANT!!! With the current implementation we must add dropdown widgets to dropdown menus as items 
               in the order of the tree representation. That means each dropdown that adds anothe dropdown must
               already been added to a higher order in the tree dropdown, so that it has the 'rootidx' index.
               ALL DROPDOWNS THAT ARE PART OF THE TREE STRUCT HAVE ONE ROOT DROPDOWN WIDGET, not the index of the parent dropdown.
               */ 
              // Also store to the root dropdown a rootidx of its self
              this.rootidx = Drop_down_set_root(this, mesh);
         }
         else mesh.rootidx = this.rootidx;
      }
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
   ActivateMenu(root) {

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
               child.CreateClickEvent(root.menu.listeners.buffer);
               child.CreateHoverEvent();

               console.log('  -- child:', child.name)
               if (child.isOn) {
                  // If the menu was deactivated while open, then on activation keep its '-' expansion symbol
                  const child_btn = child.children.buffer[0];
                  console.log('  -- Menu is on! run for menu recursiv.')
                  child_btn.text_mesh.mat.text = `${this.dp_symbols[1]} ${child_btn.text_mesh.mat.text.slice(2)}`;
                  Gfx_end_session(true, true); // Must call end gfx private session for each next dropdown menu gfx activation

                  child.ActivateMenu(root); // Run recursive for all dropdown's (as items of a dropdown).
               }
            }
            else { // Case: Generate gfx for children widget meshes 

               child.GenGfxCtx(GFX.PRIVATE);
            }

         }
      }
   }

   DeactivateMenu(dp) {
      /**
       * Deactivate all dp's menu items gfx.
       * Remove all dp's menu items listeners.
       * If item's listeners are child events, do nothing, the events will be winked from the parent event.
       */

      const menu = dp.menu;

      for (let j = 0; j < menu.children.boundary; j++) {

         const item_dp = menu.children.buffer[j];

         // If the menu's item_dp mesh is of type dropdown, run recursively to deactivate mesh's menu.
         if (item_dp.type & MESH_TYPES_DBG.WIDGET_DROP_DOWN && dp.isOn) {

            this.DeactivateMenu(item_dp); // Run recursive for every dropdown in every menu

            // Deactivate the dropdown's button
            const btn_dp = item_dp.children.buffer[0];

            btn_dp.DeactivateGfx();
            // TODO: 'If it is not a item_dp event'. Check it here
            btn_dp.RemoveAllListenEvents(); console.log('Remove Listeners:btn_dp:', btn_dp.name, btn_dp.listeners.buffer);

            // Deactivate gfx for menu's children meshes.
            if (item_dp.gfx) { item_dp.DeactivateGfx(); }
            item_dp.RemoveAllListenEvents(); console.log('Remove Listeners:item_dp:', item_dp.name, item_dp.listeners.buffer);
         }


      }

      if (menu.gfx) // TODO: Shouldn't we check if(menu.isOn)???
         menu.DeactivateGfx();

      // Remove menu's Fake listen events
      menu.RemoveAllListenEvents();

   }

   DestroyRecursive(mesh) {

      for (let i = 0; i < mesh.children.boundary; i++) {

         const child = mesh.children.buffer[i];
         if (child.children.active_count)
            this.DestroyRecursive(child)

      }

      mesh.Destroy();
   }

   Destroy() {

      for (let i = 0; i < this.children.boundary; i++) {

         const child = this.children.buffer[i];
         if (child && child.children.active_count)
            this.DestroyRecursive(child)
      }

      this.RemoveAllListenEvents();

      super.Destroy();
   }


   /*******************************************************************************************************************************************************/
   // Events Handling

   CreateHoverEvent() {

      const btn = this.children.buffer[0];
      btn.CreateListenEvent(LISTEN_EVENT_TYPES.HOVER);
      btn.StateEnable(MESH_STATE.IS_HOVER_COLORABLE);

   }

   CreateClickEvent() {

      const btn = this.children.buffer[0];
      btn.CreateListenEvent(LISTEN_EVENT_TYPES.CLICK_UP);
   }

   CreateMoveEvent() {

      this.CreateListenEvent(LISTEN_EVENT_TYPES.MOVE);
      this.StateDisable(MESH_STATE.IS_FAKE_CLICKABLE);
      this.StateEnable(MESH_STATE.IS_CLICKABLE);
   }

   // Create all listen events recursively for all children, from each mesh's listeners buffer.
   ConstructListeners(_root = null, _mesh = null) {

      const root = _root ? _root : this;

      if(this.listeners.buffer[LISTEN_EVENT_TYPES_INDEX.CLICK]){ // If click exists on the dropdown, should be for moving event.

         this.AddListenEvent(LISTEN_EVENT_TYPES_INDEX.CLICK, this.SetOnMove, null, root.listeners.buffer);
         /**DEBUG */ if(DEBUG.EVENTS_LISTENERS.WIDGET_DROP_DOWN) console.log(' ### Creating Moving event for dropdown:', this.name, ' root', root.name)
      }
      else{ // Create Fke click event for dropdown

         this.CreateListenEvent(LISTEN_EVENT_TYPES.CLICK_UP, true);
         this.AddListenEvent(LISTEN_EVENT_TYPES_INDEX.CLICK, null, null, root.listeners.buffer);
      }

      const btn = this.children.buffer[0];
      /**DEBUG ERROR*/ if (!btn.listeners.buffer[LISTEN_EVENT_TYPES_INDEX.CLICK]) console.error('Dropdown\'s button is missing the click event. Add a CreateClickEvent() to the dropdown');
      
      const params = { // Build the parameters for the OnClick callback function for the dp's button (menu expansion).
         drop_down: this,
         menu: this.menu,
      }
      btn.AddListenEvent(LISTEN_EVENT_TYPES_INDEX.CLICK, this.OnClick, params, this.listeners.buffer);
      /**DEBUG */ if(DEBUG.EVENTS_LISTENERS.WIDGET_DROP_DOWN) console.log(' ### Create btn click for dropdown:', this.name, ' root', root.name)

      if(this.isOn){
         this.menu.ConstructListeners(this); // @@@ 1. pass this for creating the menu Fake event in its dropdown OR 2. pass the top root dropdown's menu for creating the event as child to to one menu only.
      }

   }

   RemoveAllListenersFromDpMenuItems(dp_menu) { // Mainly used to destroy listen events of any deactivated menus that have 'isActive=false' listen events.

      const menu = dp_menu;

      for (let j = 0; j < menu.children.boundary; j++) {

         const child = menu.children.buffer[j];

         // If the menu's child mesh is of type dropdown, run recursively all menus.
         if (child.type)
            this.RemoveAllListenersFromDpMenuItems(child); // Run recursive for every dropdown in every menu

         // It is the button that may have any listen events.
         const btn = menu.children.buffer[0];
         if (btn && btn.listeners.boundary)
            btn.RemoveAllListenEvents();

      }
   }

   RemoveAllListenersFromDP(_dp = null, parent_event) { // Mainly used to destroy listen events of any deactivated menus that have 'isActive=fale' listen events.

      const dp = (_dp) ? _dp : this;

      /**DEBUG ERROR*/ if (!dp || !(dp.type & MESH_TYPES_DBG.WIDGET_DROP_DOWN)) {
         console.error('ERROR: in RemoveAllListenersFromDP(). dp is null or not a Dropdown type. dp:', dp);
         return;
      }

      const btn = dp.children.buffer[0]; // The button of any dropdown should always be the 0-th child .

      // Remove dropdown button's listen events.
      for (let etype = 0; etype < LISTEN_EVENT_TYPES_INDEX.SIZE; etype++) {
         if (btn.listeners.buffer[etype]) {
            Listener_remove_children_event_by_idx(etype, parent_event[etype].idx, btn.listeners.buffer[etype].idx);
            btn.listeners.RemoveByIdx(etype);
         }
      }
   }

   // SEE: ## OnClick()
   OnClick(params) {

      
      /*DEBUG*/if (!params.target_params) {
         console.error('Target_params.params is null, in a OnClick() event. target_params:', params.target_params);
         return;
      }

      const dropdown_mesh = params.target_params.drop_down;
      /*DEBUG*/if (dropdown_mesh.rootidx === INT_NULL) {
         alert('Root for dropdown must be set. ', dropdown_mesh.name);
         return;
      }

      const menu = params.target_params.menu;
      const btn = params.source_params;
      const root = Dropdown_get_root_by_idx(dropdown_mesh.rootidx);
      // console.log('rootname:', root.name, 'root menu:', root.menu.name, ' root listeners:', root.listeners, 'root menu listeners:', root.menu.listeners);

      /** If the menu for the clicked dropdown is not active, activate it and all of its items.
       * Do the same for each item of type dropdown widget that has its menu active/opened.
       */
      if (!dropdown_mesh.isOn) {

         /**
          * If dropdown menu is not active:
          * ->Add the menu as a child of the dropdown(in the dropdown's children buffer).
          * -->Generate gfx context for the menu.
          * -->Create Fake click event for the menu(so all its items will have a parent event in the 'EventListeners' buffer).
          * --->Generate gfx context for all menu's items(menu's children buffer).
          * --->Create listen events for all menu's items that are of type 'Dropdown'.(btn click event, menus fake click(if menu isOn)).
          * --->Any othe meshes should handle any listen events in their classes. << Must call for create event from here? >>
          * 
          * We have 2 cases of implementing the listeners of all dropdown type items of the root dropdown.
          * 1. Set all event listeners as a child of the root menu's Fake click.
          * 2. Set all event listeners as a child of each dropdown menu's Fake click.
          * The decision is made uppon efficiency measures, like the number of child events of a specific dropdown menu's items.
          * More than 2-3-4 child events should be added to it's menu event, so a Fake event for that menu must be created.
          */

         btn.text_mesh.UpdateTextCharacter(dropdown_mesh.dp_symbols[1], 0); // Update the symbol text.
         dropdown_mesh.AddItem(menu); // Add the menu, which is a storage of Widget_Dropdown only, as a child to the drop_down
         menu.gfx = Gfx_generate_context(menu.sid, menu.sceneidx, menu.geom.num_faces, GFX.PRIVATE);
         Scenes_store_gfx_to_buffer(menu.sceneidx, menu);

         // Create Fake click event in the menu mesh, so that any items that have listen events, will be registered as children events.
         if (false) { // TODO: Implement auto-select which type of events-creation to follow. Case 1: all events added to root dp menu. Case 2: Each menu gets a Fake event to store it's item events
            // Case we store all events in the menu of the root dropdown 
            if (root.menu.listeners.buffer[LISTEN_EVENT_TYPES_INDEX.CLICK] === null)
               root.menu.CreateListenEvent(LISTEN_EVENT_TYPES.CLICK_UP, root.menu.OnFakeClick, root.menu.listeners.buffer);
         }
         else {
            // Case we store all events in the menu of each dropdown (tree like structof the events, in the EventListeners class buffer)
            if (menu.listeners.buffer[LISTEN_EVENT_TYPES_INDEX.CLICK] === null)
               menu.CreateListenEvent(LISTEN_EVENT_TYPES.CLICK_UP, menu.OnFakeClick, menu.listeners.buffer);
         }


         // Add any menu children items(in private gfx buffers)
         for (let i = 0; i < menu.children.boundary; i++) {

            const child = menu.children.buffer[i];
            if (child.type & MESH_TYPES_DBG.WIDGET_DROP_DOWN) { // Case child is another dropdown

               child.gfx = Gfx_generate_context(child.sid, child.sceneidx, child.geom.num_faces, GFX.SPECIFIC, [menu.gfx.prog.idx, menu.gfx.vb.idx]);
               Scenes_store_gfx_to_buffer(child.sceneidx, child);

               const child_btn = child.children.buffer[0];
               child_btn.GenGfxCtx(GFX.PRIVATE);

               // Create Click events for the button of any meshes of type Dropdown widget.
               child.CreateClickEvent();

               if (child.isOn) { // Case the child dropdown has an 'active' menu.

                  // If the menu was deactivated while open, then on activation keep its '-' symbol
                  child_btn.text_mesh.mat.text = `${dropdown_mesh.dp_symbols[1]} ${child_btn.text_mesh.mat.text.slice(2)}`;
                  Gfx_end_session(true, true); // Must call end gfx private session before activating child dp's menu to new private gfx buffers.
                  child.ActivateMenu(root);
               }

            }
            else { // Case: Generate gfx for any other children meshes (non dropdown meshes).

               child.GenGfxCtx(GFX.PRIVATE);
            }

         }


         /**
          * After creating/activating all dp menu's items(including any dps inside each of any menus(recursive)),
          * we .Render() that is adding all mesh data to the gfx buffers,
          * we call Recalc() to recalculate the any dimentions and positions change in the master section mesh(dropdown_mesh),
          * and we update the dim and pos gfx buffers via the Mesh class update functions.
          * 
          * What we want is to regenerate gfx, find a private buffer from scratch,
          * NOT reuse the prog and vb that pre-exists in the menu mesh, maybe it is used for another private gfx initialization.
          */
         menu.Render(MESH_TYPES_DBG.UI_INFO_GFX); // Add to the vertex buffers
         Gfx_end_session(true, true);

         root.Recalc(SECTION.INHERIT | SECTION.TOP_DOWN);
         root.UpdateGfxPosDimRecursive(root);

         Gfx_activate(dropdown_mesh); // activate the gfx buffers
         // menu.ConstructListeners(dropdown_mesh, dropdown_mesh.SetOnMove);
         menu.ConstructListeners(dropdown_mesh);
         // dropdown_mesh.ConstructListeners(dropdown_mesh, dropdown_mesh.SetOnMove);
         // menu.geom.dim[1] += 40;

      }
      else { /** DEACTIVATE: Else dropdown button click and it's menu is active, so deactivate the menu and its items. */

         btn.text_mesh.UpdateTextCharacter(dropdown_mesh.dp_symbols[0], 0);

         /* Need to update the symbol of the text(not only the gfx buffers), 
            because when the btn will be activated it will be re-inserted in the gfx buffers 
            and it will use the text_mesh's  string (wich is currently the '-' synmbol). */
         btn.text_mesh.mat.text = `${dropdown_mesh.dp_symbols[0]} ${btn.text_mesh.mat.text.slice(2)}`;

         if (menu) {

            const clickidx = LISTEN_EVENT_TYPES_INDEX.CLICK;
            // Case we have stored this menu's items events to the root menu Fake event,
            // Remove all listen events of this menu's items from EventListeners buffer.(one by one, based on the root menu event(parent_event)).
            if (menu.listeners.buffer[clickidx] === null) {

               /**
                * Here we remove all listen events(registered as children events of the root menu).
                * IMPORTANT! The listen events may exist in any nested child widget-mesh, 
                * so not only recursion is required but we must visit all nested meshes to check for listen events.
                * NOTE: For widgets, let their class handle all the listen events removal,
                * for structures that may have arbitary meshes, we must check and remove.
                */
               for (let i = 0; i < menu.children.boundary; i++) {

                  const child = menu.children.buffer[i];

                  if ((child.type & MESH_TYPES_DBG.WIDGET_DROP_DOWN) && child.children.active_count) // If child is of type Dropdown...
                     child.RemoveAllListenersFromDP(child, root.menu.listeners.buffer); // ...remove it's button click listener.

                  if (child.listeners.buffer[clickidx] && child.listeners.buffer[clickidx].is_child_event) // In any other case, if the child has a listener, remove it.
                     Listener_remove_children_event_by_idx(clickidx, root.menu.listeners.buffer[clickidx], child.listeners.buffer[clickidx]);
               }
            }

            dropdown_mesh.DeactivateMenu(dropdown_mesh);
            dropdown_mesh.RemoveChildByIdx(menu.idx); // Rememove menu from drop down

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

      // Suppose the clicked mesh to be moved is only a menu.
      const MoveFn = mesh.OnMove;
      // const MoveFn = mesh.parent.OnMove;

      if (mesh.timeIntervalsIdxBuffer.boundary <= 0) {

         const idx = TimeIntervalsCreate(10, `Move: ${mesh.name}`, TIME_INTERVAL_REPEAT_ALWAYS, MoveFn, mesh);
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
      mesh.Move(mouse_pos.x, -mouse_pos.y);
      console.log(`Moving: ${mesh.name}`)

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

   /*******************************************************************************************************************************************************/
   // Setters_Getters
   SetType(type_flag) {

      this.type |= type_flag;
      const btn = this.children.buffer[0];
      btn.type |= type_flag;
      btn.text_mesh.type |= type_flag;

   }

   SetText(text) {
      const btn = this.children.buffer[0];
      btn.text_mesh.UpdateText(text);
   }
}



