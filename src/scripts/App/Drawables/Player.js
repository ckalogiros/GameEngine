"use strict";
import { BallInitCurveMode, BallPlayerCollision, BallSetCurveMode } from './Ball.js';
import { PowerUpPlayerCollision } from './PowerUp.js';
import { Rect2D } from '../../Engine/Drawables/Geometries/Rect2D.js';
import { CoinPlayerCollision } from './Coin.js';
import { Abs } from '../../Helpers/Math/MathOperations.js';
import { StepTimersCreate } from '../../Engine/Timer/Time.js';
import { AnimationsGet } from '../../Engine/Animations/Animations.js';
import { TimersCreateTimer } from '../../Engine/Timer/Timer.js';
import { GlSetDim } from '../../Graphics/Buffers/GlBufferOps.js';

const PLAYER_DEF_COLOR = BLUE_10_120_220;
const PREV_POS_BUFFER_LEN = 5;
let storePosCounter = 0;
let counter = 0;

// Exporting is only for the class type(to compare with the instanceof operator)
export class Player extends Rect2D {

    speed;
    mouseDist;
    size;
    xdir;
    prevPosDif;

    constructor(sid, col, dim, scale, tex, pos, style, speed) {
        super('player', sid, col, dim, scale, tex, pos, style, null);
        this.speed = speed;
        this.mouseDist = 0;
        this.size = 0;
        this.xdir = 0;
        this.prevPosDif = new Array(PREV_POS_BUFFER_LEN);
        for (let i = 0; i < PREV_POS_BUFFER_LEN; i++) {
            this.prevPosDif[i] = 0;
        }
    }

    animations = {
        scale: {
            animIdx: INT_NULL,
            maxUpScaleDim: 130,
            upScaleFactor: 1.014,
            downScaleFactor: 0.99,
            inUpScale: false,
            timer: {
                t: null,
                max: 6,
                step: .1,
            },

        },
    };

    timeOutId = null; // To store the timer from setTimeout that is created for the animation 

    state = {         // The state in which the player may be. Mainly for animations
        inScaleAnimation: false,
        inDimAnimation: false,
        inUpScale: false,
        inDownScale: false,
        inMove: false,
    };

};

let player = null;

/* Getters-Setters * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * */
export function PlayerGetPos() {
    return player.mesh.pos;
}
export function PlayerGetDim() {
    return player.mesh.dim;
}
export function PlayerGetPlayer() {
    return player;
}
export function PlayerResetPrevPosDif() {
    for (let i = 0; i < PREV_POS_BUFFER_LEN; i++) {
        player.prevPosDif[i] = 0;
    }
}
export function PlayerGetPrevPosDifSum() {
    let sum = 0;
    for (let i = 0; i < PREV_POS_BUFFER_LEN; i++) {
        sum += player.prevPosDif[i];
    }
    return sum;
}


export function CreatePlayer(scene) {

    const style = {
        roundCorner: PLAYER.STYLE.ROUNDNESS,
        border: PLAYER.STYLE.BORDER,
        feather: PLAYER.STYLE.FEATHER,
    };
    PLAYER.XPOS = Viewport.width / 2;
    PLAYER.YPOS = Viewport.bottom - 100;

    const speed = 4.0;
    const sid = SID_DEFAULT | SID.DEF2;
    const pl = new Player(
        sid, PLAYER_DEF_COLOR,
        [PLAYER.WIDTH, PLAYER.HEIGHT], [1.0, 1.0], null, [PLAYER.XPOS, PLAYER.YPOS, PLAYER.Z_INDEX],
        style, speed
    );

    pl.gfxInfo = GlAddMesh(pl.sid, pl.mesh, 1, scene, 'player', GL_VB.ANY, NO_SPECIFIC_GL_BUFFER);
    player = pl;


    return pl;
}
export function UpdatePlayerPosX(posx, mouseXdir) {
    PLAYER.PREV_XPOS = PLAYER.XPOS;
    PLAYER.XPOS = posx;
    player.SetPosX(posx);
    /* mouseXdir is the mouse's difference in pixels from a previous pos.
     * But also counts as a direction. If the mouse is going left, then mouseXdir
     * is negative etc.*/
    player.xdir = mouseXdir; // Player's direction is always the mouse's direction.
    PLAYER.XDIR = player.xdir; // Store globally
}
export function PlayerCollisions() {
    BallPlayerCollision(player.mesh.pos, player.mesh.dim[0], player.mesh.dim[1], player.xdir);
    PowerUpPlayerCollision(player.mesh.pos, player.mesh.dim[0], player.mesh.dim[1]);
    CoinPlayerCollision(player.mesh.pos, player.mesh.dim[0], player.mesh.dim[1]);
}
export function PlayerReset() {
    if(player){
        player.SetColor(PLAYER_DEF_COLOR);
        player.SetPos(player.mesh.defPos);
    }
    else console.error('Player does not exist')
}


