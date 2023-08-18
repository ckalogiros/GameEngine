"use strict";
import { OnMouseMove_Android, OnTouchStart, OnTouchEnd, OnTouchCancel, OnTouchMove } from "./MouseEvents.js";
import { OnMouseMove, OnMouseDown, OnMouseUp, OnMouseOut, OnMouseWheel } from "../Controls/Input/Mouse.js";
import { OnKeyDown, OnKeyUp } from "../Controls/Input/Keys.js";
import { Widget_popup_handler_onclick_event } from "../Drawables/Meshes/Widgets/WidgetPopup.js";



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
    if(params.mesh)
    // console.log(evtsIdx, eventType, params.mesh.name)
    console.log(evtsIdx, eventType, params.mesh.id)
    // console.log(evtsIdx, params.mesh.name)
}

export function HandleEvents() {

    let i = 0;
    while (i < evtsIdx) {

        // evtsIdx--;
        const e = events[i];

        if (e.type === 'hover') {
            // console.debug('hover: ', e.params.mesh.id, ' | prev hover:', STATE.mesh.hoveredId);

            // // Unhover any previous hovered
            //     STATE.mesh.hovered.SetDefaultZindex();

            if (e.params.mesh.StateCheck(MESH_STATE.HAS_HOVER_COLOR)){
                e.params.mesh.SetColor(GREY6);
                e.params.mesh.StateEnable(MESH_STATE.IN_HOVER_COLOR);
            }
            /**
             * TODO: Set the hovered mesh to be darwn on top(last in vertexBuffer or in render queue)
             * 0. Check to see if overlap (2)
             * 1. If the hovered mesh is in different vertexBuffer than the previous hovered mesh,
             *      change the order of the render queue, if it is drawn before. 
             * 2. Else if the hovered mesh is in the same vertexBuffer than the previous hovered mesh, 
             *      change the order inside the vertexBuuffer, if is drawn before. 
             */

            // e.params.mesh.BringToFront(10);
            // if(e.params.mesh.StateCheck(MESH_STATE.IS_FAKE_HOVER)) return;
            STATE.mesh.SetHovered(e.params.mesh);
            e.params.mesh.StateEnable(MESH_STATE.IN_HOVER); // Set mesh state hovered to true
        }

        else if (e.type === 'unhover') {
            // console.debug('unhover: ', e.params.mesh.id)

            if (e.params.mesh.StateCheck(MESH_STATE.IN_HOVER_COLOR)){
                e.params.mesh.SetDefaultColor();
                e.params.mesh.StateDisable(MESH_STATE.IN_HOVER_COLOR);
            }
            
            e.params.mesh.StateDisable(MESH_STATE.IN_HOVER); // Set false
            STATE.mesh.SetHovered(null);
        }

        else if (e.type === 'mouse-click-down') {
            // console.debug('mouse-click-down')

            STATE.mouse.activeClickedButtonId = e.params.mouseButton;

            // Handle the popup menu for left mouse click
            Widget_popup_handler_onclick_event(STATE.mesh.hovered, e.params.mouseButton);
            // TODO: Should be STATE.mesh.hovered.OnClick() for every mesh clicked.

            if (STATE.mesh.hoveredId !== INT_NULL) {
                console.debug('clicked: ', STATE.mesh.hoveredId)

                RegisterEvent('mouse-click-down-hover', STATE.mesh.hoveredId)
            }

        }

        else if (e.type === 'mouse-click-up') {

            STATE.mouse.activeClickedButtonId = INT_NULL;
            const mesh = STATE.mesh.hovered;

            if (STATE.mesh.hovered) {
                if (mesh.StateCheck(MESH_STATE.IN_MOVE)) {
                    mesh.StateDisable(MESH_STATE.IN_MOVE);
                }
            }
            if (STATE.mesh.grabed) {
                if (STATE.mesh.grabed.StateCheck(MESH_STATE.IN_GRAB)) {
                    console.log('mouse-click-up mesh Ungrabed: ', STATE.mesh.grabed.name)
                    STATE.mesh.grabed.StateDisable(MESH_STATE.IN_GRAB);
                    STATE.mesh.SetGrabed(null)
                }
            }

            e.type += ' HANDLED'; e.params = {}; evtsIdx--;

        }

        else if (e.type === 'mouse-click-down-hover') {
            // console.debug('mouse-click-down-hover')

            const mesh = STATE.mesh.hovered;

            console.debug('meshId', mesh.id)

            if (mesh.StateCheck(MESH_STATE.IS_MOVABLE) && mesh.StateCheck(MESH_STATE.IN_MOVE) === 0) {
                mesh.StateEnable(MESH_STATE.IN_MOVE);
                RegisterEvent('Move', mesh)
            }
            
            if (mesh.StateCheck(MESH_STATE.IS_GRABABLE)) {
                
                console.log('mouse-click-down-hover mesh grabed: ', mesh.name)
                STATE.mesh.grabed = mesh;
                STATE.mesh.SetGrabed(mesh);
                mesh.StateEnable(MESH_STATE.IN_GRAB);
            }

            // if (mesh.eventCallbacks.count) {

            //     const target = mesh.eventCallbacks.buffer[0].target;
            //     const targetClbks = mesh.eventCallbacks.buffer[0].targetClbks;
            //     mesh.eventCallbacks.buffer[0].Clbk(target, targetClbks);
            //     /**
            //      * One implementation is to have an Enum of fixed indexes: 'ON_CLICK = 0'
            //      * so we call: 'mesh.eventCallbacks.buffer[ON_CLICK].Clbk(target, targetClbks);'
            //      * That way the on click callback is only one, but it calls different functions 
            //      * for different meshes.
            //      * Ofcourse we could have ON_CLICK_LEFT_MOUSE_BTN etc.
            //      */
            // }

            if (mesh.eventCallbacks.count) {

                const params = mesh.eventCallbacks.buffer[0];
                mesh.eventCallbacks.buffer[0].params.Clbk(params);
                /**
                 * One implementation is to have an Enum of fixed indexes: 'ON_CLICK = 0'
                 * so we call: 'mesh.eventCallbacks.buffer[ON_CLICK].Clbk(target, targetClbks);'
                 * That way the on click callback is only one, but it calls different functions 
                 * for different meshes.
                 * Ofcourse we could have ON_CLICK_LEFT_MOUSE_BTN etc.
                 */
            }

            // e.type += ' HANDLED'; e.params = {}; evtsIdx--;

        }

        else if (e.type === 'Move') {
            console.debug('move', e.params)

        }

        else if (e.type === 'mesh-created') {
            /**
             * Timed Events.
             * One time events triggered by another event.
             * 
             * Example: If we need to set the priority of a mesh. 
             * The mesh must be added to the grapfics pipeline first, in
             * order to obtain the gfx attribute, that is needed for the RenderQueue.SetPriority().
             * So a timed event is created to do that.
            */

            const mesh = e.params;
            const count = mesh.timedEvents.count;
            if (count)
                for (let i = 0; i < count; i++)
                    mesh.timedEvents.buffer[i].Clbk(mesh.timedEvents.buffer[i].params)

            e.type += ' HANDLED'; e.params = {}; evtsIdx--;
        }

        i++;
    } // End of events for loop
    evtsIdx = 0;
}

