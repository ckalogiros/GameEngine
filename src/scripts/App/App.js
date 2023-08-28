"use strict";
import { Scenes_create_scene } from '../Engine/Scenes.js'
import { EventsAddListeners } from '../Engine/Events/Events.js';
import { RenderQueueGet, RenderQueueInit } from '../Engine/Renderers/Renderer/RenderQueue.js';
import { WebGlRenderer } from '../Engine/Renderers/WebGlRenderer.js';
import { CAMERA_CONTROLS, CameraOrthographic, CameraPerspective } from '../Engine/Renderers/Renderer/Camera.js';
import { TextureInitBuffers } from '../Engine/Loaders/Textures/Texture.js';
import { TimeGetDeltaAvg, TimeGetFps, TimeGetTimer } from '../Engine/Timers/Time.js';
import { Widget_Label_Dynamic_Text, Widget_Label_Text_Mesh } from '../Engine/Drawables/Meshes/Widgets/WidgetLabelText.js';
import { Widget_Button_Mesh, Widget_Switch_Mesh } from '../Engine/Drawables/Meshes/Widgets/WidgetButton.js';
import { Widget_Text_Mesh, Widget_Dynamic_Text_Mesh } from '../Engine/Drawables/Meshes/Widgets/WidgetText.js';
import { CubeGeometry } from '../Engine/Drawables/Geometry/Geometry3DCube.js';
import { SizeOfObject } from '../Helpers/Helpers.js';
import { PerformanceTimerCreate, PerformanceTimerInit, _Tm1GetFps, _Tm1GetMilisec, _Tm1GetNanosec, _Tm2GetFps, _Tm2GetMilisec, _Tm3GetFps, _Tm3GetMilisec, _Tm5GetFps, _Tm5GetMilisec, _Tm6GetFps, _Tm6GetMilisec } from '../Engine/Timers/PerformanceTimers.js';
import { TimeIntervalsCreate, TimeIntervalsInit } from '../Engine/Timers/TimeIntervals.js';
import { MESH_ENABLE } from '../Engine/Drawables/Meshes/Base/Mesh.js';
import { Widget_Slider, Slider_menu_create_options } from '../Engine/Drawables/Meshes/Widgets/WidgetSlider.js';

