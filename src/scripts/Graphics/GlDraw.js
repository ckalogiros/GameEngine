import { Texture_get_texture_byidx } from '../Engine/Loaders/Textures/Texture.js';
import { GlUpdateVertexBufferData, GlUpdateIndexBufferData, GlUseProgram, GlBindVAO } from './Buffers/GlBuffers.js'
import { Renderqueue_get_active, Renderqueue_active_get_count } from '../Engine/Renderers/Renderer/RenderQueue.js';
import { Gl_progs_get } from './GlProgram.js';
import { Gl_texture_unit_bind } from './GlTextureUnit.js';
import { Framebuffer_get } from './Buffers/GlFrameBuffer.js';
import { Floor } from '../Helpers/Math/MathOperations.js';
import { Gl_ib_get_byidx } from './Buffers/IndexBuffer.js';



export function Gl_draw(gl) {

    const progs_group = Gl_progs_get();
    const drawQueue = Renderqueue_get_active();
    const drawQueueCount = Renderqueue_active_get_count();

    // const fb = FramebuffersGet();
    // if (fb.isActive) {
    //     gl.bindFramebuffer(gl.FRAMEBUFFER, fb.fb.glfb);
    //     gl.enable(gl.DEPTH_TEST);
    //     gl.depthMask(false);
    //     gl.viewport(0, 0, fb.fb.texture.width, fb.fb.texture.height);
    // }


    gl.clearColor(0.18, 0.18, 0.18, 1.0);
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);


    for (let i = 0; i < drawQueueCount; i++) {
        // for (let i = drawQueueCount-1; i >= 0 ; i--) {

        const progs_groupidx = drawQueue[i].progs_groupidx;
        const progidx = drawQueue[i].progidx;
        const vbidx = drawQueue[i].vbidx;

        const progs = progs_group.buffer[progs_groupidx];

        if (GL.BOUND_PROG_IDX !== progidx)
            GlUseProgram(progs.buffer[progidx].webgl_program, progidx)

        // Update all program uniforms
        progs.buffer[progidx].UniformsUpdate(gl);

        const vb = progs.buffer[progidx].vb[vbidx];
        // const ib = progs.buffer[progidx].ib[vbidx];
        const ib = Gl_ib_get_byidx(progs.buffer[progidx].ib[vbidx]);
        if(ib===undefined)
        console.log()

        if (GL.BOUND_VAO !== ib.vao)
            GlBindVAO(ib.vao)

        if (progs.buffer[progidx].sid.attr & SID.ATTR.TEX2) {
            if (vb.texidx !== INT_NULL) {
                const texture = Texture_get_texture_byidx(vb.texidx);
                Gl_texture_unit_bind(gl, texture);
                gl.uniform1i(progs.buffer[progidx].shaderinfo.uniforms.sampler, texture.idx);
                // console.log(progidx, vbidx, texture.idx)
            }
        }
        // console.log(progidx, vbidx)

        if (ib.needs_update)
            GlUpdateIndexBufferData(gl, ib)
        if (vb.needsUpdate)
            GlUpdateVertexBufferData(gl, vb);


        // if(vb.hasScissorBox) {
        //     gl.enable(gl.SCISSOR_TEST);
        //     gl.scissor(vb.scissorbox[0], vb.scissorbox[1], vb.scissorbox[2], vb.scissorbox[3]);
        //     // console.log(vb.scissorbox[0], vb.scissorbox[1], vb.scissorbox[2], vb.scissorbox[3])
        // }
        // if((progidx === 0 || progidx === 1) && (vbidx === 1)) {
        //     // gl.drawElements(gl.TRIANGLES, 6, gl.UNSIGNED_SHORT, 0);
        //     // gl.drawElements(gl.TRIANGLES, ib.count, gl.UNSIGNED_SHORT, 0);
        // }
        // else gl.drawElements(gl.TRIANGLES, ib.count, gl.UNSIGNED_SHORT, 0);

        // if(progidx === 2){
        //     const framebuffer = Framebuffer_get();
        //     // gl.viewport(600, 400, 400, 200);
        //     // gl.viewport(0, 0, VIEWPORT.WIDTH-100, VIEWPORT.HEIGHT-100);

        //     // gl.bindFramebuffer(gl.FRAMEBUFFER, framebuffer.fbo);

        //     gl.drawElements(gl.TRIANGLES, ib.count, gl.UNSIGNED_SHORT, 0);

        //     // gl.bindFramebuffer(gl.FRAMEBUFFER, null);
        //     // gl.viewport(0, 0, VIEWPORT.WIDTH, VIEWPORT.HEIGHT);
        // }
        // else 
        //     gl.drawElements(gl.TRIANGLES, ib.count, gl.UNSIGNED_SHORT, 0);

        // offset by: indices per rect times sizeof(gl.UNSIGNED_SHORT)
        // That is, to skip the first face: 6*2, the first 2 faces: 12*2
        // const faces = ib.count/6;
        // if(faces > 200 && progidx===1) {
        //     // const threshold = (faces - 60);
        //     // const start = Floor((threshold/2 * 6))
        //     // const end = Floor(ib.count-start)
        //     // console.log(ib.count, faces, 'from index:', start,' to:', end)
        //     gl.drawElements(gl.TRIANGLES, ib.count-96, gl.UNSIGNED_SHORT, 96);
        // }
        // else gl.drawElements(gl.TRIANGLES, ib.count, gl.UNSIGNED_SHORT, 0);
        
        gl.drawElements(gl.TRIANGLES, ib.count, gl.UNSIGNED_SHORT, 0);


        // if(progs_groupidx === 0 && progidx===0) gl.drawElements(gl.TRIANGLES, ib.count, gl.UNSIGNED_SHORT, 0);
        // else gl.drawElements(gl.POINTS, ib.count, gl.UNSIGNED_SHORT, 0);
        // gl.drawElements(gl.TRIANGLES, 6, gl.UNSIGNED_SHORT, 0);
        // gl.drawElements(gl.TRIANGLES, ib.count, gl.UNSIGNED_SHORT, 6);

        // gl.disable(gl.SCISSOR_TEST);
    }

    // const fb = FramebuffersGet(FRAMEBUFFERS_IDX.buffer0);
    // if (fb.isActive) {
    //     // FramebufferRenderToFramebuffer(drawQueue, drawQueueCount);
    //     FramebufferRenderToFramebuffer(fb.fbq.buffer, fb.fbq.count);
    //     FramebuffersDraw(FRAMEBUFFERS_IDX.buffer0);
    // }
}

