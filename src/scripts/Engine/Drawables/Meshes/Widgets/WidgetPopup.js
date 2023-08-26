"use strict";

import { GlResetVertexBuffer, GlSetVertexBufferPrivate } from '../../../../Graphics/Buffers/GlBuffers.js';
import { GlCheckSid } from '../../../../Graphics/GlProgram.js';
import { Helpers_calc_bottom_right_pos } from '../../../../Helpers/Helpers.js';
import { MouseGetPos } from '../../../Controls/Input/Mouse.js';
import { MESH_ENABLE } from '../Base/Mesh.js';
import { Section } from '../Panel.js';
import { CopyArr2 } from '../../../../Helpers/Math/MathOperations.js';
import { Menu_options_create } from '../../../MenuOptionsHandler/MenuOptionsHandler.js';


/**
 * TODO:
 * 
 * Update the render queue after stop rendering the popup menu
 * Check the recostruct listeners for any secondary popup 
 * 
 * Possibly unused variables:
 */

// The gfx of the main popup. Once gfx buffers for the popup are initialised
// the popup and it's children 'menus' are gonna be using the spesific gl buffers(private to the popup) 
const _popUpGfx = {

   isSet: false,
   isActive: false,
   
   secondary_popups: {
      count: 0,
      buffer: [],

      Add(obj) {
         /** TODO!: Add only vertex buffers with different indexes (but the same program). We do not need duplicates */
         const idx = this.count++;
         this.buffer[idx] = obj;
      },
      Deactivate(progidx, vbidx) {
         for (let i = 0; i < this.count; i++) {
            if (this.buffer[i].progidx === progidx && this.buffer[i].vbidx === vbidx) {
               this.buffer[i].isActive = false;
               return true;
            }
         }
         console.error('No such gl program found. @ WidgetPopup.js Deactivate()');
      },
      GetInactive(sid) {

         for (let i = 0; i < this.count; i++) {
            if (!this.buffer[i].isActive && GlCheckSid(sid, this.buffer[i].progidx))
                  return this.buffer[i];
         }
         console.error('No inactive index found. @ WidgetPopup.js GetInactive(). Buffer:', this.buffer, ' looking for sid:', sid);
         return null;
      }
   },
};


// class Widget_PopUp extends Mesh {
class Widget_PopUp extends Section {

   isActive;
   menu_options_idx; // An index to the menu options handler's buffer.

   // constructor(pos = [0, 0, 0], dim = [0, 0], color = TRANSPARENT) {

   //    pos[2] += 10;
   //    const geom = new Geometry2D(pos, dim);
   //    const mat = new Material(color)

   //    const fontSize = 8;
   //    pos[0] -= geom.dim[0] - 6;
   //    pos[1] -= geom.dim[1] - fontSize * 2 - 8;
   //    pos[2] += 1;

   //    super(geom, mat);

   //    this.type |= MESH_TYPES_DBG.WIDGET_POP_UP | geom.type | mat.type;

   //    this.EnableGfxAttributes(MESH_ENABLE.GFX.ATTR_STYLE);
   //    this.SetStyle(6, 4, 3);
   //    this.SetName();

   //    this.isActive = false;

   // }
   constructor(pos = [0, 0, 0], dim = [0, 0], color = TRANSPARENT) {

      pos[2] += 10;
      // const geom = new Geometry2D(pos, dim);
      // const mat = new Material(color)

      super(SECTION.VERTICAL, [10,10], pos, dim, TRANSPARENCY(GREY7, .9));
      const fontSize = 8;
      pos[0] -= this.geom.dim[0] - 6;
      pos[1] -= this.geom.dim[1] - fontSize * 2 - 8;
      pos[2] += 1;
      
      // super(geom, mat);

      this.type |= MESH_TYPES_DBG.WIDGET_POP_UP | this.geom.type | this.mat.type;

      this.EnableGfxAttributes(MESH_ENABLE.GFX.ATTR_STYLE);
      this.SetStyle(6, 4, 3);
      this.SetName();

      this.isActive = false;

   }

   CreateGfxCtx(sceneIdx) {

      // Must guarantee that the options menu first mesh is of type: Section,
      // so that we can steal its vbidx and simply add the popup to tha same vertex buffer. 
      // const vbidx = this.children.buffer[0].gfx.vb.idx;
      // ERROR_NULL(vbidx, 'Popup cannot be added to NON existant vertex buffer. @  Widget_PopUp.AddToGraphics().')
      const gfx = super.CreateGfxCtx(sceneIdx, GL_VB.NEW);
      GlSetVertexBufferPrivate(gfx.prog.idx, gfx.vb.idx)
      return gfx;
   }
   // AddToGraphicsBuffer(sceneIdx) {

   //    // First time initialization
   //    if (!_popUpGfx.isSet) {

