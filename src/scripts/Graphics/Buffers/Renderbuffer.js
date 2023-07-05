"use=strict";

import { Rect } from "../../Engine/Drawables/Shapes/Rect.js";
import { GfxSetVbShow, GlBindTexture, GlBindVAO, GlUpdateIndexBufferData, GlUpdateVertexBufferData, GlUseProgram } from "./GlBuffers.js";
import { GlGetPrograms, GlGetVB } from "../GlProgram.js";
import { GlCreateTexture, GlGetTexture } from "../GlTextures.js";
import { AnimationsGet } from "../../Engine/Animations/Animations.js";
import { Min3 } from "../../Helpers/Math/MathOperations.js";
import { ShowTotalScore } from "../../Engine/Events/SceneEvents.js";
import { MeshBuffer, TempMesh } from "../../Engine/Drawables/MeshBuffer.js";


/* * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * *
 * RenderQueue's for Framebuffers 
 */
// const DRAWQUEUE_FRAMEBUFFERS_SIZE = 4;
class FrameBuffersQueue {
   buffer = [];
   count = 0;
   size = 0;

   constructor() {
      // this.size = DRAWQUEUE_FRAMEBUFFERS_SIZE;
      this.size = 0;
   }

   Init(size) {
      this.size = size;
      for (let i = 0; i < this.size; i++) {
         this.buffer[i] = { progIdx: INT_NULL, vbIdx: INT_NULL };
      }
   }
   Store(progIdx, vbIdx) {
      const freeidx = this.GetFreeElem();
      this.buffer[freeidx] = { progIdx: progIdx, vbIdx: vbIdx };
      this.buffer[freeidx].isActive = true;
      this.count++;
      if(this.count > this.size) alert(`Count exxeded size. Store(progIdx, vbIdx) - RenderBuffer.js`);
   }
   GetFreeElem() {
      for (let i = 0; i < this.size; i++) {
         if (!this.buffer[i].isActive)
            return i;
      }
      alert(`No more space in buffer to create a FrameBuffersQueue element. GetFreeElem() - RenderBuffer.js`);
   }
};



const FRAME_BUFFERS_SIZE = 4;

export class Framebuffer extends TempMesh {
   fbq; // To store the programs and vertex buffers that will be drawn in a specific Framebuffer.
   glfb;
   depthBuffer;
   texture;

   constructor(name, sceneIdx, sid, col, dim, scale, tex, pos, style, time) {
      super('Framebuffer-' + name, sid, col, dim, scale, tex, pos, style, null, null);
      this.gfxInfo = null;
      this.name = name;
      this.glfb = null;
      this.depthBuffer = null;
      this.texture = null;
      this.fbq = null;

   }

   Init(sceneIdx, name, sid) {
      const gl = gfxCtx.gl;
      // Create the texture that Gl will render to
      this.texture = GlCreateTexture('FrameBufferTexture0', gl, null);

      // Render Buffer
      this.depthBuffer = gl.createRenderbuffer();
      gl.bindRenderbuffer(gl.RENDERBUFFER, this.depthBuffer);
      //gl.bindRenderbuffer(gl.RENDERBUFFER, this.depthBuffer);
      gl.renderbufferStorage(gl.RENDERBUFFER, gl.DEPTH_COMPONENT16, this.texture.width, this.texture.height);
      // gl.renderbufferStorage(gl.RENDERBUFFER, gl.DEPTH24_STENCIL8, this.texture.width, this.texture.height);

      // Frame Buffer
      this.glfb = gl.createFramebuffer();
      if (!this.glfb) { alert('Could not create FrameBuffer.') }
      gl.bindFramebuffer(gl.FRAMEBUFFER, this.glfb);
      gl.framebufferTexture2D(gl.DRAW_FRAMEBUFFER, gl.COLOR_ATTACHMENT0, gl.TEXTURE_2D, this.texture.tex, this.texture.level);

      gl.bindFramebuffer(gl.FRAMEBUFFER, null);

      // Debug
      let e = gl.checkFramebufferStatus(gl.FRAMEBUFFER, null);
      if (e !== gl.FRAMEBUFFER_COMPLETE) {
         alert('FrameBbuffer is not Complete')
      }

      this.gfxInfo = GlAddMesh(this.sid | sid, this.mesh, 1, sceneIdx,
         this.name + name, GL_VB.NEW, NO_SPECIFIC_GL_BUFFER);

      this.fbq = new FrameBuffersQueue;


   }
   
