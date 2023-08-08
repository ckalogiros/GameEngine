"use strict";

import { Collision_PointRect } from "../Collisions.js";
import { MouseGetMousePos } from "../Controls/Input/Mouse.js";
import { RegisterEvent } from "./Events.js";



const MAX_DISPATCH_EVENTS_BUFFER_SIZE = 8; // TODO: Get the max size depending on an global enum for all different kinds of dispatch events
const MAX_LISTEN_EVENTS_BUFFER_SIZE = 8; // TODO: Get the max size depending on an global enum for all different kinds of dispatch events

class Dispatcher {

   type;
   clbk;
   params;

   constructor(type = INT_NULL, clbk = null, params = null) {

      this.type = type;
      this.clbk = clbk;
      this.params = params;
   }

   AddEvent(type, clbk, params) {

      this.type = type;
      this.clbk = clbk;
      this.params = params;
   }
}

class Dispatchers {

   buffer;
   count;
   size;

   constructor(size) {

      this.size = size;
      this.count = 0;
      this.buffer = new Array(size);

      for (let i = 0; i < size; i++) {
         this.buffer[i] = new Dispatcher();
      }
   }

   CreateEvent(type, clbk, params) {

      const idx = this.count++;
      this.buffer[idx].AddEvent(type, clbk, params);

      return idx;
   }
}


class Listener {

   listenClbk;
   params;
   dispatchEventBuffer;

   constructor(clbk = null, params = null) {

      this.listenClbk = clbk;
      this.params = params;
      this.dispatchEventBuffer = new Dispatchers(MAX_DISPATCH_EVENTS_BUFFER_SIZE);

   }

   CreateListenEvent(clbk, params) {

      this.listenClbk = clbk;
      this.params = params;
   }

}


export class EventListener {

   has; // TODO: Create an enum of bit-masks for all booleans, OR maybe a class if this is used in many classes
   type;
   buffer;
   count;
   size;

   constructor() {

      this.size = MAX_LISTEN_EVENTS_BUFFER_SIZE;
      this.count = 0;
      this.type = INT_NULL;
      this.has = false;
      this.buffer = [];

      for (let i = 0; i < this.size; i++)
         this.buffer[i] = new Listener();
   }

   CreateListenEvent(type, params) {

      const idx = this.count++;

      /** Set the correct function to run in the main App loop to listen for events. */
      switch (type) {

         case LISTEN_EVENT_TYPES.HOVER: {

            this.buffer[idx].CreateListenEvent(Listener_listen_mouse_hover, params);
            this.has = true;
            this.type = type;

            return idx;
         }
      }
   }

   CreateDispatchEvent(type, clbk, params, listenerIdx) {

      if (!this.buffer || this.count >= this.size) {
         // TODO: Implement Realloc
         console.error('EventListener\'s buffer is uninitialized Or buffer overflow');
         return;
      }

      // Returns the index of the dispatchEventBuffer
      return this.buffer[listenerIdx].dispatchEventBuffer.CreateEvent(type, clbk, params);
   }



   Listen() {
      if (this.buffer[0].listenClbk)
         return this.buffer[0].listenClbk(this.buffer[0].params);
   }

   Dispatch() {
      if (this.buffer[0].dispatchClbk)
         return this.buffer[0].dispatchClbk(this.buffer[0].dispatchClbkParams);
   }

   Realloc() {

      this.size *= 2;
      const oldData = this.data;
      this.data = new Array(this.size);
      this.CopyBuffer(oldData)
      console.warn('Resizing M_Buffer!')
   }

   #CopyBuffer(oldData) {

      const size = oldData.length;
      for (let i = 0; i < size; i++) {
         this.data[i] = oldData[i];
      }
   }

}


const MAX_LISTENERS_SIZE = 16;

class EventListeners {

   buffer = [];
   count;
   size;

   constructor(size) {

      this.size = size;
      this.count = 0;
      if (size === undefined || size <= 0) console.error('Size is null. @ class EventListeners.constructor().')

      for (let i = 0; i < this.size; i++) {
         this.buffer[i] = new EventListener();
      }
   }

