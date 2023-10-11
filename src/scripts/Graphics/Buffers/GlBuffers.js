import { GfxInfoMesh, GlEnableAttribsLocations, Gl_set_vb_show } from '../GlProgram.js'
import * as GlOps from './GlBufferOps.js';

// For Debuging
import * as dbg from '../Z_Debug/GfxDebug.js'
import { Gl_create_program } from '../GlProgram.js'
import { Gl_progs_get_ib_byidx, Gl_progs_get_prog_byidx, Gl_progs_get, Gl_progs_get_vb_byidx } from '../GlProgram.js';
import { Renderqueue_get } from '../../Engine/Renderers/Renderer/RenderQueue.js';
import { M_Buffer } from '../../Engine/Core/Buffers.js';
// import { TimerGetGlobalTimerCycle } from '../../Engine/Timers/Timers.js';
import { Info_listener_dispatch_event } from '../../Engine/Drawables/DebugInfo/InfoListeners.js';


class VertexBuffer {

    sceneidx = INT_NULL;

    webgl_buffer = null;
    data = [];
    // /*DEBUG*/meshes = [];        // An array of pointers to all vertexBuffer's meshes. Has the type of 'GfxInfoMesh'

    idx = INT_NULL;	    // The vertex buffer (float*) idx that this Mesh is stored to.
    count = 0;			// Current size of the attributes in data buffer (in floats)
    size = 0;			// Total   size of the float buffer (in floats)
    /*DELETE*/start = 0;			// The current meshe's starting idx in the vertex buffer. 
    vCount = 0;			// Number of vertices
    // /*NO_NEED_TO_EXIST*/mesh_count = 0;

    vao = null;		    // Vertex Array 
    vboId = INT_NULL;	// Vertex Buffer Gl-Id
    iboId = INT_NULL;	// Index Buffer Gl-Id
    tboId = INT_NULL;	// Texture Buffer Gl-Id
    textidx = INT_NULL;	// Stores the index of the texture's location in the texture array

    type = 0; // Some flags to interpet the type of the vertex buffer(Example: type:INFO_UI_GFX)

    /*NOT_USED*/scissorBox = [];
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

    // AddGeometry(sid, pos, dim, time, shaderinfo, num_faces, start, count) {

    //     // const start = this.count
    //     if (sid.attr & SID.ATTR.POS2) { // Add Position, if the program has such an attribute 
    //         GlOps.VbSetAttribPos(this, start + shaderinfo.attributes.offset.pos,
    //             count, shaderinfo.attribsPerVertex - shaderinfo.attributes.size.pos, dim, num_faces);
    //     }
    //     if (sid.attr & SID.ATTR.WPOS_TIME4) { // Add World Position, if the program has such an attribute 
    //         if (sid.attr & SID.ATTR.POS3) {
    //             GlOps.VbSetAttribWpos(this, start + shaderinfo.attributes.offset.wposTime,
    //                 count, shaderinfo.attribsPerVertex - 3, pos, 2);
    //         }
    //         else {
    //             GlOps.VbSetAttribWpos(this, start + shaderinfo.attributes.offset.wposTime,
    //                 count, shaderinfo.attribsPerVertex - shaderinfo.attributes.size.wpos, pos, num_faces);
    //         }
    //     }
    //     if (sid.attr & SID.ATTR.TIME) { // Per Vertex Timer (meant to be per mesh, 4 vertices) 
    //         GlOps.VbSetAttrTime(this, start + shaderinfo.attributes.offset.time,
    //             count, shaderinfo.attribsPerVertex - shaderinfo.attributes.size.wpos, time, num_faces);
    //     }
    //     this.needsUpdate = true;
    //     this.vCount += shaderinfo.verticesPerRect * num_faces;

    //     /**DEBUG*/if(this.count > this.size) console.error('VERTEX BUFFER OVERFLOW!!!')
    // }
    
    // AddMaterial(sid, shaderinfo, num_faces, start, count, col, tex, style = null, sdf = null) {
    //     if (sid.attr & SID.ATTR.COL4 && col) { // Add Color, if the program has such an attribute

    //         if (!col && DEBUG.WEB_GL) console.error('Style hasn\'t being set. @AddMaterial(), GlBuffers.js')

    //         // 4 color vertex
    //         if (sid.attr & SID.ATTR.COL4_PER_VERTEX) {
    //             GlOps.VbSetAttribColPerVertex(this, start + shaderinfo.attributes.offset.col,
    //                 count, shaderinfo.attribsPerVertex - shaderinfo.attributes.size.col, col, num_faces);
    //         }
    //         else { // Regular color. 1 color for all vertices
    //             GlOps.VbSetAttribCol(this, start + shaderinfo.attributes.offset.col,
    //                 count, shaderinfo.attribsPerVertex - shaderinfo.attributes.size.col, col, num_faces);
    //         }
    //     }
    //     if (sid.attr & SID.ATTR.TEX2 && tex) { // Add Texture, if the program has such an attribute 
    //         if (!tex && DEBUG.WEB_GL) console.error('Style hasn\'t being set. @AddMaterial(), GlBuffers.js')
    //         GlOps.VbSetAttribTex(this, start + shaderinfo.attributes.offset.tex,
    //             count, shaderinfo.attribsPerVertex - shaderinfo.attributes.size.tex, tex, num_faces);
    //     }
    //     if (sid.attr & SID.ATTR.SDF && sdf) { // Add Texture, if the program has such an attribute 
    //         if (!sdf && DEBUG.WEB_GL) console.error('Sdf hasn\'t being set. @AddMaterial(), GlBuffers.js')
    //         // (vb, start, count, stride, sdf_params)
    //         GlOps.VbSetAttrSdf(this, start + shaderinfo.attributes.offset.sdf,
    //             count, shaderinfo.attribsPerVertex - shaderinfo.attributes.size.sdf, sdf, num_faces);
    //     }

