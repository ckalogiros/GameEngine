"use strict";

import { Intersection_point_rect } from "../Collisions.js";
import { MouseGetPos } from "../Controls/Input/Mouse.js";
import { M_Buffer } from "../Core/Buffers.js";
import { _pt5, _pt6 } from "../Timers/PerformanceTimers.js";
import { Events_handle_immidiate } from "./Events.js";


/** TODO!!: For efficiency
 * 
 * 
 * I am sure all for looping the listeners buffer and children's buffer run for count,
 * eventhough the buffers may have a lot of null elements due to the implementation of the EventListener.
 * FIX THAT!
 * 
 * Also ipmlement the: 
 *    If we check for click event, and the cur mesh has a hover, it's much more efficient
 *    to directly check for click the 'STATE.mesh.hovered' and skip all 
 *    the one by one top root meshes checking for click, since the only clicked mesh is
 *    the one that is allready hovered.
 * CODE:
 *     
       * If we already have registered a hovered mesh to STATE.mesh.hovered,
       * skip checking all click listen events since the only possible ckicked is the one that is curently hovered.
       * More Efficient.
      
      if (STATE.mesh.hovered &&
         STATE.mesh.hovered.listeners.buffer[H] !== INT_NULL &&
         STATE.mesh.hovered.listeners.buffer[C] !== INT_NULL) {

         const idx = STATE.mesh.hovered.listeners.buffer[C];

         const dispatch_params = {
            source_params: this.event_type[C].buffer[idx].source_params,
            target_params: this.event_type[C].buffer[idx].target_params,
            trigger_params: trigger_params,
            event_type: TYPE_IDX,
         }
         ret = this.event_type[TYPE_IDX].buffer[idx].Clbk(dispatch_params);

      // First check the children's event buffer
      if(this.event_type[C].buffer[idx].children !== null){ // Check children for events

         for(let j=0; j<this.event_type[C].buffer[idx].children.count; j++){

            const child_event = this.event_type[C].buffer[idx].children.buffer[j];

            const dispatch_params = {
               source_params: child_event.source_params,
               target_params: child_event.target_params,
               trigger_params: trigger_params,
               event_type: TYPE_IDX,
            }
            
            ret = child_event.Clbk(dispatch_params);
            
            if(ret) return; // If at least one event is handled, do not continue.
         }
         
      }
         return;

      // }
 */

export class Event_Listener {

   event_type;

   constructor() {

      this.event_type = new Array(LISTEN_EVENT_TYPES_INDEX.SIZE);
   }

   AddEvent(TYPE_IDX, Clbk = null, source_params = null, target_params = null) {

      if (this.event_type[TYPE_IDX] === undefined) {

         console.log('Creating new event type events buffer')
         this.event_type[TYPE_IDX] = new M_Buffer();
      }

      const event_params = {
         type: TYPE_IDX,
         Clbk: Clbk,
         source_params: source_params,
         target_params: target_params,
         isActive: true,
         children: null, // current mesh may have children with events. This is the buffer to store them, but only after 'ReconstructEvents' function call.
         anyChildrenActive: false, // This is to check if the current event has any children events(eficient since we do not have to check every child event if 'isActive')
      }

      LISTENERS_FLAGS[TYPE_IDX] = true;
      return this.event_type[TYPE_IDX].Add(event_params);
   }

