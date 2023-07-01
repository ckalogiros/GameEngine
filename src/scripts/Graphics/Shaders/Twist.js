"use strict";

/**
 * TODO: Pass an attribute to control the twist's magnitude from start to stop
 */

export const VS_TWIST = `#version 300 es

#define MAX_NUM_PARAMS_BUFFER 4
#define MAX_NUM_POSITIONS_BUFFER 4

layout (location = 0) in mediump vec4  a_Col;
layout (location = 1) in mediump vec2  a_Pos;
layout (location = 2) in mediump vec4  a_WposTime;

uniform mat4  u_OrthoProj;
uniform mediump float u_Params[MAX_NUM_PARAMS_BUFFER];    

out mediump vec4  v_Col; 
out mediump vec2  v_Wpos; 
out mediump vec2  v_Dim; 
out mediump vec2  u_Res; 
out mediump float u_Time; 
out mediump float u_Dir; 

    
void main(void) {
    
   gl_Position = u_OrthoProj * vec4(a_Pos.x + a_WposTime.x, a_Pos.y + a_WposTime.y, a_WposTime.z, 1.0);
   
   v_Col       = a_Col;
   v_Dim       = a_Pos;
   v_Wpos      = a_WposTime.xy;
   u_Res       = vec2(u_Params[0], u_Params[1]);
   u_Time      = u_Params[2];
   u_Dir       = u_Params[3];
}
`;

