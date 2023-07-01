/**
 * https://computergraphics.stackexchange.com/questions/100/sharing-code-between-multiple-glsl-shaders
 */

"use strict";


// Resolve Includes

const includePattern = /^[ \t]*#include +<([\w\d./]+)>/gm;

function resolveIncludes( string ) {

	return string.replace( includePattern, includeReplacer );

}

function includeReplacer( match, include ) {
	const string = ShaderChunk[ include ];
	if ( string === undefined ) {
		throw new Error( 'Can not resolve #include <' + include + '>' );
	}
	return resolveIncludes( string );
}

// Unroll Loops
const unrollLoopPattern = /#pragma unroll_loop_start\s+for\s*\(\s*int\s+i\s*=\s*(\d+)\s*;\s*i\s*<\s*(\d+)\s*;\s*i\s*\+\+\s*\)\s*{([\s\S]+?)}\s+#pragma unroll_loop_end/g;
function unrollLoops( string ) {
	return string.replace( unrollLoopPattern, loopReplacer );
}
function loopReplacer( match, start, end, snippet ) {
	let string = '';
	for ( let i = parseInt( start ); i < parseInt( end ); i ++ ) {
		string += snippet.replace( /\[\s*i\s*\]/g, '[ ' + i + ' ]' ).replace( /UNROLLED_LOOP_INDEX/g, i );
	}
	return string;
}


const version = "#version 300 es\n"
const main = 'void main(void) \n'
const curlyBracket_open = '{\n'
const curlyBracket_close = '}\n'

// const glsl_test = "#ifdef USE_UV\n\tvUv = ( uvTransform * vec3( uv, 1 ) ).xy;\n#endif";
const glsl_test = "in vec4 a_Col;\n";
const test = '#include <glsl_test>\n';

const u_params_size_def = '#define MAX_NUM_PARAMS_BUFFER 5\n'

const a_col4_in = 'in vec4 a_Col;\n'
const a_col4_out = 'out mediump vec4 v_Col; \n'
const a_wposTime4_in = 'in vec4 a_WposTime;\n'
const a_wposTime4_out = 'out mediump vec2 v_Wpos;\n'
const a_pos2_in = 'in vec2 a_Pos;\n'
const a_pos2_out = 'out mediump vec2 v_Pos;\n'
const a_scale2_in = 'in vec2 a_Scale;\n'
const a_scale2_out = 'out mediump vec2 v_Scale;\n'
const a_tex2_in = 'in vec2 a_Tex;\n'
const a_tex2_out = 'out mediump vec2 v_TexCoord;\n'
const a_sdf2_in = 'in vec2 a_Sdf;\n'
const a_sdf2_out = 'out mediump vec2 v_Sdf;\n'
const a_params4_1_in = 'in vec2 a_Params1;\n'
const a_params4_1_out = 'out mediump vec2 v_Params1;\n'
const u_orthoProj_in = 'uniform mat4 u_OrthoProj;\n'
const u_params_def = 'uniform mediump float u_Params[MAX_NUM_PARAMS_BUFFER];\n'                  // [0]:SdfInner, [1]:SdfOuter, [3]\n?
const v_params_out = 'out mediump float v_Params[MAX_NUM_PARAMS_BUFFER];\n'


const col4_assign = '    v_Col = a_Col;\n'
const wposTime4_assign = '    v_Wpos = a_WposTime.xy;\n'
const pos2_assign = '    v_Pos = a_Pos;\n'
const scale2_assign = '    vec2 scaled = a_Pos * a_Scale;\n'
const tex2_assign = '    v_TexCoord = a_Tex;\n'
const sdf2_assign = '    v_Sdf = a_Sdf;\n'
const a_params4_1_assign = '    v_Params1 = a_Params1;\n'
const u_params_assign = '    v_Params = u_Params;\n'
const gl_position = '    gl_Position = u_OrthoProj * vec4(scaled.x + a_WposTime.x, scaled.y + a_WposTime.y, a_WposTime.z, 1.0);\n'

function Insert(code){

}


export function VertexShaderCreate(sid){

   let vs = '';

   vs += version;
   
   // Defines
   vs += u_params_size_def;

   // Attributes as an input to vertex shader
   // if(SID.ATTR.COL4) vs += a_col4_in;
   if(SID.ATTR.COL4) vs += test;
   if(SID.ATTR.POS2) vs += a_pos2_in;
   if(SID.ATTR.WPOS_TIME4) vs += a_wposTime4_in;
   if(SID.ATTR.SCALE2) vs += a_scale2_in;
   if(SID.ATTR.TEX2) vs += a_tex2_in;
   if(SID.ATTR.SDF_PARAMS) vs += a_sdf2_in;
   if(SID.ATTR.PARAMS1) vs += a_params4_1_in;
   
   // Attributes to fragment shader (out)
   if(SID.ATTR.COL4) vs += a_col4_out;
   if(SID.ATTR.POS2) vs += a_pos2_out;
   if(SID.ATTR.WPOS_TIME4) vs += a_wposTime4_out;
   if(SID.ATTR.SCALE2) vs += a_scale2_out;
   if(SID.ATTR.TEX2) vs += a_tex2_out;
   if(SID.ATTR.SDF_PARAMS) vs += a_sdf2_out;
   if(SID.ATTR.PARAMS1) vs += a_params4_1_out;
   
   vs += u_orthoProj_in;
   vs += u_params_def;
   vs += v_params_out;
   
   // Vertex shader main function
   vs += main;
   vs += curlyBracket_open;
   
   if(SID.ATTR.COL4) vs += col4_assign;
   if(SID.ATTR.POS2) vs += pos2_assign;
   if(SID.ATTR.WPOS_TIME4) vs += wposTime4_assign;
   if(SID.ATTR.SCALE2) vs += tex2_assign;
   if(SID.ATTR.SDF_PARAMS) vs += sdf2_assign;
   if(SID.ATTR.PARAMS1) vs += a_params4_1_assign;
   vs += u_params_assign;
   if(SID.ATTR.TEX2) vs += scale2_assign;
   vs += gl_position;


   vs += curlyBracket_close;

   console.log(vs)
   return vs;
}
