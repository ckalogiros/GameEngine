"use strict";

import { GfxSetVbRender, GlGenerateContext, GlResetIndexBuffer, GlResetVertexBuffer, GlSetVertexBufferPrivate } from "../../Graphics/Buffers/GlBuffers.js";
import { GlCheckSid } from "../../Graphics/GlProgram.js";
import { Bind_change_brightness } from "../BindingFunctions.js";
import { M_Buffer } from "../Core/Buffers.js";
import { Section } from "../Drawables/Meshes/Panel.js";
import { Widget_Switch_Mesh } from "../Drawables/Meshes/Widgets/WidgetButton.js";
import { Widget_Label_Text_Mesh_Menu_Options } from "../Drawables/Meshes/Widgets/WidgetLabelText.js";
import { Slider_connect } from "../Drawables/Meshes/Widgets/WidgetSlider.js";
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

         const progidx = this.buffer[i].progidx, vbidx = this.buffer[i].vbidx;
         if(setPrivate)
            GlSetVertexBufferPrivate(progidx, vbidx);
      }

      this.session = [];
   }

   #StoreGfx(gfx) { //Does not store duplicates

      if (Array.isArray(gfx)) {

         const gfxlen = gfx.length;
         for (let i = 0; i < gfxlen; i++) {

            if (this.#FindGfx(gfx.prog.idx, gfx.vb.idx) === INT_NULL) {
               const idx = this.#Store(gfx.prog.idx, gfx.vb.idx, gfx.sceneIdx, true, false)
               return idx;
            }
         }
      }
      else {

         // this.#Store it, if not stored.
         if (this.#FindGfxNotPrivate(gfx.prog.idx, gfx.vb.idx) === INT_NULL) {
            const idx = this.#Store(gfx.prog.idx, gfx.vb.idx, gfx.sceneIdx, true, false)
            return idx;
         }
      }
   }

   #Store(progidx, vbidx, isPrivate, isActive = true) {
      /** TODO!: Add only vertex buffers with different indexes (but the same program). We do not need duplicates */

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

   #ResolveGfxCtxRecursive(mesh, flags, progidx, vbidx) {

      if (flags & (GFX_CTX_FLAGS.PRIVATE | GFX_CTX_FLAGS.INACTIVE)) {

         for (let i = 0; i < mesh.children.count; i++) {

            const child = mesh.children.buffer[i];
            if (child) this.#ResolveGfxCtxRecursive(child, flags, progidx, vbidx)
         }

         if (!mesh.gfx) { // ... Case its a newly created mesh and looking to be added to gfx ...

            const gfx = this.#GetInactiveAndPrivateBySid(mesh.sid); // ... Check if we have a buffer for the request...

            if (gfx) { // ... If we have, use it...
               // use specific gfx context
               mesh.gfx = GlGenerateContext(mesh.sid, mesh.sceneIdx, GL_VB.SPECIFIC, gfx.vbidx, mesh.mat.num_faces);
               console.log(mesh.name, mesh.mat.num_faces)
               // gfx.isActive = true;
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
            // gfx.isActive = true;
         }
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
export function Request_private_gfx_ctx(mesh, glags, progidx, vbidx) {
   return _gfx_pool.RequestPrivateGfxCtx(mesh, glags, progidx, vbidx);
}

/** Activates the gfx buffers recursively for all the children meshes. */
export function Gfx_activate(mesh) {
   // console.log('----- Activate -----')
   _gfx_pool.ActivateRecursive(mesh);
}
export function Gfx_deactivate(mesh) {
   // console.log('----- Deactivate -----')

   _gfx_pool.DeactivateRecursive(mesh);
}

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
      const menu_section = options_menu.section;
      // menu_section.CreateListenEvent(LISTEN_EVENT_TYPES.CLICK_DOWN, menu_section.OnClick, menu_section, options_menu.params)
      // menu_section.CreateListenEvent(LISTEN_EVENT_TYPES.HOVER);
      // menu_section.StateEnable(MESH_STATE.IS_HOVER_COLORABLE);
      menu_section.SetName('optionsMenu ' + clicked_mesh.menu_options_idx)

      _gfx_pool.RequestPrivateGfxCtx(menu_section, GFX_CTX_FLAGS.PRIVATE | GFX_CTX_FLAGS.INACTIVE, progidx, vbidx)

      if (ERROR_NULL(menu_section, 'Mesh\'s index of menu options is invalid. Creating new options menu. Check why the index is invalid '))
         return null; // TODO: Maybe create new options menu

      for (let i = 0; i < menu_section.children.active_count; i++) {

         const mesh = menu_section.children.buffer[i];
         // Re-Create listeners
         mesh.CreateListenEvent(LISTEN_EVENT_TYPES.CLICK_DOWN, mesh.OnClick, mesh, options_menu.params)
         console.log('Set click event id:', mesh.id)
         mesh.CreateListenEvent(LISTEN_EVENT_TYPES.HOVER);
         mesh.StateEnable(MESH_STATE.IS_HOVER_COLORABLE);
      }

      Gfx_end_session(true); 
      return options_menu;
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
 * the menu options hndler can use to store option meshes
 * for any given popup menu or just menu for that matter.
 * 
 * . Find vBuffer
 *    . The vBuffer must be avaliable (free-inactive) for use.  
 *    . The sid of the mesh must match the vBuffer's  
 * . Create vBuffer  
 */


// function MenuOptions_create_sliderPopupMenu_options(clickedMesh, _pos) {
function Menu_options_create_slider_popup_menu_options(clickedMesh, _pos, progidx, vbidx) {

   /** Main Options */
   const font = MENU_FONT_IDX;
   const fontSize = MENU_FONT_SIZE;
   // const topPad = 112, pad = 5;
   // const height = fontSize * FontGetFontDimRatio(font);
   const textlabelpad = [0, 0];
   let maxWidth = 0;
   const pos = [0, 0, 0];


   let totalHeight = 0;

   // CopyArr3(pos, _pos);
   // pos[0] += pad + textlabelpad[0];
   // pos[1] += height + topPad + pad + textlabelpad[1];
   // pos[2] += 1;

   // totalHeight += height + topPad + pad + textlabelpad[1];

   const meshes = Scenes_get_children(STATE.scene.active_idx);

   let flags = GFX_CTX_FLAGS.INACTIVE | GFX_CTX_FLAGS.PRIVATE;

   const section = new Section(SECTION.VERTICAL, [10, 10], pos, [20, 40], TRANSPARENCY(GREY2, .1));
   section.SetName('RED')
   section.SetSceneIdx(STATE.scene.active_idx);
   _gfx_pool.RequestPrivateGfxCtx(section, flags); // Render to private buffers

   let same_progidx_found = false;

   for (let i = 0; i < 4; i++) {

      const mesh = meshes.buffer[i];
      ERROR_NULL(mesh)


      if (i === 0){
         
         var option = new Widget_Switch_Mesh(pos, fontSize, GREY3, WHITE, [1, 1], textlabelpad, .4, font, [2, 3, 2]);
         ERROR_NULL(option.OnClick); // Make sure the option mesh has an OnClick method
         option.CreateListenEvent(LISTEN_EVENT_TYPES.CLICK_DOWN, option.OnClick, option, null);
         option.CreateListenEvent(LISTEN_EVENT_TYPES.HOVER);
         option.StateEnable(MESH_STATE.IS_HOVER_COLORABLE);
      }
      else {
         
         var option = new Widget_Label_Text_Mesh_Menu_Options(`Mesh id: ${mesh.id}`, pos, fontSize, GREY3, WHITE, [1, 1], textlabelpad, .4, font, [2, 3, 2]);
         ERROR_NULL(option.OnClick); // Make sure the option mesh has an OnClick method
         option.CreateListenEvent(LISTEN_EVENT_TYPES.CLICK_DOWN, option.OnClick, option, null);
         option.CreateListenEvent(LISTEN_EVENT_TYPES.HOVER);
         option.StateEnable(MESH_STATE.IS_HOVER_COLORABLE);
      }

      option.SetName(`btn:${i}`);
      option.SetSceneIdx(STATE.scene.active_idx);

      // For the first run select only an inactive buffer, but for the rest of the loop, 
      // let all matching 'option' meshes get put to the same private buffer.
      if (i > 0) flags = GFX_CTX_FLAGS.ACTIVE | GFX_CTX_FLAGS.PRIVATE;
      _gfx_pool.RequestPrivateGfxCtx(option, flags, progidx, vbidx);

      const params = {
         EventClbk: Slider_connect,
         targetBindingFunctions: Bind_change_brightness,
         self_mesh: clickedMesh,
         target_mesh: mesh,
      }

      // RenderQueueGet().UpdateActiveQueue();
      if (GlCheckSid(option.sid, progidx)) same_progidx_found = true;
        
      section.AddItem(option);
      
   }


   if (!same_progidx_found) alert('prog idx do not match(popup mesh and slider options section mesh). @ Menu_options_create().');

   const count = section.children.count;

   /**
    * This params build will be used by the dispatcher
    * that on its turn will call the OnClick function
    * of the meshes 'options'. 
    */
   const menu = {

      section: section,
      targets: meshes.buffer.slice(0, count),
      maxWidth: maxWidth,
      count: count,
      totalHeight: totalHeight,
      // event_params: {

      //    targetBindingFunctions: Bind_change_brightness,
      //    EventClbk: Slider_connect,
      //    self_mesh: clickedMesh,
      //    target_mesh: null,
      // },
   }

   // const idx = _menu_options.push(section)
   const idx = _menu_options.push(menu)
   clickedMesh.menu_options_idx = idx - 1; // this.#Store the index of the menu options in the owner mesh.

   return _menu_options[idx - 1];
}