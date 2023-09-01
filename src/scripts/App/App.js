"use strict";
import { Scenes_create_scene } from '../Engine/Scenes.js'
import { EventsAddListeners } from '../Engine/Events/Events.js';
import { RenderQueueGet, RenderQueueInit } from '../Engine/Renderers/Renderer/RenderQueue.js';
import { WebGlRenderer } from '../Engine/Renderers/WebGlRenderer.js';
import { CameraOrthographic } from '../Engine/Renderers/Renderer/Camera.js';
import { TextureInitBuffers } from '../Engine/Loaders/Textures/Texture.js';
import { TimeGetDeltaAvg, TimeGetFps, TimeGetTimer } from '../Engine/Timers/Time.js';
import { Widget_Label_Dynamic_Text, Widget_Label } from '../Engine/Drawables/Meshes/Widgets/WidgetLabel.js';
import { Widget_Button, Widget_Switch } from '../Engine/Drawables/Meshes/Widgets/WidgetButton.js';
import { Widget_Text, Widget_Dynamic_Text_Mesh, Widget_Dynamic_Text_Mesh_Only } from '../Engine/Drawables/Meshes/Widgets/WidgetText.js';
import { CubeGeometry } from '../Engine/Drawables/Geometry/Geometry3DCube.js';
import { PerformanceTimerCreate, PerformanceTimerInit, _Tm1GetFps, _Tm1GetMilisec, _Tm1GetNanosec, _Tm2GetFps, _Tm2GetMilisec, _Tm3GetFps, _Tm3GetMilisec, _Tm5GetFps, _Tm5GetMilisec, _Tm6GetFps, _Tm6GetMilisec } from '../Engine/Timers/PerformanceTimers.js';
import { TimeIntervalsCreate, TimeIntervalsInit } from '../Engine/Timers/TimeIntervals.js';
import { MESH_ENABLE, Mesh } from '../Engine/Drawables/Meshes/Base/Mesh.js';
import { Widget_Slider } from '../Engine/Drawables/Meshes/Widgets/WidgetSlider.js';
import { Widget_Menu_Bar, Widget_Minimize } from '../Engine/Drawables/Meshes/Widgets/Menu/WidgetMenu.js';
import { Geometry2D } from '../Engine/Drawables/Geometry/Base/Geometry.js';
import { FloorArr3 } from '../Helpers/Math/MathOperations.js';
import { MAT_ENABLE, Material, Material_TEMP_fromBufferFor3D } from '../Engine/Drawables/Material/Base/Material.js';
import { Gfx_end_session } from '../Engine/Interface/GfxContext.js';
import { Section } from '../Engine/Drawables/Meshes/Section.js';
import { Initializer_popup_initialization } from '../Engine/Drawables/Meshes/Widgets/WidgetPopup.js';

/** Performance Timers */
import { DEBUG_PRINT_KEYS } from '../Engine/Controls/Input/Keys.js';
import { GetShaderTypeId } from '../Graphics/Z_Debug/GfxDebug.js';


// var osu = require('node-os-utils')
// import {osu} from 'node-os-utils'
// import {osu} from '../node-os-utils/index.js'
// import * as os from "../node-os-utils/index.js"

let renderer = null;