/** Create a timer for storing the player's next @PREV_POS_BUFFER_LEN positions */
export function PlayerCreateAnimStorePosTimer(ballIdx) {
    // Set a callback function to be called 'PREV_POS_BUFFER_LEN' number of times and then stop.
    StepTimersCreate(PREV_POS_BUFFER_LEN, 1, PlayerStorePos, PlayerStorePosStop, ballIdx);
}
function PlayerStorePos() { // It is called on every frame
    player.prevPosDif[storePosCounter++] = PLAYER.XPOS - PLAYER.PREV_XPOS;
}
function PlayerStorePosStop(ballIdx) { // It is called on every frame
    storePosCounter = 0;
    if (Abs(PlayerGetPrevPosDifSum()) > 10) {
        BallSetCurveMode(true, ballIdx);
        BallInitCurveMode(ballIdx);
    }
}

/* ANIMATIONS * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * */
export function PlayerCreateScaleAnimation() {
    const scale = player.animations.scale;
    if (player.animations.scale.animIdx === INT_NULL) {
        const animations = AnimationsGet();
        scale.animIdx = animations.Create(PlayerStartScaleAnimation, PlayerStopScaleAnimation, null, 'Scale Player');
        scale.inUpScale = true;
    }
    else { // Case an enlarge animation already exists
        if (player.mesh.dim[0] <= scale.maxUpScaleDim)
            scale.inUpScale = true; // The curent animation should start over(through the Callback Start function)
        
        if(!scale.timer.t) // ...create a new timer
            scale.timer.t = TimersCreateTimer(0.01, scale.timer.max, scale.timer.step, 'Scale Player animation', PlayerSetTimerOff, null);
        else {
            scale.timer.t.t = 0.01; // ...reset the timer
        }
    }
}
function PlayerStartScaleAnimation() {
    const scale = player.animations.scale;
    if (scale.inUpScale && player.mesh.dim[0] < scale.maxUpScaleDim) {
        player.SetDim([player.mesh.dim[0] * scale.upScaleFactor, player.mesh.dim[1]]);
        if (player.mesh.dim[0] * scale.upScaleFactor >= scale.maxUpScaleDim) // Case max enlargment reached
            scale.inUpScale = false;
        return true;
    }
    else if (!scale.inUpScale) { // Else if we are not in up scale enlargment
        if (scale.timer.t) // Keep the enlargemnt at max for t time
            return true;
        else if (player.mesh.dim[0] > player.mesh.defDim[0]) { // Scale down animation
            player.SetDim([player.mesh.dim[0] * scale.downScaleFactor, player.mesh.dim[1]]);
            return true;
        }
    }

    /** If we haven't return any from previous branches, at this point the animation is completed,  */
    player.animations.scale.animIdx = INT_NULL; // Clear the animation 
    player.SetDim(player.mesh.defDim); // Set default dimention
    return false;
}
function PlayerStopScaleAnimation() {
}
function PlayerSetTimerOff() {
    player.animations.scale.timer.t = null;
}


export function PlayerSetStateScaleAnimation(flag) {
    player.state.inScaleAnimation = flag;
    player.state.inUpScale = flag;
    if (player.timeOutId) {
        clearTimeout(player.timeOutId)
        player.timeOutId = null;
    }
}
export function PlayerRunEnlargeAnimation(scaleFactor) {
    player.mesh.dim[0] *= scaleFactor;
    GlSetDim(player.gfxInfo, player.mesh.dim);
    // player.SetDim(player.mesh.dim[0] * scaleFactor);
}

/** Dim color animation */
export function PlayerCreateDimColorAnimation() {
    // const animations = AnimationsGet(); 
    // animations.Create(PlayerDimColorStartAnimation, PlayerDimColorStopAnimation);
    // player.state.inDimAnimation = true;
}
function PlayerDimColorStopAnimation() {
    console.log('Stop Player Animation');
    player.state.inDimAnimation = false;
}
function PlayerDimColorStartAnimation() { // This is the callback to the Animations.clbk at Animations.js
    if (player.state.inDimAnimation && player.mesh.col[3] > 0.2) {
        player.DimColor(0.2, 0.99)
        return true;
    }
    return false;
}