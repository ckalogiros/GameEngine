// "use strict";

// import { VS_GLOW } from "../ReadyShaders/Glow.js";
// import { VS_SHADOW } from "../ReadyShaders/Shadow.js";
// import { VS_TWIST } from "../ReadyShaders/Twist.js";
// import { Gl_vs_build_vertexshader } from "../ShaderBuilder/ConstructShader.js";
// import { VS_VORTEX2 } from "../ReadyShaders/VortexShader.js";

// /**
//  * Raymarching Implementation
//  *      https://www.youtube.com/watch?v=PGtv-dBi2wE
//  *      https://www.shadertoy.com/view/XlGBW3
//  * 
//     float GetDist(vec3 p)
//     {
//         vec4 sphere = vac4(0,1,6,1); // [x,y,z,radius]
//         // distance to the sphere
//         float ds = length(p - sphere.xyz) - sphere.w;  // -.w is the radius
//         float dp = p.y; // distance to the plane(the ground plane is the camera.y)
//         float d = min(ds, dp); // Take the closest distance(either the plane or the sphere)
//         return d;
//     }

//     // Calculate the normal of a surface by drawing a line between to (very close to each other) points
//     // on the surface, calculating the slope (the perpendicular to the line)
//     vec3 GetNormal(vec3 p) // p is a point on the surface
//     {
//         vec2 e = vec2(0.01, 0.0)
//         float d = GetDist(p);
//         vec3 normal = vec3(
//             d - GetDist(p - e.xyy),
//             d - GetDist(p - e.yxy),
//             d - GetDist(p - e.yyx)
//         ); 

//         return normalize(normal);
//     }

//     // ro: ray origin. 
//     // rd: ray direction
//     float RayMarch(vec3 ro, vec3 rd)
//     {
//         float do = 0; // do: distance origin(The origin changes in each step of the loop) 
//         for(int i=0; i<MAX_STEPS; i++)
//         {
//             // Set the ray origin to be the prev ray origin + the ray distance 
//             // to the prev closest point of the surface
//             vec3 p = ro + (do*rd);
            
//             // Calculate the new distance(from the current ray origin to the new closest to the surface point)
//             ds = GetDist(p);

//             // Store the current distance as the next origin
//             do += ds;
            
//             // If we come across a min distance that we declare as a contant
//             // OR we pass a max distance, we stop the ray marching
//             if(ds < SOME_MINIMUM_SURFACE_DISTANCE || do > SOME_MAX_DISTANCE)
//         }
//         return do;
//     }

//  * 
//  */

// //===================== Orthographic Matrix =====================
// // | left-right | 0				| 0							| 0 |
// // | 0			| top - bottom	|							| 0 |
// // |			|				| zFar - zNear				| 0 |
// // |-(r+l)/(r-l)|-(t+b) / (t-b) |-(zFar+zNear)/(zFar-zNear)	| 1 |
// // 0.,     cos(1.), -sin(1.), -0.,
// // 0.,     sin(1.), cos(1.),  0.,

// // mat4 Rotate(float a)
// // {
// //     float s = sin(a);
// //     float c = cos(a);
// //     return mat4(
// //         1., 0., 0.,0.,
// //         0., c, -s, 0.,
// //         0., s,  c, 0.,
// //         0., 0., 0.,1.
// //     );
// // }

// /**
//  * uniforms_buffer[0] = Window Width
//  * uniforms_buffer[1] = Window Height
//  */
// const VS_DEFAULT = `#version 300 es

// #define UNIFORM_BUFFER_COUNT 5

// in mediump vec4 a_col;
// in mediump vec4 a_wpos_time;
// in mediump vec4 a_params1;
// in mediump vec2 a_pos;
// in mediump vec3 a_style;

// uniform mat4  u_projection;
// uniform mediump float uniforms_buffer[UNIFORM_BUFFER_COUNT];                  // [0]:WinWidth, [1]:WinHeight, [3]:Time

// out mediump vec4 v_col; 
// out mediump vec2 v_dim; 
// out mediump vec2 v_wpos; 
// out mediump float v_time; 
// out mediump vec3 v_style; 
// out mediump vec2 v_res; 
// out mediump vec4 v_param1; 
// out mediump float v_uniforms_buffer[UNIFORM_BUFFER_COUNT];                   
    
