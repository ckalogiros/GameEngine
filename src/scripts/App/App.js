"use strict";
import { Scenes_create_scene, Scenes_debug_info_create } from '../Engine/Scenes.js'
import { Renderqueue_get, Renderqueue_init } from '../Engine/Renderers/Renderer/RenderQueue.js';
import { WebGlRenderer } from '../Engine/Renderers/WebGlRenderer.js';
import { CameraOrthographic } from '../Engine/Renderers/Renderer/Camera.js';
import { TextureInitBuffers } from '../Engine/Loaders/Textures/Texture.js';
import { PerformanceTimerGetFps1sAvg, TimeGetDeltaAvg, TimeGetFps, TimeGetTimer, _fps_100ms_avg, _fps_1s_avg, _fps_200ms_avg, _fps_500ms_avg } from '../Engine/Timers/Time.js';
import { Widget_Label_Dynamic_Text, Widget_Label, Widget_Label_Text_Mesh_Menu_Options } from '../Engine/Drawables/Meshes/Widgets/WidgetLabel.js';
import { Widget_Button, Widget_Switch } from '../Engine/Drawables/Meshes/Widgets/WidgetButton.js';
import { Widget_Text, Widget_Dynamic_Text_Mesh } from '../Engine/Drawables/Meshes/Widgets/WidgetText.js';
import { CubeGeometry } from '../Engine/Drawables/Geometry/Geometry3DCube.js';
// import { PerformanceTimerCreate, PerformanceTimerInit, PerformanceTimersGetFps, PerformanceTimersGetMilisec, _Tm1GetFps, _Tm1GetMilisec, _Tm1GetNanosec, _Tm2GetFps, _Tm2GetMilisec, _Tm3GetFps, _Tm3GetMilisec, _Tm5GetFps, _Tm5GetMilisec, _Tm6GetFps, _Tm6GetMilisec } from '../Engine/Timers/PerformanceTimers.js';
import { PerformanceTimerCreate, PerformanceTimerInit, PerformanceTimersGetCurTime, PerformanceTimersGetFps, PerformanceTimersGetMilisec } from '../Engine/Timers/PerformanceTimers.js';
import { TimeIntervalsCreate, TimeIntervalsInit } from '../Engine/Timers/TimeIntervals.js';
import { MESH_ENABLE, Mesh } from '../Engine/Drawables/Meshes/Base/Mesh.js';
import { Widget_Slider } from '../Engine/Drawables/Meshes/Widgets/WidgetSlider.js';
import { Widget_Menu_Bar, Widget_Minimize } from '../Engine/Drawables/Meshes/Widgets/Menu/WidgetMenu.js';
import { Geometry2D } from '../Engine/Drawables/Geometry/Base/Geometry.js';
import { FloorArr3 } from '../Helpers/Math/MathOperations.js';
import { MAT_ENABLE, Material, Material_TEMP_fromBufferFor3D } from '../Engine/Drawables/Material/Base/Material.js';
import { Gfx_end_session } from '../Engine/Interfaces/Gfx/GfxContext.js';
import { Section } from '../Engine/Drawables/Meshes/Section.js';
import { Initializer_popup_initialization } from '../Engine/Drawables/Meshes/Widgets/WidgetPopup.js';


/** Performance Timers */
import { _pt_fps, _pt2, _pt3, _pt4, _pt5, _pt6 } from '../Engine/Timers/PerformanceTimers.js';

import { DEBUG_PRINT_KEYS } from '../Engine/Controls/Input/Keys.js';
import { GetShaderTypeId } from '../Graphics/Z_Debug/GfxDebug.js';
import { MouseGetArea, MouseGetPos, MouseGetPosDif } from '../Engine/Controls/Input/Mouse.js';

// import { Buffer } from 'buffer';
// import { Buffer } from 'buffer';
import { Debug_get_event_listeners, Listeners_debug_info_create, Listeners_get_event } from '../Engine/Events/EventListeners.js';
import { Drop_down_set_root, Widget_Dropdown } from '../Engine/Drawables/Meshes/Widgets/Menu/Widget_Dropdown.js';
import { Info_listener_create_event, Info_listener_dispatch_event } from '../Engine/Drawables/DebugInfo/InfoListeners.js';
import { Gl_progs_get } from '../Graphics/GlProgram.js';
import { Input_create_user_input_listeners } from '../Engine/Controls/Input/Input.js';
import { Debug_info_create_ui_performance_timers, Debug_info_ui_performance } from '../Engine/Drawables/DebugInfo/DebugInfoUi.js';
import { Destroy_mesh } from '../Engine/Global/Functions.js';


// var osu = require('node-os-utils')
// import {osu} from 'node-os-utils'
// import {osu} from '../node-os-utils/index.js'
// import * as os from "../node-os-utils/index.js"

let renderer = null;


