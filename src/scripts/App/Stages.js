"use strict";

import { DarkenColor, DimColor, GetRandomColor } from "../Helpers/Helpers.js";
import { BrickCreateBrick, BrickSetGridColumn } from "./Drawables/Brick.js";

/**
 * Bricks:
 *      sand: 
 *          1 hits to destroy
 *          color :
 *      wood:  
 *          2 hits to destroy
 *          color :
 *      stone: 
 *          3 hits to destroy
 *          color :
 *      metal: 
 *          4 hits to destroy
 *          color :
 *      diamont: 
 *          ? hits to destroy
 *          color :
 *      Unbreakable: 
 *          infinity hits to destroy
 *          color :
 */

// Stage 1 mockup
/** 10 x 10 grid
*  *  *  *  *  *  *  *  *  *
*  *  *  *  *  *  *  *  *  *
*  *  *  *  *  *  *  *  *  *
*  *  *  *  *  *  *  *  *  *
*  *  *  *  *  *  *  *  *  *
*  *  *  *  *  *  *  *  *  *
*  *  *  *  *  *  *  *  *  *
*  *  *  *  *  *  *  *  *  *
*  *  *  *  *  *  *  *  *  *
*  *  *  *  *  *  *  *  *  *
*/

let stage = 0;
export function StageGetNextStage() {
    switch (stage) {
        case 0: {
            stage++;
            return StageCreateStage1();
        }
        case 1: {
            stage++;
            return StageCreateStage2();
        }
    }
    
    if(stage >= 2){
        stage++;
        return StageCreateStage();
    }
}


// TODO: Implement an Init with the Init of the particlesSystem
const dropdown = 400;
const dim = [BRICK.WIDTH, BRICK.HEIGHT];
/**
PINK_240_60_160,
PINK_240_60_200,
RED_200_10_10,
GREEN_33_208_40,
GREEN_60_240_100,
GREEN_60_240_60,
GREEN_140_240_10,
BLUE_10_160_220,
BLUE_10_120_220,
CYAN_10_200_240,
CYAN_10_230_240,
CYAN_10_230_180,
YELLOW_240_240_10,
YELLOW_240_220_10,
ORANGE_240_160_10,
ORANGE_240_200_10,
ORANGE_240_130_10,
ORANGE_240_75_10,
BLUE_LIGHT,
blue ,
bluePurple ,
 */
// const colors = [RED, MAGENTA_RED, DimColor(YELLOW, .5), ORANGE, GREEN, MAGENTA_BLUE, RED, MAGENTA_RED, YELLOW, ORANGE, GREEN, MAGENTA_BLUE,RED, MAGENTA_RED, YELLOW, ORANGE, GREEN, MAGENTA_BLUE,];
const colors = [PINK_240_60_160,PINK_240_60_200,RED_200_10_10,GREEN_33_208_40,GREEN_60_240_100,GREEN_60_240_60,GREEN_140_240_10,BLUE_10_160_220,BLUE_10_120_220,CYAN_10_200_240,CYAN_10_230_240,CYAN_10_230_180,YELLOW_240_240_10,YELLOW_240_220_10,ORANGE_240_160_10,ORANGE_240_200_10,ORANGE_240_130_10,ORANGE_240_75_10,BLUE_LIGHT,blue ,bluePurple ,];
let cidx = 0;
function GetRanColor(){
    if(cidx >= colors.length) cidx = 0;
    return colors[cidx++];
}
function GetNextColor(){
    if(cidx >= colors.length) cidx = 0;
    return colors[cidx++];
}

