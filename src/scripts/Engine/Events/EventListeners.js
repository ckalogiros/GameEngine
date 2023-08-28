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

/**
 * TODO!!! The click events continue to check for all its buffer elements,
 * even if a clicked was found. 
 * That is inefficient. Either we break on clicked, or implement a click algorithm
 * that includes a system checking divided in all root parent meshes 
 * of the scene and traverses down to children.
 */

export class Listener_Hover {

   hover_buffer;

   constructor() {

      this.hover_buffer = new M_Buffer();
   }

   Listen(mesh) {

      const params = {
         mesh: mesh
      }
      mesh.listen_hover_idx = this.hover_buffer.Add(params);
      mesh.StateEnable(MESH_STATE.IS_HOVERABLE)
   }

   Run() {

      const point = MouseGetPos();

      for (let i = 0; i < this.hover_buffer.count; i++) {

         const m = this.hover_buffer.buffer[i].mesh.geom;
         const rect = [
            [m.pos[0] - m.dim[0], m.pos[0] + m.dim[0]],     // Left  Right 
            [(m.pos[1] - m.dim[1]), (m.pos[1] + m.dim[1])], // Top  Bottom
         ];

         const mesh = this.hover_buffer.buffer[i].mesh;
         if (Intersection_point_rect(point, rect)) {

            if (STATE.mesh.hoveredId !== INT_NULL && STATE.mesh.hoveredId !== mesh.id) { // Case of doublehover
               Events_handle_immidiate({ type: 'unhover', params: { mesh: STATE.mesh.hovered } }); // Unhover previous mesh.
            }

            if (mesh.StateCheck(MESH_STATE.IN_HOVER) === 0) // Skip hover event, if mesh is already in hover
               Events_handle_immidiate({ type: 'hover', params: { mesh: mesh } });

         }
         else if (mesh.StateCheck(MESH_STATE.IN_HOVER) && (
                  !mesh.StateCheck(MESH_STATE.IN_MOVE) ||
                  !mesh.StateCheck(MESH_STATE.IN_GRAB))) {
            Events_handle_immidiate({ type: 'unhover', params: { mesh: mesh } });
         }
      }
   }

   Print() {
      this.hover_buffer.PrintMeshInfo()
   }
}

const _listener_hover = new Listener_Hover();

export function Listener_hover_get() { return _listener_hover; }
export function Listener_hover_enable(mesh) { _listener_hover.Listen(mesh); }
export function Listener_hover_remove_by_idx(idx) { 

   // _listener_hover.hover_buffer.buffer[idx].listen_hover_idx = INT_NULL; // We ste the meshe's 'listen_hover_idx' to null HERE.
   _listener_hover.hover_buffer.RemoveByIdx(idx); 
}
export function Listener_hover_Print() { _listener_hover.Print(); }


/** Old Listeners */

// const MAX_DISPATCH_EVENTS_BUFFER_SIZE = 8; // TODO: Get the max size depending on an global enum for all different kinds of dispatch events
// const MAX_LISTEN_EVENTS_BUFFER_SIZE = 8; // TODO: Get the max size depending on an global enum for all different kinds of dispatch events


// class Listener {

//    listenClbk;
//    params;

//    constructor(clbk = null, params = null) {

//       this.listenClbk = clbk;
//       this.params = params;
//    }

//    CreateListenEvent(clbk, params) {

//       this.listenClbk = clbk;
//       this.params = params;
//    }

// }

// export class EventListener extends M_Buffer {

//    has; // TODO: Create an enum of bit-masks for all booleans, OR maybe a class if this is used in many classes
//    type;

//    constructor() {

//       super();
//       this.type = INT_NULL;
//       this.has = false;

//       this.Init(MAX_LISTEN_EVENTS_BUFFER_SIZE);
//    }

//    CreateListenEvent(type, params) {

//       const idx = super.GetNextFree();
//       this.buffer[idx] = new Listener()

//       this.buffer[idx].CreateListenEvent(Listener_listen_mouse_hover, params);
//       this.has = true;
//       this.type = type;

