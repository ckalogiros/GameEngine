"use strict";

import { GfxSetVbRender, GlGenerateContext, GlResetIndexBuffer, GlResetVertexBuffer, GlSetVertexBufferPrivate } from "../../Graphics/Buffers/GlBuffers.js";
import { GlCheckSid } from "../../Graphics/GlProgram.js";
import { Bind_change_brightness } from "../BindingFunctions.js";
import { M_Buffer } from "../Core/Buffers.js";
import { Section } from "../Drawables/Meshes/Panel.js";
import { Widget_Switch_Mesh } from "../Drawables/Meshes/Widgets/WidgetButton.js";
import { Widget_Label_Text_Mesh_Menu_Options } from "../Drawables/Meshes/Widgets/WidgetLabelText.js";
import { Slider_connect } from "../Drawables/Meshes/Widgets/WidgetSlider.js";
import { RenderQueueGet } from "../Renderers/Renderer/RenderQueue.js";
import { Scenes_get_children } from "../Scenes.js";


class Gfx_Pool extends M_Buffer {

   session;

   constructor() {
      super();
      this.session = []; // SEE ## Gfx_Pool.session
   }


   GenerateGfxCtx(sid, sceneIdx, useSpecificVertexBuffer, mesh_count) {

      if (useSpecificVertexBuffer === GL_VB.NEW) {

         const gfx = GlGenerateContext(sid, sceneIdx, useSpecificVertexBuffer, NO_SPECIFIC_GL_BUFFER, mesh_count);
         this.#StoreGfx(gfx);
         return gfx;
      }
      else { // ... case specific or any gfx buffer is acceptable ...

         if (useSpecificVertexBuffer === GL_VB.ANY) { // ... if mesh could be added to any gfx buffer ... 

            // ... Check if an avaliable gfx buffer exists ...
            const found = this.#GetNotPrivateBySid(sid);
            if (found) {

               const gfx = GlGenerateContext(sid, sceneIdx, GL_VB.SPECIFIC, found.vbidx, mesh_count);
               return gfx;
            }
            else { // ... else if pool didn't find any buffer, create a new one ...

               const gfx = GlGenerateContext(sid, sceneIdx, GL_VB.NEW, NO_SPECIFIC_GL_BUFFER, mesh_count);
               this.#StoreGfx(gfx);
               return gfx;
            }
         }
      }
   }

   // Activates the rendering of the gfx buffers
   ActivateRecursive(mesh) {

      for (let i = 0; i < mesh.children.count; i++) {

         const child = mesh.children.buffer[i];
         if (child) this.ActivateRecursive(child)
      }

      const progidx = mesh.gfx.prog.idx;
      const vbidx = mesh.gfx.vb.idx;

      this.#ActDeactFromPool(progidx, vbidx, true);
      GfxSetVbRender(progidx, vbidx, true);

   }

   DeactivateRecursive(mesh) {

      for (let i = 0; i < mesh.children.count; i++) {

         const child = mesh.children.buffer[i];
         if (child) this.DeactivateRecursive(child)
      }

      const progidx = mesh.gfx.prog.idx;
      const vbidx = mesh.gfx.vb.idx;

      this.#ActDeactFromPool(progidx, vbidx, false);
      GlResetVertexBuffer(mesh.gfx);
      GlResetIndexBuffer(mesh.gfx);
      GfxSetVbRender(progidx, vbidx, false);

      mesh.RemoveAllListenEvents();

   }

   RequestPrivateGfxCtx(mesh, flags, handler_progidx = INT_NULL, handler_vbidx = INT_NULL) {

      this.#ResolveGfxCtxRecursive(mesh, flags, handler_progidx, handler_vbidx);
   }

