"use strict";
import { GlGetContext } from "../../Graphics/Buffers/GlBuffers.js";
import { GlGetProgram } from "../../Graphics/GlProgram.js";
import * as math from "../../Helpers/Math/MathOperations.js"
import { TimerGetGlobalTimer } from "../Timer/Timer.js";


class MeshGroup{
    parent;
    children;
    constructor(parent = null, childrer = null){
        this.parent = parent;
        // this.children = children
    }
    addChild(object){
        this.children.push(object);
    }
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

    constructor(geom = null, mat = null, time = 0, attrParams1 = [0, 0, 0, 0], sdfParams = [0, 0]) {

        this.geom = geom;
        this.mat = mat;

        this.sid = (this.geom.sid | this.mat.sid | SID.ATTR.TIME | SID.SHAD.INDEXED);
        this.sid = {
            shad:  SID.SHAD.INDEXED,
            attr: (this.geom.sid.attr | this.mat.sid.attr | SID.ATTR.TIME),
            pass: (this.geom.sid.pass | this.mat.sid.pass),
        };
        
        // this.style = [0, 0, 0];
        this.attrParams1 = [0, 0, 0];
        this.sdfParams = [0, 0];
        this.gfx = null;

        // if (style) {
        //     this.style[0] = style.roundCorner;
        //     this.style[1] = style.border;
        //     this.style[2] = style.feather;
        // }
        
        if(time) this.time = time;

        if(sdfParams) math.CopyArr2(this.sdfParams, sdfParams);

        if(attrParams1){ // TODO: Better to create an array of length of the input param length 
            let i = 0;
            while(attrParams1[i]){
                this.attrParams1[i] = attrParams1[i];
                i++;
            }
        }

        this.uniforms = {
            time:{
                val: 0,
                idx: INT_NULL,
            }
        }

        /** Debug properties */
        if(DEBUG.MESH){
            Object.defineProperty( this, 'id', { value: _meshId++ } );
            Object.defineProperty( this, 'type', { value: 'Mesh' } );
            Object.defineProperty( this, 'name', { value: '????' } );
        }
    }

    //////////////////////////////////////////////////////////////////////////////////////////////////////
    AddToGraphicsBuffer(sceneIdx){
        this.gfx = GlGetContext(this.sid, sceneIdx, GL_VB.ANY, NO_SPECIFIC_GL_BUFFER)
        this.geom.AddToGraphicsBuffer(this.sid, this.gfx, this.name);
        this.mat.AddToGraphicsBuffer(this.sid, this.gfx);
    }
     
    //////////////////////////////////////////////////////////////////////////////////////////////////////
    SetColor(col){
        this.mat.SetColor(col)
    }
    SetColorAlpha(alpha){
        this.mat.SetColor(alpha)
    }
    
    SetPos(pos){
        this.geom.SetPos(pos)
    }
    SetDim(dim){
        this.geom.SetDim(dim)
    }
    
    //////////////////////////////////////////////////////////////////////////////////////////////////////
    SetBorder(width){
        /**
         * Set a #define to the border
         */
    }


    /** 
     * Uniforms
     */
    SetTimeBufferUniform(){
        if(this.uniforms.time.idx === INT_NULL) {
            console.error('Buffer uniform time has not been created. @Mesh.SetBufferTimeUniform.');
            return;
        }
        const prog = GlGetProgram(this.gfx.prog.idx);
        prog.UniformsSetUniformsBuffer(this.time);
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
    //     prog.UniformsSetUniformsBuffer(this.time);
    // }
    // UpdateTimeBufferUniform(){
    //     if(this.uniforms.time.idx === INT_NULL) {
    //         console.error('Buffer uniform time has not been created. @Mesh.SetBufferTimeUniform.');
    //         return;
    //     }

    //     this.uniforms.time.val = TimerGetGlobalTimer();
    //     const prog = GlGetProgram(this.gfx.prog.idx);
    //     prog.UniformsSetUniformsBuffer(this.uniforms.time.val);
    // }

}




// export class Mesh {

//     col = [0, 0, 0, 0];
//     dim = [0, 0];
//     scale = [0, 0];
//     tex = [0, 0, 0, 0];
//     pos = [0, 0, 0];
//     style = [0, 0, 0];
//     time = 0.0;
//     sdfParams = [0, 0]
//     defDim = [0, 0]
//     defScale = [0, 0]
//     defPos = [0, 0, 0];
//     attrParams1 = [0, 0, 0, 0]

//     constructor(col, dim, scale, tex, pos, style, time, attrParams1, sdfParams) {
//         math.CopyArr4(this.col, col);
//         math.CopyArr2(this.dim, dim);
//         math.CopyArr2(this.scale, scale);

//         if (tex) { math.CopyArr4(this.tex, tex); }

//         math.CopyArr3(this.pos, pos);

//         if (style) {
//             this.style[0] = style.roundCorner;
//             this.style[1] = style.border;
//             this.style[2] = style.feather;
//         }
        
//         if(time) this.time = time;
//         if(sdfParams) math.CopyArr2(this.sdfParams, sdfParams);

//         if(attrParams1){ // TODO: Better to create an array of length of the input param length 
//             let i = 0;
//             while(attrParams1[i]){
//                 this.attrParams1[i] = attrParams1[i];
//                 i++;
//             }
//         }

//         // Keep a copy of the starting dimention and position
//         math.CopyArr2(this.defDim, dim);
//         math.CopyArr2(this.defScale, scale);
//         math.CopyArr3(this.defPos, pos);
//     }
// }


