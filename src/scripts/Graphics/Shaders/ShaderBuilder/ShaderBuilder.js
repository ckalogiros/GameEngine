// https://computergraphics.stackexchange.com/questions/100/sharing-code-between-multiple-glsl-shaders


import { vertex_shader_chunks, fragment_shader_chunks } from './ShaderChunks/ShaderChunks.js'
import { frag_round_corners_call, frag_round_corners } from './Functions/fragment.roundcorners.js'
import { frag_msdf, frag_msdf_call, frag_sdf, frag_sdf_call, frag_tex } from './Functions/fragment.texture.js'


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
/*
   // TODO!!!: The shader constants, for buffer sizes etc, must be calculated at run time.
   That requires that the app collects all the data from all the meshes, 
   without creating any gl program and its shaders.
   MUST BE IMPLEMENTED.
*/
export const SHADER_CONSTANTS = {
   UNIFORM_BUFFER_COUNT: 5,
};

export function Gl_vs_build_vertexshader(sid){
   const vs_chunks = [

      '#version 300 es',
      '// Vertex Shader',
      '#include <precision_medium>', // TODO: Let the app decide the precision
      '//',
      /////////////////////////////////////////////////////////////////////////////////////////////////////////////////
      // DEFINES
      (sid.unif & SID.UNIF.U_BUFFER) ? `#define UNIFORM_BUFFER_COUNT ${SHADER_CONSTANTS.UNIFORM_BUFFER_COUNT}` : '',
      '//',

      /////////////////////////////////////////////////////////////////////////////////////////////////////////////////
      // INS
      (sid.attr & SID.ATTR.COL4) ? 'in vec4 a_col;' : '',
      (sid.attr & SID.ATTR.WPOS_TIME4) ? 'in vec4 a_wpos_time;' : '',
      (sid.attr & SID.ATTR.POS2) ? 'in vec2 a_pos;' : '',
      (sid.attr & SID.ATTR.POS3) ? 'in vec3 a_pos;' : '',
      (sid.attr & SID.ATTR.TEX2) ? 'in vec2 a_tex;' : '',
      (sid.attr & SID.ATTR.SDF) ? '#include <in_attr_sdf2>' : '',
      (sid.attr & (SID.ATTR.BORDER | SID.ATTR.R_CORNERS | SID.ATTR.FEATHER)) ? '#include <in_a_vec4_params1>' : '',
      '//',
      
      /////////////////////////////////////////////////////////////////////////////////////////////////////////////////
      // UNIFORMS
      (sid.unif & SID.UNIF.PROJECTION) ? 'uniform mat4 u_projection;' : '',
      (sid.unif & SID.UNIF.U_BUFFER) ? 'uniform float uniforms_buffer[UNIFORM_BUFFER_COUNT];' : '',
      '//',
      
      /////////////////////////////////////////////////////////////////////////////////////////////////////////////////
      // OUTS
      (sid.unif & SID.UNIF.U_BUFFER) ? 'out float v_uniforms_buffer[UNIFORM_BUFFER_COUNT];' : '',
      (sid.pass & SID.PASS.COL4) ? 'out vec4 v_col; ' : '',
      (sid.pass & SID.PASS.DIM2) ? 'out vec2 v_dim;' : '',
      (sid.pass & SID.PASS.WPOS2) ? 'out vec2 v_wpos;' : '',
      (sid.attr & SID.ATTR.TEX2) ? 'out vec2 v_tex_coord;' : '',
      (sid.attr & SID.ATTR.SDF) ? '#include <out_attr_sdf2>' : '',
      (sid.attr & SID.ATTR.BORDER) ? '#include <out_border_width>' : '',
      (sid.attr & SID.ATTR.R_CORNERS) ? '#include <out_rCorners>' : '',
      (sid.attr & SID.ATTR.FEATHER) ? '#include <out_border_feather>' : '',
      (sid.pass & SID.PASS.TIME1) ? '#include <out_vtime1>' : '',
      (sid.pass & SID.PASS.RES2) ? '#include <out_vres2>' : '',
      '//',
      
      /////////////////////////////////////////////////////////////////////////////////////////////////////////////////
      'void main(void) ',
      '{',
      (sid.unif & SID.UNIF.PROJECTION) 
         ? '  gl_Position = u_projection * vec4(a_pos.x + a_wpos_time.x, a_pos.y + a_wpos_time.y, a_wpos_time.z, 1.0);' 
         : '  gl_Position = vec4(a_pos.x + a_wpos_time.x, a_pos.y + a_wpos_time.y, a_wpos_time.z, 1.0);',

      /////////////////////////////////////////////////////////////////////////////////////////////////////////////////
      // ASSIGNMENTS
      (sid.pass & SID.PASS.COL4) ? '  v_col = a_col;' : '', 
      (sid.pass & SID.PASS.DIM2) ? '  v_dim = abs(a_pos);' : '',
      (sid.pass & SID.PASS.WPOS2) ? '  v_wpos = a_wpos_time.xy;' : '',
      (sid.attr & SID.ATTR.TEX2) ? '  v_tex_coord = a_tex;' : '',
      (sid.attr & SID.ATTR.SDF) ? '  v_sdf = a_sdf;' : '',
      (sid.pass & SID.PASS.RES2) ? '  v_res = vec2(v_uniforms_buffer[0], v_uniforms_buffer[1]' : '', // TODO!!!: What happens if res.xy is passed to other than 0 and 1 indexes???
      (sid.attr & SID.ATTR.BORDER) ? '  v_border_width = a_params1.x;' : '',
      (sid.attr & SID.ATTR.R_CORNERS) ? '  v_rCorners = a_params1.y;' : '',
      (sid.attr & SID.ATTR.FEATHER) ? '  v_border_feather = a_params1.z;' : '',
      (sid.unif & SID.UNIF.U_BUFFER) ? '  v_uniforms_buffer = uniforms_buffer;' : '',
      (true) ? '   gl_PointSize = 10.0;' : '',
      '}',

   ];

   const vertex_shader = vs_chunks.filter( filterEmptyLine ).join( '\n' )

   const vs = resolveIncludesVertex(vertex_shader);

   if(DEBUG.SHADERS) console.info(vs)
   return vs;
}

