"use strict";
import * as math from '../../Helpers/Math/MathOperations.js'
import { PlayerGetPos, PlayerGetDim, PlayerCreateAnimStorePosTimer } from "./Player.js";
// import { AnimTextsCreateValue, UiUpdate, UiUpdateCombo } from './Ui/Ui.js'
import { MouseGetXdir, MouseGetYdir } from "../../Engine/Events/MouseEvents.js";
import { GetSign } from "../../Helpers/Helpers.js";
import { ParticleSystemCreateParticle, ParticleSystemDestroyParticle, ParticleSystemGetParticleColor, ParticleSystemGetParticleSystem, ParticleSystemSetParticleColor, ParticlesCreateSystem } from "../../Engine/ParticlesSystem/Particles.js";
import { GlGetProgram } from "../../Graphics/GlProgram.js";
import { AnimationsGet } from "../../Engine/Animations/Animations.js";
// import { Rect2D } from "../../Engine/Drawables/Geometry/Rect2D.js";
import { ExplosionsCreateSimpleExplosion } from "../../Engine/Drawables/Fx/Explosions.js";
import { GlSetPriority } from "../../Graphics/Buffers/GlBufferOps.js";
import { TwistCreate, TwistDestroy, TwistSetAmtxSpeed, TwistSetTranslation } from "../../Engine/Drawables/Fx/Twist.js";
// import { PowerUpDestroyIntervalTimer } from "./PowerUp.js";
import { MeshBuffer, TempMesh } from "../../Engine/Drawables/MeshBuffer_OLD.js";



const PROJECTION_LINE_RADIUS = BALL.RADIUS;
const MAX_BALL_PROJECTION_LINE = 80;
const BALL_PROJECTION_LINE_DIST = 30; // The distance of each projection segment

const BALL_SPEED_REGULATION = 1.;
const BALL_DEF_SPEED = 4;
const BOUNDING_BOX_PAD = 10;

const BALL_ATTR_PARAMS1 = {
    flameIntensityIdx: 0, // Attr parameter is at index 0
 };

class BallProjection {
    buffer;
    amtx; // Ammount for x movement direction.
    amty; // Ammount for y movement direction.

    // Debug
    name;

