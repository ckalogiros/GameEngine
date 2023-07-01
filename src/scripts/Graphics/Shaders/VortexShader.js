"use strict";

export const VS_VORTEX = `#version 300 es

#define MAX_NUM_PARAMS_BUFFER 3

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

out mediump float u_Time; 
out mediump vec2  u_Res; 

    
void main(void) {
    
   gl_Position = u_OrthoProj * vec4(a_Pos.x + a_WposTime.x, a_Pos.y + a_WposTime.y, a_WposTime.z, 1.0);
   
   v_Col       = a_Col;
   v_Dim       = a_Pos;
   v_Wpos      = a_WposTime.xy;
   // v_Time      = a_WposTime.w;
   
   u_Res       = vec2(u_Params[0], u_Params[1]);
   u_Time      = u_Params[2];
}
`;

export const FS_VORTEX = `#version 300 es

precision mediump float;

in mediump vec4  v_Col;
in mediump vec2  v_Dim;
in mediump vec2  v_Wpos;

in mediump float u_Time;
in mediump vec2  u_Res;

uniform sampler2D u_Sampler0;

out vec4 FragColor;


#define PI 3.14159265359
#define TWO_PI 6.28318530718
#define HALFPI 1.57079632679

//Hash Functions by Dave_Hoskins 
//https://www.shadertoy.com/view/4djSRW/////////////////////
#define HASHSCALE1 .1031
#define HASHSCALE3 vec3(.1031, .1030, .0973)
#define HASHSCALE4 vec4(.1031, .1030, .0973, .1099)

vec2 hash21(float p)
{
	vec3 p3 = fract(vec3(p) * HASHSCALE3);
	p3 += dot(p3, p3.yzx + 19.19);
    return fract((p3.xx+p3.yz)*p3.zy);
}

vec4 hash42(vec2 p)
{
	vec4 p4 = fract(vec4(p.xyxy) * HASHSCALE4);
    p4 += dot(p4, p4.wzxy+19.19);
    return fract((p4.xxyz+p4.yzzw)*p4.zywx);

}
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

mat2 rot(float a) 
{
    vec2 s = sin(vec2(a, a + HALFPI));
    return mat2(s.y,s.x,-s.x,s.y);
}

vec2 CalculateUv(vec2 coord, float time)
{
   vec2 uv = coord;
   uv *= rot(time*0.1);
   uv += sin(vec2(time*0.2, time*0.3 + HALFPI)) * 0.35;
   
   vec4 disto = sin(uv.xxyy * vec4(8.1, 7.8, 7.7, 8.3) + vec4(0.3, -0.4, 0.25, -0.3) * time) * vec4(0.01, 0.015, 0.007, 0.012);
   uv.x += disto.z + disto.w;
   uv.y += disto.x + disto.y;
   return uv;
}

float star(vec2 uv, vec2 s, vec2 offset)
{
   uv += offset;
   uv *= 2.;
   float l = length(uv);
   // l = sqrt(l);
   vec2 v = smoothstep(s, vec2(0.0), vec2(l));
   
   // return v.x + v.y*0.1;
   return v.x + v.y;
}

vec4 starField(vec2 uv, float iTime)
{
   vec2 fracuv = fract(uv);
   vec2 flooruv = floor(uv);
   vec4 r = hash42(flooruv);
   vec4 color = mix(vec4(0.5, 1.0, 0.25, 1.0), vec4(0.25, 0.5, 1.0, 1.0), dot(r.xy, r.zw)) * 4.0 * dot(r.xz, r.yw);
   
   float t = iTime*4.0;
   vec2 o = sin(vec2(t, t + HALFPI) * r.yx) * r.zw * 0.75;
   
   return color * star((fracuv - 0.5) * 2.0, vec2(0.4, 0.75) * (0.5 + 0.5*r.xy), o);
}

vec4 func1(vec2 iRes, float iTime)
{
   vec2 uv = gl_FragCoord.xy/iRes.xy;
   uv -= 0.5;
   uv.x *= iRes.x/iRes.y;
    
	uv = CalculateUv(uv, iTime);
        
   vec4 res = vec4(0.0);
   float t = iTime * -0.075;
   const float itter = 15.0;
   float tex = 0.0;
   vec2 disto = vec2(0.0);
    
   for(float f = 0.0; f < itter; f++)
   {
      vec2 r = hash21(f);
      float t2 = fract(t + f / itter);
      float size = mix(30.0, 0.001, t2);
      vec2 fade = smoothstep(vec2(0.0, 1.0), vec2(0.9, 0.9), vec2(t2));
      
      vec2 uv2 = uv * size + r * 100.0 + (r - 0.5) * iTime * 0.25;
      res += starField(uv2, iTime) * fade.x * fade.y * 0.65;
      tex = texture(u_Sampler0, uv2*0.1 + tex * 0.15).x;
      disto += vec2(tex) / itter;
      res += tex * tex * 3.0 * fade.x * fade.y * vec4(0.25, 0.35, 0.5, 1.0) / itter;
   }
    
   vec2 distuv = uv + disto*0.15;
   vec4 sun = smoothstep(vec4(0.25, 3.0, 0.0025, 4.5), vec4(0.0, 0.0, 0.0, 0.0), vec4(dot(distuv, distuv)));
   sun = sun * sun * sun * sun;
   // sun.xyz *= 0.5;
   
   vec2 pc;
   pc.x = iTime*0.02;
   pc.y = (atan(distuv.x, distuv.y) / PI) + iTime * 0.05;
   
   // float rays = (texture(u_Sampler0, pc).x + texture(u_Sampler0, pc * vec2(1.0, 0.5)).x) * sun.y * 0.5;
   float rays = (pc.x + (pc * vec2(1.0, 0.5)).x) * sun.y * 0.5;
   
   vec4 bg = mix(vec4(0.01, 0.01, 0.075, 1.0), vec4(0.05, 0.065, 0.1, 1.0), clamp(sun.x + rays, 0.0, 1.0) + sun.y);
   bg += sun.z*vec4(0.2, 0.2, 0.05, 0.0) + sun.x * vec4(0.05, 0.05, 0.075, 0.0);
   
   vec4 c = bg + res * bg * 0.5 + res*0.5;
   c *= sun.w;
   
   vec4 old = texture(u_Sampler0, gl_FragCoord.xy/iRes.xy);
   return c + old * 0.85;
}
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////


void main()
{
   // vec2 uv = gl_FragCoord.xy/v_Dim;
   vec2 uv = u_Res.xy/v_Dim;

   float iTime = u_Time;
   
   float v = max(0.0, length(uv - 0.5) * 7.0 - 2.0);
   // vec4 col = textureLod(iChannel0, uv, v);
   vec4 col = textureLod(u_Sampler0, uv, v);
   // vec4 col = vec4(0.);
   col += func1(v_Dim, iTime);

   FragColor = pow(col, vec4(2.0));
}

`;

