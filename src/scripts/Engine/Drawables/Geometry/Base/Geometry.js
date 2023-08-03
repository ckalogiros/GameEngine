"use strict";

import * as math from '../../../../Helpers/Math/MathOperations.js'
import * as glBufferOps from '../../../../Graphics/Buffers/GlBufferOps.js'
import { GlAddGeometry} from '../../../../Graphics/Buffers/GlBuffers.js';
import { Collision_PointRect } from '../../../Collisions.js';
import { MouseGetMousePos } from '../../../Controls/Input/Mouse.js';

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

        this.type |= MESH_TYPES.GEOMETRY2D;

        /** Debug properties */
        if (DEBUG.GEOMETRY) {
            Object.defineProperty(this, 'id', { value: _geometryId++ });
            // Object.defineProperty(this, 'type', { value: 'Geometry' });
        }
    }

    //////////////////////////////////////////////////////////////
    AddToGraphicsBuffer(sid, gfx, meshName) {
        GlAddGeometry(sid, this.pos, this.dim, this.time, gfx, meshName, 1)
        // GlHandlerAddGeometryBuffer(sid, this.time, gfx, meshName, this.pos, this.dim)
    }

    //////////////////////////////////////////////////////////////
    SetPos(pos, gfx) {
        math.CopyArr3(this.pos, pos);
        glBufferOps.GlSetWposXY(gfx, pos);
    }
    MoveXYConcecutive(pos, gfx, numMeshes) {
        math.CopyArr2(this.pos, pos);
        glBufferOps.GlMoveXYConcecutive(gfx, pos,numMeshes);
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

    //////////////////////////////////////////////////////////////
    CheckHover(){
        const rect = [
            // Left  Right 
            [ this.pos[0] - this.dim[0], this.pos[0] + this.dim[0], ],
            // Top  Bottom
            [ this.pos[1] - this.dim[1], this.pos[1] + this.dim[1], ],
        ];
        const mousePos = MouseGetMousePos();
        const point = [
            mousePos.x,
            mousePos.y,
        ];
        return Collision_PointRect(point, rect);
    }

}


export class Geometry3D {

    sid;

    pos   = [0, 0, 0];
    dim   = [0, 0, 0];
    scale = [0, 0, 0];
    time  = 0;
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

        this.type |= MESH_TYPES.GEOMETRY3D;

        /** Debug properties */
        if (DEBUG.GEOMETRY) {
            Object.defineProperty(this, 'id', { value: _geometryId++ });
            // Object.defineProperty(this, 'type', { value: 'Geometry' });
        }
    }

    //////////////////////////////////////////////////////////////
    // AddToGraphicsBuffer(sid, gfx, meshName) {
    //     // GlAddGeometry(sid, this.pos, this.dim, this.time, gfx, meshName, 1)

    // }

    //////////////////////////////////////////////////////////////
    SetPos(pos, gfx) {
        math.CopyArr3(this.mesh.pos, pos);
        glBufferOps.GlSetWposXY(gfx, pos);
    }
    SetPosXY(pos, gfx) {
        math.CopyArr2(this.mesh.pos, pos);
        glBufferOps.GlSetWposXY(this.gfxInfo, pos);
    }
    SetPosX(x, gfx) {
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

v

}

