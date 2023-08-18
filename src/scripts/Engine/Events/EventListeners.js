"use strict";

import { Collision_PointRect } from "../Collisions.js";
import { MouseGetPos } from "../Controls/Input/Mouse.js";
import { M_Buffer } from "../Core/Buffers.js";
import { Recursive_gfx_operations } from "../Drawables/Meshes/Base/Mesh.js";
import { Events_handle_immidiate, RegisterEvent } from "./Events.js";



const MAX_DISPATCH_EVENTS_BUFFER_SIZE = 8; // TODO: Get the max size depending on an global enum for all different kinds of dispatch events
const MAX_LISTEN_EVENTS_BUFFER_SIZE = 8; // TODO: Get the max size depending on an global enum for all different kinds of dispatch events

// class Dispatcher {

//    type;
//    clbk;
//    params;

//    constructor(type = INT_NULL, clbk = null, params = null) {

//       this.type = type;
//       this.clbk = clbk;
//       this.params = params;
//    }

//    AddEvent(type, clbk, params) {

//       this.type = type;
//       this.clbk = clbk;
//       this.params = params;
//    }
// }

// class Dispatchers {

//    buffer;
//    count;
//    size;

//    constructor(size) {

//       this.size = size;
//       this.count = 0;
//       this.buffer = new Array(size);

//       for (let i = 0; i < size; i++) {
//          this.buffer[i] = new Dispatcher();
//       }
//    }

//    CreateEvent(type, clbk, params) {

//       const idx = this.count++;
//       this.buffer[idx].AddEvent(type, clbk, params);

//       return idx;
//    }
// }


class Listener {

   listenClbk;
   params;
   // dispatchEventBuffer;

   constructor(clbk = null, params = null) {

      this.listenClbk = clbk;
      this.params = params;
      // this.dispatchEventBuffer = new Dispatchers(MAX_DISPATCH_EVENTS_BUFFER_SIZE);
   }

   CreateListenEvent(clbk, params) {

      this.listenClbk = clbk;
      this.params = params;
   }

}


export class EventListener extends M_Buffer {

   has; // TODO: Create an enum of bit-masks for all booleans, OR maybe a class if this is used in many classes
   type;

   constructor() {

      super();
      this.type = INT_NULL;
      this.has = false;

      this.Init(MAX_LISTEN_EVENTS_BUFFER_SIZE);
   }

   CreateListenEvent(type, params) {

      const idx = super.GetNextFree();
      this.buffer[idx] = new Listener()

      this.buffer[idx].CreateListenEvent(Listener_listen_mouse_hover, params);
      this.has = true;
      this.type = type;

      return idx;
   }

   // CreateDispatchEventOnListenEvent(type, clbk, params, listenerIdx) {

   //    if (!this.buffer || this.count >= this.size) {
   //       // TODO: Implement Realloc
   //       console.error('EventListener\'s buffer is uninitialized Or buffer overflow');
   //       return;
   //    }

   //    // Returns the index of the dispatchEventBuffer
   //    return this.buffer[listenerIdx].dispatchEventBuffer.CreateEvent(type, clbk, params);
   // }

   /**
    * TODO: Currently the params are the whole mesh as a pointer.
    * Make it better by passing only the necessary parameters for the listen callback function.
    * See ##ListenCallback
    */
   Listen() {
      if (this.buffer[0].listenClbk)
         return this.buffer[0].listenClbk(this.buffer[0].params);
   }

   // Dispatch() {
   //    if (this.buffer[0].dispatchClbk)
   //       return this.buffer[0].dispatchClbk(this.buffer[0].dispatchClbkParams);
   // }

   // RemoveListener(idx) {
   //    this.RemoveByIdx(idx)
   // }
   RemoveListener(idx) {

      if (this.buffer[idx]) {

         /**
          * If the listener is on a mesh that is currently onHover,
          * apart from deleting the listener to the mesh, we also
          * must remove it's id from the the global state.
          */
         if (this.buffer[idx].params.id === STATE.mesh.hoveredId) {
            STATE.mesh.SetHovered();
            console.log('STATE.mesh.hovered SET TO NULL')
         }

         this.buffer[idx] = null;

         /**
          * In this implementation of buffer, we run 
          * the loops until count and not until size. 
          * For this to work, we can only decrement count
          * if all next elements are not used.
          * What we are doing in the for loop below is 
          * to have the count at the last used element of the buffer.
          */
         this.count = this.size;
         for (let i = this.size - 1; i > 0; i--) {

            if (this.buffer[this.count - 1]) break;
            this.count--;
         }
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
         this.count++;
      }
   }

   CreateListenEvent(type, params) {

      /** Use buffer index of same type of listen events */
      const listenEventIdx = this.GetListenEventIdx(type);
      const listenerIdx = this.buffer[listenEventIdx].CreateListenEvent(type, params);

      return [listenEventIdx, listenerIdx];
   }
   RemoveListenEvent(idx) {
      this.buffer[idx[0]].RemoveListener(idx[1]);
   }

   CreateDispatchEventOnListenEvent(type, clbk, params, listenEvevtIdx, listenerIdx) {

      return this.buffer[listenEvevtIdx].CreateDispatchEventOnListenEvent(type, clbk, params, listenerIdx);
   }

