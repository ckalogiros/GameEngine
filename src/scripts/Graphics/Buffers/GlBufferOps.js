"use strict";

import { GetSign } from "../../Helpers/Helpers.js";
import { Rotate4x4, RotateZ, RotateY3D, RotateZ3D, RotateX3D, MatrixAdd } from "../../Helpers/Math/Matrix.js";
import { GlGetPrograms, GlGetVB } from "../GlProgram.js";



export function GlSetPriority(progIdx, vbIdx, meshIdx, meshCount) {
    const vb = GlGetVB(progIdx, vbIdx);

    const meshStart = vb.meshes[meshIdx].vb.start;
    const meshSize = vb.meshes[meshIdx].vb.count;
    const allmeshCount = vb.meshes.length;

    const temp = new Array(meshCount);
    let c = meshStart;
    for (let i = 0; i < meshCount; i++) {
        temp[i] = new Float32Array(meshSize);
        for (let j = 0; j < meshSize; j++) {
            temp[i][j] = vb.data[c];
            c++;
        }
    }

    /**
     *	'Slide' all other meshes to the left by one mesh
     */
    let start = vb.meshes[meshIdx].vb.start;
    let k = start;
    let meshNewIdx = meshIdx;

    for (let i = meshIdx + meshCount; i < allmeshCount; i++) {
        const newStart = vb.meshes[i].vb.start;
        // const newStart = i*meshSize;
        const newSize = vb.meshes[i].vb.count;
        for (let j = newStart; j < newStart + newSize; j++) {
            vb.data[k] = vb.data[j];
            k++;
        }
        vb.meshes[i].vb.start = start;
        vb.meshes[i].meshIdx = meshNewIdx; // Update the meshe's index
        meshNewIdx++;
        start = k; // Keep the start of current mesh as the next's iteration previus meshe's start
    }

    /**
     *  Finally add the mesh at the end of the vertexBuffer
     */
    let cnt = start;
    for (let i = 0; i < meshCount; i++) {
        for (let j = 0; j < meshSize; j++) {
            vb.data[cnt] = temp[i][j];
            cnt++;
        }
        vb.meshes[meshIdx + i].vb.start = start;
        vb.meshes[meshIdx + i].meshIdx = meshNewIdx; // Update the meshe's index
        start = cnt;
    }
}

/** * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * *
 * Functions to add meshe data to the vertex buffer.
 * 
 * @param {*} vb : The vertex buffer reference
 * @param {*} start : The starting index for the mesh in the vertex buffer
 * @param {*} count : The number of vertices * number of attributes per vertex
 * @param {*} stride : The distance (in elements) from vertex to next vertex. 
 */

