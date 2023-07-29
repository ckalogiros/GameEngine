"use strict";

import * as math from '../../Helpers/Math/MathOperations.js'
import * as glBufferOps from '../../Graphics/Buffers/GlBufferOps.js'
import { GlAddGeometry, GlHandlerAddGeometryBuffer, GlHandlerAddIndicesBuffer } from '../../Graphics/Buffers/GlBuffers.js';

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

}


export class Geometry3D {

    sid;

    pos   = [0, 0, 0];
    dim   = [0, 0, 0];
    scale = [0, 0, 0];
    time  = 0;

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

        /** Debug properties */
        if (DEBUG.GEOMETRY) {
            Object.defineProperty(this, 'id', { value: _geometryId++ });
            Object.defineProperty(this, 'type', { value: 'Geometry' });
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

}

export class CubeGeometry extends Geometry3D {
    
    faces; // TODO: Bad nam, Rename this.

    constructor(pos, dim, scale) {
        super(pos, dim, scale);
        // this.faces = [
        //     // Front 
        //     -1,  1, 1, // v1
        //     -1, -1, 1, // v2
        //      1,  1, 1, // v3
        //      1, -1, 1, // v4
        //      // Left
        //      -1,  1, -1,
        //      -1, -1, -1,
        //      -1,  1,  1,
        //      -1, -1,  1,
        //      // Back
        //      -1,  1, -1,
        //      -1, -1, -1,
        //       1,  1, -1,
        //       1, -1, -1,
        //     // Right
        //      1,  1, -1,
        //      1, -1, -1,
        //      1,  1,  1,
        //      1, -1,  1,
        //     // Top
        //     -1, 1,  1,
        //     -1, 1, -1,
        //      1, 1,  1,
        //      1, 1, -1,
        //     // Bottom
        //     -1, -1,  1,
        //     -1, -1, -1,
        //      1, -1,  1,
        //      1, -1, -1,
        // ];
        // this.faces = [
        //     // Front 
        //     -1,  1, 1, // v1
        //     -1, -1, 1, // v2
        //      1,  1, 1, // v3
        //      1, -1, 1, // v4
        //      // Right
        //      1, -1,  1,
        //      1, -1, -1,
        //      1,  1,  1,
        //      1,  1, -1,
        //      // Back
        //      -1,  1, -1,
        //      -1, -1, -1,
        //      1,  1, -1,
        //      1, -1, -1,
        //      // Left
        //      -1, -1,  1,
        //      -1, -1, -1,
        //      -1,  1,  1,
        //      -1,  1, -1,
        //     // Top
        //     -1, 1,  1,
        //     -1, 1, -1,
        //      1, 1,  1,
        //      1, 1, -1,
        //     // Bottom
        //     -1, -1,  1,
        //     -1, -1, -1,
        //      1, -1,  1,
        //      1, -1, -1,
        // ];
        this.faces = [
            // Face Front
            -.5,  .5, .5, // v1
            -.5, -.5, .5, // v2
             .5,  .5, .5, // v3
             .5, -.5, .5, // v4
             
             // Face Left
             -.5, -.5, .5, // v1
             -.5, -.5,-.5, // v2
             -.5,  .5, .5, // v3
             -.5,  .5,-.5, // v4
             
             // Face Back
             -.5,  .5, -.5, // v1
             -.5, -.5, -.5, // v2
             .5,  .5, -.5, // v3
             .5, -.5, -.5, // v4
             
             // Face Right
             .5,-.5, .5, // v1
             .5,-.5,-.5, // v2
             .5, .5, .5, // v3
             .5, .5,-.5, // v4
            
            // Face Top
            -.5,  .5,  .5, // v1
            -.5,  .5, -.5, // v2
             .5,  .5,  .5, // v3
             .5,  .5, -.5, // v4
            
            // Face Bottom
            -.5, -.5,  .5, // v1
            -.5, -.5, -.5, // v2
             .5, -.5,  .5, // v3
             .5, -.5, -.5, // v4
        ];
    }

