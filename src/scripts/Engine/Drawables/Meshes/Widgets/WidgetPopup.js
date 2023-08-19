"use strict";

import { GlResetVertexBuffer, GlSetVertexBufferPrivate } from '../../../../Graphics/Buffers/GlBuffers.js';
import { GlCheckSid } from '../../../../Graphics/GlProgram.js';
import { Helpers_calc_bottom_right_pos, Helpers_calc_top_left_pos, Helpers_calc_top_right_pos } from '../../../../Helpers/Helpers.js';
import { MouseGetPos } from '../../../Controls/Input/Mouse.js';
import { RenderQueueGet } from '../../../Renderers/Renderer/RenderQueue.js';
import { Popup_menu_options_all_scene_meshes, Popup_menu_options_level2_of_text_label, Popup_menu_options_text_label } from '../../../MeshesPopupMenuFunctions/MeshesPopupMenuFunctions.js';
import { Geometry2D } from '../../Geometry/Base/Geometry.js';
import { Material } from '../../Material/Base/Material.js';
import { MESH_ENABLE, Mesh } from '../Base/Mesh.js';
import { Slider_menu_create_options } from './WidgetSlider.js';


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

   progIdx: INT_NULL,
   vbIdx: INT_NULL,
   ibIdx: INT_NULL,
   isSet: false,
   
   secondary_popups: {
      count: 0,
      buffer: [],

      Add(obj) {
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
         alert('No such gl program found. @ WidgetPopup.js Deactivate()');
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


class Widget_PopUp extends Mesh {


   constructor(pos = [0, 0, 0], dim = [0, 0], color = TRANSPARENT) {

      pos[2] += 10;
      const geom = new Geometry2D(pos, dim);
      const mat = new Material(color)

      const fontSize = 8;
      pos[0] -= geom.dim[0] - 6;
      pos[1] -= geom.dim[1] - fontSize * 2 - 8;
      pos[2] += 1;

      super(geom, mat);

      this.type |= MESH_TYPES_DBG.WIDGET_POP_UP | geom.type | mat.type;

      this.EnableGfxAttributes(MESH_ENABLE.GFX.ATTR_STYLE);
      this.SetStyle(6, 4, 3);
      this.SetName();

   }

   AddToGraphicsBuffer(sceneIdx) {

      // First time initialization
      if (!_popUpGfx.isSet) {

         this.gfx = super.AddToGraphicsBuffer(sceneIdx, GL_VB.NEW); // Create new vertex buffer for the popup menu, to manipulate seperately from other meshes.

         _popUpGfx.progIdx = this.gfx.prog.idx;
         _popUpGfx.vbIdx = this.gfx.vb.idx;
         _popUpGfx.ibIdx = this.gfx.ib.idx;
         _popUpGfx.isSet = true;
         _popUpGfx.isActive = true;

         /**
          * TODO: Use the duplicated code once
          */
         GlSetVertexBufferPrivate(this.gfx.prog.idx, this.gfx.vb.idx);

         const count = this.children.count;
         if (count) {

            const vbUse = [GL_VB.SPECIFIC, GL_VB.NEW]; // [0]: For the rect area of the 'Widget_Label_Text_Mesh_Menu_Options', [1]: for the text
            const vbidx = [this.gfx.vb.idx, NO_SPECIFIC_GL_BUFFER] // [0]: Use the same vb for the textLabel area and the popup, since their sid's match and they wiil be deactivated together as a group. 

            let flag = true;
            for (let i = 0; i < count; i++) {

               const children = this.children.buffer[i];
               children.AddToGraphicsBuffer(this.sceneIdx, vbUse, vbidx);

               if (flag) { // for fisrt time create new vertex buffer for the text, after for any other option, use the same text vertex buffer.
                  vbUse[1] = GL_VB.SPECIFIC;
                  vbidx[1] = children.gfx.vb.idx;

                  GlSetVertexBufferPrivate(children.gfx.prog.idx, children.gfx.vb.idx);

                  flag = false;
               }
            }
         }

         RenderQueueGet().UpdateActiveQueue();

         return this.gfx;

      }
      else { // Secondary popup creation.

         let popUpGfx = _popUpGfx.secondary_popups.GetInactive(this.sid);

         if (popUpGfx === null) { // Create new vertex buffer for the new secondary popup

            this.sceneIdx = sceneIdx;
            this.gfx = super.AddToGraphicsBuffer(this.sceneIdx, GL_VB.NEW);
            _popUpGfx.secondary_popups.Add({
               isActive: true,
               progidx: this.gfx.prog.idx,
               vbidx: this.gfx.vb.idx,
            });

            GlSetVertexBufferPrivate(this.gfx.prog.idx, this.gfx.vb.idx);

            if (this.children.count) {

               // On a new secondary popup, we allready have the new vertex buffer for the rect area, but we want a new vertex buffer for it's text
               const vbUse = [GL_VB.SPECIFIC, GL_VB.NEW]; // [0]: For the rect area of the 'Widget_Label_Text_Mesh_Menu_Options', [1]: for the text
               const vbidx = [this.gfx.vb.idx, NO_SPECIFIC_GL_BUFFER] // [0]: Use the same vb with popup since their sid's match. 

               let flag = true;
               const count = this.children.count;
               for (let i = 0; i < count; i++) {

                  const children = this.children.buffer[i];
                  const gfx = children.AddToGraphicsBuffer(this.sceneIdx, vbUse, vbidx);

                  if (flag) { // for fisrt time create new vertex buffer for the text, after for any other option, use the same text vertex buffer.
                     vbUse[1] = GL_VB.SPECIFIC;
                     vbidx[1] = gfx[1].vb.idx;

                     _popUpGfx.secondary_popups.Add({ // Add the text vertex buffer
                        isActive: true,
                        progidx: gfx[1].prog.idx,
                        vbidx: gfx[1].vb.idx,
                     });

                     GlSetVertexBufferPrivate(gfx[1].prog.idx, gfx[1].vb.idx);

                     flag = false;
                  }
               }
            }

            RenderQueueGet().UpdateActiveQueue();

            return this.gfx;
         }
         else { // Use an inactive vertex buffer

            this.gfx = super.AddToGraphicsBuffer(0, GL_VB.SPECIFIC, popUpGfx.vbidx);
            popUpGfx.isActive = true;

            if (this.children.count) {

               const textMesh = this.children.buffer[0].children.buffer[0];
               const optionsGfx = _popUpGfx.secondary_popups.GetInactive(textMesh.sid);
               optionsGfx.isActive = true;

               // On a new secondary popup, we allready have the new vertex buffer for the rect area, but we want a new vertex buffer for it's text
               const vbUse = [GL_VB.SPECIFIC, GL_VB.SPECIFIC]; // [0]: For the rect area of the 'Widget_Label_Text_Mesh_Menu_Options', [1]: for the text
               const vbidx = [this.gfx.vb.idx, optionsGfx.vbidx] // [0]: Use the same vb with popup since their sid's match. 

               const count = this.children.count;
               for (let i = 0; i < count; i++) {

                  const children = this.children.buffer[i];
                  children.AddToGraphicsBuffer(this.sceneIdx, vbUse, vbidx);
               }
            }

            this.Set_graphics_vertex_buffer_render(true);
            RenderQueueGet().UpdateActiveQueue();

            return this.gfx;
         }
      }



   }

   DeactivateSecondaryPopups() {

      for (let i = 0; i < this.children.count; i++) {
         
         const mesh = this.children.buffer[i];
         
         // Deactivate all meshes of type 'WIDGET_POP_UP' with all its options(recursively), from the curent popup level.
         if (mesh.type & MESH_TYPES_DBG.WIDGET_POP_UP) {

            Recursive_deactivate_secondary_popups(mesh);

            // mesh.RemoveChildren(); // TODO: Do we need to strip down all meshes??? Only if they are shared pointers to some mesh of the appliction
            mesh.Set_graphics_vertex_buffer_render(false);
            mesh.RemoveAllListenEvents(); // Only 'WIDGET_POP_UP' types suppose to have hover listener, so this is the place to remove any hover listeners.
            this.RemoveChildByIdx(i); // Remove from the childrens buffer.
         }
      }
   }

}

let _popup = null;


/**
 * TODO: SEE ## Widget_popup_handler_onclick_event. 
 */
export function Widget_popup_handler_onclick_event(clickedMesh, clickedButtonId) {

   /**
    * TODO: Implement the function in a better way.
    * 1. Distinction of what is clicked
    *       1. popup mesh || popup options
    *       2. any other mesh 
    *       3. epmty space
    * 2. Button type
    *       1. right btn
    *       2. Left-middle btn
    */

   if (clickedButtonId === MOUSE.BTN_ID.RIGHT) {

      if (!clickedMesh) { // Case of a right mouse click outside any mesh

      }
      else { // If left mouse clicked on a mesh, activate specific popup for that mesh.

         if (clickedMesh.StateCheck(MESH_STATE.HAS_POPUP)) {

            const clickpos = MouseGetPos();
            let pos = [clickpos[0], clickpos[1], 10]

            /** If popup menu exists but deactivated, activate and
             *  change it's position according to the mouse click
             */
            if (_popup) {

               _popup.DeactivateSecondaryPopups();

               const popuppos = Helpers_calc_bottom_right_pos(clickpos, _popup.geom.dim);
               const xdif = popuppos[0] - _popup.geom.pos[0];
               const ydif = popuppos[1] - _popup.geom.pos[1];
               _popup.SetPosXY(popuppos);
               
               _popup.Set_graphics_vertex_buffer_render(true);
               _popup.isActive = true;

               // Set the position of all popup menu options
               for (let i = 0; i < _popup.children.count; i++) {

                  const children = _popup.children.buffer[i];
                  children.Move(xdif, ydif); // We dont want to recalculate the relative to the popup option's position, so we have to use 'Move'. 
               }

               _popup.CreateListenEvent(LISTEN_EVENT_TYPES.HOVER);

               return;
            }

            /** 
             * If popup menu does not exist and 
             * if the clicked mesh has menu options
             * create popup menu.
             */

            else if(clickedMesh.MenuOptionsClbk){

               // const optionsMenu = Slider_menu_create_options(clickedMesh, pos);
               const optionsMenu = clickedMesh.MenuOptionsClbk(clickedMesh, pos);
               const dim = [optionsMenu.maxWidth + 20, optionsMenu.totalHeight];
   
               // Create the main popup mesh
               _popup = new Widget_PopUp([200, 100, 0], dim, GREY2);
   
               const p = Helpers_calc_top_left_pos(_popup.geom.pos, _popup.geom.dim);
               pos = [p[0] + _popup.mat.style.feather, p[1] + _popup.mat.style.feather, _popup.geom.pos[2]];
   
               for (let i = 0; i < optionsMenu.count; i++){
                  _popup.AddChild(optionsMenu.buffer[i]);
               }
   
               // Add to the scene
               const scene = STATE.scene.active;
               scene.AddMesh(_popup);
   
               const popuppos = Helpers_calc_bottom_right_pos(clickpos, _popup.geom.dim);
               _popup.SetPosXY(popuppos);
               // _popup.StateEnable(MESH_STATE.HAS_HOVER_COLOR);
               _popup.CreateListenEvent(LISTEN_EVENT_TYPES.HOVER);
   
               // Menu options onclick event callbacks
               for (let i = 0; i < optionsMenu.count; i++){
                  if(optionsMenu.targets){
   
                     // TODO: Make a class out of the params.
                     const params = {
                        params:{
   
                           targetBindingFunctions: optionsMenu.params.targetBindingFunctions,
                           EventClbk: optionsMenu.params.EventClbk,
                           target1: optionsMenu.params.target1,
                           target2: optionsMenu.targets[i],
                        },
                     }
                     // optionsMenu.params.target2 = optionsMenu.targets[i];
                     _popup.children.buffer[i].CreateEvent(params);
                  }
                  else{
   
                     // optionsMenu.params.target2 = optionsMenu.targets[i];
                     _popup.children.buffer[i].CreateEvent({params: optionsMenu.params});
                  }
               }
               console.log('###### ', _popup.children.buffer)
   
   
               _popup.ListenersReconstruct();
            }

         }
      }
   }
   else if (_popup) {

      if (clickedMesh) { // Case clicked mesh does not belong to popup or its options

         if(clickedMesh.type & MESH_TYPES_DBG.WIDGET_POP_UP) return; // Do nothing onclick on a popup menu area

         const parent = clickedMesh.parent;
         if (parent && // Not null
            (clickedMesh.type & MESH_TYPES_DBG.WIDGET_POP_UP || // Is popup menu area
            (clickedMesh.type & MESH_TYPES_DBG.WIDGET_LABEL_TEXT_MESH_MENU_OPTIONS && // Or a popup options button
               parent.FindIdInChildren(clickedMesh.id)))) {
                  parent.DeactivateSecondaryPopups(); // If options have been clicked, then deactivate and re-construct the secondary options
         }
         else{
            _popup.Set_graphics_vertex_buffer_render(false)
            _popup.DeactivateSecondaryPopups(); // Else left-middle mouse button on any other mesh(exept popup menu or options)
            _popup.RemoveAllListenEvents();
         }
      }
      
      else if (!clickedMesh) { // Any other click( exept the right mouse button) outside any apps mesh, deactivate popup 
         
         _popup.Set_graphics_vertex_buffer_render(false)
         _popup.DeactivateSecondaryPopups();
         _popup.RemoveAllListenEvents();
      }
   }

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

         if(mesh.type & MESH_TYPES_DBG.WIDGET_POP_UP && mesh.listeners.count)
            mesh.RemoveAllListenEvents();

         // console.log('Reseting. progidx: ', mesh.gfx.prog.idx, ' vbidx', mesh.gfx.vb.idx)
      }
   }
}

