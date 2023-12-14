"use strict";

import { Texture_create_renderbuffer_texture, Texture_get_texture_byidx } from "../../Engine/Loaders/Textures/Texture";
import { Gl_draw_specific } from "../GlDraw";
import { Gl_renderbuffer_create } from "../GlRenderbuffer";

// SEE: ## Framebuffer VS Renderbuffer


/**
 * Logic: Framebuffer
      Have an array of framebuffers[]. Each frambuffer coresponds to a drawing 'Gl_draw()' command.
      Example: If we want to draw a widget to a framebuffer, we need to construct a framebuffer and do all the bellow.
  
 *    Each framebuffers has:
         1. fbo: webgl id.          gl.createFramebuffer()
         2.
            * texture: webgl texture to draw to.
            * OR
            * renderbuffer.
 *    We can create both texture(for color attachment) and renderbuffer(for depth or stencil), under a frame buffer object.
      Example: 
          1. Create framebuffer.                                        FBO = gl.createFramebuffer();
          2. Bind framebuffer.                                          gl.bindFramebuffer(gl.FRAMEBUFFER, FBO);
          3.   0. Create texture                                        Engine.Gl_texture_unit_create()
               1. Create texture attachment (SEE ## ATACHMENTS).        framebufferTexture2D()
          4.   0. Create renderbuffer                                   Engine.Gl_renderbuffer_create(gl, format, width, height, name) 
               2. Create renderbuffer attachment(SEE ## ATACHMENTS).    framebufferRenderbuffer(target, attachment, renderbuffertarget, renderbuffer)
          5. Check if the framebuffer is complete without errors.       gl.checkFramebufferStatus()
          6. Unbind.                                                    gl.bindFramebuffer(gl.FRAMEBUFFER, 0);

 *    Create an attachment to a framebuffer:       SEE: ## GL attachments
         For texture attachments use:      
            framebufferTexture2D(target, attachment, textarget, texture, level)
         For renderbuffer attachments use:      
            framebufferRenderbuffer(target, attachment, renderbuffertarget, renderbuffer)
  
 *    For the texture: Gl_texture_unit_create().
 *    For the renderbuffer: Gl_renderbuffer_create().      
         On renderbuffer creation it is needed: 
            gl.createRenderbuffer();
            renderbufferStorage(target, internalFormat, width, height);
  
 *    Rendering to a framebuffer.
 *    After we have succesfuly set up a framebuffer we can render existing vertexbuffers to it with the Gl_draw() command like:
         
         gl.bindRenderbuffer(gl.RENDERBUFFER, FBO);
         glEnable(GL_DEPTH_TEST); // enable depth testing (is disabled for rendering screen-space quad)
         glClearColor(0.1f, 0.1f, 0.1f, 1.0f);
         glClear(GL_COLOR_BUFFER_BIT | GL_DEPTH_BUFFER_BIT);

         Draw the geometry to the framebuffer.
         Use the existing method of drawing to the screen:
            gl.drawElements(gl.TRIANGLES, ib.count, gl.UNSIGNED_SHORT, 0);

         Unbind: gl.bindFramebuffer(gl.FRAMEBUFFER, 0);
*/


class Framebuffer {

   fbo; // Gl frame buffer object pointer.
   render_target; // The texture or the renderbuffer.
   texture;
   render_area; // A rectangle to draw the framebuffer to. Like any geometry, needs a vertex buffer etc. 
   nameid; // Index to an array of names. Instead of storing the string name, we have a separate array to store all framebuffers names.

   constructor(name){
      this.fbo = null;
      this.render_target = null;
      this.texture = null;
      this.render_area = null;
      this.name = this.#SetName(name);
   }

   GetRenderTarget(){
      // Texture_get_texture_byidx(idx);
      // return 
   }

   #SetName(str_name){
      return Framebuffer_store_name(str_name);
   }
   #GetName(nameidx){
      return Framebuffer_get_name(nameidx);
   }
}

let temp_framebuffer = null;