   /**
    * Methods to set up and store vertex buffers that will be drawn in a framebuffer
    */
   FbqInit(size) {
      this.fbq.Init(size);
   }
   // fbqIdx is the same index as the framebuffer's index(1-1 ratio of the arrays)
   FbqStore(progIdx, vbIdx) {
      this.fbq.Store(progIdx, vbIdx);
   }
}




class Framebuffers extends MeshBuffer {
   animations = {
      dimCol: {
         amt: .996, // The rate at which the color will be dimmed
         min: .5, // The minimum color value where the color dimming will stop
      },
   };

   constructor() {
      super(FRAME_BUFFERS_SIZE, 'FrameBuffers');
      
   }
   Init(sceneIdx) {
      const tex = [0, 1, 1, 0];
      for (let i = 0; i < this.size; i++) {
         this.buffer[i] = new Framebuffer(
            'FreamBuffer' + i, sceneIdx,
            SID_DEFAULT_TEXTURE,
            WHITE, [Viewport.width / 2, Viewport.height / 2],
            [1, 1], tex,
            [OUT_OF_VIEW, OUT_OF_VIEW, 2], null, null
         );
      }
   }
   Create(sceneIdx, name, sid, dim, pos) {
      const idx = this.GetFreeElem();
      this.count++;
      // Catch buffer overflow
      if (this.count >= this.size) {
         console.log(`Max Size:${this.size}  current count:${this.count}`);
         alert(`ERROR. Buffer overflow for exlosions: name: ${this.name}`);
      }
      this.buffer[idx].Init(sceneIdx, name, sid);
      this.buffer[idx].isActive = true;
      if (pos !== null) this.buffer[idx].SetPosXY(pos);
      if (dim !== null) this.buffer[idx].SetDim(dim);
      // Connect the texture with the vertex buffer for text rendering. 
      const vb = GlGetVB(this.buffer[idx].gfxInfo.prog.idx, this.buffer[idx].gfxInfo.vb.idx);
      // Do not render the vertex buffer data of the rect that is to render the frame buffer texture
      vb.texIdx = this.buffer[idx].texture.idx; // Bind of the texture to the vertexbuffer
      return idx;
   }
   SetActive(idx, flag) {
      if (flag) {
         const width = Viewport.width / 2;
         const height = Viewport.height / 2;
         this.buffer[idx].isActive = true;
         this.buffer[idx].SetPosXY([width, height]);
      }
      else if (!flag) { // Deactivate Framebuffer
         this.buffer[idx].isActive = false;
         this.buffer[idx].SetPosXY([OUT_OF_VIEW, OUT_OF_VIEW]);
      }
   }

};

const framebuffers = new Framebuffers;

export function FramebuffersGet(idx) {
   return framebuffers.buffer[idx];
}
// export function FramebuffersDraw() {
//    framebuffers.Draw();
// }

export function FramebuffersCreate(sceneIdx, name, sid, dim, pos) {
   pos[0] -= 80;
   framebuffers.Create(sceneIdx, name, sid, dim, pos);
   return framebuffers;
}
export function FramebuffersInit(sceneIdx) {
   framebuffers.Init(sceneIdx);
}

