"use strict";

import { GlGetPrograms } from "../GlProgram.js";


/**
 * Enable-Disable Debuging
 */
const GL_DEBUG_ATTRIBUTES     = true;
const GL_DEBUG_PROGRAM        = false;
const GL_DEBUG_SHADERS        = false;
const GL_DEBUG_SHADER_INFO    = false;
const GL_DEBUG_VERTEX_BUFFER  = true;
const GL_DEBUG_INDEX_BUFFER   = true;
const GL_DEBUG_BUFFERS_ALL    = true;



export function GetShaderTypeId(sid){

    let str = 'Shader Attributes: ';

    if(sid.shad)  str += 'Shader General Properties:'
    if(sid.shad & SID.SHAD.INDEXED)  str += 'Indexed Geometry.'
    if(sid.shad)  str += '\n'

    if(sid.attr)  str += 'Attribs:'
    if(sid.attr & SID.ATTR.COL4)     str += 'col4, '
    if(sid.attr & SID.ATTR.POS2)     str += 'pos2, '
    if(sid.attr & SID.ATTR.SCALE2)   str += 'scale2, '
    if(sid.attr & SID.ATTR.TEX2)     str += 'tex2, '
    if(sid.attr & SID.ATTR.WPOS_TIME4)    str += 'wpos3, time1, '
    if(sid.attr & SID.ATTR.WPOS_TIME4) str += 'wposTime4, '
    if(sid.attr & SID.ATTR.TIME)  str += 'time, '
    if(sid.attr & SID.ATTR.SDF)  str += 'Sdf, '
    if(sid.attr & (SID.ATTR.BORDER & SID.ATTR.FEATHER  & SID.ATTR.R_CORNERS))  str += 'round corners, border width, border feather, '
    if(sid.attr)  str += '\n'
    
    if(sid.unif)  str += 'Uniforms:'
    if(sid.unif & SID.UNIF.PROJECTION)  str += 'Projection Matrix, '
    if(sid.unif & SID.UNIF.U_BUFFER)  str += 'Uniform Buffer, '
    if(sid.unif & SID.UNIF.BUFFER_RES)  str += 'Send Screen Resolution, '
    if(sid.unif)  str += '\n'

    if(sid.pass)  str += 'Passes:'
    if(sid.pass & SID.PASS.COL4)  str += 'col4, '
    if(sid.pass & SID.PASS.DIM2)  str += 'dim2, '
    if(sid.pass & SID.PASS.RES2)  str += 'res2, '
    if(sid.pass & SID.PASS.TEX2)  str += 'tex2, '
    if(sid.pass & SID.PASS.TIME1)  str += 'time1, '
    if(sid.pass & SID.PASS.WPOS2)  str += 'wpos2, '
    if(sid.pass & SID.PASS)  str += 'Passes:'
    if(sid.pass)  str += '\n'

    return str;
}

/**
 * 
 * @param {*} gl 
 * @param {*} prog 
 * @returns 
 */
