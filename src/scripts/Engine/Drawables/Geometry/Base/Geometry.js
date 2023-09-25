"use strict";

import * as math from '../../../../Helpers/Math/MathOperations.js'
import * as glBufferOps from '../../../../Graphics/Buffers/GlBufferOps.js'
import { GlAddGeometry } from '../../../../Graphics/Buffers/GlBuffers.js';

let _geometryId = 0;

export class Geometry2D {

    sid;
    pos = [0, 0, 0];
    dim = [0, 0];
    scale = [0, 0];
    defPos = [0, 0, 0];
    defDim = [0, 0];
    defScale = [0, 0];
    zIndex = 0;
    time = 0;
    type = 0;

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
        this.zIndex = this.pos[2];  // Store default z index value. 

        this.type |= MESH_TYPES_DBG.GEOMETRY2D;

        /** Debug properties */
        if (DEBUG.GEOMETRY) {
            Object.defineProperty(this, 'id', { value: _geometryId++ });
        }
    }

    /*******************************************************************************************************************************************************/
    // Graphics
    AddToGraphicsBuffer(sid, gfx, meshName) {
        GlAddGeometry(sid, this.pos, this.dim, this.time, gfx, meshName, 1);
    }

    SetPosXYZ(pos, gfx, numFaces=1) {
        math.CopyArr3(this.pos, pos);
        glBufferOps.GlSetWpos(gfx, pos, numFaces);
    }
    SetPosXY(pos, gfx) {
        math.CopyArr2(this.pos, pos);
        glBufferOps.GlSetWposXY(gfx, pos);
    }
    SetPosX(x, gfx) {
        this.pos[0] = x;
        glBufferOps.GlSetWposX(gfx, x);
    }
    SetPosY(y, gfx, numFaces) {
        this.pos[1] = y;
        glBufferOps.GlSetWposY(gfx, y, numFaces);
    }
    UpdatePosXYZ(gfx) {
        glBufferOps.GlSetWpos(gfx, this.pos);
    }
    UpdateFromPosXYZ(gfx, pos) {
        glBufferOps.GlSetWpos(gfx, pos);
    }
    UpdatePosXY(gfx) {
        glBufferOps.GlSetWposXY(gfx, this.pos);
    }
    SetDefaultPosXY(gfx){
        math.CopyArr2(this.pos, this.defPos)
        glBufferOps.GlSetWposXY(gfx, this.defPos);
    }
    SetZindex(z, gfx, numFaces) {
        this.pos[2] = z;
        glBufferOps.GlSetWposZ(gfx, z, numFaces);
    }
    MoveXYZ(pos, gfx, num_faces) {
        /** DEBUG */ if(pos.length !== 3) console.error('Wrong array dimention for position xyz. @ class Geometry2D, Geometry.js')
        math.AddArr3(this.pos, pos);
        glBufferOps.GlMoveXYZ(gfx, pos, num_faces);
    }
    MoveXY(x, y, gfx, num_faces) {
        this.pos[0] += x;
        this.pos[1] += y;
        glBufferOps.GlMoveXY(gfx, [x, y], num_faces);
    }
    MoveX(x, gfx) {
        this.pos[0] += x;
        glBufferOps.GlMoveXY(gfx, [x, 0]);
    }
    MoveY(y, gfx) {
        this.pos[1] += y;
        glBufferOps.GlMoveXY(gfx, [0, y]);
    }
    //////////////////////////////////////////////////////////////
    SetDim(dim, gfx) {
        math.CopyArr2(this.dim, dim);
        glBufferOps.GlSetDim(gfx, dim);
    }
    UpdateDim(gfx) {
        glBufferOps.GlSetDim(gfx, this.dim);
    }
    UpdateScale() {
        glBufferOps.GlSetScale(gfx, this.scale);
    }
    SetScale(s) {
        this.scale[0] *= s;
        this.scale[1] *= s;
        glBufferOps.GlSetScale(gfx, this.scale);
    }
    ScaleFromVal(val) {
        this.scale[0] *= val;
        this.scale[1] *= val;
        glBufferOps.GlSetScale(gfx, this.scale);
        // Also set dim to mirror the scale
        this.dim[0] *= val;
        this.dim[1] *= val;
    }
    StoreDefPos(pos) {
        math.CopyArr2(this.defPos, pos);
    }
}


export class Geometry3D {

    sid;
    pos   = [0, 0, 0];
    dim   = [0, 0, 0];
    scale = [0, 0, 0];
    time  = 0;
    zIndex = 0;
    type;

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
        this.zIndex = this.pos[2]; // Store default z index value. 

        this.type |= MESH_TYPES_DBG.GEOMETRY3D;

        /** Debug properties */
        if (DEBUG.GEOMETRY) {
            Object.defineProperty(this, 'id', { value: _geometryId++ });
        }
    }

    //////////////////////////////////////////////////////////////
    SetPos(pos, gfx) {
        math.CopyArr3(this.pos, pos);
        glBufferOps.GlSetWposXY(gfx, pos);
    }
    SetPosXY(pos, gfx) {
        math.CopyArr2(this.pos, pos);
        glBufferOps.GlSetWposXY(gfx, pos);
    }
    SetPosX(x, gfx) {
        this.pos[0] = x;
        glBufferOps.GlSetWposX(gfx, x);
    }
    SetPosY(y) {
        this.pos[1] = y;
        glBufferOps.GlSetWposY(gfx, y);
    }
    UpdatePosXY() {
        glBufferOps.GlSetWposXY(gfx, this.pos);
    }
    SetZindex(z) {
        this.pos[2] = z;
        glBufferOps.GlSetWposZ(gfx, z);
    }
    MoveXY(x, y) {
        this.pos[0] += x;
        this.pos[1] += y;
        GlMoveXY(gfx, [x, y]);
    }
    MoveX(x) {
        this.pos[0] += x;
        glBufferOps.GlMoveXY(gfx, [x, 0]);
    }
    MoveY(y) {
        this.pos[1] += y;
        glBufferOps.GlMoveXY(gfx, [0, y]);
    }
    //////////////////////////////////////////////////////////////
    SetDim(dim) {
        math.CopyArr2(this.dim, dim);
        glBufferOps.GlSetDim(gfx, dim);
    }
    UpdateScale() {
        glBufferOps.GlSetScale(gfx, this.scale);
    }
    SetScale(s) {
        this.scale[0] *= s;
        this.scale[1] *= s;
        glBufferOps.GlSetScale(gfx, this.scale);
    }
    ScaleFromVal(val) {
        this.scale[0] *= val;
        this.scale[1] *= val;
        glBufferOps.GlSetScale(gfx, this.scale);
        // Also set dim to mirror the scale
        this.dim[0] *= val;
        this.dim[1] *= val;
    }
    StoreDefPos(pos) {
        math.CopyArr2(this.defPos, pos);
    }
}