/** Performance Timers */
import { TestArraysPerformance } from '../../Tests/Arrays.js';
import { Event_Listener, Listener_create_event } from '../Engine/Events/EventListeners.js';
import { Test_Old_vs_new_hover_listener } from '../../Tests/Performane.js';
import { Widget_Menu_Bar } from '../Engine/Drawables/Meshes/Widgets/Menu/WidgetMenu.js';
import { Panel, Section } from '../Engine/Drawables/Meshes/Panel.js';
import { Initializer_popup_initialization } from '../Engine/Drawables/Meshes/Widgets/WidgetPopup.js';
import { Geometry2D } from '../Engine/Drawables/Geometry/Base/Geometry.js';
import { DEBUG_PRINT_KEYS } from '../Engine/Controls/Input/Keys.js';
import { FloorArr3 } from '../Helpers/Math/MathOperations.js';


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
    Initializer_popup_initialization()
    // MeshConstantsSetUp();

    /* * * * * * * * * * * * * * * * * * * * * * * * * * *
    * Create meshes
     */

    { // Rect with style
        // {
        //     const geom = new Geometry2D([100, 420, 0], [50, 50]);
        //     const mat = new Material(ORANGE_240_130_10);

        //     const mesh = new Mesh(geom, mat);
        //     mesh.EnableGfxAttributes(MESH_ENABLE.GFX.ATTR_STYLE);
        //     mesh.SetStyle(8, 35, 3);
        //     scene.AddMesh(mesh);
        //     mesh.CreateListenEvent(LISTEN_EVENT_TYPES.HOVER);
        // }
        // {
        //     const geom = new Geometry2D([204, 420, 0], [50, 50]);
        //     const mat = new Material(PINK_240_60_160);
        //     mat.col = PINK_240_60_160;
        //     const mesh = new Mesh(geom, mat);
        //     mesh.EnableGfxAttributes(MESH_ENABLE.ATTR_STYLE);
        //     mesh.SetStyle(20, 35, 3);
        //     scene.AddMesh(mesh);
        //     mesh.CreateListenEvent(LISTEN_EVENT_TYPES.HOVER);
        // }
        // {
        //     const geom = new Geometry2D([308, 420, 0], [50, 50]);
        //     const mat = new Material(ORANGE_240_130_10);
        //     const mesh = new Mesh(geom, mat);
        //     mesh.EnableGfxAttributes(MESH_ENABLE.ATTR_STYLE);
        //     mesh.SetStyle(10, 15, 3);
        //     scene.AddMesh(mesh);
        //     mesh.SetColor(WHITE);

        // }
        // {
        //     const geom = new Geometry2D([412, 420, 0], [50, 50]);
        //     const mat = new Material(ORANGE_240_130_10);
        //     const mesh = new Mesh(geom, mat);
        //     mesh.EnableGfxAttributes(MESH_ENABLE.ATTR_STYLE);
        //     mesh.SetStyle(25, 15, 3);
        //     scene.AddMesh(mesh);
        //     mesh.SetColor(BLUE_10_120_220);
        // }
    }

    { // Text Label
        let ypos = 150, id = 1;
        const fontSize = 12;

        { // Many text labels 
            // {
            //     const textLabel = new Widget_Label_Text_Mesh('Text Label '+id, [60, ypos, 0], fontSize, BLUE_10_120_220, WHITE, [1, 1], [3, 3], .4);
            //     textLabel.StateEnable(MESH_STATE.IS_MOVABLE);
            //     textLabel.StateEnable(MESH_STATE.IS_GRABABLE);
            //     // textLabel.StateEnable(MESH_STATE.HAS_POPUP);
            //     textLabel.StateEnable(MESH_STATE.IS_HOVER_COLORABLE)
            //     // textLabel.CreateListenEvent(LISTEN_EVENT_TYPES.HOVER);
            //     Listener_hover_enable(textLabel)

            //     scene.AddMesh(textLabel);

            //     RenderQueueGet().SetPriority('last', textLabel.children.buffer[0].gfx.prog.idx, textLabel.gfx.vb.idx);
            // } 
            // ypos += 55; id++;
            // {
            //     const textLabel = new Widget_Label_Text_Mesh('Text Label '+id, [60, ypos, 0], fontSize, BLUE_10_120_220, WHITE, [1, 1], [3, 3], .4);
            //     textLabel.StateEnable(MESH_STATE.IS_MOVABLE);
            //     textLabel.StateEnable(MESH_STATE.IS_GRABABLE);
            //     textLabel.StateEnable(MESH_STATE.HAS_POPUP);
            //     textLabel.StateEnable(MESH_STATE.IS_HOVER_COLORABLE)
            //     textLabel.CreateListenEvent(LISTEN_EVENT_TYPES.HOVER);
            //     // textLabel.SetMenuOptionsClbk(Slider_menu_create_options);
            //     scene.AddMesh(textLabel);
            //     Listener_hover_enable(textLabel)
            //     RenderQueueGet().SetPriority('last', textLabel.children.buffer[0].gfx.prog.idx, textLabel.gfx.vb.idx);
            // } 

        }
    }

    { // Create cube
        // {
        //     const geom = new CubeGeometry([80, 450, -1], [100, 100, 100], [1, 1, 1]);
        //     const mat = new Material_TEMP_fromBufferFor3D(WHITE)
        //     mat.EnableGfxAttributes(MAT_ENABLE.ATTR_VERTEX_COLOR, {
        //         color: [
        //             0.9, 0.0, 0.0, .4,
        //             0.0, 0.9, 0.1, .4,
        //             0.0, 0.0, 0.9, .4,
        //             0.9, 0.0, 0.9, .4
        //         ]
        //     });
        //     const cube = new Mesh(geom, mat);
        //     scene.AddMesh(cube);

        //     console.log('cube', GetShaderTypeId(cube.sid), cube.sid)
        //     cube.type |= geom.type;
        //     cube.type |= mat.type;
        // }
        // {
        //     const geom = new CubeGeometry([240, 450, -1], [100, 100, 100], [1, 1, 1]);
        //     const mat = new Material_TEMP_fromBufferFor3D(WHITE);
        //     mat.EnableGfxAttributes(MAT_ENABLE.ATTR_VERTEX_COLOR, {
        //         color: [
        //             1.0, 1.0, 0.0, .4,
        //             0.0, 0.7, 0.4, .4,
        //             0.0, 1.0, 0.0, .4,
        //             1.0, 0.0, 1.0, .4,
        //         ]
        //     });
        //     const cube2 = new Mesh(geom, mat);
        //     scene.AddMesh(cube2);
        //     console.log('cube2:', GetShaderTypeId(cube2.sid), cube2.sid)
        //     cube2.type |= geom.type;
        //     cube2.type |= mat.type;
        // }
        // {
        //     const geom = new CubeGeometry([400, 450, -1], [100, 100, 100], [1, 1, 1]);
        //     const mat = new Material_TEMP_fromBufferFor3D(WHITE);
        //     mat.EnableGfxAttributes(MAT_ENABLE.ATTR_VERTEX_COLOR, {
        //         color: [
        //             0.9, 0.0, 0.0, .4,
        //             0.0, 0.9, 0.1, .4,
        //             0.0, 0.0, 0.9, .4,
        //             0.9, 0.0, 0.9, .4
        //         ]
        //     });
        //     const cube3 = new Mesh(geom, mat);
        //     scene.AddMesh(cube3);
        //     console.log('cube3:', GetShaderTypeId(cube3.sid), cube3.sid)
        //     cube3.type |= geom.type;
        //     cube3.type |= mat.type;
        // }
    }


    CreateUiTimers(scene)
    CreateButtons(scene)
    // CreateSwitches(scene)
    BindSliderToTextLabel(scene)
    // CreateMenuBar(scene)


    // CreateGenericWidget(scene)

    Help(scene)
    CreateSection(scene)

    const section = MeshInfo(scene)
    TimeIntervalsCreate(10, 'Mesh info tip', TIME_INTERVAL_REPEAT_ALWAYS, MeshInfoUpdate, { mesh: section });


    // Test_Old_vs_new_hover_listener(scene)
    // TestArraysPerformance();

    tm.Stop();

    // If camera is static, update projection matrix uniform only once
    camera.UpdateProjectionUniform(renderer.gl);

    // RenderQueueGet().SetPriority('first', 0, 0);
    RenderQueueGet().SetPriority('last', 1, 0);

    RenderQueueGet().UpdateActiveQueue(); // Update active queue buffer with the vertex buffers set to be drawn



    { // 
        var performance = window.performance || window.mozPerformance || window.msPerformance || window.webkitPerformance || {};
        console.log(performance)
        const mem = window.performance.memory;
        console.error(mem)
    
        console.error(mem)
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
}

