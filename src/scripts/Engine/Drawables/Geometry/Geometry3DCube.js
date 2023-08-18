"use strict";

import { GlHandlerAddGeometryBuffer, GlHandlerAddIndicesBuffer } from "../../../Graphics/Buffers/GlBuffers.js";
import { Geometry3D } from "./Base/Geometry.js";



export class CubeGeometry extends Geometry3D {
    
    faces; // TODO: Bad name, Rename this.

    constructor(pos, dim, scale) {

        super(pos, dim, scale);

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

        this.type |= MESH_TYPES_DBG.CUBE_GEOMETRY;
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

        
        
        let counters = {
            cntPos:0, cntNorm:0, cntUv:0, indicesStart: gfx.ib.count,
        };

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



////////////////////////////////////////////////////////////////////////////////////////////////


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

    /**
     'x', 'z', 'y',  1,  1, width, depth,   height, 
        'x', 'y', 'z', -1, -1, width, height, -depth,  
        'x', 'z', 'y',  1, -1, width, depth,  -height, 
        'x', 'y', 'z',  1, -1, width, height,  depth,  
        'z', 'y', 'x', -1, -1, depth, height,  width, 
        'z', 'y', 'x',  1, -1, depth, height, -width, 
        */