/**
 * GLSL: Use of flat 
 * in the GLSL spec section 4.5
 * A variable qualified as flat will not be interpolated. Instead, it will have the same value for every fragment within a triangle. This value will come from a single provoking vertex, as described by the OpenGL Graphics System Specification. A variable may be qualified as flat can also be qualified as centroid or sample, which will mean the same thing as qualifying it only as flat
 */
export const VS_VORTEX2 = `#version 300 es

#define MAX_NUM_PARAMS_BUFFER 3

layout (location = 0) in mediump vec4  a_Col;
layout (location = 1) in mediump vec2  a_Pos;
layout (location = 2) in mediump vec4  a_WposTime;
layout (location = 3) in mediump vec4  a_Params1;

uniform mat4  u_OrthoProj;
uniform mediump float u_Params[MAX_NUM_PARAMS_BUFFER];    

flat out mediump vec4  v_Col; 
flat out mediump vec2  v_Wpos; 
out mediump vec2  v_Dim; 
flat out mediump float v_Time; 

flat out mediump vec2  u_Res; 
flat out mediump float  u_Radius; 

// Parameters 1 from attribute
flat out mediump int  v_Count; 

    
void main(void) {
    
   gl_Position = u_OrthoProj * vec4(a_Pos.x + a_WposTime.x, a_Pos.y + a_WposTime.y, a_WposTime.z, 1.0);
   
   v_Col       = a_Col;
   v_Dim       = a_Pos;
   v_Wpos      = a_WposTime.xy;
   v_Time      = a_WposTime.w;
   v_Count     = int(a_Params1.x);
   
   u_Res       = vec2(u_Params[0], u_Params[1]);

   u_Radius    = u_Params[2];
}
`;