export function AppRender() {
    requestAnimationFrame(AppRender);
    renderer.Render();
}


function CreateSwitches(scene) {

    const switch1 = new Widget_Switch_Mesh([400, 200, 0]);
    scene.AddMesh(switch1)

    const btn1 = new Widget_Button_Mesh('x', [400, 150, 0], 6, GREY1, WHITE, [1, 1], [8, 4], .8, undefined, [1, 4, 2]);
    btn1.CreateListenEvent(LISTEN_EVENT_TYPES.HOVER);
    btn1.StateEnable(MESH_STATE.IS_HOVER_COLORABLE)
    scene.AddMesh(btn1);

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
    idx = timer.CreateNewText('00000', fontsize, undefined, YELLOW_240_220_10, [0,0], .9); // idx is for use in creating separate time intervals for each dynamic text.
    timer.SetDynamicText(ms, TimeGetDeltaAvg, `DynamicText ${ms} Timer TimeGetDeltaAvg`)
    timer.CreateNewText('nano:', fontsize, undefined, GREEN_140_240_10, [fontsize * 4, 0], .9);
    idx = timer.CreateNewText('000000', fontsize, undefined, YELLOW_240_220_10, [0,0], .5);
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
    const timer = new Widget_Dynamic_Text_Mesh('Fps Avg:', '000000', [0, ypos, 0], fontsize, [1, 1], GREEN_140_240_10, YELLOW_240_220_10, .5);
    timer.SetDynamicText(ms, TimeGetFps, `DynamicText ${ms} Timer TimeGetFps`)
    timer.CreateNewText('delta:', fontsize, undefined, GREEN_140_240_10, [fontsize * 3,0], .9);
    idx = timer.CreateNewText('00000', fontsize, undefined, YELLOW_240_220_10, [0,0], .9); // idx is for use in creating separate time intervals for each dynamic text.
    timer.SetDynamicText(ms, TimeGetDeltaAvg, `DynamicText ${ms} Timer TimeGetDeltaAvg`)
    timer.CreateNewText('nano:', fontsize, undefined, GREEN_140_240_10, [fontsize * 4, 0], .9);
    idx = timer.CreateNewText('000000', fontsize, undefined, YELLOW_240_220_10, [0,0], .5);
    timer.SetDynamicText(ms, TimeGetTimer, `DynamicText ${ms} Timer TimeGetTimer`)
    scene.AddMesh(timer, GL_VB.NEW);
    pt.Stop(); pt.Print();

    // Performance Time Measure 1
    ms = 500; ypos += fontsize * 2 + pad;
    const timeMeasure1 = new Widget_Dynamic_Text_Mesh('All Timers Update:', '000000', [0, ypos, 0], fontsize, [1, 1], GREEN_140_240_10, YELLOW_240_220_10, .4);
    timeMeasure1.SetDynamicText(ms, _Tm1GetFps, `DynamicText ${ms} All Timers Update _Tm1GetFps`)
    timeMeasure1.CreateNewText('ms:', fontsize, undefined, GREEN_140_240_10, [fontsize * 3, 0], .9);
    idx = timeMeasure1.CreateNewText('00000', fontsize, null, YELLOW_240_220_10, [0,0], .4);
    timeMeasure1.SetDynamicText(ms, _Tm1GetMilisec, `DynamicText ${ms} All Timers Update _Tm1GetMilisec`)
    scene.AddMesh(timeMeasure1);

    // Performance Time Measure 3
    ms = 500; ypos += fontsize * 2 + pad;
    const timeMeasure2 = new Widget_Dynamic_Text_Mesh('GlDraw:', '000000', [0, ypos, 0], fontsize, [1, 1], GREEN_140_240_10, YELLOW_240_220_10, .4);
    timeMeasure2.SetDynamicText(ms, _Tm3GetFps, `DynamicText ${ms} GlDraw _Tm3GetFps`)
    timeMeasure2.CreateNewText('ms:', fontsize, undefined, GREEN_140_240_10, [fontsize * 3,0], .9);
    idx = timeMeasure2.CreateNewText('00000', fontsize, null, YELLOW_240_220_10, [0,0], .4);
    timeMeasure2.SetDynamicText(ms, _Tm3GetMilisec, `DynamicText ${ms} GlDraw _Tm3GetMilisec`)
    scene.AddMesh(timeMeasure2);

    // Performance Time Measure 2
    ms = 500; ypos += fontsize * 2 + pad;
    const timeMeasure3 = new Widget_Dynamic_Text_Mesh('Scene Update:', '000000', [0, ypos, 0], fontsize, [1, 1], GREEN_140_240_10, YELLOW_240_220_10, .4);
    timeMeasure3.SetDynamicText(ms, _Tm2GetFps, `DynamicText ${ms} Scene Update _Tm2GetFps`)
    timeMeasure3.CreateNewText('ms:', fontsize, undefined, GREEN_140_240_10, [fontsize * 3, 0], .9);
    idx = timeMeasure3.CreateNewText('000000', fontsize, null, YELLOW_240_220_10, [0,0], .4);
    timeMeasure3.SetDynamicText(ms, _Tm2GetMilisec, `DynamicText ${ms} Scene Update _Tm2GetMilisec`)
    scene.AddMesh(timeMeasure3);

    // Performance Time Measure 2
    ms = 500; ypos += fontsize * 2 + pad;
    const timeMeasure5 = new Widget_Dynamic_Text_Mesh('New hover listen:', '000000', [0, ypos, 0], fontsize, [1, 1], GREEN_140_240_10, YELLOW_240_220_10, .4);
    timeMeasure5.SetDynamicText(ms, _Tm6GetFps, `DynamicText ${ms} Scene Update _Tm6GetFps`)
    timeMeasure5.CreateNewText('ms:', fontsize, undefined, GREEN_140_240_10, [fontsize * 3, 0], .9);
    idx = timeMeasure5.CreateNewText('000000', fontsize, null, YELLOW_240_220_10, [0,0], .4);
    timeMeasure5.SetDynamicText(ms, _Tm6GetMilisec, `DynamicText ${ms} Scene Update _Tm6GetMilisec`)
    scene.AddMesh(timeMeasure5);
}