   DispatchEvents(TYPE_IDX, trigger_params) {

      _pt5.Start(); /* Performance measure */

      if (this.event_type[TYPE_IDX] === undefined) return;
      if (TYPE_IDX < 0 || TYPE_IDX >= LISTEN_EVENT_TYPES_INDEX.SIZE) alert('Event type index does not exist.');

      let ret = false;


      for (let i = 0; i < this.event_type[TYPE_IDX].count; i++) {
            
         const evt = this.event_type[TYPE_IDX].buffer[i]; 

         // Case the EventListeners has nulled elements in the buffer (E.g EventListeners.buffer[null, evt1, evt2, ...])
         if(evt) {

            const mesh = evt.source_params;
            const point = MouseGetPos();
            const verticalMargin = mesh.hover_margin;
         
            const rect = [ // The rect area to check for event(mouse hover)
               [mesh.geom.pos[0] - mesh.geom.dim[0] - verticalMargin[0], mesh.geom.pos[0] + mesh.geom.dim[0] + verticalMargin[0]], // Left  Right 
               [(mesh.geom.pos[1] - mesh.geom.dim[1]) - verticalMargin[1], (mesh.geom.pos[1] + mesh.geom.dim[1]) + verticalMargin[1]], // Top  Bottom
            ];
         
            // If and only if mouse is intersecting with the current mesh(mouse hover) ...
            ret = Intersection_point_rect(point, rect);
            
            // ... see if any of it's children  have the same event type, check them and dispatch thei event first.
            if(ret){ // If we have an event on the parent, check if children have too.
   
               if(evt.anyChildrenActive && evt.children !== null){ // Check if has children events.
   
                  ret = false; // Use ret to test the children events intersection
                  for(let j=0; j<evt.children.count; j++){
                     
                     const child_event = evt.children.buffer[j];
                     if(child_event){

                        const child = child_event.source_params;
                        const child_rect = [ // The rect area to check for event(mouse hover)
                           [child.geom.pos[0] - child.geom.dim[0], child.geom.pos[0] + child.geom.dim[0]], // Left  Right 
                           [(child.geom.pos[1] - child.geom.dim[1]), (child.geom.pos[1] + child.geom.dim[1])], // Top  Bottom
                        ];

                        ret = Intersection_point_rect(point, child_rect);
                        if(ret){

   
                           const dispatch_params = {
                              source_params: child_event.source_params,
                              target_params: child_event.target_params,
                              trigger_params: trigger_params,
                              event_type: TYPE_IDX,
                           }
                           
                           if(child_event.Clbk){
   
                              ret = child_event.Clbk(dispatch_params);
                              if(ret === FLAGS.DESTROY){
                                 evt.children.RemoveByIdx(j);
                              }
                           }
                        }
                        
                        _pt5.Stop(); /* Performance measure */
                     }
   
   
                     // If at least one event is handled, do not continue with the rest 
                     // since it is a depth traversal so we found the inner most mesh.
                     // Else continue looping through all childrent for an event.
                     if(ret & FLAGS.TRUE) return; 
                  }
                  
               }
   
               // In the case 'no children' or 'children have no ret event', then call parents Clbk, since it succeded.
               const dispatch_params = {
                  source_params: evt.source_params,
                  target_params: evt.target_params,
                  trigger_params: trigger_params,
                  event_type: TYPE_IDX,
               }
               ret = evt.Clbk(dispatch_params);
               if(ret === FLAGS.DESTROY){
                  this.event_type[TYPE_IDX].RemoveByIdx(i);
               }
   
               _pt5.Stop();
               return; 
            }
         }
      } 
   }

   // CheckHover() {
   //    _pt6.Start();
   //    const TYPE_IDX = LISTEN_EVENT_TYPES_INDEX.HOVER;

   //    if (this.event_type[TYPE_IDX] === undefined) return;
   //    if (TYPE_IDX < 0 || TYPE_IDX >= LISTEN_EVENT_TYPES_INDEX.SIZE) alert('Event type index does not exist.');


   //    for (let i = 0; i < this.event_type[TYPE_IDX].count; i++) {

   //       if (this.event_type[TYPE_IDX].buffer[i]) {

   //          const point = MouseGetPos();

   //          const mesh = this.event_type[TYPE_IDX].buffer[i].source_params
   //          const d = mesh.geom;

