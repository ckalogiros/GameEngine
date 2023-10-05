"use strict";
import { VertexShaderChoose } from './Shaders/VertexShaders.js'
import { FragmentShaderChoose } from './Shaders/FragmentShaders.js'
import * as dbg from './Z_Debug/GfxDebug.js'
import { GlFragmentShaderConstruct, GlVertexShaderConstruct } from './Shaders/ConstructShader.js';

/**
 * How to add an attribute to a program
 * 
 * 	. Set the SID.attribute in GfxConstants
 * 	. Set the V_ attribute length in floats in GfxConstants
 * 
 * 	. Add a loc and offset variables in I_GlProgram object
 * 
 * 	. Add the attribute to the vertex shader
 * 	. Get the attribut location in GlCreateShaderInfo(), also add the loc to the shaderinfo variable of the same function
 * 	. Enable the attribute location with GlEnableAttribsLocations()
 * 
 */

export function LoadShaderProgram(gl, sid) {

	const shader = {
		// vShader: VertexShaderChoose(sid),
		// fShader: FragmentShaderChoose(sid),
		vShader: GlVertexShaderConstruct(sid),
		fShader: GlFragmentShaderConstruct(sid),
	};
	const webgl_program = LoadShaders(gl, shader);
	if (webgl_program) {
		if (dbg.GL_DEBUG_SHADERS) console.log('Shader Program Created Successfully!\nShader Type ID: ', dbg.GetShaderTypeId(sid));
	} else {
		alert('Unable to CREATE shader program: ' + gl.getProgramInfoLog(webgl_program));
	}

	return webgl_program;
}


function LoadShaders(gl, shader) {

	const vShader = loadShaders(gl, gl.VERTEX_SHADER, shader.vShader, 'Vertex');
	const fShader = loadShaders(gl, gl.FRAGMENT_SHADER, shader.fShader, 'Fragment');

	const webgl_program = gl.createProgram();

	gl.attachShader(webgl_program, vShader);
	gl.attachShader(webgl_program, fShader);
	console.log('Validate program', gl.validateProgram(webgl_program));
	gl.linkProgram(webgl_program);

	const status = gl.getProgramParameter(webgl_program, gl.LINK_STATUS);
	if (!status) {
		console.error('Unable to LINK the shader program: ' + gl.getProgramInfoLog(webgl_program));
		gl.deleteProgram(webgl_program);
		webgl_program = 0;
		return null;
	} else {
		console.log('Shaders Linked Successfully!\n status:', gl.validateProgram(webgl_program));
	}

	return webgl_program;
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
		console.log('Shader Compiled Successfully!');
	}

	return shader;
}

export function GlCreateShaderInfo(gl, program, sid) {


}