export function AppInit() {

    TimeIntervalsInit();
    PerformanceTimerInit();
    const tm = PerformanceTimerCreate();

    tm.Start();

    // Create a time interval for the fps average
    // TimeIntervalsCreate(1000, 'Fps-Avg-500ms', TIME_INTERVAL_REPEAT_ALWAYS, _Ta1GetAvg, null);

    // Load font image to the browser.
    // LoadFontImage(FONT_CONSOLAS_SDF_LARGE, FONT_TEXTURE_PATH_CONSOLAS_SDF_11115w, FONT_TYPE_CONSOLAS, 'png');

    // const fontConsolas = new ImageLoader('fonts/consolas_sdf', FONT_CONSOLAS_SDF_LARGE, 'png');
    // const fontConsolas = ImageLoader.Load('fonts/consolas_sdf', FONT_CONSOLAS_SDF_LARGE, 'png');
    // TEMP_FONT = fontConsolas

    // Create and initialize the buffers that will be storing texture-font-uv data. 
    TextureInitBuffers();



    /* * * * * * * * * * * * * * * * * * * * * * * * * * *
    * Create Renderer and Scene
    */
    // const scene = new Scene();
    const scene = Scenes_create_scene();
    const camera = new CameraOrthographic();
    // const camera = new CameraPerspective();

    // camera.SetControls(CAMERA_CONTROLS.PAN);
    // camera.SetControls(CAMERA_CONTROLS.ZOOM);
    // camera.SetControls(CAMERA_CONTROLS.ROTATE);
    // camera.Translate(80, 80, 20)
    // STATE.scene.active = scene;
    // STATE.scene.active_idx = scene.sceneIdx;

    renderer = new WebGlRenderer(scene, camera);

    EventsAddListeners();
    RenderQueueInit();
    Initializer_popup_initialization();


    /* * * * * * * * * * * * * * * * * * * * * * * * * * *
    * Create meshes
     */

    CreateUiTimers(scene)
    // CreateButtons(scene)
    // CreateSwitches(scene)
    BindSliderToTextLabel(scene)
    // CreateMenuBar(scene)
    // CreateMinimizer(scene);

    Help(scene)
    // CreateSection(scene)
    const section = MeshInfo(scene)
    TimeIntervalsCreate(10, 'Mesh info tip', TIME_INTERVAL_REPEAT_ALWAYS, MeshInfoUpdate, { mesh: section });
    
    {
        const label = new Widget_Label_Dynamic_Text('btnBTN', 'ihsjsdjshdj', [150, 400, 0]);
        label.SetName('btn0')
        scene.AddMesh(label);

    }

       
    { // Test the new GfxCtx2
        // const btn = new Widget_Button('btnBTN', [200, 200, 0]);
        // btn.SetName('btn0')
        // btn.GenGfxCtx(GFX.ANY)
        // // label.Align_pre(ALIGN.BOTTOM)
        // btn.AddToGfx()
    
        // const btn = new Widget_Text('btnBTN', [200, 200, 0]);
        // btn.SetName('btn0')
        // btn.GenGfxCtx(GFX.ANY)
        // // label.Align_pre(ALIGN.BOTTOM)
        // btn.AddToGfx()
    
    
        // let gfxidx = [INT_NULL, INT_NULL]
        // let ypos = 350
        // const a = new Section(SECTION.HORIZONTAL, [10,10], [200, 450, 0], [20,20], TRANSPARENCY(BLUE_10_120_220, .3));
        // {
        //     const b = new Section(SECTION.HORIZONTAL, [10,10], [200, 450, 0], [20,20], TRANSPARENCY(BLUE_10_120_220, .3));
        //     a.AddItem(b)
        // }
        // {
        //     const c = new Section(SECTION.VERTICAL, [10,10], [200, 450, 0], [20,20], TRANSPARENCY(BLUE_10_120_220, .3));
        //     const d1 = new Section(SECTION.HORIZONTAL, [10,10], [200, 450, 0], [20,20], TRANSPARENCY(YELLOW_240_220_10, .3));
        //     const d2 = new Section(SECTION.HORIZONTAL, [10,10], [200, 450, 0], [20,20], TRANSPARENCY(YELLOW_240_220_10, .3));
        //     const d3 = new Section(SECTION.HORIZONTAL, [10,10], [200, 450, 0], [20,20], TRANSPARENCY(YELLOW_240_220_10, .3));
            
        //     c.AddItem(d1)
        //     c.AddItem(d2)
        //     c.AddItem(d3)
        //     a.AddItem(c)
        // }
    
        // a.Recalc()
    
        // a.GenGfxCtx(GFX.ANY);
        // a.AddToGfx()
        // scene.StoreGfxInfo(a.gfx);
        // console.log(a.gfx.gfx_ctx);
        
        
        { // Slider implementation
    
            // let gfxidx = [INT_NULL, INT_NULL]
            // let ypos = 350
            // const a = new T_Slider([150, ypos, 0], [50, 25], BLUE_10_120_220);
            // a.GenGfxCtx(GFX.ANY);
            // a.AddToGfx()
            // scene.StoreGfxInfo(a.gfx);
            // console.log(a.gfx.gfx_ctx);
        }


        /**
         * TODO!!!!!!!!!!!
         * The cause of non rendering is the uniforms buffers!!!
         */
        { // Test: Add to Private after Session_end is called
            // let gfxidx = [INT_NULL, INT_NULL]
            // let ypos = 350
            // {
            //     const a = new T_Rect([150, ypos, 0], [50, 25], BLUE_10_120_220);
            //     a.GenGfxCtx(GFX.PRIVATE);
            //     a.AddToGfx()
            //     scene.StoreGfxInfo(a.gfx);
            //     console.log(a.gfx.gfx_ctx);
            // }
            
            // {    
            //     ypos += 54
            //     const a = new T_Rect([150, ypos, 0], [50, 25], BLUE_10_120_220);
            //     a.GenGfxCtx(GFX.PRIVATE);
            //     a.AddToGfx()
            //     scene.StoreGfxInfo(a.gfx);
            //     Gfx_end_session(true);
            //     gfxidx[0] = a.gfx.prog.idx
            //     gfxidx[1] = a.gfx.vb.idx
            //     console.log(a.gfx.gfx_ctx);
            // }
            
            // {    
            //     ypos += 54
            //     const a = new T_Rect([150, ypos, 0], [50, 25], BLUE_10_120_220);
            //     a.GenGfxCtx(GFX.PRIVATE, gfxidx);
            //     // a.GenGfxCtx(GFX.PRIVATE);
            //     a.AddToGfx()
            //     scene.StoreGfxInfo(a.gfx);
            //     console.log(a.gfx.gfx_ctx);
            // }

        }
        
        { // Text
            // const l = new T_Label('Hello world2', [150, 550, 0])
            // l.GenGfxCtx(GFX.PRIVATE);
            // l.Render()
            
            // const t = new T_Text('Hello world', [150, 400, 0])
            // t.GenGfxCtx(GFX.ANY);
            // t.AddToGfx()
        }
    }

    // Test_Old_vs_new_hover_listener(scene)
    // TestArraysPerformance();

    tm.Stop();

    // If camera is static, update projection matrix uniform only once
    camera.UpdateProjectionUniform(renderer.gl);
    scene.Render();

    RenderQueueGet().SetPriorityProgram('last', 0);

    RenderQueueGet().UpdateActiveQueue(); // Update active queue buffer with the vertex buffers set to be drawn



    { // PERFORMANCE OBJECTS
        var performance = window.performance || window.mozPerformance || window.msPerformance || window.webkitPerformance || {};
        console.log(performance)
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

            // if (mesh && mesh.listeners.buffer[0] === INT_NULL) {
            if (mesh) {

                // mesh.CreateListenEvent(LISTEN_EVENT_TYPES.HOVER)
                // mesh.StateEnable(MESH_STATE.IS_FAKE_HOVER)
                // mesh.StateEnable(MESH_STATE.IS_HOVER_COLORABLE);
                // console.log(mesh.name)
                SetHoverToAllMeshesRecursive(scene.children.buffer[i]);
            }

        }
    }
}

export function AppRender() {
    requestAnimationFrame(AppRender);
    renderer.Render();
}


function CreateSwitches(scene) {

    const switch1 = new Widget_Switch([400, 200, 0]);
    scene.AddMesh(switch1)

    const btn1 = new Widget_Button('x', [400, 150, 0], 6, GREY1, WHITE, [1, 1], [8, 4], .8, undefined, [1, 4, 2]);
    btn1.CreateListenEvent(LISTEN_EVENT_TYPES.HOVER);
    btn1.StateEnable(MESH_STATE.IS_HOVER_COLORABLE)
    scene.AddMesh(btn1);

}

function CreateMinimizer(scene){

    const section = new Section(SECTION.HORIZONTAL, [10,10], [200, 450, 0], [0,0], TRANSPARENCY(BLUE_10_120_220, .3))
    section.SetName('Minimizer section')
    section.CreateListenEvent(LISTEN_EVENT_TYPES.HOVER)
    // section.CreateListenEvent()
    
    
    const  min = new Widget_Minimize([200, 450, 0]);
    min.SetName('minimizer button')
    min.parent = section;
    min.CreateListenEvent(LISTEN_EVENT_TYPES.CLICK_DOWN, min.OnClick, min);
    min.CreateListenEvent(LISTEN_EVENT_TYPES.HOVER);
    min.StateEnable(MESH_STATE.IS_HOVER_COLORABLE);
    
    section.AddItem(min);
    

    Request_private_gfx_ctx(section, GFX_CTX_FLAGS.INACTIVE | GFX_CTX_FLAGS.PRIVATE, INT_NULL, INT_NULL);
    // Gfx_generate_context(section.sid, section.sceneIdx, GL_VB.NEW, mesh_count)
    // scene.AddMesh(min);

    Gfx_end_session(true);

    
    section.Recalc(); // Reset pos-dim and calculate.
    // section.Calc();
    section.UpdateGfx(section, section.sceneIdx);
}

