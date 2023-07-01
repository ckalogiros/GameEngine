"use strict";

// Global Gl Program object

let g_glPrograms = [];
let g_glProgramsCount = 0;


export function GlIncrProgramsCnt(){g_glProgramsCount++;}
/** Get the next free element's index*/
export function GlGetProgramsCnt(){return g_glProgramsCount;}
export function GlGetPrograms(){
    return g_glPrograms;
}

export function GlGetProgram(progIdx){
    return g_glPrograms[progIdx];
}

export function GlStoreProgram(progIdx, program){
    g_glPrograms[progIdx] = program;
}

export function GlGetVB(progIdx, vbIdx){
    return g_glPrograms[progIdx].vertexBuffer[vbIdx];
}

export function GlGetIB(progIdx, ibIdx){
    return g_glPrograms[progIdx].indexBuffer[ibIdx];
}