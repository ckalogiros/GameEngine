"use strict";

import { RotateZ, Matrix3x3_3x3Mult } from "../../Helpers/Math/Matrix.js";
import { Gl_progs_get_ib_byidx, Gl_progs_get_group, Gl_progs_get_vb_byidx } from "../GlProgram.js";


export function Gl_remove_geometry(gfx, num_faces = 1) {

    const vb = Gl_progs_get_vb_byidx(gfx.progs_groupidx, gfx.prog.idx, gfx.vb.idx);
    const ib = Gl_progs_get_ib_byidx(gfx.progs_groupidx, gfx.prog.idx, gfx.ib.idx);

    // Structure to use for updating a removed mesh's sttart index pointing to it's location in the vertex buffer..
    const ret = {
        counts: [0, 0], // 0:vb, 1:ib
        start: gfx.vb.start,
        last: (gfx.vb.start + gfx.vb.count * num_faces >= vb.count) ? true : false,
        empty: false, // Is the buffer is empty?
    };
    // if(DEBUG.GFX.REMOVE_MESH) console.log('idx:', gfx.prog.idx, gfx.vb.idx, 'vb count:', vb.count, ' attributes from start:', gfx.vb.start, ' to:', gfx.vb.start+gfx.vb.count*num_faces)
    ret.counts[0] = vb.Remove_geometry(gfx, num_faces);
    // if (DEBUG.GFX.REMOVE_MESH) console.log('idx:', gfx.prog.idx, gfx.vb.idx, 'vb count:', vb.count)
    // if(DEBUG.GFX.REMOVE_MESH) console.log('vb count:', vb.count, ' remove:', ret.counts[0], ' attributes from start:', gfx.vb.start)
    ret.counts[1] = ib.Remove_geometry(num_faces);

    if (vb.count <= 0) ret.empty = true;

    if(ret.empty) vb.Reset();


    return ret;
}

export function Gl_remove_geometry_with_alpha(gfx, num_faces = 1) {

    GlSetColorAlpha(gfx, 0, num_faces);
}

