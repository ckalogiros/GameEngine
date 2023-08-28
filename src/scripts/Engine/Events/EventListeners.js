"use strict";

import { Intersection_point_rect } from "../Collisions.js";
import { MouseGetPos } from "../Controls/Input/Mouse.js";
import { M_Buffer } from "../Core/Buffers.js";
import { __pt6 } from "../Timers/PerformanceTimers.js";
import { Events_handle_immidiate } from "./Events.js";



export class Event_Listener {

   event_type;

   constructor() {

      this.event_type = new Array(LISTEN_EVENT_TYPES_INDEX.SIZE);
   }

   AddEvent(TYPE_IDX, Clbk = null, self_params = null, target = null) {

      if (this.event_type[TYPE_IDX] === undefined) {

         console.log('Creating new event type events buffer')

         this.event_type[TYPE_IDX] = new M_Buffer();
      }
      //TODO: implenet as: self:{params: , }
      const params = {
         type: TYPE_IDX,
         Clbk: Clbk,
         self: self_params,
         target: target,
      }

      LISTENERS_ACTIVE[TYPE_IDX] = true;
      return this.event_type[TYPE_IDX].Add(params);
   }

   DispatchEvents(TYPE_IDX, trigger_params) {

      if (this.event_type[TYPE_IDX] === undefined) return;
      if (TYPE_IDX < 0 || TYPE_IDX >= LISTEN_EVENT_TYPES_INDEX.SIZE) alert('Event type index does not exist.');

      for (let i = 0; i < this.event_type[TYPE_IDX].count; i++) {

         if(this.event_type[TYPE_IDX].buffer[i]){

            const params = {
               self_params: this.event_type[TYPE_IDX].buffer[i].self,
               target_params: this.event_type[TYPE_IDX].buffer[i].target,
               trigger_params: trigger_params,
               event_type: TYPE_IDX,
            }

            const success = this.event_type[TYPE_IDX].buffer[i].Clbk(params);
            if(success) break;
         }
      }
   }
   CheckHover() {
      __pt6.Start();
      const TYPE_IDX = LISTEN_EVENT_TYPES_INDEX.HOVER;

      if (this.event_type[TYPE_IDX] === undefined) return;
      if (TYPE_IDX < 0 || TYPE_IDX >= LISTEN_EVENT_TYPES_INDEX.SIZE) alert('Event type index does not exist.');


      for (let i = 0; i < this.event_type[TYPE_IDX].count; i++) {

         if(this.event_type[TYPE_IDX].buffer[i]){

            const point = MouseGetPos();
      
            const mesh = this.event_type[TYPE_IDX].buffer[i].self
            const d = mesh.geom;

            const rect = [
               [d.pos[0] - d.dim[0], d.pos[0] + d.dim[0]],     // Left  Right 
               [(d.pos[1] - d.dim[1]), (d.pos[1] + d.dim[1])], // Top  Bottom
            ];
   
            if (Intersection_point_rect(point, rect)) {
   
               if (STATE.mesh.hoveredId !== INT_NULL && STATE.mesh.hoveredId !== mesh.id) { // Case of doublehover
                  Events_handle_immidiate({ type: 'unhover', params: { mesh: STATE.mesh.hovered } }); // Unhover previous mesh.
                  // console.log('Hover Event:', mesh.name)
               }
   
               if (mesh.StateCheck(MESH_STATE.IN_HOVER) === 0) { // Skip hover event, if mesh is already in hover
                  Events_handle_immidiate({ type: 'hover', params: { mesh: mesh } });
                  // console.log('Hover Event:', mesh.name)
               }
               
            }
            else if (mesh.StateCheck(MESH_STATE.IN_HOVER) && (
               !mesh.StateCheck(MESH_STATE.IN_MOVE) ||
               !mesh.StateCheck(MESH_STATE.IN_GRAB))) {
                        // console.log('UnHover Event:', mesh.name)
               Events_handle_immidiate({ type: 'unhover', params: { mesh: mesh } });
            }
         }
      }
      __pt6.Stop();
   }

