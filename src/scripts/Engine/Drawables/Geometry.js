"use strict";

import * as math from '../../Helpers/Math/MathOperations.js'
import * as glBufferOps from '../../Graphics/Buffers/GlBufferOps.js'
import { GlAddGeometry } from '../../Graphics/Buffers/GlBuffers.js';
import { GfxInfoMesh } from '../../Graphics/GlProgram.js';

let _geometryId = 0;

export class Geometry2D {

    sid;
    pos = [0, 0, 0];
    dim = [0, 0];
    scale = [0, 0];
    defPos = [0, 0, 0];
    defDim = [0, 0];
    defScale = [0, 0];
    time = 0;

    constructor(pos = [0, 0, 0], dim = [0, 0], scale = [1, 1]) {

        this.sid = {
            shad: 0,
            attr: (SID.ATTR.POS2 | SID.ATTR.WPOS_TIME4),
            unif: 0,
            pass: 0,
        };

        math.CopyArr3(this.pos, pos);
        math.CopyArr2(this.dim, dim);
        math.CopyArr2(this.scale, scale);

        // Keep a copy of the starting dimention and position
        math.CopyArr2(this.defDim, dim);
        math.CopyArr2(this.defScale, scale);
        math.CopyArr3(this.defPos, pos);

        /** Debug properties */
        if (DEBUG.GEOMETRY) {
            Object.defineProperty(this, 'id', { value: _geometryId++ });
            Object.defineProperty(this, 'type', { value: 'Geometry' });
        }
    }

    //////////////////////////////////////////////////////////////
    AddToGraphicsBuffer(sid, gfx, meshName) {
        GlAddGeometry(sid, this.pos, this.dim, this.time, gfx, meshName, 1)
    }

    //////////////////////////////////////////////////////////////
    SetPos(pos) {
        math.CopyArr2(this.mesh.pos, pos);
        glBufferOps.GlSetWposXY(this.gfxInfo, pos);
    }
    SetPosXY(pos) {
        math.CopyArr2(this.mesh.pos, pos);
        glBufferOps.GlSetWposXY(this.gfxInfo, pos);
    }
    SetPosX(x) {
        this.mesh.pos[0] = x;
        glBufferOps.GlSetWposX(this.gfxInfo, x);
    }
    SetPosY(y) {
        this.mesh.pos[1] = y;
        glBufferOps.GlSetWposY(this.gfxInfo, y);
    }
    UpdatePosXY() {
        glBufferOps.GlSetWposXY(this.gfxInfo, this.mesh.pos);
    }
    SetZindex(z) {
        this.mesh.pos[2] = z;
        glBufferOps.GlSetWposZ(this.gfxInfo, z);
    }
    Move(x, y) {
        this.mesh.pos[0] += x;
        this.mesh.pos[1] += y;
        GlMove(this.gfxInfo, [x, y]);
    }
    MoveX(x) {
        this.mesh.pos[0] += x;
        glBufferOps.GlMove(this.gfxInfo, [x, 0]);
    }
    MoveY(y) {
        this.mesh.pos[1] += y;
        glBufferOps.GlMove(this.gfxInfo, [0, y]);
    }
    //////////////////////////////////////////////////////////////
    SetDim(dim) {
        math.CopyArr2(this.mesh.dim, dim);
        glBufferOps.GlSetDim(this.gfxInfo, dim);
    }
    // Shrink(val) {
    //     this.mesh.dim[0] *= val;
    //     this.mesh.dim[1] *= val;
    //     glBufferOps.GlSetDim(this.gfxInfo, this.mesh.dim);
    // }
    UpdateScale() {
        glBufferOps.GlSetScale(this.gfxInfo, this.mesh.scale);
    }
    SetScale(s) {
        this.mesh.scale[0] *= s;
        this.mesh.scale[1] *= s;
        glBufferOps.GlSetScale(this.gfxInfo, this.mesh.scale);
    }
    ScaleFromVal(val) {
        this.mesh.scale[0] *= val;
        this.mesh.scale[1] *= val;
        glBufferOps.GlSetScale(this.gfxInfo, this.mesh.scale);
        // Also set dim to mirror the scale
        this.mesh.dim[0] *= val;
        this.mesh.dim[1] *= val;
    }
    StoreDefPos(pos) {
        math.CopyArr2(this.mesh.defPos, pos);
    }

}
export class TextGeometry2D extends Geometry2D {

    numChars;
    fontSize;

    constructor(pos, fontSize, scale, text) {
        const dim = [fontSize, fontSize];
        super(pos, dim, scale);
        this.numChars = text.length;
    }

