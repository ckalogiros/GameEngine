"use strict";

import { GlGetPrograms } from "../GlProgram.js";


/**
 * Enable-Disable Debuging
 */
const GL_DEBUG_ATTRIBUTES     = false;
const GL_DEBUG_PROGRAM        = false;
const GL_DEBUG_SHADERS        = false;
const GL_DEBUG_SHADER_INFO    = false;
const GL_DEBUG_VERTEX_BUFFER  = true;
const GL_DEBUG_INDEX_BUFFER   = false;
const GL_DEBUG_BUFFERS_ALL    = true;



export function GetShaderTypeId(sid){

    let str = 'Shader Attributes: ';

    if(sid & SID.ATTR.COL4)     str += 'col4, '
    if(sid & SID.ATTR.POS2)     str += 'pos2, '
    if(sid & SID.ATTR.SCALE2)   str += 'scale2, '
    if(sid & SID.ATTR.TEX2)     str += 'tex2, '
    // if(sid & SID.ATTR.WPOS3)    str += 'wpos3, '
    if(sid & SID.ATTR.WPOS_TIME4) str += 'wposTime4, '
    if(sid & SID.ATTR.TIME)  str += 'time, '
    if(sid & SID.ATTR.SDF_PARAMS)  str += 'round corners, border width, border feather, '

    return str;
}

/**
 * 
 * @param {*} gl 
 * @param {*} prog 
 * @returns 
 */
export function PrintAttributes(gl) {
    if(!GL_DEBUG_ATTRIBUTES) return;

    
    const progs = GlGetPrograms();
    
    for(let i = 0; i < progs.length; i++){
        
        const prog = progs[i];        
        console.log('\n-[GL Enabled Attributes]-\nFor Shader Program: ', GetShaderTypeId(prog.info.sid))
        const attribsPerVertex = prog.shaderInfo.attribsPerVertex;
    
        // For Uniforms
        if (prog.shaderInfo.attributes.colLoc >= 0) {
            console.log('   COLOR: loc:', prog.shaderInfo.attributes.colLoc,
                ' count:', V_COL_COUNT, ' stride:', attribsPerVertex, 
                ' offset:', prog.shaderInfo.colOffset)
        }
        if (prog.shaderInfo.attributes.posLoc >= 0) {
            console.log('   POS: loc:', prog.shaderInfo.attributes.posLoc,
                ' count:', V_POS_COUNT, ' stride:', attribsPerVertex, 
                ' offset:', prog.shaderInfo.posOffset)
        }
        if (prog.shaderInfo.attributes.scaleLoc >= 0) {
            console.log('   SCALE: loc:', prog.shaderInfo.attributes.scaleLoc,
                ' count:', V_SCALE_COUNT, ' stride:', attribsPerVertex, 
                ' offset:', prog.shaderInfo.scaleOffset)
        }
        if (prog.shaderInfo.attributes.texLoc >= 0) {
            console.log('   TEX: loc:', prog.shaderInfo.attributes.texLoc,
                ' count:', V_TEX_COUNT, ' stride:', attribsPerVertex, 
                ' offset:', prog.shaderInfo.texOffset)
        }
        if (prog.shaderInfo.attributes.wposTimeLoc >= 0) {
            console.log('   WPOS_TIME: loc:', prog.shaderInfo.attributes.wposTimeLoc,
                ' count:', V_WPOS_TIME_COUNT, ' stride:', attribsPerVertex, 
                ' offset:', prog.shaderInfo.wposTimeOffset)
        }
        if (prog.shaderInfo.attributes.params1Loc >= 0) {
            console.log('   PARAMS1: loc:', prog.shaderInfo.attributes.params1Loc,
                ' count:', V_PARAMS1_COUNT, ' stride:', attribsPerVertex, 
                ' offset:', prog.shaderInfo.params1Offset)
        }
        if (prog.shaderInfo.attributes.styleLoc >= 0) {
            console.log('   RADIUS: loc:', prog.shaderInfo.attributes.roundLoc,
                ' count:', V_STYLE_COUNT, ' stride:', attribsPerVertex, 
                ' offset:', prog.shaderInfo.styleOffset)
        }
        if (prog.shaderInfo.attributes.timeLoc >= 0) {
            console.log('   TIME: loc:', prog.shaderInfo.attributes.timeLoc,
                ' count:', V_TIME_COUNT, ' stride:', attribsPerVertex, 
                ' offset:', prog.shaderInfo.timeOffset)
        }
    
        console.log('\n')
        console.log('\nGL Enable Uniforms:')
    
        if (prog.shaderInfo.uniforms.orthoProj) {
            console.log('   Orthographic Projection: ', prog.shaderInfo.uniforms.orthoProj)
        }
        if (prog.shaderInfo.uniforms.sampler) {
            console.log('   Texture Sampler: ', prog.shaderInfo.uniforms.sampler)
        }
        if (prog.shaderInfo.uniforms.paramsBufferLoc) {
            console.log('   Sdf Font Params: ', prog.shaderInfo.uniforms.paramsBufferLoc)
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
export function PrintVertexBufferAll(){
    if(!GL_DEBUG_VERTEX_BUFFER) return;
    
    const progs = GlGetPrograms();
    for(let i=0; i<progs.length; i++){
        console.log('-[Gl Vertex Buffer]-')
        console.log( i, ': ', progs[i].vertexBuffer)
    }
}
export function PrintIndexBuffer(ib){
    if(!GL_DEBUG_INDEX_BUFFER) return;
    console.log('-[Gl Index Buffer]-\n', ib)
}
export function PrintIndexBufferAll(){
    if(!GL_DEBUG_INDEX_BUFFER) return;
    
    const progs = GlGetPrograms();
    for(let i=0; i<progs.length; i++){
        
        console.log('-[Gl Index Buffer]-\n ', i, ': ', progs[i].ib)
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





