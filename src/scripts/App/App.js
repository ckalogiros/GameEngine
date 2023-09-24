"use strict";
import { Scenes_create_scene, Scenes_debug_info_create } from '../Engine/Scenes.js'
import { RenderQueueGet, RenderQueueInit } from '../Engine/Renderers/Renderer/RenderQueue.js';
import { WebGlRenderer } from '../Engine/Renderers/WebGlRenderer.js';
import { CameraOrthographic } from '../Engine/Renderers/Renderer/Camera.js';
import { TextureInitBuffers } from '../Engine/Loaders/Textures/Texture.js';
import { PerformanceTimerGetFps1sAvg, TimeGetDeltaAvg, TimeGetFps, TimeGetTimer, _fps_100ms_avg, _fps_1s_avg, _fps_200ms_avg, _fps_500ms_avg } from '../Engine/Timers/Time.js';
import { Widget_Label_Dynamic_Text, Widget_Label, Widget_Label_Text_Mesh_Menu_Options } from '../Engine/Drawables/Meshes/Widgets/WidgetLabel.js';
import { Widget_Button, Widget_Switch } from '../Engine/Drawables/Meshes/Widgets/WidgetButton.js';
import { Widget_Text, Widget_Dynamic_Text_Mesh, Widget_Dynamic_Text_Mesh_Only } from '../Engine/Drawables/Meshes/Widgets/WidgetText.js';
import { CubeGeometry } from '../Engine/Drawables/Geometry/Geometry3DCube.js';
// import { PerformanceTimerCreate, PerformanceTimerInit, PerformanceTimersGetFps, PerformanceTimersGetMilisec, _Tm1GetFps, _Tm1GetMilisec, _Tm1GetNanosec, _Tm2GetFps, _Tm2GetMilisec, _Tm3GetFps, _Tm3GetMilisec, _Tm5GetFps, _Tm5GetMilisec, _Tm6GetFps, _Tm6GetMilisec } from '../Engine/Timers/PerformanceTimers.js';
import { PerformanceTimerCreate, PerformanceTimerInit, PerformanceTimersGetCurTime, PerformanceTimersGetFps, PerformanceTimersGetMilisec } from '../Engine/Timers/PerformanceTimers.js';
import {  TimeIntervalsCreate, TimeIntervalsInit } from '../Engine/Timers/TimeIntervals.js';
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
import { Gl_remove_geometry } from '../Graphics/Buffers/GlBuffers.js';
import { Drop_down_set_root, Drop_down_set_root_for_debug, Widget_Drop_Down } from '../Engine/Drawables/Meshes/Widgets/Menu/Widget_Drop_Down.js';
import { Info_listener_create_event, Info_listener_dispatch_event } from '../Engine/DebugInfo/InfoListeners.js';
import { GlGetPrograms } from '../Graphics/GlProgram.js';
import { Input_create_user_input_listeners } from '../Engine/Controls/Input/Input.js';
import { Debug_info_create_ui_performance_timers, Debug_info_ui_performance } from '../Engine/DebugInfo/DebugInfoUi.js';


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
    RenderQueueInit();
    // Initializer_popup_initialization();


    /* * * * * * * * * * * * * * * * * * * * * * * * * * *
     * Create meshes
     */

    // Debug_info_ui_performance(scene);


    const label = CreateLabel(scene);
    // DestroyMeshTest(scene, label)
    // const button = CreateButton(scene); // DestroyMeshTest(scene, button)
    // const switch1 = CreateSwitch(scene) // DestroyMeshTest(scene, switch1)

    // const menu = CreateMenu(scene)

    // CreateSliders(scene)
    // CreateSlidersSectioned(scene)
    // CreateMenuBar(scene, 3)
    // CreateAndAddMenuBarSectioned(scene, 4);
    // CreateMinimizer(scene);
    // Test_drop_down_widget(scene)
    
    // Help(scene)
    // CreateSection(scene)
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

    const progs = GlGetPrograms();
    console.log(progs)
    
    
    RenderQueueGet().SetPriorityProgram('last', 1, 0);
    RenderQueueGet().UpdateActiveQueue();

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

function CreateLabel(scene){

    const label = new Widget_Label('Label', ALIGN.HOR_CENTER|ALIGN.VERT_CENTER, [200, 400, 0], 5, GREY1, WHITE, [4,4], .5);
    label.CreateListenEvent(LISTEN_EVENT_TYPES.MOVE)
    label.CreateListenEvent(LISTEN_EVENT_TYPES.HOVER);
    label.area_mesh.StateEnable(MESH_STATE.IS_HOVER_COLORABLE);

    
    scene.AddWidget(label)
    label.text_mesh.SetColorRGB(RED);

    label.Render()
    label.Align(ALIGN.LEFT, label.area_mesh, label.text_mesh, [0,0]);


    console.log(label)

    return label;
}

function CreateButton(scene) {

    let ypos = 100
    const btn1 = new Widget_Button('Button', ALIGN.HOR_CENTER|ALIGN.VERT_CENTER, [30, ypos, 0], 5, GREY1, WHITE, [4,4], .5);
    // btn1.CreateListenEvent(LISTEN_EVENT_TYPES.MOVE)
    btn1.CreateListenEvent(LISTEN_EVENT_TYPES.CLICK_DOWN)
    btn1.CreateListenEvent(LISTEN_EVENT_TYPES.HOVER)
    btn1.area_mesh.StateEnable(MESH_STATE.IS_HOVER_COLORABLE)
    btn1.area_mesh.EnableGfxAttributes(MESH_ENABLE.GFX.ATTR_STYLE, { style: [6, 6, 3] })
    scene.AddWidget(btn1, GFX.PRIVATE);
    btn1.text_mesh.SetColorRGB(BLUE_10_120_220);

    return btn1;
}

