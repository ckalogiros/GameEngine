"use strict";

import { Bind_change_brightness } from "../BindingFunctions.js";
import { Section } from "../Drawables/Meshes/Section.js";
import { Widget_Switch } from "../Drawables/Meshes/Widgets/WidgetButton.js";
import { Widget_Label_Text_Mesh_Menu_Options } from "../Drawables/Meshes/Widgets/WidgetLabel.js";
import { Slider_connect } from "../Drawables/Meshes/Widgets/WidgetSlider.js";
import { Scenes_get_children } from "../Scenes.js";


const _menu_options = [];


export function Menu_options_destroy(idx) { TODO: Implement }

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
 * Run the apropriate function based on the clicked mesh's (TODO: clicked mesh should hav a callback for creating the menu?),
 * assuming there is one options menu across all widgets of a certain type.
 * 
 * Responsible for adding the options meshes to the gfx pipeline.
 * The responsibility lies on the popup menu.
 * Here we just create the mesh-tree, that is adding children-parent relationships.
 * 
 */

export function Menu_options_create(clicked_mesh, pos) {

   if (clicked_mesh.menu_options_idx !== INT_NULL) {

      const options_menu = _menu_options[clicked_mesh.menu_options_idx];
      const section_menu = options_menu.section_menu;

      // TODO: Better to set the index in the 'Menu_options_create_slider_popup_menu_options' function
      const OPTION_LABEL_IDX = 0; // Label is located at index 0 of the section handling the label and the switch.
      const OPTION_SWITCH_IDX = 1; // Switch is located at index 1 of the section handling the label and the switch.

      if (ERROR_NULL(section_menu, 'Mesh\'s index of menu options is invalid. Creating new options menu. Check why the index is invalid '))
         return null; 

      // Re-create listeners and callback parameters for the options.
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

         // Listeners have been removed(on popup deactivate), so we need to re-create them.
         option_switch.CreateListenEvent(LISTEN_EVENT_TYPES.CLICK_DOWN, option_switch.OnClick, target_params)
         option_switch.CreateListenEvent(LISTEN_EVENT_TYPES.HOVER);

      }

      return section_menu;
   }

   // ELSE it does not exist, so create options menu
   if (clicked_mesh.type & MESH_TYPES_DBG.WIDGET_SLIDER_BAR) {

      const options_menu = Menu_options_create_slider_popup_menu_options(clicked_mesh, pos);
      
      return options_menu;
   }
}

function Menu_options_create_slider_popup_menu_options(clicked_mesh, _pos) {

   const font = MENU_FONT_IDX;
   const fontSize = MENU_FONT_SIZE;
   const textlabelpad = [4, 3];
   const pos = [0, 0, 0];

   const meshes = Scenes_get_children(STATE.scene.active_idx);

   const section_menu = new Section(SECTION.VERTICAL, [2, 2], pos, [20, 40], TRANSPARENCY(GREY7, .8));
   section_menu.SetName('section_menu' + clicked_mesh.menu_options_idx)
   section_menu.SetSceneIdx(STATE.scene.active_idx);
   section_menu.CreateListenEvent(LISTEN_EVENT_TYPES.HOVER);
   section_menu.StateEnable(MESH_STATE.IS_HOVER_COLORABLE);
   
   for (let i = 0; i < meshes.count-1; i++) {
      
      const mesh = meshes.buffer[i];
      ERROR_NULL(mesh)
      
      
      const section_option = new Section(SECTION.HORIZONTAL, [3, 3], pos, [20, 40], TRANSPARENCY(BLACK, .4));
      section_option.SetName('section_option:' + i);
      section_option.CreateListenEvent(LISTEN_EVENT_TYPES.HOVER);
      section_option.StateEnable(MESH_STATE.IS_HOVER_COLORABLE);
      
      
      const option_switch = new Widget_Switch(pos, fontSize, TRANSPARENCY(BLUE_10_120_220, .0), WHITE, [1, 1], textlabelpad, .4, font, [2, 3, 2]);
      const option_label = new Widget_Label_Text_Mesh_Menu_Options(mesh.name, pos, fontSize, TRANSPARENCY(BLUE_10_120_220, .0), WHITE, [1, 1], textlabelpad, .4, font, [2, 3, 2]);
      option_switch.SetName(`switch:${i}`);
      option_label.SetName(`label:${i}`);
      
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

      section_option.AddItem(option_label, SECTION.ITEM_FIT);
      section_option.AddItem(option_switch, SECTION.ITEM_FIT);
      section_menu.AddItem(section_option, SECTION.ITEM_FIT);

   }

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

