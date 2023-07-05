export const VS_SHADOW = `#version 300 es

#define MAX_NUM_PARAMS_BUFFER 3

layout (location = 0) in mediump vec4 a_col;
layout (location = 1) in mediump vec4 a_wpos_time;
layout (location = 2) in mediump vec2 a_pos;
layout (location = 3) in mediump vec2 a_tex;
// layout (location = 4) in mediump vec3 a_style;

uniform mat4  u_ortho_proj;
uniform mediump float uniforms_buffer[MAX_NUM_PARAMS_BUFFER];                  // [0]:WinWidth, [1]:WinHeight, [3]:Time

out mediump vec4 v_col; 
out mediump vec2 v_dim; 
out mediump vec2 v_wpos; 
out mediump float v_time; 
out mediump vec2 v_tex_coord;
// out mediump float v_uniforms_buffer[MAX_NUM_PARAMS_BUFFER];                   
    
void main(void) {
    
    vec2 scaled = a_pos;
    gl_Position = u_ortho_proj * vec4(scaled.x + a_wpos_time.x, scaled.y + a_wpos_time.y, a_wpos_time.z, 1.0);
    
    v_col       = a_col;
    v_dim       = abs(a_pos);
    v_wpos      = a_wpos_time.xy;
    v_time      = a_wpos_time.w;
    v_tex_coord = a_tex;
    // v_uniforms_buffer    = uniforms_buffer;
}

`;

export const FS_SHADOW = `#version 300 es

precision highp float;
out vec4 frag_color;

in mediump vec4  v_col;
in mediump vec2  v_wpos;
in mediump float v_time;
in mediump vec2  v_dim;
in mediump vec2  v_tex_coord;

uniform sampler2D u_Sampler0;

// in mediump float v_uniforms_buffer[MAX_NUM_PARAMS_BUFFER]; 

#define KERNEL_SIZE 9
#define KER1    1., -2., 1., -2., 2., -2., 1., -2., 1. 
#define NI      1./3.
#define KER2    NI, NI,NI,NI,NI,NI,NI,NI,NI 
#define KER3    1., -1., 1., -1., 2., -1., 1., -1., 1. 


void main(void) {

    float xdim = v_dim.x;
    float ydim = v_dim.y;
    float xofs = 2. / xdim; 
    float yofs = 2. / ydim; 
    
    // vec2 offsets[KERNEL_SIZE] = vec2[]
    // (
    //     vec2(-xofs, yofs ),  vec2(0., yofs ), vec2(xofs, yofs ), 
    //     vec2(-xofs, 0.   ),  vec2(0., 0.   ), vec2(xofs, 0.   ), 
    //     vec2(-xofs, -yofs),  vec2(0., -yofs), vec2(xofs, -yofs) 
    // );
    vec2 offsets[KERNEL_SIZE] = vec2[]
    (
        vec2(-xofs, yofs ),  vec2(0., yofs ), vec2(xofs, yofs ), 
        vec2(-xofs, 0.   ),  vec2(0., 0.   ), vec2(xofs, 0.   ), 
        vec2(-xofs, -yofs),  vec2(0., -yofs), vec2(xofs, -yofs) 
    );

    float kernel[KERNEL_SIZE] = float[]
    (
        KER1
    );

    vec4 col = texture( u_Sampler0, v_tex_coord) * v_col;
    vec3 c = vec3(0.);
    for(int i = 0; i < KERNEL_SIZE; i++)
    {
        c +=  vec3(texture( u_Sampler0, v_tex_coord + offsets[i])) * v_col.rgb * kernel[i];
    }
    frag_color.rgb = c;
    // frag_color = col * texture(u_Sampler0, v_tex_coord).a;
    // frag_color = col;
    // frag_color = smoothstep(.0, .3, col) * texture(u_Sampler0, v_tex_coord).a;
    // frag_color = smoothstep(.0, .8, col);

    
    // Create the alpha channel from the current pixel color
    /* 
     * 1. Render transparency only if all colors = 0
     */
    // float a = max(col.r, max(col.g, col.b));
    // float a = min(col.r, min(col.g, col.b));
    // if(a <= 0.) frag_color.a = 0.;
    // else{
    //     frag_color.a = (col.r + col.g + col.b) /3.;
    // }
    /* 
     * 2. Render transparency from color average value 
     */
    // frag_color.a = (col.r + col.g + col.b) /3.;
    /* 
     * 3. Render transparency from color value 
     */
    frag_color.a = max(col.r, max(col.g, col.b));

}

`;