export function VbSetAttribColPerVertex(vb, start, count, stride, col, numFaces) {

    if (!Array.isArray(col[0])) {
        console.error('col should be an array of vec4 colors. @ GlBufferOps.js')
    }

    let index = start;
    const end = start + (count * numFaces);
    let k = 0;

    while (index < end) {

        vb.data[index++] = col[k][0];
        vb.data[index++] = col[k][1];
        vb.data[index++] = col[k][2];
        vb.data[index++] = col[k][3];

        index += stride;
        vb.count += V_COL_COUNT;
        k++;
        if (k >= 4) k = 0;
    }
}
export function VbSetAttribCol(vb, start, count, stride, col, numFaces) {

    let index = start;
    const end = start + (count * numFaces);

    while (index < end) {

        vb.data[index++] = col[0];
        vb.data[index++] = col[1];
        vb.data[index++] = col[2];
        vb.data[index++] = col[3];

        index += stride;
        vb.count += V_COL_COUNT;
    }
}
export function VbSetAttribPos(vb, start, count, stride, dim, numFaces) {

    let index = start;
    const end = start + (count * numFaces);

    while (index < end) {

        vb.data[index++] = -dim[0];
        vb.data[index++] = dim[1];
        index += stride;

        vb.data[index++] = -dim[0];
        vb.data[index++] = -dim[1];
        index += stride;

        vb.data[index++] = dim[0];
        vb.data[index++] = dim[1];
        index += stride;

        vb.data[index++] = dim[0];
        vb.data[index++] = -dim[1];
        index += stride;

        vb.count += V_POS_COUNT * VERTS_PER_RECT_INDEXED;
    }
}
export function VbSetAttribTex(vb, start, count, stride, tex, numFaces) {

    let index = start;
    const end = start + (count * numFaces);

    while (index < end) {

        vb.data[index++] = tex[0];
        vb.data[index++] = tex[3];
        index += stride;

        vb.data[index++] = tex[0];
        vb.data[index++] = tex[2];
        index += stride;

        vb.data[index++] = tex[1];
        vb.data[index++] = tex[3];
        index += stride;

        vb.data[index++] = tex[1];
        vb.data[index++] = tex[2];
        index += stride;

        vb.count += V_TEX_COUNT * VERTS_PER_RECT_INDEXED;
    }
}
export function VbSetAttribWpos(vb, start, count, stride, pos, numFaces) {

    let index = start;
    const end = start + (count * numFaces);

    while (index < end) {

        vb.data[index++] = pos[0];
        vb.data[index++] = pos[1];
        vb.data[index++] = pos[2];

        index += stride;
        vb.count += V_WPOS_TIME_COUNT;
    }
}
export function VbSetAttrSdf(vb, start, count, stride, sdfParams) {

    let index = start;
    const end = start + count;

    while (index < end) {

        vb.data[index++] = sdfParams[0];
        vb.data[index++] = sdfParams[1];

        index += stride;
        vb.count += V_SDF_COUNT;
    }
}
export function VbSetAttrStyle(vb, start, count, stride, style) {

    let index = start;
    const end = start + count;

    while (index < end) {

        vb.data[index++] = style[0];
        vb.data[index++] = style[1];
        vb.data[index++] = style[2];

        index += stride;
        vb.count += V_STYLE_COUNT;
    }
}
export function VbSetAttrRoundCorner(vb, start, count, stride, radius, numFaces) {

    let index = start;
    const end = start + (count * numFaces);

    while (index < end) {

        vb.data[index++] = radius;

        index += stride;
        vb.count++; // for the rest style attributes
    }
}
export function VbSetAttrBorderWidth(vb, start, count, stride, border, numFaces) {

    let index = start;
    const end = start + (count * numFaces);

    while (index < end) {

        vb.data[index++] = border;

        index += stride;
        vb.count++; // for the rest style attributes
    }
}
export function VbSetAttrBorderFeather(vb, start, count, stride, feather, numFaces) {

    let index = start;
    const end = start + (count * numFaces);

    while (index < end) {

        vb.data[index++] = feather;

        index += stride;
        vb.count++; // for the rest style attributes
    }
}
export function VbSetAttrTime(vb, start, count, stride, time, numFaces) {

    let index = start;
    const end = start + (count * numFaces);

    while (index < end) {

        vb.data[index++] = time;

        index += stride;
        // The vb.count has already be incremented in VbSetAttribWpos() with WPOS_TIME4_COUNT 
        // vb.count += V_TIME_COUNT;
    }
}
export function VbSetAttribParams1(vb, start, count, stride, params) {

    let index = start;
    const end = start + count;

    while (index < end) {

        if (params[0]) {
            vb.data[index] = params[0];
        }
        index++;
        if (params[0]) {
            vb.data[index] = params[1];
        }
        index++;
        if (params[0]) {
            vb.data[index] = params[2];
        }
        index++;
        if (params[0]) {
            vb.data[index] = params[3];
        }
        index++;

        index += stride;
        vb.count += V_PARAMS1_COUNT;
    }
}


/* * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * *
 * Add vertex attributes from buffer(buffer with already calculated values).
 * The repeat is used if we have a repeated attribute, like world position which is the same x,y,z for every vertex.
 */
export function VbSetAttribBuffer(vb, start, count, stride, buffer, attribSize) {

    let cnt = start;
    let len = buffer.length;
    let cnt2 = 0;

    for (let i = 0; i < count; i += stride) {
        for (let j = 0; j < attribSize; j++) {
            vb.data[cnt++] = buffer[cnt2++];
            if (cnt2 >= len) cnt2 = 0;
            vb.count++;
        }

        cnt += stride - attribSize;
    }
}





/* * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * *
 * 
 */