   //       this.gfx = super.AddToGraphicsBuffer(sceneIdx, GL_VB.NEW); // Create new vertex buffer for the popup menu, to manipulate seperately from other meshes.

   //       _popUpGfx.isSet    = true;
   //       _popUpGfx.isActive = true;


   //       _popUpGfx.secondary_popups.Add({ // Add the text vertex buffer
   //          isActive: true,
   //          progidx: this.gfx.prog.idx,
   //          vbidx: this.gfx.vb.idx,
   //       });


   //       /**
   //        * TODO: Use the duplicated code once
   //        */
   //       GlSetVertexBufferPrivate(this.gfx.prog.idx, this.gfx.vb.idx);

   //       const count = this.children.count;
   //       if (count) {

   //          const vbUse = [GL_VB.SPECIFIC, GL_VB.NEW]; // [0]: For the rect area of the 'Widget_Label_Text_Mesh_Menu_Options', [1]: for the text
   //          const vbidx = [this.gfx.vb.idx, NO_SPECIFIC_GL_BUFFER] // [0]: Use the same vb for the textLabel area and the popup, since their sid's match and they wiil be deactivated together as a group. 

   //          let flag = true;
   //          for (let i = 0; i < count; i++) {

   //             const children = this.children.buffer[i];
   //             const gfx = children.AddToGraphicsBuffer(this.sceneIdx, vbUse, vbidx);
               
   //             if (flag) { // for fisrt time create new vertex buffer for the text, after for any other option, use the same text vertex buffer.
   //                vbUse[1] = GL_VB.SPECIFIC;
   //                vbidx[1] = children.gfx.vb.idx;
                  
   //                _popUpGfx.secondary_popups.Add({ // Add the text vertex buffer
   //                   isActive: true,
   //                   progidx: (Array.isArray(gfx)) ? gfx[1].prog.idx : gfx.prog.idx,
   //                   vbidx:  (Array.isArray(gfx)) ? gfx[0].vb.idx : gfx.vb.idx,
   //                });

   //                GlSetVertexBufferPrivate(children.gfx.prog.idx, children.gfx.vb.idx);

   //                flag = false;
   //             }
   //          }
   //       }

   //       RenderQueueGet().UpdateActiveQueue();

   //       return this.gfx;

   //    }
   //    else { // Secondary popup creation.

   //       let popUpGfx = _popUpGfx.secondary_popups.GetInactive(this.sid);

   //       if (popUpGfx === null) { // Create new vertex buffer for the new secondary popup

   //          this.gfx = super.AddToGraphicsBuffer(this.sceneIdx, GL_VB.NEW);

   //          _popUpGfx.secondary_popups.Add({
   //             isActive: true,
   //             progidx: this.gfx.prog.idx,
   //             vbidx: this.gfx.vb.idx,
   //          });

   //          GlSetVertexBufferPrivate(this.gfx.prog.idx, this.gfx.vb.idx);

   //          if (this.children.count) {

   //             // On a new secondary popup, we allready have the new vertex buffer for the rect area, but we want a new vertex buffer for it's text
   //             const vbUse = [GL_VB.SPECIFIC, GL_VB.NEW]; // [0]: For the rect area of the 'Widget_Label_Text_Mesh_Menu_Options', [1]: for the text
   //             const vbidx = [this.gfx.vb.idx, NO_SPECIFIC_GL_BUFFER] // [0]: Use the same vb with popup since their sid's match. 

   //             let flag = true;
   //             const count = this.children.count;
   //             for (let i = 0; i < count; i++) {

   //                const children = this.children.buffer[i];
   //                const gfx = children.AddToGraphicsBuffer(this.sceneIdx, vbUse, vbidx);

   //                if (flag) { // for fisrt time create new vertex buffer for the text, after for any other option, use the same text vertex buffer.
   //                   vbUse[1] = GL_VB.SPECIFIC;
   //                   vbidx[1] = gfx[1].vb.idx;

   //                   _popUpGfx.secondary_popups.Add({ // Add the text vertex buffer
   //                      isActive: true,
   //                      progidx: gfx[1].prog.idx,
   //                      vbidx: gfx[1].vb.idx,
   //                   });

   //                   GlSetVertexBufferPrivate(gfx[1].prog.idx, gfx[1].vb.idx);

   //                   flag = false;
   //                }
   //             }
   //          }

   //          RenderQueueGet().UpdateActiveQueue();

   //          return this.gfx;
   //       }
   //       else { // Use an inactive vertex buffer

   //          this.gfx = super.AddToGraphicsBuffer(this.sceneIdx, GL_VB.SPECIFIC, popUpGfx.vbidx);
   //          popUpGfx.isActive = true;

   //          if (this.children.count) {

   //             const textMesh = this.children.buffer[0].children.buffer[0];
   //             const optionsGfx = _popUpGfx.secondary_popups.GetInactive(textMesh.sid);
   //             optionsGfx.isActive = true;