   SessionEnd(setPrivate) {

      const count = this.session.length;
      for (let i = 0; i < count; i++) {

         const idx = this.session[i];

         this.buffer[idx].isActive = true;
         this.buffer[idx].isPrivate = setPrivate;

         const progidx = this.buffer[idx].progidx,
            vbidx = this.buffer[idx].vbidx;
         if (setPrivate)
            GlSetVertexBufferPrivate(progidx, vbidx);
      }

      this.session = [];
   }

   #StoreGfx(gfx) { //Does not store duplicates

      // if (Array.isArray(gfx)) {

      //    const gfxlen = gfx.length;
      //    for (let i = 0; i < gfxlen; i++) {

      //       if (this.#FindGfx(gfx.prog.idx, gfx.vb.idx) === INT_NULL) {
      //          const idx = this.#Store(gfx.prog.idx, gfx.vb.idx, gfx.sceneIdx, true, false)
      //          return idx;
      //       }
      //    }
      // }
      // else {

      // this.#Store it, if not stored.
      if (this.#FindGfxNotPrivate(gfx.prog.idx, gfx.vb.idx) === INT_NULL) {
         const idx = this.#Store(gfx.prog.idx, gfx.vb.idx, gfx.sceneIdx, true, false)
         return idx;
      }
      // }
   }

   #Store(progidx, vbidx, isPrivate, isActive = true) {

      const idx = this.Add({
         progidx: progidx,
         vbidx: vbidx,
         sceneidx: vbidx,
         isActive: isActive,
         isPrivate: isPrivate,
      });

      this.session.push(idx);

      return idx;
   }

   #ActDeactFromPool(progidx, vbidx, flag) {
      for (let i = 0; i < this.count; i++) {
         if (this.buffer[i].progidx === progidx && this.buffer[i].vbidx === vbidx) {
            this.buffer[i].isActive = flag;
            return true;
         }
      }
      console.error('No such gl program found. @ MenuOptionsHandler.js Deactivate()');
   }

   #ResolveGfxCtxRecursive(mesh, flags, progidx, vbidx, COUNTER = null) {

      /*DEBUG*/if(COUNTER === null) COUNTER = 0;

      if (flags & (GFX_CTX_FLAGS.PRIVATE | GFX_CTX_FLAGS.INACTIVE)) {

         for (let i = 0; i < mesh.children.count; i++) {
            /*DEBUG*/COUNTER++;

            const child = mesh.children.buffer[i];
            if (child) {
               // if(DEBUG.GFX.ADD_MESH) console.log(COUNTER, 'traversing... child:', child.name)
               this.#ResolveGfxCtxRecursive(child, flags, progidx, vbidx, COUNTER)
            }
         }

         if (!mesh.gfx) { // ... Case its a newly created mesh and looking to be added to gfx ...

            const gfx = this.#GetInactiveAndPrivateBySid(mesh.sid); // ... Check if we have a buffer for the request...

            if (gfx) { // ... If we have, use it...
               // use specific gfx context
               mesh.gfx = GlGenerateContext(mesh.sid, mesh.sceneIdx, GL_VB.SPECIFIC, gfx.vbidx, mesh.mat.num_faces);
               // console.log(mesh.name, mesh.mat.num_faces)
            }
            else { // ... else create a new buffer and register it to the pool...

               // Create new buffers
               mesh.gfx = GlGenerateContext(mesh.sid, mesh.sceneIdx, GL_VB.NEW, NO_SPECIFIC_GL_BUFFER, mesh.mat.num_faces)
               this.#Store(mesh.gfx.prog.idx, mesh.gfx.vb.idx, true, false)
            }
         }
         // ... case the mesh is a root mesh, a popup menu as an example, that already has a gfx.
         else if (mesh.gfx.prog.idx === progidx, mesh.gfx.vb.idx === vbidx) {

            mesh.gfx = GlGenerateContext(mesh.sid, mesh.sceneIdx, GL_VB.SPECIFIC, vbidx, mesh.mat.num_faces); // we pass the roots vbidx
            const gfx = this.#FindGfx(progidx, vbidx)
         }
         if(DEBUG.GFX.ADD_MESH) console.log(COUNTER, 'Adding mesh:', mesh.name, 'vbidx:', mesh.gfx.prog.idx, mesh.gfx.vb.idx, 'At:', mesh.gfx.vb.start)
         mesh.AddToGfx();
      }

   }

   #GetInactiveAndPrivateBySid(sid) {

      for (let i = 0; i < this.count; i++) {
         if (!this.buffer[i].isActive && this.buffer[i].isPrivate && GlCheckSid(sid, this.buffer[i].progidx))
            return this.buffer[i];
      }
      console.warn('No inactive vbidx found. @ MenuOptionsHandler.js GetInactiveBySid(). Buffer:', this.buffer, ' looking for sid:', sid);
      return null;
   }

   #GetNotPrivateBySid(sid) {

      for (let i = 0; i < this.count; i++) {
         if (!this.buffer[i].isPrivate && GlCheckSid(sid, this.buffer[i].progidx))
            return this.buffer[i];
      }
      console.warn('No inactive vbidx found. @ MenuOptionsHandler.js GetInactiveBySid(). Buffer:', this.buffer, ' looking for sid:', sid);
      return null;
   }

   #FindGfx(progidx, vbidx) {

      for (let i = 0; i < this.count; i++)
         if (this.buffer[i].progidx === progidx &&
            this.buffer[i].vbidx === vbidx)
            return this.buffer[i];

      return null
   }

   #FindGfxNotPrivate(progidx, vbidx) {

      for (let i = 0; i < this.count; i++)
         if (!this.buffer[i].isPrivate &&
            this.buffer[i].progidx === progidx &&
            this.buffer[i].vbidx === vbidx)
            return i;

      return INT_NULL
   }


   // #GetInactiveBySid(sid) {

   //    for (let i = 0; i < this.count; i++) {
   //       if (!this.buffer[i].isActive && GlCheckSid(sid, this.buffer[i].progidx))
   //          return this.buffer[i];
   //    }
   //    console.warn('No inactive vbidx found. @ MenuOptionsHandler.js GetInactiveBySid(). Buffer:', this.buffer, ' looking for sid:', sid);
   //    return null;
   // }

   // FindGfxInactive(progidx, vbidx) {

   //    for (let i = 0; i < this.count; i++)
   //       if (!this.buffer[i].isActive &&
   //          this.buffer[i].progidx === progidx &&
   //          this.buffer[i].vbidx === vbidx)
   //          return i;

   //    return INT_NULL
   // }

   // FindGfxInactivePrivate(progidx, vbidx) {

   //    for (let i = 0; i < this.count; i++)
   //       if (!this.buffer[i].isActive &&
   //          this.buffer[i].isPrivate &&
   //          this.buffer[i].progidx === progidx &&
   //          this.buffer[i].vbidx === vbidx)
   //          return i;

   //    return INT_NULL
   // }
};


