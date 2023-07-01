"use strict";
import { OnMouseMove, OnMouseClick, OnMouseMove_Android, OnTouchStart, OnTouchEnd, OnTouchCancel, OnTouchMove } from "./MouseEvents.js";
import { PrintBuffersAttribsCount, PrintBuffersMeshesNames, PrintVertexBufferAll } from "../../Graphics/Debug/GfxDebug.js";
import { DrawQueueGet } from "../Renderer/DrawQueue.js";
import { ScenesPrintAllGfxBuffers } from "../../App/Scenes.js";
import { TimersPrintimers } from "../Timer/Timer.js";


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

export function HandleEventsEmidiate() {
}

function OnWindowResize() {
    console.log('WINDOW RESIZE')
}

export function AddEventListeners() {

    if(PLATFORM.ANDROID_IMPL){
        document.addEventListener('mousemove', OnMouseMove_Android, false);
        // Touch screen events
        // const canvas = document.getElementById("canvas");
        // canvas.addEventListener("touchstart", OnTouchStart);
        // canvas.addEventListener("touchend", OnTouchEnd);
        // canvas.addEventListener("touchcancel", OnTouchCancel);
        // canvas.addEventListener("touchmove", OnTouchMove);
        document.addEventListener("touchstart", OnTouchStart);
        document.addEventListener("touchend", OnTouchEnd);
        document.addEventListener("touchcancel", OnTouchCancel);
        document.addEventListener("touchmove", OnTouchMove);
    }
    else{
        document.addEventListener('mousemove', OnMouseMove, false);
    }
    document.addEventListener('click', OnMouseClick, false);
    document.addEventListener("resize", OnWindowResize, false);

    

    // Disabling the context menu on long taps on Android. 
    document.oncontextmenu = function(event) {
        event.preventDefault();
        event.stopPropagation();
        return false;
    };



    document.addEventListener('keydown', (event) => {
        if (event.key === 'P' || event.key === 'p') {
            if (g_state.game.paused === false) {
                g_state.game.paused = true;
                // console.log('Game Resumed');
            }
            else {
                g_state.game.paused = false;
                // console.log('Game Paused');
            }
        }
        else if (event.key === 'Z' || event.key === 'z') {
            console.log('- BUFFER MESHES NAMES -')
            PrintBuffersMeshesNames();
        }
        else if (event.key === 'X' || event.key === 'x') {
            console.log('- VERTEX BUFFER -')
            PrintVertexBufferAll();
        }
        else if (event.key === 'C' || event.key === 'c') {
            console.log('- DRAW QUEUE -')
            const drawQueue = DrawQueueGet();
            drawQueue.PrintAll();
        }
        else if (event.key === 'V' || event.key === 'v') {
            console.log('- SCENE\'S GFX BUFFERS -')
            ScenesPrintAllGfxBuffers();
        }
        else if (event.key === 'A' || event.key === 'a') {
            console.log('- TIMERS BUFFER -')
            TimersPrintimers();
        }
        else if (event.key === 'M' || event.key === 'm') {
            PrintBuffersAttribsCount();
        }
    }, false);
}

