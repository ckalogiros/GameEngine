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
import { TimeIntervalsInit } from '../Engine/Timers/TimeIntervals.js';
import { MAT_ENABLE, Material, Material_TEMP_fromBufferFor3D } from '../Engine/Drawables/Material/Base/Material.js';
import { MESH_ENABLE, Mesh } from '../Engine/Drawables/Meshes/Base/Mesh.js';
import { Widget_Slider, Slider_menu_create_options } from '../Engine/Drawables/Meshes/Widgets/WidgetSlider.js';
import { Bind_change_brightness, Bind_change_color_rgb, Bind_change_pos_x } from '../Engine/BindingFunctions.js';

/** Performance Timers */
import { TestArraysPerformance } from '../../Tests/Arrays.js';
import { EVENT_TYPES, Event_Listener, Listener_create_event, Listener_hover_enable } from '../Engine/Events/EventListeners.js';
import { Test_Old_vs_new_hover_listener } from '../../Tests/Performane.js';
import { Widget_Menu_Bar } from '../Engine/Drawables/Meshes/Widgets/Menu/WidgetMenu.js';
import { Widget_Generic } from '../Engine/Drawables/Meshes/Widgets/WidgetGeneric.js';
import { Panel,  Section } from '../Engine/Drawables/Meshes/Panel.js';

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
    STATE.scene.active = scene;
    STATE.scene.idx = scene.sceneIdx;

    renderer = new WebGlRenderer(scene, camera);

    EventsAddListeners();
    RenderQueueInit();
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
            //     textLabel.StateEnable(MESH_STATE.HAS_HOVER_COLOR)
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
            //     textLabel.StateEnable(MESH_STATE.HAS_HOVER_COLOR)
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
    // BindSliderToTextLabel(scene)
    // CreateMenuBar(scene)

    // CreateGenericWidget(scene)
    CreateSection(scene)

    // Test_Old_vs_new_hover_listener(scene)

    // TestArraysPerformance();

    tm.Stop();

    // If camera is static, update projection matrix uniform only once
    camera.UpdateProjectionUniform(renderer.gl);
    RenderQueueGet().UpdateActiveQueue(); // Update active queue buffer with the vertex buffers set to be drawn

}

export function AppRender() {
    requestAnimationFrame(AppRender);
    renderer.Render();
}


function CreateSwitches(scene){

    const switch1 = new Widget_Switch_Mesh([400, 100, 0]);
    scene.AddMesh(switch1)
    switch1.StateEnable(MESH_STATE.HAS_HOVER_COLOR);
      
    const btn1 = new Widget_Button_Mesh('x', [400, 150, 0], 6, GREY1, WHITE, [1, 1], [8,4], .8, undefined, [1,4,2]);
    scene.AddMesh(btn1);
    // btn1.CreateListenEvent(LISTEN_EVENT_TYPES.HOVER);
    btn1.StateEnable(MESH_STATE.HAS_HOVER_COLOR)
    Listener_hover_enable(btn1)

}

