"use strict";

import { GlCheckContext, GlGenerateContext } from "../../Graphics/Buffers/GlBuffers.js";
import { GlCheckSid } from "../../Graphics/GlProgram.js";
import { CopyArr3 } from "../../Helpers/Math/MathOperations.js";
import { Bind_change_brightness } from "../BindingFunctions.js";
import { M_Buffer } from "../Core/Buffers.js";
import { Section } from "../Drawables/Meshes/Panel.js";
import { Widget_Switch_Mesh } from "../Drawables/Meshes/Widgets/WidgetButton.js";
import { Widget_Label_Text_Mesh_Menu_Options } from "../Drawables/Meshes/Widgets/WidgetLabelText.js";
import { Slider_connect } from "../Drawables/Meshes/Widgets/WidgetSlider.js";
import { FontGetFontDimRatio } from "../Loaders/Font/Font.js";
import { RenderQueueGet } from "../Renderers/Renderer/RenderQueue.js";
import { Scenes_get_children } from "../Scenes.js";

class Gfx_Pool extends M_Buffer {

   constructor() {
      super();
   }

   Store(progidx, vbidx) {
      /** TODO!: Add only vertex buffers with different indexes (but the same program). We do not need duplicates */
      
      // const idx = this.FindGfx(progidx, vbidx);
      
      /** Store the  */
      // if(idx !== INT_NULL && !this.buffer[idx].isActive) return;
      // // if(idx === INT_NULL || this.buffer[idx].isActive)
      
      this.Add({
         progidx: progidx,
         vbidx: vbidx,
         isActive: true,
      })
   }
   FindGfx(progidx, vbidx) {

      for (let i = 0; i < this.count; i++) 
         if (this.buffer[i].progidx === progidx && 
             this.buffer[i].vbidx   === vbidx) 
               return i;

      return INT_NULL
   }

   /** SAVE- store gfx from array type too */
   // StoreGfx(gfx) {

   //    if (Array.isArray(gfx)) {

   //       const gfxlen = gfx.length;
   //       for (let i = 0; i < gfxlen; i++) {

   //          // Check if the glVertexBuffer index of the current Mesh is already stored
   //          let found = false;

   //          for (let i = 0; i < this.count; i++) {
   //             if (this.buffer[i].progidx === gfx[i].prog.idx && 
   //                 this.buffer[i].vbidx   === gfx[i].vb.idx) {
   //                found = true;
   //                break;
   //             }
   //          }
   //          // Store it, if it does not exixst.
   //          if (!found) {
   //             const idx = this.Add({ 
   //                            progidx: gfx.prog.idx, 
   //                            vbidx: gfx.vb.idx, 
   //                            isActive: false, 
   //                         });
   //             return idx;
   //          }
   //       }
   //    }
   //    else {

   //       // Check if the glVertexBuffer index of the current Mesh is already stored
   //       let found = false;
   //       const len = this.count;

   //       for (let i = 0; i < len; i++) {
   //          if (this.buffer[i].progidx === gfx.prog.idx && 
   //              this.buffer[i].vbidx   === gfx.vb.idx) {
   //             found = true;
   //             break;
   //          }
   //       }
   //       // Store it, if not stored.
   //       if (!found) {
   //          const idx = this.Add({ 
   //                         progidx: gfx.prog.idx, 
   //                         vbidx: gfx.vb.idx, 
   //                         isActive: false, 
   //                      });
   //          return idx;
   //       }
   //    }
   // }

   Deactivate(progidx, vbidx) {
      for (let i = 0; i < this.count; i++) {
         if (this.buffer[i].progidx === progidx && this.buffer[i].vbidx === vbidx) {
            this.buffer[i].isActive = false;
            return true;
         }
      }
      console.error('No such gl program found. @ MenuOptionsHandler.js Deactivate()');
   }

   GetInactive(sid) {

      for (let i = 0; i < this.count; i++) {
         if (!this.buffer[i].isActive && GlCheckSid(sid, this.buffer[i].progidx))
            return this.buffer[i];
      }
      console.error('No inactive vbidx found. @ MenuOptionsHandler.js GetInactive(). Buffer:', this.buffer, ' looking for sid:', sid);
      return null;
   }

