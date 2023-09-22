"use strict";

import { M_Buffer } from "../Core/Buffers";



export class Info_Listeners {

   events;

   constructor(){

      this.events = new M_Buffer();
   }

   AddEvent(EVENT_TYPE, Clbk = null, source_params = null, target_params = null) {

      const event_params = {
         event_type: EVENT_TYPE,
         Clbk: Clbk,
         source_params: source_params,
         target_params: target_params,
         isActive: true,
      }

      return this.events.Add(event_params);
   }

   DestroyEvent(idx){

      this.events.RemoveByIdx(idx);
   }

   DispatchEvents(EVENT_TYPE, trigger_params) {

      for (let i = 0; i < this.events.count; i++) {
            
         const evt = this.events.buffer[i]; 

         if(evt.event_type & EVENT_TYPE){

            // Handle event via callback
            const dispatch_params = {
               source_params: evt.source_params,
               target_params: evt.target_params,
               trigger_params: trigger_params,
               dispatch_event_type: EVENT_TYPE,
               event_type: evt.event_type,
            }
            evt.Clbk(dispatch_params)
         }
    
      } 
   }
}

const _info_listeners = new Info_Listeners();

export function Info_listener_create_event(TYPE_IDX, Clbk, source_params, target_params) {

   return _info_listeners.AddEvent(TYPE_IDX, Clbk, source_params, target_params);
}

export function Info_listener_dispatch_event(TYPE_IDX, trigger_params) {

   _info_listeners.DispatchEvents(TYPE_IDX, trigger_params);
}

export function Info_listener_destroy_event(event_idx) {

   _info_listeners.DestroyEvent(event_idx);
}