   CreateListenEvent(type, params) {

      /** Use buffer of same listen events */
      let listenEventIdx = this.#GetListenEventIdx(type);
      let listenerIdx = INT_NULL;


      if (listenEventIdx !== INT_NULL) { // If same type of listener has already been created...

         listenerIdx = this.buffer[listenEventIdx].CreateListenEvent(type, params);
      }
      else { // Create listener buffer of that type and add the new listener

         listenEventIdx = this.GetNextFree();
         if (listenEventIdx !== INT_NULL) {
            listenerIdx = this.buffer[listenEventIdx].CreateListenEvent(type, params);
            this.count++;
         }
      }

      return [listenEventIdx, listenerIdx];

   }

   CreateDispatchEvent(type, clbk, params, listenEvevtIdx, listenerIdx) {

      return this.buffer[listenEvevtIdx].CreateDispatchEvent(type, clbk, params, listenerIdx);
   }

   GetNextFree() {
      for (let i = 0; i < this.size; i++) {
         if (!this.buffer[i].has) {
            return i;
         }
      }
      return INT_NULL;
   }

   Run() {
      for (let i0 = 0; i0 < this.count; i0++) { // Listen event type buffer. (E.x. buffer[0] === EVENT_TYPE:HOVER)

         const listenersBuffer = this.buffer[i0];
         for (let i1 = 0; i1 < listenersBuffer.count; i1++) { // Listeners buffer. All listeners for a specific mesh.

            const listeners = listenersBuffer.buffer[i1];
            if (listeners.listenClbk(listeners.params)) {

               if (STATE.mesh.hoveredId !== INT_NULL){
                  
                  /** Skip unnecessary code execution, if the same mesh is hovered */
                  if (STATE.mesh.hoveredId === listeners.params.id)
                     return;
                  // If we hovered directly after another hover, release hover from the other mesh
                  else 
                     STATE.mesh.hovered.state2.mask &= ~MESH_STATE.IN_HOVER;
               }

               if (!(listeners.params.state2.mask & MESH_STATE.IN_HOVER)) {

                  listeners.params.state2.mask |= MESH_STATE.IN_HOVER;
                  STATE.mesh.hoveredId = listeners.params.id;
                  STATE.mesh.hovered = listeners.params;


                  /* Dispatch buffer. All dispatch functions for the specific listener. 
                  * (E.x. listener:HOVER for mesh: meshId=1 has 2 dispatch functions, 1 for scale and 2 for colorDim) 
                  * 
                  * TODO: Remove the dispatcher for loop
                  */
                  for (let j = 0; j < listeners.dispatchEventBuffer.count; j++) {


                     const dispatcher = listeners.dispatchEventBuffer.buffer[j];
                     // Has the mesh. TODO: have this been set in the previous if statement
                     RegisterEvent('hover', { mesh: dispatcher.params });
                     dispatcher.clbk(dispatcher.params);
                  }
                     break;
               }
            }
            else if (listeners.params.state2.mask & MESH_STATE.IN_HOVER) {

               listeners.params.state2.mask &= ~MESH_STATE.IN_HOVER; // Set false
               STATE.mesh.hoveredId = INT_NULL;
               console.log('Set hoveredId to null:', STATE.mesh.hoveredId)
            }
         }
      }
   }

   #GetListenEventIdx(listenEventType) {

      for (let i = 0; i < this.count; i++) {

         const type = this.buffer[i].type;

         if (listenEventType === type) {
            return i;
         }

      }
      return INT_NULL;
   }
}


const _listeners = new EventListeners(MAX_LISTENERS_SIZE);
console.debug('Listeners Buffer:', _listeners)


/* * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * *
 * Getters-Setters accessing local scope Listeners buffer
 */
export function ListenersGetListenersBuffer() { return _listeners; }
export function ListenersGetListener(idx) { return _listeners.buffer[idx]; }
export function ListenersGetListenerType(idx) {
   return _listeners.buffer[idx].type;
}



/**
 * @param {*} type typeOf EVENT_TYPES.
 * @returns index to the created listen event
 */
export function ListenerCreateListenEvent(type, params) { return _listeners.CreateListenEvent(type, params); }

export function ListenerCreateDispatchEvent(listenEventType, listenEventClbk, listenEventParams, listenEvevtIdx, listenerIdx) {
   return _listeners.CreateDispatchEvent(listenEventType, listenEventClbk, listenEventParams, listenEvevtIdx, listenerIdx);
}

