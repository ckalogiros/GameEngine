"use strict";


export const FS_EXPLOSION_CIRCLE = `#version 300 es

precision mediump float;

in mediump vec4  v_Col;
in mediump vec2  v_Wpos;
in mediump vec2  v_Dim;
in mediump float v_Time;
in mediump vec2  u_Res;

out vec4 FragColor;


void main()
{
   float t = v_Time;
   if(t>=1.) return;
   vec2 res = u_Res;
   float ratio = res.y/res.x;
   res.x *= ratio;
   vec2 uv = v_Dim/res*10.;


   vec3 color = vec3(.0);

   float len = length(uv);
   float d = 1.-smoothstep(.0, .9, len);
   
   float ringDiameter = .5; // The smaller the value, the smaller the explosion ring.
   float ring = abs(len * 1.- (t*ringDiameter));
   float centerFlash = .6; // The Smaller the value, the greater the flash in the center ring
   float ex = abs(len * fract(t) * centerFlash); // GOOD!
    
   color = vec3(.2) / min(ring*.5, ex*1.5);
    
   color = mix(color, v_Col.rgb, 1.-(t*.2));
	
	FragColor = vec4(color*d*(1.-t), d*(1.-t));
	// FragColor = vec4(1.);

}
`;

export const FS_EXPLOSION_SIMPLE = `#version 300 es

precision mediump float;

in mediump vec4  v_Col;
in mediump vec2  v_Wpos;
in mediump vec2  v_Dim;
in mediump float v_Time;
in mediump vec2  u_Res;

out vec4 FragColor;

#define PI 3.14159;

void main()
{
   float t = v_Time;
   if(t>=1.) return;
   vec2 res = u_Res;
   float ratio = res.y/res.x;
   res.x *= ratio;
   vec2 uv = v_Dim/res*10.;

   vec3 color = vec3(.0);

   float len = length(uv);
   float d = 1.-smoothstep(.0, .6, len);
   // float c = abs(fract((len*5.) * 1.-t)); // GOOD! fract(len*x), x denoting the number of circles to divide to.

   // float c = t;
   float c = 1.-t;
   if(t>.5) c = t;

   
   color = (vec3(.5) / c) * d*(1.-t);
   // color = (vec3(1.) / c) * d*(1.-t);
   
   color *= v_Col.rgb;
    
   // color = min(color, vec3(.3));
   FragColor = vec4(color*(1.-t*.2), color*(1.-t*.2));
   // FragColor = vec4(color*(1.-t), color*(1.-t*.2));
   // FragColor = vec4(1.);
}
`;

// const FS_EXPLOSION_CIRCLE = `#version 300 es
// #define WHITE  vec4(1., 1., 1., 1.)
// #define MAX_NUM_PARAMS_BUFFER 5

// precision mediump float;

// in mediump vec4  v_Col;
// in mediump vec2  v_Wpos;
// in mediump vec2  v_Dim;
// in mediump float v_Time;
// in mediump float v_Params[MAX_NUM_PARAMS_BUFFER];   

// out vec4 FragColor;

// #define PI 3.14159;

// float circ(vec2 p, float time) {
// 	float r = length(p);
//     // Multiply by a fractal to scale down the light explosion
//     return abs(4. * r * fract(-(1.9 - time)));
// }

// void main()
// {
//     vec2 res = vec2(v_Params[0], v_Params[1]);
//     float ratio = res.y/res.x;
//     res.x *= ratio;
//     float t = v_Time;

//     vec2 uv = v_Dim/res*10.;
//    	vec3 color = vec3(.0);

//     float d = 1.-smoothstep(.0, .9, length(vec2((uv.x), uv.y)));
//     float cr = abs(circ(uv, t*.1)) ;
    
//     color = vec3(.2) / cr;
    
//     color = min(color, vec3(0.5));
// 	FragColor = vec4(color*d*(1.0-t*2.2), color.b*d*(1.0-t*2.2));
// }
// `;
