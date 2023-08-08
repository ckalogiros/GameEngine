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
    MoveXYConcecutive(x, y, gfx, numMeshes) {
        math.CopyArr2(this.pos, [x, y]);
        glBufferOps.GlMoveXYConcecutive(gfx, [x, y], numMeshes);
    }

    SetPosXY(pos) {
        math.CopyArr2(this.pos, pos);
        glBufferOps.GlSetWposXY(this.gfx, pos);
    }
    SetPosX(x) {
        this.pos[0] = x;
        glBufferOps.GlSetWposX(this.gfx, x);
    }
    SetPosY(y) {
        this.pos[1] = y;
        glBufferOps.GlSetWposY(this.gfx, y);
    }
    UpdatePosXY() {
        glBufferOps.GlSetWposXY(this.gfx, this.pos);
    }
    SetZindex(z) {
        this.pos[2] = z;
        glBufferOps.GlSetWposZ(this.gfx, z);
    }
    Move(x, y, gfx) {
        this.pos[0] += x;
        this.pos[1] += y;
        glBufferOps.GlMove(gfx, [x, y]);
    }
    MoveX(x, gfx) {
        this.pos[0] += x;
        glBufferOps.GlMove(this.gfx, [x, 0]);
    }
    MoveY(y, gfx) {
        this.pos[1] += y;
        glBufferOps.GlMove(this.gfx, [0, y]);
    }
    //////////////////////////////////////////////////////////////
    SetDim(dim, gfx) {
        math.CopyArr2(this.dim, dim);
        glBufferOps.GlSetDim(gfx, dim);
    }
    UpdateDim(gfx) {
        glBufferOps.GlSetDim(gfx, this.dim);
    }
    // Shrink(val) {
    //     this.dim[0] *= val;
    //     this.dim[1] *= val;
    //     glBufferOps.GlSetDim(this.gfx, this.dim);
    // }
    UpdateScale() {
        glBufferOps.GlSetScale(this.gfx, this.scale);
    }
    SetScale(s) {
        this.scale[0] *= s;
        this.scale[1] *= s;
        glBufferOps.GlSetScale(this.gfx, this.scale);
    }
    ScaleFromVal(val) {
        this.scale[0] *= val;
        this.scale[1] *= val;
        glBufferOps.GlSetScale(this.gfx, this.scale);
        // Also set dim to mirror the scale
        this.dim[0] *= val;
        this.dim[1] *= val;
    }
    StoreDefPos(pos) {
        math.CopyArr2(this.defPos, pos);
    }

    //////////////////////////////////////////////////////////////
    // Listener_listen_mouse_hover(){
    //     const rect = [
    //         // Left  Right 
    //         [ this.pos[0] - this.dim[0], this.pos[0] + this.dim[0], ],
    //         // Top  Bottom
    //         [ this.pos[1] - this.dim[1], this.pos[1] + this.dim[1], ],
    //     ];
    //     const mousePos = MouseGetMousePos();
    //     const point = [
    //         mousePos.x,
    //         mousePos.y,
    //     ];
    //     return Collision_PointRect(point, rect);
    // }

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
        math.CopyArr3(this.pos, pos);
        glBufferOps.GlSetWposXY(gfx, pos);
    }
    SetPosXY(pos, gfx) {
        math.CopyArr2(this.pos, pos);
        glBufferOps.GlSetWposXY(this.gfx, pos);
    }
    SetPosX(x, gfx) {
        this.pos[0] = x;
        glBufferOps.GlSetWposX(this.gfx, x);
    }
    SetPosY(y) {
        this.pos[1] = y;
        glBufferOps.GlSetWposY(this.gfx, y);
    }
    UpdatePosXY() {
        glBufferOps.GlSetWposXY(this.gfx, this.pos);
    }
    SetZindex(z) {
        this.pos[2] = z;
        glBufferOps.GlSetWposZ(this.gfx, z);
    }
    Move(x, y) {
        this.pos[0] += x;
        this.pos[1] += y;
        GlMove(this.gfx, [x, y]);
    }
    MoveX(x) {
        this.pos[0] += x;
        glBufferOps.GlMove(this.gfx, [x, 0]);
    }
    MoveY(y) {
        this.pos[1] += y;
        glBufferOps.GlMove(this.gfx, [0, y]);
    }
    //////////////////////////////////////////////////////////////
    SetDim(dim) {
        math.CopyArr2(this.dim, dim);
        glBufferOps.GlSetDim(this.gfx, dim);
    }
    // Shrink(val) {
    //     this.dim[0] *= val;
    //     this.dim[1] *= val;
    //     glBufferOps.GlSetDim(this.gfx, this.dim);
    // }
    UpdateScale() {
        glBufferOps.GlSetScale(this.gfx, this.scale);
    }
    SetScale(s) {
        this.scale[0] *= s;
        this.scale[1] *= s;
        glBufferOps.GlSetScale(this.gfx, this.scale);
    }
    ScaleFromVal(val) {
        this.scale[0] *= val;
        this.scale[1] *= val;
        glBufferOps.GlSetScale(this.gfx, this.scale);
        // Also set dim to mirror the scale
        this.dim[0] *= val;
        this.dim[1] *= val;
    }
    StoreDefPos(pos) {
        math.CopyArr2(this.defPos, pos);
    }

v

}