   #GetNextFree() {
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
      // console.log()
      for (let i0 = 0; i0 < this.count; i0++) { // Listen event type buffer. (E.x. buffer[0] === EVENT_TYPE:HOVER)

         const listenersBuffer = this.buffer[i0];
         for (let i1 = 0; i1 < listenersBuffer.count; i1++) { // Listeners buffer. All listeners for a specific mesh.

            const listeners = listenersBuffer.buffer[i1];
            if (listeners) {

               const mesh = listeners.params;
               // SEE ##ListenCallback. Pass only necessary parameters.
               if (mesh.StateCheck(MESH_STATE.HAS_HOVER) && listeners.listenClbk(mesh)) { // Checking for mouse hover over mesh
// if(mesh.name === "WIDGET_LABEL_TEXT_MESH_MENU_OPTIONS id: 29")
// console.log()
                  if ( STATE.mesh.hoveredId !== INT_NULL && STATE.mesh.hoveredId !== mesh.id) { // Case of doublehover
                     Events_handle_immidiate({ type:'unhover', params:{mesh: STATE.mesh.hovered} }); // Unhover previous mesh.
                  }

                  if (mesh.StateCheck(MESH_STATE.IN_HOVER) === 0) // Skip hover event, if mesh is already in hover
                     Events_handle_immidiate({ type:'hover', params:{mesh: mesh} });

                  // TODO: check for children, must be recursive among all children???
                  const children = mesh.children;
                  // If 'IS_FAKE_HOVER' is active, means that there are children with 'HAS_HOVER', so no need for further 'children exist' checking
                  if (mesh.StateCheck(MESH_STATE.IS_FAKE_HOVER) && children.count) {

                     // console.log('############################')
                     for (let i = 0; i < children.count; i++) {

                        const child = children.buffer[i];

                        if (listeners.listenClbk(child)) { // Checking for mouse hover over mesh
                           if ( STATE.mesh.hoveredId !== INT_NULL && STATE.mesh.hoveredId !== child.id) { // Case of doublehover
                              Events_handle_immidiate({ type:'unhover', params:{mesh: STATE.mesh.hovered} }); // Unhover previous mesh.
                           }
                           if (child.id !== STATE.mesh.hoveredId && child.StateCheck(MESH_STATE.IN_HOVER) === 0) {
                              Events_handle_immidiate({ type:'hover', params:{mesh: child} });
                           }
                        }
                        else if (child.StateCheck(MESH_STATE.IN_HOVER) && (
                           !child.StateCheck(MESH_STATE.IN_MOVE) ||
                           !child.StateCheck(MESH_STATE.IN_GRAB))) {
                              Events_handle_immidiate({ type:'unhover', params:{mesh: child} });
                        }
                     }
                  }
               }
               else if (mesh.StateCheck(MESH_STATE.IN_HOVER) && (
                  !mesh.StateCheck(MESH_STATE.IN_MOVE) ||
                  !mesh.StateCheck(MESH_STATE.IN_GRAB))) {

                     Events_handle_immidiate({ type:'unhover', params:{mesh: mesh} });
               }
            }
         }
      }
   }

   GetListenEventIdx(listenEventType) {

      switch (listenEventType) {
         case LISTEN_EVENT_TYPES.HOVER: return LISTEN_EVENT_TYPES_INDEX.HOVER;

         default: alert('ERROR in findining listen event index. @ EventListeners.js, #GetListenEventIdx(listenEventType)');
         // default: return INT_NULL;
      }
   }
   // #GetListenEventIdx(listenEventType) {
   //    for (let i = 0; i < this.count; i++) {
   //       const type = this.buffer[i].type;
   //       if (listenEventType === type) {
   //          return i;
   //       }
   //    }
   //    return INT_NULL;
   // }


   /** Debug */
   PrintAll() {
      console.log('Listeners Buffer:\n', this.buffer)
   }
   PrintAllListenersMeshes() {
      for (let i = 0; i < this.count; i++) {
         for (let j = 0; j < this.buffer[i].count; j++) {
            // [i].[j].params.name
            if (this.buffer[i].buffer[j])
               console.log(this.buffer[i].buffer[j].params.name)
         }
      }
   }

}

const _listeners = new EventListeners(LISTEN_EVENT_TYPES_INDEX.SIZE);


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
export function ListenerRemoveListenEvent(idx) { _listeners.RemoveListenEvent(idx); }

export function ListenerCreateDispatchEventOnListenEvent(listenEventType, listenEventClbk, listenEventParams, listenEvevtIdx, listenerIdx) {
   return _listeners.CreateDispatchEventOnListenEvent(listenEventType, listenEventClbk, listenEventParams, listenEvevtIdx, listenerIdx);
}
export function ListenersGetListenEventIdxFromType(listenEventType) { return _listeners.GetListenEventIdx(listenEventType); }

/* * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * *
 * All Event Listener callback functions
 */

export function Listener_listen_mouse_hover(params) {

   const mousePos = MouseGetPos();
   const point = mousePos;

   const verticalMargin = params.hoverMargin;

   const rect = [
      [params.geom.pos[0] - params.geom.dim[0], params.geom.pos[0] + params.geom.dim[0]], // Left  Right 
      [(params.geom.pos[1] - params.geom.dim[1]) - verticalMargin, (params.geom.pos[1] + params.geom.dim[1]) + verticalMargin], // Top  Bottom
   ];
   // console.log('verticalMargin:', rect[1])

   return Collision_PointRect(point, rect);
}

//////////////////////////////////////////////////////////////////////////////////////////////////////
