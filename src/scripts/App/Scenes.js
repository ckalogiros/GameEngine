"use strict";
import { Player, CreatePlayer } from './Drawables/Player.js';
import { Button, CreateButton } from '../Engine/Drawables/Widgets/Button.js';
import { BallsInit, BallCreate, BallProjLineSetPriority, Balls } from './Drawables/Ball.js';
import { Rect, RectCreateRect } from '../Engine/Drawables/Shapes/Rect.js';
import { Text, CalcTextWidth } from '../Engine/Drawables/Text/Text.js';
import { DarkenColor } from '../Helpers/Helpers.js';
import { UiCreateScore, UiCreateScoreModifier, UiCreateLives, UiCreateCombo, UiTextVariable, UiCreateTotalScore, UiCreateFps, AnimTextsInit, AnimTexts } from './Drawables/Ui/Ui.js';
import { GfxSetVbShow } from '../Graphics/Buffers/GlBuffers.js';
import { Explosions, ExplosionsGetCircle, ExplosionsGetSimple, ExplosionsGetVolumetricExplosions, ExplosionsInit } from '../Engine/Drawables/Fx/Explosions.js';
import { ParticleSystem, ParticleSystemFindByName, Particles } from '../Engine/ParticlesSystem/Particles.js';
import { PowerUpGet, PowerUps } from './Drawables/PowerUp.js';
import { BrickInit, Bricks } from './Drawables/Brick.js';
import { TextLabel } from '../Engine/Drawables/Widgets/TextLabel.js';
import { RenderQueueGet, RenderQueueSetPriority } from '../Engine/Renderer/RenderQueue.js';
import { CoinGet, Coins } from './Drawables/Coin.js';
import { Glow, GlowGet, GlowInit } from '../Engine/Drawables/Fx/Glow.js';
import { Twist, TwistGet, TwistInit } from '../Engine/Drawables/Fx/Twist.js';
import { BulletGet, GunGet, GunInit } from './Drawables/Bullet.js';
import { Framebuffer, FramebuffersCreate, FramebuffersGet, FramebuffersInit } from '../Graphics/Buffers/Renderbuffer.js';
import { StageCompletedCreate, StageCompletedCreateTotalScore } from './Drawables/StageCompleted.js';
import { Vortex, VortexCreate, VortexGet, VortexGetVortex, VortexInit } from '../Engine/Drawables/Fx/Vortex.js';
import { Shadow, ShadowCreate, ShadowGetShadow, ShadowInit } from '../Engine/Drawables/Fx/Shadow.js';
import { Geometry2D } from '../Engine/Drawables/Geometry.js';
import { Material } from '../Engine/Drawables/Material.js';
import { Mesh2 } from '../Engine/Drawables/Mesh.js';

/* * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * *
 *  LOGIC:
 *      The whole point of the Scenes abstraction is to have a structure(a scene) that can store all 
 *          of it's meshes Graphics info, so that we can enable-dissable the drawing of the scene's vertex buffers.
 *
 *      Create a scene:
 *          1. Add any new meshes in APP_MESHES_IDX struct (as member vars denoting indexes)
 *          2. Create any new meshes in ScenesCreateAllMeshes().
 *              Here takes place the creation of the actual meshes. 
 *              They are been added to the Scene meshes buffer, 
 *              an array that stores refferences of all meshes of the application).
 *              E.g. Create mesh, add it's refference to the Scenes.allMeshes buffer
 *          3. Set a switch statement in ScenesCreateScene(), 
 *              to add the necessary meshes for that specific scene. Use the 'APP_MESHES_IDX' to refer(find) any
 *              mesh in the Scenes.allMeshes buffer, and add their gfxInfo to the current scene's gfxInfo buffer.
 *              The scene does not store or have a reference to any mesh data, only it's gfxInfo data.
 *              Call ScenesCreateScene(sceneIdx) with param the scene's indxe(SCENE.xxxx) from E.g. App.js file
 *              to create a new scene.
 *          4. Finaly any scene can be loaded with ScenesLoadScene().
 *              Where any current scene's is being unloaded 
 *              and the desired scene is loaded.
 *              [Unloading: Deactivating all scene's vertex buffers. Loading: Activating all scene's vertex buffers ]
 *          5. For Debugging: Dont forget to add the new scene's name to the ScenesGetSceneName();
 *          
 *      Meshes Reusability: 
 *          Any created mesh can be reused in any other scene without the need to create a new one,
 *          but the mesh has to be inserted ([again, duplicate]) in the vertex buffers created for the scene.
 * 
 * 
 * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * */




class Scene2 {
    /**
     * The only reason a Scene has refferences to meshes is that:
     *      1. needs to have all programs and vertex buffers so it can toggle the drawing buffers
     *      2. the Button meshes may differ from scene to scene
     */
    sceneIdx = 0; // Scene ID (of type: SCENE const structure).
    buttons; // Must have all the buttons together in an array(of pointers) so that we can loop through only the buttons easily.
    btnCount;
    gfxBuffers; // Store the program and vertexBuffer indexes of all meshes of the app.

    constructor() {
        this.sceneIdx++;
        this.gfxBuffers = [];
        this.buttons = [];
        this.btnCount = 0;
    }


    AddMesh(mesh) {
        if(!(mesh instanceof Mesh2)) {
            console.error('Cannot add mesh to scene. mesh= ', mesh)
            return;
        }
        mesh.AddToGraphicsBuffer(this.sceneIdx);
    }

};
class Scene {
    /**
     * The only reason a Scene has refferences to meshes is that:
     *      1. needs to have all programs and vertex buffers so it can toggle the drawing buffers
     *      2. the Button meshes may differ from scene to scene
     */
    sceneIdx; // Scene ID (of type: SCENE const structure).
    buttons; // Must have all the buttons together in an array(of pointers) so that we can loop through only the buttons easily.
    btnCount;
    gfxBuffers; // Store the program and vertexBuffer indexes of all meshes of the app.

    constructor(sceneIdx) {
        this.sceneIdx = sceneIdx;
        this.gfxBuffers = [];
        this.buttons = [];
        this.btnCount = 0;
    }


    AddMesh(mesh, idx) {
        if (!mesh || mesh === undefined) {
            console.log('Mesh shouldn\'t be undefined. At: class Scene.AddMesh(). meshIdx:', idx);
            return;
        }

        if (mesh instanceof Rect ||
            mesh instanceof Player) {
            this.StoreGfxBuffer(mesh.gfxInfo);
        }
        else if (mesh instanceof Shadow) {
            this.StoreGfxBuffer(mesh.gfxInfo);
        }
        else if (mesh instanceof Bricks ||
            mesh instanceof PowerUps ||
            mesh instanceof Coins ||
            mesh instanceof Balls ||
            mesh instanceof Explosions ||
            mesh instanceof Glow ||
            mesh instanceof Vortex ||
            mesh instanceof Twist ||
            mesh instanceof Framebuffer ||
            mesh instanceof Particles) {
            this.StoreGfxBuffer(mesh.buffer[0].gfxInfo);
        }
        else if (mesh instanceof UiTextVariable) {
            // Because constText and variText belong to the same buffer, 
            // the gfx info of any letter is enough to store progIdx and vbIdx.
            this.StoreGfxBuffer(mesh.constText.letters[0].gfxInfo);
        }
        else if (mesh instanceof AnimTexts) {
            this.StoreGfxBuffer(mesh.buffer[0].text.letters[0].gfxInfo);
        }
        else if (mesh[0] !== undefined) {
            this.StoreGfxBuffer(mesh[0].gfxInfo);
        }
        else if (mesh instanceof Button) {
            // this.buttons.push(mesh);
            this.buttons[this.btnCount] = mesh;
            this.btnCount++;
            this.StoreGfxBuffer(mesh.text.gfxInfo);
            this.StoreGfxBuffer(mesh.area.gfxInfo);
        }
        else if (mesh instanceof TextLabel || mesh instanceof Text) {
            this.StoreGfxBuffer(mesh.text.gfxInfo);
            this.StoreGfxBuffer(mesh.area.gfxInfo);
        }
        else if (mesh instanceof ParticleSystem) { // For Fx
            for (let i = 0; i < mesh.psBuffer.length; i++) {
                this.StoreGfxBuffer(mesh.psBuffer[i].buffer[0].gfxInfo);
            }
        }

    }