function CreateUiTimers(scene){

    const fontsize = 4, pad = 6; let ypos = fontsize*2, ms = 200;
        
    const pt = PerformanceTimerCreate('Widget menu construct.');
    pt.Start();
    ms = 10;
    const timer = new Widget_Dynamic_Text_Mesh('Timer:', '000000', [0, ypos, 0], fontsize, [1, 1], GREEN_140_240_10, YELLOW_240_220_10, .5);
    scene.AddMesh(timer, GL_VB.NEW);
    timer.SetDynamicText(ms, TimeGetFps, `DynamicText ${ms} Timer TimeGetFps`)
    let idx = timer.CreateDynamicText('00000', fontsize, undefined, YELLOW_240_220_10, 16, .9);
    timer.SetDynamicText(ms, TimeGetDeltaAvg, `DynamicText ${ms} Timer TimeGetDeltaAvg`)
    idx = timer.CreateDynamicText('000000', fontsize, undefined, YELLOW_240_220_10, 16, .5);
    timer.SetDynamicText(ms, TimeGetTimer, `DynamicText ${ms} Timer TimeGetTimer`)
    pt.Stop();
    pt.Print()

    // const vbidx = [gfx[0].vb.idx, gfx[1].vb.idx]

    // Performance Time Measure 1
    ms = 500; ypos += fontsize*2 + pad;
    const timeMeasure1 = new Widget_Dynamic_Text_Mesh('All Timers Update:', '000000', [0, ypos, 0], fontsize, [1, 1], GREEN_140_240_10, YELLOW_240_220_10, .4);
    scene.AddMesh(timeMeasure1);
    timeMeasure1.SetDynamicText(ms, _Tm1GetFps, `DynamicText ${ms} All Timers Update _Tm1GetFps`)
    idx = timeMeasure1.CreateDynamicText('000000', fontsize, null, YELLOW_240_220_10, 16, .4);
    timeMeasure1.SetDynamicText(ms, _Tm1GetMilisec, `DynamicText ${ms} All Timers Update _Tm1GetMilisec`)
    
    // Performance Time Measure 3
    ms = 500; ypos += fontsize*2 + pad;
    const timeMeasure2 = new Widget_Dynamic_Text_Mesh('GlDraw:', '000000', [0, ypos, 0], fontsize, [1, 1], GREEN_140_240_10, YELLOW_240_220_10, .4);
    timeMeasure2.SetDynamicText(ms, _Tm3GetFps, `DynamicText ${ms} GlDraw _Tm3GetFps`)
    idx = timeMeasure2.CreateDynamicText('000000', fontsize, null, YELLOW_240_220_10, 16, .4);
    timeMeasure2.SetDynamicText(ms, _Tm3GetMilisec, `DynamicText ${ms} GlDraw _Tm3GetMilisec`)
    scene.AddMesh(timeMeasure2);

    // Performance Time Measure 2
    ms = 500; ypos += fontsize*2 + pad;
    const timeMeasure3 = new Widget_Dynamic_Text_Mesh('Scene Update:', '000000', [0, ypos, 0], fontsize, [1, 1], GREEN_140_240_10, YELLOW_240_220_10, .4);
    scene.AddMesh(timeMeasure3);
    timeMeasure3.SetDynamicText(ms, _Tm2GetFps, `DynamicText ${ms} Scene Update _Tm2GetFps`)
    idx = timeMeasure3.CreateDynamicText('000000', fontsize, null, YELLOW_240_220_10, 16, .4);
    timeMeasure3.SetDynamicText(ms, _Tm2GetMilisec, `DynamicText ${ms} Scene Update _Tm2GetMilisec`)

    // Performance Time Measure 2
    ms = 500; ypos += fontsize*2 + pad;
    const timeMeasure4 = new Widget_Dynamic_Text_Mesh('Old hover listen:', '000000', [0, ypos, 0], fontsize, [1, 1], GREEN_140_240_10, YELLOW_240_220_10, .4);
    scene.AddMesh(timeMeasure4);
    timeMeasure4.SetDynamicText(ms, _Tm5GetFps, `DynamicText ${ms} Scene Update _Tm5GetFps`)
    idx = timeMeasure4.CreateDynamicText('000000', fontsize, null, YELLOW_240_220_10, 16, .4);
    timeMeasure4.SetDynamicText(ms, _Tm5GetMilisec, `DynamicText ${ms} Scene Update _Tm5GetMilisec`)

    // Performance Time Measure 2
    ms = 500; ypos += fontsize*2 + pad;
    const timeMeasure5 = new Widget_Dynamic_Text_Mesh('New hover listen:', '000000', [0, ypos, 0], fontsize, [1, 1], GREEN_140_240_10, YELLOW_240_220_10, .4);
    scene.AddMesh(timeMeasure5);
    timeMeasure5.SetDynamicText(ms, _Tm6GetFps, `DynamicText ${ms} Scene Update _Tm6GetFps`)
    idx = timeMeasure5.CreateDynamicText('000000', fontsize, null, YELLOW_240_220_10, 16, .4);
    timeMeasure5.SetDynamicText(ms, _Tm6GetMilisec, `DynamicText ${ms} Scene Update _Tm6GetMilisec`)
}