    //     ////////////////////////////////////////////////////////////////////////////////////////////////////////////
    //     let params1Index = 0; //  Handles any unused attributes of the vec4 params1 shader attribute.  
    //     if (sid.attr & SID.ATTR.BORDER) {
    //         if (!style && DEBUG.WEB_GL) console.error('Style.border hasn\'t being set. @AddMaterial(), GlBuffers.js')
    //         else {
    //             GlOps.VbSetAttrBorderWidth(this, start + shaderinfo.attributes.offset.params1 + params1Index,
    //                 count, shaderinfo.attribsPerVertex - V_BORDER_WIDTH, style[STYLE.BORDER], num_faces)
    //             params1Index++;
    //         }
    //     }
    //     if (sid.attr & SID.ATTR.R_CORNERS) {
    //         if (!style && DEBUG.WEB_GL) console.error('Style.rCorners hasn\'t being set. @AddMaterial(), GlBuffers.js')
    //         else {
    //             GlOps.VbSetAttrRoundCorner(this, start + shaderinfo.attributes.offset.params1 + params1Index,
    //                 count, shaderinfo.attribsPerVertex - V_ROUND_CORNERS, style[STYLE.R_CORNERS], num_faces)
    //             params1Index++;
    //         }
    //     }
    //     if (sid.attr & SID.ATTR.FEATHER) {
    //         if (!style && DEBUG.WEB_GL) console.error('Style.feather hasn\'t being set. @AddMaterial(), GlBuffers.js')
    //         else {
    //             GlOps.VbSetAttrBorderFeather(this, start + shaderinfo.attributes.offset.params1 + params1Index,
    //                 count, shaderinfo.attribsPerVertex - V_BORDER_FEATHER, style[STYLE.FEATHER], num_faces)
    //             params1Index++;
    //         }
    //     }
    //     /** IMPORTANT! The stayle attributes(counts 3 attributes) use the attrParams vector4 to be passed.
    //      * Therefore, in order to count the totaol attributes we must take into consideration the empty attribute
    //      */
    //     if (sid.attr & SID.ATTR.EMPTY) { // Increment vertex count for unused vector elements
    //         this.count += shaderinfo.verticesPerRect * num_faces;
    //     }

    //     this.needsUpdate = true;
    // }

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
            progIdx: gfx.prog.idx,
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
            progIdx: gfx.prog.idx,
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
        // if((this.mesh_count - num_faces) < 0)
        //     console.error('(((((((()))))) mesh count - faces < 0. vb:', this.idx)
        // this.mesh_count -= num_faces;
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

    // Resets (set to 0) the start and counts of the buffer 
    Reset() {
        this.count = 0;
        this.vCount = 0;
        // this.mesh_count = 0;
        this.needsUpdate = true;
        this.debug.meshesNames = [];
        this.debug.sidName = [];
    }

};

class IndexBuffer {
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
        // gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, this.webgl_buffer);
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
        console.warn('Resizing index buffer!')
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

        const meshTotalAttrCount = INDICES_PER_RECT * num_faces;
        const count = this.count - (this.count - meshTotalAttrCount);
        const vCount = meshTotalAttrCount / INDICES_PER_RECT * VERTS_PER_RECT_INDEXED;
        this.count -= count;
        this.vCount -= vCount;
        this.needsUpdate = true;

        return count;

    }

};


export let GlFrameBuffer = {

    name: '',

    buffer: null,
    tex: null,
    texId: INT_NULL,
    textidx: INT_NULL,
    texWidth: 0,
    texHeight: 0,
    progIdx: INT_NULL,
    vbIdx: INT_NULL,
    isActive: false,
};


export function GlCheckContext(sid, sceneidx) {

    const progs = Gl_progs_get();
    const progidx = ProgramExists(sid, progs);

    if (progidx !== INT_NULL) {

        const vbidx = VertexBufferExists(sceneidx, progs[progidx]);
        if (vbidx !== INT_NULL) return [progidx, vbidx];
    }

    return [INT_NULL, INT_NULL];
}

