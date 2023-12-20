import * as GlOps from './GlBufferOps.js';
import { Gl_create_program } from '../GlProgram.js'
import { Gl_ib_create_indexbuffer, Gl_ib_exists, Gl_ib_get_byidx, Gl_ib_get_byidx_in_prog, IndexBuffer } from './IndexBuffer.js';
import { VertexBuffer } from './VertexBuffer.js';
import { Gl_progs_get_ib_byidx, Gl_progs_get_prog_byidx, Gl_progs_get_group, Gl_progs_get_vb_byidx } from '../GlProgram.js';
import { Scenes_create_vertex_buffer_buffer } from '../../Engine/Scenes.js';
import { Gfx_create_vertexbuffer_buffer } from '../../Engine/Interfaces/Gfx/GfxContextCreate.js';
import { GfxInfoMesh, GlEnableAttribsLocations, Gl_set_vb_show } from '../GlProgram.js'

// For Debuging
import * as dbg from '../Z_Debug/GfxDebug.js'






export function ProgramExists(sid) {

    const groupidx = PROGRAMS_GROUPS.GetIdxByMask(sid.progs_group)
    const progs = Gl_progs_get_group(groupidx);
    if(ERROR_NULL(progs) || ERROR_NULL(progs.buffer)) return INT_NULL
    for (let i = 0; i < progs.count; i++)
        if (SID.CheckSidMatch(sid, progs.buffer[i].sid)) return i;
    return INT_NULL;
}

/** // TODO: The name 'VertexBufferExists' should not check for 'isPrivate'. Change the name or create another function like 'VertexBufferMatch' */
/** // CAUTION: The function does not check for sid match. The only thing that makes the function work is that the programs sid is checked erlier */
export function VertexBufferExists(sceneidx, prog) {

    for (let i = 0; i < prog.vertexBufferCount; i++) {
        if (sceneidx === prog.vb[i].sceneidx && !prog.vb[i].isPrivate){
            return i;
        }
    }
    return -1;
}

function IndexBufferExists(ibIdx, sceneidx, prog) {

    for (let i = 0; i < prog.indexBufferCount; i++) {
        if (ibIdx === prog.ib[i].idx && sceneidx === prog.ib[i].sceneidx) {
            return i;
        }
    }
    return -1;
}

export function GlCheckContext(sid, sceneidx) {

    // const progs = Gl_progs_get_group(sid.progs_group);
    const progidx = ProgramExists(sid);

    if (progidx !== INT_NULL) {

        const vbidx = VertexBufferExists(sceneidx, progs.buffer[progidx]);
        if (vbidx !== INT_NULL) return [progidx, vbidx];
    }

    return [INT_NULL, INT_NULL];
}

export function Gl_create_shader_program(sid){

    const gfx_idxs = Gl_create_program(sid);
    const groupidx = gfx_idxs.groupidx;
    const progidx = gfx_idxs.progidx;
    // const progs = Gl_progs_get_group(groupidx);
    const prog = Gl_progs_get_prog_byidx(groupidx, progidx);
    

    /**********************************************************************/
    // Bind shader program's uniforms
    GlUseProgram(prog.webgl_program, progidx);
     
    // Enable screen resolution uniform (vec2)  
    if (sid.unif & SID.UNIF.BUFFER_RES) {
        const unifBufferResIdx = prog.UniformsBufferCreateScreenRes();
        prog.UniformsSetBufferUniform(VIEWPORT.WIDTH, unifBufferResIdx.resXidx);
        prog.UniformsSetBufferUniform(VIEWPORT.HEIGHT, unifBufferResIdx.resYidx);
    }

    // Enable global timer uniform (float)
    if (sid.unif & SID.UNIF.BUFFER_RES) {
        const step = 0.1;
        prog.UniformsCreateTimer(step);
    }

    return gfx_idxs;
}

export function Gl_create_vertex_buffer(sid, sceneidx, prog, groupidx){

    const vbidx = prog.vertexBufferCount++;
    prog.vb[vbidx] = new VertexBuffer(sid, sceneidx, vbidx, gfxCtx.gl);
    const vb = prog.vb[vbidx];

    Scenes_create_vertex_buffer_buffer(sceneidx, groupidx, prog.idx, vbidx); // For storing meshes by its gfx
    Gfx_create_vertexbuffer_buffer(groupidx, prog.idx, vbidx);

    gfxCtx.gl.bindVertexArray(vb.vao);
    gfxCtx.gl.bindBuffer(gfxCtx.gl.ARRAY_BUFFER, vb.webgl_buffer);

    // Initialize attribute locations of the shader program's new vertex buffer.
    GlEnableAttribsLocations(gfxCtx.gl, prog);

    if (dbg.GL_DEBUG_BUFFERS_ALL) console.log('===== VertexBuffer =====\nvbidx:', vbidx, 'progidx:', prog.idx);

    // Create Index buffer
    if (sid.shad & SID.SHAD.INDEXED) {

        // const ibidx = prog.indexBufferCount++;
        // prog.ib[ibidx] = new IndexBuffer(sid, sceneidx, ibidx, gfxCtx.gl, INDICES_PER_RECT);
        // prog.ib[ibidx].vao = vb.vao; // Let index buffer have a copy of the vao
        
        // const ibidx = Gl_ib_create_indexbuffer(sid, sceneidx, gfxCtx.gl, INDICES_PER_RECT, vb.vao);
        // prog.ib.push(ibidx);
        prog.CreateIndexBuffer(sid, sceneidx, gfxCtx.gl, INDICES_PER_RECT, vb.vao);

        if (dbg.GL_DEBUG_BUFFERS_ALL) console.log('----- VertexBuffer -----\nibidx:', ibidx, 'progidx:', prog.idx)
    }


    return vb;
}


