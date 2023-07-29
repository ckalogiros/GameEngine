"use strict";
import { PrintShaderInfo } from './Z_Debug/GfxDebug.js';
import { LoadShaderProgram } from './GlShaders.js';
import { GlUseProgram } from './Buffers/GlBuffers.js';
import { Uniform, UniformsBuffer } from './Buffers/GlUniformBuffer.js';
import { SHADER_CONSTANTS } from './Shaders/ConstructShader.js';

// Global Gl Program object
const _glPrograms = [];
let g_glProgramsCount = 0;


export function GlIncrProgramsCnt() { g_glProgramsCount++; }
export function GlGetProgramsCnt() { return g_glProgramsCount; }
export function GlGetPrograms() { return _glPrograms; }
export function GlGetProgram(progIdx) { return _glPrograms[progIdx]; }
export function GlStoreProgram(progIdx, program) { _glPrograms[progIdx] = program; }
export function GlGetVB(progIdx, vbIdx) { return _glPrograms[progIdx].vertexBuffer[vbIdx]; }
export function GlGetIB(progIdx, ibIdx) { return _glPrograms[progIdx].indexBuffer[ibIdx]; }

export function GlGetProgramShaderInfo(progIdx) { return _glPrograms[progIdx].shaderInfo; }
export function GlGetProgramUniformLocations(progIdx) { return _glPrograms[progIdx].shaderInfo.uniforms; }

export function GlSetTexture(progIdx, vbIdx, texIdx){
	_glPrograms[progIdx].vertexBuffer[vbIdx].texIdx = texIdx; 
}


export class GfxInfoMesh {

	sid = INT_NULL;
	sceneIdx = INT_NULL;
	numFaces = 0;
	vertsPerRect = 0;
	attribsPerVertex = 0;
	meshIdx = INT_NULL; // The index of the current mesh in the vertexBuffer's array of meshes

	prog = {
		idx: INT_NULL,
	}
	vao = null;

	vb = { // The vertex buffer info the mesh belongs to
		// buffer: null,
		idx: INT_NULL,			// The vertex buffer (float*) idx that this Mesh is stored to.
		start: 0,		// The current meshe's starting idx in vertex buffer. 
		count: 0,		// Current size of the float buffer (in floats)
	};

	ib = { // The vertex buffer info the mesh belongs to
		// buffer: null,
		idx: INT_NULL,			// The idx buffer's  idx.
		start: 0,		// The current meshe's starting idx in vertex buffer. 
		count: 0,		// Number of total meshe's attributes  
	};

	tb = { // The Texture info for the mesh
		id: INT_NULL,     // An id generated by webGl (texture unit: GL_TEXTURE0)
		idx: INT_NULL,
	};

	constructor(gfxInfoMesh = {}) {

		if (gfxInfoMesh instanceof GfxInfoMesh) {

			this.sid = gfxInfoMesh.sid;
			this.sceneIdx = gfxInfoMesh.sceneIdx;
			this.numFaces = gfxInfoMesh.numFaces;
			this.vertsPerRect = gfxInfoMesh.vertsPerRect;
			this.attribsPerVertex = gfxInfoMesh.attribsPerVertex;
			this.meshIdx = gfxInfoMesh.meshIdx; 
			this.vao = gfxInfoMesh.vao; 
			
			this.prog.idx = gfxInfoMesh.prog.idx; 
		
			this.vb.idx = gfxInfoMesh.vb.idx;
			this.vb.start = gfxInfoMesh.vb.start;
			this.vb.count = gfxInfoMesh.vb.count;

			this.ib.idx = gfxInfoMesh.ib.idx;
			this.ib.start = gfxInfoMesh.ib.start;
			this.ib.count = gfxInfoMesh.ib.count;

			this.tb.id = gfxInfoMesh.tb.id;
			this.tb.idx = gfxInfoMesh.tb.idx;
		}
	}

}


export class GlProgram {

