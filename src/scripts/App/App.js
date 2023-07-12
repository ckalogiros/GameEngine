"use strict";
import { LoadFontTextures, FontCreateUvMap } from '../Engine/Loaders/Font/LoadFont.js'
import { Scene } from '../Engine/Scenes.js'
import { EventsAddListeners, } from '../Engine/Events/Events.js';
import { GlGetProgram } from '../Graphics/GlProgram.js';
import { ButtonSetRoundCorner, ButtonSetBorderWidth, ButtonSetBorderFeather } from '../Engine/Drawables/Widgets/Button.js';
import { BrickSetRoundCorner, BrickSetBorderWidth, BrickSetBorderFeather } from './Drawables/Brick.js';
import { InterpolateToRange } from '../Helpers/Math/MathOperations.js';

// Debug-Print
import { Rect2D } from '../Engine/Drawables/Geometries/Rect2D.js';
import { MAT_ENABLE, Material } from '../Engine/Drawables/Material.js';
import { MESH_ENABLE, Mesh, TempSetMesh } from '../Engine/Drawables/Mesh.js';
import { RenderQueueCreate } from '../Engine/Renderers/Renderer/RenderQueue.js';
import { WebGlRenderer } from '../Engine/Renderers/WebGlRenderer.js';
import { CameraOrthographic, CameraPerspective } from '../Engine/Renderers/Renderer/Camera.js';


let renderer = null;