export function GlSetColor(gfxInfo, color) {

    const progs = GlGetPrograms();
    const vb = progs[gfxInfo.prog.idx].vertexBuffer[gfxInfo.vb.idx];

    let index = gfxInfo.vb.start + progs[gfxInfo.prog.idx].shaderInfo.attributes.offset.col;
    let verts = gfxInfo.numFaces * gfxInfo.vertsPerRect;
    let stride = gfxInfo.attribsPerVertex - V_COL_COUNT;

    while (verts) {

        vb.data[index++] = color[0]; // Move mesh's x pos by amt
        vb.data[index++] = color[1]; // Move mesh's x pos by amt
        vb.data[index++] = color[2]; // Move mesh's x pos by amt
        vb.data[index++] = color[3]; // Move mesh's x pos by amt

        index += stride; // Go to next vertice's pos. +1 for skipping pos.z
        verts--;
    }
}
export function GlSetColorAlpha(gfxInfo, val) {

    const progs = GlGetPrograms();
    const vb = progs[gfxInfo.prog.idx].vertexBuffer[gfxInfo.vb.idx];

    let index = gfxInfo.vb.start + progs[gfxInfo.prog.idx].shaderInfo.attributes.offset.col;
    let verts = gfxInfo.numFaces * gfxInfo.vertsPerRect;
    let stride = gfxInfo.attribsPerVertex - V_COL_COUNT;

    while (verts) {

        vb.data[index++] = val; // Move mesh's x pos by amt
        vb.data[index++] = val; // Move mesh's x pos by amt
        vb.data[index++] = val; // Move mesh's x pos by amt
        vb.data[index++] = val; // Move mesh's x pos by amt

        index += stride; // Go to next vertice's pos. +1 for skipping pos.z
        verts--;
    }
}
export function GlSetDim(gfxInfo, dim) {

    const progs = GlGetPrograms();
    const vb = progs[gfxInfo.prog.idx].vertexBuffer[gfxInfo.vb.idx];

    let index = gfxInfo.vb.start + progs[gfxInfo.prog.idx].shaderInfo.attributes.offset.pos;
    let faces = gfxInfo.numFaces;
    let stride = gfxInfo.attribsPerVertex - V_POS_COUNT;


    while (faces) {

        vb.data[index++] = -dim[0];
        vb.data[index++] = dim[1];
        index += stride;

        vb.data[index++] = -dim[0];
        vb.data[index++] = -dim[1];
        index += stride;

        vb.data[index++] = dim[0];
        vb.data[index++] = dim[1];
        index += stride;

        vb.data[index++] = dim[0];
        vb.data[index++] = -dim[1];
        index += stride;

        faces--;
    }
}
export function GlSetTex(gfxInfo, uvs) {

    const progs = GlGetPrograms();
    const vb = progs[gfxInfo.prog.idx].vertexBuffer[gfxInfo.vb.idx];

    let index = gfxInfo.vb.start + progs[gfxInfo.prog.idx].shaderInfo.attributes.offset.tex;
    let numTimes = gfxInfo.numFaces;
    let stride = gfxInfo.attribsPerVertex - V_TEX_COUNT;

    while (numTimes) {

        vb.data[index++] = uvs[0];
        vb.data[index++] = uvs[3];
        index += stride;

        vb.data[index++] = uvs[0];
        vb.data[index++] = uvs[2];
        index += stride;

        vb.data[index++] = uvs[1];
        vb.data[index++] = uvs[3];
        index += stride;

        vb.data[index++] = uvs[1];
        vb.data[index++] = uvs[2];
        index += stride;

        numTimes--;
    }

    vb.needsUpdate = true;
}
export function GlMove(gfxInfo, wpos) {

    const progs = GlGetPrograms();
    const vb = progs[gfxInfo.prog.idx].vertexBuffer[gfxInfo.vb.idx];

    let index = gfxInfo.vb.start + progs[gfxInfo.prog.idx].shaderInfo.attributes.offset.wposTime;
    let verts = gfxInfo.numFaces * gfxInfo.vertsPerRect;
    let stride = gfxInfo.attribsPerVertex - V_WPOS_COUNT;

    while (verts) {

        vb.data[index++] += wpos[0]; // Move mesh's x pos by amt
        vb.data[index++] += wpos[1]; // Move mesh's y pos by amt
        index++

        index += stride; // Go to next vertice's pos. +1 for skipping pos.z
        verts--;
    }
}
export function GlSetWpos(gfxInfo, pos) {

    const progs = GlGetPrograms();
    const vb = progs[gfxInfo.prog.idx].vertexBuffer[gfxInfo.vb.idx];

    let index = gfxInfo.vb.start + progs[gfxInfo.prog.idx].shaderInfo.attributes.offset.wposTime;
    let verts = gfxInfo.numFaces * gfxInfo.vertsPerRect;
    let stride = gfxInfo.attribsPerVertex - V_WPOS_COUNT;

    while (verts) {

        vb.data[index++] = pos[0];
        vb.data[index++] = pos[1];
        vb.data[index++] = pos[2];

        index += stride; // Go to next vertice's pos. +1 for skipping pos.z
        verts--;
    }
}
export function GlSetWposXY(gfxInfo, pos) {

    const progs = GlGetPrograms();
    const vb = progs[gfxInfo.prog.idx].vertexBuffer[gfxInfo.vb.idx];

    let index = gfxInfo.vb.start + progs[gfxInfo.prog.idx].shaderInfo.attributes.offset.wposTime;
    let verts = gfxInfo.numFaces * gfxInfo.vertsPerRect;
    let stride = gfxInfo.attribsPerVertex - V_WPOS_COUNT;

    while (verts) {

        vb.data[index++] = pos[0];
        vb.data[index++] = pos[1];
        index++

        index += stride; // Go to next vertice's pos. +1 for skipping pos.z
        verts--;
    }
}
export function GlSetWposX(gfxInfo, posx) {

    const progs = GlGetPrograms();
    const vb = progs[gfxInfo.prog.idx].vertexBuffer[gfxInfo.vb.idx];

    let index = gfxInfo.vb.start + progs[gfxInfo.prog.idx].shaderInfo.attributes.offset.wposTime;
    let faces = gfxInfo.numFaces; // Number of vertices
    let stride = gfxInfo.attribsPerVertex; // Offset to next scale[0] attribute

    while (faces) {

        vb.data[index] = posx;
        index += stride; // Go to next vertice's wposx.
        vb.data[index] = posx;
        index += stride; // Go to next vertice's wposx.
        vb.data[index] = posx;
        index += stride; // Go to next vertice's wposx.
        vb.data[index] = posx;
        index += stride; // Go to next vertice's wposx.

        faces--;
    }
}
export function GlSetWposY(gfxInfo, posy) {

    const progs = GlGetPrograms();
    const vb = progs[gfxInfo.prog.idx].vertexBuffer[gfxInfo.vb.idx];

    let index = gfxInfo.vb.start + progs[gfxInfo.prog.idx].shaderInfo.attributes.offset.wposTime + 1;
    let faces = gfxInfo.numFaces; // Number of vertices
    let stride = gfxInfo.attribsPerVertex; // Offset to next scale[0] attribute

    while (faces) {

        vb.data[index] = posy;
        index += stride; // Go to next vertice's wposx.
        vb.data[index] = posy;
        index += stride; // Go to next vertice's wposx.
        vb.data[index] = posy;
        index += stride; // Go to next vertice's wposx.
        vb.data[index] = posy;
        index += stride; // Go to next vertice's wposx.

        faces--;
    }
}
export function GlSetWposZ(gfxInfo, posz) {

    const progs = GlGetPrograms();
    const vb = progs[gfxInfo.prog.idx].vertexBuffer[gfxInfo.vb.idx];

    let index = gfxInfo.vb.start + progs[gfxInfo.prog.idx].shaderInfo.attributes.offset.wposTime + 2;
    let faces = gfxInfo.numFaces; // Number of vertices
    let stride = gfxInfo.attribsPerVertex; // Offset to next scale[0] attribute

    while (faces) {

        vb.data[index] = posz;
        index += stride; // Go to next vertice's wposx.
        vb.data[index] = posz;
        index += stride; // Go to next vertice's wposx.
        vb.data[index] = posz;
        index += stride; // Go to next vertice's wposx.
        vb.data[index] = posz;
        index += stride; // Go to next vertice's wposx.

        faces--;
    }
}
export function GlSetAttrRoundCorner(gfxInfo, val) {

    const progs = GlGetPrograms();
    const vb = progs[gfxInfo.prog.idx].vertexBuffer[gfxInfo.vb.idx];

    let index = gfxInfo.vb.start + progs[gfxInfo.prog.idx].shaderInfo.attributes.offset.style + V_ROUND_CORNER_STRIDE;
    let verts = gfxInfo.numFaces * gfxInfo.vertsPerRect;
    let stride = gfxInfo.attribsPerVertex - 1; // Minus 1 attr that we are setting

    while (verts) {

        vb.data[index++] = val;

        index += stride; // Go to next vertice's borderWidth attrib.
        verts--;
    }
}
export function GlSetAttrBorderWidth(gfxInfo, val) {

    const progs = GlGetPrograms();
    const vb = progs[gfxInfo.prog.idx].vertexBuffer[gfxInfo.vb.idx];

    let index = gfxInfo.vb.start + progs[gfxInfo.prog.idx].shaderInfo.attributes.offset.style + V_BORDER_WIDTH_STRIDE;
    let verts = gfxInfo.numFaces * gfxInfo.vertsPerRect;
    let stride = gfxInfo.attribsPerVertex - 1; // Minus 1 attr that we are setting

    while (verts) {

        vb.data[index++] = val;

        index += stride; // Go to next vertice's borderWidth attrib.
        verts--;
    }
}
export function GlSetAttrBorderFeather(gfxInfo, val) {

    const progs = GlGetPrograms();
    const vb = progs[gfxInfo.prog.idx].vertexBuffer[gfxInfo.vb.idx];

    let index = gfxInfo.vb.start + progs[gfxInfo.prog.idx].shaderInfo.attributes.offset.style + V_BORDER_FEATHER_STRIDE;
    let verts = gfxInfo.numFaces * gfxInfo.vertsPerRect;
    let stride = gfxInfo.attribsPerVertex - 1; // Minus 1 attr that we are setting

    while (verts) {

        vb.data[index++] = val;

        index += stride; // Go to next vertice's borderWidth attrib.
        verts--;
    }
}
export function GlSetAttrTime(gfxInfo, val) {

    const progs = GlGetPrograms();
    const vb = progs[gfxInfo.prog.idx].vertexBuffer[gfxInfo.vb.idx];

    let index = gfxInfo.vb.start + progs[gfxInfo.prog.idx].shaderInfo.attributes.offset.time;
    let verts = gfxInfo.numFaces * gfxInfo.vertsPerRect;
    let stride = gfxInfo.attribsPerVertex - V_TIME_COUNT;

    while (verts) {

        vb.data[index++] = val;

        index += stride; // Go to next vertice's borderWidth attrib.
        verts--;
    }
    vb.needsUpdate = true; // HACK. TODO suppose to be implemented in MESH????
}
export function GlSetAttrSdfParams(gfxInfo, val) {

    const progs = GlGetPrograms();
    const vb = progs[gfxInfo.prog.idx].vertexBuffer[gfxInfo.vb.idx];

    let index = gfxInfo.vb.start + progs[gfxInfo.prog.idx].shaderInfo.attributes.offset.sdf;
    let verts = gfxInfo.numFaces * gfxInfo.vertsPerRect;
    let stride = gfxInfo.attribsPerVertex - V_SDF_COUNT;

    while (verts) {

        vb.data[index++] = val[0];
        vb.data[index++] = val[1];

        index += stride; // Go to next vertice's borderWidth attrib.
        verts--;
    }
}
export function GlSetAttrSdfParamsOuter(gfxInfo, val) {

    const progs = GlGetPrograms();
    const vb = progs[gfxInfo.prog.idx].vertexBuffer[gfxInfo.vb.idx];

    let index = gfxInfo.vb.start + progs[gfxInfo.prog.idx].shaderInfo.attributes.offset.sdf;
    let verts = gfxInfo.numFaces * gfxInfo.vertsPerRect;
    let stride = gfxInfo.attribsPerVertex - V_SDF_COUNT;

    while (verts) {

        index++; // Skip sdf-inner param 
        vb.data[index++] = val;

        index += stride; // Go to next vertice's borderWidth attrib.
        verts--;
    }
}
export function GlSetAttrTex(gfxInfo, uvs) {

    const progs = GlGetPrograms();
    const vb = progs[gfxInfo.prog.idx].vertexBuffer[gfxInfo.vb.idx];

    let index = gfxInfo.vb.start + progs[gfxInfo.prog.idx].shaderInfo.attributes.offset.tex;

    let numTimes = gfxInfo.numFaces;
    let stride = gfxInfo.attribsPerVertex - V_TEX_COUNT;

    while (numTimes) {

        vb.data[index++] = uvs[0];
        vb.data[index++] = uvs[3];
        index += stride;

        vb.data[index++] = uvs[0];
        vb.data[index++] = uvs[2];
        index += stride;

        vb.data[index++] = uvs[1];
        vb.data[index++] = uvs[3];
        index += stride;

        vb.data[index++] = uvs[1];
        vb.data[index++] = uvs[2];
        index += stride;

        numTimes--;
    }
}
/**
 * 
 * @param {*} gfxInfo 
 * @param {*} param 
 * @param {*} paramOffset: The attribute params1 is a 4 component vector. So we need the index of the element in the vector (as an offset).  
 */