   AddToSpecificBuffer(_mesh){

      const count = _mesh.children.count;
      const sceneIdx = _mesh.sceneIdx;

      for(let i=0; i<count; i++){

         const mesh = _mesh.children.buffer[i];

         const gfx_0 = GlCheckContext(mesh.sid, mesh.sceneIdx);

         if(!ERROR_NULL(gfx_0[0]) && !ERROR_NULL(gfx_0[1])){

            const idx = this.FindGfx(gfx_0[0], gfx_0[1]);

            if(idx === INT_NULL){ // There are no reserved buffers for this shader type mesh

               // Create new vertex buffer
               const gfx_1 = mesh.CreateGfxCtx(sceneIdx, GL_VB.NEW)
               
               this.Store(gfx_1.prog.idx, gfx_1.vb.idx)
               
               console.log('Creating NEW buffer. gfx:', gfx_1.prog.idx, gfx_1.vb.idx)
            }
            else{ // The buffer do exist, so add to this buffer if it is not occupied.
               
               mesh.CreateGfxCtx(sceneIdx, GL_VB.SPECIFIC, gfx_0[1]);
               console.log('Using EXISTING buffer. gfx:', gfx_0)
            }
         }
         else{ // There are no such program created, so create new vBuffer.

               // Create new vertex buffer
               const gfx_1 = mesh.CreateGfxCtx(sceneIdx, GL_VB.NEW)
               
               this.Store(gfx_1.prog.idx, gfx_1.vb.idx)
               
               console.log('Creating NEW buffer. gfx:', gfx_1.prog.idx, gfx_1.vb.idx)
         }
      }
   }
};


const _gfx_pool = new Gfx_Pool;
const _menu_options = [];



export function Menu_options_destroy(idx) {
   /**
    * TODO: implement
    * 
    * . Graphics
    * .     Reset vertex buffer
    * .     Set buffer show to false
    * .     Remove from Drawqueue
    * . Set vBuffer as free-inactive (in _gfx_pool)
    * . Mesh 
    * .     Remove event listeners 
    * .     Remove hover event listeners 
    */
}

/**
 * Clicked_mesh should have a struct:
 *    menu_options:{
 *       Clbk: a function to create the options for the first time.
 *       idx: an index to the '_menu_options' buffer.  
 *    }
 * 
 * Case options allready created
 *    if clicked mesh has an index for options "menu_options.idx"
 *    return the options object(that consists of info and a buffer[] of type Mesh)
 * 
 * Case create options
 * Run the apropriate function based on the clicked mesh (type?),
 * assuming there is one options menu across all widgets of a certain type.
 * 
 * WHO is responsible of adding the options meshes to the gfx pipeline???
 * If the place is her, then:
 * . we need an implementation for handling the gfx pipeline.
 * . Add to graphics
 *    . RESPONSIBLE for using specific program index and vertex buffer index
 * . Remove from graphics
 *    . reset the vertex buffer
 *    . remove from DrawQueue
 *    .
 * . ??? Update the graphics buffer ???
 */
export function Menu_options_create(clicked_mesh, pos, progidx, vbidx) {

   if (clicked_mesh.menu_options_idx !== INT_NULL) {

      const options_menu = _menu_options[clicked_mesh.menu_options_idx];

      if (ERROR_NULL(options_menu, 'Mesh\'s index of menu options is invalid. Creating new options menu. Check why the index is invalid ')) 
         return null; // TODO: Maybe create new options menu
      
      return options_menu;

      //    // Create options menu
      //    if(clicked_mesh.type & MESH_TYPES_DBG.WIDGET_SLIDER_BAR){
      //       options_menu = Menu_options_create_slider_popup_menu_options(clicked_mesh, popup_pos)
      //    }
      // }
      // /**
      //  * TODO: Implement Re-AddToGraphicsBuffer
      //  * 
      //  * . Find a vBuffer from the pool
      //  * . Reposition all option meshes with section.Calc
      //  * . AddToGraphicsBuffer
      //  * 
      //  */
      // const gfx = this.GetInactive(clicked_mesh.sid); // Find a vertex buffer to add the options meshe
      // if(!ERROR_NULL(gfx)){
      //    // Create new vBuffer
      // }
      // // AddToGraphicsBuffer

   }

   // ELSE it does not exist, so create options menu
   if (clicked_mesh.type & MESH_TYPES_DBG.WIDGET_SLIDER_BAR) {

      const options_menu = Menu_options_create_slider_popup_menu_options(clicked_mesh, pos, progidx);

      // Store the callers mesh gfx info
      _gfx_pool.Store(progidx, vbidx);

      _gfx_pool.AddToSpecificBuffer(options_menu.section);
       
      // if(_gfx_pool.FindGfx(progidx, vbidx) !== INT_NULL){

      //    // We use same vbidx for the options.section mesh with the callers mesh,
      //    // assuming that the caller MUST be a mesh of type 'Section' 
      //    options_menu.section.AddToGraphicsBuffer(clicked_mesh.sceneIdx, GL_VB.SPECIFIC, vbidx);
      // }
      // else{ // Specific gl program and/or vertex buffer does not exist in the pool 
      //    const gfx = options_menu.section.AddToGraphicsBuffer(clicked_mesh.sceneIdx, GL_VB.NEW);
      //    _gfx_pool.Store(gfx.prog.idx, gfx.vb.idx)
      // }
      // RenderQueueGet().UpdateActiveQueue();
      return options_menu;
   }
}