export function GlGenerateContext(sid, sceneidx, GL_BUFFER, addToSpecificGlBuffer, num_faces = 1) {

    if (ERROR_NULL(sceneidx)) console.error('Scene index is null. @ GlGenerateContext()')
    if (Array.isArray(GL_BUFFER) || Array.isArray(addToSpecificGlBuffer)) console.error('Array of indexes instead of vbIdx is passed. @ GlGenerateContext()')

    const progs = Gl_progs_get();
    // ProgramExists returns 0 index based program or -1 for not found
    let progIdx = ProgramExists(sid, progs);

    // If the program already exists, add mesh
    if (progIdx === INT_NULL) { // Else create new program
        progIdx = Gl_create_program(sid);

        // Enable screen_resolution vec2 uniform  
        if (sid.unif & SID.UNIF.BUFFER_RES) {
            const unifBufferResIdx = progs[progIdx].UniformsBufferCreateScreenRes();
            progs[progIdx].UniformsSetBufferUniform(Viewport.width, unifBufferResIdx.resXidx);
            progs[progIdx].UniformsSetBufferUniform(Viewport.height, unifBufferResIdx.resYidx);
        }

        // Enable global_timer float uniform  
        if (sid.unif & SID.UNIF.BUFFER_RES) {
            const step = 0.1;
            progs[progIdx].UniformsCreateTimer(step);
        }


    }

    GlUseProgram(progs[progIdx].webgl_program, progIdx);

    let vbIdx = INT_NULL;
    let ibIdx = INT_NULL;

    if (GL_BUFFER == GFX.NEW) {
        vbIdx = INT_NULL;
    }
    else if (GL_BUFFER == GFX.SPECIFIC) { // Case caller accidentally 'specific buffer' flag but the vbIdx is either null or does not exist. 
        if (addToSpecificGlBuffer === INT_NULL) {
            vbIdx = VertexBufferExists(sceneidx, progs[progIdx]);
        }
        else { //  Check id the vbIdx passed by the caller exists and it is valid for adding the mesh.

            vbIdx = addToSpecificGlBuffer;

            // If the passsed vbIdx does not exist or comply with the program, set to create new vertex buffer.
            if (!(progs[progIdx].vertexBuffer[vbIdx] &&
                SID.CheckSidMatch(sid, progs[progIdx].sid)))
                vbIdx = INT_NULL;
        }
    }
    else if (GL_BUFFER == GFX.ANY) {
        vbIdx = VertexBufferExists(sceneidx, progs[progIdx]);
    }

    // If the chosen vertexBuffer is used as private by another drawable, then it should not be used if addToSpecificGlBuffer is not passed.
    // SEE ## PRIVATE_BUFFERS
    if (vbIdx > INT_NULL && vbIdx !== addToSpecificGlBuffer && progs[progIdx].vertexBuffer[vbIdx].isPrivate) vbIdx = INT_NULL;

    let vb = null; // Cash for convinience
    let ib = null; // Cash for convinience

    /* * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * *
     * Initialize gl buffers
     */
    if (vbIdx < 0) { // Create gl buffer

        vbIdx = progs[progIdx].vertexBufferCount++;
        progs[progIdx].vertexBuffer[vbIdx] = vb = new VertexBuffer(sid, sceneidx, vbIdx, gfxCtx.gl);

        gfxCtx.gl.bindBuffer(gfxCtx.gl.ARRAY_BUFFER, vb.webgl_buffer);

        // Initialize attribute locations of the shader for every newly created vertex buffer.
        GlEnableAttribsLocations(gfxCtx.gl, progs[progIdx]);

        // Connect the vertex buffer with the atlas texture. 
        if (sid.attr & SID.ATTR.TEX2) {
            if (sid.shad & SID.SHAD.TEXT_SDF) vb.textidx = Texture.font;
            else vb.textidx = Texture.atlas;
        }
        if (dbg.GL_DEBUG_BUFFERS_ALL) console.log('===== VertexBuffer =====\nvbIdx:', vbIdx, 'progIdx:', progIdx);

        /**
         * Create Index buffer
         */
        if (sid.shad & SID.SHAD.INDEXED) {

            ibIdx = progs[progIdx].indexBufferCount++;
            progs[progIdx].indexBuffer[ibIdx] = ib = new IndexBuffer(sid, sceneidx, ibIdx, gfxCtx.gl, INDICES_PER_RECT);
            ib.vao = vb.vao; // Let index buffer have a copy of the vao

            if (dbg.GL_DEBUG_BUFFERS_ALL) console.log('----- VertexBuffer -----\nibIdx:', ibIdx, 'progIdx:', progIdx)
        }

        // Add the new vertexBuffer to render queue
        Renderqueue_get().Add(progIdx, vbIdx, vb.show);
        Gl_set_vb_show(progIdx, vbIdx, true);
    }
    else {

        vb = progs[progIdx].vertexBuffer[vbIdx];
        gfxCtx.gl.bindVertexArray(vb.vao)
        gfxCtx.gl.bindBuffer(gfxCtx.gl.ARRAY_BUFFER, vb.webgl_buffer)

        // Index buffer. TODO: we bound the ibIdx with the vbIdx. What if later we want to use arbitary index buffers??? We must implement another way of finding the correct ib(Most probable is to pass the ibIdx to this function)
        ibIdx = IndexBufferExists(vbIdx, sceneidx, progs[progIdx]);
        ib = progs[progIdx].indexBuffer[ibIdx];

    }

    // Cash values
    const vertsPerRect = progs[progIdx].shaderinfo.verticesPerRect;
    const attribsPerVertex = progs[progIdx].shaderinfo.attribsPerVertex;
    // const start = vb.mesh_count * vertsPerRect * attribsPerVertex; // Add meshes to the vb continuously
    // console.log(`start:${start} prog:${progIdx} vb:${vbIdx}`)
    // vb.mesh_count += num_faces;
    const count = vertsPerRect * attribsPerVertex; // Total attributes of the mesh. All text meshes have only one face registered, the rest of the faces are calculated if needed.

    // Set meshes gfx info
    const gfxInfo = new GfxInfoMesh; // NOTE: This is the only construction of a new GfxInfoMesh object(as for now), all other calls are for creating a copy of an existing GfxInfoMesh. 
    gfxInfo.sid = sid;
    gfxInfo.sceneidx = sceneidx;
    gfxInfo.vao = vb.vao;
    gfxInfo.num_faces = num_faces;
    gfxInfo.vertsPerRect = vertsPerRect;
    gfxInfo.attribsPerVertex = attribsPerVertex;
    gfxInfo.prog.idx = progIdx;
    gfxInfo.vb.idx = vbIdx;
    gfxInfo.vb.start = 0;
    // gfxInfo.vb.start = start;
    gfxInfo.vb.count = count;
    gfxInfo.ib.idx = ibIdx;
    gfxInfo.ib.count = ib.count;

    return gfxInfo;
}