// TODO: MOVE most of the regulatory variables to the vertex shader or calculate them cpu side
export const FS_VORTEX2 = `#version 300 es

precision mediump float;

flat in mediump vec4  v_Col;
in mediump vec2  v_Dim;
flat in mediump vec2  v_Wpos;
flat in mediump float v_Time;
flat in mediump int v_Count;

flat in mediump vec2  u_Res;
flat in mediump float u_Radius;


uniform sampler2D u_Sampler0;

out vec4 FragColor;

#define PI 3.14159265359
#define TWO_PI 6.28318530718
#define HALFPI 1.57079632679

const float period = 1.0;
const float speed  = 2.0;
const float rotation_speed = 0.3;
const float t2 = 4.0; // Length in seconds of the effect

#define MOD3 vec3(.1031,.11369,.13787)
vec3 hash33(vec3 p3)
{
	p3 = fract(p3 * MOD3);
    p3 += dot(p3, p3.yxz+19.19);
    return -1.0 + 2.0 * fract(vec3((p3.x + p3.y)*p3.z, (p3.x+p3.z)*p3.y, (p3.y+p3.z)*p3.x));
}

float simplexNoise(vec3 p)
{
   const float K1 = 0.333333333;
   const float K2 = 0.166666667;
   
   vec3 i = floor(p + (p.x + p.y + p.z) * K1);
   vec3 d0 = p - (i - (i.x + i.y + i.z) * K2);
   
   vec3 e = step(vec3(0.0), d0 - d0.yzx);
	vec3 i1 = e * (1.0 - e.zxy);
	vec3 i2 = 1.0 - e.zxy * (1.0 - e);
    
   vec3 d1 = d0 - (i1 - 1.0 * K2);
   vec3 d2 = d0 - (i2 - 2.0 * K2);
   vec3 d3 = d0 - (1.0 - 3.0 * K2);
   
   vec4 h = max(0.6 - vec4(dot(d0, d0), dot(d1, d1), dot(d2, d2), dot(d3, d3)), 0.0);
   vec4 n = h * h * h * h * vec4(dot(d0, hash33(i)), dot(d1, hash33(i + i1)), dot(d2, hash33(i + i2)), dot(d3, hash33(i + 1.0)));
   
   return dot(vec4(31.316), n);
}

float fBm3(in vec3 p)
{
   // p += vec2(sin(iTime * .7), cos(iTime * .45))*(.1) + iMouse.xy*.1/res.xy;
	float f = 0.0;
	// Change starting scale to any integer value...
	float scale = 5.0;
   p = mod(p, scale);
	float amp   = 0.75;
	
	for (int i = 0; i < 5; i++)
	{
		f += simplexNoise(p * scale) * amp;
		amp *= 0.5;
		// Scale must be multiplied by an integer value...
		scale *= 2.0;
	}
	// Clamp it just in case....
	return min(f, 1.0);
}

// From: https://www.shadertoy.com/view/4dBcWy

vec3 mod289(vec3 x) {
  return x - floor(x * (1.0 / 289.0)) * 289.0;
}

vec4 mod289(vec4 x) {
  return x - floor(x * (1.0 / 289.0)) * 289.0;
}

vec4 permute(vec4 x) {
     return mod289(((x*34.0)+1.0)*x);
}

vec4 taylorInvSqrt(vec4 r)
{
  return 1.79284291400159 - 0.85373472095314 * r;
}

float snoise(vec3 v)
{ 
   const vec2  C = vec2(0.1666666666666667, 0.3333333333333333) ; // 1.0/6.0, 1.0/3.0
   const vec4  D = vec4(0.0, 0.5, 1.0, 2.0);

   // First corner
   vec3 i  = floor(v + dot(v, C.yyy) );
   vec3 x0 =   v - i + dot(i, C.xxx) ;

   // Other corners
   vec3 g = step(x0.yzx, x0.xyz);
   vec3 l = 1.0 - g;
   vec3 i1 = min( g.xyz, l.zxy );
   vec3 i2 = max( g.xyz, l.zxy );

   vec3 x1 = x0 - i1 + C.xxx;
   vec3 x2 = x0 - i2 + C.yyy; // 2.0*C.x = 1/3 = C.y
   vec3 x3 = x0 - D.yyy;      // -1.0+3.0*C.x = -0.5 = -D.y

   // Permutations
   i = mod289(i); 
   vec4 p = permute( permute( permute( 
               i.z + vec4(0.0, i1.z, i2.z, 1.0 ))
            + i.y + vec4(0.0, i1.y, i2.y, 1.0 )) 
            + i.x + vec4(0.0, i1.x, i2.x, 1.0 ));

   // Gradients: 7x7 points over a square, mapped onto an octahedron.
   // The ring size 17*17 = 289 is close to a multiple of 49 (49*6 = 294)
   float n_ = 0.142857142857; // 1.0/7.0
   vec3  ns = n_ * D.wyz - D.xzx;

   vec4 j = p - 49.0 * floor(p * ns.z * ns.z);  //  mod(p,7*7)

   vec4 x_ = floor(j * ns.z);
   vec4 y_ = floor(j - 7.0 * x_ );    // mod(j,N)

   vec4 x = x_ *ns.x + ns.yyyy;
   vec4 y = y_ *ns.x + ns.yyyy;
   vec4 h = 1.0 - abs(x) - abs(y);

   vec4 b0 = vec4( x.xy, y.xy );
   vec4 b1 = vec4( x.zw, y.zw );

   vec4 s0 = floor(b0)*2.0 + 1.0;
   vec4 s1 = floor(b1)*2.0 + 1.0;
   vec4 sh = -step(h, vec4(0.0));

   vec4 a0 = b0.xzyw + s0.xzyw*sh.xxyy ;
   vec4 a1 = b1.xzyw + s1.xzyw*sh.zzww ;

   vec3 p0 = vec3(a0.xy,h.x);
   vec3 p1 = vec3(a0.zw,h.y);
   vec3 p2 = vec3(a1.xy,h.z);
   vec3 p3 = vec3(a1.zw,h.w);

      //Normalise gradients
   vec4 norm = taylorInvSqrt(vec4(dot(p0,p0), dot(p1,p1), dot(p2, p2), dot(p3,p3)));
   p0 *= norm.x;
   p1 *= norm.y;
   p2 *= norm.z;
   p3 *= norm.w;

      // Mix final noise value
   vec4 m = max(0.6 - vec4(dot(x0,x0), dot(x1,x1), dot(x2,x2), dot(x3,x3)), 0.0);
   m = m * m;
   return 42.0 * dot( m*m, vec4( dot(p0,x0), dot(p1,x1), dot(p2,x2), dot(p3,x3) ) );
}


float getnoise(int octaves, float persistence, float freq, vec3 coords) {
   float amp= 1.; 
   float maxamp = 0.;
   float sum = 0.;
   for (int i=0; i < octaves; ++i) 
   {
      sum += amp * snoise(coords*freq); 
      freq *= 2.;
      maxamp += amp;
      amp *= persistence;
   }
   
   return (sum / maxamp) * .5 + .5;
}



void main()
{
   float iTime = v_Time;
   vec2 res = u_Res;
   float count = float(v_Count);
   vec2 wpos = vec2(v_Wpos.x, res.y-v_Wpos.y);
   // vec2 dim = abs(v_Dim);                                    
   vec2 dim = v_Dim;                                    
   vec2 frag = gl_FragCoord.xy; 
   vec2 uv = (frag)/res;

   iTime += 2.9;
   float t = mod(iTime, t2);
   t = t / t2; // Normalized time

   vec4 col = vec4(0.0);
   vec2 p = (uv - dim ) / u_Radius;
   // vec2 p = (uv - dim ) / min( dim.y, dim.x );
   // vec2 p = (uv - abs(v_Dim) ) / min( abs(v_Dim.y), abs(v_Dim.x) );
   
   float ay = 0.0, ax = 0.0, az = 0.0;

   mat3 mY = mat3(
      cos(ay), 0.0,  sin(ay),
      0.0,     1.0,      0.0,
      -sin(ay), 0.0,  cos(ay)
   );

   mat3 mX = mat3(
      1.0,      0.0,     0.0,
      0.0,  cos(ax), sin(ax),
      0.0, -sin(ax), cos(ax)
   );
   mat3 m = mX * mY;

   vec3 v = vec3(p, 1.0);
   v = m * v;
   float v_xy = length(v.xy);
   float z = v.z / v_xy;

   // TODO: Create once per vertex in vertex shaderthese constant variables, instead of creating for each fragment
   float amt = min((count + 4.) * .04, count);
   float colorIntensity = amt;
   if(amt < 1.) colorIntensity = 1.;
   else if(amt > 3.) colorIntensity = 3.;

   vec2 polar;
   float p_len = length(v.xy);
   float a = atan(v.y, v.x);
   a = 0.5 + 0.5 * a / (1. * PI);
   // a -= iTime * rotation_speed;
   float x = fract(a);
   // Remove the seam by reflecting the u coordinate around 0.5:
   // if ((x) >= 0.01)  x = 1.0 - x;
   polar.x = 1.-x;

   // Colorize blue
   float val = 0.45 + 0.55 * fBm3(vec3(vec2(2.0, 0.5) * polar, 0.15 * iTime));
   // float val = getnoise(8, 0.65, 1.0, vec3(polar, 0));
   val = clamp(val, 0.0, 1.0);
   col.rgb = vec3(0.15, 0.4, 0.9) * vec3(val);

   // Add white spots
   vec3 white = 0.35 * vec3(smoothstep(0.55, 1.0, val));
   col.rgb += white;
   col.rgb = clamp(col.rgb, 0.0, 1.0);

   float w_total = 0.0, w_out = 0.0;

   // Add the white disk at the center
   float disk_size = .3;
   // float disk_col = exp(-(p_len - disk_size) * 40.9);
   float disk_col = (-(p_len - disk_size) * .8);
   col.rgb += clamp(vec3(disk_col), 0.0, 1.0);

   col.rgb = mix(col.rgb, vec3(1.0), w_total);
   FragColor = vec4(col.rgb, 0.);
   
   // for (int s = 0; s < v_Count; s++) {
   //    vec2 u = (uv-dim+vec2(s%8,s/8)/8.)/res;
   //    u*=.2;
   //    u = floor((2.-vec2(atan(u.y,u.x),length(u)))*res);
   //    float star_period = TWO_PI;
   //    float star_speed =  .5;
   //    // float star_speed =  amt*.4;
   //    float star_density = 140.;
   //    vec4 chroma = vec4(1,1,1,0);
   
   //    FragColor += max(
   //       1.-fract(chroma*.02+(u.y*.02+u.x*.4)*
   //          fract(u.x*star_period)+iTime*star_speed)*star_density, 0.)/4.;
   // }
   
   
   
   float diameter = (1./res.x) * u_Radius;
   float r =  (min(res.y, res.x));
   r =  min(r, max(r*amt, .001));
   // r = res.x;
   
   // FragColor = FragColor + vec4(vec3(max(3.5-iTime, 0.)),1.0);
   float scaleDownTime = .6;
   float brightness = 5.;
   // float brightness = 3.1 + (count*.05);
   // TODO: MOVE to vertex shader or calculate in App
   if(brightness > 4.) brightness = 4.;  // Good from 3.-3.1 to 4.
   // FragColor = FragColor + vec4(vec3(max((1.-fract(iTime)*.5), 0.)), 1.0);
   // FragColor = FragColor + vec4(vec3(max(((brightness-iTime)*scaleDownTime)*.5, 0.)), 1.0);
   float c = max((brightness-iTime)*scaleDownTime, 0.);
   FragColor = FragColor + vec4(vec3(0., c*.4, c*.7), 1.0);
   
   // float len = length((frag/res)-(wpos/res));
   float len = length((frag/r)-(wpos/r));
   float alpha = 1.-smoothstep(.0, diameter, len);
   FragColor.rgb *= vec3(alpha);
   // FragColor.a = alpha;
   // FragColor.a = 1.-((FragColor.r + FragColor.g+FragColor.b)/3.);
   FragColor.a = ((FragColor.r + FragColor.g+FragColor.b)/3.);
   // FragColor.a *= alpha;
   // FragColor.a = .0;
   
   // FragColor.rgb *= colorIntensity;
   // if(abs(v_Dim.x) < 10.)
   // if(float(v_Count) > 0.)
   // FragColor.rgb = vec3(.0);
}

`;
/** Save 1 */
// export const VS_VORTEX2 = `#version 300 es

