"use strict";




/* * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * *
 * On Mouse Events 
 * When a touch screen exists, then on touchClick event both functions are called,
 * the OnMouseMove or OnMouseMove_Android event AND the onMouseClick event,
 * as the OnTouchStart and OnTouchEnd events. 
 */

export function OnMouseMove_Android(e) {
    MouseSetCoords([e.clientX, e.clientY]);
    console.log('OnMouseMove_Android: ', mouse.x, mouse.y)
}

/**
 * Touchscreen Events
 * 
 * // https://developer.mozilla.org/en-US/docs/Games/Techniques/Control_mechanisms/Mobile_touch
 * const el = document.querySelector("canvas");
 * el.addEventListener("touchstart", handleStart);
 * el.addEventListener("touchmove", handleMove);
 * el.addEventListener("touchend", handleEnd);
 * el.addEventListener("touchcancel", handleCancel);

 * touchstart is fired when the user puts a finger on the screen.
 * touchmove is fired when they move the finger on the screen while touching it
 * touchend is fired when the user stops touching the screen
 * touchcancel is fired when a touch is cancelled, for example when the user moves their finger out of the screen.
 */
export function OnTouchStart(e) {
    // const x = e.changedTouches[0].clientX;
    // const y = e.changedTouches[0].clientY;
    // MouseSetCoords([x,y]);
    // console.log(`OnTouchStart: x:${mouse.x}, y:${mouse.y}`);
    // const scene = ScenesGetScene(SCENE.active.idx);
    // if(scene){ OnHover(scene, mouse); }
    // if (scene && scene.sceneidx === SCENE.stage) { OnPlayerMove(mouse.x, mouse.xdiff); }
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
}

  