function DestroyMeshTest(scene, widget) {
    
    const customCallback = function(params){

        console.log('Destroy Text mesh test:', widget.area_mesh.name );
        widget.Destroy();
    }
    const btn1 = new Widget_Button('Destroy', ALIGN.HOR_CENTER|ALIGN.VERT_CENTER, [200, 100, 0], 5, GREY1, WHITE, [4,4], .5);
    btn1.CreateListenEvent(LISTEN_EVENT_TYPES.CLICK_DOWN, customCallback)
    btn1.CreateListenEvent(LISTEN_EVENT_TYPES.HOVER)
    btn1.area_mesh.StateEnable(MESH_STATE.IS_HOVER_COLORABLE)
    btn1.area_mesh.EnableGfxAttributes(MESH_ENABLE.GFX.ATTR_STYLE, { style: [6, 6, 3] })
    scene.AddWidget(btn1);
    btn1.text_mesh.SetColorRGB(YELLOW_240_220_10);
}

function CreateSwitch(scene) {

    let ypos = 100
    const switch1 = new Widget_Switch('switch on', 'switch off', [100, ypos, 0], 5, GREY1, WHITE, [4,4], .5);
    switch1.area_mesh.StateEnable(MESH_STATE.IS_HOVER_COLORABLE)
    switch1.area_mesh.EnableGfxAttributes(MESH_ENABLE.GFX.ATTR_STYLE, { style: [6, 6, 3] })
    scene.AddWidget(switch1);
    switch1.text_mesh.SetColorRGB(BLUE_10_120_220);
    ypos += switch1.area_mesh.geom.dim[1]*2 + 5;

    switch1.Bind(function(){console.log('CALLBACK FROM USER !!!!!!!!!!!!!!!!!!!!!!!!!!!')})

    return switch1;
}

/***********************************************************************/

function CreateMenu(scene){

    const menu = new Widget_Menu_Bar('Widget Menu bar', ALIGN.LEFT, [0, 0, 0], [130, 20], TRANSPARENCY(GREY1, .2), WHITE, [1, 1], [12, 8], .3);

    scene.AddWidget(menu)
}

/***********************************************************************/

function Test_drop_down_widget(scene)
{ // DropDownMenu
    
    const pad = [10, 2.5]
    const drop_down = new Widget_Drop_Down('DP1', ALIGN.LEFT, [200, 200, 0], [60, 20], GREY1, ORANGE_240_130_10, WHITE, [1,1], pad);
    drop_down.CreateListenEvent(LISTEN_EVENT_TYPES.HOVER); drop_down.StateEnable(MESH_STATE.IS_HOVER_COLORABLE);
    // drop_down.CreateListenEvent(LISTEN_EVENT_TYPES.MOVE, drop_down.SetOnMove);
    
    { // Add another dropdown in dropdown
        const drop_down2 = new Widget_Drop_Down('DP2', ALIGN.LEFT, [OUT_OF_VIEW, OUT_OF_VIEW, 0], [60, 20], GREY1, BLUE_10_120_220, WHITE, [1,1], pad);
        drop_down2.CreateListenEvent(LISTEN_EVENT_TYPES.HOVER); drop_down2.StateEnable(MESH_STATE.IS_HOVER_COLORABLE);
        drop_down.AddToMenu(drop_down2);
        
        const text = new Widget_Text('DP2 TEXT ->', [OUT_OF_VIEW, OUT_OF_VIEW, 0], 4, WHITE);
        {// Create debug info event
            text.debug_info.type |= INFO_LISTEN_EVENT_TYPE.GFX_EVT_TYPE.VB;
            const info_event_type = INFO_LISTEN_EVENT_TYPE.GFX | INFO_LISTEN_EVENT_TYPE.GFX_EVT_TYPE.VB;
        }
        text.CreateListenEvent(LISTEN_EVENT_TYPES.HOVER); text.StateEnable(MESH_STATE.IS_HOVER_COLORABLE);
        drop_down2.AddToMenu(text);
        Drop_down_set_root(drop_down, drop_down2);
        {
            const drop_down3 = new Widget_Drop_Down('DP3 DP1', ALIGN.LEFT, [OUT_OF_VIEW, OUT_OF_VIEW, 0], [60, 20], GREY1, YELLOW_240_220_10, WHITE, [1,1], pad);
            drop_down3.CreateListenEvent(LISTEN_EVENT_TYPES.HOVER); drop_down3.StateEnable(MESH_STATE.IS_HOVER_COLORABLE);
            drop_down2.AddToMenu(drop_down3);
            Drop_down_set_root(drop_down, drop_down3);
            {
                const drop_down4 = new Widget_Drop_Down('DP4 DP1', ALIGN.LEFT, [OUT_OF_VIEW, OUT_OF_VIEW, 0], [60, 20], GREY1, GREEN_140_240_10, WHITE, [1,1], pad);
                drop_down4.CreateListenEvent(LISTEN_EVENT_TYPES.HOVER); drop_down4.StateEnable(MESH_STATE.IS_HOVER_COLORABLE);
                drop_down3.AddToMenu(drop_down4);
                Drop_down_set_root(drop_down, drop_down4);
                
                {
                    const drop_down5 = new Widget_Drop_Down('DP5 DP1', ALIGN.LEFT, [OUT_OF_VIEW, OUT_OF_VIEW, 0], [60, 20], GREY1, PINK_240_60_200, WHITE, [1,1], pad);
                    drop_down5.CreateListenEvent(LISTEN_EVENT_TYPES.HOVER); drop_down5.StateEnable(MESH_STATE.IS_HOVER_COLORABLE);
                    drop_down4.AddToMenu(drop_down5);
                    Drop_down_set_root(drop_down, drop_down5);
                    
                    {
                        const drop_down6 = new Widget_Drop_Down('DP6 DP1', ALIGN.LEFT, [OUT_OF_VIEW, OUT_OF_VIEW, 0], [60, 20], GREY1, RED_200_10_10, WHITE, [1,1], pad);
                        drop_down6.CreateListenEvent(LISTEN_EVENT_TYPES.HOVER); drop_down6.StateEnable(MESH_STATE.IS_HOVER_COLORABLE);
                        drop_down5.AddToMenu(drop_down6);
                        Drop_down_set_root(drop_down, drop_down6);
                        
                        {
                            const text = new Widget_Text('DP5 -->', [OUT_OF_VIEW, OUT_OF_VIEW, 0], 4, WHITE);
                            text.debug_info.type |= INFO_LISTEN_EVENT_TYPE.GFX_EVT_TYPE.VB;
                            text.CreateListenEvent(LISTEN_EVENT_TYPES.HOVER); text.StateEnable(MESH_STATE.IS_HOVER_COLORABLE);
                            
                            drop_down6.AddToMenu(text);
                        }
                    }
                }
            }
        }
    }
    
    scene.AddMesh(drop_down);
    drop_down.Calc();
    Drop_down_set_root(drop_down, drop_down);
    
}