// void main(void) {
    
//     gl_Position = u_projection * vec4(a_pos.x + a_wpos_time.x, a_pos.y + a_wpos_time.y, a_wpos_time.z, 1.0);
    
//     v_col       = a_col;
//     v_dim       = abs(a_pos);
//     v_wpos      = a_wpos_time.xy;
//     v_time      = a_wpos_time.w;
//     v_style     = a_style; 
//     v_res       = vec2(uniforms_buffer[0], uniforms_buffer[1]);
//     v_param1    = a_params1;
//     v_uniforms_buffer    = uniforms_buffer;
// }
// `;

// const VS_DEFAULT_TEXTURE = `#version 300 es

// #define UNIFORM_BUFFER_COUNT 5

// in vec4 a_col;
// in vec4 a_wpos_time;
// in vec2 a_pos;
// in vec2 a_tex;

// // In
// uniform mat4 u_projection;
// uniform mediump float uniforms_buffer[UNIFORM_BUFFER_COUNT];                  // [0]:SdfInner, [1]:SdfOuter, [3]?


// // Out
// out mediump vec4 v_col; 
// out mediump vec2 v_pos;
// out mediump vec2 v_wpos;
// out mediump vec2 v_tex_coord;
// out mediump float v_uniforms_buffer[UNIFORM_BUFFER_COUNT];

// void main(void) 
// {
//     gl_Position = u_projection * vec4(a_pos.x + a_wpos_time.x, a_pos.y + a_wpos_time.y, a_wpos_time.z, 1.0);

//     v_col = a_col;
//     v_pos = a_pos;
//     v_wpos = a_wpos_time.xy;
//     v_tex_coord = a_tex;
//     v_uniforms_buffer = uniforms_buffer;
// }
// `;

// const VS_DEFAULT_TEXTURE_SDF = `#version 300 es

// in vec4 a_wpos_time;
// in vec2 a_pos;
// in vec2 a_tex;
// in vec2 a_sdf;
// in vec4 a_col;

// // Uniforms
// uniform mat4 u_projection;
// // uniform mediump float uniforms_buffer[UNIFORM_BUFFER_COUNT];                  // [0]:SdfInner, [1]:SdfOuter, [3]?


// // Out
// out mediump vec4 v_col; 
// out mediump vec2 v_tex_coord;
// out mediump vec2 v_sdf;

// void main(void) 
// {
//     gl_Position = u_projection * vec4(a_pos.x + a_wpos_time.x, a_pos.y + a_wpos_time.y, a_wpos_time.z, 1.0);

//     v_col = a_col;
//     v_tex_coord = a_tex;
//     v_sdf = a_sdf;
// }
// `;

// /**
//  * The timer used is from an attribute
//  */
// const VS_EXPLOSION_ATTR_TIME = `#version 300 es

// #define UNIFORM_BUFFER_COUNT 2
// #define MAX_NUM_POSITIONS_BUFFER 2

// in mediump vec4  a_col;
// in mediump vec2  a_pos;
// in mediump vec4  a_wpos_time;
// in mediump vec4  a_params1;

// uniform mat4  u_projection;
// uniform mediump float uniforms_buffer[UNIFORM_BUFFER_COUNT];    

// out mediump vec4  v_col; 
// out mediump vec2  v_wpos; 
// out mediump vec2  v_dim; 
// out mediump float v_Size; 
// out mediump float v_time; 
// out mediump vec2  u_Res; 

    
// void main(void) {
    
//     gl_Position = u_projection * vec4(a_pos.x + a_wpos_time.x, a_pos.y + a_wpos_time.y, a_wpos_time.z, 1.0);
    
//     v_col       = a_col;
//     v_dim       = a_pos;
//     v_wpos      = a_wpos_time.xy;
//     v_time      = a_wpos_time.w;
//     v_Size      = a_params1.x;
//     u_Res       = vec2(uniforms_buffer[0], uniforms_buffer[1]);
// }
// `;



// const VS_PARTICLES = `#version 300 es

// #define UNIFORM_BUFFER_COUNT 3