function CreateUiTimersWithSections(scene) {

    const fontsize = 4; let ypos = fontsize * 2, ms = 200; let idx = INT_NULL;
    ms = 400;
    const pad = [fontsize * 3, fontsize * 3];

    const pt = PerformanceTimerCreate('Widget menu construct.');
    pt.Start();
    const timer = new Widget_Dynamic_Text_Mesh('Fps Avg:', '000000', [0, ypos, 0], fontsize, [1, 1], GREEN_140_240_10, YELLOW_240_220_10, .5);
    timer.SetDynamicText(ms, TimeGetFps, `DynamicText ${ms} Timer TimeGetFps`)
    timer.CreateNewText('delta:', fontsize, undefined, GREEN_140_240_10, [fontsize * 3, 0], .9);
    idx = timer.CreateNewText('00000', fontsize, undefined, YELLOW_240_220_10, [0, 0], .9); // idx is for use in creating separate time intervals for each dynamic text.
    timer.SetDynamicText(ms, TimeGetDeltaAvg, `DynamicText ${ms} Timer TimeGetDeltaAvg`)
    timer.CreateNewText('nano:', fontsize, undefined, GREEN_140_240_10, [fontsize * 4, 0], .9);
    idx = timer.CreateNewText('000000', fontsize, undefined, YELLOW_240_220_10, [0, 0], .5);
    timer.SetDynamicText(ms, TimeGetTimer, `DynamicText ${ms} Timer TimeGetTimer`)
    scene.AddMesh(timer, GL_VB.NEW);
    pt.Stop(); pt.Print();

    const flags = SECTION.ITEM_FIT;
    const section = new Section(SECTION.HORIZONTAL, [5, 5], [200, 40, 0], [20, 20], TRANSPARENCY(GREY5, .7))
    const s1 = new Section(SECTION.HORIZONTAL, [3, 4], [200, 40, 0], [20, 20], TRANSPARENCY(GREY1, .9))
    const s2 = new Section(SECTION.HORIZONTAL, [3, 4], [200, 80, 0], [20, 20], TRANSPARENCY(GREY1, .9))
    const s3 = new Section(SECTION.HORIZONTAL, [4, 4], [200, 120, 0], [20, 20], TRANSPARENCY(GREY1, .2))


    { // Add each text seperately into sections
        s1.AddItem(timer.children.buffer[1], flags); s1.SetName('s1');
        s2.AddItem(timer.children.buffer[2], flags); s2.SetName('s2');
        section.AddItem(s1, flags)
        section.AddItem(s2, flags)
    }


    section.Calc(flags)
    section.UpdateGfxRecursive(section, scene.sceneIdx)
    // section.UpdateGfx(section, scene.sceneIdx)

    scene.AddMesh(section);

}

function CreateUiTimers(scene) {

    const fontsize = 4, pad = 6; let ypos = fontsize * 2, ms = 200; let idx = INT_NULL;
    ms = 400;
    
    const pt = PerformanceTimerCreate('Widget menu construct.');
    pt.Start();
    const timer = new Widget_Dynamic_Text_Mesh('Fps Avg:', '000000', [0, ypos, 0], fontsize, [1, 1], BLUE_10_160_220, ORANGE_240_160_10, .5);
    timer.SetDynamicText(ms, TimeGetFps, `DynamicText ${ms} Timer TimeGetFps`)
    timer.CreateNewText('delta:', fontsize, BLUE_10_160_220, [fontsize * 3, 0], .9);
    timer.CreateNewText('00000', fontsize, ORANGE_240_160_10, [0, 0], .9); // idx is for use in creating separate time intervals for each dynamic text.
    timer.SetDynamicText(ms, TimeGetDeltaAvg, `DynamicText ${ms} Timer TimeGetDeltaAvg`)
    timer.CreateNewText('nano:', fontsize, BLUE_10_160_220, [fontsize * 4, 0], .9);
    timer.CreateNewText('000000', fontsize, ORANGE_240_160_10, [0, 0], .5);
    timer.SetDynamicText(ms, TimeGetTimer, `DynamicText ${ms} Timer TimeGetTimer`);
    // timer.GenGfxCtx(GFX.PRIVATE);
    // timer.AddToGfx();
    // scene.StoreGfxInfo(timer.gfx);
    scene.AddMesh(timer, GFX.PRIVATE);
    pt.Stop(); pt.Print();
    
    // Performance Time Measure 1
    ms = 500; ypos += fontsize * 2 + pad;
    const timeMeasure1 = new Widget_Dynamic_Text_Mesh('All Timers Update:', '000000', [0, ypos, 0], fontsize, [1, 1], BLUE_10_160_220, ORANGE_240_160_10, .4);
    timeMeasure1.SetDynamicText(ms, _Tm1GetFps, `DynamicText ${ms} All Timers Update _Tm1GetFps`)
    timeMeasure1.CreateNewText('ms:', fontsize, BLUE_10_160_220, [fontsize * 3, 0], .9);
    idx = timeMeasure1.CreateNewText('00000', fontsize, ORANGE_240_160_10, [0, 0], .4);
    timeMeasure1.SetDynamicText(ms, _Tm1GetMilisec, `DynamicText ${ms} All Timers Update _Tm1GetMilisec`)
    // timeMeasure1.GenGfxCtx(GFX.ANY);
    // timeMeasure1.AddToGfx();
    scene.AddMesh(timeMeasure1, GFX.ANY);
    
    // Performance Time Measure 3
    ms = 500; ypos += fontsize * 2 + pad;
    const timeMeasure2 = new Widget_Dynamic_Text_Mesh('GlDraw:', '000000', [0, ypos, 0], fontsize, [1, 1], BLUE_10_160_220, ORANGE_240_160_10, .4);
    timeMeasure2.SetDynamicText(ms, _Tm3GetFps, `DynamicText ${ms} GlDraw _Tm3GetFps`)
    timeMeasure2.CreateNewText('ms:', fontsize, BLUE_10_160_220, [fontsize * 3, 0], .9);
    timeMeasure2.CreateNewText('00000', fontsize, ORANGE_240_160_10, [0, 0], .4);
    timeMeasure2.SetDynamicText(ms, _Tm3GetMilisec, `DynamicText ${ms} GlDraw _Tm3GetMilisec`)
    // timeMeasure2.GenGfxCtx(GFX.ANY);
    // timeMeasure2.AddToGfx();
    scene.AddMesh(timeMeasure2, GFX.ANY);
    
    // Performance Time Measure 2
    ms = 500; ypos += fontsize * 2 + pad;
    const timeMeasure3 = new Widget_Dynamic_Text_Mesh('Scene Update:', '000000', [0, ypos, 0], fontsize, [1, 1], BLUE_10_160_220, ORANGE_240_160_10, .4);
    timeMeasure3.SetDynamicText(ms, _Tm2GetFps, `DynamicText ${ms} Scene Update _Tm2GetFps`)
    timeMeasure3.CreateNewText('ms:', fontsize, BLUE_10_160_220, [fontsize * 3, 0], .9);
    timeMeasure3.CreateNewText('000000', fontsize, ORANGE_240_160_10, [0, 0], .4);
    timeMeasure3.SetDynamicText(ms, _Tm2GetMilisec, `DynamicText ${ms} Scene Update _Tm2GetMilisec`)
    // timeMeasure3.GenGfxCtx(GFX.ANY, GFX.ANY);
    // timeMeasure3.AddToGfx();
    scene.AddMesh(timeMeasure3);
    
    // Performance Time Measure 2
    ms = 500; ypos += fontsize * 2 + pad;
    const timeMeasure4 = new Widget_Dynamic_Text_Mesh('New hover listen:', '000000', [0, ypos, 0], fontsize, [1, 1], BLUE_10_160_220, ORANGE_240_160_10, .4);
    timeMeasure4.SetDynamicText(ms, _Tm6GetFps, `DynamicText ${ms} Scene Update _Tm6GetFps`)
    timeMeasure4.CreateNewText('ms:', fontsize, BLUE_10_160_220, [fontsize * 3, 0], .9);
    timeMeasure4.CreateNewText('000000', fontsize, ORANGE_240_160_10, [0, 0], .4);
    timeMeasure4.SetDynamicText(ms, _Tm6GetMilisec, `DynamicText ${ms} Scene Update _Tm6GetMilisec`)
    // timeMeasure4.GenGfxCtx(GFX.ANY);
    // timeMeasure4.AddToGfx();
    scene.AddMesh(timeMeasure4, GFX.ANY);

    Gfx_end_session(true);
}