export function GlSetAttrParams1(gfxInfo, param, paramOffset) {

    const progs = GlGetPrograms();
    const vb = progs[gfxInfo.prog.idx].vertexBuffer[gfxInfo.vb.idx];

    let index = gfxInfo.vb.start + progs[gfxInfo.prog.idx].shaderInfo.attributes.offset.params1 + paramOffset;
    let verts = gfxInfo.numFaces * gfxInfo.vertsPerRect;
    let stride = gfxInfo.attribsPerVertex - 1;

    while (verts) {
        vb.data[index++] = param[paramOffset];
        index += stride;
        verts--;
    }
}

/** Set many meshes in a loop */
// Move all meshes from a buffer with the starting indexes
export function GlSetWposXYMany(gfxInfo, pos, startsBuffer) {

    const progs = GlGetPrograms();
    const vb = progs[gfxInfo.prog.idx].vertexBuffer[gfxInfo.vb.idx];

    let index = gfxInfo.vb.start + progs[gfxInfo.prog.idx].shaderInfo.attributes.offset.wposTime;
    let verts = gfxInfo.numFaces * gfxInfo.vertsPerRect;
    let stride = gfxInfo.attribsPerVertex - V_WPOS_COUNT;

    let numMeshes = startsBuffer.length-1;
    while (numMeshes) {
        while (verts) {

            vb.data[index++] = pos[0];
            vb.data[index++] = pos[1];
            index++

            index += stride; // Go to next vertice's pos. +1 for skipping pos.z
            verts--;
        }

        // Next iteration access the nest mesh provided by startsBuffer that has the starting index of the mesh in the vertex buffer.
        index = startsBuffer[numMeshes--];
    }
}
// Move all meshes from found in vertex buffer in consecutive order, 'start'ing from a specific mesh
export function GlMoveXYConcecutive(gfxInfo, pos, numMeshes) {

    const progs = GlGetPrograms();
    const vb = progs[gfxInfo.prog.idx].vertexBuffer[gfxInfo.vb.idx];

    let index = gfxInfo.vb.start + progs[gfxInfo.prog.idx].shaderInfo.attributes.offset.wposTime;
    let stride = gfxInfo.attribsPerVertex - V_WPOS_COUNT;
    
    while (numMeshes) {
        let verts = gfxInfo.numFaces * gfxInfo.vertsPerRect;
        while (verts) {

            vb.data[index++] += pos[0];
            vb.data[index++] += pos[1];
            index++

            index += stride; // Go to next vertice's pos. +1 for skipping pos.z
            verts--;
        }
        numMeshes--;
    }
}