function CreateMinimizer(scene){

    const section = new Section(SECTION.HORIZONTAL, [10,10], [200, 450, 0], [0,0], TRANSPARENCY(BLUE_10_120_220, .3))
    section.SetName('Minimizer section')
    section.CreateListenEvent(LISTEN_EVENT_TYPES.HOVER)
    section.CreateListenEvent(LISTEN_EVENT_TYPES.MOVE, section.OnClick)
    
    const  min = new Widget_Minimize(section, [200, 450, 0]);
    min.SetName('minimizer button')
    min.CreateListenEvent(LISTEN_EVENT_TYPES.CLICK_DOWN, min.OnClick, min);
    min.CreateListenEvent(LISTEN_EVENT_TYPES.HOVER);
    min.StateEnable(MESH_STATE.IS_HOVER_COLORABLE);
    
    section.AddItem(min);
    scene.AddMesh(section, GFX.PRIVATE);
    Gfx_end_session(true);
    section.Recalc(); // Reset pos-dim and re-calculate.

    section.Reconstruct_listeners_recursive();
    // section.ReconstructHoverListenersRecursive();
}

function CreateSliders(scene) {

    let posy = 200, height = 10, pad = 25;
    posy += height * 2 + pad;

    {
        const section = new Section(SECTION.VERTICAL, [10,10], [250,600,0], [0,0], GREY1)
        section.CreateListenEvent(LISTEN_EVENT_TYPES.MOVE, section.OnClick)
        section.CreateListenEvent(LISTEN_EVENT_TYPES.HOVER)
    
        const menu_bar = new Widget_Menu_Bar('Sliders Menu Bar', ALIGN.LEFT, [0, 0, 0], [130, 20], TRANSPARENCY(GREY1, .2), WHITE, [1, 1], [12, 8], .3);
        menu_bar.CreateListenEvent(LISTEN_EVENT_TYPES.HOVER)
        menu_bar.SetName('Sectioned Menu Bar')
        menu_bar.AddCloseButton(section, 'x', [0, 0, 0], 6, GREY1, WHITE, [1, 1], [4, 2], .8, undefined, [1, 4, 2]);
        menu_bar.AddMinimizeButton(section, [0, 0, 0], 6, GREY1, WHITE, [1, 1], [4, 2], .8, undefined, [1, 4, 2]);
    
        section.AddItem(menu_bar)
    
        const slider = new Widget_Slider([0, 0, 0], [150, height]);
        section.AddItem(slider)
        
        posy += height * 2 + pad;
        const slider2 = new Widget_Slider([200, posy, 0], [150, height]);
        section.AddItem(slider2)
        
        posy += height * 2 + pad;
        const slider3 = new Widget_Slider([200, posy, 0], [150, height]);
        section.AddItem(slider3)
        
        posy += height * 2 + pad;
        const slider4 = new Widget_Slider([200, posy, 0], [150, height]);
        section.AddItem(slider4)
       
        scene.AddMesh(section, GFX.PRIVATE);
        Gfx_end_session(true, true);
    
        // section.Calc(SECTION.NO_ITEMS_CALC)
        section.Calc()
        section.Reconstruct_listeners_recursive();
    }

}