export function Gl_add_geom_mat_to_vb(sid, gfx, geom, mat, vb_type_flag, mesh_name){

    const progIdx = gfx.prog.idx;
    const vbIdx = gfx.vb.idx;
    const ibIdx = gfx.ib.idx;
    const prog = Gl_progs_get_prog_byidx(progIdx);
    const vb = Gl_progs_get_vb_byidx(progIdx, vbIdx);
    const ib = Gl_progs_get_ib_byidx(progIdx, ibIdx);
    // const num_faces = geom.num_faces;
    const num_faces = 1;
    const start = (!gfx.vb.start) ? vb.count : gfx.vb.start;
    vb.vCount += prog.shaderinfo.verticesPerRect * gfx.num_faces;

    // console.log('START:' , start, ' vb:', progIdx, vbIdx)
    const count = gfx.vb.count;

    if (GL.BOUND_PROG_IDX !== progIdx) {
        GlUseProgram(prog.webgl_program, progIdx);
        GL.BOUND_PROG_IDX = progIdx;
        gfxCtx.gl.bindVertexArray(vb.vao);
        gfxCtx.gl.bindBuffer(gfxCtx.gl.ARRAY_BUFFER, vb.webgl_buffer);
        GL.BOUND_VBO_IDX = vbIdx;
    }
    if (GL.BOUND_VBO_IDX !== vbIdx) {
        gfxCtx.gl.bindVertexArray(vb.vao);
        gfxCtx.gl.bindBuffer(gfxCtx.gl.ARRAY_BUFFER, vb.webgl_buffer);
        GL.BOUND_VBO_IDX = vbIdx;
    }
    
    // Reallocate vertex buffer if it has no more space
    const meshSize = gfx.attribsPerVertex * gfx.vertsPerRect * num_faces;
    if (vb.count + meshSize >= vb.size) vb.Realloc();
    // console.log(`vbcount:${vb.count} meshsize:${meshSize} vb.size:${vb.size}`);

    /**********************************************************************************************************************/
    { // Add Geometry
        if (sid.attr & SID.ATTR.POS2) { // Add Position, if the program has such an attribute 
            GlOps.VbSetAttribPos(vb, start + prog.shaderinfo.attributes.offset.pos,
                count, prog.shaderinfo.attribsPerVertex - prog.shaderinfo.attributes.size.pos, geom.dim, num_faces);
        }
        if (sid.attr & SID.ATTR.WPOS_TIME4) { // Add World Position, if the program has such an attribute 
            if (sid.attr & SID.ATTR.POS3) {
                GlOps.VbSetAttribWpos(vb, start + prog.shaderinfo.attributes.offset.wposTime,
                    count, prog.shaderinfo.attribsPerVertex - 3, geom.pos, 2);
            }
            else {
                GlOps.VbSetAttribWpos(vb, start + prog.shaderinfo.attributes.offset.wposTime,
                    count, prog.shaderinfo.attribsPerVertex - prog.shaderinfo.attributes.size.wpos, geom.pos, num_faces);
            }
        }
        if (sid.attr & SID.ATTR.TIME) { // Per Vertex Timer (meant to be per mesh, 4 vertices) 
            GlOps.VbSetAttrTime(vb, start + prog.shaderinfo.attributes.offset.time,
                count, prog.shaderinfo.attribsPerVertex - prog.shaderinfo.attributes.size.wpos, geom.time, num_faces);
        }
    }
    
    /**********************************************************************************************************************/
    { // Add Material
        if (sid.attr & SID.ATTR.COL4 && mat.col) { // Add Color, if the program has such an attribute
    
            if (!mat.col && DEBUG.WEB_GL) console.error('Style hasn\'t being set. @AddMaterial(), GlBuffers.js')
    
            // 4 color vertex
            if (sid.attr & SID.ATTR.COL4_PER_VERTEX) {
                GlOps.VbSetAttribColPerVertex(vb, start + prog.shaderinfo.attributes.offset.col,
                    count, prog.shaderinfo.attribsPerVertex - prog.shaderinfo.attributes.size.col, mat.col, num_faces);
            }
            else { // Regular color. 1 color for all vertices
                GlOps.VbSetAttribCol(vb, start + prog.shaderinfo.attributes.offset.col,
                    count, prog.shaderinfo.attribsPerVertex - prog.shaderinfo.attributes.size.col, mat.col, num_faces);
            }
        }
        if (sid.attr & SID.ATTR.TEX2 && mat.uv) { // Add Texture, if the program has such an attribute 
            if (!mat.uv && DEBUG.WEB_GL) console.error('Style hasn\'t being set. @AddMaterial(), GlBuffers.js')
            GlOps.VbSetAttribTex(vb, start + prog.shaderinfo.attributes.offset.tex,
                count, prog.shaderinfo.attribsPerVertex - prog.shaderinfo.attributes.size.tex, mat.uv, num_faces);
        }
        if (sid.attr & SID.ATTR.SDF && mat.sdf_params) { // Add Texture, if the program has such an attribute 
            if (!mat.sdf_params && DEBUG.WEB_GL) console.error('Sdf hasn\'t being set. @AddMaterial(), GlBuffers.js')
            // (vb, start, count, stride, sdf_params)
            GlOps.VbSetAttrSdf(vb, start + prog.shaderinfo.attributes.offset.sdf,
                count, prog.shaderinfo.attribsPerVertex - prog.shaderinfo.attributes.size.sdf, mat.sdf_params, num_faces);
        }
    
        let params1Index = 0; //  Handles any unused attributes of the vec4 params1 shader attribute.  
        if (sid.attr & SID.ATTR.BORDER) {
            if (!mat.style && DEBUG.WEB_GL) console.error('Style.border hasn\'t being set. @AddMaterial(), GlBuffers.js')
            else {
                GlOps.VbSetAttrBorderWidth(vb, start + prog.shaderinfo.attributes.offset.params1 + params1Index,
                    count, prog.shaderinfo.attribsPerVertex - V_BORDER_WIDTH, mat.style[STYLE.BORDER], num_faces)
                params1Index++;
            }
        }
        if (sid.attr & SID.ATTR.R_CORNERS) {
            if (!mat.style && DEBUG.WEB_GL) console.error('Style.rCorners hasn\'t being set. @AddMaterial(), GlBuffers.js')
            else {
                GlOps.VbSetAttrRoundCorner(vb, start + prog.shaderinfo.attributes.offset.params1 + params1Index,
                    count, prog.shaderinfo.attribsPerVertex - V_ROUND_CORNERS, mat.style[STYLE.R_CORNERS], num_faces)
                params1Index++;
            }
        }
        if (sid.attr & SID.ATTR.FEATHER) {
            if (!mat.style && DEBUG.WEB_GL) console.error('Style.feather hasn\'t being set. @AddMaterial(), GlBuffers.js')
            else {
                GlOps.VbSetAttrBorderFeather(vb, start + prog.shaderinfo.attributes.offset.params1 + params1Index,
                    count, prog.shaderinfo.attribsPerVertex - V_BORDER_FEATHER, mat.style[STYLE.FEATHER], num_faces)
                params1Index++;
            }
        }
        /** IMPORTANT! The stayle attributes(counts 3 attributes) use the attrParams vector4 to be passed.
         * Therefore, in order to count the totaol attributes we must take into consideration the empty attribute
         */
        if (sid.attr & SID.ATTR.EMPTY) { // Increment vertex count for unused vector elements
            vb.count += prog.shaderinfo.verticesPerRect * num_faces;
        }
    }

    /**********************************************************************************************************************/
    // Create indices
    if (sid.shad & SID.SHAD.INDEXED) {

        // Check for buffer realloc
        if (ib.count + num_faces * INDICES_PER_RECT > ib.size) {
            ib.Realloc();
        }

        gfx.ib.start = ib.count;
        ib.Add(num_faces)
        gfx.ib.count = ib.count;
    }

    
    prog.isActive = true; // Sets a program to 'active', only if there are meshes in the program's vb
    vb.needsUpdate = true;
    // console.log('VB count:', vb.count)
    if(vb_type_flag) vb.type |= vb_type_flag;

    /**DEBUG */CreateUniqueMesh(vb.debug.meshesNames, mesh_name);

    return start;
}

