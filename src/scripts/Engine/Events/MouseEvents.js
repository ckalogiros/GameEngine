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
 */
export function OnTouchStart(e) {
    // const x = e.changedTouches[0].clientX;
    // const y = e.changedTouches[0].clientY;
    // MouseSetCoords([x,y]);
    // console.log(`OnTouchStart: x:${mouse.x}, y:${mouse.y}`);
    // const scene = ScenesGetScene(SCENE.active.idx);
    // if(scene){ OnHover(scene, mouse); }
    // if (scene && scene.sceneIdx === SCENE.stage) { OnPlayerMove(mouse.x, mouse.xdiff); }
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

    // const scene = ScenesGetScene(SCENE.active.idx);
    // if(scene){
    //     OnHover(scene, mouse);
    // }

    // if (scene && scene.sceneIdx === SCENE.stage) {
    //     // Move Player 
    //     OnPlayerMove(mouse.x, mouse.xdiff);
    // }
}

  