export function Gl_generate_context(sid, sceneidx, groupidx, progidx, vbidx, num_faces = 1) {

    // ProgramExists returns 0 index based program or -1 for not found
    // const groupidx = PROGRAMS_GROUPS.GetIdxByMask(sid.progs_group);
    const prog = Gl_progs_get_prog_byidx(groupidx, progidx);
    const vb = Gl_progs_get_vb_byidx(groupidx, progidx, vbidx);
    const ibidx = Gl_ib_exists(prog.ib[vbidx], sceneidx);
    // IMPORTANT: ibidx always has the same index value as vbidx, 1 to 1 buffers. What if later we want to use arbitary index buffers??? We must implement another way of finding the correct ib(Most probable is to pass the ibidx to this function)
    const ib = Gl_ib_get_byidx(prog.ib[ibidx]);
    
    // Cash values
    const vertsPerRect = prog.shaderinfo.verticesPerRect;
    const attribsPerVertex = prog.shaderinfo.attribsPerVertex;
    const count = vertsPerRect * attribsPerVertex; // Total attributes of the mesh. All text meshes have only one face registered, the rest of the faces are calculated if needed.

    // Create meshe's gfx info
    const gfx_ctx = new GfxInfoMesh; // NOTE: This is the only construction of a new GfxInfoMesh object(as for now), all other calls are for creating a copy of an existing GfxInfoMesh. 
    gfx_ctx.sid = sid;
    gfx_ctx.sceneidx = sceneidx;
    gfx_ctx.vao = vb.vao;
    gfx_ctx.num_faces = num_faces;
    gfx_ctx.vertsPerRect = vertsPerRect;
    gfx_ctx.attribsPerVertex = attribsPerVertex;
    
    gfx_ctx.prog.groupidx = groupidx;
    gfx_ctx.prog.idx = progidx;

    gfx_ctx.vb.idx = vbidx;
    gfx_ctx.vb.start = 0; // NOTE: The start of the mesh in the vertex buffer is calculated when the mesh is added to the vertex buffer.
    gfx_ctx.vb.end = num_faces * vertsPerRect * attribsPerVertex; 
    gfx_ctx.vb.count = count; // The number of attributes per face

    gfx_ctx.ib.idx = ibidx; // Stores the programs index for the indexbuffer.
    gfx_ctx.ib.start = 0;
    gfx_ctx.ib.count = ib.count;

    return gfx_ctx;
}


