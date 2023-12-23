"use strict";
import { _fps_100ms_avg, _fps_1s_avg, _fps_200ms_avg, _fps_500ms_avg } from '../Engine/Timers/Time.js';
import { Widget_Label } from '../Engine/Drawables/Meshes/Widgets/WidgetLabel.js';
import { Widget_Button, Widget_Switch } from '../Engine/Drawables/Meshes/Widgets/WidgetButton.js';
import { Widget_Text, Widget_Dynamic_Text_Mesh } from '../Engine/Drawables/Meshes/Widgets/WidgetText.js';
import { CubeGeometry } from '../Engine/Drawables/Geometry/Geometry3DCube.js';
import { TimeIntervalsCreate } from '../Engine/Timers/TimeIntervals.js';
import { MESH_ENABLE, Mesh } from '../Engine/Drawables/Meshes/Base/Mesh.js';
import { Widget_Slider } from '../Engine/Drawables/Meshes/Widgets/WidgetSlider.js';
import { Widget_Menu_Bar, Widget_Minimize } from '../Engine/Drawables/Meshes/Widgets/Menu/WidgetMenu.js';
import { Geometry2D } from '../Engine/Drawables/Geometry/Base/Geometry.js';
import { FloorArr3 } from '../Helpers/Math/MathOperations.js';
import { MAT_ENABLE, Material, Material_TEMP_fromBufferFor3D } from '../Engine/Drawables/Material/Base/Material.js';
import { Section } from '../Engine/Drawables/Meshes/Section.js';


import { DEBUG_PRINT_KEYS } from '../Engine/Controls/Input/Keys.js';
import { GetShaderTypeId } from '../Graphics/Z_Debug/GfxDebug.js';

// import { Buffer } from 'buffer';
import { Drop_down_set_root, Widget_Dropdown } from '../Engine/Drawables/Meshes/Widgets/Menu/Widget_Dropdown.js';
import { Gl_progs_get_group } from '../Graphics/GlProgram.js';
import { Debug_info_ui_performance } from '../Engine/Drawables/DebugInfo/DebugInfoUi.js';
import { Widget_Scroller } from '../Engine/Drawables/Meshes/Widgets/WidgetScroller.js';
import { GetSequencedColor } from '../Helpers/Helpers.js';
import { Gl_framebuffer_create, Gl_framebuffer_render } from '../Graphics/Buffers/GlFrameBuffer.js';
import { Textured_Mesh } from '../Engine/Drawables/Meshes/Textured_Mesh.js';
import { Renderqueue_set_active } from '../Engine/Renderers/Renderer/RenderQueue.js';


/**
 * // TODO: IMPLEMENT:
 * 1. Every widget should have a bit-field as to how the renderer will choose the vertex buffers for that mesh(PRIVATE, ANY, ...)
 * 
 * 3. Because we want to have a 'clean' 'GenerateGfxContext()', passing specific index for generating buffers,
 *      the only place to analyze the GFX_CTX_FLAGS is the GenGfxCtx method of each widget.
 * 
 * 4. Implement the switch's widget click listener to b automatic from the class.  
 *
 * reorganize the functions in GlVuffers.js 
 */

const _fontsize = 10;

export function TestWidgetsGeneric(scene) {

    // setInterval(()=>{
    //     if(STATE.mesh.hovered){
    //         console.log('State hovered:', STATE.mesh.hovered.name)
    //     }
    //     else{
    //         console.log('State hovered: null')
    //     }
    // }, 500)

    // Listeners_debug_info_create(scene);
    Debug_info_ui_performance(scene);

    // CreateSectionSectioned(scene)

    // CreateScroller(scene);

    /** */
    // {
    //     const label = new Widget_Label('Because hinting aligns the glyph\'s control points to the pixel grid, this process slightly modifies', ALIGN.HOR_CENTER | ALIGN.VERT_CENTER, [180, 300, 0], 6, TRANSPARENCY(GREEN_140_240_10, .5), WHITE, [14, 4], .5);
    //     // const label = new Widget_Label('ABCDEFG_YyFfGgJj_[1.2,x.y,{13|(4)}', ALIGN.HOR_CENTER | ALIGN.VERT_CENTER, [180, 300, 0], 40, TRANSPARENCY(GREEN_140_240_10, .5), WHITE, [14, 4], .5);
    //     // const label = new Widget_Label('{([_abcdefghijklmnopqrstuvwxyz]12,34.56)}', ALIGN.HOR_CENTER | ALIGN.VERT_CENTER, [180, 300, 0], 7, TRANSPARENCY(GREEN_140_240_10, .5), WHITE, [14, 4], .5);
    //     label.CreateListenEvent(LISTEN_EVENT_TYPES.MOVE)
    //     // label.CreateListenEvent(LISTEN_EVENT_TYPES.HOVER);
    //     label.ConstructListeners();
    //     scene.AddWidget(label, GFX_CTX_FLAGS.NEW)
    // }
    // {
    //     // const label = new Widget_Label('ABCDEFG_YyFfGgJj_[1.2,x.y,{13|(4)}', ALIGN.HOR_CENTER | ALIGN.VERT_CENTER, [180, 300, 0], 40, TRANSPARENCY(GREEN_140_240_10, .5), WHITE, [14, 4], .5);
    //     const label = new Widget_Label('{([_abcdefghijklmnopqrstuvwxyz]12,34.56)}', ALIGN.HOR_CENTER | ALIGN.VERT_CENTER, [180, 380, 0], 10, TRANSPARENCY(GREEN_140_240_10, .5), WHITE, [14, 4], .5);
    //     label.CreateListenEvent(LISTEN_EVENT_TYPES.MOVE)
    //     // label.CreateListenEvent(LISTEN_EVENT_TYPES.HOVER);
    //     label.ConstructListeners();
    //     scene.AddWidget(label, GFX_CTX_FLAGS.NEW)
    // }
    // {
    //     // const label = new Widget_Label('ABCDEFG_YyFfGgJj_[1.2,x.y,{13|(4)}', ALIGN.HOR_CENTER | ALIGN.VERT_CENTER, [180, 300, 0], 40, TRANSPARENCY(GREEN_140_240_10, .5), WHITE, [14, 4], .5);
    //     const label = new Widget_Label('[_],\'A\'BCDEFGHIJKLMNOPQRSTUVWXYZ]\'1\'234567890/\\;<>)}', ALIGN.HOR_CENTER | ALIGN.VERT_CENTER, [180, 460, 0], 30, TRANSPARENCY(GREEN_140_240_10, .5), WHITE, [14, 4], .5);
    //     label.CreateListenEvent(LISTEN_EVENT_TYPES.MOVE)
    //     // label.CreateListenEvent(LISTEN_EVENT_TYPES.HOVER);
    //     label.ConstructListeners();
    //     scene.AddWidget(label, GFX_CTX_FLAGS.NEW)
    // }
    // {
    //     {
    //         // const label = new Widget_Label('ABCDEFG_YyFfGgJj_[1.2,x.y,{13|(4)}', ALIGN.HOR_CENTER | ALIGN.VERT_CENTER, [180, 300, 0], 40, TRANSPARENCY(GREEN_140_240_10, .5), WHITE, [14, 4], .5);
    //         const label = new Widget_Label('RRRQQQ', ALIGN.HOR_CENTER | ALIGN.VERT_CENTER, [180, 530, 0], 10, TRANSPARENCY(GREEN_140_240_10, .5), WHITE, [14, 4], .5);
    //         label.CreateListenEvent(LISTEN_EVENT_TYPES.MOVE)
    //         // label.CreateListenEvent(LISTEN_EVENT_TYPES.HOVER);
    //         label.ConstructListeners();
    //         scene.AddWidget(label, GFX_CTX_FLAGS.NEW)
    //     }
    //     {
    //         // const label = new Widget_Label('ABCDEFG_YyFfGgJj_[1.2,x.y,{13|(4)}', ALIGN.HOR_CENTER | ALIGN.VERT_CENTER, [180, 300, 0], 40, TRANSPARENCY(GREEN_140_240_10, .5), WHITE, [14, 4], .5);
    //         const label = new Widget_Label('RRRQQQ', ALIGN.HOR_CENTER | ALIGN.VERT_CENTER, [280, 540, 0], 20, TRANSPARENCY(GREEN_140_240_10, .5), WHITE, [14, 4], .5);
    //         label.CreateListenEvent(LISTEN_EVENT_TYPES.MOVE)
    //         // label.CreateListenEvent(LISTEN_EVENT_TYPES.HOVER);
    //         label.ConstructListeners();
    //         scene.AddWidget(label, GFX_CTX_FLAGS.NEW)
    //     }
    //     {
    //         // const label = new Widget_Label('ABCDEFG_YyFfGgJj_[1.2,x.y,{13|(4)}', ALIGN.HOR_CENTER | ALIGN.VERT_CENTER, [180, 300, 0], 40, TRANSPARENCY(GREEN_140_240_10, .5), WHITE, [14, 4], .5);
    //         const label = new Widget_Label('RRRQQQ', ALIGN.HOR_CENTER | ALIGN.VERT_CENTER, [440, 550, 0], 30, TRANSPARENCY(GREEN_140_240_10, .5), WHITE, [14, 4], .5);
    //         label.CreateListenEvent(LISTEN_EVENT_TYPES.MOVE)
    //         // label.CreateListenEvent(LISTEN_EVENT_TYPES.HOVER);
    //         label.ConstructListeners();
    //         scene.AddWidget(label, GFX_CTX_FLAGS.NEW)
    //     }
    // }
    
    /** */
    // CreateFramebufferRendering(scene);

    // const texture = new Textured_Mesh([740, 550, 0], [512, 512], [1,1,1,1], TEXTURES.MSDF_CONSOLAS_1024, 'Testing msdf rendering');
    // texture.sid.attr |= SID.ATTR.MSDF;
    // texture.mat.uv[0] = .0;
    // texture.mat.uv[1] = 1.;
    // texture.mat.uv[2] = .0;
    // texture.mat.uv[3] = 1.;
    // texture.CreateListenEvent(LISTEN_EVENT_TYPES.MOVE)
    // texture.ConstructListeners();
    // scene.AddWidget(texture, GFX_CTX_FLAGS.PRIVATE);



    // const label = CreateLabel(scene);
    // CreateLabel(scene);
    // CreateLabel(scene);
    // CreateLabel(scene);
    // CreateLabel(scene);
    // CreateLabel_in_debug_gfx(scene)
    // DestroyMeshTest(scene, label)
    // CreateLabelsInSection(scene);

    // const button = CreateButton(scene); 
    // const switch1 = CreateSwitch(scene);

    // CreateMenu(scene)

    // CreateDropDownWithDropdownsInside(scene)
    // CreateDropDownWidgetWithWidgetsInside(scene)

    // TestDropdownsTextRendering(scene, [160, 200, 0], 0);
    // TestDropdownsTextRendering(scene, [300, 200, 0], 1);
    // TestDropdownsTextRendering(scene, [460, 200, 0], 1);
    // TestDropdownsTextRendering(scene, [600, 200, 0], 1);

    // CreateSlider(scene);
    // CreateSliderWithMenuBar(scene);
    // CreateSectionedMenuBarsWithNestedSliders(scene);
    // CreateSectionedMenuBarsWithNestedSliders2(scene);
    // CreateSectionedMenuBarsWithNestedWidgets(scene);
    // CreatSectionedMixWidgets(scene)
    // CreateSectionSectioned(scene)

    // CreateScroller(scene);

    // Help(scene)

    const meshinfo_mesh = MeshInfo(scene)
    TimeIntervalsCreate(10, 'Mesh info tip', TIME_INTERVAL_REPEAT_ALWAYS, MeshInfoUpdate, { mesh: meshinfo_mesh });

    // const gfxinfo = GfxInfo(scene)
    // TimeIntervalsCreate(100, 'Gfx info tip', TIME_INTERVAL_REPEAT_ALWAYS, GfxInfoUpdate, { gfxinfo: gfxinfo });

    // Scenes_debug_info_create(scene);
}



