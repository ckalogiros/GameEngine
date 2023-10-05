import { TextureGetTextureByIdx } from '../Engine/Loaders/Textures/Texture.js';
import { GlUpdateVertexBufferData, GlUpdateIndexBufferData, GlUseProgram, GlBindVAO, GlBindTexture } from './Buffers/GlBuffers.js'
import { Renderqueue_get_active, Renderqueue_active_get_count } from '../Engine/Renderers/Renderer/RenderQueue.js';
import { Gl_progs_get } from './GlProgram.js';



export function GlDraw(gl) {

    const progs = Gl_progs_get();
    const drawQueue = Renderqueue_get_active();
    const drawQueueCount = Renderqueue_active_get_count();

    // const fb = FramebuffersGet();
    // if (fb.isActive) {
    //     gl.bindFramebuffer(gl.FRAMEBUFFER, fb.fb.glfb);
    //     gl.enable(gl.DEPTH_TEST);
    //     gl.depthMask(false);
    //     gl.viewport(0, 0, fb.fb.texture.width, fb.fb.texture.height);
    // }
    
    // Gfx_set_vb_show(fb.fb.gfxInfo.prog.idx, fb.fb.gfxInfo.vb.idx, false);
    // const drQ = Renderqueue_get();
    // drQ.Update();

    gl.clearColor(0.18, 0.18, 0.18, 1.0);
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);


    for (let i = 0; i < drawQueueCount; i++) {

        const progIdx = drawQueue[i].progIdx;
        const vbIdx = drawQueue[i].vbIdx;

        if(GL.BOUND_PROG_IDX !== progIdx)
            GlUseProgram(progs[progIdx].webgl_program, progIdx)
        
        // Update all program uniforms
        progs[progIdx].UniformsUpdate(gl);
        
        const vb = progs[progIdx].vertexBuffer[vbIdx];
        const ib = progs[progIdx].indexBuffer[vbIdx];
        
        if(GL.BOUND_VAO !== ib.vao) 
        GlBindVAO(ib.vao)
        
        if (progs[progIdx].sid.attr & SID.ATTR.TEX2) {
            if (vb.textidx !== INT_NULL) {
                const texture = TextureGetTextureByIdx(vb.textidx);
                GlBindTexture(texture);
                gl.uniform1i(progs[progIdx].shaderinfo.uniforms.sampler, texture.idx);
            }
        }

        if (ib.needsUpdate) 
            GlUpdateIndexBufferData(gl, ib)
        if (vb.needsUpdate) 
            GlUpdateVertexBufferData(gl, vb)

        gl.drawElements(gl.TRIANGLES, ib.count, gl.UNSIGNED_SHORT, 0);
        // gl.drawElements(gl.TRIANGLES, 6, gl.UNSIGNED_SHORT, 0);
        // gl.drawElements(gl.TRIANGLES, ib.count, gl.UNSIGNED_SHORT, 6);
    }
    
    // const fb = FramebuffersGet(FRAMEBUFFERS_IDX.buffer0);
    // if (fb.isActive) {
    //     // FramebufferRenderToFramebuffer(drawQueue, drawQueueCount);
    //     FramebufferRenderToFramebuffer(fb.fbq.buffer, fb.fbq.count);
    //     FramebuffersDraw(FRAMEBUFFERS_IDX.buffer0);
    // }
}