	constructor(gl, sid) {

		this.sid = sid; // Shader Type ID (E.g. ATTR_COL4 | ATTR_POS2 | INDEXED)
		this.idx = GlGetProgramsCnt();
		GlIncrProgramsCnt();

		this.webgl_program = null;
		this.isActive = false;

		this.uniformsNeedUpdate = false;

		this.vertexBuffer = [];
		this.vertexBufferCount = 0;

		this.indexBuffer = [];
		this.indexBufferCount = 0;

		this.webgl_program = LoadShaderProgram(gfxCtx.gl, sid);

		PrintShaderInfo(this);

		this.shaderInfo = {

			attributes: {
				size: this.#PrivateCalculateAttributesSize(this.sid),
				loc: {
					col: gl.getAttribLocation(this.webgl_program, 'a_col'), // Color	
					wposTime: gl.getAttribLocation(this.webgl_program, 'a_wpos_time'), // World Position + Time attrib	 		
					pos: gl.getAttribLocation(this.webgl_program, 'a_pos'),	// Vertex Position	 
					tex: gl.getAttribLocation(this.webgl_program, 'a_tex'), // texture Coords	 		 		
					params1: gl.getAttribLocation(this.webgl_program, 'a_params1'), // A 4 component vector to pass any parameter to a vertex as an attribute 	 		
					sdf: gl.getAttribLocation(this.webgl_program, 'a_sdf'),	// For Sdf's  	 		 		
				},
				offset: {
					col: INT_NULL,
					wposTime: INT_NULL,
					pos: INT_NULL,
					tex: INT_NULL,
					params1: INT_NULL,
					sdf: INT_NULL,
				},
			},

			// Create uniforms buffer. TODO: Create a dynamic buffer Float32Array, by knowing the num of uniforms all meshes will create.
			uniforms: {
				// Static uniforms
				// projection: gl.getUniformLocation(this.webgl_program, 'u_projection'), 	// Projection Matrix4 	
				projection: new Uniform(
					/* value */ 	0,
					/* Location */ gl.getUniformLocation(this.webgl_program, 'u_projection'),
					/* type */		UNIF_TYPE.MAT4,
				),
				sampler: gl.getUniformLocation(this.webgl_program, 'u_sampler0'),	// Sampler for texture units 	
				buffer: new UniformsBuffer(gfxCtx.gl, this, SHADER_CONSTANTS.UNIFORM_BUFFER_COUNT),
			},

			attribsPerVertex: 0,
			verticesPerRect: 0,
		};


		this.timer = {
			val: 0., // A uniform variable to time counter
			step: 0.,
			index: INT_NULL,
			isActive: false,
		};

		GlStoreProgram(this.idx, this);

		this.#PrivateCreateAttribsOffsets();
	}

	#PrivateCalculateAttributesSize(sid) {
		return {
			col: (sid.attr & SID.ATTR.COL4) ? 4 : (0),
			wpos: (sid.attr & SID.ATTR.WPOS_TIME4) ? 3 : (0),
			wposTime: (sid.attr & SID.ATTR.WPOS_TIME4) ? 4 : (0),
			pos: (sid.attr & SID.ATTR.POS2) ? 2 : (sid.attr & SID.ATTR.POS3) ? 3 : (0),
			tex: (sid.attr & SID.ATTR.TEX2) ? 2 : (0),
			params1: (sid.attr & SID.ATTR.PARAMS1) ? 4 : (0),
			time: (sid.attr & SID.ATTR.TIME) ? 1 : (0),
			sdf: (sid.attr & SID.ATTR.SDF) ? 2 : (0),
		}
	}
	#PrivateCreateAttribsOffsets() {
		{
			// Sort the attributes by their location in the shader
			const obj = this.shaderInfo.attributes.loc;
			const sortedAttribLocations = Object.entries(obj)
				.sort(([, v1], [, v2]) => v1 - v2)
				.reduce((obj, [k, v]) => ({
					...obj,
					[k]: v
				}), {});

			// if(DEBUG.SHADER_INFO){
			// 	for (let prop in sortedAttribLocations) {
			// 		if (sortedAttribLocations[prop] > INT_NULL) {
			// 			console.log(prop, ':', sortedAttribLocations[prop])
			// 		}
			// 	}
			// }

			// Store back the sorted version
			this.shaderInfo.attributes.loc = sortedAttribLocations;


			/**
			 * Calculate attribute's offsets (it's byte offset in the vertex buffer)
			 * !IMPORTANT!: For any new attributes added in any vertex shader, include it as shown below 
			 */
			let attribsOffset = 0;
			for (let prop in sortedAttribLocations) {
				if (sortedAttribLocations[prop] > INT_NULL) {
					if (prop === 'col') {
						this.shaderInfo.attributes.offset.col = attribsOffset;
						attribsOffset += this.shaderInfo.attributes.size.col;
					}
					else if (prop === 'pos') {
						this.shaderInfo.attributes.offset.pos = attribsOffset;
						attribsOffset += this.shaderInfo.attributes.size.pos;
					}
					else if (prop === 'wposTime') {
						this.shaderInfo.attributes.offset.wposTime = attribsOffset;
						attribsOffset += this.shaderInfo.attributes.size.wposTime - 1;
						// HACK. TODO, correct
						this.shaderInfo.attributes.offset.time = attribsOffset;
						attribsOffset += 1;
					}
					else if (prop === 'tex') {
						this.shaderInfo.attributes.offset.tex = attribsOffset;
						attribsOffset += this.shaderInfo.attributes.size.tex;
					}
					else if (prop === 'params1') {
						this.shaderInfo.attributes.offset.params1 = attribsOffset;
						attribsOffset += this.shaderInfo.attributes.size.params1;
					}
					else if (prop === 'style') {
						this.shaderInfo.attributes.offset.style = attribsOffset;
						attribsOffset += this.shaderInfo.attributes.size.style;
					}
					else if (prop === 'sdf') {
						this.shaderInfo.attributes.offset.sdf = attribsOffset;
						attribsOffset += this.shaderInfo.attributes.size.sdf;
					}
				}
			}

			// Store the total attributes count
			this.shaderInfo.attribsPerVertex = attribsOffset;
			// Store the total vertices per rectangle mesh based on Indexed geometry or not
			if (this.sid.shad & SID.SHAD.INDEXED)
				this.shaderInfo.verticesPerRect = VERTS_PER_RECT_INDEXED;
			else
				this.shaderInfo.verticesPerRect = VERTS_PER_RECT;

				if(DEBUG.SHADER_INFO) console.log('ShaderInfo:', this.shaderInfo)

		}
	}

	/** Update all program's Uniforms */
	UpdateUniforms(gl){
		if (this.timer.isActive) this,UniformsUpdateTimer();
		if (this.shaderInfo.uniforms.buffer.needsUpdate) {
			this.UniformsUpdateBufferUniforms(gl);
		}
	}

	/**
	 * Uniforms Buffer
	 */
	UniformsCreateBufferUniform(name) {
		this.shaderInfo.uniforms.buffer.CreateUniform(name);
	}
	UniformsSetBufferUniform(val, index) {
		this.shaderInfo.uniforms.buffer.Set(val, index);
	}
	UniformsCreateSetBufferUniform(name, val) {
		const idx = this.shaderInfo.uniforms.buffer.CreateUniform(name);
		this.shaderInfo.uniforms.buffer.Set(val, idx);
	}
	UniformsUpdateBufferUniforms(gl) {
			this.shaderInfo.uniforms.buffer.Update(gl);
	}
	UniformsSetUpdateBufferUniform(gl, val, index) {
		this.shaderInfo.uniforms.buffer.Set(val, index);
		this.shaderInfo.uniforms.buffer.Update(gl);
	}