    AddToGraphicsBuffer(sid, gfx, meshName) {
        /**
            front          right          top
            -x  y  z        x  y -z       -x  y  z   
            -x -y  z        x -y -z       -x  y -z   
             x  y  z        x  y  z        x  y  z   
             x -y  z        x -y  z        x  y -z   
            back           left           bottom
            -x  y -z       -x  y -z       -x -y  z   
            -x -y -z       -x -y -z       -x -y  z   
             x  y -z       -x  y  z        x -y  z   
             x -y -z       -x -y  z        x -y  z   
        */

        

        // TODO: Calculate the number of attributes for the buffers
        const vertexPos = new Float32Array(72); // localy allocated mem space for creating vertex positions from meshes.
        // TODO: Calculate the number of indices for the buffer
        const indexBuffer = new Int32Array(6*6); // localy allocated mem space for creating vertex positions from meshes.
        
        const x = this.dim[0], y = this.dim[1], z = this.dim[2];
        let i = 0; // 
        const len = this.faces.length;
        while (i<len){
            vertexPos[i] = this.faces[i++] * x;
            vertexPos[i] = this.faces[i++] * y;
            vertexPos[i] = this.faces[i++] * z;
        }
        // {
        //     i=0;
        //     // Face Front
        //     vertexPos[i++] = -x; vertexPos[i++] =  y; vertexPos[i++] =  z; // v1
        //     vertexPos[i++] = -x; vertexPos[i++] = -y; vertexPos[i++] =  z; // v2
        //     vertexPos[i++] =  x; vertexPos[i++] =  y; vertexPos[i++] =  z; // v3
        //     vertexPos[i++] =  x; vertexPos[i++] = -y; vertexPos[i++] =  z; // v4
            
        //     // Face Right
        //     vertexPos[i++] =  x; vertexPos[i++] = -y; vertexPos[i++] =  z; // v1
        //     vertexPos[i++] =  x; vertexPos[i++] = -y; vertexPos[i++] = -z; // v2
        //     vertexPos[i++] =  x; vertexPos[i++] =  y; vertexPos[i++] =  z; // v3
        //     vertexPos[i++] =  x; vertexPos[i++] =  y; vertexPos[i++] = -z; // v4
            
        //     // Face Back
        //     vertexPos[i++] = -x; vertexPos[i++] =  y; vertexPos[i++] = -z; // v1
        //     vertexPos[i++] = -x; vertexPos[i++] = -y; vertexPos[i++] = -z; // v2
        //     vertexPos[i++] =  x; vertexPos[i++] =  y; vertexPos[i++] = -z; // v3
        //     vertexPos[i++] =  x; vertexPos[i++] = -y; vertexPos[i++] = -z; // v4
            
        //     // Face Left
        //     vertexPos[i++] = -x; vertexPos[i++] = -y; vertexPos[i++] =  z; // v1
        //     vertexPos[i++] = -x; vertexPos[i++] = -y; vertexPos[i++] = -z; // v2
        //     vertexPos[i++] = -x; vertexPos[i++] =  y; vertexPos[i++] =  z; // v3
        //     vertexPos[i++] = -x; vertexPos[i++] =  y; vertexPos[i++] = -z; // v4
            
        //     // Face Top
        //     vertexPos[i++] = -x; vertexPos[i++] =  y; vertexPos[i++] =  z; // v1
        //     vertexPos[i++] = -x; vertexPos[i++] =  y; vertexPos[i++] = -z; // v2
        //     vertexPos[i++] =  x; vertexPos[i++] =  y; vertexPos[i++] =  z; // v3
        //     vertexPos[i++] =  x; vertexPos[i++] =  y; vertexPos[i++] = -z; // v4
            
        //     // Face Bottom
        //     vertexPos[i++] = -x; vertexPos[i++] = -y; vertexPos[i++] =  z; // v1
        //     vertexPos[i++] = -x; vertexPos[i++] = -y; vertexPos[i++] = -z; // v2
        //     vertexPos[i++] =  x; vertexPos[i++] = -y; vertexPos[i++] =  z; // v3
        //     vertexPos[i++] =  x; vertexPos[i++] = -y; vertexPos[i++] = -z; // v4
        // }
        
        
        let counters = {
            cntPos:0, cntNorm:0, cntUv:0, indicesStart: gfx.ib.count,
        };
        /**
         'x', 'z', 'y',  1,  1, width, depth,   height, 
         'x', 'y', 'z', -1, -1, width, height, -depth,  
         'x', 'z', 'y',  1, -1, width, depth,  -height, 
         'x', 'y', 'z',  1, -1, width, height,  depth,  
         'z', 'y', 'x', -1, -1, depth, height,  width, 
         'z', 'y', 'x',  1, -1, depth, height, -width, 
        //  */
        // counters = this.CreateFace( 0, 2, 1, 1, 1, this.dim[0], this.dim[2], this.dim[1], 1, 1, {vertexPos:vertexPos, normal:null, uv:null, index:indexBuffer}, counters); // Front face
        // counters = this.CreateFace( 0, 1, 2, 1, 1, this.dim[2], this.dim[1], this.dim[0], 1, 1, {vertexPos:vertexPos, normal:null, uv:null, index:indexBuffer}, counters ); // Front face
        // counters = this.CreateFace( 0, 1, 2, 1, 1, this.dim[1], this.dim[0], this.dim[2], 1, 1, {vertexPos:vertexPos, normal:null, uv:null, index:indexBuffer}, counters); // Front face
        // counters = this.CreateFace( 0, 1, 2, 1, 1, this.dim[1], this.dim[2], this.dim[0], 1, 1, {vertexPos:vertexPos, normal:null, uv:null, index:indexBuffer}, counters ); // Front face
        gfx.numFaces++;
        gfx.numFaces++;
        gfx.numFaces++;
        gfx.numFaces++;
        gfx.numFaces++;
        console.log('counters', counters);
        console.log('vertexPos:', vertexPos)
        
        gfx.vb.count = counters.cntPos + counters.cntNorm + counters.cntUv;

        // Add buffers to the vertexBuffer
        GlHandlerAddGeometryBuffer(sid, gfx, meshName, this.pos, vertexPos)

        // const indexBuffer = CreateIndices();
        GlHandlerAddIndicesBuffer(gfx, indexBuffer)

    }