    /** Graphics */
    StoreGfxBuffer(gfxInfo) { // This is the way for a scene to know what and how many gfx buffers it's meshes have
        if (gfxInfo === undefined)
            console.log()

        // Check if gfx buffer index already stored
        let found = false;
        const len = this.gfxBuffers.length;

        for (let i = 0; i < len; i++) {
            if (this.gfxBuffers[i].progIdx === gfxInfo.prog.idx
                && this.gfxBuffers[i].vbIdx === gfxInfo.vb.idx) {
                found = true;
                break;
            }
        }
        // If gfx buffer is not stored, store it
        if (!found) {
            this.gfxBuffers.push({ progIdx: gfxInfo.prog.idx, vbIdx: gfxInfo.vb.idx, active: false });
        }
    }
    UnloadGfxBuffers() {
        const len = this.gfxBuffers.length;
        for (let i = 0; i < len; i++) {
            GfxSetVbShow(this.gfxBuffers[i].progIdx, this.gfxBuffers[i].vbIdx, false);
            this.gfxBuffers[i].active = false;
        }
    }
    LoadGfxBuffers() {
        const len = this.gfxBuffers.length;
        for (let i = 0; i < len; i++) {
            GfxSetVbShow(this.gfxBuffers[i].progIdx, this.gfxBuffers[i].vbIdx, true);
            this.gfxBuffers[i].active = true;
        }
    }

    // DEBUG
    PrintAllGfxBuffers() {
        const len = this.gfxBuffers.length;
        for (let i = 0; i < len; i++) {
            console.log(i, ': active ', this.gfxBuffers[i].active, ' prog:', this.gfxBuffers[i].progIdx, ' vb:', this.gfxBuffers[i].vbIdx)
        }
    }

};

class Scenes {

    scene = [];
    sceneCount = 0;

    allMeshes = [];
    allMeshesCount = 0;
    count = APP_MESHES_IDX.count;

    // Debug
    name;

    AddScene(scene) {
        // this.scene[this.sceneCount++] = scene;
        this.scene[scene.sceneIdx] = scene;
        this.sceneCount++;
        return scene.sceneIdx;
    }
    InitAllMeshesBuffer() { // Initialize the buffer to the count of all meshes(APP_MESHES_IDX.count)
        for (let i = 0; i < this.count; i++) {
            this.allMeshes[i] = null;
        }
    }
    AddMesh(mesh, idx) {
        this.allMeshes[idx] = mesh;
        // if(meshBuffer) this.AddMesh(meshBuffer, idx);
        // else this.scene.AddMesh(mesh, idx);
    }
    UnloadAllGfxBuffers() {
        for (let i = 0; i < this.sceneCount; i++) {
            if (!(this.scene[i].name === 'All Scenes'))
                this.scene[i].UnloadGfxBuffers();
        }
    }
    GetGfxIdx(meshIdx) {
        if (!this.allMeshes[meshIdx] || this.allMeshes[meshIdx] === undefined) {
            console.log(`No mesh found at current allMeshes buffer. Probably mesh does not exist. \nmesh index:${meshIdx}`);
            return INT_NULL;
        }
        // alert(`No mesh found at current allMeshes buffer. Probably mesh does not exist. \nmesh index:${meshIdx}`);
        return this.allMeshes[meshIdx].GetGfxIdx();
    }
    SetPriority(meshIdx, flag) {
        const meshGfxIdx = this.GetGfxIdx(meshIdx); //  Get an array of [[progIdx,vbIdx], [progIdx,vbIdx], ...] for all the meshes a widget may have
        if (meshGfxIdx === INT_NULL) return;
        const progsLen = meshGfxIdx.length;
        for (let i = 0; i < progsLen; i++) {
            RenderQueueSetPriority(flag, meshGfxIdx[i][0], meshGfxIdx[i][1]);
        }
    }
    GetScene(sceneIdx) {
        if (this.scene[sceneIdx]) return this.scene[sceneIdx];
        alert(`No scene found with index:${sceneIdx}`)
        return null;
    }