    constructor() {
        this.buffer = []; // The projection of the ball during start of a stage
        this.amtx = 0.6;
        this.amty = 0.4;
        this.name = 'Start Ball Projection'
    }
    Init(sceneIdx, pos) {

        const radius = PROJECTION_LINE_RADIUS;
        const style = { roundCorner: 0, border: 0.3, feather: 3.5, };
        style.roundCorner = radius - style.feather;
        const sid = SID_DEFAULT | SID.DEF2;
        let color = blue;
        pos[2] = BALL.Z_INDEX;

        this.buffer[0] = new Rect(this.name, sid, color, 
                                [radius, radius], [1.0, 1.0], null, pos, style, null, null);
        this.buffer[0].amtx = 1;
        this.buffer[0].amty = 1;
        this.buffer[0].gfxInfo = GlAddMesh(this.buffer[0].sid, this.buffer[0].mesh, 1, sceneIdx,
            this.name, GL_VB.NEW, NO_SPECIFIC_GL_BUFFER);

        const vbIdx = this.buffer[0].gfxInfo.vb.idx;
        for (let i = 1; i < MAX_BALL_PROJECTION_LINE; i++) {
            this.buffer[i] = new Rect(this.name, sid, color, [radius, radius], [1.0, 1.0], null, pos, style, null, null);
            this.buffer[i].amtx = 1;
            this.buffer[i].amty = 1;
            this.buffer[i].gfxInfo = GlAddMesh(this.buffer[i].sid, this.buffer[i].mesh, 1, sceneIdx,
                this.name, GL_VB.SPECIFIC, vbIdx);
                                        // `ballProj${i + 1}`, GL_VB.SPECIFIC, vbIdx);
        }
    }
    SetPriority() {
        const meshIdx = this.buffer[0].gfxInfo.meshIdx;
        const progIdx = this.buffer[0].gfxInfo.prog.idx;
        const vbIdx = this.buffer[0].gfxInfo.vb.idx;
        GlSetPriority(progIdx, vbIdx, meshIdx, MAX_BALL_PROJECTION_LINE);
    }
    Update(ball) {
        let blpos = [ball.mesh.pos[0], ball.mesh.pos[1]];
        const dif = blpos[0] - PLAYER.XPOS;
        let x = ball.amtx * BALL.DIR.X;
        let y = ball.amty * BALL.DIR.Y;
        let xdir = 1;
        let ydir = -1;

        const size = (math.Abs(math.Abs(x) - math.Abs(y)) + 1) * 4;

        let lock = 0;

        const right = Viewport.right - (BOUNDING_BOX_PAD + BALL.RADIUS);
        const left = Viewport.left + (BOUNDING_BOX_PAD + BALL.RADIUS);
        const nextPosY = (y * BALL_PROJECTION_LINE_DIST);

        for (let i = 0; i < MAX_BALL_PROJECTION_LINE; i++) {

            let nextDistX = (x * BALL_PROJECTION_LINE_DIST);

            if (lock) {
                xdir = lock;
                lock = 0;
            }

            const nextPosx = blpos[0] + (nextDistX * xdir);

            if (dif > 0) { // Ball is located at the right half of the players surface
                if (nextPosx > right) {
                    const a = right - blpos[0];
                    const b = nextDistX - a;
                    if (a > b) {
                        lock = -1; // a < b takes proj entity(ball) forward and changes dir on the next proj entity
                        nextDistX = a - b
                    }
                    else if (a < b) {
                        xdir = -1;
                        nextDistX = b - a
                    }
                }
                else if (nextPosx < left) {
                    const a = blpos[0] - left;
                    const b = nextDistX - a;
                    if (a > b) {
                        lock = 1;
                        nextDistX = a - b
                    }
                    else if (a < b) {
                        lock = 1;
                        nextDistX = -(b - a)
                    }
                }
            }
            else { // Ball is located at the left half of the players surface, so nextDistX is negative(actually x variable is negative)
                if (nextPosx > right) {
                    const a = -(right - blpos[0]);
                    const b = nextDistX - a;
                    if (a > b) {
                        lock = 1; // Change dir on the next proj line mesh
                        nextDistX = a - b
                    }
                    else if (a < b) {
                        xdir = 1;
                        nextDistX = b - a
                    }
                }
                else if (nextPosx < left) {
                    const a = left - blpos[0];
                    const b = nextDistX - a;
                    if (a > b) {
                        lock = -1;
                        nextDistX = a - b
                    }
                    else if (a < b) {
                        lock = -1;
                        nextDistX = a
                    }
                }
            }

            blpos[0] += nextDistX * xdir;
            blpos[1] += nextPosY * ydir;

            this.buffer[i].SetPos(blpos);
            this.buffer[i].SetDim([size, size]);
            this.buffer[i].SetRoundCorner(size*2 - this.buffer[i].mesh.style[2]);
        }
    }
    Destroy(ballpos, currProjMeshIdx) {
        if (currProjMeshIdx >= MAX_BALL_PROJECTION_LINE || currProjMeshIdx === undefined) 
            return;
        
            const pos = this.buffer[currProjMeshIdx].mesh.pos;
        if (ballpos[0] > pos[0] - BALL.RADIUS && ballpos[0] < pos[0] + BALL.RADIUS) {
            this.buffer[currProjMeshIdx].SetPos([OUT_OF_VIEW, OUT_OF_VIEW]);
            currProjMeshIdx++;
        }
        return currProjMeshIdx;
    }
};
const ballProj = new BallProjection;
export function BallProjLineSetPriority() {
    ballProj.SetPriority();
}
function BallProjInit(sceneIdx, p) {
    ballProj.Init(sceneIdx, p);
}



let blr = 0; // Cashe main ball's dimentions


// Exporting is only for the class type(to compare with the instanceof operator)
export class Ball extends TempMesh {

    speed = BALL_DEF_SPEED;
    mouseDist = 0;
    size = 0;

    xdir = 1;
    ydir = -1;
    amtx; // Ammount for x movement direction.
    amty; // Ammount for y movement direction.
    curvx = 1.0;
    translation = {
        x:0,
        y:0,
    };
    
    inMove = false;
    inAnimation = false;
    inCurvMode = false;
    inLock = false;
    
    tail = {
        fx: null,
        intensity: 1, // Balls gfx flame intensity. Changes based on ball speed. 
        powerBallMult: 1,
        inIncrement: false,
    };
    
    curv = {
        idx: null,
        accel: 0,
    };
    
    constructor(sid, col, dim, scale, tex, pos, style, speed) {
        super('ball', sid, col, dim, scale, tex, pos, style, null, [.5, .5, .5, .5]);
        this.speed = speed;
        this.amtx = 0.6;
        this.amty = 0.4;
    }

    ResetPos() {
        this.SetPos([Viewport.width / 2, PLAYER.YPOS - (this.mesh.dim[1] + PLAYER.HEIGHT)])
    }
    UpdateTailFlameIntensity() {
        const tailFx = ParticleSystemGetParticleSystem(this.tail.fx);
        tailFx.SetParams1Attr(BALL_ATTR_PARAMS1.flameIntensityIdx, this.tail.intensity);
    }
    CreateTail(sceneIdx, idx){
        this.tail.fx = BallFxCreateTail(sceneIdx, idx, this.mesh.col);
    }
}

let maxCurve = 1.8;
let curv = 0;
const curveStep = 0.06;
let step = curveStep;
const decrement = .99;
const increment = 1.02;
let d = decrement;

export class Balls extends MeshBuffer{
    mainBall;
    inStartPos;
    isReady;
    isOnlyMainBall; // Quick check if more than one balls exist. Set to false if the powerUp 'BALL' is activated 


