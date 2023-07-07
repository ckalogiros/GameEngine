"use strict";
import { GfxInitGraphics } from '../Graphics/GfxInit.js'
import { LoadFontTextures, FontCreateUvMap } from '../Engine/Loaders/Font/LoadFont.js'
import { ScenesCreateAllMeshes, ScenesCreateRenderQueue, } from './Scenes.js'
import { Render } from '../Engine/Renderer/Render.js'
import { AddEventListeners, } from '../Engine/Events/Events.js';
import { PowerUpInit } from './Drawables/PowerUp.js';
import { GlGetProgram } from '../Graphics/GlProgram.js';
import { ButtonSetRoundCorner, ButtonSetBorderWidth, ButtonSetBorderFeather } from '../Engine/Drawables/Widgets/Button.js';
import { BrickSetRoundCorner, BrickSetBorderWidth, BrickSetBorderFeather } from './Drawables/Brick.js';
import { CoinInit } from './Drawables/Coin.js';
import { InterpolateToRange } from '../Helpers/Math/MathOperations.js';

// Debug-Print
import { FramebuffersSetActive } from '../Graphics/Buffers/Renderbuffer.js';




export function AppInit() {

    // Load Fonts, load metrics and create uv map for each loaded font 
    LoadFontTextures();
    FontCreateUvMap();

    DeviceSetUp();
    MeshConstantsSetUp();

    /* * * * * * * * * * * * * * * * * * * * * * * * * * *
     * Graphics Initialization
     */
    GfxInitGraphics(); // Creation of some commonly used gl programs(like simple shaders for rect, texture and sdf text rendering)

    AddEventListeners();

    AppInitReservedGlBuffers();

    // Init all app's object meshes
    ScenesCreateAllMeshes();
    // Create All Scenes
    // ScenesCreateScene(SCENE.all); 
    // ScenesCreateScene(SCENE.startMenu);
    // ScenesCreateScene(SCENE.startStage);
    // ScenesCreateScene(SCENE.finishStage);
    // ScenesCreateScene(SCENE.stage);
    // ScenesUnloadAllScenes(); // Unload all GFX buffers.
    ScenesCreateRenderQueue(); // Initilize a Draw Queue for drawing vertex buffers in a priority(z index) based aproach
    // ScenesLoadScene(SCENE.startMenu); // Load the first Scene
    // FramebuffersSetActive(true);
    // ScenesSetFramebufferQueue();

    // Render
    window.requestAnimationFrame(Render);

}



function DeviceSetUp() {

    const canvas = document.getElementById("glCanvas");
    Device.width = window.innerWidth;
    Device.height = window.innerHeight;
    console.log('Device width: ', Device.width, ' height: ', Device.height)

    if (Device.width > Device.MAX_WIDTH) {
        canvas.width = Device.MAX_WIDTH;
        canvas.height = Device.height;
    }
    else {
        canvas.width = Device.width;
        canvas.height = Device.height;
        
        // Calculate the correct proportions for all renderables compare to current device
        Device.ratio = Device.width / Device.MAX_WIDTH;
    }
    // Update (global) Viewport object
    Viewport.width = canvas.width;
    Viewport.height = canvas.height;

    Viewport.left = 0;
    Viewport.right = canvas.width;
    Viewport.top = 0;
    Viewport.bottom = canvas.height;
    Viewport.centerX = Viewport.left + (Viewport.width / 2);
    Viewport.centerY = Viewport.top + (Viewport.height / 2);

    Viewport.ratio = canvas.width / canvas.height;
    Viewport.leftMargin = (window.innerWidth - Viewport.width) / 2;
    Viewport.topMargin = (window.innerHeight - Viewport.height) / 2

}

function MeshConstantsSetUp(){

    STAGE.MENU.PAD = 20;
    STAGE.MENU.WIDTH = (Viewport.width/2)-STAGE.MENU.PAD;
    STAGE.MENU.HEIGHT = 20 + STAGE.MENU.PAD*2;
    STAGE.TOP = Viewport.height/5;

    // Calculate left and right padd of the start and end of brick's grid.
    const mod = (Viewport.width % ((BRICK.WIDTH*2)+(BRICK.PAD*2)))-(BRICK.PAD*2);
    // STAGE.PADD.LEFT  = (BRICK.WIDTH*2) + (mod / 2);
    STAGE.PADD.LEFT  = (60) + (mod / 2);
    STAGE.PADD.RIGHT = STAGE.PADD.LEFT;

    let keepRelativeLarger = 1;
    
    PLAYER.WIDTH *= Device.ratio*keepRelativeLarger;
    PLAYER.HEIGHT *= Device.ratio*keepRelativeLarger;

    BALL.RADIUS *= Device.ratio*keepRelativeLarger;

    BRICK.WIDTH *= Device.ratio*keepRelativeLarger;
    BRICK.HEIGHT *= Device.ratio*keepRelativeLarger;

    POW_UP.WIDTH *= Device.ratio*keepRelativeLarger;
    POW_UP.HEIGHT *= Device.ratio*keepRelativeLarger;
    
    COIN.WIDTH *= Device.ratio*keepRelativeLarger;
    COIN.HEIGHT *= Device.ratio*keepRelativeLarger;
    
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
    prog.UniformsSetUniformsBuffer(InterpolateToRange(SdfInnerDistSlider.value, 100, 1), UNIFORM_PARAMS.sdf.innerIdx);

    // On event
    SdfInnerDistSlider.oninput = function () {
        SdfInnerDistOut.innerHTML = this.value;
        prog.UniformsSetUniformsBuffer(InterpolateToRange(SdfInnerDistSlider.value, 100, 1), UNIFORM_PARAMS.sdf.innerIdx);
    }

    const SdfOuterDistSlider = document.getElementById("sdf-param2");
    const SdfOuterDistOut = document.getElementById("sdf-param2-val");
    SdfOuterDistOut.innerHTML = SdfOuterDistSlider.value;

    prog.UniformsSetUniformsBuffer(InterpolateToRange(SdfOuterDistSlider.value, 100, 1), UNIFORM_PARAMS.sdf.outerIdx);

    SdfOuterDistSlider.oninput = function () {
        SdfOuterDistOut.innerHTML = this.value;
        prog.UniformsSetUniformsBuffer(InterpolateToRange(SdfOuterDistSlider.value, 100, 1), UNIFORM_PARAMS.sdf.outerIdx);
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
