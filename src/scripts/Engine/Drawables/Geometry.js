"use strict";

import * as math from '../../Helpers/Math/MathOperations.js'
import * as glBufferOps from '../../Graphics/GlBufferOps.js'

let _geometryId = 0;

export class Geometry2D {

    pos; 
    dim;
    scale;
    defPos;
    defDim;
    defScale;

    constructor(pos = [0, 0, 0], dim = [0, 0], scale = [0, 0]) {

        math.CopyArr3(this.pos, pos);
        math.CopyArr2(this.dim, dim);
        math.CopyArr2(this.scale, scale);

        // Keep a copy of the starting dimention and position
        math.CopyArr2(this.defDim, dim);
        math.CopyArr2(this.defScale, scale);
        math.CopyArr3(this.defPos, pos);

        /** Debug properties */
        if(DEBUG.GEOMETRY){
            Object.defineProperty( this, 'id', { value: _geometryId++ } );
            Object.defineProperty( this, 'name', { value: 'Geometry' } );
        }
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