// #define MAX_NUM_PARAMS_BUFFER 3

// layout (location = 0) in mediump vec4  a_Col;
// layout (location = 1) in mediump vec2  a_Pos;
// layout (location = 2) in mediump vec4  a_WposTime;
// layout (location = 3) in mediump vec4  a_Params1;

// uniform mat4  u_OrthoProj;
// uniform mediump float u_Params[MAX_NUM_PARAMS_BUFFER];    

// out mediump vec4  v_Col; 
// out mediump vec2  v_Wpos; 
// out mediump vec2  v_Dim; 
// out mediump float v_Time; 
// // out mediump float v_Size; 

// // out mediump float u_Time; 
// out mediump vec2  u_Res; 

    
// void main(void) {
    
//    gl_Position = u_OrthoProj * vec4(a_Pos.x + a_WposTime.x, a_Pos.y + a_WposTime.y, a_WposTime.z, 1.0);
   
//    v_Col       = a_Col;
//    v_Dim       = a_Pos;
//    // v_Dim       = abs(a_Pos);
//    v_Wpos      = a_WposTime.xy;
//    v_Time      = a_WposTime.w;
   
//    u_Res       = vec2(u_Params[0], u_Params[1]);
//    // u_Time      = u_Params[2];
// }
// `;

// export const FS_VORTEX2 = `#version 300 es