/**************************************************************************************************************************************/
// 

function CreateFramebufferRendering(scene){

    

    /**
     * 1. create the framebuffer's dimentions to the dimentions of the widget to take a snapshot.
     * 2. translate the widget to the bottom left corner of the gl.canvas.
     * 3. Draw the scene to the framebuffer
     * 
     * For static meshes we could just render the whole scene at gl.canvas dimentions
     * and remove from rendering the static meshes via render queue.
     * The listeners remain intacked.
     * On mouse interacting with any of the static widgets, 
     * we must re-render the frame buffer, this time excluding the interacted widget.
     * 
     * Or we render each widget in it's own renderbuffer,
     * and we just re-render only the widget out of focus and disable its real buffer rendering in the renderqueue
     */
    // Test Framebuffer drawing
    // const w=600, h=600;
    const w = VIEWPORT.WIDTH, h = VIEWPORT.HEIGHT;
    const halfw = VIEWPORT.WIDTH / 2, halfh = VIEWPORT.HEIGHT / 2;
    const framebuffer = Gl_framebuffer_create(gfxCtx.gl, 'texture', gfxCtx.gl.COLOR_ATTACHMENT0, w, h, 'Test ');
    // const framebuffer = Gl_framebuffer_create(gfxCtx.gl, 'renderbuffer', gfxCtx.gl.COLOR_ATTACHMENT0, w, h, 'Test ');
    console.log('..........................................:', framebuffer);
    // Render to framebuffer
    const gfx_queue = [
        {
            groupidx: 0,
            progidx: 0,
            vbidx: 0,
        },
        {
            groupidx: 0,
            progidx: 1,
            vbidx: 0,
        },
        // {
        //     groupidx:0, 
        //     progidx:2, 
        //     vbidx:0,
        // },
        // {
        //     groupidx:0, 
        //     progidx:0, 
        //     vbidx:1,
        // },
        // {
        //     groupidx:0, 
        //     progidx:1, 
        //     vbidx:1,
        // },
    ];
    setInterval(() => {
        let k = 0;
        const progs = Gl_progs_get_group(0)
        for (let i = 0; i < progs.count; i++) {
            for (let j = 0; j < progs.buffer[i].vertexBufferCount; j++) {
                if(!(i===2 && j===0))
                gfx_queue[k++] = {
                    groupidx: 0,
                    progidx: progs.buffer[i].idx,
                    vbidx: progs.buffer[i].vb[j].idx,
                }
            }
        }
        // console.log(gfx_queue)
        // console.log('~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~')

        for (let i = 0; i < gfx_queue.length; i++) {
            Renderqueue_set_active(gfx_queue[i].groupidx, gfx_queue[i].progidx, gfx_queue[i].vbidx, false)
        }
    }, 1000)
    // setTimeout(() => { Renderqueue_set_active(gfx_queue[0].groupidx, gfx_queue[0].progidx, gfx_queue[0].vbidx, false) }, 1500);
    // setTimeout(() => { Renderqueue_set_active(gfx_queue[1].groupidx, gfx_queue[1].progidx, gfx_queue[1].vbidx, false) }, 1500);

    // Create mesh for drawing the framebuffer's texture
    // const rect = new Textured_Mesh([halfw, halfh, 0], [halfw, halfh], [1.0, 1.0, 1.0, 1.2], framebuffer.texture.idx, 'Framebuffer 0');
    const rect = new Textured_Mesh([halfw, halfh, 0], [100, 100], [1.0, 1.0, 1.0, 1.2], framebuffer.texture.idx, 'Framebuffer 0');

    // rect.CreateListenEvent(LISTEN_EVENT_TYPES.MOVE)
    // rect.CreateListenEvent(LISTEN_EVENT_TYPES.HOVER)
    // rect.ConstructListeners();
    rect.mat.uv[2] = 1;
    rect.mat.uv[3] = 0;


    framebuffer.render_area = rect;
    console.log('..........................................:', rect);
    scene.AddWidget(rect, GFX_CTX_FLAGS.PRIVATE)

    setTimeout(()=>{ Gl_framebuffer_render(gfxCtx.gl, framebuffer, gfx_queue) }, 1000);
    // setInterval(() => { Gl_framebuffer_render(gfxCtx.gl, framebuffer, gfx_queue) }, 1000);
}