function BindSliderToTextLabel(scene){

    // Text Label
    const textLabel = new Widget_Label_Text_Mesh('Text Label 2', [60, 255, 0], 10, BLUE_10_120_220, WHITE, [1, 1], [3,3], .4);
    scene.AddMesh(textLabel);
    textLabel.StateEnable(MESH_STATE.IS_MOVABLE);
    textLabel.StateEnable(MESH_STATE.IS_GRABABLE);
    textLabel.StateEnable(MESH_STATE.HAS_POPUP);
    textLabel.StateEnable(MESH_STATE.HAS_HOVER_COLOR)
    // textLabel.CreateListenEvent(LISTEN_EVENT_TYPES.HOVER);
    Listener_hover_enable(textLabel)
    RenderQueueGet().SetPriority('last', textLabel.children.buffer[0].gfx.prog.idx, textLabel.gfx.vb.idx);
    
    
    // Slider
    let posy = 380, height = 14, pad = 25;
    posy += height*2 + pad;
    const slider = new Widget_Slider([200, posy, 0], [150, height], BLUE_10_160_220);
    scene.AddMesh(slider);
    slider.SetMenuOptionsClbk(Slider_menu_create_options);
    
    posy += height*2 + pad;
    const slider2 = new Widget_Slider([200, posy, 0], [150, height], BLUE_10_160_220);
    scene.AddMesh(slider2);
    slider2.SetMenuOptionsClbk(Slider_menu_create_options);
}

function CreateButtons(scene) {

    let posy = Viewport.bottom-30, fontSize = 10; 

    const btn1 = new Widget_Button_Mesh('BUTTON 1', [40, posy, 0], 10, GREY5, WHITE, [1, 1], [3, 3], .3);
    scene.AddMesh(btn1);
    btn1.StateEnable(MESH_STATE.HAS_HOVER_COLOR)
    Listener_hover_enable(btn1)


    RenderQueueGet().SetPriority('last', btn1.children.buffer[0].gfx.prog.idx, btn1.gfx.vb.idx);
}

function CreateMenuBar(scene) {

    let posy = Viewport.bottom-100, fontSize = 10; 

    const menu_bar = new Widget_Menu_Bar('BUTTON 1', [120, posy, 0], [100, 20], GREY5, WHITE, [1, 1], [3, 3], .3);
    menu_bar.AddCloseButton('x', [400, 150, 0], 6, GREY1, WHITE, [1, 1], [8,4], .8, undefined, [1,4,2]);
    scene.AddMesh(menu_bar);
}

function CreateGenericWidget(scene){

    const w = new Widget_Generic([200, 650, 0], [100, 100]);
    w.AddSection();

    scene.AddMesh(w);
}

// const fontSize = 5.517241379311;
// const b  = new Widget_Button_Mesh('btn1_1',[200, 300, 0], fontSize, TRANSPARENCY(ORANGE_240_130_10, .1), WHITE, [1,1], [6,4], .5);
// const b1 = new Widget_Button_Mesh('btn1_2',[200, 650, 0], 8, TRANSPARENCY(GREEN_140_240_10, .2), WHITE, [1,1], [6,4], .5);
// const b2 = new Widget_Button_Mesh('btn1_3',[280, 650, 0], fontSize, TRANSPARENCY(PINK_240_60_200, .2), WHITE, [1,1], [6,4], .5);
// const b3 = new Widget_Button_Mesh('btn1_4',[200, 650, 0], fontSize, TRANSPARENCY(YELLOW_240_220_10, .2), WHITE, [1,1], [6,4], .5);
// const b4 = new Widget_Button_Mesh('btn1_5',[200, 650, 0], fontSize, TRANSPARENCY(BLUE_10_160_220, .2), WHITE, [1,1], [6,4], .5);