//if (progs[progIdx].timer.isActive) progs[progIdx].UniformsUpdateTimer();
	/**
	 * Unique Uniforms.
	 * New uniforms that are set by the client and are created as a seperate uniforms in the shaders.
	 */
	UniformsCreateTimer(step) {
		this.timer.isActive = true;
		this.timer.step = step;
		this.timer.index = this.shaderInfo.uniforms.buffer.CreateUniform('Timer');
	}
	UniformsUpdateTimer() {
		this.shaderInfo.uniforms.buffer.Set(this.timer.val, this.timer.index);
		this.uniformsNeedUpdate = true;
		this.timer.val += this.timer.step;
	}
	UniformsBufferCreateScreenRes() {
		const resXidx = this.shaderInfo.uniforms.buffer.CreateUniform('ScreenResX');
		const resYidx = this.shaderInfo.uniforms.buffer.CreateUniform('ScreenResY');
		return {
			resXidx: resXidx,
			resYidx: resYidx,
		};
	}

	/**
	 * Static Uniforms
	 * Uniforms that are used in every new program.
	 */
	UniformsSetProjectionMatrix(val) {
		this.shaderInfo.uniforms.projection.Set(val);
	}
	UniformsUpdateProjectionMatrix(gl) {
		this.shaderInfo.uniforms.projection.Update(gl);
	}
	UniformsSetUpdateProjectionMatrix(gl, val) {
		this.shaderInfo.uniforms.projection.Set(val);
		this.shaderInfo.uniforms.projection.Update(gl);
	}

	/**
	 * Update all uniforms of glProgram.
	 * Not neccesary cause it needs a lot of conditional statements
	 */
	UniformsUpdate(gl) {
		if (this.shaderInfo.uniforms.buffer.needsUpdate) {
			this.shaderInfo.uniforms.buffer.Update(gl);
		}
		if (this.shaderInfo.uniforms.projection.needsUpdate) {
			this.shaderInfo.uniforms.projection.Update(gl, val);
		}
		this.uniformsNeedUpdate = false;
	}

};


/*
 * Generalized Program Web Gl Creation 
 */
export function GlCreateProgram(sid) {
	const prog = new GlProgram(gfxCtx.gl, sid);
	return prog.idx;
}


