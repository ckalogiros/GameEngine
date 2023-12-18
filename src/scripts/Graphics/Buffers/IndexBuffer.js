"use strict";


// For Debuging
import * as dbg from '../Z_Debug/GfxDebug.js'


const _indexbuffer_of_indexbuffers = []
let _count = 0;

// export function Gl_ib_create_indexbuffer(sid, sceneidx, idx_in_prog, gl, vao, indices_per_rect){
export function Gl_ib_create_indexbuffer(sid, sceneidx, gl, vao, indices_per_rect){
   _indexbuffer_of_indexbuffers[_count] = new IndexBuffer(sid, sceneidx, gl, indices_per_rect, vao, _count);
   _count++;
   return _count-1;
}

export function Gl_ib_get_byidx(idx){
   if(idx < 0 || idx >= _count) alert('Index for getting indexbuffer is out of bounds. @ IndexBuffer.js.');
   return _indexbuffer_of_indexbuffers[idx];
}
export function Gl_ib_get_byidx_in_prog(idx){
   // if(_indexbuffer_of_indexbuffers[idx].idx_in_prog === idx)
   //    return _indexbuffer_of_indexbuffers[idx];
   if(_indexbuffer_of_indexbuffers[idx])
      return _indexbuffer_of_indexbuffers[idx];
   else
   alert('ERROR: NO INDEX BUFFER EXISTS.  @ IndexBuffer.js.')
}

export function Gl_ib_set_idx_in_prog(ibidx, idx_in_prog){
   _indexbuffer_of_indexbuffers[ibidx].idx_in_prog = idx_in_prog;
}

export function Gl_ib_set_show(ibidx, flag){
   _indexbuffer_of_indexbuffers[ibidx].show = flag;
}

export function Gl_ib_exists(ibIdx, sceneidx) {

   if(_indexbuffer_of_indexbuffers[ibIdx])
      return _indexbuffer_of_indexbuffers[ibIdx].idx_in_prog;

   return -1;
}

export class IndexBuffer {
   
   data;
   size; // 
   count; // 
   vCount; // 
   
   idx; // The index in the _indexbuffer_of_indexbuffers.
   idx_in_prog; // An index of the indexbuffer in a GlProgram.
   sceneidx;
   
   webgl_buffer; // Gl object
   vao;  

   indices_per_rect;

   needs_update;
   show;

   /**DEBUG*/name = '';
   
   constructor(sid, sceneidx, gl, indices_per_rect, vao, self_idx) {
      
      this.size = MAX_INDEX_BUFFER_COUNT;
      this.data = new Uint16Array(this.size);
      this.count = 0;
      this.vCount = 0;

      this.idx = self_idx;
      this.idx_in_prog = INT_NULL;
      this.sceneidx = sceneidx;
      
      this.webgl_buffer = gl.createBuffer();
      this.vao = vao;

      this.indices_per_rect = indices_per_rect;
      
      this.needs_update = false;
      this.show = false;
      
      this.name = dbg.GetShaderTypeId(sid);
   }

   Add(num_faces) {

      const offset = 4;

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

      this.needs_update = true; // Make sure that we update GL bufferData 
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
      this.needs_update = true;
   }

   Remove_geometry(num_faces) {

      const attr_count = INDICES_PER_RECT * num_faces; // Meshes total attributes count.
      this.count -= attr_count;
      const vCount = (attr_count / INDICES_PER_RECT) * VERTS_PER_RECT_INDEXED;
      this.vCount -= vCount;
      this.needs_update = true;

      return attr_count;
   }

};

