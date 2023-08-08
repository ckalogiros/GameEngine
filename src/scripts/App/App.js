"use strict";
import { Scene } from '../Engine/Scenes.js'
import { EventsAddListeners, } from '../Engine/Events/Events.js';
import { RenderQueueGet, RenderQueueInit } from '../Engine/Renderers/Renderer/RenderQueue.js';
import { WebGlRenderer } from '../Engine/Renderers/WebGlRenderer.js';
import { CAMERA_CONTROLS, CameraOrthographic, CameraPerspective } from '../Engine/Renderers/Renderer/Camera.js';
import { Geometry2D } from '../Engine/Drawables/Geometry/Base/Geometry.js';
import { TextureInitBuffers } from '../Engine/Loaders/Textures/Texture.js';
import { FpsGetAvg, FpsGetAvg1S, FpsGetWorstFrame, FpsGetWorstFrameAvg, TimeGetDelta, TimeGetDeltaAvg, TimeGetFps, TimeGetTimer } from '../Engine/Timers/Time.js';
import { Widget_Label_Dynamic_Text, Widget_Label_Text } from '../Engine/Drawables/Widgets/WidgetLabelText.js';
import { Widget_Button } from '../Engine/Drawables/Widgets/WidgetButton.js';
import { Widget_Text, Widget_Dynamic_Text } from '../Engine/Drawables/Widgets/WidgetText.js';
import { GetShaderTypeId } from '../Graphics/Z_Debug/GfxDebug.js';
import { CubeGeometry } from '../Engine/Drawables/Geometry/Geometry3DCube.js';
import { Animations_create_dim_color_rgb, Animations_create_scale_up_down } from '../Engine/Animations/AnimationsBasic.js';
import { SizeOfObject } from '../Helpers/Helpers.js';
import { TimerGetGlobalTimer, TimerGetGlobalTimerCycle } from '../Engine/Timers/Timers.js';
import { PerformanceTimerCreate, PerformanceTimerInit, _Tm1GetFps, _Tm1GetMilisec, _Tm1GetNanosec, _Tm2GetFps, _Tm2GetMilisec, _Tm3GetFps, _Tm3GetMilisec, _tm1 } from '../Engine/Timers/PerformanceTimers.js';
import { TimeIntervalsCreate, TimeIntervalsInit } from '../Engine/Timers/TimeIntervals.js';
import { MAT_ENABLE, Material_TEMP_fromBufferFor3D } from '../Engine/Drawables/Material/Material.js';
import { Mesh } from '../Engine/Drawables/Mesh.js';



let renderer = null;
let TEMP_MESH = null