const _gfx_pool = new Gfx_Pool;
const _menu_options = [];

export function Gfx_get_pool() { return _gfx_pool; }

/** Finish the session by setting all the assigned gfx buffers to active. Also sets private all the gfx buffers  */
export function Gfx_end_session(setPrivate) { return _gfx_pool.SessionEnd(setPrivate); }

// mesh_count is nesessary for calculating vertex buffer attribute offset for Text Meshes
export function Gfx_generate_context(sid, sceneIdx, useSpecificVertexBuffer, mesh_count) {
   return _gfx_pool.GenerateGfxCtx(sid, sceneIdx, useSpecificVertexBuffer, mesh_count);
}
export function Request_private_gfx_ctx(mesh, flags, progidx, vbidx) {
   return _gfx_pool.RequestPrivateGfxCtx(mesh, flags, progidx, vbidx);
}

/** Activates the gfx buffers recursively for all the children meshes. */
export function Gfx_activate(mesh) { _gfx_pool.ActivateRecursive(mesh); }
export function Gfx_deactivate(mesh) { _gfx_pool.DeactivateRecursive(mesh); }


// export function Gfx_store(gfx) {
//    _gfx_pool.StoreGfx(gfx);
// }

export function Gfx_pool_print() {

   // console.log('Gfx Pool: ', _gfx_pool);
   for (let i = 0; i < _gfx_pool.count; i++) {

      console.log('Gfx Pool: ', _gfx_pool.buffer[i]);
   }
}

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
      const section_menu = options_menu.section_menu;
      

      // TODO: Better to set the index in the 'Menu_options_create_slider_popup_menu_options' function
      const OPTION_LABEL_IDX = 0; // Label is located at index 0 of the section handling the label and the switch.
      const OPTION_SWITCH_IDX = 1; // Switch is located at index 1 of the section handling the label and the switch.

      let flags = GFX_CTX_FLAGS.INACTIVE | GFX_CTX_FLAGS.PRIVATE;
      // _gfx_pool.RequestPrivateGfxCtx(section_menu, GFX_CTX_FLAGS.PRIVATE | GFX_CTX_FLAGS.INACTIVE, progidx, vbidx)

      if (ERROR_NULL(section_menu, 'Mesh\'s index of menu options is invalid. Creating new options menu. Check why the index is invalid '))
         return null; 

      // Re-create the listen event for the 'switch' option
      for (let i = 0; i < section_menu.children.count; i++) {

         const section_option = section_menu.children.buffer[i];
         section_option.CreateListenEvent(LISTEN_EVENT_TYPES.HOVER);
         const option_switch = section_option.children.buffer[OPTION_SWITCH_IDX];
         const option_label = section_option.children.buffer[OPTION_SWITCH_IDX];
         ERROR_NULL(option_switch);

         const target_params = { // Build the parameters for the OnClick callback function.
            EventClbk: Slider_connect,
            targetBindingFunctions: Bind_change_brightness, // TODO: Should be an array of functions.
            clicked_mesh: clicked_mesh,
            target_mesh: options_menu.targets[i],
         }


         option_switch.CreateListenEvent(LISTEN_EVENT_TYPES.CLICK_DOWN, option_switch.OnClick, target_params)
         option_switch.CreateListenEvent(LISTEN_EVENT_TYPES.HOVER);
         // option.StateEnable(MESH_STATE.IS_HOVER_COLORABLE);

         // _gfx_pool.RequestPrivateGfxCtx(section_option, flags);
         // _gfx_pool.RequestPrivateGfxCtx(option_switch, flags, progidx, vbidx);
         // _gfx_pool.RequestPrivateGfxCtx(option_label, flags, progidx, vbidx);
      }

      // _gfx_pool.RequestPrivateGfxCtx(section_menu, GFX_CTX_FLAGS.PRIVATE | GFX_CTX_FLAGS.INACTIVE, progidx, vbidx)
      Gfx_end_session(true);
      return section_menu;
   }

   // ELSE it does not exist, so create options menu
   if (clicked_mesh.type & MESH_TYPES_DBG.WIDGET_SLIDER_BAR) {

      const options_menu = Menu_options_create_slider_popup_menu_options(clicked_mesh, pos, progidx, vbidx);
      Gfx_end_session(true);
      return options_menu;
   }
}

