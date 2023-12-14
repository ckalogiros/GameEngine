// "use strict";

// export const VS_GLOW = `#version 300 es

// #define UNIFORM_BUFFER_COUNT 2

// layout (location = 0) in mediump vec4  a_col;
// layout (location = 1) in mediump vec2  a_pos;
// layout (location = 2) in mediump vec4  a_wpos_time;
// layout (location = 3) in mediump vec4  a_params1;

// uniform mat4  u_projection;
// uniform mediump float uniforms_buffer[UNIFORM_BUFFER_COUNT];    

// out mediump vec4  v_col; 
// out mediump vec2  v_wpos; 
// out mediump vec2  v_dim; 
// out mediump float v_Size; 
// out mediump float v_time; 

// out mediump vec2  u_Res; 

    
// void main(void) {
    
//    gl_Position = u_projection * vec4(a_pos.x + a_wpos_time.x, a_pos.y + a_wpos_time.y, a_wpos_time.z, 1.0);
   
//    v_col       = a_col;
//    v_dim       = a_pos;
//    v_wpos      = a_wpos_time.xy;
//    v_time      = a_wpos_time.w;
//    v_Size      = a_params1.x;
//    u_Res       = vec2(uniforms_buffer[0], uniforms_buffer[1]);
// }
// `;

// export const FS_GLOW = `#version 300 es

// precision mediump float;

// in mediump vec4  v_col;
// in mediump vec2  v_dim;
// in mediump vec2  v_wpos;
// in mediump float v_Size;
// in mediump float v_time;

// in mediump vec2  u_Res;


// out vec4 frag_color;

// void main()
// {
//    if(v_col.a <= 0.) return; // Skip drawing

//    vec2 res = u_Res;
//    // float t = v_time;
//    float t = .5;
//    float size = v_Size;
//    vec2 uv = v_dim/res.x;

//    vec3 color = vec3(.0);

//    float len = length(uv);
//    float reduced = t*size; // 0.0 to .25
//    // float reduced = size; // 0.0 to .25
//    float d = 1.-smoothstep(.0, reduced, len);
   
//    float diffuse = 1.8; // The Smaller the value, the greater the flash in the center ring
//    // float diffuse = .8; // The Smaller the value, the greater the flash in the center ring
//    // float ex = abs(len * fract(t) * diffuse); // GOOD!
//    float ex = abs(len  * diffuse); // GOOD!
    
//    color = vec3(.2) / (ex);
//    // color = mix(color, v_col.rgb, 1.-t);
//    color = mix(color, v_col.rgb, t);
	
// 	frag_color = vec4(color*d*(1.-t), color*d*(1.-t));
// }
// `;

// // export const FS_GLOW = `#version 300 es
// // #define WHITE  vec4(1., 1., 1., 1.)
// // #define UNIFORM_BUFFER_COUNT 5

// // precision mediump float;

// // in mediump vec4  v_col;
// // in mediump vec2  v_wpos;
// // in mediump vec2  v_dim;
// // // in mediump float v_time;
// // in mediump float v_uniforms_buffer[UNIFORM_BUFFER_COUNT];   

// // out vec4 frag_color;


// // void main()
// // {
// //    float t = v_uniforms_buffer[2];
// //    vec2 res = vec2(v_uniforms_buffer[0], v_uniforms_buffer[1]);
// //    res.x /= res.x/res.y;                                   // Transform from screen resolution to mesh resolution
// //    vec2 dim = vec2(v_dim.x/res.x, v_dim.y/res.y);
// //    vec2 uv = gl_FragCoord.xy/res;                          // Transform to 0.0-1.0 coord space
// //    uv -= vec2(v_wpos.x/res.x, 1.-(v_wpos.y/res.y));        // Transform to meshes local coord space 
// //    // vec2 uv = v_dim/res*10.;
   
// //    // float len = length(uv);
// //    float len = length(uv)-fract(t);
// //    // len *= 1.-fract(t*.1);
// //    // float d = smoothstep(.0, .2, len);
// //    float d = 1.-(smoothstep(.05, .07, length(uv)));
   
// //    vec3 color = v_col.rgb;
// //    // float ring = abs(len * 1.-t);
// //    float ringDiameter = 1.; // The smaller the value, the smaller the explosion ring.
// //    float ring = abs(len * 1.- (t*ringDiameter));
// //    float centerFlash = .6; // The Smaller the value, the greater the flash in the center ring
// //    // float ex = abs(len * fract(t) * centerFlash); // GOOD!
// //    float ex = (.9); // GOOD!
    
// //    // color = vec3(ex);
// //    // color = vec3(.5) / (ex);
// //    // color = vec3(.2) / (ring);
// //    // color = vec3(.2) / min(ring, ex*1.5);
    
// //    // color = mix(color, v_col.rgb, 1.-t);
// //    // color = mix(color, vec3(ring), 1.-fract(t));
	
// //    // color *= vec3(ring);
// //    color *= pow(ex, .3);

// // 	// frag_color = vec4(color*d*(1.-t*2.), color*d*(1.-t*2.));
// // 	frag_color = vec4(color*(d), d);



// // 	// if(d*10.2 > 1.) frag_color = vec4(1.,0.,1.,1.);
// // 	// else frag_color = vec4(1.,1.,.0,1.);
// // }
// // `;