export function GlRotate2D(gfxInfo, dim, angle) {

    const progs = GlGetPrograms();
    const vb = progs[gfxInfo.prog.idx].vertexBuffer[gfxInfo.vb.idx];

    let index = gfxInfo.vb.start + progs[gfxInfo.prog.idx].shaderInfo.attributes.offset.pos;
    let stride = gfxInfo.attribsPerVertex - V_POS_COUNT;

    // const newPos = Rotate4x4(dim, angle)
    const newPos = RotateZ(dim, angle)

    vb.data[index++] = newPos[0];
    vb.data[index++] = newPos[1];
    index += stride;
    vb.data[index++] = newPos[2];
    vb.data[index++] = newPos[3];
    index += stride;
    vb.data[index++] = newPos[4];
    vb.data[index++] = newPos[5];
    index += stride;
    vb.data[index++] = newPos[6];
    vb.data[index++] = newPos[7];
}

/** */
export function GlRotateX3D(gfxInfo, dim, angle) {

    const progs = GlGetPrograms();
    const vb = progs[gfxInfo.prog.idx].vertexBuffer[gfxInfo.vb.idx];

    let index = gfxInfo.vb.start + progs[gfxInfo.prog.idx].shaderInfo.attributes.offset.pos;
    let stride = gfxInfo.attribsPerVertex;
    let vertices = gfxInfo.numFaces * gfxInfo.vertsPerRect;

    const c = Math.cos(angle);
    const s = Math.sin(angle);
    const r = [
        c, -s,
        s, c,
    ];

    const vPosF = [
        -1 * dim[0], 1 * dim[1], 1 * dim[2],
        -1 * dim[0], -1 * dim[1], 1 * dim[2],
        1 * dim[0], 1 * dim[1], 1 * dim[2],
        1 * dim[0], -1 * dim[1], 1 * dim[2],
    ];
    const vPosBK = [
        -1 * dim[0], 1 * dim[1], -1 * dim[2],
        -1 * dim[0], -1 * dim[1], -1 * dim[2],
        1 * dim[0], 1 * dim[1], -1 * dim[2],
        1 * dim[0], -1 * dim[1], -1 * dim[2],
    ];
    const vPosR = [
        1 * dim[0], -1 * dim[1], 1 * dim[2],
        1 * dim[0], -1 * dim[1], -1 * dim[2],
        1 * dim[0], 1 * dim[1], 1 * dim[2],
        1 * dim[0], 1 * dim[1], -1 * dim[2],
    ];
    const vPosL = [
        -1 * dim[0], -1 * dim[1], 1 * dim[2],
        -1 * dim[0], -1 * dim[1], -1 * dim[2],
        -1 * dim[0], 1 * dim[1], 1 * dim[2],
        -1 * dim[0], 1 * dim[1], -1 * dim[2],
    ];
    const vPosT = [
        -1 * dim[0], 1 * dim[1], 1 * dim[2],
        -1 * dim[0], 1 * dim[1], -1 * dim[2],
        1 * dim[0], 1 * dim[1], 1 * dim[2],
        1 * dim[0], 1 * dim[1], -1 * dim[2],
    ];
    const vPosBot = [
        -1 * dim[0], -1 * dim[1], 1 * dim[2],
        -1 * dim[0], -1 * dim[1], -1 * dim[2],
        1 * dim[0], -1 * dim[1], 1 * dim[2],
        1 * dim[0], -1 * dim[1], -1 * dim[2],
    ];

    let xf = 0,
        yf = 1,
        zf = 2;

    vertices = 4;
    while (vertices) {
        vb.data[index + 1] = vPosF[yf] * r[0] + vPosF[zf] * r[2];
        vb.data[index + 2] = vPosF[yf] * r[1] + vPosF[zf] * r[3];
        xf += 3; yf += 3; zf += 3;
        index += stride;
        vertices--;
    }
    vertices = 4;
    xf = 0, yf = 1, zf = 2;
    while (vertices) {
        vb.data[index + 1] = vPosL[yf] * r[0] + vPosL[zf] * r[2];
        vb.data[index + 2] = vPosL[yf] * r[1] + vPosL[zf] * r[3];
        xf += 3; yf += 3; zf += 3;
        index += stride;
        vertices--;
    }
    vertices = 4;
    xf = 0, yf = 1, zf = 2;
    while (vertices) {
        vb.data[index + 1] = vPosBK[yf] * r[0] + vPosBK[zf] * r[2];
        vb.data[index + 2] = vPosBK[yf] * r[1] + vPosBK[zf] * r[3];
        xf += 3; yf += 3; zf += 3;
        index += stride;
        vertices--;
    }
    xf = 0, yf = 1, zf = 2;
    vertices = 4;
    while (vertices) {
        vb.data[index + 1] = vPosR[yf] * r[0] + vPosR[zf] * r[2];
        vb.data[index + 2] = vPosR[yf] * r[1] + vPosR[zf] * r[3];
        xf += 3; yf += 3; zf += 3;
        index += stride;
        vertices--;
    }
    vertices = 4;
    xf = 0, yf = 1, zf = 2;
    while (vertices) {
        vb.data[index + 1] = vPosT[yf] * r[0] + vPosT[zf] * r[2];
        vb.data[index + 2] = vPosT[yf] * r[1] + vPosT[zf] * r[3];
        xf += 3; yf += 3; zf += 3;
        index += stride;
        vertices--;
    }
    vertices = 4;
    xf = 0, yf = 1, zf = 2;
    while (vertices) {
        vb.data[index + 1] = vPosBot[yf] * r[0] + vPosBot[zf] * r[2];
        vb.data[index + 2] = vPosBot[yf] * r[1] + vPosBot[zf] * r[3];
        xf += 3; yf += 3; zf += 3;
        index += stride;
        vertices--;
    }

    vb.needsUpdate = true;
}
/** */
export function GlRotateY3D(gfxInfo, dim, angle) {

    const progs = GlGetPrograms();
    const vb = progs[gfxInfo.prog.idx].vertexBuffer[gfxInfo.vb.idx];

    let index = gfxInfo.vb.start + progs[gfxInfo.prog.idx].shaderInfo.attributes.offset.pos;
    let stride = gfxInfo.attribsPerVertex;
    let vertices = gfxInfo.numFaces * gfxInfo.vertsPerRect;

    const c = Math.cos(angle);
    const s = Math.sin(angle);
    const r = [
        c, -s,
        s, c,
    ];

    const vPosF = [
        -1 * dim[0], 1 * dim[1], 1 * dim[2],
        -1 * dim[0], -1 * dim[1], 1 * dim[2],
        1 * dim[0], 1 * dim[1], 1 * dim[2],
        1 * dim[0], -1 * dim[1], 1 * dim[2],
    ];
    const vPosBK = [
        -1 * dim[0], 1 * dim[1], -1 * dim[2],
        -1 * dim[0], -1 * dim[1], -1 * dim[2],
        1 * dim[0], 1 * dim[1], -1 * dim[2],
        1 * dim[0], -1 * dim[1], -1 * dim[2],
    ];
    const vPosR = [
        1 * dim[0], -1 * dim[1], 1 * dim[2],
        1 * dim[0], -1 * dim[1], -1 * dim[2],
        1 * dim[0], 1 * dim[1], 1 * dim[2],
        1 * dim[0], 1 * dim[1], -1 * dim[2],
    ];
    const vPosL = [
        -1 * dim[0], -1 * dim[1], 1 * dim[2],
        -1 * dim[0], -1 * dim[1], -1 * dim[2],
        -1 * dim[0], 1 * dim[1], 1 * dim[2],
        -1 * dim[0], 1 * dim[1], -1 * dim[2],
    ];
    const vPosT = [
        -1 * dim[0], 1 * dim[1], 1 * dim[2],
        -1 * dim[0], 1 * dim[1], -1 * dim[2],
        1 * dim[0], 1 * dim[1], 1 * dim[2],
        1 * dim[0], 1 * dim[1], -1 * dim[2],
    ];
    const vPosBot = [
        -1 * dim[0], -1 * dim[1], 1 * dim[2],
        -1 * dim[0], -1 * dim[1], -1 * dim[2],
        1 * dim[0], -1 * dim[1], 1 * dim[2],
        1 * dim[0], -1 * dim[1], -1 * dim[2],
    ];

    let xf = 0,
        yf = 1,
        zf = 2;


    vertices = 4;
    while (vertices) {
        vb.data[index + 0] = vPosF[xf] * r[0] + vPosF[zf] * r[2];
        vb.data[index + 2] = vPosF[xf] * r[1] + vPosF[zf] * r[3];
        xf += 3; yf += 3; zf += 3;
        index += stride;
        vertices--;
    }
    vertices = 4;
    xf = 0, yf = 1, zf = 2;
    while (vertices) {
        vb.data[index + 0] = vPosL[xf] * r[0] + vPosL[zf] * r[2];
        vb.data[index + 2] = vPosL[xf] * r[1] + vPosL[zf] * r[3];
        xf += 3; yf += 3; zf += 3;
        index += stride;
        vertices--;
    }
    vertices = 4;
    xf = 0, yf = 1, zf = 2;
    while (vertices) {
        vb.data[index + 0] = vPosBK[xf] * r[0] + vPosBK[zf] * r[2];
        vb.data[index + 2] = vPosBK[xf] * r[1] + vPosBK[zf] * r[3];
        xf += 3; yf += 3; zf += 3;
        index += stride;
        vertices--;
    }
    xf = 0, yf = 1, zf = 2;
    vertices = 4;
    while (vertices) {
        vb.data[index + 0] = vPosR[xf] * r[0] + vPosR[zf] * r[2];
        vb.data[index + 2] = vPosR[xf] * r[1] + vPosR[zf] * r[3];
        xf += 3; yf += 3; zf += 3;
        index += stride;
        vertices--;
    }
    vertices = 4;
    xf = 0, yf = 1, zf = 2;
    while (vertices) {
        vb.data[index + 0] = vPosT[xf] * r[0] + vPosT[zf] * r[2];
        vb.data[index + 2] = vPosT[xf] * r[1] + vPosT[zf] * r[3];
        xf += 3; yf += 3; zf += 3;
        index += stride;
        vertices--;
    }
    vertices = 4;
    xf = 0, yf = 1, zf = 2;
    while (vertices) {
        vb.data[index + 0] = vPosBot[xf] * r[0] + vPosBot[zf] * r[2];
        vb.data[index + 2] = vPosBot[xf] * r[1] + vPosBot[zf] * r[3];
        xf += 3; yf += 3; zf += 3;
        index += stride;
        vertices--;
    }

    vb.needsUpdate = true;
}
/** */

