"use strict";
import { VertexShaderChoose } from './Shaders/VertexShaders.js'
import { FragmentShaderChoose } from './Shaders/FragmentShaders.js'
import * as dbg from './Debug/GfxDebug.js'

/**
 * How to add an attribute to a program
 * 
 * 	. Set the SID.attribute in GfxConstants
 * 	. Set the V_ attribute length in floats in GfxConstants
 * 
 * 	. Add a loc and offset variables in I_GlProgram object
 * 
 * 	. Add the attribute to the vertex shader
 * 	. Get the attribut location in GlCreateShaderInfo(), also add the loc to the shaderInfo variable of the same function
 * 	. Enable the attribute location with GlEnableAttribsLocations()
 * 
 */

export function LoadShaderProgram(gl, sid) {

	const shader = {
		vShader: VertexShaderChoose(sid),
		fShader: FragmentShaderChoose(sid),
	};
	const program = LoadShaders(gl, shader);
	if (program) {
		if (dbg.GL_DEBUG_SHADERS) console.log('Shader Program Created Sucessuly!\nShader Type ID: ', dbg.GetShaderTypeId(sid));
	} else {
		alert('Unable to CREATE shader program: ' + gl.getProgramInfoLog(program));
	}

	return program;
}


function LoadShaders(gl, shader) {

	const vShader = loadShaders(gl, gl.VERTEX_SHADER, shader.vShader, 'Vertex');
	const fShader = loadShaders(gl, gl.FRAGMENT_SHADER, shader.fShader, 'Fragment');

	const program = gl.createProgram();

	gl.attachShader(program, vShader);
	gl.attachShader(program, fShader);
	gl.linkProgram(program);

	const status = gl.getProgramParameter(program, gl.LINK_STATUS);
	if (!status) {
		alert('Unable to LINK the shader program: ' + gl.getProgramInfoLog(program));
		glDeleteProgram(program);
		program = 0;
		return null;
	} else {
		console.log('Shaders Linked Sucessuly!');
	}

	return program;
}

function loadShaders(gl, shaderType, source, type) {

	const shader = gl.createShader(shaderType);

	gl.shaderSource(shader, source);
	gl.compileShader(shader);

	const status = gl.getShaderParameter(shader, gl.COMPILE_STATUS)
	if (!status) {
		alert(`An error occurred COMPILING shader: ${type} \n ${gl.getShaderInfoLog(shader)}`);
		gl.deleteShader(shader);
		return null;
	} 
	else {
		console.log('Shader Compiled Sucessuly!');
	}

	return shader;
}