function Widget_popup_handler_options_onclick_event(params) {

   const parent = params.btnMesh.parent;
   const dim = [60, 90];
   const p1 = [parent.geom.pos[0], btnMesh.geom.pos[1]];
   const d = [parent.geom.dim[0], btnMesh.geom.dim[1]];
   const p = Helpers_calc_top_right_pos(p1, d);
   const pos = [p[0] + dim[0], p[1] + dim[1], btnMesh.geom.pos[2]];
   const popup = new Widget_PopUp(pos, dim, GREY3);
   popup.StateEnable(MESH_STATE.HAS_HOVER | MESH_STATE.HAS_HOVER_COLOR);
   popup.CreateListenEvent(LISTEN_EVENT_TYPES.HOVER);
   
   const optionsMenu = Popup_menu_options_level2_of_text_label(pos);
   // const dim = [optionsMenu.maxWidth + 20, optionsMenu.totalHeight];

   parent.AddChild(popup)
   for (let i = 0; i < optionsMenu.count; i++) {

      popup.AddChild(optionsMenu.buffer[i]);
   }
   // Widget Popup 'AddToGraphicsBuffer()' function handles the insertion of the children too. 
   popup.AddToGraphicsBuffer(_popup.sceneIdx);

   /**
    * Slider_create_on_click_event(slider, null, null);
    * Slider_bind_on_value_change(slider, textLabel, [Bind_change_brightness, Bind_change_pos_x]);
    * 
    * bar is the clicked mesh, we need the parent to create the connection.
    * 
    * the textLabel is going to be selected from a popup menu that shows all the scene meshes
    */
   // Menu options onclick event callbacks
   optionsMenu.buffer[0].CreateEvent({params:{
      Clbk: Widget_popup_handler_options_onclick_event, 
      btnMesh: optionsMenu.buffer[0],
   },});
   optionsMenu.buffer[1].CreateEvent({params:{
      Clbk: Widget_popup_handler_options_onclick_event, 
      btnMesh: optionsMenu.buffer[1],
   },});


   popup.ListenersReconstruct();


}