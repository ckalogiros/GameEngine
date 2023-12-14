"use strict";

// SEE: ## Framebuffer VS Renderbuffer

class Renderbuffer {

   rbo; // Gl render buffer object pointer;

   /**DEBUG */ name;

   constructor(name) {
      this.name = name;
   }
}

export function Gl_renderbuffer_create(gl, format, width, height, name) {

   const renderbuffer = new Renderbuffer(name);
   renderbuffer.rbo = gl.createRenderbuffer();
   gl.bindRenderbuffer(gl.RENDERBUFFER, renderbuffer.rbo);
   gl.renderbufferStorage(gl.RENDERBUFFER, format, width, height); // SEE: ## renderbufferStorage

   return renderbuffer; 
}