let labelCount = 1;
function CreateLabel(scene) {

    const pos = [30, 100 + (labelCount * 35), 0];
    const label = new Widget_Label('Label DEFAULT GFX', ALIGN.HOR_CENTER | ALIGN.VERT_CENTER, pos, 5, GREY1, WHITE, [14, 4], .5);
    label.CreateListenEvent(LISTEN_EVENT_TYPES.MOVE)
    label.CreateListenEvent(LISTEN_EVENT_TYPES.HOVER);
    label.StateEnable(MESH_STATE.IS_HOVER_COLORABLE);
    label.ConstructListeners();


    scene.AddWidget(label, GFX_CTX_FLAGS.NEW)
    label.text_mesh.SetColorRGB(RED);
    label.text_mesh.UpdateText('RED');

    // label.Render()
    // label.Align(ALIGN.BOTTOM | ALIGN.LEFT, [0, 0]);
    // label.Align(ALIGN.BOTTOM | ALIGN.RIGHT, [0, 0]);
    // label.Align(ALIGN.TOP | ALIGN.LEFT, [0, 0]);
    // label.Align(ALIGN.TOP | ALIGN.RIGHT, [0, 0]);

    //*Gfx_end_session(true, true);

    labelCount++;
    return label;
}
function CreateLabel_in_debug_gfx(scene) {

    const label = new Widget_Label('Label DEBUG GFX', ALIGN.HOR_CENTER | ALIGN.VERT_CENTER, [160, 100, 0], 5, GREY1, WHITE, [14, 4], .5);
    label.CreateListenEvent(LISTEN_EVENT_TYPES.MOVE)
    label.CreateListenEvent(LISTEN_EVENT_TYPES.HOVER);
    label.StateEnable(MESH_STATE.IS_HOVER_COLORABLE);
    label.ConstructListeners();

    label.RenderToDebugGfx(); // This is all it's needed to initiate the curent mesh to use sdebug ui gfx buffers


    scene.AddWidget(label)
    label.text_mesh.SetColorRGB(RED);
    // label.text_mesh.UpdateText('RED');

    // label.Render()
    // label.Align(ALIGN.BOTTOM | ALIGN.LEFT, [0, 0]);
    // label.Align(ALIGN.BOTTOM | ALIGN.RIGHT, [0, 0]);
    // label.Align(ALIGN.TOP | ALIGN.LEFT, [0, 0]);
    label.Align(ALIGN.TOP | ALIGN.RIGHT, [0, 0]);


    console.log(label)

    return label;
}
function CreateLabelsInSection(scene) {

    const section = new Section(SECTION.VERTICAL, [10, 10], [250, 400, 0], [0, 0], TRANSPARENCY(GREEN_140_240_10, .5))
    section.CreateListenEvent(LISTEN_EVENT_TYPES.MOVE);

    const pos = [0, 0, 0];
    let id = 1;
    {
        const label = new Widget_Label(`Label ${id++}`, ALIGN.HOR_CENTER | ALIGN.VERT_CENTER, pos, 5, GREY1, WHITE, [14, 4], .5);
        label.CreateListenEvent(LISTEN_EVENT_TYPES.MOVE); label.CreateListenEvent(LISTEN_EVENT_TYPES.HOVER); label.StateEnable(MESH_STATE.IS_HOVER_COLORABLE);
        section.AddItem(label);
    }
    {
        const label = new Widget_Label(`Label ${id++}`, ALIGN.HOR_CENTER | ALIGN.VERT_CENTER, pos, 5, GREY1, WHITE, [14, 4], .5);
        label.CreateListenEvent(LISTEN_EVENT_TYPES.MOVE); label.CreateListenEvent(LISTEN_EVENT_TYPES.HOVER); label.StateEnable(MESH_STATE.IS_HOVER_COLORABLE);
        section.AddItem(label);
    }

    // With sliders
    {
        const slider = new Widget_Slider([0, 0, 0], [100, 10], TRANSPARENCY(BLUE_10_120_220, .7), [2, 4]);
        section.AddItem(slider);
    }
    {
        const slider = new Widget_Slider([0, 0, 0], [100, 10], TRANSPARENCY(BLUE_10_120_220, .7), [2, 4]);
        section.AddItem(slider);
    }
    {
        const slider = new Widget_Slider([0, 0, 0], [100, 10], TRANSPARENCY(BLUE_10_120_220, .7), [2, 4]);
        section.AddItem(slider);
    }

    // With buttons
    {
        const btn = new Widget_Button('Button', ALIGN.HOR_CENTER | ALIGN.VERT_CENTER, [0, 0, 0], 5, GREY1, WHITE, [4, 4], .5);
        section.AddItem(btn);
    }

    // With switch
    {
        const switch1 = new Widget_Switch('switch on', 'switch off', [0, 0, 0], 5, GREY1, WHITE, [4, 4], .5);
        switch1.StateEnable(MESH_STATE.IS_HOVER_COLORABLE)
        switch1.EnableGfxAttributes(MESH_ENABLE.GFX.ATTR_STYLE, { style: [6, 6, 3] })
        switch1.Bind(function () { console.log('CALLBACK FROM USER !!!!!!!!!!!!!!!!!!!!!!!!!!!') })
        section.AddItem(switch1);
    }

    // With dynamic text
    {
        const dt = new Widget_Dynamic_Text_Mesh('Dynamic text', '0000', ALIGN.VERTICAL, [0, 0, 0], 5, BLUE_10_120_220, PINK_240_60_160);
        dt.CreateNewText('Text 2', 5, YELLOW_240_220_10, [2, 2]);
        dt.CreateNewText('Text 3', 5, YELLOW_240_220_10, [2, 2]);
        dt.CreateNewText('Text 5', 5, YELLOW_240_220_10, [2, 2]);
        dt.CreateNewText('Text 5', 5, YELLOW_240_220_10, [2, 2]);

        dt.Align_pre(dt, ALIGN.VERTICAL);
        section.AddItem(dt);
    }
    {
        const dt = new Widget_Dynamic_Text_Mesh('Dynamic text', '0000', ALIGN.VERTICAL, [0, 0, 0], 5, BLUE_10_120_220, PINK_240_60_160);
        dt.CreateNewText('Text 2', 5, YELLOW_240_220_10, [2, 2]);
        dt.CreateNewText('Text 3', 5, YELLOW_240_220_10, [2, 2]);
        dt.CreateNewText('Text 5swdszklskldlaskjdlk', 5, YELLOW_240_220_10, [2, 2]);
        dt.CreateNewText('Text 5', 5, YELLOW_240_220_10, [2, 2]);

        dt.Align_pre(dt, ALIGN.VERTICAL);
        section.AddItem(dt);
    }



    scene.AddWidget(section, GFX_CTX_FLAGS.PRIVATE);
    section.Calc(SECTION.VERTICAL);
    // scene.AddWidget(section, GFX_CTX_FLAGS.NEW);
    // scene.AddWidget(section, GFX_CTX_FLAGS.ANY);
    section.ConstructListeners();

}

function CreateButton(scene) {

    let ypos = 100
    const btn = new Widget_Button('Button', ALIGN.HOR_CENTER | ALIGN.VERT_CENTER, [160, ypos, 0], 5, GREY1, WHITE, [4, 4], .5);
    // btn1.CreateListenEvent(LISTEN_EVENT_TYPES.MOVE)
    btn.CreateListenEvent(LISTEN_EVENT_TYPES.CLICK_UP)
    btn.CreateListenEvent(LISTEN_EVENT_TYPES.HOVER)
    btn.StateEnable(MESH_STATE.IS_HOVER_COLORABLE)
    btn.EnableGfxAttributes(MESH_ENABLE.GFX.ATTR_STYLE, { style: [6, 6, 3] })
    // scene.AddWidget(btn, GFX_CTX_FLAGS.PRIVATE);
    scene.AddWidget(btn, GFX_CTX_FLAGS.PRIVATE);
    btn.text_mesh.SetColorRGB(BLUE_10_120_220);

    btn.Align(ALIGN.LEFT | ALIGN.TOP, [0, 0]);

    return btn;
}

function DestroyMeshTest(scene, widget) {

    const customCallback = function (params) {

        if (widget) {
            console.log('Destroy Text mesh test:', widget.name);
            widget.Destroy();
            widget = null;
        }
        else console.log('Widget does not exist')
    }
    const btn1 = new Widget_Button('Destroy', ALIGN.HOR_CENTER | ALIGN.VERT_CENTER, [160, 240, 0], 5, GREY1, WHITE, [4, 4], .5);
    btn1.CreateListenEvent(LISTEN_EVENT_TYPES.CLICK_UP)
    btn1.AddListenEvent(LISTEN_EVENT_TYPES_INDEX.CLICK, customCallback)
    btn1.CreateListenEvent(LISTEN_EVENT_TYPES.HOVER)
    btn1.AddListenEvent(LISTEN_EVENT_TYPES_INDEX.HOVER)
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
    switch1.Bind(function () { console.log('CALLBACK FROM USER !!!!!!!!!!!!!!!!!!!!!!!!!!!') })
    switch1.ConstructListeners();

    scene.AddWidget(switch1);
    switch1.text_mesh.SetColorRGB(BLUE_10_120_220);
    ypos += switch1.geom.dim[1] * 2 + 5;


    return switch1;
}

function CreatDynamicText(scene) {
    const fontsize = 4;
    const dt = new Widget_Dynamic_Text_Mesh('Dynamic text', '0000', ALIGN.VERTICAL, [100, 300, 0], fontsize, BLUE_10_120_220, PINK_240_60_160);
    dt.CreateNewText('Text 2', fontsize, YELLOW_240_220_10, [2, 2]);

    dt.Align_pre(dt, ALIGN.VERTICAL);

    dt.RenderToDebugGfx();
    scene.AddWidget(dt)
}

function CreatDynamicTextSectioned(scene) {

    const section = new Section(SECTION.VERTICAL, [10, 10], [350, 600, 0], [0, 0], TRANSPARENCY(GREY1, .9))
    section.CreateListenEvent(LISTEN_EVENT_TYPES.MOVE, section.OnClick)
    section.CreateListenEvent(LISTEN_EVENT_TYPES.HOVER);

    {
        const dt = new Widget_Dynamic_Text_Mesh('Dynamic text', '000000', ALIGN.VERTICAL, [0, 0, 0], 4, BLUE_10_120_220, PINK_240_60_160);
        section.AddItem(dt);
    }
    {
        const dt = new Widget_Dynamic_Text_Mesh('Dynamic text', '00', ALIGN.VERTICAL, [0, 0, 0], 4, BLUE_10_120_220, PINK_240_60_160);
        section.AddItem(dt);
    }

    scene.AddWidget(section);
    section.Calc();
}

function CreateMenu(scene) {

    const menu = new Widget_Menu_Bar('Widget Menu bar', ALIGN.LEFT, [60, 200, 0], TRANSPARENCY(GREY1, .9), WHITE, [10, 6]);
    menu.CreateListenEvent(LISTEN_EVENT_TYPES.MOVE);
    menu.AddCloseButton(menu, 'x');

    scene.AddWidget(menu, GFX_CTX_FLAGS.PRIVATE);
    menu.ConstructListeners();
}