function CreateSlidersSectioned(scene) {

    let posy = 200, height = 10, pad = 25;
    posy += height * 2 + pad;

    {
        // const section = new Section(SECTION.VERTICAL, [10,5], [400,200,0], [0,0], TRANSPARENCY(GREY1, 1.))
        const section = new Section(SECTION.VERTICAL, [0,5], [400,200,0], [0,0], GREY1)
        section.CreateListenEvent(LISTEN_EVENT_TYPES.MOVE, section.OnClick)
        section.CreateListenEvent(LISTEN_EVENT_TYPES.HOVER)
    
        const menu_bar = new Widget_Menu_Bar('Sliders Menu Bar', ALIGN.LEFT, [0, 0, 0], [130, 20], TRANSPARENCY(GREY1, .2), WHITE, [1, 1], [12, 8], .3);
        menu_bar.CreateListenEvent(LISTEN_EVENT_TYPES.HOVER)
        menu_bar.SetName('Sectioned Menu Bar')
        menu_bar.AddCloseButton(section, 'x', [0, 0, 0], 6, GREY1, WHITE, [1, 1], [6, 4], .8, undefined, [1, 4, 2]);
        menu_bar.AddMinimizeButton(section, [0, 0, 0], 6, GREY1, WHITE, [1, 1], [6, 4], .8, undefined, [1, 4, 2]);
        section.AddItem(menu_bar)
    
        {
            const s1 = new Section(SECTION.VERTICAL, [5,5], [400,200,0], [0,0], GREY1);

            {
                const s2 = new Section(SECTION.VERTICAL, [2,2], [0,0,0], [0,0], GREY1);
                const slider = new Widget_Slider([0, posy, 0], [150, height]);
                s2.AddItem(slider)
                
                posy += height * 2 + pad;
                const slider2 = new Widget_Slider([200, posy, 0], [150, height]);
                s2.AddItem(slider2)
                
                posy += height * 2 + pad;
                const slider3 = new Widget_Slider([200, posy, 0], [150, height]);
                s2.AddItem(slider3)
                
                posy += height * 2 + pad;
                const slider4 = new Widget_Slider([200, posy, 0], [150, height]);
                s2.AddItem(slider4)
    
                s1.AddItem(s2);
            }
            {
                const s2 = new Section(SECTION.VERTICAL, [2,2], [400,200,0], [0,0], GREY2);
                const slider = new Widget_Slider([400, posy, 0], [150, height]);
                s2.AddItem(slider)
                
                posy += height * 2 + pad;
                const slider2 = new Widget_Slider([200, posy, 0], [150, height]);
                s2.AddItem(slider2)
                
                posy += height * 2 + pad;
                const slider3 = new Widget_Slider([200, posy, 0], [150, height]);
                s2.AddItem(slider3)
                
                posy += height * 2 + pad;
                const slider4 = new Widget_Slider([200, posy, 0], [150, height]);
                s2.AddItem(slider4)
    
                s1.AddItem(s2);
            }
            {
                const s2 = new Section(SECTION.VERTICAL, [2,2], [400,200,0], [0,0], GREY2);
                const slider = new Widget_Slider([400, posy, 0], [150, height]);
                s2.AddItem(slider)
                
                posy += height * 2 + pad;
                const slider2 = new Widget_Slider([200, posy, 0], [150, height]);
                s2.AddItem(slider2)
                
                posy += height * 2 + pad;
                const slider3 = new Widget_Slider([200, posy, 0], [150, height]);
                s2.AddItem(slider3)
                
                posy += height * 2 + pad;
                const slider4 = new Widget_Slider([200, posy, 0], [150, height]);
                s2.AddItem(slider4)
    
                s1.AddItem(s2);
            }
            {
                const s2 = new Section(SECTION.VERTICAL, [2,2], [400,200,0], [0,0], GREY2);
                const slider = new Widget_Slider([400, posy, 0], [150, height]);
                s2.AddItem(slider)
                
                posy += height * 2 + pad;
                const slider2 = new Widget_Slider([200, posy, 0], [150, height]);
                s2.AddItem(slider2)
                
                posy += height * 2 + pad;
                const slider3 = new Widget_Slider([200, posy, 0], [150, height]);
                s2.AddItem(slider3)
                
                posy += height * 2 + pad;
                const slider4 = new Widget_Slider([200, posy, 0], [150, height]);
                s2.AddItem(slider4)
    
                s1.AddItem(s2);
            }

            section.AddItem(s1);
        }

       
        scene.AddMesh(section, GFX.PRIVATE);
        Gfx_end_session(true, true);
    
        section.Calc(SECTION.NO_ITEMS_CALC)
        section.Reconstruct_listeners_recursive();
    }

}

function CreateMenuBar(scene, count) {

    const h = 40;
    let cnt = 1;
    let posy = Viewport.bottom - h, fontSize = 10;

    const section = new Section(SECTION.VERTICAL, [300,500], [0,0,0], [10,10], ORANGE);
    section.CreateListenEvent(LISTEN_EVENT_TYPES.MOVE, section.OnClick)

    for(let i=0; i<count; i++)
    {
        const menu_bar = new Widget_Menu_Bar(`Menu ${cnt}`, ALIGN.LEFT, [120, posy, 0], [100, 20], BLUE_10_120_220, WHITE, [1, 1], [3, 3], .3);
        menu_bar.CreateListenEvent(LISTEN_EVENT_TYPES.HOVER)
        menu_bar.SetName(`Menu ${cnt}`)
        menu_bar.AddCloseButton(menu_bar, 'x', [120, posy, 0], 6, GREY1, WHITE, [1, 1], [8, 4], .8, undefined, [1, 4, 2]);
        scene.AddMesh(menu_bar, GFX.PRIVATE);
        posy -= h; cnt++;
    }

    Gfx_end_session(true);

}

