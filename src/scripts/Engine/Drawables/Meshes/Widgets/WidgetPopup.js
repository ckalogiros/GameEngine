"use strict";

import { GlCheckSid } from '../../../../Graphics/GlProgram.js';
import { Helpers_calc_bottom_right_pos } from '../../../../Helpers/Helpers.js';
import { MouseGetPos } from '../../../Controls/Input/Mouse.js';
import { MESH_ENABLE } from '../Base/Mesh.js';
import { Section } from '../Panel.js';
import { CopyArr2 } from '../../../../Helpers/Math/MathOperations.js';
import { Gfx_activate, Gfx_deactivate, Gfx_end_session, Gfx_get_pool, Menu_options_create, Request_private_gfx_ctx } from '../../../MenuOptions/MenuOptionsBuilder.js';



class Widget_PopUp extends Section {

   isActive;
   menu_options_idx; // An index to the menu options buffer(MenuOptionsBuilder).

   constructor(pos = [0, 0, 0], dim = [0, 0], col = TRANSPARENT) {

      pos[2] += 1;

      super(SECTION.VERTICAL, [10,10], pos, dim, col);
      const fontSize = 8;
      pos[0] -= this.geom.dim[0] - 6;
      pos[1] -= this.geom.dim[1] - fontSize * 2 - 8;
      pos[2] += 1;

      this.type |= MESH_TYPES_DBG.WIDGET_POP_UP | this.geom.type | this.mat.type;

      this.EnableGfxAttributes(MESH_ENABLE.GFX.ATTR_STYLE);
      this.SetStyle([6, 4, 3]);
      this.SetName('Root popup');

      this.CreateListenEvent(LISTEN_EVENT_TYPES.CLICK_DOWN, this.OnClick)
      this.CreateListenEvent(LISTEN_EVENT_TYPES.HOVER);
      this.StateEnable(MESH_STATE.IS_HOVER_COLORABLE);

      this.isActive = false;

   }

   GenGfx() {

      // Must guarantee that the options menu first mesh is of type: Section,
      // so that we can steal its vbidx and simply add the popup to the same vertex buffer. 
      // const vbidx = this.children.buffer[0].gfx.vb.idx;
      const gfx = super.GenGfx(GL_VB.NEW);
      return gfx;
   }

   ActivatePopup() {

      Gfx_activate(this);
      // this.CreateListenEvent(LISTEN_EVENT_TYPES.CLICK_DOWN, this.OnClick)
      // this.CreateListenEvent(LISTEN_EVENT_TYPES.HOVER);
      this.isActive = true;
   }

   DeactivatePopup() {
      
      // this.DeactivateSecondaryPopups(); // First deactivate any other popups rooted to the this popup (which is the root).

      // for (let i = 0; i < this.children.count; i++) { // Then 

      //    const mesh = this.children.buffer[i];

      //    if(mesh){

      //       Listener_remove_events_all(LISTEN_EVENT_TYPES.CLICK_DOWN, mesh.listeners);
      //       Listener_hover_remove_by_idx(mesh.listen_hover_idx);
            
      //       GlResetVertexBuffer(mesh.gfx, 1);
      //       mesh.Set_graphics_vertex_buffer_render(false);
      //    }
         
      // }

      // Recursive_deactivate_secondary_popups(this);

      Gfx_deactivate(this); // Recursively deactivates the private buffers of popup and all its options 
      this.RemoveChildren(); // Remove from the childrens buffer.
      this.isActive = false;
   }
   
   /**
    * Runs from a popup menu of type WIDGET_POP_UP,
    * and deactivates only the next popups that are roted to the 'this' popup.
    * If this popuup does not have any popups opened,
    * it will do nothing! 
    */
   DeactivateSecondaryPopups() {

      for (let i = 0; i < this.children.count; i++) {
         
         const mesh = this.children.buffer[i];
         if(mesh){
            
            // Deactivate all meshes of type 'WIDGET_POP_UP' with all its options(recursively), from the curent popup level.
            if (mesh.type & MESH_TYPES_DBG.WIDGET_POP_UP) {
   
               // Recursive_deactivate_secondary_popups(mesh);
               mesh.RemoveChildren(); // TODO: Do we need to strip down all meshes??? Only if they are shared pointers to some mesh of the appliction
               mesh.Set_graphics_vertex_buffer_render(false);
               this.RemoveChildByIdx(i); // Remove from the childrens buffer.
               _popUpGfx.secondary_popups.Deactivate(mesh.gfx.prog.idx, mesh.gfx.vb.idx);
            }
         }
      }
   }
}

