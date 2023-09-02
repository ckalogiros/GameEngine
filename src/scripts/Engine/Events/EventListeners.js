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
      }

      LISTENERS_ACTIVE[TYPE_IDX] = true;
      return this.event_type[TYPE_IDX].Add(event_params);
   }

   DispatchEvents(TYPE_IDX, trigger_params) {

      if (this.event_type[TYPE_IDX] === undefined) return;
      if (TYPE_IDX < 0 || TYPE_IDX >= LISTEN_EVENT_TYPES_INDEX.SIZE) alert('Event type index does not exist.');
      
                  
      if( STATE.mesh.hovered && 
         STATE.mesh.hovered.listeners.buffer[LISTEN_EVENT_TYPES_INDEX.HOVER] !== INT_NULL && 
         STATE.mesh.hovered.listeners.buffer[LISTEN_EVENT_TYPES_INDEX.CLICK] !== INT_NULL){
            
         const idx = STATE.mesh.hovered.listeners.buffer[LISTEN_EVENT_TYPES_INDEX.CLICK];
            // console.log('!!!!!', this.event_type[LISTEN_EVENT_TYPES_INDEX.CLICK].buffer[idx].source_params.name);
            const dispatch_params = {
               source_params: this.event_type[LISTEN_EVENT_TYPES_INDEX.CLICK].buffer[idx].source_params,
               target_params: this.event_type[LISTEN_EVENT_TYPES_INDEX.CLICK].buffer[idx].target_params,
               trigger_params: trigger_params,
               event_type: TYPE_IDX,
            }
            this.event_type[TYPE_IDX].buffer[idx].Clbk(dispatch_params);
            return;
      }

      
      for (let i = 0; i < this.event_type[TYPE_IDX].count; i++) {
         
         if (this.event_type[TYPE_IDX].buffer[i]) {
            
            const dispatch_params = {
               source_params: this.event_type[TYPE_IDX].buffer[i].source_params,
               target_params: this.event_type[TYPE_IDX].buffer[i].target_params,
               trigger_params: trigger_params,
               event_type: TYPE_IDX,
            }
            
            const success = this.event_type[TYPE_IDX].buffer[i].Clbk(dispatch_params);
            if (success) {
               // if(this.event_type[TYPE_IDX].buffer[i]) // Case the dispatch removed the listener
               //    console.log('EVENT DISPATCH: ', this.event_type[TYPE_IDX].buffer[i].source_params.name)
               break;
            }
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

            const mesh = this.event_type[TYPE_IDX].buffer[i].source_params
            const d = mesh.geom;

            const rect = [
               [d.pos[0] - d.dim[0], d.pos[0] + d.dim[0]],     // Left  Right 
               [(d.pos[1] - d.dim[1]), (d.pos[1] + d.dim[1])], // Top  Bottom
            ];

            if (Intersection_point_rect(point, rect)) {

               if (STATE.mesh.hoveredId !== INT_NULL && STATE.mesh.hoveredId !== mesh.id) { // Case of doublehover
                  Events_handle_immidiate({ type: 'unhover', params: { mesh: STATE.mesh.hovered } }); // Unhover previous mesh.
               }

               if (mesh.StateCheck(MESH_STATE.IN_HOVER) === 0) { // Skip hover event, if mesh is already in hover
                  Events_handle_immidiate({ type: 'hover', params: { mesh: mesh } });
               }

            }
            else if (mesh.StateCheck(MESH_STATE.IN_HOVER) && (
                     !mesh.StateCheck(MESH_STATE.IN_MOVE) ||
                     !mesh.StateCheck(MESH_STATE.IN_GRAB))) {

                  Events_handle_immidiate({ type: 'unhover', params: { mesh: mesh } });
            }
         }
      }
      __pt6.Stop();
   }
   // CheckHover() {
   //    __pt6.Start();
   //    const TYPE_IDX = LISTEN_EVENT_TYPES_INDEX.HOVER;

   //    if (this.event_type[TYPE_IDX] === undefined) return;
   //    if (TYPE_IDX < 0 || TYPE_IDX >= LISTEN_EVENT_TYPES_INDEX.SIZE) alert('Event type index does not exist.');


   //    for (let i = 0; i < this.event_type[TYPE_IDX].count; i++) {

   //       if (this.event_type[TYPE_IDX].buffer[i]) { // Some buffer elements maybe null(removed)

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
   //             if (mesh.StateCheck(MESH_STATE.IS_FAKE_HOVER)) {

   //                Check_hover_recursive(mesh);
   //             }

   //          } else if (mesh.StateCheck(MESH_STATE.IN_HOVER) && (
   //             !mesh.StateCheck(MESH_STATE.IN_MOVE) ||
   //             !mesh.StateCheck(MESH_STATE.IN_GRAB))) {

   //             Events_handle_immidiate({ type: 'unhover', params: { mesh: mesh } });
   //          }
   //       }
   //    }
   //    __pt6.Stop();
   // }

   /** Debug */
   PrintAll() {

      let hover_cnt = 0, click_cnt = 0;
      for (let i = 0; i < LISTEN_EVENT_TYPES_INDEX.SIZE; i++) {
         if (this.event_type[i]) {
            for (let j = 0; j < this.event_type[i].count; j++) {
               if(this.event_type[i].buffer[j]){
                  if (i === LISTEN_EVENT_TYPES_INDEX.HOVER) {
   
                     console.log(`i: ${j} Hover Listener`, this.event_type[i].buffer[j].source_params.name,
                        this.event_type[i].buffer[j].source_params.geom.pos);
                     hover_cnt++;
                  }
                  else if (i === LISTEN_EVENT_TYPES_INDEX.CLICK) {
                     
                     console.log(`i: ${j} Click Listener`, this.event_type[i].buffer[j].source_params.name,
                        this.event_type[i].buffer[j].source_params.geom.pos);
                     click_cnt++;
                  }
               }
            }
         }
      }
      console.log('Total hover listeners: ', hover_cnt, 'Total click listeners: ', click_cnt);
   }
}