export function ListenersGetListenEventIdx(listenEvent) { return _listeners.GetListenEventIdx(listenEvent); }

/* * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * *
 * All Event Listener callback functions
 */

export function Listener_listen_mouse_hover(params) {

   const mousePos = MouseGetMousePos();
   const point = [mousePos.x, mousePos.y,];
   // const rect = [
   //    [params.pos[0] - params.dim[0], params.pos[0] + params.dim[0]], // Left  Right 
   //    [params.pos[1] - params.dim[1], params.pos[1] + params.dim[1]], // Top  Bottom
   // ];
   const rect = [
      [params.geom.pos[0] - params.geom.dim[0], params.geom.pos[0] + params.geom.dim[0]], // Left  Right 
      [params.geom.pos[1] - params.geom.dim[1], params.geom.pos[1] + params.geom.dim[1]], // Top  Bottom
   ];

   return Collision_PointRect(point, rect);
}

//////////////////////////////////////////////////////////////////////////////////////////////////////

/** Old */
// export class EventListener {

//    has;
//    type;
//    buffer;
//    count;
//    size;

//    constructor() {

//       this.size = MAX_LISTEN_EVENTS_BUFFER_SIZE;
//       this.count = 0;
//       this.type = INT_NULL;
//       this.has = false;
//       this.buffer = [];

//       for (let i = 0; i < this.size; i++)
//          this.buffer[i] = new Listener(null, {}, null);
//    }

//    CreateListenEvent(type) {

//       const idx = this.count++;

//       /** Set the correct function to run in the main App loop to listen for events. */
//       switch (type) {

//          case LISTEN_EVENT_TYPES.HOVER: {

//             this.buffer[idx].listenClbk = Listener_listen_mouse_hover;
//             this.has = true;
//          }
//       }
//    }

//    CreateDispatchEvent(type, clbk, params) {

//       if (!this.buffer || this.count >= this.size) {
//          // TODO: Implement Realloc
//          console.error('EventListener\'s buffer is uninitialized Or buffer overflow');
//          return;
//       }

//       // Returns the index of the dispatchEventBuffer
//       return this.buffer[idx].dispatchEventBuffer.AddEvent(type, clbk, params);
//    }

//    // Create(listenClbk, params){
//    //    const idx = this.count++;
//    //    this.buffer[idx].listenClbk = listenClbk;
//    //    this.buffer[idx].params = params;
//    //    this.has = true;
//    // }

//    // CreateDispatchEvent(evttype dispatchClbk, dispatchClbkParams) {

//    //    if (!this.buffer || this.count >= this.size) {
//    //       // TODO: Implement Realloc
//    //       console.error('EventListener\'s buffer is uninitialized Or buffer overflow');
//    //       return;
//    //    }
//    //    this.buffer[idx].dispatchClbk = dispatchClbk;
//    //    this.buffer[idx].dispatchClbkParams = dispatchClbkParams;
//    // }

//    // Add(listenClbk, params, dispatchClbk, dispatchClbkParams) {

//    //    if (!this.buffer || this.count >= this.size) {
//    //       // TODO: Implement Realloc
//    //       console.error('EventListener\'s buffer is uninitialized Or buffer overflow');
//    //       return;
//    //    }
//    //    const idx = this.count++;
//    //    this.buffer[idx].listenClbk = listenClbk;
//    //    this.buffer[idx].params = params;
//    //    this.buffer[idx].dispatchClbk = dispatchClbk;
//    //    this.buffer[idx].dispatchClbkParams = dispatchClbkParams;
//    //    this.has = true;
//    //    return idx;
//    // }

//    Listen() {
//       if (this.buffer[0].listenClbk)
//          return this.buffer[0].listenClbk(this.buffer[0].params);
//    }

//    Dispatch() {
//       if (this.buffer[0].dispatchClbk)
//          return this.buffer[0].dispatchClbk(this.buffer[0].dispatchClbkParams);
//    }

//    Realloc() {

//       this.size *= 2;
//       const oldData = this.data;
//       this.data = new Array(this.size);
//       this.CopyBuffer(oldData)
//       console.warn('Resizing M_Buffer!')
//    }

//    #CopyBuffer(oldData) {

//       const size = oldData.length;
//       for (let i = 0; i < size; i++) {
//          this.data[i] = oldData[i];
//       }
//    }

// }