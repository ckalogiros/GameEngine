"use strict";
import { GlSetAttrTime } from "../../Graphics/Buffers/GlBufferOps.js";
import { GlGetContext } from "../../Graphics/Buffers/GlBuffers.js";
import { GlGetProgram } from "../../Graphics/GlProgram.js";
import * as math from "../../Helpers/Math/MathOperations.js"
import { TimerGetGlobalTimer } from "../Timer/Timer.js";


let _cnt = 1;
export const MESH_ENABLE = {
    UNIF_RESOLUTION: _cnt++,
    UNIF_TIMER: _cnt++,
    ATTR_TIMER: _cnt++,
    ATTR_STYLE: _cnt++,

    NONE: 0,
}


let _meshId = 0;
export class Mesh {

    sid;
    geom;
    mat;
    // style;
    time;
    attrParams1
    gfx;
    uniforms;
    shaderParams;

    constructor(geom = null, mat = null, time = 0, attrParams1 = [0, 0, 0, 0], sdfParams = [0, 0], name = '???') {

        this.geom = geom;
        this.mat = mat;

        this.sid = {
            shad: SID.SHAD.INDEXED,
            attr: (this.geom.sid.attr | this.mat.sid.attr | SID.ATTR.TIME),
            unif: (this.mat.sid.unif),
            pass: (this.geom.sid.pass | this.mat.sid.pass),
        };

        this.attrParams1 = [0, 0, 0, 0];
        this.sdfParams = [0, 0];
        this.gfx = null;

        if (time) this.time = time;

        if (sdfParams) math.CopyArr2(this.sdfParams, sdfParams);

        if (attrParams1) { // TODO: Better to create an array of length of the input param length 
            let i = 0;
            while (attrParams1[i]) {
                this.attrParams1[i] = attrParams1[i];
                i++;
            }
        }

        this.uniforms = {
            time: {
                val: 0,
                idx: INT_NULL,
            }
        }

        // Guard against anable a param for the shaders after the gl program has been created
        this.alreadyAdded = false;

        /** Debug properties */
        if (DEBUG.MESH) {
            Object.defineProperty(this, 'id', { value: _meshId++ });
            Object.defineProperty(this, 'type', { value: 'Mesh' });
            Object.defineProperty(this, 'name', { value: name });
        }
    }

    //////////////////////////////////////////////////////////////////////////////////////////////////////
    AddToGraphicsBuffer(sceneIdx) {
        this.gfx = GlGetContext(this.sid, sceneIdx, GL_VB.ANY, NO_SPECIFIC_GL_BUFFER);

        const prog = GlGetProgram(this.gfx.prog.idx);
        if (this.sid.unif & SID.UNIF.BUFFER_RES) {
            const unifBufferResIdx = prog.UniformsBufferCreateScreenRes();
            prog.UniformsSetBufferUniform(Viewport.width, unifBufferResIdx.resXidx);
            prog.UniformsSetBufferUniform(Viewport.height, unifBufferResIdx.resYidx);
        }
        if (this.sid.attr & SID.ATTR.TIME) {
            prog.UniformsCreateTimer(0.1)
        }

        this.geom.AddToGraphicsBuffer(this.sid, this.gfx, this.name);
        this.mat.AddToGraphicsBuffer(this.sid, this.gfx);
        return this.gfx;
    }

    //////////////////////////////////////////////////////////////////////////////////////////////////////
    SetColor(col) {
        this.mat.SetColor(col)
    }
    SetColorAlpha(alpha) {
        this.mat.SetColor(alpha)
    }

    SetPos(pos) {
        this.geom.SetPos(pos)
    }
    SetDim(dim) {
        this.geom.SetDim(dim)
    }

    //////////////////////////////////////////////////////////////////////////////////////////////////////
    SetBorder(width) {
        /**
         * Set a #define to the border
         */
    }

    ////////////////////////////////////////////////////////////////////////////////////////////////////////
    Enable(which) {

        if (this.alreadyAdded === true) {
            console.error(`You are trying to enable ${which} but the shaders have been already created. Try Enable() before inserting the mesh to a Scene().`);
        }

        if (Array.isArray(which)) {
            const count = which.length;
            for (let i = 0; i < count; i++) {
                this.CheckCase(which[i]);
            }

        }
        else {
            this.CheckCase(which);
        }
    }
    CheckCase(which) {
        switch (which) {
            case MESH_ENABLE.UNIF_RESOLUTION: {
                this.sid.unif |= SID.UNIF.BUFFER_RES; // Enable the screen resolution to be contructed as a uniform in the vertex shader, to be used in the fragment shader.
                break;
            }
            case MESH_ENABLE.ATTR_STYLE: {
                this.sid.attr |= (SID.ATTR.BORDER | SID.ATTR.R_CORNERS | SID.ATTR.FEATHER) | SID.ATTR.PARAMS1 | SID.ATTR.EMPTY;
                break;
            }
            default: console.error('Enable material\'s shader param failed. @ Material.js');
        }
    }

    /** 
     * Uniforms
     */
    SetTimeBufferUniform() {
        if (this.uniforms.time.idx === INT_NULL) {
            console.error('Buffer uniform time has not been created. @Mesh.SetBufferTimeUniform.');
            return;
        }
        const prog = GlGetProgram(this.gfx.prog.idx);
        prog.UniformsSetBufferUniform(this.time);
    }

    // CreateTimeBufferUniform(func){
    //     const prog = GlGetProgram(this.gfx.prog.idx);
    //     this.uniforms.time.val = func();
    //     this.uniforms.time.idx = prog.CreateUniformsBufferUniform(this.uniforms.time.val);
    // }
    // SetTimeBufferUniform(){
    //     if(this.uniforms.time.idx === INT_NULL) {
    //         console.error('Buffer uniform time has not been created. @Mesh.SetBufferTimeUniform.');
    //         return;
    //     }
    //     const prog = GlGetProgram(this.gfx.prog.idx);
    //     prog.UniformsSetBufferUniform(this.time);
    // }
    // UpdateTimeBufferUniform(){
    //     if(this.uniforms.time.idx === INT_NULL) {
    //         console.error('Buffer uniform time has not been created. @Mesh.SetBufferTimeUniform.');
    //         return;
    //     }

    //     this.uniforms.time.val = TimerGetGlobalTimer();
    //     const prog = GlGetProgram(this.gfx.prog.idx);
    //     prog.UniformsSetBufferUniform(this.uniforms.time.val);
    // }

}


let mesh = null;
export function TempSetMesh(m) {
    mesh = m;
}
export function TempSetAttrTimer() {
    // console.log(mesh.geom.timer)
    mesh.geom.timer = TimerGetGlobalTimer();
    GlSetAttrTime(mesh.gfx, mesh.geom.timer);
}



class MeshGroup {
    parent;
    children;
    constructor(parent = null, childrer = null) {
        this.parent = parent;
        // this.children = children
    }
    addChild(object) {
        this.children.push(object);
    }
}
