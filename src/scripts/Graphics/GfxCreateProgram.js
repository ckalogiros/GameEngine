"use strict";
import { GlProgram } from './I_GlProgram.js'
import { LoadShaderProgram, GlCreateShaderInfo } from './GlShaders.js'
// Debug
// For Debuging
import { PrintShaderInfo, PrintAttributes } from './Debug/GfxDebug.js'
import { GlGetPrograms, GlGetProgramsCnt, GlIncrProgramsCnt, GlStoreProgram } from './GlProgram.js';
import { GlUseProgram } from './GlBuffers.js';


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
    progs[progIdx].shaderInfo.uniforms.paramsBuffer = new Float32Array(UNIFORM_PARAMS.defaultVertex.count);

    // Initialize Camera
    progs[progIdx].CameraSet();
    progs[progIdx].UniformsSetParamsBufferValue(Viewport.width, UNIFORM_PARAMS.defaultVertex.widthIdx);
    progs[progIdx].UniformsSetParamsBufferValue(Viewport.height, UNIFORM_PARAMS.defaultVertex.heightIdx);

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
    progs[progIdx].shaderInfo.uniforms.paramsBuffer = new Float32Array(UNIFORM_PARAMS.WHT.count);
    progs[progIdx].UniformsSetParamsBufferValue(progs[progIdx].timer.t, UNIFORM_PARAMS.WHT.timeIdx);
    progs[progIdx].SetTimer(0.1, UNIFORM_PARAMS.WHT.timeIdx);

    return progs;
}

/*
 * Generalized Program Web Gl Creation 
 */
export function GlCreateProgram(sid) {

    const prog = new GlProgram;
    const progIdx = GlGetProgramsCnt();
    GlIncrProgramsCnt();
    prog.info.progIdx = progIdx;
    prog.program = LoadShaderProgram(gfxCtx.gl, sid);

    GlUseProgram(prog.program, progIdx)
    prog.shaderInfo = GlCreateShaderInfo(gfxCtx.gl, prog.program, sid);
    PrintShaderInfo(prog);

    prog.info.sid = sid;
    GlStoreProgram(progIdx, prog);

    // Initialize Camera
    prog.CameraSet();

    /**
     * Create an array of uniform values.
     * UNIFORM_PARAMS.WHT = Width-Height-Time uniform parameters.
     * The Width and Height of the App's screen resolution, 
     * and a timer that can be different only between gl programs(prog.timer.t).
     * For unique timers for any specific mesh, USE time attribute.  
     * Some of the shaders use only 2 uniforms(Width and Height) and not the time.
     * That's ok from efficiency point of view, as the uniform is bound only here(once)
     */
    if (
        sid & SID.FX.FS_EXPLOSION_CIRCLE ||
        sid & SID.FX.FS_EXPLOSION_SIMPLE ||
        sid & SID.FX.FS_VOLUMETRIC_EXPLOSION ||
        sid & SID.FX.FS_CRAMBLE ||
        sid & SID.FX.FS_VORONOI_EXPLOSION ||
        sid & SID.FX.FS_GRADIENT ||
        sid & SID.FX.FS_V2DGFX ||
        sid & SID.DEF2 || sid & SID.DEF3 ||
        sid & SID.FX.FS_GLOW ||
        sid & SID.FX.FS_SHADOW ||
        sid & SID.FX.FS_NOISE ||
        sid & SID.TEST_SHADER
    ) {
        UNIFORM_PARAMS.WHT.progIdx = progIdx;
        // Create the uniforms buffer 
        prog.shaderInfo.uniforms.paramsBuffer = new Float32Array(UNIFORM_PARAMS.WHT.count);
        prog.UniformsSetParamsBufferValue(Viewport.width, UNIFORM_PARAMS.WHT.widthIdx);
        prog.UniformsSetParamsBufferValue(Viewport.height, UNIFORM_PARAMS.WHT.heightIdx);
        prog.UniformsSetParamsBufferValue(prog.timer.t, UNIFORM_PARAMS.WHT.timeIdx);
    }
    if (sid & SID.FX.FS_PARTICLES) {

        UNIFORM_PARAMS.particles.progIdx = progIdx;
        // Create the uniforms buffer 
        prog.shaderInfo.uniforms.paramsBuffer = new Float32Array(UNIFORM_PARAMS.particles.count);
        prog.UniformsSetParamsBufferValue(Viewport.width, UNIFORM_PARAMS.particles.widthIdx);
        prog.UniformsSetParamsBufferValue(Viewport.height, UNIFORM_PARAMS.particles.heightIdx);
        prog.UniformsSetParamsBufferValue(0, UNIFORM_PARAMS.particles.speedIdx);
    }
    if (sid & SID.FX.FS_VORTEX) {

        UNIFORM_PARAMS.particles.progIdx = progIdx;
        // Create the uniforms buffer 
        prog.shaderInfo.uniforms.paramsBuffer = new Float32Array(UNIFORM_PARAMS.VORTEX.count);
        prog.UniformsSetParamsBufferValue(Viewport.width, UNIFORM_PARAMS.VORTEX.widthIdx);
        prog.UniformsSetParamsBufferValue(Viewport.height, UNIFORM_PARAMS.VORTEX.heightIdx);
        prog.UniformsSetParamsBufferValue(0, UNIFORM_PARAMS.VORTEX.radiusIdx);
    }

    if (sid & SID.FX.FS_TWIST) {

        UNIFORM_PARAMS.WHT.progIdx = progIdx;
        // Create the uniforms buffer 
        prog.shaderInfo.uniforms.paramsBuffer = new Float32Array(UNIFORM_PARAMS.TWIST.count);
        prog.UniformsSetParamsBufferValue(Viewport.width, UNIFORM_PARAMS.TWIST.widthIdx);
        prog.UniformsSetParamsBufferValue(Viewport.height, UNIFORM_PARAMS.TWIST.heightIdx);
        prog.UniformsSetParamsBufferValue(Viewport.height, UNIFORM_PARAMS.TWIST.timeIdx);
        prog.UniformsSetParamsBufferValue(Viewport.height, UNIFORM_PARAMS.TWIST.dirIdx);
        prog.SetTimer(0.1, UNIFORM_PARAMS.WHT.timeIdx);
        // Dir uniform is for the direction of the twist 
        prog.UniformsSetParamsBufferValue(1., UNIFORM_PARAMS.WHT.dirIdx);
    }
    
    PrintAttributes(gfxCtx.gl);

    return progIdx;
}

