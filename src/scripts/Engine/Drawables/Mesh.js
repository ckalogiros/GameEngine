"use strict";
import { GlSetAttrTime } from "../../Graphics/Buffers/GlBufferOps.js";
import { GlGetContext, GlHandlerAddIndicesBuffer } from "../../Graphics/Buffers/GlBuffers.js";
import { GlGetProgram, GlSetTexture } from "../../Graphics/GlProgram.js";
import { FontGetFontDimRatio } from "../Loaders/Font/Font.js";
import { TextureLoadTexture } from "../Loaders/Textures/Texture.js";
import { TimerGetGlobalTimer } from "../Timer/Timer.js";


let _cnt = 1;
export const MESH_ENABLE = {
    UNIF_RESOLUTION: _cnt++,
    UNIF_TIMER: _cnt++,
    ATTR_TIME: _cnt++,
    ATTR_STYLE: _cnt++,

    // Pass from vertex to fragment shader
    PASS_COL4: _cnt++,
    PASS_WPOS2: _cnt++,
    PASS_DIM2: _cnt++,
    PASS_TIME1: _cnt++,
    PASS_RES2: _cnt++,

    NONE: 0,
}


let _meshId = 0;
export class Mesh {

    sid;
    geom;
    mat;
    time;
    attrParams1;
    gfx;
    uniforms;
    shaderParams;

    constructor(geom = null, mat = null, time = 0, attrParams1 = [0, 0, 0, 0], name = '???') {

        this.geom = geom;
        this.mat = mat;

        this.sid = {
            shad: SID.SHAD.INDEXED,
            attr: (this.geom.sid.attr | this.mat.sid.attr),
            unif: (this.mat.sid.unif) | SID.UNIF.PROJECTION, // Assuming we always have  a projection camera and a uniforms buffer. 
            pass: (this.geom.sid.pass | this.mat.sid.pass | SID.PASS.COL4),
        };

        this.attrParams1 = [0, 0, 0, 0];
        this.sdfParams = [0, 0];
        this.gfx = null;

        if (time) this.time = time;

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

        // Guard against enable a param for the shaders after the gl program has been created
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

        // Set Texture
        if (this.mat.texId !== INT_NULL) { // texId is init with INT_NULL that means there is no texture passed to the Material constructor.

            if (this.mat.hasFontTex) {
                this.isFontSet = true;
                // Correct the geometry height.
                this.geom.dim[1] *= FontGetFontDimRatio(this.mat.uvIdx);
            }
        }

        this.geom.AddToGraphicsBuffer(this.sid, this.gfx, this.name);
        this.mat.AddToGraphicsBuffer(this.sid, this.gfx);
        return this.gfx;
    }

    //////////////////////////////////////////////////////////////////////////////////////////////////////
    // SETTERS
    SetColor(col) {
        this.mat.SetColor(col)
    }
    SetColorAlpha(alpha) {
        this.mat.SetColor(alpha)
    }
    SetPos(pos) {
        this.geom.SetPos(pos, this.gfx)
    }
    SetDim(dim) {
        this.geom.SetDim(dim)
    }
    SetAttrTime() {
        if (this.sid.attr & SID.ATTR.TIME) {
            this.geom.timer = TimerGetGlobalTimer();
            GlSetAttrTime(this.gfx, this.geom.timer);
        }
    }
    SetBorder(width) {
        /**
         * Set a #define to the border
         */
    }
    SetStyle(border, rCorners, feather) {
        this.mat.SetStyle(border, rCorners, feather);
    }

    //////////////////////////////////////////////////////////////
    // Position
    // SetPos(pos) {
    //     math.CopyArr2(this.pos, pos);
    //     glBufferOps.GlSetWposXY(this.gfxInfo, pos);
    // }
    // SetPosXY(pos) {
    //     math.CopyArr2(this.mesh.pos, pos);
    //     glBufferOps.GlSetWposXY(this.gfxInfo, pos);
    // }
    // SetPosX(x) {
    //     this.mesh.pos[0] = x;
    //     glBufferOps.GlSetWposX(this.gfxInfo, x);
    // }
    // SetPosY(y) {
    //     this.mesh.pos[1] = y;
    //     glBufferOps.GlSetWposY(this.gfxInfo, y);
    // }
    // UpdatePosXY() {
    //     glBufferOps.GlSetWposXY(this.gfxInfo, this.mesh.pos);
    // }
    // SetZindex(z) {
    //     this.mesh.pos[2] = z;
    //     glBufferOps.GlSetWposZ(this.gfxInfo, z);
    // }
    // Move(x, y) {
    //     this.mesh.pos[0] += x;
    //     this.mesh.pos[1] += y;
    //     GlMove(this.gfxInfo, [x, y]);
    // }
    // MoveX(x) {
    //     this.mesh.pos[0] += x;
    //     glBufferOps.GlMove(this.gfxInfo, [x, 0]);
    // }
    // MoveY(y) {
    //     this.mesh.pos[1] += y;
    //     glBufferOps.GlMove(this.gfxInfo, [0, y]);
    // }