    constructor() {
        super(MAX_BALLS_COUNT, 'Balls');
        this.mainBall = null; // Cash the balls[0] in a separate variable. TODO: This may not be the case when after powUp.balls has activvated and the main ball is no more.
        this.inStartPos = true;
        this.isReady = false;
        this.isOnlyMainBall = true; // Quick check if more than one balls exist. Set to false if the powerUp 'BALL' is activated 

    }
    Init(sceneIdx) {

        const radius = BALL.RADIUS;
        const style = { roundCorner: 0, border: 0.0, feather: 2.0, };

        style.roundCorner = radius - style.feather;
        const sid = SID_DEFAULT | SID.ATTR.PARAMS1;
        // const sid = SID_DEFAULT;
        let color = blue;
        let pos = [OUT_OF_VIEW, PLAYER.YPOS + 30, BALL.Z_INDEX];// Set the pos of every un-rendered ball out of view

        for (let i = 0; i < this.size; i++) {

            this.buffer[i] = new Ball(sid, color, [radius, radius], [1.0, 1.0], null, pos, style, 4);
            this.buffer[i].gfxInfo = GlAddMesh(this.buffer[i].sid, this.buffer[i].mesh, 1, sceneIdx, 'ball', GL_VB.ANY, NO_SPECIFIC_GL_BUFFER);

            // Store to local compilation unit variable 'mainBall'
            if (!this.mainBall) { // Case the main ball is created
                this.mainBall = this.buffer[i];
            }

            if (i === 0) {
                // Set Not visible for the rest of the balls
                color = [0, 0, 0, 0];
                pos = [0, 0, BALL.Z_INDEX-1];
                this.isOnlyMainBall = true;
            }
            this.buffer[i].CreateTail(sceneIdx, i);
        }
        blr = this.buffer[0].mesh.dim[0]; // Cache ball radius

        // Initialize ball's line projection
        let p = [this.mainBall.mesh.pos[0], this.mainBall.mesh.pos[1], 7];
        BallProjInit(sceneIdx, p);

        return this;
    }
    Create(pos, col) {
        if(this.count >= this.size-1) return;
        const freeidx = super.Create(pos, WHITE, BALL.Z_INDEX);
        // Update the tail color
        ParticleSystemSetParticleColor(this.buffer[freeidx].tail.fx, col);
        this.buffer[freeidx].ydir = 1;
    }
    Destroy(idx){
        super.Clear(idx);
        this.buffer[idx].SetPos([OUT_OF_VIEW, OUT_OF_VIEW]);
        this.buffer[idx].speed = BALL_DEF_SPEED;
        this.buffer[idx].SetColor(WHITE);
        this.buffer[idx].tail.flameIntensity = 1;
        this.buffer[idx].tail.powerBallMult = 1;
        this.buffer[idx].UpdateTailFlameIntensity();
    }
    UpdatePos(idx) {

        if (!this.buffer[idx]) return;

        if (!this.inStartPos) {

            this.buffer[idx].translation.x = (this.buffer[idx].xdir * this.buffer[idx].speed * BALL_SPEED_REGULATION) * this.buffer[idx].amtx;
            this.buffer[idx].translation.y = (this.buffer[idx].ydir * this.buffer[idx].speed * BALL_SPEED_REGULATION) * this.buffer[idx].amty;

            this.buffer[idx].mesh.pos[0] += this.buffer[idx].translation.x;
            this.buffer[idx].mesh.pos[1] += this.buffer[idx].translation.y;
            this.buffer[idx].UpdatePosXY();
            this.buffer[idx].inMove = true;

            if (this.buffer[idx].inCurvMode) {
                this.buffer[idx].curvx -= step
                this.buffer[idx].amtx -= step
                step *= d;
                if(step < .035) { // Reverse the curve ball at a certain threshold 
                    step =  curveStep
                    d = increment; // Reverse 
                }
                TwistSetTranslation(this.buffer[idx].curv.idx, this.buffer[idx].translation.x, this.buffer[idx].translation.y);
                TwistSetAmtxSpeed(-BALL.HIT.XDIR)
            }

            /**
             * Un-lock ball's property, to check collision with the player
             * In simple terms, prevent ball to collide for more than once,
             * before it goes away from the player
             */
            if (this.buffer[idx].mesh.pos[1] < PLAYER.YPOS - 40)
                this.buffer[idx].inLock = false;

            this.currProjMeshIdx = ballProj.Destroy(this.buffer[idx].mesh.pos, this.currProjMeshIdx);
        }
        else { // If the state of the game is at the start of a stage, keep the ball at the start position until user releases it.

            const playerPos = PlayerGetPos();
            const playerDim = PlayerGetDim();
            const mouseDir  = MouseGetXdir();
            this.buffer[idx].inLock = false;

            // In order for the ballProj destruction animation to be activated
            this.currProjMeshIdx = 0;

            // Make the ball not leave the players's width area
            if (this.buffer[idx].mesh.pos[0] < playerPos[0] - playerDim[0] && mouseDir > 0) {
                this.buffer[idx].SetPosX(playerPos[0] - playerDim[0]);
            }
            else if (this.buffer[idx].mesh.pos[0] > playerPos[0] + playerDim[0] && mouseDir < 0) {
                this.buffer[idx].SetPosX(playerPos[0] + playerDim[0]);
            }
            ballProj.Update(this.buffer[idx]);
        }

    }
    OnUpdate() { // TODO: Don't need to check for main ball, just run the loop for all balls
        // Case no powerUp 'BALLS' is active(deal with only one mainBall)
        if (this.isOnlyMainBall) {
            BallBoundariesCollision(this.mainBall, 0);
            this.UpdatePos(0); // Only one ball at index 0
            // Create tail effect
            ParticleSystemCreateParticle(this.mainBall.tail.fx, this.mainBall.mesh.pos[0], this.mainBall.mesh.pos[1],  
                { xdir:this.mainBall.xdir, ydir:this.mainBall.ydir }, null, CLBK_BallTailFxDestroy, 0);
        }
        else { // Update all balls from the array
            for (let i = 0; i < MAX_BALLS_COUNT; i++) {
                if (this.buffer[i].isActive === true) {
                    BallBoundariesCollision(this.buffer[i], i);
                    this.UpdatePos(i);
                    // Create current ball's tail effect
                    ParticleSystemCreateParticle(this.buffer[i].tail.fx, this.buffer[i].mesh.pos[0], this.buffer[i].mesh.pos[1],  
                        { xdir:this.buffer[i].xdir, ydir:this.buffer[i].ydir }, null, CLBK_BallTailFxDestroy, i);
                }
            }
        }
    }
    DimColor() {
        const len = this.balls.length;
        for (let i = 0; i < len; i++) {
            this.balls[i].DimColor(0.2, 0.99);
        }
    }
    SetSize(idx, radius){
        const roundness = radius - this.buffer[idx].mesh.style[2];
        this.buffer[idx].SetDim([radius, radius]);
        this.buffer[idx].SetStyle_RoundCorner(roundness);
    }

}
const balls = new Balls; // Array to store the powerUp balls