function TestEventDispatc() {
    console.log('TestEventDispatc')
}

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
    const scene = new Scene();
    const camera = new CameraOrthographic();
    // const camera = new CameraPerspective();

    // camera.SetControls(CAMERA_CONTROLS.PAN);
    // camera.SetControls(CAMERA_CONTROLS.ZOOM);
    // camera.SetControls(CAMERA_CONTROLS.ROTATE);
    // camera.Translate(80, 80, 20)

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
        //     mesh.Enable(MESH_ENABLE.ATTR_STYLE);
        //     mesh.SetStyle(8, 35, 3);
        //     scene.AddMesh(mesh);
        //     mesh.CreateListenEvent(LISTEN_EVENT_TYPES.HOVER);
        //     // mesh.CreateDispatchEvent(LISTEN_EVENT_TYPES.HOVER, DISPATCH_EVENT_TYPES.SCALE_UP_DOWN, Animations_create_scale_up_down);
        //     // mesh.CreateDispatchEvent(LISTEN_EVENT_TYPES.HOVER, DISPATCH_EVENT_TYPES.DIM_COLOR, Animations_create_dim_color_rgb);

        // }
        // {
        //     const geom = new Geometry2D([204, 420, 0], [50, 50]);
        //     const mat = new Material(PINK_240_60_160);
        //     mat.col = PINK_240_60_160;
        //     const mesh = new Mesh(geom, mat);
        //     mesh.Enable(MESH_ENABLE.ATTR_STYLE);
        //     mesh.SetStyle(20, 35, 3);
        //     scene.AddMesh(mesh);
        //     mesh.CreateListenEvent(LISTEN_EVENT_TYPES.HOVER);
        // }
        // {
        //     const geom = new Geometry2D([308, 420, 0], [50, 50]);
        //     const mat = new Material(ORANGE_240_130_10);
        //     const mesh = new Mesh(geom, mat);
        //     mesh.Enable(MESH_ENABLE.ATTR_STYLE);
        //     mesh.SetStyle(10, 15, 3);
        //     scene.AddMesh(mesh);
        //     mesh.SetColor(WHITE);

        // }
        // {
        //     const geom = new Geometry2D([412, 420, 0], [50, 50]);
        //     const mat = new Material(ORANGE_240_130_10);
        //     const mesh = new Mesh(geom, mat);
        //     mesh.Enable(MESH_ENABLE.ATTR_STYLE);
        //     mesh.SetStyle(25, 15, 3);
        //     scene.AddMesh(mesh);
        //     mesh.SetColor(BLUE_10_120_220);
        // }
    }

    { // Simple text
        // const txt = 'HelloHelloHelloHelloHelloHelloHelloHelloHelloHelloHelloHelloHelloHelloHelloHelloHelloHelloHelloHelloHelloHelloHelloHelloHelloHelloHelloHelloHelloHelloHelloHello';
        // const text = new Widget_Text(txt, [-100, 120, 0], 10, [1, 1], WHITE, .5);
        // scene.AddMesh(text);
        // text.geom.pos[1] += 30;
        // scene.AddMesh(text);
        // text.geom.pos[1] += 30;
        // scene.AddMesh(text);
        // text.geom.pos[1] += 30;
        // scene.AddMesh(text);
    }

    { // Text Label
        const textLabel = new Widget_Label_Text('Text Label', [60, 270, 0], 17, [1, 1], 3, .4);
        textLabel.state2.mask |= MESH_STATE.IS_MOVABLE;
        scene.AddMesh(textLabel);
        textLabel.CreateListenEvent(LISTEN_EVENT_TYPES.HOVER);
        textLabel.CreateDispatchEvent(LISTEN_EVENT_TYPES.HOVER, DISPATCH_EVENT_TYPES.SCALE_UP_DOWN, Animations_create_scale_up_down);
        textLabel.CreateDispatchEvent(LISTEN_EVENT_TYPES.HOVER, DISPATCH_EVENT_TYPES.DIM_COLOR, Animations_create_dim_color_rgb);
        RenderQueueGet().SetPriority('last', textLabel.children.buffer[0].gfx.prog.idx, textLabel.gfx.vb.idx);
        
        const textLabel2 = new Widget_Label_Text('Text Label 2', [60, 350, 0], 17, [1, 1], 3, .4);
        textLabel2.state2.mask |= MESH_STATE.IS_MOVABLE;
        scene.AddMesh(textLabel2);
        textLabel2.CreateListenEvent(LISTEN_EVENT_TYPES.HOVER);
        textLabel2.CreateDispatchEvent(LISTEN_EVENT_TYPES.HOVER, DISPATCH_EVENT_TYPES.SCALE_UP_DOWN, Animations_create_scale_up_down);
        textLabel2.CreateDispatchEvent(LISTEN_EVENT_TYPES.HOVER, DISPATCH_EVENT_TYPES.DIM_COLOR, Animations_create_dim_color_rgb);
    }

    { // Dynamic Text
        const fontsize = 6; let ms = 200;
        
        ms = 10;
        const timer = new Widget_Dynamic_Text('Timer:', '000000', [0, 20, 0], fontsize, [1, 1], GREEN_140_240_10, YELLOW_240_220_10, .4);
        scene.AddMesh(timer);
        timer.SetDynamicText(ms, TimeGetFps, `DynamicText ${ms} _Tm1GetFps`)
        let idx = timer.CreateDynamicText('00000', fontsize, null, YELLOW_240_220_10, 16, .4);
        timer.SetDynamicText(ms, TimeGetDeltaAvg, `DynamicText ${ms} _Tm1GetFps`)
        idx = timer.CreateDynamicText('000000', fontsize, null, YELLOW_240_220_10, 16, .4);
        timer.SetDynamicText(ms, TimeGetTimer, `DynamicText ${ms} _Tm1GetFps`)
        
        // Performance Time Measure 1
        ms = 500;
        const timeMeasure1 = new Widget_Dynamic_Text('All Timers Update:', '000000', [0, 45, 0], fontsize, [1, 1], GREEN_140_240_10, YELLOW_240_220_10, .4);
        scene.AddMesh(timeMeasure1);
        timeMeasure1.SetDynamicText(ms, _Tm1GetFps, `DynamicText ${ms} _Tm1GetFps`)
        idx = timeMeasure1.CreateDynamicText('000000', fontsize, null, YELLOW_240_220_10, 16, .4);
        timeMeasure1.SetDynamicText(ms, _Tm1GetMilisec, `DynamicText ${ms} FpsGetAvg`)
        // idx = timeMeasure1.CreateDynamicText('000000', fontsize, null, ORANGE_240_200_10, 16, .4);
        // timeMeasure1.SetDynamicText(ms, _Tm1GetNanosec, `DynamicText ${ms} FpsGetAvg`)
        
        // Performance Time Measure 2
        ms = 500;
        const timeMeasure2 = new Widget_Dynamic_Text('Scene Update:', '000000', [0, 70, 0], fontsize, [1, 1], GREEN_140_240_10, YELLOW_240_220_10, .4);
        scene.AddMesh(timeMeasure2);
        timeMeasure2.SetDynamicText(ms, _Tm2GetFps, `DynamicText ${ms} _Tm1GetFps`)
        idx = timeMeasure2.CreateDynamicText('000000', fontsize, null, YELLOW_240_220_10, 16, .4);
        timeMeasure2.SetDynamicText(ms, _Tm2GetMilisec, `DynamicText ${ms} FpsGetAvg`)
        
        // Performance Time Measure 3
        ms = 500;
        const timeMeasure3 = new Widget_Dynamic_Text('GlDraw:', '000000', [0, 95, 0], fontsize, [1, 1], GREEN_140_240_10, YELLOW_240_220_10, .4);
        scene.AddMesh(timeMeasure3);
        timeMeasure3.SetDynamicText(ms, _Tm3GetFps, `DynamicText ${ms} _Tm1GetFps`)
        idx = timeMeasure3.CreateDynamicText('000000', fontsize, null, YELLOW_240_220_10, 16, .4);
        timeMeasure3.SetDynamicText(ms, _Tm3GetMilisec, `DynamicText ${ms} FpsGetAvg`)
        
        // Fps average for xms interval time
        // ms = 100;
        // const fpsAvg = new Widget_Dynamic_Text(`Fps-Avg-${ms}ms`, '000000', [0, 120, 0], fontsize, [1, 1], GREEN_140_240_10, YELLOW_240_220_10, .4);
        // scene.AddMesh(fpsAvg);
        // fpsAvg.SetDynamicText(ms, _Ta1GetAvg, `Fps-Avg-${ms}ms _Ta1GetAvg`)

    }

    { // Label Dynamic Text
        // const dynamicText = new Widget_Label_Dynamic_Text('LabelDynamic1:', '0000', [0, 200, 0], 10, [1, 1], WHITE, GREEN, 4, .4);
        // scene.AddMesh(dynamicText);
        // dynamicText.SetDynamicText(2000, FpsGetAvg, 'Test-DynamicText')

    }

    { // Create cube
        {
            const geom = new CubeGeometry([80, 450, -1], [100, 100, 100], [1, 1, 1]);
            const mat = new Material_TEMP_fromBufferFor3D(WHITE)
            mat.Enable(MAT_ENABLE.ATTR_VERTEX_COLOR, {
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
            mat.Enable(MAT_ENABLE.ATTR_VERTEX_COLOR, {
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
            mat.Enable(MAT_ENABLE.ATTR_VERTEX_COLOR, {
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

    // Test1(scene);

    tm.Stop();

    // If camera is static, update projection matrix uniform only once
    camera.UpdateProjectionUniform(renderer.gl);
    RenderQueueGet().UpdateActiveQueue(); // Update active queue buffer with the vertex buffers set to be drawn


    {
        // OLD
        // ScenesLoadScene(SCENE.startMenu); // Load the first Scene
        // FramebuffersSetActive(true);
        // ScenesSetFramebufferQueue();
        // renderer.camera.Update(gfxCtx.gl, u_projection);

        { // backgrounds
            // const startMenuBk = RectCreateRect('startMenuBk', SID_DEFAULT | SID.FX.FS_GRADIENT, DarkenColor(GREENL2, 0.5), dim, [1, 1], null, pos, style, null, null);
            // startMenuBk.gfxInfo = GlAddMesh(startMenuBk.sid, startMenuBk.mesh, 1, SCENE.startMenu, 'Background StartMenu', GL_VB.ANY, NO_SPECIFIC_GL_BUFFER);
            // scenes.AddMesh(startMenuBk, APP_MESHES_IDX.background.startMenu);

            // const startStageBk = RectCreateRect('startStageBk', SID_DEFAULT | SID.FX.FS_GRADIENT, DarkenColor(GREY2, 0.1), dim, [1, 1], null, pos, style, null, null);
            // startStageBk.gfxInfo = GlAddMesh(startStageBk.sid, startStageBk.mesh, 1, SCENE.startStage, 'Background StartStage', GL_VB.ANY, NO_SPECIFIC_GL_BUFFER);
            // scenes.AddMesh(startStageBk, APP_MESHES_IDX.background.startStage);

            // // Create 'finish stage' background
            // const finishStageBk = RectCreateRect('finishStageBk', SID_DEFAULT | SID.FX.FS_GRADIENT, DarkenColor(BLUE_10_120_220, 0.3), dim, [1, 1], null, pos, style, null, null);
            // finishStageBk.gfxInfo = GlAddMesh(finishStageBk.sid, finishStageBk.mesh, 1, SCENE.finishStage, 'Background FinishStage', GL_VB.ANY, NO_SPECIFIC_GL_BUFFER);
            // scenes.AddMesh(finishStageBk, APP_MESHES_IDX.background.finishStage);

            // // Create 'stage' background
            // pos = [Viewport.width / 2, Viewport.height / 2, -1];
            // const stageBk = RectCreateRect('stageBk', SID_DEFAULT | SID.FX.FS_GRADIENT, DarkenColor(BLUE_10_160_220, 0.1), dim, [1, 1], null, pos, style, null, null);
            // stageBk.gfxInfo = GlAddMesh(stageBk.sid, stageBk.mesh, 1, SCENE.stage, 'Background Stage', GL_VB.ANY, NO_SPECIFIC_GL_BUFFER);
            // scenes.AddMesh(stageBk, APP_MESHES_IDX.background.stage);

            // // Create stage menu background
            // dim = [Viewport.width / 2, STAGE.MENU.HEIGHT];
            // pos = [Viewport.width / 2, STAGE.MENU.HEIGHT, 1];
            // style = { pad: 10, roundCorner: 1, border: 5, feather: 10 };
            // const stageMenuBk = RectCreateRect('stageMenuBk', SID_DEFAULT | SID.FX.FS_V2DGFX, DarkenColor(ORANGE_240_130_10, 0.1), dim, [1, 1], null, pos, style, null, null);
            // stageMenuBk.gfxInfo = GlAddMesh(stageMenuBk.sid, stageMenuBk.mesh, 1, SCENE.stage, 'Background Stage Menu', GL_VB.ANY, NO_SPECIFIC_GL_BUFFER);
            // scenes.AddMesh(stageMenuBk, APP_MESHES_IDX.background.stageMenu);
        }

        { // Buttons
            // let btnDim = [200, 20];
            // let btnPos = [0, 100, 0];
            // style = { pad: 13, roundCorner: 15, border: 5, feather: 3 };
            // let fontSize = 20;
            // const sdfInner = 0.39;
            // // Create play button
            // const playBtn = CreateButton(SCENE.startMenu, 'PlayBtn', 'Play',
            //     WHITE, DarkenColor(YELLOW_240_240_10, 0.1), btnDim, btnPos,
            //     style, fontSize, true, sdfInner, ALIGN.CENTER_HOR | ALIGN.TOP);
            // // Add play button to scenes mesh to buffer
            // scenes.AddMesh(playBtn, APP_MESHES_IDX.buttons.play);


            // // Options (in main start menu) button
            // btnPos[1] += playBtn.area.mesh.dim[1] * 2 + style.pad + style.border + style.feather; // Set next button's y pos (just bellow the prev button)
            // const optionsBtn = CreateButton(SCENE.startMenu, 'OptionsBtn', 'Options',
            //     WHITE, DarkenColor(PINK_240_60_200, 0.1), btnDim, btnPos,
            //     style, fontSize, true, sdfInner, ALIGN.CENTER_HOR | ALIGN.TOP);
            // scenes.AddMesh(optionsBtn, APP_MESHES_IDX.buttons.options);

            // // Start Stage (in main start stage) button
            // btnPos[0] = 0;
            // const startStageBtn = CreateButton(SCENE.startStage, 'startStageBtn', 'Start',
            //     WHITE, DarkenColor(GREENL1, 0.1), btnDim, btnPos,
            //     style, fontSize, true, sdfInner, ALIGN.CENTER_HOR | ALIGN.CENTER_VERT);
            // scenes.AddMesh(startStageBtn, APP_MESHES_IDX.buttons.start);

            // fontSize = 10;

            // // Continue (after completing a stage) button
            // btnDim[0] = CalcTextWidth('CONTINUE', fontSize);
            // btnPos = [0, -150, btnPos[2]];
            // const continueBtn = CreateButton(SCENE.finishStage, 'ContinueBtn', 'CONTINUE', WHITE, BLUE_10_120_220,
            //     btnDim, btnPos, style, fontSize, true, sdfInner, ALIGN.CENTER_HOR | ALIGN.BOTTOM);
            // scenes.AddMesh(continueBtn, APP_MESHES_IDX.buttons.continue);
        }

        { // FX
            // Must be Initialized before Ui that uses effects
            // ExplosionsInit(); // Initialize explosions
            // scenes.AddMesh(ExplosionsGetCircle(), APP_MESHES_IDX.fx.explosions.circle);
            // scenes.AddMesh(ExplosionsGetSimple(), APP_MESHES_IDX.fx.explosions.simple);
            // scenes.AddMesh(ExplosionsGetVolumetricExplosions(), APP_MESHES_IDX.fx.explosions.volumetric);

            // ExplosionsCreateVolumetricExplosion([280,80,4], GREEN_140_240_10, 1000, 0.01);
            // meshIdx = APP_MESHES_IDX.fx.explosions.volumetric; scenes.scene[idx].AddMesh(scenes.allMeshes[meshIdx], meshIdx);

            // GlowInit();
            // scenes.AddMesh(GlowGet(), APP_MESHES_IDX.fx.glow);

            // TwistInit();
            // scenes.AddMesh(TwistGet(), APP_MESHES_IDX.fx.twist);

            // VortexInit();
            // VortexCreate(WHITE, [306, 74], [130, 130]);
            // scenes.AddMesh(VortexGet(), APP_MESHES_IDX.fx.vortex);
        }

        { // Ui
            //     const ui_score = UiCreateScore(SCENE.stage);
            //     scenes.AddMesh(ui_score, APP_MESHES_IDX.ui.score);
            //     const ui_totalScore = UiCreateTotalScore(SCENE.stage);
            //     scenes.AddMesh(ui_totalScore, APP_MESHES_IDX.ui.totalScore);
            //     const ui_mod = UiCreateScoreModifier(SCENE.stage);
            //     scenes.AddMesh(ui_mod, APP_MESHES_IDX.ui.mod);
            //     const ui_lives = UiCreateLives(SCENE.stage);
            //     scenes.AddMesh(ui_lives, APP_MESHES_IDX.ui.lives);
            //     const ui_combo = UiCreateCombo(SCENE.stage);
            //     scenes.AddMesh(ui_combo, APP_MESHES_IDX.ui.combo);
            //     const ui_m = AnimTextsInit(SCENE.stage);
            //     scenes.AddMesh(ui_m, APP_MESHES_IDX.ui.animText);
            //     const ui_fps = UiCreateFps(SCENE.stage);
            //     scenes.AddMesh(ui_fps[0], APP_MESHES_IDX.ui.fps.avg);
            //     scenes.AddMesh(ui_fps[1], APP_MESHES_IDX.ui.fps.avg1s);
        }

        { // Game Meshes

            // /* Player */
            // const player = CreatePlayer(SCENE.stage);
            // scenes.AddMesh(player, APP_MESHES_IDX.player);
            // /* Bricks */
            // const bricks = BrickInit(SCENE.stage, BRICK.MAX_COUNT);
            // scenes.AddMesh(bricks, APP_MESHES_IDX.bricks);
            // /* Ball */
            // const balls = BallsInit(SCENE.stage); // Initialize Ball's buffer
            // BallCreate([Viewport.width / 2, PLAYER.YPOS - 100], WHITE);
            // scenes.AddMesh(balls, APP_MESHES_IDX.balls);
            // /* Power Ups */
            // const powUps = PowerUpGet();
            // scenes.AddMesh(powUps, APP_MESHES_IDX.powUps);
            // /* Power Ups - Bullet Gun */
            // GunInit();
            // const gun = GunGet();
            // scenes.AddMesh(gun, APP_MESHES_IDX.gun);
            // /* Power Ups - Bullet */
            // const bullets = BulletGet();
            // bullets.Init();
            // scenes.AddMesh(gun, APP_MESHES_IDX.bullet);
            // /* Coin */
            // const coins = CoinGet();
            // scenes.AddMesh(coins, APP_MESHES_IDX.coins);

            // /* ParticleSystem */
            // const particleBallTail = ParticleSystemFindByName('BallTail-0');
            // scenes.AddMesh(particleBallTail, APP_MESHES_IDX.fx.particleSystem.ballTail);
        }

        { // Stage Comleted Meshes

            // Mechanical Rings
            // const stageCompleteMech = StageCompletedCreate();
            // scenes.AddMesh(stageCompleteMech.buffer[0], APP_MESHES_IDX.StageCompleted.text);
            // scenes.AddMesh(stageCompleteMech.buffer[1], APP_MESHES_IDX.StageCompleted.outer);
            // scenes.AddMesh(stageCompleteMech.buffer[2], APP_MESHES_IDX.StageCompleted.middle);
            // scenes.AddMesh(stageCompleteMech.buffer[3], APP_MESHES_IDX.StageCompleted.inner);


            // const showTotalScore = StageCompletedCreateTotalScore();
            // scenes.AddMesh(showTotalScore, APP_MESHES_IDX.text.totalScore);
        }

        { // Test Shaders
            { // CPU_AWSOME
                // const awsomeShader = RectCreateRect('awsomeShader', 
                // SID_DEFAULT | SID.AWSOME, 
                // WHITE, 
                // [500, 800], [1,1], null, [250, 400, 20], null, null, null);
                // GlAddMesh(SID_DEFAULT | SID.AWSOME, awsomeShader.mesh,1, SCENE.all, 'AwsomeShader', GL_VB.ANY, NO_SPECIFIC_GL_BUFFER);
            }
            { // VORTEX
                // const testShader = RectCreateRect('vortexShader', 
                // SID_MIN | SID.TEST_SHADER, 
                // WHITE, 
                // [60, 60], [1,1], null, [306, 74, 30], null, null, null);
                // // [250, 400], [1,1], null, [250, 400, 29], null, null, null);
                // const testShaderGfx = GlAddMesh(SID_MIN | SID.TEST_SHADER, testShader.mesh,1, SCENE.all, 'vortexShader', GL_VB.ANY, NO_SPECIFIC_GL_BUFFER);
                // TEST_SHADERS_PROG_IDX = testShaderGfx.prog.idx; 
            }
            { // NOISE
                // const testShader = RectCreateRect('NOISE', 
                // SID_DEFAULT | SID.FX.FS_NOISE, 
                // WHITE, 
                // [BULLET.WIDTH, BULLET.HEIGHT], [1,1], null, [250, 200, 30], null, null, null);
                // // [250, 400], [1,1], null, [250, 400, 29], null, null, null);
                // const testShaderGfx = GlAddMesh(SID_DEFAULT | SID.FX.FS_NOISE, testShader.mesh,1, SCENE.all, 'NOISE', GL_VB.ANY, NO_SPECIFIC_GL_BUFFER);
                // TEST_SHADERS_PROG_IDX = testShaderGfx.prog.idx; 
            }

        }
    }

}

export function AppRender() {
    requestAnimationFrame(AppRender);
    renderer.Render();
}


function Test1(scene) {
    const btn1 = new Widget_Button('BTutton_g|{', [200, 420, 0], 10, [1, 1], PINK_240_60_160, 3, .3);
    scene.AddMesh(btn1);

    const btn2 = new Widget_Button('Button_2', [130, 550, 0], 16, [1, 1], PINK_240_60_160, 3, .3);
    scene.AddMesh(btn2);
    btn2.CreateListenEvent(LISTEN_EVENT_TYPES.HOVER);
    btn2.CreateDispatchEvent(LISTEN_EVENT_TYPES.HOVER, DISPATCH_EVENT_TYPES.SCALE_UP_DOWN, Animations_create_scale_up_down);
    // btn2.CreateListenEvent(LISTEN_EVENT_TYPES.HOVER, Animations_create_scale_up_down);
    const btn3 = new Widget_Button('Button_3', [90, 700, 0], 20, [1, 1], PINK_240_60_160, 3, .3);
    scene.AddMesh(btn3);
    btn3.CreateListenEvent(LISTEN_EVENT_TYPES.HOVER);
    btn3.CreateDispatchEvent(LISTEN_EVENT_TYPES.HOVER, DISPATCH_EVENT_TYPES.SCALE_UP_DOWN, Animations_create_scale_up_down);
    // btn3.CreateListenEvent(LISTEN_EVENT_TYPES.HOVER, Animations_create_scale_up_down);

    RenderQueueGet().SetPriority('last', btn1.children.buffer[0].gfx.prog.idx, btn1.gfx.vb.idx);
}




function MeshConstantsSetUp() {

    STAGE.MENU.PAD = 20;
    STAGE.MENU.WIDTH = (Viewport.width / 2) - STAGE.MENU.PAD;
    STAGE.MENU.HEIGHT = 20 + STAGE.MENU.PAD * 2;
    STAGE.TOP = Viewport.height / 5;

    // Calculate left and right padd of the start and end of brick's grid.
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

//     // Button's Sliders
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


//     // Brick's Sliders
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