export function StageCreateStage1() {
    let pos = [STAGE.PADD.LEFT + dim[0] + BRICK.PAD, STAGE.MENU.HEIGHT*2 + STAGE.MENU.PAD + dim[1]*2, -1];
    let startpos = [pos[0], pos[1]-dropdown, pos[2]];
    
    let rowsGridNum = 0;
    let colsGridNum = 0;
    let cols = 0;
    // let col = GetRandomColor();
    // const maxBr = 48 < BRICK.MAX_COUNT-1 ? 48 : BRICK.MAX_COUNT-1;
    // const maxBr = 6 < BRICK.MAX_COUNT-1 ? 6 : BRICK.MAX_COUNT-1;
    const maxBr = 28 < BRICK.MAX_COUNT-1 ? 28 : BRICK.MAX_COUNT-1;
    for (let i = 0; i < maxBr; i++) {
        // for (let i = 0; i < 1; i++) {
        let col = GetRanColor();
        BrickCreateBrick(col, startpos, dim, pos);
        pos[0] += (BRICK.WIDTH*2) + BRICK.PAD;
        startpos = [pos[0], pos[1]-dropdown, pos[2]];
        if (pos[0] + dim[0] * 2 > Viewport.right) {
            pos[1] += dim[1] * 2 + BRICK.PAD;
            pos[0] = dim[0] + BRICK.PAD + STAGE.PADD.LEFT;
            startpos = [pos[0], pos[1]-dropdown, pos[2]];
            rowsGridNum++;
            cols++;
            colsGridNum = cols;
            cols = 0; // Reset columns
            // col = DarkenColor(colors[rowsGridNum], 0.15);
            col = DarkenColor(col, 0.15);
        }
        else{
            cols++;
        }
    }

    BrickSetGridColumn(cols, rowsGridNum);
    console.log('rows:', rowsGridNum, 'cols:', colsGridNum, 'remainder:', cols)
}

export function StageCreateStage2() {

    let pos = [STAGE.PADD.LEFT + dim[0] + BRICK.PAD, STAGE.MENU.HEIGHT*2 + STAGE.MENU.PAD + dim[1]*2, -1];
    let startpos = [pos[0], pos[1]-dropdown, pos[2]];
    
    let rowsGridNum = 0;
    let colsGridNum = 0;
    let cols = 0;
    // let col = GetRandomColor();
    const maxBr = 28 < BRICK.MAX_COUNT ? 28 : BRICK.MAX_COUNT;
    for (let i = 0; i < maxBr; i++) {
        // for (let i = 0; i < 1; i++) {
        let col = GetRanColor();
        BrickCreateBrick(col, startpos, dim, pos);
        pos[0] += (BRICK.WIDTH*2) + BRICK.PAD;
        startpos = [pos[0], pos[1]-dropdown, pos[2]];
        if (pos[0] + dim[0] * 2 > Viewport.right) {
            pos[1] += dim[1] * 2 + BRICK.PAD;
            pos[0] = dim[0] + BRICK.PAD + STAGE.PADD.LEFT;
            startpos = [pos[0], pos[1]-dropdown, pos[2]];
            rowsGridNum++;
            cols++;
            colsGridNum = cols;
            cols = 0; // Reset columns
            col = DarkenColor(colors[rowsGridNum], 0.15);
        }
        else{
            cols++;
        }
    }

    BrickSetGridColumn(cols, rowsGridNum);
    console.log('rows:', rowsGridNum, 'cols:', colsGridNum, 'remainder:', cols)
}
export function StageCreateStage() {

    let pos = [STAGE.PADD.LEFT + dim[0] + BRICK.PAD, STAGE.MENU.HEIGHT*2 + STAGE.MENU.PAD + dim[1]*2, -1];
    let startpos = [pos[0], pos[1]-dropdown, pos[2]];
    
    let rowsGridNum = 0;
    let colsGridNum = 0;
    let cols = 0;
    let col = GetRandomColor();
    const maxBr = 28 < BRICK.MAX_COUNT ? 28 : BRICK.MAX_COUNT;
    for (let i = 0; i < maxBr; i++) {
    // for (let i = 0; i < 1; i++) {
        BrickCreateBrick(col, startpos, dim, pos);
        pos[0] += (BRICK.WIDTH*2) + BRICK.PAD;
        startpos = [pos[0], pos[1]-dropdown, pos[2]];
        if (pos[0] + dim[0] * 2 > Viewport.right) {
            pos[1] += dim[1] * 2 + BRICK.PAD;
            pos[0] = dim[0] + BRICK.PAD + STAGE.PADD.LEFT;
            startpos = [pos[0], pos[1]-dropdown, pos[2]];
            rowsGridNum++;
            cols++;
            colsGridNum = cols;
            cols = 0; // Reset columns
            col = DarkenColor(colors[rowsGridNum], 0.15);
        }
        else{
            cols++;
        }
    }

    BrickSetGridColumn(cols, rowsGridNum);
    console.log('rows:', rowsGridNum, 'cols:', colsGridNum, 'remainder:', cols)
}