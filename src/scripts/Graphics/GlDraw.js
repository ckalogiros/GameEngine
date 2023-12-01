import { TextureGetTextureByIdx } from '../Engine/Loaders/Textures/Texture.js';
import { GlUpdateVertexBufferData, GlUpdateIndexBufferData, GlUseProgram, GlBindVAO, GlBindTexture } from './Buffers/GlBuffers.js'
import { Renderqueue_get_active, Renderqueue_active_get_count } from '../Engine/Renderers/Renderer/RenderQueue.js';
import { Gl_progs_get, Gl_progs_get_group, Gl_progs_get_programs_count } from './GlProgram.js';



export function GlDraw(gl) {

    // const progs = Gl_progs_get_group(1);
    // const progs = Gl_progs_get_group(0); // TODO!!!: Implement a way to address the default programs.
    const progs_group = Gl_progs_get(0); // TODO!!!: Implement a way to address the default programs.
    const drawQueue = Renderqueue_get_active();
    const drawQueueCount = Renderqueue_active_get_count();
    // console.log('\n\n\n')
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

        const progs_groupidx = drawQueue[i].progs_groupidx;
        const progidx = drawQueue[i].progidx;
        const vbidx = drawQueue[i].vbidx;

        const progs = progs_group.buffer[progs_groupidx]; 

        if(GL.BOUND_PROG_IDX !== progidx)
            GlUseProgram(progs.buffer[progidx].webgl_program, progidx)
        
        // Update all program uniforms
        progs.buffer[progidx].UniformsUpdate(gl);
        
        const vb = progs.buffer[progidx].vertexBuffer[vbidx];
        const ib = progs.buffer[progidx].indexBuffer[vbidx];
        
        if(GL.BOUND_VAO !== ib.vao) 
        GlBindVAO(ib.vao)
        
        if (progs.buffer[progidx].sid.attr & SID.ATTR.TEX2) {
            if (vb.textidx !== INT_NULL) {
                const texture = TextureGetTextureByIdx(vb.textidx);
                GlBindTexture(texture);
                gl.uniform1i(progs.buffer[progidx].shaderinfo.uniforms.sampler, texture.idx);
            }
        }

        if (ib.needsUpdate) 
            GlUpdateIndexBufferData(gl, ib)
        if (vb.needsUpdate) 
            GlUpdateVertexBufferData(gl, vb);

            // console.log(progs_groupidx, progidx, vbidx)
        gl.drawElements(gl.TRIANGLES, ib.count, gl.UNSIGNED_SHORT, 0);
        // if(progs_groupidx === 0 && progidx===0) gl.drawElements(gl.TRIANGLES, ib.count, gl.UNSIGNED_SHORT, 0);
        // else gl.drawElements(gl.POINTS, ib.count, gl.UNSIGNED_SHORT, 0);
        // gl.drawElements(gl.TRIANGLES, 6, gl.UNSIGNED_SHORT, 0);
        // gl.drawElements(gl.TRIANGLES, ib.count, gl.UNSIGNED_SHORT, 6);
    }

    // const debug_ui_prog = Gl_progs_get_group(1); // TODO!!!: Implement a way to adress the debug ui programs.
    // // const count = Gl_progs_get_programs_count(1);
    // for (let i = 0; i < debug_ui_prog.count; i++) {
        
    //     const progidx = i;
        // const vbcount = debug_ui_prog[progidx].vertexBufferCount;
        // for (let j = 0; j < vbcount; j++) {

        //     const vbidx = j;

        //     if(GL.BOUND_PROG_IDX !== progidx)
        //         GlUseProgram(debug_ui_prog[progidx].webgl_program, progidx)
            
        //     // Update all program uniforms
        //     debug_ui_prog[progidx].UniformsUpdate(gl);
            
        //     const vb = debug_ui_prog[progidx].vertexBuffer[vbidx];
        //     const ib = debug_ui_prog[progidx].indexBuffer[vbidx];
            
        //     if(GL.BOUND_VAO !== ib.vao) 
        //     GlBindVAO(ib.vao)
            
        //     if (debug_ui_prog[progidx].sid.attr & SID.ATTR.TEX2) {
        //         if (vb.textidx !== INT_NULL) {
        //             const texture = TextureGetTextureByIdx(vb.textidx);
        //             GlBindTexture(texture);
        //             gl.uniform1i(debug_ui_prog[progidx].shaderinfo.uniforms.sampler, texture.idx);
        //         }
        //     }

        //     if (ib.needsUpdate) 
        //         GlUpdateIndexBufferData(gl, ib)
        //     if (vb.needsUpdate) 
        //         GlUpdateVertexBufferData(gl, vb);

        //     gl.drawElements(gl.TRIANGLES, ib.count, gl.UNSIGNED_SHORT, 0);
        //     // gl.drawElements(gl.TRIANGLES, 6, gl.UNSIGNED_SHORT, 0);
        //     // gl.drawElements(gl.TRIANGLES, ib.count, gl.UNSIGNED_SHORT, 6);
        // }
    // }
    
    // const fb = FramebuffersGet(FRAMEBUFFERS_IDX.buffer0);
    // if (fb.isActive) {
    //     // FramebufferRenderToFramebuffer(drawQueue, drawQueueCount);
    //     FramebufferRenderToFramebuffer(fb.fbq.buffer, fb.fbq.count);
    //     FramebuffersDraw(FRAMEBUFFERS_IDX.buffer0);
    // }
}
