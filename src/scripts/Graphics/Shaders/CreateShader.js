// https://computergraphics.stackexchange.com/questions/100/sharing-code-between-multiple-glsl-shaders


import { vertex_shader_chunks, fragment_shader_chunks } from './ShaderChunks/ShaderChunks.js'
import {frag_round_corners_call, frag_round_corners} from './ReadyShaders/ShaderFunctions/fragment.functions.glsl.js'



// Resolve Includes to build the correct shaders
const includePattern = /^[ \t]*#include +<([\w\d./]+)>/gm;
function includeReplacerVertex( matchPattern, key ) {
   const string = vertex_shader_chunks[ key ];
   if ( string === undefined ) { throw new Error( 'Can not resolve #include <' + key + '> in Vertex Shader' ); }
   return resolveIncludesVertex( string );
}
function resolveIncludesVertex( string ) {
   return string.replace( includePattern, includeReplacerVertex );
}
function includeReplacerFragment( matchPattern, key ) {
   const string = fragment_shader_chunks[ key ];
   if ( string === undefined ) { throw new Error( 'Can not resolve #include <' + key + '> in Fragment Shader' ); }
   return resolveIncludesFragment( string );
}
function resolveIncludesFragment( string ) {
	return string.replace( includePattern, includeReplacerFragment );
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
      '// Vertex Shader',
      true ? '#include <precision_medium>' : '',
      /////////////////////////////////////////////////////////////////////////////////////////////////////////////////
      // DEFINES
      true ? '#define UNIFORM_BUFFER_COUNT 5' : '',
      /////////////////////////////////////////////////////////////////////////////////////////////////////////////////
      // INS
      (sid.attr & SID.ATTR.WPOS_TIME4) ? 'in vec4 a_wpos_time;' : '',
      (sid.attr & SID.ATTR.POS2) ? 'in vec2 a_pos;' : '',
      (sid.attr & SID.ATTR.COL4) ? '#include <in_attr_col4>' : '',
      (sid.attr & SID.ATTR.TEX2) ? 'in vec2 a_tex;' : '',
      (sid.attr & SID.ATTR.SDF_PARAMS) ? '#include <in_attr_sdf2>' : '',
      (sid.attr & (SID.ATTR.BORDER | SID.ATTR.R_CORNERS | SID.ATTR.FEATHER)) ? '#include <in_a_vec4_params1>' : '',
      true ? 'uniform mat4 u_projection;' : '',
      true ? 'uniform mediump float uniforms_buffer[UNIFORM_BUFFER_COUNT];' : '',
      /////////////////////////////////////////////////////////////////////////////////////////////////////////////////
      // OUTS
      (sid.attr & SID.ATTR.BORDER) ? '#include <out_border_width>' : '',
      (sid.attr & SID.ATTR.R_CORNERS) ? '#include <out_rCorners>' : '',
      (sid.attr & SID.ATTR.FEATHER) ? '#include <out_border_feather>' : '',
      (sid.attr & SID.ATTR.COL4) ? 'out mediump vec4 v_col; ' : '',
      (sid.attr & SID.ATTR.POS2) ? 'out mediump vec2 v_pos;' : '',
      (sid.attr & SID.ATTR.WPOS_TIME4) ? 'out mediump vec2 v_wpos;' : '',
      (sid.attr & SID.ATTR.TEX2) ? 'out mediump vec2 v_tex_coord;' : '',
      (sid.attr & SID.ATTR.SDF_PARAMS) ? '#include <out_attr_sdf2>' : '',
      (true) ? '#include <out_vdim2>' : '',
      (true) ? '#include <out_attr_style3>' : '',
      (sid.attr & SID.ATTR.STYLE) ? '#include <out_vtime1>' : '',
      (sid.unif & SID.UNIF.BUFFER_RES) ? '#include <out_vres2>' : '',
      true ? 'out mediump float v_uniforms_buffer[UNIFORM_BUFFER_COUNT];' : '',
      /////////////////////////////////////////////////////////////////////////////////////////////////////////////////
      'void main(void) ',
      '{',
      /**
       x  0  0  0 
       0  y  0  0
       a  b  c -1
       0  0  d  0
		 */
      // 'mat4 tr;',
      // 'tr[0][0] = 1.;', 'tr[0][1] = 0.;', 'tr[0][2] = 0.;', 'tr[0][3] = 0.;',
      // 'tr[1][0] = 0.;', 'tr[1][1] = 1.;', 'tr[1][2] = 0.;', 'tr[1][3] = 0.;',
      // 'tr[2][0] = 0.;', 'tr[2][1] = 0.;', 'tr[2][2] = 1.;', 'tr[2][3] = 0.;',
      // 'tr[3][0] = a_wpos_time.x;', 'tr[3][1] = a_wpos_time.y;', 'tr[3][2] = a_wpos_time.z;', 'tr[3][3] = 1.;', 
      // 'tr[3][0] += sin(a_wpos_time.w*20.  * sin(a_wpos_time.w))*10.;',
      // 'tr[3][1] += sin(a_wpos_time.w*20.  * sin(a_wpos_time.w))*10.;',
      // true ? '  gl_Position = u_projection * tr * vec4(a_pos.x, a_pos.y, 1., 1.);' : '',

      true ? '  gl_Position = u_projection * vec4(a_pos.x + a_wpos_time.x, a_pos.y + a_wpos_time.y, a_wpos_time.z, 1.0);' : '',
      // true ? '  gl_Position = u_projection * vec4(a_pos.x, a_pos.y, a_wpos_time.z, 1.0);' : '',
      /////////////////////////////////////////////////////////////////////////////////////////////////////////////////
      // ASSIGNMENTS
      (sid.attr & SID.ATTR.COL4) ? '  v_col = a_col;' : '', 
      'v_col.r *= sin(a_wpos_time.w);',
      (sid.attr & SID.ATTR.POS2) ? '  v_pos = a_pos;' : '',
      (sid.attr & SID.ATTR.WPOS_TIME4) ? '  v_wpos = a_wpos_time.xy;' : '',
      (sid.attr & SID.ATTR.TEX2) ? '  v_tex_coord = a_tex;' : '',
      (sid.attr & SID.ATTR.SDF_PARAMS) ? '#include <sdf2_assign_sdf2>' : '',
      (true) ? '#include <vdim2_assign_apos2>' : '',
      (sid.attr & SID.ATTR.BORDER) ? '#include <assign_out_border_width>' : '',
      (sid.attr & SID.ATTR.R_CORNERS) ? '#include <assign_out_rCorners>' : '',
      (sid.attr & SID.ATTR.FEATHER) ? '#include <assign_out_border_feather>' : '',
      true ? '  v_uniforms_buffer = uniforms_buffer;' : '',
      '}',
   ];

   const vertex_shader = vs_chunks.filter( filterEmptyLine ).join( '\n' )

   const vs = resolveIncludesVertex(vertex_shader);

   console.log(vs)
   return vs;
}

