"use strict";
import { AnimTextsCreateValue, UiUpdate } from "./Ui/Ui.js";
import { BallCreatePowUpBalls, BallCreatePowerUpPowerBalls, BallDestroyPowerUpPowerBalls } from "./Ball.js";
import { PlayerCreateScaleAnimation } from "./Player.js";
import { Rect2D } from "../../Engine/Drawables/Geometries/Rect2D.js";
import { ExplosionsCreateSimpleExplosion } from "../../Engine/Drawables/Fx/Explosions.js";
import { GlowCreate, GlowDestroy, GlowSetTranslation } from "../../Engine/Drawables/Fx/Glow.js";
import { GetRandomColor, GetRandomInt } from "../../Helpers/Helpers.js";
import { GunGet } from "./Bullet.js";
import { TimeIntervalResetTimer, TimeIntervalsCreate } from "../../Engine/Timer/Time.js";
import { MeshBuffer, TempMesh } from "../../Engine/Drawables/MeshBuffer.js";



const POWUPS_MAX_COUNT = 32;

let pw_cnt = 0; 
const POWUP_TYPES = {
    BALLS: pw_cnt++,
    ENLARGE_PLAYER: pw_cnt++,
    BULLET: pw_cnt++,
    POWER_BALL: pw_cnt++,

    COUNT: pw_cnt,
};
// const POWUP_TYPES_ARRAY = [POWUP_TYPES.ENLARGE_PLAYER, POWUP_TYPES.BALLS, POWUP_TYPES.BULLET, POWUP_TYPES.POWER_BALL];
// const POWUP_TYPES_ARRAY = [POWUP_TYPES.POWER_BALL, POWUP_TYPES.BALLS];
const POWUP_TYPES_ARRAY = [POWUP_TYPES.BULLET];
// const POWUP_TYPES_ARRAY = [POWUP_TYPES.ENLARGE_PLAYER];
const OFFSET = 1;
function PowUpGetTextureIdx(type){
    return type+OFFSET;
}


class PowerUp extends TempMesh {

    t; // Timer
    type; // The type of the power up
    inAnimation;
    fx = {
        glowIdx: INT_NULL,
    };
    constructor(sid, col, dim, scale, tex, pos, style) {
        super('PowUp', sid, col, dim, scale, tex, pos, style, null, null);
        this.t = 0.;
        this.type = 'NULL';
        this.inAnimation = false;
    }
};

export class PowerUps extends MeshBuffer {
    
    // count;
    // size;
    intervalTimerIdx;
    
    constructor(){
        super(POWUPS_MAX_COUNT, 'PowUps')
    }
    // We dont use the constructor because power ups nedd to be initialized in specific time order
    Init(sceneIdx) {
        this.intervalTimerIdx = INT_NULL;
        const sid = SID_DEFAULT_TEXTURE;
        for (let i = 0; i < this.size; i++) {
            this.buffer[i] = new PowerUp(sid, TRANSPARENT, [POW_UP.WIDTH, POW_UP.HEIGHT], [1, 1], [-1, -1, -1, -1], [1000, 0, POW_UP.Z_INDEX], null);
            super.Init(sceneIdx, 'PowerUps', i)
        }
    }
    Create(pos){
        const freeidx = super.Create(pos, WHITE, POW_UP.Z_INDEX);
        
        const powUp = this.buffer[freeidx];
        // Set the glowing effect pos
        powUp.fx.glowIdx = GlowCreate(pos, blue, true, true, .14, null);
        powUp.type = POWUP_TYPES_ARRAY[GetRandomInt(0, POWUP_TYPES_ARRAY.length)];
        powUp.SetTexture(PowUpGetTextureIdx(powUp.type));
        powUp.inAnimation = true;
    }
    Reset() {
        for (let i = 0; i < this.size; i++) {
            this.Destroy(i);
        }
    }
    Destroy(idx) {
        super.Clear(idx);
        this.buffer[idx].SetColor([0., 0., 0., 0.]);
        // Destroy any glow effects
        if (this.buffer[idx].fx.glowIdx !== INT_NULL) {
            GlowDestroy(this.buffer[idx].fx.glowIdx);
        }
    }
    RunAnimation() {
        const yPosAdvance = 2.;

        for (let i = 0; i < POWUPS_MAX_COUNT; i++) {

            if (this.buffer[i].inAnimation) {

                this.buffer[i].mesh.pos[1] += yPosAdvance;

                this.buffer[i].UpdatePosXY();
                GlowSetTranslation(this.buffer[i].fx.glowIdx, 0, yPosAdvance);

                if (this.buffer[i].mesh.pos[1] > Viewport.bottom + 100) {
                    this.buffer[i].inAnimation = false;
                    this.buffer[i].isActive = false;
                    this.Destroy(i);
                }
            }
        }
    }
    DimColor() {
        const len = this.buffer.length;
        for (let i = 0; i < len; i++) {
            const col = DimColor(this.buffer[i].mesh.col);
            this.buffer[idx].SetColor(col);
        }
    }
}

const powUps = new PowerUps;
export function PowerUpGet() {
    return powUps;
}



export function PowerUpInit(sceneIdx) {
    powUps.Init(sceneIdx);
}

export function PowerUpCreate(brickPos) {
    powUps.Create(brickPos);
}

export function PowerUpReset() {
    powUps.Reset(); // Destroy any active Power Up
}

export function PowerUpPlayerCollision(plPos, plw, plh) {

    let scoreMod = 0;

    for (let i = 0; i < POWUPS_MAX_COUNT; i++) {

        const powpos = powUps.buffer[i].mesh.pos;
        const poww = powUps.buffer[i].mesh.dim[0];
        const powh = powUps.buffer[i].mesh.dim[1];

        if (powUps.buffer[i].isActive) {

            if (plPos[0] + plw >= powpos[0] - poww && plPos[0] - plw <= powpos[0] + poww &&
                plPos[1] + plh >= powpos[1] - powh && plPos[1] - plh <= powpos[1] + powh) {

                scoreMod = 0.5;
                AnimTextsCreateValue(powUps.buffer[i].mesh.pos, scoreMod);
                UiUpdate(UI_TEXT.SCORE_MOD, scoreMod);
                ExplosionsCreateSimpleExplosion(powUps.buffer[i].mesh.pos, ORANGE_240_130_10, 1, .04);


                // Set PowerUp's funtionality
                if (powUps.buffer[i].type == POWUP_TYPES.BALLS) {
                    const color = GetRandomColor();
                    BallCreatePowUpBalls(1, color, powpos);
                }
                else if (powUps.buffer[i].type == POWUP_TYPES.BULLET) {
                    const gun = GunGet();
                    gun.Create(20, null)
                }
                else if (powUps.buffer[i].type == POWUP_TYPES.ENLARGE_PLAYER) {
                    PlayerCreateScaleAnimation();
                }
                else if (powUps.buffer[i].type == POWUP_TYPES.POWER_BALL) {
                    BallCreatePowerUpPowerBalls();
                    if(powUps.intervalTimerIdx === INT_NULL){
                        powUps.intervalTimerIdx = TimeIntervalsCreate(3000, 'PowerBall Destroy', 1, BallDestroyPowerUpPowerBalls);
                    }
                    else{
                        TimeIntervalResetTimer(powUps.intervalTimerIdx);
                    }
                }
                powUps.Destroy(i);
            }
        }
    }
}

export function PowerUpDestroyIntervalTimer() {
    powUps.intervalTimerIdx = INT_NULL;
}
export function PowerUpRunAnimation() {
    powUps.RunAnimation();
}