// gl, gl_target, ATACHMENT, render_target,  
export function Gl_framebuffer_create(gl=null, TEMP_WHICH_RENDER_TARGET=null, ATTACHMENT=INT_NULL, 
                  width=VIEWPORT.WIDTH, height=VIEWPORT.HEIGHT, name='UNDEFINED_FRAMEBUFFER_NAME') {

   // Create framebuffer
   const framebuffer = new Framebuffer(name);
   framebuffer.fbo = gl.createFramebuffer();
   gl.bindFramebuffer(gl.FRAMEBUFFER, framebuffer.fbo);

   const texidx = Texture_create_renderbuffer_texture(gl, width, height, name); 
   const texture = Texture_get_texture_byidx(texidx); 
   gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0, gl.TEXTURE_2D, texture.TUO, texture.level); // SEE: ## framebufferTexture2D
   framebuffer.texture = texture;
   // Draw via renderbuffer
   const format = gl.DEPTH_COMPONENT16; // TODO: Who decides the type of format? Is it conditionaly chosen OR the caller must pass it as param?
   const renderbuffer = Gl_renderbuffer_create(gl, format, width, height, `Renderbuffer: Framebuffer:${framebuffer.nameid}`);
   
   gl.framebufferRenderbuffer(gl.FRAMEBUFFER, gl.DEPTH_ATTACHMENT, gl.RENDERBUFFER, renderbuffer.rbo); // SEE: ## framebufferRenderbuffer
   framebuffer.render_target = renderbuffer;

   // Unbind
   gl.bindFramebuffer(gl.FRAMEBUFFER, null);

   // Debug
   let e = gl.checkFramebufferStatus(gl.FRAMEBUFFER, null);
   if (e !== gl.FRAMEBUFFER_COMPLETE) {
      alert('FrameBbuffer is not Complete')
   }

   temp_framebuffer = framebuffer;
   return framebuffer;
}

export function Framebuffer_get(){
   return temp_framebuffer
}
export function Gl_framebuffer_render(gl, framebuffer, gfx_queue) { // Renders geometry(from gfx buffers) to a spesific framebuffer target(to texture or to renderbuffer)

   gl.bindFramebuffer(gl.FRAMEBUFFER, framebuffer.fbo);
   Gl_draw_specific(gl, gfx_queue, framebuffer); // Render to framebuffer
   gl.bindFramebuffer(gl.FRAMEBUFFER, null);
}


/*************************************************************************************************/
// Helpers
const _framebuffer_names = [];
function Framebuffer_store_name(str_name){
   const idx = _framebuffer_names.push(str_name);
   return idx-1;
}
function Framebuffer_get_name(idx){
   return _framebuffer_names[idx];
}


/** MULTI-RENDERING to a renderbuffer
 * 
 * ChatGpt
 * // Create FBO
      var fbo = gl.createFramebuffer();
      gl.bindFramebuffer(gl.FRAMEBUFFER, fbo);

      // Create a large texture
      var textureWidth = 2048; // adjust as needed
      var textureHeight = 2048; // adjust as needed

      var texture = gl.createTexture();
      gl.bindTexture(gl.TEXTURE_2D, texture);
      gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, textureWidth, textureHeight, 0, gl.RGBA, gl.UNSIGNED_BYTE, null);
      gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0, gl.TEXTURE_2D, texture, 0);

      // Check FBO completeness
      var status = gl.checkFramebufferStatus(gl.FRAMEBUFFER);
      if (status !== gl.FRAMEBUFFER_COMPLETE) {
         console.error('Framebuffer is incomplete: ' + status.toString(16));
      }

      // Clear FBO
      gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

      // Render the first object to a portion of the texture
      var viewportWidth1 = textureWidth / 2; // adjust as needed
      var viewportHeight1 = textureHeight / 2; // adjust as needed

      // [x,y]: bottom-left corner
      gl.viewport(0, 0, viewportWidth1, viewportHeight1);
      // Set other rendering parameters, shaders, etc.
      // Render your first object here

      // Render the second object to a different portion of the texture
      var viewportWidth2 = textureWidth / 2; // adjust as needed
      var viewportHeight2 = textureHeight / 2; // adjust as needed

      gl.viewport(viewportWidth1, 0, viewportWidth2, viewportHeight2);
      // Set other rendering parameters, shaders, etc.
      // Render your second object here

      // Unbind FBO
      gl.bindFramebuffer(gl.FRAMEBUFFER, null);

      // Use the texture in your main rendering loop or elsewhere
      gl.bindTexture(gl.TEXTURE_2D, texture);
      // Render the texture on a quad or use it in shaders, etc.

 * 
 */