function BindSliderToTextLabel(scene) {

    let posy = 80, height = 10, pad = 25;
    posy += height * 2 + pad;
    const hover_margin  = [5, 0];

    const slider = new Widget_Slider([200, posy, 0], [150, height], BLUE_10_160_220, hover_margin);
    scene.AddMesh(slider)
        
    posy += height * 2 + pad;
    const slider2 = new Widget_Slider([200, posy, 0], [150, height], BLUE_10_160_220, hover_margin);
    scene.AddMesh(slider2)

}

function CreateButtons(scene) {

    let posy = Viewport.bottom - 50;

    const btn1 = new Widget_Button('BUTTON 1', [40, posy, 0], 10, GREY5, WHITE, [1, 1], [5, 3], .3);
    btn1.CreateListenEvent(LISTEN_EVENT_TYPES.CLICK_DOWN, btn1.OnClick)
    btn1.CreateListenEvent(LISTEN_EVENT_TYPES.HOVER)
    btn1.StateEnable(MESH_STATE.IS_HOVER_COLORABLE)
    btn1.EnableGfxAttributes(MESH_ENABLE.GFX.ATTR_STYLE, { style: [6, 6, 3] })
    scene.AddMesh(btn1);


    RenderQueueGet().SetPriority('last', btn1.children.buffer[0].gfx.prog.idx, btn1.gfx.vb.idx);
}

function CreateMenuBar(scene) {

    let posy = Viewport.bottom - 100, fontSize = 10;

    const menu_bar = new Widget_Menu_Bar('BUTTON 1', [120, posy, 0], [100, 20], GREY5, WHITE, [1, 1], [3, 3], .3);
    menu_bar.AddCloseButton('x', [400, 150, 0], 6, GREY1, WHITE, [1, 1], [8, 4], .8, undefined, [1, 4, 2]);
    scene.AddMesh(menu_bar);
}