function Check_hover_recursive(mesh) {

   const point = MouseGetPos();
   const d = mesh.geom;

   const rect = [
      [d.pos[0] - d.dim[0], d.pos[0] + d.dim[0]],     // Left  Right 
      [(d.pos[1] - d.dim[1]), (d.pos[1] + d.dim[1])], // Top  Bottom
   ];

   if (Intersection_point_rect(point, rect)) {

      if (STATE.mesh.hoveredId !== INT_NULL && STATE.mesh.hoveredId !== mesh.id) { // Case of doublehover
         Events_handle_immidiate({ type: 'unhover', params: { mesh: STATE.mesh.hovered } }); // Unhover previous mesh.
      }

      if (mesh.StateCheck(MESH_STATE.IN_HOVER) === 0) { // Skip hover event, if mesh is already in hover
         Events_handle_immidiate({ type: 'hover', params: { mesh: mesh } });
      }

   }
   else if (mesh.StateCheck(MESH_STATE.IN_HOVER) && (
      !mesh.StateCheck(MESH_STATE.IN_MOVE) ||
      !mesh.StateCheck(MESH_STATE.IN_GRAB))) {

      Events_handle_immidiate({ type: 'unhover', params: { mesh: mesh } });
   }

   for (let i = 0; i < mesh.children.count; i++) {

      if (mesh.children.active_count) {

         const child = mesh.children.buffer[i];

         if (child)
            Check_hover_recursive(child);
      }
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

export function Listener_remove_event_by_idx(TYPE_IDX, idx) {

   // console.log(_listener.event_type[TYPE_IDX].buffer)
   _listener.event_type[TYPE_IDX].RemoveByIdx(idx);
   // console.log(_listener.event_type[TYPE_IDX].buffer)
   if (_listener.event_type[TYPE_IDX].active_count === 0)
      LISTENERS_ACTIVE[TYPE_IDX] = false;
}

export function Listener_get_event(TYPE_IDX, event_idx) {

   return _listener.event_type[TYPE_IDX].buffer[event_idx];
}

export function Listener_debug_print_all() {

   _listener.PrintAll();
}


export function Listener_listen_mouse_hover(params) {

   const mousePos = MouseGetPos();
   const point = mousePos;

   const verticalMargin = params.hover_margin;

   const rect = [
      [params.geom.pos[0] - params.geom.dim[0], params.geom.pos[0] + params.geom.dim[0]], // Left  Right 
      [(params.geom.pos[1] - params.geom.dim[1]) - verticalMargin, (params.geom.pos[1] + params.geom.dim[1]) + verticalMargin], // Top  Bottom
   ];
   // console.log('verticalMargin:', rect[1])

   return Intersection_point_rect(point, rect);
}

//////////////////////////////////////////////////////////////////////////////////////////////////////
