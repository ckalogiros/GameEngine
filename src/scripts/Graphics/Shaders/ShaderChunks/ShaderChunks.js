"use strict";
const UNIFORMS_BUFFER_SIZE = 5;
const version                    = "#version 300 es";
const precision_medium           = "precision mediump float;";
const precision_high             = "precision highp float;";
const u_params_size_def          = '#define UNIFORM_BUFFER_COUNT 5';
const in_attr_col4               = 'in vec4 a_col;';
const in_attr_wposTime4          = 'in vec4 a_wpos_time;';
const in_attr_pos2               = "in vec2 a_pos;";
const in_attr_tex2               = 'in vec2 a_tex;';
const in_attr_sdf2               = 'in vec2 a_sdf;';
const in_attr_style3             = 'in vec3 a_style;';
const out_border_width           = 'out float v_border_width;';
const out_border_feather         = 'out float v_border_feather;';
const out_rCorners               = 'out float v_rCorners;';
const u_orthoProj_in             = 'uniform mat4 u_projection;';
const in_a_vec4_params1          = 'in vec4 a_params1;';
const out_attr_col4              = 'out vec4 v_col; ';
const out_attr_wpos2             = 'out vec2 v_wpos;';
const out_vtime1                 = 'out float v_time;';
const out_attr_vpos2             = 'out vec2 v_pos;';
const out_attr_tex2              = 'out vec2 v_tex_coord;';
const out_attr_sdf2              = 'out vec2 v_sdf;';
const out_attr_style3            = 'out vec3 v_style;';
const out_vres2                  = 'out vec2 v_res;';
const out_vdim2                  = 'out vec2 v_dim;';
const in_uniforms_buffer         = `uniform float uniforms_buffer[${UNIFORMS_BUFFER_SIZE}];`; 
const out_uniforms_buffer        = `out float v_uniforms_buffer[${UNIFORMS_BUFFER_SIZE}];`;
const vcol4_assign_acol4         = '  v_col = a_col;';
const wpos2_assign_wpos3         = '  v_wpos = a_wpos_time.xy;';
const pos2_assign_pos2           = '  v_pos = a_pos;';
const tex2_assign_tex2           = '  v_tex_coord = a_tex;';
const sdf2_assign_sdf2           = '  v_sdf = a_sdf;';
const vdim2_assign_apos2         = '  v_dim = abs(a_pos);';
const vstyle3_assign_astyle3     = '  v_style = a_style;';
const vtime1_assign_awpostime1   = '  v_time = a_wpos_time.w;';
const a_params4_1_assign         = '  v_params1 = a_params1;';
const assign_out_border_width    = '  v_border_width = a_params1.x;';
const assign_out_rCorners        = '  v_rCorners = a_params1.y;';
const assign_out_border_feather  = '  v_border_feather = a_params1.z;';
const u_params_assign            = '  v_uniforms_buffer = uniforms_buffer;';
const gl_position                = '  gl_Position = u_projection * vec4(a_pos.x + a_wpos_time.x, a_pos.y + a_wpos_time.y, a_wpos_time.z, 1.0);';