// Pass an array[] as 'gfx_queue' from which to draw gfx buffers. 'gfx_queue' must be of struct: {progs_groupidx, progidx, vbidx}
export function Gl_draw_specific(gl, gfx_queue, framebuffer) {

    const progs_group = Gl_progs_get();
    const count = gfx_queue.length;


    gl.clearColor(0.18, 0.18, 0.18, 1.0);
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
    // const x = framebuffer.render_area.geom.pos[0];
    // const y = framebuffer.render_area.geom.pos[1];
    // const w = framebuffer.render_area.geom.dim[0];
    // const h = framebuffer.render_area.geom.dim[1];

    // gl.viewport(0, 0, 600, 600);
    // gl.viewport(0, 0, framebuffer.texture.width, framebuffer.texture.height);
    // gl.viewport(x, y, framebuffer.texture.width, framebuffer.texture.height);
    // gl.viewport(0, 0, VIEWPORT.WIDTH, VIEWPORT.HEIGHT);

    gl.enable(gl.DEPTH_TEST);
    gl.depthMask(false);

    for (let i = 0; i < count; i++) {

        const progs_groupidx = gfx_queue[i].progs_groupidx;
        const progidx = gfx_queue[i].progidx;
        const vbidx = gfx_queue[i].vbidx;

        const progs = progs_group.buffer[progs_groupidx];

        if (GL.BOUND_PROG_IDX !== progidx)
            GlUseProgram(progs.buffer[progidx].webgl_program, progidx)

        // Update all program uniforms
        progs.buffer[progidx].UniformsUpdate(gl);

        const vb = progs.buffer[progidx].vb[vbidx];
        const ib = progs.buffer[progidx].ib[vbidx];

        if (GL.BOUND_VAO !== ib.vao)
            GlBindVAO(ib.vao)


        if (progs.buffer[progidx].sid.attr & SID.ATTR.TEX2) {
            if (vb.texidx !== INT_NULL) {
                const texture = Texture_get_texture_byidx(vb.texidx);
                Gl_texture_unit_bind(gl, texture);
                gl.uniform1i(progs.buffer[progidx].shaderinfo.uniforms.sampler, texture.texid);
            }
        }

        if (ib.FLAGS.NEEDS_UPDATE)
            GlUpdateIndexBufferData(gl, ib)
        if (vb.needsUpdate)
            GlUpdateVertexBufferData(gl, vb);

        gl.drawElements(gl.TRIANGLES, ib.count, gl.UNSIGNED_SHORT, 0);
        // gl.drawElements(gl.TRIANGLES, 36, gl.UNSIGNED_SHORT, 0);

    }

    // gl.viewport(0, 0, VIEWPORT.WIDTH, VIEWPORT.HEIGHT);
    gl.bindFramebuffer(gl.FRAMEBUFFER, null);
    gl.bindTexture(gl.TEXTURE_2D, null);
    gl.disable(gl.DEPTH_TEST);
    gl.depthMask(true);

}
