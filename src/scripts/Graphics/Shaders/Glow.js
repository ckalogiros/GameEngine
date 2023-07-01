"use strict";

export const VS_GLOW = `#version 300 es

#define MAX_NUM_PARAMS_BUFFER 2
#define MAX_NUM_POSITIONS_BUFFER 2

layout (location = 0) in mediump vec4  a_Col;
layout (location = 1) in mediump vec2  a_Pos;
layout (location = 2) in mediump vec4  a_WposTime;
layout (location = 3) in mediump vec4  a_Params1;

uniform mat4  u_OrthoProj;
uniform mediump float u_Params[MAX_NUM_PARAMS_BUFFER];    

out mediump vec4  v_Col; 
out mediump vec2  v_Wpos; 
out mediump vec2  v_Dim; 
out mediump float v_Size; 
out mediump float v_Time; 

out mediump vec2  u_Res; 

    
void main(void) {
    
   gl_Position = u_OrthoProj * vec4(a_Pos.x + a_WposTime.x, a_Pos.y + a_WposTime.y, a_WposTime.z, 1.0);
   
   v_Col       = a_Col;
   v_Dim       = a_Pos;
   v_Wpos      = a_WposTime.xy;
   v_Time      = a_WposTime.w;
   v_Size      = a_Params1.x;
   
   u_Res       = vec2(u_Params[0], u_Params[1]);
}
`;

export const FS_GLOW = `#version 300 es

precision mediump float;

in mediump vec4  v_Col;
in mediump vec2  v_Dim;
in mediump vec2  v_Wpos;
in mediump float v_Size;
in mediump float v_Time;

in mediump vec2  u_Res;


out vec4 FragColor;

void main()
{
   if(v_Col.a <= 0.) return; // Skip drawing

   vec2 res = u_Res;
   // float t = v_Time;
   float t = .5;
   float size = v_Size;
   vec2 uv = v_Dim/res.x;

   vec3 color = vec3(.0);

   float len = length(uv);
   float reduced = t*size; // 0.0 to .25
   // float reduced = size; // 0.0 to .25
   float d = 1.-smoothstep(.0, reduced, len);
   
   float diffuse = 1.8; // The Smaller the value, the greater the flash in the center ring
   // float diffuse = .8; // The Smaller the value, the greater the flash in the center ring
   // float ex = abs(len * fract(t) * diffuse); // GOOD!
   float ex = abs(len  * diffuse); // GOOD!
    
   color = vec3(.2) / (ex);
   // color = mix(color, v_Col.rgb, 1.-t);
   color = mix(color, v_Col.rgb, t);
	
	FragColor = vec4(color*d*(1.-t), color*d*(1.-t));
}
`;

// export const FS_GLOW = `#version 300 es
// #define WHITE  vec4(1., 1., 1., 1.)
// #define MAX_NUM_PARAMS_BUFFER 5

// precision mediump float;

// in mediump vec4  v_Col;
// in mediump vec2  v_Wpos;
// in mediump vec2  v_Dim;
// // in mediump float v_Time;
// in mediump float v_Params[MAX_NUM_PARAMS_BUFFER];   

// out vec4 FragColor;


// void main()
// {
//    float t = v_Params[2];
//    vec2 res = vec2(v_Params[0], v_Params[1]);
//    res.x /= res.x/res.y;                                   // Transform from screen resolution to mesh resolution
//    vec2 dim = vec2(v_Dim.x/res.x, v_Dim.y/res.y);
//    vec2 uv = gl_FragCoord.xy/res;                          // Transform to 0.0-1.0 coord space
//    uv -= vec2(v_Wpos.x/res.x, 1.-(v_Wpos.y/res.y));        // Transform to meshes local coord space 
//    // vec2 uv = v_Dim/res*10.;
   
//    // float len = length(uv);
//    float len = length(uv)-fract(t);
//    // len *= 1.-fract(t*.1);
//    // float d = smoothstep(.0, .2, len);
//    float d = 1.-(smoothstep(.05, .07, length(uv)));
   
//    vec3 color = v_Col.rgb;
//    // float ring = abs(len * 1.-t);
//    float ringDiameter = 1.; // The smaller the value, the smaller the explosion ring.
//    float ring = abs(len * 1.- (t*ringDiameter));
//    float centerFlash = .6; // The Smaller the value, the greater the flash in the center ring
//    // float ex = abs(len * fract(t) * centerFlash); // GOOD!
//    float ex = (.9); // GOOD!
    
//    // color = vec3(ex);
//    // color = vec3(.5) / (ex);
//    // color = vec3(.2) / (ring);
//    // color = vec3(.2) / min(ring, ex*1.5);
    
//    // color = mix(color, v_Col.rgb, 1.-t);
//    // color = mix(color, vec3(ring), 1.-fract(t));
	
//    // color *= vec3(ring);
//    color *= pow(ex, .3);

// 	// FragColor = vec4(color*d*(1.-t*2.), color*d*(1.-t*2.));
// 	FragColor = vec4(color*(d), d);



// 	// if(d*10.2 > 1.) FragColor = vec4(1.,0.,1.,1.);
// 	// else FragColor = vec4(1.,1.,.0,1.);
// }
// `;