function BindSliderToTextLabel(scene) {

    // Slider
    let posy = 80, height = 14, pad = 25;
    posy += height * 2 + pad;
    const slider = new Widget_Slider([200, posy, 0], [150, height], BLUE_10_160_220);
    scene.AddMesh(slider);
    slider.SetMenuOptionsClbk(Slider_menu_create_options);
    // slider.CreateListenEvent(LISTEN_EVENT_TYPES.HOVER)
    console.log(slider.gfx.meshIdx)

    posy += height * 2 + pad;
    const slider2 = new Widget_Slider([200, posy, 0], [150, height], BLUE_10_160_220);
    scene.AddMesh(slider2);
    slider2.SetMenuOptionsClbk(Slider_menu_create_options);
}

function CreateButtons(scene) {

    let posy = Viewport.bottom - 50, fontSize = 10;

    const btn1 = new Widget_Button_Mesh('BUTTON 1', [40, posy, 0], 10, GREY5, WHITE, [1, 1], [5, 3], .3);
    btn1.CreateListenEvent(LISTEN_EVENT_TYPES.CLICK_DOWN, btn1.OnClick, btn1, null)
    btn1.CreateListenEvent(LISTEN_EVENT_TYPES.HOVER)
    btn1.StateEnable(MESH_STATE.IS_HOVER_COLORABLE)
    btn1.EnableGfxAttributes(MESH_ENABLE.GFX.ATTR_STYLE, {style:[2, 20, 1]})
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

    const red = new Section(SECTION.VERTICAL, [15, 15], [100, 100, 0], [20, 20], TRANSPARENCY(RED, .2));
    const gre = new Section(SECTION.HORIZONTAL, [5, 5], [100, 100, 0], [20, 20], TRANSPARENCY(GREEN, .4));
    const yel = new Section(SECTION.HORIZONTAL, [5, 5], [200, 400, 0], [20, 20], TRANSPARENCY(YELLOW, .4));
    const ora = new Section(SECTION.HORIZONTAL, [8, 8], [200, 400, 0], [20, 20], TRANSPARENCY(ORANGE, .4));
    const cie = new Section(SECTION.HORIZONTAL, [5, 5], [200, 400, 0], [20, 20], TRANSPARENCY(BLUE_LIGHT, .4));
    const bla = new Section(SECTION.VERTICAL, [15, 15], [200, 400, 0], [20, 20], TRANSPARENCY(BLACK, .4));

    {
        var bla_1 = new Section(SECTION.HORIZONTAL, [10, 10], [200, 400, 0], [20, 20], TRANSPARENCY(BLACK, .4));
        var pin_1 = new Section(SECTION.VERTICAL, [4, 1], [100, 100, 0], [20, 20], TRANSPARENCY(PINK_240_60_160, .6));
        var blu_1 = new Section(SECTION.VERTICAL, [4, 1], [100, 100, 0], [20, 20], TRANSPARENCY(BLUE, .6));
        var pur_1 = new Section(SECTION.VERTICAL, [4, 1], [100, 100, 0], [20, 20], TRANSPARENCY(PURPLE, .6));
        var red_1 = new Section(SECTION.VERTICAL, [4, 1], [100, 100, 0], [20, 20], TRANSPARENCY(RED, .7));
        var yel_1 = new Section(SECTION.VERTICAL, [4, 1], [100, 100, 0], [20, 20], TRANSPARENCY(YELLOW, .7));
        var gre_1 = new Section(SECTION.VERTICAL, [4, 1], [100, 100, 0], [20, 20], TRANSPARENCY(GREEN, .7));
        var ora_1 = new Section(SECTION.VERTICAL, [4, 1], [100, 100, 0], [20, 20], TRANSPARENCY(ORANGE, .7));
        var red_2 = new Section(SECTION.VERTICAL, [4, 5], [100, 100, 0], [20, 20], TRANSPARENCY(RED, .7));
        var gre_2 = new Section(SECTION.VERTICAL, [4, 1], [100, 100, 0], [20, 20], TRANSPARENCY(GREEN, .7));
        var ora_2 = new Section(SECTION.VERTICAL, [4, 1], [100, 100, 0], [20, 20], TRANSPARENCY(ORANGE, .7));
        var yel_2 = new Section(SECTION.VERTICAL, [4, 1], [100, 100, 0], [20, 20], TRANSPARENCY(YELLOW, .7));
        var red_3 = new Section(SECTION.VERTICAL, [4, 1], [100, 100, 0], [20, 20], TRANSPARENCY(RED, .7));
        var yel_3 = new Section(SECTION.VERTICAL, [4, 1], [100, 100, 0], [20, 20], TRANSPARENCY(YELLOW, .7));
        var gre_3 = new Section(SECTION.VERTICAL, [4, 1], [100, 100, 0], [20, 20], TRANSPARENCY(GREEN, .7));
        var ora_3 = new Section(SECTION.VERTICAL, [4, 1], [100, 100, 0], [20, 20], TRANSPARENCY(ORANGE, .7));
        var red_4 = new Section(SECTION.VERTICAL, [4, 1], [100, 100, 0], [20, 20], TRANSPARENCY(RED, .7));
        var yel_4 = new Section(SECTION.VERTICAL, [4, 1], [100, 100, 0], [20, 20], TRANSPARENCY(YELLOW, .7));
        var gre_4 = new Section(SECTION.VERTICAL, [4, 1], [100, 100, 0], [20, 20], TRANSPARENCY(GREEN, .7));
        var ora_4 = new Section(SECTION.VERTICAL, [4, 1], [100, 100, 0], [20, 20], TRANSPARENCY(ORANGE, .7));
        var gry1_1 = new Section(SECTION.VERTICAL, [4, 1], [100, 100, 0], [20, 20], TRANSPARENCY(GREY3, .9));
        var gry1_2 = new Section(SECTION.VERTICAL, [4, 1], [100, 100, 0], [20, 20], TRANSPARENCY(GREY5, .9));
        var gry1_3 = new Section(SECTION.VERTICAL, [4, 1], [100, 100, 0], [20, 20], TRANSPARENCY(GREY7, .9));
        var gry2_1 = new Section(SECTION.VERTICAL, [4, 1], [100, 100, 0], [20, 20], TRANSPARENCY(GREY3, .9));
        var gry2_2 = new Section(SECTION.VERTICAL, [4, 1], [100, 100, 0], [20, 20], TRANSPARENCY(GREY5, .9));
        var gry2_3 = new Section(SECTION.VERTICAL, [4, 1], [100, 100, 0], [20, 20], TRANSPARENCY(GREY7, .9));
        var vert_0 = new Section(SECTION.VERTICAL, [20, 20], [100, 100, 0], [20, 20], TRANSPARENCY(GREY2, .4));

    }
    const btn = new Widget_Button_Mesh('btn1', [200, 100, 0], 7, TRANSPARENCY(YELLOW, .9), WHITE, [1, 1], [2, 2], .5);
    btn.CreateListenEvent(LISTEN_EVENT_TYPES.CLICK_DOWN, btn.OnClick, btn)
    btn.CreateListenEvent(LISTEN_EVENT_TYPES.HOVER)

    blu.CreateListenEvent(LISTEN_EVENT_TYPES.MOVE, blu.OnClick, blu, null);

    {

        red.SetName('red');
        gre.SetName('gre');
        yel.SetName('yel');
        ora.SetName('ora');
        cie.SetName('cie');
        bla.SetName('bla');
        bla_1.SetName('bla_1');
        pin_1.SetName('pin_1');
        blu_1.SetName('blu_1');
        pur_1.SetName('pur_1');
        red_1.SetName('red_1');
        yel_1.SetName('yel_1');
        gre_1.SetName('gre_1');
        ora_1.SetName('ora_1');
        red_2.SetName('red_2');
        gre_2.SetName('gre_2');
        ora_2.SetName('ora_2');
        yel_2.SetName('yel_2');
        red_3.SetName('red_3');
        yel_3.SetName('yel_3');
        gre_3.SetName('gre_3');
        ora_3.SetName('ora_3');
        red_4.SetName('red_4');
        yel_4.SetName('yel_4');
        gre_4.SetName('gre_4');
        ora_4.SetName('ora_4');
        gry1_1.SetName('gry1_1');
        gry1_2.SetName('gry1_2');
        gry1_3.SetName('gry1_3');
        gry2_1.SetName('gry2_1');
        gry2_2.SetName('gry2_2');
        gry2_3.SetName('gry2_3');
        vert_0.SetName('vert_0');

    }

    {
        red.AddItem(pin_1, flags);
        red.AddItem(blu_1, flags);
        red.AddItem(yel, flags);
        red.AddItem(ora, flags);
        red.AddItem(cie, flags);

        yel.AddItem(gre_4, flags);
        yel.AddItem(pur_1, flags);
        yel.AddItem(red_3, flags);

        ora.AddItem(yel_4, flags);
        ora.AddItem(red_4, flags);
        ora.AddItem(yel_2, flags);
        ora.AddItem(ora_4, flags);

        cie.AddItem(gre_3, flags);
        cie.AddItem(yel_3, flags);
        cie.AddItem(bla, flags);
        red.AddItem(btn, flags);

        bla.AddItem(gry1_1, flags)
        bla.AddItem(gry1_2, flags)
        bla.AddItem(gry1_3, flags)

        gre.AddItem(yel_1, flags);
        gre.AddItem(red_1, flags);
    }

    blu.AddItem(red, flags);

    blu.Calc();
    scene.AddMesh(blu);
    blu.UpdateGfx(blu, scene.sceneIdx);
    // blu.UpdateGfxRecursive(blu, scene.sceneIdx);

}


