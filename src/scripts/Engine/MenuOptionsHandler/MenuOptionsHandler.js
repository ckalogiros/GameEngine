"use strict";

import { CopyArr3 } from "../../Helpers/Math/MathOperations.js";


const _menu_options = [];
const _gfx_pool = [];



export function Menu_options_destroy(idx){
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
export function Menu_options_create(clicked_mesh, popup_pos){

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

   if(clicked_mesh.menu_options_idx !== INT_NULL){
      
      const options_menu = _menu_options[clicked_mesh.menu_options_idx];

      /**
       * TODO: Implement Re-AddToGraphicsBuffer
       * 
       * . Find a vBuffer from the pool
       * . Reposition all option meshes with section.Calc
       * . AddToGraphicsBuffer
       * 
       */
      
      if(ERROR_NULL(options_menu)) return null;
      else return options_menu;
   }
   
   // ELSE options create menu options
   if(clicked_mesh.type & MESH_TYPES_DBG.WIDGET_SLIDER_BAR){

      const options_menu = Slider_menu_create_options(clicked_mesh, popup_pos);
      /**
       * TODO: Implement AddToGraphicsBuffer.
       * 
       * . Add to graphics.
       * . Store the newlly created vBuffers to '_gfx_pool'
       */
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


function Slider_menu_create_options(clickedMesh, _pos) {

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


   // if (clickedMesh.menu_options.idx > INT_NULL) {

   //    const saved = _slider_options[clickedMesh.menu_options.idx];
   //    const count = saved.count;
   //    for (let i = 0; i < count; i++) {

   //       CopyArr3(pos, _pos);
   //       pos[0] += pad + textlabelpad[0] + saved.buffer[i].geom.dim[0];
   //       pos[1] = saved.buffer[i].geom.pos[1];
         
   //       saved.buffer[i].SetPosRecursive(pos);
   //    }

   //    return _slider_options[clickedMesh.menu_options.idx]
   // }

   const meshes = Scenes_get_children(STATE.scene.idx);

   for (let i = 0; i < meshes.count; i++) {

      const mesh = meshes.buffer[i];
      ERROR_NULL(mesh)

      if (i === 0)
         var option = new Widget_Switch_Mesh(pos, fontSize, GREY3, WHITE, [1, 1], textlabelpad, .4, font, [2, 3, 2]);
      else
         var option = new Widget_Label_Text_Mesh_Menu_Options(`Mesh id: ${mesh.id}`, pos, fontSize, GREY3, WHITE, [1, 1], textlabelpad, .4, font, [2, 3, 2]);

      option.SetName();

      if (maxWidth < option.geom.dim[0])
         maxWidth = option.geom.dim[0];

      CopyArr3(pos, _pos);
      pos[0] += pad + textlabelpad[0];
      pos[1] = option.geom.pos[1] + pad + textlabelpad[1] + height * 2 + 2;
      pos[2] += 1;

      totalHeight += option.geom.dim[1];

      options[i] = option;
   }

   const menu = {

      buffer: options,
      targets: meshes.buffer.slice(0, options.length),
      maxWidth: maxWidth,
      count: options.length,
      totalHeight: totalHeight,
      params: {

         targetBindingFunctions: Bind_change_brightness,
         EventClbk: Slider_connect,
         self_mesh: clickedMesh,
         target_mesh: null,
      },
   }

   const idx = _menu_options.push(menu);
   clickedMesh.menu_options.idx = idx - 1; // Store the index of the menu options in the owner mesh.

   return menu;
}