export function FragmentShaderCreate(sid){

   const fs_chunks = [
      (true) ? '#version 300 es' : '',
      '// Fragment Shader',
      /////////////////////////////////////////////////////////////////////////////////////////////////////////////////
      // DEFINES
      (true) ? '#define UNIFORM_BUFFER_COUNT 5' : '',
      (sid.unif & SID.UNIF.BUFFER_RES) ? '#define UB_HAS_RESOLUTION' : '',
      (sid.unif & SID.UNIF.BUFFER_RES) ? '#define UB_IDX0 0' : '',
      (sid.unif & SID.UNIF.BUFFER_RES) ? '#define UB_IDX1 1' : '',
      (true) ? '#include <precision_medium>' : '',
      (true) ? '#include <out_frag_color>' : '',
      (true) ? '#include <in_frag_col4>' : '',
      (true) ? '#include <in_frag_dim2>'   : '',
      (true) ? '#include <in_frag_wpos2>' : '',
      (sid.attr & SID.ATTR.BORDER) ? '#include <in_frag_border_width>' : '',
      (sid.attr & SID.ATTR.R_CORNERS) ? '#include <in_frag_rCorners>' : '',
      (sid.attr & SID.ATTR.FEATHER) ? '#include <in_frag_border_feather>' : '',
      // (false) ? '#include <in_frag_style3>': '',
      (true) ? '#include <in_frag_v_uniforms_buffer>': '',
      (sid.attr & SID.ATTR.BORDER) ? frag_round_corners : '',
      (true) ? 'void main(void) ' : '',
      (true) ? '{' : '',
      (true) ? '    #include <frag_color_create>' : '',
      // (sid.attr & SID.ATTR.BORDER) ? frag_round_corners_call : '',
      (sid.attr & SID.ATTR.BORDER) ? resolveIncludesFragment(frag_round_corners_call) : '',
      (true) ? '    #include <frag_color_assign>' : '',
      // (true) ? '    frag_color = v_col;' : '',
      // (true) ? '    frag_color = vec4(.5);' : '',
      (true) ? '}' : '',
   ];

   const fragment_shader = fs_chunks.filter( filterEmptyLine ).join( '\n' )

   const fs = resolveIncludesFragment(fragment_shader);

   console.log(fs)
   return fs;
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