function CreateSection(scene){

    const flags = SECTION.ITEM_FIT;
    // const flags = SECTION.FIT;

    const blu = new Section(SECTION.HORIZONTAL, [5,5], [100, 400, 0], [20,20], TRANSPARENCY(BLUE,    .1));
    
    const red   = new Section(SECTION.VERTICAL, [5,5], [100, 100, 0], [20,20], TRANSPARENCY(RED,    .1));
    const gre   = new Section(SECTION.HORIZONTAL, [5,5], [100, 100, 0], [20,20], TRANSPARENCY(GREEN,  .2));
    const yel   = new Section(SECTION.HORIZONTAL, [5,5], [200, 400, 0], [20,20], TRANSPARENCY(YELLOW, .2));
    const ora   = new Section(SECTION.HORIZONTAL, [5,5], [200, 400, 0], [20,20], TRANSPARENCY(ORANGE, .2));
    const cie   = new Section(SECTION.HORIZONTAL, [5,5], [200, 400, 0], [20,20], TRANSPARENCY(BLUE_LIGHT, .2));
    const bla   = new Section(SECTION.VERTICAL, [5,5], [200, 400, 0], [20,20], TRANSPARENCY(BLACK, .2));

    const pin_1 = new Section(SECTION.VERTICAL, [1,1], [100, 100, 0], [20,20], TRANSPARENCY(PINK_240_60_160,    .4));
    const blu_1 = new Section(SECTION.VERTICAL, [1,1], [100, 100, 0], [20,20], TRANSPARENCY(BLUE,    .4));
    const pur_1 = new Section(SECTION.VERTICAL, [1,1], [100, 100, 0], [20,20], TRANSPARENCY(PURPLE,    .4));
    const red_1 = new Section(SECTION.VERTICAL, [1,1], [100, 100, 0], [20,20], TRANSPARENCY(RED,    .4));
    const yel_1 = new Section(SECTION.VERTICAL, [1,1], [100, 100, 0], [20,20], TRANSPARENCY(YELLOW, .4));
    const gre_1 = new Section(SECTION.VERTICAL, [1,1], [100, 100, 0], [20,20], TRANSPARENCY(GREEN,  .4));
    const ora_1 = new Section(SECTION.VERTICAL, [1,1], [100, 100, 0], [20,20], TRANSPARENCY(ORANGE, .4));
    const red_2 = new Section(SECTION.VERTICAL, [5,5], [100, 100, 0], [20,20], TRANSPARENCY(RED,    .4));
    const gre_2 = new Section(SECTION.VERTICAL, [1,1], [100, 100, 0], [20,20], TRANSPARENCY(GREEN,  .4));
    const ora_2 = new Section(SECTION.VERTICAL, [1,1], [100, 100, 0], [20,20], TRANSPARENCY(ORANGE, .4));
    const yel_2 = new Section(SECTION.VERTICAL, [1,1], [100, 100, 0], [20,20], TRANSPARENCY(YELLOW, .4));
    const red_3 = new Section(SECTION.VERTICAL, [1,1], [100, 100, 0], [20,20], TRANSPARENCY(RED,    .4));
    const yel_3 = new Section(SECTION.VERTICAL, [1,1], [100, 100, 0], [20,20], TRANSPARENCY(YELLOW, .4));
    const gre_3 = new Section(SECTION.VERTICAL, [1,1], [100, 100, 0], [20,20], TRANSPARENCY(GREEN,  .4));
    const ora_3 = new Section(SECTION.VERTICAL, [1,1], [100, 100, 0], [20,20], TRANSPARENCY(ORANGE, .4));
    const red_4 = new Section(SECTION.VERTICAL, [1,1], [100, 100, 0], [20,20], TRANSPARENCY(RED,    .4));
    const yel_4 = new Section(SECTION.VERTICAL, [1,1], [100, 100, 0], [20,20], TRANSPARENCY(YELLOW, .4));
    const gre_4 = new Section(SECTION.VERTICAL, [1,1], [100, 100, 0], [20,20], TRANSPARENCY(GREEN,  .4));
    const ora_4 = new Section(SECTION.VERTICAL, [1,1], [100, 100, 0], [20,20], TRANSPARENCY(ORANGE, .4));
    const gry_1 = new Section(SECTION.VERTICAL, [1,1], [100, 100, 0], [20,20], TRANSPARENCY(GREY3, .9));
    const gry_2 = new Section(SECTION.VERTICAL, [1,1], [100, 100, 0], [20,20], TRANSPARENCY(GREY5, .9));
    const gry_3 = new Section(SECTION.VERTICAL, [1,1], [100, 100, 0], [20,20], TRANSPARENCY(GREY7, .9));

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
    
    bla.AddItem(gry_1, flags)
    bla.AddItem(gry_2, flags)
    bla.AddItem(gry_3, flags)
    
    gre.AddItem(yel_1, flags);
    gre.AddItem(red_1, flags);
    
    blu.AddItem(gre, flags);
    blu.AddItem(red, flags);


    // red.AddItem(yel_1, flags);
    // // red.AddItem(gre, flags);
    // red.AddItem(gre_1, flags);
    // red.AddItem(ora_1, flags);
    
    // // gre.AddItem(yel_2, flags);
    // // gre.AddItem(red_2, flags);
    // // gre.AddItem(ora_2, flags);
    
    // // yel.AddItem(yel_3, flags);
    // // yel.AddItem(ora_3, flags);
    // // yel.AddItem(red_3, flags);
    
    // // blu.AddItem(yel, flags);
    // // blu.AddItem(gre, flags);
    // blu.AddItem(red, flags);
    console.log(blu)

{
    // Listener_hover_enable(blu)
    // Listener_hover_enable(red);  
    // Listener_hover_enable(gre);  
    // Listener_hover_enable(yel);  
    // Listener_hover_enable(ora);  
    // Listener_hover_enable(red_1);
    // Listener_hover_enable(yel_1);
    // Listener_hover_enable(gre_1);
    // Listener_hover_enable(ora_1);
    // Listener_hover_enable(red_2);
    // Listener_hover_enable(yel_2);
    // Listener_hover_enable(gre_2);
    // Listener_hover_enable(ora_2);
    // Listener_hover_enable(red_3);
    // Listener_hover_enable(yel_3);
    // Listener_hover_enable(gre_3);
    // Listener_hover_enable(ora_3);
    // Listener_hover_enable(red_4);
    // Listener_hover_enable(yel_4);
    // Listener_hover_enable(gre_4);
    // Listener_hover_enable(ora_4);

    blu.SetName('blu')
    red.SetName('red');  
    gre.SetName('gre');  
    yel.SetName('yel');  
    ora.SetName('ora');  
    cie.SetName('cie');  
    pur_1.SetName('pur_1');  
    pin_1.SetName('pin_1');  
    blu_1.SetName('blu_1')
    red_1.SetName('red_1');
    yel_1.SetName('yel_1');
    gre_1.SetName('gre_1');
    ora_1.SetName('ora_1');
    red_2.SetName('red_2');
    yel_2.SetName('yel_2');
    gre_2.SetName('gre_2');
    ora_2.SetName('ora_2');
    red_3.SetName('red_3');
    yel_3.SetName('yel_3');
    gre_3.SetName('gre_3');
    ora_3.SetName('ora_3');
    red_4.SetName('red_4');
    yel_4.SetName('yel_4');
    gre_4.SetName('gre_4');
    ora_4.SetName('ora_4');

}
    blu.Calc2();
    // blu.Calc();

    scene.AddMesh(blu);
}

