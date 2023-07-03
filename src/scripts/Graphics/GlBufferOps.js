"use strict";

import { Rotate4x4, Rotate4x42 } from "../Helpers/Math/Matrix.js";
import {  GlGetPrograms, GlGetVB } from "./GlProgram.js";



export function GlSetPriority(progIdx, vbIdx, meshIdx, meshCount)
{
    const vb = GlGetVB(progIdx, vbIdx);

    const meshStart = vb.meshes[meshIdx].vb.start;
    const meshSize = vb.meshes[meshIdx].vb.count;
    const allmeshCount = vb.meshes.length;

    const temp = new Array(meshCount);
    let c = meshStart;
    for(let i = 0; i<meshCount; i++){
        temp[i] = new Float32Array(meshSize);
        for(let j = 0; j<meshSize; j++){
            temp[i][j] = vb.data[c];
            c++;
        }
    }

    /**
     *	Slide all other meshes to the left by one mesh
     */ 
    let start = vb.meshes[meshIdx].vb.start;
    let c2 = start;
    let meshNewIdx = meshIdx;

    for(let i = meshIdx+meshCount; i<allmeshCount; i++){
        const newStart = vb.meshes[i].vb.start;
        // const newStart = i*meshSize;
        const newSize = vb.meshes[i].vb.count;
        for(let j = newStart; j<newStart+newSize; j++){
            vb.data[c2] = vb.data[j];
            c2++;
        }
        vb.meshes[i].vb.start = start;
        vb.meshes[i].meshIdx = meshNewIdx; // Update the meshe's index
        meshNewIdx++;
        start = c2; // Keep the start of current mesh as the next's iteration previus meshe's start
    }

    /**
     *  Finally add the mesh at the end of the vertexBuffer
     */ 
    let cnt = start;
    for(let i = 0; i<meshCount; i++){
        for(let j = 0; j<meshSize; j++){
            vb.data[cnt] = temp[i][j];
            cnt++; 
        }
        vb.meshes[meshIdx+i].vb.start = start;
        vb.meshes[meshIdx+i].meshIdx = meshNewIdx; // Update the meshe's index
        start = cnt;
    }

    vb.needsUpdate = true;
}

/** * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * *
 * Functions to add meshe data to the vertex buffer.
 * 
 * @param {*} vb : The vertex buffer reference
 * @param {*} start : The starting index for the mesh in the vertex buffer
 * @param {*} count : The number of vertices * number of attributes per vertex
 * @param {*} stride : The distance (in elements) from vertex to next vertex. 
 */ 