export function Gl_fs_build_fragmentshader(sid){

   const fs_chunks = [

      (true) ? '#version 300 es' : '',
      '// Fragment Shader',

      /////////////////////////////////////////////////////////////////////////////////////////////////////////////////
      // DEFINES
      '//',
      (sid.unif & SID.UNIF.U_BUFFER) ? '#define UNIFORM_BUFFER_COUNT 5' : '',
      (sid.unif & SID.UNIF.BUFFER_RES) ? '#define UB_HAS_RESOLUTION' : '',
      (sid.unif & SID.UNIF.BUFFER_RES) ? '#define UB_IDX0 0' : '',
      (sid.unif & SID.UNIF.BUFFER_RES) ? '#define UB_IDX1 1' : '',
      true ? '#include <precision_medium>' : '',
      true ? '#include <out_frag_color>' : '',
      
      /////////////////////////////////////////////////////////////////////////////////////////////////////////////////
      // In
      '//',
      (sid.unif & SID.UNIF.U_BUFFER) ? '#include <in_frag_v_uniforms_buffer>': '',
      (sid.pass & SID.PASS.COL4) ? '#include <in_frag_col4>' : '',
      (sid.pass & SID.PASS.DIM2) ? '#include <in_frag_dim2>'   : '',
      (sid.pass & SID.PASS.WPOS2) ? '#include <in_frag_wpos2>' : '',
      (sid.attr & SID.ATTR.TEX2) ? '#include <in_frag_tex2>' : '',
      (sid.attr & SID.ATTR.BORDER) ? '#include <in_frag_border_width>' : '',
      (sid.attr & SID.ATTR.R_CORNERS) ? '#include <in_frag_rCorners>' : '',
      (sid.attr & SID.ATTR.FEATHER) ? '#include <in_frag_border_feather>' : '',
      (sid.attr & SID.ATTR.SDF) ? '#include <in_frag_sdf2>' : '',
      '//',
      (sid.attr & SID.ATTR.TEX2) ? '#include <frag_u_sampler0>' : '',

      /////////////////////////////////////////////////////////////////////////////////////////////////////////////////
      // Function definitions
      (sid.attr & SID.ATTR.BORDER) ? frag_round_corners : '',
      (sid.attr & SID.ATTR.SDF) ? frag_sdf : '',
      (sid.attr & SID.ATTR.MSDF) ? frag_msdf : '',
      
      /////////////////////////////////////////////////////////////////////////////////////////////////////////////////
      // Main
      true ? 'void main(void) ' : '',
      true ? '{' : '',
      true ? '#include <frag_color_create>' : '',
      // (sid.attr & SID.ATTR.TEX2) ? resolveIncludesFragment(frag_tex) : '',
      (sid.attr & SID.ATTR.BORDER) ? frag_round_corners_call : '',
      // (sid.attr & SID.ATTR.BORDER) ? resolveIncludesFragment(frag_round_corners_call) : '',
      (sid.attr & SID.ATTR.TEX2 ) 
         ? (sid.attr & SID.ATTR.SDF) ? frag_sdf_call // If TEX2 and SDF, build for sdf
            : (sid.attr & SID.ATTR.MSDF) ? frag_msdf_call  // ELSE If TEX2 and MSDF, build for msdf
         : frag_tex // ELSE If only TEX2, build for simple texture
      : '', // ELSE null
      true ? '  frag_color = color;' : '',
      (sid.shad & SID.SHAD.PRE_MULTIPLIED_ALPHA) ? '  frag_color.rgb *= color.a;' : '',
      // (true) ? '  frag_color.rgb *= color.a;' : '',
      // true ? '  frag_color.rgb *= color.a;' : '',
      true ? '}' : '',
   ];

   const fragment_shader = fs_chunks.filter( filterEmptyLine ).join( '\n' )

   const fs = resolveIncludesFragment(fragment_shader);

   if(DEBUG.SHADERS) console.info(fs)
   return fs;
}


