"use strict";
import * as math from '../../Helpers/Math/MathOperations.js'
import { BallBrickCollision, BallSetIsReady } from './Ball.js';
import { GlMove } from '../../Graphics/Buffers/GlBufferOps.js';
import { GlSetAttrRoundCorner, GlSetAttrBorderWidth, GlSetAttrBorderFeather } from '../../Graphics/Buffers/GlBufferOps.js';
import { ExplosionsCreateCircleExplosion } from '../../Engine/Drawables/Fx/Explosions.js';
import { ParticlesCreateSystem } from '../../Engine/ParticlesSystem/Particles.js';
import { OnStageCompleted } from '../../Engine/Events/SceneEvents.js';
import { AnimationsGet } from '../../Engine/Animations/Animations.js';
import { PowerUpCreate } from './PowerUp.js';
import { CoinCreate } from './Coin.js';
import { MeshBuffer, TempMesh } from '../../Engine/Drawables/MeshBuffer_OLD.js';
import { BulletGet, GunGet } from './Bullet.js';


const maxAmt = 4;
const dragAmt = 0.14;

class Brick extends TempMesh {
    sid = 0;
    isActive = false;
    hasPowUp = false;

    inAnimation = false;
    animation = {
        scale:{
            active:false,
            factor:1,
        },
        push: {
            x:{
                active: false,
                maxDist:0,
                maxAmt:maxAmt,
                minAmt:-0.1,
                sign: 0,
            },
            y:{
                active: false,
                maxDist:0,
                maxAmt:maxAmt,
                minAmt:-0.1,
                sign: 0,
            },
            moveAmt: [0, 0],
            drag:  1.-dragAmt,
        },
        pull: {
            x:{
                active: false,
                maxDist:0,
                maxAmt:maxAmt,
                minAmt:-0.1,
                sign: 0,
            },
            y:{
                active: false,
                maxDist:0,
                maxAmt:maxAmt,
                minAmt:-0.1,
                sign: 0,
            },
            moveAmt: [0, 0],
            drag: 2.-(1.-dragAmt),
        },
    };

    hit = {
        leftDir: 0,
        topDir: 0,
    };

    constructor(sid, col, dim, scale, tex, pos, style) {
        super('Brick', sid, col, dim, scale, tex, pos, style, null, null);
        this.sid = sid;
    }

    Destroy() {
        this.SetColorAlpha(0.0);
        this.isActive = false;
    }
    MovePush() {
        if(this.animation.push.x.active){
            if(math.Abs(this.animation.push.moveAmt[0]) < math.Abs(this.animation.push.x.minAmt)){
                this.animation.push.x.active = false;
            }
            else{
                this.animation.push.moveAmt[0] *= this.animation.push.drag; // Update the new move ammount 
                this.mesh.pos[0] += this.animation.push.moveAmt[0];
            }
        }
        if(this.animation.push.y.active){
            if(math.Abs(this.animation.push.moveAmt[1]) < math.Abs(this.animation.push.y.minAmt)){
                this.animation.push.y.active = false;
            }
            else{
                this.animation.push.moveAmt[1] *= this.animation.push.drag;  // Update the new move ammount 
                this.mesh.pos[1] += this.animation.push.moveAmt[1];
            }
        }
        GlMove(this.gfxInfo, this.animation.push.moveAmt);
    }
    MovePull() {
        if(this.animation.pull.x.active){
            if(math.Abs(this.animation.pull.moveAmt[0]) > this.animation.pull.x.maxAmt){
                this.animation.pull.x.active = false;
            }
            else{
                this.animation.pull.moveAmt[0] *= this.animation.pull.drag; // Update the new move ammount 
                this.mesh.pos[0] += this.animation.pull.moveAmt[0];
            }
        } 
        if(this.animation.pull.y.active){
            if(math.Abs(this.animation.pull.moveAmt[1]) > this.animation.pull.y.maxAmt){
                this.animation.pull.y.active = false;
            }
            else{
                this.animation.pull.moveAmt[1] *= this.animation.pull.drag;  // Update the new move ammount 
                this.mesh.pos[1] += this.animation.pull.moveAmt[1];
            }
        }
        GlMove(this.gfxInfo, this.animation.pull.moveAmt);
        // this.Move(this.animation.push.moveAmt, this.animation.push.moveAmt);
    }

};