function CreateDropDownWithDropdownsInside(scene) {

    const pad = [10, 2.5]
    const drop_down = new Widget_Dropdown('DP1', [260, 200, 0], [60, 20], RED, BLUE_10_120_220, WHITE, pad);
    drop_down.CreateListenEvent(LISTEN_EVENT_TYPES.HOVER);
    drop_down.CreateClickEvent();
    drop_down.CreateMoveEvent();

    { // Add another dropdown in dropdown
        const drop_down3 = new Widget_Dropdown('DP2', [OUT_OF_VIEW, OUT_OF_VIEW, 0], [60, 20], GREY1, YELLOW_240_220_10, WHITE, pad);
        drop_down3.CreateListenEvent(LISTEN_EVENT_TYPES.HOVER);
        drop_down3.CreateClickEvent();
        drop_down.AddToMenu(drop_down3);
        {
            const drop_down4 = new Widget_Dropdown('DP3', [OUT_OF_VIEW, OUT_OF_VIEW, 0], [60, 20], GREY1, GREEN_140_240_10, WHITE, pad);
            drop_down4.CreateListenEvent(LISTEN_EVENT_TYPES.HOVER);
            drop_down4.CreateClickEvent();
            drop_down3.AddToMenu(drop_down4);

            {
                const drop_down5 = new Widget_Dropdown('DP4', [OUT_OF_VIEW, OUT_OF_VIEW, 0], [60, 20], GREY1, PINK_240_60_200, WHITE, pad);
                drop_down5.CreateListenEvent(LISTEN_EVENT_TYPES.HOVER);
                drop_down5.CreateClickEvent();
                drop_down4.AddToMenu(drop_down5);

                {
                    const drop_down6 = new Widget_Dropdown('DP5', [OUT_OF_VIEW, OUT_OF_VIEW, 0], [60, 20], GREY1, RED_200_10_10, WHITE, pad);
                    drop_down6.CreateListenEvent(LISTEN_EVENT_TYPES.HOVER);
                    drop_down6.CreateClickEvent();
                    drop_down5.AddToMenu(drop_down6);

                    {
                        const text = new Widget_Text('DP5->Widget_Text', [OUT_OF_VIEW, OUT_OF_VIEW, 0], 4, WHITE);
                        drop_down6.AddToMenu(text);
                    }
                }
            }
        }
    }

    scene.AddWidget(drop_down, GFX_CTX_FLAGS.PRIVATE);
    drop_down.Calc();
    drop_down.ConstructListeners();

}