   //          const rect = [
   //             [d.pos[0] - d.dim[0], d.pos[0] + d.dim[0]],     // Left  Right 
   //             [(d.pos[1] - d.dim[1]), (d.pos[1] + d.dim[1])], // Top  Bottom
   //          ];

   //          if (Intersection_point_rect(point, rect)) {

   //             if (STATE.mesh.hoveredId !== INT_NULL && STATE.mesh.hoveredId !== mesh.id) { // Case of doublehover
   //                Events_handle_immidiate({ type: 'unhover', params: { mesh: STATE.mesh.hovered } }); // Unhover previous mesh.
   //             }

   //             if (mesh.StateCheck(MESH_STATE.IN_HOVER) === 0) { // Skip hover event, if mesh is already in hover
   //                Events_handle_immidiate({ type: 'hover', params: { mesh: mesh } });
   //             }

   //          }
   //          else if (mesh.StateCheck(MESH_STATE.IN_HOVER) && (
   //             !mesh.StateCheck(MESH_STATE.IN_MOVE) ||
   //             !mesh.StateCheck(MESH_STATE.IN_GRAB))) {

   //             Events_handle_immidiate({ type: 'unhover', params: { mesh: mesh } });
   //          }
   //       }
   //    }
   //    _pt6.Stop();
   // }

   CheckHover() {
      _pt6.Start();
      const TYPE_IDX = LISTEN_EVENT_TYPES_INDEX.HOVER;

      if (this.event_type[TYPE_IDX] === undefined) return;
      if (TYPE_IDX < 0 || TYPE_IDX >= LISTEN_EVENT_TYPES_INDEX.SIZE) 
      console.error('Event type index does not exist.');


      for (let i = 0; i < this.event_type[TYPE_IDX].count; i++) {

         const event = this.event_type[TYPE_IDX].buffer[i]; 
         if (this.event_type[TYPE_IDX].buffer[i]) { // Some buffer elements maybe null(removed)

            const point = MouseGetPos();
            const mesh = event.source_params
            const d = mesh.geom;

            const rect = [
               [d.pos[0] - d.dim[0], d.pos[0] + d.dim[0]],     // Left  Right 
               [(d.pos[1] - d.dim[1]), (d.pos[1] + d.dim[1])], // Top  Bottom
            ];

            if (Intersection_point_rect(point, rect)) {

               if (STATE.mesh.hoveredId !== INT_NULL && STATE.mesh.hoveredId !== mesh.id) { // Case of doublehover
                  Events_handle_immidiate({ type: 'unhover', params: { mesh: STATE.mesh.hovered } }); // Unhover previous mesh.
               }
               if (event.children) {
                  // console.log(point)
                  if(Check_hover_recursive(event, point)) return;
               }

               Events_handle_immidiate({ type: 'hover', params: { mesh: mesh } });

            } else if (mesh.StateCheck(MESH_STATE.IN_HOVER) && (
               !mesh.StateCheck(MESH_STATE.IN_MOVE) || !mesh.StateCheck(MESH_STATE.IN_GRAB))) {

               Events_handle_immidiate({ type: 'unhover', params: { mesh: mesh } });
            }
         }
      }
      _pt6.Stop();
   }

   CopyChildren(TYPE_IDX, event_idx){

      const children_events = this.event_type[TYPE_IDX].buffer[event_idx].children;
      const temp = new M_Buffer;

      for(let i=0; i<children_events.count; i++){

         const evt = children_events.buffer[i];

         const event_params = {
            type: evt.type,
            Clbk: evt.Clbk,
            source_params: evt.source_params,
            target_params: evt.target_params,
            isActive: evt.isActive,
            children: null, // TODO: MUST COPY ALL CHILDRENS BUFFER RECURSIVELY???
            anyChildrenActive: evt.anyChildrenActive, 
         }

         temp.Add(event_params); 
      }
      return temp;
   }

   /** Debug */
   PrintAll() {
      console.log('Listener: ', _listener.event_type)
   }
}

