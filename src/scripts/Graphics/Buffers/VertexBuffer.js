"use strict";


import { M_Buffer } from '../../Engine/Core/Buffers.js';
// For Debuging
import * as dbg from '../Z_Debug/GfxDebug.js'



export class VertexBuffer {

   sceneidx = INT_NULL;

   webgl_buffer = null;
   data = [];
   // A buffer to store all vertexbuffer's meshes indexes. Used to denote the active meshes in the vertex buffer. 
   // EXAMPLE: If index === INT_NULL, then the mesh is no longer to be rendered, so maybe we remove it from the vertex buffer.
   mesh_indexes = []; 
   // /*DEBUG*/meshes = [];        // An array of pointers to all vertexBuffer's meshes. Has the type of 'GfxInfoMesh'

   idx = INT_NULL;	    // The vertex buffer (float*) idx that this Mesh is stored to.
   count = 0;			// Current size of the attributes in data buffer (in floats)
   size = 0;			// Total   size of the float buffer (in floats)
   // /*DELETE*/start = 0;			// The current meshe's starting idx in the vertex buffer. 
   vCount = 0;			// Number of vertices
   // /*NO_NEED_TO_EXIST*/mesh_count = 0;

   vao = null;		    // Vertex Array 
   vboId = INT_NULL;	// Vertex Buffer Gl-Id
   tboId = INT_NULL;	// Texture Buffer Gl-Id
   texidx = INT_NULL;	// Stores the index of the texture's location in the texture array

   type = 0; // Some flags to interpet the type of the vertex buffer(Example: type:INFO_UI_GFX)

   /*NOT_USED*/scissorbox = [];
   /*NOT_USED*/free_vertex_buffer;

   show = false;
   needsUpdate = false;
   hasChanged = false;
   hasScissorBox = false;
   isPrivate = false; // SEE ## PRIVATE_BUFFERS

   // Debug
   debug = { meshesNames: [], sidName: '' };

   constructor(sid, sceneidx, idx, gl) {

       this.debug.sidName = dbg.GetShaderTypeId(sid);
       this.sceneidx = sceneidx;
       this.idx = idx;

       this.vao = gl.createVertexArray();
       gl.bindVertexArray(this.vao);
       this.webgl_buffer = gl.createBuffer();
       this.size = MAX_VERTEX_BUFFER_COUNT;
       this.data = new Float32Array(this.size);

       this.free_vertex_buffer = new M_Buffer();

   }

   /** 
    * Remove geometry fast version. 
    * We just set the alpha color value to 0.
    * And we keep the dimention of the mesh in the vertex buffer
    * in a separate buffer, so we can reuse when possible
    */
   Remove_geometry_fast(gfx, num_faces) {

       GlOps.GlSetColor(gfx, [0, 0, 0, 1], num_faces);

       if (!this.free_vertex_buffer.count) this.free_vertex_buffer.Init(1);

       const removedVerticesInfo = {
           progidx: gfx.prog.idx,
           vbIdx: gfx.vb.idx,
           vbStart: gfx.vb.start,
           vbCount: gfx.vb.count,
           ibIdx: gfx.vb.idx,
           ibStart: gfx.ib.start,
           ibCount: gfx.ib.count,
       };

       const meshTotalAttrCount = gfx.vb.count * num_faces;
       const count = vb.count - (vb.count - meshTotalAttrCount);
       const vCount = meshTotalAttrCount / gfx.attribsPerVertex;
       this.count -= count;
       this.vCount -= vCount;
       this.needsUpdate = true;

       this.free_vertex_buffer.Add(removedVerticesInfo);

   }

   Remove_geometry(gfx, num_faces) {

       if (!this.free_vertex_buffer.count) this.free_vertex_buffer.Init(1);

       const removedVerticesInfo = {
           progidx: gfx.prog.idx,
           vbIdx: gfx.vb.idx,
           vbStart: gfx.vb.start,
           vbCount: gfx.vb.count,
           ibIdx: gfx.vb.idx,
           ibStart: gfx.ib.start,
           ibCount: gfx.ib.count,
       };

        const start = gfx.vb.start + (gfx.vb.count * num_faces);
       const end = this.count
       let k = gfx.vb.start;

       // Shift all attributes left to fil the gap of the removed attributes. 
       for(let i=start; i<end; i++){
           this.data[k++] = this.data[i]
       }

       const meshTotalAttrCount = gfx.vb.count * num_faces;
       // const count = this.count - (this.count - meshTotalAttrCount);
       const vCount = meshTotalAttrCount / gfx.attribsPerVertex;
       this.count -= meshTotalAttrCount;
       this.vCount -= vCount;

       if(this.count < 0)
           console.error('[[[[[[[[[[[[[[[[[ Count < 0. vb:', this.idx)
       // console.log('------------- Removing Num_faces from buffer:', num_faces, ' prog:', gfx.prog.idx, ' vb:', gfx.vb.idx)
       this.needsUpdate = true;

       this.free_vertex_buffer.Add(removedVerticesInfo);

       return meshTotalAttrCount;

   }

   Shift_geometry(gfx, num_faces, new_num_faces) {

       const total_new_attribs_count = gfx.attribsPerVertex * gfx.vertsPerRect * new_num_faces;
       if (this.count + total_new_attribs_count >= this.size) this.Realloc(total_new_attribs_count);
       const start = gfx.vb.start + (gfx.vb.count * (num_faces+new_num_faces));
       const end = this.count + total_new_attribs_count;
       
       let k = this.count-1;
       for(let i=end-1; i>=start; i--)
           this.data[i] = this.data[k--]

       // Remove the old data counts, the whole mesh is gonna be added again to the vertex buffers.
       const vCount = (gfx.attribsPerVertex * gfx.vertsPerRect * num_faces) / gfx.attribsPerVertex;
       this.count -= gfx.attribsPerVertex * gfx.vertsPerRect * num_faces;
       this.vCount -= vCount;
       this.needsUpdate = true;

       return total_new_attribs_count;
   }

   Realloc(extra_size=0) {

       if(extra_size) this.size += extra_size;
       else this.size *= 2;
       const oldData = this.data;
       this.data = new Float32Array(this.size);
       this.#CopyBuffer(oldData)
       console.warn('Resizing vertex buffer!')
   }

   #CopyBuffer(oldData) {

       const size = oldData.length;
       for (let i = 0; i < size; i++) {
           this.data[i] = oldData[i];
       }
   }

   SetPrivate() { this.isPrivate = true; }

   EnableScissorBox(){ this.hasScissorBox = true; }
   
   SetScissorBox(box=null) { 
       
       /**DEBUG */ if(box === null) alert('Scissor box dimentions should be passed as parameter, but null is passed instead.')
       this.scissorbox[0] = box[0];
       this.scissorbox[1] = VIEWPORT.HEIGHT - box[1];
       this.scissorbox[2] = box[2];
       this.scissorbox[3] = box[3];
   }

   // Resets (set to 0) the start and counts of the buffer 
   Reset() {
       this.count = 0;
       this.vCount = 0;
       // this.mesh_count = 0;
       this.needsUpdate = true;
       this.mesh_indexes = [];
       this.debug.meshesNames = [];
       this.debug.sidName = [];
   }

};