function CreateDropDownWidgetWithWidgetsInside(scene) {

    const pad = [10, 2.5]
    const drop_down = new Widget_Dropdown('DP1', [260, 300, 0], [60, 20], GREY1, ORANGE_240_130_10, WHITE, pad);
    drop_down.CreateClickEvent();
    drop_down.CreateMoveEvent();

    { // Add another dropdown in dropdown
        const drop_down2 = new Widget_Dropdown('DP2', [OUT_OF_VIEW, OUT_OF_VIEW, 0], [60, 20], GREY1, BLUE_10_120_220, WHITE, pad);
        drop_down2.CreateClickEvent();
        drop_down.AddToMenu(drop_down2);

        { // Add text to DP2's menu
            const text = new Widget_Text('DP2 TEXT ->', [OUT_OF_VIEW, OUT_OF_VIEW, 0], 4, WHITE);
            drop_down2.AddToMenu(text);
            // Create debug info event
            // text.debug_info.type |= INFO_LISTEN_EVENT_TYPE.GFX_EVT_TYPE.VB;
            // const info_event_type = INFO_LISTEN_EVENT_TYPE.GFX | INFO_LISTEN_EVENT_TYPE.GFX_EVT_TYPE.VB;
        }
        { // Add text to DP2's menu
            const text = new Widget_Text('DP2 TEXT ->', [OUT_OF_VIEW, OUT_OF_VIEW, 0], 4, WHITE);
            // text.debug_info.type |= INFO_LISTEN_EVENT_TYPE.GFX_EVT_TYPE.VB;
            // Create debug info event
            // const info_event_type = INFO_LISTEN_EVENT_TYPE.GFX | INFO_LISTEN_EVENT_TYPE.GFX_EVT_TYPE.VB;
            drop_down2.AddToMenu(text);
        }

        // Add label to DP2
        const label = new Widget_Label('Labe 1', ALIGN.RIGHT);
        drop_down2.AddToMenu(label)
        // Add button to DP2
        const btn = new Widget_Button('Button 1', ALIGN.RIGHT);
        drop_down2.AddToMenu(btn)
        // Add button to DP2
        const slider = new Widget_Slider([0, 0, 0], [80, 10]);
        drop_down2.AddToMenu(slider)


        {
            const drop_down3 = new Widget_Dropdown('DP3 DP1', [OUT_OF_VIEW, OUT_OF_VIEW, 0], [60, 20], GREY1, YELLOW_240_220_10, WHITE, pad);
            drop_down3.CreateListenEvent(LISTEN_EVENT_TYPES.HOVER); drop_down3.StateEnable(MESH_STATE.IS_HOVER_COLORABLE);
            drop_down3.CreateClickEvent();
            drop_down2.AddToMenu(drop_down3);
            // Drop_down_set_root(drop_down, drop_down3);
            {
                const drop_down4 = new Widget_Dropdown('DP4 DP1', [OUT_OF_VIEW, OUT_OF_VIEW, 0], [60, 20], GREY1, GREEN_140_240_10, WHITE, pad);
                drop_down4.CreateListenEvent(LISTEN_EVENT_TYPES.HOVER); drop_down4.StateEnable(MESH_STATE.IS_HOVER_COLORABLE);
                drop_down4.CreateClickEvent();
                drop_down3.AddToMenu(drop_down4);
                // Drop_down_set_root(drop_down, drop_down4);

                {
                    const drop_down5 = new Widget_Dropdown('DP5 DP1', [OUT_OF_VIEW, OUT_OF_VIEW, 0], [60, 20], GREY1, PINK_240_60_200, WHITE, pad);
                    drop_down5.CreateListenEvent(LISTEN_EVENT_TYPES.HOVER); drop_down5.StateEnable(MESH_STATE.IS_HOVER_COLORABLE);
                    drop_down5.CreateClickEvent();
                    drop_down4.AddToMenu(drop_down5);
                    // Drop_down_set_root(drop_down, drop_down5);

                    {
                        const drop_down6 = new Widget_Dropdown('DP6 DP1', [OUT_OF_VIEW, OUT_OF_VIEW, 0], [60, 20], GREY1, RED_200_10_10, WHITE, pad);
                        drop_down6.CreateListenEvent(LISTEN_EVENT_TYPES.HOVER); drop_down6.StateEnable(MESH_STATE.IS_HOVER_COLORABLE);
                        drop_down6.CreateClickEvent();
                        drop_down5.AddToMenu(drop_down6);
                        // Drop_down_set_root(drop_down, drop_down6);

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

    scene.AddWidget(drop_down, GFX_CTX_FLAGS.PRIVATE);
    drop_down.Calc();
    // Drop_down_set_root(drop_down, drop_down);
    drop_down.ConstructListeners();

}

function TestDropdownsTextRendering(scene, pos, id) {

    // const pad = [10, 2.5]
    const pad = [10, 2.5]
    const dp = new Widget_Dropdown(`DP${id}`, pos, [60, 20], RED, BLUE_10_120_220, WHITE, pad);
    dp.CreateHoverEvent();
    dp.CreateClickEvent();
    dp.CreateMoveEvent();

    const sub_dp1_count = 3;
    const sub_dp2_count = 3;

    const col = GetSequencedColor()
    for (let i = 0; i < sub_dp1_count; i++) {

        const dpsub1 = new Widget_Dropdown(`DP${id}-${i}`, [OUT_OF_VIEW, OUT_OF_VIEW, 0], [60, 20], GREY1, col, WHITE, pad);
        dpsub1.CreateHoverEvent();
        dpsub1.CreateClickEvent();
        dp.AddToMenu(dpsub1);

        const col1 = GetSequencedColor()
        for (let j = 0; j < sub_dp2_count; j++) {

            const dpsub2 = new Widget_Dropdown(`DP${id}-${i}${j}`, [OUT_OF_VIEW, OUT_OF_VIEW, 0], [60, 20], GREY1, col1, WHITE, pad);
            dpsub2.CreateHoverEvent();
            dpsub2.CreateClickEvent();
            dpsub1.AddToMenu(dpsub2);

            // const col2 = GetSequencedColor()
            // for(let k=0; k<sub_dp2_count; k++){

            //     const dpsub3 = new Widget_Dropdown(`DP${id}-${i}${j}${k}`, [OUT_OF_VIEW, OUT_OF_VIEW, 0], [60, 20], GREY1, col2, WHITE, pad);
            //     dpsub3.CreateHoverEvent();
            //     dpsub3.CreateClickEvent();
            //     dpsub2.AddToMenu(dpsub3);
            // }
        }
    }

    // scene.AddWidget(dp);
    dp.GenGfxCtx(GFX_CTX_FLAGS.PRIVATE);
    // dp.Render()
    dp.Calc();
    dp.ConstructListeners();

    scene.StoreRootMesh(dp)
}

function CreatSectionedMixWidgets(scene) {

    const section = new Section(SECTION.VERTICAL, [10, 10], [250, 400, 0], [0, 0], TRANSPARENCY(GREY1, .5))
    section.CreateListenEvent(LISTEN_EVENT_TYPES.MOVE);

    {
        const menu = new Widget_Menu_Bar('Widget Menu bar', ALIGN.LEFT, [60, 200, 0], TRANSPARENCY(GREY1, .9), WHITE, [10, 6]);
        menu.AddCloseButton(menu, 'x');
        menu.CreateListenEvent(LISTEN_EVENT_TYPES.MOVE)
        section.AddItem(menu)
    }
    {
        const lb = new Widget_Label('Label', ALIGN.BOTTOM, [0, 0, 0], 4, BLUE_10_120_220);
        section.AddItem(lb);
    }
    {
        const dt = new Widget_Dynamic_Text_Mesh('Dynamic text', '0000000', ALIGN.VERTICAL, [0, 0, 0], 4, BLUE_10_120_220, PINK_240_60_160);
        section.AddItem(dt);
    }
    {
        const slider = new Widget_Slider([0, 0, 0], [60, 10], PINK_240_60_160, [2, 4]);
        section.AddItem(slider);
    }
    {
        const s2 = new Section(SECTION.VERTICAL, [10, 10], [0, 0, 0], [0, 0], TRANSPARENCY(ORANGE_240_200_10, .5))
        s2.CreateListenEvent(LISTEN_EVENT_TYPES.HOVER);

        const menu = new Widget_Menu_Bar('Widget Menu bar', ALIGN.LEFT, [0, 0, 0], TRANSPARENCY(ORANGE_240_200_10, .5), WHITE, [10, 6]);
        menu.AddCloseButton(s2, 'x');
        menu.CreateListenEvent(LISTEN_EVENT_TYPES.MOVE)
        s2.AddItem(menu);

        const slider = new Widget_Slider([0, 0, 0], [80, 10], BLUE_10_160_220);
        s2.AddItem(slider);

        {
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

    scene.AddWidget(section, GFX_CTX_FLAGS.PRIVATE);
    section.Calc();
    section.ConstructListeners();
}

function CreateSlider(scene) {

    const slider = new Widget_Slider([200, 300, 0], [150, 10]);
    // slider.CreateSliderHandleEvent();
    slider.CreateListenEvent(LISTEN_EVENT_TYPES.MOVE);
    slider.ConstructListeners();

    scene.AddWidget(slider);

}

function CreateSliderWithMenuBar(scene) {

    const section = new Section(SECTION.VERTICAL, [10, 10], [250, 600, 0], [0, 0], TRANSPARENCY(GREY1, .9))
    section.CreateListenEvent(LISTEN_EVENT_TYPES.MOVE)

    const menu = new Widget_Menu_Bar('Widget Menu bar', ALIGN.LEFT, [200, 400, 0], TRANSPARENCY(GREY1, .9), WHITE, [10, 6]);
    menu.AddCloseButton(section, 'x');
    section.AddItem(menu);

    const slider = new Widget_Slider([200, 100, 0], [150, 10]);
    section.AddItem(slider);

    scene.AddWidget(section, GFX_CTX_FLAGS.PRIVATE);
    section.Calc();
    section.ConstructListeners();


    console.log('section:', section)
}

function CreateSectionedMenuBarsWithNestedSliders(scene) {

    const section = new Section(SECTION.VERTICAL, [10, 10], [250, 600, 0], [0, 0], TRANSPARENCY(GREY1, .6))
    section.CreateListenEvent(LISTEN_EVENT_TYPES.MOVE)

    const menu = new Widget_Menu_Bar('Widget Menu bar 0', ALIGN.LEFT, [200, 400, 0], TRANSPARENCY(GREY1, .6), WHITE, [10, 6]);
    menu.AddCloseButton(section, 'x');
    section.AddItem(menu);

    const slider = new Widget_Slider([200, 100, 0], [150, 10]);
    section.AddItem(slider);

    {

        const s = new Section(SECTION.VERTICAL, [10, 10], [250, 600, 0], [0, 0], TRANSPARENCY(GREEN_140_240_10, .9))

        const m = new Widget_Menu_Bar('Widget Menu bar 1', ALIGN.LEFT, [200, 400, 0], TRANSPARENCY(GREY1, .9), WHITE, [10, 6]);
        m.AddCloseButton(s, 'x');
        s.AddItem(m);

        const sl = new Widget_Slider([200, 100, 0], [150, 10]);
        s.AddItem(sl);
        section.AddItem(s);

        {
            const s2 = new Section(SECTION.VERTICAL, [10, 10], [250, 600, 0], [0, 0], TRANSPARENCY(YELLOW_240_220_10, .9))

            const m2 = new Widget_Menu_Bar('Widget Menu bar 2', ALIGN.LEFT, [200, 400, 0], TRANSPARENCY(GREY1, .9), WHITE, [10, 6]);
            m2.AddCloseButton(s2, 'x');
            s2.AddItem(m2);

            const sl = new Widget_Slider([200, 100, 0], [150, 10]);
            s2.AddItem(sl);
            s.AddItem(s2);


        }
    }

    scene.AddWidget(section, GFX_CTX_FLAGS.PRIVATE);
    section.Calc();
    section.ConstructListeners();


    console.log('section:', section)
}

function CreateSectionedMenuBarsWithNestedSliders2(scene) {

    const section = new Section(SECTION.VERTICAL, [10, 10], [250, 600, 0], [0, 0], TRANSPARENCY(GREY1, .9))
    section.CreateListenEvent(LISTEN_EVENT_TYPES.MOVE)

    const menu = new Widget_Menu_Bar('Widget Menu bar 0', ALIGN.LEFT, [200, 400, 0], TRANSPARENCY(GREY1, .9), WHITE, [10, 6]);
    menu.AddCloseButton(section, 'x');
    section.AddItem(menu);

    const slider = new Widget_Slider([200, 100, 0], [150, 10]);
    section.AddItem(slider);

    {

        const s = new Section(SECTION.VERTICAL, [10, 10], [250, 600, 0], [0, 0], TRANSPARENCY(GREEN_140_240_10, .9))

        const m = new Widget_Menu_Bar('Widget Menu bar 1', ALIGN.LEFT, [200, 400, 0], TRANSPARENCY(GREY1, .9), WHITE, [10, 6]);
        m.AddCloseButton(s, 'x');
        s.AddItem(m);

        const sl = new Widget_Slider([200, 100, 0], [150, 10]);
        s.AddItem(sl);

        section.AddItem(s);

        {
            const s2 = new Section(SECTION.VERTICAL, [10, 10], [250, 600, 0], [0, 0], TRANSPARENCY(YELLOW_240_220_10, .9))

            const m2 = new Widget_Menu_Bar('Widget Menu bar 2', ALIGN.LEFT, [200, 400, 0], TRANSPARENCY(GREY1, .9), WHITE, [10, 6]);
            m2.AddCloseButton(s2, 'x');
            s2.AddItem(m2);

            const sl1 = new Widget_Slider([200, 100, 0], [150, 10]);
            s2.AddItem(sl1);

            s.AddItem(s2);
            {
                const s3 = new Section(SECTION.VERTICAL, [10, 10], [250, 600, 0], [0, 0], TRANSPARENCY(YELLOW_240_220_10, .9))

                const m3 = new Widget_Menu_Bar('Widget Menu bar 3', ALIGN.LEFT, [200, 400, 0], TRANSPARENCY(GREY1, .9), WHITE, [10, 6]);
                m3.AddCloseButton(s3, 'x');
                s3.AddItem(m3);

                const sl3 = new Widget_Slider([200, 100, 0], [150, 10]);
                s3.AddItem(sl3);

                s2.AddItem(s3);
            }
        }
    }

    scene.AddWidget(section, GFX_CTX_FLAGS.PRIVATE);
    section.Calc();
    section.ConstructListeners();


    console.log('section:', section)
}

function CreateSectionedMenuBarsWithNestedWidgets(scene) {

    let cnt = 1;

    const section = new Section(SECTION.VERTICAL, [10, 10], [250, 600, 0], [0, 0], TRANSPARENCY(GREY1, .5))
    section.CreateListenEvent(LISTEN_EVENT_TYPES.MOVE)

    const menu = new Widget_Menu_Bar('Widget Menu bar 0', ALIGN.LEFT, [200, 400, 0], TRANSPARENCY(GREY1, .5), WHITE, [10, 6]);
    menu.AddCloseButton(section, 'x');
    section.AddItem(menu);

    const slider = new Widget_Slider([200, 100, 0], [150, 10]);
    section.AddItem(slider);

    {

        const s = new Section(SECTION.VERTICAL, [10, 10], [250, 600, 0], [0, 0], TRANSPARENCY(GREY6, .5))

        const m = new Widget_Menu_Bar('Widget Menu bar 1', ALIGN.LEFT, [200, 400, 0], TRANSPARENCY(GREY1, .9), WHITE, [10, 6]);
        m.AddCloseButton(s, 'x');
        s.AddItem(m);

        const sl = new Widget_Slider([200, 100, 0], [150, 10]);
        // sl.SetName(`Slider ${cnt++}`)
        sl.SetName(`Slider 10`)
        s.AddItem(sl);

        section.AddItem(s);

        {
            const s2 = new Section(SECTION.VERTICAL, [10, 10], [250, 600, 0], [0, 0], TRANSPARENCY(GREY6, .5))

            const m2 = new Widget_Menu_Bar('Widget Menu bar 2', ALIGN.LEFT, [200, 400, 0], TRANSPARENCY(GREY1, .5), WHITE, [10, 6]);
            m2.AddCloseButton(s2, 'x');
            s2.AddItem(m2);

            const sl1 = new Widget_Slider([200, 100, 0], [150, 10]);
            s2.AddItem(sl1);

            s.AddItem(s2);
            {
                const s3 = new Section(SECTION.VERTICAL, [10, 10], [250, 600, 0], [0, 0], TRANSPARENCY(GREY6, .5))

                const m3 = new Widget_Menu_Bar('Widget Menu bar 3', ALIGN.LEFT, [200, 400, 0], TRANSPARENCY(GREY1, .5), WHITE, [10, 6]);
                m3.AddCloseButton(s3, 'x');
                s3.AddItem(m3);

                const sl3 = new Widget_Slider([200, 100, 0], [150, 10]);
                s3.AddItem(sl3);

                // With buttons
                const btn = new Widget_Button('Button', ALIGN.HOR_CENTER | ALIGN.VERT_CENTER, [0, 0, 0], _fontsize, GREY1, WHITE, [4, 4], .5);
                s3.AddItem(btn);

                // With switch
                const switch1 = new Widget_Switch('switch on', 'switch off', [0, 0, 0], _fontsize, GREY1, WHITE, [4, 4], .5);
                switch1.StateEnable(MESH_STATE.IS_HOVER_COLORABLE)
                switch1.EnableGfxAttributes(MESH_ENABLE.GFX.ATTR_STYLE, { style: [6, 6, 3] })
                switch1.Bind(function () { console.log('CALLBACK FROM USER !!!!!!!!!!!!!!!!!!!!!!!!!!!') })
                s3.AddItem(switch1);

                // With dynamic text
                const dt = new Widget_Dynamic_Text_Mesh('Dynamic text', 'value', ALIGN.VERTICAL, [100, 300, 0], _fontsize, BLUE_10_120_220, PINK_240_60_160);
                dt.CreateNewText('Text 2', _fontsize, PURPLE, [2, 2]);
                dt.CreateNewText('Text 3', _fontsize, GREEN_60_240_100, [2, 2]);
                dt.CreateNewText('Text 4 very long text', _fontsize, WHITE, [2, 2]);
                dt.Align_pre(dt, ALIGN.VERTICAL);
                s3.AddItem(dt);

                s2.AddItem(s3);
            }
        }
    }

    scene.AddWidget(section, GFX_CTX_FLAGS.PRIVATE);
    section.Calc();
    section.ConstructListeners();


    console.log('section:', section)
}

function CreateMenuBarSectioned(count) {

    const h = 40;
    let cnt = 1;
    let posy = VIEWPORT.BOTTOM - h, fontSize = 10;

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

/**
 * // TODO!!!:
 * The button can move, but it can be grabbed only if it is inside it's parent section.
 * That is because the move event is child of parent and it will fire if parent's event is fired.
 * Fix: Make the move event so that the mesh cannot move outside parent's boundaries. 
 */
function CreateSectionSectioned(scene) {

    const tr = 1.;
    const flags = (SECTION.ITEM_FIT | SECTION.EXPAND);

    const blu = new Section(SECTION.VERTICAL, [15, 15], [350, 500, 0], [10, 0], TRANSPARENCY(BLUE_A2, tr));

    const red = new Section(SECTION.VERTICAL, [15, 15], [0, 0, 0], [20, 20], TRANSPARENCY(PURPLE_HOT3, tr));
    const gre = new Section(SECTION.VERTICAL, [12, 12], [0, 0, 0], [20, 20], TRANSPARENCY(GREEN_B2, tr));
    const yel = new Section(SECTION.HORIZONTAL, [12, 12], [0, 0, 0], [20, 20], TRANSPARENCY(ORANGE_B3, tr));
    const ora = new Section(SECTION.HORIZONTAL, [12, 12], [0, 0, 0], [20, 20], TRANSPARENCY(PINK2, tr));
    const cie = new Section(SECTION.HORIZONTAL, [15, 15], [0, 0, 0], [20, 20], TRANSPARENCY(RED1, tr));
    const bla = new Section(SECTION.VERTICAL, [15, 15], [0, 0, 0], [20, 20], TRANSPARENCY(GREY1, tr));


    { // Construct sub-sections
        var bla_1  = new Section(SECTION.HORIZONTAL, [15, 15], [0, 0, 0], [20, 20], TRANSPARENCY(GREY1, tr));
        var pin_1  = new Section(SECTION.VERTICAL,   [25, 10], [0, 0, 0], [20, 20], TRANSPARENCY(PINK_240_60_160, tr));
        var blu_1  = new Section(SECTION.VERTICAL,   [25, 10], [0, 0, 0], [20, 20], TRANSPARENCY(BLUE_10_160_220, tr));
        var pur_1  = new Section(SECTION.VERTICAL,   [10, 10],   [0, 0, 0], [20, 20], TRANSPARENCY(PURPLE, tr));
        var red_1  = new Section(SECTION.VERTICAL,   [10, 10],   [0, 0, 0], [20, 20], TRANSPARENCY(RED4, tr));
        var yel_1  = new Section(SECTION.VERTICAL,   [10, 10],   [0, 0, 0], [20, 20], TRANSPARENCY(PURPLE_HOT2, tr));
        var yel_2  = new Section(SECTION.VERTICAL,   [10, 10],   [0, 0, 0], [20, 20], TRANSPARENCY(YELLOW_240_220_10, tr));
        var red_3  = new Section(SECTION.VERTICAL,   [10, 10],   [0, 0, 0], [20, 20], TRANSPARENCY(RED2, tr));
        var yel_3  = new Section(SECTION.VERTICAL,   [10, 10],   [0, 0, 0], [20, 20], TRANSPARENCY(ORANGE_B2, tr));
        var gre_3  = new Section(SECTION.VERTICAL,   [10, 10],   [0, 0, 0], [20, 20], TRANSPARENCY(GREEN_B3, tr));
        var red_4  = new Section(SECTION.VERTICAL,   [10, 10],   [0, 0, 0], [20, 20], TRANSPARENCY(PINK3, tr));
        var yel_4  = new Section(SECTION.VERTICAL,   [10, 10],   [0, 0, 0], [20, 20], TRANSPARENCY(PURPLE_COOL2, tr));
        var gre_4  = new Section(SECTION.VERTICAL,   [10, 10],   [0, 0, 0], [20, 20], TRANSPARENCY(GREEN_B2,  tr));
        var ora_4  = new Section(SECTION.VERTICAL,   [10, 10],   [0, 0, 0], [20, 20], TRANSPARENCY(ORANGE_C3, tr));
        var gry1_1 = new Section(SECTION.VERTICAL,   [10, 10],   [0, 0, 0], [20, 20], TRANSPARENCY(GREEN_B3,  tr));
        var gry1_2 = new Section(SECTION.VERTICAL,   [10, 10],   [0, 0, 0], [20, 20], TRANSPARENCY(GREY5,  tr));
        var gry1_3 = new Section(SECTION.VERTICAL,   [10, 10],   [0, 0, 0], [20, 20], TRANSPARENCY(GREY7,  tr));
        var gry2_1 = new Section(SECTION.VERTICAL,   [10, 10],   [0, 0, 0], [20, 20], TRANSPARENCY(GREY1,  tr));
        var gry2_2 = new Section(SECTION.VERTICAL,   [10, 10],   [0, 0, 0], [20, 20], TRANSPARENCY(GREY1,  tr));
        var gry2_3 = new Section(SECTION.VERTICAL,   [10, 10],   [0, 0, 0], [20, 20], TRANSPARENCY(GREY1,  tr));
        var gry2_4 = new Section(SECTION.VERTICAL,   [10, 10],   [0, 0, 0], [20, 20], TRANSPARENCY(GREY1,  tr));
        var vert_0 = new Section(SECTION.VERTICAL,   [20, 20], [0, 0, 0], [20, 20], TRANSPARENCY(GREY1,  tr));

    }

    // Construct widgets
    const label = new Widget_Label('label', ALIGN.HOR_CENTER | ALIGN.VERT_CENTER, [700, 100, 0]);
    const btn = new Widget_Button('btnl', ALIGN.HOR_CENTER | ALIGN.VERT_CENTER, [700, 100, 0]);

    { // Set widgets parameters
        label.SetName('Sectioned btn1')
        label.CreateListenEvent(LISTEN_EVENT_TYPES.HOVER)
        blu.CreateListenEvent(LISTEN_EVENT_TYPES.MOVE);

        btn.SetName('Sectioned btn1')
        btn.CreateListenEvent(LISTEN_EVENT_TYPES.HOVER)
        btn.CreateListenEvent(LISTEN_EVENT_TYPES.MOVE);
    }

    { // Set naming and listeners
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
        yel_2.SetName('yel_2');
        red_3.SetName('red_3');
        yel_3.SetName('yel_3');
        gre_3.SetName('gre_3');
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
        gry2_4.SetName('gry2_4');
        vert_0.SetName('vert_0');
    }

    { // Set listeners
        red.CreateListenEvent(LISTEN_EVENT_TYPES.HOVER);
        gre.CreateListenEvent(LISTEN_EVENT_TYPES.HOVER);
        yel.CreateListenEvent(LISTEN_EVENT_TYPES.HOVER);
        ora.CreateListenEvent(LISTEN_EVENT_TYPES.HOVER);
        cie.CreateListenEvent(LISTEN_EVENT_TYPES.HOVER);
        bla.CreateListenEvent(LISTEN_EVENT_TYPES.HOVER);
        bla_1.CreateListenEvent(LISTEN_EVENT_TYPES.HOVER);
        pin_1.CreateListenEvent(LISTEN_EVENT_TYPES.HOVER);
        blu_1.CreateListenEvent(LISTEN_EVENT_TYPES.HOVER);
        pur_1.CreateListenEvent(LISTEN_EVENT_TYPES.HOVER);
        red_1.CreateListenEvent(LISTEN_EVENT_TYPES.HOVER);
        yel_1.CreateListenEvent(LISTEN_EVENT_TYPES.HOVER);
        yel_2.CreateListenEvent(LISTEN_EVENT_TYPES.HOVER);
        red_3.CreateListenEvent(LISTEN_EVENT_TYPES.HOVER);
        yel_3.CreateListenEvent(LISTEN_EVENT_TYPES.HOVER);
        gre_3.CreateListenEvent(LISTEN_EVENT_TYPES.HOVER);
        red_4.CreateListenEvent(LISTEN_EVENT_TYPES.HOVER);
        yel_4.CreateListenEvent(LISTEN_EVENT_TYPES.HOVER);
        gre_4.CreateListenEvent(LISTEN_EVENT_TYPES.HOVER);
        ora_4.CreateListenEvent(LISTEN_EVENT_TYPES.HOVER);
        gry1_1.CreateListenEvent(LISTEN_EVENT_TYPES.HOVER);
        gry1_2.CreateListenEvent(LISTEN_EVENT_TYPES.HOVER);
        gry1_3.CreateListenEvent(LISTEN_EVENT_TYPES.HOVER);
        gry2_1.CreateListenEvent(LISTEN_EVENT_TYPES.HOVER);
        gry2_2.CreateListenEvent(LISTEN_EVENT_TYPES.HOVER);
        gry2_3.CreateListenEvent(LISTEN_EVENT_TYPES.HOVER);
        gry2_4.CreateListenEvent(LISTEN_EVENT_TYPES.HOVER);
        vert_0.CreateListenEvent(LISTEN_EVENT_TYPES.HOVER);
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
    minimizer.CreateListenEvent(LISTEN_EVENT_TYPES.HOVER);

    blu.AddItem(minimizer);

    yel.AddItem(gre, flags);
    blu.AddItem(red, flags);

    scene.AddWidget(blu, GFX_CTX_FLAGS.PRIVATE);
    // blu.Calc(SECTION.EXPAND | SECTION.INHERIT);
    blu.Calc();
    blu.ConstructListeners();

}

function CreateScroller(scene) {

    const fontsize = 4.6;

    const section = new Section(SECTION.VERTICAL, [5, 5], [280, 650, 0], [20, 20], TRANSPARENCY(GREY1, .6));
    // console.log('Section options = ', section.options, ' section:', section.name);

    for (let i = 0; i < 400; i++) {

        {
            const s = new Section(SECTION.VERTICAL, [5, 5], [280, 650, 0], [0, 0], TRANSPARENCY(GREEN_140_240_10, .6));
            // console.log('s options = ', s.options, ' s:', s.name);
            const label = new Widget_Label(`Label ${i + 1}`, ALIGN.HOR_CENTER | ALIGN.VERT_CENTER, [400, 300, 0], fontsize, TRANSPARENCY(ORANGE_240_130_10, .7), WHITE, [7, 6], .5, undefined, [0, 4, 3])
            s.AddItem(label);
            section.AddItem(s);
        }
        {
            const s = new Section(SECTION.VERTICAL, [5, 5], [280, 650, 0], [0, 0], TRANSPARENCY(GREEN_140_240_10, .6));
            // console.log('s options = ', s.options, ' s:', s.name);
            const label = new Widget_Label(`Label Long Text${i + 1}`, ALIGN.HOR_CENTER | ALIGN.VERT_CENTER, [400, 300, 0], fontsize, TRANSPARENCY(ORANGE_240_130_10, .7), WHITE, [7, 6], .5, undefined, [0, 4, 3])
            s.AddItem(label);
            section.AddItem(s);
        }


        // const label1 = new Widget_Label(`Label long text ${i + 1}`, ALIGN.HOR_CENTER | ALIGN.VERT_CENTER, [400, 300, 0], 4, TRANSPARENCY(ORANGE_240_130_10, .7), WHITE, [7, 6], .5, undefined, [0, 4, 3])
        // s.AddItem(label1);
        // section.AddItem(s);
    }

    const scroller = new Widget_Scroller(section, [100, 100]);
    scroller.CreateListenEvent(LISTEN_EVENT_TYPES.MOVE);

    scene.AddWidget(scroller, GFX_CTX_FLAGS.PRIVATE);
    scroller.Calc();
    scroller.ConstructListeners();

    // { // Add more items to the scroller's scrolled section, to debug the correct behavior of the scroller's re-size and reposition.
    //     const l = new Widget_Label('Label 123 DDSDSDSfsdsdsdsds', ALIGN.HOR_CENTER | ALIGN.VERT_CENTER, [400, 300, 0], 4, TRANSPARENCY(ORANGE_240_130_10, .7), WHITE, [7, 6], .5, undefined, [0, 4, 3]);
    //     l.GenGfxCtx(GFX_CTX_FLAGS.SPECIFIC, [], []);
    //     scroller.AddItemToScrolledSection(l);
    // }
    // {
    //     const l = new Widget_Label('Label 123 DDSDSDSfsdsdsdsds', ALIGN.HOR_CENTER | ALIGN.VERT_CENTER, [400, 300, 0], 4, TRANSPARENCY(ORANGE_240_130_10, .7), WHITE, [7, 6], .5, undefined, [0, 4, 3]);
    //     l.GenGfxCtx();
    //     scroller.AddItemToScrolledSection(l);
    // }
    // {
    //     const l = new Widget_Label('Label 123 DDSDSDSfsdsdsdsds', ALIGN.HOR_CENTER | ALIGN.VERT_CENTER, [400, 300, 0], 4, TRANSPARENCY(ORANGE_240_130_10, .7), WHITE, [7, 6], .5, undefined, [0, 4, 3]);
    //     l.GenGfxCtx();
    //     scroller.AddItemToScrolledSection(l);
    // }
    // {
    //     const l = new Widget_Label('Label 123 DDSDSDSfsdsdsdsds', ALIGN.HOR_CENTER | ALIGN.VERT_CENTER, [400, 300, 0], 4, TRANSPARENCY(ORANGE_240_130_10, .7), WHITE, [7, 6], .5, undefined, [0, 4, 3]);
    //     l.GenGfxCtx();
    //     scroller.AddItemToScrolledSection(l);
    // }
    // {
    //     const l = new Widget_Label('Label 123 DDSDSDSfsdsdsdsds', ALIGN.HOR_CENTER | ALIGN.VERT_CENTER, [400, 300, 0], 4, TRANSPARENCY(ORANGE_240_130_10, .7), WHITE, [7, 6], .5, undefined, [0, 4, 3]);
    //     l.GenGfxCtx();
    //     scroller.AddItemToScrolledSection(l);
    // }

}

function Help(scene) {


    const flags = (SECTION.ITEM_FIT);

    //options, margin, pos, dim, col, name
    const section = new Section(SECTION.VERTICAL, [10, 10], [280, 650, 0], [100, 100], TRANSPARENCY(RED, .2));
    section.CreateListenEvent(LISTEN_EVENT_TYPES.MOVE);
    section.SetName('Help section')

    // scene.StoreMesh(section)
    const s1 = new Section(SECTION.VERTICAL, [15, 10], [220, 400, 0], [0, 0], TRANSPARENCY(GREY1, .2));
    s1.SetName('Help section 2')

    let msgs = [];
    for (let i = 0; i < DEBUG_PRINT_KEYS.length; i++) {

        msgs[i] = '\"' + DEBUG_PRINT_KEYS[i].key + '\": ' + DEBUG_PRINT_KEYS[i].discr

        const label = new Widget_Label(msgs[i], ALIGN.HOR_CENTER | ALIGN.VERT_CENTER, [400, 300, 0], 4, TRANSPARENCY(ORANGE_240_130_10, .7), WHITE, [7, 3], .5, [0, 4, 3])
        label.CreateListenEvent(LISTEN_EVENT_TYPES.HOVER)

        s1.AddItem(label)
    }

    // s1.Calc()

    const minimizer = new Widget_Minimize(section, section.geom.pos);
    minimizer.SetName('minimizer')

    section.AddItem(minimizer);
    section.AddItem(s1)

    scene.AddWidget(section, GFX_CTX_FLAGS.PRIVATE);
    //*Gfx_end_session(true);

    section.Calc()
    section.ConstructListeners()
}



function MeshInfo(scene) {

    const fontsize = 10;

    const infomesh = new Widget_Dynamic_Text_Mesh('Mesh name 000000000000', 'id:000', ALIGN.VERTICAL, [420, 15, 100], fontsize, GREEN_140_240_10, YELLOW_240_220_10, .4);
    infomesh.CreateNewText('pos: 0000,0000,0', fontsize, BLUE_10_120_220, [fontsize * 3, 10], .9);
    infomesh.CreateNewText('dim: 0000,0000', fontsize, BLUE_10_120_220, [fontsize * 3, 0], .9);
    infomesh.CreateNewText('idx: 0000, alpha: 0.00', fontsize, ORANGE_240_130_10, [fontsize * 3, 0], .9);
    infomesh.CreateNewText('gfx: group: 0, prog:0, vb:0, start:00000', fontsize, BLUE_10_120_220, [fontsize * 3, 0], .9);
    // infomesh.CreateNewText('PERFORMANCE COUNTER AND HOVERED MESH NAME', fontsize, BLUE_10_120_220, [fontsize * 3, 0], .9);
    // infomesh.CreateNewText('MOVEX: 0000000', fontsize, BLUE_10_120_220, [fontsize * 3, 0], .9);
    // infomesh.CreateNewText('BATCH: 0000000', fontsize, BLUE_10_120_220, [fontsize * 3, 0], .9);

    // For child
    infomesh.CreateNewText('Text: name of the text and id', fontsize, BLUE_10_120_220, [fontsize * 3, 0], .9);
    infomesh.CreateNewText('pos: 0000,0000,0, dim: 0000,0000, alpha: 0.00', fontsize, BLUE_10_120_220, [fontsize * 3, 0], .9);
    infomesh.CreateNewText('text gfx: group: 0, prog:0, vb:0, start:00000, count:00000', fontsize, BLUE_10_120_220, [fontsize * 3, 0], .9);
    infomesh.SetName('Info Mesh 2');

    // infomesh.RenderToDebugGfx();
    infomesh.geom.pos[0] = VIEWPORT.RIGHT - infomesh.GetMaxWidth() * 2 + 70;

    infomesh.Align_pre(infomesh, ALIGN.VERTICAL)
    // scene.AddWidget(infomesh, GFX_CTX_FLAGS.PRIVATE);
    scene.AddWidget(infomesh);

    return infomesh;
}

// TODO: The text updates the gfx buffers regardless of if any change has happened
function MeshInfoUpdate(params) {

    const textMesh = params.params.mesh;
    const infoMesh = STATE.mesh.hovered;

    if (infoMesh) {

        textMesh.UpdateText(infoMesh.name);

        const gfx = (infoMesh.gfx !== null) ? `gfx: group:${infoMesh.gfx.prog.groupidx}, prog:${infoMesh.gfx.prog.idx}, vb:${infoMesh.gfx.vb.idx}, start:${infoMesh.gfx.vb.start}` : 'null'

        let msgs = [
            `id:${infoMesh.id}`,
            `pos:${FloorArr3(infoMesh.geom.pos)}`,
            `dim: ${infoMesh.geom.dim}`,
            `idx: ${infoMesh.idx} | alpha:${infoMesh.mat.col[3]}`,
            gfx,
            // `Text:`,
            // `counter:${TEMP_TEST_PERFORMANE_COUNTERS.MESH_INFO_UI.COUNT}`,
            // `Batch :${TEMP_TEST_PERFORMANE_COUNTERS.MESH_INFO_UI.MOVE}`,
            // `Batch:${TEMP_TEST_PERFORMANE_COUNTERS.MESH_INFO_UI.BATCH_MOVE}`,
            // `mesh: ${STATE.mesh.hovered.name} counter${TEMP_TEST_PERFORMANE_COUNTERS.MESH_INFO_UI.COUNT}`,
        ];

        // Create info for any text gfx, if exists
        const child = (infoMesh.children.boundary && infoMesh.children.buffer[0]) ? infoMesh.children.buffer[0] : null;
        if (child) {
            if (child.type & MESH_TYPES_DBG.FONT_MATERIAL) { // Plain text

                const text_num_faces = (child.text_mesh) ? child.text_mesh.geom.num_faces : child.geom.num_faces; // If child is of type label and has 'text_mesh' else is plain text.
                
                msgs.push(`Plain Text:${child.name}, dim: ${child.id}`);
                msgs.push(`pos:${FloorArr3(child.geom.pos)}, dim: ${child.geom.dim}, alpha:${child.mat.col[3]}`);
                msgs.push(`gfx: group:${child.gfx.prog.groupidx}, prog:${child.gfx.prog.idx}, vb:${child.gfx.vb.idx}, start:${child.gfx.vb.start}, faces:${text_num_faces}`);
            }
            else if (child.text_mesh) { // Text in label or any other mesh that has text_mesh
                msgs.push(`Text_mesh: id:${child.text_mesh.id}, name:${child.text_mesh.name},`);
                msgs.push(`pos:${FloorArr3(child.text_mesh.geom.pos)}, dim: ${child.text_mesh.geom.dim}, alpha:${child.text_mesh.mat.col[3]}`);
                msgs.push(`gfx: group:${child.text_mesh.gfx.prog.groupidx}, prog:${child.text_mesh.gfx.prog.idx}, vb:${child.text_mesh.gfx.vb.idx}, start:${child.text_mesh.gfx.vb.start}, faces:${child.text_mesh.geom.num_faces}`);
            }

        }


        for (let i = 0; i < textMesh.children.boundary; i++) {

            const childText = textMesh.children.buffer[i];

            if (msgs[i]) childText.UpdateText(msgs[i]);
            else childText.UpdateText('NULL')
        }
    }
}

function GfxInfo(scene) {

    const infogfx = new Widget_Dropdown(`GFX INFO`, [350, 100, 0], [60, 20], GREY1, BLUE_10_120_220, WHITE, [5, 5]);
    // infogfx.CreateHoverEvent();
    infogfx.CreateClickEvent();
    infogfx.CreateMoveEvent();

    Drop_down_set_root(infogfx, infogfx)


    infogfx.Calc();
    infogfx.GenGfxCtx(GFX_CTX_FLAGS.PRIVATE);
    //*Gfx_end_session(true, true);
    infogfx.ConstructListeners();
    scene.StoreRootMesh(infogfx)

    const params = {
        infogfx_root: infogfx,
        gfxbuffer: [],
    }

    return params;
}

function GfxInfoUpdate(params) {

    const root_dp = params.params.gfxinfo.infogfx_root;
    const gfxbuffer = params.params.gfxinfo.gfxbuffer;
    const progs = Gl_progs_get_group(gfxbuffer.groupidx);

    let any_vb_found = false;

    for (let i = 0; i < progs.count; i++) {
        for (let j = 0; j < progs.buffer[i].vb.length; j++) {

            const vb = progs.buffer[i].vb[j];

            const gfxid = `${i}${j}`
            if (GfxInfoFindNewMeshEntries(gfxbuffer, gfxid)) {

                any_vb_found = true;
                const dp = new Widget_Dropdown(`prog:${i} vb:${vb.idx} count:${vb.count}`, [OUT_OF_VIEW, OUT_OF_VIEW, 0], [60, 20], GREY1, YELLOW_240_220_10, WHITE, [5, 5]);
                dp.debug_info.type |= INFO_LISTEN_EVENT_TYPE.GFX2;
                // dp.CreateAndAddEvent(LISTEN_EVENT_TYPES_INDEX.HOVER, root_dp.listeners.buffer)

                if (root_dp.menu.gfx) {
                    dp.GenGfxCtx(GFX_CTX_FLAGS.SPECIFIC, [root_dp.menu.gfx.prog.idx, root_dp.menu.gfx.vb.idx], root_dp);
                }

                root_dp.AddToMenu(dp)

                for (let k = 0; k < vb.debug.meshesNames.length; k++) {
                    const meshname = vb.debug.meshesNames[k];
                    const meshnametext = new Widget_Text(`${meshname}`, [300, 15, 0], 4, BLACK, .4);
                    meshnametext.GenGfxCtx(GFX_CTX_FLAGS.PRIVATE);
                    dp.AddToMenu(meshnametext);
                }

            }
        }
    }

    if (any_vb_found) {
        console.log('infogfx:', root_dp)
    }
}

function GfxInfoFindNewMeshEntries(gfxbuffer, gfxid) {
    for (let i = 0; i < gfxbuffer.length; i++) {
        if (gfxbuffer[i] === gfxid) return false;
    }
    gfxbuffer.push(gfxid)
    console.log(gfxbuffer)
    return true
}

function SetHoverToAllMeshesRecursive(mesh) {

    mesh.CreateListenEvent(LISTEN_EVENT_TYPES.HOVER);
    // mesh.AddListenEvent(LISTEN_EVENT_TYPES.HOVER);

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

 */