function Print_all_recursive(children_buffer, count=0) {

   // let hover_cnt = 0, click_cnt = 0;
   
   for (let i = 0; i < children_buffer.count; i++) {
      let r = '   ';
      // console.log(`Childen Event Type: ${Listeners_get_event_type_string(i)}`);
      
      const event = children_buffer.buffer[i];
      if (event) {

         for (let j = 0; j < count; j++) r += '->';
         console.log(`${r} ${count} `, event.source_params.name);
         
         if(event.children){
            
            count++;
            console.log(`Children Events:`);
            this.PrintAll(event.children.buffer, count)
            count--;
         } 
            
      }
   }
}

function Check_hover_recursive(events, point) {

   for(let i=0; i<events.children.count; i++){

      if(events.children.buffer[i]){

         const evt = events.children.buffer[i];
   
         const child_event = evt.children;
         if(child_event)
            Check_hover_recursive(child_event, point);
   
         
         const mesh = evt.source_params
         const d = mesh.geom;
         const rect = [
            [d.pos[0] - d.dim[0], d.pos[0] + d.dim[0]],     // Left  Right 
            [(d.pos[1] - d.dim[1]), (d.pos[1] + d.dim[1])], // Top  Bottom
         ];
         
         // console.log(mesh.name, evt.isActive, point, rect)
         if (evt.isActive && Intersection_point_rect(point, rect)) {
            // console.log('', mesh.name)
   
            if (STATE.mesh.hoveredId !== INT_NULL && STATE.mesh.hoveredId !== mesh.id) { // Case of doublehover
               Events_handle_immidiate({ type: 'unhover', params: { mesh: STATE.mesh.hovered } }); // Unhover previous mesh.
            }
   
            Events_handle_immidiate({ type: 'hover', params: { mesh: mesh } });
            return true;
   
         } else if (mesh.StateCheck(MESH_STATE.IN_HOVER) && (
            !mesh.StateCheck(MESH_STATE.IN_MOVE) || !mesh.StateCheck(MESH_STATE.IN_GRAB))) {
   
            Events_handle_immidiate({ type: 'unhover', params: { mesh: mesh } });
         }
      }

   }

}
// function Check_hover_recursive(mesh, point) {

//    // const point = MouseGetPos();
//    const d = mesh.geom;

//    const rect = [
//       [d.pos[0] - d.dim[0], d.pos[0] + d.dim[0]],     // Left  Right 
//       [(d.pos[1] - d.dim[1]), (d.pos[1] + d.dim[1])], // Top  Bottom
//    ];

//    if (Intersection_point_rect(point, rect)) {

//       if (STATE.mesh.hoveredId !== INT_NULL && STATE.mesh.hoveredId !== mesh.id) { // Case of doublehover
//          Events_handle_immidiate({ type: 'unhover', params: { mesh: STATE.mesh.hovered } }); // Unhover previous mesh.
//       }

//       if (mesh.StateCheck(MESH_STATE.IN_HOVER) === 0) { // Skip hover event, if mesh is already in hover
//          Events_handle_immidiate({ type: 'hover', params: { mesh: mesh } });
//       }

//    }
//    else if (mesh.StateCheck(MESH_STATE.IN_HOVER) && (
//       !mesh.StateCheck(MESH_STATE.IN_MOVE) ||
//       !mesh.StateCheck(MESH_STATE.IN_GRAB))) {

//       Events_handle_immidiate({ type: 'unhover', params: { mesh: mesh } });
//    }

//    for (let i = 0; i < mesh.children.count; i++) {

//       if (mesh.children.active_count) {

//          const child = mesh.children.buffer[i];

//          if (child)
//             Check_hover_recursive(child, point);
//       }
//    }
// }

const _listener = new Event_Listener();


export function Debug_get_event_listeners(){ return _listener; }

export function Listeners_get_event(TYPE_IDX, event_idx){ return _listener.event_type[TYPE_IDX].buffer[event_idx]; }