function CreateSection(scene) {

    const flags = (SECTION.ITEM_FIT | SECTION.EXPAND);

    const blu = new Section(SECTION.HORIZONTAL, [15, 15], [220, 630, 0], [10, 0], TRANSPARENCY(BLUE, .2));

    const red = new Section(SECTION.VERTICAL, [15, 15], [100, 100, 0], [20, 20], TRANSPARENCY(PURPLE, .2));
    const gre = new Section(SECTION.VERTICAL, [12, 12], [100, 100, 0], [20, 20], TRANSPARENCY(GREEN, .4));
    const yel = new Section(SECTION.HORIZONTAL, [12, 12], [200, 400, 0], [20, 20], TRANSPARENCY(YELLOW, .4));
    const ora = new Section(SECTION.HORIZONTAL, [12, 12], [200, 400, 0], [20, 20], TRANSPARENCY(ORANGE, .4));
    const cie = new Section(SECTION.HORIZONTAL, [15, 15], [200, 400, 0], [20, 20], TRANSPARENCY(BLUE_LIGHT, .4));
    const bla = new Section(SECTION.VERTICAL, [15, 15], [200, 400, 0], [20, 20], TRANSPARENCY(BLACK, .4));

    {
        var bla_1 = new Section(SECTION.HORIZONTAL, [15, 15], [200, 400, 0], [20, 20], TRANSPARENCY(BLACK, .3));
        var pin_1 = new Section(SECTION.VERTICAL, [25, 10], [100, 100, 0], [20, 20], TRANSPARENCY(PINK_240_60_160, .3));
        var blu_1 = new Section(SECTION.VERTICAL, [25, 10], [100, 100, 0], [20, 20], TRANSPARENCY(BLUE,   .3));
        var pur_1 = new Section(SECTION.VERTICAL, [5, 5], [100, 100, 0], [20, 20], TRANSPARENCY(PURPLE, .8));
        var red_1 = new Section(SECTION.VERTICAL, [5, 5], [100, 100, 0], [20, 20], TRANSPARENCY(RED,    .8));
        var yel_1 = new Section(SECTION.VERTICAL, [5, 5], [100, 100, 0], [20, 20], TRANSPARENCY(YELLOW, .8));
        var yel_2 = new Section(SECTION.VERTICAL, [5, 5], [100, 100, 0], [20, 20], TRANSPARENCY(YELLOW, .8));
        var red_3 = new Section(SECTION.VERTICAL, [5, 5], [100, 100, 0], [20, 20], TRANSPARENCY(RED,    .8));
        var yel_3 = new Section(SECTION.VERTICAL, [5, 5], [100, 100, 0], [20, 20], TRANSPARENCY(YELLOW, .8));
        var gre_3 = new Section(SECTION.VERTICAL, [5, 5], [100, 100, 0], [20, 20], TRANSPARENCY(GREEN,  .8));
        var red_4 = new Section(SECTION.VERTICAL, [5, 5], [100, 100, 0], [20, 20], TRANSPARENCY(RED,    .8));
        var yel_4 = new Section(SECTION.VERTICAL, [5, 5], [100, 100, 0], [20, 20], TRANSPARENCY(YELLOW, .8));
        var gre_4 = new Section(SECTION.VERTICAL, [5, 5], [100, 100, 0], [20, 20], TRANSPARENCY(GREEN,  .8));
        var ora_4 = new Section(SECTION.VERTICAL, [5, 5], [100, 100, 0], [20, 20], TRANSPARENCY(ORANGE, .8));
        var gry1_1 = new Section(SECTION.VERTICAL, [5, 5], [100, 100, 0], [20, 20], TRANSPARENCY(GREY3, .8));
        var gry1_2 = new Section(SECTION.VERTICAL, [5, 5], [100, 100, 0], [20, 20], TRANSPARENCY(GREY5, .8));
        var gry1_3 = new Section(SECTION.VERTICAL, [5, 5], [100, 100, 0], [20, 20], TRANSPARENCY(GREY7, .8));
        var gry2_1 = new Section(SECTION.VERTICAL, [5, 5], [100, 100, 0], [20, 20], TRANSPARENCY(GREY3, .9));
        var gry2_2 = new Section(SECTION.VERTICAL, [5, 5], [100, 100, 0], [20, 20], TRANSPARENCY(GREY5, .9));
        var gry2_3 = new Section(SECTION.VERTICAL, [5, 5], [100, 100, 0], [20, 20], TRANSPARENCY(GREY7, .9));
        var gry2_4 = new Section(SECTION.VERTICAL, [5, 5], [100, 100, 0], [20, 20], TRANSPARENCY(GREY7, .9));
        var vert_0 = new Section(SECTION.VERTICAL, [20, 20], [100, 100, 0], [20, 20], TRANSPARENCY(GREY2, .4));

    }
    // const btn = new Widget_Button('btn1', [200, 100, 0], 7, TRANSPARENCY(YELLOW, .9), WHITE, [1, 1], [2, 2], .5);
    // // scene.AddMesh(btn)
    // btn.CreateListenEvent(LISTEN_EVENT_TYPES.CLICK_DOWN, btn.OnClick)
    // btn.CreateListenEvent(LISTEN_EVENT_TYPES.HOVER)
    // btn.SetName('Sectioned btn1')
    
    const label = new Widget_Label('btnBTN', [200, 100, 0]);
    label.SetName('Sectioned btn1')
    label.CreateListenEvent(LISTEN_EVENT_TYPES.HOVER)
    label.StateEnable(MESH_STATE.IS_HOVER_COLORABLE);
    blu.CreateListenEvent(LISTEN_EVENT_TYPES.MOVE, blu.OnClick, blu, null);

    {

        red.SetName('red');     red.StateEnable(MESH_STATE.IS_HOVER_COLORABLE); red.CreateListenEvent(LISTEN_EVENT_TYPES.HOVER);
        gre.SetName('gre');     gre.StateEnable(MESH_STATE.IS_HOVER_COLORABLE); gre.CreateListenEvent(LISTEN_EVENT_TYPES.HOVER);
        yel.SetName('yel');     yel.StateEnable(MESH_STATE.IS_HOVER_COLORABLE); yel.CreateListenEvent(LISTEN_EVENT_TYPES.HOVER);
        ora.SetName('ora');     ora.StateEnable(MESH_STATE.IS_HOVER_COLORABLE); ora.CreateListenEvent(LISTEN_EVENT_TYPES.HOVER);
        cie.SetName('cie');     cie.StateEnable(MESH_STATE.IS_HOVER_COLORABLE); cie.CreateListenEvent(LISTEN_EVENT_TYPES.HOVER);
        bla.SetName('bla');     bla.StateEnable(MESH_STATE.IS_HOVER_COLORABLE); bla.CreateListenEvent(LISTEN_EVENT_TYPES.HOVER);
        bla_1.SetName('bla_1'); bla_1.StateEnable(MESH_STATE.IS_HOVER_COLORABLE); bla_1.CreateListenEvent(LISTEN_EVENT_TYPES.HOVER);
        pin_1.SetName('pin_1'); pin_1.StateEnable(MESH_STATE.IS_HOVER_COLORABLE); pin_1.CreateListenEvent(LISTEN_EVENT_TYPES.HOVER);
        blu_1.SetName('blu_1'); blu_1.StateEnable(MESH_STATE.IS_HOVER_COLORABLE); blu_1.CreateListenEvent(LISTEN_EVENT_TYPES.HOVER);
        pur_1.SetName('pur_1'); pur_1.StateEnable(MESH_STATE.IS_HOVER_COLORABLE); pur_1.CreateListenEvent(LISTEN_EVENT_TYPES.HOVER);
        red_1.SetName('red_1'); red_1.StateEnable(MESH_STATE.IS_HOVER_COLORABLE); red_1.CreateListenEvent(LISTEN_EVENT_TYPES.HOVER);
        yel_1.SetName('yel_1'); yel_1.StateEnable(MESH_STATE.IS_HOVER_COLORABLE); yel_1.CreateListenEvent(LISTEN_EVENT_TYPES.HOVER);
        yel_2.SetName('yel_2'); yel_2.StateEnable(MESH_STATE.IS_HOVER_COLORABLE); yel_2.CreateListenEvent(LISTEN_EVENT_TYPES.HOVER);
        red_3.SetName('red_3'); red_3.StateEnable(MESH_STATE.IS_HOVER_COLORABLE); red_3.CreateListenEvent(LISTEN_EVENT_TYPES.HOVER);
        yel_3.SetName('yel_3'); yel_3.StateEnable(MESH_STATE.IS_HOVER_COLORABLE); yel_3.CreateListenEvent(LISTEN_EVENT_TYPES.HOVER);
        gre_3.SetName('gre_3'); gre_3.StateEnable(MESH_STATE.IS_HOVER_COLORABLE); gre_3.CreateListenEvent(LISTEN_EVENT_TYPES.HOVER);
        red_4.SetName('red_4'); red_4.StateEnable(MESH_STATE.IS_HOVER_COLORABLE); red_4.CreateListenEvent(LISTEN_EVENT_TYPES.HOVER);
        yel_4.SetName('yel_4'); yel_4.StateEnable(MESH_STATE.IS_HOVER_COLORABLE); yel_4.CreateListenEvent(LISTEN_EVENT_TYPES.HOVER);
        gre_4.SetName('gre_4'); gre_4.StateEnable(MESH_STATE.IS_HOVER_COLORABLE); gre_4.CreateListenEvent(LISTEN_EVENT_TYPES.HOVER);
        ora_4.SetName('ora_4'); ora_4.StateEnable(MESH_STATE.IS_HOVER_COLORABLE); ora_4.CreateListenEvent(LISTEN_EVENT_TYPES.HOVER);
        gry1_1.SetName('gry1_1'); gry1_1.StateEnable(MESH_STATE.IS_HOVER_COLORABLE); gry1_1.CreateListenEvent(LISTEN_EVENT_TYPES.HOVER);
        gry1_2.SetName('gry1_2'); gry1_2.StateEnable(MESH_STATE.IS_HOVER_COLORABLE); gry1_2.CreateListenEvent(LISTEN_EVENT_TYPES.HOVER);
        gry1_3.SetName('gry1_3'); gry1_3.StateEnable(MESH_STATE.IS_HOVER_COLORABLE); gry1_3.CreateListenEvent(LISTEN_EVENT_TYPES.HOVER);
        gry2_1.SetName('gry2_1'); gry2_1.StateEnable(MESH_STATE.IS_HOVER_COLORABLE); gry2_1.CreateListenEvent(LISTEN_EVENT_TYPES.HOVER);
        gry2_2.SetName('gry2_2'); gry2_2.StateEnable(MESH_STATE.IS_HOVER_COLORABLE); gry2_2.CreateListenEvent(LISTEN_EVENT_TYPES.HOVER);
        gry2_3.SetName('gry2_3'); gry2_3.StateEnable(MESH_STATE.IS_HOVER_COLORABLE); gry2_3.CreateListenEvent(LISTEN_EVENT_TYPES.HOVER);
        gry2_4.SetName('gry2_4'); gry2_4.StateEnable(MESH_STATE.IS_HOVER_COLORABLE); gry2_4.CreateListenEvent(LISTEN_EVENT_TYPES.HOVER);
        vert_0.SetName('vert_0'); vert_0.StateEnable(MESH_STATE.IS_HOVER_COLORABLE); vert_0.CreateListenEvent(LISTEN_EVENT_TYPES.HOVER);

    }

    {
        pin_1.AddItem(gry2_1, flags); pin_1.AddItem(gry2_2, flags);
        blu_1.AddItem(gry2_3, flags); blu_1.AddItem(gry2_4, flags);
        bla_1.AddItem(pin_1,  flags);  bla_1.AddItem(blu_1, flags);
        red.AddItem(bla_1);   red.AddItem(yel, flags);    red.AddItem(ora, flags);    red.AddItem(cie, flags);
        yel.AddItem(gre_4, flags);  yel.AddItem(pur_1, flags);  yel.AddItem(red_3, flags); 
        ora.AddItem(yel_4, flags);  ora.AddItem(red_4, flags);  ora.AddItem(yel_2, flags); ora.AddItem(ora_4, flags); 
        cie.AddItem(gre_3, flags);  cie.AddItem(yel_3, flags);  cie.AddItem(bla, flags);
        bla.AddItem(gry1_1, flags); bla.AddItem(gry1_2, flags);     bla.AddItem(gry1_3, flags);
        gry1_1.AddItem(label, flags); gry1_1.AddItem(vert_0, flags); 
        gre.AddItem(yel_1, flags);  gre.AddItem(red_1, flags);
    }

    yel.AddItem(gre, flags);
    blu.AddItem(red, flags);

    scene.AddMesh(blu, GFX.PRIVATE);
    Gfx_end_session(true);
    blu.Calc();
    
}

