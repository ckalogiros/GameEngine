"use strict";

import { Section } from "../../Section.js";
import { GetSequencedColor } from "../../../../../Helpers/Helpers.js";
import { MouseGetPosDif } from "../../../../Controls/Input/Mouse.js";
import { M_Buffer } from "../../../../Core/Buffers.js";
import { Gfx_activate, Gfx_generate_context } from "../../../../Interfaces/Gfx/GfxContextCreate.js";
import { TimeIntervalsCreate, TimeIntervalsDestroyByIdx } from "../../../../Timers/TimeIntervals.js";
import { MESH_ENABLE } from "../../Base/Mesh.js";
import { Widget_Button } from "../WidgetButton.js";
import { Listener_remove_children_event_by_idx } from "../../../../Events/EventListeners.js";
import { Find_gfx_from_parent_ascend_descend } from "../../../../Interfaces/Gfx/GfxContextFindMatch.js";

/**
 * SEE: ### Widget_Dropdown
 * 
 * Widget Dropdown Gfx context algorithm.
 * 
 * 1. If dp ! belongs to a dp-menu: Create new PRIVATE.
 * 2. If dp belongs to a dp-menu: Gather all gfx contexes of only the 'direct' menu's children.
 *    . Find the gfx contexes of the gathered gfx's that match the sid of the new dp: and call the GenerateGfx() with SPECIFIC gfx.
 *    . If non sid match found, create new PRIVATE (The createion of the sid gfx program will be automaticaly contructed) 
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


// const tr = .02;
const tr = .5;
export class Widget_Dropdown extends Section {

   isOn; // Bool for checking a dropdown's menu expanded/contructed.
   menu; // SEE ## Dropdown Menu 
   rootidx; // Store the root's dropdown index (of the '_root_dropdown');
   dp_symbols; // Text symbols for denoting a dropdown's Expanded/contracted menu. // TODO: Add textured symbols OR create a font texture with symbols for dropdown expansion/contraction.
   depth_level; // The tree depth level that the dropdown exists (root dp = 0 depth).

   constructor(text, pos, dim, col1 = GREY3, col2 = PINK_240_60_160, text_col = WHITE, btn_pad = [0, 0], bold = .6, font = FONTS.SDF_CONSOLAS_LARGE, style = [2, 5, 2]) {

      // super(SECTION.VERTICAL, [2, 2], pos, [10, 10], TRANSPARENCY(GREY3, tr), null, style);
      super(SECTION.VERTICAL, [2, 2], pos, [10, 10], col2, null, style);

      this.isOn = 0x0;
      this.SetName(`DP-${text}`);
      this.type |= MESH_TYPES_DBG.WIDGET_DROP_DOWN;
      this.rootidx = INT_NULL;
      this.depth_level = 0;

      // this.menu = new Section(SECTION.VERTICAL, [10, 10], [OUT_OF_VIEW, OUT_OF_VIEW, pos[2] + 1], [1, 1], TRANSPARENCY(GetSequencedColor(), tr));
      this.menu = new Section(SECTION.VERTICAL, [10, 10], [OUT_OF_VIEW, OUT_OF_VIEW, pos[2] + 1], [1, 1], TRANSPARENCY(GREY3, tr));
      this.menu.type |= MESH_TYPES_DBG.DROP_DOWN_MENU;
      this.menu.parent = this;
      this.menu.SetName(`MENU-${this.name}`);
      { // Multi color vertex
         // this.menu.sid.attr |= SID.ATTR.COL4_PER_VERTEX;
         // this.menu.mat.col = [WHITE, RED, GREEN, BLUE];
         // this.menu.mat.defCol = [WHITE, RED, GREEN, BLUE];
         // this.menu.mat.col[3] = .5;
         // this.menu.mat.col[7] = .5;
         // this.menu.mat.col[11] = .5;
         // this.menu.mat.col[15] = .6;
      }

      this.dp_symbols = ['+', '-'];
      // const btn = new Widget_Button(`${this.dp_symbols[0]} ${text}`, ALIGN.RIGHT, [pos[0], pos[1], this.menu.geom.pos[2] + 1], 4, TRANSPARENCY(GREY4, tr), text_col, btn_pad, bold, style, font);
      // const btn = new Widget_Button(`${this.dp_symbols[0]} ${text}`, ALIGN.RIGHT, [pos[0], pos[1], this.menu.geom.pos[2] + 1], 4, TRANSPARENCY(GREY4, 0), text_col, btn_pad, bold, style, font);
      const btn = new Widget_Button(`${this.dp_symbols[0]} ${text}`, ALIGN.RIGHT, [pos[0], pos[1], this.menu.geom.pos[2] + 1], 6, TRANSPARENCY(GREY4, 0), text_col, btn_pad, bold, style, font);
      btn.SetName(`BTN-${this.name} btn_id:${btn.id}`)
      btn.debug_info.type |= INFO_LISTEN_EVENT_TYPE.LISTENERS;

      this.AddItem(btn);
   }

   AddToMenu(mesh) {


      if (mesh.type & MESH_TYPES_DBG.WIDGET_DROP_DOWN) {

         mesh.depth_level = this.depth_level + 1; // Set the depth of the new dp.
         // console.log('dropdown:', mesh.name, ' depth:', mesh.depth_level)

         if (this.rootidx === INT_NULL) {
            // Create a reference for each root dropdown menu in a Scene
            /* IMPORTANT!!! With the current implementation we must add dropdown widgets to dropdown menus as items 
               in the order of the tree representation. That means each dropdown that adds another dropdown must
               already been added to a higher order in the tree dropdown, so that it has the 'rootidx' index.
               ALL DROPDOWNS THAT ARE PART OF THE TREE STRUCT HAVE ONE ROOT DROPDOWN WIDGET, not the index of the parent dropdown.
            */
            // Also store to the root dropdown a rootidx of its self
            this.rootidx = Drop_down_set_root(this, mesh);
         }
         else {
            mesh.rootidx = this.rootidx;
         }
      }

      this.menu.AddItem(mesh);
      mesh.geom.pos[2] += this.geom.pos[2];
      mesh.geom.pos[2]++;
      console.log(']]]]]]]]]]]]]]]]]]]]]]]]]]]]]')
      console.log(mesh.name, mesh.geom.pos[2])
   }


   /*******************************************************************************************************************************************************/
   // Graphics

   GenGfxCtx(FLAGS = GFX_CTX_FLAGS.ANY, gfx_idxs, parent = null) {

      if (FLAGS & GFX_CTX_FLAGS.PRIVATE) {

         const gfxidxs = Find_gfx_from_parent_ascend_descend(this, this.parent);
         gfxidxs.rect.FLAGS |= FLAGS; // NOTE: The only way to pass .PRIVATE to 'Gfx_generate_context()'
         this.gfx = Gfx_generate_context(this.sid, this.sceneidx, this.geom.num_faces, gfxidxs.rect.FLAGS, gfxidxs.rect.idxs);
      }
      else {
         this.gfx = Gfx_generate_context(this.sid, this.sceneidx, this.geom.num_faces, FLAGS, null);
      }

      const btn = this.children.buffer[0];
      btn.GenGfxCtx(FLAGS, [this.gfx.prog.idx, this.gfx.vb.idx]); // Set button's area gfx same with dropDown mesh 

      return this.gfx;
   }

   GenMenuGfx(root, FLAGS) {

      const menu = this.menu;

      const dpgfxidxs = [this.gfx.prog.idx, this.gfx.vb.idx];

      if (menu.gfx) { // Case: Any other dp's menu except root + method of remove was fast-remove:'set alpha to 0'.

         if (this.id === root.id) { // Case: Menu activation of the root dropdown.
            // Just set the gfx buffers counts, vb and ib, to the count of menu and all its items 
            console.log('Menu fgx exists: ', menu.name);
         }
      }
      else { // Case: All dp menus to its own gfx.

         FLAGS |= GFX_CTX_FLAGS.SPECIFIC;
         menu.gfx = Gfx_generate_context(menu.sid, menu.sceneidx, menu.geom.num_faces, FLAGS, dpgfxidxs);

         for (let i = 0; i < menu.children.boundary; i++) {

            const item = menu.children.buffer[i];

            if (item.type & MESH_TYPES_DBG.WIDGET_DROP_DOWN) { // Case item is another dropdown

               item.gfx = Gfx_generate_context(item.sid, item.sceneidx, item.geom.num_faces, GFX_CTX_FLAGS.SPECIFIC, dpgfxidxs);

               const btn = item.children.buffer[0];
               // btn.GenGfxCtx(GFX_CTX_FLAGS.SPECIFIC, dpgfxidxs, textgfx);
               btn.GenGfxCtx(GFX_CTX_FLAGS.PRIVATE);
               // btn.GenGfxCtx(FLAGS);

               // Create Click events for any meshes of type Dropdown
               item.CreateClickEvent(root.menu.listeners.buffer);
               item.CreateHoverEvent();

               if (item.isOn) { // Case the item dropdown has an 'active' menu, activate the item's dp menu (runs recursive for any opened sub dp menus). 

                  // If the menu was deactivated while open, then on activation keep its '-' symbol
                  btn.text_mesh.mat.text = `${this.dp_symbols[1]} ${btn.text_mesh.mat.text.slice(2)}`;
                  //*Gfx_end_session(true, true); // Must call end gfx private session before activating item dp's menu to new private gfx buffers.
                  item.GenMenuGfx(root, FLAGS);
                  if (DEBUG.WIDGET_DROPDOWN) console.log('\n      --------- RETURN FROM ACTIVATE() ')
               }

            }
            else { // Case: Generate gfx for any other children meshes (non dropdown meshes).

               // TODO. Do we genarate gfx for any other widget in the same gfx????  
               // item.GenGfxCtx(GFX_CTX_FLAGS.SPECIFIC, dpgfxidxs, textgfx);
               item.GenGfxCtx(GFX_CTX_FLAGS.PRIVATE);
               // item.GenGfxCtx(FLAGS);
            }
         }
      }


   }

   RenderMenu(root) {

      const menu = this.menu;

      if (menu.is_gfx_inserted) { // Case: Menu removed by alpha, justset alpha back to default.

         menu.SetColorAlpha(menu.mat.defCol[3]);

         // const text_gfx = Find_gfx_context_for_text_in_dp_menu(menu);
         for (let i = 0; i < menu.children.boundary; i++) {

            const item = menu.children.buffer[i];

            if (item.type & MESH_TYPES_DBG.WIDGET_DROP_DOWN) { // Case item is another dropdown

               item.SetColorAlpha(item.mat.defCol[3]);

               const btn = item.children.buffer[0];
               btn.SetColorAlpha(btn.mat.defCol[3], 1);

               // Create Click events for any meshes of type Dropdown
               item.CreateClickEvent(root.menu.listeners.buffer);
               item.CreateHoverEvent();

               if (item.isOn) { // Case the item dropdown has an 'active' menu, activate the item's dp menu (runs recursive for any opened sub dp menus). 

                  // If the menu was deactivated while open, then on activation keep its '-' symbol
                  btn.text_mesh.mat.text = `${this.dp_symbols[1]} ${btn.text_mesh.mat.text.slice(2)}`;
                  item.RenderMenu(root);
               }

            }
            else { // Case: Generate gfx for any other children meshes (non dropdown meshes).
               // HACK: Pass 2 alpha values, in case it is of type label-button etc, 1 for the area and 1 for the text.
               item.SetColorAlpha(item.mat.defCol[3], 1);
            }
         }
      }
      else { // Case: First time initialization OR each dp's menu to its own gfx, add menu to gfx

         menu.Render(MESH_TYPES_DBG.UI_INFO_GFX); // Add to the vertex buffers
         //*Gfx_end_session(true, true);
         Gfx_activate(this); // activate the gfx buffers
      }

   }

   Render() {

      super.AddToGfx();
      const btn = this.children.buffer[0];
      btn.Render()

      if (this.isOn) {
         for (let i = 0; i < this.children.boundary; i++) {

            const child = this.children.buffer[i];
            if (child) child.Render();
         }
      }
   }

   // SEE: ## ActivateMenu() 
   ActivateMenu(root) {

      const menu = this.menu;
      const btn = this.children.buffer[0];
      const dp_symbols = this.dp_symbols;

      btn.text_mesh.UpdateTextCharacter(dp_symbols[1], 0);

      if (DEBUG.WIDGET_DROPDOWN) console.log('      --------- Activating secondary menus')

      menu.gfx = Gfx_generate_context(menu.sid, menu.sceneidx, menu.geom.num_faces, GFX_CTX_FLAGS.PRIVATE);

      const text_gfx = Find_gfx_context_for_text_in_dp_menu(menu);
      if (text_gfx) {
         if (DEBUG.WIDGET_DROPDOWN) console.log('                FOUNT TEXT!!!!!!!', text_gfx)
      }

      // Here we have to gfxGen all menus children, NOT private
      for (let i = 0; i < menu.children.boundary; i++) {

         const child = menu.children.buffer[i];
         if (child.type & MESH_TYPES_DBG.WIDGET_DROP_DOWN) { // Case child is another dropdown

            child.gfx = Gfx_generate_context(child.sid, child.sceneidx, child.geom.num_faces, GFX_CTX_FLAGS.SPECIFIC, [menu.gfx.prog.idx, menu.gfx.vb.idx]);

            const btn = child.children.buffer[0];
            btn.GenGfxCtx(GFX_CTX_FLAGS.PRIVATE, [menu.gfx.prog.idx, menu.gfx.vb.idx], text_gfx);

            // Create Click events for any meshes of type Dropdown
            child.CreateClickEvent(root.menu.listeners.buffer);
            child.CreateHoverEvent();

            if (child.isOn) {
               // If the menu was deactivated while open, then on activation keep its '-' expansion symbol
               const child_btn = child.children.buffer[0];
               child_btn.text_mesh.mat.text = `${this.dp_symbols[1]} ${child_btn.text_mesh.mat.text.slice(2)}`;
               child.ActivateMenu(root); // Run recursive for all dropdown's (as items of a root dropdown).
            }
         }
         else { // Case: Generate gfx for children widget meshes 
            child.GenGfxCtx(GFX_CTX_FLAGS.PRIVATE);
         }
      }
   }

   DeactivateMenu(dp) {

      /**
       * Deactivate dropdown.
       * If dp is root-dp: 
       *    just set the vb.count to the root dp's end in the vertex buffer
       *    update the vb
       *    set the index buffer count to the count of one dropdown's meshes
       * if the dp is not root or it does not start at 0 index in the vb:
       *    dectivate all menu's meshes via color alpha value.
       *    Use 'vb.Remove_geometry_fast(gfx, num_faces)' function
       * 
       * In any case:   
       *    Must remove listeners
       *    Must remove menu and items as it happens in the current implementation
       */

      const menu = dp.menu;

      for (let j = 0; j < menu.children.boundary; j++) {

         const item_dp = menu.children.buffer[j];

         // If the menu's item_dp mesh is of type dropdown, run recursively to deactivate mesh's menu.
         if (item_dp.type & MESH_TYPES_DBG.WIDGET_DROP_DOWN) {
            if (dp.isOn) {

               this.DeactivateMenu(item_dp); // Run recursive for every dropdown in every menu

               // Deactivate the dropdown's button
               const btn_dp = item_dp.children.buffer[0];

               btn_dp.SetColorAlpha(0, 0);
               btn_dp.RemoveAllListenEvents();

               // Deactivate gfx for menu's children meshes.
               item_dp.SetColorAlpha(0);
               item_dp.RemoveAllListenEvents();
            }
         }
         else {

            /**DEBUG*/ if (DEBUG.WIDGET_DROPDOWN) if (!item_dp.gfx) console.log(item_dp.name)
            if (item_dp.gfx) item_dp.SetColorAlpha(0, 0);

         }


      }

      if (menu.gfx) // FIXME: Shouldn't we check if(menu.isOn)???
         menu.SetColorAlpha(0);

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
   }

   CreateClickEvent() {
      const btn = this.children.buffer[0];
      btn.CreateListenEvent(LISTEN_EVENT_TYPES.CLICK_UP);
   }

   CreateMoveEvent() {
      this.CreateListenEvent(LISTEN_EVENT_TYPES.MOVE);
   }

   CreateAndAddEvent(evt_type, root_evt) {

      const btn = this.children.buffer[0];
      switch (evt_type) {
         case LISTEN_EVENT_TYPES_INDEX.HOVER: {
            btn.CreateListenEvent(LISTEN_EVENT_TYPES.HOVER);
            btn.AddListenEvent(LISTEN_EVENT_TYPES_INDEX.HOVER, null, null, root_evt);
            break;
         }
         case LISTEN_EVENT_TYPES_INDEX.CLICK: {
            btn.CreateListenEvent(LISTEN_EVENT_TYPES.CLICK_UP);
            const params = { // Build the parameters for the OnClick callback function for the dp's button (menu expansion).
               drop_down: this,
               menu: this.menu,
            }
            btn.AddListenEvent(LISTEN_EVENT_TYPES_INDEX.CLICK, this.OnClick, params, this.listeners.buffer);
            break;
         }
      }
   }

   // Create all listen events recursively for all children, from each mesh's listeners buffer.
   ConstructListeners(_root = null, _mesh = null) {

      const root = _root ? _root : this;


      this.CreateListenEvent(LISTEN_EVENT_TYPES.HOVER, true);
      this.AddListenEvent(LISTEN_EVENT_TYPES_INDEX.HOVER, null, null, root.listeners.buffer);

      if (this.listeners.buffer[LISTEN_EVENT_TYPES_INDEX.CLICK]) { // If click exists on the dropdown, should be for moving event.

         this.AddListenEvent(LISTEN_EVENT_TYPES_INDEX.CLICK, this.SetOnMove, null, root.listeners.buffer);
         /**DEBUG */ if (DEBUG.EVENTS_LISTENERS.WIDGET_DROP_DOWN) console.log(' ### Creating Moving event for dropdown:', this.name, ' root', root.name)
      }
      else { // Create Fake click event for dropdown

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
      /**DEBUG */ if (DEBUG.EVENTS_LISTENERS.WIDGET_DROP_DOWN) console.log(' ### Create btn click for dropdown:', this.name, ' root', root.name)

      if (this.isOn) {
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

      if (!dropdown_mesh.isOn) { // Case: Activate Menu 

         if (DEBUG.WIDGET_DROPDOWN) console.log('\n\n')
         if (DEBUG.WIDGET_DROPDOWN) console.log('----------------------- Activating Dropdown:', dropdown_mesh.name)

         // Create Fake click event in the menu mesh, so that any items that have listen events, will be registered as children events.
         if (false) { // TODO: Implement auto-select which type of events-creation to follow. Case 1: all events added to root dp menu. Case 2: Each menu gets a Fake event to store it's item events
            // Case we store all events in the menu of the root dropdown 
            if (root.menu.listeners.buffer[LISTEN_EVENT_TYPES_INDEX.CLICK] === null)
               root.menu.CreateListenEvent(LISTEN_EVENT_TYPES.CLICK_UP, root.menu.OnFakeClick, root.menu.listeners.buffer);
         }
         else {
            // Case we store all events in the menu of each dropdown (tree like struct of the events, in the EventListeners buffer)
            if (menu.listeners.buffer[LISTEN_EVENT_TYPES_INDEX.CLICK] === null)
               menu.CreateListenEvent(LISTEN_EVENT_TYPES.CLICK_UP, menu.OnFakeClick, menu.listeners.buffer);
            if (menu.listeners.buffer[LISTEN_EVENT_TYPES_INDEX.HOVER] === null)
               menu.CreateListenEvent(LISTEN_EVENT_TYPES.HOVER, null, menu.listeners.buffer);
         }

         btn.text_mesh.UpdateTextCharacter(dropdown_mesh.dp_symbols[1], 0); // Update the symbol text.
         dropdown_mesh.AddItem(menu); // Add the menu, which is a storage of Widget_Dropdown only, as a child to the drop_down

         dropdown_mesh.GenMenuGfx(root, GFX_CTX_FLAGS.PRIVATE);
         dropdown_mesh.RenderMenu(root);

         menu.ConstructListeners(dropdown_mesh);

         // TODO: The scroller section must grow only in width, not inn height.
         // If dropdown is part of another section, we must recalculate from the parent section to recalculate its position and dimention.
         // if (root.parent && root.parent.type & MESH_TYPES_DBG.SECTION_MESH) {
         //    // const size = root.parent.Recalc(SECTION.INHERIT | SECTION.TOP_DOWN);
         //    // root.parent.UpdateGfxPosDimRecursive(root.parent);
         //    const size = root.Recalc(SECTION.INHERIT | SECTION.TOP_DOWN);
         //    root.parent.TempRecalcAll(size[0]);
         //    // root.parent.UpdateGfxPosDimRecursive(root);
         //    root.UpdateGfxPosDimRecursive(root);
         // }
         // else {
         //    root.Recalc(SECTION.INHERIT | SECTION.TOP_DOWN);
         //    root.UpdateGfxPosDimRecursive(root);
         // }

         
         root.Recalc(SECTION.INHERIT | SECTION.TOP_DOWN | SECTION.EXPAND);
         root.UpdateGfxPosDimRecursive(root);
         
         if (root.parent && root.parent.type & MESH_TYPES_DBG.WIDGET_SCROLLER)
            root.parent.SetScissorBox();

      }
      else {  // Case: Deactivete Menu 

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

            // if (root.parent && root.parent.type & MESH_TYPES_DBG.SECTION_MESH) {
            //    // const size = root.parent.Recalc(SECTION.INHERIT | SECTION.TOP_DOWN);
            //    // root.parent.UpdateGfxPosDimRecursive(root.parent);
            //    const size = root.Recalc(SECTION.INHERIT | SECTION.TOP_DOWN);
            //    root.parent.TempRecalcAll(size[0]);
            //    // root.parent.UpdateGfxPosDimRecursive(root);
            //    root.UpdateGfxPosDimRecursive(root);
            // }
            // else {
            //    root.Recalc(SECTION.INHERIT | SECTION.TOP_DOWN);
            //    root.UpdateGfxPosDimRecursive(root);
            // }

            root.Recalc(SECTION.INHERIT | SECTION.TOP_DOWN);
            root.UpdateGfxPosDimRecursive(root);
            
            if (root.parent && root.parent.type & MESH_TYPES_DBG.WIDGET_SCROLLER)
               root.parent.SetScissorBox();
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

   // SEE ### OnMove Events Implementation Logic
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
         mesh.timeIntervalsIdxBuffer.RemoveByIdx(0); // HACK: We assume that there is only one time interval index for all meshes. What happenns when we use more???

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

   GetSize(size = [0, 0]) {

      // Accum dropdown's size
      size[0] += this.children.buffer[0].geom.dim[0] + this.margin[0];
      size[1] += this.children.buffer[0].geom.dim[1] + this.margin[1];

      if (this.isOn) { // If the menu is active, accum its size
         size[0] += this.menu.geom.dim[0];
         size[1] += this.menu.geom.dim[1];
      }

      return size;
   }
}


/*******************************************************************************************************************************************************/
// Helpers

function Find_gfx_context_for_text_in_dp_menu(menu) {

   for (let i = 0; i < menu.children.boundary; i++) {

      const child = menu.children.buffer[i];
      if (child.type & MESH_TYPES_DBG.WIDGET_DROP_DOWN) {
         const btn_text = child.children.buffer[0].text_mesh; // The button of any dropdown suppose to be the first child.
         if (btn_text.gfx) return [btn_text.gfx.prog.idx, btn_text.gfx.vb.idx];
      }
      if ((child.type & MESH_TYPES_DBG.WIDGET_TEXT)) {
         return [child.gfx.prog.idx, child.gfx.prog.idx];
      }
      if ((child.type & MESH_TYPES_DBG.WIDGET_TEXT_LABEL)) {
         const btn_text = child.children.buffer[0]; // The text of any label widget suppose to be the first child.
         return [btn_text.gfx.prog.idx, btn_text.gfx.prog.idx];
      }
   }

   return null;
}