function Help(scene) {


    const flags = (SECTION.ITEM_FIT);

    const section = new Section(SECTION.HORIZONTAL, [10, 10], [550, 600, 0], [0, 0], TRANSPARENCY(GREY1, .2));
    section.CreateListenEvent(LISTEN_EVENT_TYPES.MOVE, section.OnClick, section, null);
    const s1 = new Section(SECTION.VERTICAL, [15, 10], [220, 400, 0], [0, 0], TRANSPARENCY(GREY1, .2));

    let msgs = [];
    for (let i = 0; i < DEBUG_PRINT_KEYS.length; i++) {

        msgs[i] = '\"' + DEBUG_PRINT_KEYS[i].key + '\": ' + DEBUG_PRINT_KEYS[i].discr
        const label = new Widget_Label_Text_Mesh(msgs[i], [400, 300, 0], 4, TRANSPARENCY(ORANGE_240_130_10, .7), WHITE, [1, 1], [7, 6], .5, undefined, [0, 4, 3])
        scene.AddMesh(label);
        s1.AddItem(label)
    }

    section.AddItem(s1, flags)

    section.Calc(flags)

    scene.AddMesh(section);

    section.UpdateGfx(section, scene.sceneIdx);
}

function MeshInfo(scene) {

    const fontsize = 5;
    
    for (let i = 0; i < 1; i++) {
            
        const infomesh = new Widget_Dynamic_Text_Mesh('Mesh:', 'id:00', [100, 400, 0], fontsize, [1, 1], GREEN_140_240_10, YELLOW_240_220_10, .4);
        infomesh.CreateNewText('pos: 000,000,0', fontsize, undefined, GREEN_140_240_10, [fontsize * 3, 0], .9);
        infomesh.CreateNewText('dim: 000,000', fontsize, undefined, GREEN_140_240_10, [fontsize * 3, 0], .9);
        infomesh.CreateNewText('gfx: prog:0, vb:0', fontsize, undefined, GREEN_140_240_10, [fontsize * 3, 0], .9);
        
        infomesh.Align(ALIGN.VERTICAL)
        scene.AddMesh(infomesh);
        infomesh.CreateListenEvent(LISTEN_EVENT_TYPES.MOVE, infomesh.OnClick, infomesh, null);

        return infomesh;
    }
}
function MeshInfoUpdate(params) {

    const textMesh = params.params.mesh;
    const infoMesh = STATE.mesh.hovered;

    if (infoMesh)  {
        
        const children = infoMesh.children.buffer[0];

        if(children){

            let msgs = [
                `id:${children.id}`,
                `pos:${FloorArr3(children.geom.pos)}`,
                `dim:${children.geom.dim}`,
                `gfx: prog:${children.gfx.prog.idx}, vb:${children.gfx.prog.idx}`
            ];

            for (let i = 0; i < textMesh.children.active_count; i++) {
            
                const childText = textMesh.children.buffer[i];
                childText.UpdateTextFromVal(msgs[i])
            }
        }

        // if (!infoMesh) {
        //     // textMesh.UpdateTextFromVal(0);
        //     return;
        // }
    
        // let msgs = [
        //     `id:${infoMesh.id}`,
        //     `pos:${FloorArr3(infoMesh.geom.pos)}`,
        //     `dim:${infoMesh.geom.dim}`
        // ];
    
        // for (let i = 0; i < textMesh.children.active_count; i++) {
            
        //     const childText = textMesh.children.buffer[i];
        //     childText.UpdateTextFromVal(msgs[i])
        // }
    }


}