/* Getters-Setters * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * */
export function BallGetBall() {
    return balls.mainBall;
}
// Check if the ball is in the starting position
export function BallGetInStartPos() {
    return balls.inStartPos;
}
export function BallSetIsReady(flag) {
    balls.isReady = flag;
}
export function BallGetIsReady() {
    return balls.isReady;
}
export function BallSetCurveMode(flag, idx) {
    balls.buffer[idx].inCurvMode = flag;
}

/* Global Functions * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * */
let xamt = 1, yamt = 1; // TODO: Temp. Keeps a copy of the amt changes through functions. Reimplement using balls.amt??
export function BallsInit(sceneIdx) {
    return balls.Init(sceneIdx);
}
export function BallCreate(pos, col) {
    balls.Create(pos, col);
}
export function BallOnUpdate() {
    balls.OnUpdate();
}
function CLBK_BallTailFxDestroy(params){ // The destroy callback for each ball tail fx particle.
    const ballIdx = params.ballIdx; 
    const particleIdx = params.particleIdx; 
    ParticleSystemDestroyParticle(balls.buffer[ballIdx].tail.fx, particleIdx)
}
export function BallInitCurveMode(idx) {
    curv = maxCurve;
    balls.buffer[idx].curvx = curv;
    balls.buffer[idx].amtx = curv;
    BALL.DIR.X = GetSign(MouseGetXdir());
    balls.buffer[idx].xdir = BALL.DIR.X;

    balls.buffer[idx].amty = yamt * BALL.YX_SPEED_RATIO;
    
    step = curveStep;
    d = decrement;

    BallFxCreateCurve(idx);
}
// Release the ball at the start o a stage OR whenever the ball is set to the starting position(player pos)
export function BallRelease() {
    balls.inStartPos = false;
}
export function BallReset() {
    if(balls.mainBall){
        balls.mainBall.ResetPos();
        balls.inStartPos = true;
        balls.mainBall.speed = BALL_DEF_SPEED;
        balls.mainBall.SetColor(WHITE);
        balls.mainBall.tail.flameIntensity = 1;
        balls.mainBall.tail.powerBallMult = 1;
        balls.mainBall.UpdateTailFlameIntensity();
    
        for (let i = 1; i < MAX_BALLS_COUNT; i++) {
            if (balls.buffer[i].isActive) {
                balls.Destroy(i);
            }
        }
        balls.isOnlyMainBall = true;
    }
}
export function BallResetPos() {
    balls.mainBall.ResetPos();
    balls.inStartPos = true;
}

let combo = 0;
let playerBallHit = -1;
let brickBallHit = 0;

