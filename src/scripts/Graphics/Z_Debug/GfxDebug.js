"use strict";

import { Gl_ib_get_byidx } from "../Buffers/IndexBuffer.js";
import { Gl_progs_get } from "../GlProgram.js";


/**
 * Enable-Disable Debuging
 */
const GL_DEBUG_ATTRIBUTES = true;
const GL_DEBUG_PROGRAM = false;
const GL_DEBUG_SHADERS = false;
const GL_DEBUG_SHADER_INFO = false;
const GL_DEBUG_VERTEX_BUFFER = true;
const GL_DEBUG_INDEX_BUFFER = true;
const GL_DEBUG_BUFFERS_ALL = true;



export function GetShaderTypeId(sid) {

    let str = 'Shader Attributes: ';

    if (sid.shad) str += 'Shader General Properties:'
    if (sid.shad & SID.SHAD.INDEXED) str += 'Indexed Geometry.'
    if (sid.shad & SID.SHAD.PRE_MULTIPLIED_ALPHA) str += 'Premultiplied Alpha.'
    if (sid.shad) str += '\n'

    if (sid.attr) str += 'Attribs:'
    if (sid.attr & SID.ATTR.COL4) str += 'col4, '
    if (sid.attr & SID.ATTR.POS2) str += 'pos2, '
    if (sid.attr & SID.ATTR.SCALE2) str += 'scale2, '
    if (sid.attr & SID.ATTR.TEX2) str += 'tex2, '
    if (sid.attr & SID.ATTR.WPOS_TIME4) str += 'wpos3, time1, '
    if (sid.attr & SID.ATTR.WPOS_TIME4) str += 'wposTime4, '
    if (sid.attr & SID.ATTR.TIME) str += 'time, '
    if (sid.attr & SID.ATTR.SDF) str += 'Sdf, '
    if (sid.attr & (SID.ATTR.BORDER & SID.ATTR.FEATHER & SID.ATTR.R_CORNERS)) str += 'round corners, border width, border feather, '
    if (sid.attr) str += '\n'

    if (sid.unif) str += 'Uniforms:'
    if (sid.unif & SID.UNIF.PROJECTION) str += 'Projection Matrix, '
    if (sid.unif & SID.UNIF.U_BUFFER) str += 'Uniform Buffer, '
    if (sid.unif & SID.UNIF.BUFFER_RES) str += 'Send Screen Resolution, '
    if (sid.unif) str += '\n'

    if (sid.pass) str += 'Passes:'
    if (sid.pass & SID.PASS.COL4) str += 'col4, '
    if (sid.pass & SID.PASS.DIM2) str += 'dim2, '
    if (sid.pass & SID.PASS.RES2) str += 'res2, '
    if (sid.pass & SID.PASS.TEX2) str += 'tex2, '
    if (sid.pass & SID.PASS.TIME1) str += 'time1, '
    if (sid.pass & SID.PASS.WPOS2) str += 'wpos2, '
    if (sid.pass & SID.PASS) str += 'Passes:'
    if (sid.pass) str += '\n'

    return str;
}

/**
 * 
 * @param {*} gl 
 * @param {*} prog 
 * @returns 
 */
