/**
 * https://computergraphics.stackexchange.com/questions/100/sharing-code-between-multiple-glsl-shaders
 */

"use strict";

const version = "#version 300 es\n"
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

const shaderChunks = {
   version: version,
   u_params_size_def: u_params_size_def,
   a_col4_in: a_col4_in,
   a_col4_out: a_col4_out,
   a_wposTime4_in: a_wposTime4_in,
   a_wposTime4_out: a_wposTime4_out,
   a_pos2_in: a_pos2_in,
   a_pos2_out: a_pos2_out,
   a_scale2_in: a_scale2_in,
   a_scale2_out: a_scale2_out,
   a_tex2_in: a_tex2_in,
   a_tex2_out: a_tex2_out,
   a_sdf2_in: a_sdf2_in,
   a_sdf2_out: a_sdf2_out,
   a_params4_1_in: a_params4_1_in,
   a_params4_1_out: a_params4_1_out,
   u_orthoProj_in: u_orthoProj_in,
   u_params_def: u_params_def,
   v_params_out: v_params_out,
   col4_assign: col4_assign,
   wposTime4_assign: wposTime4_assign,
   pos2_assign: pos2_assign,
   scale2_assign: scale2_assign,
   tex2_assign: tex2_assign,
   sdf2_assign: sdf2_assign,
   a_params4_1_assign: a_params4_1_assign,
   u_params_assign: u_params_assign,
   gl_position: gl_position,
};

// Resolve Includes
function includeReplacer( matchPattern, chunkIdx ) {
   const string = shaderChunks[ chunkIdx ];
   if ( string === undefined ) {
      throw new Error( 'Can not resolve #include <' + chunkIdx + '>' );
   }
   // console.log(chunkIdx, string)
   return resolveIncludes( string );
}
const includePattern = /^[ \t]*#include +<([\w\d./]+)>/gm;
function resolveIncludes( string ) {
   // console.log('---', string)
	return string.replace( includePattern, includeReplacer );
}

function generateDefines( defines ) {

   const chunks = [];
	for ( const name in defines ) {
		const value = defines[ name ];
		if ( value === false ) continue;
		chunks.push( '#define ' + name + ' ' + value );
	}
	return chunks.join( '\n' );
}

/**
 * My implementation of resolve includes
 */
// const regEx_includes = RegExp(/^[ \t]*#include +<([\w\d./]+)>/, 'gm');
// function ResolveIncludes(string, key){

//    // Find all file names in <> of all includes and replace the whole '#include <...>' 
//    // with the apropriate shaderChunk code
//    let res = '';
//    let shader = '';
//    while ((res = regEx_includes.exec(string)) !== null) {
//       const code = ShaderChunk[res[1]]
//       console.log(`Including file: ==${res[1]}== with the code:==${code}==`);
//       // shader = string.replace(includePattern, code);
//       shader = string.replace(includePattern, code);
//    }
//    return shader;
// }




export function VertexShaderCreate(sid){


   const shader_chunks = [
      true ? '#version 300 es' : '',
      true ? '#define MAX_NUM_PARAMS_BUFFER 5' : '',
      (sid & SID.ATTR.COL4) ? 'in vec4 a_Col;' : '',
      (sid & SID.ATTR.WPOS_TIME4) ? 'in vec4 a_WposTime;' : '',
      (sid & SID.ATTR.POS2) ? 'in vec2 a_Pos;' : '',
      (sid & SID.ATTR.SCALE2) ? 'in vec2 a_Scale;' : '',
      (sid & SID.ATTR.TEX2) ? 'in vec2 a_Tex;' : '',
      true ? 'uniform mat4 u_OrthoProj;' : '',
      true ? 'uniform mediump float u_Params[MAX_NUM_PARAMS_BUFFER];' : '',
      // TODO!!!: Create a SID.ATTR.PASS_TO_FRAGMENT, so that we control the passage of attributes to the fragment shader.
      (sid & SID.ATTR.COL4) ? 'out mediump vec4 v_Col; ' : '',
      (sid & SID.ATTR.POS2) ? 'out mediump vec2 v_Pos;' : '',
      (sid & SID.ATTR.WPOS_TIME4) ? 'out mediump vec2 v_Wpos;' : '',
      (sid & SID.ATTR.TEX2) ? 'out mediump vec2 v_TexCoord;' : '',
      true ? 'out mediump float v_Params[MAX_NUM_PARAMS_BUFFER];' : '',
      true ? 'void main(void) ' : '',
      true ? '{' : '',
      true ? '    vec2 scaled = a_Pos * a_Scale;' : '',
      true ? '    gl_Position = u_OrthoProj * vec4(scaled.x + a_WposTime.x, scaled.y + a_WposTime.y, a_WposTime.z, 1.0);' : '',
      // TODO!!!: Create a SID.ATTR.PASS_TO_FRAGMENT, so that we control the passage of attributes to the fragment shader.
      (sid & SID.ATTR.COL4) ? '    v_Col = a_Col;' : '', 
      (sid & SID.ATTR.POS2) ? '    v_Pos = a_Pos;' : '',
      (sid & SID.ATTR.WPOS_TIME4) ? '    v_Wpos = a_WposTime.xy;' : '',
      (sid & SID.ATTR.TEX2) ? '    v_TexCoord = a_Tex;' : '',
      true ? '    v_Params = u_Params;' : '',
      true ? '}' : '',
   ];

   const vertex_shader = shader_chunks.join( '\n' )

   let vs = resolveIncludes(vertex_shader);


   console.log(vs)
   return vs;
}