    // DEBUG
    PrintAllGfxBuffers() {
        const len = this.scene.length;
        for (let i = 0; i < len; i++) {
            console.log(`scene:${i} name:${this.scene[i].name}`)
            this.scene[i].PrintAllGfxBuffers();
        }
    }

};

const scenes = new Scenes;
export function ScenesGetScene(sceneIdx) {

    if (sceneIdx < 0 || sceneIdx > scenes.count){{
        console.error('Scene Index Out Of Bounds!');
        // alert('Scene Index Out Of Bounds!');
        return null;
    }}

    return scenes.scene[sceneIdx];
}
export function ScenesGetMesh(meshIdx) {
    const mesh = scenes.allMeshes[meshIdx];
    return mesh;
}
// Set the gfx buffers to 'hidden', so that the meshes will not been drawn until the function
export function ScenesUnloadAllScenes() {
    scenes.UnloadAllGfxBuffers();
}

/**
 * Creates all meshes of the application. Also initializes all required Graphics programs and vertex buffers
 */
export function ScenesCreateAllMeshes() {

    // Must initialize a meshes buffer, with count the count of all app's meshes,
    // so that we are able to add meshes to any index(not in consecutive order)  base on the const struct APP_MESHES_IDX
    scenes.InitAllMeshesBuffer();

    let dim = [Viewport.width / 2, Viewport.height / 2];
    let pos = [Viewport.width / 2, Viewport.height / 2, 0];
    let style = { pad: 10, roundCorner: 6, border: 0, feather: 30 };

    const geom = new Geometry2D([130,130,0], [100, 100]);
    const mat = new Material(WHITE);
    const mesh = new Mesh2(geom, mat);
    const scene = new Scene2();
    scene.AddMesh(mesh);

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

// TODO: (Double adding meshes to gl buffers)we currently adding the same meshes if it happens to call on the load of an already loaded scene 
export function ScenesCreateScene(sceneIdx) {
    let meshIdx = INT_NULL;
    switch (sceneIdx) {
        case SCENE.all: {
            const idx = scenes.AddScene(new Scene(sceneIdx));

            { // Drawables for all scenes
                // const ui_fps_buffer = UiCreateFps(sceneIdx);
                // scenes.AddMesh(ui_fps_buffer[0], APP_MESHES_IDX.ui.fps.avg);
                // scenes.scene[idx].AddMesh(ui_fps_buffer[0], APP_MESHES_IDX.ui.fps.avg);
                // scenes.scene[idx].AddMesh(ui_fps_buffer[0], APP_MESHES_IDX.fx.avg);
                // scenes.AddMesh(ui_fps_buffer[1], APP_MESHES_IDX.ui.fps.avg1s);
                // scenes.scene[idx].AddMesh(ui_fps_buffer[1], APP_MESHES_IDX.ui.fps.avg1s);
                // scenes.scene[idx].AddMesh(ui_fps_buffer[1], APP_MESHES_IDX.fx.avg1s);

                // GlowInit();
                // const glowBuffer = GlowGet();
                // scenes.AddMesh(glowBuffer.buffer[0], APP_MESHES_IDX.fx.glow);
                // scenes.scene[idx].AddMesh(glowBuffer, APP_MESHES_IDX.fx.glow);

                // TwistInit(SCENE.stage);
                // const twist = TwistGet();
                // scenes.AddMesh(twist.buffer[0], APP_MESHES_IDX.fx.twist);
                // scenes.scene[idx].AddMesh(twist, APP_MESHES_IDX.fx.twist);

                // VortexInit();
                // VortexCreate(WHITE, [306, 74], [130, 130]);
                // const vortexBuffer = VortexGet();
                // scenes.AddMesh(vortexBuffer.buffer[0], APP_MESHES_IDX.fx.vortex);
                // scenes.scene[idx].AddMesh(vortexBuffer, APP_MESHES_IDX.fx.vortex);

                // Create shadow fx
                // ShadowInit();
                // const shadowIdx = ShadowCreate([250, 400], RED, [100, 100], false, false, 1., 20);
                // const shadowFx = ShadowGetShadow(shadowIdx);
                // scenes.AddMesh(shadowFx, APP_MESHES_IDX.fx.shadow);
                // scenes.scene[idx].AddMesh(shadowFx, APP_MESHES_IDX.fx.shadow);

                /** FrameBuffer. This is for the post processing of the Stage-Completed scene*/
                // FramebuffersInit(SCENE.all);
                // const width = Viewport.width / 2;
                // const height = Viewport.height / 2;
                // // const dim = [width, height];
                // // const pos = [width, height, -20];
                // const fb = FramebuffersCreate(
                //     SCENE.all,
                //     'StageCompleted',
                //     SID.FX.FS_SHADOW,
                //     [width, height],
                //     [width, height, -20]
                // );

                // scenes.AddMesh(fb.fb, APP_MESHES_IDX.framebuffer);
            }

            // scenes.scene[idx].sceneIdx = sceneIdx;
            // scenes.scene[idx].name = ScenesGetSceneName(sceneIdx);
            // scenes.scene[idx].LoadGfxBuffers();
            // break;
        }
        case SCENE.startMenu: {
            // const idx = scenes.AddScene(new Scene(sceneIdx));

            // // Add here all required meshes, for this specific scene, to the scene's mesh buffer
            // meshIdx = APP_MESHES_IDX.background.startMenu; scenes.scene[idx].AddMesh(scenes.allMeshes[meshIdx], meshIdx);

            // meshIdx = APP_MESHES_IDX.buttons.options; scenes.scene[idx].AddMesh(scenes.allMeshes[meshIdx], meshIdx);

            // scenes.scene[idx].sceneIdx = sceneIdx;
            // scenes.scene[idx].name = ScenesGetSceneName(sceneIdx);
            // break;
        }
        /**
         * This is before starting a stage, where the player gets some info
         * and must press a button in order to start playing the game
         */
        case SCENE.startStage: {
            // const idx = scenes.AddScene(new Scene(sceneIdx));

            // // Add here all required meshes, for this specific scene, to the scene's buffer
            // meshIdx = APP_MESHES_IDX.background.startStage; scenes.scene[idx].AddMesh(scenes.allMeshes[meshIdx], meshIdx);
            // meshIdx = APP_MESHES_IDX.buttons.start; scenes.scene[idx].AddMesh(scenes.allMeshes[meshIdx], meshIdx);

            // scenes.scene[idx].sceneIdx = sceneIdx; scenes.scene[idx].name = ScenesGetSceneName(sceneIdx);
            // break;
        }
        /**
         * This is after finishing a stage, where some info are displayed...
         */
        case SCENE.finishStage: {
            // const idx = scenes.AddScene(new Scene(sceneIdx));

            // {
            //     // scenes.scene[idx].AddMesh(scenes.allMeshes[APP_MESHES_IDX.background.finishStage], APP_MESHES_IDX.background.finishStage);
            //     // scenes.scene[idx].AddMesh(scenes.allMeshes[APP_MESHES_IDX.buttons.continue], APP_MESHES_IDX.buttons.continue);

            //     // /** Total Score Counter */
            //     // const showTotalScore = StageCompletedCreateTotalScore();
            //     // scenes.AddMesh(showTotalScore, APP_MESHES_IDX.text.totalScore);
            //     // scenes.scene[idx].AddMesh(showTotalScore, APP_MESHES_IDX.text.totalScore);

            //     // /** Mechanical Gear */
            //     // const stageCompleteMech = StageCompletedCreate();
            //     // scenes.AddMesh(stageCompleteMech.buffer, APP_MESHES_IDX.StageCompleted.all);
            //     // scenes.scene[idx].AddMesh(stageCompleteMech.buffer[0], APP_MESHES_IDX.StageCompleted.all);
            // }

            // scenes.scene[idx].sceneIdx = sceneIdx;
            // scenes.scene[idx].name = ScenesGetSceneName(sceneIdx);
            // break;
        }
        /**
         *  The actual stage scene where the player starts playing.
         *  All other elements remain the same across all stages(like UI, ball, player, etc)
         */
        case SCENE.stage: {
            const idx = scenes.AddScene(new Scene(sceneIdx));


            { /* Backgrounds */
                // meshIdx = APP_MESHES_IDX.background.stage; scenes.scene[idx].AddMesh(scenes.allMeshes[meshIdx]), meshIdx;
                // meshIdx = APP_MESHES_IDX.background.stageMenu; scenes.scene[idx].AddMesh(scenes.allMeshes[meshIdx], meshIdx);
            }

            { /* Basic Meshes */
                // /* Player */
                // meshIdx = APP_MESHES_IDX.player; scenes.scene[idx].AddMesh(scenes.allMeshes[meshIdx], meshIdx);
                // const player = CreatePlayer(sceneIdx);
                // scenes.AddMesh(player, APP_MESHES_IDX.player);
                // scenes.scene[idx].AddMesh(player, APP_MESHES_IDX.player);
                // /* Bricks */
                // const brickBuffer = BrickInit(sceneIdx);
                // scenes.AddMesh(brickBuffer, APP_MESHES_IDX.bricks);
                // scenes.scene[idx].AddMesh(brickBuffer.buffer[0], APP_MESHES_IDX.bricks);
                // /* Ball */
                // const ballsBuffer = BallsInit(sceneIdx); // Initialize Ball's buffer
                // BallCreate([Viewport.width / 2, PLAYER.YPOS - 100], WHITE);
                // scenes.AddMesh(ballsBuffer, APP_MESHES_IDX.balls);
                // scenes.scene[idx].AddMesh(ballsBuffer.buffer[0], APP_MESHES_IDX.balls);
                // /* Power Ups */
                // const powUpsBuffer = PowerUpGet();
                // scenes.AddMesh(powUpsBuffer, APP_MESHES_IDX.powUps);
                // scenes.scene[idx].AddMesh(powUpsBuffer.buffer[0], APP_MESHES_IDX.powUps);
                // /* Power Ups - Bullet Gun */
                // GunInit();
                // const gun = GunGet();
                // scenes.AddMesh(gun, APP_MESHES_IDX.gun);
                // scenes.scene[idx].AddMesh(gun, APP_MESHES_IDX.gun);
                // /* Power Ups - Bullet */
                // const bulletBuffer = BulletGet();
                // bulletBuffer.Init(sceneIdx);
                // scenes.AddMesh(bulletBuffer, APP_MESHES_IDX.bullet);
                // scenes.scene[idx].AddMesh(bulletBuffer.buffer[0], APP_MESHES_IDX.bullet);

                // /* Coin */
                // const coinsBuffer = CoinGet();
                // scenes.AddMesh(coinsBuffer, APP_MESHES_IDX.coins);
                // scenes.scene[idx].AddMesh(coinsBuffer.buffer[0], APP_MESHES_IDX.coin);
            }

            { /* FX */
                // ExplosionsInit(); // Initialize explosions
                // const explosionsCircleBuffer = ExplosionsGetCircle();
                // scenes.AddMesh(explosionsCircleBuffer, APP_MESHES_IDX.fx.explosions.circle);
                // scenes.scene[idx].AddMesh(scenes.allMeshes[meshIdx], APP_MESHES_IDX.fx.explosions.circle);
                // const explosionsSimpleBuffer = ExplosionsGetSimple();
                // scenes.AddMesh(explosionsSimpleBuffer, APP_MESHES_IDX.fx.explosions.simple);
                // scenes.scene[idx].AddMesh(scenes.allMeshes[meshIdx], APP_MESHES_IDX.fx.explosions.simple);

                // /* ParticleSystem */
                // const particleBallTail = ParticleSystemFindByName('BallTail-0');
                // scenes.AddMesh(particleBallTail, APP_MESHES_IDX.fx.particleSystem.ballTail);
                // scenes.scene[idx].AddMesh(particleBallTail[0], APP_MESHES_IDX.fx.particleSystem.ballTail);
            }

            { /* Ui */
                /** Create and store them as pointers to a  meshes to  'allMeshes[]' buffer */
                // const ui_score = UiCreateScore(sceneIdx);
                // scenes.AddMesh(ui_score, APP_MESHES_IDX.ui.score);
                // scenes.scene[idx].AddMesh(ui_score, APP_MESHES_IDX.ui.score); // RECTREATED: Dont store mesh to allMeshes buffer, instead push the original mesh to store only the gfxInfo

                // const ui_totalScore = UiCreateTotalScore(sceneIdx);
                // scenes.AddMesh(ui_totalScore, APP_MESHES_IDX.ui.totalScore);
                // scenes.scene[idx].AddMesh(ui_totalScore, APP_MESHES_IDX.ui.totalScore);

                // const ui_mod = UiCreateScoreModifier(sceneIdx);
                // scenes.AddMesh(ui_mod, APP_MESHES_IDX.ui.mod);
                // scenes.scene[idx].AddMesh(ui_mod, APP_MESHES_IDX.ui.mod);

                // const ui_lives = UiCreateLives(sceneIdx);
                // scenes.AddMesh(ui_lives, APP_MESHES_IDX.ui.lives);
                // scenes.scene[idx].AddMesh(ui_lives, APP_MESHES_IDX.ui.lives);

                // const ui_combo = UiCreateCombo(sceneIdx);
                // scenes.AddMesh(ui_combo, APP_MESHES_IDX.ui.combo);
                // scenes.scene[idx].AddMesh(ui_combo, APP_MESHES_IDX.ui.mod);

                // const ui_m = AnimTextsInit(sceneIdx);
                // scenes.AddMesh(ui_m, APP_MESHES_IDX.ui.animText);
                // scenes.scene[idx].AddMesh(ui_m, APP_MESHES_IDX.ui.animText);

            }

            // scenes.scene[idx].sceneIdx = sceneIdx;
            // scenes.scene[idx].name = ScenesGetSceneName(sceneIdx);

            break;
        }

    }
}

// TODO: Implement in class
export function ScenesLoadScene(sceneIdx) {

    /**
     * If there is not any previusly loaded scene(stored globally),
     * find the scene by name and load it.
     * If a previous scene is loaded,
     * unload it and load the new scene. 
     */
    if (sceneIdx !== SCENE.active.idx) {
        const idx = SCENE.active.idx; // Current loaded scene index
        // Unload any previous scene.
        if (idx !== INT_NULL) {
            scenes.scene[idx].UnloadGfxBuffers();
        }
        // Load the new scene
        const scene = scenes.GetScene(sceneIdx);
        if (scene) scene.LoadGfxBuffers();
        SCENE.active.idx = sceneIdx;
    }
}


export function ScenesCreateRenderQueue() {
    const drawQueue = RenderQueueGet();
    drawQueue.Init(); // One time initialization(creates an empty buffer...)
    drawQueue.Create();

    /** Build up the draw queue, to draw all meshes in the correct order */
    {
        /**
         * In order to draw on top must:
         *  1. render the mesh last in the buffer
         *  2. have a z-index greater 
         * OR
         *  1. First draw the mesh with the less z-index
         *  2. Then draw the on top mesh with greater z-index 
        */
    //    scenes.SetPriority(APP_MESHES_IDX.bricks, 'first');

        // Ui. All ui are in one buffer, so setting any one ui is enough 
        // scenes.SetPriority(APP_MESHES_IDX.ui.animText, 'first');

        // scenes.SetPriority(APP_MESHES_IDX.coins, 'first');
        // scenes.SetPriority(APP_MESHES_IDX.powUps, 'first');
        // scenes.SetPriority(APP_MESHES_IDX.balls, 'first');


        // // Explosions
        // scenes.SetPriority(APP_MESHES_IDX.fx.twist, 'first');
        // scenes.SetPriority(APP_MESHES_IDX.fx.explosions.circle, 'first');
        // scenes.SetPriority(APP_MESHES_IDX.fx.explosions.simple, 'first');
        // scenes.SetPriority(APP_MESHES_IDX.fx.glow, 'first');
        // scenes.SetPriority(APP_MESHES_IDX.fx.shadow, 'first');

        // scenes.SetPriority(APP_MESHES_IDX.player, 'first');


        // // Particles
        // scenes.SetPriority(APP_MESHES_IDX.fx.particleSystem.ballTail, 'first');

        // scenes.SetPriority(APP_MESHES_IDX.ui.fps.avg1s, 'first');
        // scenes.SetPriority(APP_MESHES_IDX.ui.fps.avg, 'first');
        // scenes.SetPriority(APP_MESHES_IDX.fx.vortex, 'first');

        // scenes.SetPriority(APP_MESHES_IDX.bricks, 'first');
        
        // // Buttons
        // scenes.SetPriority(APP_MESHES_IDX.buttons.play, 'first');
        // scenes.SetPriority(APP_MESHES_IDX.buttons.continue, 'first');
        // scenes.SetPriority(APP_MESHES_IDX.buttons.start, 'first');
        
        // scenes.SetPriority(APP_MESHES_IDX.framebuffer, 'first');
        
        // // RenderQueueSetPriority('last',5,3);
        // // Backgrounds
        // scenes.SetPriority(APP_MESHES_IDX.background.finishStage, 'first');
        // scenes.SetPriority(APP_MESHES_IDX.background.stageMenu, 'first');
        // scenes.SetPriority(APP_MESHES_IDX.background.stage, 'first');
        // scenes.SetPriority(APP_MESHES_IDX.background.startStage, 'first');
        // scenes.SetPriority(APP_MESHES_IDX.background.startMenu, 'first');
        
    }

    drawQueue.UpdateActiveQueue();
    // drawQueue.PrintAll();

    // BallProjLineSetPriority();
}


export function ScenesSetFramebufferQueue(){
    const drawQueue = RenderQueueGet();
    // Framebuffer0
    const fb0 = FramebuffersGet(FRAMEBUFFERS_IDX.buffer0);
    let meshGfxIdx = scenes.GetGfxIdx(APP_MESHES_IDX.buttons.play);
    if (meshGfxIdx !== INT_NULL){
        const progsLen = meshGfxIdx.length;
        fb0.FbqInit(progsLen+1)
        for (let i = 0; i < progsLen; i++) {
            fb0.FbqStore(meshGfxIdx[i][0], meshGfxIdx[i][1])
        }
        // fb0.FbqStore(5, 0)
        // fb0.FbqStore(1, 0)
        // fb0.FbqStore(5, 3)
        //TODO: Must remove from RenderQueue 

        // drawQueue.Remove(5, 0);
        // drawQueue.Remove(1, 0);
        // drawQueue.Remove(5, 3);
    }
}


/* * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * *
 * Helper functions
 */
function ScenesGetSceneName(sceneIdx) {
    const name = SCENE_NAME[sceneIdx];
    if (!name || name === undefined) alert('sceneIdx does not exist! At: ScenesGetSceneName(sceneIdx)');
    return name;
}


////////////////////////////////////////////////////////////////////////////////////////////////////////////////

// DEBUG
export function ScenesPrintAllGfxBuffers() {
    scenes.PrintAllGfxBuffers();
}

