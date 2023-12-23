"use strict";

import { Listener_dispatch_check_hover_event, Listener_dispatch_event } from "./EventListeners.js";



const events = []; // Aplication's events array
let evtsIdx = 0; // Index for events array


/**
 * 
 * @param {*} eventType : Type of constant EVENTS (in Global/Constants.js)
 * @param {*} params : An object with at least the type of hovered object and a value of the object's index in an array
 */
export function RegisterEvent(eventType, params) {

    events[evtsIdx++] = {
        type: eventType,
        params: params,
    };
}

export function HandleEvents() {

    let i = 0;
    while (i < evtsIdx) {

        const e = events[i];

        if (e.type === 'mouse-move') {

            if (LISTENERS_FLAGS[LISTEN_EVENT_TYPES_INDEX.HOVER] === true) // NOTE: Avoid dispatching if there are no listeners in the ListenersBuffer
                Listener_dispatch_check_hover_event();

        }
        else if (e.type === 'mouse-click-down') {

            STATE.mouse.activeClickedButtonId = e.params.mouseButton;

            if (LISTENERS_FLAGS[LISTEN_EVENT_TYPES_INDEX.CLICK] === true)  // NOTE: Avoid dispatching if there are no listeners in the ListenersBuffer
                Listener_dispatch_event(LISTEN_EVENT_TYPES_INDEX.CLICK, e.params.mouseButton);

        }
        else if (e.type === 'mouse-click-up') {

            STATE.mouse.activeClickedButtonId = INT_NULL;
            const mesh = STATE.mesh.hovered;

            // Disable mesh's hover state
            if (STATE.mesh.hovered) {
                if (mesh.StateCheck(MESH_STATE.IN_MOVE)) {
                    mesh.StateDisable(MESH_STATE.IN_MOVE);
                }
            }
            // Disable mesh's grab state
            if (STATE.mesh.grabed) {
                if (STATE.mesh.grabed.StateCheck(MESH_STATE.IN_GRAB)) {
                    STATE.mesh.grabed.StateDisable(MESH_STATE.IN_GRAB);
                    STATE.mesh.SetGrabed(null)
                }
            }

            e.type += ' HANDLED'; e.params = {}; evtsIdx--;

        }
        else if (e.type === 'mouse-click-down-hover') {

        }
        else if (e.type === 'Move') {

        }
        else if (e.type === 'mesh-created') {
            /**
             * Timed Events.
             * One time events triggered by another event.
             * 
             * Example: If we need to set the priority of a mesh. 
             * The mesh must be added to the grapfics pipeline first, in
             * order to obtain its gfx context, that is needed for the RenderQueue.SetPriority().
             * So a timed event is created to do that.
            */

            const mesh = e.params;
            const count = mesh.timedEvents.count;
            if (count)
                for (let i = 0; i < count; i++) {
                    if (!ERROR_NULL(mesh.timedEvents.buffer))
                        mesh.timedEvents.buffer[i].Clbk(mesh.timedEvents.buffer[i].params)
                    mesh.timedEvents.RemoveByIdx(i);
                }

            e.type += ' HANDLED'; e.params = {}; evtsIdx--;
        }

        i++;
    } // End of events for loop
    evtsIdx = 0;
}

export function Events_handle_immidiate(e) {

    /**
     * // TODO: Set the hovered mesh to be darwn on top(last in vertexBuffer or in render queue)
     * 0. Check to see if overlap (2)
     * 1. If the hovered mesh is in different vertexBuffer than the previous hovered mesh,
     *      change the order of the render queue, if it is drawn before. 
     * 2. Else if the hovered mesh is in the same vertexBuffer than the previous hovered mesh, 
     *      change the order inside the vertexBuuffer, if is drawn before. 
     */
    if (e.type === 'hover') {



        // Apply Hover Color, if the hhovered mesh is not already in hover.
        if (e.params.mesh.StateCheck(MESH_STATE.IS_HOVER_COLORABLE) && e.params.mesh.id !== STATE.mesh.hoveredId) {
            
            // Unhover any hovered mesh. // TODO: Decide who unhovers an already hovered mesh: here OR EventListeners.js. The diff is that if we unhover here, is faster since there is no separate call to 'Events_handle_immidiate()' for the 'else if (e.type === 'unhover')'
            if (STATE.mesh.hovered) {
                STATE.mesh.hovered.SeHoverColortDefault();
                STATE.mesh.hovered.StateDisable(MESH_STATE.IN_HOVER_COLOR);
            }
            
            e.params.mesh.SetHoverColor();
            e.params.mesh.StateEnable(MESH_STATE.IN_HOVER_COLOR | MESH_STATE.IN_HOVER);
            STATE.mesh.SetHovered(e.params.mesh);
            TEMP_TEST_PERFORMANE_COUNTERS.MESH_INFO_UI.COUNT++;

        }

    }

    else if (e.type === 'unhover') {

        if (e.params.mesh.StateCheck(MESH_STATE.IN_HOVER_COLOR)) {
            e.params.mesh.SeHoverColortDefault();
            e.params.mesh.StateDisable(MESH_STATE.IN_HOVER_COLOR);
        }

        e.params.mesh.StateDisable(MESH_STATE.IN_HOVER); // Set false
        STATE.mesh.SetHovered(null);
    }

}





