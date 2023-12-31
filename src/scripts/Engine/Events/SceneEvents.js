"use strict";
import { PlayerCreateDimColorAnimation, PlayerCollisions, PlayerReset, UpdatePlayerPosX } from "../../App/Drawables/Player.js";
import { BallCreateDimColorAnimation, BallCreateSlowSpeedAnimation, BallOnUpdate, BallReset } from "../../App/Drawables/Ball.js";
import { BrickBallCollision, BrickOnUpdate, BrickReset } from "../../App/Drawables/Brick.js";
import { ScenesGetMesh, ScenesLoadScene } from "../../App/Scenes.js";
import { AnimationsGet } from "../Animations/Animations.js";
import { PowerUpReset } from "../../App/Drawables/PowerUp.js";
import { UiResetScore, UiGetScore, UiGetTotalScore, UiSetTotalScore, UiUpdateScore, UiUpdateTotalScore } from "../../App/Drawables/Ui/Ui.js";
import { GlowUpdate } from "../Drawables/Fx/Glow.js";
import { TwistUpdate } from "../Drawables/Fx/Twist.js";
import { GunUpdate } from "../../App/Drawables/Bullet.js";
import { FramebuffersCreateDimColorAnimation, FramebuffersSetActive } from "../../Graphics/Renderbuffer.js";
import { StageCompleteAnimationsCreateRotation, StageCompleteAnimationsCreateScaleText } from "../../App/Drawables/StageCompleted.js";
import { VortexUpdate } from "../Drawables/Fx/Vortex.js";


/**
 * Check for scene's hovered meshes by the mouse
 * @param {*} scene : Enum of type SCENE.
 * @param {*} mouse : Mouse Position
 */
export function OnHover(scene, mouse) {

    let anyMeshHovered = false;
    // If the scene has buttons, check for hover
    for (let i = 0; i < scene.btnCount; i++) {

        const btn = scene.buttons[i].area;

        if (mouse.x > btn.mesh.pos[0] - btn.mesh.dim[0] &&
            mouse.x < btn.mesh.pos[0] + btn.mesh.dim[0] &&
            mouse.y > btn.mesh.pos[1] - btn.mesh.dim[1] &&
            mouse.y < btn.mesh.pos[1] + btn.mesh.dim[1]) {

            scene.buttons[i].state.inHover = true;
            g_state.hovered = scene.buttons[i];
            anyMeshHovered = true;
        }
        else {

            scene.buttons[i].state.inHover = false;
        }
    }

    // If none of the meshes are hovered, update the global state (refference to hovered mesh)
    if (!anyMeshHovered)
        g_state.hovered = null;
}

/**
 * Move Player by the mouse x position
 * @param {*} mousex : Mouse x position
 */
export function OnPlayerMove(mousex, mouseXdir) {
    UpdatePlayerPosX(mousex, mouseXdir);
}

export function CheckCollisions() {
    if(SCENE.active.idx === SCENE.stage){
        BrickBallCollision();
        PlayerCollisions();
        GlowUpdate();
    }
}

export function Update() {
    if(SCENE.active.idx === SCENE.stage){
        BallOnUpdate();
        BrickOnUpdate();
        TwistUpdate(); // Must be called after the ball update, for the twist positioning to update to current ball pos and not the prev ball pos
        GunUpdate();
    }

    VortexUpdate();
}

export function OnStageCompleted(){
    g_state.game.stageCompleted = false;

    // Create an animation. 
    // This will run once and will automaticaly update the animation from Renderer.Render.RunAnimations()
    BallCreateSlowSpeedAnimation();  
    PlayerCreateDimColorAnimation();
    BallCreateDimColorAnimation();

    // Set active the frame buffer for the color dim effect
    FramebuffersSetActive(true)
    FramebuffersCreateDimColorAnimation();
}

export function OnStageStart(){
    PlayerReset();
    BallReset();
    BrickReset();
    PowerUpReset();

    // Deactivate the frame buffer
    // FramebuffersSetActive(false);

}

export function ShowTotalScore(){
    ScenesLoadScene(SCENE.finishStage);
    
    // Score params object's variables must be references.
    const params = {score:UiGetScore(), totalScore:UiGetTotalScore(), step: 0};
    const scoreDif = params.score - params.totalScore;

    if     (scoreDif < 10) params.step = 1;
    else if(scoreDif < 100) params.step = 10;
    else if(scoreDif < 1000) params.step = 100;
    else if(scoreDif < 10000) params.step = 1000;
    else if(scoreDif < 100000) params.step = 10000;
    
    
    // Animate the score 
    const animations = AnimationsGet();
    animations.Create(ShowTotalScoreStart, ShowTotalScoreStop, params);
    
    StageCompleteAnimationsCreateRotation();
    StageCompleteAnimationsCreateScaleText();
}

function ShowTotalScoreStart(params){
    
    
    if(params.step === 1){
        params.totalScore++;
    }
    else if(params.totalScore + params.step < params.score){
        params.totalScore += params.step;
    }
    else{
        params.step /= 10;
    }
    
    
    // Get the mesh TextLabel with the total score
    const scoreLabel = ScenesGetMesh(APP_MESHES_IDX.text.totalScore);
    if(scoreLabel !== null || scoreLabel !== undefined){
        scoreLabel.ChangeText('Total Score: ' + params.totalScore);
        UiSetTotalScore(params.totalScore);
    }

    // Implement a way to skip or speed up the total score increment
    if(params.totalScore < params.score) return true;

    params.totalScore = params.score;

    return false; // Stop the animation
}

function ShowTotalScoreStop(params){
    
    // Update stage score
    UiUpdateTotalScore();
    
    // Reset and update stage score
    UiResetScore();
    UiUpdateScore();

}