export function Listeners_copy_event_children_buffer(TYPE_IDX, event_idx){ return _listener.CopyChildren(TYPE_IDX, event_idx); }

export function Listener_create_event(TYPE_IDX, Clbk, params, target) {

   return _listener.AddEvent(TYPE_IDX, Clbk, params, target);
}

export function Listener_dispatch_event(TYPE_IDX, trigger_params) {

   _listener.DispatchEvents(TYPE_IDX, trigger_params);
}

export function Listener_dispatch_check_hover_event() {

   _listener.CheckHover();
}

export function Listener_remove_event_by_idx(TYPE_IDX, idx) {

   _listener.event_type[TYPE_IDX].RemoveByIdx(idx);

   if (_listener.event_type[TYPE_IDX].active_count === 0)
      LISTENERS_FLAGS[TYPE_IDX] = false;
}

export function Listener_remove_children_event_by_idx(TYPE_IDX, event_idx, child_event_idx) {

   _listener.event_type[TYPE_IDX].buffer[event_idx].children.buffer.RemoveByIdx(child_event_idx);
}

export function Listener_deactivate_children_events_buffer(FLAGS, mesh_listeners){

   const hover_type_idx = LISTEN_EVENT_TYPES_INDEX.HOVER;
   const click_type_idx = LISTEN_EVENT_TYPES_INDEX.CLICK;

   if(FLAGS & LISTENERS_FLAGS.HOVER || FLAGS & LISTENERS_FLAGS.ALL){

      if(mesh_listeners.buffer[hover_type_idx] !== INT_NULL){
         
         _listener.event_type[hover_type_idx].buffer[mesh_listeners.buffer[hover_type_idx]].anyChildrenActive = false;
      }
   }
   
   if(FLAGS & LISTENERS_FLAGS.CLICK || FLAGS & LISTENERS_FLAGS.ALL){

      if(mesh_listeners.buffer[click_type_idx] !== INT_NULL){
         
         _listener.event_type[click_type_idx].buffer[mesh_listeners.buffer[click_type_idx]].anyChildrenActive = false;
      }
   }
}

export function Listener_reset_children_buffer(TYPE_IDX, event_idx){
   _listener.event_type[TYPE_IDX].buffer[event_idx].children = null;
}

export function Listener_recover_children_buffer(TYPE_IDX, event_idx, children_buffer){
   _listener.event_type[TYPE_IDX].buffer[event_idx].children = children_buffer;
   _listener.event_type[TYPE_IDX].buffer[event_idx].anyChildrenActive = true;
}

export function Listener_set_event_active_by_idx(TYPE_IDX, root, childs_evt_idx) {
   // SEE ### docs/ScemeDraws/HoveListenEvents.drawio

   const parent_event_idx = root.listeners.buffer[TYPE_IDX]; // Get the parents event from the EventListener's buffer
   if (parent_event_idx === INT_NULL)  alert('Root does not have a FAKE event')
   
   // Cache.
   const evt = _listener.event_type[TYPE_IDX].buffer[parent_event_idx];

   if(evt === null){

      console.error('evt is null');
      return;
   }

   if (evt.children === null){

      evt.children = new M_Buffer; // Create new buffer as a children's events buffer
      evt.anyChildrenActive = true;
   }

   // Copy the child's event params 
   const event_params = _listener.event_type[TYPE_IDX].buffer[childs_evt_idx];

   // Store them to the parents children event buffer
   const idx = evt.children.Add(event_params);
   _listener.event_type[TYPE_IDX].RemoveByIdx(childs_evt_idx); // Remove the child's event from the root eventListeners buffer

   return idx;
}

export function Listener_get_event(TYPE_IDX, event_idx) {

   return _listener.event_type[TYPE_IDX].buffer[event_idx];
}

export function Listener_debug_print_all() {

   _listener.PrintAll();
}