/**
 * Create a pool (buffer) of vertex buffers, from which 
 * the menu options builder can use to store option meshes
 * for any given popup menu or just a menu for that matter.
 * 
 * . Find vBuffer
 *    . The vBuffer must be avaliable (free-inactive) for use.  
 *    . The sid of the mesh must match the vBuffer's  
 * . Create vBuffer  
 */


function Menu_options_create_slider_popup_menu_options(clicked_mesh, _pos, progidx, vbidx) {

   const font = MENU_FONT_IDX;
   const fontSize = MENU_FONT_SIZE;
   const textlabelpad = [4, 6];
   const pos = [0, 0, 0];

   const meshes = Scenes_get_children(STATE.scene.active_idx);
   let flags = GFX_CTX_FLAGS.INACTIVE | GFX_CTX_FLAGS.PRIVATE;

   const section_menu = new Section(SECTION.VERTICAL, [10, 10], pos, [20, 40], TRANSPARENCY(GREEN, .6));
   section_menu.SetName('section_menu' + clicked_mesh.menu_options_idx)
   section_menu.SetSceneIdx(STATE.scene.active_idx);
   // _gfx_pool.RequestPrivateGfxCtx(section_menu, flags); // Render to private buffers
   section_menu.CreateListenEvent(LISTEN_EVENT_TYPES.HOVER);
   section_menu.StateEnable(MESH_STATE.IS_HOVER_COLORABLE);
   
   for (let i = 0; i < 12; i++) {
      
      const mesh = meshes.buffer[i];
      ERROR_NULL(mesh)
      
      
      const section_option = new Section(SECTION.HORIZONTAL, [5, 5], pos, [20, 40], TRANSPARENCY(YELLOW, .2));
      section_option.SetName('section_option:' + i);
      section_option.CreateListenEvent(LISTEN_EVENT_TYPES.HOVER);
      section_option.StateEnable(MESH_STATE.IS_HOVER_COLORABLE);
      
      
      const option_switch = new Widget_Switch_Mesh(pos, fontSize, GREY3, WHITE, [1, 1], textlabelpad, .4, font, [2, 3, 2]);
      const option_label = new Widget_Label_Text_Mesh_Menu_Options(`Mesh id: ${mesh.id}`, pos, fontSize, GREY5, WHITE, [1, 1], textlabelpad, .4, font, [2, 3, 2]);
      option_switch.SetName(`switch:${i}`);
      option_label.SetName(`label:${i}`);
      // option.SetSceneIdx(STATE.scene.active_idx);
      
      // For the first run select only an inactive buffer, but for the rest of the loop, 
      // let all matching 'option' meshes get put to the same private buffer.
      if (i > 0) flags = GFX_CTX_FLAGS.ACTIVE | GFX_CTX_FLAGS.PRIVATE;
      // _gfx_pool.RequestPrivateGfxCtx(section_option, flags);
      // _gfx_pool.RequestPrivateGfxCtx(option_switch, flags, progidx, vbidx);
      // _gfx_pool.RequestPrivateGfxCtx(option_label, flags, progidx, vbidx);
      
      const target_params = {
         EventClbk: Slider_connect,
         targetBindingFunctions: Bind_change_brightness,
         clicked_mesh: clicked_mesh,
         target_mesh: mesh,
      }
      
      ERROR_NULL(option_switch.OnClick); // Make sure the option mesh has an OnClick method
      option_switch.CreateListenEvent(LISTEN_EVENT_TYPES.CLICK_DOWN, option_switch.OnClick, target_params)
      option_switch.CreateListenEvent(LISTEN_EVENT_TYPES.HOVER)
      option_switch.StateEnable(MESH_STATE.IS_HOVER_COLORABLE);

      // RenderQueueGet().UpdateActiveQueue();
      if (!GlCheckSid(option_switch.sid, progidx))
         alert('prog idx do not match(popup mesh and slider options section mesh). @ Menu_options_create().');


      section_option.AddItem(option_label, SECTION.ITEM_FIT);
      section_option.AddItem(option_switch, SECTION.ITEM_FIT);
      section_menu.AddItem(section_option, SECTION.ITEM_FIT);

   }

   // _gfx_pool.RequestPrivateGfxCtx(section_menu, flags); // Render to private buffers
   section_menu.Calc()

   const count = section_menu.children.count;

   /**
    * This params build will be used by the dispatcher that on its turn 
    * will call the OnClick function of the meshes 'options'. 
    */
   const menu = {

      section_menu: section_menu, // Has all the menu buttons
      targets: meshes.buffer.slice(0, count), // Each menu button has a target mesh
      event_params: {
         targetBindingFunctions: Bind_change_brightness,
         EventClbk: Slider_connect,
      },
   }

   const idx = _menu_options.push(menu)
   clicked_mesh.menu_options_idx = idx - 1; // Store the index of the menu options buffer in the owner's mesh.

   // return _menu_options[idx - 1];
   return section_menu;
}