export function AppInit() {

    // Load Fonts, load metrics and create uv map for each loaded font 
    LoadFontTextures();
    FontCreateUvMap();

    /* * * * * * * * * * * * * * * * * * * * * * * * * * *
    * Create Renderer and Scene
    */
   const scene = new Scene();
   const camera = new CameraOrthographic();
//    const camera = new CameraPerspective;
   renderer = new WebGlRenderer(scene, camera);
   
   EventsAddListeners();
   MeshConstantsSetUp();
   
   
   /* * * * * * * * * * * * * * * * * * * * * * * * * * *
   * Create meshes
   */
    const geom = new Rect2D([Viewport.width/2, Viewport.height/2, 0], [100, 100]);
    const mat = new Material(ORANGE_240_130_10);
    // mat.Enable([MAT_ENABLE.UNIF_RESOLUTION, MAT_ENABLE.ATTR_STYLE]); 
    // mat.Enable(MAT_ENABLE.UNIF_RESOLUTION); 
    // mat.Enable(MAT_ENABLE.ATTR_STYLE); 
    // mat.SetStyle(10, 30, 3); // TODO: How we can set the style params with no extra call??? Maybe in the mat creation new Material(..., style)
    const mesh = new Mesh(geom, mat);
    // mesh.Enable(MESH_ENABLE.ATTR_STYLE);
    // mesh.Enable(MESH_ENABLE.UNIF_RESOLUTION);
    scene.AddMesh(mesh);
    TempSetMesh(mesh);
    const mesh1 = new Mesh(geom, mat);
    mesh1.geom.pos[1] += 204; 
    scene.AddMesh(mesh1);
    TempSetMesh(mesh1);
    const mesh2 = new Mesh(geom, mat);
    mesh2.geom.pos[1] += 204; 
    scene.AddMesh(mesh2);
    TempSetMesh(mesh2);
    // const prog = GlGetProgram(mesh.gfx.prog.idx);
    // const unifBufferResIdx = prog.UniformsBufferCreateScreenRes();
    // prog.UniformsSetBufferUniform(Viewport.width, unifBufferResIdx.resXidx);
    // prog.UniformsSetBufferUniform(Viewport.height, unifBufferResIdx.resYidx);
    // prog.UniformsCreateTimer(0.1)

    RenderQueueCreate(); // Initilize the render Queue for drawing vertex buffers in a priority(z index) based aproach
    // ScenesLoadScene(SCENE.startMenu); // Load the first Scene
    // FramebuffersSetActive(true);
    // ScenesSetFramebufferQueue();
    // renderer.camera.Update(gfxCtx.gl, u_projection);
    {
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

    // Render
    // window.requestAnimationFrame(Render);
    // requestAnimationFrame(Render);
    // window.requestAnimationFrame(renderer.Render);
    
}

export function AppRender(){
    requestAnimationFrame(AppRender);
    renderer.Render();
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

function AppInitReservedGlBuffers() {
    // PowerUpInit(SCENE.stage);
    // CoinInit(SCENE.stage);
}

function AddCssUiListeners() {
    const SdfInnerDistSlider = document.getElementById("sdf-param1");
    const SdfInnerDistOut = document.getElementById("sdf-param1-val");
    SdfInnerDistOut.innerHTML = SdfInnerDistSlider.value;

    /**
     * Below are the event listeners for every time a slider ui is changed,
     * we make a call to update the uniform values of the gl program
     */

    // Set Uniforms buffer params
    const prog = GlGetProgram(UNIFORM_PARAMS.sdf.progIdx);
    prog.UniformsSetBufferUniform(InterpolateToRange(SdfInnerDistSlider.value, 100, 1), UNIFORM_PARAMS.sdf.innerIdx);

    // On event
    SdfInnerDistSlider.oninput = function () {
        SdfInnerDistOut.innerHTML = this.value;
        prog.UniformsSetBufferUniform(InterpolateToRange(SdfInnerDistSlider.value, 100, 1), UNIFORM_PARAMS.sdf.innerIdx);
    }

    const SdfOuterDistSlider = document.getElementById("sdf-param2");
    const SdfOuterDistOut = document.getElementById("sdf-param2-val");
    SdfOuterDistOut.innerHTML = SdfOuterDistSlider.value;

    prog.UniformsSetBufferUniform(InterpolateToRange(SdfOuterDistSlider.value, 100, 1), UNIFORM_PARAMS.sdf.outerIdx);

    SdfOuterDistSlider.oninput = function () {
        SdfOuterDistOut.innerHTML = this.value;
        prog.UniformsSetBufferUniform(InterpolateToRange(SdfOuterDistSlider.value, 100, 1), UNIFORM_PARAMS.sdf.outerIdx);
    }

    /**
     * Below we set the listeners for attributs that have to change through
     * ui sliders(like the roundnes, bborder, etc). We update directly the 
     * vertex buffer values, so there is no need for uniform buffer update .
     */
    const roundRatio = 0.5;
    const borderRatio = 0.15;
    const featherRatio = 0.2;

    // Button's Sliders
    const buttonRoundCornerSlider = document.getElementById('button-round-corner');
    const buttonRoundCornerOut = document.getElementById("button-round-corner-val");
    buttonRoundCornerOut.innerHTML = buttonRoundCornerSlider.value;
    buttonRoundCornerSlider.oninput = function () {
        buttonRoundCornerOut.innerHTML = this.value;
        ButtonSetRoundCorner(Number(this.value));
    }

    const buttonBorderWidthSlider = document.getElementById('button-border-width');
    const buttonBorderWidthOut = document.getElementById("button-border-width-val");
    buttonBorderWidthOut.innerHTML = buttonRoundCornerSlider.value;
    buttonBorderWidthSlider.oninput = function () {
        buttonBorderWidthOut.innerHTML = this.value;
        ButtonSetBorderWidth(Number(this.value));
    }

    const buttonBorderFeatherSlider = document.getElementById('button-border-feather');
    const buttonBorderFeatherOut = document.getElementById("button-border-feather-val");
    buttonBorderFeatherOut.innerHTML = buttonRoundCornerSlider.value;
    buttonBorderFeatherSlider.oninput = function () {
        buttonBorderFeatherOut.innerHTML = this.value;
        ButtonSetBorderFeather(Number(this.value))
    }


    // Brick's Sliders
    const brickRoundCornerSlider = document.getElementById('brick-round-corner');
    const brickRoundCornerOut = document.getElementById("brick-round-corner-val");
    brickRoundCornerOut.innerHTML = brickRoundCornerSlider.value;
    brickRoundCornerSlider.oninput = function () {
        brickRoundCornerOut.innerHTML = this.value;
        BrickSetRoundCorner(Number(this.value) * roundRatio);
    }

    const brickBorderWidthSlider = document.getElementById('brick-border-width');
    const brickBorderWidthOut = document.getElementById("brick-border-width-val");
    brickBorderWidthOut.innerHTML = brickRoundCornerSlider.value;
    brickBorderWidthSlider.oninput = function () {
        brickBorderWidthOut.innerHTML = this.value;
        BrickSetBorderWidth(Number(this.value) * borderRatio);
    }

    const brickBorderFeatherSlider = document.getElementById('brick-border-feather');
    const brickBorderFeatherOut = document.getElementById("brick-border-feather-val");
    brickBorderFeatherOut.innerHTML = brickRoundCornerSlider.value;
    brickBorderFeatherSlider.oninput = function () {
        brickBorderFeatherOut.innerHTML = this.value;
        BrickSetBorderFeather(Number(this.value) * featherRatio);
    }

}