export const vertex_shader_chunks = {
   version                 : version,
   precision_medium        : precision_medium,
   precision_high          : precision_high,
   u_params_size_def       : u_params_size_def,
   in_attr_col4            : in_attr_col4,
   out_attr_col4           : out_attr_col4,
   in_attr_wposTime4       : in_attr_wposTime4,
   out_attr_wpos2          : out_attr_wpos2,
   in_attr_pos2            : in_attr_pos2,
   out_attr_vpos2          : out_attr_vpos2,
   in_attr_tex2            : in_attr_tex2,
   out_attr_tex2           : out_attr_tex2,
   in_attr_sdf2            : in_attr_sdf2,
   out_attr_sdf2           : out_attr_sdf2,
   in_attr_style3          : in_attr_style3,
   out_attr_style3         : out_attr_style3,
   in_a_vec4_params1       : in_a_vec4_params1,
   u_orthoProj_in          : u_orthoProj_in,
   in_uniforms_buffer      : in_uniforms_buffer,
   out_uniforms_buffer     : out_uniforms_buffer,
   out_vdim2               : out_vdim2,
   out_vtime1              : out_vtime1,
   out_vres2               : out_vres2,
   vtime1_assign_awpostime1: vtime1_assign_awpostime1,
   vdim2_assign_apos2      : vdim2_assign_apos2,
   vcol4_assign_acol4      : vcol4_assign_acol4,
   wpos2_assign_wpos3      : wpos2_assign_wpos3,
   pos2_assign_pos2        : pos2_assign_pos2,
   vstyle3_assign_astyle3  : vstyle3_assign_astyle3,
   tex2_assign_tex2        : tex2_assign_tex2,
   sdf2_assign_sdf2        : sdf2_assign_sdf2,
   a_params4_1_assign      : a_params4_1_assign,
   u_params_assign         : u_params_assign,
   gl_position             : gl_position,

   out_border_width        : out_border_width,
   out_border_feather      : out_border_feather,         
   out_rCorners            : out_rCorners,
   assign_out_border_width  :assign_out_border_width  ,  
   assign_out_rCorners      :assign_out_rCorners      ,      
   assign_out_border_feather:assign_out_border_feather,

};


// Fragment Shader
const frag_color_create  = '  vec4 color = v_col;';
const frag_color_assign  = '  frag_color = color;';
const out_frag_color     = 'out vec4 frag_color;';
const frag_u_sampler0    = 'uniform sampler2D u_sampler0;';
const in_frag_col4       = 'in vec4 v_col;';
const in_frag_dim2       = 'in vec2 v_dim;';
const in_frag_wpos2      = 'in vec2 v_wpos;';
const in_frag_tex2       = 'in vec2 v_tex_coord;';
const in_frag_sdf2       = 'in vec2 v_sdf;';
// const in_frag_style3     = 'in vec3 v_style;';
const in_frag_border_width           = 'in float v_border_width;';
const in_frag_border_feather         = 'in float v_border_feather;';
const in_frag_rCorners               = 'in float v_rCorners;';
const in_frag_v_uniforms_buffer    = `in float v_uniforms_buffer[${UNIFORMS_BUFFER_SIZE}];`;

export const fragment_shader_chunks = {
   version: version,
   precision_medium  : precision_medium ,
   precision_high    : precision_high   ,
   frag_color_create : frag_color_create,
   frag_color_assign : frag_color_assign,
   out_frag_color    : out_frag_color   ,
   frag_u_sampler0  : frag_u_sampler0 ,
   in_frag_col4      : in_frag_col4     ,
   in_frag_dim2      : in_frag_dim2     ,
   in_frag_wpos2     : in_frag_wpos2    ,
   in_frag_tex2      : in_frag_tex2     ,
   // in_frag_style3    : in_frag_style3   ,
   in_frag_sdf2      : in_frag_sdf2     ,
   in_frag_v_uniforms_buffer   : in_frag_v_uniforms_buffer  ,
   in_frag_border_width   : in_frag_border_width  ,
   in_frag_border_feather   : in_frag_border_feather  ,
   in_frag_rCorners   : in_frag_rCorners  ,

};


function CreateAttribute(attrib){
   const a1 = 'in vec4 ';
}

function CreateUniformsBufferSizeGlslCode(uniformsNames){
   const size = uniformsNames.length;
   
   // For debugging purposes we #define the indexes of each uniform with its name
   for (let i=0; i<size; i++){
      vertex_shader_chunks.push({
         uniformsIndexesDefinitions: `#define ${uniformsNames[i]} ${i}`
      });
   }
   vertex_shader_chunks.push({
      in_uniforms_buffer: `uniform float uniforms_buffer[${size}];`
   });
}