    //////////////////////////////////////////////////////////////
    AddToGraphicsBuffer(sid, gfx, meshName) {
        
        const charPos = [0, 0, 0];
        charPos[0] = this.pos[0];
        charPos[1] = this.pos[1];
        charPos[2] = this.pos[2];

        // Copy gfx
        let gfxCopy = new GfxInfoMesh(gfx);
        
        for (let i = 0; i < this.numChars; i++) {
            // console.log('====================', gfxCopy.vb.start)
            // console.log('====================', charPos)
            GlAddGeometry(sid, charPos, this.dim, this.time, gfxCopy, meshName, 1)
            gfxCopy.vb.start += gfxCopy.vb.count;
            gfxCopy.ib.start += gfxCopy.ib.count;
            charPos[0] += this.dim[0] * 2 + 4;
        }
    }
}


export class Geometry3D {

    sid;
    pos = [0, 0, 0];
    dim = [0, 0, 0];
    scale = [0, 0, 0];
    defPos = [0, 0, 0];
    defDim = [0, 0, 0];
    defScale = [0, 0, 0];
    time = 0;

    constructor(pos = [0, 0, 0], dim = [0, 0, 0], scale = [1, 1, 1]) {

        this.sid = {
            shad: 0,
            attr: (SID.ATTR.POS3 | SID.ATTR.WPOS_TIME4),
            unif: 0,
            pass: 0,
        };

        math.CopyArr3(this.pos, pos);
        math.CopyArr3(this.dim, dim);
        math.CopyArr3(this.scale, scale);

        // Keep a copy of the starting dimention and position
        math.CopyArr3(this.defDim, dim);
        math.CopyArr3(this.defScale, scale);
        math.CopyArr3(this.defPos, pos);

        /** Debug properties */
        if (DEBUG.GEOMETRY) {
            Object.defineProperty(this, 'id', { value: _geometryId++ });
            Object.defineProperty(this, 'type', { value: 'Geometry' });
        }
    }

    //////////////////////////////////////////////////////////////
    AddToGraphicsBuffer(sid, gfx, meshName) {
        GlAddGeometry(sid, this.pos, this.dim, this.time, gfx, meshName, 1)
    }

    //////////////////////////////////////////////////////////////
    SetPos(pos) {
        math.CopyArr2(this.mesh.pos, pos);
        glBufferOps.GlSetWposXY(this.gfxInfo, pos);
    }
    SetPosXY(pos) {
        math.CopyArr2(this.mesh.pos, pos);
        glBufferOps.GlSetWposXY(this.gfxInfo, pos);
    }
    SetPosX(x) {
        this.mesh.pos[0] = x;
        glBufferOps.GlSetWposX(this.gfxInfo, x);
    }
    SetPosY(y) {
        this.mesh.pos[1] = y;
        glBufferOps.GlSetWposY(this.gfxInfo, y);
    }
    UpdatePosXY() {
        glBufferOps.GlSetWposXY(this.gfxInfo, this.mesh.pos);
    }
    SetZindex(z) {
        this.mesh.pos[2] = z;
        glBufferOps.GlSetWposZ(this.gfxInfo, z);
    }
    Move(x, y) {
        this.mesh.pos[0] += x;
        this.mesh.pos[1] += y;
        GlMove(this.gfxInfo, [x, y]);
    }
    MoveX(x) {
        this.mesh.pos[0] += x;
        glBufferOps.GlMove(this.gfxInfo, [x, 0]);
    }
    MoveY(y) {
        this.mesh.pos[1] += y;
        glBufferOps.GlMove(this.gfxInfo, [0, y]);
    }
    //////////////////////////////////////////////////////////////
    SetDim(dim) {
        math.CopyArr2(this.mesh.dim, dim);
        glBufferOps.GlSetDim(this.gfxInfo, dim);
    }
    // Shrink(val) {
    //     this.mesh.dim[0] *= val;
    //     this.mesh.dim[1] *= val;
    //     glBufferOps.GlSetDim(this.gfxInfo, this.mesh.dim);
    // }
    UpdateScale() {
        glBufferOps.GlSetScale(this.gfxInfo, this.mesh.scale);
    }
    SetScale(s) {
        this.mesh.scale[0] *= s;
        this.mesh.scale[1] *= s;
        glBufferOps.GlSetScale(this.gfxInfo, this.mesh.scale);
    }
    ScaleFromVal(val) {
        this.mesh.scale[0] *= val;
        this.mesh.scale[1] *= val;
        glBufferOps.GlSetScale(this.gfxInfo, this.mesh.scale);
        // Also set dim to mirror the scale
        this.mesh.dim[0] *= val;
        this.mesh.dim[1] *= val;
    }
    StoreDefPos(pos) {
        math.CopyArr2(this.mesh.defPos, pos);
    }

}
