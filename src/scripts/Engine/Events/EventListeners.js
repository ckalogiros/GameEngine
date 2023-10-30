"use strict";

import { Intersection_point_rect } from "../Drawables/Operations/Collisions.js";
import { MouseGetPos } from "../Controls/Input/Mouse.js";
import { M_Buffer } from "../Core/Buffers.js";
import { Drop_down_set_root, Widget_Dropdown } from "../Drawables/Meshes/Widgets/Menu/Widget_Dropdown.js";
import { Widget_Text } from "../Drawables/Meshes/Widgets/WidgetText.js";
import { _pt5, _pt6 } from "../Timers/PerformanceTimers.js";
import { Events_handle_immidiate } from "./Events.js";


/** TODO!!: For efficiency
 * 
 * 
 * All buffer's listeners and children run for count,
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

         for(let j=0; j<this.event_type[C].buffer[idx].children.boundary; j++){

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
         evt_idx: INT_NULL,
         parent_evt: INT_NULL,
         source_params: source_params,
         target_params: target_params,
         isActive: false,
         children: null, // current mesh may have children with events. This is the buffer to store them, but only after 'ReconstructEvents' function call.
         has_child_events: false, // This is to check if the current event has any children events(eficient since we do not have to check every child event if 'isActive')
      }

      LISTENERS_FLAGS[TYPE_IDX] = true;
      event_params.evt_idx = this.event_type[TYPE_IDX].Add(event_params);
      console.log(' === Add event:', event_params.source_params.name, ' parent event idx:', event_params.parent_evt)
      return this.event_type[TYPE_IDX].buffer[event_params.evt_idx];
   }

   AddChildEvent(TYPE_IDX, parent_eventidx, Clbk = null, source_params = null, target_params = null) {

      if (this.event_type[TYPE_IDX] === undefined) {

         console.log('Creating new event type events buffer')
         this.event_type[TYPE_IDX] = new M_Buffer();
      }

      const event_params = {
         type: TYPE_IDX,
         Clbk: Clbk,
         evt_idx: INT_NULL,
         parent_evt: parent_eventidx,
         source_params: source_params,
         target_params: target_params,
         isActive: true,
         children: null, // current mesh may have children with events. This is the buffer to store them, but only after 'ReconstructEvents' function call.
         has_child_events: false, // This is to check if the current event has any children events(eficient since we do not have to check every child event if 'isActive')
      }

      LISTENERS_FLAGS[TYPE_IDX] = true;
      // const event = this.event_type[TYPE_IDX].buffer[parent_eventidx];
      const event = parent_eventidx;
      /*DEBUG*/ if (!event) {
         console.error('Parent event not found. Parent event listeners:', parent_eventidx); return;
      }

      if (!event.children) {
         event.children = new M_Buffer();
      }

      event_params.evt_idx = event.children.Add(event_params);
      // const idx = event.children.Add(event_params);
      event.has_child_events = true;
      console.log(' = Add child event:', event_params.source_params.name, ' parent event:', event.source_params.name)
      // return idx;
      return event.children.buffer[event_params.evt_idx];
   }

   DispatchEvents(TYPE_IDX, trigger_params) {

      _pt5.Start(); /* Performance measure */

      /**DEBUG*/if (this.event_type[TYPE_IDX] === undefined) return;
      /**DEBUG*/if (TYPE_IDX < 0 || TYPE_IDX >= LISTEN_EVENT_TYPES_INDEX.SIZE) alert('Event type index does not exist.');

      let intersects = false;
      console.log('------------------------')


      for (let i = 0; i < this.event_type[TYPE_IDX].boundary; i++) {

         const evt = this.event_type[TYPE_IDX].buffer[i];

         // if(evt && evt.isActive) {
         if (evt) {

            const mesh = evt.source_params;
            const point = MouseGetPos();
            const verticalMargin = mesh.hover_margin;

            const rect = [ // The rect area to check for event(mouse hover)
               [mesh.geom.pos[0] - mesh.geom.dim[0] - verticalMargin[0], mesh.geom.pos[0] + mesh.geom.dim[0] + verticalMargin[0]], // Left  Right 
               [(mesh.geom.pos[1] - mesh.geom.dim[1]) - verticalMargin[1], (mesh.geom.pos[1] + mesh.geom.dim[1]) + verticalMargin[1]], // Top  Bottom
            ];

            // If and only if mouse is intersecting with the current mesh(mouse hover) ...
            intersects = Intersection_point_rect(point, rect);

            if (intersects && evt.has_child_events) { // Check all of its children(recursively)
               const event_found = Check_child_events_recursive(evt, point);
               if (event_found) {

                  const dispatch_params = {
                     source_params: event_found.source_params,
                     target_params: event_found.target_params,
                     trigger_params: trigger_params,
                     event_type: TYPE_IDX,
                  }

                  if (event_found.Clbk) 
                     event_found.Clbk(dispatch_params);

               }
            }
            else if (intersects) {
               const dispatch_params = {
                  source_params: evt.source_params,
                  target_params: evt.target_params,
                  trigger_params: trigger_params,
                  event_type: TYPE_IDX,
               }

               if (evt.Clbk) {
                  const ret = evt.Clbk(dispatch_params);
               }
            }
         }
      }

      // for (let i = 0; i < this.event_type[TYPE_IDX].boundary; i++) {

      //    const evt = this.event_type[TYPE_IDX].buffer[i]; 

      //    // Case the EventListeners has nulled elements in the buffer (E.g EventListeners.buffer[null, evt1, evt2, ...])
      //    // if(evt && evt.isActive) {
      //    if(evt) {

      //       const mesh = evt.source_params;
      //       const point = MouseGetPos();
      //       const verticalMargin = mesh.hover_margin;

      //       const rect = [ // The rect area to check for event(mouse hover)
      //          [mesh.geom.pos[0] - mesh.geom.dim[0] - verticalMargin[0], mesh.geom.pos[0] + mesh.geom.dim[0] + verticalMargin[0]], // Left  Right 
      //          [(mesh.geom.pos[1] - mesh.geom.dim[1]) - verticalMargin[1], (mesh.geom.pos[1] + mesh.geom.dim[1]) + verticalMargin[1]], // Top  Bottom
      //       ];

      //       // If and only if mouse is intersecting with the current mesh(mouse hover) ...
      //       ret = Intersection_point_rect(point, rect);

      //       // ... see if any of it's children  have the same event type, check them and dispatch thei event first.
      //       if(ret){ // If we have an event on the parent, check if children have too.

      //          if(evt.has_child_events && evt.children !== null){ // Check if has children events.

      //             ret = false; // Use ret to test the children events intersection
      //             for(let j=0; j<evt.children.boundary; j++){

      //                const child_event = evt.children.buffer[j];
      //                if(child_event){

      //                   const child = child_event.source_params;
      //                   const child_rect = [ // The rect area to check for event(mouse hover)
      //                      [child.geom.pos[0] - child.geom.dim[0], child.geom.pos[0] + child.geom.dim[0]], // Left  Right 
      //                      [(child.geom.pos[1] - child.geom.dim[1]), (child.geom.pos[1] + child.geom.dim[1])], // Top  Bottom
      //                   ];

      //                   ret = Intersection_point_rect(point, child_rect);
      //                   if(ret){

      //                      const dispatch_params = {
      //                         source_params: child_event.source_params,
      //                         target_params: child_event.target_params,
      //                         trigger_params: trigger_params,
      //                         event_type: TYPE_IDX,
      //                      }

      //                      if(child_event.Clbk){

      //                         ret = child_event.Clbk(dispatch_params);
      //                         if(ret === FLAGS.DESTROY){
      //                            evt.children.RemoveByIdx(j);
      //                         }
      //                      }
      //                      /**
      //                       * If the child_event.Clbk is null, means that the event is a Fake event
      //                       * and we have to run recursively if the event has children events
      //                       */
      //                   }

      //                   _pt5.Stop(); /* Performance measure */
      //                }
      //                // If at least one event is handled, do not continue with the rest 
      //                // since it is a depth traversal so we found the inner most mesh.
      //                // Else continue looping through all childrent for an event.
      //                if(ret & FLAGS.TRUE) return; 
      //             }
      //          }

      //          // In the case 'no children' or 'children have no ret event', then call parents Clbk, since it succeded.
      //          const dispatch_params = {
      //             source_params: evt.source_params,
      //             target_params: evt.target_params,
      //             trigger_params: trigger_params,
      //             event_type: TYPE_IDX,
      //          }

      //          if(evt.Clbk){

      //             ret = evt.Clbk(dispatch_params);
      //             if(ret === FLAGS.DESTROY){
      //                this.event_type[TYPE_IDX].RemoveByIdx(i);
      //             }
      //          }

      //          _pt5.Stop();
      //          return; 
      //       }
      //    }
      // } 
   }

   CheckHover() {
      _pt6.Start();
      const TYPE_IDX = LISTEN_EVENT_TYPES_INDEX.HOVER;

      if (this.event_type[TYPE_IDX] === undefined) return;
      /*DEBUG*/if (TYPE_IDX < 0 || TYPE_IDX >= LISTEN_EVENT_TYPES_INDEX.SIZE)
         console.error('Event type index does not exist.');


      for (let i = 0; i < this.event_type[TYPE_IDX].boundary; i++) {

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
               // console.log('Listener!');

               if (STATE.mesh.hoveredId !== INT_NULL && STATE.mesh.hoveredId !== mesh.id) { // Case of doublehover
                  Events_handle_immidiate({ type: 'unhover', params: { mesh: STATE.mesh.hovered } }); // Unhover previous mesh.
               }
               if (event.has_child_events && event.children) {
                  // console.log(point)
                  if (Check_hover_recursive(event, point)) return;
               }

               Events_handle_immidiate({ type: 'hover', params: { mesh: mesh } });
               // console.log('', mesh.name)

            } else if (mesh.StateCheck(MESH_STATE.IN_HOVER) && (
               !mesh.StateCheck(MESH_STATE.IN_MOVE) || !mesh.StateCheck(MESH_STATE.IN_GRAB))) {

               Events_handle_immidiate({ type: 'unhover', params: { mesh: mesh } });
            }
         }
      }
      _pt6.Stop();
   }

   CopyChildren(TYPE_IDX, event_idx) {

      const children_events = this.event_type[TYPE_IDX].buffer[event_idx].children;
      const temp = new M_Buffer;

      for (let i = 0; i < children_events.boundary; i++) {

         const evt = children_events.buffer[i];

         const event_params = {
            type: evt.type,
            Clbk: evt.Clbk,
            source_params: evt.source_params,
            target_params: evt.target_params,
            isActive: evt.isActive,
            children: null, // TODO: MUST COPY ALL CHILDRENS BUFFER RECURSIVELY???
            has_child_events: evt.has_child_events,
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

function Check_hover_recursive(events, point) {

   for (let i = 0; i < events.children.boundary; i++) {

      if (events.children.buffer[i]) {

         const evt = events.children.buffer[i];

         const child_event = evt.children;
         if (child_event)
            Check_hover_recursive(child_event, point);


         const mesh = evt.source_params
         const d = mesh.geom;
         const rect = [
            [d.pos[0] - d.dim[0], d.pos[0] + d.dim[0]],     // Left  Right 
            [(d.pos[1] - d.dim[1]), (d.pos[1] + d.dim[1])], // Top  Bottom
         ];

         // if (evt.isActive && Intersection_point_rect(point, rect)) {
         if (Intersection_point_rect(point, rect)) {

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

/**
 * CONTINUE:
 * 
 * the second slider is child of section 0 instead of section 6(second section)
 */
function Check_child_events_recursive(evt, point) {

   for (let i = 0; i < evt.children.boundary; i++) {

      const child_evt = evt.children.buffer[i];
      if (child_evt) {

         const mesh = child_evt.source_params;
         const verticalMargin = mesh.hover_margin;

         const rect = [ // The rect area to check for event(mouse hover)
            [mesh.geom.pos[0] - mesh.geom.dim[0] - verticalMargin[0], mesh.geom.pos[0] + mesh.geom.dim[0] + verticalMargin[0]], // Left  Right 
            [(mesh.geom.pos[1] - mesh.geom.dim[1]) - verticalMargin[1], (mesh.geom.pos[1] + mesh.geom.dim[1]) + verticalMargin[1]], // Top  Bottom
         ];

         // If and only if mouse is intersecting with the current mesh(mouse hover) ...
         const intersects = Intersection_point_rect(point, rect);

         if (intersects && child_evt.has_child_events) { // Check all of its children(recursively)
            const ret = Check_child_events_recursive(child_evt, point)
            if (ret) return ret; // Because it a recursive procedure, when the mesh is found we must return it recursively immidiately after the return of the each recursion.
         }
         if (intersects && (!mesh.StateCheck(MESH_STATE.IS_FAKE_EVENT))) { // Check all of its children(recursively)
            console.log(mesh.name)
            return child_evt;
         }

      }
   }

   return null;
}

const _listener = new Event_Listener();


export function Listeners_get_event(TYPE_IDX, event_idx) { return _listener.event_type[TYPE_IDX].buffer[event_idx]; }

export function Listeners_copy_event_children_buffer(TYPE_IDX, event_idx) { return _listener.CopyChildren(TYPE_IDX, event_idx); }

export function Listener_create_event(TYPE_IDX, Clbk, source_params, target_params) {

   return _listener.AddEvent(TYPE_IDX, Clbk, source_params, target_params);
}

export function Listener_create_child_event(TYPE_IDX, parent_eventidx, Clbk = null, source_params = null, target_params = null) {

   return _listener.AddChildEvent(TYPE_IDX, parent_eventidx, Clbk, source_params, target_params);
}

export function Listener_remove_event_by_idx(TYPE_IDX, evt) {

   _listener.event_type[TYPE_IDX].RemoveByIdx(evt.evt_idx);
   if (_listener.event_type[TYPE_IDX].active_count === 0)
      LISTENERS_FLAGS[TYPE_IDX] = false;
}

export function Listener_remove_children_event_by_idx(TYPE_IDX, evt) {

   /**
    * Remove child events requires the parent to remove the child event from 
    */
   evt.parent_evt.children.RemoveByIdx(evt.evt_idx);

   if (_listener.event_type[TYPE_IDX].active_count === 0)
      LISTENERS_FLAGS[TYPE_IDX] = false;
}

export function Listener_dispatch_event(TYPE_IDX, trigger_params) {

   _listener.DispatchEvents(TYPE_IDX, trigger_params);
}

export function Listener_dispatch_check_hover_event() {

   _listener.CheckHover();
}

// export function Listener_remove_event_by_idx2(TYPE_IDX, gatheredIdxs) {

//    const i = gatheredIdxs;
//    const count = i.length;
//    switch(count){

//       case 1:{

//          _listener.event_type[TYPE_IDX].RemoveByIdx(gatheredIdxs[0]);
//          break;
//       }
//       case 2:{

//          _listener.event_type[TYPE_IDX].buffer[i[0]].children.RemoveByIdx([i[1]]);
//          break;
//       }
//       case 3:{

//          _listener.event_type[TYPE_IDX].buffer[i[0]].children.buffer[i[1]].children.RemoveByIdx(i[2]);
//          break;
//       }
//       default: alert('No depth fount. @ Listener_remove_event_by_idx2()')
//    }

//    // A way of not bothering dispatching this type of event (if none exist), from the Events.js
//    if (_listener.event_type[TYPE_IDX].active_count === 0)
//       LISTENERS_FLAGS[TYPE_IDX] = false;
// }

export function Listener_events_set_mesh_events_active(FLAGS, mesh_listeners, bool_activate) {

   const hover_type_idx = LISTEN_EVENT_TYPES_INDEX.HOVER;
   const click_type_idx = LISTEN_EVENT_TYPES_INDEX.CLICK;

   if ((FLAGS & LISTENERS_FLAGS.HOVER) || (FLAGS & LISTENERS_FLAGS.ALL)) {

      if (mesh_listeners.buffer[hover_type_idx]) {

         // _listener.event_type[hover_type_idx].buffer[mesh_listeners.buffer[hover_type_idx].idx].has_child_events = bool_activate;
         _listener.event_type[hover_type_idx].buffer[mesh_listeners.buffer[hover_type_idx].idx].isActive = bool_activate;
      }
   }

   if ((FLAGS & LISTENERS_FLAGS.CLICK) || (FLAGS & LISTENERS_FLAGS.ALL)) {

      if (mesh_listeners.buffer[click_type_idx]) {
         /**DEBUG*/ if (_listener.event_type[click_type_idx].buffer[mesh_listeners.buffer[click_type_idx].idx] === undefined)
            console.error('Undefined listen event:', mesh_listeners.buffer[click_type_idx].idx, ' type:', click_type_idx)

         // _listener.event_type[click_type_idx].buffer[mesh_listeners.buffer[click_type_idx].idx].has_child_events = bool_activate;
         _listener.event_type[click_type_idx].buffer[mesh_listeners.buffer[click_type_idx].idx].isActive = bool_activate;
      }
   }
}

export function Listener_reset_children_buffer(TYPE_IDX, event_idx) {
   _listener.event_type[TYPE_IDX].buffer[event_idx].children = null;
}

export function Listener_recover_children_buffer(TYPE_IDX, event_idx, children_buffer) {
   _listener.event_type[TYPE_IDX].buffer[event_idx].children = children_buffer;
   _listener.event_type[TYPE_IDX].buffer[event_idx].has_child_events = true;
}

export function Listener_set_event_active_by_idx(TYPE_IDX, root, childs_evt_idx) {
   // SEE ### docs/ScemeDraws/HoveListenEvents.drawio

   const parent_event_idx = root.listeners.buffer[TYPE_IDX].idx; // Get the parents event from the EventListener's buffer
   if (parent_event_idx === INT_NULL) alert('Root does not have a FAKE event')

   // Get the root's event.
   const evt = _listener.event_type[TYPE_IDX].buffer[parent_event_idx];

   if (evt === null) {

      console.error('evt is null');
      return;
   }

   if (evt.children === null) {

      evt.children = new M_Buffer; // Create new buffer as a children's events buffer
      evt.has_child_events = true;
   }

   // Copy the child's event params 
   const event_params = _listener.event_type[TYPE_IDX].buffer[childs_evt_idx];

   // _listener.AddChildEvent(TYPE_IDX, root.listeners.buffer[TYPE_IDX], event_params.Clbk, event_params.source_params, event_params.target_params)
   // if(TYPE_IDX === LISTEN_EVENT_TYPES_INDEX.HOVER) _listener.AddChildEvent(TYPE_IDX, root.listeners.buffer, event_params.Clbk, event_params.source_params, event_params.target_params)
   // else if(TYPE_IDX === LISTEN_EVENT_TYPES_INDEX.CLICK) _listener.AddChildEvent(TYPE_IDX, root.listeners.buffer, event_params.Clbk, event_params.source_params, event_params.target_params)

   _listener.event_type[TYPE_IDX].RemoveByIdx(childs_evt_idx); // Remove the child's event from the root eventListeners buffer
   // Store them to the parents children event buffer
   const idx = evt.children.Add(event_params);

   return idx;
}

// export function Listener_set_event_active_by_idx(TYPE_IDX, root, childs_evt_idx) {
//    // SEE ### docs/ScemeDraws/HoveListenEvents.drawio

//    const parent_event_idx = root.listeners.buffer[TYPE_IDX].idx; // Get the parents event from the EventListener's buffer
//    if (parent_event_idx === INT_NULL)  alert('Root does not have a FAKE event')

//    // Get the root's event.
//    const evt = _listener.event_type[TYPE_IDX].buffer[parent_event_idx];

//    if(evt === null){

//       console.error('evt is null');
//       return;
//    }

//    if (evt.children === null){

//       evt.children = new M_Buffer; // Create new buffer as a children's events buffer
//       evt.has_child_events = true;
//    }

//    // Copy the child's event params 
//    const event_params = _listener.event_type[TYPE_IDX].buffer[childs_evt_idx];

//    // Store them to the parents children event buffer
//    const idx = evt.children.Add(event_params);
//    _listener.event_type[TYPE_IDX].RemoveByIdx(childs_evt_idx); // Remove the child's event from the root eventListeners buffer

//    return idx;
// }

export function Listener_get_event(TYPE_IDX, event_idx) {

   return _listener.event_type[TYPE_IDX].buffer[event_idx];
}


/** DEBUG-PRINT */
export function Debug_get_event_listeners() { return _listener; }

export function Listener_debug_print_all() {

   _listener.PrintAll();
}

export function Listener_debug_print_info() {

   const count = _listener.event_type.length;
   for (let i = 0; i < count; i++) {

      console.log('-Event type:', i);

      let events_count = 0;
      const e = _listener.event_type[i];
      if (e) {
         events_count += Listener_debug_print_info_recursive(e, events_count);
      }
      console.log(`+++ Total count:${events_count}`)
   }
}

function Listener_debug_print_info_recursive(children, count) {

   let total_count = 0;

   for (let i = 0; i < children.boundary; i++) {

      const e = children.buffer[i];

      if (e) {

         let r = ' ';

         for (let j = 0; j < count; j++) r += '->';

         const is_child_event = (e.source_params.listeners.buffer[1]) ? e.source_params.listeners.buffer[1].is_child_event : false;
         const msg = `  ${r} ${i} name:${e.source_params.name} active:${e.isActive} | has childen:${e.has_child_events} | is_child_event:${is_child_event} parent_evt:${e.parent_evt} | evt_idx:${e.evt_idx}`;
         console.log(msg);
         total_count++;

         if (e.children) {
            count++;
            total_count += Listener_debug_print_info_recursive(e.children, count);
            count--;
         }
      }
   }

   return total_count;
}

// export function Listener_debug_print_info() {

//    const count = _listener.event_type.length;
//    for (let i = 0; i < count; i++) {

//       console.log('-Event type:', i);

//       let events_count = 0;
//       const e = _listener.event_type[i];
//       if (e) {

//          for (let j = 0; j < e.boundary; j++) {

//             if (e.buffer[j]) {

//                const msg = `${j} meshname:${e.buffer[j].source_params.name} active:${e.buffer[j].isActive} childen:${e.buffer[j].has_child_events} `;
//                console.log(msg);

//                if (e.buffer[j].has_child_events) {

//                   for (let k = 0; k < e.buffer[j].children.boundary; k++) {
//                      const e_c = e.buffer[j].children.buffer[k];
//                      if (e_c) {

//                         const is_child_event = (e_c.source_params.listeners.buffer[1]) ? e_c.source_params.listeners.buffer[1].is_child_event : false;
//                         const msg = `  -> ${j}-${k} name:${e_c.source_params.name} active:${e_c.isActive} | has childen:${e_c.has_child_events} | is_child_event:${is_child_event} parent_evt:${e_c.parent_evt} | evt_idx:${e_c.evt_idx}`;

//                         // if(!e_c.source_params.StateCheck(MESH_STATE.IS_FAKE_EVENT)) 
//                         {
//                            console.log(msg);
//                            events_count++;
//                         }
//                      }
//                   }
//                }

//                events_count++;
//             }
//          }
//       }
//       console.log(`+++ Total count:${events_count}`)
//    }

// }

// function Print_all_recursive(children_buffer, count=0) {

//    for (let i = 0; i < children_buffer.boundary; i++) {
//       let r = '   ';

//       const event = children_buffer.buffer[i];
//       if (event) {

//          for (let j = 0; j < count; j++) r += '->';
//          console.log(`${r} ${count} `, event.source_params.name);

//          if(event.children){

//             count++;
//             console.log(`Children Events:`);
//             this.PrintAll(event.children.buffer, count)
//             count--;
//          } 

//       }
//    }
// }


/**************************************************************************************************************************/
// Debug Info Drop Down

export function Listeners_debug_info_create(scene) {

   const dp_btn_pad = [10, 2]
   const dropdown = new Widget_Dropdown('Listeners Dropdown Section Panel', [300, 20, 0], [60, 20], GREY1, TRANSPARENCY(GREY5, .8), WHITE, dp_btn_pad);
   dropdown.CreateListenEvent(LISTEN_EVENT_TYPES.HOVER); dropdown.StateEnable(MESH_STATE.IS_HOVER_COLORABLE);

   for (let i = 0; i < _listener.event_type.length; i++) {

      const evt_type = _listener.event_type[i];
      const type = Listeners_get_event_type_string(i);

      let count = evt_type.boundary;

      const drop_down_evt_type = new Widget_Dropdown(`buffer type:${type} | count:${evt_type.boundary}`, [200, 400, 0], [60, 20], GREY1, TRANSPARENCY(BLACK, 1.1), WHITE, dp_btn_pad);
      drop_down_evt_type.CreateListenEvent(LISTEN_EVENT_TYPES.HOVER); drop_down_evt_type.StateEnable(MESH_STATE.IS_HOVER_COLORABLE);

      for (let j = 0; j < evt_type.boundary; j++) {

         const evt = evt_type.buffer[j];

         if (evt.has_child_events)
            count += Listeners_debug_info_create_recursive(scene, drop_down_evt_type, evt.children, evt.source_params.name);

         if (evt) {
            const info = `type: ${type} | idx: ${j} | ${evt.source_params.name}`;
            const text = new Widget_Text(info, [OUT_OF_VIEW, OUT_OF_VIEW, 0], 4, WHITE);
            text.info_id = [i, j]
            text.debug_info.type |= INFO_LISTEN_EVENT_TYPE.LISTENERS;
            drop_down_evt_type.AddToMenu(text)

         }
      }

      dropdown.AddToMenu(drop_down_evt_type)
   }

   scene.AddMesh(dropdown);
   dropdown.Init();
   dropdown.Calc();
   Drop_down_set_root(dropdown, dropdown);
}

function Listeners_debug_info_create_recursive(scene, dropdown_root, evt_children, parent_discription) {

   // if children events exist, put them in a new drop down.
   const dp_btn_pad = [0, 0]
   const drop_down_evt_type = new Widget_Dropdown(`children of: ${parent_discription}`, [200, 400, 0], [60, 20], GREY1, ORANGE_240_130_10, WHITE, dp_btn_pad);
   drop_down_evt_type.CreateListenEvent(LISTEN_EVENT_TYPES.HOVER); drop_down_evt_type.StateEnable(MESH_STATE.IS_HOVER_COLORABLE);


   for (let j = 0; j < evt_children.boundary; j++) {

      const evt = evt_children.buffer[j];

      if (evt.has_child_events) // Pass as new root for the recursion the current dropdown menu
         Listeners_debug_info_create_recursive(scene, drop_down_evt_type, evt.children);

      const type = Listeners_get_event_type_string(evt.type);
      const info = `type: ${type} | event: ${j} | name:${evt.source_params.name}`;
      const text = new Widget_Text(info, [OUT_OF_VIEW, OUT_OF_VIEW, 0], 4, WHITE);
      text.info_id = [type, j]
      text.debug_info.type |= INFO_LISTEN_EVENT_TYPE.LISTENERS;
      drop_down_evt_type.AddToMenu(text)
   }

   dropdown_root.AddToMenu(drop_down_evt_type);
}

export function Listeners_debug_info_update(params) {

   const dropdown_root = params.source_params;

   const evt = params.target_params;

   for (let i = 0; i < dropdown_root.children.boundary; i++) {

      const dropdown_child = dropdown_root.children.buffer[i];
      if (dropdown_child.info_id[0] === evt.type) {

         const type = Listeners_get_event_type_string(evt.type);
         const info = `type: ${type} | name:${evt.source_params.name}`;
         const text = new Widget_Text(info, [OUT_OF_VIEW, OUT_OF_VIEW, 0], 4, WHITE);
         text.info_id = [evt.type, 0]
         text.debug_info.type |= INFO_LISTEN_EVENT_TYPE.LISTENERS;
         dropdown_child.AddToMenu(text);
      }
   }
} 