// precision mediump float;

// in mediump vec4  v_Col;
// in mediump vec2  v_Dim;
// in mediump vec2  v_Wpos;
// in mediump float v_Time;

// // in mediump float u_Time;
// in mediump vec2  u_Res;

// uniform sampler2D u_Sampler0;

// out vec4 FragColor;

// #define PI 3.14159265359
// #define TWO_PI 6.28318530718
// #define HALFPI 1.57079632679

// const float period = 1.0;
// const float speed  = 2.0;
// const float rotation_speed = 0.3;
// const float t2 = 4.0; // Length in seconds of the effect

// #define MOD3 vec3(.1031,.11369,.13787)
// vec3 hash33(vec3 p3)
// {
// 	p3 = fract(p3 * MOD3);
//     p3 += dot(p3, p3.yxz+19.19);
//     return -1.0 + 2.0 * fract(vec3((p3.x + p3.y)*p3.z, (p3.x+p3.z)*p3.y, (p3.y+p3.z)*p3.x));
// }

// float simplexNoise(vec3 p)
// {
//    const float K1 = 0.333333333;
//    const float K2 = 0.166666667;
   
//    vec3 i = floor(p + (p.x + p.y + p.z) * K1);
//    vec3 d0 = p - (i - (i.x + i.y + i.z) * K2);
   