// export function GlAddGeometry(sid, pos, dim, time, gfx, meshName, num_faces) {

//     const progIdx = gfx.prog.idx;
//     const vbIdx = gfx.vb.idx;
//     const ibIdx = gfx.ib.idx;
//     const prog = Gl_progs_get_prog_byidx(progIdx);
//     const vb = Gl_progs_get_vb_byidx(progIdx, vbIdx);
//     // console.log('[[[ ', progIdx, vbIdx, ' count ', vb.count, ' meshCount:', vb.mesh_count)
//     const ib = Gl_progs_get_ib_byidx(progIdx, ibIdx);


//     if (GL.BOUND_PROG_IDX !== progIdx) {
//         GlUseProgram(prog.webgl_program, progIdx);
//         GL.BOUND_PROG_IDX = progIdx;
//         gfxCtx.gl.bindVertexArray(vb.vao);
//         gfxCtx.gl.bindBuffer(gfxCtx.gl.ARRAY_BUFFER, vb.webgl_buffer);
//         GL.BOUND_VBO_IDX = vbIdx;
//     }
//     if (GL.BOUND_VBO_IDX !== vbIdx) {
//         gfxCtx.gl.bindVertexArray(vb.vao);
//         gfxCtx.gl.bindBuffer(gfxCtx.gl.ARRAY_BUFFER, vb.webgl_buffer);
//         GL.BOUND_VBO_IDX = vbIdx;
//     }

//     CreateUniqueMesh(vb.debug.meshesNames, meshName);

//     // Reallocate vertex buffer if it has no more space
//     const meshSize = gfx.attribsPerVertex * gfx.vertsPerRect * num_faces;
//     if (vb.vCount * gfx.attribsPerVertex + meshSize >= vb.size) vb.Realloc();

//     if (typeof pos[0] !== 'number')
//         console.log(pos, dim, meshName)


//     vb.AddGeometry(sid, pos, dim, time, prog.shaderinfo, num_faces, gfx.vb.start, gfx.vb.count);
//     prog.isActive = true; // Sets a program to 'active', only if there are meshes in the program's vb