function Menu_labels_switches(scene) {

    const flags = (SECTION.ITEM_FIT);

    const section = new Section(SECTION.HORIZONTAL, [10, 10], [120, 300, 0], [0, 0], TRANSPARENCY(GREY1, .2));
    const s1 = new Section(SECTION.VERTICAL, [15, 2], [220, 400, 0], [0, 0], TRANSPARENCY(GREY1, .2));
    const s2 = new Section(SECTION.VERTICAL, [7, 2], [220, 400, 0], [0, 0], TRANSPARENCY(GREY1, .3));

    // const label1 = new Widget_Label_Text_Mesh('options 1', [400, 700, 0], 4, TRANSPARENT, WHITE, [1,1], [7,6], .5, undefined, [0,4,1])
    const label1 = new Widget_Label_Text_Mesh('options 1', [400, 300, 0], 4, TRANSPARENCY(GREY1, .0), WHITE, [1, 1], [7, 6], .5, undefined, [0, 4, 1])
    const label2 = new Widget_Label_Text_Mesh('options 2', [400, 700, 0], 4, TRANSPARENCY(GREY1, .0), WHITE, [1, 1], [7, 6], .5, undefined, [0, 4, 1])
    const label3 = new Widget_Label_Text_Mesh('options 3', [400, 700, 0], 4, TRANSPARENCY(GREY1, .0), WHITE, [1, 1], [7, 6], .5, undefined, [0, 4, 1])
    const label4 = new Widget_Label_Text_Mesh('options 4', [400, 700, 0], 4, TRANSPARENCY(GREY1, .0), WHITE, [1, 1], [7, 6], .5, undefined, [0, 4, 1])

    const switch1 = new Widget_Switch_Mesh([400, 700, 0], 4, TRANSPARENCY(GREY1, .0), WHITE, [1, 1], [4, 6], .5, undefined, [2, 8, 1]);
    const switch2 = new Widget_Switch_Mesh([400, 700, 0], 4, TRANSPARENCY(GREY1, .0), WHITE, [1, 1], [4, 6], .5, undefined, [2, 8, 1]);
    const switch3 = new Widget_Switch_Mesh([400, 700, 0], 4, TRANSPARENCY(GREY1, .0), WHITE, [1, 1], [4, 6], .5, undefined, [2, 8, 1]);
    const switch4 = new Widget_Switch_Mesh([400, 700, 0], 4, TRANSPARENCY(BLUE_10_120_220, .2), WHITE, [1, 1], [4, 6], .5, undefined, [2, 4, 1]);

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

function MeshConstantsSetUp() {

    STAGE.MENU.PAD = 20;
    STAGE.MENU.WIDTH = (Viewport.width / 2) - STAGE.MENU.PAD;
    STAGE.MENU.HEIGHT = 20 + STAGE.MENU.PAD * 2;
    STAGE.TOP = Viewport.height / 5;

    // Calculate left and right padd of the start and end of brick's1 grid.
    const mod = (Viewport.width % ((BRICK.WIDTH * 2) + (BRICK.PAD * 2))) - (BRICK.PAD * 2);
    // STAGE.PADD.LEFT  = (BRICK.WIDTH*2) + (mod / 2);
    STAGE.PADD.LEFT = (60) + (mod / 2);
    STAGE.PADD.RIGHT = STAGE.PADD.LEFT;

    let keepRelativeLarger = 1;

    PLAYER.WIDTH *= Device.ratio * keepRelativeLarger;
    PLAYER.HEIGHT *= Device.ratio * keepRelativeLarger;

    BALL.RADIUS *= Device.ratio * keepRelativeLarger;

    BRICK.WIDTH *= Device.ratio * keepRelativeLarger;
    BRICK.HEIGHT *= Device.ratio * keepRelativeLarger;

    POW_UP.WIDTH *= Device.ratio * keepRelativeLarger;
    POW_UP.HEIGHT *= Device.ratio * keepRelativeLarger;

    COIN.WIDTH *= Device.ratio * keepRelativeLarger;
    COIN.HEIGHT *= Device.ratio * keepRelativeLarger;

    UI_TEXT.FONT_SIZE *= Device.ratio;

}

// function AppInitReservedGlBuffers() {
//     // PowerUpInit(SCENE.stage);
//     // CoinInit(SCENE.stage);
// }

// function AddCssUiListeners() {
//     const SdfInnerDistSlider = document.getElementById("sdf-param1");
//     const SdfInnerDistOut = document.getElementById("sdf-param1-val");
//     SdfInnerDistOut.innerHTML = SdfInnerDistSlider.value;

//     /**
//      * Below are the event listeners for every time a slider ui is changed,
//      * we make a call to update the uniform values of the gl program
//      */

//     // Set Uniforms buffer params
//     const prog = GlGetProgram(UNIFORM_PARAMS.sdf.progIdx);
//     prog.UniformsSetBufferUniform(InterpolateToRange(SdfInnerDistSlider.value, 100, 1), UNIFORM_PARAMS.sdf.innerIdx);

//     // On event
//     SdfInnerDistSlider.oninput = function () {
//         SdfInnerDistOut.innerHTML = this.value;
//         prog.UniformsSetBufferUniform(InterpolateToRange(SdfInnerDistSlider.value, 100, 1), UNIFORM_PARAMS.sdf.innerIdx);
//     }

//     const SdfOuterDistSlider = document.getElementById("sdf-param2");
//     const SdfOuterDistOut = document.getElementById("sdf-param2-val");
//     SdfOuterDistOut.innerHTML = SdfOuterDistSlider.value;

//     prog.UniformsSetBufferUniform(InterpolateToRange(SdfOuterDistSlider.value, 100, 1), UNIFORM_PARAMS.sdf.outerIdx);

//     SdfOuterDistSlider.oninput = function () {
//         SdfOuterDistOut.innerHTML = this.value;
//         prog.UniformsSetBufferUniform(InterpolateToRange(SdfOuterDistSlider.value, 100, 1), UNIFORM_PARAMS.sdf.outerIdx);
//     }

//     /**
//      * Below we set the listeners for attributs that have to change through
//      * ui sliders(like the roundnes, bborder, etc). We update directly the
//      * vertex buffer values, so there is no need for uniform buffer update .
//      */
//     const roundRatio = 0.5;
//     const borderRatio = 0.15;
//     const featherRatio = 0.2;

//     // Button's1 Sliders
//     const buttonRoundCornerSlider = document.getElementById('button-round-corner');
//     const buttonRoundCornerOut = document.getElementById("button-round-corner-val");
//     buttonRoundCornerOut.innerHTML = buttonRoundCornerSlider.value;
//     buttonRoundCornerSlider.oninput = function () {
//         buttonRoundCornerOut.innerHTML = this.value;
//         ButtonSetRoundCorner(Number(this.value));
//     }

//     const buttonBorderWidthSlider = document.getElementById('button-border-width');
//     const buttonBorderWidthOut = document.getElementById("button-border-width-val");
//     buttonBorderWidthOut.innerHTML = buttonRoundCornerSlider.value;
//     buttonBorderWidthSlider.oninput = function () {
//         buttonBorderWidthOut.innerHTML = this.value;
//         ButtonSetBorderWidth(Number(this.value));
//     }

//     const buttonBorderFeatherSlider = document.getElementById('button-border-feather');
//     const buttonBorderFeatherOut = document.getElementById("button-border-feather-val");
//     buttonBorderFeatherOut.innerHTML = buttonRoundCornerSlider.value;
//     buttonBorderFeatherSlider.oninput = function () {
//         buttonBorderFeatherOut.innerHTML = this.value;
//         ButtonSetBorderFeather(Number(this.value))
//     }


//     // Brick's1 Sliders
//     const brickRoundCornerSlider = document.getElementById('brick-round-corner');
//     const brickRoundCornerOut = document.getElementById("brick-round-corner-val");
//     brickRoundCornerOut.innerHTML = brickRoundCornerSlider.value;
//     brickRoundCornerSlider.oninput = function () {
//         brickRoundCornerOut.innerHTML = this.value;
//         BrickSetRoundCorner(Number(this.value) * roundRatio);
//     }

//     const brickBorderWidthSlider = document.getElementById('brick-border-width');
//     const brickBorderWidthOut = document.getElementById("brick-border-width-val");
//     brickBorderWidthOut.innerHTML = brickRoundCornerSlider.value;
//     brickBorderWidthSlider.oninput = function () {
//         brickBorderWidthOut.innerHTML = this.value;
//         BrickSetBorderWidth(Number(this.value) * borderRatio);
//     }

//     const brickBorderFeatherSlider = document.getElementById('brick-border-feather');
//     const brickBorderFeatherOut = document.getElementById("brick-border-feather-val");
//     brickBorderFeatherOut.innerHTML = brickRoundCornerSlider.value;
//     brickBorderFeatherSlider.oninput = function () {
//         brickBorderFeatherOut.innerHTML = this.value;
//         BrickSetBorderFeather(Number(this.value) * featherRatio);
//     }

// }


/**

 */