export class Bricks extends MeshBuffer{

    grid = {cols: INT_NULL, rows: INT_NULL,}; // Store number of columns and rows 

    constructor(){
        super(BRICK.MAX_COUNT, 'Bricks');
    }

    Init(sceneIdx) {
        const pos = [0, 0, BRICK.Z_INDEX];
        const dim = [0, 0];
        const style = { roundCorner: BRICK.ROUNDNESS, border: BRICK.BORDER, feather: BRICK.FEATHER, };
        const sid = SID_DEFAULT | SID.DEF2;
        
        
        // TODO: Temporary random distribution of power ups 
        // const tempHasPowUp = [1,0,0,0,1,0,0,0,0,1,1,0,0,1,0,0,0,0,1,0,0,1,0,0,1,0,0,1];
        const tempHasPowUp = [
            1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,
            1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,
            1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,
            1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,
            1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,
            1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,
            1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,
            1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,
            1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,
            1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,
            1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,
            1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,
            1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,
            1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,
        ];
        
        for (let i = 0; i < this.size; i++) {
            this.buffer[i] = new Brick(sid, TRANSPARENT, dim, [1.0, 1.0], null, pos, style);
            this.buffer[i].gfxInfo = GlAddMesh(this.buffer[i].sid, this.buffer[i].mesh, 1, sceneIdx, 'Bricks',
                GL_VB.ANY, NO_SPECIFIC_GL_BUFFER);
            this.buffer[i].isActive = false;
            this.buffer[i].hasPowUp = tempHasPowUp[i];
        }
    }
    Create(col, pos, dim, defPos, z_index){
        const freeidx = super.Create(pos, col, z_index);
        this.buffer[freeidx].StoreDefPos(defPos);
        this.buffer[freeidx].SetDim(dim);
        this.buffer[freeidx].ScaleFromVal(1);
        this.buffer[freeidx];
    }
    DimColor() {
        const len = this.buffer.length;
        for (let i = 0; i < len; i++) {
            const col = DimColor(this.buffer[i].mesh.col);
            this.buffer.SetColor(color);
        }
    }
    Destroy() {
        for (let i = 0; i < this.size; i++) {
            if (this.buffer[i].isActive) {
                this.buffer[i].Destroy();
                this.count--;
                if (this.count < 0) alert('Bricks Reset count is minus')
            }
        }
    }
    SetGrid(colsNum, rowsNum){
        this.grid.rows = rowsNum;
        this.grid.cols = colsNum;
    }
    GetGfxIdx(){
        /** Get all widget's progs and vertexBuffer indexes */
        return this.buffer[0].GetGfxIdx();
    }
}

const bricks = new Bricks();
let destructionParticles = null;

/* * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * 
 * Setters-Getters 
 */
export function BrickGetBricksBuffer() {
    return bricks.buffer;
}
export function BrickSetGridColumn(colsRemainder, rowsNum) {
    const colsNum = bricks.count>colsRemainder?((bricks.count-colsRemainder)/rowsNum):bricks.count;
    bricks.SetGrid(colsNum, rowsNum);
}
export function BrickSetRoundCorner(roundnes) {

    for (let i = 0; i < bricks.buffer.length; i++) {

        GlSetAttrRoundCorner(bricks.buffer[i].gfxInfo, roundnes);
    }
}
export function BrickSetBorderWidth(width) {

    for (let i = 0; i < bricks.buffer.length; i++) {

        GlSetAttrBorderWidth(bricks.buffer[i].gfxInfo, width);
    }
}
export function BrickSetBorderFeather(feather) {

    for (let i = 0; i < bricks.buffer.length; i++) {

        GlSetAttrBorderFeather(bricks.buffer[i].gfxInfo, feather);
    }
}


/* * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * *
 * Initialization 
 */
export function BrickInit(sceneIdx) {
    // Initialize Bricks array
    bricks.Init(sceneIdx);
    return bricks;
}
export function BrickCreateBrick(col, pos, dim, defPos) {
    bricks.Create(col, pos, dim, defPos, BRICK.Z_INDEX);
}
export function BrickReset() {
    // Destroy any active bricks
    bricks.Destroy();
}

/* * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * *
 * Update 
 */ 