/** SAVE: DO Not Delete. Combine with: SEE ###SectionWorking_1 */
// function CreateSectionWorkingWithTwoLevelsOfSections(scene){

//     const flags = SECTION.ITEM_FIT;
//     // const flags = SECTION.FIT;

//     const blu = new Section(SECTION.HORIZONTAL, [5,5], [200, 400, 0], [80,80]);
    
//     const red = new Section(SECTION.VERTICAL, [5,5], [100, 100, 0], [20,20], TRANSPARENCY(RED,    .6));
//     const gre = new Section(SECTION.VERTICAL, [5,5], [100, 100, 0], [20,20], TRANSPARENCY(GREEN,  .6));
//     const yel = new Section(SECTION.VERTICAL, [5,5], [200, 400, 0], [20,20], TRANSPARENCY(YELLOW, .6));
//     const ora = new Section(SECTION.VERTICAL, [5,5], [200, 400, 0], [20,20], TRANSPARENCY(ORANGE, .6));
    
//     const red_1 = new Section(SECTION.VERTICAL, [5,5], [100, 100, 0], [20,20], TRANSPARENCY(RED,    .6));
//     const yel_1 = new Section(SECTION.VERTICAL, [5,5], [100, 100, 0], [20,20], TRANSPARENCY(YELLOW, .6));
//     const gre_1 = new Section(SECTION.VERTICAL, [5,5], [100, 100, 0], [20,20], TRANSPARENCY(GREEN,  .6));
//     const ora_1 = new Section(SECTION.VERTICAL, [5,5], [100, 100, 0], [20,20], TRANSPARENCY(ORANGE, .6));
    