// function Menu_options_create_slider_popup_menu_options(clicked_mesh, _pos, progidx, vbidx) {

//    const font = MENU_FONT_IDX;
//    const fontSize = MENU_FONT_SIZE;
//    const textlabelpad = [1, 1];
//    const pos = [0, 0, 0];

//    const meshes = Scenes_get_children(STATE.scene.active_idx);

//    let flags = GFX_CTX_FLAGS.INACTIVE | GFX_CTX_FLAGS.PRIVATE;

//    const section = new Section(SECTION.VERTICAL, [10, 10], pos, [20, 40], TRANSPARENCY(GREY2, .1));
//    section.SetName('RED')
//    section.SetSceneIdx(STATE.scene.active_idx);
//    _gfx_pool.RequestPrivateGfxCtx(section, flags); // Render to private buffers

//    let same_progidx_found = false;

//    for (let i = 0; i < 10; i++) {

//       const mesh = meshes.buffer[i];
//       ERROR_NULL(mesh)


//       if (i === 0)
//          var option = new Widget_Switch_Mesh(pos, fontSize, GREY3, WHITE, [1, 1], textlabelpad, .4, font, [2, 3, 2]);

//       else
//          var option = new Widget_Label_Text_Mesh_Menu_Options(`Mesh id: ${mesh.id}`, pos, fontSize, GREY5, WHITE, [1, 1], textlabelpad, .4, font, [2, 3, 2]);
      