//    vec3 e = step(vec3(0.0), d0 - d0.yzx);
// 	vec3 i1 = e * (1.0 - e.zxy);
// 	vec3 i2 = 1.0 - e.zxy * (1.0 - e);
    
//    vec3 d1 = d0 - (i1 - 1.0 * K2);
//    vec3 d2 = d0 - (i2 - 2.0 * K2);
//    vec3 d3 = d0 - (1.0 - 3.0 * K2);
   
//    vec4 h = max(0.6 - vec4(dot(d0, d0), dot(d1, d1), dot(d2, d2), dot(d3, d3)), 0.0);
//    vec4 n = h * h * h * h * vec4(dot(d0, hash33(i)), dot(d1, hash33(i + i1)), dot(d2, hash33(i + i2)), dot(d3, hash33(i + 1.0)));
   
//    return dot(vec4(31.316), n);
// }

// float fBm3(in vec3 p)
// {
//    // p += vec2(sin(iTime * .7), cos(iTime * .45))*(.1) + iMouse.xy*.1/res.xy;
// 	float f = 0.0;
// 	// Change starting scale to any integer value...
// 	float scale = 5.0;
//    p = mod(p, scale);
// 	float amp   = 0.75;
	
// 	for (int i = 0; i < 5; i++)
// 	{
// 		f += simplexNoise(p * scale) * amp;
// 		amp *= 0.5;
// 		// Scale must be multiplied by an integer value...
// 		scale *= 2.0;
// 	}
// 	// Clamp it just in case....
// 	return min(f, 1.0);
// }

// // From: https://www.shadertoy.com/view/4dBcWy

// vec3 mod289(vec3 x) {
//   return x - floor(x * (1.0 / 289.0)) * 289.0;
// }

// vec4 mod289(vec4 x) {
//   return x - floor(x * (1.0 / 289.0)) * 289.0;
// }

// vec4 permute(vec4 x) {
//      return mod289(((x*34.0)+1.0)*x);
// }

// vec4 taylorInvSqrt(vec4 r)
// {
//   return 1.79284291400159 - 0.85373472095314 * r;
// }

// float snoise(vec3 v)
//   { 
//   const vec2  C = vec2(0.1666666666666667, 0.3333333333333333) ; // 1.0/6.0, 1.0/3.0
//   const vec4  D = vec4(0.0, 0.5, 1.0, 2.0);

// // First corner
//   vec3 i  = floor(v + dot(v, C.yyy) );
//   vec3 x0 =   v - i + dot(i, C.xxx) ;

// // Other corners
//   vec3 g = step(x0.yzx, x0.xyz);
//   vec3 l = 1.0 - g;
//   vec3 i1 = min( g.xyz, l.zxy );
//   vec3 i2 = max( g.xyz, l.zxy );