export function Gl_add_geom_mat_to_vb(sid, gfx, geom, mat, vb_type_flag, mesh_name, meshidx){

    
    // console.log(meshidx, mesh_name)
    /**DEBUG ERROR*/ if(geom.pos[0] === undefined){ console.error('Pos is UNDEFINED. mesh:', mesh_name)}
    /**DEBUG ERROR*/ if(geom.dim[0] === undefined){ console.error('Dim is UNDEFINED. mesh:', mesh_name)}
    /**DEBUG ERROR*/ if(mat.col[0] === undefined){ console.error('Col is UNDEFINED. mesh:', mesh_name)}
    /**DEBUG ERROR*/ if(mat.style[0] === undefined){ console.error('Style is UNDEFINED. mesh:', mesh_name)}
    // /**DEBUG ERROR*/ if(meshidx === undefined){ console.error('Mesh index is not passed as a param. mesh:', mesh_name)}

    const groupidx = gfx.prog.groupidx;
    const progidx = gfx.prog.idx;
    const vbIdx = gfx.vb.idx;
    const ibIdx = gfx.ib.idx;
    const prog = Gl_progs_get_prog_byidx(groupidx, progidx);
    const vb = Gl_progs_get_vb_byidx(groupidx, progidx, vbIdx);
    const ib = Gl_ib_get_byidx_in_prog(prog.ib[ibIdx]);
    if(ib===undefined)
    console.log()
    const num_faces = 1;
    const start = (!gfx.vb.start) ? vb.count : gfx.vb.start;
    vb.vCount += prog.shaderinfo.verticesPerRect * gfx.num_faces;

    const count = gfx.vb.count;

    if (GL.BOUND_PROG_IDX !== progidx) {
        GlUseProgram(prog.webgl_program, progidx);
        GL.BOUND_PROG_IDX = progidx;
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

    if(!vb.show)
        Gl_set_vb_show(groupidx, progidx, vbIdx, true);

    if(vb_type_flag) vb.type |= vb_type_flag;

    // Store the texture index in the vertex
    vb.texidx = mat.texidx;

    /**DEBUG */vb.mesh_indexes.push(meshidx);
    /**DEBUG */CreateUniqueMesh(vb.debug.meshesNames, `${mesh_name} start:${start}`);

    return start;
}

export function Gl_shift_right_geometry(gfx, num_faces=1, new_num_faces=null) {

    const vb = Gl_progs_get_vb_byidx(gfx.prog.groupidx, gfx.prog.idx, gfx.vb.idx);

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

    const groupidx = gfx.prog.groupidx;
    const progidx = gfx.prog.idx;
    const vbIdx = gfx.vb.idx;
    const ibIdx = gfx.ib.idx;
    const prog = Gl_progs_get_prog_byidx(groupidx, progidx);
    const vb = Gl_progs_get_vb_byidx(groupidx, progidx, vbIdx);
    const ib = Gl_progs_get_ib_byidx(gfx.prog.groupidx, gfx.prog.idx, gfx.ib.idx);
    // const ib = Gl_progs_get_ib_byidx(groupidx, progidx, ibIdx);

    if (GL.BOUND_PROG_IDX !== progidx) {
        GlUseProgram(prog.webgl_program, progidx);
        GL.BOUND_PROG_IDX = progidx;
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

export function GlHandlerAddMaterialBuffer(sid, gfx, colBuffer, texBuffer) {

    const groupidx = gfx.prog.groupidx;
    const progidx = gfx.prog.idx;
    const vbIdx = gfx.vb.idx;
    const prog = Gl_progs_get_prog_byidx(groupidx, progidx);
    const vb = Gl_progs_get_vb_byidx(groupidx, progidx, vbIdx);

    if (GL.BOUND_PROG_IDX !== progidx) {
        GlUseProgram(prog.webgl_program, progidx);
        GL.BOUND_PROG_IDX = progidx;
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

    const groupidx = gfx.prog.groupidx;
    const progidx = gfx.prog.idx;
    const vbIdx = gfx.vb.idx;
    const ibIdx = gfx.ib.idx;
    const prog = Gl_progs_get_prog_byidx(groupidx, progidx);
    // const ib = Gl_progs_get_ib_byidx(groupidx, progidx, ibIdx);
    const ib = Gl_progs_get_ib_byidx(gfx.prog.groupidx, gfx.prog.idx, gfx.ib.idx);

    if (GL.BOUND_PROG_IDX !== progidx) {
        GlUseProgram(prog.webgl_program, progidx);
        GL.BOUND_PROG_IDX = progidx;
    }
    if (GL.BOUND_VBO_IDX !== vbIdx) {
        console.error('Fix the buffer binding for index buffer insertion. @ GlBuffers.js')
    }

    // gfx.ib.start = ib.count;
    IndicesCreateFromBuffer(ib, buffer);
    gfx.ib.count = ib.count;
    console.log('ib:', ib)
}

function IndicesCreateFromBuffer(ib, buffer) {

    // let cnt = ib.vCount;
    // const len = buffer.length;

    // let i = 0;
    // while (i < len) {

    //     ib.data[cnt++] = buffer[cnt2++]
    //     i++;
    // }

    ib.FLAGS.NEEDS_UPDATE = true; // Make sure that we update GL bufferData 
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





// TODO: the scene id must be a unique hex for bit masking, so we can & it with programs many scene ids.
export function GfxSetVbRenderFromSceneId(sceneidx, flag) {

    const progs = Gl_progs_get_group();

    for (let i = 0; i < progs.length; i++) {
        for (let j = 0; j < progs.buffer[i].vertexBufferCount; j++) {
            if (sceneidx === progs.buffer[i].vb[j].sceneidx) {
                progs.buffer[i].vb[j].show = flag;
                progs.buffer[i].ib[j].show = flag;
            }
        }
    }
}


// Set flag 'isPrivate' to true for specific gfx buffers.
export function GlSetVertexBufferPrivate(groupidx, progidx, vbIdx) {
    const vb = Gl_progs_get_vb_byidx(groupidx, progidx, vbIdx);
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
    const vb = Gl_progs_get_vb_byidx(gfx.prog.groupidx, gfx.prog.idx, gfx.vb.idx);
    vb.Reset();
}
export function GlResetIndexBuffer(gfx) {
    // const ib = Gl_progs_get_ib_byidx(gfx.prog.groupidx, gfx.prog.idx, gfx.ib.idx);
    const ib = Gl_progs_get_ib_byidx(gfx.prog.groupidx, gfx.prog.idx, gfx.ib.idx);
    ib.Reset();
}

export function GlUseProgram(webgl_program, progidx) {
    gfxCtx.gl.useProgram(webgl_program);
    GL.BOUND_PROG_IDX = progidx;
    GL.BOUND_PROG = webgl_program;
}
export function GlBindVAO(vao) {
    gfxCtx.gl.bindVertexArray(vao);
    GL.BOUND_VAO = vao;
}

// Helpers
function CreateUniqueMesh(strArr, str, ) {
    for (let i = 0; i < strArr.length; i++) {
        if (strArr[i] === str) {
            return;
        }
    }
    //Else if the string does not exist, add it
    strArr.push(str);
}