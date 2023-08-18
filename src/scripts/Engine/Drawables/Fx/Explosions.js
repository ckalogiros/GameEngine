"use strict";

import { TimersCreateTimer } from "../../Timers/Timers.js";
import { GlMoveXY, GlSetAttrTime, GlSetColor, GlSetWposXY } from "../../../Graphics/Buffers/GlBufferOps.js";
import { MeshBuffer } from "../MeshBuffer_OLD.js";
import { CopyArr2, CopyArr4 } from "../../../Helpers/Math/MathOperations.js";

/**
 * 
 * 
 * Current Implementaion of the Translation inimation paralel the explosion animation
 *      1. On the Caller site(explosion creator) store the index of the created explosion
 *      2. Call 'ExplosionSimpleSetTranslation()' to update the value, wich is gonna be used to translate the explosion mesh. 
 */
class Explosion {

    gfxInfo  = null;
    timer    = null;
    isActive = false;
    translation = {
        yAdvance:INT_NULL, 
    };
    SetTimer(){
        GlSetAttrTime(this.gfxInfo, this.timer.t);
    }
    ResetTimer(){
        this.timer.t = this.timer.duration; // The explosion uses duration's value to stop the rendering in the fragment shader.
        GlSetAttrTime(this.gfxInfo, this.timer.t);
    }
    Move(){
        GlMoveXY(this.gfxInfo, [0, this.translation.yAdvance]);
    }
    Clear(){
        this.isActive = false;
        this.translation.yAdvance = INT_NULL;
    }
    SetPosXY(pos) {
        GlSetWposXY(this.gfxInfo, pos);
    }
    SetColor(col) {
        GlSetColor(this.gfxInfo, col);
    }
};

// Export only for the class type, to be used with instanceof
export class Explosions extends MeshBuffer{

    constructor(size, name){
        super(size, name);
    }

    Init(name, explosion_sid, color, dim, z_index){
        for(let i=0; i<this.size; i++){
            this.buffer[i] = new Explosion;
            const ex = RectCreateRect(name + i, SID_EXPLOSION | explosion_sid, color, dim, [1,1], null, [OUT_OF_VIEW, 0, z_index], null, 0, null);
            this.buffer[i].gfxInfo = GlAddMesh(ex.sid, ex.mesh, 1, SCENE.stage, 'Explosion', GL_VB.ANY, NO_SPECIFIC_GL_BUFFER);
        }
    }
    Create(pos, col, duration, step){
        const idx = super.Create(pos, col, null);

        // Init a timer for the explosion animation
        if(this.name === 'Circle'){
            this.buffer[idx].timer = 
                TimersCreateTimer(step, duration, step, 'Explosions/' + this.name, CLBK_CrExplosionClear, idx);
        }
        else if(this.name === 'Simple'){
            this.buffer[idx].timer = 
                TimersCreateTimer(step, duration, step, 'Explosions/' + this.name, CLBK_SimpleExplosionClear, idx);
        }
        else if(this.name === 'Volumetric'){
            this.buffer[idx].timer = 
                TimersCreateTimer(step, duration, step, 'Explosions/' + this.name, CLBK_VolumetricExplosionClear, idx);
        }

        this.buffer[idx].SetTimer();
        return idx;
    }
    Clear(idx){
        this.buffer[idx].Clear();
        this.count--;
    }
    /** Updates the internal timer for the explosion and passes the timer to the fragment shader for the animated effect */
    Update(){
        if(!this.count) return;
        for(let i=0; i<this.size; i++){
            if(this.buffer[i].isActive){ 
                if(this.buffer[i].timer.isActive){
                    this.buffer[i].SetTimer(); // Update the time attribute, in the shader
                    // If the translation animation is active for the current explosion, Move.
                    if(this.buffer[i].translation.yAdvance !== INT_NULL){
                        this.buffer[i].Move();
                    }
                }
            }
        }
    }
}

/**
 * In this section we create different kind of explosions, 
 * each one with its own fragment shader.
 * 
 * STEPS:
 *      1. First declare a new Explosions constant.
 *      2. Put it to the return [] of ExplosionsGetAll() function.
 *      3. Initialize it in  ExplosionsInit(), with the prefferable fShader, dimention 
 *          of the explosion rect mesh, color, etc...
 *      4. Call the apropriate Create() function for the kind of explosion to create.
 *          Needs a timer duration and step, for the explosion animation .
 *      5. Put an .Update method to the ExplosionsUpdate() global function.
 *      
 */



const crExplosions = new Explosions(64, 'Circle');
const simpleExplosions = new Explosions(64, 'Simple');
const volumetricExplosions = new Explosions(1, 'Volumetric');


export function ExplosionsGetAll(){
    return [crExplosions, simpleExplosions, volumetricExplosions];
}
export function ExplosionsGetCircle(){ return crExplosions; }
export function ExplosionsGetSimple(){ return simpleExplosions; }
export function ExplosionsGetVolumetricExplosions(){ return volumetricExplosions; }
export function ExplosionSimpleSetTranslation(idx, val){
    simpleExplosions.buffer[idx].translation.yAdvance = val;
}

// Reserve to a buffer all explosions that can be render at one time(until animation expires).
export function ExplosionsInit(){
    crExplosions.Init('circle explosion ', SID.FX.FS_EXPLOSION_CIRCLE  | SID.ATTR.PARAMS1, BLUE_LIGHT, [80, 80], EXPLOSIONS.Z_INDEX); 
    simpleExplosions.Init('simple explosion ', SID.FX.FS_EXPLOSION_SIMPLE  | SID.ATTR.PARAMS1, ORANGE_240_130_10, [60, 60], EXPLOSIONS.Z_INDEX); 
    volumetricExplosions.Init('volumetric explosion ', SID.FX.FS_VOLUMETRIC_EXPLOSION  | SID.ATTR.PARAMS1, ORANGE_240_130_10, [100, 100], EXPLOSIONS.Z_INDEX); 
}

export function ExplosionsUpdate(){
    crExplosions.Update();
    simpleExplosions.Update();
    volumetricExplosions.Update();
}

export function ExplosionsCreateCircleExplosion(pos, col, duration, step){
    crExplosions.Create(pos, col, duration, step);
}
export function ExplosionsCreateSimpleExplosion(pos, col, duration, step){
    return simpleExplosions.Create(pos, col, duration, step);
}
export function ExplosionsCreateVolumetricExplosion(pos, col, duration, step){
    return volumetricExplosions.Create(pos, col, duration, step);
}


function CLBK_SimpleExplosionClear(idx) {
    simpleExplosions.buffer[idx].ResetTimer();
    simpleExplosions.Clear(idx);
}
function CLBK_CrExplosionClear(idx) {
    crExplosions.buffer[idx].ResetTimer();
    crExplosions.Clear(idx);
}
function CLBK_VolumetricExplosionClear(idx) {
    volumetricExplosions.buffer[idx].ResetTimer();
    volumetricExplosions.Clear(idx);
}
