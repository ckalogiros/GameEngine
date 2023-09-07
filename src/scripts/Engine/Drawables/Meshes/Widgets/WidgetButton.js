"use strict";

import { CopyArr3 } from '../../../../Helpers/Math/MathOperations.js';
import { Check_intersection_point_rect } from '../../../Collisions.js';
import { MouseGetPos } from '../../../Controls/Input/Mouse.js';
import { M_Buffer } from '../../../Core/Buffers.js';
import { Debug_get_event_listeners, Listener_deactivate_children_events_buffer, Listener_recover_children_buffer, Listener_reset_children_buffer, Listeners_copy_event_children_buffer } from '../../../Events/EventListeners.js';
import { Gfx_activate, Gfx_deactivate, Gfx_deactivate_no_listeners_touch, Gfx_end_session } from '../../../Interfaces/GfxContext.js';
import { Widget_Label } from './WidgetLabel.js';



export class Widget_Button extends Widget_Label {

   constructor(text, pos, fontSize = 10, color = BLUE_10_120_220, colorText = WHITE, scale = [1, 1], pad, bold, font, style) {

      super(text, pos, fontSize, color, colorText, scale, pad, bold, font, style)

      this.type |= MESH_TYPES_DBG.WIDGET_BUTTON;
      this.SetName();

   }
   
   GenGfxCtx(FLAGS=GFX.ANY, gfxIdx){

      super.GenGfxCtx(FLAGS, gfxIdx);
   }

   AddToGfx(){

      super.AddToGfx()
   }

   OnClick(params) {

      const point = MouseGetPos();
      const m = params.source_params.geom;

      if (Check_intersection_point_rect(m.pos, m.dim, point)) {

         console.log('CLICKED!!! Btn:', params.source_params.name);
         STATE.mesh.SetClicked(params.source_params);

         if (params.source_params.eventCallbacks.count) {
            for (let i = 0; i < params.source_params.eventCallbacks.count; i++) {

               const Func = params.source_params.eventCallbacks.buffer[i].Clbk;
               const parameters = params.source_params.eventCallbacks.buffer[i].target;
               Func(parameters);
            }
         }

         return true;
      }

      return false;
   }

   SetZindex(params) {
      params.mesh.children.buffer[0].SetZindex(params.z)
   }

}

export class Widget_Switch extends Widget_Button {

   isOn;
   state_text;

   constructor(pos, fontSize = 5, color = GREY1, colorText = WHITE, scale, pad = [fontSize, fontSize], bold, font, style = [3, 6, 2]) {

      super('off', pos, fontSize, color, colorText, scale, pad, bold, font, style)

      this.isOn = 0x0;
      this.state_text = ['off', 'on'];
      this.type |= MESH_TYPES_DBG.WIDGET_BUTTON;
      this.SetName('Switch');

   }

   OnClick(params) {

      const mesh = params.source_params;
      const point = MouseGetPos();
      const m = mesh.geom;

      // console.log('click')
      if (Check_intersection_point_rect(m.pos, m.dim, point, [0, 0])) {


         mesh.isOn ^= 0x1;
         mesh.UpdateText(mesh.state_text[mesh.isOn]);
         STATE.mesh.SetClicked(mesh);

         /**
          * For popup menu options and slider connections.
          * If the option is clicked, then we must call the slider connect function
          */
         if (params.target_params) {

            const target_params = {

               targetBindingFunctions: params.target_params.targetBindingFunctions,
               self_mesh: params.target_params.clicked_mesh,
               target_mesh: params.target_params.target_mesh,
               event_type: params.event_type,
                  /*FOR DEBUG*/clicked_mesh: mesh,
            }
            const EventClbk = params.target_params.EventClbk;
            console.log('OnClick callback IN. meshId ', mesh.id)
            EventClbk(target_params);
            // console.log('OnClick callback OUT. meshId ', mesh.id)
         }

         return true;
      }

      return false;
   }
}


export class Widget_Minimize extends Widget_Button {

   toggle; // On/Off
   stored_children_meshes; // Store all children meshes of the root, to maximize the widget back to normal. 
   stored_children_events; // Store the 'children' buffer of the roots EventListeners (class). 
   
   constructor(pos=[100,200,0], fontSize=5, col = GREY3, text_col, scale, pad = [6, 2], bold = .5, font, style = [0, 4, 1.8]) {
      
      
      super('-', pos, fontSize, TRANSPARENCY(col, .5), text_col, scale, pad, bold, font, style);
      
      this.toggle = false;
      this.store_children_meshes = null;
      this.stored_children_events = new Array(LISTEN_EVENT_TYPES_INDEX.SIZE); // Store the 'children' buffer of the roots EventListeners (class). 

   }