export const FS_TWIST = `#version 300 es

precision mediump float;

in mediump vec4  v_Col;
in mediump vec2  v_Wpos;
in mediump vec2  v_Dim;
in mediump vec2  u_Res;
in mediump float u_Time;
in mediump float u_Dir;

out vec4 FragColor;

#define Range .2
#define SPEED 1.0
#define STRENGTH 6.28

mat2 rotate(float a)
{
   float s = sin(a);
   float c = cos(a);
   return mat2(c,-s,s,c);
}
vec2 twist(vec2 uv, vec2 center, float range, float strength, float dir, float time) 
{
   float d = distance(uv, center);
   uv -= center;
   d = smoothstep(0., range, range-d) * strength ;
   // d = smoothstep(0., range, range-d) * strength * time;
   uv *= rotate(d*dir);
   uv += center;
   return uv;
}
float snoise(vec3 uv, float res, float dir)
{
	const vec3 s = vec3(1e0, 1e2, 1e3);
	uv *= 9.;
	vec3 uv0 = floor(mod(uv, res))*s;
	vec3 uv1 = floor(mod(uv+vec3(.01), res))*s;
	vec3 f = fract(uv); 
   f = f*f*(3.0-2.0*f);
	vec4 v = vec4(uv0.x+uv0.y+uv0.z, uv1.x+uv0.y+uv0.z, uv0.x+uv1.y+uv0.z, uv1.x+uv1.y+uv0.z);
	vec4 r = fract(sin(v*1e-1)*1e3);
	float r0 = mix(mix(r.x, r.z, f.x), mix(r.y, r.x, f.x), f.y);
	r = fract(sin((v + uv1.z - uv0.z)));
	float r1 = mix(mix(r.x, r.y, f.x), mix(r.x, r.y, f.x), f.y);
	// return mix(r0, r1, f.z)*2.-1.;
	return mix(r0, r1, f.z);
}

void main()
{
   vec2 res = u_Res;
   float t = u_Time;
   float dir = u_Dir;
   float ratio = res.y/res.x;
   res.x *= ratio;
   vec2 uv = v_Dim/res*10.;
   
   float cTime = 8.  * .4;
   uv = twist(uv, vec2(.0), .6, cTime, dir, t*.1)*rotate(t*dir*1.6);

   float color1 = 1. - (length(5.*uv));
   vec3 coord = vec3(atan(uv.x, uv.y)/19.+0.0, length(uv)*1., .9);
   color1 += (2. / 2.) * snoise(coord + vec3(0., .0, t*.01), 16., -dir);

   float color2 = 0.;
   float d = length(uv);
   float m = .02/d;
   color2 += m;

   float rays = max(.0, 1.-abs(uv.x*uv.y*100.));
   color2+=rays;
   color2+=rays*.03;

   float c = mix(color1, color2, .5);

   FragColor = vec4(vec3(c)*v_Col.rgb, c);
}


// Save 2
// void main()
// {
//    float t = v_Params[2];
//    float dir = v_Params[3];
//    vec2 res = vec2(v_Params[0], v_Params[1]);
//    float ratio = res.y/res.x;
//    res.x *= ratio;
//    // vec2 uv = v_Dim/res*10.;
//    // vec2 uv = v_Dim/res*7.;
//    // vec2 uv = v_Dim/res;
//    vec2 uv = v_Dim/res;
//    // vec2 uv = gl_FragCoord.xy/res;                          // Transform to 0.0-1.0 coord space
//    // uv -= vec2(v_Wpos.x/res.x, 1.-(v_Wpos.y/res.y));        // Transform to meshes local coord space 
//    uv*=5.;
   
//    float cTime = 8.  * .4;
//    // uv = twist(uv, vec2(.0), .6, cTime, dir)*rotate(t*dir*1.6);
//    // uv = twist(uv, vec2(.0), .6, cTime, dir);


//    float color1 = 1. - (2.*length(3.*uv));
//    vec3 coord = vec3(atan(uv.x,uv.y)/6.2832+.5, length(uv)*1.4, .1);
//    // color += (1.5 / 2.) * snoise(coord + vec3(0.,-t*.05, t*.01), 2.*16., dir);
//    color1 += (2.5 / 2.) * snoise(coord + vec3(0.,-t*.05, t*.01), 2.*16., dir);
   

//    float color2 = 0.;
//    float d = length(uv);
//    float m = .02/d;
//    color2 += m;

//    float rays = max(.0, 1.-abs(uv.x*uv.y*100.));
//    // float rays = max(.0, 1.-abs(uv.x*uv.y*1100.));
//    color2+=rays;
//    // color2 *= .2;

//    // FragColor = vec4( color1*color1*color1, pow(max(color1,0.),2.)*0.3, color1*pow(max(color2,0.),1.)*2.15 , 0.0);
//    // FragColor = vec4( 0., mix(color1, color2, .5)*.3, mix(color1, color2, .5) , 0.0);
//    FragColor = vec4(vec3(mix(color1, color2, .5))*v_Col.rgb, 0.);
//    // FragColor = vec4(vec3(color1, color2, 0.), 0.);
//    // FragColor = vec4(rays);
//    // FragColor = vec4(vec3(color2)*v_Col.rgb, 0.);
//    // FragColor = vec4(vec3(color2), 0.);
//    // FragColor = vec4(vec3(color), 1.-d);
// }


// void main()
// {
//    float t = v_Params[2];
//    float dir = v_Params[3];
//    vec2 res = vec2(v_Params[0], v_Params[1]);
//    float ratio = res.y/res.x;
//    res.x *= ratio;
//    // vec2 uv = v_Dim/res*10.;
//    vec2 uv = v_Dim/res*7.;

//    float cTime = STRENGTH  * SPEED;
//    uv = twist(uv, vec2(.0), Range, cTime, dir)*rotate(t*dir*3.);

    
// 	float color = 1. - (2.*length(2.*uv));
	
// 	vec3 coord = vec3(atan(uv.x,uv.y)/6.2832+.5, length(uv)*1.4, .1);
	
// 	for(int i = 1; i <= 1; i++)
// 	{
// 		float power = pow(2.0, float(i));
// 		color += (1.5 / power) * snoise(coord + vec3(0.,-t*.05, t*.01), power*16., dir);
// 	}
//    // color += (1.5 / 2.) * snoise(coord + vec3(0.,-t*.05, t*.01), 3.*16., dir);
	
//    vec3 col = vec3(color, pow(max(color,0.),2.)*0.4, pow(max(color,0.),3.)*0.15);
//    // float alpha = 
// 	// FragColor = vec4( .0, pow(max(color,0.),2.)*0.3, color*pow(max(color,0.),1.)*2.15 , 0.0);
//    // FragColor = vec4(mix(vec3(color),v_Col.rgb,.9), 0.);
//    FragColor = vec4(vec3(color*v_Col.rgb*.6), 0.);
//    // FragColor = vec4(vec3(color*v_Col.rgb), 0.);
//    // FragColor = vec4(vec3(color), 0.);
// }

`;