   //             // On a new secondary popup, we allready have the new vertex buffer for the rect area, but we want a new vertex buffer for it's text
   //             const vbUse = [GL_VB.SPECIFIC, GL_VB.SPECIFIC]; // [0]: For the rect area of the 'Widget_Label_Text_Mesh_Menu_Options', [1]: for the text
   //             const vbidx = [this.gfx.vb.idx, optionsGfx.vbidx] // [0]: Use the same vb with popup since their sid's match. 

   //             const count = this.children.count;
   //             for (let i = 0; i < count; i++) {

   //                const children = this.children.buffer[i];
   //                children.AddToGraphicsBuffer(this.sceneIdx, vbUse, vbidx);
   //             }
   //          }

   //          this.Set_graphics_vertex_buffer_render(true);
   //          RenderQueueGet().UpdateActiveQueue();

   //          return this.gfx;
   //       }
   //    }

   // }

   ActivatePopup() {

      this.Set_graphics_vertex_buffer_render(true);
      this.isActive = true;
   }

   DeactivatePopup() {
      
      // this.DeactivateSecondaryPopups(); // First deactivate any other popups rooted to the this popup (which is the root).

      // for (let i = 0; i < this.children.count; i++) { // Then 

      //    const mesh = this.children.buffer[i];

      //    if(mesh){

      //       Listener_remove_events_all(LISTEN_EVENT_TYPES.CLICK, mesh.listeners);
      //       Listener_hover_remove_by_idx(mesh.listen_hover_idx);
            
      //       GlResetVertexBuffer(mesh.gfx, 1);
      //       mesh.Set_graphics_vertex_buffer_render(false);
      //    }
         
      // }

      // Recursive_deactivate_secondary_popups(this);

      GlResetVertexBuffer(this.gfx, 1);
      this.Set_graphics_vertex_buffer_render(false);

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
   
               Recursive_deactivate_secondary_popups(mesh);
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
export function Initializer_popup_initialization(scene){

   _popup = new Widget_PopUp([200, 300, 0], [100,100], GREY2);
   scene.AddMesh(_popup);
   _popup.DeactivatePopup();
}

function Recursive_deactivate_secondary_popups(_mesh) {

   const children = _mesh.children;
   
   for (let i = 0; i < children.count; i++) {
      
      const mesh = children.buffer[i];
      if (mesh){

         if (mesh.children.count)
            Recursive_deactivate_secondary_popups(mesh)
   
         GlResetVertexBuffer(mesh.gfx, 1);
         _popUpGfx.secondary_popups.Deactivate(mesh.gfx.prog.idx, mesh.gfx.vb.idx);

         // console.log('Reseting. progidx: ', mesh.gfx.prog.idx, ' vbidx', mesh.gfx.vb.idx)
      }
   }
}

/**
 * TODO: SEE ## Widget_popup_handler_onclick_event. 
 */
export function Widget_popup_handler_onclick_event(clicked_mesh, clickedButtonId) {

   if (clickedButtonId === MOUSE.BTN_ID.RIGHT) {

      _popup.ActivatePopup();

      const clickpos = MouseGetPos();
      const popuppos = Helpers_calc_bottom_right_pos(clickpos, _popup.geom.dim);
      CopyArr2(_popup.geom.pos, popuppos);

      // const optionsMenu = clicked_mesh.menu_options.Clbk(clicked_mesh, pos);
      const optionsMenu = Menu_options_create(clicked_mesh, _popup.geom.pos, _popup.gfx.prog.idx, _popup.gfx.vb.idx);
      _popup.menu_options_idx = clicked_mesh.menu_options_idx;
      console.log(optionsMenu)

      _popup.AddItem(optionsMenu.section);
      _popup.Recalc(SECTION.ITEM_FIT);

      _popup.isActive = true;

      return;

   }// END of if (LEFT CLICK)
   else if (_popup) {

      if (clicked_mesh) { // Case clicked mesh does not belong to popup or its options

         if(clicked_mesh.type & MESH_TYPES_DBG.WIDGET_POP_UP) return; // Do nothing onclick on a popup menu area

         const parent = clicked_mesh.parent;
         if (parent && // Not null
            (clicked_mesh.type & MESH_TYPES_DBG.WIDGET_POP_UP || // Is popup menu area
            (clicked_mesh.type & MESH_TYPES_DBG.WIDGET_LABEL_TEXT_MESH_MENU_OPTIONS && // Or a popup options button
               parent.FindIdInChildren(clicked_mesh.id)))) {
                  parent.DeactivateSecondaryPopups(); // If options have been clicked, then deactivate and re-construct the secondary options
         }
         else{ // If it does not have
            _popup.DeactivatePopup(); // Else left-middle mouse button on any other mesh(exept popup menu or options)
         }
      }
   }

}

export function Widget_popup_deactivate(){

   if(_popup && _popup.isActive) _popup.DeactivatePopup();
}