    CreateFace(xx, yy, zz, udir, vdir, width, height, depth, gridX, gridY, buffers, counters ) {

        /** */ // From THREE.js
        const segmentWidth  = width / gridX;
        const segmentHeight = height / gridY;

        const widthHalf  = width  / 2;
        const heightHalf = height / 2;
        const depthHalf  = depth  / 2;

        const gridX1 = gridX + 1;
        const gridY1 = gridY + 1;

        let vertexCounter = 0;

        const vertexPos = buffers.vertexPos;
        const normals   = buffers.normal;
        const uvs       = buffers.uv;

        // Continue building the cube by adding vertex attributes continuing from previous face
        let cntPos = counters.cntPos, 
            cntNorm = counters.cntNorm, 
            cntUv = counters.cntUv, 
            indicesStart = counters.indicesStart;
        
        // generate vertices, normals and uvs
        for ( let iy = 0; iy < gridY1; iy ++ ) {

            const y = iy * segmentHeight - heightHalf;

            for ( let ix = 0; ix < gridX1; ix ++ ) {

                const x = ix * segmentWidth - widthHalf;

                // set values to correct vertexPos component
                vertexPos[ cntPos+xx ] = x * udir; 
                vertexPos[ cntPos+yy ] = y * vdir;
                vertexPos[ cntPos+zz ] = depthHalf;
                console.log(`${vertexPos[ cntPos+xx ]}, ${vertexPos[ cntPos+yy ]}, ${vertexPos[ cntPos+zz ]}`)
                
                if(normals){
                    // set values to correct vertexPos component
                    normals[ cntNorm++ ]   = 0;
                    normals[ cntNorm++ ] = 0;
                    normals[ cntNorm++ ] = depth > 0 ? 1 : - 1;
                }
                
                if(uvs){
                    // uvs
                    uvs[cntUv++] = ix / gridX;
                    uvs[cntUv++] = 1 - ( iy / gridY );
                }
                cntPos += 3;
                vertexCounter++;
                
            }
            
        }
        
        console.log()
        // indices
        const indexBuffer = buffers.index;
        let cnt = indicesStart;
        // 1. you need three indices to draw a single face
        // 2. a single segment consists of two faces
        // 3. so we need to generate six (2*3) indices per segment
        // for ( let iy = 0; iy < gridY; iy ++ ) {

        //     for ( let ix = 0; ix < gridX; ix ++ ) {

        //         const a = indicesStart + ix + gridX1 * iy;
        //         const b = indicesStart + ix + gridX1 * ( iy + 1 );
        //         const c = indicesStart + ( ix + 1 ) + gridX1 * ( iy + 1 );
        //         const d = indicesStart + ( ix + 1 ) + gridX1 * iy;
        //         // faces
        //         indexBuffer[cnt++] = a;
        //         indexBuffer[cnt++] = b;
        //         indexBuffer[cnt++] = d;
        //         indexBuffer[cnt++] = b;
        //         indexBuffer[cnt++] = c;
        //         indexBuffer[cnt++] = d;
        //         // indices.push( a, b, d );
        //         // indices.push( b, c, d );
        //         // increase counter
        //         // groupCount += 6;
        //         indicesStart += 6;
        //     }
        // }

        const offset = 4;
        let k = indicesStart;

    
        for (let i = 0; i < 1; ++i) {
    
            for (let j = 0; j < 2; j++) {
    
                indexBuffer[cnt++] = k + j;
                indexBuffer[cnt++] = k + j + 1;
                indexBuffer[cnt++] = k + j + 2;
            }
    
            k += offset;
            indicesStart += offset;
        }

        // // add a group to the geometry. this will ensure multi material support
        // scope.addGroup( groupStart, groupCount, materialIndex );
        // // calculate new start value for groups
        // groupStart += groupCount;
        // // update total number of vertices
        // numberOfVertices += vertexCounter;
        // console.log('indexBuffer', indexBuffer)
        return {cntPos:cntPos, cntNorm:cntNorm, cntUv:cntUv, indicesStart:indicesStart,}
    }
    // CreateFace( udir, vdir, width, height, depth, gridX, gridY ) {

