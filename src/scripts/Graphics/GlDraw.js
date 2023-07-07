import { GlGetTexture } from './GlTextures.js';
import { GlUpdateVertexBufferData, GlUpdateIndexBufferData, GfxSetVbShow, GlUseProgram, GlBindVAO, GlBindTexture } from './Buffers/GlBuffers.js'
import { RenderQueueGetActive, RenderQueueGetActiveCount } from '../Engine/Renderer/RenderQueue.js';
import { GlGetPrograms } from './GlProgram.js';
import { FramebufferRenderToFramebuffer, FramebuffersDraw, FramebuffersGet } from './Buffers/Renderbuffer.js';
import { TimerGetGlobalTimer } from '../Engine/Timer/Timer.js';



export function GlDraw() {

    const gl = gfxCtx.gl;
    const progs = GlGetPrograms();
    const drawQueue = RenderQueueGetActive();
    const drawQueueCount = RenderQueueGetActiveCount();

    // const fb = FramebuffersGet();
    // if (fb.isActive) {
    //     gl.bindFramebuffer(gl.FRAMEBUFFER, fb.fb.glfb);
    //     gl.enable(gl.DEPTH_TEST);
    //     gl.depthMask(false);
    //     gl.viewport(0, 0, fb.fb.texture.width, fb.fb.texture.height);
    // }
    
    // GfxSetVbShow(fb.fb.gfxInfo.prog.idx, fb.fb.gfxInfo.vb.idx, false);
    // const drQ = RenderQueueGet();
    // drQ.Update();

    gl.clearColor(0.18, 0.18, 0.18, 1.0);
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);


    for (let i = 0; i < drawQueueCount; i++) {

        const progIdx = drawQueue[i].progIdx;
        const vbIdx = drawQueue[i].vbIdx;

        if(GL.BOUND_PROG_IDX !== progIdx)
            GlUseProgram(progs[progIdx].webgl_program, progIdx)
        
        if (progs[progIdx].timer.isActive) progs[progIdx].UpdateUniformTimer();
        if (progs[progIdx].uniformsNeedUpdate) progs[progIdx].UniformsUpdateUniformsBuffer(gl);
        
        
        const vb = progs[progIdx].vertexBuffer[vbIdx];
        const ib = progs[progIdx].indexBuffer[vbIdx];
        if(GL.BOUND_VAO !== ib.vao) GlBindVAO(ib.vao)

        
        if (progs[progIdx].sid.attr & SID.ATTR.TEX2) {
            if (vb.texIdx >= 0) {
                const texture = GlGetTexture(vb.texIdx);
                GlBindTexture(texture);
                gl.uniform1i(progs[progIdx].shaderInfo.uniforms.sampler, texture.idx);
            }
        }

        if (ib.needsUpdate) GlUpdateIndexBufferData(gl, ib)
        if (vb.needsUpdate) GlUpdateVertexBufferData(gl, vb)

        gl.drawElements(gl.TRIANGLES, ib.count, gl.UNSIGNED_SHORT, 0);
    }
    
    const fb = FramebuffersGet(FRAMEBUFFERS_IDX.buffer0);
    // if (fb.isActive) {
    //     // FramebufferRenderToFramebuffer(drawQueue, drawQueueCount);
    //     FramebufferRenderToFramebuffer(fb.fbq.buffer, fb.fbq.count);
    //     FramebuffersDraw(FRAMEBUFFERS_IDX.buffer0);
    // }
}
