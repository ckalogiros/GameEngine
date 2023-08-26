"use strict";

import * as math from '../../Helpers/Math/MathOperations.js'
import { GlSetAttrTime, GlSetWposXY, GlSetColor, GlSetColorAlpha, GlSetAttrParams1 } from "../../Graphics/Buffers/GlBufferOps.js";
import { Mesh } from "../Drawables/Meshes/Base/Mesh.js";
import { TimersCreateTimer } from "../Timers/Timers.js";

class Particle {
    isAlive = false;
    mesh    = null;
    gfxInfo = null;
    timer   = null;
    dir = { x:1, y:1 };

    constructor(name, sid, scene, col, dim, scale, tex, pos, style, time, sdf_params, attrParams1){
        this.mesh = new Mesh(col, dim, scale, tex, pos, style, time, attrParams1, sdf_params);
        this.isAlive = false;
        this.gfxInfo = GlAddMesh(sid, this.mesh, 
            1, scene, `Particle:${name}`, GL_VB.ANY, NO_SPECIFIC_GL_BUFFER);
        this.timer = null;
    }
    Create(xpos, ypos, dir, col, clbk, ballIdx, idx, lifeTime, timerStep, name){
        this.mesh.pos[0] = xpos;
        this.mesh.pos[1] = ypos;
        if(col) math.CopyArr4(this.mesh.col, col);
        const params = {ballIdx: ballIdx, particleIdx: idx};
        this.timer   = TimersCreateTimer(0.01, lifeTime, timerStep, name, clbk, params);
        this.isAlive = true;
        this.dir = dir;
    }
    SetColor(col) {
        math.CopyArr4(this.mesh.col, col);
        GlSetColor(this.gfxInfo, col);
    }
    SetColorAlpha(a) {
        this.mesh.col[3] = a;
        GlSetColorAlpha(this.gfxInfo, a);
    }
    SetPos(pos) {
        math.CopyArr2(this.mesh.pos, pos);
        GlSetWposXY(this.gfxInfo, pos);
    }
    UpdatePos() {
        GlSetWposXY(this.gfxInfo, this.mesh.pos);
    }
};


export class Particles{

    buffer; // Buffer to store all particles.
    count;  // Particles count.
    lifeTime;  // Duration of particles life.
    timerStep;  // The step in which the timer will increase in order to reach the end of lifeCycle.
    // For Debugging
    name = '';

    constructor(timerAttr, name){
        this.buffer = [];
        this.timerStep = timerAttr.step;
        this.lifeTime  = timerAttr.duration;
        this.name      = name;
        this.count     = 0;
    }

    Init(meshData, numParticles, scene, name){
        const pos = [OUT_OF_VIEW, OUT_OF_VIEW, PARTICLES.Z_INDEX]
        for(let i=0; i<numParticles; i++){
            this.buffer[i] = new Particle(name, meshData.sid, scene, meshData.col, meshData.dim, meshData.scale, 
                                meshData.tex, pos, meshData.style, meshData.time, null, null);
            this.count++;
        }
    }
    Update(){
        for(let i=0; i< this.count; i++){
            if( this.buffer[i].isAlive){
                GlSetWposXY(this.buffer[i].gfxInfo,   this.buffer[i].mesh.pos);
                GlSetAttrTime(this.buffer[i].gfxInfo, this.buffer[i].timer.t);
            }
        }
    }
    Create(xpos, ypos, dir, col, clbk, ballIdx){
        const idx = this.GetNextFree();
        if(idx !== null){
            this.buffer[idx].Create(xpos, ypos, dir, col, clbk, ballIdx, idx, this.lifeTime, this.timerStep, 'Particles'+this.name);
            // console.log(xpos, ypos, 'idx:', idx, 'isAlive:', this.buffer[idx].isAlive)
        }
    }
    Destroy(idx){ // The index comes from the callers site destruction function
        this. buffer[idx].isAlive = false;
        // Set the wpos far from screen view, so the destroyed particle does not show.
        GlSetWposXY(this.buffer[idx].gfxInfo, [OUT_OF_VIEW, OUT_OF_VIEW]);
    }
    GetNextFree(){
        for(let i=0; i<this.count; i++)
            if(this.buffer[i].isAlive === false)
                return i;
        console.log('Not enough Particles for:' + this.name)
        return null;
    }
    GetGfxIdx(){
        /** Get all widget's progs and vertexBuffer indexes */
        const gfxIdx = [
            [this.buffer[0].gfxInfo.prog.idx, this.buffer[0].gfxInfo.vb.idx],
        ];
        return gfxIdx;
    }
    GetColor(idx){
        return this.buffer[idx].mesh.col;
    }
    SetColor(col) {
        for(let i=0; i< this.count; i++){
            math.CopyArr4(this.buffer[i].mesh.col, col);
            GlSetColor(this.buffer[i].gfxInfo, col);
        }
    }
    SetParams1Attr(paramOffset, val){
        for(let i=0; i< this.count; i++){
            this.buffer[i].mesh.attrParams1[paramOffset] = val;
            GlSetAttrParams1(this.buffer[i].gfxInfo, this.buffer[i].mesh.attrParams1, paramOffset);
        }
    }
    UpdateParams1Attr(paramOffset){
        for(let i=0; i< this.count; i++){
            GlSetAttrParams1(this.buffer[i].gfxInfo, this.buffer[i].mesh.attrParams1, paramOffset);
        }
    }

};


export class ParticleSystem{

    psBuffer = []; //  A buffer to store all the different particle systems
    count = 0;
    name = '';

    CreateSystem(meshData, timerAttr, numParticles, scene, name){

        const idx = this.count;
        this.psBuffer[idx] = new Particles(timerAttr, name); 
        this.psBuffer[idx].Init(meshData, numParticles, scene, name); 
        this.count++;
        this.name = name;
        return idx;
    }

    FindByName(name){
        for(let i=0; i<this.count; i++){
            if(this.psBuffer[i].name === name){
                return this.psBuffer[i];
            }
        }
        return null;
    }
    Update(){
        for(let i=0; i<this.count; i++){
            if(this.psBuffer[i]){ // If particle system exists
                this.psBuffer[i].Update(); // Update
            }
        }
    }
    Destroy(idx){
        this.psBuffer[idx] = null;
    }
};


const particleSystem = new ParticleSystem;
export function ParticleSystemGet(){
    return particleSystem;
}
export function ParticleSystemGetParticleSystem(idx){
    return particleSystem.psBuffer[idx];
}
export function ParticleSystemFindByName(name){
    const ret = particleSystem.FindByName(name);
    if(ret===null)  alert(`Error finding particle system. Check if the name is correct. name:${name}`)
    return ret;
}

export function ParticlesCreateSystem(meshData, timerAttr, num, scene, name){
    return particleSystem.CreateSystem(meshData, timerAttr, num, scene, name);
}
export function ParticleSystemCreateParticle(systemIdx, xpos, ypos, dir, col, clbk, ballIdx){
    particleSystem.psBuffer[systemIdx].Create(xpos, ypos, dir, col, clbk, ballIdx);
}
export function ParticleSystemDestroySystem(systemIdx){
    particleSystem.Destroy(systemIdx);
}
export function ParticleSystemDestroyParticle(systemIdx, idx){
    particleSystem.psBuffer[systemIdx].Destroy(idx);
}
export function ParticleSystemGetParticleColor(systemIdx){
    return particleSystem.psBuffer[systemIdx].GetColor(systemIdx);
}
export function ParticleSystemSetParticleColor(systemIdx, col){
    particleSystem.psBuffer[systemIdx].SetColor(col);
}