function CreateMenuBarSectioned(count) {

    const h = 40;
    let cnt = 1;
    let posy = Viewport.bottom - h, fontSize = 10;

    const section = new Section(SECTION.VERTICAL, [10,10], [0,0,0], [10,10], ORANGE);

    for(let i = 0; i < count; i++)
    {
        const menu_bar = new Widget_Menu_Bar(`Menu ${cnt}`, ALIGN.LEFT, [120, posy, 0], [60, 20], BLUE_10_120_220, WHITE, [1, 1], [2, 2], .3);
        menu_bar.CreateListenEvent(LISTEN_EVENT_TYPES.HOVER)
        menu_bar.SetName(`Menu ${cnt}`)
        menu_bar.AddCloseButton(menu_bar, 'x', [120, posy, 0], 6, GREY1, WHITE, [1, 1], [6, 4], .8, undefined, [1, 4, 2]);
        section.AddItem(menu_bar)
        posy -= h; cnt++;
    }
    
    return section;
}

function CreateAndAddMenuBarSectioned(scene, count) {

    const h = 40;
    let cnt = 1;
    let posy = Viewport.bottom - h, fontSize = 10;

    const section = new Section(SECTION.VERTICAL, [10,10], [200,650,0], [10,10], ORANGE);
    section.CreateListenEvent(LISTEN_EVENT_TYPES.MOVE, section.OnClick)

    for(let i = 0; i < count; i++)
    {
        const menu_bar = new Widget_Menu_Bar(`Menu ${cnt}`, ALIGN.LEFT, [0, 0, 0], [100, 20], BLUE_10_120_220, WHITE, [1, 1], [2, 2], .3);
        menu_bar.CreateListenEvent(LISTEN_EVENT_TYPES.HOVER)
        menu_bar.SetName(`Menu ${cnt}`)
        menu_bar.AddCloseButton(menu_bar, 'x', [120, posy, 0], 6, GREY1, WHITE, [1, 1], [8, 4], .8, undefined, [1, 4, 2]);
        section.AddItem(menu_bar)
        posy -= h; cnt++;
    }
    
    // return section;
    scene.AddMesh(section)
    Gfx_end_session(true);
    section.Calc()
    section.Reconstruct_listeners_recursive();
}