function Help(scene) {


    const flags = (SECTION.ITEM_FIT);

    const section = new Section(SECTION.HORIZONTAL, [10, 10], [550, 600, 0], [0, 0], TRANSPARENCY(GREY1, .2));
    section.CreateListenEvent(LISTEN_EVENT_TYPES.MOVE, section.OnClick, section, null);
    section.SetName('Help section')
    // scene.StoreMesh(section)
    const s1 = new Section(SECTION.VERTICAL, [15, 10], [220, 400, 0], [0, 0], TRANSPARENCY(GREY1, .2));
    s1.SetName('Help section 2')
    // scene.StoreMesh(s1)

    let msgs = [];
    for (let i = 0; i < DEBUG_PRINT_KEYS.length; i++) {

        msgs[i] = '\"' + DEBUG_PRINT_KEYS[i].key + '\": ' + DEBUG_PRINT_KEYS[i].discr
        const label = new Widget_Label(msgs[i], [400, 300, 0], 4, TRANSPARENCY(ORANGE_240_130_10, .7), WHITE, [1, 1], [7, 6], .5, undefined, [0, 4, 3])
        label.StateEnable(MESH_STATE.IS_HOVER_COLORABLE)
        label.CreateListenEvent(LISTEN_EVENT_TYPES.HOVER)
        
        s1.AddItem(label)
    }
    
    section.AddItem(s1, flags)
    // section.ReconstructListenersRecursive();
    scene.AddMesh(section, GFX.ANY);

    section.Calc(flags)

    // Request_private_gfx_ctx(section, GFX_CTX_FLAGS.INACTIVE | GFX_CTX_FLAGS.PRIVATE, INT_NULL, INT_NULL);
    // Gfx_end_session(true);

    // section.UpdateGfx(section, scene.sceneIdx);
}

