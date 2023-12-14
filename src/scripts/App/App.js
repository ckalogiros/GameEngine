"use strict";
import { Scenes_create_scene } from '../Engine/Scenes.js'
import { Renderqueue_init } from '../Engine/Renderers/Renderer/RenderQueue.js';
import { WebGlRenderer } from '../Engine/Renderers/WebGlRenderer.js';
import { CAMERA_CONTROLS, CameraOrthographic, CameraPerspective } from '../Engine/Renderers/Renderer/Camera.js';
import { Texture_init_texture_storage_buffer } from '../Engine/Loaders/Textures/Texture.js';
import { PerformanceTimerGetFps1sAvg, TimeGetDeltaAvg, TimeGetFps, TimeGetTimer, _fps_100ms_avg, _fps_1s_avg, _fps_200ms_avg, _fps_500ms_avg } from '../Engine/Timers/Time.js';
import { PerformanceTimerInit } from '../Engine/Timers/PerformanceTimers.js';

/** Performance Timers */
import { _pt_fps, _pt2, _pt3, _pt4, _pt5, _pt6 } from '../Engine/Timers/PerformanceTimers.js';

// import { Buffer } from 'buffer';
import { Input_create_user_input_listeners } from '../Engine/Controls/Input/Input.js';
import { TestWidgetsGeneric } from './TestWidgets.js';
import { TimeIntervalsInit } from '../Engine/Timers/TimeIntervals.js';


// var osu = require('node-os-utils')
// import {osu} from 'node-os-utils'
// import {osu} from '../node-os-utils/index.js'
// import * as os from "../node-os-utils/index.js"


let renderer = null;

export function AppInit() {

    TimeIntervalsInit();
    PerformanceTimerInit();

    // Create and initialize the buffers that will be storing texture-font-uv data. 
    Texture_init_texture_storage_buffer();


    /* * * * * * * * * * * * * * * * * * * * * * * * * * *
    * Create Renderer and Scene
    */
    const scene = Scenes_create_scene();
    const camera = new CameraOrthographic();
    // const camera = new CameraPerspective();
    {
        // camera.SetControls(CAMERA_CONTROLS.PAN);
        // camera.SetControls(CAMERA_CONTROLS.ZOOM);
        // camera.SetControls(CAMERA_CONTROLS.ROTATE);
        // camera.Translate(280, 80, 20)
        // STATE.scene.active = scene;
        // STATE.scene.active_idx = scene.sceneidx;
    }

    renderer = new WebGlRenderer(scene, camera);

    Input_create_user_input_listeners();
    Renderqueue_init();

    // Initializer_popup_initialization();


    TestWidgetsGeneric(scene);


    // If camera is static, update projection matrix uniform only once
    camera.UpdateProjectionUniformAll(renderer.gl);
    scene.Render();


    // TimeIntervalsCreate(500, 'RenderQueue set program 1 priority', TIME_INTERVAL_REPEAT_ALWAYS, function(){

    //     Renderqueue_get().SetPriorityProgram('last', 1);
    //     Renderqueue_get().UpdateActiveQueue();
    // });

    { // PERFORMANCE OBJECTS
        var performance = window.performance || window.mozPerformance || window.msPerformance || window.webkitPerformance || {};
        console.log('PERFORMANCE:', performance)
        // const mem = window.performance.memory;
        // console.error(mem)
        // console.error(mem)

        // const r =window.ServiceWorker
        // console.log(r)
        // console.log(window)

        // if ((new Date()).getDay() == 6) { }
        // else {

        //     const work = new Worker("data:text/javascript,setInterval(` dl=Date.now();for(itr=1;itr<1000;itr++){};dl=Date.now()-dl;postMessage(dl);`,1000);");

        //     work.onmessage = (evt) => {
        //         console.log(evt.data)
        //         console.log(12 - evt.data + (' point' + ((new Intl.PluralRules(navigator.language)).select(12 - evt.data) == 'one' ? '' : 's')))
        //     };
        // }

        // setInterval(()=>{console.log('hardwareConcurrency:', navigator.hardwareConcurrency);}, 1000)
    }

    if (DEBUG.SET_HOVER_TO_ALL_MESHES) {

        for (let i = 0; i < scene.children.count; i++) {

            const mesh = scene.children.buffer[i];
            if (mesh) SetHoverToAllMeshesRecursive(scene.children.buffer[i]);
        }
    }
}

export function AppRender() {
    requestAnimationFrame(AppRender);
    renderer.Render();
}
