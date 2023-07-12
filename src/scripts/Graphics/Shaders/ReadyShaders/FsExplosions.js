"use strict";


export const FS_EXPLOSION_CIRCLE = `#version 300 es

precision mediump float;

in mediump vec4  v_col;
in mediump vec2  v_wpos;
in mediump vec2  v_dim;
in mediump float v_time;
in mediump vec2  u_Res;

out vec4 frag_color;


void main()
{
   float t = v_time;
   if(t>=1.) return;
   vec2 res = u_Res;
   float ratio = res.y/res.x;
   res.x *= ratio;
   vec2 uv = v_dim/res*10.;


   vec3 color = vec3(.0);

   float len = length(uv);
   float d = 1.-smoothstep(.0, .9, len);
   
   float ringDiameter = .5; // The smaller the value, the smaller the explosion ring.
   float ring = abs(len * 1.- (t*ringDiameter));
   float centerFlash = .6; // The Smaller the value, the greater the flash in the center ring
   float ex = abs(len * fract(t) * centerFlash); // GOOD!
    
   color = vec3(.2) / min(ring*.5, ex*1.5);
    
   color = mix(color, v_col.rgb, 1.-(t*.2));
	
	frag_color = vec4(color*d*(1.-t), d*(1.-t));
	// frag_color = vec4(1.);

}
`;

export const FS_EXPLOSION_SIMPLE = `#version 300 es

precision mediump float;

in mediump vec4  v_col;
in mediump vec2  v_wpos;
in mediump vec2  v_dim;
in mediump float v_time;
in mediump vec2  u_Res;

out vec4 frag_color;

#define PI 3.14159;

void main()
{
   float t = v_time;
   if(t>=1.) return;
   vec2 res = u_Res;
   float ratio = res.y/res.x;
   res.x *= ratio;
   vec2 uv = v_dim/res*10.;

   vec3 color = vec3(.0);

   float len = length(uv);
   float d = 1.-smoothstep(.0, .6, len);
   // float c = abs(fract((len*5.) * 1.-t)); // GOOD! fract(len*x), x denoting the number of circles to divide to.

   // float c = t;
   float c = 1.-t;
   if(t>.5) c = t;

   
   color = (vec3(.5) / c) * d*(1.-t);
   // color = (vec3(1.) / c) * d*(1.-t);
   
   color *= v_col.rgb;
    
   // color = min(color, vec3(.3));
   frag_color = vec4(color*(1.-t*.2), color*(1.-t*.2));
   // frag_color = vec4(color*(1.-t), color*(1.-t*.2));
   // frag_color = vec4(1.);
}
`;

// const FS_EXPLOSION_CIRCLE = `#version 300 es
// #define WHITE  vec4(1., 1., 1., 1.)
// #define UNIFORM_BUFFER_COUNT 5

// precision mediump float;

// in mediump vec4  v_col;
// in mediump vec2  v_wpos;
// in mediump vec2  v_dim;
// in mediump float v_time;
// in mediump float v_uniforms_buffer[UNIFORM_BUFFER_COUNT];   

// out vec4 frag_color;

// #define PI 3.14159;

// float circ(vec2 p, float time) {
// 	float r = length(p);
//     // Multiply by a fractal to scale down the light explosion
//     return abs(4. * r * fract(-(1.9 - time)));
// }

// void main()
// {
//     vec2 res = vec2(v_uniforms_buffer[0], v_uniforms_buffer[1]);
//     float ratio = res.y/res.x;
//     res.x *= ratio;
//     float t = v_time;

//     vec2 uv = v_dim/res*10.;
//    	vec3 color = vec3(.0);

//     float d = 1.-smoothstep(.0, .9, length(vec2((uv.x), uv.y)));
//     float cr = abs(circ(uv, t*.1)) ;
    
//     color = vec3(.2) / cr;
    
//     color = min(color, vec3(0.5));
// 	frag_color = vec4(color*d*(1.0-t*2.2), color.b*d*(1.0-t*2.2));
// }
// `;
