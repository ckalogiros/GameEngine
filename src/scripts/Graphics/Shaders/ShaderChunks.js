"use strict";

const version                 = "#version 300 es";
const precision_medium        = "precision mediump float;";
const precision_high          = "precision highp float;";
const u_params_size_def       = '#define MAX_NUM_PARAMS_BUFFER 5';
const in_attr_col4            = 'in vec4 a_col;';
const in_attr_wposTime4       = 'in vec4 a_wpos_time;';
const in_attr_pos2            = "in vec2 a_pos;";
const in_attr_tex2            = 'in vec2 a_tex;';
const in_attr_sdf2            = 'in vec2 a_sdf;';
const in_attr_style3          = 'in vec3 a_style;';
const u_orthoProj_in          = 'uniform mat4 u_ortho_proj;';
const a_params4_1_in          = 'in vec2 a_params1;';
const out_attr_col4           = 'out mediump vec4 v_col; ';
const out_attr_wpos2          = 'out mediump vec2 v_wpos;';
const out_vtime1              = 'out mediump float v_time;';
const out_attr_vpos2          = 'out mediump vec2 v_pos;';
const out_attr_tex2           = 'out mediump vec2 v_tex_coord;';
const out_attr_sdf2           = 'out mediump vec2 v_sdf;';
const out_attr_style3         = 'out vec3 v_style;';
const out_vres2               = 'out vec2 v_res;';
const out_vdim2               = 'out mediump vec2 v_dim;';
const a_params4_1_out         = 'out mediump vec2 v_params1;';
const u_params_def            = 'uniform mediump float u_params[MAX_NUM_PARAMS_BUFFER];'; // [0]:SdfInner, [1]:SdfOuter, [3]
const v_params_out            = 'out mediump float v_params[MAX_NUM_PARAMS_BUFFER];';
const vcol4_assign_acol4      = '    v_col = a_col;';
const wpos2_assign_wpos3      = '    v_wpos = a_wpos_time.xy;';
const pos2_assign_pos2        = '    v_pos = a_pos;';
const tex2_assign_tex2        = '    v_tex_coord = a_tex;';
const sdf2_assign_sdf2        = '    v_sdf = a_sdf;';
const vdim2_assign_apos2      = '   v_dim = abs(a_pos);';
const vstyle3_assign_astyle3  = '   v_style = a_style;';
const vtime1_assign_awpostime1 = '  v_time = a_wpos_time.w;';
const vres2_assign_uparams12  = '   v_res = vec2(u_params[0], u_params[1]);';
const a_params4_1_assign      = '   v_params1 = a_params1;';
const u_params_assign         = '   v_params = u_params;';
const gl_position             = '   gl_Position = u_ortho_proj * vec4(a_pos.x + a_wpos_time.x, a_pos.y + a_wpos_time.y, a_wpos_time.z, 1.0);';

export const vertex_shader_chunks = {
   version: version,
   precision_medium:precision_medium,
   precision_high:precision_high,
   u_params_size_def: u_params_size_def,
   in_attr_col4: in_attr_col4,
   out_attr_col4: out_attr_col4,
   in_attr_wposTime4: in_attr_wposTime4,
   out_attr_wpos2: out_attr_wpos2,
   in_attr_pos2: in_attr_pos2,
   out_attr_vpos2: out_attr_vpos2,
   in_attr_tex2: in_attr_tex2,
   out_attr_tex2: out_attr_tex2,
   in_attr_sdf2: in_attr_sdf2,
   out_attr_sdf2: out_attr_sdf2,
   in_attr_style3:in_attr_style3,
   out_attr_style3:out_attr_style3,
   a_params4_1_in: a_params4_1_in,
   a_params4_1_out: a_params4_1_out,
   u_orthoProj_in: u_orthoProj_in,
   u_params_def: u_params_def,
   v_params_out: v_params_out,
   out_vdim2: out_vdim2,
   out_vtime1:out_vtime1,
   out_vres2:out_vres2,
   vtime1_assign_awpostime1:vtime1_assign_awpostime1,
   vdim2_assign_apos2: vdim2_assign_apos2,
   vcol4_assign_acol4: vcol4_assign_acol4,
   wpos2_assign_wpos3: wpos2_assign_wpos3,
   pos2_assign_pos2: pos2_assign_pos2,
   vstyle3_assign_astyle3:vstyle3_assign_astyle3,
   vres2_assign_uparams12:vres2_assign_uparams12,
   tex2_assign_tex2: tex2_assign_tex2,
   sdf2_assign_sdf2: sdf2_assign_sdf2,
   a_params4_1_assign: a_params4_1_assign,
   u_params_assign: u_params_assign,
   gl_position: gl_position,
};