export function Gl_set_vb_mesh_priority(progs_groupidx, progidx, vbIdx, meshIdx, meshCount) {

    const vb = Gl_progs_get_vb_byidx(progs_groupidx, progidx, vbIdx);

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


    // 'Slide' all other meshes to the left by one mesh
    let start = vb.meshes[meshIdx].vb.start;
    let k = start;
    let meshNewIdx = meshIdx;

    for (let i = meshIdx + meshCount; i < allmeshCount; i++) {
        const newStart = vb.meshes[i].vb.start;
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
     *  Finally add the mesh at the end of the vb
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

export function VbSetAttribColPerVertex(vb, start, count, stride, col, num_faces) {

    if (!Array.isArray(col[0])) {
        console.error('col should be an array of vec4 colors. @ GlBufferOps.js')
    }

    let index = start;
    const end = start + (count * num_faces);
    // let k = 0;

    // while (index < end) {
    //     vb.data[index++] = col[k][0];
    //     vb.data[index++] = col[k][1];
    //     vb.data[index++] = col[k][2];
    //     vb.data[index++] = col[k][3];

    //     index += stride;
    //     vb.count += V_COL_COUNT;
    //     k++;
    //     if (k >= 4) k = 0;
    // }
    let k = 1;

    while (index < end) {
        vb.data[index++] = col[k][0]; 
        vb.data[index++] = col[k][1];
        vb.data[index++] = col[k][1];
        vb.data[index++] = col[k][0];

        index += stride;
        vb.count += V_COL_COUNT;
        k++;
        if (k >= 3) k = 2;
    }
}
export function VbSetAttribCol(vb, start, count, stride, col, num_faces) {

    let index = start;
    const end = start + (count * num_faces);

    while (index < end) {

        vb.data[index++] = col[0];
        vb.data[index++] = col[1];
        vb.data[index++] = col[2];
        vb.data[index++] = col[3];

        index += stride;
        vb.count += V_COL_COUNT;
    }
}
export function VbSetAttribPos(vb, start, count, stride, dim, num_faces) {
    if (dim[0] === NaN || dim[1] === NaN) console.log('NaN value')

    let index = start;
    const end = start + (count * num_faces);

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
export function VbSetAttribTex(vb, start, count, stride, tex, num_faces) {

    let index = start;
    const end = start + (count * num_faces);

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
export function VbSetAttribWpos(vb, start, count, stride, pos, num_faces) {
    if (pos[0] === NaN || pos[1] === NaN || pos[2] === NaN)
        console.log('NaN value')
    let index = start;
    const end = start + (count * num_faces);

    while (index < end) {

        vb.data[index++] = pos[0];
        vb.data[index++] = pos[1];
        vb.data[index++] = pos[2];

        index += stride;
        vb.count += V_WPOS_TIME_COUNT;
    }
}
export function VbSetAttrSdf(vb, start, count, stride, sdf_params) {

    let index = start;
    const end = start + count;

    while (index < end) {

        vb.data[index++] = sdf_params[0];
        vb.data[index++] = sdf_params[1];

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
export function VbSetAttrRoundCorner(vb, start, count, stride, radius, num_faces) {

    let index = start;
    const end = start + (count * num_faces);

    while (index < end) {

        vb.data[index++] = radius;

        index += stride;
        vb.count++; // for the rest style attributes
    }
}
export function VbSetAttrBorderWidth(vb, start, count, stride, border, num_faces) {

    let index = start;
    const end = start + (count * num_faces);

    while (index < end) {

        vb.data[index++] = border;

        index += stride;
        vb.count++; // for the rest style attributes
    }
}
export function VbSetAttrBorderFeather(vb, start, count, stride, feather, num_faces) {

    let index = start;
    const end = start + (count * num_faces);

    while (index < end) {

        vb.data[index++] = feather;

        index += stride;
        vb.count++; // for the rest style attributes
    }
}
export function VbSetAttrTime(vb, start, count, stride, time, num_faces) {

    let index = start;
    const end = start + (count * num_faces);

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
            vb.count++;
            if (cnt2 >= len) cnt2 = 0;
        }

        cnt += stride - attribSize;
    }
}





/* * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * *
 * 
 */
export function GlSetColorPerVertex(gfxInfo, color, num_faces = 1) {

    /**DEBUG*/if (gfxInfo === null) { alert('GFX is null. @ GlSetColor()'); }
    
    const progs = Gl_progs_get_group(gfxInfo.progs_groupidx);
    const vb = progs.buffer[gfxInfo.prog.idx].vb[gfxInfo.vb.idx];

    let index = gfxInfo.vb.start + progs.buffer[gfxInfo.prog.idx].shaderinfo.attributes.offset.col;
    let verts = num_faces * gfxInfo.vertsPerRect;
    let stride = gfxInfo.attribsPerVertex - V_COL_COUNT;

    if (gfxInfo.sid.attr & SID.ATTR.COL4_PER_VERTEX) {

        let k = 0;
        while (verts) {

            vb.data[index++] = color[k][0];
            vb.data[index++] = color[k][1];
            vb.data[index++] = color[k][0];
            vb.data[index++] = color[k][3];

            index += stride;
            vb.count += V_COL_COUNT;
            k++;
            if (k >= 4) k = 0;
            verts--;
        }
    }

    vb.needsUpdate = true;
}
export function GlSetColor(gfxInfo, color, num_faces = 1) {

    /**DEBUG*/if (gfxInfo === null) { alert('GFX is null. @ GlSetColor()'); }
    
    const progs = Gl_progs_get_group(gfxInfo.progs_groupidx);
    const vb = progs.buffer[gfxInfo.prog.idx].vb[gfxInfo.vb.idx];

    let index = gfxInfo.vb.start + progs.buffer[gfxInfo.prog.idx].shaderinfo.attributes.offset.col;
    let verts = num_faces * gfxInfo.vertsPerRect;
    let stride = gfxInfo.attribsPerVertex - V_COL_COUNT;

    // if (gfxInfo.sid.attr & SID.ATTR.COL4_PER_VERTEX) {

    //     let k = 0;
    //     while (verts) {

    //         vb.data[index++] = color[k][0];
    //         vb.data[index++] = color[k][1];
    //         vb.data[index++] = color[k][0];
    //         vb.data[index++] = color[k][3];

    //         index += stride;
    //         vb.count += V_COL_COUNT;
    //         k++;
    //         if (k >= 4) k = 0;
    //         verts--;
    //     }

    // }

    while (verts) {

        vb.data[index++] = color[0]; // Move mesh's x pos by amt
        vb.data[index++] = color[1]; // Move mesh's x pos by amt
        vb.data[index++] = color[2]; // Move mesh's x pos by amt
        vb.data[index++] = color[3]; // Move mesh's x pos by amt

        index += stride; // Go to next vertice's pos. +1 for skipping pos.z
        verts--;
    }
    vb.needsUpdate = true;
}
export function GlSetColorAlpha(gfxInfo, val, num_faces) {

    const progs = Gl_progs_get_group(gfxInfo.progs_groupidx);
    const vb = progs.buffer[gfxInfo.prog.idx].vb[gfxInfo.vb.idx];

    let index = gfxInfo.vb.start + progs.buffer[gfxInfo.prog.idx].shaderinfo.attributes.offset.col;
    let verts = num_faces * gfxInfo.vertsPerRect;
    let stride = gfxInfo.attribsPerVertex - progs.buffer[gfxInfo.prog.idx].shaderinfo.attributes.size.col;

    let i = 0;
    while (verts) {

        index += 3;
        vb.data[index++] = val; // Move mesh's x pos by amt

        index += stride; // Go to next vertice's pos. +1 for skipping pos.z
        verts--;
    }
    vb.needsUpdate = true;
}
export function GlSetDim(gfxInfo, dim, num_faces = 1) {

    const progs = Gl_progs_get_group(gfxInfo.progs_groupidx);
    const vb = progs.buffer[gfxInfo.prog.idx].vb[gfxInfo.vb.idx];

    let index = gfxInfo.vb.start + progs.buffer[gfxInfo.prog.idx].shaderinfo.attributes.offset.pos;
    let faces = num_faces;
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
    vb.needsUpdate = true;
}
export function GlSetDimY(gfxInfo, y, num_faces = 1) {

    const progs = Gl_progs_get_group(gfxInfo.progs_groupidx);
    const vb = progs.buffer[gfxInfo.prog.idx].vb[gfxInfo.vb.idx];

    let index = gfxInfo.vb.start + progs.buffer[gfxInfo.prog.idx].shaderinfo.attributes.offset.pos + 1;
    let faces = num_faces;
    let stride = gfxInfo.attribsPerVertex - (V_POS_COUNT-1);

    while (faces) {

        vb.data[index++] = y;
        index += stride;

        vb.data[index++] = -y;
        index += stride;

        vb.data[index++] = y;
        index += stride;

        vb.data[index++] = -y;
        index += stride;

        faces--;
    }
    vb.needsUpdate = true;
}
export function GlSetTex(gfxInfo, uvs, num_faces = 1) {

    const progs = Gl_progs_get_group(gfxInfo.progs_groupidx);
    const vb = progs.buffer[gfxInfo.prog.idx].vb[gfxInfo.vb.idx];

    let index = gfxInfo.vb.start + progs.buffer[gfxInfo.prog.idx].shaderinfo.attributes.offset.tex;
    let numTimes = num_faces;
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
export function GlMoveXY(gfxInfo, wpos, num_faces = 1) {

    const progs = Gl_progs_get_group(gfxInfo.progs_groupidx);
    const vb = progs.buffer[gfxInfo.prog.idx].vb[gfxInfo.vb.idx];

    let index = gfxInfo.vb.start + progs.buffer[gfxInfo.prog.idx].shaderinfo.attributes.offset.wposTime;
    let verts = num_faces * gfxInfo.vertsPerRect;
    let stride = gfxInfo.attribsPerVertex - V_WPOS_COUNT;

    while (verts) {

        vb.data[index++] += wpos[0]; // Move mesh's x pos by amt
        vb.data[index++] += wpos[1]; // Move mesh's y pos by amt
        index++

        index += stride; // Go to next vertice's pos. +1 for skipping pos.z
        verts--;
    }
    vb.needsUpdate = true;
}
export function GlMoveXYZ(gfxInfo, wpos, num_faces = 1) {

    const progs = Gl_progs_get_group(gfxInfo.progs_groupidx);
    const vb = progs.buffer[gfxInfo.prog.idx].vb[gfxInfo.vb.idx];

    let index = gfxInfo.vb.start + progs.buffer[gfxInfo.prog.idx].shaderinfo.attributes.offset.wposTime;
    let verts = num_faces * gfxInfo.vertsPerRect;
    const stride = gfxInfo.attribsPerVertex - V_WPOS_COUNT;

    while (verts) {

        vb.data[index++] += wpos[0]; // Move mesh's x pos by amt
        vb.data[index++] += wpos[1]; // Move mesh's y pos by amt
        vb.data[index++] += wpos[2]; // Move mesh's y pos by amt

        index += stride; // Go to next vertice's pos. +1 for skipping pos.z
        verts--;
    }
    vb.needsUpdate = true;
}

export function GlSetWpos(gfxInfo, pos, num_faces = 1) {

    const progs = Gl_progs_get_group(gfxInfo.progs_groupidx);
    const vb = progs.buffer[gfxInfo.prog.idx].vb[gfxInfo.vb.idx];

    let index = gfxInfo.vb.start + progs.buffer[gfxInfo.prog.idx].shaderinfo.attributes.offset.wposTime;
    let verts = num_faces * gfxInfo.vertsPerRect;
    let stride = gfxInfo.attribsPerVertex - V_WPOS_COUNT;

    while (verts) {

        vb.data[index++] = pos[0];
        vb.data[index++] = pos[1];
        vb.data[index++] = pos[2];


        index += stride; // Go to next vertice's pos. +1 for skipping pos.z
        verts--;
    }
    vb.needsUpdate = true;
}
export function GlSetWposXY(gfxInfo, pos, num_faces = 1) {

    const progs = Gl_progs_get_group(gfxInfo.progs_groupidx);
    const vb = progs.buffer[gfxInfo.prog.idx].vb[gfxInfo.vb.idx];

    let index = gfxInfo.vb.start + progs.buffer[gfxInfo.prog.idx].shaderinfo.attributes.offset.wposTime;
    let verts = num_faces * gfxInfo.vertsPerRect;
    let stride = gfxInfo.attribsPerVertex - V_WPOS_COUNT;

    while (verts) {

        vb.data[index++] = pos[0];
        vb.data[index++] = pos[1];
        index++

        index += stride; // Go to next vertice's pos. +1 for skipping pos.z
        verts--;
    }
    vb.needsUpdate = true;
}
export function GlSetWposX(gfxInfo, posx, num_faces = 1) {

    const progs = Gl_progs_get_group(gfxInfo.progs_groupidx);
    const vb = progs.buffer[gfxInfo.prog.idx].vb[gfxInfo.vb.idx];

    let index = gfxInfo.vb.start + progs.buffer[gfxInfo.prog.idx].shaderinfo.attributes.offset.wposTime;
    let faces = num_faces; // Number of vertices
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
    vb.needsUpdate = true;
}
export function GlSetWposY(gfxInfo, posy, num_faces = 1) {

    const progs = Gl_progs_get_group(gfxInfo.progs_groupidx);
    const vb = progs.buffer[gfxInfo.prog.idx].vb[gfxInfo.vb.idx];

    let index = gfxInfo.vb.start + progs.buffer[gfxInfo.prog.idx].shaderinfo.attributes.offset.wposTime + 1;
    let faces = num_faces; // Number of vertices
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
    vb.needsUpdate = true;
}
export function GlSetWposZ(gfxInfo, posz, num_faces = 1) {

    const progs = Gl_progs_get_group(gfxInfo.progs_groupidx);
    const vb = progs.buffer[gfxInfo.prog.idx].vb[gfxInfo.vb.idx];

    let index = gfxInfo.vb.start + progs.buffer[gfxInfo.prog.idx].shaderinfo.attributes.offset.wposTime + 2;
    let faces = num_faces; // Number of vertices
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
    vb.needsUpdate = true;
}
export function GlSetAttrRoundCorner(gfxInfo, val) {

    const progs = Gl_progs_get_group(gfxInfo.progs_groupidx);
    const vb = progs.buffer[gfxInfo.prog.idx].vb[gfxInfo.vb.idx];

    let index = gfxInfo.vb.start + progs.buffer[gfxInfo.prog.idx].shaderinfo.attributes.offset.style + V_ROUND_CORNER_STRIDE;
    let verts = num_faces * gfxInfo.vertsPerRect;
    let stride = gfxInfo.attribsPerVertex - 1; // Minus 1 attr that we are setting

    while (verts) {

        vb.data[index++] = val;

        index += stride; // Go to next vertice's borderWidth attrib.
        verts--;
    }
    vb.needsUpdate = true;
}
export function GlSetAttrBorderWidth(gfxInfo, val) {

    const progs = Gl_progs_get_group(gfxInfo.progs_groupidx);
    const vb = progs.buffer[gfxInfo.prog.idx].vb[gfxInfo.vb.idx];

    let index = gfxInfo.vb.start + progs.buffer[gfxInfo.prog.idx].shaderinfo.attributes.offset.style + V_BORDER_WIDTH_STRIDE;
    let verts = num_faces * gfxInfo.vertsPerRect;
    let stride = gfxInfo.attribsPerVertex - 1; // Minus 1 attr that we are setting

    while (verts) {

        vb.data[index++] = val;

        index += stride; // Go to next vertice's borderWidth attrib.
        verts--;
    }
    vb.needsUpdate = true;
}
export function GlSetAttrBorderFeather(gfxInfo, val) {

    const progs = Gl_progs_get_group(gfxInfo.progs_groupidx);
    const vb = progs.buffer[gfxInfo.prog.idx].vb[gfxInfo.vb.idx];

    let index = gfxInfo.vb.start + progs.buffer[gfxInfo.prog.idx].shaderinfo.attributes.offset.style + V_BORDER_FEATHER_STRIDE;
    let verts = num_faces * gfxInfo.vertsPerRect;
    let stride = gfxInfo.attribsPerVertex - 1; // Minus 1 attr that we are setting

    while (verts) {

        vb.data[index++] = val;

        index += stride; // Go to next vertice's borderWidth attrib.
        verts--;
    }
    vb.needsUpdate = true;
}
export function GlSetAttrTime(gfxInfo, val) {

    const progs = Gl_progs_get_group(gfxInfo.progs_groupidx);
    const vb = progs.buffer[gfxInfo.prog.idx].vb[gfxInfo.vb.idx];

    let index = gfxInfo.vb.start + progs.buffer[gfxInfo.prog.idx].shaderinfo.attributes.offset.time;
    let verts = num_faces * gfxInfo.vertsPerRect;
    let stride = gfxInfo.attribsPerVertex - V_TIME_COUNT;

    while (verts) {

        vb.data[index++] = val;

        index += stride; // Go to next vertice's borderWidth attrib.
        verts--;
    }
    vb.needsUpdate = true; // HACK. // TODO suppose to be implemented in MESH????
}
export function GlSetAttrSdfParams(gfxInfo, val) {

    const progs = Gl_progs_get_group(gfxInfo.progs_groupidx);
    const vb = progs.buffer[gfxInfo.prog.idx].vb[gfxInfo.vb.idx];

    let index = gfxInfo.vb.start + progs.buffer[gfxInfo.prog.idx].shaderinfo.attributes.offset.sdf;
    let verts = num_faces * gfxInfo.vertsPerRect;
    let stride = gfxInfo.attribsPerVertex - V_SDF_COUNT;

    while (verts) {

        vb.data[index++] = val[0];
        vb.data[index++] = val[1];

        index += stride; // Go to next vertice's borderWidth attrib.
        verts--;
    }
    vb.needsUpdate = true;
}
export function GlSetAttrSdfParamsOuter(gfxInfo, val) {

    const progs = Gl_progs_get_group(gfxInfo.progs_groupidx);
    const vb = progs.buffer[gfxInfo.prog.idx].vb[gfxInfo.vb.idx];

    let index = gfxInfo.vb.start + progs.buffer[gfxInfo.prog.idx].shaderinfo.attributes.offset.sdf;
    let verts = num_faces * gfxInfo.vertsPerRect;
    let stride = gfxInfo.attribsPerVertex - V_SDF_COUNT;

    while (verts) {

        index++; // Skip sdf-inner param 
        vb.data[index++] = val;

        index += stride; // Go to next vertice's borderWidth attrib.
        verts--;
    }
    vb.needsUpdate = true;
}
export function GlSetAttrTex(gfxInfo, uvs) {

    const progs = Gl_progs_get_group(gfxInfo.progs_groupidx);
    const vb = progs.buffer[gfxInfo.prog.idx].vb[gfxInfo.vb.idx];

    let index = gfxInfo.vb.start + progs.buffer[gfxInfo.prog.idx].shaderinfo.attributes.offset.tex;

    let numTimes = num_faces;
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
/**
 * 
 * @param {*} gfxInfo 
 * @param {*} param 
 * @param {*} paramOffset: The attribute params1 is a 4 component vector. So we need the index of the element in the vector (as an offset).  
 */
export function GlSetAttrParams1(gfxInfo, param, paramOffset) {

    const progs = Gl_progs_get_group(gfxInfo.progs_groupidx);
    const vb = progs.buffer[gfxInfo.prog.idx].vb[gfxInfo.vb.idx];

    let index = gfxInfo.vb.start + progs.buffer[gfxInfo.prog.idx].shaderinfo.attributes.offset.params1 + paramOffset;
    let verts = num_faces * gfxInfo.vertsPerRect;
    let stride = gfxInfo.attribsPerVertex - 1;

    while (verts) {
        vb.data[index++] = param[paramOffset];
        index += stride;
        verts--;
    }
    vb.needsUpdate = true;
}

/** Set many meshes in a loop */
// Move all meshes from a buffer with the starting indexes
export function GlSetWposXYMany(gfxInfo, pos, startsBuffer) {

    const progs = Gl_progs_get_group(gfxInfo.progs_groupidx);
    const vb = progs.buffer[gfxInfo.prog.idx].vb[gfxInfo.vb.idx];

    let index = gfxInfo.vb.start + progs.buffer[gfxInfo.prog.idx].shaderinfo.attributes.offset.wposTime;
    let verts = num_faces * gfxInfo.vertsPerRect;
    let stride = gfxInfo.attribsPerVertex - V_WPOS_COUNT;

    let numMeshes = startsBuffer.length - 1;
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

export function GlRotate2D(gfxInfo, dim, angle) {

    const progs = Gl_progs_get_group(gfxInfo.progs_groupidx);
    const vb = progs.buffer[gfxInfo.prog.idx].vb[gfxInfo.vb.idx];

    let index = gfxInfo.vb.start + progs.buffer[gfxInfo.prog.idx].shaderinfo.attributes.offset.pos;
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


/*****************************************************************************************************************/
// Geometry3D
/** */
export function GlRotateY3D2(mesh, angle) {

    const gfxInfo = mesh.gfx;
    const dim = mesh.geom.dim;

    const progs = Gl_progs_get_group(gfxInfo.progs_groupidx);
    const vb = progs.buffer[gfxInfo.prog.idx].vb[gfxInfo.vb.idx];

    let index = gfxInfo.vb.start + progs.buffer[gfxInfo.prog.idx].shaderinfo.attributes.offset.pos;
    let stride = gfxInfo.attribsPerVertex;
    let vertices = num_faces * gfxInfo.vertsPerRect;

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
export function GlRotateX3D(mesh, angle) {

    const gfxInfo = mesh.gfx;
    const dim = mesh.geom.dim;
    const faces = mesh.geom.faces;
    let fLen = faces.length;

    const progs = Gl_progs_get_group(gfxInfo.progs_groupidx);
    const vb = progs.buffer[gfxInfo.prog.idx].vb[gfxInfo.vb.idx];

    let index = gfxInfo.vb.start + progs.buffer[gfxInfo.prog.idx].shaderinfo.attributes.offset.pos;
    let stride = gfxInfo.attribsPerVertex;

    const c = Math.cos(angle);
    const s = Math.sin(angle);
    const r = [c, -s, s, c,];


    const y = 1, z = 2;
    let ii = 0;

    const r1 = r[0] * dim[y],
        r2 = r[2] * dim[z],
        r3 = r[1] * dim[y],
        r4 = r[3] * dim[z];

    for (let i = 0; i < fLen; i++) {
        vb.data[index + y] = faces[ii + y] * r1 + faces[ii + z] * r2;
        vb.data[index + z] = faces[ii + y] * r3 + faces[ii + z] * r4;
        ii += 3;
        index += stride;
    }

    vb.needsUpdate = true;
}

/** */
export function GlRotateY3D(mesh, angle) {

    const gfxInfo = mesh.gfx;
    const dim = mesh.geom.dim;
    const faces = mesh.geom.faces;
    let fLen = faces.length;

    const progs = Gl_progs_get_group(gfxInfo.progs_groupidx);
    const vb = progs.buffer[gfxInfo.prog.idx].vb[gfxInfo.vb.idx];

    let index = gfxInfo.vb.start + progs.buffer[gfxInfo.prog.idx].shaderinfo.attributes.offset.pos;
    let stride = gfxInfo.attribsPerVertex;

    const c = Math.cos(angle);
    const s = Math.sin(angle);
    const r = [c, s, -s, c,];


    const x = 0, z = 2;
    let ii = 0;

    const r1 = r[0] * dim[x],
        r2 = r[2] * dim[z],
        r3 = r[1] * dim[x],
        r4 = r[3] * dim[z];

    for (let i = 0; i < fLen; i += 3) {
        vb.data[index + x] = faces[ii + x] * r1 + faces[ii + z] * r2;
        vb.data[index + z] = faces[ii + x] * r3 + faces[ii + z] * r4;
        // vb.data[index + x] = faces[xi+x] * r[0] * dim[x] + faces[zi+z] * r[2] * dim[z];
        // vb.data[index + z] = faces[xi+x] * r[1] * dim[x] + faces[zi+z] * r[3] * dim[z];
        ii += 3;
        index += stride;
    }

    vb.needsUpdate = true;
}

/** */
export function GlRotateZ3D(mesh, angle) {

    const gfxInfo = mesh.gfx;
    const dim = mesh.geom.dim;
    const faces = mesh.geom.faces;
    let fLen = faces.length;

    const progs = Gl_progs_get_group(gfxInfo.progs_groupidx);
    const vb = progs.buffer[gfxInfo.prog.idx].vb[gfxInfo.vb.idx];

    let index = gfxInfo.vb.start + progs.buffer[gfxInfo.prog.idx].shaderinfo.attributes.offset.pos;
    let stride = gfxInfo.attribsPerVertex;
    let vertices = num_faces * gfxInfo.vertsPerRect;

    const c = Math.cos(angle);
    const s = Math.sin(angle);
    const r = [c, -s, s, c,];

    const x = 0, y = 1;
    let ii = 0;

    const r1 = r[0] * dim[x],
        r2 = r[2] * dim[y],
        r3 = r[1] * dim[x],
        r4 = r[3] * dim[y];

    vertices = 4;
    for (let i = 0; i < fLen; i++) {

        vb.data[index + x] = faces[ii + x] * r1 + faces[ii + y] * r2;
        vb.data[index + y] = faces[ii + x] * r3 + faces[ii + y] * r4;
        ii += 3;
        index += stride;
    }

    vb.needsUpdate = true;
}

/** // TODO: Store the new pos and dim to the mesh for collision detection */
export function GlRotateXY3D(mesh, angle) {

    const gfxInfo = mesh.gfx;
    const dim = mesh.geom.dim;
    const faces = mesh.geom.faces;
    let fLen = faces.length;

    const progs = Gl_progs_get_group(gfxInfo.progs_groupidx);
    const vb = progs.buffer[gfxInfo.prog.idx].vb[gfxInfo.vb.idx];

    let index = gfxInfo.vb.start + progs.buffer[gfxInfo.prog.idx].shaderinfo.attributes.offset.pos;
    let stride = gfxInfo.attribsPerVertex;
    let vertices = num_faces * gfxInfo.vertsPerRect;

    const cos = Math.cos(angle);
    const sin = Math.sin(angle);

    ROT3D.SetRX(cos, sin)
    ROT3D.SetRY(cos, sin)
    ROT3D.SetRZ(cos, sin)

    const mat1 = Matrix3x3_3x3Mult(ROT3D.RZ, ROT3D.RY);
    const mat2 = mat1;

    const x = 0, y = 1, z = 2;
    let ii = 0;

    vertices = 4;
    for (let i = 0; i < fLen; i++) {
        vb.data[index + x] = faces[ii + x] * mat2[0] * dim[x] + faces[ii + y] * mat2[3] * dim[y] + faces[ii + z] * mat2[6] * dim[z];
        vb.data[index + y] = faces[ii + x] * mat2[1] * dim[x] + faces[ii + y] * mat2[4] * dim[y] + faces[ii + z] * mat2[7] * dim[z];
        vb.data[index + z] = faces[ii + x] * mat2[2] * dim[x] + faces[ii + y] * mat2[5] * dim[y] + faces[ii + z] * mat2[8] * dim[z];
        ii += 3;
        index += stride;
    }

    vb.needsUpdate = true;
}