export function BrickOnUpdate() {
    BrickUpdateParticles();
    // Call StageCompleted() if global state: stageCompleted is set
    if (g_state.game.stageCompleted) {
        OnStageCompleted();
    }
}
export function BrickBallCollision() {

    /** For bullet collision */
    const gun = GunGet();

    for (let i = 0; i < bricks.size; i++) {

        if (bricks.buffer[i].isActive) {
            // Cash brick's collision area 
            const brpos = bricks.buffer[i].mesh.pos; 
            const brdim = bricks.buffer[i].mesh.dim; 
            
            let bulletCollision = false;
            
            const ballCollision = BallBrickCollision(brpos, brdim[0], brdim[1]);
            if (ballCollision) {
                // Update the hit direction
                bricks.buffer[i].hit.leftDir = BALL.HIT.LEFT_DIR;
                bricks.buffer[i].hit.topDir = BALL.HIT.TOP_DIR;
            }

            // Check for bullet collision
            else if(gun.isActive && gun.numBullets){
                const bullets = BulletGet();
                bulletCollision = bullets.Collision(brpos, brdim);
            }

            if(ballCollision || bulletCollision){
                // Create brick destroy animation
                BrickDestroyAnimation(i);

                bricks.buffer[i].isActive = false;
                bricks.count--;

                // If this is the last breaked brick of the stage,
                // Set global state  'Stage completed', so that the scene will run.
                if (bricks.count <= 0) {
                    g_state.game.stageCompleted = true;
                }
            }
        }
    }

}


/* * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * *
 * FX 
 */ 
export function BrickCreateParticleSystem(sceneIdx) {
    const meshAttr = {
        sid: SID_NOISE,
        col: GREEN,
        pos: [10000, 0, 5],
        dim: [28, 16],
        scale: [1, 1],
        time: 0,
        style: null,
    };
    const timerAttr = {
        step: 0.01,
        duration: 1.0,
    }
    const numParticles = 32; // 32/4 particles per brick
    // destructionParticles = ParticlesCreateSystem(meshAttr, timerAttr, numParticles, sceneIdx, 'BrickDestruction');

    return destructionParticles;
}

function BrickUpdateParticles() {
    // let seed = Math.random();
    // const gravity = 10.0;
    // let side = .3;
    // for (let i = 0; i < destructionParticles.count; i++) {
    //     const ballDir = destructionParticles.buffer[i].dir;

    //     if (destructionParticles.buffer[i].isAlive) {
    //         const t = destructionParticles.GetTime(i);
    //         seed += (Math.atan(t * 4 * (i + 1) * .5));
    //         side *= -1;
    //         const tPos = [(Math.cos(seed)) * side + ballDir.x + t, Math.atan(seed) * (ballDir.y + t)];
    //         tPos[1] = (gravity * t * t) + (tPos[1] * t) + t;
    //         destructionParticles.Move(i, tPos[0], tPos[1] - .9);
    //     }
    // }
    // destructionParticles.Update();
}

/* * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * *
 * Animations 
 */ 