/** */
export function GlRotateZ3D(gfxInfo, dim, angle) {

    const progs = GlGetPrograms();
    const vb = progs[gfxInfo.prog.idx].vertexBuffer[gfxInfo.vb.idx];

    let index = gfxInfo.vb.start + progs[gfxInfo.prog.idx].shaderInfo.attributes.offset.pos;
    let stride = gfxInfo.attribsPerVertex;
    let vertices = gfxInfo.numFaces * gfxInfo.vertsPerRect;

    const c = Math.cos(angle);
    const s = Math.sin(angle);
    const r = [
        c, -s,
        s, c,
    ];

    const vPosF = [
        -1 * dim[0], 1 * dim[1], 1 * dim[2],
        -1 * dim[0], -1 * dim[1], 1 * dim[2],
        1 * dim[0], 1 * dim[1], 1 * dim[2],
        1 * dim[0], -1 * dim[1], 1 * dim[2],
    ];
    const vPosBK = [
        -1 * dim[0], 1 * dim[1], -1 * dim[2],
        -1 * dim[0], -1 * dim[1], -1 * dim[2],
        1 * dim[0], 1 * dim[1], -1 * dim[2],
        1 * dim[0], -1 * dim[1], -1 * dim[2],
    ];
    const vPosL = [
        -1 * dim[0], 1 * dim[1], -1 * dim[2],
        -1 * dim[0], -1 * dim[1], -1 * dim[2],
        -1 * dim[0], 1 * dim[1], 1 * dim[2],
        -1 * dim[0], -1 * dim[1], 1 * dim[2],
    ];
    const vPosR = [
        1 * dim[0], 1 * dim[1], -1 * dim[2],
        1 * dim[0], -1 * dim[1], -1 * dim[2],
        1 * dim[0], 1 * dim[1], 1 * dim[2],
        1 * dim[0], -1 * dim[1], 1 * dim[2],
    ];
    const vPosT = [
        -1 * dim[0], 1 * dim[1], 1 * dim[2],
        -1 * dim[0], 1 * dim[1], -1 * dim[2],
        1 * dim[0], 1 * dim[1], 1 * dim[2],
        1 * dim[0], 1 * dim[1], -1 * dim[2],
    ];
    const vPosBT = [
        -1 * dim[0], -1 * dim[1], 1 * dim[2],
        -1 * dim[0], -1 * dim[1], -1 * dim[2],
        1 * dim[0], -1 * dim[1], 1 * dim[2],
        1 * dim[0], -1 * dim[1], -1 * dim[2],
    ];

    let xf = 0,
        yf = 1,
        zf = 2;


    vertices = 4;
    xf = 0, yf = 1, zf = 2;
    while (vertices) {
        vb.data[index + 0] = vPosF[xf] * r[0] + vPosF[yf] * r[2];
        vb.data[index + 1] = vPosF[xf] * r[1] + vPosF[yf] * r[3];
        xf += 3; yf += 3; zf += 3;
        index += stride;
        vertices--;
    }
    vertices = 4;
    xf = 0, yf = 1, zf = 2;
    while (vertices) {
        vb.data[index + 0] = vPosBK[xf] * r[0] + vPosBK[yf] * r[2];
        vb.data[index + 1] = vPosBK[xf] * r[1] + vPosBK[yf] * r[3];
        xf += 3; yf += 3; zf += 3;
        index += stride;
        vertices--;
    }
    vertices = 4;
    xf = 0, yf = 1, zf = 2;
    while (vertices) {
        vb.data[index + 0] = vPosR[xf] * r[0] + vPosR[yf] * r[2];
        vb.data[index + 1] = vPosR[xf] * r[1] + vPosR[yf] * r[3];
        xf += 3; yf += 3; zf += 3;
        index += stride;
        vertices--;
    }
    vertices = 4;
    xf = 0, yf = 1, zf = 2;
    while (vertices) {
        vb.data[index + 0] = vPosL[xf] * r[0] + vPosL[yf] * r[2];
        vb.data[index + 1] = vPosL[xf] * r[1] + vPosL[yf] * r[3];
        xf += 3; yf += 3; zf += 3;
        index += stride;
        vertices--;
    }
    vertices = 4;
    xf = 0, yf = 1, zf = 2;
    while (vertices) {
        vb.data[index + 0] = vPosT[xf] * r[0] + vPosT[yf] * r[2];
        vb.data[index + 1] = vPosT[xf] * r[1] + vPosT[yf] * r[3];
        xf += 3; yf += 3; zf += 3;
        index += stride;
        vertices--;
    }
    vertices = 4;
    xf = 0, yf = 1, zf = 2;
    while (vertices) {
        vb.data[index + 0] = vPosBT[xf] * r[0] + vPosBT[yf] * r[2];
        vb.data[index + 1] = vPosBT[xf] * r[1] + vPosBT[yf] * r[3];
        xf += 3; yf += 3; zf += 3;
        index += stride;
        vertices--;
    }

    vb.needsUpdate = true;
}