export function PrintAttributes() {
    if (!GL_DEBUG_ATTRIBUTES) return;


    const progs_group = Gl_progs_get();

    for (let i = 0; i < progs_group.count; i++) {

        const prog = progs_group.buffer[i];
        console.log('\n-[GL Enabled Attributes]-\nFor Shader Program: ', GetShaderTypeId(prog.sid))
        const attribsPerVertex = prog.shaderinfo.attribsPerVertex;

        // For Uniforms
        if (prog.shaderinfo.attributes.loc.col >= 0) {
            console.log('   COLOR: loc:', prog.shaderinfo.attributes.loc.col,
                ' count:', V_COL_COUNT, ' stride:', attribsPerVertex,
                ' offset:', prog.shaderinfo.attributes.offset.col)
        }
        if (prog.shaderinfo.attributes.loc.wposTime >= 0) {
            console.log('   WPOS_TIME: loc:', prog.shaderinfo.attributes.loc.wposTime,
                ' count:', V_WPOS_TIME_COUNT, ' stride:', attribsPerVertex,
                ' offset:', prog.shaderinfo.attributes.offset.wposTime)
        }
        if (prog.shaderinfo.attributes.loc.pos >= 0) {
            console.log('   POS: loc:', prog.shaderinfo.attributes.loc.pos,
                ' count:', V_POS_COUNT, ' stride:', attribsPerVertex,
                ' offset:', prog.shaderinfo.attributes.offset.pos)
        }
        if (prog.shaderinfo.attributes.loc.tex >= 0) {
            console.log('   TEX: loc:', prog.shaderinfo.attributes.loc.tex,
                ' count:', V_TEX_COUNT, ' stride:', attribsPerVertex,
                ' offset:', prog.shaderinfo.attributes.offset.tex)
        }
        if (prog.shaderinfo.attributes.loc.params1 >= 0) {
            console.log('   PARAMS1: loc:', prog.shaderinfo.attributes.loc.params1,
                ' count:', V_PARAMS1_COUNT, ' stride:', attribsPerVertex,
                ' offset:', prog.shaderinfo.attributes.offset.params1)
        }
        if (prog.shaderinfo.attributes.loc.sdf >= 0) {
            console.log('   Sdf: loc:', prog.shaderinfo.attributes.loc.sdf,
                ' count:', V_SDF_COUNT, ' stride:', attribsPerVertex,
                ' offset:', prog.shaderinfo.attributes.offset.sdf)
        }
        if (prog.shaderinfo.attributes.loc.style >= 0) {
            console.log('   RADIUS: loc:', prog.shaderinfo.attributes.roundLoc,
                ' count:', V_STYLE_COUNT, ' stride:', attribsPerVertex,
                ' offset:', prog.shaderinfo.attributes.offset.style)
        }
        if (prog.shaderinfo.attributes.loc.time >= 0) {
            console.log('   TIME: loc:', prog.shaderinfo.attributes.loc.time,
                ' count:', V_TIME_COUNT, ' stride:', attribsPerVertex,
                ' offset:', prog.shaderinfo.attributes.offset.time)
        }

        console.log('\n')
        console.log('\nGL Enable Uniforms:')

        if (prog.shaderinfo.uniforms.projection) {
            console.log('   Orthographic Projection: ', prog.shaderinfo.uniforms.projection)
        }
        if (prog.shaderinfo.uniforms.sampler) {
            console.log('   Texture Sampler: ', prog.shaderinfo.uniforms.sampler)
        }
        if (prog.shaderinfo.uniforms.uniformsBufferLoc) {
            console.log('   Sdf Font Params: ', prog.shaderinfo.uniforms.uniformsBufferLoc)
        }

    }

    console.log('\n\n')
}

/**
 * 
 * @param {*} prog 
 * @param {*} idx 
 */
export function PrintProgram(prog, idx) {
    if (!GL_DEBUG_PROGRAM) return;
    console.log('-[Gl Program]-\nProgram index:', idx, ' program:', prog, ' sid:', GetShaderTypeId(prog.info.sid))
}


/**
 * 
 * @param {*} prog 
 * @param {*} idx 
 */
export function PrintShaderInfo(prog) {
    if (!GL_DEBUG_SHADER_INFO) return;
    console.log('-[Gl Shader Info]-\n', prog.shaderinfo, ' sid:', GetShaderTypeId(prog.info.sid))
}
export function PrintVertexBuffer(vb) {
    if (!GL_DEBUG_VERTEX_BUFFER) return;
    console.log('-[Gl Vertex Buffer]-\n', vb)
}
export function PrintVertexBufferDataAndNames() {
    if (!GL_DEBUG_VERTEX_BUFFER) return;

    const progs_group = Gl_progs_get();
    console.log('-[Gl Vertex Buffer]')
    for (let k = 0; k < progs_group.count; k++) {
        for (let i = 0; i < progs_group.buffer[k].count; i++) {
            console.log('prog:', i)
            for (let j = 0; j < progs_group.buffer[k].buffer[i].vb.length; j++) {
                console.log(
                    'vbidx: ', j,
                    'meshes: ', progs_group.buffer[k].buffer[i].vb[j].debug.meshesNames,
                    'data: ', progs_group.buffer[k].buffer[i].vb[j].data,
                );
            }
        }
    }
}
export function PrintVertexDataAll() {
    if (!GL_DEBUG_VERTEX_BUFFER) return;

    const progs_group = Gl_progs_get();
    console.log('-[Gl Vertex Buffer]-')
    for (let k = 0; k < progs_group.count; k++) {
        const progs_group_name = PROGRAMS_GROUPS.GetName(k);
        console.log(`---[${progs_group_name}]-`)
        for (let i = 0; i < progs_group.buffer[k].count; i++) {
            console.log(' progidx:', i)
            console.log('vb:', progs_group.buffer[k].buffer[i].vb);
        }
    }
}