function CreateSection(scene) {

    const flags = (SECTION.ITEM_FIT | SECTION.EXPAND);

    const blu = new Section(SECTION.VERTICAL, [15, 15], [350, 500, 0], [10, 0], TRANSPARENCY(BLUE, .2));

    const red = new Section(SECTION.VERTICAL,   [15, 15], [0, 0, 0], [20, 20], TRANSPARENCY(PURPLE, .2));
    const gre = new Section(SECTION.VERTICAL,   [12, 12], [0, 0, 0], [20, 20], TRANSPARENCY(GREEN, .4));
    const yel = new Section(SECTION.HORIZONTAL, [12, 12], [0, 0, 0], [20, 20], TRANSPARENCY(YELLOW, .4));
    const ora = new Section(SECTION.HORIZONTAL, [12, 12], [0, 0, 0], [20, 20], TRANSPARENCY(ORANGE, .4));
    const cie = new Section(SECTION.HORIZONTAL, [15, 15], [0, 0, 0], [20, 20], TRANSPARENCY(BLUE_LIGHT, .4));
    const bla = new Section(SECTION.VERTICAL,   [15, 15], [0, 0, 0], [20, 20], TRANSPARENCY(BLACK, .4));

    { // Construct sub-sections
        var bla_1  = new Section(SECTION.HORIZONTAL,    [15, 15],   [0, 0, 0], [20, 20], TRANSPARENCY(BLACK, .3));
        var pin_1  = new Section(SECTION.VERTICAL,      [25, 10],   [0, 0, 0], [20, 20], TRANSPARENCY(PINK_240_60_160, .3));
        var blu_1  = new Section(SECTION.VERTICAL,      [25, 10],   [0, 0, 0], [20, 20], TRANSPARENCY(BLUE,   .3));
        var pur_1  = new Section(SECTION.VERTICAL,      [5, 5],     [0, 0, 0], [20, 20], TRANSPARENCY(PURPLE, .8));
        var red_1  = new Section(SECTION.VERTICAL,      [5, 5],     [0, 0, 0], [20, 20], TRANSPARENCY(RED,    .8));
        var yel_1  = new Section(SECTION.VERTICAL,      [5, 5],     [0, 0, 0], [20, 20], TRANSPARENCY(YELLOW, .8));
        var yel_2  = new Section(SECTION.VERTICAL,      [5, 5],     [0, 0, 0], [20, 20], TRANSPARENCY(YELLOW, .8));
        var red_3  = new Section(SECTION.VERTICAL,      [5, 5],     [0, 0, 0], [20, 20], TRANSPARENCY(RED,    .8));
        var yel_3  = new Section(SECTION.VERTICAL,      [5, 5],     [0, 0, 0], [20, 20], TRANSPARENCY(YELLOW, .8));
        var gre_3  = new Section(SECTION.VERTICAL,      [5, 5],     [0, 0, 0], [20, 20], TRANSPARENCY(GREEN,  .8));
        var red_4  = new Section(SECTION.VERTICAL,      [5, 5],     [0, 0, 0], [20, 20], TRANSPARENCY(RED,    .8));
        var yel_4  = new Section(SECTION.VERTICAL,      [5, 5],     [0, 0, 0], [20, 20], TRANSPARENCY(YELLOW, .8));
        var gre_4  = new Section(SECTION.VERTICAL,      [5, 5],     [0, 0, 0], [20, 20], TRANSPARENCY(GREEN,  .8));
        var ora_4  = new Section(SECTION.VERTICAL,      [5, 5],     [0, 0, 0], [20, 20], TRANSPARENCY(ORANGE, .8));
        var gry1_1 = new Section(SECTION.VERTICAL,      [5, 5],     [0, 0, 0], [20, 20], TRANSPARENCY(GREY3, .8));
        var gry1_2 = new Section(SECTION.VERTICAL,      [5, 5],     [0, 0, 0], [20, 20], TRANSPARENCY(GREY5, .8));
        var gry1_3 = new Section(SECTION.VERTICAL,      [5, 5],     [0, 0, 0], [20, 20], TRANSPARENCY(GREY7, .8));
        var gry2_1 = new Section(SECTION.VERTICAL,      [5, 5],     [0, 0, 0], [20, 20], TRANSPARENCY(GREY1, .9));
        var gry2_2 = new Section(SECTION.VERTICAL,      [5, 5],     [0, 0, 0], [20, 20], TRANSPARENCY(GREY1, .9));
        var gry2_3 = new Section(SECTION.VERTICAL,      [5, 5],     [0, 0, 0], [20, 20], TRANSPARENCY(GREY1, .9));
        var gry2_4 = new Section(SECTION.VERTICAL,      [5, 5],     [0, 0, 0], [20, 20], TRANSPARENCY(GREY1, .9));
        var vert_0 = new Section(SECTION.VERTICAL,      [20, 20],   [0, 0, 0], [20, 20], TRANSPARENCY(GREY2, .4));

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

        red.SetName('red');       red.StateEnable(MESH_STATE.IS_HOVER_COLORABLE);    red.CreateListenEvent(LISTEN_EVENT_TYPES.HOVER);
        gre.SetName('gre');       gre.StateEnable(MESH_STATE.IS_HOVER_COLORABLE);    gre.CreateListenEvent(LISTEN_EVENT_TYPES.HOVER);
        yel.SetName('yel');       yel.StateEnable(MESH_STATE.IS_HOVER_COLORABLE);    yel.CreateListenEvent(LISTEN_EVENT_TYPES.HOVER);
        ora.SetName('ora');       ora.StateEnable(MESH_STATE.IS_HOVER_COLORABLE);    ora.CreateListenEvent(LISTEN_EVENT_TYPES.HOVER);
        cie.SetName('cie');       cie.StateEnable(MESH_STATE.IS_HOVER_COLORABLE);    cie.CreateListenEvent(LISTEN_EVENT_TYPES.HOVER);
        bla.SetName('bla');       bla.StateEnable(MESH_STATE.IS_HOVER_COLORABLE);    bla.CreateListenEvent(LISTEN_EVENT_TYPES.HOVER);
        bla_1.SetName('bla_1');   bla_1.StateEnable(MESH_STATE.IS_HOVER_COLORABLE);  bla_1.CreateListenEvent(LISTEN_EVENT_TYPES.HOVER);
        pin_1.SetName('pin_1');   pin_1.StateEnable(MESH_STATE.IS_HOVER_COLORABLE);  pin_1.CreateListenEvent(LISTEN_EVENT_TYPES.HOVER);
        blu_1.SetName('blu_1');   blu_1.StateEnable(MESH_STATE.IS_HOVER_COLORABLE);  blu_1.CreateListenEvent(LISTEN_EVENT_TYPES.HOVER);
        pur_1.SetName('pur_1');   pur_1.StateEnable(MESH_STATE.IS_HOVER_COLORABLE);  pur_1.CreateListenEvent(LISTEN_EVENT_TYPES.HOVER);
        red_1.SetName('red_1');   red_1.StateEnable(MESH_STATE.IS_HOVER_COLORABLE);  red_1.CreateListenEvent(LISTEN_EVENT_TYPES.HOVER);
        yel_1.SetName('yel_1');   yel_1.StateEnable(MESH_STATE.IS_HOVER_COLORABLE);  yel_1.CreateListenEvent(LISTEN_EVENT_TYPES.HOVER);
        yel_2.SetName('yel_2');   yel_2.StateEnable(MESH_STATE.IS_HOVER_COLORABLE);  yel_2.CreateListenEvent(LISTEN_EVENT_TYPES.HOVER);
        red_3.SetName('red_3');   red_3.StateEnable(MESH_STATE.IS_HOVER_COLORABLE);  red_3.CreateListenEvent(LISTEN_EVENT_TYPES.HOVER);
        yel_3.SetName('yel_3');   yel_3.StateEnable(MESH_STATE.IS_HOVER_COLORABLE);  yel_3.CreateListenEvent(LISTEN_EVENT_TYPES.HOVER);
        gre_3.SetName('gre_3');   gre_3.StateEnable(MESH_STATE.IS_HOVER_COLORABLE);  gre_3.CreateListenEvent(LISTEN_EVENT_TYPES.HOVER);
        red_4.SetName('red_4');   red_4.StateEnable(MESH_STATE.IS_HOVER_COLORABLE);  red_4.CreateListenEvent(LISTEN_EVENT_TYPES.HOVER);
        yel_4.SetName('yel_4');   yel_4.StateEnable(MESH_STATE.IS_HOVER_COLORABLE);  yel_4.CreateListenEvent(LISTEN_EVENT_TYPES.HOVER);
        gre_4.SetName('gre_4');   gre_4.StateEnable(MESH_STATE.IS_HOVER_COLORABLE);  gre_4.CreateListenEvent(LISTEN_EVENT_TYPES.HOVER);
        ora_4.SetName('ora_4');   ora_4.StateEnable(MESH_STATE.IS_HOVER_COLORABLE);  ora_4.CreateListenEvent(LISTEN_EVENT_TYPES.HOVER);
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
        bla_1.AddItem(pin_1,  flags);  bla_1.AddItem(blu_1, flags);
        red.AddItem(bla_1);   red.AddItem(yel, flags);    red.AddItem(ora, flags);    red.AddItem(cie, flags);
        yel.AddItem(gre_4, flags);  yel.AddItem(pur_1, flags);  yel.AddItem(red_3, flags); 
        ora.AddItem(yel_4, flags);  ora.AddItem(red_4, flags);  ora.AddItem(yel_2, flags); ora.AddItem(ora_4, flags); 
        cie.AddItem(gre_3, flags);  cie.AddItem(yel_3, flags);  cie.AddItem(bla, flags);
        bla.AddItem(gry1_1, flags); bla.AddItem(gry1_2, flags);     bla.AddItem(gry1_3, flags);
        gry1_1.AddItem(label, flags); gry1_1.AddItem(btn, flags); gry1_1.AddItem(vert_0, flags); 
        gre.AddItem(yel_1, flags);  gre.AddItem(red_1, flags);
    }

    const minimizer = new Widget_Minimize(blu, blu.geom.pos);
    minimizer.SetName('minimizer')
    minimizer.CreateListenEvent(LISTEN_EVENT_TYPES.CLICK_DOWN, minimizer.OnClick, minimizer);
    minimizer.CreateListenEvent(LISTEN_EVENT_TYPES.HOVER);
    minimizer.StateEnable(MESH_STATE.IS_HOVER_COLORABLE);
    
    blu.AddItem(minimizer);

    yel.AddItem(gre, flags);
    blu.AddItem(red, flags);

    scene.AddMesh(blu, GFX.PRIVATE);
    Gfx_end_session(true);
    blu.Calc();
    // const l = Debug_get_event_listeners();
    // l.PrintAll()
    blu.Reconstruct_listeners_recursive();
    
}