   OnClick(params) {

      const mesh = params.source_params;
      const point = MouseGetPos();
      const m = mesh.geom;

      // console.log('click')
      if (Check_intersection_point_rect(m.pos, m.dim, point, [0, 0])) {

         // console.log('I am a Minimizer button:', mesh.name, mesh.parent.name)

         STATE.mesh.SetClicked(mesh);


         if (mesh.parent) {

            const parent = mesh.parent;

            if (!mesh.toggle) {  // Maximize - toggle on

               // Copy parent's children
               mesh.store_children_meshes = new M_Buffer(parent.children);
               if(mesh.store_children_meshes === null)
                  console.log()
               
               
               
               Gfx_deactivate_no_listeners_touch(parent); // Reset root mesh(top parent) vertex and index buffers.
               
               { // Store widget's children events(for recovering widgets children events on maximize)
                  const click_event_type =  LISTEN_EVENT_TYPES_INDEX.CLICK;
                  const click_event_idx =  parent.listeners.buffer[LISTEN_EVENT_TYPES_INDEX.CLICK];
                  const hover_event_type =  LISTEN_EVENT_TYPES_INDEX.HOVER;
                  const hover_event_idx =  parent.listeners.buffer[LISTEN_EVENT_TYPES_INDEX.HOVER];
                  
                  mesh.stored_children_events[click_event_type] = Listeners_copy_event_children_buffer(click_event_type, click_event_idx);
                  // Delete all children events of the root's EventListener.
                  Listener_reset_children_buffer(click_event_type, click_event_idx);
                  mesh.stored_children_events[hover_event_type] = Listeners_copy_event_children_buffer(hover_event_type, hover_event_idx);
                  // Delete all children events of the root's EventListener.
                  Listener_reset_children_buffer(hover_event_type, hover_event_idx);
                  Listener_deactivate_children_events_buffer(LISTENERS_FLAGS.ALL, parent.listeners);
               }

               { // Create new minimized widget and add to the root parent
                  // Create a discription for the minimized widget!
                  const clarify = new Widget_Label(parent.name, [0, 0, 0], 4);
                  clarify.SetName('clarify minimized');
                  
                  const minimize_mesh = parent.children.buffer[0]; // TODO: First child suppose to be the minimize button. What happens if the btn is at a different index???
                  minimize_mesh.UpdateText('+')
                  
                  parent.children.Reset();
                  parent.AddChild(clarify);
                  parent.AddChild(minimize_mesh);
                  
                  // Set click event, back to the minimizer.
                  minimize_mesh.CreateListenEvent(LISTEN_EVENT_TYPES.HOVER);
                  minimize_mesh.CreateListenEvent(LISTEN_EVENT_TYPES.CLICK_DOWN, minimize_mesh.OnClick);
                  minimize_mesh.toggle = true;
               }
              
               parent.Reconstruct_listeners_recursive();
               
               { // Widget position and render
                  // Set current pos as the default pos.
                  CopyArr3(parent.geom.defPos, parent.geom.pos);
                  // Reposition minimized widget
                  parent.geom.pos[1] -= parent.geom.dim[1];
                  parent.geom.pos[0] -= parent.geom.dim[0]/2;
   
                  parent.Recalc(SECTION.HORIZONTAL);
                  // Set Graphics
                  parent.GenGfxCtx(GFX.PRIVATE);
                  parent.AddToGfx();
                  Gfx_end_session(true);
                  Gfx_activate(parent); // Re-enable the rendering of the vertex buffers.
               }

               
            }
            else { // Maximize - toggle off
               
               // /*DEBUG*/ const l = Debug_get_event_listeners();
               Gfx_deactivate_no_listeners_touch(parent);
               
               parent.children.Reset();
               parent.children = mesh.store_children_meshes;
               
               
               { // Recover widget's events
                  parent.RecreateListenEvents()
                  
                  const click_event_type =  LISTEN_EVENT_TYPES_INDEX.CLICK;
                  const click_event_idx =  parent.listeners.buffer[LISTEN_EVENT_TYPES_INDEX.CLICK];
                  const hover_event_type =  LISTEN_EVENT_TYPES_INDEX.HOVER;
                  const hover_event_idx =  parent.listeners.buffer[LISTEN_EVENT_TYPES_INDEX.HOVER];
                  Listener_recover_children_buffer(click_event_type, click_event_idx, mesh.stored_children_events[click_event_type]);
                  Listener_recover_children_buffer(hover_event_type, hover_event_idx, mesh.stored_children_events[hover_event_type]);
               }
               
               parent.children.buffer[0].UpdateText('-');

               { // Set widget pos and render
                  CopyArr3(parent.geom.pos, parent.geom.defPos); // Recover pos.
                  parent.Recalc(); // Recalculate all widgets children pos and dim.
                  // Add to gfx
                  parent.GenGfxCtx(GFX.PRIVATE);
                  parent.AddToGfx();
                  Gfx_end_session(true);
                  Gfx_activate(parent); // Re-enable the rendering of the vertex buffers.
               }
               
               mesh.toggle = false;
               
               // console.log('MAXIMIZED')
            }
         }

         return true;
      }

      return false;
   }
}
   



