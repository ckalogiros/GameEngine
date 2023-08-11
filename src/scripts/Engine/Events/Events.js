"use strict";
import { OnMouseMove_Android, OnTouchStart, OnTouchEnd, OnTouchCancel, OnTouchMove } from "./MouseEvents.js";
import { OnMouseMove, OnMouseDown, OnMouseUp, OnMouseOut, OnMouseWheel } from "../Controls/Input/Mouse.js";
import { OnKeyDown, OnKeyUp } from "../Controls/Input/Keys.js";
import { Slider_create_dispatch_event } from "../Drawables/Meshes/Widgets/WidgetSlider.js";


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

    console.debug('STATE.mesh.hoveredId:', STATE.mesh.hoveredId)
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

            events[i].type = '';
            events[i].params = {};
            evtsIdx--;
        }

        if (events[i].type === 'mouse-click-down') {

            if (events[i].params.mouseButton === 2) {
                // console.log('right click')

                STATE.mesh.selected = STATE.mesh.hovered;
            }

            events[i].type = '';
            events[i].params = {};
            evtsIdx--;
        }

        if (events[i].type === 'mouse-click-up') {

            // const mesh = STATE.mesh.hovered;
            const mesh = STATE.mesh.grabed;

            if (mesh && mesh.state2.mask & MESH_STATE.IN_MOVE) {
                mesh.state2.mask &= ~MESH_STATE.IN_MOVE;
            }

            events[i].type = '';
            events[i].params = {};
            evtsIdx--;
        }

        if (events[i].type === 'mouse-click-down-hover') {

            events[i].type = '';
            events[i].params = {};
            evtsIdx--;

            const mesh = STATE.mesh.hovered;

            // const e = mesh.state2.mask & MESH_STATE.IN_MOVE
            // console.log(e)
            console.log('meshId', mesh.id)

            if (mesh.state2.mask & MESH_STATE.IS_MOVABLE && ((mesh.state2.mask & MESH_STATE.IN_MOVE) === 0)) {
                mesh.state2.mask |= MESH_STATE.IN_MOVE;
                STATE.mesh.grabed = mesh;
                // console.log('grabed:', mesh.id)
                RegisterEvent('Move', mesh)
            }

            if (mesh.type & MESH_TYPES.WIDGET_SLIDER_BAR && mesh.timeIntervalsIdxBuffer.count <= 0) {

                Slider_create_dispatch_event(mesh);
            }


        }

        if (events[i].type === 'Move') {
            // console.log('Move');

            const mesh = events[i].params;

            // Check if mesh allready has a timeInterval for move, so we don't create infinite intervals 
            /**
             * TODO: What if the mesh needs intervals from another event? 
             * We need to implement a way of checking for specific intervals 
             * in the 'timeIntervalsIdxBuffer'. by comparing the indexes??? 
            */
            // if (mesh.type & MESH_TYPES.WIDGET_SLIDER_BAR && mesh.timeIntervalsIdxBuffer.count <= 0) {

            //     Slider_create_dispatch_event(mesh);
            // }

        }

        /**
         * Timed Events.
         * One time events triggered by another event.
         * 
         * Example: If we need to set the priority of a mesh. 
         * The mesh must be added to the grapfics pipeline first, in
         * order to obtain the gfx attribute, that is needed for the RenderQueue.SetPriority().
         * So a timed event is created to do that.
        */
        if (events[i].type === 'mesh-created') {

            const mesh = events[i].params;
            const count = mesh.timedEvents.count;
            if (count)
                for (let i = 0; i < count; i++)
                    // console.log(mesh.timedEvents.buffer[i])
                    mesh.timedEvents.buffer[i].Clbk(mesh.timedEvents.buffer[i].params)

            events[i].type = '';
            events[i].params = {};
            evtsIdx--;
        }
    }
    // console.log(events)
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