// in mediump vec4  a_col;
// in mediump vec2  a_pos;
// in mediump vec4  a_wpos_time;
// in mediump vec4  a_params1;

// uniform mat4  u_projection;
// uniform float uniforms_buffer[UNIFORM_BUFFER_COUNT];                 

// out mediump vec4  v_col; 
// out mediump vec2  v_wpos; 
// out mediump vec4  v_params1; 
// out mediump vec2  v_dim; 
// out mediump float v_time; 
// out mediump vec2  u_Res; 

// void main(void) 
// {
//     gl_Position = u_projection * vec4(a_pos.x + a_wpos_time.x, a_pos.y + a_wpos_time.y, a_wpos_time.z, 1.0);
    
//     v_col  = a_col;
//     v_wpos = a_wpos_time.xy;
//     v_dim  = abs(a_pos);
//     v_time = a_wpos_time.w;
//     v_params1 = a_params1;
//     u_Res = vec2(uniforms_buffer[0], uniforms_buffer[1]);
// }`;

// const VS_CRAMBLE = `#version 300 es

// #define UNIFORM_BUFFER_COUNT 5

// in mediump vec4 a_col;
// in mediump vec2 a_pos;
// in mediump vec4 a_wpos_time;
// in mediump vec3 a_style;


// uniform mat4  u_projection;
// uniform mediump float uniforms_buffer[UNIFORM_BUFFER_COUNT];

// out mediump vec4 v_col; 
// out mediump vec2 v_wpos; 
// out mediump vec2 v_dim; 
// out mediump vec3 v_style; 
// out mediump float v_uniforms_buffer[UNIFORM_BUFFER_COUNT];                   
    
// void main(void) {
    
//     gl_Position = u_projection * vec4(a_pos.x + a_wpos_time.x, a_pos.y + a_wpos_time.y, a_wpos_time.z, 1.0);
    
//     v_col       = a_col;
//     v_dim       = abs(a_pos);
//     v_wpos      = a_wpos_time.xy;
//     v_style     = a_style; 
//     v_uniforms_buffer    = uniforms_buffer;
// }
// `;

// /**
//  * Pass @param sid of @type: SID, to get the correct shader
//  */
// export function VertexShaderChoose(sid) {

//     if (sid & SID.ATTR.STYLE) {
//         return Gl_vs_build_vertexshader(sid);
//         // return VS_DEFAULT;
//     }

//     // else if (sid & SID.TEST_SHADER) { return VS_VORTEX; }
//     else if (sid & SID.TEST_SHADER) { return VS_VORTEX2; }
//     // else if (sid & SID.TEST_SHADER) { return VS_EXPLOSION_ATTR_TIME; }
//     else if (sid & SID.ATTR.TEX2 && sid & SID.ATTR.SDF) { 
//         return Gl_vs_build_vertexshader(sid);
//         // return VS_DEFAULT_TEXTURE_SDF; 
//     }
//     else if (sid & SID.FX.FS_SHADOW) { return VS_SHADOW; }
//     else if (sid & SID.ATTR.TEX2) { 
//         // return Gl_vs_build_vertexshader(sid);
//         return VS_DEFAULT_TEXTURE; 
//     }
//     else if (sid & SID.FX.FS_PARTICLES) { return VS_PARTICLES; }
//     else if (sid & SID.FX.FS_GLOW) { return VS_GLOW; }
//     else if (sid & SID.FX.FS_VORTEX) { return VS_VORTEX2; }
//     else if (sid & SID.FX.FS_TWIST) { return VS_TWIST; }
//     else if (sid & SID.FX.FS_EXPLOSION_CIRCLE
//         || sid & SID.FX.FS_EXPLOSION_SIMPLE
//         || sid & SID.FX.FS_VOLUMETRIC_EXPLOSION) {
//         return VS_EXPLOSION_ATTR_TIME;
//     }
//     else if (sid & SID.FX.FS_CRAMBLE) { return VS_CRAMBLE; }

//     console.warn('No Vertex Shader found with this SID. Loading Default.');
//     // alert('No Vertex Shader found with this SID');

//     return Gl_vs_build_vertexshader(sid);
// }