//   vec3 x1 = x0 - i1 + C.xxx;
//   vec3 x2 = x0 - i2 + C.yyy; // 2.0*C.x = 1/3 = C.y
//   vec3 x3 = x0 - D.yyy;      // -1.0+3.0*C.x = -0.5 = -D.y

// // Permutations
//   i = mod289(i); 
//   vec4 p = permute( permute( permute( 
//              i.z + vec4(0.0, i1.z, i2.z, 1.0 ))
//            + i.y + vec4(0.0, i1.y, i2.y, 1.0 )) 
//            + i.x + vec4(0.0, i1.x, i2.x, 1.0 ));

// // Gradients: 7x7 points over a square, mapped onto an octahedron.
// // The ring size 17*17 = 289 is close to a multiple of 49 (49*6 = 294)
//   float n_ = 0.142857142857; // 1.0/7.0
//   vec3  ns = n_ * D.wyz - D.xzx;

//   vec4 j = p - 49.0 * floor(p * ns.z * ns.z);  //  mod(p,7*7)

//   vec4 x_ = floor(j * ns.z);
//   vec4 y_ = floor(j - 7.0 * x_ );    // mod(j,N)

//   vec4 x = x_ *ns.x + ns.yyyy;
//   vec4 y = y_ *ns.x + ns.yyyy;
//   vec4 h = 1.0 - abs(x) - abs(y);

//   vec4 b0 = vec4( x.xy, y.xy );
//   vec4 b1 = vec4( x.zw, y.zw );

//   //vec4 s0 = vec4(lessThan(b0,0.0))*2.0 - 1.0;
//   //vec4 s1 = vec4(lessThan(b1,0.0))*2.0 - 1.0;
//   vec4 s0 = floor(b0)*2.0 + 1.0;
//   vec4 s1 = floor(b1)*2.0 + 1.0;
//   vec4 sh = -step(h, vec4(0.0));

//   vec4 a0 = b0.xzyw + s0.xzyw*sh.xxyy ;
//   vec4 a1 = b1.xzyw + s1.xzyw*sh.zzww ;

//   vec3 p0 = vec3(a0.xy,h.x);
//   vec3 p1 = vec3(a0.zw,h.y);
//   vec3 p2 = vec3(a1.xy,h.z);
//   vec3 p3 = vec3(a1.zw,h.w);

// //Normalise gradients
//   vec4 norm = taylorInvSqrt(vec4(dot(p0,p0), dot(p1,p1), dot(p2, p2), dot(p3,p3)));
//   p0 *= norm.x;
//   p1 *= norm.y;
//   p2 *= norm.z;
//   p3 *= norm.w;

// // Mix final noise value
//   vec4 m = max(0.6 - vec4(dot(x0,x0), dot(x1,x1), dot(x2,x2), dot(x3,x3)), 0.0);
//   m = m * m;
//   return 42.0 * dot( m*m, vec4( dot(p0,x0), dot(p1,x1), 
//                                 dot(p2,x2), dot(p3,x3) ) );
//   }

// // Original code ends here.


// float getnoise(int octaves, float persistence, float freq, vec3 coords) {

//     float amp= 1.; 
//     float maxamp = 0.;
//     float sum = 0.;

//     for (int i=0; i < octaves; ++i) {

//         sum += amp * snoise(coords*freq); 
//         freq *= 2.;
//         maxamp += amp;
//         amp *= persistence;
//     }
    
//     return (sum / maxamp) * .5 + .5;
// }

// #define ATAN5 1.37340076695
// vec3 blue_col = vec3(0.1,0.4,1);


// #define MOD3 vec3(.1031,.11369,.13787)

// float jumpstep(float low, float high, float val)
// {
//    // This part of the curve looks like a smoothstep going from 0
//    // to halfway up the curve
//    float f1 =  clamp(
//       atan(8.0 * (val-low) / (high-low) - 8.0) / (2.0 * ATAN5) + 0.5, 
//       0.0, 1.0
//    );
//    // This is a linear curve
//    float f2 = (8.0 * (val-low) / (high-low) - 8.0) / (2.0 * ATAN5) + 0.5;
//    return max(f1, f2);
// }


// void main()
// {
//    float iTime = v_Time;
//    // float iTime = 2.9;
//    vec2 res = u_Res;
//    vec2 wpos = vec2(v_Wpos.x, res.y-v_Wpos.y);
//    vec2 dim = v_Dim;                                       // Mesh Dimentions
//    vec2 frag = gl_FragCoord.xy; 
//    vec2 uv = (frag)/res;