//       return idx;
//    }

//    /**
//     * TODO: Currently the params are the whole mesh as a pointer.
//     * Make it better by passing only the necessary parameters for the listen callback function.
//     * See ##ListenCallback
//     */
//    Listen() {
//       if (this.buffer[0].listenClbk)
//          return this.buffer[0].listenClbk(this.buffer[0].params);
//    }

//    RemoveListener(idx) {

//       if (this.buffer[idx]) {

//          /**
//           * If the listener is on a mesh that is currently onHover,
//           * apart from deleting the listener to the mesh, we also
//           * must remove it's id from the the global state.
//           */
//          if (this.buffer[idx].params.id === STATE.mesh.hoveredId) {
//             STATE.mesh.SetHovered();
//             console.log('STATE.mesh.hovered SET TO NULL')
//          }

//          this.buffer[idx] = null;

//          /**
//           * In this implementation of buffer, we run 
//           * the loops until count and not until size. 
//           * For this to work, we can only decrement count
//           * if all next elements are not used.
//           * What we are doing in the for loop below is 
//           * to have the count at the last used element of the buffer.
//           */
//          this.count = this.size;
//          for (let i = this.size - 1; i > 0; i--) {

//             if (this.buffer[this.count - 1]) break;
//             this.count--;
//          }
//       }
//    }
// }

// class EventListeners {

//    buffer = [];
//    count;
//    size;

//    constructor(size) {

//       this.size = size;
//       this.count = 0;
//       if (size === undefined || size <= 0) console.error('Size is null. @ class EventListeners.constructor().')

//       for (let i = 0; i < this.size; i++) {
//          this.buffer[i] = new EventListener();
//          this.count++;
//       }
//    }

//    CreateListenEvent(type, params) {

//       /** Use buffer index of same type of listen events */
//       const listenEventIdx = this.GetListenEventIdx(type);
//       const listenerIdx = this.buffer[listenEventIdx].CreateListenEvent(type, params);

//       return [listenEventIdx, listenerIdx];
//    }
//    RemoveListenEvent(idx) {
//       this.buffer[idx[0]].RemoveListener(idx[1]);
//    }

//    /**
//     * Current Implementation:
//     * Check for event (hover)
//     * if true then RegisterEvent, update STATE and mesh state
//     * else Update STATE and mesh state for stop hovering.
//     * 
//     * We skip register event if the mesh that listens allready has this event.
//     * But we always run the else, updating the STATE and mesh state.
//     * That means we register an event only once.
//     */
//    Run() {
//       // console.log()
//       for (let i0 = 0; i0 < this.count; i0++) { // Listen event type buffer. (E.x. buffer[0] === EVENT_TYPE:HOVER)

//          const listenersBuffer = this.buffer[i0];
//          for (let i1 = 0; i1 < listenersBuffer.count; i1++) { // Listeners buffer. All listeners for a specific mesh.

//             const listeners = listenersBuffer.buffer[i1];
//             if (listeners) {

//                const mesh = listeners.params;
//                // SEE ##ListenCallback. Pass only necessary parameters.
//                if (mesh.StateCheck(MESH_STATE.IS_HOVERABLE) && listeners.listenClbk(mesh)) { // Checking for mouse hover over mesh

//                   if (STATE.mesh.hoveredId !== INT_NULL && STATE.mesh.hoveredId !== mesh.id) { // Case of doublehover
//                      Events_handle_immidiate({ type: 'unhover', params: { mesh: STATE.mesh.hovered } }); // Unhover previous mesh.
//                   }

//                   if (mesh.StateCheck(MESH_STATE.IN_HOVER) === 0) // Skip hover event, if mesh is already in hover
//                      Events_handle_immidiate({ type: 'hover', params: { mesh: mesh } });

//                   // TODO: check for children, must be recursive among all children???
//                   const children = mesh.children;
//                   // If 'IS_FAKE_HOVER' is active, means that there are children with 'IS_HOVERABLE', so no need for further 'children exist' checking
//                   // if (mesh.StateCheck(MESH_STATE.IS_FAKE_HOVER) && children.count) {