/**
 * Enabling Attribute locations for a program
 * and
 * Setting the attribute's offsets, types and sizes. 
 * Cannot be implemented in GlProgram class because it needs vao-vbo binding first.
 * 
 * @param {*} gl : Gl context
 * @param {*} prog : The program to which we set enable the attribute locations
 */
export function GlEnableAttribsLocations(gl, prog) {

	const attribsPerVertex = prog.shaderInfo.attribsPerVertex;
	// For Uniforms
	if (prog.shaderInfo.attributes.loc.col >= 0) {
		gl.enableVertexAttribArray(prog.shaderInfo.attributes.loc.col);
		gl.vertexAttribPointer(prog.shaderInfo.attributes.loc.col,
			prog.shaderInfo.attributes.size.col, gl.FLOAT, false, attribsPerVertex * FLOAT, prog.shaderInfo.attributes.offset.col * FLOAT);
			// V_COL_COUNT, gl.FLOAT, false, attribsPerVertex * FLOAT, prog.shaderInfo.attributes.offset.col * FLOAT);
	}
	if (prog.shaderInfo.attributes.loc.pos >= 0) {
		gl.enableVertexAttribArray(prog.shaderInfo.attributes.loc.pos);
		gl.vertexAttribPointer(prog.shaderInfo.attributes.loc.pos,
			prog.shaderInfo.attributes.size.pos, gl.FLOAT, false, attribsPerVertex * FLOAT, prog.shaderInfo.attributes.offset.pos * FLOAT);
	}
	if (prog.shaderInfo.attributes.loc.tex >= 0) {
		gl.enableVertexAttribArray(prog.shaderInfo.attributes.loc.tex);
		gl.vertexAttribPointer(prog.shaderInfo.attributes.loc.tex,
			prog.shaderInfo.attributes.size.tex, gl.FLOAT, false, attribsPerVertex * FLOAT, prog.shaderInfo.attributes.offset.tex * FLOAT);
	}
	if (prog.shaderInfo.attributes.loc.wposTime >= 0) {
		gl.enableVertexAttribArray(prog.shaderInfo.attributes.loc.wposTime);
		gl.vertexAttribPointer(prog.shaderInfo.attributes.loc.wposTime,
			prog.shaderInfo.attributes.size.wposTime, gl.FLOAT, false, attribsPerVertex * FLOAT, prog.shaderInfo.attributes.offset.wposTime * FLOAT);
	}
	if (prog.shaderInfo.attributes.loc.params1 >= 0) {
		gl.enableVertexAttribArray(prog.shaderInfo.attributes.loc.params1);
		gl.vertexAttribPointer(prog.shaderInfo.attributes.loc.params1,
			prog.shaderInfo.attributes.size.params1, gl.FLOAT, false, attribsPerVertex * FLOAT, prog.shaderInfo.attributes.offset.params1 * FLOAT);
	}
	if (prog.shaderInfo.attributes.loc.style >= 0) {
		gl.enableVertexAttribArray(prog.shaderInfo.attributes.loc.style);
		gl.vertexAttribPointer(prog.shaderInfo.attributes.loc.style,
			prog.shaderInfo.attributes.size.style, gl.FLOAT, false, attribsPerVertex * FLOAT, prog.shaderInfo.attributes.offset.style * FLOAT);
	}
	if (prog.shaderInfo.attributes.loc.time >= 0) {
		gl.enableVertexAttribArray(prog.shaderInfo.attributes.loc.time);
		gl.vertexAttribPointer(prog.shaderInfo.attributes.loc.time,
			prog.shaderInfo.attributes.size.time, gl.FLOAT, false, attribsPerVertex * FLOAT, prog.shaderInfo.attributes.offset.time * FLOAT);
	}
	if (prog.shaderInfo.attributes.loc.sdf >= 0) {
		gl.enableVertexAttribArray(prog.shaderInfo.attributes.loc.sdf);
		gl.vertexAttribPointer(prog.shaderInfo.attributes.loc.sdf,
			prog.shaderInfo.attributes.size.sdf, gl.FLOAT, false, attribsPerVertex * FLOAT, prog.shaderInfo.attributes.offset.sdf * FLOAT);
	}
}



export function GlProgramUpdateUniformProjectionMatrix(gl, progIdx, mat4) {
	const prog = _glPrograms[progIdx];
	GlUseProgram(prog.webgl_program); //TODO!!!. Unresonable UseProgram Call. Make it so we do everyything by progarm???
	prog.UniformsSetUpdateProjectionMatrix(gl, mat4);
}

export function GlUseFont(fintIdx){
	
}


let GlUID = INT_NULL; // A unique id for every vertex buffer, to distinguish which meshes belong to which buffer 
export function GlCreateUniqueBufferid() {
	GlUID++;
	return GlUID;
}