   /** Debug */
   PrintAll() {

      let hover_cnt = 0, click_cnt = 0;
      for (let i = 0; i < LISTEN_EVENT_TYPES_INDEX.SIZE; i++) {
         if (this.event_type[i]) {
            for (let j = 0; j < this.event_type[i].count; j++) {

               if(i === LISTEN_EVENT_TYPES_INDEX.HOVER){
                  
                  console.log(`i: ${j} Hover Listener`, this.event_type[i].buffer[j].self.name);
                  hover_cnt++;
               }
               else if(i === LISTEN_EVENT_TYPES_INDEX.CLICK){
                  
                  console.log(`i: ${j} Click Listener`, this.event_type[i].buffer[j].self.name);
                  click_cnt++;
               }

               // console.log(this.event_type[i].buffer[j].self.name,
               //    'Clbk:', this.event_type[i].buffer[j].Clbk.name);
            }
         }
      }
      console.log('Total hover listeners: ', hover_cnt, 'Total click listeners: ', click_cnt);
   }
}

const _listener = new Event_Listener();

export function Listener_create_event(TYPE_IDX, Clbk, params, target) {

   return _listener.AddEvent(TYPE_IDX, Clbk, params, target);
}

export function Listener_dispatch_event(TYPE_IDX, trigger_params) {

   _listener.DispatchEvents(TYPE_IDX, trigger_params);
}
export function Listener_dispatch_check_hover_event() {

   _listener.CheckHover();
}

export function Listener_remove_event(TYPE_IDX, idx) {

   // console.log(_listener.event_type[TYPE_IDX].buffer)
   _listener.event_type[TYPE_IDX].RemoveByIdx(idx);
   // console.log(_listener.event_type[TYPE_IDX].buffer)
   if(_listener.event_type[TYPE_IDX].active_count === 0)
      LISTENERS_ACTIVE[TYPE_IDX] = false;
}

// export function Listener_remove_events_all(TYPE_IDX, idx) {

//    const row = mesh_listeners.GetRow(TYPE_IDX)

//    const count = row.length;
//    for(let i=0; i<count; i++){

//       _listener.event_type[TYPE_IDX].RemoveByIdx(idx);
//       mesh_listeners.RemoveByIdx(TYPE_IDX, i); // TYPE_IDX is 1 to 1 with the event listeners TYPE_IDX
//    }
// }

/** SAVE of Int8_2DBuffer */
// export function Listener_remove_events_all(TYPE_IDX, mesh_listeners) {

//    const row = mesh_listeners.GetRow(TYPE_IDX)

//    const count = row.length;
//    for(let i=0; i<count; i++){

//       _listener.event_type[TYPE_IDX].RemoveByIdx(row[i]);
//       mesh_listeners.RemoveByIdx(TYPE_IDX, i); // TYPE_IDX is 1 to 1 with the event listeners TYPE_IDX
//    }
// }

export function Listener_get_event(TYPE_IDX, event_idx) {

   return _listener.event_type[TYPE_IDX].buffer[event_idx];
}

export function Listener_debug_print_all(TYPE_IDX, event_idx) {

   _listener.PrintAll();
}


export function Listener_listen_mouse_hover(params) {

   const mousePos = MouseGetPos();
   const point = mousePos;

   const verticalMargin = params.hoverMargin;

   const rect = [
      [params.geom.pos[0] - params.geom.dim[0], params.geom.pos[0] + params.geom.dim[0]], // Left  Right 
      [(params.geom.pos[1] - params.geom.dim[1]) - verticalMargin, (params.geom.pos[1] + params.geom.dim[1]) + verticalMargin], // Top  Bottom
   ];
   // console.log('verticalMargin:', rect[1])

   return Intersection_point_rect(point, rect);
}

//////////////////////////////////////////////////////////////////////////////////////////////////////