//     /* * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * *
//      * Add Mesh to Index Buffer
//      */
//     if (sid.shad & SID.SHAD.INDEXED) {

//         // Check for buffer realloc
//         if (ib.count + num_faces * INDICES_PER_RECT > ib.size) {
//             ib.Realloc();
//         }

//         gfx.ib.start = ib.count;
//         ib.Add(num_faces)
//         gfx.ib.count = ib.count;
//     }
// }

// export function Gl_remove_geometry_fast(gfx, num_faces) {

//     const progIdx = gfx.prog.idx;
//     const vbIdx = gfx.vb.idx;
//     // const ibIdx = gfx.ib.idx;
//     // const prog = Gl_progs_get_prog_byidx(progIdx);
//     const vb = Gl_progs_get_vb_byidx(progIdx, vbIdx);
//     // const ib = Gl_progs_get_ib_byidx(progIdx, ibIdx);

//     vb.Remove_geometry_fast(gfx, num_faces);

//     /* * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * *
//      * Remove Mesh from Index Buffer
//      */
//     // if (gfx.sid.shad & SID.SHAD.INDEXED) {

//     //     // Check for buffer realloc
//     //     if(ib.count + num_faces*INDICES_PER_RECT > ib.size){
//     //         ib.Realloc();
//     //     }

//     //     gfx.ib.start = ib.count;
//     //     ib.Add(num_faces)
//     //     gfx.ib.count = ib.count;
//     // }
// }

export function Gl_shift_right_geometry(gfx, num_faces=1, new_num_faces=null) {

    const vb = Gl_progs_get_vb_byidx(gfx.prog.idx, gfx.vb.idx);
    // const ib = Gl_progs_get_ib_byidx(gfx.prog.idx, gfx.ib.idx);

    const ret = {
        counts:[0,0],
        last: (gfx.vb.start+gfx.vb.count*num_faces >= vb.count) ? true : false,
        start: gfx.vb.start
    };

    if(DEBUG.GFX.REMOVE_MESH) console.log('idx:', gfx.prog.idx, gfx.vb.idx, 'vb count:', vb.count, ' attributes from start:', gfx.vb.start, ' to:', gfx.vb.start+gfx.vb.count*num_faces)
    ret.counts[0] = vb.Shift_geometry(gfx, num_faces, new_num_faces);
    if(DEBUG.GFX.REMOVE_MESH) console.log('vb count:', vb.count, ' remove:', ret.counts[0], ' attributes from start:', gfx.vb.start)
    // TODO!: Implement shift for the index buffer, in case we use non-rected faces for meshes

    return ret;
}

export function GlHandlerAddGeometryBuffer(sid, gfx, meshName, posBuffer, dimBuffer) {

    const progIdx = gfx.prog.idx;
    const vbIdx = gfx.vb.idx;
    const ibIdx = gfx.ib.idx;
    const prog = Gl_progs_get_prog_byidx(progIdx);
    const vb = Gl_progs_get_vb_byidx(progIdx, vbIdx);
    const ib = Gl_progs_get_ib_byidx(progIdx, ibIdx);

    if (GL.BOUND_PROG_IDX !== progIdx) {
        GlUseProgram(prog.webgl_program, progIdx);
        GL.BOUND_PROG_IDX = progIdx;
    }
    if (GL.BOUND_VBO_IDX !== vbIdx) {
        gfxCtx.gl.bindVertexArray(vb.vao)
        gfxCtx.gl.bindBuffer(gfxCtx.gl.ARRAY_BUFFER, vb.webgl_buffer);
        GL.BOUND_VBO_IDX = vbIdx;
    }

    CreateUniqueMesh(vb.debug.meshesNames, meshName);

    // Reallocate vertex buffer if it has no more space
    const meshSize = gfx.attribsPerVertex * gfx.vertsPerRect * gfx.num_faces;
    if (vb.vCount * gfx.attribsPerVertex + meshSize >= vb.size) {
        vb.Realloc();
    }

    const stride = prog.shaderinfo.attribsPerVertex;
    let start = gfx.vb.start + prog.shaderinfo.attributes.offset.pos;
    const vbAttrCount = (prog.shaderinfo.attribsPerVertex * prog.shaderinfo.verticesPerRect) * gfx.num_faces;
    GlOps.VbSetAttribBuffer(vb, start, vbAttrCount, stride, dimBuffer, prog.shaderinfo.attributes.size.pos);
    start = gfx.vb.start + prog.shaderinfo.attributes.offset.wposTime;
    GlOps.VbSetAttribBuffer(vb, start, vbAttrCount, stride, posBuffer, prog.shaderinfo.attributes.size.pos); // Repeat the wpos for every vertex(vb.count)
    if (sid.attr & SID.ATTR.WPOS_TIME4) {
        start = gfx.vb.start + prog.shaderinfo.attributes.offset.time;
        const time = [1,];
        GlOps.VbSetAttribBuffer(vb, start, vbAttrCount, stride, time, prog.shaderinfo.attributes.size.time); // Repeat the wpos for every vertex(vb.count)
    }

    prog.isActive = true; // Sets a program to 'active', only if there are meshes in the program's vb
    vb.needsUpdate = true;
    vb.vCount += prog.shaderinfo.verticesPerRect * gfx.num_faces;

    /* * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * *
     * Add Mesh to Index Buffer
     */
    if (sid.shad & SID.SHAD.INDEXED) {

        // Check for buffer realloc
        if (ib.count + gfx.num_faces * INDICES_PER_RECT > ib.size) {
            ib.Realloc();
        }

        gfx.ib.start = ib.count;
        ib.Add(gfx.num_faces)
        gfx.ib.count = ib.count;
    }
}