//     const red_2 = new Section(SECTION.VERTICAL, [5,5], [100, 100, 0], [20,20], TRANSPARENCY(RED,    .6));
//     const yel_2 = new Section(SECTION.VERTICAL, [5,5], [100, 100, 0], [20,20], TRANSPARENCY(YELLOW, .6));
//     const gre_2 = new Section(SECTION.VERTICAL, [5,5], [100, 100, 0], [20,20], TRANSPARENCY(GREEN,  .6));
//     const ora_2 = new Section(SECTION.VERTICAL, [5,5], [100, 100, 0], [20,20], TRANSPARENCY(ORANGE, .6));
    
//     const red_3 = new Section(SECTION.VERTICAL, [5,5], [100, 100, 0], [20,20], TRANSPARENCY(RED,    .6));
//     const yel_3 = new Section(SECTION.VERTICAL, [5,5], [100, 100, 0], [20,20], TRANSPARENCY(YELLOW, .6));
//     const gre_3 = new Section(SECTION.VERTICAL, [5,5], [100, 100, 0], [20,20], TRANSPARENCY(GREEN,  .6));
//     const ora_3 = new Section(SECTION.VERTICAL, [5,5], [100, 100, 0], [20,20], TRANSPARENCY(ORANGE, .6));
    
//     const red_4 = new Section(SECTION.VERTICAL, [5,5], [100, 100, 0], [20,20], TRANSPARENCY(RED,    .6));
//     const yel_4 = new Section(SECTION.VERTICAL, [5,5], [100, 100, 0], [20,20], TRANSPARENCY(YELLOW, .6));
//     const gre_4 = new Section(SECTION.VERTICAL, [5,5], [100, 100, 0], [20,20], TRANSPARENCY(GREEN,  .6));
//     const ora_4 = new Section(SECTION.VERTICAL, [5,5], [100, 100, 0], [20,20], TRANSPARENCY(ORANGE, .6));

    
//     red.AddItem(yel_1, flags);
//     red.AddItem(gre_1, flags);
//     red.AddItem(ora_1, flags);
    
//     gre.AddItem(yel_2, flags);
//     gre.AddItem(red_2, flags);
//     gre.AddItem(ora_2, flags);
    
//     yel.AddItem(yel_3, flags);
//     yel.AddItem(ora_3, flags);
//     yel.AddItem(red_3, flags);
    
//     blu.AddItem(gre, flags);
//     blu.AddItem(yel, flags);
//     blu.AddItem(red, flags);
    


//     blu.SetName('blue');red.SetName('red');yel.SetName('yellow');gre.SetName('green');
//     yel.SetName('blue_2');red_2.SetName('red_2');yel_2.SetName('yellow_2');gre.SetName('green_2');

//     blu.Calc();

//     scene.AddMesh(blu);
// }





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