    //     /** */ // From THREE.js
    //     const segmentWidth = width / gridX;
    //     const segmentHeight = height / gridY;

    //     const widthHalf = width / 2;
    //     const heightHalf = height / 2;
    //     const depthHalf = depth / 2;

    //     const gridX1 = gridX + 1;
    //     const gridY1 = gridY + 1;

    //     let vertexCounter = 0;

    //     const vertexPos = new Float32Array(gridY1 * gridX1 * 3);
    //     const normals = new Float32Array(gridY1 * gridX1 * 3);
    //     const uvs = new Float32Array(gridY1 * gridX1 * 2);


    //     // generate vertices, normals and uvs
    //     for ( let iy = 0; iy < gridY1; iy ++ ) {

    //         const y = iy * segmentHeight - heightHalf;

    //         for ( let ix = 0; ix < gridX1; ix ++ ) {

    //             const x = ix * segmentWidth - widthHalf;

    //             // set values to correct vertexPos component
    //             vertexPos[ iy+ix ]   = x * udir;
    //             vertexPos[ iy+ix+1 ] = y * vdir;
    //             vertexPos[ iy+ix+2 ] = depthHalf;

    //             // set values to correct vertexPos component
    //             normals[ iy+ix ]   = 0;
    //             normals[ iy+ix+1 ] = 0;
    //             normals[ iy+ix+2 ] = depth > 0 ? 1 : - 1;

    //             // uvs
    //             uvs[iy+ix] = ix / gridX;
    //             uvs[iy+ix+1] = 1 - ( iy / gridY );iy+ix+
    //             // counters
    //             vertexCounter ++;

    //         }

    //     }

    //     console.log('vertexPos', vertexPos)
    //     console.log('normals', normals)
    //     console.log('uvs', uvs)

    //     // indices
    //     // 1. you need three indices to draw a single face
    //     // 2. a single segment consists of two faces
    //     // 3. so we need to generate six (2*3) indices per segment
    //     // for ( let iy = 0; iy < gridY; iy ++ ) {

    //     //     for ( let ix = 0; ix < gridX; ix ++ ) {

    //     //         const a = numberOfVertices + ix + gridX1 * iy;
    //     //         const b = numberOfVertices + ix + gridX1 * ( iy + 1 );
    //     //         const c = numberOfVertices + ( ix + 1 ) + gridX1 * ( iy + 1 );
    //     //         const d = numberOfVertices + ( ix + 1 ) + gridX1 * iy;
    //     //         // faces
    //     //         indices.push( a, b, d );
    //     //         indices.push( b, c, d );
    //     //         // increase counter
    //     //         groupCount += 6;
    //     //     }
    //     // }

    //     // // add a group to the geometry. this will ensure multi material support
    //     // scope.addGroup( groupStart, groupCount, materialIndex );
    //     // // calculate new start value for groups
    //     // groupStart += groupCount;
    //     // // update total number of vertices
    //     // numberOfVertices += vertexCounter;

    // }

}