export function VbSetAttribCol(vb, start, count, stride, col) {

    let index = start;
    const end = start + count;

    while (index < end) {

        vb.data[index++] = col[0];
        vb.data[index++] = col[1];
        vb.data[index++] = col[2];
        vb.data[index++] = col[3];

        index += stride;
        vb.count += V_COL_COUNT;
    }
}
export function VbSetAttribPos(vb, start, count, stride, dim) {

    let index = start;
    const end = start + count;

    while (index < end) {

        vb.data[index++] = -dim[0];
        vb.data[index++] =  dim[1];
        index += stride;

        vb.data[index++] = -dim[0];
        vb.data[index++] = -dim[1];
        index += stride;

        vb.data[index++] = dim[0];
        vb.data[index++] = dim[1];
        index += stride;

        vb.data[index++] =  dim[0];
        vb.data[index++] = -dim[1];
        index += stride;

        vb.count += V_POS_COUNT * VERTS_PER_RECT_INDEXED; 
    }
}
export function VbSetAttribScale(vb, start, count, stride, scale) {

    let index = start;
    const end = start + count;

    while (index < end) {

        vb.data[index++] = scale[0];
        vb.data[index++] = scale[1];

        index += stride;
        vb.count += V_SCALE_COUNT;
    }
}
export function VbSetAttribTex(vb, start, count, stride, tex) {

    let index = start;
    const end = start + count;

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
export function VbSetAttribWpos(vb, start, count, stride, pos) {

    let index = start;
    const end = start + count;

    while (index < end) {

        vb.data[index++] = pos[0];
        vb.data[index++] = pos[1];
        vb.data[index++] = pos[2];

        index += stride;
        vb.count += V_WPOS_TIME_COUNT;
    }
}
export function VbSetAttrSdfParams(vb, start, count, stride, sdfParams) {

    let index = start;
    const end = start + count;

    while (index < end) {

        vb.data[index++] = sdfParams[0];
        vb.data[index++] = sdfParams[1];

        index += stride;
        vb.count += V_SDF_PARAMS_COUNT;
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
export function VbSetAttrRoundCorner(vb, start, count, stride, radius) {

    let index = start;
    const end = start + count;

    while (index < end) {

        vb.data[index++] = radius;

        index += stride;
        vb.count += 2; // for the rest style attributes
    }
}
export function VbSetAttrBorderWidth(vb, start, count, stride, border) {

    let index = start;
    const end = start + count;

    while (index < end) {

        vb.data[index++] = border;

        index += stride;
        vb.count += 2; // for the rest style attributes
    }
}
export function VbSetAttrBorderFeather(vb, start, count, stride, feather) {

    let index = start;
    const end = start + count;

    while (index < end) {

        vb.data[index++] = feather;

        index += stride;
        vb.count += 2; // for the rest style attributes
    }
}
export function VbSetAttrTime(vb, start, count, stride, time) {

    let index = start;
    const end = start + count;

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

        if(params[0]) {
            vb.data[index] = params[0];
        }
        index++;
        if(params[0]) {
            vb.data[index] = params[1];
        }
        index++;
        if(params[0]) {
            vb.data[index] = params[2];
        }
        index++;
        if(params[0]) {
            vb.data[index] = params[3];
        }
        index++;

        index += stride;
        vb.count += V_PARAMS1_COUNT;
    }
}



export function GlSetColor(gfxInfo, color){

    const progs = GlGetPrograms();
    const vb = progs[gfxInfo.prog.idx].vertexBuffer[gfxInfo.vb.idx]; 

    let index  = gfxInfo.vb.start + progs[gfxInfo.prog.idx].shaderInfo.colOffset;
    let verts  = gfxInfo.numFaces * gfxInfo.vertsPerRect;
    let stride = gfxInfo.attribsPerVertex - V_COL_COUNT;

    while (verts) {

        vb.data[index++] = color[0]; // Move mesh's x pos by amt
        vb.data[index++] = color[1]; // Move mesh's x pos by amt
        vb.data[index++] = color[2]; // Move mesh's x pos by amt
        vb.data[index++] = color[3]; // Move mesh's x pos by amt

        index += stride; // Go to next vertice's pos. +1 for skipping pos.z
        verts--;
    }

    vb.needsUpdate = true; // To Update vertex buffer with the changed 
}
export function GlSetColorAlpha(gfxInfo, val){

    const progs = GlGetPrograms();
    const vb = progs[gfxInfo.prog.idx].vertexBuffer[gfxInfo.vb.idx]; 

    let index  = gfxInfo.vb.start + progs[gfxInfo.prog.idx].shaderInfo.colOffset;
    let verts  = gfxInfo.numFaces * gfxInfo.vertsPerRect;
    let stride = gfxInfo.attribsPerVertex - V_COL_COUNT;

    while (verts) {

        vb.data[index++] = val; // Move mesh's x pos by amt
        vb.data[index++] = val; // Move mesh's x pos by amt
        vb.data[index++] = val; // Move mesh's x pos by amt
        vb.data[index++] = val; // Move mesh's x pos by amt

        index += stride; // Go to next vertice's pos. +1 for skipping pos.z
        verts--;
    }

    vb.needsUpdate = true; // To Update vertex buffer with the changed 
}
export function GlSetDim(gfxInfo, dim) {

    const progs = GlGetPrograms();
    const vb = progs[gfxInfo.prog.idx].vertexBuffer[gfxInfo.vb.idx]; 

    let index  = gfxInfo.vb.start + progs[gfxInfo.prog.idx].shaderInfo.posOffset;
    let faces  = gfxInfo.numFaces;
    let stride = gfxInfo.attribsPerVertex - V_POS_COUNT;


    while (faces) {

        vb.data[index++] = -dim[0];
        vb.data[index++] =  dim[1];
        index += stride;

        vb.data[index++] = -dim[0];
        vb.data[index++] = -dim[1];
        index += stride;

        vb.data[index++] = dim[0];
        vb.data[index++] = dim[1];
        index += stride;

        vb.data[index++] =  dim[0];
        vb.data[index++] = -dim[1];
        index += stride;

        faces--;
    }

    vb.needsUpdate = true; // To Update vertex buffer with the changed 
}
export function GlSetTex(gfxInfo, uvs){

    const progs = GlGetPrograms();
    const vb = progs[gfxInfo.prog.idx].vertexBuffer[gfxInfo.vb.idx]; 

    let index  = gfxInfo.vb.start + progs[gfxInfo.prog.idx].shaderInfo.texOffset;
    let numTimes  = gfxInfo.numFaces;
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

    vb.needsUpdate = true; // To Update vertex buffer with the changed 
}
// export function GlScale(gfxInfo, val){

//     const progs = GlGetPrograms();
//     const vb = progs[gfxInfo.prog.idx].vertexBuffer[gfxInfo.vb.idx]; 

//     let index  = gfxInfo.vb.start + progs[gfxInfo.prog.idx].shaderInfo.scaleOffset;
//     let verts  = gfxInfo.numFaces * gfxInfo.vertsPerRect; // Number of vertices
//     let stride = gfxInfo.attribsPerVertex - 2; // Offset to next scale[0] attribute

//     while (verts) {
        
//         vb.data[index++] *= val[0]; 
//         vb.data[index++] *= val[1]; 

//         index += stride; // Go to next vertice's scale.
//         verts--;
//     }

//     vb.needsUpdate = true; // To Update vertex buffer with the changed data.
// }
// export function GlSetScale(gfxInfo, val){

//     const progs = GlGetPrograms();
//     const vb = progs[gfxInfo.prog.idx].vertexBuffer[gfxInfo.vb.idx]; 

//     let index  = gfxInfo.vb.start + progs[gfxInfo.prog.idx].shaderInfo.scaleOffset;
//     let verts  = gfxInfo.numFaces * gfxInfo.vertsPerRect; // Number of vertices
//     let stride = gfxInfo.attribsPerVertex - 2; // Offset to next scale[0] attribute

//     while (verts) {
        
//         vb.data[index++] = val[0]; 
//         vb.data[index++] = val[1]; 

//         index += stride; // Go to next vertice's scale.
//         verts--;
//     }

//     vb.needsUpdate = true; // To Update vertex buffer with the changed data.
// }
export function GlMove(gfxInfo, wpos){
    
    const progs = GlGetPrograms();
    const vb = progs[gfxInfo.prog.idx].vertexBuffer[gfxInfo.vb.idx]; 

    let index  = gfxInfo.vb.start + progs[gfxInfo.prog.idx].shaderInfo.wposTimeOffset;
    let verts  = gfxInfo.numFaces * gfxInfo.vertsPerRect;
    let stride = gfxInfo.attribsPerVertex - V_WPOS_COUNT;

    while (verts) {

        vb.data[index++] += wpos[0]; // Move mesh's x pos by amt
        vb.data[index++] += wpos[1]; // Move mesh's y pos by amt
        index++

        index += stride; // Go to next vertice's pos. +1 for skipping pos.z
        verts--;
    }

    vb.needsUpdate = true; // To Update vertex buffer with the changed 
}
export function GlSetWpos(gfxInfo, pos){

    const progs = GlGetPrograms();
    const vb = progs[gfxInfo.prog.idx].vertexBuffer[gfxInfo.vb.idx]; 

    let index  = gfxInfo.vb.start + progs[gfxInfo.prog.idx].shaderInfo.wposTimeOffset;
    let verts  = gfxInfo.numFaces * gfxInfo.vertsPerRect;
    let stride = gfxInfo.attribsPerVertex - V_WPOS_COUNT;

    while (verts) {

        vb.data[index++] = pos[0]; 
        vb.data[index++] = pos[1]; 
        vb.data[index++] = pos[2]; 

        index += stride; // Go to next vertice's pos. +1 for skipping pos.z
        verts--;
    }

    vb.needsUpdate = true; // To Update vertex buffer with the changed 
}
export function GlSetWposXY(gfxInfo, pos){

    const progs = GlGetPrograms();
    const vb = progs[gfxInfo.prog.idx].vertexBuffer[gfxInfo.vb.idx]; 

    let index  = gfxInfo.vb.start + progs[gfxInfo.prog.idx].shaderInfo.wposTimeOffset;
    let verts  = gfxInfo.numFaces * gfxInfo.vertsPerRect;
    let stride = gfxInfo.attribsPerVertex - V_WPOS_COUNT;

    while (verts) {

        vb.data[index++] = pos[0]; 
        vb.data[index++] = pos[1]; 
        index++

        index += stride; // Go to next vertice's pos. +1 for skipping pos.z
        verts--;
    }

    vb.needsUpdate = true; // To Update vertex buffer with the changed 
}
export function GlSetWposX(gfxInfo, posx){

    const progs = GlGetPrograms();
    const vb = progs[gfxInfo.prog.idx].vertexBuffer[gfxInfo.vb.idx]; 

    let index  = gfxInfo.vb.start + progs[gfxInfo.prog.idx].shaderInfo.wposTimeOffset;
    let faces  = gfxInfo.numFaces; // Number of vertices
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
    // console.log(vb.data)
    vb.needsUpdate = true; // To Update vertex buffer with the changed data.
}
export function GlSetWposY(gfxInfo, posy){

    const progs = GlGetPrograms();
    const vb = progs[gfxInfo.prog.idx].vertexBuffer[gfxInfo.vb.idx]; 

    let index  = gfxInfo.vb.start + progs[gfxInfo.prog.idx].shaderInfo.wposTimeOffset + 1;
    let faces  = gfxInfo.numFaces; // Number of vertices
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
    // console.log(vb.data)
    vb.needsUpdate = true; // To Update vertex buffer with the changed data.
}
export function GlSetWposZ(gfxInfo, posz){

    const progs = GlGetPrograms();
    const vb = progs[gfxInfo.prog.idx].vertexBuffer[gfxInfo.vb.idx]; 

    let index  = gfxInfo.vb.start + progs[gfxInfo.prog.idx].shaderInfo.wposTimeOffset + 2;
    let faces  = gfxInfo.numFaces; // Number of vertices
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
    // console.log(vb.data)
    vb.needsUpdate = true; // To Update vertex buffer with the changed data.
}
export function GlSetAttrRoundCorner(gfxInfo, val) {

    const progs = GlGetPrograms();
    const vb = progs[gfxInfo.prog.idx].vertexBuffer[gfxInfo.vb.idx]; 

    let index  = gfxInfo.vb.start + progs[gfxInfo.prog.idx].shaderInfo.styleOffset + V_ROUND_CORNER_STRIDE;
    let verts  = gfxInfo.numFaces * gfxInfo.vertsPerRect;
    let stride = gfxInfo.attribsPerVertex - 1; // Minus 1 attr that we are setting

    while (verts) {

        vb.data[index++] = val;

        index += stride; // Go to next vertice's borderWidth attrib.
        verts--;
    }

    vb.needsUpdate = true;
}
export function GlSetAttrBorderWidth(gfxInfo, val) {

    const progs = GlGetPrograms();
    const vb = progs[gfxInfo.prog.idx].vertexBuffer[gfxInfo.vb.idx]; 

    let index  = gfxInfo.vb.start + progs[gfxInfo.prog.idx].shaderInfo.styleOffset + V_BORDER_WIDTH_STRIDE;
    let verts  = gfxInfo.numFaces * gfxInfo.vertsPerRect;
    let stride = gfxInfo.attribsPerVertex - 1; // Minus 1 attr that we are setting

    while (verts) {

        vb.data[index++] = val;

        index += stride; // Go to next vertice's borderWidth attrib.
        verts--;
    }

    vb.needsUpdate = true;
}
export function GlSetAttrBorderFeather(gfxInfo, val) {

    const progs = GlGetPrograms();
    const vb = progs[gfxInfo.prog.idx].vertexBuffer[gfxInfo.vb.idx]; 

    let index  = gfxInfo.vb.start + progs[gfxInfo.prog.idx].shaderInfo.styleOffset + V_BORDER_FEATHER_STRIDE;
    let verts  = gfxInfo.numFaces * gfxInfo.vertsPerRect;
    let stride = gfxInfo.attribsPerVertex - 1; // Minus 1 attr that we are setting

    while (verts) {

        vb.data[index++] = val;

        index += stride; // Go to next vertice's borderWidth attrib.
        verts--;
    }

    vb.needsUpdate = true;
}
export function GlSetAttrTime(gfxInfo, val) {

    const progs = GlGetPrograms();
    const vb = progs[gfxInfo.prog.idx].vertexBuffer[gfxInfo.vb.idx]; 

    let index  = gfxInfo.vb.start + progs[gfxInfo.prog.idx].shaderInfo.timeOffset;
    let verts  = gfxInfo.numFaces * gfxInfo.vertsPerRect;
    let stride = gfxInfo.attribsPerVertex - V_TIME_COUNT;

    while (verts) {

        vb.data[index++] = val;

        index += stride; // Go to next vertice's borderWidth attrib.
        verts--;
    }

    vb.needsUpdate = true;
}
export function GlSetAttrSdfParams(gfxInfo, val) {

    const progs = GlGetPrograms();
    const vb = progs[gfxInfo.prog.idx].vertexBuffer[gfxInfo.vb.idx]; 

    let index  = gfxInfo.vb.start + progs[gfxInfo.prog.idx].shaderInfo.sdfParamsOffset;
    let verts  = gfxInfo.numFaces * gfxInfo.vertsPerRect;
    let stride = gfxInfo.attribsPerVertex - V_SDF_PARAMS_COUNT;

    while (verts) {

        vb.data[index++] = val[0];
        vb.data[index++] = val[1];

        index += stride; // Go to next vertice's borderWidth attrib.
        verts--;
    }

    vb.needsUpdate = true;
}
export function GlSetAttrSdfParamsOuter(gfxInfo, val) {

    const progs = GlGetPrograms();
    const vb = progs[gfxInfo.prog.idx].vertexBuffer[gfxInfo.vb.idx]; 

    let index  = gfxInfo.vb.start + progs[gfxInfo.prog.idx].shaderInfo.sdfParamsOffset;
    let verts  = gfxInfo.numFaces * gfxInfo.vertsPerRect;
    let stride = gfxInfo.attribsPerVertex - V_SDF_PARAMS_COUNT;

    while (verts) {

        index++; // Skip sdf-inner param 
        vb.data[index++] = val;

        index += stride; // Go to next vertice's borderWidth attrib.
        verts--;
    }

    vb.needsUpdate = true;
}
export function GlSetAttrTex(gfxInfo, uvs){

    const progs = GlGetPrograms();
    const vb = progs[gfxInfo.prog.idx].vertexBuffer[gfxInfo.vb.idx]; 

    let index  = gfxInfo.vb.start + progs[gfxInfo.prog.idx].shaderInfo.texOffset;

    let numTimes  = gfxInfo.numFaces;
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

    vb.needsUpdate = true; // To Update vertex buffer with the changed 
}
/**
 * 
 * @param {*} gfxInfo 
 * @param {*} param 
 * @param {*} paramOffset: The attribute params1 is a 4 component vector. So we need the index of the element in the vector (as an offset).  
 */
export function GlSetAttrParams1(gfxInfo, param, paramOffset){

    const progs = GlGetPrograms();
    const vb = progs[gfxInfo.prog.idx].vertexBuffer[gfxInfo.vb.idx]; 

    let index  = gfxInfo.vb.start + progs[gfxInfo.prog.idx].shaderInfo.params1Offset + paramOffset;
    let verts  = gfxInfo.numFaces * gfxInfo.vertsPerRect;
    let stride = gfxInfo.attribsPerVertex - 1;

    while (verts) {
        vb.data[index++] = param[paramOffset];
        index += stride;
        verts--;
    }

    vb.needsUpdate = true; // To Update vertex buffer with the changed 
}

export function GlRotate(gfxInfo, dim, angle){
    
    const progs = GlGetPrograms();
    const vb = progs[gfxInfo.prog.idx].vertexBuffer[gfxInfo.vb.idx]; 

    let index  = gfxInfo.vb.start + progs[gfxInfo.prog.idx].shaderInfo.posOffset;
    let stride = gfxInfo.attribsPerVertex - V_POS_COUNT;

    // const newPos = Rotate4x4(dim, angle)
    const newPos = Rotate4x42(dim, angle)

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

    vb.needsUpdate = true; // To Update vertex buffer with the changed 
}