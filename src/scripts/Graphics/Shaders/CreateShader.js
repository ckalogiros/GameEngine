// https://computergraphics.stackexchange.com/questions/100/sharing-code-between-multiple-glsl-shaders
"use strict";


import { vertex_shader_chunks } from './ShaderChunks.js'

// Resolve Includes
function includeReplacer( matchPattern, chunkIdx ) {
   const string = vertex_shader_chunks[ chunkIdx ];
   if ( string === undefined ) {
      throw new Error( 'Can not resolve #include <' + chunkIdx + '>' );
   }
   return resolveIncludes( string );
}
const includePattern = /^[ \t]*#include +<([\w\d./]+)>/gm;
function resolveIncludes( string ) {
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

function filterEmptyLine( string ) {
	return string !== '';
}

export function VertexShaderCreate(sid){


   const vs_chunks = [
      true ? '#version 300 es' : '',
      true ? '#include <precision_medium>' : '',
      true ? '#define MAX_NUM_PARAMS_BUFFER 5' : '',
      (sid & SID.ATTR.COL4) ? '#include <in_attr_col4>' : '',
      (sid & SID.ATTR.WPOS_TIME4) ? 'in vec4 a_wpos_time;' : '',
      (sid & SID.ATTR.POS2) ? 'in vec2 a_pos;' : '',
      (sid & SID.ATTR.TEX2) ? 'in vec2 a_tex;' : '',
      (sid & SID.ATTR.SDF_PARAMS) ? '#include <in_attr_sdf2>' : '',
      (sid & SID.ATTR.STYLE) ? '#include <in_attr_style3>' : '',
      true ? 'uniform mat4 u_ortho_proj;' : '',
      true ? 'uniform mediump float u_params[MAX_NUM_PARAMS_BUFFER];' : '',
      // TODO!!!: Create a SID.ATTR.PASS_TO_FRAGMENT, so that we control the passage of attributes to the fragment shader.
      (sid & SID.ATTR.COL4) ? 'out mediump vec4 v_col; ' : '',
      (sid & SID.ATTR.POS2) ? 'out mediump vec2 v_pos;' : '',
      (sid & SID.ATTR.WPOS_TIME4) ? 'out mediump vec2 v_wpos;' : '',
      (sid & SID.ATTR.TEX2) ? 'out mediump vec2 v_tex_coord;' : '',
      (sid & SID.ATTR.SDF_PARAMS) ? '#include <out_attr_sdf2>' : '',
      (sid & SID.ATTR.STYLE) ? '#include <out_vdim2>' : '',
      (sid & SID.ATTR.STYLE) ? '#include <out_attr_style3>' : '',
      (sid & SID.ATTR.STYLE) ? '#include <out_vtime1>' : '',
      (sid & SID.ATTR.STYLE) ? '#include <out_vres2>' : '',
      true ? 'out mediump float v_params[MAX_NUM_PARAMS_BUFFER];' : '',
      true ? 'void main(void) ' : '',
      true ? '{' : '',
      true ? '  gl_Position = u_ortho_proj * vec4(a_pos.x + a_wpos_time.x, a_pos.y + a_wpos_time.y, a_wpos_time.z, 1.0);' : '',
      // TODO!!!: Create a SID.ATTR.PASS_TO_FRAGMENT, so that we control the passage of attributes to the fragment shader.
      (sid & SID.ATTR.COL4) ? '  v_col = a_col;' : '', 
      (sid & SID.ATTR.POS2) ? '  v_pos = a_pos;' : '',
      (sid & SID.ATTR.WPOS_TIME4) ? '  v_wpos = a_wpos_time.xy;' : '',
      (sid & SID.ATTR.TEX2) ? '  v_tex_coord = a_tex;' : '',
      (sid & SID.ATTR.SDF_PARAMS) ? '#include <sdf2_assign_sdf2>' : '',
      (sid & SID.ATTR.STYLE) ? '#include <vdim2_assign_apos2>' : '',
      (sid & SID.ATTR.STYLE) ? '#include <vstyle3_assign_astyle3>' : '',
      (sid & SID.ATTR.STYLE) ? '#include <vtime1_assign_awpostime1>' : '',
      (sid & SID.ATTR.STYLE) ? '#include <vres2_assign_uparams12>' : '',
      true ? '  v_params = u_params;' : '',
      true ? '}' : '',
   ];

   const vertex_shader = vs_chunks.filter( filterEmptyLine ).join( '\n' )

   const vs = resolveIncludes(vertex_shader);


   console.log(vs)
   return vs;
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