export function GlCreateShaderInfo(gl, program, sid) {

	let attribsOffset = 0;


	console.log(dbg.GetShaderTypeId(sid))
	// VertexShaderCreate();


	const shaderInfo = {

		// The string with the name of the attribute/uniform passed to getAttribLocation/Location, 
		// must match the exact name in the vertex shader code.
		attributes: {

			colLoc: gl.getAttribLocation(program, 'a_Col'),	// Color attrib	
			wposTimeLoc: gl.getAttribLocation(program, 'a_WposTime'),	// World Position + Time attrib	 		
			params1Loc: gl.getAttribLocation(program, 'a_Params1'),	// A 4 component vector to pass any parameter to a vertex as an attribute 	 		
			posLoc: gl.getAttribLocation(program, 'a_Pos'),	// Vertex Position attrib	 
			scaleLoc: gl.getAttribLocation(program, 'a_Scale'),	// Scale attrib	 		
			texLoc: gl.getAttribLocation(program, 'a_Tex'),	// texture Coords attrib	 		 		
			sdfParamsLoc: gl.getAttribLocation(program, 'a_Sdf'),	// Sdf Params attrib 	 		 		
			styleLoc: gl.getAttribLocation(program, 'a_Style'),	// Styyle Params attrib 	 		
		},
		uniforms: {

			// Static uniforms
			orthoProj: gl.getUniformLocation(program, 'u_OrthoProj'), 	// Orthographic Projection Matrix4 	
			sampler: gl.getUniformLocation(program, 'u_Sampler0'),	// Sampler for texture units 	

			/**
			 * Variable Uniforms
				* Uniforms paramsBuffer is an array of floats to be used as a 
			 * buffer to pass any kind of float values to the shaders.
				*/
			paramsBufferLoc: gl.getUniformLocation(program, 'u_Params'),	// The location of the uniform
			paramsBuffer: null, // The actual array
		},

	}

	/**
	 * Calculate each attribute's offset (it's offset in the vertex buffer)
	 */
	if (shaderInfo.attributes.colLoc >= 0) {
		shaderInfo.colOffset = attribsOffset;
		attribsOffset += V_COL_COUNT;
	}
	if (shaderInfo.attributes.wposTimeLoc >= 0) {
		shaderInfo.wposTimeOffset = attribsOffset; // Set the wpos offset
		attribsOffset += V_WPOS_COUNT;
		shaderInfo.timeOffset = attribsOffset; // Set the time offset
		attribsOffset += V_TIME_COUNT;
	}
	if (shaderInfo.attributes.params1Loc >= 0) {
		shaderInfo.params1Offset = attribsOffset;
		attribsOffset += V_PARAMS1_COUNT;
	}
	if (shaderInfo.attributes.posLoc >= 0) {
		shaderInfo.posOffset = attribsOffset;
		attribsOffset += V_POS_COUNT;
	}
	if (shaderInfo.attributes.scaleLoc >= 0) {
		shaderInfo.scaleOffset = attribsOffset;
		attribsOffset += V_SCALE_COUNT;
	}
	if (shaderInfo.attributes.texLoc >= 0) {
		shaderInfo.texOffset = attribsOffset;
		attribsOffset += V_TEX_COUNT;
	}
	if (shaderInfo.attributes.sdfParamsLoc >= 0) {
		shaderInfo.sdfParamsOffset = attribsOffset;
		attribsOffset += V_SDF_PARAMS_COUNT;
	}
	if (shaderInfo.attributes.styleLoc >= 0) {
		shaderInfo.styleOffset = attribsOffset;
		attribsOffset += V_STYLE_COUNT;
	}
	// if (shaderInfo.attributes.colLoc >= 0) {
	// 	shaderInfo.colOffset = attribsOffset;
	// 	attribsOffset += V_COL_COUNT;
	// }
	// if (shaderInfo.attributes.posLoc >= 0) {
	// 	shaderInfo.posOffset = attribsOffset;
	// 	attribsOffset += V_POS_COUNT;
	// }
	// if (shaderInfo.attributes.scaleLoc >= 0) {
	// 	shaderInfo.scaleOffset = attribsOffset;
	// 	attribsOffset += V_SCALE_COUNT;
	// }
	// if (shaderInfo.attributes.texLoc >= 0) {
	// 	shaderInfo.texOffset = attribsOffset;
	// 	attribsOffset += V_TEX_COUNT;
	// }
	// if (shaderInfo.attributes.wposTimeLoc >= 0) {
	// 	shaderInfo.wposTimeOffset = attribsOffset; // Set the wpos offset
	// 	attribsOffset += V_WPOS_COUNT;
	// 	shaderInfo.timeOffset = attribsOffset; // Set the time offset
	// 	attribsOffset += V_TIME_COUNT;
	// }
	// if (shaderInfo.attributes.sdfParamsLoc >= 0) {
	// 	shaderInfo.sdfParamsOffset = attribsOffset;
	// 	attribsOffset += V_SDF_PARAMS_COUNT;
	// }
	// if (shaderInfo.attributes.styleLoc >= 0) {
	// 	shaderInfo.styleOffset = attribsOffset;
	// 	attribsOffset += V_STYLE_COUNT;
	// }
	// if (shaderInfo.attributes.params1Loc >= 0) {
	// 	shaderInfo.params1Offset = attribsOffset;
	// 	attribsOffset += V_PARAMS1_COUNT;
	// }



	shaderInfo.attribsPerVertex = attribsOffset;

	if (sid & SID.INDEXED)
		shaderInfo.verticesPerRect = VERTS_PER_RECT_INDEXED;

	return shaderInfo;
}