export function FramebuffersSetActive(flag) {
   framebuffers.SetActive(0, flag);
}
export function FramebuffersCreateDimColorAnimation() {
   const animations = AnimationsGet();
   animations.Create(FramebuffersDimColorAnimStart, FramebuffersDimColorAnimStop, FRAMEBUFFERS_IDX.buffer0, 'Framebuffer');
}
function FramebuffersDimColorAnimStart(idx) {
   const col = framebuffers.buffer[idx].mesh.col;
   const minCol = Min3(col[0], col[1], col[2]);
   if (minCol >= framebuffers.animations.dimCol.min) {
      framebuffers.buffer[idx].DimColor2(framebuffers.animations.dimCol.amt);
      return true;
   }
   return false;
}
function FramebuffersDimColorAnimStop() {
   console.log('Framebuffers Dim Color Animation Stop')
   // This is the delay from hitting the last brick to the scene 'Count Total Score' 
   ShowTotalScore();
}


export function FramebuffersDraw(fbidx) {
   const gl = gfxCtx.gl;
   const progs = GlGetPrograms();
   const fb = FramebuffersGet(fbidx);

   const progIdx = fb.gfxInfo.prog.idx;
   const vbIdx = fb.gfxInfo.vb.idx;
   
   
   const vb = progs[progIdx].vertexBuffer[vbIdx];
   if(!vb.show) 
      return;
   const ib = progs[progIdx].indexBuffer[vbIdx];

   if(GL.BOUND_PROG_IDX !== progIdx)
         GlUseProgram(progs[progIdx].program, progIdx)

   if (progs[progIdx].timer.isOn) progs[progIdx].UpdateTimer();
   if (progs[progIdx].uniformsNeedUpdate) progs[progIdx].UniformsUpdateuniformsBuffer(gl);
   if(GL.BOUND_VAO !== ib.vao) GlBindVAO(ib.vao)

   
   if (progs[progIdx].info.sid & SID.ATTR.TEX2) {
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

// TODO: Unecessary drawing of all meshes twice, Just bind the frame buffer before the main draw loop.
// Is valid only for the framebuffer rendering at a textur = the width and height of the canvas
export function FramebufferRenderToFramebuffer(drawQueue, drawQueueCount) {

   const gl = gfxCtx.gl;
   const progs = GlGetPrograms();
   // const fb = GlFrameBuffer;
   const fb = FramebuffersGet(FRAMEBUFFERS_IDX.buffer0);

   gl.bindFramebuffer(gl.FRAMEBUFFER, fb.glfb);
   gl.clearColor(0.0, 0.0, 0.0, 1.0);
   gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
   // Set correct vieport
   gl.viewport(0, 0, fb.texture.width, fb.texture.height);

   // gl.enable(gl.BLEND);
   // gfxCtx.gl.blendFunc(gfxCtx.gl.GL_SRC_ALPHA, gfxCtx.gl.ONE_MINUS_SRC_ALPHA);

   gl.enable(gl.DEPTH_TEST);
   gl.depthMask(false);

   GfxSetVbShow(fb.gfxInfo.prog.idx, fb.gfxInfo.vb.idx, false); // Disable rendering the rect that the texture of the frameBuffer will be rendered to 

   for (let i = 0; i < drawQueueCount; i++) {

       const progIdx = drawQueue[i].progIdx;
       const vbIdx = drawQueue[i].vbIdx;
       
       const vb = progs[progIdx].vertexBuffer[vbIdx];
       if(vb.show) {
          const ib = progs[progIdx].indexBuffer[vbIdx];
          if(GL.BOUND_VAO !== ib.vao) GlBindVAO(ib.vao)
          
   
          if(GL.BOUND_PROG_IDX !== progIdx)
              GlUseProgram(progs[progIdx].program, progIdx)
          
          if (progs[progIdx].timer.isOn) progs[progIdx].UpdateTimer();
          if (progs[progIdx].uniformsNeedUpdate) progs[progIdx].UniformsUpdateuniformsBuffer(gl);
   
          
          if (progs[progIdx].info.sid & SID.ATTR.TEX2) {
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
   }
   GfxSetVbShow(fb.gfxInfo.prog.idx, fb.gfxInfo.vb.idx, true); // Enable rendering FrameBuffer's rect

   gl.bindFramebuffer(gl.FRAMEBUFFER, null);
   gl.bindTexture(gl.TEXTURE_2D, null);
   gl.disable(gl.DEPTH_TEST);
   gl.depthMask(true);

}