//                   //    console.log('############################')
//                   //    for (let i = 0; i < children.count; i++) {

//                   //       const child = children.buffer[i];

//                   //       if (listeners.listenClbk(child)) { // Checking for mouse hover over mesh
//                   //          if ( STATE.mesh.hoveredId !== INT_NULL && STATE.mesh.hoveredId !== child.id) { // Case of doublehover
//                   //             Events_handle_immidiate({ type:'unhover', params:{mesh: STATE.mesh.hovered} }); // Unhover previous mesh.
//                   //          }
//                   //          if (child.id !== STATE.mesh.hoveredId && child.StateCheck(MESH_STATE.IN_HOVER) === 0) {
//                   //             Events_handle_immidiate({ type:'hover', params:{mesh: child} });
//                   //          }
//                   //       }
//                   //       else if (child.StateCheck(MESH_STATE.IN_HOVER) && (
//                   //          !child.StateCheck(MESH_STATE.IN_MOVE) ||
//                   //          !child.StateCheck(MESH_STATE.IN_GRAB))) {
//                   //             Events_handle_immidiate({ type:'unhover', params:{mesh: child} });
//                   //       }
//                   //    }
//                   // }
//                }
//                else if (mesh.StateCheck(MESH_STATE.IN_HOVER) && (
//                   !mesh.StateCheck(MESH_STATE.IN_MOVE) ||
//                   !mesh.StateCheck(MESH_STATE.IN_GRAB))) {
//                   // console.log('i:', i1, ' meshId:', STATE.mesh.hoveredId)
//                   Events_handle_immidiate({ type: 'unhover', params: { mesh: mesh } });
//                }
//             }
//          }
//       }
//    }

//    GetListenEventIdx(listenEventType) {

//       switch (listenEventType) {
//          case LISTEN_EVENT_TYPES.HOVER: return LISTEN_EVENT_TYPES_INDEX.HOVER;

//          default: alert('ERROR in findining listen event index. @ EventListeners.js, #GetListenEventIdx(listenEventType)');
//       }
//    }


//    /** Debug */
//    PrintAll() {
//       console.log('Listeners Buffer:\n', this.buffer)
//    }
//    PrintAllListenersMeshes() {
//       for (let i = 0; i < this.count; i++) {
//          for (let j = 0; j < this.buffer[i].count; j++) {
//             // [i].[j].params.name
//             if (this.buffer[i].buffer[j])
//                console.log(this.buffer[i].buffer[j].params.name)
//          }
//       }
//    }

// }

// const _listeners = new EventListeners(LISTEN_EVENT_TYPES_INDEX.SIZE);


// /* * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * *
//  * Getters-Setters accessing local scope Listeners buffer
//  */
// export function ListenersGetListenersBuffer() { return _listeners; }
// export function ListenersGetListener(idx) { return _listeners.buffer[idx]; }
// export function ListenersGetListenerType(idx) {
//    return _listeners.buffer[idx].type;
// }




// /**
//  * @param {*} type typeOf LISTEN_EVENT_TYPES.
//  * @returns index to the created listen event
//  */
// export function ListenerCreateListenEvent(type, params) { return _listeners.CreateListenEvent(type, params); }
// export function ListenerRemoveListenEvent(idx) { _listeners.RemoveListenEvent(idx); }

// export function ListenerCreateDispatchEventOnListenEvent(listenEventType, listenEventClbk, listenEventParams, listenEvevtIdx, listenerIdx) {
//    return _listeners.CreateDispatchEventOnListenEvent(listenEventType, listenEventClbk, listenEventParams, listenEvevtIdx, listenerIdx);
// }
// export function ListenersGetListenEventIdxFromType(listenEventType) { return _listeners.GetListenEventIdx(listenEventType); }

// /* * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * *
//  * All Event Listener callback functions
//  */

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