function MeshInfo(scene) {

    const fontsize = 5;

    for (let i = 0; i < 1; i++) {

        const infomesh = new Widget_Dynamic_Text_Mesh('Mesh name 0000000000000000', 'id:000', [60, 200, 0], fontsize, [1, 1], GREEN_140_240_10, YELLOW_240_220_10, .4);
        infomesh.CreateNewText('pos: 000,000,0', fontsize, BLUE_10_120_220, [fontsize * 3, 0], .9);
        infomesh.CreateNewText('dim: 000,000', fontsize, BLUE_10_120_220, [fontsize * 3, 0], .9);
        infomesh.CreateNewText('gfx: prog:0, vb:0, start:000000', fontsize, BLUE_10_120_220, [fontsize * 3, 0], .9);

        infomesh.Align(ALIGN.VERTICAL)
        scene.AddMesh(infomesh);
        infomesh.CreateListenEvent(LISTEN_EVENT_TYPES.MOVE, infomesh.OnClick, infomesh, null);

        return infomesh;
    }
}
function MeshInfoUpdate(params) {

    const textMesh = params.params.mesh;
    const infoMesh = STATE.mesh.hovered;

    if (infoMesh) {

        textMesh.UpdateTextFromVal(infoMesh.name)

        if (infoMesh) {

            let msgs = [
                `id:${infoMesh.id}`,
                `pos:${FloorArr3(infoMesh.geom.pos)}`,
                `dim:${infoMesh.geom.dim}`,
                `gfx: prog:${infoMesh.gfx.prog.idx}, vb:${infoMesh.gfx.vb.idx}, vb:${infoMesh.gfx.vb.start}`
            ];

            for (let i = 0; i < textMesh.children.count; i++) {

                const childText = textMesh.children.buffer[i];
                childText.UpdateTextFromVal(msgs[i])
            }
        }
    }


}

function SetHoverToAllMeshesRecursive(mesh) {

    mesh.CreateListenEvent(LISTEN_EVENT_TYPES.HOVER);
    mesh.StateEnable(MESH_STATE.IS_HOVER_COLORABLE);
    // console.log(mesh.name)
    
    for (let i = 0; i < mesh.children.count; i++) {

        const child = mesh.children.buffer[i];
        if (child.children.active_count)
            SetHoverToAllMeshesRecursive(child);
    }

}

function Menu_labels_switches(scene) {

    const flags = (SECTION.ITEM_FIT);

    const section = new Section(SECTION.HORIZONTAL, [10, 10], [120, 300, 0], [0, 0], TRANSPARENCY(GREY1, .2));
    const s1 = new Section(SECTION.VERTICAL, [15, 2], [220, 400, 0], [0, 0], TRANSPARENCY(GREY1, .2));
    const s2 = new Section(SECTION.VERTICAL, [7, 2], [220, 400, 0], [0, 0], TRANSPARENCY(GREY1, .3));

    // const label1 = new Widget_Label('options 1', [400, 700, 0], 4, TRANSPARENT, WHITE, [1,1], [7,6], .5, undefined, [0,4,1])
    const label1 = new Widget_Label('options 1', [400, 300, 0], 4, TRANSPARENCY(GREY1, .0), WHITE, [1, 1], [7, 6], .5, undefined, [0, 4, 1])
    const label2 = new Widget_Label('options 2', [400, 700, 0], 4, TRANSPARENCY(GREY1, .0), WHITE, [1, 1], [7, 6], .5, undefined, [0, 4, 1])
    const label3 = new Widget_Label('options 3', [400, 700, 0], 4, TRANSPARENCY(GREY1, .0), WHITE, [1, 1], [7, 6], .5, undefined, [0, 4, 1])
    const label4 = new Widget_Label('options 4', [400, 700, 0], 4, TRANSPARENCY(GREY1, .0), WHITE, [1, 1], [7, 6], .5, undefined, [0, 4, 1])

    const switch1 = new Widget_Switch([400, 700, 0], 4, TRANSPARENCY(GREY1, .0), WHITE, [1, 1], [4, 6], .5, undefined, [2, 8, 1]);
    const switch2 = new Widget_Switch([400, 700, 0], 4, TRANSPARENCY(GREY1, .0), WHITE, [1, 1], [4, 6], .5, undefined, [2, 8, 1]);
    const switch3 = new Widget_Switch([400, 700, 0], 4, TRANSPARENCY(GREY1, .0), WHITE, [1, 1], [4, 6], .5, undefined, [2, 8, 1]);
    const switch4 = new Widget_Switch([400, 700, 0], 4, TRANSPARENCY(BLUE_10_120_220, .2), WHITE, [1, 1], [4, 6], .5, undefined, [2, 4, 1]);

    s1.AddItem(label1, flags)
    s1.AddItem(label2, flags)
    s1.AddItem(label3, flags)
    s1.AddItem(label4, flags)

    s2.AddItem(switch1, flags)
    s2.AddItem(switch2, flags)
    s2.AddItem(switch3, flags)
    s2.AddItem(switch4, flags)

    section.AddItem(s1, flags)
    section.AddItem(s2, flags)

    section.Calc(flags)

    scene.AddMesh(section);

    scene.AddMesh(label1);
    scene.AddMesh(label2);
    scene.AddMesh(label3);
    scene.AddMesh(label4);

    scene.AddMesh(switch1);
    scene.AddMesh(switch2);
    scene.AddMesh(switch3);
    scene.AddMesh(switch4);

    section.UpdateGfx(section, scene.sceneIdx);
    // section.UpdateGfxRecursive(section, scene.sceneIdx);
    console.log();
}