export function PrintAttributes() {
    if(!GL_DEBUG_ATTRIBUTES) return;

    
    const progs = GlGetPrograms();
    
    for(let i = 0; i < progs.length; i++){
        
        const prog = progs[i];        
        console.log('\n-[GL Enabled Attributes]-\nFor Shader Program: ', GetShaderTypeId(prog.sid))
        const attribsPerVertex = prog.shaderInfo.attribsPerVertex;
    
        // For Uniforms
        if (prog.shaderInfo.attributes.loc.col >= 0) {
            console.log('   COLOR: loc:', prog.shaderInfo.attributes.loc.col,
                ' count:', V_COL_COUNT, ' stride:', attribsPerVertex, 
                ' offset:', prog.shaderInfo.attributes.offset.col)
        }
        if (prog.shaderInfo.attributes.loc.wposTime >= 0) {
            console.log('   WPOS_TIME: loc:', prog.shaderInfo.attributes.loc.wposTime,
                ' count:', V_WPOS_TIME_COUNT, ' stride:', attribsPerVertex, 
                ' offset:', prog.shaderInfo.attributes.offset.wposTime)
        }
        if (prog.shaderInfo.attributes.loc.pos >= 0) {
            console.log('   POS: loc:', prog.shaderInfo.attributes.loc.pos,
                ' count:', V_POS_COUNT, ' stride:', attribsPerVertex, 
                ' offset:', prog.shaderInfo.attributes.offset.pos)
        }
        if (prog.shaderInfo.attributes.loc.tex >= 0) {
            console.log('   TEX: loc:', prog.shaderInfo.attributes.loc.tex,
                ' count:', V_TEX_COUNT, ' stride:', attribsPerVertex, 
                ' offset:', prog.shaderInfo.attributes.offset.tex)
        }
        if (prog.shaderInfo.attributes.loc.params1 >= 0) {
            console.log('   PARAMS1: loc:', prog.shaderInfo.attributes.loc.params1,
                ' count:', V_PARAMS1_COUNT, ' stride:', attribsPerVertex, 
                ' offset:', prog.shaderInfo.attributes.offset.params1)
        }
        if (prog.shaderInfo.attributes.loc.sdf >= 0) {
            console.log('   Sdf: loc:', prog.shaderInfo.attributes.loc.sdf,
                ' count:', V_SDF_COUNT, ' stride:', attribsPerVertex, 
                ' offset:', prog.shaderInfo.attributes.offset.sdf)
        }
        if (prog.shaderInfo.attributes.loc.style >= 0) {
            console.log('   RADIUS: loc:', prog.shaderInfo.attributes.roundLoc,
                ' count:', V_STYLE_COUNT, ' stride:', attribsPerVertex, 
                ' offset:', prog.shaderInfo.attributes.offset.style)
        }
        if (prog.shaderInfo.attributes.loc.time >= 0) {
            console.log('   TIME: loc:', prog.shaderInfo.attributes.loc.time,
                ' count:', V_TIME_COUNT, ' stride:', attribsPerVertex, 
                ' offset:', prog.shaderInfo.attributes.offset.time)
        }
    
        console.log('\n')
        console.log('\nGL Enable Uniforms:')
    
        if (prog.shaderInfo.uniforms.projection) {
            console.log('   Orthographic Projection: ', prog.shaderInfo.uniforms.projection)
        }
        if (prog.shaderInfo.uniforms.sampler) {
            console.log('   Texture Sampler: ', prog.shaderInfo.uniforms.sampler)
        }
        if (prog.shaderInfo.uniforms.uniformsBufferLoc) {
            console.log('   Sdf Font Params: ', prog.shaderInfo.uniforms.uniformsBufferLoc)
        }

    }

    console.log('\n\n')
}

/**
 * 
 * @param {*} prog 
 * @param {*} idx 
 */
export function PrintProgram(prog, idx){
    if(!GL_DEBUG_PROGRAM) return;
    console.log('-[Gl Program]-\nProgram index:', idx, ' program:', prog, ' sid:', GetShaderTypeId(prog.info.sid))
}


/**
 * 
 * @param {*} prog 
 * @param {*} idx 
 */
