"use strict";
import { GlProgram } from './GlProgram.js'
import { LoadShaderProgram, GlCreateShaderInfo } from './GlShaders.js'
// Debug
// For Debuging
import { PrintShaderInfo, PrintAttributes } from './Z_Debug/GfxDebug.js'
import { GlGetPrograms, GlGetProgramsCnt, GlIncrProgramsCnt, GlStoreProgram } from './GlProgram.js';
import { GlUseProgram } from './Buffers/GlBuffers.js';


/*
 * Initialize default Web Gl Program. 
 */
export function GfxCreatePrograms(gl) {

    const progs = GlGetPrograms();

    // Create default program for NON textured geometries
    let progIdx = GlGetProgramsCnt();
    GlIncrProgramsCnt();
    progs[progIdx] = new GlProgram;
    progs[progIdx].info.progIdx = progIdx;
    progs[progIdx].program = LoadShaderProgram(gl, SID_DEFAULT);

    GlUseProgram(progs[progIdx].program, progIdx)
    progs[progIdx].shaderInfo = GlCreateShaderInfo(gl, progs[progIdx].program, SID_DEFAULT);
    PrintShaderInfo(progs[progIdx]);

    progs[progIdx].info.sid = SID_DEFAULT;

    // Store globally the fire shader program index
    UNIFORM_PARAMS.defaultVertex.progIdx = progIdx;
    // Create the uniforms buffer 
    progs[progIdx].shaderInfo.uniforms.uniformsBuffer = new Float32Array(UNIFORM_PARAMS.defaultVertex.count);

    // Initialize Camera
    progs[progIdx].CameraSet();
    progs[progIdx].UniformsSetuniformsBufferValue(Viewport.width, UNIFORM_PARAMS.defaultVertex.widthIdx);
    progs[progIdx].UniformsSetuniformsBufferValue(Viewport.height, UNIFORM_PARAMS.defaultVertex.heightIdx);

    /**
     *  Create default program for SDF textured text
     */
    progIdx++;
    GlIncrProgramsCnt();
    progs[progIdx] = new GlProgram;
    progs[progIdx].info.progIdx = progIdx;
    progs[progIdx].program = LoadShaderProgram(gl, SID_DEFAULT_TEXTURE_SDF);

    GlUseProgram(progs[progIdx].program, progIdx)
    progs[progIdx].shaderInfo = GlCreateShaderInfo(gl, progs[progIdx].program, SID_DEFAULT_TEXTURE_SDF);
    PrintShaderInfo(progs[progIdx]);

    progs[progIdx].info.sid = SID_DEFAULT_TEXTURE_SDF;

    // Initialize Camera
    progs[progIdx].CameraSet();
    // Store globally the fire shader program index
    UNIFORM_PARAMS.sdf.progIdx = progIdx;

    /**
     *  Create default program for textured geometries
     */
    progIdx++;
    GlIncrProgramsCnt();
    progs[progIdx] = new GlProgram;
    progs[progIdx].info.progIdx = progIdx;
    progs[progIdx].program = LoadShaderProgram(gl, SID_DEFAULT_TEXTURE);

    // gl.useProgram(progs[progIdx].program);
    GlUseProgram(progs[progIdx].program, progIdx)
    progs[progIdx].shaderInfo = GlCreateShaderInfo(gl, progs[progIdx].program, SID_DEFAULT_TEXTURE);
    PrintShaderInfo(progs[progIdx]);

    progs[progIdx].info.sid = SID_DEFAULT_TEXTURE;

    // Initialize Camera
    progs[progIdx].CameraSet();
    // Store globally the fire shader program index
    UNIFORM_PARAMS.sdf.progIdx = progIdx;
    // Create the uniforms buffer 
    progs[progIdx].shaderInfo.uniforms.uniformsBuffer = new Float32Array(UNIFORM_PARAMS.WHT.count);
    progs[progIdx].UniformsSetuniformsBufferValue(progs[progIdx].timer.t, UNIFORM_PARAMS.WHT.timeIdx);
    progs[progIdx].SetTimer(0.1, UNIFORM_PARAMS.WHT.timeIdx);

    return progs;
}