//       option.SetName(`btn:${i}`);
//       option.SetSceneIdx(STATE.scene.active_idx);
      
//       // For the first run select only an inactive buffer, but for the rest of the loop, 
//       // let all matching 'option' meshes get put to the same private buffer.
//       if (i > 0) flags = GFX_CTX_FLAGS.ACTIVE | GFX_CTX_FLAGS.PRIVATE;
//       _gfx_pool.RequestPrivateGfxCtx(option, flags, progidx, vbidx);
      
//       const target_params = {
//          EventClbk: Slider_connect,
//          targetBindingFunctions: Bind_change_brightness,
//          clicked_mesh: clicked_mesh,
//          target_mesh: mesh,
//       }
      
//       ERROR_NULL(option.OnClick); // Make sure the option mesh has an OnClick method
//       option.CreateListenEvent(LISTEN_EVENT_TYPES.CLICK_DOWN, option.OnClick, target_params)
//       // option.StateEnable(MESH_STATE.IS_HOVER_COLORABLE);

//       // RenderQueueGet().UpdateActiveQueue();
//       if (GlCheckSid(option.sid, progidx)) same_progidx_found = true;

//       section.AddItem(option);

//    }

//    section.Calc()


//    if (!same_progidx_found) alert('prog idx do not match(popup mesh and slider options section mesh). @ Menu_options_create().');

//    const count = section.children.count;

//    /**
//     * This params build will be used by the dispatcher
//     * that on its turn will call the OnClick function
//     * of the meshes 'options'. 
//     */

//    const menu = {

//       menu_options: section, // Has all the menu buttons
//       targets: meshes.buffer.slice(0, count), // Each menu button has a target mesh
//       event_params: {
//          targetBindingFunctions: Bind_change_brightness,
//          EventClbk: Slider_connect,
//       },
//    }

//    // const idx = _menu_options.push(section)
//    const idx = _menu_options.push(menu)
//    clicked_mesh.menu_options_idx = idx - 1; // Store the index of the menu options buffer in the owner's mesh.

//    // return _menu_options[idx - 1];
//    return section;
// }