export function PrintVertexBufferAllPretty() {
    if (!GL_DEBUG_VERTEX_BUFFER) return;

    const progs_group = Gl_progs_get();
    for (let i = 0; i < progs_group.count; i++) {
        console.log('-[Gl Vertex Buffer]-')
        for (let j = 0; j < progs_group.buffer[i].vertexBufferCount; j++) {
            for (let k = 0; k < progs_group.buffer[i].vb[j].count; k++) {
                console.log('vertex', k);
                console.log('color:')
                console.log(progs_group.buffer[i].vb[j].data[k++], progs_group.buffer[i].vb[j].data[k++], progs_group.buffer[i].vb[j].data[k++], progs_group.buffer[i].vb[j].data[k++])
                console.log('wpos:')
                console.log(progs_group.buffer[i].vb[j].data[k++], progs_group.buffer[i].vb[j].data[k++], progs_group.buffer[i].vb[j].data[k++], progs_group.buffer[i].vb[j].data[k++])
                console.log('vpos:', progs_group.buffer[i].vb[j].data[k++], progs_group.buffer[i].vb[j].data[k++], progs_group.buffer[i].vb[j].data[k++])
                console.log(progs_group.buffer[i].vb[j].data[k++])
            }
        }
    }
}
export function PrintIndexBuffer(ib) {
    if (!GL_DEBUG_INDEX_BUFFER) return;

    const progs_group = Gl_progs_get();
    console.log('-[Gl Index Buffer]-\n', ib)
    for (let k = 0; k < progs_group.count; k++) {
        for (let i = 0; i < progs_group.buffer[k].count; i++) {
            console.log('prog:', i)
            console.log('Index buffers:', progs_group.buffer[k].buffer[i].ib)
        }
    }
}
export function PrintIndexBufferAll() {
    if (!GL_DEBUG_INDEX_BUFFER) return;

    const progs_group = Gl_progs_get();
    console.log('-[Gl Index Buffer All]')
    for (let k = 0; k < progs_group.count; k++) {
        for (let i = 0; i < progs_group.buffer[k].count; i++) {
            console.log('prog:', i)
            for (let j = 0; j < progs_group.buffer[k].buffer[i].ib.length; j++) {
                const ib = Gl_ib_get_byidx(progs_group.buffer[k].buffer[i].ib[j]);
                console.log(
                    'ibidx: ', j,
                    'count: ', ib.count,
                    'idx: ', ib.idx,
                    'needs Update: ', ib.needs_update,
                    'show: ', ib.show,
                    'vCount: ', ib.vCount,
                );
            }
        }
    }
}
export function PrintBuffersAll() {
    if (!GL_DEBUG_BUFFERS_ALL) return;

    console.log('-[Gl Print All GL Buffers]-')
    const progs_group = Gl_progs_get();
    for (let i = 0; i < progs_group.count; i++) {

        for (let j = 0; j < progs_group.buffer[i].vb.length; j++) {
            console.log('   progidx:', i, ' vbIdx:', j, ': ', progs_group.buffer[i].vb[j])
            console.log('   progidx:', i, ' ibIdx:', j, ': ', progs_group.buffer[i].ib[j])
        }
    }
}

export function PrintBuffersMeshesNames() {
    if (!GL_DEBUG_BUFFERS_ALL) return;

    console.log('-[Gl Print All GL Buffers Meshes Names]-')
    const progs_group = Gl_progs_get();
    for (let i = 0; i < progs_group.count; i++) {
        console.log('progidx:', i, ': ')
        for (let j = 0; j < progs_group.buffer[i].vb.length; j++) {
            for (let k = 0; k < progs_group.buffer[i].vb[j].debug.meshesNames.length; k++) {
                console.log('   ', j, progs_group.buffer[i].vb[j].debug.meshesNames[k])
            }
        }
    }
}
export function PrintBuffersAttribsCount() {
    if (!GL_DEBUG_BUFFERS_ALL) return;

    console.log('-[Gl Print All GL Buffers Attribs Count]-')
    const progs_group = Gl_progs_get();
    for (let i = 0; i < progs_group.count; i++) {
        for (let j = 0; j < progs_group.buffer[i].vb.length; j++) {
            console.log('prog:', i, ' vb:', j, ' count:', progs_group.buffer[i].vb[j].count, ' size:', progs_group.buffer[i].vb[j].size)
            console.log('Index Buffer count:', progs_group.buffer[i].ib[j].count, ' size:', progs_group.buffer[i].ib[j].size)
        }
    }
}