export function BallPlayerCollision(plpos, plw, plh) {

    if (!balls.mainBall) return;

    let count = MAX_BALLS_COUNT;
    if (balls.isOnlyMainBall)
        count = 1; // If no powerUp 'Ball' is active, dont loop through all elements in the ball's buffer

    for (let i = 0; i < count; i++) {

        if (balls.buffer[i].isActive && !balls.buffer[i].inLock &&
            balls.buffer[i].mesh.pos[0] + blr >= plpos[0] - plw &&
            balls.buffer[i].mesh.pos[0] - blr <= plpos[0] + plw &&
            balls.buffer[i].mesh.pos[1] + blr >= plpos[1] - plh &&
            balls.buffer[i].mesh.pos[1] - blr <= plpos[1] + plh
        ) {

            // Store the direction upon collision
            BALL.HIT.XDIR = GetSign(MouseGetXdir());
            BALL.HIT.YDIR = GetSign(MouseGetYdir());

            // Bounce ball in y dir
            balls.buffer[i].ydir = -1;
            balls.buffer[i].inLock = true; // Set a lock so we do not check for collision until a certain y pos threshold has passed

            let xydiff = 1;

            let dif = balls.buffer[i].mesh.pos[0] - plpos[0];
            balls.buffer[i].xdir = BALL.DIR.X = GetSign(dif)

            /**
             * Make proj line not bounce like crazy.
             * It bounces from the fact that the dif of ball and player, 
             * when the ball goes outside the player limits(in x coord),
             * gets too high with the result being the amt(x|y) 
             * increment enormously. That is the bounce)
             */
            if (balls.inStartPos) dif = math.Abs(dif) > plw ? plw * BALL.DIR.X : dif;

            // Interpolate the ball's hit x pos relative to players surface to 0.0-1.0 value
            const amt = math.Abs(math.Min(dif / plw, 1.0));
            xamt = amt * amt * amt; // Let x amt be lower
            yamt = 1. - amt + 0.2;

            // Leave a small area in the center of the players surface for 0 x direction, 
            // so that the ball goes straight up, with the dif not been 0.
            if (xamt > 0.0003)
                xamt += 0.2
            if (math.Abs(dif) > plw) { // Case we hit with the players side(right or left)
                yamt += 0.15; // Give some extra power to y direction
                xamt += 0.4;  // Give some extra power to x direction
            }
            balls.buffer[i].amty = yamt * BALL.YX_SPEED_RATIO;
            balls.buffer[i].amtx = xamt;
            if(!balls.buffer[i].inCurvMode) balls.buffer[i].amtx = xamt;

            // Increase speed when x OR y are in their extremes
            xydiff = math.Abs(xamt - yamt);


            if (!balls.inStartPos) {

                // Params for the intensity of the ball tail (in asociation with the ball hit on player)
                const params = {
                    maxSpeed: (xydiff + 40) * 0.1,
                    flameIntensity: math.Max(xydiff * 2.3 * balls.buffer[i].tail.powerBallMult, 1) ,
                    idx: i,
                };

                // Set a flag for if we are going to animate with increment or decrement
                if (params.flameIntensity > balls.buffer[i].tail.intensity)
                    balls.buffer[i].tail.inIncrement = true;
                else
                    balls.buffer[i].tail.inIncrement = false;

                const animations = AnimationsGet();
                animations.Create(BallSpeedUpStartAnimation, BallSpeedUpStopAnimation, 
                                    params, 'Ball tail fx speed animation');
                // ExplosionsCreateSimpleExplosion(balls.buffer[i].mesh.pos, BLUE_10_120_220, 1, 0.02);

                // Brick Combo Update 
                if (playerBallHit > brickBallHit) {
                    combo = 0;
                    UiUpdateCombo(combo);
                }
                playerBallHit = 1; // Register a player-ball collision
                PlayerCreateAnimStorePosTimer(i);
            }
            else {
                balls.buffer[i].speed = (xydiff + 40) * 0.1;
                // The "xydiff*<val>" expands the ratio to which the ballTail fx is stronger-weaker(greater the val, greater the expansion)  
                balls.buffer[i].tail.flameIntensity = math.Max(xydiff * 2.3, 1);
                balls.buffer[i].UpdateTailFlameIntensity()
            }
        }
    }
}
export function BallBrickCollision(brpos, brw, brh) {

    if (!balls.mainBall) return; // Case we are at a menu or any other place that no ball exists

    let count = MAX_BALLS_COUNT;
    if (balls.isOnlyMainBall)
        count = 1; // If no powerUp 'Ball' is active, dont loop through all elements in the ball's buffer

    for (let i = 0; i < count; i++) {

        let intersects = false;

        // Cashed Variables
        const ballTop = balls.buffer[i].mesh.pos[1] - balls.buffer[i].mesh.dim[1]; // /1.2;
        const ballBottom = balls.buffer[i].mesh.pos[1] + balls.buffer[i].mesh.dim[1]; // /1.2;
        const ballRight = balls.buffer[i].mesh.pos[0] + balls.buffer[i].mesh.dim[0]; // /1.2;
        const ballLeft = balls.buffer[i].mesh.pos[0] - balls.buffer[i].mesh.dim[0]; // /1.2;

        const brTop = brpos[1] - brh;
        const brBottom = brpos[1] + brh;
        const brRight = brpos[0] + brw;
        const brLeft = brpos[0] - brw;

        let scoreMod = 0;

        // let accel = BALL.CORNER_HIT_ACCEL;
        let accel = 1.2;

        if (BALL.MODE.powerBall) {
            if (ballRight >= brLeft && ballLeft <= brRight &&
                ballTop >= brTop && ballTop <= brBottom) {
                intersects = true;
                scoreMod = 0.5;
                balls.buffer[i].amtx *= 1.08;
                balls.buffer[i].amty *= 1.08;
            }
        }
        // Bricks Bottom Side Collision Check
        else if (ballTop <= brBottom && balls.buffer[i].mesh.pos[1] > brBottom && balls.buffer[i].ydir < 0) {
            BALL.HIT.TOP_DIR = -1;
            if (balls.buffer[i].mesh.pos[0] - BALL.RADIUS_TWO_THIRDS > brLeft && balls.buffer[i].mesh.pos[0] + BALL.RADIUS_TWO_THIRDS < brRight) {
                // Collision to bricks bottom side
                balls.buffer[i].ydir = accel;
                intersects = true;
                scoreMod = 0.1;
                BALL.HIT.LEFT_DIR = 0;
            }
            // Bottom Left corner collision
            else if (ballRight - BALL.RADIUS_TWO_THIRDS > brLeft && ballLeft < brLeft && balls.buffer[i].xdir > 0) {
                balls.buffer[i].xdir = accel;
                balls.buffer[i].ydir = -accel;
                intersects = true;
                scoreMod = 0.2;
                BALL.HIT.LEFT_DIR = 1;
                // console.log('-- BOTTOM Left --')
            }
            else if (ballLeft + BALL.RADIUS_TWO_THIRDS < brRight && ballRight > brRight && balls.buffer[i].xdir < 0) {
                // Bottom Right corner collision
                balls.buffer[i].xdir = accel;
                balls.buffer[i].xdir *= -1;
                balls.buffer[i].ydir = -accel;
                intersects = true;
                scoreMod = 0.2;
                BALL.HIT.LEFT_DIR = -1;
                // console.log('-- BOTTOM Right --')
            }
        }
        // Bricks Top Side Collision Check
        else if (ballBottom >= brTop && balls.buffer[i].mesh.pos[1] < brTop && balls.buffer[i].ydir > 0) {
            BALL.HIT.TOP_DIR = 1;
            if (balls.buffer[i].mesh.pos[0] - BALL.RADIUS_TWO_THIRDS > brLeft && balls.buffer[i].mesh.pos[0] + BALL.RADIUS_TWO_THIRDS < brRight) {
                // Collision to bricks Top side
                balls.buffer[i].ydir = -accel;
                intersects = true;
                scoreMod = 0.1;
                BALL.HIT.LEFT_DIR = 0;
            }

            // Top Left corner collision
            else if (ballRight - BALL.RADIUS_TWO_THIRDS > brLeft && ballLeft < brLeft && balls.buffer[i].xdir > 0) {
                balls.buffer[i].xdir = accel;
                balls.buffer[i].xdir *= -1;
                balls.buffer[i].ydir = accel;
                intersects = true;
                scoreMod = 0.2;
                BALL.HIT.LEFT_DIR = 1;
                // console.log('-- TOP Left --')
            }
            else if (ballLeft + BALL.RADIUS_TWO_THIRDS < brRight && ballRight > brRight && balls.buffer[i].xdir < 0) {
                // Top Right corner collision
                balls.buffer[i].xdir *= accel;
                balls.buffer[i].xdir *= -1;
                balls.buffer[i].ydir = accel;
                intersects = true;
                scoreMod = 0.2;
                BALL.HIT.LEFT_DIR = -1;
                // console.log('-- TOP Right --')
            }
        }
        // Bricks Left Side Collision Check
        else if (ballRight >= brLeft && balls.buffer[i].mesh.pos[0] < brLeft && balls.buffer[i].xdir > 0) {
            BALL.HIT.LEFT_DIR = 1;
            if (balls.buffer[i].mesh.pos[1] - BALL.RADIUS_TWO_THIRDS > brTop && balls.buffer[i].mesh.pos[1] + BALL.RADIUS_TWO_THIRDS < brBottom) {
                balls.buffer[i].xdir = -accel;
                intersects = true;
                scoreMod = 0.1;
                BALL.HIT.TOP_DIR = 0;
            }
            // Left Up corner collision
            else if (ballBottom - BALL.RADIUS_TWO_THIRDS > brTop && ballTop < brTop && balls.buffer[i].ydir > 0) {
                // balls.buffer[i].amtx *= 2.0;
                balls.buffer[i].ydir = -accel;
                balls.buffer[i].xdir *= -1;
                intersects = true;
                scoreMod = 0.2;
                BALL.HIT.TOP_DIR = 1;
                // console.log('-- LEFT Up --')
            }
            // Left Bottom corner collision
            else if (ballTop + BALL.RADIUS_TWO_THIRDS < brBottom && ballBottom > brBottom && balls.buffer[i].ydir < 0) {
                // balls.buffer[i].amtx *= 2.0
                balls.buffer[i].ydir = -accel;
                balls.buffer[i].xdir *= -1;
                intersects = true;
                scoreMod = 0.2;
                BALL.HIT.TOP_DIR = -1;
                // console.log('-- LEFT Bottom --')
            }
        }
        // Bricks Right Side Collision Check
        else if (ballLeft <= brRight && balls.buffer[i].mesh.pos[0] > brRight && balls.buffer[i].xdir < 0) {
            BALL.HIT.LEFT_DIR = -1;
            if (balls.buffer[i].mesh.pos[1] - BALL.RADIUS_TWO_THIRDS > brTop && balls.buffer[i].mesh.pos[1] + BALL.RADIUS_TWO_THIRDS < brBottom) {
                // Collision to bricks right side
                balls.buffer[i].xdir = accel;
                intersects = true;
                scoreMod = 0.1;
                BALL.HIT.TOP_DIR = 0;
            }
            else if (ballBottom - BALL.RADIUS_TWO_THIRDS > brTop && ballTop < brTop && balls.buffer[i].ydir > 0) {
                // Right Up corner collision
                balls.buffer[i].ydir = -accel;
                balls.buffer[i].xdir *= -1;
                intersects = true;
                scoreMod = 0.2;
                BALL.HIT.TOP_DIR = 1;
                // console.log('-- RIGHT Up --')
            }
            // Right Bottom corner collision
            else if (ballTop + BALL.RADIUS_TWO_THIRDS < brBottom && ballBottom > brBottom && balls.buffer[i].ydir < 0) {
                balls.buffer[i].ydir = accel;
                balls.buffer[i].xdir *= -1;
                intersects = true;
                scoreMod = 0.2;
                BALL.HIT.TOP_DIR = -1;
                console.log('-- RIGHT Bottom --')
            }
        }


        if (intersects) {
            AnimTextsCreateValue(brpos, 1.1);
            UiUpdate(UI_TEXT.SCORE_MOD, scoreMod, combo);
            brickBallHit++;
            if (playerBallHit > brickBallHit) { combo = 0; }
            else { combo++; }
            playerBallHit = 0;
            brickBallHit = 0;
            UiUpdateCombo(combo);

            if(balls.buffer[i].inCurvMode){
                balls.buffer[i].inCurvMode = false;
                balls.buffer[i].amtx = xamt;
                balls.buffer[i].amty = yamt;
                BallFxDestroyCurve(i);
            }
        }

        // If at least one ball intersects, return. No need to check for the rest of the balls 
        if (intersects)
            return intersects;
    }

    return false; // No ball intersects
}
function BallBoundariesCollision(ball, ballIdx) {

    if (!ball) return;

    const radius = ball.mesh.dim[0];
    const top = STAGE.MENU.HEIGHT * 2 + STAGE.MENU.PAD * 2;

    let collides = false;
    if (ball.mesh.pos[0] - radius < Viewport.left + BOUNDING_BOX_PAD) {
        ball.mesh.pos[0] = Viewport.left + (radius + BOUNDING_BOX_PAD);
        ball.xdir = 1; // Reverse balls direction.
        collides = true;
    }
    else if (ball.mesh.pos[0] + radius > Viewport.right - BOUNDING_BOX_PAD) {
        ball.mesh.pos[0] = Viewport.right - (radius + BOUNDING_BOX_PAD);
        ball.xdir = -1;
        collides = true;
    }
    else if (ball.mesh.pos[1] - radius < top + BOUNDING_BOX_PAD) {
        ball.mesh.pos[1] = top + (radius + BOUNDING_BOX_PAD);
        ball.ydir = 1;
        collides = true;
    }
    else if (ball.mesh.pos[1] + radius > Viewport.bottom - BOUNDING_BOX_PAD) {
        ball.mesh.pos[1] = Viewport.bottom - (radius + BOUNDING_BOX_PAD);
        ball.ydir = -1;
        collides = true;
    }
    if(collides){
        if(ball.inCurvMode){
            ball.inCurvMode = false;
            ball.amtx = xamt;
            ball.amty = yamt;
            BallFxDestroyCurve(ballIdx);
        }
    }
}

/** * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * *
 *  Power Ups 
 */
/**
    TODO: Create a nicer powUp-balls starting position. 
    Either changing the direction and amt of each powUp ball(from the mainBall position) 
    or seting a fixed start pos(like a launcher) again playing with the dir and amt values.
 */
export function BallCreatePowUpBalls(count, col, pos) {
    for (let i = 0; i < count; i++) 
        BallCreate(pos, col);
    balls.isOnlyMainBall = false;
}
// Params holds the index of the interval timer that called this function
export function BallCreatePowerUpPowerBalls(){
    BALL.MODE.powerBall = true;
    for (let i = 0; i < MAX_BALLS_COUNT; i++) {
        if(balls.buffer[i].isActive){
            balls.SetSize(i, BALL.POWERBALL_RADIUS);
            balls.buffer[i].tail.intensity *= balls.buffer[i].tail.powerBallMult;
            balls.buffer[i].UpdateTailFlameIntensity()
        }
    }
}
export function BallDestroyPowerUpPowerBalls(){
    BALL.MODE.powerBall = false;
    for (let i = 0; i < MAX_BALLS_COUNT; i++) {
        if(balls.buffer[i].isActive){
            balls.SetSize(i, BALL.RADIUS);
        }
    }
    // IMPORTANT!: Must set the interval timer index to null. 
    PowerUpDestroyIntervalTimer();
}

/* * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * *
 * FX 
 */
function BallFxCreateTail(scene, idx, col) {
    const meshData = {
        sid: SID_PARTICLES_TAIL, // Set the shader for the ballTail particle system
        // col: CYAN_10_200_240,
        col: col,
        pos: [0, 0, 6],
        dim: [balls.buffer[idx].mesh.dim[0] * 2.3, balls.buffer[idx].mesh.dim[1] * 2.3],
        scale: [1, 1],
        time: 0,
        style: null,
    };
    const timerAttr = {
        step: 0.04,
        duration: 1.0,
    }
    const numParticles = 60;
    return ParticlesCreateSystem(meshData, timerAttr, numParticles, scene, `BallTail-${idx}`);
}
function BallFxCreateCurve(idx) {
    // balls.buffer[idx].curv.idx = TwistCreate(balls.buffer[idx].mesh.pos, balls.buffer[idx].tail.fx.GetColor());
    balls.buffer[idx].curv.idx = 
    TwistCreate(
        balls.buffer[idx].mesh.pos, 
        ParticleSystemGetParticleColor(balls.buffer[idx].tail.fx)
    );
}
export function BallFxDestroyCurve(idx) {
    if(balls.buffer[idx].curv.idx !== undefined && balls.buffer[idx].curv.idx !== INT_NULL){
        TwistDestroy(balls.buffer[idx].curv.idx);
    }
}


/* * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * 
 * Animations 
 */
/** Ball tail speed flame animation */
function BallSpeedUpStartAnimation(params) {
    let ret = false;
    const speedIntensity = 0.0015
    const flameIntensity = 0.05
    const idx = params.idx; // The index of the ball in the ball's buffer

    if (balls.buffer[idx].tail.inIncrement) { // Speed Up
        if (balls.buffer[idx].speed < params.maxSpeed) {
            balls.buffer[idx].speed += speedIntensity;
            ret = true; // Ret true if animation is not over
        }
        if (balls.buffer[idx].tail.inIncrement && balls.buffer[idx].tail.intensity < params.flameIntensity) {
            balls.buffer[idx].tail.intensity += flameIntensity;
            balls.buffer[idx].UpdateTailFlameIntensity();
            ret = true; // Ret true if animation is not over
        }
        
    }
    else { // Slow Down
        if (balls.buffer[idx].speed > params.maxSpeed) {
            balls.buffer[idx].speed -= speedIntensity;
            ret = true; // Ret true if animation is not over
        }
        if (!balls.buffer[idx].tail.inIncrement && balls.buffer[idx].tail.intensity > params.flameIntensity) {
            balls.buffer[idx].tail.intensity -= flameIntensity;
            balls.buffer[idx].UpdateTailFlameIntensity();
            ret = true; // Ret true if animation is not over
        }
    }
    // console.log( balls.buffer[idx].tail.intensity)
    return ret; // Ret false if animation is completed
}
function BallSpeedUpStopAnimation() {
    // console.log('------------------------\nStop Anim\n-------------------------')
}
/** Slow ball speed animation */
export function BallCreateSlowSpeedAnimation() {
    const animations = AnimationsGet();
    for(let i=0; i<MAX_BALLS_COUNT; i++){
        if(balls.buffer[i].isActive){ // If ball exists
            animations.Create(BallSlowSpeedStartAnimation, BallSlowSpeedStopAnimation, i, 'Ball Slow Speed Animation');
        }
    }
}
function BallSlowSpeedStartAnimation(params) { // This is the callback to the Animations.clbk at Animations.js
    const intensity = 0.1;
    const idx = params; // The index of the ball in the ball's buffer
    if (balls.buffer[idx].speed >= 1) {
        balls.buffer[idx].tail.intensity = -intensity * 0.9;
        balls.buffer[idx].UpdateTailFlameIntensity();
        balls.buffer[idx].speed -= intensity * 0.5;
        return true; // Ret true if animation is not over
    }
    return false; // Ret false if animation is completed
}
function BallSlowSpeedStopAnimation() {
    console.log('Stop Ball Slow Speed Animation')
}
/** Dim color animation */
export function BallCreateDimColorAnimation() {
    // const animations = AnimationsGet(); 
    // animations.Create(RunBallDimColorAnimation, BallStopDimColorAnimation);
}
function BallStopDimColorAnimation() {
    console.log('Stop Ball Animation')
}
function RunBallDimColorAnimation() { // This is the callback to the Animations.clbk at Animations.js
    return balls.mainBall.DimColor(0.03, 0.99)
}
