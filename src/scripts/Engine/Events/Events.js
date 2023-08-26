"use strict";
import { OnMouseMove_Android, OnTouchStart, OnTouchEnd, OnTouchCancel, OnTouchMove } from "./MouseEvents.js";
import { OnMouseMove, OnMouseDown, OnMouseUp, OnMouseOut, OnMouseWheel } from "../Controls/Input/Mouse.js";
import { OnKeyDown, OnKeyUp } from "../Controls/Input/Keys.js";
import { Listener_dispatch_event } from "./EventListeners.js";



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
                e.params.mesh.StateEnable(MESH_STATE.HOVER_COLOR_ENABLED);
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

            if (e.params.mesh.StateCheck(MESH_STATE.HOVER_COLOR_ENABLED)){
                e.params.mesh.SetDefaultColor();
                e.params.mesh.StateDisable(MESH_STATE.HOVER_COLOR_ENABLED);
            }
            
            e.params.mesh.StateDisable(MESH_STATE.IN_HOVER); // Set false
            STATE.mesh.SetHovered(null);
        }

        else if (e.type === 'mouse-click-down') {

            STATE.mouse.activeClickedButtonId = e.params.mouseButton;

            // if(e.params.mesh.StateCheck(MESH_STATE.HAS_POPUP)){

                // Widget_popup_deactivate();
            // }
            Listener_dispatch_event(LISTEN_EVENT_TYPES.CLICK, e.params.mouseButton);
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
             * order to obtain the gfx attribute, that is needed for the RenderQueue.SetPriority().
             * So a timed event is created to do that.
            */

            const mesh = e.params;
            const count = mesh.timedEvents.count;
            if (count)
                for (let i = 0; i < count; i++){
                    if(!ERROR_NULL(mesh.timedEvents.buffer))
                    mesh.timedEvents.buffer[i].Clbk(mesh.timedEvents.buffer[i].params)
                    mesh.timedEvents.RemoveByIdx(i);
                }

            e.type += ' HANDLED'; e.params = {}; evtsIdx--;
        }

        i++;
    } // End of events for loop
    evtsIdx = 0;
}

export function Events_handle_immidiate(e){

    if (e.type === 'hover') {
        console.debug('hover: ', e.params.mesh.name);
        // console.debug('hover: ', e.params.mesh.id, ' | prev hover:', STATE.mesh.hoveredId);

        // Apply Hover Color
        if (e.params.mesh.StateCheck(MESH_STATE.HAS_HOVER_COLOR)){
            e.params.mesh.SetColor(WHITE);
            e.params.mesh.StateEnable(MESH_STATE.HOVER_COLOR_ENABLED);
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

        Listener_dispatch_event(LISTEN_EVENT_TYPES.HOVER, e.params.mesh);
    }

    else if (e.type === 'unhover') {
        // console.debug('unhover: ', e.params.mesh.id)

        if (e.params.mesh.StateCheck(MESH_STATE.HOVER_COLOR_ENABLED)){
            e.params.mesh.SetDefaultColor();
            e.params.mesh.StateDisable(MESH_STATE.HOVER_COLOR_ENABLED);
        }

        // if(e.params.mesh.type & MESH_TYPES_DBG.WIDGET_POP_UP){
        //     e.params.mesh.DeactivateSecondaryPopups();
        // }
        
        e.params.mesh.StateDisable(MESH_STATE.IN_HOVER); // Set false
        STATE.mesh.SetHovered(null);
    }

}


    // function EventHandler(event_type){

    //     const listeners = GetListeners();

    //     for(i in listeners.buffer[event_type]){
            
    //         listeners.buffer[event_type].events[i].Clbk();
    //     }
    // }

    // // App
    // mesh = new Mesh();
    // mesh.CreateListenEvent('TYPE', Clbk);
    // Clbk(){

    //     do{
    //         stuff
    //     }
    // }

    // // Mesh
    // CreateListenEvent('TYPE', Clbk){

    //     Listeners_add_event('TYPE', Clbk);
    // }

    // Listeners
    // Listeners_add_event('TYPE', Clbk){

    //     this.buffer['TYPE'].Add(Clbk);
    // }

    // function HandleClickEvent(clickPos){

    //     if(Intersection_point_rect(clickPos, this.pos)){
    //         do {
    //             // do stuff for click
    //         }
    //     }
    // }

/**
    // Event sceme of a mesh

    events = {

        buffer: [
            
            type: onclick, onhover, ...,
    
            callback: function(), the function to be called in case of the event
                
            // What ever, because the responsibility of managing the params
            // has nothing to do with the events system or any other intermidiary.
            params:{ 
                EventClbk: _Slider_create_on_click_event,
                target:  bar,
                Clbk: null,
            },
            
            ...
        ]
    }


    // An approach that the created events are categorized by ther event type. 
    // The benefit is we can loop all events of a specific type, 
    // and not loop through all events checking their type if matches the triggered event.

    events = {

        buffer: [ // type: onclick, onhover, ...,

            buffer: [

                Callback: function(), the function to be called in case of the event
                    
                // What ever, because the responsibility of managing the params
                // has nothing to do with the events system or any other intermidiary.
                params:{ 
                    EventClbk: _Slider_create_on_click_event,
                    target:  bar,
                    Clbk: null,
                },
            ],
    
            
            ...
        ]
    }
    
    run as:
    mesh.Dispatcher('onclick');
    and in:
    Dispatcher(TYPE){
        for(i in events)
            this.events.buffer[TYPE].buffer[i].Callback()
    }


 */

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