    ////////////////////////////////////////////////////////////////////////////////////////////////////////
    // Enable shader properties
    Enable(which, params) {

        if (this.alreadyAdded === true) {
            console.error(`You are trying to enable ${which} but the shaders have been already created. Try Enable() before inserting the mesh to a Scene().`);
        }

        if (Array.isArray(which)) {
            const count = which.length;
            for (let i = 0; i < count; i++) {
                this.CheckCase(which[i], params);
            }

        }
        else {
            this.CheckCase(which, params);
        }
    }
    CheckCase(which, params) {
        switch (which) {
            case MESH_ENABLE.UNIF_RESOLUTION: {
                this.sid.unif |= SID.UNIF.BUFFER_RES | SID.UNIF.U_BUFFER; // Enable the screen resolution to be contructed as a uniform in the vertex shader, to be used in the fragment shader.
                break;
            }
            case MESH_ENABLE.ATTR_STYLE: {
                this.sid.attr |= (SID.ATTR.BORDER | SID.ATTR.R_CORNERS | SID.ATTR.FEATHER) | SID.ATTR.PARAMS1 | SID.ATTR.EMPTY;
                this.sid.unif |= SID.UNIF.U_BUFFER;
                this.sid.pass |= SID.PASS.WPOS2 | SID.PASS.DIM2;
                if (!(params === null || params === undefined)) {
                    this.mat.style = params.style;
                }

                this.sid.unif |= SID.UNIF.BUFFER_RES | SID.UNIF.U_BUFFER;
                break;
            }
            case MESH_ENABLE.ATTR_TIME: {
                this.sid.attr |= SID.ATTR.TIME;
                break;
            }

            case MESH_ENABLE.PASS_COL4: { this.sid.pass |= SID.PASS.COL4; break; }
            case MESH_ENABLE.PASS_WPOS2: { this.sid.pass |= SID.PASS.WPOS2; break; }
            case MESH_ENABLE.PASS_DIM2: { this.sid.pass |= SID.PASS.DIM2; break; }
            case MESH_ENABLE.PASS_RES2: { this.sid.pass |= SID.PASS.RES2; break; }
            case MESH_ENABLE.PASS_TIME1: { this.sid.pass |= SID.PASS.TIME1; break; }

            default: console.error('Enable material\'s shader param failed. @ Material.js');
        }
    }

    ////////////////////////////////////////////////////////////////////////////////////////////////////////
    // Uniforms
    SetTimeBufferUniform() {
        if (this.uniforms.time.idx === INT_NULL) {
            console.error('Buffer uniform time has not been created. @Mesh.SetBufferTimeUniform.');
            return;
        }
        const prog = GlGetProgram(this.gfx.prog.idx);
        prog.UniformsSetBufferUniform(this.time);
    }
}


export class TextMesh extends Mesh {

    sdfParams;
    isFontSet;


    constructor(geom, mat) {

        super(geom, mat);
        this.isFontSet = false;

    }

    AddToGraphicsBuffer(sceneIdx) {
        this.gfx = GlGetContext(this.sid, sceneIdx, GL_VB.ANY, NO_SPECIFIC_GL_BUFFER);

        const prog = GlGetProgram(this.gfx.prog.idx);
        if (this.sid.unif & SID.UNIF.BUFFER_RES) {
            const unifBufferResIdx = prog.UniformsBufferCreateScreenRes();
            prog.UniformsSetBufferUniform(Viewport.width, unifBufferResIdx.resXidx);
            prog.UniformsSetBufferUniform(Viewport.height, unifBufferResIdx.resYidx);
        }

        // if (this.mat.hasFontTex) {

        //     // Create texture
        //     // Store the texture index in the curent mesh and also in the vertex buffer that the mesh is going to be saved to.
        //     this.gfx.tb.idx = this.mat.texIdx;
        //     GlSetTexture(this.gfx.prog.idx, this.gfx.vb.idx, this.gfx.tb.idx); // Update the vertex buffer to store the texture index

        //     // this.mat.texIdx = indexes.texIdx;
        //     // this.mat.uvIdx = indexes.uvIdx;

        // }

        this.geom.AddToGraphicsBuffer(this.sid, this.gfx, this.name);
        this.mat.AddToGraphicsBuffer(this.sid, this.gfx);

        return this.gfx;
    }

    MoveXY(pos) {
        this.geom.MoveXY(pos, this.gfx)
        // for(let i=0; i<this.geom.numChars; i++){
        //     this.geom.SetPos(pos, this.gfx)
        // }
    }
    // UseFont(fontIdx) {
    //     // Prevent replacing an existing loaded font texture.
    //     // Currently onlyy one texture per vertex buffer is allowed
    //     // TODO: Later implement multi texture for a vertexBuffer
    //     if (this.fontIdx === INT_NULL) this.fontIdx = fontIdx;
    // }
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