// export function GlAddMaterial(sid, gfx, col, tex, style, sdf, num_faces=1) {

//     // TODO: TEMP
//     // const num_faces = 1;

//     const progIdx = gfx.prog.idx;
//     const vbIdx = gfx.vb.idx;
//     const prog = Gl_progs_get_prog_byidx(progIdx);
//     const vb = Gl_progs_get_vb_byidx(progIdx, vbIdx);

//     if (GL.BOUND_PROG_IDX !== progIdx) {
//         GlUseProgram(prog.webgl_program, progIdx);
//         GL.BOUND_PROG_IDX = progIdx;
//         gfxCtx.gl.bindVertexArray(vb.vao)
//         gfxCtx.gl.bindBuffer(gfxCtx.gl.ARRAY_BUFFER, vb.webgl_buffer);
//         GL.BOUND_VBO_IDX = vbIdx;
//     }
//     if (GL.BOUND_VBO_IDX !== vbIdx) {
//         gfxCtx.gl.bindVertexArray(vb.vao)
//         gfxCtx.gl.bindBuffer(gfxCtx.gl.ARRAY_BUFFER, vb.webgl_buffer);
//         GL.BOUND_VBO_IDX = vbIdx;
//     }
//     // gfx.vb.start = vb.count;
//     // console.log(gfx.vb.start)
//     vb.AddMaterial(sid, prog.shaderinfo, num_faces, gfx.vb.start, gfx.vb.count, col, tex, style, sdf);

// }

export function GlHandlerAddMaterialBuffer(sid, gfx, colBuffer, texBuffer) {

    const progIdx = gfx.prog.idx;
    const vbIdx = gfx.vb.idx;
    const prog = Gl_progs_get_prog_byidx(progIdx);
    const vb = Gl_progs_get_vb_byidx(progIdx, vbIdx);

    if (GL.BOUND_PROG_IDX !== progIdx) {
        GlUseProgram(prog.webgl_program, progIdx);
        GL.BOUND_PROG_IDX = progIdx;
    }
    if (GL.BOUND_VBO_IDX !== vbIdx) {
        gfxCtx.gl.bindVertexArray(vb.vao)
        gfxCtx.gl.bindBuffer(gfxCtx.gl.ARRAY_BUFFER, vb.webgl_buffer);
        GL.BOUND_VBO_IDX = vbIdx;
    }

    const attribSize = prog.shaderinfo.attributes.size.col;
    const stride = prog.shaderinfo.attribsPerVertex;
    let start = gfx.vb.start + prog.shaderinfo.attributes.offset.col;
    const vbCount = (prog.shaderinfo.attribsPerVertex * prog.shaderinfo.verticesPerRect) * gfx.num_faces;
    GlOps.VbSetAttribBuffer(vb, start, vbCount, stride, colBuffer, attribSize); // Repeat the col for every vertex(vb.count)
    prog.isActive = true; // Sets a program to 'active', only if there are meshes in the program's vb
    vb.needsUpdate = true;

}

export function GlHandlerAddIndicesBuffer(gfx, buffer) {

    const progIdx = gfx.prog.idx;
    const vbIdx = gfx.vb.idx;
    const ibIdx = gfx.ib.idx;
    const prog = Gl_progs_get_prog_byidx(progIdx);
    const ib = Gl_progs_get_ib_byidx(progIdx, ibIdx);

    if (GL.BOUND_PROG_IDX !== progIdx) {
        GlUseProgram(prog.webgl_program, progIdx);
        GL.BOUND_PROG_IDX = progIdx;
    }
    if (GL.BOUND_VBO_IDX !== vbIdx) {
        console.error('Fix the buffer binding for index buffer insertion. @ GlBuffers.js')
    }

    // gfx.ib.start = ib.count;
    IndicesCreateFromBuffer(ib, buffer);
    gfx.ib.count = ib.count;
    console.log('indexBuffer:', ib)
}

function IndicesCreateFromBuffer(ib, buffer) {

    // let cnt = ib.vCount;
    // const len = buffer.length;

    // let i = 0;
    // while (i < len) {

    //     ib.data[cnt++] = buffer[cnt2++]
    //     i++;
    // }

    ib.needsUpdate = true; // Make sure that we update GL bufferData 
}


///////////////////////////////////////////////////////////////////////////////////////////////////////////////////



/**
 * Update index and vertex buffers.
 * When meshes are added to the local buffers, we must inform GL to update to the changed buffers. 
 */
export function GlUpdateVertexBufferData(gl, buffer) {

    gl.bindBuffer(gl.ARRAY_BUFFER, buffer.webgl_buffer);
    // bufferData(target, srcData, usage, srcOffset)
    gl.bufferData(gl.ARRAY_BUFFER, buffer.data, gl.STATIC_DRAW, 0);
    // gl.bufferData(gl.ARRAY_BUFFER, buffer.data, gl.DYNAMIC_DRAW, 0);

    buffer.needsUpdate = false;
}
export function GlUpdateVertexBufferSubData(gl, buffer, src_offset, dst_offset, byte_length) {

    gl.bindBuffer(gl.ARRAY_BUFFER, buffer.webgl_buffer);
    // bufferSubData(target, dstByteOffset, srcData, srcOffset, length)
    gl.bufferSubData(gl.ARRAY_BUFFER, dst_offset, buffer.data, src_offset, byte_length)
    buffer.needsUpdate = false;
}
export function GlUpdateIndexBufferData(gl, buffer) {

    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, buffer.webgl_buffer);
    gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, buffer.data, gl.STATIC_DRAW, 0);
    buffer.needsUpdate = false;
}