function CreateSectionedWidgets(scene) {

    const flags = (SECTION.ITEM_FIT | SECTION.EXPAND);

    const blu = new Section(SECTION.VERTICAL, [15, 15], [720, 830, 0], [10, 0], TRANSPARENCY(BLUE, .2));

    const menu_bar = new Widget_Menu_Bar('Sectioned Menu Bar', ALIGN.LEFT, [720, 500, 0], [130, 20], BLUE_10_120_220, WHITE, [1, 1], [2, 2], .3);
    menu_bar.CreateListenEvent(LISTEN_EVENT_TYPES.HOVER)
    menu_bar.SetName('Sectioned Menu Bar')
    menu_bar.AddCloseButton(blu, 'x', [0, 0, 0], 6, GREY1, WHITE, [1, 1], [6, 4], .8, undefined, [1, 4, 2]);
    menu_bar.AddMinimizeButton(blu, [0, 0, 0], 6, GREY1, WHITE, [1, 1], [6, 4], .8, undefined, [1, 4, 2]);

    blu.AddItem(menu_bar)

    const red = new Section(SECTION.VERTICAL, [15, 15], [100, 100, 0], [20, 20], TRANSPARENCY(PURPLE, .2));
    const gre = new Section(SECTION.VERTICAL, [12, 12], [100, 100, 0], [20, 20], TRANSPARENCY(GREEN, .4));
    const yel = new Section(SECTION.HORIZONTAL, [12, 12], [200, 400, 0], [20, 20], TRANSPARENCY(YELLOW, .4));
    const ora = new Section(SECTION.HORIZONTAL, [12, 12], [200, 400, 0], [20, 20], TRANSPARENCY(ORANGE, .4));
    const cie = new Section(SECTION.HORIZONTAL, [15, 15], [200, 400, 0], [20, 20], TRANSPARENCY(BLUE_LIGHT, .4));
    const bla = new Section(SECTION.VERTICAL, [15, 15], [200, 400, 0], [20, 20], TRANSPARENCY(BLACK, .4));

    { // Construct sub-sections
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
        var gry2_1 = new Section(SECTION.VERTICAL, [5, 5], [100, 100, 0], [20, 20], TRANSPARENCY(GREY1, .9));
        var gry2_2 = new Section(SECTION.VERTICAL, [5, 5], [100, 100, 0], [20, 20], TRANSPARENCY(GREY1, .9));
        var gry2_3 = new Section(SECTION.VERTICAL, [5, 5], [100, 100, 0], [20, 20], TRANSPARENCY(GREY1, .9));
        var gry2_4 = new Section(SECTION.VERTICAL, [5, 5], [100, 100, 0], [20, 20], TRANSPARENCY(GREY1, .9));
        var vert_0 = new Section(SECTION.VERTICAL, [20, 20], [100, 100, 0], [20, 20], TRANSPARENCY(GREY2, .4));

    }

    // Construct widgets
    // const label = new Widget_Label('label', ALIGN.HOR_CENTER | ALIGN.VERT_CENTER, [200, 100, 0]);
    const label = new Widget_Label('label', ALIGN.RIGHT, [200, 100, 0]);
    // const btn = new Widget_Button('btnl', ALIGN.HOR_CENTER | ALIGN.VERT_CENTER, [200, 100, 0]);
    const btn = new Widget_Button('btnl', ALIGN.LEFT, [200, 100, 0]);
    { // Set widgets parameters
        label.SetName('Sectioned btn1')
        label.CreateListenEvent(LISTEN_EVENT_TYPES.HOVER)
        label.StateEnable(MESH_STATE.IS_HOVER_COLORABLE);
        blu.CreateListenEvent(LISTEN_EVENT_TYPES.MOVE, blu.OnClick, blu, null);
        
        btn.SetName('Sectioned btn1')
        btn.CreateListenEvent(LISTEN_EVENT_TYPES.HOVER)
        btn.StateEnable(MESH_STATE.IS_HOVER_COLORABLE);
        btn.CreateListenEvent(LISTEN_EVENT_TYPES.MOVE, btn.OnClick);
    }

    { // Set naming and listeners

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

    { // Set hierarchy
        pin_1.AddItem(gry2_1, flags); pin_1.AddItem(gry2_2, flags);
        blu_1.AddItem(gry2_3, flags); blu_1.AddItem(gry2_4, flags);
        const s3 = CreateMenuBarSectioned(2)
        bla_1.AddItem(pin_1,  flags);  bla_1.AddItem(blu_1, flags); bla_1.AddItem(s3, flags);
        red.AddItem(bla_1);   red.AddItem(yel, flags);    red.AddItem(ora, flags);    red.AddItem(cie, flags);
        yel.AddItem(gre_4, flags);  yel.AddItem(pur_1, flags);  yel.AddItem(red_3, flags); 
        ora.AddItem(yel_4, flags);  ora.AddItem(red_4, flags);  ora.AddItem(yel_2, flags); ora.AddItem(ora_4, flags); 
        cie.AddItem(gre_3, flags);  cie.AddItem(yel_3, flags);  cie.AddItem(bla, flags);
        bla.AddItem(gry1_1, flags); bla.AddItem(gry1_2, flags);     bla.AddItem(gry1_3, flags);
        const s1 = CreateMenuBarSectioned(1)
        gry1_1.AddItem(label, flags); gry1_1.AddItem(btn, flags); gry1_1.AddItem(s1, flags); gry1_1.AddItem(vert_0, flags); 
        gre.AddItem(yel_1, flags);  gre.AddItem(red_1, flags);
    }

    const s2 = CreateMenuBarSectioned(2)

    yel.AddItem(gre, flags);
    yel.AddItem(s2, flags);
    blu.AddItem(red, flags);

    scene.AddMesh(blu, GFX.PRIVATE);
    Gfx_end_session(true);
    blu.Calc();
    // const l = Debug_get_event_listeners();
    // l.PrintAll()
    blu.Reconstruct_listeners_recursive();
    
}

function CreateManySection(scene) {

    const btn = new Widget_Button('btn1', [200, 200, 0], 5)

    const gr = new Section(SECTION.HORIZONTAL, [10,10], [100, 200, 0], [20, 20], TRANSPARENCY(GREY3, .3));

    gr.AddItem(btn);
    
    scene.AddMesh(gr, GFX.PRIVATE);
    Gfx_end_session(true);
    
    gr.Calc(SECTION.NO_ITEMS_CALC);
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
    minimizer.CreateListenEvent(LISTEN_EVENT_TYPES.CLICK_DOWN, minimizer.OnClick, minimizer);
    minimizer.CreateListenEvent(LISTEN_EVENT_TYPES.HOVER);
    minimizer.StateEnable(MESH_STATE.IS_HOVER_COLORABLE);
    
    section.AddItem(minimizer);
    section.AddItem(s1, flags)
    
    scene.AddMesh(section, GFX.PRIVATE);
    Gfx_end_session(true);
    
    section.Calc(flags)
    // section.Recalc(flags)
    section.Reconstruct_listeners_recursive();


}

function MeshInfo(scene) {

    const fontsize = 4.3;

    const infomesh = new Widget_Dynamic_Text_Mesh('Mesh name 0000000000000000', 'id:000', [10, 140, 0], fontsize, [1, 1], GREEN_140_240_10, YELLOW_240_220_10, .4);
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

        const gfx =  (infoMesh.gfx !== null) ? `gfx: prog:${infoMesh.gfx.prog.idx}, vb:${infoMesh.gfx.vb.idx}, vb:${infoMesh.gfx.vb.start}`
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