export function Events_handle_immidiate(e){

    if (e.type === 'hover') {
        console.debug('hover: ', e.params.mesh.id);
        // console.debug('hover: ', e.params.mesh.id, ' | prev hover:', STATE.mesh.hoveredId);

        // // Unhover any previous hovered
        //     STATE.mesh.hovered.SetDefaultZindex();

        if (e.params.mesh.StateCheck(MESH_STATE.HAS_HOVER_COLOR)){
            e.params.mesh.SetColor(BLUE_10_120_220);
            e.params.mesh.StateEnable(MESH_STATE.IN_HOVER_COLOR);
        }
        /**
         * TODO: Set the hovered mesh to be darwn on top(last in vertexBuffer or in render queue)
         * 0. Check to see if overlap (2)
         * 1. If the hovered mesh is in different vertexBuffer than the previous hovered mesh,
         *      change the order of the render queue, if it is drawn before. 
         * 2. Else if the hovered mesh is in the same vertexBuffer than the previous hovered mesh, 
         *      change the order inside the vertexBuuffer, if is drawn before. 
         */

        // e.params.mesh.BringToFront(10);
        // if(e.params.mesh.StateCheck(MESH_STATE.IS_FAKE_HOVER)) return;
        STATE.mesh.SetHovered(e.params.mesh);
        e.params.mesh.StateEnable(MESH_STATE.IN_HOVER); // Set mesh state hovered to true
    }

    else if (e.type === 'unhover') {
        // console.debug('unhover: ', e.params.mesh.id)

        if (e.params.mesh.StateCheck(MESH_STATE.IN_HOVER_COLOR)){
            e.params.mesh.SetDefaultColor();
            e.params.mesh.StateDisable(MESH_STATE.IN_HOVER_COLOR);
        }

        // if(e.params.mesh.type & MESH_TYPES_DBG.WIDGET_POP_UP){
        //     Widget_popup_handler_deactivate_secondary_popups(e.params.mesh);
        // }
        
        e.params.mesh.StateDisable(MESH_STATE.IN_HOVER); // Set false
        STATE.mesh.SetHovered(null);
    }

}


function OnWindowResize() {
    console.debug('WINDOW RESIZE')
}

export function EventsAddListeners() {

    if (PLATFORM.ANDROID_IMPL) {

        document.addEventListener('mousemove', OnMouseMove_Android, false);
        // Touch screen events
        document.addEventListener("touchstart", OnTouchStart);
        document.addEventListener("touchend", OnTouchEnd);
        document.addEventListener("touchcancel", OnTouchCancel);
        document.addEventListener("touchmove", OnTouchMove);
    }
    else {

        document.addEventListener('mousemove', OnMouseMove, false);
        document.addEventListener('mouseout', OnMouseOut, false);
        document.addEventListener('wheel', OnMouseWheel, false);
    }

    document.addEventListener('mousedown', OnMouseDown, false);
    document.addEventListener('mouseup', OnMouseUp, false);
    document.addEventListener("resize", OnWindowResize, false);

    // Disabling the context menu on long taps on Android. 
    document.oncontextmenu = function (event) {

        event.preventDefault();
        event.stopPropagation();
        return false;
    };

    document.addEventListener('keydown', OnKeyDown, false);
    document.addEventListener('keyup', OnKeyUp, false);

}