function CreateStyledRects(scene){

    {
        const geom = new Geometry2D([100, 420, 0], [50, 50]);
        const mat = new Material(ORANGE_240_130_10);

        const mesh = new Mesh(geom, mat);
        mesh.EnableGfxAttributes(MESH_ENABLE.GFX.ATTR_STYLE);
        mesh.SetStyle([8, 35, 3]);
        mesh.StateEnable(MESH_STATE.IS_HOVER_COLORABLE);
        scene.AddMesh(mesh);
        mesh.CreateListenEvent(LISTEN_EVENT_TYPES.HOVER);
    }
    {
        const geom = new Geometry2D([204, 420, 0], [50, 50]);
        const mat = new Material(PINK_240_60_160);
        mat.col = PINK_240_60_160;
        const mesh = new Mesh(geom, mat);
        mesh.EnableGfxAttributes(MESH_ENABLE.GFX.ATTR_STYLE);
        mesh.StateEnable(MESH_STATE.IS_HOVER_COLORABLE);
        mesh.SetStyle([20, 35, 3]);
        scene.AddMesh(mesh);
        mesh.CreateListenEvent(LISTEN_EVENT_TYPES.HOVER);
    }
    {
        const geom = new Geometry2D([308, 420, 0], [50, 50]);
        const mat = new Material(GREEN_60_240_100);
        const mesh = new Mesh(geom, mat);
        mesh.EnableGfxAttributes(MESH_ENABLE.GFX.ATTR_STYLE);
        mesh.SetStyle([10, 15, 3]);
        mesh.StateEnable(MESH_STATE.IS_HOVER_COLORABLE);
        mesh.CreateListenEvent(LISTEN_EVENT_TYPES.HOVER);
        scene.AddMesh(mesh);
        mesh.SetColor(WHITE);
        
    }
    {
        const geom = new Geometry2D([412, 420, 0], [50, 50]);
        const mat = new Material(BLUE_10_120_220);
        const mesh = new Mesh(geom, mat);
        mesh.EnableGfxAttributes(MESH_ENABLE.GFX.ATTR_STYLE);
        mesh.StateEnable(MESH_STATE.IS_HOVER_COLORABLE);
        mesh.CreateListenEvent(LISTEN_EVENT_TYPES.HOVER);
        mesh.SetStyle([25, 15, 3]);
        scene.AddMesh(mesh);
        mesh.SetColor(ORANGE_240_130_10);
    }
}

function Create3DCubes(scene){

    { // Create cube
        {
            const geom = new CubeGeometry([80, 450, -1], [100, 100, 100], [1, 1, 1]);
            const mat = new Material_TEMP_fromBufferFor3D(WHITE)
            mat.EnableGfxAttributes(MAT_ENABLE.ATTR_VERTEX_COLOR, {
                color: [
                    0.9, 0.0, 0.0, .4,
                    0.0, 0.9, 0.1, .4,
                    0.0, 0.0, 0.9, .4,
                    0.9, 0.0, 0.9, .4
                ]
            });
            const cube = new Mesh(geom, mat);
            scene.AddMesh(cube);

            console.log('cube', GetShaderTypeId(cube.sid), cube.sid)
            cube.type |= geom.type;
            cube.type |= mat.type;
        }
        {
            const geom = new CubeGeometry([240, 450, -1], [100, 100, 100], [1, 1, 1]);
            const mat = new Material_TEMP_fromBufferFor3D(WHITE);
            mat.EnableGfxAttributes(MAT_ENABLE.ATTR_VERTEX_COLOR, {
                color: [
                    1.0, 1.0, 0.0, .4,
                    0.0, 0.7, 0.4, .4,
                    0.0, 1.0, 0.0, .4,
                    1.0, 0.0, 1.0, .4,
                ]
            });
            const cube2 = new Mesh(geom, mat);
            scene.AddMesh(cube2);
            console.log('cube2:', GetShaderTypeId(cube2.sid), cube2.sid)
            cube2.type |= geom.type;
            cube2.type |= mat.type;
        }
        {
            const geom = new CubeGeometry([400, 450, -1], [100, 100, 100], [1, 1, 1]);
            const mat = new Material_TEMP_fromBufferFor3D(WHITE);
            mat.EnableGfxAttributes(MAT_ENABLE.ATTR_VERTEX_COLOR, {
                color: [
                    0.9, 0.0, 0.0, .4,
                    0.0, 0.9, 0.1, .4,
                    0.0, 0.0, 0.9, .4,
                    0.9, 0.0, 0.9, .4
                ]
            });
            const cube3 = new Mesh(geom, mat);
            scene.AddMesh(cube3);
            console.log('cube3:', GetShaderTypeId(cube3.sid), cube3.sid)
            cube3.type |= geom.type;
            cube3.type |= mat.type;
        }
    }
}

// function MeshConstantsSetUp() {

//     STAGE.MENU.PAD = 20;
//     STAGE.MENU.WIDTH = (Viewport.width / 2) - STAGE.MENU.PAD;
//     STAGE.MENU.HEIGHT = 20 + STAGE.MENU.PAD * 2;
//     STAGE.TOP = Viewport.height / 5;

//     // Calculate left and right padd of the start and end of brick's1 grid.
//     const mod = (Viewport.width % ((BRICK.WIDTH * 2) + (BRICK.PAD * 2))) - (BRICK.PAD * 2);
//     // STAGE.PADD.LEFT  = (BRICK.WIDTH*2) + (mod / 2);
//     STAGE.PADD.LEFT = (60) + (mod / 2);
//     STAGE.PADD.RIGHT = STAGE.PADD.LEFT;

//     let keepRelativeLarger = 1;

//     PLAYER.WIDTH *= Device.ratio * keepRelativeLarger;
//     PLAYER.HEIGHT *= Device.ratio * keepRelativeLarger;

//     BALL.RADIUS *= Device.ratio * keepRelativeLarger;

//     BRICK.WIDTH *= Device.ratio * keepRelativeLarger;
//     BRICK.HEIGHT *= Device.ratio * keepRelativeLarger;

//     POW_UP.WIDTH *= Device.ratio * keepRelativeLarger;
//     POW_UP.HEIGHT *= Device.ratio * keepRelativeLarger;

//     COIN.WIDTH *= Device.ratio * keepRelativeLarger;
//     COIN.HEIGHT *= Device.ratio * keepRelativeLarger;

//     UI_TEXT.FONT_SIZE *= Device.ratio;

// }

