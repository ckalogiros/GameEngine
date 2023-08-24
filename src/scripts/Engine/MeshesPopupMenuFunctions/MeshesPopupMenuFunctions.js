"use strict";

import { CopyArr3 } from "../../Helpers/Math/MathOperations.js";
import { Widget_Label_Text_Mesh_Menu_Options } from "../Drawables/Meshes/Widgets/WidgetLabelText.js";
import { FontGetFontDimRatio } from "../Loaders/Font/Font.js";
import { Scenes_get_children } from "../Scenes.js";



   /**
    * IMPORTANT: All options of any menu must be of type 'class Widget_Label_Text_Mesh_Menu_Options'.
    * So we can add them to specific gl buffers to handle them efficiently.
    */


const fontSize = 6, topPad = 12, pad = 5;
const font = TEXTURES.SDF_CONSOLAS_LARGE; // Default for popup menus

export function Popup_menu_options_text_label(clickedMesh, _pos){

   let i = 0;
   let totalHeight = 0;

   /** Main Options */
   // 1. 
   const height = fontSize * FontGetFontDimRatio(font);
   const textlabelpad = 2;
   const pos = [0,0,0];
   CopyArr3(pos, _pos); 
   pos[0] += pad+textlabelpad; 
   pos[1] += height+topPad+pad+textlabelpad;
   pos[2] += 1;
   
   totalHeight += height+topPad+pad+textlabelpad;
   
   const options1 = new Widget_Label_Text_Mesh_Menu_Options('Option 1', pos, fontSize, GREY3, WHITE, [1, 1], textlabelpad, .4, font, [2, 3, 2]);
   // options1.CreateListenEvent(LISTEN_EVENT_TYPES.HOVER);
   options1.StateEnable(MESH_STATE.HAS_HOVER_COLOR)
   
   options1.SetName();
   i++;
   totalHeight += options1.geom.dim[1] *2;
   
   CopyArr3(pos, _pos); 
   pos[0] += pad+textlabelpad; 
   pos[1] = options1.geom.pos[1]+pad+textlabelpad + height*2 +2;
   pos[2] += 1;
   const options2 = new Widget_Label_Text_Mesh_Menu_Options('Option 2', pos, fontSize, GREY3, GREY6, [1, 1], textlabelpad, .4, font, [2, 3, 2]);
   // options2.CreateListenEvent(LISTEN_EVENT_TYPES.HOVER);
   options2.StateEnable(MESH_STATE.HAS_HOVER_COLOR)
   options2.SetName();
   i++;
   totalHeight += options1.geom.dim[1];

   const menu = {
      buffer: [options1, options2],
      maxWidth: options1.geom.dim[0],
      count: i,
      totalHeight: totalHeight,
   }
   return menu;
}

export function Popup_menu_options_level2_of_text_label(_pos){

   let i = 0;
   let totalHeight = 0;

   /** Main Options */
   // 1. 
   const height = fontSize * FontGetFontDimRatio(font);
   const textlabelpad = 2;
   const pos = [0,0,0];
   CopyArr3(pos, _pos); 
   pos[0] += pad+textlabelpad; 
   pos[1] += height+topPad+pad+textlabelpad;
   pos[2] += 1;
   
   totalHeight += height+topPad+pad+textlabelpad;
   
   const options1 = new Widget_Label_Text_Mesh_Menu_Options('level2 Option 1', pos, fontSize, GREY3, WHITE, [1, 1], textlabelpad, .4, font, [2, 3, 2]);
   // options1.CreateListenEvent(LISTEN_EVENT_TYPES.HOVER);
   options1.StateEnable(MESH_STATE.HAS_HOVER_COLOR)
   
   options1.SetName();
   i++;
   totalHeight += options1.geom.dim[1] *2;
   
   CopyArr3(pos, _pos); 
   pos[0] += pad+textlabelpad; 
   pos[1] = options1.geom.pos[1]+pad+textlabelpad + height*2 +2;
   pos[2] += 1;
   const options2 = new Widget_Label_Text_Mesh_Menu_Options('level2 Option 2', pos, fontSize, GREY3, GREY6, [1, 1], textlabelpad, .4, font, [2, 3, 2]);
   // options2.CreateListenEvent(LISTEN_EVENT_TYPES.HOVER);
   options2.StateEnable(MESH_STATE.HAS_HOVER_COLOR)
   options2.SetName();
   i++;
   totalHeight += options1.geom.dim[1];

   const menu = {
      buffer: [options1, options2],
      maxWidth: options1.geom.dim[0],
      count: i,
      totalHeight: totalHeight,
   }
   return menu;
}


export function Popup_menu_options_all_scene_meshes(_pos){

   let i = 0;
   let totalHeight = 0;

   const meshes = Scenes_get_children(STATE.scene.idx);

   /** Main Options */
   // 1. 
   const height = fontSize * FontGetFontDimRatio(font);
   const textlabelpad = 2;
   const pos = [0,0,0];
   CopyArr3(pos, _pos); 
   pos[0] += pad+textlabelpad; 
   pos[1] += height+topPad+pad+textlabelpad;
   pos[2] += 1;
   
   totalHeight += height+topPad+pad+textlabelpad;
   

   const options1 = new Widget_Label_Text_Mesh_Menu_Options('Option 1', pos, fontSize, GREY3, WHITE, [1, 1], textlabelpad, .4, font, [2, 3, 2]);
   // options1.CreateListenEvent(LISTEN_EVENT_TYPES.HOVER);
   options1.StateEnable(MESH_STATE.HAS_HOVER_COLOR)
   
   options1.SetName();
   i++;
   totalHeight += options1.geom.dim[1] *2;
   
   CopyArr3(pos, _pos); 
   pos[0] += pad+textlabelpad; 
   pos[1] = options1.geom.pos[1]+pad+textlabelpad + height*2 +2;
   pos[2] += 1;
   const options2 = new Widget_Label_Text_Mesh_Menu_Options('Option 2', pos, fontSize, GREY3, GREY6, [1, 1], textlabelpad, .4, font, [2, 3, 2]);
   // options2.CreateListenEvent(LISTEN_EVENT_TYPES.HOVER);
   options2.StateEnable(MESH_STATE.HAS_HOVER_COLOR)
   options2.SetName();
   i++;
   totalHeight += options1.geom.dim[1];

   const menu = {

      // We shold add a refference to a 
      buffer: [options1, options2],
      maxWidth: options1.geom.dim[0],
      count: i,
      totalHeight: totalHeight,
   }
   return menu;
}