let _popup = null;

// Initialize
export function Initializer_popup_initialization(){

   _popup = new Widget_PopUp([200, 300, 0], [35,50], TRANSPARENCY(GREY2, .1));

   Request_private_gfx_ctx(_popup, GFX_CTX_FLAGS.INACTIVE | GFX_CTX_FLAGS.PRIVATE);
   Gfx_end_session(true)
   _popup.DeactivatePopup();
}

/** DO NOT DELETE */
// function Recursive_deactivate_secondary_popups(_mesh) {

//    const children = _mesh.children;
   
//    for (let i = 0; i < children.count; i++) {
      
//       const mesh = children.buffer[i];
//       if (mesh){

//          if (mesh.children.count)
//             Recursive_deactivate_secondary_popups(mesh)
   
//          GlResetVertexBuffer(mesh.gfx);
//          _popUpGfx.secondary_popups.Deactivate(mesh.gfx.prog.idx, mesh.gfx.vb.idx);

//       }
//    }
// }

/**
 * TODO: SEE ## Widget_popup_handler_onclick_event. 
 */
export function Widget_popup_handler_onclick_event(clicked_mesh, clickedButtonId) {

   const popup = _popup;

   if (clickedButtonId === MOUSE.BTN_ID.RIGHT) {

      if(popup.isActive) popup.DeactivatePopup()
      
      // Request_private_gfx_ctx(popup, GFX_CTX_FLAGS.PRIVATE | GFX_CTX_FLAGS.INACTIVE, 0, 0)
      
      const options_menu_section = Menu_options_create(clicked_mesh, popup.geom.pos, popup.gfx.prog.idx, popup.gfx.vb.idx);
      popup.menu_options_idx = clicked_mesh.menu_options_idx;
      
      const clickpos = MouseGetPos();
      CopyArr2(popup.geom.dim, options_menu_section.geom.dim);
      const popuppos = Helpers_calc_bottom_right_pos(clickpos, popup.geom.dim);
      CopyArr2(popup.geom.pos, popuppos);
      // console.log(popup.geom.dim, options_menu_section.geom.dim, popuppos)
      
      popup.AddItem(options_menu_section, SECTION.ITEM_FIT);
      Request_private_gfx_ctx(popup, GFX_CTX_FLAGS.INACTIVE | GFX_CTX_FLAGS.PRIVATE, popup.gfx.prog.idx, popup.gfx.vb.idx);
      popup.ActivatePopup();
      popup.Recalc(); // Reset pos-dim and calculate.
      popup.UpdateGfx(popup, popup.sceneIdx);


      return;

   }// IF (LEFT CLICK || MIDDLE CLICK)
   else if (popup) {

      if (clicked_mesh) { // Case clicked mesh does not belong to popup or its options

         if(!popup.isActive || clicked_mesh.type & MESH_TYPES_DBG.WIDGET_POP_UP) return; // Do nothing onclick on a popup menu area

         const parent = clicked_mesh.parent;
         if (parent && // Not null
            (clicked_mesh.type & MESH_TYPES_DBG.WIDGET_POP_UP || // Is popup menu area
            (clicked_mesh.type & MESH_TYPES_DBG.WIDGET_LABEL_TEXT_MESH_MENU_OPTIONS && // Or a popup options button
               parent.FindIdInChildren(clicked_mesh.id)))) {
                  parent.DeactivateSecondaryPopups(); // If options have been clicked, then deactivate and re-construct the secondary options
         }
         else{ // If it does not have
            popup.DeactivatePopup(); // Else left-middle mouse button on any other mesh(exept popup menu or options)
         }
      }
   }

}

export function Widget_popup_deactivate(){

   if(_popup && _popup.isActive) _popup.DeactivatePopup();
}