export function PrintShaderInfo(prog){
    if(!GL_DEBUG_SHADER_INFO) return;
    console.log('-[Gl Shader Info]-\n', prog.shaderInfo, ' sid:', GetShaderTypeId(prog.info.sid))
}
export function PrintVertexBuffer(vb){
    if(!GL_DEBUG_VERTEX_BUFFER) return;
    console.log('-[Gl Vertex Buffer]-\n', vb)
}
export function PrintVertexBufferDataAndNames(){
    if(!GL_DEBUG_VERTEX_BUFFER) return;
    
    const progs = GlGetPrograms();
    console.log('-[Gl Vertex Buffer]')
    for(let i=0; i<progs.length; i++){
        console.log('prog:', i)
        for(let j=0; j<progs[i].vertexBuffer.length; j++){
            console.log(
                'vbidx: ', j,
                'meshes: ', progs[i].vertexBuffer[j].debug.meshesNames,
                'data: ', progs[i].vertexBuffer[j].data,
            );
        }
    }
}
export function PrintVertexDataAll(){
    if(!GL_DEBUG_VERTEX_BUFFER) return;
    
    const progs = GlGetPrograms();
    console.log('-[Gl Vertex Buffer]-')
    for(let i=0; i<progs.length; i++){
        console.log(' progidx:', i)
        console.log('vb:', progs[i].vertexBuffer);
        
        // console.log('prog:', i);
        // for(let j=0; j<progs[i].vertexBuffer.length; j++){

        //     console.log(progs[i].vertexBuffer[j]);
        // }
    }

    // for(let i=0; i<progs.length; i++){
        
    //     console.log('prog:', i);
    //     for(let j=0; j<progs[i].vertexBuffer.length; j++){
    //         const a = {

    //             'idx: ': progs[i].vertexBuffer[j].idx,
    //             'needs Update: ': progs[i].vertexBuffer[j].needsUpdate,
    //             'show: ': progs[i].vertexBuffer[j].show,
    //             'vCount: ': progs[i].vertexBuffer[j].vCount,
    //             'size: ': progs[i].vertexBuffer[j].size,
    //         }
    //         console.log(
    //             'vbidx: ', j,
    //             'count: ', progs[i].vertexBuffer[j].count,
    //         );
    //         console.log(a);
    //     }
    // }
}
export function PrintVertexBufferAllPretty(){
    if(!GL_DEBUG_VERTEX_BUFFER) return;
    
    const progs = GlGetPrograms();
    for(let i=0; i<progs.length; i++){
        console.log('-[Gl Vertex Buffer]-')
        for(let j=0; j<progs[i].vertexBufferCount; j++){
            for(let k=0; k<progs[i].vertexBuffer[j].count; k++){
                console.log( 'vertex', k);
                console.log( 'color:')
                console.log( progs[i].vertexBuffer[j].data[k++], progs[i].vertexBuffer[j].data[k++], progs[i].vertexBuffer[j].data[k++], progs[i].vertexBuffer[j].data[k++])
                console.log('wpos:')
                console.log(progs[i].vertexBuffer[j].data[k++], progs[i].vertexBuffer[j].data[k++], progs[i].vertexBuffer[j].data[k++], progs[i].vertexBuffer[j].data[k++])
                console.log('vpos:', progs[i].vertexBuffer[j].data[k++],progs[i].vertexBuffer[j].data[k++],progs[i].vertexBuffer[j].data[k++])
                console.log(progs[i].vertexBuffer[j].data[k++])
                // for(let a=0; a<4; a++){
                //     console.log( ', color:', progs[i].vertexBuffer[j].data[k++])
                // }
                // for(let a=0; a<4; a++){
                //     console.log(', wpos', progs[i].vertexBuffer[j].data[k++])
                // }
                // for(let a=0; a<3; a++){
                //     console.log(', vpos', progs[i].vertexBuffer[j].data[k++])
                // }
            }
        }
    }
}
export function PrintIndexBuffer(ib){
    if(!GL_DEBUG_INDEX_BUFFER) return;
    console.log('-[Gl Index Buffer]-\n', ib)
}
export function PrintIndexBufferAll(){
    if(!GL_DEBUG_INDEX_BUFFER) return;
    
    const progs = GlGetPrograms();
    console.log('-[Gl Index Buffer]')
    for(let i=0; i<progs.length; i++){
        console.log('prog:', i)
        for(let j=0; j<progs[i].indexBuffer.length; j++){
            console.log(
                'ibidx: ', j,
                'count: ', progs[i].indexBuffer[j].count,
                'idx: ', progs[i].indexBuffer[j].idx,
                'needs Update: ', progs[i].indexBuffer[j].needsUpdate,
                'show: ', progs[i].indexBuffer[j].show,
                'vCount: ', progs[i].indexBuffer[j].vCount,
            );
        }
    }
}
export function PrintBuffersAll(){
    if(!GL_DEBUG_BUFFERS_ALL) return;
    
    console.log('-[Gl Print All GL Buffers]-')
    const progs = GlGetPrograms();
    for(let i=0; i<progs.length; i++){
        
        for(let j=0; j<progs[i].vertexBuffer.length; j++){
            console.log('   progIdx:', i, ' vbIdx:', j, ': ', progs[i].vertexBuffer[j])
            console.log('   progIdx:', i, ' ibIdx:', j, ': ', progs[i].indexBuffer[j])
        }
    }
}

export function PrintBuffersMeshesNames(){
    if(!GL_DEBUG_BUFFERS_ALL) return;
    
    console.log('-[Gl Print All GL Buffers Meshes Names]-')
    const progs = GlGetPrograms();
    for(let i=0; i<progs.length; i++){
        console.log('progIdx:', i, ': ')
        for(let j=0; j<progs[i].vertexBuffer.length; j++){
            for(let k=0; k<progs[i].vertexBuffer[j].debug.meshesNames.length; k++){
                console.log('   ', j, progs[i].vertexBuffer[j].debug.meshesNames[k])
            }
        }
    }
}
export function PrintBuffersAttribsCount(){
    if(!GL_DEBUG_BUFFERS_ALL) return;
    
    console.log('-[Gl Print All GL Buffers Attribs Count]-')
    const progs = GlGetPrograms();
    for(let i=0; i<progs.length; i++){
        for(let j=0; j<progs[i].vertexBuffer.length; j++){
            console.log('prog:', i, ' vb:', j, ' count:', progs[i].vertexBuffer[j].count, ' size:', progs[i].vertexBuffer[j].size)
            console.log('Index Buffer count:', progs[i].indexBuffer[j].count, ' size:', progs[i].indexBuffer[j].size)
        }
    }
}