export function AppInit() {

    TimeIntervalsInit();
    PerformanceTimerInit();

    // Create and initialize the buffers that will be storing texture-font-uv data. 
    TextureInitBuffers();


    /* * * * * * * * * * * * * * * * * * * * * * * * * * *
    * Create Renderer and Scene
    */
    const scene = Scenes_create_scene();
    const camera = new CameraOrthographic();
    {
        // const camera = new CameraPerspective();
        // camera.SetControls(CAMERA_CONTROLS.PAN);
        // camera.SetControls(CAMERA_CONTROLS.ZOOM);
        // camera.SetControls(CAMERA_CONTROLS.ROTATE);
        // camera.Translate(80, 80, 20)
        // STATE.scene.active = scene;
        // STATE.scene.active_idx = scene.sceneidx;
    }

    renderer = new WebGlRenderer(scene, camera);

    Input_create_user_input_listeners();
    Renderqueue_init();
    // Initializer_popup_initialization();


    /* * * * * * * * * * * * * * * * * * * * * * * * * * *
     * Create meshes
     */

    Debug_info_ui_performance(scene);


    // const label = CreateLabel(scene);
    // DestroyMeshTest(scene, label)
    
    // const button = CreateButton(scene); // DestroyMeshTest(scene, button)
    // const switch1 = CreateSwitch(scene) // DestroyMeshTest(scene, switch1)

    // const menu = CreateMenu(scene)

    // CreateDropDownWidget(scene)
    // CreateDropDownWidgetWithWidgetsInside(scene)
    
    // CreateSlider(scene);
    // CreateSliderWithMenuBar(scene)

    // CreatDynamicText(scene)
    // CreatDynamicTextSectioned(scene)
    
    // CreatSectionedMixWidgets(scene)
    // CreateSectionSectioned(scene)

    // Help(scene)
    // CreateSectionedWidgets(scene)

    // CreateManySection(scene);
    // Listeners_debug_info_create(scene);


    // const section = MeshInfo(scene)
    // TimeIntervalsCreate(10, 'Mesh info tip', TIME_INTERVAL_REPEAT_ALWAYS, MeshInfoUpdate, { mesh: section });

    // const section = MeshInfo(scene)
    // TimeIntervalsCreate(10, 'Mesh info tip', TIME_INTERVAL_REPEAT_ALWAYS, MeshInfoUpdate, { mesh: section });

    // Listeners_debug_info_create(scene);
    // Scenes_debug_info_create(scene);


    // If camera is static, update projection matrix uniform only once
    camera.UpdateProjectionUniform(renderer.gl);
    scene.Render();

    const progs = Gl_progs_get();
    console.log(progs)


    Renderqueue_get().SetPriorityProgram('last', 1, 0);
    Renderqueue_get().UpdateActiveQueue();

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

/**************************************************************************************************************************************/
// Test Functions

function CreateLabel(scene) {

    const label = new Widget_Label('Label', ALIGN.HOR_CENTER | ALIGN.VERT_CENTER, [40, 100, 0], 5, GREY1, WHITE, [14, 4], .5);
    label.CreateListenEvent(LISTEN_EVENT_TYPES.MOVE)
    label.CreateListenEvent(LISTEN_EVENT_TYPES.HOVER);
    label.StateEnable(MESH_STATE.IS_HOVER_COLORABLE);


    scene.AddWidget(label)
    label.text_mesh.SetColorRGB(RED);
    // label.text_mesh.UpdateText('RED');
    
    label.Render()
    // label.Align(ALIGN.BOTTOM | ALIGN.LEFT, [0, 0]);
    // label.Align(ALIGN.BOTTOM | ALIGN.RIGHT, [0, 0]);
    // label.Align(ALIGN.TOP | ALIGN.LEFT, [0, 0]);
    label.Align(ALIGN.TOP | ALIGN.RIGHT, [0, 0]);


    console.log(label)

    return label;
}

function CreateButton(scene) {

    let ypos = 100
    const btn = new Widget_Button('Button', ALIGN.HOR_CENTER | ALIGN.VERT_CENTER, [160, ypos, 0], 5, GREY1, WHITE, [4, 4], .5);
    // btn1.CreateListenEvent(LISTEN_EVENT_TYPES.MOVE)
    btn.CreateListenEvent(LISTEN_EVENT_TYPES.CLICK_UP)
    btn.CreateListenEvent(LISTEN_EVENT_TYPES.HOVER)
    btn.StateEnable(MESH_STATE.IS_HOVER_COLORABLE)
    btn.EnableGfxAttributes(MESH_ENABLE.GFX.ATTR_STYLE, { style: [6, 6, 3] })
    scene.AddWidget(btn, GFX.PRIVATE);
    btn.text_mesh.SetColorRGB(BLUE_10_120_220);

    btn.Align(ALIGN.LEFT|ALIGN.TOP, [0, 0]);

    return btn;
}

function DestroyMeshTest(scene, widget) {

    const customCallback = function (params) {

        if(widget) {
            console.log('Destroy Text mesh test:', widget.name);
            widget = Destroy_mesh(widget);
        }
        else console.log('Widget does not exist')
    }
    const btn1 = new Widget_Button('Destroy', ALIGN.HOR_CENTER | ALIGN.VERT_CENTER, [160, 240, 0], 5, GREY1, WHITE, [4, 4], .5);
    btn1.CreateListenEvent(LISTEN_EVENT_TYPES.CLICK_UP, customCallback)
    btn1.CreateListenEvent(LISTEN_EVENT_TYPES.HOVER)
    btn1.StateEnable(MESH_STATE.IS_HOVER_COLORABLE)
    btn1.EnableGfxAttributes(MESH_ENABLE.GFX.ATTR_STYLE, { style: [6, 6, 3] })
    scene.AddWidget(btn1);
    btn1.text_mesh.SetColorRGB(YELLOW_240_220_10);
}

function CreateSwitch(scene) {

    let ypos = 100
    const switch1 = new Widget_Switch('switch on', 'switch off', [250, ypos, 0], 5, GREY1, WHITE, [4, 4], .5);
    switch1.StateEnable(MESH_STATE.IS_HOVER_COLORABLE)
    switch1.EnableGfxAttributes(MESH_ENABLE.GFX.ATTR_STYLE, { style: [6, 6, 3] })
    scene.AddWidget(switch1);
    switch1.text_mesh.SetColorRGB(BLUE_10_120_220);
    ypos += switch1.geom.dim[1] * 2 + 5;

    switch1.Bind(function () { console.log('CALLBACK FROM USER !!!!!!!!!!!!!!!!!!!!!!!!!!!') })

    return switch1;
}

function CreatDynamicText(scene){

    const dt = new Widget_Dynamic_Text_Mesh('Dynamic text', '0000',  [100, 300, 0], 4, BLUE_10_120_220, PINK_240_60_160);
    scene.AddWidget(dt)
}

function CreatDynamicTextSectioned(scene){

    const section = new Section(SECTION.VERTICAL, [10, 10], [250, 600, 0], [0, 0], TRANSPARENCY(GREY1, .9))
    section.CreateListenEvent(LISTEN_EVENT_TYPES.MOVE, section.OnClick)
    section.CreateListenEvent(LISTEN_EVENT_TYPES.HOVER);

    {
        const dt = new Widget_Dynamic_Text_Mesh('Dynamic text', '000000',  [0, 0, 0], 4, BLUE_10_120_220, PINK_240_60_160);
        section.AddItem(dt);
    }
    {
        const dt = new Widget_Dynamic_Text_Mesh('Dynamic text', '00',  [0, 0, 0], 4, BLUE_10_120_220, PINK_240_60_160);
        section.AddItem(dt);
    }
    
    scene.AddWidget(section);
    section.Calc();
}

function CreateMenu(scene) {

    const menu = new Widget_Menu_Bar('Widget Menu bar', ALIGN.LEFT, [60, 200, 0], TRANSPARENCY(GREY1, .9), WHITE, [10, 6]);
    menu.AddCloseButton(menu, 'x');
    menu.CreateListenEvent(LISTEN_EVENT_TYPES.MOVE)

    scene.AddWidget(menu)
}

function CreateDropDownWidget(scene) {

    const pad = [10, 2.5]
    const drop_down = new Widget_Dropdown('DP1', [200, 200, 0], [60, 20], GREY1, ORANGE_240_130_10, WHITE, pad);
    drop_down.CreateListenEvent(LISTEN_EVENT_TYPES.HOVER); drop_down.StateEnable(MESH_STATE.IS_HOVER_COLORABLE);
    // drop_down.CreateListenEvent(LISTEN_EVENT_TYPES.MOVE, drop_down.SetOnMove);

    { // Add another dropdown in dropdown
        const drop_down2 = new Widget_Dropdown('DP2', [OUT_OF_VIEW, OUT_OF_VIEW, 0], [60, 20], GREY1, BLUE_10_120_220, WHITE, pad);
        drop_down2.CreateListenEvent(LISTEN_EVENT_TYPES.HOVER); drop_down2.StateEnable(MESH_STATE.IS_HOVER_COLORABLE);
        Drop_down_set_root(drop_down, drop_down2);
        drop_down.AddToMenu(drop_down2);

        const text = new Widget_Text('DP2 TEXT ->', [OUT_OF_VIEW, OUT_OF_VIEW, 0], 4, WHITE);
        {// Create debug info event
            text.debug_info.type |= INFO_LISTEN_EVENT_TYPE.GFX_EVT_TYPE.VB;
            const info_event_type = INFO_LISTEN_EVENT_TYPE.GFX | INFO_LISTEN_EVENT_TYPE.GFX_EVT_TYPE.VB;
        }
        // text.CreateListenEvent(LISTEN_EVENT_TYPES.HOVER); text.StateEnable(MESH_STATE.IS_HOVER_COLORABLE);
        drop_down2.AddToMenu(text);
        Drop_down_set_root(drop_down, drop_down2);
        {
            const drop_down3 = new Widget_Dropdown('DP3 DP1', [OUT_OF_VIEW, OUT_OF_VIEW, 0], [60, 20], GREY1, YELLOW_240_220_10, WHITE, pad);
            drop_down3.CreateListenEvent(LISTEN_EVENT_TYPES.HOVER); drop_down3.StateEnable(MESH_STATE.IS_HOVER_COLORABLE);
            drop_down2.AddToMenu(drop_down3);
            Drop_down_set_root(drop_down, drop_down3);
            {
                const drop_down4 = new Widget_Dropdown('DP4 DP1', [OUT_OF_VIEW, OUT_OF_VIEW, 0], [60, 20], GREY1, GREEN_140_240_10, WHITE, pad);
                drop_down4.CreateListenEvent(LISTEN_EVENT_TYPES.HOVER); drop_down4.StateEnable(MESH_STATE.IS_HOVER_COLORABLE);
                drop_down3.AddToMenu(drop_down4);
                Drop_down_set_root(drop_down, drop_down4);

                {
                    const drop_down5 = new Widget_Dropdown('DP5 DP1', [OUT_OF_VIEW, OUT_OF_VIEW, 0], [60, 20], GREY1, PINK_240_60_200, WHITE, pad);
                    drop_down5.CreateListenEvent(LISTEN_EVENT_TYPES.HOVER); drop_down5.StateEnable(MESH_STATE.IS_HOVER_COLORABLE);
                    drop_down4.AddToMenu(drop_down5);
                    Drop_down_set_root(drop_down, drop_down5);

                    {
                        const drop_down6 = new Widget_Dropdown('DP6 DP1', [OUT_OF_VIEW, OUT_OF_VIEW, 0], [60, 20], GREY1, RED_200_10_10, WHITE, pad);
                        drop_down6.CreateListenEvent(LISTEN_EVENT_TYPES.HOVER); drop_down6.StateEnable(MESH_STATE.IS_HOVER_COLORABLE);
                        drop_down5.AddToMenu(drop_down6);
                        Drop_down_set_root(drop_down, drop_down6);

                        {
                            const text = new Widget_Text('DP5 -->', [OUT_OF_VIEW, OUT_OF_VIEW, 0], 4, WHITE);
                            // text.debug_info.type |= INFO_LISTEN_EVENT_TYPE.GFX_EVT_TYPE.VB;
                            // text.CreateListenEvent(LISTEN_EVENT_TYPES.HOVER); text.StateEnable(MESH_STATE.IS_HOVER_COLORABLE);

                            drop_down6.AddToMenu(text);
                        }
                    }
                }
            }
        }
    }

    scene.AddWidget(drop_down);
    drop_down.Calc();
    Drop_down_set_root(drop_down, drop_down);

}

function CreateDropDownWidgetWithWidgetsInside(scene) {

    const pad = [10, 2.5]
    const drop_down = new Widget_Dropdown('DP1', [260, 200, 0], [60, 20], GREY1, ORANGE_240_130_10, WHITE, pad);
    drop_down.CreateListenEvent(LISTEN_EVENT_TYPES.HOVER); drop_down.StateEnable(MESH_STATE.IS_HOVER_COLORABLE);
    drop_down.CreateListenEvent(LISTEN_EVENT_TYPES.MOVE, drop_down.SetOnMove);

    { // Add another dropdown in dropdown
        const drop_down2 = new Widget_Dropdown('DP2', [OUT_OF_VIEW, OUT_OF_VIEW, 0], [60, 20], GREY1, BLUE_10_120_220, WHITE, pad);
        drop_down2.CreateListenEvent(LISTEN_EVENT_TYPES.HOVER); drop_down2.StateEnable(MESH_STATE.IS_HOVER_COLORABLE);
        Drop_down_set_root(drop_down, drop_down2);
        drop_down.AddToMenu(drop_down2);

        { // Add text to DP2's menu
            const text = new Widget_Text('DP2 TEXT ->', [OUT_OF_VIEW, OUT_OF_VIEW, 0], 4, WHITE);
            drop_down2.AddToMenu(text);
            // Create debug info event
            text.debug_info.type |= INFO_LISTEN_EVENT_TYPE.GFX_EVT_TYPE.VB;
            const info_event_type = INFO_LISTEN_EVENT_TYPE.GFX | INFO_LISTEN_EVENT_TYPE.GFX_EVT_TYPE.VB;
        }
        { // Add text to DP2's menu
            const text = new Widget_Text('DP2 TEXT ->', [OUT_OF_VIEW, OUT_OF_VIEW, 0], 4, WHITE);
            text.debug_info.type |= INFO_LISTEN_EVENT_TYPE.GFX_EVT_TYPE.VB;
            // Create debug info event
            const info_event_type = INFO_LISTEN_EVENT_TYPE.GFX | INFO_LISTEN_EVENT_TYPE.GFX_EVT_TYPE.VB;
            drop_down2.AddToMenu(text);
        }
        
        // Add label to DP2
        const label = new Widget_Label('Labe 1', ALIGN.RIGHT);
        drop_down2.AddToMenu(label)
        // Add button to DP2
        const btn = new Widget_Button('Button 1', ALIGN.RIGHT);
        drop_down2.AddToMenu(btn)
        // Add button to DP2
        const slider = new Widget_Slider([0,0,0], [80,10]);
        drop_down2.AddToMenu(slider)

        Drop_down_set_root(drop_down, drop_down2);

        {
            const drop_down3 = new Widget_Dropdown('DP3 DP1', [OUT_OF_VIEW, OUT_OF_VIEW, 0], [60, 20], GREY1, YELLOW_240_220_10, WHITE, pad);
            drop_down3.CreateListenEvent(LISTEN_EVENT_TYPES.HOVER); drop_down3.StateEnable(MESH_STATE.IS_HOVER_COLORABLE);
            drop_down2.AddToMenu(drop_down3);
            Drop_down_set_root(drop_down, drop_down3);
            {
                const drop_down4 = new Widget_Dropdown('DP4 DP1', [OUT_OF_VIEW, OUT_OF_VIEW, 0], [60, 20], GREY1, GREEN_140_240_10, WHITE, pad);
                drop_down4.CreateListenEvent(LISTEN_EVENT_TYPES.HOVER); drop_down4.StateEnable(MESH_STATE.IS_HOVER_COLORABLE);
                drop_down3.AddToMenu(drop_down4);
                Drop_down_set_root(drop_down, drop_down4);

                {
                    const drop_down5 = new Widget_Dropdown('DP5 DP1', [OUT_OF_VIEW, OUT_OF_VIEW, 0], [60, 20], GREY1, PINK_240_60_200, WHITE, pad);
                    drop_down5.CreateListenEvent(LISTEN_EVENT_TYPES.HOVER); drop_down5.StateEnable(MESH_STATE.IS_HOVER_COLORABLE);
                    drop_down4.AddToMenu(drop_down5);
                    Drop_down_set_root(drop_down, drop_down5);

                    {
                        const drop_down6 = new Widget_Dropdown('DP6 DP1', [OUT_OF_VIEW, OUT_OF_VIEW, 0], [60, 20], GREY1, RED_200_10_10, WHITE, pad);
                        drop_down6.CreateListenEvent(LISTEN_EVENT_TYPES.HOVER); drop_down6.StateEnable(MESH_STATE.IS_HOVER_COLORABLE);
                        drop_down5.AddToMenu(drop_down6);
                        Drop_down_set_root(drop_down, drop_down6);

                        {
                            const text = new Widget_Text('DP5 -->', [OUT_OF_VIEW, OUT_OF_VIEW, 0], 4, WHITE);
                            // text.debug_info.type |= INFO_LISTEN_EVENT_TYPE.GFX_EVT_TYPE.VB;
                            // text.CreateListenEvent(LISTEN_EVENT_TYPES.HOVER); text.StateEnable(MESH_STATE.IS_HOVER_COLORABLE);

                            drop_down6.AddToMenu(text);
                        }
                    }
                }
            }
        }
    }

    scene.AddWidget(drop_down);
    drop_down.Calc();
    Drop_down_set_root(drop_down, drop_down);

}

function CreatSectionedMixWidgets(scene){

    const section = new Section(SECTION.VERTICAL, [10, 10], [250, 400, 0], [0, 0], TRANSPARENCY(GREY1, .5))
    // section.CreateListenEvent(LISTEN_EVENT_TYPES.MOVE, section.OnClick)
    section.CreateListenEvent(LISTEN_EVENT_TYPES.HOVER);

    {
        const menu = new Widget_Menu_Bar('Widget Menu bar', ALIGN.LEFT, [60, 200, 0], TRANSPARENCY(GREY1, .9), WHITE, [10, 6]);
        menu.AddCloseButton(menu, 'x');
        menu.CreateListenEvent(LISTEN_EVENT_TYPES.MOVE)
        section.AddItem(menu)
    }
    {
        const lb = new Widget_Label('Label', ALIGN.BOTTOM,  [0, 0, 0], 4, BLUE_10_120_220);
        section.AddItem(lb);
    }
    {
        const dt = new Widget_Dynamic_Text_Mesh('Dynamic text', '0000000',  [0, 0, 0], 4, BLUE_10_120_220, PINK_240_60_160);
        section.AddItem(dt);
    }
    {
        const slider = new Widget_Slider([0, 0, 0], [60, 10], PINK_240_60_160, [2,4]);
        section.AddItem(slider);
    }
    {
        const s2 = new Section(SECTION.VERTICAL, [10, 10], [0, 0, 0], [0, 0], TRANSPARENCY(ORANGE_240_200_10, .5))
        // const s2 = new Section(SECTION.HORIZONTAL, [10, 10], [0, 0, 0], [0, 0], TRANSPARENCY(WHITE, .7))
        s2.CreateListenEvent(LISTEN_EVENT_TYPES.HOVER);
    
        const menu = new Widget_Menu_Bar('Widget Menu bar', ALIGN.LEFT, [0, 0, 0], TRANSPARENCY(ORANGE_240_200_10, .5), WHITE, [10, 6]);
        menu.AddCloseButton(s2, 'x');
        menu.CreateListenEvent(LISTEN_EVENT_TYPES.MOVE)
        s2.AddItem(menu);
        
        const slider = new Widget_Slider([0, 0, 0], [80, 10], BLUE_10_160_220);
        s2.AddItem(slider);

        {
            // const s2 = new Section(SECTION.VERTICAL, [10, 10], [0, 0, 0], [0, 0], TRANSPARENCY(WHITE, .7))
            const s3 = new Section(SECTION.HORIZONTAL, [10, 10], [0, 0, 0], [0, 0], TRANSPARENCY(GREEN_140_240_10, .5))
            s3.CreateListenEvent(LISTEN_EVENT_TYPES.HOVER);
        
            const menu = new Widget_Menu_Bar('Widget Menu bar', ALIGN.LEFT, [0, 0, 0], TRANSPARENCY(GREEN_140_240_10, .5), WHITE, [10, 6]);
            menu.AddCloseButton(s3, 'x');
            menu.CreateListenEvent(LISTEN_EVENT_TYPES.MOVE)
            s3.AddItem(menu);
            
            const slider = new Widget_Slider([0, 0, 0], [80, 10], GREEN_33_208_40);
            s3.AddItem(slider);
            s2.AddItem(s3);
        }

        section.AddItem(s2);
    }
    
    scene.AddWidget(section);
    section.Calc();
}


function CreateSlider(scene) {

    const slider = new Widget_Slider([200, 300, 0], [150, 10]);
    scene.AddWidget(slider);

}

function CreateSliderWithMenuBar(scene) {

    const section = new Section(SECTION.VERTICAL, [10, 10], [250, 600, 0], [0, 0], TRANSPARENCY(GREY1, .9))
    // section.CreateListenEvent(LISTEN_EVENT_TYPES.MOVE, section.OnClick)
    section.CreateListenEvent(LISTEN_EVENT_TYPES.HOVER);

    const menu = new Widget_Menu_Bar('Widget Menu bar', ALIGN.LEFT, [200, 400, 0], TRANSPARENCY(GREY1, .9), WHITE, [10, 6]);
    menu.AddCloseButton(section, 'x');
    menu.CreateListenEvent(LISTEN_EVENT_TYPES.MOVE)
    section.AddItem(menu);
    
    const slider = new Widget_Slider([200, 100, 0], [150, 10]);
    section.AddItem(slider);
    
    scene.AddWidget(section);
    section.Calc();

    console.log('section:', section)
}

function CreateMenuBarSectioned(count) {

    const h = 40;
    let cnt = 1;
    let posy = Viewport.bottom - h, fontSize = 10;

    const section = new Section(SECTION.VERTICAL, [10, 10], [0, 0, 0], [10, 10], ORANGE);

    for (let i = 0; i < count; i++) {
        const menu_bar = new Widget_Menu_Bar(`Menu ${cnt}`, ALIGN.LEFT, [120, posy, 0], [60, 20], BLUE_10_120_220, WHITE, [2, 2], .3);
        menu_bar.CreateListenEvent(LISTEN_EVENT_TYPES.HOVER)
        menu_bar.SetName(`Menu ${cnt}`)
        menu_bar.AddCloseButton(menu_bar, 'x', [120, posy, 0], 6, GREY1, WHITE, [6, 4], .8, undefined, [1, 4, 2]);
        section.AddItem(menu_bar)
        posy -= h; cnt++;
    }

    return section;
}

function CreateSectionSectioned(scene) {

    const flags = (SECTION.ITEM_FIT | SECTION.EXPAND);

    const blu = new Section(SECTION.VERTICAL, [15, 15], [350, 500, 0], [10, 0], TRANSPARENCY(BLUE, .2));

    const red = new Section(SECTION.VERTICAL, [15, 15], [0, 0, 0], [20, 20], TRANSPARENCY(PURPLE, .2));
    const gre = new Section(SECTION.VERTICAL, [12, 12], [0, 0, 0], [20, 20], TRANSPARENCY(GREEN, .4));
    const yel = new Section(SECTION.HORIZONTAL, [12, 12], [0, 0, 0], [20, 20], TRANSPARENCY(YELLOW, .4));
    const ora = new Section(SECTION.HORIZONTAL, [12, 12], [0, 0, 0], [20, 20], TRANSPARENCY(ORANGE, .4));
    const cie = new Section(SECTION.HORIZONTAL, [15, 15], [0, 0, 0], [20, 20], TRANSPARENCY(BLUE_LIGHT, .4));
    const bla = new Section(SECTION.VERTICAL, [15, 15], [0, 0, 0], [20, 20], TRANSPARENCY(BLACK, .4));

    { // Construct sub-sections
        var bla_1 = new Section(SECTION.HORIZONTAL, [15, 15], [0, 0, 0], [20, 20], TRANSPARENCY(BLACK, .3));
        var pin_1 = new Section(SECTION.VERTICAL, [25, 10], [0, 0, 0], [20, 20], TRANSPARENCY(PINK_240_60_160, .3));
        var blu_1 = new Section(SECTION.VERTICAL, [25, 10], [0, 0, 0], [20, 20], TRANSPARENCY(BLUE, .3));
        var pur_1 = new Section(SECTION.VERTICAL, [5, 5], [0, 0, 0], [20, 20], TRANSPARENCY(PURPLE, .8));
        var red_1 = new Section(SECTION.VERTICAL, [5, 5], [0, 0, 0], [20, 20], TRANSPARENCY(RED, .8));
        var yel_1 = new Section(SECTION.VERTICAL, [5, 5], [0, 0, 0], [20, 20], TRANSPARENCY(YELLOW, .8));
        var yel_2 = new Section(SECTION.VERTICAL, [5, 5], [0, 0, 0], [20, 20], TRANSPARENCY(YELLOW, .8));
        var red_3 = new Section(SECTION.VERTICAL, [5, 5], [0, 0, 0], [20, 20], TRANSPARENCY(RED, .8));
        var yel_3 = new Section(SECTION.VERTICAL, [5, 5], [0, 0, 0], [20, 20], TRANSPARENCY(YELLOW, .8));
        var gre_3 = new Section(SECTION.VERTICAL, [5, 5], [0, 0, 0], [20, 20], TRANSPARENCY(GREEN, .8));
        var red_4 = new Section(SECTION.VERTICAL, [5, 5], [0, 0, 0], [20, 20], TRANSPARENCY(RED, .8));
        var yel_4 = new Section(SECTION.VERTICAL, [5, 5], [0, 0, 0], [20, 20], TRANSPARENCY(YELLOW, .8));
        var gre_4 = new Section(SECTION.VERTICAL, [5, 5], [0, 0, 0], [20, 20], TRANSPARENCY(GREEN, .8));
        var ora_4 = new Section(SECTION.VERTICAL, [5, 5], [0, 0, 0], [20, 20], TRANSPARENCY(ORANGE, .8));
        var gry1_1 = new Section(SECTION.VERTICAL, [5, 5], [0, 0, 0], [20, 20], TRANSPARENCY(GREY3, .8));
        var gry1_2 = new Section(SECTION.VERTICAL, [5, 5], [0, 0, 0], [20, 20], TRANSPARENCY(GREY5, .8));
        var gry1_3 = new Section(SECTION.VERTICAL, [5, 5], [0, 0, 0], [20, 20], TRANSPARENCY(GREY7, .8));
        var gry2_1 = new Section(SECTION.VERTICAL, [5, 5], [0, 0, 0], [20, 20], TRANSPARENCY(GREY1, .9));
        var gry2_2 = new Section(SECTION.VERTICAL, [5, 5], [0, 0, 0], [20, 20], TRANSPARENCY(GREY1, .9));
        var gry2_3 = new Section(SECTION.VERTICAL, [5, 5], [0, 0, 0], [20, 20], TRANSPARENCY(GREY1, .9));
        var gry2_4 = new Section(SECTION.VERTICAL, [5, 5], [0, 0, 0], [20, 20], TRANSPARENCY(GREY1, .9));
        var vert_0 = new Section(SECTION.VERTICAL, [20, 20], [0, 0, 0], [20, 20], TRANSPARENCY(GREY2, .4));

    }

    // Construct widgets
    const label = new Widget_Label('label', ALIGN.HOR_CENTER | ALIGN.VERT_CENTER, [700, 100, 0]);
    const btn = new Widget_Button('btnl', ALIGN.HOR_CENTER | ALIGN.VERT_CENTER, [700, 100, 0]);

    { // Set widgets parameters
        label.SetName('Sectioned btn1')
        label.CreateListenEvent(LISTEN_EVENT_TYPES.HOVER)
        label.StateEnable(MESH_STATE.IS_HOVER_COLORABLE);
        blu.CreateListenEvent(LISTEN_EVENT_TYPES.MOVE, blu.OnClick);

        btn.SetName('Sectioned btn1')
        btn.CreateListenEvent(LISTEN_EVENT_TYPES.HOVER)
        btn.StateEnable(MESH_STATE.IS_HOVER_COLORABLE);
        btn.CreateListenEvent(LISTEN_EVENT_TYPES.MOVE, btn.OnClick);
    }

    { // Set naming and listeners

        red.SetName('red'); red.StateEnable(MESH_STATE.IS_HOVER_COLORABLE); red.CreateListenEvent(LISTEN_EVENT_TYPES.HOVER);
        gre.SetName('gre'); gre.StateEnable(MESH_STATE.IS_HOVER_COLORABLE); gre.CreateListenEvent(LISTEN_EVENT_TYPES.HOVER);
        yel.SetName('yel'); yel.StateEnable(MESH_STATE.IS_HOVER_COLORABLE); yel.CreateListenEvent(LISTEN_EVENT_TYPES.HOVER);
        ora.SetName('ora'); ora.StateEnable(MESH_STATE.IS_HOVER_COLORABLE); ora.CreateListenEvent(LISTEN_EVENT_TYPES.HOVER);
        cie.SetName('cie'); cie.StateEnable(MESH_STATE.IS_HOVER_COLORABLE); cie.CreateListenEvent(LISTEN_EVENT_TYPES.HOVER);
        bla.SetName('bla'); bla.StateEnable(MESH_STATE.IS_HOVER_COLORABLE); bla.CreateListenEvent(LISTEN_EVENT_TYPES.HOVER);
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

    { // Set hierarchy
        pin_1.AddItem(gry2_1, flags); pin_1.AddItem(gry2_2, flags);
        blu_1.AddItem(gry2_3, flags); blu_1.AddItem(gry2_4, flags);
        bla_1.AddItem(pin_1, flags); bla_1.AddItem(blu_1, flags);
        red.AddItem(bla_1); red.AddItem(yel, flags); red.AddItem(ora, flags); red.AddItem(cie, flags);
        yel.AddItem(gre_4, flags); yel.AddItem(pur_1, flags); yel.AddItem(red_3, flags);
        ora.AddItem(yel_4, flags); ora.AddItem(red_4, flags); ora.AddItem(yel_2, flags); ora.AddItem(ora_4, flags);
        cie.AddItem(gre_3, flags); cie.AddItem(yel_3, flags); cie.AddItem(bla, flags);
        bla.AddItem(gry1_1, flags); bla.AddItem(gry1_2, flags); bla.AddItem(gry1_3, flags);
        gry1_1.AddItem(label, flags); gry1_1.AddItem(btn, flags); gry1_1.AddItem(vert_0, flags);
        gre.AddItem(yel_1, flags); gre.AddItem(red_1, flags);
    }

    const minimizer = new Widget_Minimize(blu, blu.geom.pos);
    minimizer.SetName('minimizer')
    // minimizer.CreateListenEvent(LISTEN_EVENT_TYPES.CLICK_UP, minimizer.OnClick, minimizer);
    minimizer.CreateListenEvent(LISTEN_EVENT_TYPES.HOVER);
    minimizer.StateEnable(MESH_STATE.IS_HOVER_COLORABLE);

    blu.AddItem(minimizer);

    yel.AddItem(gre, flags);
    blu.AddItem(red, flags);

    scene.AddWidget(blu, GFX.PRIVATE);
    Gfx_end_session(true);
    blu.Calc();
    // const l = Debug_get_event_listeners();
    // l.PrintAll()
    blu.Reconstruct_listeners_recursive();

}

function Help(scene) {


    const flags = (SECTION.ITEM_FIT);

    const section = new Section(SECTION.VERTICAL, [10, 10], [280, 650, 0], [0, 0], TRANSPARENCY(GREY1, .2));
    section.CreateListenEvent(LISTEN_EVENT_TYPES.MOVE, section.OnClick);
    section.SetName('Help section')

    // scene.StoreMesh(section)
    const s1 = new Section(SECTION.VERTICAL, [15, 10], [220, 400, 0], [0, 0], TRANSPARENCY(GREY1, .2));
    s1.SetName('Help section 2')

    let msgs = [];
    for (let i = 0; i < DEBUG_PRINT_KEYS.length; i++) {

        msgs[i] = '\"' + DEBUG_PRINT_KEYS[i].key + '\": ' + DEBUG_PRINT_KEYS[i].discr
        const label = new Widget_Label(msgs[i], ALIGN.HOR_CENTER | ALIGN.VERT_CENTER, [400, 300, 0], 4, TRANSPARENCY(ORANGE_240_130_10, .7), WHITE, [1, 1], [7, 6], .5, undefined, [0, 4, 3])
        label.StateEnable(MESH_STATE.IS_HOVER_COLORABLE)
        label.CreateListenEvent(LISTEN_EVENT_TYPES.HOVER)

        s1.AddItem(label)
    }

    // const s2 = new Section(SECTION.HORIZONTAL, [15, 10], [220, 400, 0], [0, 0], TRANSPARENCY(BLUE_10_120_220, .2))
    const minimizer = new Widget_Minimize(section, section.geom.pos);
    minimizer.SetName('minimizer')
    // minimizer.CreateListenEvent(LISTEN_EVENT_TYPES.CLICK_UP, minimizer.OnClick, minimizer);
    // minimizer.CreateListenEvent(LISTEN_EVENT_TYPES.HOVER);
    // minimizer.StateEnable(MESH_STATE.IS_HOVER_COLORABLE);

    section.AddItem(minimizer);
    section.AddItem(s1, flags)

    scene.AddWidget(section, GFX.PRIVATE);
    Gfx_end_session(true);

    section.Calc(flags)
    // section.Recalc(flags)
    // section.Reconstruct_listeners_recursive();


}

function MeshInfo(scene) {

    const fontsize = 4.3;

    const infomesh = new Widget_Dynamic_Text_Mesh('Mesh name 0000000000000000', 'id:000', [10, 140, 0], fontsize, GREEN_140_240_10, YELLOW_240_220_10, .4);
    infomesh.CreateNewText('pos: 00000,00000,0', fontsize, BLUE_10_120_220, [fontsize * 3, 0], .9);
    infomesh.CreateNewText('defpos: 00000,00000,0', fontsize, BLUE_10_120_220, [fontsize * 3, 0], .9);
    infomesh.CreateNewText('dim: 00000,00000', fontsize, BLUE_10_120_220, [fontsize * 3, 0], .9);
    infomesh.CreateNewText('gfx: prog:0, vb:0, start:000000', fontsize, BLUE_10_120_220, [fontsize * 3, 0], .9);

    infomesh.Align_pre(infomesh, ALIGN.VERTICAL)
    infomesh.CreateListenEvent(LISTEN_EVENT_TYPES.MOVE, infomesh.OnClick);
    scene.AddMesh(infomesh, GFX.PRIVATE);
    Gfx_end_session(true);

    return infomesh;
}

function MeshInfoUpdate(params) {

    const textMesh = params.params.mesh;
    const infoMesh = STATE.mesh.hovered;

    if (infoMesh) {

        textMesh.UpdateTextFromVal(infoMesh.name);

        const gfx = (infoMesh.gfx !== null) ? `gfx: prog:${infoMesh.gfx.prog.idx}, vb:${infoMesh.gfx.vb.idx}, vb:${infoMesh.gfx.vb.start}`
            : 'null'

        let msgs = [
            `id:${infoMesh.id}`,
            `pos:${FloorArr3(infoMesh.geom.pos)}`,
            `defpos:${FloorArr3(infoMesh.geom.defPos)}`,
            // `dim: x:${infoMesh.geom.dim[0]} y:${infoMesh.geom.dim[1]}`,
            `dim: ${infoMesh.geom.dim}`,
            gfx,
        ];

        for (let i = 0; i < textMesh.children.count; i++) {

            const childText = textMesh.children.buffer[i];
            childText.UpdateTextFromVal(msgs[i])
        }

    }

}

function SetHoverToAllMeshesRecursive(mesh) {

    mesh.CreateListenEvent(LISTEN_EVENT_TYPES.HOVER);
    mesh.StateEnable(MESH_STATE.IS_HOVER_COLORABLE);

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
    const label1 = new Widget_Label('options 1', ALIGN.HOR_CENTER | ALIGN.VERT_CENTER, [400, 300, 0], 4, TRANSPARENCY(GREY1, .0), WHITE, [1, 1], [7, 6], .5, undefined, [0, 4, 1])
    const label2 = new Widget_Label('options 2', ALIGN.HOR_CENTER | ALIGN.VERT_CENTER, [400, 700, 0], 4, TRANSPARENCY(GREY1, .0), WHITE, [1, 1], [7, 6], .5, undefined, [0, 4, 1])
    const label3 = new Widget_Label('options 3', ALIGN.HOR_CENTER | ALIGN.VERT_CENTER, [400, 700, 0], 4, TRANSPARENCY(GREY1, .0), WHITE, [1, 1], [7, 6], .5, undefined, [0, 4, 1])
    const label4 = new Widget_Label('options 4', ALIGN.HOR_CENTER | ALIGN.VERT_CENTER, [400, 700, 0], 4, TRANSPARENCY(GREY1, .0), WHITE, [1, 1], [7, 6], .5, undefined, [0, 4, 1])

    const switch1 = new Widget_Switch('on', 'off', [400, 700, 0], 4, TRANSPARENCY(GREY1, .0), WHITE, [4, 6], .5, undefined, [2, 8, 1]);
    const switch2 = new Widget_Switch('on', 'off', [400, 700, 0], 4, TRANSPARENCY(GREY1, .0), WHITE, [4, 6], .5, undefined, [2, 8, 1]);
    const switch3 = new Widget_Switch('on', 'off', [400, 700, 0], 4, TRANSPARENCY(GREY1, .0), WHITE, [4, 6], .5, undefined, [2, 8, 1]);
    const switch4 = new Widget_Switch('on', 'off', [400, 700, 0], 4, TRANSPARENCY(BLUE_10_120_220, .2), WHITE, [4, 6], .5, undefined, [2, 4, 1]);

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

    section.UpdateGfx(section, scene.sceneidx);
    // section.UpdateGfxRecursive(section);
    console.log();
}

function CreateStyledRects(scene) {

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

function Create3DCubes(scene) {

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

/**
 * [ESM-HMR] listening for file changes... hmr-client.js:9:11
Array(20) [ {…}, {…}, {…}, {…}, {…}, {…}, {…}, {…}, {…}, {…}, … ]
Keys.js:206:9
Device width:  437  height:  889 WebGlRenderer.js:151:15
Initializing Graphics. WebGlRenderer.js:106:15
WebGl version:  WebGL GLSL ES 3.00 WebGlRenderer.js:118:15
WebGl renderer info:  ANGLE (NVIDIA, NVIDIA GeForce GTX 980 Direct3D11 vs_5_0 ps_5_0) WebGlRenderer.js:119:15
Navigator { permissions: Permissions, mimeTypes: MimeTypeArray, plugins: PluginArray, pdfViewerEnabled: true, doNotTrack: "1", maxTouchPoints: 1, mediaCapabilities: MediaCapabilities, oscpu: "Windows NT 10.0; Win64; x64", vendor: "", vendorSub: "" }
WebGlRenderer.js:188:12
Maximum Texture Size: 16384 WebGlRenderer.js:144:15
Creating new event type events buffer EventListeners.js:83:18
Shader Compiled Successfully! GlShaders.js:79:11
Shader Compiled Successfully! GlShaders.js:79:11
Validate program undefined GlShaders.js:49:10
Shaders Linked Successfully!
 status: undefined GlShaders.js:59:11
Uniform: 'uniforms_buffer' located successfully! GlUniformBuffer.js:99:18
Shader Compiled Successfully! 2 GlShaders.js:79:11
Validate program undefined GlShaders.js:49:10
Shaders Linked Successfully!
 status: undefined GlShaders.js:59:11
Array [ {…}, {…} ]
App.js:132:13
PERFORMANCE: 
Performance { timeOrigin: 1696434571223, timing: PerformanceTiming, navigation: PerformanceNavigation, onresourcetimingbufferfull: null, eventCounts: EventCounts }
App.js:140:17
Shader Compiled Successfully! 2 GlShaders.js:79:11
Validate program undefined GlShaders.js:49:10
Shaders Linked Successfully!
 status: undefined GlShaders.js:59:11
Uniform: 'uniforms_buffer' located successfully! GlUniformBuffer.js:99:18
Switch:  off WidgetButton.js:52:15
Widget_Switch-OnClick() WidgetButton.js:66:18
No elesments in gfx session buffer. Something went wrong GfxContext.js:143:38
Switch:  on WidgetButton.js:52:15
Widget_Switch-OnClick() WidgetButton.js:66:18
text_mesh destroy: Text-mesh [+ InfoUi Gfx DP] id:21 Text_Mesh.js:35:15
rect_mesh destroy: Lebel-text [+ InfoUi Gfx DP] id:22 Rect_Mesh.js:34:15
Removing Event etype: 1 
Int8Array [ -1, 4 ]
Mesh.js:356:25
rect_mesh destroy: InfoUi Gfx DP id:20 Rect_Mesh.js:34:15
rect_mesh destroy: InfoUi Gfx section 100 id:19 Rect_Mesh.js:34:15
Switch:  off WidgetButton.js:52:15
Widget_Switch-OnClick() WidgetButton.js:66:18
No elesments in gfx session buffer. Something went wrong GfxContext.js:143:38
Switch:  on WidgetButton.js:52:15
Widget_Switch-OnClick() WidgetButton.js:66:18
text_mesh destroy: Text-mesh [+ InfoUi Gfx DP] id:62 Text_Mesh.js:35:15
rect_mesh destroy: Lebel-text [+ InfoUi Gfx DP] id:63 Rect_Mesh.js:34:15
Removing Event etype: 1 
Int8Array [ -1, 4 ]
Mesh.js:356:25
text_mesh destroy: Text-mesh [+ prog:0] id:66 Text_Mesh.js:35:15
rect_mesh destroy: Lebel-text [+ prog:0] id:67 Rect_Mesh.js:34:15
Removing Event etype: 1 
Int8Array [ -1, 5 ]
Mesh.js:356:25
text_mesh destroy: Text-mesh [+ vb:0 | count:56] id:70 Text_Mesh.js:35:15
rect_mesh destroy: Lebel-text [+ vb:0 | count:56] id:71 Rect_Mesh.js:34:15
Removing Event etype: 1 
Int8Array [ -1, 8 ]
Mesh.js:356:25
rect_mesh destroy: VB DP:0 id:69 Rect_Mesh.js:34:15
text_mesh destroy: Text-mesh [+ vb:1 | count:56] id:74 Text_Mesh.js:35:15
rect_mesh destroy: Lebel-text [+ vb:1 | count:56] id:75 Rect_Mesh.js:34:15
Removing Event etype: 1 
Int8Array [ -1, 9 ]
Mesh.js:356:25
rect_mesh destroy: VB DP:1 id:73 Rect_Mesh.js:34:15
text_mesh destroy: Text-mesh [+ vb:2 | count:504] id:78 Text_Mesh.js:35:15
rect_mesh destroy: Lebel-text [+ vb:2 | count:504] id:79 Rect_Mesh.js:34:15
Removing Event etype: 1 
Int8Array [ -1, 10 ]
Mesh.js:356:25
rect_mesh destroy: VB DP:2 id:77 Rect_Mesh.js:34:15
text_mesh destroy: Text-mesh [+ vb:3 | count:0] id:82 Text_Mesh.js:35:15
rect_mesh destroy: Lebel-text [+ vb:3 | count:0] id:83 Rect_Mesh.js:34:15
Removing Event etype: 1 
Int8Array [ -1, 11 ]
Mesh.js:356:25
rect_mesh destroy: VB DP:3 id:81 Rect_Mesh.js:34:15
rect_mesh destroy: SECTION_MESH id: 68 Rect_Mesh.js:34:15
rect_mesh destroy: Program DP:0 id:65 Rect_Mesh.js:34:15
text_mesh destroy: Text-mesh [+ prog:1] id:86 Text_Mesh.js:35:15
rect_mesh destroy: Lebel-text [+ prog:1] id:87 Rect_Mesh.js:34:15
Removing Event etype: 1 
Int8Array [ -1, 6 ]
Mesh.js:356:25
rect_mesh destroy: Program DP:1 id:85 Rect_Mesh.js:34:15
text_mesh destroy: Text-mesh [+ prog:2] id:102 Text_Mesh.js:35:15
rect_mesh destroy: Lebel-text [+ prog:2] id:103 Rect_Mesh.js:34:15
Removing Event etype: 1 
Int8Array [ -1, 7 ]
Mesh.js:356:25
rect_mesh destroy: Program DP:2 id:101 Rect_Mesh.js:34:15
rect_mesh destroy: SECTION_MESH id: 64 Rect_Mesh.js:34:15
rect_mesh destroy: InfoUi Gfx DP id:61 Rect_Mesh.js:34:15
rect_mesh destroy: InfoUi Gfx section 100 id:60 Rect_Mesh.js:34:15
Switch:  off WidgetButton.js:52:15
Widget_Switch-OnClick() WidgetButton.js:66:18
No elesments in gfx session buffer. Something went wrong GfxContext.js:143:38
Switch:  on WidgetButton.js:52:15
Widget_Switch-OnClick() WidgetButton.js:66:18
text_mesh destroy: Text-mesh [+ InfoUi Gfx DP] id:111 Text_Mesh.js:35:15
rect_mesh destroy: Lebel-text [+ InfoUi Gfx DP] id:112 Rect_Mesh.js:34:15
Removing Event etype: 1 
Int8Array [ -1, 4 ]
Mesh.js:356:25
text_mesh destroy: Text-mesh [+ prog:0] id:115 Text_Mesh.js:35:15
rect_mesh destroy: Lebel-text [+ prog:0] id:116 Rect_Mesh.js:34:15
Removing Event etype: 1 
Int8Array [ -1, 5 ]
Mesh.js:356:25
text_mesh destroy: Text-mesh [+ vb:0 | count:56] id:119 Text_Mesh.js:35:15
rect_mesh destroy: Lebel-text [+ vb:0 | count:56] id:120 Rect_Mesh.js:34:15
Removing Event etype: 1 
Int8Array [ -1, 8 ]
Mesh.js:356:25
rect_mesh destroy: VB DP:0 id:118 Rect_Mesh.js:34:15
text_mesh destroy: Text-mesh [+ vb:1 | count:56] id:123 Text_Mesh.js:35:15
rect_mesh destroy: Lebel-text [+ vb:1 | count:56] id:124 Rect_Mesh.js:34:15
Removing Event etype: 1 
Int8Array [ -1, 9 ]
Mesh.js:356:25
rect_mesh destroy: VB DP:1 id:122 Rect_Mesh.js:34:15
text_mesh destroy: Text-mesh [+ vb:2 | count:504] id:127 Text_Mesh.js:35:15
rect_mesh destroy: Lebel-text [+ vb:2 | count:504] id:128 Rect_Mesh.js:34:15
Removing Event etype: 1 
Int8Array [ -1, 10 ]
Mesh.js:356:25
rect_mesh destroy: VB DP:2 id:126 Rect_Mesh.js:34:15
text_mesh destroy: Text-mesh [+ vb:3 | count:0] id:131 Text_Mesh.js:35:15
rect_mesh destroy: Lebel-text [+ vb:3 | count:0] id:132 Rect_Mesh.js:34:15
Removing Event etype: 1 
Int8Array [ -1, 11 ]
Mesh.js:356:25
rect_mesh destroy: VB DP:3 id:130 Rect_Mesh.js:34:15
text_mesh destroy: Text-mesh [+ vb:4 | count:0] id:135 Text_Mesh.js:35:15
rect_mesh destroy: Lebel-text [+ vb:4 | count:0] id:136 Rect_Mesh.js:34:15
Removing Event etype: 1 
Int8Array [ -1, 12 ]
Mesh.js:356:25
rect_mesh destroy: VB DP:4 id:134 Rect_Mesh.js:34:15
text_mesh destroy: Text-mesh [+ vb:5 | count:0] id:139 Text_Mesh.js:35:15
rect_mesh destroy: Lebel-text [+ vb:5 | count:0] id:140 Rect_Mesh.js:34:15
Removing Event etype: 1 
Int8Array [ -1, 13 ]
Mesh.js:356:25
rect_mesh destroy: VB DP:5 id:138 Rect_Mesh.js:34:15
rect_mesh destroy: SECTION_MESH id: 117 Rect_Mesh.js:34:15
rect_mesh destroy: Program DP:0 id:114 Rect_Mesh.js:34:15
text_mesh destroy: Text-mesh [+ prog:1] id:143 Text_Mesh.js:35:15
rect_mesh destroy: Lebel-text [+ prog:1] id:144 Rect_Mesh.js:34:15
Removing Event etype: 1 
Int8Array [ -1, 6 ]
Mesh.js:356:25
rect_mesh destroy: Program DP:1 id:142 Rect_Mesh.js:34:15
text_mesh destroy: Text-mesh [+ prog:2] id:167 Text_Mesh.js:35:15
rect_mesh destroy: Lebel-text [+ prog:2] id:168 Rect_Mesh.js:34:15
Removing Event etype: 1 
Int8Array [ -1, 7 ]
Mesh.js:356:25
rect_mesh destroy: Program DP:2 id:166 Rect_Mesh.js:34:15
rect_mesh destroy: SECTION_MESH id: 113 Rect_Mesh.js:34:15
rect_mesh destroy: InfoUi Gfx DP id:110 Rect_Mesh.js:34:15
rect_mesh destroy: InfoUi Gfx section 100 id:109 Rect_Mesh.js:34:15
Switch:  off WidgetButton.js:52:15
Widget_Switch-OnClick() WidgetButton.js:66:18
No elesments in gfx session buffer. Something went wrong GfxContext.js:143:38
x Keys.js:56:18
-[Gl Vertex Buffer]- GfxDebug.js:180:13
 progidx: 0 GfxDebug.js:182:17
vb: 
Array(8) [ {…}, {…}, {…}, {…}, {…}, {…}, {…}, {…} ]
GfxDebug.js:183:17
 progidx: 1 GfxDebug.js:182:17
vb: 
Array(7) [ {…}, {…}, {…}, {…}, {…}, {…}, {…} ]
GfxDebug.js:183:17
 progidx: 2 GfxDebug.js:182:17
vb: 
Array [ {…} ]
GfxDebug.js:183:17
Switch:  on WidgetButton.js:52:15
Widget_Switch-OnClick() WidgetButton.js:66:18
text_mesh destroy: Text-mesh [+ InfoUi Gfx DP] id:176 Text_Mesh.js:35:15
rect_mesh destroy: Lebel-text [+ InfoUi Gfx DP] id:177 Rect_Mesh.js:34:15
Removing Event etype: 1 
Int8Array [ -1, 4 ]
Mesh.js:356:25
text_mesh destroy: Text-mesh [+ prog:0] id:180 Text_Mesh.js:35:15
rect_mesh destroy: Lebel-text [+ prog:0] id:181 Rect_Mesh.js:34:15
Removing Event etype: 1 
Int8Array [ -1, 5 ]
Mesh.js:356:25
text_mesh destroy: Text-mesh [+ vb:0 | count:56] id:184 Text_Mesh.js:35:15
rect_mesh destroy: Lebel-text [+ vb:0 | count:56] id:185 Rect_Mesh.js:34:15
Removing Event etype: 1 
Int8Array [ -1, 8 ]
Mesh.js:356:25
rect_mesh destroy: VB DP:0 id:183 Rect_Mesh.js:34:15
text_mesh destroy: Text-mesh [+ vb:1 | count:56] id:188 Text_Mesh.js:35:15
rect_mesh destroy: Lebel-text [+ vb:1 | count:56] id:189 Rect_Mesh.js:34:15
Removing Event etype: 1 
Int8Array [ -1, 9 ]
Mesh.js:356:25
rect_mesh destroy: VB DP:1 id:187 Rect_Mesh.js:34:15
text_mesh destroy: Text-mesh [+ vb:2 | count:504] id:192 Text_Mesh.js:35:15
rect_mesh destroy: Lebel-text [+ vb:2 | count:504] id:193 Rect_Mesh.js:34:15
Removing Event etype: 1 
Int8Array [ -1, 10 ]
Mesh.js:356:25
rect_mesh destroy: VB DP:2 id:191 Rect_Mesh.js:34:15
text_mesh destroy: Text-mesh [+ vb:3 | count:0] id:196 Text_Mesh.js:35:15
rect_mesh destroy: Lebel-text [+ vb:3 | count:0] id:197 Rect_Mesh.js:34:15
Removing Event etype: 1 
Int8Array [ -1, 11 ]
Mesh.js:356:25
rect_mesh destroy: VB DP:3 id:195 Rect_Mesh.js:34:15
text_mesh destroy: Text-mesh [+ vb:4 | count:0] id:200 Text_Mesh.js:35:15
rect_mesh destroy: Lebel-text [+ vb:4 | count:0] id:201 Rect_Mesh.js:34:15
Removing Event etype: 1 
Int8Array [ -1, 12 ]
Mesh.js:356:25
rect_mesh destroy: VB DP:4 id:199 Rect_Mesh.js:34:15
text_mesh destroy: Text-mesh [+ vb:5 | count:0] id:204 Text_Mesh.js:35:15
rect_mesh destroy: Lebel-text [+ vb:5 | count:0] id:205 Rect_Mesh.js:34:15
Removing Event etype: 1 
Int8Array [ -1, 13 ]
Mesh.js:356:25
rect_mesh destroy: VB DP:5 id:203 Rect_Mesh.js:34:15
rect_mesh destroy: SECTION_MESH id: 182 Rect_Mesh.js:34:15
rect_mesh destroy: Program DP:0 id:179 Rect_Mesh.js:34:15
text_mesh destroy: Text-mesh [+ prog:1] id:208 Text_Mesh.js:35:15
rect_mesh destroy: Lebel-text [+ prog:1] id:209 Rect_Mesh.js:34:15
Removing Event etype: 1 
Int8Array [ -1, 6 ]
Mesh.js:356:25
text_mesh destroy: Text-mesh [+ vb:0 | count:1288] id:212 Text_Mesh.js:35:15
rect_mesh destroy: Lebel-text [+ vb:0 | count:1288] id:213 Rect_Mesh.js:34:15
Removing Event etype: 1 
Int8Array [ -1, 14 ]
Mesh.js:356:25
rect_mesh destroy: VB DP:0 id:211 Rect_Mesh.js:34:15
text_mesh destroy: Text-mesh [+ vb:1 | count:2912] id:216 Text_Mesh.js:35:15
rect_mesh destroy: Lebel-text [+ vb:1 | count:2912] id:217 Rect_Mesh.js:34:15
Removing Event etype: 1 
Int8Array [ -1, 15 ]
Mesh.js:356:25
rect_mesh destroy: VB DP:1 id:215 Rect_Mesh.js:34:15
text_mesh destroy: Text-mesh [+ vb:2 | count:0] id:220 Text_Mesh.js:35:15
rect_mesh destroy: Lebel-text [+ vb:2 | count:0] id:221 Rect_Mesh.js:34:15
Removing Event etype: 1 
Int8Array [ -1, 16 ]
Mesh.js:356:25
rect_mesh destroy: VB DP:2 id:219 Rect_Mesh.js:34:15
text_mesh destroy: Text-mesh [+ vb:3 | count:0] id:224 Text_Mesh.js:35:15
rect_mesh destroy: Lebel-text [+ vb:3 | count:0] id:225 Rect_Mesh.js:34:15
Removing Event etype: 1 
Int8Array [ -1, 17 ]
Mesh.js:356:25
rect_mesh destroy: VB DP:3 id:223 Rect_Mesh.js:34:15
text_mesh destroy: Text-mesh [+ vb:4 | count:0] id:228 Text_Mesh.js:35:15
rect_mesh destroy: Lebel-text [+ vb:4 | count:0] id:229 Rect_Mesh.js:34:15
Removing Event etype: 1 
Int8Array [ -1, 18 ]
Mesh.js:356:25
rect_mesh destroy: VB DP:4 id:227 Rect_Mesh.js:34:15
rect_mesh destroy: SECTION_MESH id: 210 Rect_Mesh.js:34:15
rect_mesh destroy: Program DP:1 id:207 Rect_Mesh.js:34:15
text_mesh destroy: Text-mesh [+ prog:2] id:232 Text_Mesh.js:35:15
rect_mesh destroy: Lebel-text [+ prog:2] id:233 Rect_Mesh.js:34:15
Removing Event etype: 1 
Int8Array [ -1, 7 ]
Mesh.js:356:25
text_mesh destroy: Text-mesh [+ vb:0 | count:56] id:236 Text_Mesh.js:35:15
rect_mesh destroy: Lebel-text [+ vb:0 | count:56] id:237 Rect_Mesh.js:34:15
Removing Event etype: 1 
Int8Array [ -1, 19 ]
Mesh.js:356:25
rect_mesh destroy: VB DP:0 id:235 Rect_Mesh.js:34:15
rect_mesh destroy: SECTION_MESH id: 234 Rect_Mesh.js:34:15
rect_mesh destroy: Program DP:2 id:231 Rect_Mesh.js:34:15
rect_mesh destroy: SECTION_MESH id: 178 Rect_Mesh.js:34:15
rect_mesh destroy: InfoUi Gfx DP id:175 Rect_Mesh.js:34:15
rect_mesh destroy: InfoUi Gfx section 100 id:174 Rect_Mesh.js:34:15
Switch:  off WidgetButton.js:52:15
Widget_Switch-OnClick() WidgetButton.js:66:18
No elesments in gfx session buffer. Something went wrong GfxContext.js:143:38
x Keys.js:56:18
-[Gl Vertex Buffer]- GfxDebug.js:180:13
 progidx: 0 GfxDebug.js:182:17
vb: 
Array(8) [ {…}, {…}, {…}, {…}, {…}, {…}, {…}, {…} ]
GfxDebug.js:183:17
 progidx: 1 GfxDebug.js:182:17
vb: 
Array(7) [ {…}, {…}, {…}, {…}, {…}, {…}, {…} ]
GfxDebug.js:183:17
 progidx: 2 GfxDebug.js:182:17
vb: 
Array [ {…} ]
GfxDebug.js:183:17
Switch:  off WidgetButton.js:52:15
Widget_Switch-OnClick() WidgetButton.js:66:18
Switch:  off WidgetButton.js:52:15
Widget_Switch-OnClick() WidgetButton.js:66:18
Switch:  on WidgetButton.js:52:15
Widget_Switch-OnClick() WidgetButton.js:66:18
text_mesh destroy: Text-mesh [+ InfoUi Gfx DP] id:241 Text_Mesh.js:35:15
rect_mesh destroy: Lebel-text [+ InfoUi Gfx DP] id:242 Rect_Mesh.js:34:15
Removing Event etype: 1 
Int8Array [ -1, 4 ]
Mesh.js:356:25
text_mesh destroy: Text-mesh [+ prog:0] id:245 Text_Mesh.js:35:15
rect_mesh destroy: Lebel-text [+ prog:0] id:246 Rect_Mesh.js:34:15
Removing Event etype: 1 
Int8Array [ -1, 5 ]
Mesh.js:356:25
text_mesh destroy: Text-mesh [+ vb:0 | count:56] id:249 Text_Mesh.js:35:15
rect_mesh destroy: Lebel-text [+ vb:0 | count:56] id:250 Rect_Mesh.js:34:15
Removing Event etype: 1 
Int8Array [ -1, 8 ]
Mesh.js:356:25
rect_mesh destroy: VB DP:0 id:248 Rect_Mesh.js:34:15
text_mesh destroy: Text-mesh [+ vb:1 | count:56] id:253 Text_Mesh.js:35:15
rect_mesh destroy: Lebel-text [+ vb:1 | count:56] id:254 Rect_Mesh.js:34:15
Removing Event etype: 1 
Int8Array [ -1, 9 ]
Mesh.js:356:25
rect_mesh destroy: VB DP:1 id:252 Rect_Mesh.js:34:15
text_mesh destroy: Text-mesh [+ vb:2 | count:504] id:257 Text_Mesh.js:35:15
rect_mesh destroy: Lebel-text [+ vb:2 | count:504] id:258 Rect_Mesh.js:34:15
Removing Event etype: 1 
Int8Array [ -1, 10 ]
Mesh.js:356:25
rect_mesh destroy: VB DP:2 id:256 Rect_Mesh.js:34:15
text_mesh destroy: Text-mesh [+ vb:3 | count:0] id:261 Text_Mesh.js:35:15
rect_mesh destroy: Lebel-text [+ vb:3 | count:0] id:262 Rect_Mesh.js:34:15
Removing Event etype: 1 
Int8Array [ -1, 11 ]
Mesh.js:356:25
rect_mesh destroy: VB DP:3 id:260 Rect_Mesh.js:34:15
text_mesh destroy: Text-mesh [+ vb:4 | count:0] id:265 Text_Mesh.js:35:15
rect_mesh destroy: Lebel-text [+ vb:4 | count:0] id:266 Rect_Mesh.js:34:15
Removing Event etype: 1 
Int8Array [ -1, 12 ]
Mesh.js:356:25
rect_mesh destroy: VB DP:4 id:264 Rect_Mesh.js:34:15
text_mesh destroy: Text-mesh [+ vb:5 | count:0] id:269 Text_Mesh.js:35:15
rect_mesh destroy: Lebel-text [+ vb:5 | count:0] id:270 Rect_Mesh.js:34:15
Removing Event etype: 1 
Int8Array [ -1, 13 ]
Mesh.js:356:25
rect_mesh destroy: VB DP:5 id:268 Rect_Mesh.js:34:15
text_mesh destroy: Text-mesh [+ vb:6 | count:0] id:273 Text_Mesh.js:35:15
rect_mesh destroy: Lebel-text [+ vb:6 | count:0] id:274 Rect_Mesh.js:34:15
Removing Event etype: 1 
Int8Array [ -1, 14 ]
Mesh.js:356:25
rect_mesh destroy: VB DP:6 id:272 Rect_Mesh.js:34:15
text_mesh destroy: Text-mesh [+ vb:7 | count:0] id:277 Text_Mesh.js:35:15
rect_mesh destroy: Lebel-text [+ vb:7 | count:0] id:278 Rect_Mesh.js:34:15
Removing Event etype: 1 
Int8Array [ -1, 15 ]
Mesh.js:356:25
rect_mesh destroy: VB DP:7 id:276 Rect_Mesh.js:34:15
rect_mesh destroy: SECTION_MESH id: 247 Rect_Mesh.js:34:15
rect_mesh destroy: Program DP:0 id:244 Rect_Mesh.js:34:15
text_mesh destroy: Text-mesh [+ prog:1] id:281 Text_Mesh.js:35:15
rect_mesh destroy: Lebel-text [+ prog:1] id:282 Rect_Mesh.js:34:15
Removing Event etype: 1 
Int8Array [ -1, 6 ]
Mesh.js:356:25
text_mesh destroy: Text-mesh [+ vb:0 | count:1288] id:285 Text_Mesh.js:35:15
rect_mesh destroy: Lebel-text [+ vb:0 | count:1288] id:286 Rect_Mesh.js:34:15
Removing Event etype: 1 
Int8Array [ -1, 16 ]
Mesh.js:356:25
rect_mesh destroy: VB DP:0 id:284 Rect_Mesh.js:34:15
text_mesh destroy: Text-mesh [+ vb:1 | count:2912] id:289 Text_Mesh.js:35:15
rect_mesh destroy: Lebel-text [+ vb:1 | count:2912] id:290 Rect_Mesh.js:34:15
Removing Event etype: 1 
Int8Array [ -1, 17 ]
Mesh.js:356:25
rect_mesh destroy: VB DP:1 id:288 Rect_Mesh.js:34:15
text_mesh destroy: Text-mesh [+ vb:2 | count:0] id:293 Text_Mesh.js:35:15
rect_mesh destroy: Lebel-text [+ vb:2 | count:0] id:294 Rect_Mesh.js:34:15
Removing Event etype: 1 
Int8Array [ -1, 18 ]
Mesh.js:356:25
rect_mesh destroy: VB DP:2 id:292 Rect_Mesh.js:34:15
text_mesh destroy: Text-mesh [+ vb:3 | count:0] id:297 Text_Mesh.js:35:15
rect_mesh destroy: Lebel-text [+ vb:3 | count:0] id:298 Rect_Mesh.js:34:15
Removing Event etype: 1 
Int8Array [ -1, 19 ]
Mesh.js:356:25
rect_mesh destroy: VB DP:3 id:296 Rect_Mesh.js:34:15
text_mesh destroy: Text-mesh [+ vb:4 | count:0] id:301 Text_Mesh.js:35:15
rect_mesh destroy: Lebel-text [+ vb:4 | count:0] id:302 Rect_Mesh.js:34:15
Removing Event etype: 1 
Int8Array [ -1, 20 ]
Mesh.js:356:25
rect_mesh destroy: VB DP:4 id:300 Rect_Mesh.js:34:15
text_mesh destroy: Text-mesh [+ vb:5 | count:0] id:305 Text_Mesh.js:35:15
rect_mesh destroy: Lebel-text [+ vb:5 | count:0] id:306 Rect_Mesh.js:34:15
Removing Event etype: 1 
Int8Array [ -1, 21 ]
Mesh.js:356:25
rect_mesh destroy: VB DP:5 id:304 Rect_Mesh.js:34:15
text_mesh destroy: Text-mesh [+ vb:6 | count:0] id:309 Text_Mesh.js:35:15
rect_mesh destroy: Lebel-text [+ vb:6 | count:0] id:310 Rect_Mesh.js:34:15
Removing Event etype: 1 
Int8Array [ -1, 22 ]
Mesh.js:356:25
rect_mesh destroy: VB DP:6 id:308 Rect_Mesh.js:34:15
rect_mesh destroy: SECTION_MESH id: 283 Rect_Mesh.js:34:15
rect_mesh destroy: Program DP:1 id:280 Rect_Mesh.js:34:15
text_mesh destroy: Text-mesh [+ prog:2] id:313 Text_Mesh.js:35:15
rect_mesh destroy: Lebel-text [+ prog:2] id:314 Rect_Mesh.js:34:15
Removing Event etype: 1 
Int8Array [ -1, 7 ]
Mesh.js:356:25
text_mesh destroy: Text-mesh [+ vb:0 | count:56] id:317 Text_Mesh.js:35:15
rect_mesh destroy: Lebel-text [+ vb:0 | count:56] id:318 Rect_Mesh.js:34:15
Removing Event etype: 1 
Int8Array [ -1, 23 ]
Mesh.js:356:25
rect_mesh destroy: VB DP:0 id:316 Rect_Mesh.js:34:15
rect_mesh destroy: SECTION_MESH id: 315 Rect_Mesh.js:34:15
rect_mesh destroy: Program DP:2 id:312 Rect_Mesh.js:34:15
rect_mesh destroy: SECTION_MESH id: 243 Rect_Mesh.js:34:15
rect_mesh destroy: InfoUi Gfx DP id:240 Rect_Mesh.js:34:15
rect_mesh destroy: InfoUi Gfx section 100 id:239 Rect_Mesh.js:34:15
Switch:  off WidgetButton.js:52:15
Widget_Switch-OnClick() WidgetButton.js:66:18
No elesments in gfx session buffer. Something went wrong GfxContext.js:143:38
x Keys.js:56:18
-[Gl Vertex Buffer]- GfxDebug.js:180:13
 progidx: 0 GfxDebug.js:182:17
vb: 
Array(10) [ {…}, {…}, {…}, {…}, {…}, {…}, {…}, {…}, {…}, {…} ]
GfxDebug.js:183:17
 progidx: 1 GfxDebug.js:182:17
vb: 
Array(9) [ {…}, {…}, {…}, {…}, {…}, {…}, {…}, {…}, {…} ]
GfxDebug.js:183:17
 progidx: 2 GfxDebug.js:182:17
vb: 
Array [ {…} ]
GfxDebug.js:183:17
Switch:  on WidgetButton.js:52:15
Widget_Switch-OnClick() WidgetButton.js:66:18
text_mesh destroy: Text-mesh [+ InfoUi Gfx DP] id:341 Text_Mesh.js:35:15
rect_mesh destroy: Lebel-text [+ InfoUi Gfx DP] id:342 Rect_Mesh.js:34:15
Removing Event etype: 1 
Int8Array [ -1, 4 ]
Mesh.js:356:25
text_mesh destroy: Text-mesh [+ prog:0] id:345 Text_Mesh.js:35:15
rect_mesh destroy: Lebel-text [+ prog:0] id:346 Rect_Mesh.js:34:15
Removing Event etype: 1 
Int8Array [ -1, 5 ]
Mesh.js:356:25
text_mesh destroy: Text-mesh [+ vb:0 | count:56] id:349 Text_Mesh.js:35:15
rect_mesh destroy: Lebel-text [+ vb:0 | count:56] id:350 Rect_Mesh.js:34:15
Removing Event etype: 1 
Int8Array [ -1, 8 ]
Mesh.js:356:25
rect_mesh destroy: VB DP:0 id:348 Rect_Mesh.js:34:15
text_mesh destroy: Text-mesh [+ vb:1 | count:56] id:353 Text_Mesh.js:35:15
rect_mesh destroy: Lebel-text [+ vb:1 | count:56] id:354 Rect_Mesh.js:34:15
Removing Event etype: 1 
Int8Array [ -1, 9 ]
Mesh.js:356:25
rect_mesh destroy: VB DP:1 id:352 Rect_Mesh.js:34:15
text_mesh destroy: Text-mesh [+ vb:2 | count:504] id:357 Text_Mesh.js:35:15
rect_mesh destroy: Lebel-text [+ vb:2 | count:504] id:358 Rect_Mesh.js:34:15
Removing Event etype: 1 
Int8Array [ -1, 10 ]
Mesh.js:356:25
rect_mesh destroy: VB DP:2 id:356 Rect_Mesh.js:34:15
text_mesh destroy: Text-mesh [+ vb:3 | count:0] id:361 Text_Mesh.js:35:15
rect_mesh destroy: Lebel-text [+ vb:3 | count:0] id:362 Rect_Mesh.js:34:15
Removing Event etype: 1 
Int8Array [ -1, 11 ]
Mesh.js:356:25
rect_mesh destroy: VB DP:3 id:360 Rect_Mesh.js:34:15
text_mesh destroy: Text-mesh [+ vb:4 | count:0] id:365 Text_Mesh.js:35:15
rect_mesh destroy: Lebel-text [+ vb:4 | count:0] id:366 Rect_Mesh.js:34:15
Removing Event etype: 1 
Int8Array [ -1, 12 ]
Mesh.js:356:25
rect_mesh destroy: VB DP:4 id:364 Rect_Mesh.js:34:15
text_mesh destroy: Text-mesh [+ vb:5 | count:0] id:369 Text_Mesh.js:35:15
rect_mesh destroy: Lebel-text [+ vb:5 | count:0] id:370 Rect_Mesh.js:34:15
Removing Event etype: 1 
Int8Array [ -1, 13 ]
Mesh.js:356:25
rect_mesh destroy: VB DP:5 id:368 Rect_Mesh.js:34:15
text_mesh destroy: Text-mesh [+ vb:6 | count:0] id:373 Text_Mesh.js:35:15
rect_mesh destroy: Lebel-text [+ vb:6 | count:0] id:374 Rect_Mesh.js:34:15
Removing Event etype: 1 
Int8Array [ -1, 14 ]
Mesh.js:356:25
rect_mesh destroy: VB DP:6 id:372 Rect_Mesh.js:34:15
text_mesh destroy: Text-mesh [+ vb:7 | count:0] id:377 Text_Mesh.js:35:15
rect_mesh destroy: Lebel-text [+ vb:7 | count:0] id:378 Rect_Mesh.js:34:15
Removing Event etype: 1 
Int8Array [ -1, 15 ]
Mesh.js:356:25
rect_mesh destroy: VB DP:7 id:376 Rect_Mesh.js:34:15
text_mesh destroy: Text-mesh [+ vb:8 | count:56] id:381 Text_Mesh.js:35:15
rect_mesh destroy: Lebel-text [+ vb:8 | count:56] id:382 Rect_Mesh.js:34:15
Removing Event etype: 1 
Int8Array [ -1, 16 ]
Mesh.js:356:25
rect_mesh destroy: VB DP:8 id:380 Rect_Mesh.js:34:15
text_mesh destroy: Text-mesh [+ vb:9 | count:56] id:385 Text_Mesh.js:35:15
rect_mesh destroy: Lebel-text [+ vb:9 | count:56] id:386 Rect_Mesh.js:34:15
Removing Event etype: 1 
Int8Array [ -1, 17 ]
Mesh.js:356:25
rect_mesh destroy: VB DP:9 id:384 Rect_Mesh.js:34:15
rect_mesh destroy: SECTION_MESH id: 347 Rect_Mesh.js:34:15
rect_mesh destroy: Program DP:0 id:344 Rect_Mesh.js:34:15
text_mesh destroy: Text-mesh [+ prog:1] id:389 Text_Mesh.js:35:15
rect_mesh destroy: Lebel-text [+ prog:1] id:390 Rect_Mesh.js:34:15
Removing Event etype: 1 
Int8Array [ -1, 6 ]
Mesh.js:356:25
text_mesh destroy: Text-mesh [+ vb:0 | count:1288] id:393 Text_Mesh.js:35:15
rect_mesh destroy: Lebel-text [+ vb:0 | count:1288] id:394 Rect_Mesh.js:34:15
Removing Event etype: 1 
Int8Array [ -1, 18 ]
Mesh.js:356:25
rect_mesh destroy: VB DP:0 id:392 Rect_Mesh.js:34:15
text_mesh destroy: Text-mesh [+ vb:1 | count:2912] id:397 Text_Mesh.js:35:15
rect_mesh destroy: Lebel-text [+ vb:1 | count:2912] id:398 Rect_Mesh.js:34:15
Removing Event etype: 1 
Int8Array [ -1, 19 ]
Mesh.js:356:25
rect_mesh destroy: VB DP:1 id:396 Rect_Mesh.js:34:15
text_mesh destroy: Text-mesh [+ vb:2 | count:0] id:401 Text_Mesh.js:35:15
rect_mesh destroy: Lebel-text [+ vb:2 | count:0] id:402 Rect_Mesh.js:34:15
Removing Event etype: 1 
Int8Array [ -1, 20 ]
Mesh.js:356:25
rect_mesh destroy: VB DP:2 id:400 Rect_Mesh.js:34:15
text_mesh destroy: Text-mesh [+ vb:3 | count:0] id:405 Text_Mesh.js:35:15
rect_mesh destroy: Lebel-text [+ vb:3 | count:0] id:406 Rect_Mesh.js:34:15
Removing Event etype: 1 
Int8Array [ -1, 21 ]
Mesh.js:356:25
rect_mesh destroy: VB DP:3 id:404 Rect_Mesh.js:34:15
text_mesh destroy: Text-mesh [+ vb:4 | count:0] id:409 Text_Mesh.js:35:15
rect_mesh destroy: Lebel-text [+ vb:4 | count:0] id:410 Rect_Mesh.js:34:15
Removing Event etype: 1 
Int8Array [ -1, 22 ]
Mesh.js:356:25
rect_mesh destroy: VB DP:4 id:408 Rect_Mesh.js:34:15
text_mesh destroy: Text-mesh [+ vb:5 | count:0] id:413 Text_Mesh.js:35:15
rect_mesh destroy: Lebel-text [+ vb:5 | count:0] id:414 Rect_Mesh.js:34:15
Removing Event etype: 1 
Int8Array [ -1, 23 ]
Mesh.js:356:25
rect_mesh destroy: VB DP:5 id:412 Rect_Mesh.js:34:15
text_mesh destroy: Text-mesh [+ vb:6 | count:0] id:417 Text_Mesh.js:35:15
rect_mesh destroy: Lebel-text [+ vb:6 | count:0] id:418 Rect_Mesh.js:34:15
Removing Event etype: 1 
Int8Array [ -1, 26 ]
Mesh.js:356:25
rect_mesh destroy: VB DP:6 id:416 Rect_Mesh.js:34:15
text_mesh destroy: Text-mesh [+ vb:7 | count:2688] id:421 Text_Mesh.js:35:15
rect_mesh destroy: Lebel-text [+ vb:7 | count:2688] id:422 Rect_Mesh.js:34:15
Removing Event etype: 1 
Int8Array [ -1, 27 ]
Mesh.js:356:25
rect_mesh destroy: VB DP:7 id:420 Rect_Mesh.js:34:15
text_mesh destroy: Text-mesh [+ vb:8 | count:6496] id:425 Text_Mesh.js:35:15
rect_mesh destroy: Lebel-text [+ vb:8 | count:6496] id:426 Rect_Mesh.js:34:15
Removing Event etype: 1 
Int8Array [ -1, 28 ]
Mesh.js:356:25
rect_mesh destroy: VB DP:8 id:424 Rect_Mesh.js:34:15
rect_mesh destroy: SECTION_MESH id: 391 Rect_Mesh.js:34:15
rect_mesh destroy: Program DP:1 id:388 Rect_Mesh.js:34:15
text_mesh destroy: Text-mesh [+ prog:2] id:429 Text_Mesh.js:35:15
rect_mesh destroy: Lebel-text [+ prog:2] id:430 Rect_Mesh.js:34:15
Removing Event etype: 1 
Int8Array [ -1, 7 ]
Mesh.js:356:25
text_mesh destroy: Text-mesh [+ vb:0 | count:56] id:433 Text_Mesh.js:35:15
rect_mesh destroy: Lebel-text [+ vb:0 | count:56] id:434 Rect_Mesh.js:34:15
Removing Event etype: 1 
Int8Array [ -1, 29 ]
Mesh.js:356:25
rect_mesh destroy: VB DP:0 id:432 Rect_Mesh.js:34:15
rect_mesh destroy: SECTION_MESH id: 431 Rect_Mesh.js:34:15
rect_mesh destroy: Program DP:2 id:428 Rect_Mesh.js:34:15
rect_mesh destroy: SECTION_MESH id: 343 Rect_Mesh.js:34:15
rect_mesh destroy: InfoUi Gfx DP id:340 Rect_Mesh.js:34:15
rect_mesh destroy: InfoUi Gfx section 100 id:339 Rect_Mesh.js:34:15
Switch:  off WidgetButton.js:52:15
Widget_Switch-OnClick() WidgetButton.js:66:18
No elesments in gfx session buffer. Something went wrong GfxContext.js:143:38
Clicked: ui performance timers panel id:324 Section.js:239:18

 */