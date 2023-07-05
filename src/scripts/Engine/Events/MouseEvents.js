"use strict";
import { ScenesLoadScene } from "../../App/Scenes.js";
import { OnHover, OnPlayerMove, OnStageStart } from "./SceneEvents.js";
import { ScenesGetScene } from "../../App/Scenes.js";
import { BallGetInStartPos, BallGetIsReady, BallRelease, BallReset } from "../../App/Drawables/Ball.js";
import { StageGetNextStage } from "../../App/Stages.js";
import { BrickTranslateAnimation } from "../../App/Drawables/Brick.js";
import { BulletCreate } from "../../App/Drawables/Bullet.js";



const mouse = {
    x: 0,
    y: 0,
    xprev: 0, // Mouse previous x pos
    yprev: 0, // Mouse previous y pos
    xdiff: 0, // Mouse X difference in pixels(from previous mesurment)
    ydiff: 0, // Mouse X difference in pixels(from previous mesurment)
};

/* * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * *
* Getters-Setters */

export function MouseGetMouse() {
    return mouse;
}
export function MouseGetPos() {
    return [mouse.x, mouse.y];
}
export function MouseGetDir() {
    return [mouse.xdiff,mouse.ydiff];
}
export function MouseGetXdir() {
    return mouse.xdiff;
}
export function MouseGetYdir() {
    return mouse.ydiff;
}
function MouseSetDif(){{
    mouse.xdiff = mouse.x - mouse.xprev;
    mouse.ydiff = -(mouse.y - mouse.yprev); // Reverse the direction(negative for down dir and positive for up dir) 

}}



/* * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * *
 * On Mouse Events 
 * When a touch screen exists, then on touchClick event both functions are called,
 * the OnMouseMove or OnMouseMove_Android event AND the onMouseClick event,
 * as the OnTouchStart and OnTouchEnd events. 
 */
function MouseSetCoords(coord){
    
    mouse.xprev = mouse.x;
    mouse.yprev = mouse.y;

    mouse.x = coord[0] - Viewport.leftMargin; 
    mouse.y = coord[1] + Viewport.topMargin; 

    mouse.xdiff = mouse.x - mouse.xprev;
    mouse.ydiff = -(mouse.y - mouse.yprev); // Reverse the direction(negative for down dir and positive for up dir) 

}
export function OnMouseMove(e) {
    MouseSetCoords([e.clientX, e.clientY]);
    
    const scene = ScenesGetScene(SCENE.active.idx);
    if(scene){ OnHover(scene, mouse); }
    if (scene && scene.sceneIdx === SCENE.stage) { OnPlayerMove(mouse.x, mouse.xdiff); }
}
export function OnMouseMove_Android(e) {
    MouseSetCoords([e.clientX, e.clientY]);
    console.log('OnMouseMove_Android: ', mouse.x, mouse.y)
}

/**
 * When the mouse registers a mouse click,
 * check the global state to see if the global hovered object is set
 * and proceed accordingly 
 */
export function OnMouseClick(e) {

    // For Debuging
    console.log('OnMouseClick: x:', mouse.x, 'y:', mouse.y);

    if (g_state.hovered) {
        switch (g_state.hovered.name) {
            // Load Start Menu Scene on pressing the 'Back' button
            case 'ReturnBtn': {
                ScenesLoadScene(SCENE.startMenu);
                break;
            }
            case 'PlayBtn': {
                ScenesLoadScene(SCENE.startStage);
                break;
            }
            case 'startStageBtn': {
                OnStageStart();
                ScenesLoadScene(SCENE.stage);
                StageGetNextStage();
                BrickTranslateAnimation();
                break;
            }
            case 'ContinueBtn': {
                OnStageStart();
                ScenesLoadScene(SCENE.stage);
                StageGetNextStage();
                BrickTranslateAnimation();
                break;
            }
        }
    }

    // If mouse clicked and ball is not moving(start of a stage), release the ball
    else if (BallGetInStartPos() && BallGetIsReady() &&
                SCENE.active.idx === SCENE.stage &&
                mouse.x > Viewport.left && mouse.x < Viewport.right && 
                mouse.y > Viewport.top && mouse.y < Viewport.bottom){
        BallRelease();
    }
    
    // If state has 'gun mode', create a bullet
    else if(g_state.mode.powUp.gun){
        BulletCreate();
    }
}


/**
 * Touchscreen Events
 */
export function OnTouchStart(e) {
    const x = e.changedTouches[0].clientX;
    const y = e.changedTouches[0].clientY;
    MouseSetCoords([x,y]);
    console.log(`OnTouchStart: x:${mouse.x}, y:${mouse.y}`);
    const scene = ScenesGetScene(SCENE.active.idx);
    if(scene){ OnHover(scene, mouse); }
    if (scene && scene.sceneIdx === SCENE.stage) { OnPlayerMove(mouse.x, mouse.xdiff); }
}
export function OnTouchEnd(e) {
    console.log(`OnTouchEnd`);
}
export function OnTouchCancel(e) {
    console.log(`OnTouchCancel`);
}
export function OnTouchMove(e) {
    
    // Update mouse coordinates
    const x = e.changedTouches[0].clientX;
    const y = e.changedTouches[0].clientY;
    MouseSetCoords([x,y]);

    const scene = ScenesGetScene(SCENE.active.idx);
    if(scene){
        OnHover(scene, mouse);
    }

    if (scene && scene.sceneIdx === SCENE.stage) {
        // Move Player 
        OnPlayerMove(mouse.x, mouse.xdiff);
    }
}

  