/** Brick destroy push-pull animation */
const pushAmt = 2
const pushDist = 25
const pullAmt = 2
const pullDist = 25
export function BrickDestroyAnimation(i) {
    const br = bricks.buffer[i];

    const animations = AnimationsGet();
    animations.Create(BrickDestroyPushStartAnimation, BrickDestroyPushStopAnimation, i);
    br.animation.push.x.maxDist = 0;
    br.animation.push.y.maxDist = 0;
    br.animation.push.y.sign = br.hit.topDir;
    br.animation.push.x.sign = br.hit.leftDir;
    if (br.hit.leftDir > 0) {
        br.animation.push.x.active = true;
        br.animation.push.moveAmt[0] = pushAmt;
        br.animation.push.x.maxDist = br.mesh.pos[0] + pushDist;
    } else if (br.hit.leftDir < 0) {
        br.animation.push.x.active = true;
        br.animation.push.moveAmt[0] = br.hit.leftDir * pushAmt
        br.animation.push.x.maxDist = br.mesh.pos[0] + (br.hit.leftDir * pushDist);
    }
    if (br.hit.topDir > 0) {
        br.animation.push.y.active = true;
        br.animation.push.moveAmt[1] = pushAmt;
        br.animation.push.y.maxDist = br.mesh.pos[1] + pushDist;
    } else if (br.hit.topDir < 0) {
        br.animation.push.y.active = true;
        br.animation.push.moveAmt[1] = br.hit.topDir*pushAmt;
        br.animation.push.y.maxDist = br.mesh.pos[1] + (br.hit.topDir  * pushDist);
    }
}
function BrickDestroyPushStartAnimation(i) { // This is the callback to the Animations.clbk at Animations.js
    const br = bricks.buffer[i];
    if (br.animation.push.y.active || br.animation.push.x.active) {
        br.MovePush()

        // If both x and y animation transition has been completed, reverse the animation
        if(!br.animation.push.y.active && !br.animation.push.x.active){ // active may change in br.MovePush() function
            // Reverse animation
            if(br.hit.leftDir){
                br.animation.pull.moveAmt[0] = br.hit.leftDir * pullAmt *-1;
                br.animation.pull.x.maxDist = br.mesh.pos[0] + (br.hit.leftDir * pullDist *-1);
                br.animation.pull.x.sign = br.hit.leftDir*-1;
                br.animation.pull.x.active = true;
            }
            if(br.hit.topDir){
                br.animation.pull.moveAmt[1] = br.hit.topDir * pullAmt *-1;
                br.animation.pull.y.maxDist = br.mesh.pos[1] + (br.hit.topDir * pullDist *-1);
                br.animation.pull.y.sign = br.hit.topDir*-1;
                br.animation.pull.y.active = true;
            }
        }
        return true;
    }
    else {
        if (br.animation.pull.x.active || br.animation.pull.y.active) {
            br.MovePull()
            return true;
        }
        return false
    }
}
function BrickDestroyPushStopAnimation(i) {
    bricks.buffer[i].SetColorAlpha(0.0);
    ExplosionsCreateCircleExplosion(bricks.buffer[i].mesh.pos, bricks.buffer[i].mesh.col, 1, .01);
    CoinCreate(bricks.buffer[i].mesh.pos);
    if(bricks.buffer[i].hasPowUp) PowerUpCreate(bricks.buffer[i].mesh.pos);
}

/** Brick DropDown Animation (at the starting of a stage) */
const brBufferColumns = [];
export function BrickTranslateAnimation(){
    const animations = AnimationsGet();
    animations.Create(BrickTranslateStartAnimation, BrickTranslateStopAnimation, null);

    const maxcol = bricks.grid.cols;
    const maxrow = bricks.grid.rows;
    let j = 0;
    brBufferColumns[j] = new Array(maxcol)
    let k = (maxrow) * maxcol;
    for(let i = 0; i < maxcol; i++){
        brBufferColumns[i] = new Array(maxcol);
        k = ((maxrow) * maxcol) + i;
        for(let j = 0; j <= maxrow; j++){
            if(k < bricks.count){
                brBufferColumns[i][j] = bricks.buffer[k];
            }
            k -= maxcol;
        }
    }
} 

let brCount = 0;
function BrickTranslateStartAnimation(){
    const gravity = 1.0;
    let stop = false;

    const maxrow = brBufferColumns.length;
    for(let i = 0; i < maxrow; i++){
        const maxcol = brBufferColumns[i].length;
        let k = brBufferColumns[i].length;

        for(let j = 0; j < maxcol; j++){
            const br = brBufferColumns[i][j];

            if(br !== undefined && br !== null){
                if(br.mesh.pos[1] < br.mesh.defPos[1]){
                    const y = (gravity * k*3.6) ;
                    br.MoveY(y); 
                    k--;
                }
                else if(br.mesh.pos[1] > br.mesh.defPos[1]){ // Current brick has reached its position
                    br.SetPosY(br.mesh.defPos[1]);  // Because of floating point inacuracy
                    brCount++; // Keep track of the finished bricks.
                }

                /**
                 * Create a delayed animation for each column-brick.
                 * Dont start the next brick column's animation, until current brick column hasn't reach prefered y pos
                 */
                if(br.mesh.pos[1] < br.mesh.defPos[1]-200) stop = true;
            }
        }
        if(stop) break;
    }
    
    // Stop the animation when all bricks are positioned
    if(brCount >= bricks.count){
        BallSetIsReady(true);
        return false;
    }

    // Else, continue calling this function until stop
    return true;
} 
function BrickTranslateStopAnimation(){
    // console.log('Animation brick translate STOPED');
    brCount = 0;
} 