/**
 * When a mesh is to be drawn, we check to see, if a program that
 * satisfies that meshe's data, already exists. 
 * If exists, we return the program's index, else -1 for false
 * 
 * @param {*} sid : The Shader Type Id
 * @param {*} progs : The array of all GL programs
 * @returns : 0-n: true or -1:false
 */

function ProgramExists(sid, progs) {

    for (let i = 0; i < progs.length; i++)
        if (SID.CheckSidMatch(sid, progs[i].sid)) return i;
    return INT_NULL;
}

/**
 * 
 * @param {*} sceneidx : The id for the scene the Vertex Buffer belongs to.
 * @param {*} prog : WebGl program
 * @returns 
 */
/** TODO: The name 'VertexBufferExists' should not check for 'isPrivate'. Change the name or create another function like 'VertexBufferMatch' */
/** Also: The function doe not check for sid match. The only thing that makes the function work is that the programs sid is checked erlier */
function VertexBufferExists(sceneidx, prog) {

    for (let i = 0; i < prog.vertexBufferCount; i++) {
        if (sceneidx === prog.vertexBuffer[i].sceneidx && !prog.vertexBuffer[i].isPrivate)
            return i;

    }
    return -1;
}
function IndexBufferExists(ibIdx, sceneidx, prog) {
    if (sceneidx === undefined)
        console.log()
    // alert('scene index is missing. @ GlBuffers.js, IndexBufferExists().')
    for (let i = 0; i < prog.indexBufferCount; i++) {
        if (ibIdx === prog.indexBuffer[i].idx && sceneidx === prog.indexBuffer[i].sceneidx) {
            if (i < 0)
                console.log
            return i;
        }

    }
    return -1;
}

// TODO: the scene id must be a unique hex for bit masking, so we can & it with programs many scene ids.
export function GfxSetVbRenderFromSceneId(sceneidx, flag) {

    const progs = Gl_progs_get();

    for (let i = 0; i < progs.length; i++) {
        for (let j = 0; j < progs[i].vertexBufferCount; j++) {
            if (sceneidx === progs[i].vertexBuffer[j].sceneidx) {
                progs[i].vertexBuffer[j].show = flag;
                progs[i].indexBuffer[j].show = flag;
            }
        }
    }
}



function CreateIndices(ib, num_faces) {

    const offset = 4;
    let k = ib.vCount;

    for (let i = 0; i < num_faces; ++i) {

        for (let j = 0; j < 2; j++) {

            ib.data[ib.count++] = k + j;
            ib.data[ib.count++] = k + j + 1;
            ib.data[ib.count++] = k + j + 2;
        }

        k += offset;
        ib.vCount += offset;
    }

    ib.needsUpdate = true; // Make sure that we update GL bufferData 
}

// Set flag 'isPrivate' to true for specific gfx buffers.
export function GlSetVertexBufferPrivate(progIdx, vbIdx) {
    const vb = Gl_progs_get_vb_byidx(progIdx, vbIdx);
    vb.SetPrivate();
}

// export function GlRemoveFromEndOfVertexBuffer(vb, gfx, num_faces) {

//     // const vb = Gl_progs_get_vb_byidx(gfx.prog.idx, gfx.vb.idx);
//     const meshTotalAttrCount = gfx.vb.count * num_faces;
//     const count = vb.count - (vb.count - meshTotalAttrCount);
//     const vCount = meshTotalAttrCount / gfx.attribsPerVertex;
//     vb.count -= count;
//     vb.vCount -= vCount;
//     vb.needsUpdate = true;
// }

export function GlResetVertexBuffer(gfx) {
    const vb = Gl_progs_get_vb_byidx(gfx.prog.idx, gfx.vb.idx);
    vb.Reset();
}
export function GlResetIndexBuffer(gfx) {
    const ib = Gl_progs_get_ib_byidx(gfx.prog.idx, gfx.ib.idx);
    ib.Reset();
}

export function GlUseProgram(webgl_program, progIdx) {
    gfxCtx.gl.useProgram(webgl_program);
    GL.BOUND_PROG_IDX = progIdx;
    GL.BOUND_PROG = webgl_program;
}
export function GlBindVAO(vao) {
    gfxCtx.gl.bindVertexArray(vao);
    GL.BOUND_VAO = vao;
}
export function GlBindTexture(texture) {
    gfxCtx.gl.activeTexture(texture.texId);
    gfxCtx.gl.bindTexture(gfxCtx.gl.TEXTURE_2D, texture.tex);

    // TODO: Combine the Texture to the global GL
    GL.BOUND_TEXTURE_ID = texture.texId; // Update the global GL constant object
    GL.BOUND_TEXTURE_IDX = texture.idx;
    Texture.boundTexture = texture.idx; // Update the global Texture constant object
}

// Helpers
function CreateUniqueMesh(strArr, str) {
    for (let i = 0; i < strArr.length; i++) {
        if (strArr[i] === str) {
            return;
        }
    }
    //Else if the string does not exist, add it
    strArr.push(str);
}