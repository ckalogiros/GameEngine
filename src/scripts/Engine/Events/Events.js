"use strict";
import { OnMouseMove_Android, OnTouchStart, OnTouchEnd, OnTouchCancel, OnTouchMove } from "./MouseEvents.js";
import { OnMouseMove, OnMouseDown, OnMouseUp, OnMouseOut, OnMouseWheel } from "../Controls/Input/Mouse.js";
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
}

export function HandleEvents() {
    for (let i = evtsIdx - 1; i >= 0; i--) {
        switch (events[i].type) {
            case EVENTS.MOUSE: {
                evtsIdx--; // Remove handled event
                break;
            }
        }
    }
}

export function HandleEventsImediate() {
}

function OnWindowResize() {
    console.log('WINDOW RESIZE')
}

export function EventsAddListeners() {

    if(PLATFORM.ANDROID_IMPL){
        document.addEventListener('mousemove', OnMouseMove_Android, false);
        // Touch screen events
        document.addEventListener("touchstart", OnTouchStart);
        document.addEventListener("touchend", OnTouchEnd);
        document.addEventListener("touchcancel", OnTouchCancel);
        document.addEventListener("touchmove", OnTouchMove);
    }
    else{
        document.addEventListener('mousemove', OnMouseMove, false);
        document.addEventListener('mouseout', OnMouseOut, false);
        document.addEventListener('wheel', OnMouseWheel, false);
    }
    document.addEventListener('mousedown', OnMouseDown, false);
    document.addEventListener('mouseup', OnMouseUp, false);
    document.addEventListener("resize", OnWindowResize, false);

    // Disabling the context menu on long taps on Android. 
    document.oncontextmenu = function(event) {
        event.preventDefault();
        event.stopPropagation();
        return false;
    };

    document.addEventListener('keydown', OnKeyDown, false);
    document.addEventListener('keyup', OnKeyUp, false);

}

