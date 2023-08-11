"use strict";

import { Collision_PointRect } from "../Collisions.js";
import { MouseGetPos } from "../Controls/Input/Mouse.js";
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
         this.buffer[i] = null;
   }

   CreateListenEvent(type, params) {

      // if(this.count >= this.size) this.#Realloc(); 
      
      const idx = this.#GetNextFree();
      this.buffer[idx] = new Listener()
      
      this.buffer[idx].CreateListenEvent(Listener_listen_mouse_hover, params);
      this.has = true;
      this.type = type;

      return idx;
   }

   CreateDispatchEventOnListenEvent(type, clbk, params, listenerIdx) {

      if (!this.buffer || this.count >= this.size) {
         // TODO: Implement Realloc
         console.error('EventListener\'s buffer is uninitialized Or buffer overflow');
         return;
      }

      // Returns the index of the dispatchEventBuffer
      return this.buffer[listenerIdx].dispatchEventBuffer.CreateEvent(type, clbk, params);
   }

   /**
    * TODO: Currently the params are the whole mesh as a pointer.
    * Make it better by passing only the necessary parameters for the listen callback function.
    * See ##ListenCallback
    */
   Listen() {
      if (this.buffer[0].listenClbk)
         return this.buffer[0].listenClbk(this.buffer[0].params);
   }

   Dispatch() {
      if (this.buffer[0].dispatchClbk)
         return this.buffer[0].dispatchClbk(this.buffer[0].dispatchClbkParams);
   }

   RemoveElement(idx){

      if(this.buffer[idx]){

         this.buffer[idx] = null;

         /**
          * In this implementation of buffer, we run 
          * the loops until count and not until size. 
          * For this to work, we can only decrement count
          * if all next elements are not used.
          * What we are doing in the for loop below is 
          * to have the count at the last used element of the buffer.
          */
         this.count = this.size-1;
         for( let i=this.size-1; i>0; i--){

            if(this.buffer[i]) break;
            else count--;
         }
      }
   }

   #Realloc() {

      this.size *= 2;
      const oldData = this.buffer;
      this.buffer = new Array(this.size);
      this.#CopyBuffer(oldData)
      console.warn('Resizing Events Listener buffer')
   }

   #GetNextFree() {

      for (let i = 0; i < this.size; i++) {
         if (!this.buffer[i]) {
            if(i > this.count) this.count++;
            return i;
         }
      }

      // Else buffer is full.
      this.#Realloc();
      this.count++;
      return this.count;
      // alert('No space in Events Listener buffer. @EventListeners.js');
   }
   #CopyBuffer(oldBuffer) {

      const oldsize = oldBuffer.length;
      for (let i = 0; i < this.size; i++) {
         if(i<oldsize) this.buffer[i] = oldBuffer[i];
         else this.buffer[i] = null;
      }
   }

}




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

   CreateDispatchEventOnListenEvent(type, clbk, params, listenEvevtIdx, listenerIdx) {

      return this.buffer[listenEvevtIdx].CreateDispatchEventOnListenEvent(type, clbk, params, listenerIdx);
   }

   GetNextFree() {
      for (let i = 0; i < this.size; i++) {
         if (!this.buffer[i].has) {
            return i;
         }
      }
      return INT_NULL;
   }


   /**
    * Current Implementation:
    * Check for event (hover)
    * if true then RegisterEvent, update STATE and mesh state
    * else Update STATE and mesh state for stop hovering.
    * 
    * We skip register event if the mesh that listens allready has this event.
    * But we always run the else, updating the STATE and mesh state.
    * That means we register an event only once.
    */
   Run() {
      for (let i0 = 0; i0 < this.count; i0++) { // Listen event type buffer. (E.x. buffer[0] === EVENT_TYPE:HOVER)

         const listenersBuffer = this.buffer[i0];
         for (let i1 = 0; i1 < listenersBuffer.count; i1++) { // Listeners buffer. All listeners for a specific mesh.

            const listeners = listenersBuffer.buffer[i1];
            // ##ListenCallback. Pass only necessary parameters.
            if (listeners.listenClbk(listeners.params)) {

               if (STATE.mesh.hoveredId !== INT_NULL){
                  
                  /** Skip unnecessary code execution, if the same mesh is hovered */
                  if (STATE.mesh.hoveredId === listeners.params.id) return;
                  // If we hovered directly after another hover, release hover from the other mesh
                  else STATE.mesh.hovered.state2.mask &= ~MESH_STATE.IN_HOVER;
               }

               if (!(listeners.params.state2.mask & MESH_STATE.IN_HOVER)) {

                  listeners.params.state2.mask |= MESH_STATE.IN_HOVER;
                  STATE.mesh.hoveredId = listeners.params.id;
                  STATE.mesh.hovered = listeners.params;
                  RegisterEvent('hover', { mesh: listeners.params });

                  break; // Helps with the switchin between double hovered meshes.
                  /** TODO: Fix: hovering a mesh must be put on top,
                   * otherwise the first mesh in the listeners buffer will always get hovered, 
                   * even if another mesh is hovered (when meshes overlap).
                   */

               }
            }
            else if (listeners.params.state2.mask & MESH_STATE.IN_HOVER) {

               listeners.params.state2.mask &= ~MESH_STATE.IN_HOVER; // Set false
               STATE.mesh.hoveredId = INT_NULL;
               console.debug('Set hoveredId to null:', STATE.mesh.hoveredId)
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

   
   /** Debug */
   PrintAll(){
      console.log('Listeners Buffer:\n', this.buffer)
   }

}

const MAX_LISTENERS_TYPES_SIZE = 1;
const _listeners = new EventListeners(MAX_LISTENERS_TYPES_SIZE);


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

export function ListenerCreateDispatchEventOnListenEvent(listenEventType, listenEventClbk, listenEventParams, listenEvevtIdx, listenerIdx) {
   return _listeners.CreateDispatchEventOnListenEvent(listenEventType, listenEventClbk, listenEventParams, listenEvevtIdx, listenerIdx);
}

export function ListenersGetListenEventIdx(listenEvent) { return _listeners.GetListenEventIdx(listenEvent); }

/* * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * *
 * All Event Listener callback functions
 */

export function Listener_listen_mouse_hover(params) {

   const mousePos = MouseGetPos();
   const point = [mousePos.x, mousePos.y,];

   const verticalMargin = params.hoverMargin;
   
   const rect = [
      [params.geom.pos[0] - params.geom.dim[0], params.geom.pos[0] + params.geom.dim[0]], // Left  Right 
      [(params.geom.pos[1] - params.geom.dim[1]) - verticalMargin, (params.geom.pos[1] + params.geom.dim[1]) + verticalMargin], // Top  Bottom
   ];
   // console.log('verticalMargin:', rect[1])

   return Collision_PointRect(point, rect);
}

//////////////////////////////////////////////////////////////////////////////////////////////////////
