"use strict";


// For Debuging
import * as dbg from '../Z_Debug/GfxDebug.js'


export class IndexBuffer {
   name = '';

   data = [];
   webgl_buffer = null;

   idx = INT_NULL;
   start = 0;
   count = 0;
   size = 0;
   vCount = 0;

   vao = null;
   iboId = INT_NULL;

   needsUpdate = false;

   constructor(sid, sceneidx, idx, gl, indices_per_rect) {

      this.idx = idx;

      this.webgl_buffer = gl.createBuffer();
      this.name = dbg.GetShaderTypeId(sid);
      this.sceneidx = sceneidx;

      this.size = MAX_INDEX_BUFFER_COUNT;
      this.data = new Uint16Array(this.size);
      this.indices_per_rect = indices_per_rect;
   }

   Add(num_faces) {

      const offset = 4;
      this.start = this.vCount;

      let k = this.vCount;
      for (let i = 0; i < num_faces; ++i) {

         for (let j = 0; j < 2; j++) {

            this.data[this.count++] = k + j;
            this.data[this.count++] = k + j + 1;
            this.data[this.count++] = k + j + 2;
         }

         k += offset;
         this.vCount += offset;
      }

      this.needsUpdate = true; // Make sure that we update GL bufferData 
   }

   Realloc() {

      this.size *= 2;
      const oldData = this.data;
      this.data = new Uint16Array(this.size);
      this.CopyBuffer(oldData)
      if(DEBUG.BUFFERS) console.log('Resizing index buffer!')
   }

   CopyBuffer(oldData) {

      const size = oldData.length;
      for (let i = 0; i < size; i++) {
         this.data[i] = oldData[i];
      }
   }

   Reset() {
      this.count = 0;
      this.vCount = 0;
      this.needsUpdate = true;
   }

   Remove_geometry(num_faces) {

      const attr_count = INDICES_PER_RECT * num_faces; // Meshes total attributes count.
      this.count -= attr_count;
      const vCount = (attr_count / INDICES_PER_RECT) * VERTS_PER_RECT_INDEXED;
      this.vCount -= vCount;
      this.needsUpdate = true;

      return attr_count;

   }

};