/**
 * Create a pool (buffer) of vertex buffers, from which 
 * the menu options hndler can use to store option meshes
 * for any given popup menu or just menu for that matter.
 * 
 * . Find vBuffer
 *    . The vBuffer must be avaliable (free-inactive) for use.  
 *    . The sid of the mesh must match the vBuffer's  
 * . Create vBuffer  
 */


// function MenuOptions_create_sliderPopupMenu_options(clickedMesh, _pos) {
function Menu_options_create_slider_popup_menu_options(clickedMesh, _pos, progidx) {

   /** Main Options */
   const font = MENU_FONT_IDX;
   const fontSize = MENU_FONT_SIZE;
   const topPad = 12, pad = 5;
   const height = fontSize * FontGetFontDimRatio(font);
   const textlabelpad = [2, 2];
   let maxWidth = 0;
   const options = [];
   const pos = [0, 0, 0];


   let totalHeight = 0;

   CopyArr3(pos, _pos);
   pos[0] += pad + textlabelpad[0];
   pos[1] += height + topPad + pad + textlabelpad[1];
   pos[2] += 1;

   totalHeight += height + topPad + pad + textlabelpad[1];

   const meshes = Scenes_get_children(STATE.scene.idx);
    
   const section = new Section(SECTION.VERTICAL, [10,10], pos, [50,100], TRANSPARENCY(GREY7, .4));

   let same_progidx_found = false;

   for (let i = 0; i < 1; i++) {

      const mesh = meshes.buffer[i];
      ERROR_NULL(mesh)


      if (i === 0)
         var option = new Widget_Switch_Mesh(pos, fontSize, GREY3, WHITE, [1, 1], textlabelpad, .4, font, [2, 3, 2]);
      else
         var option = new Widget_Label_Text_Mesh_Menu_Options(`Mesh id: ${mesh.id}`, pos, fontSize, GREY3, WHITE, [1, 1], textlabelpad, .4, font, [2, 3, 2]);

      option.SetName();


      // Listener_hover_enable(option);

      /** Event: Menu options OnClick.
       * Create click events for all the options of the menu.
       */
      const params = {
         EventClbk: Slider_connect,
         targetBindingFunctions: Bind_change_brightness,
         self_mesh: clickedMesh,
         target_mesh: mesh,
      }
      ERROR_NULL(option.OnClick); // Make sure the option mesh has an OnClick method
      option.CreateListenEvent(LISTEN_EVENT_TYPES.CLICK, option.OnClick, option, params)

      // RenderQueueGet().UpdateActiveQueue();
      if(GlCheckSid(option.sid, progidx)) same_progidx_found = true;
      section.AddItem(option);
      
      
   }
  
   if(!same_progidx_found) alert('prog idx do not match(popup mesh and slider options section mesh). @ Menu_options_create().');

   const count = section.children.count;
   const menu = {

      section: section,
      targets: meshes.buffer.slice(0, count),
      maxWidth: maxWidth,
      count: count,
      totalHeight: totalHeight,
      params: {

         targetBindingFunctions: Bind_change_brightness,
         EventClbk: Slider_connect,
         self_mesh: clickedMesh,
         target_mesh: null,
      },
   }

   const idx = _menu_options.push(section)
   clickedMesh.menu_options_idx = idx - 1; // Store the index of the menu options in the owner mesh.

   return menu;
}