//    iTime += 2.9;
//    float t = mod(iTime, t2);
//    t = t / t2; // Normalized time

//    vec4 col = vec4(0.0);
//    vec2 p = (uv - dim ) / min( dim.y, dim.x );
//    // p *= 100.;
   
//    float ay = 0.0, ax = 0.0, az = 0.0;

//    mat3 mY = mat3(
//          cos(ay), 0.0,  sin(ay),
//          0.0,     1.0,      0.0,
//       -sin(ay), 0.0,  cos(ay)
//    );

//    mat3 mX = mat3(
//       1.0,      0.0,     0.0,
//       0.0,  cos(ax), sin(ax),
//       0.0, -sin(ax), cos(ax)
//    );
//    mat3 m = mX * mY;

//    vec3 v = vec3(p, 1.0);
//    v = m * v;
//    float v_xy = length(v.xy);
//    float z = v.z / v_xy;

//    // The focal_depth controls how "deep" the tunnel looks. Lower values provide more depth.
//    float focal_depth = 0.15;
   

//    vec2 polar;
//    float p_len = length(v.xy);
//    // polar.y = focal_depth / p_len + iTime * speed;
//    float a = atan(v.y, v.x);
//    a = 0.5 + 0.5 * a / (1.0 * PI);
//    // float num_divisions = 1.;
//    // a = num_divisions * a / (PI * PI) +.5;
//    // a -= iTime * rotation_speed;
//    float x = fract(a);
//    // Remove the seam by reflecting the u coordinate around 0.5:
//    if (x >= 0.5) x = 1.0 - x;
//    polar.x = 1.-x;

//    // Colorize blue
//    float val = 0.45 + 0.55 * fBm3(vec3(vec2(2.0, 0.5) * polar, 0.15 * iTime));
//    // float val = getnoise(8, 0.65, 1.0, vec3(polar, 0));
//    val = clamp(val, 0.0, 1.0);
//    col.rgb = vec3(0.15, 0.4, 0.9) * vec3(val);

//    // Add white spots
//    vec3 white = 0.35 * vec3(smoothstep(0.55, 1.0, val));
//    col.rgb += white;
//    col.rgb = clamp(col.rgb, 0.0, 1.0);

//    float w_total = 0.0, w_out = 0.0;

//    // Add the white disk at the center
//    float disk_size = max(0.025, 1.5 * w_out);
//    disk_size = .0001;
//    // disk_size = .6;
//    float disk_col = exp(-(p_len - disk_size) * 4.0);
//    col.rgb += clamp(vec3(disk_col), 0.0, 1.0);

//    col.rgb = mix(col.rgb, vec3(1.0), w_total);
//    FragColor = vec4(col.rgb, 0.);
   
   
//    // for (int s = 0; s < 2; s++) {
//    //    vec2 u = (uv-dim+vec2(s%8,s/8)/8.)/res;
//    //    u*=.2;
//    //    u = floor((2.-vec2(atan(u.y,u.x),length(u)))*res);
//    //    float star_period = TWO_PI;
//    //    float star_speed =  .5;
//    //    float star_density = 80.;
//    //    vec4 chroma = vec4(1,1,1,0);

//    //    // FragColor += max(
//    //    //    1.-fract(chroma*.02+(u.y*.02+u.x*.4)*
//    //    //       fract(u.x*star_period)+iTime*star_speed)*star_density, 0.)/4.;
//    // }

//    float diameter = (1./res.x) * 50.;
//    // float diameter = (1./res.x) * abs(v_Dim.x);
//    // float diameter = 1./dim.x;
//    vec2 r =  vec2(min( res.y, res.x ));
   
//    FragColor = FragColor + vec4(vec3(max(3.5-iTime, 0.)),1.0);
//    // FragColor.a = 1.-((FragColor.r+FragColor.g+FragColor.b)/3.);
//    // FragColor.a = ((FragColor.r+FragColor.g+FragColor.b)/3.);

//    // float len = length((frag/res)-(wpos/res));
//    float len = length((frag/r)-(wpos/r));
//    float alpha = 1.-smoothstep(.0, diameter, len);
//    FragColor.rgb *= vec3(alpha);
//    // FragColor.a = alpha;
//    FragColor.a = 0.;
   
//    // FragColor.rgb *= 3.2;
//    // FragColor.rgb = vec3(.2);
// }

// `;



