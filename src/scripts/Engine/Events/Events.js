"use strict";
import { OnMouseMove_Android, OnTouchStart, OnTouchEnd, OnTouchCancel, OnTouchMove } from "./MouseEvents.js";
import { OnMouseMove, OnMouseDown, OnMouseUp, OnMouseOut, OnMouseWheel, MouseGetMousePos, MouseGetPosDif } from "../Controls/Input/Mouse.js";
import { OnKeyDown, OnKeyUp } from "../Controls/Input/Keys.js";


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
    console.log('STATE.mesh.hoveredId:', STATE.mesh.hoveredId)
    if (eventType === 'mouse-click-down' && STATE.mesh.hoveredId !== INT_NULL)
        events[evtsIdx++] = {
            type: 'mouse-click-down-hover',
            params: {
                mouseButton: params.mouseButton,
                meshHoverId: STATE.mesh.hoveredId,
            },
        };
}

export function HandleEvents() {

    for (let i = evtsIdx - 1; i >= 0; i--) {

        if (events[i].type === 'hover') {
            // console.log('hover');
            

            events[i].type = '';
            events[i].params = {};

            evtsIdx--;
        }
        if (events[i].type === 'mouse-click-down') {
            // console.log('mouse-click-down');
            events[i].type = '';
            events[i].params = {};
            evtsIdx--;
        }
        if (events[i].type === 'mouse-click-up') {
            // console.log('mouse-click-down');
            events[i].type = '';
            events[i].params = {};
            evtsIdx--;

            const mesh = STATE.mesh.hovered;

            if (mesh.state2.mask & MESH_STATE.IN_MOVE){
                mesh.state2.mask &= ~MESH_STATE.IN_MOVE;
            }

        }
        if (events[i].type === 'mouse-click-down-hover') {
            
            // console.log('mouse-click-down-hover');
            // const params = {
            //     clbk: null, // A function to run a loop of the current event. 
            //     // The function must belong to a type of structure as Animation, so tha can be run from the scene.
            //     srcObj: {
            //         clbk: MouseGetPosDif,
            //     },
            //     targetObj: {
            //         mesh: STATE.mesh.hovered,
            //     },
            //     scene: STATE.scene.active,
            // };

            events[i].type = '';
            events[i].params = {};
            evtsIdx--;
            // RegisterEvent('Move', params);

            const mesh = STATE.mesh.hovered;

            if (mesh.state2.mask & MESH_STATE.IS_MOVABLE){
                mesh.state2.mask |= MESH_STATE.IN_MOVE;
            }

        }

        if (events[i].type === 'Move') {
            // console.log('Move');

        }
    }
    // console.log(events)
}

export function HandleEventsImediate() {
}

function OnWindowResize() {
    console.log('WINDOW RESIZE')
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

