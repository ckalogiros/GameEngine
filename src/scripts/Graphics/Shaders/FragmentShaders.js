"use strict";

import { FS_HIGH_TECH, TEMP } from "./ReadyShaders/HighTech.js";
import { FS_EXPLOSION_CIRCLE, FS_EXPLOSION_SIMPLE } from "./ReadyShaders/FsExplosions.js";
import { FS_V2DGFX } from "./ReadyShaders/2DVectorGFX.js";
import { FS_GLOW } from "./ReadyShaders/Glow.js";
import { FS_TWIST } from "./ReadyShaders/Twist.js";
import { FS_VOLUMETRIC_EXPLOSION } from "./ReadyShaders/VolExplosion.js";
import { FS_AWSOME } from "./ReadyShaders/AWESOME.js";
import { FS_VORTEX, FS_VORTEX2 } from "./ReadyShaders/VortexShader.js";
import { FS_SHADOW } from "./ReadyShaders/Shadow.js";

/**
 * This is a replace for the background of text rendering
 */
const FS_DEFAULT2 = `#version 300 es

#define MAX_NUM_PARAMS_BUFFER 5

precision highp float;
out vec4 FragColor;

in mediump vec4 v_col;
in mediump vec2 v_dim;
in mediump vec2 v_wpos;
in mediump vec3 v_style;
in mediump float v_params[MAX_NUM_PARAMS_BUFFER];                               // [0]:WinWidth, [1]:WinHeight, [3]:Time

vec4 pos = vec4(.5, .5, .0, .0);
vec3 _color = vec3(0.0);
float ScreenH;
float AA;


vec2 length2(vec4 a) {
    return vec2(length(a.xy),length(a.zw));
}
vec2 rounded_rectangle(vec2 s, float r, float bw) {
    s -= bw +.0002; // Subtract the border
    // s -= .01; // TEMP: Subtract the shadow
    r = min(r, min(s.x, s.y));
    s -= r; // Subtract the border-radius
    vec4 d = abs(pos) - s.xyxy;
    vec4 dmin = min(d,0.0);
    vec4 dmax = max(d,0.0);
    vec2 df = max(dmin.xz, dmin.yw) + length2(dmax);
    return (df - r);
}

////////////////////////////////////////////////////////////////////////////////////////////////////////////



////////////////////////////////////////////////////////////////////////////////////////////////////////////

void main(void) 
{
    float t = v_params[2];
    float uRadius = v_style.x * .008;                    // Radius(From 0.01 to 0.35 good values) for rounding corners
    float borderWidth = v_style.y * 0.001;                  // Border Width. It is 0.001 for every pixel
    float feather = v_style.z;         // Border Feather Distance

    vec2 res = vec2(v_params[0], v_params[1]);
    float clarity = 10.4; // From 0.3 to 1.2 good values 
    // float clarity = 1.; // From 0.3 to 1.2 good values 
	ScreenH = min(res.x, res.y)*clarity;
	AA = ScreenH*0.5;
    
    res.x /= res.x/res.y;                                   // Transform from screen resolution to mesh resolution
    vec2 uv = gl_FragCoord.xy/res;                          // Transform to 0.0-1.0 coord space
    uv -= vec2(v_wpos.x/res.x, 1.-(v_wpos.y/res.y));        // Transform to meshes local coord space 
    vec2 dim = vec2(v_dim.x/res.x, v_dim.y/res.y);

    pos.xy = uv;

    vec2 blur = vec2(0.0, feather * .001);
    vec3 fcol = vec3(0.0);
    
    vec2 d = rounded_rectangle(dim, mix(0.0, .2, uRadius), 0.);
    vec4 col1 = vec4(0.0, 0.4, 1., 1.);
    vec4 col2 = vec4(0.9, .0, 0.0, 1.);


    //////////////////////////////////////////////////////////////////////////////////////////////////////////


    // Calculate Gradient
    float dist = length(vec2(d.x, 0.1));
    vec2 p0 = vec2(-dist, 0.0);
    vec2 p1 = vec2(dist, 0.0);
    vec2 pa = pos.xy - p0;
    vec2 ba = p1 - p0;
    
    vec4 src = v_col;
    
    // Calculate alpha (for rounding corners)
    float blend = 1.;
    float dd = d.x - blur.x;
    float wa = clamp(-dd * AA, 0.0, 1.);
    float wb = clamp(-dd / (blur.x+blur.y), 0.0, 1.);
    // float alpha = min(src.a * (wa * wb), blend);
    float alpha = src.a * (wa * wb);
    fcol += fcol * (1.0 - alpha) + src.rgb * alpha;
    

    // BORDER
    float bd = (abs(d.x)-borderWidth) - blur.x;
    wa = clamp(-bd * AA, 0.0, 1.0);
    wb = clamp(-bd / (blur.x+blur.y), 0.0, 1.0);
    fcol += fcol*vec3(abs(wa * wb)-borderWidth);

    // Bevel
    float r = min(uRadius*.17, min(dim.x, dim.y));
    float f = smoothstep(r, .0, abs(d.x));
    fcol = mix(fcol, pow(fcol, vec3(2.))*.85, f);


    FragColor = vec4(fcol.rgb, alpha);
    // FragColor = vec4(1.);
}
`;

// const FS_DEFAULT2 = `#version 300 es

// #define MAX_NUM_PARAMS_BUFFER 5

// precision highp float;
// out vec4 FragColor;

// in mediump vec4  v_pos;
// in mediump vec2  v_wpos;
// in mediump float v_time;
// in mediump vec2  v_dim;
// in mediump vec2  v_res;
// in mediump float v_params[MAX_NUM_PARAMS_BUFFER]; 


// #define STEPS 250.0
// #define MDIST 100.0
// #define pi 3.1415926535
// #define rot(a) mat2(cos(a), sin(a), -sin(a), cos(a))
// // #define rot(a) mat2(sin(a), cos(a), -cos(a), sin(a))
// #define sat(a) clamp(a, 0.0, 1.0)

// // #define WOBBLE 
// #define AA 30.0
// #define h13(n) fract((n)*vec3(12.9898,78.233,45.6114)*43758.5453123)


// vec2 vor(vec2 v, vec3 p, vec3 s){
//     p = abs(fract(p-s) - 0.5);
//     float a = max(p.x, max(p.y, p.z));
//     float b = min(v.x, a);
//     float c = max(v.x, min(v.y,a));
//     return vec2(b, c);
// }

// float vorMap(vec3 p){
//     vec2 v = vec2(5.0);
//     v = vor(v,p,h13(0.96));
//     p.xy*=rot(1.2);
//     v = vor(v,p,h13(0.55));
//     p.yz*=rot(2.);
//     v = vor(v,p,h13(0.718));
//     p.zx*=rot(2.7);
//     v = vor(v,p,h13(0.3));
//     return v.y-v.x; 
// }

// //box sdf
// float box(vec3 p, vec3 b){
//   vec3 q = abs(p)-b;
//   return length(max(q,0.0))+min(max(q.x,max(q.y,q.z)),0.0);
// }


// float va = 0.; //voronoi animations
// float sa = 0.; //size change animation
// float rlg; //global ray length
// bool hitonce = false; //for tracking complications with the voronoi 



// vec2 map(vec3 p, vec3 n, float iTime)
// {
//     vec2 a = vec2(1);
//     vec2 b = vec2(2);
//     vec3 po = p;
//     vec3 no = n;
//     p-=n;
//     float len = 9.5;
//     len += sa;
//     float len2 = len-1.0;
//     p.x-=(len/2.0);
//     a.x = box(p, vec3(1, 1, len));
//     // float len2 = 1.0;
//     // a.x = box(p, vec3(1, 1, 1));
//     a.x = min(a.x,box(p-vec3(0, len2, len2),vec3(1, len, 1)));
//     a.x = min(a.x,box(p-vec3(-len2, 0, -len2),vec3(len, 1, 1)));
//     float tip = box(p-vec3(len2, len2*2.0, len2),vec3(len2, 1, 1));   
//     float cut = (p.xz*=rot(pi/4.0-0.15)).y;
//     tip = max(-cut+len2/2.0,tip);
//     a.x = min(a.x,tip);
//     b.x = tip;
//     a.x-=0.4;
//     p = po;
//     p.xz*=rot(pi/4.0);
//     p.xy*=rot(-0.9553155);
//     po = p;
//     n.xz*=rot(pi/4.0);
//     n.xy*=rot(-0.9553155);
//     p.xz-=n.xy;
//     p.xz*=rot(-iTime*0.3);

//     float breakPartsSize = 0.3; // Smaller val the bigger the size of break parts
//     float breakPartsDist = 0.4; // Smaller val the greter the distance parts take
//     if(hitonce)
//         a.x = max(a.x, -vorMap(vec3(p.x, p.z, rlg + n.z) * breakPartsSize + 3.) + va * breakPartsDist);
//     p = po;
//     b.y = 3.0;
//     p-=n;
//     p.xz*=rot(pi/6.0);
//     p.x+=1.75;
//     p.z+=0.4;
//     po = p;
//     // Blocks
//     // for(float i = 0.; i<3.; i++){ //blocks
//     //     b.y+=i;
//     //     p.xz*=rot((2.0*pi/3.0)*i);
//     //     float t = (iTime+i*((2.0*pi)/9.0))*3.;
//     //     p.y-=35.-50.*step(sin(t),0.);
//     //     p.x+=4.5;
//     //     p.xy*=rot(t);
//     //     p.x-=4.5;
//     //     p.xz*=rot(t);
//     //     b.x = box(p,vec3(1.5,.5,.5))-0.25;
//     //     a = (a.x<b.x)?a:b;
//     //     p = po;
//     // }
//     return a;
// }
// vec3 norm(vec3 p, float iTime)
// {
//     vec2 e= vec2(0.0001,0);
//     return normalize(map(p, vec3(0), iTime).x-vec3(
//     map(p, e.xyy, iTime).x,
//     map(p, e.yxy, iTime).x,
//     map(p, e.yyx, iTime).x));
// }

// vec4 render(vec2 fragCoord, float iTime)
// {
//     vec2 res = vec2(v_params[0], v_params[1]);
//     vec2 uv = ((fragCoord-0.5*res.xy)/res.y) * 2.2;
//     vec3 col = vec3(0);
//     uv.x-=0.025;
//     vec2 uv2 = uv;
//     vec2 uv3 = uv;
    
//     //Calculating the animation for the size wobble and voronoi crumble
//     uv2.y-=0.1;
//     uv2*=rot(iTime*0.1);
//     float ang = atan(uv2.x,uv2.y)/(pi*2.)+0.5;
//     float range = 0.175;
//     #ifdef WOBBLE
//         sa = sin(ang*pi*2.+iTime*2.5)*0.3;
//     #endif
//     ang = smoothstep(0.0,range,ang)*smoothstep(0.0,range,1.0-ang);
//     //va = (1.0-ang)*0.175;
//     va = (1.0-ang);
//     uv*=rot(-pi/6.0);
    
//     vec3 ro = vec3(5,5,5)*6.5;
    
//     //Orthographic target camera
//     vec3 lk = vec3(0,0,0);
//     vec3 f = normalize(lk-ro);
//     vec3 r = normalize(cross(vec3(0,1,0),f));
//     vec3 rd = f+uv.x*r+uv.y*cross(f,r);
//     ro+=(rd-f)*17.0;
//     rd=f;

//     vec3 p = ro;
//     float rl = 0.;
//     vec2 d= vec2(0);
//     float shad = 0.;
//     float rlh = 0.;
//     float i2 = 0.; 
    
//     for(float i = 0.; i<STEPS; i++)
//     {   //Spaghetified raymarcher 
//         p = ro + (rd * rl);
//         d = map(p, vec3(0), iTime);
//         rl+=d.x;
//         if(d.x<0.0001)
//         {
//             shad = (i2/STEPS);
//             if(hitonce) break;
//             hitonce = true;
//             rlh = rl;
//         }
//         if(rl>MDIST||(!hitonce && i > STEPS-2.))
//         {
//             d.y = 0.;
//             break;
//         }
//         rlg = rl-rlh;
//         if(hitonce&&rlg>3.0){hitonce = false; i2 = 0.;}  
//         if(hitonce)i2++;
//     }
//     if(d.y>0.0) 
//     {   //Color Surface
//         vec3 n = norm(p, iTime);
//         vec3 r = reflect(rd,n);
//         vec3 ld = normalize(vec3(0,1,0));
//         float spec = pow(max(0. ,dot(r,ld)), 13.0);

//         //Color the triangle
//         vec3 n2 = n*0.65+0.35;
//         col += mix(vec3(1,0,0),vec3(0,1,0),sat(uv3.y*1.1))*n2.r;
//         uv3*=rot(-(2.0*pi)/3.0);
//         col += mix(vec3(0,1.0,0),vec3(0,0,1),sat(uv3.y*1.1))*n2.g;
//         uv3*=rot(-(2.0*pi)/3.0);
//         col += mix(vec3(0,0,1),vec3(1,0,0),sat(uv3.y*1.1))*n2.b;
        

        
//         //NuSan SSS
//         // float sss=.5;
//         // float sssteps = 10.;
//         // for(float i=1.; i<sssteps; ++i){
//         //     float dist = i*0.2;
//         //     sss += smoothstep(0., 1., map(p+ld*dist,vec3(0), iTime).x/dist)/(sssteps*1.5);
//         // }
//         // sss = clamp(sss,0.0,1.0);
        
//         //blackle AO
//         #define AO(a,n,p) smoothstep(-a,a, map(p,-n*a, iTime).x)
//         float ao = AO(1.9, n, p) * AO(3., n, p) * AO(7., n, p);
        
//         //Apply AO on the triangle
//         if(rlg<0.001){
//             col*=mix(ao,1.0,0.2);
//         }
//         //Color the inside of the crumbled bits 
//         else {
//             col = vec3(0.2-shad);
//         }
//         // //Color the moving blocks
//         // if(d.y>1.0){
//         //     col = (n*0.6+0.4)*vec3(sss)+spec;
//         // }
//         //a bit of gamma correction
//         col = pow(col,vec3(0.7));
//     }
//     // else{ //Color Background
//     //     vec3 bg = mix(vec3(0.345, 0.780, 0.988), vec3(0.361, 0.020, 0.839), length(uv));
//     //     col = bg;
//     // }
//     vec3 bg = mix(vec3(0.345, 0.780, 0.988), vec3(0.361, 0.020, 0.839), length(uv));
//     col = bg;

//     return vec4(col, 1.0);  
// }



// void main()
// {
//     // float iTime = v_params[2];
//     // float iTime = v_time;
//     float iTime = 1.2;
//     // vec2 uv = gl_FragCoord.xy;
//     vec2 uv = v_res;
//     // vec2 uv = v_dim;
//     float px = 1./AA, i, j; 
//     vec4 cl2, cl;

//     if(AA == 1.)
//     {
//         cl = render(uv, iTime);
//         FragColor = cl;
//         return;
//     }
    
//     for(i=0.; i<AA + min(iTime, 0.0); i++)
//     {
//         for(j=0.; j<AA; j++)
//         {
//             vec2 uv2 = vec2(uv.x+px*i, uv.y+px*j);
//             cl2 = render(uv2, iTime);
//             cl += cl2;
//             rlg = 0.; 
//             hitonce = false;
//         }
//     }
    
//     cl /= AA*AA;
//     FragColor = cl;
// }
// `;


const FS_DEFAULT3 = `#version 300 es

#define MAX_NUM_PARAMS_BUFFER 5

precision highp float;
out vec4 FragColor;


in mediump vec4 v_col;
in mediump vec2 v_dim;
in mediump vec2 v_wpos;
in mediump vec3 v_style;
in mediump vec2 v_res;
// in mediump float v_params[MAX_NUM_PARAMS_BUFFER]; 

float sdRoundBox( in vec2 p, in vec2 b, in vec4 r ) 
{
    r.xy = (p.x>0.0)?r.xy : r.zw;
    r.x  = (p.y>0.0)?r.x  : r.y;
    vec2 q = abs(p)-b+r.x;
    return min(max(q.x,q.y),0.0) + length(max(q,0.0)) - r.x;
}

void main( )
{
    
    vec2 ratio = v_dim/v_res;
    vec2 res = v_res;
    // res.x /= res.x/res.y;                                   // Transform from screen resolution to mesh resolution
    vec2 uv = gl_FragCoord.xy/res;                          // Transform to 0.0-1.0 coord space
    uv -= vec2(v_wpos.x/res.x, 1.-(v_wpos.y/res.y));        // Transform to meshes local coord space 
    vec2 dim = vec2(v_dim.x/res.x, v_dim.y/res.y);

    vec2 p = uv;
    // p.x/=ratio.x;
    // p.x/=ratio.x;
    // p/=p.y;

    // FragColor = vec4(p.x, p.y, 0., 1.);
    // return;

    vec2 si = vec2(0.3,0.05);
    vec4 ra = vec4(0.1,0.1,0.1,0.1);
    ra = min(ra,min(si.x,si.y));

    float d = sdRoundBox( p, si, ra );

    vec3 col = vec3(0.1,0.1,.1);
    // col *= (d>0.0) ? vec3(0.1,0.9,0.3) : vec3(0.1,0.85,1.0);
    // col *= 1.0 - exp(-6.0*abs(d));
    //col *= 0.4 + 0.6*cos(1.-smoothstep(0.0,0.9, 140.0*d));
    // col *= cos(2.0*smoothstep(.0,.2, abs(.9*d)));
    col = mix( col, vec3(1.0), 1.0-smoothstep(0.0,0.006,abs(d)) );


    FragColor = vec4(col,1.0);
}

`;

const FS_DEFAULT = `#version 300 es
#define MAX_NUM_PARAMS_BUFFER 5
#define YELLOW  vec3(.612, .555, 0.04)
#define BLUE    vec3(0.05, 0.99, 0.12)
#define BLACK   vec3(.0, .0, .0)
#define WHITE   vec3(1.0, 1.0, 1.0)
#define blue vec3(0.345, 0.780, 0.988)
#define BLUE_PURPLE vec3(0.361, 0.020, 0.839)
#define mix1Yellow vec3((1./255.)*219., (1./255.)*240., (1./255.)*57.)
#define mix1Green vec3((1./255.)*14.,(1./255.)*207., (1./255.)*55.)
#define mix2Red vec3((1./255.)*220., (1./255.)*58., (1./255.)*17.)
#define mix2Orange vec3((1./255.)*220.,(1./255.)*190., (1./255.)*40.)

precision highp float;
out vec4 FragColor;


in mediump vec4 v_col;
in mediump vec2 v_dim;
in mediump vec2 v_wpos;
in mediump float v_time;
in mediump vec3 v_style;
in mediump float v_params[MAX_NUM_PARAMS_BUFFER];                               // [0]:WinWidth, [1]:WinHeight, [3]:Time



void main(void) 
{
    mediump float uRadius       = v_style.x;                // Radius(in pixels) for rounding corners
    mediump float borderWidth   = v_style.y;                // Border Width
    mediump float featherWidth  = v_style.z;                // Border Feather Distance

    float ypos   = v_params[1] - v_wpos.y;                  // Transform y coord from top=0 to top=windowHeight
    float left   = v_wpos.x - v_dim.x ;          // Left side of current geometry
    float right  = v_wpos.x + v_dim.x;
    float top    = ypos + v_dim.y;
    float bottom = ypos - v_dim.y;

    
    vec2 res = vec2(v_params[0], v_params[1]);              // Screen resolution
    res.x /= res.x/res.y;                                   // Transform from screen resolution to mesh resolution
    vec2 uv = gl_FragCoord.xy/res;                          // Transform to 0.0-1.0 coord space
    uv -= vec2(v_wpos.x/res.x, 1.-(v_wpos.y/res.y));        // Transform to meshes local coord space 



    float decr = .5;
    vec3 bg = mix(v_col.rgb, v_col.rgb*decr, length(uv));
    FragColor = vec4(bg, v_col.a);
    FragColor.rgb *= FragColor.a;                           // Premultiply alpha

    vec4 borderColor = vec4(bg, 1.);
    if(borderWidth > 0.0)
        borderColor *= 1.2;    // Just a bit lighter color from v_col
        // borderColor += vec4(0.233, 0.233, 0.233, 0.233);    // Just a bit lighter color from v_col

    float pixelXpos = gl_FragCoord.x;
    float pixelYpos = gl_FragCoord.y;
    float pixelDist = 0.0;

    
    /* * * * * * * * * * * * * * * * * * * * * * * BORDER */

    // LEFT BORDER
    if(v_col.a > 0.0)
    if(pixelXpos < left+borderWidth+featherWidth )
    {
        FragColor = borderColor;
        
        if(pixelXpos < left+featherWidth
            && pixelYpos < top-borderWidth && pixelYpos > bottom+borderWidth) 
        {
            // float alpha = (1.0/featherWidth) * (pixelXpos-left); 
            pixelDist = length(pixelXpos - left);
            float alpha = (1.0/featherWidth) * (pixelDist); 
            FragColor *= alpha;
            FragColor.a = alpha;
        }
    }
    // RIGHT BORDER 
    else if(pixelXpos > right-borderWidth-featherWidth )
    {
        FragColor = borderColor;
            
        if(pixelXpos > right-featherWidth
            && pixelYpos < top-borderWidth && pixelYpos > bottom+borderWidth) 
        {
            pixelDist = length(right - pixelXpos);
            float alpha = (1.0/featherWidth) * (pixelDist); 
            FragColor *= alpha;
            FragColor.a = alpha;
        }
    }

    if(v_col.a > 0.0)
    // TOP BORDER
    if(pixelYpos > top-borderWidth-featherWidth) 
        // && pixelXpos > left+borderWidth && pixelXpos < right-borderWidth) 
    {
        if(pixelXpos > left+borderWidth+featherWidth && pixelXpos < right-borderWidth-featherWidth)
            FragColor = borderColor;
            
        if(pixelYpos > top-featherWidth
            && pixelXpos > left+borderWidth && pixelXpos < right-borderWidth) 
        {
            // float alpha = (1.0/featherWidth) * (top - pixelYpos); 
            pixelDist = length(top - pixelYpos);
            float alpha = (1.0/featherWidth) * (pixelDist); 
            FragColor.rgb *= alpha;
            FragColor.a = alpha;
        }
    }
    // BOTTOM BORDER
    else if(pixelYpos < bottom+borderWidth+featherWidth
        && pixelXpos > left+borderWidth && pixelXpos < right-borderWidth) 
    {
        if(pixelXpos > left+borderWidth+featherWidth && pixelXpos < right-borderWidth-featherWidth)
            FragColor = borderColor;
        
        if(pixelYpos < bottom+featherWidth)
        {
            // float alpha = (1.0/featherWidth) * (pixelYpos-bottom); 
            pixelDist = length(pixelYpos - bottom);
            float alpha = (1.0/featherWidth) * (pixelDist); 
            FragColor.rgb *= alpha;
            FragColor.a = alpha;
        }
    }
    
    /* * * * * * * * * * * * * * * * * * * * * * * END OF BORDER */
    
    /* * * * * * * * * * * * * * * * * * * * * * * FEATHER */

    float check = 0.0;
    vec2 pixelXYpos = gl_FragCoord.xy;
    // // Create Round Corners (for LEFT-UP corner)
    if(v_col.a > 0.0)
    if(pixelXpos < v_wpos.x && pixelYpos > ypos && pixelXpos < left+uRadius+featherWidth && pixelYpos > top-uRadius-featherWidth) 
    {
        pixelDist = length(pixelXYpos - vec2(left+uRadius+featherWidth, top-uRadius-featherWidth));        // Calc the distance of curr pixel pos to the meshe's corner pos
        if(pixelDist > uRadius)                                                                            // Set feathered outer border side
        {
            float alpha = 1.- (1.0/featherWidth) * (pixelDist-uRadius); 
            FragColor = borderColor;
            FragColor.rgb *= alpha;
            FragColor.a = alpha;
        }
        else if(pixelDist > uRadius-borderWidth) // -borderWidth to have round inner corner
            FragColor = borderColor;
    }
    // Create Round Corners (for RIGTH-UP corner)
    else if( pixelXpos > v_wpos.x && pixelYpos > ypos && pixelXpos > right-uRadius-featherWidth && pixelYpos > top-uRadius-featherWidth) 
    {
        pixelDist = length(pixelXYpos - vec2(right-uRadius-featherWidth, top-uRadius-featherWidth));        // Calc the distance of curr pixel pos to the meshe's corner pos
        if(pixelDist > uRadius)                                                                             // Set feathered outer border side
        {
            float alpha = 1.0-(1.0/featherWidth) * (pixelDist-uRadius); 
            FragColor = borderColor;
            FragColor.rgb *= alpha;
            FragColor.a = alpha;
        }
        else if(pixelDist > uRadius-borderWidth) // -borderWidth to have round inner corner
            FragColor = borderColor;

    }
    // Create Round Corners (for RIGHT-DOWN corner)
    else if(pixelXpos > v_wpos.x && pixelYpos < ypos && pixelXpos > right-uRadius-featherWidth && pixelYpos < bottom+uRadius+featherWidth) 
    {
        pixelDist = length(pixelXYpos - vec2(right-uRadius-featherWidth, bottom+uRadius+featherWidth));         // Calc the distance of curr pixel pos to the meshe's corner pos
        if(pixelDist > uRadius)                                                                                 // Set feathered outer border side
        {
            float alpha = 1.0-(1.0/featherWidth) * (pixelDist-uRadius); 
            FragColor = borderColor;
            FragColor.rgb *= alpha;
            FragColor.a = alpha;
        }
        else if(pixelDist > uRadius-borderWidth) // -borderWidth to have round inner corner
            FragColor = borderColor;
    }
    // Create Round Corners (for LEFT-DOWN corner)
    else if(pixelXpos < v_wpos.x && pixelYpos < ypos && pixelXpos < left+uRadius+featherWidth && pixelYpos < bottom+uRadius+featherWidth) 
    {
        pixelDist = length(pixelXYpos - vec2(left+uRadius+featherWidth, bottom+uRadius+featherWidth));          // Calc the distance of curr pixel pos to the meshe's corner pos
        if(pixelDist > uRadius)                                                                                 // Set feathered outer border side
        {
            float alpha = 1.0-(1.0/featherWidth) * (pixelDist-uRadius); 
            FragColor = borderColor;
            FragColor.rgb *= alpha;
            FragColor.a = alpha;
        }
        else if(pixelDist > uRadius-borderWidth) // -borderWidth to have round inner corner
        FragColor = borderColor;
    }
    /* * * * * * * * * * * * * * * * * * * * * * * END OF FEATHER */
    
    // FragColor = vec4(1.);

}
`;

const FS_GRADIENT = `#version 300 es

#define MAX_NUM_PARAMS_BUFFER 5

precision mediump float;

in mediump vec4  v_col;
in mediump vec2  v_wpos;
in mediump vec2  v_dim;
in mediump float v_params[MAX_NUM_PARAMS_BUFFER];   

out vec4 FragColor;

void main()
{
    float t = v_params[2]*.1;
    
    vec2 dim = v_dim;                                       // Mesh Dimentions
    dim /= (min(dim.x, dim.y) / max(dim.x, dim.y))*1.5;     // Mesh Dimentions
    vec2 uv = (gl_FragCoord.xy)/dim;                        // Transform to 0.0-1.0 coord space
    uv -= v_wpos/dim;                                       // Transform to meshes local coord space 
    // uv*=sin(t*.5)-1.4;

    vec3 col = mix(vec3(0.345, 0.780, 0.988), vec3(0.361, 0.020, 0.839), length(uv));
    FragColor = vec4(col, 1.);
    // FragColor = vec4(vec3(.0), 1.0);
}`;

const FS_DEFAULT_TEXTURE_SDF = `#version 300 es
    
precision highp float;

in highp vec4 v_col;
in highp vec2 v_tex_coord;
in highp vec2 v_sdf;       // [0]:SdfInner, [1]:SdfOuter

uniform sampler2D u_Sampler0;

out vec4 FragColor;

void main(void) {
    
    float inner = v_sdf.x;
    float outer = v_sdf.y;
        
    float b = max(texture(u_Sampler0, v_tex_coord).r, max(texture(u_Sampler0, v_tex_coord).g, texture(u_Sampler0, v_tex_coord).b));
    float pixelDist = 1. - b;
    float alpha = 1. - smoothstep(inner, inner + outer, pixelDist);
    FragColor = v_col * vec4(alpha);
    // FragColor = vec4(1);

}
`;

const FS_DEFAULT_TEXTURE = `#version 300 es

precision mediump float;

in mediump vec4 v_col;
in mediump vec2 v_tex_coord;

uniform sampler2D u_Sampler0;
out vec4 FragColor;

void main(void) {

    vec4 col = texture( u_Sampler0, v_tex_coord) * v_col;
    FragColor = col * texture(u_Sampler0, v_tex_coord).a;
    // if(texture(u_Sampler0, v_tex_coord).x < 0.004)
    // FragColor = vec4(1.);
    // FragColor.rgb *= alpha;
}
`;

const FS_NOISE = `#version 300 es
    
#define BLACK vec4(.0,.0,.0,1.)
#define MAX_NUM_PARAMS_BUFFER 2
#define MAX_SPEED 20.
precision highp float;

// procedural FS_NOISE from IQ
vec2 hash(vec2 p)
{
    p = vec2( dot(p,vec2(127.1,311.7)), dot(p,vec2(269.5,183.3)) );
    return -1.0 + 2.0*fract(sin(p)*43758.5453123);
}

float FS_NOISE(in vec2 p)
{
    const float K1 = 0.366025404; // (sqrt(3)-1)/2;
    const float K2 = 0.211324861; // (3-sqrt(3))/6;
    
    vec2 i = floor( p + (p.x+p.y)*K1 );
    vec2 a = p - i + (i.x+i.y)*K2;
    vec2 o = (a.x>a.y) ? vec2(1.0,0.0) : vec2(0.0,1.0);
    vec2 b = a - o + K2;
    vec2 c = a - 1.0 + 2.0*K2;
    
    vec3 h = max( 0.5-vec3(dot(a,a), dot(b,b), dot(c,c) ), 0.0 );
    
    vec3 n = h*h*h*h*h*vec3( dot(a,hash(i+0.0)), dot(b,hash(i+o)), dot(c,hash(i+1.0)));
    return dot( n, vec3(100.0) );
}

float fbm(vec2 uv)
{
    float f; float n = 1.4; float a = 0.1;
    mat2 m = mat2( n, -n, n,  n );
    f  = 0.5000 * FS_NOISE(uv); 
    uv = m*uv; f += 0.2500 * FS_NOISE(uv); 
    uv = m*uv; f += 0.1250 * FS_NOISE(uv); 
    uv = m*uv; f += 0.0625 * FS_NOISE(uv); 
    uv = m*uv; f = 0.55 + 0.5*f; 
    return f;
}

float sdUnevenCapsule( vec2 p, float r1, float r2, float h )
{
    p.x = abs(p.x);
    float b = (r1-r2)/h;
    float a = sqrt(1.0-b*b);
    float k = dot(p,vec2(-b,a));
    if( k < 0.0 ) return length(p) - r1;
    if( k > a*h ) return length(p-vec2(0.0,h)) - r2; 
    return dot(p, vec2(a,b) ) - r1;
}

in mediump vec4  v_col;
in mediump vec2  v_wpos;
in mediump float v_time;
in mediump vec2  v_dim;
in mediump vec2 v_res;

out vec4 FragColor;

void main(void)
{
    vec2 res = v_res;
    float time  = v_time;
    float speed = 10.;
    vec2 dim = v_dim/res;
    float ratio = res.x/res.y;
    res.x /= ratio;
    vec2 uv  = vec2(gl_FragCoord.x / res.x, gl_FragCoord.y / (res.y));
    vec2 pos = vec2(v_wpos.x/res.x, 1.-(v_wpos.y/res.y)); 

	vec2 q = uv-pos;
    q.y*=-1.;
    q.y += dim.y/2.;
    q/=dim*2.;
	// float strength = floor(q.x+2.);
	float strength = 1.;
	// float T3 = max(3., 1.25*strength)*time*3.;
	float T3 = max(3., strength)*time*1.;
	float n = fbm(strength*q - vec2(0, T3));
	// float c = 1. - 16. * pow( max( 0., length(q) - n * max( 0., q.y+.25 )), 1.2 );
	// float c = 1. - 16. * pow( max( 0., length(q*vec2(1.15+q.y, .95)) - n * max( 0., q.y+.25 )), 1.2 );
	float c = 1. - 16. * pow( max( 0., length(q*vec2(1., .95)) - n * max( 0., q.y+.25 )), 1.2 );
    float c1 = n * c * (1.5-pow(2.50*uv.y,4.));
	c1 = clamp(c, 0., 1.);
    
	vec3 col = vec3(1.5*c1, 1.5*c1*c1*c1, c1*c1*c1*c1*c1*c1);
    col = col.zyx;
	
	float a = c * (1.-pow(uv.y,3.));
	FragColor = vec4( mix(vec3(0.),col,a), .0);
}
`;
// const FS_NOISE = `#version 300 es
    
// #define BLACK vec4(.0,.0,.0,1.)
// #define MAX_NUM_PARAMS_BUFFER 2
// #define MAX_SPEED 20.
// precision highp float;

// // procedural FS_NOISE from IQ
// vec2 hash(vec2 p)
// {
//     p = vec2( dot(p,vec2(127.1,311.7)), dot(p,vec2(269.5,183.3)) );
//     return -1.0 + 2.0*fract(sin(p)*43758.5453123);
// }

// float FS_NOISE(in vec2 p)
// {
//     const float K1 = 0.366025404; // (sqrt(3)-1)/2;
//     const float K2 = 0.211324861; // (3-sqrt(3))/6;
    
//     vec2 i = floor( p + (p.x+p.y)*K1 );
//     vec2 a = p - i + (i.x+i.y)*K2;
//     vec2 o = (a.x>a.y) ? vec2(1.0,0.0) : vec2(0.0,1.0);
//     vec2 b = a - o + K2;
//     vec2 c = a - 1.0 + 2.0*K2;
    
//     vec3 h = max( 0.5-vec3(dot(a,a), dot(b,b), dot(c,c) ), 0.0 );
    
//     vec3 n = h*h*h*h*h*vec3( dot(a,hash(i+0.0)), dot(b,hash(i+o)), dot(c,hash(i+1.0)));
//     return dot( n, vec3(100.0) );
// }

// float fbm(vec2 uv)
// {
//     float f; float n = 1.4; float a = 0.1;
//     mat2 m = mat2( n, -n, n,  n );
//     f  = 0.5000 * FS_NOISE(uv); uv = m*uv; f += 0.2500 * FS_NOISE(uv); uv = m*uv; f += 0.1250 * FS_NOISE(uv); uv = m*uv; f += 0.0625 * FS_NOISE(uv); uv = m*uv; f = 0.55 + 0.5*f; 
//     return f;
// }

// in mediump vec4  v_pos;
// in mediump vec2  v_wpos;
// in mediump float v_time;
// in mediump vec2  v_dim;
// in mediump vec2 v_res;

// out vec4 FragColor;

// void main(void)
// {
//     // float time  = fract(v_time);
//     float time  = (sin(v_time)*.5+.3);
//     // float time  = .6;
//     float revT  = 1.-time; // Reverse time to be from 1 to 0
//     vec2 res = v_res;
//     float speed = 10.;
//     vec2 dim = v_dim/res;
//     float ratio = res.x/res.y;
//     res.x /= ratio;
//     vec2 uv  = vec2(gl_FragCoord.x / res.x, gl_FragCoord.y / (res.y));
//     vec2 pos = vec2(v_wpos.x/res.x, 1.-(v_wpos.y/res.y)); 
    
//     float d  = 1.- smoothstep(.0, .2, length(uv-pos));
//     // float d  = 1.- smoothstep(6.*dim.x*revT, 9.3*dim.x*revT, (length(uv-pos)*10.));
//     float complexity = 10.2;
//     float FS_NOISE = fbm(complexity * uv * vec2(4.5, 4.5));
//     float shape = fbm(complexity * uv * d);
    
//     // d *= min(1.0, speed*.5);
//     // d *= min(1.0, .5);

//     if(speed*.5>1.4 && complexity < 1.6) complexity *= speed;
//     d *= revT*(MAX_SPEED-speed)*.2;
//     complexity *= length(uv-pos)*10.; 

//     float c1 = FS_NOISE*d+1.;
//     vec3 col = v_pos.rgb*c1*c1*c1;
//     // vec3 col = v_pos.rgb;
//     // vec3 col = vec3(c1*c1*c1);
//     // col *= pow(shape, 1.); // Longer tail = smaller float
    
//     // float r = .3;
//     // FragColor = vec4(col*d*revT , d*1.-c1);    
//     FragColor = vec4(col*d , d*1.-c1);    
//     // FragColor = vec4(1.);    
//     // if(time > 0.1) FragColor = vec4(1.);    
// }
// `;

const FS_PARTICLES = `#version 300 es

#define BLACK vec4(.0,.0,.0,1.)
#define MAX_NUM_PARAMS_BUFFER 3
#define MAX_SPEED 20.
precision highp float;
precision highp int;

// procedural FS_NOISE from IQ
vec2 hash(vec2 p)
{
    p = vec2( dot(p,vec2(127.1,311.7)), dot(p,vec2(269.5,183.3)) );
    return -1.0 + 2.0*fract(sin(p)*43758.5453123);
}

float FS_NOISE(in vec2 p)
{
    const float K1 = 0.366025404; // (sqrt(3)-1)/2;
    const float K2 = 0.211324861; // (3-sqrt(3))/6;
    
    vec2 i = floor( p + (p.x+p.y)*K1 );
    vec2 a = p - i + (i.x+i.y)*K2;
    vec2 o = (a.x>a.y) ? vec2(1.0,0.0) : vec2(0.0,1.0);
    vec2 b = a - o + K2;
    vec2 c = a - 1.0 + 2.0*K2;
    
    vec3 h = max( 0.5-vec3(dot(a,a), dot(b,b), dot(c,c) ), 0.0 );
    
    vec3 n = h*h*h*h*h*vec3( dot(a,hash(i+0.0)), dot(b,hash(i+o)), dot(c,hash(i+1.0)));
    return dot( n, vec3(100.0) );
}

float fbm(vec2 uv)
{
    float f; float n = 1.4; float a = 0.1;
    mat2 m = mat2( n, -n, n,  n );
    f  = 0.5000 * FS_NOISE(uv); uv = m*uv; f += 0.2500 * FS_NOISE(uv); uv = m*uv; f += 0.1250 * FS_NOISE(uv); uv = m*uv; f += 0.0625 * FS_NOISE(uv); uv = m*uv; f = 0.55 + 0.5*f; 
    return f;
}



#define PowVec3(c, P) vec3(pow(c.r, P), pow(c.g, P), pow(c.b, P))
#define MIN(a,b) ((a)<(b)?(a):(b))
#define MinVec3F(a, f)  vec3(MIN(a.x, f), MIN(a.y, f), MIN(a.z, f))

in mediump vec4  v_col;
in mediump vec4  v_params1;
in mediump vec2  v_wpos;
in mediump float v_time;
in mediump vec2  v_dim;
in mediump vec2  u_Res;
// in mediump float v_params[MAX_NUM_PARAMS_BUFFER]; 

out vec4 FragColor;

void main(void)
{
    vec4 color = v_col;
    float time  = v_time;
    float revT  = 1.-time; // Reverse time to be from 1 to 0
    vec2 res = u_Res;
    float speed = v_params1.x;
    
    float ratio = res.x/res.y;
    res.x /= ratio;
    vec2 uv  = vec2(gl_FragCoord.xy / res);
    vec2 pos = vec2(v_wpos.x/res.x, 1.-(v_wpos.y/res.y)); 
    
    float d = 1.- smoothstep(.0, .3, (length(uv-pos)*10.));
    float shape = d * min(2.9, speed*.5);

    float complexity = 1.;
    if(speed*.5>1.4 && complexity < 1.6) complexity *= speed;
    shape *= revT * (MAX_SPEED-speed) * .1;
    
    float noise1 = fbm(complexity * uv * vec2(2., 2.));
    float noise2 = fbm(complexity * uv * vec2(4.5, 4.5));

    float c1 = noise1*shape; // +1 for non negative values
    float sum = 1.-((color.r + color.g + color.b)/3.); // Make equal color intensity for all rgb combinations
    
    c1 *= sum * 2.0;
    vec3 col = color.rgb*c1;
    float F = pow(noise2, 3.) *2.; // Characterizes the noize into the color.
    col *= F; c1 *=F;
    float power = .02;
    vec3 nc = MinVec3F(PowVec3(color, power), 1.);
    vec4 c = mix(vec4(col,c1), vec4(vec3(noise1*nc), 0.), pow((shape-c1)*noise1*F*2.5, 3.0));

    FragColor = c;    
    // FragColor = vec4(nc, 1.);    
    // FragColor.a += .1;    

}
`;

const FS_VORONOI_EXPLOSION = `#version 300 es

#define MAX_NUM_PARAMS_BUFFER 5
precision highp float;

in mediump vec4  v_col;
in mediump vec2  v_wpos;
in mediump float v_time;
in mediump vec2  v_dim;
in mediump float v_params[MAX_NUM_PARAMS_BUFFER]; 

out vec4 FragColor;



// vec2 to vec2 hash.
vec2 hash22(vec2 p, float iTime) 
{ 

    // Faster, but doesn't disperse things quite as nicely as other combinations. :)
    float n = sin(dot(p, vec2(41, 245)));
    // float n = sin(dot(p, vec2(41, 289)));
    return fract(vec2(262144, 32768)*n)*.75 + .25; 
    
    // Animated.
    // p = (vec2(262144, 32768)*n); 
    p = (vec2(262144, 32768)*n); 
    return sin( p*6.2831853 + iTime )*.35 + .65;
    
}

float Voronoi(vec2 p, float iTime)
{
    
	vec2 g = floor(p), o; p -= g;
	vec3 d = vec3(1); // 1.4, etc.
    float r = 0.;
    
	for(int y = -1; y <= 1; y++)
    {
		for(int x = -1; x <= 1; x++)
        {
            
			o = vec2(x, y);
            o += hash22(g + o, iTime) - p;
            
			r = dot(o, o);
            
            // 1st, 2nd and 3rd nearest squared distances.
            d.z = max(d.x, max(d.y, min(d.z, r))); // 3rd.
            d.y = max(d.x, min(d.y, r)); // 2nd.
            d.x = min(d.x, r); // Closest.
                       
		}
	}
    
	d = sqrt(d); // Squared distance to distance.
    
    // Fabrice's formula.
    return min(2./(1./max(d.y - d.x, .001) + 1./max(d.z - d.x, .001)), 1.);
    // Dr2's variation - See "Voronoi Of The Week": https://www.shadertoy.com/view/lsjBz1
    //return min(smin(d.z, d.y, .2) - d.x, 1.);
}

vec2 hMap(vec2 uv, float iTime)
{
    
    // Plain Voronoi value. We're saving it and returning it to use when coloring.
    // It's a little less tidy, but saves the need for recalculation later.
    float h = Voronoi(uv*6., iTime);
    
    // Adding some bordering and returning the result as the height map value.
    float c = smoothstep(0., fwidth(h)*2., h - .09)*h;
    c += (1.-smoothstep(0., fwidth(h)*3., h - .22))*c*.5; 
    
    // Returning the rounded border Voronoi, and the straight Voronoi values.
    return vec2(c, h);
}

/**********************************************************************************************************************/

#define h13(n) fract((n)*vec3(12.9898,78.233,45.6114)*43758.5453123)
vec2 Vor(vec2 v, vec3 p, vec3 s)
{
    p = abs(fract(p-s) - 0.5);
    float a = max(p.x, max(p.y, p.z));
    float b = min(v.x, a);
    float c = max(v.x, min(v.y, a));
    return vec2(b, c);
}
float VorMap(vec3 p)
{
    vec2 v = vec2(2.6);
    v = Vor(v, p, h13(1.));
    // p.xy*=rot(1.); 
    v = Vor(v, p, h13(1.));
    // p.yz*=rot(1.); 
    v = Vor(v, p, h13(1.));
    // p.zx*=rot(1.); 
    v = Vor(v, p, h13(1.));
    return v.y-v.x; 
}

//box sdf
float Rect(vec2 p, vec2 size) 
{
    vec2 d = abs(p) - size; 
    float v = VorMap(vec3(p, p.x));
    // float c = smoothstep(0., fwidth(v)*2., v - .09)*v;
    // c += (1.-smoothstep(0., fwidth(v)*3., v - .22))*c*.5; 
    // d = d/c;
	// float pix = length(max(vec2(v/v), d)) + min(max(d.x, d.y), v*v*v);
	// float pix = length(v);
	// float pix = length(max(d, vec2(0))) + min(max(d.x, d.y), 0.0);
	float pix = length(d * d.x*d.y*18.);
    // if(v>1000.) 
    return v;
	// return pix;
}

/**********************************************************************************************************************/

vec3 random3f( vec3 p )
{
    return fract(sin(vec3( dot(p,vec3(1.0,57.0,113.0)), 
                        dot(p,vec3(57.0,113.0,1.0)),
                        dot(p,vec3(113.0,1.0,57.0))))*43758.5453);
}
vec3 center;
vec3 voronoi( vec3 x )
{
    vec3 p = floor( x );
    vec3 f = fract( x );

	float id = 0.0;
    vec2 res = vec2( 100.0 );
    for( int k=-1; k<=1; k++ )
    for( int j=-1; j<=1; j++ )
    for( int i=-1; i<=1; i++ )
    {
        vec3 b = vec3( float(i), float(j), float(k) );
        vec3 r = vec3( b ) - f + random3f( p + b );
        float d = dot( r, r );
        //float d = abs(r.x) + abs(r.y) + abs(r.z);//dot( r, r );

        if( d < res.x )
        {
			id = dot( p+b, vec3(1.0,57.0,113.0 ) );
            center = random3f( p + b );
            res = vec2( d, res.x );			
        }
        else if( d < res.y )
        {
            res.y = d;
        }
    }

    return vec3( sqrt( res ), abs(id) );
}


void main()
{
    float t = v_params[2]*.1;

    vec2 res = vec2(v_params[0], v_params[1]);              // Screen resolution
    res.x /= res.x/res.y;                                   // Transform from screen resolution to mesh resolution
    vec2 uv = gl_FragCoord.xy/res;                          // Transform to 0.0-1.0 coord space
    uv -= vec2(v_wpos.x/res.x, 1.-(v_wpos.y/res.y));        // Transform to meshes local coord space 
    
    float z = abs(sin(t*1.7))+.5;
    // uv *= z;

    /**********************************************************************************************************************/
    // Voronoi FS_NOISE
    
    // Obtain the height map (rounded Voronoi border) value, then another nearby. 
    vec2 c = hMap(uv, t);
    vec2 c2 = hMap(uv + .004, t);
    
    // Take a factored difference of the values above to obtain a very, very basic gradient value.
    // Ie. - a measurement of the bumpiness, or bump value.
    float b = max(c2.x - c.x, 0.)*14.;
    
    vec3 col = vec3(1, .05, .25)*c.x; // Red base.
    float sv = Voronoi(uv*16. + c.y, t)*.66 + (1.-Voronoi(uv*48. + c.y*2., t))*.34; // Finer overlay pattern.
    col = col*.85 + vec3(1, .7, .5)*sv*sqrt(sv)*.3; // Mix in a little of the overlay.
    col += (1. - col)*(1.-smoothstep(0., fwidth(c.y)*3., c.y - .22))*c.x; // Highlighting the border.
    col *= col; // Ramping up the contrast, simply because the deeper color seems to look better.
    
    // Taking a pattern sample a little off to the right, ramping it up, then combining a bit of it
    // with the color above. The result is the flecks of yellowy orange that you see. There's no physics
    // behind it, but the offset tricks your eyes into believing something's happening. :)
    sv = col.x*Voronoi(uv*6. + .5, t);
    col += vec3(.7, 1, .3)*pow(sv, 4.)*8.;
    
    // Apply the bump - or a powered variation of it - to the color for a bit of highlighting.
    col += vec3(.5, .7, 1)*(b*b*.5 + b*b*b*b*.5);

    /**********************************************************************************************************************/

        
    /**********************************************************************************************************************/
    // Simple Rects

    float rect1 = Rect(vec2((uv.x-.1 - abs(sin(t)*.1)), uv.y-.1 - abs(sin(t)*.1)), vec2(.04, .04));
    float rect2 = Rect(vec2(uv.x-.1 - abs(sin(t)*.1), uv.y+.1 + abs(sin(t)*.1)), vec2(.04, .04));
    float rect3 = Rect(vec2(uv.x+.1 + abs(sin(t)*.1), uv.y-.1 - abs(sin(t)*.1)), vec2(.04, .04));
    float rect4 = Rect(vec2(uv.x+.1 , uv.y+.1 + abs(sin(t)*.1)), vec2(.04, .04));
        
    // Add all geometry to the render
    float pixel = 1. - smoothstep(.0, 0.006, rect1);
    pixel += 1. - smoothstep(.0, 0.006, rect2);                 
    pixel += 1. - smoothstep(.0, 0.006, rect3);                 
    pixel += 1. - smoothstep(.0, 0.006, rect4);                 
    
    
    // vec3 col2 = vec3(pixel, pixel, pixel);
    vec3 col2 = voronoi(vec3(uv, uv.y)*18.);
    // vec3 col2 = vec3(pixel*col.x, pixel*col.y, pixel*col.z);
    // vec3 col2 = col;


    /**********************************************************************************************************************/

    float v = VorMap(vec3(uv, uv.x));
    
    // FragColor = vec4(abs(v)*1000000000000000000000000000000000000000., abs(v), 0., 1.);

    FragColor = vec4(col2, 1.);
    // FragColor = vec4(sqrt(clamp(col, 0., 1.)), 1);
    
    // if(uv.x < .11)
    //     FragColor = vec4(1., 0., 0., 1.);
    // else if(pos.y < .5)
    //     FragColor = vec4(0., 1., 1., 1.);
}

`;

/**
 * CRAMBLE Triangle https://www.shadertoy.com/view/fslcDS
 */
const FS_CRAMBLE = `#version 300 es

#define MAX_NUM_PARAMS_BUFFER 5

precision highp float;
out vec4 FragColor;

in mediump vec4  v_col;
in mediump vec2  v_wpos;
in mediump float v_time;
in mediump vec2  v_dim;
in mediump float v_params[MAX_NUM_PARAMS_BUFFER]; 


#define STEPS 250.0
#define MDIST 100.0
#define pi 3.1415926535
#define rot(a) mat2(cos(a), sin(a), -sin(a), cos(a))
// #define rot(a) mat2(sin(a), cos(a), -cos(a), sin(a))
#define sat(a) clamp(a, 0.0, 1.0)

// #define WOBBLE 
#define AA 1.0
#define h13(n) fract((n)*vec3(12.9898,78.233,45.6114)*43758.5453123)


vec2 vor(vec2 v, vec3 p, vec3 s){
    p = abs(fract(p-s) - 0.5);
    float a = max(p.x, max(p.y, p.z));
    float b = min(v.x, a);
    float c = max(v.x, min(v.y,a));
    return vec2(b, c);
}

float vorMap(vec3 p){
    vec2 v = vec2(5.0);
    v = vor(v,p,h13(0.96));
    p.xy*=rot(1.2);
    v = vor(v,p,h13(0.55));
    p.yz*=rot(2.);
    v = vor(v,p,h13(0.718));
    p.zx*=rot(2.7);
    v = vor(v,p,h13(0.3));
    return v.y-v.x; 
}

//box sdf
float box(vec3 p, vec3 b){
  vec3 q = abs(p)-b;
  return length(max(q,0.0))+min(max(q.x,max(q.y,q.z)),0.0);
}


float va = 0.; //voronoi animations
float sa = 0.; //size change animation
float rlg; //global ray length
bool hitonce = false; //for tracking complications with the voronoi 



vec2 map(vec3 p, vec3 n, float iTime)
{
    vec2 a = vec2(1);
    vec2 b = vec2(2);
    vec3 po = p;
    vec3 no = n;
    p-=n;
    float len = 9.5;
    len += sa;
    float len2 = len-1.0;
    p.x-=(len/2.0);
    a.x = box(p, vec3(1, 1, len));
    // float len2 = 1.0;
    // a.x = box(p, vec3(1, 1, 1));
    a.x = min(a.x,box(p-vec3(0, len2, len2),vec3(1, len, 1)));
    a.x = min(a.x,box(p-vec3(-len2, 0, -len2),vec3(len, 1, 1)));
    float tip = box(p-vec3(len2, len2*2.0, len2),vec3(len2, 1, 1));   
    float cut = (p.xz*=rot(pi/4.0-0.15)).y;
    tip = max(-cut+len2/2.0,tip);
    a.x = min(a.x,tip);
    b.x = tip;
    a.x-=0.4;
    p = po;
    p.xz*=rot(pi/4.0);
    p.xy*=rot(-0.9553155);
    po = p;
    n.xz*=rot(pi/4.0);
    n.xy*=rot(-0.9553155);
    p.xz-=n.xy;
    p.xz*=rot(-iTime*0.3);

    float breakPartsSize = 0.3; // Smaller val the bigger the size of break parts
    float breakPartsDist = 0.4; // Smaller val the greter the distance parts take
    if(hitonce)
        a.x = max(a.x, -vorMap(vec3(p.x, p.z, rlg + n.z) * breakPartsSize + 3.) + va * breakPartsDist);
    p = po;
    b.y = 3.0;
    p-=n;
    p.xz*=rot(pi/6.0);
    p.x+=1.75;
    p.z+=0.4;
    po = p;
    // Blocks
    // for(float i = 0.; i<3.; i++){ //blocks
    //     b.y+=i;
    //     p.xz*=rot((2.0*pi/3.0)*i);
    //     float t = (iTime+i*((2.0*pi)/9.0))*3.;
    //     p.y-=35.-50.*step(sin(t),0.);
    //     p.x+=4.5;
    //     p.xy*=rot(t);
    //     p.x-=4.5;
    //     p.xz*=rot(t);
    //     b.x = box(p,vec3(1.5,.5,.5))-0.25;
    //     a = (a.x<b.x)?a:b;
    //     p = po;
    // }
    return a;
}
vec3 norm(vec3 p, float iTime)
{
    vec2 e= vec2(0.0001,0);
    return normalize(map(p, vec3(0), iTime).x-vec3(
    map(p, e.xyy, iTime).x,
    map(p, e.yxy, iTime).x,
    map(p, e.yyx, iTime).x));
}

vec4 render(vec2 fragCoord, float iTime)
{
    vec2 res = vec2(v_params[0], v_params[1]);
    vec2 uv = ((fragCoord-0.5*res.xy)/res.y) * 2.2;
    vec3 col = vec3(0);
    uv.x-=0.025;
    vec2 uv2 = uv;
    vec2 uv3 = uv;
    
    //Calculating the animation for the size wobble and voronoi crumble
    uv2.y-=0.1;
    uv2*=rot(iTime*0.1);
    float ang = atan(uv2.x,uv2.y)/(pi*2.)+0.5;
    float range = 0.175;
    #ifdef WOBBLE
        sa = sin(ang*pi*2.+iTime*2.5)*0.3;
    #endif
    ang = smoothstep(0.0,range,ang)*smoothstep(0.0,range,1.0-ang);
    //va = (1.0-ang)*0.175;
    va = (1.0-ang);
    uv*=rot(-pi/6.0);
    
    vec3 ro = vec3(5,5,5)*6.5;
    
    //Orthographic target camera
    vec3 lk = vec3(0,0,0);
    vec3 f = normalize(lk-ro);
    vec3 r = normalize(cross(vec3(0,1,0),f));
    vec3 rd = f+uv.x*r+uv.y*cross(f,r);
    ro+=(rd-f)*17.0;
    rd=f;

    vec3 p = ro;
    float rl = 0.;
    vec2 d= vec2(0);
    float shad = 0.;
    float rlh = 0.;
    float i2 = 0.; 
    
    for(float i = 0.; i<STEPS; i++)
    {   //Spaghetified raymarcher 
        p = ro + (rd * rl);
        d = map(p, vec3(0), iTime);
        rl+=d.x;
        if((d.x)<0.0001)
        {
            shad = (i2/STEPS);
            if(hitonce) break;
            hitonce = true;
            rlh = rl;
        }
        if(rl>MDIST||(!hitonce && i > STEPS-2.))
        {
            d.y = 0.;
            break;
        }
        rlg = rl-rlh;
        if(hitonce&&rlg>3.0){hitonce = false; i2 = 0.;}  
        if(hitonce)i2++;
    }
    if(d.y>0.0) 
    {   //Color Surface
        vec3 n = norm(p, iTime);
        vec3 r = reflect(rd,n);
        vec3 ld = normalize(vec3(0,1,0));
        float spec = pow(max(0. ,dot(r,ld)), 13.0);

        //Color the triangle
        vec3 n2 = n*0.65+0.35;
        col += mix(vec3(1,0,0),vec3(0,1,0),sat(uv3.y*1.1))*n2.r;
        uv3*=rot(-(2.0*pi)/3.0);
        col += mix(vec3(0,1.0,0),vec3(0,0,1),sat(uv3.y*1.1))*n2.g;
        uv3*=rot(-(2.0*pi)/3.0);
        col += mix(vec3(0,0,1),vec3(1,0,0),sat(uv3.y*1.1))*n2.b;
        

        
        //NuSan SSS
        // float sss=.5;
        // float sssteps = 10.;
        // for(float i=1.; i<sssteps; ++i){
        //     float dist = i*0.2;
        //     sss += smoothstep(0., 1., map(p+ld*dist,vec3(0), iTime).x/dist)/(sssteps*1.5);
        // }
        // sss = clamp(sss,0.0,1.0);
        
        //blackle AO
        #define AO(a,n,p) smoothstep(-a,a, map(p,-n*a, iTime).x)
        float ao = AO(1.9, n, p) * AO(3., n, p) * AO(7., n, p);
        
        //Apply AO on the triangle
        if(rlg<0.001){
            col*=mix(ao,1.0,0.2);
        }
        //Color the inside of the crumbled bits 
        else {
            col = vec3(0.2-shad);
        }
        // //Color the moving blocks
        // if(d.y>1.0){
        //     col = (n*0.6+0.4)*vec3(sss)+spec;
        // }
        //a bit of gamma correction
        col = pow(col,vec3(0.7));
    }
    // else{ //Color Background
    //     vec3 bg = mix(vec3(0.345, 0.780, 0.988), vec3(0.361, 0.020, 0.839), length(uv));
    //     col = bg;
    // }
    vec3 bg = mix(vec3(0.345, 0.780, 0.988), vec3(0.361, 0.020, 0.839), length(uv));
    col = bg;

    return vec4(col, 1.0);  
}



void main()
{
    float iTime = v_params[2];
    vec2 uv = gl_FragCoord.xy;
    float px = 1./AA, i, j; 
    vec4 cl2, cl;

    if(AA == 1.)
    {
        cl = render(uv, iTime);
        FragColor = cl;
        return;
    }
    
    for(i=0.; i<AA + min(iTime, 0.0); i++)
    {
        for(j=0.; j<AA; j++)
        {
            vec2 uv2 = vec2(uv.x+px*i, uv.y+px*j);
            cl2 = render(uv2, iTime);
            cl += cl2;
            rlg = 0.; 
            hitonce = false;
        }
    }
    
    cl /= AA*AA;
    FragColor = cl;
}
`;


export function FragmentShaderChoose(sid) {

    if (sid & SID.FX.FS_VORONOI_EXPLOSION) { return FS_VORONOI_EXPLOSION; }
    else if (sid & SID.TEST_SHADER) { return FS_VORTEX2; }
    else if (sid & SID.FX.FS_GRADIENT) { return FS_GRADIENT; }
    else if (sid & SID.FX.FS_V2DGFX) { return FS_V2DGFX; }
    else if (sid & SID.FX.FS_GLOW) { return FS_GLOW; }
    else if (sid & SID.FX.FS_VORTEX) { return FS_VORTEX2; }
    else if (sid & SID.FX.FS_VOLUMETRIC_EXPLOSION) { return FS_VOLUMETRIC_EXPLOSION; }
    else if (sid & SID.FX.FS_TWIST) { return FS_TWIST; }
    else if (sid & SID.FX.FS_HIGH_TECH) { return FS_HIGH_TECH; }
    else if (sid & SID.FX.FS_SHADOW) { return FS_SHADOW; }
    else if (sid & SID.FX.FS_NOISE) { return FS_NOISE; }
    else if (sid & SID.ATTR.STYLE) {
        if (sid & SID.FX.FS_CRAMBLE) { return FS_CRAMBLE; }
        else if (sid & SID.DEF2) { return FS_DEFAULT2; }
        else if (sid & SID.DEF3) { return FS_DEFAULT3; }
        else return FS_DEFAULT;
    }
    else if (sid & SID.ATTR.TEX2) {
        if (sid & SID.TEXT_SDF && sid & SID.ATTR.SDF_PARAMS) { return FS_DEFAULT_TEXTURE_SDF; }
        else { return FS_DEFAULT_TEXTURE; }
    }
    else if (sid & SID.FX.FS_PARTICLES) { return FS_PARTICLES; }
    else if (sid & SID.FX.FS_EXPLOSION_CIRCLE) { return FS_EXPLOSION_CIRCLE; }
    else if (sid & SID.FX.FS_EXPLOSION_SIMPLE) { return FS_EXPLOSION_SIMPLE; }

}

/*************************************************************************
 * Saves
 */

    
/** SAVE 3 */
// const FS_CRAMBLE = `#version 300 es

// #define MAX_NUM_PARAMS_BUFFER 5
// #define STEPS 250.0
// #define MDIST 100.0
// #define pi 3.1415926535
// #define rot(a) mat2(cos(a), sin(a), -sin(a), cos(a))
// #define sat(a) clamp(a, 0.0, 1.0)
// #define h13(n) fract((n)*vec3(12.9898, 78.233, 45.6114) * 43758.5453123)
// // #define h13(n) fract((n)*vec3(13.9898, 57.233, 37.6114) * 43758.5453123)

// precision highp float;
// out vec4 FragColor;

// in mediump vec4  v_pos;
// in mediump vec2  v_wpos;
// in mediump float v_time;
// in mediump vec2  v_dim;
// in mediump float v_params[MAX_NUM_PARAMS_BUFFER]; 

// float dbgT = 0.; // A global debug time

// vec2 vor(vec2 v, vec3 p, vec3 s)
// {
//     p = abs(fract(p-s) - 0.5);
//     float a = max(p.x, max(p.y, p.z));
//     float b = min(v.x, a);
//     float c = max(v.x, min(v.y, a));
//     return vec2(b, c);
// }

// float vorMap(vec3 p, float iTime)
// {
//     vec2 v = vec2(2.6);
//     v = vor(v, p, h13(1.));
//     p.xy*=rot(.86);
//     // p.xy*=rot(dbgT);
//     v = vor(v, p, h13(1.));
//     p.yz*=rot(1.);
//     v = vor(v, p, h13(1.));
//     p.zx*=rot(1.);
//     v = vor(v, p, h13(1.));
//     return v.y-v.x; 
// }

// //box sdf
// float box(vec3 p, vec3 b)
// {
//   vec3 q = abs(p)-b;
//   return length(max(q, 0.0)) + min(max(q.x, max(q.y,q.z)), 0.0);
// //   return length(max(q, 0.0)) + min(max(q.x, q.y), 0.0);
// }

// float va = 0.;          //voronoi animations
// float rlg;              //global ray length
// bool hitonce = false;   //for tracking complications with the voronoi 

// vec2 map(vec3 p, vec3 n, float iTime)
// {
//     vec2 a = vec2(1);
//     float len = 5.;
//     a.x = box(p, vec3(len, 1., 1.));
//     p.yz *= rot(.5);         // 0.5 is the middle rot for y.yz 
//     p.xy *= rot(.5);


//     float size = 0.3; // Smaller val the bigger the size of break parts
//     float dist = 0.4; // Smaller val the greter the distance parts take
//     if(hitonce)
//         a.x = max(a.x, -vorMap(vec3(p.x, p.z, rlg + n.z) * size + 3., iTime) + va * dist);
//         // a.x = max(a.x, -vorMap(vec3(p.x, p.z, rlg + n.z) * size, iTime) + va * dist);

//     return a;
// }
// vec3 norm(vec3 p, float iTime)
// {
//     vec2 e = vec2(0, 0);
//     return (map(p, vec3(0), iTime).x-
//                 vec3(map(p, e.xyy, iTime).x,map(p, e.yxy, iTime).x,map(p, e.yyx, iTime).x));
// }

// vec4 render(vec2 uv, float iTime)
// {
//     vec3 col = vec3(0);
//     //Calculating the animation for the voronoi crumble
//     float ang = 1.-smoothstep(0.0, .1, length(uv)*iTime*.06);
//     // float ang = 1.-smoothstep(0.0, .1, length(uv)*.05);
//     float depth = 1.675; // Smaller val, less depth of breaking parts
//     va = (1.-ang)*depth;


//     vec3 ro = vec3(0, 1, 0);
//     //Orthographic target camera
//     // vec3 lk = vec3(0, dbgT, 0);
//     // vec3 lk = vec3(1, 1, 1);
//     vec3 lk = vec3(0, 0, 0);
//     vec3 f = normalize(lk-ro);
//     // vec3 f = vec3(0, 1, 0);
//     vec3 r = normalize(cross(vec3(0, 0, 1), f));
//     // vec3 r = normalize(cross(vec3(0, 0, 1), ro));
//     vec3 rd = f + uv.x*r + uv.y*cross(f,r);
//     ro += (rd-f)*15.0;
//     // ro += (rd-f)*10.0;
//     rd = f;

//     vec3 p = ro;
//     float rl = 0.;
//     vec2 d= vec2(0);
//     float shad = 0.;
//     float rlh = 0.;
//     float i2 = 0.; 

//     for(float i = 0.; i<STEPS; i++)
//     {   //Spaghetified raymarcher 
//         p = ro + (rd * rl);
//         d = map(p, vec3(0), iTime);
//         rl += d.x;

//         if((d.x)<0.0001)
//         // if((d.x)<0.001)
//         {
//             shad = (i2/STEPS);
//             if(hitonce) break;
//             hitonce = true;
//             rlh = rl;
//         }
//         if(rl>MDIST || (!hitonce && i > STEPS-2.))
//         { d.y = 0.; break; }

//         rlg = rl-rlh;
//         if(hitonce && rlg>3.0) { hitonce = false; i2 = 0.; }  
//         if(hitonce) i2++;
//     }
//     if(d.y>0.0) 
//     {   //Color Surface
//         vec3 n = norm(p, iTime);
//         vec3 r = reflect(rd, n);
//         vec3 ld = normalize(vec3(0, 1, 0));
//         float spec = pow(max(0. , dot(r, ld)), 13.0);

//         //blackle AO
//         #define AO(a,n,p) smoothstep(-a, a, map(p,-n*a, iTime).x)
//         float ao = AO(1.9, n, p) * AO(3., n, p) * AO(7., n, p);

//         //Apply AO on the triangle
//         if(rlg<0.001){ col *= mix(ao, 1.0, 0.2); }
//         //Color the inside of the crumbled bits 
//         else { col = vec3(0.2-shad); }
//         col = pow(col,vec3(0.55)); // a bit of gamma correction
//     }
//     // else if()
//     else{ //Color Background
//         vec3 bg = mix(vec3(0.345, 0.780, 0.988), vec3(0.361, 0.020, 0.839), length(uv));
//         col = bg;
//     }

//     return vec4(col, v_pos.a);  
// }



// void main()
// {
//     float iTime = v_params[2];
//     dbgT = cos(iTime*1.)*2.;
//     vec2 res = vec2(v_params[0], v_params[1]);
//     vec2 local = vec2(v_wpos.x, (res.y-v_wpos.y)); // Find local mesh coords(and reverse y)
//     vec2 uv = (gl_FragCoord.xy)/local; // Transform to 0.0-1.0 coord system
//     uv -= 1.;

//     FragColor = render(uv, iTime);

//     // if(dbgT > 0.49 && dbgT < 0.51)
//     // FragColor = vec4(1.,0.,1.,1.);

//     // DEBUG
//     bool center = false;
//     if( gl_FragCoord.x > 250. && gl_FragCoord.x < 360. &&
//         gl_FragCoord.y > 390. && gl_FragCoord.y < 400.) center = true;

//     if(center)
//     {
//         if(dbgT > 1.) FragColor = vec4(0.,1.,1.,1.);
//         else if(dbgT < 0.) FragColor = vec4(1.,1.,0.,1.);
//         else if(dbgT == 0.) FragColor = vec4(1.,0.,1.,1.);
//     }

// }
// `;

/** FINAL SAVE FOR BRICKS BREAK ANIMATION  */
// const FS_CRAMBLE = `#version 300 es

// #define MAX_NUM_PARAMS_BUFFER 5
// #define STEPS 250.0
// #define MDIST 100.0
// #define pi 3.1415926535
// #define rot(a) mat2(cos(a), sin(a), -sin(a), cos(a))
// #define sat(a) clamp(a, 0.0, 1.0)
// #define h13(n) fract((n)*vec3(12.9898, 78.233, 45.6114) * 43758.5453123)
// // #define h13(n) fract((n)*vec3(13.9898, 57.233, 37.6114) * 43758.5453123)

// precision highp float;
// out vec4 FragColor;

// in mediump vec4  v_pos;
// in mediump vec2  v_wpos;
// in mediump float v_time;
// in mediump vec2  v_dim;
// in mediump float v_params[MAX_NUM_PARAMS_BUFFER]; 

// float dbgT = 0.; // A global debug time

// vec2 vor(vec2 v, vec3 p, vec3 s)
// {
//     p = abs(fract(p-s) - 0.5);
//     float a = max(p.x, max(p.y, p.z));
//     float b = min(v.x, a);
//     float c = max(v.x, min(v.y, a));
//     return vec2(b, c);
// }

// float vorMap(vec3 p, float iTime)
// {
//     vec2 v = vec2(2.6);
//     v = vor(v, p, h13(1.));
//     p.xy*=rot(1.);
//     // p.xy*=rot(.86);
//     // p.xy*=rot(dbgT);
//     v = vor(v, p, h13(1.));
//     p.yz*=rot(1.);
//     v = vor(v, p, h13(1.));
//     p.zx*=rot(1.);
//     v = vor(v, p, h13(1.));
//     return v.y-v.x; 
// }

// //box sdf
// float box(vec3 p, vec3 b)
// {
//   vec3 q = abs(p)-b;
//   return length(max(q, 0.0)) + min(max(q.x, max(q.y, q.z)), 0.0);
// //   return length(max(q, 0.0)) + min(max(q.x, q.y), 0.0);
// }

// float va = 0.;          //voronoi animations
// float rlg;              //global ray length
// bool hitonce = false;   //for tracking complications with the voronoi 

// vec2 map(vec3 p, vec3 n, float iTime)
// {
//     vec2 a = vec2(1);
//     float len = 5.;
//     // float dimx = v_dim.x*.05;
//     // float dimy = v_dim.y*.03;
//     float dimx = v_dim.x*.06;
//     float dimy = v_dim.y*.04;
//     a.x = box(p, vec3(dimx, 1., dimy));

//     p.yz *= rot(.5);         // 0.5 is the middle rot for y.yz 
//     // p.xy *= rot(.5);

//     // float size = 0.3; // Smaller val the bigger the size of break parts
//     // float dist = 0.4; // Smaller val the greter the distance parts take
//     float size = 0.8; // Smaller val the bigger the size of break parts
//     float dist = 0.8; // Smaller val the greater the distance parts take
//     if(hitonce)
//         a.x = max(a.x, -vorMap(vec3(p.x, p.z, rlg + n.z) * size + 3., iTime) + va * dist);
//         // a.x = max(a.x, -vorMap(vec3(p.x, p.z, rlg + n.z) * size, iTime) + va * dist);

//     return a;
// }
// vec3 norm(vec3 p, float iTime)
// {
//     vec2 e = vec2(0.001, 0);
//     return (map(p, vec3(0), iTime).x-
//                 vec3(map(p, e.xyy, iTime).x,map(p, e.yxy, iTime).x,map(p, e.yyx, iTime).x));
// }

// vec4 render(vec2 uv, float iTime)
// {
//     vec3 col = vec3(0);
//     //Calculating the animation for the voronoi crumble
//     float ang = 1.-smoothstep(0.0, .4, length(uv)*iTime);
//     // float ang = 1.-smoothstep(0.0, .1, length(uv)*.05);
//     float depth = 1.675; // Smaller val, less depth of breaking parts
//     va = (1.-ang)*depth;


//     vec3 ro = vec3(0, 1, 0);
//     //Orthographic target camera
//     // vec3 lk = vec3(0, dbgT, 0);
//     // vec3 lk = vec3(1, 1, 1);
//     vec3 lk = vec3(0, 0, 0);
//     vec3 f = normalize(lk-ro);
//     // vec3 f = vec3(0, 1, 0);
//     // vec3 r = normalize(cross(vec3(0, 0, 1), f));
//     vec3 r = normalize(cross(vec3(0, 0, 1), ro));
//     vec3 rd = f + uv.x*r + uv.y*cross(f,r);
//     // ro += (rd-f)*15.0;
//     ro += (rd-f)*30.0;
//     rd = f;

//     vec3 p = ro;
//     float rl = 0.;
//     vec2 d= vec2(0);
//     float shad = 0.;
//     float rlh = 0.;
//     float i2 = 0.; 

//     float alpha = 1.;

//     for(float i = 0.; i<STEPS; i++)
//     {   //Spaghetified raymarcher 
//         p = ro + (rd * rl);
//         d = map(p, vec3(0), iTime);
//         rl += d.x;

//         // if((d.x)<0.0001)
//         if((d.x)<0.001)
//         {
//             shad = (i2/STEPS);
//             if(hitonce) break;
//             hitonce = true;
//             rlh = rl;
//         }
//         if(rl>MDIST || (!hitonce && i > STEPS-2.))
//         { d.y = 0.; break; }

//         rlg = rl-rlh;
//         if(hitonce && rlg>3.0) { hitonce = false; i2 = 0.; }  
//         if(hitonce) i2++;
//     }
//     if(d.y>0.0) 
//     {   // Light
//         // vec3 n = norm(p, iTime);
//         // vec3 r = reflect(rd, n);
//         // vec3 ld = normalize(vec3(0, 1, 0));
//         // float spec = pow(max(0.0 , dot(r, ld)), 13.0);

//         // Color the surface
//         if(rlg<0.001){ col = v_pos.rgb; }
//         //Color the inside of the crumbled bits 
//         else { col = vec3(0.2-shad); }
//         col = pow(col, vec3(0.55)); // a bit of gamma correction
//     }
//     else{
//         alpha = 0.;
//         col = vec3(0);
//     }
//     // else{ //Color Background
//     //     vec3 bg = mix(vec3(0.345, 0.780, 0.988), vec3(0.361, 0.020, 0.839), length(uv));
//     //     col = bg;
//     // }

//     return vec4(col, alpha);  
// }



// void main()
// {
//     float iTime = v_params[2];
//     dbgT = cos(iTime*1.)*2.;
//     vec2 res = vec2(v_params[0], v_params[1]);


//     vec2 uv = (gl_FragCoord.xy)/res; // Transform to 0.0-1.0 coord system
//     vec2 pos = vec2(v_wpos.x/res.x, 1.-(v_wpos.y/res.y)); 
//     uv -= pos;

//     FragColor = render(uv, iTime);



//     // DEBUG

//     // if(dbgT > 0.49 && dbgT < 0.51)
//     // FragColor = vec4(1.,0.,1.,1.);

//     bool center = false;
//     if( gl_FragCoord.x > 250. && gl_FragCoord.x < 360. &&
//         gl_FragCoord.y > 390. && gl_FragCoord.y < 400.) center = true;

//     if(center)
//     {
//         if(dbgT > 1.) FragColor = vec4(0.,1.,1.,1.);
//         else if(dbgT < 0.) FragColor = vec4(1.,1.,0.,1.);
//         else if(dbgT == 0.) FragColor = vec4(1.,0.,1.,1.);
//     }

// }
// `;


// const FS_CRAMBLE = `#version 300 es

// #define MAX_NUM_PARAMS_BUFFER 5
// #define STEPS 250.0
// #define MDIST 100.0
// #define pi 3.1415926535
// #define rot(a) mat2(cos(a), sin(a), -sin(a), cos(a))
// #define sat(a) clamp(a, 0.0, 1.0)
// #define h13(n) fract((n)*vec3(12.9898, 78.233, 45.6114) * 43758.5453123)
// // #define h13(n) fract((n)*vec3(13.9898, 57.233, 37.6114) * 43758.5453123)

// precision highp float;
// out vec4 FragColor;

// in mediump vec4  v_pos;
// in mediump vec2  v_wpos;
// in mediump float v_time;
// in mediump vec2  v_dim;
// in mediump float v_params[MAX_NUM_PARAMS_BUFFER]; 

// float dbgT = 0.; // A global debug time

// vec2 vor(vec2 v, vec3 p, vec3 s)
// {
//     p = abs(fract(p-s) - 0.5);
//     float a = max(p.x, max(p.y, p.z));
//     float b = min(v.x, a);
//     float c = max(v.x, min(v.y, a));
//     return vec2(b, c);
// }

// float vorMap(vec3 p)
// {
//     vec2 v = vec2(2.6);
//     v = vor(v, p, h13(1.));
//     p.xy*=rot(1.); v = vor(v, p, h13(1.));
//     p.yz*=rot(1.); v = vor(v, p, h13(1.));
//     p.zx*=rot(1.); v = vor(v, p, h13(1.));
//     return v.y-v.x; 
// }

// //box sdf
// float box(vec3 p, vec3 b)
// {
//   vec3 q = abs(p)-b;
//   return length(max(q, 0.0)) + min(max(q.x, max(q.y, q.z)), 0.0);
// }

// float va = 0.;          //voronoi animations
// float rlg;              //global ray length
// bool hitonce = false;   //for tracking complications with the voronoi 

// vec2 map(vec3 p, vec3 n)
// {
//     vec2 a = vec2(1);
//     float len = 5.;
//     // float dimx = v_dim.x*.05;
//     // float dimy = v_dim.y*.03;
//     float dimx = v_dim.x;
//     float dimy = v_dim.y;
//     a.x = box(p, vec3(dimx, 1., dimy));

//     // p.yz *= rot(.5);         // 0.5 is the middle rot for y.yz 
//     // p.xy *= rot(.5);

//     float size = .2; // Smaller val the bigger the size of break parts
//     float dist = .4; // Bigger val the greater the speed crambled parts are reduced
//     if(hitonce)
//         a.x = max(a.x, -vorMap(vec3(p.x, p.z, rlg + n.z) * size) + va );
//         // a.x = max(a.x, -vorMap(vec3(p.x, p.z, rlg + n.z) * size + 8.) + va * dist);
//         // a.x = max(a.x, -vorMap(vec3(p.x, p.z, rlg + n.z) * size + 8.) + va * dist);

//     return a;
// }
// vec3 norm(vec3 p, float iTime)
// {
//     vec2 e = vec2(0.001, 0);
//     return (map(p, vec3(0)).x-
//                 vec3(map(p, e.xyy).x, map(p, e.yxy).x,map(p, e.yyx).x));
// }

// vec4 render(vec2 uv, float iTime)
// {
//     vec3 col = vec3(0);
//     //Calculating the animation for the voronoi crumble
//     float ang = 1.-smoothstep(0.0, .05, length(uv)*iTime*2.09);
//     float depth = .175; // Smaller val, less depth of breaking parts
//     float apartSize = 1.1; // SIZE THE CRAMBLES
//     va = (apartSize-ang)*depth; 



//     vec3 ro = vec3(0, 1, 0);
//     //Orthographic target camera
//     vec3 lk = vec3(0, 0, 0);
//     vec3 f = normalize(lk-ro);
//     vec3 r = normalize(cross(vec3(0, 0, 1), ro));
//     vec3 rd = f + uv.x*r + uv.y*cross(f,r);
//     ro += (rd-f)*30.0; // SIZE THE CRAMBLES
//     // ro += 1.0;
//     // ro += vorMap(ro) * 0.4;
//     // ro += vorMap(vec3(uv.x, uv.y, 1)) * 10.;
//     // ro += vorMap(vec3(r));
//     // ro += vorMap(rd);
//     // rd = f;

//     vec3 p = ro;
//     float rl = 0.;
//     vec2 d = vec2(0);
//     float shad = 0.;
//     float rlh = 0.;
//     float i2 = 0.; 
//     float alpha = 1.;

//     for(float i = 0.; i<STEPS; i++)
//     {   //Spaghetified raymarcher 
//         p = ro + (rd * rl);
//         d = map(p, vec3(0));
//         rl += d.x;

//         if((d.x) < 0.0001)
//         {
//             shad = (i2/STEPS);
//             if(hitonce) break;
//             hitonce = true;
//             rlh = rl;
//         }
//         if(rl>MDIST || (!hitonce && i > STEPS-2.))
//         { d.y = 0.; break; }

//         rlg = rl-rlh;
//         if(hitonce && rlg>3.0) { hitonce = false; i2 = 0.; }  
//         if(hitonce) i2++;
//     }
//     if(d.y>0.0) 
//     {   
//         // Color the surface
//         if(rlg<0.001){ col = v_pos.rgb; }
//         //Color the inside of the crumbled bits 
//         else { col = vec3(0.4-shad); }
//         // col = pow(col, vec3(0.55)); // a bit of gamma correction
//     }
//     else{
//         alpha = 0.;
//         col = vec3(0);
//     }

//     return vec4(col, alpha);  
// }



// void main()
// {
//     float iTime = v_params[2];
//     dbgT = cos(iTime*1.)*2.;
//     vec2 res = vec2(v_params[0], v_params[1]);

//     vec2 uv = (gl_FragCoord.xy)/res; // Transform to 0.0-1.0 coord system
//     vec2 pos = vec2(v_wpos.x/res.x, 1.-(v_wpos.y/res.y)); 
//     uv -= pos;

//     FragColor = render(uv, iTime);

//     // DEBUG
//     // if(dbgT > 0.49 && dbgT < 0.51)
//     // FragColor = vec4(1.,0.,1.,1.);
//     // bool center = false;
//     // if( gl_FragCoord.x > 250. && gl_FragCoord.x < 360. &&
//     //     gl_FragCoord.y > 390. && gl_FragCoord.y < 400.) center = true;

//     // if(center)
//     // {
//     //     if(dbgT > 1.) FragColor = vec4(0.,1.,1.,1.);
//     //     else if(dbgT < 0.) FragColor = vec4(1.,1.,0.,1.);
//     //     else if(dbgT == 0.) FragColor = vec4(1.,0.,1.,1.);
//     // }

// }
// `;

/** SAVE 2 */
// const FS_CRAMBLE = `#version 300 es

// #define MAX_NUM_PARAMS_BUFFER 5
// #define STEPS 250.0
// #define MDIST 100.0
// #define pi 3.1415926535
// #define rot(a) mat2(cos(a), sin(a), -sin(a), cos(a))
// #define sat(a) clamp(a, 0.0, 1.0)
// #define h13(n) fract((n)*vec3(12.9898,78.233,45.6114)*43758.5453123)

// // out vec4 O;
// precision highp float;
// out vec4 FragColor;

// in mediump vec4  v_pos;
// in mediump vec2  v_wpos;
// in mediump float v_time;
// in mediump vec2  v_dim;
// in mediump float v_params[MAX_NUM_PARAMS_BUFFER]; 

// vec2 vor(vec2 v, vec3 p, vec3 s)
// {
//     p = abs(fract(p-s) - 0.5);
//     float a = max(p.x, max(p.y, p.z));
//     float b = min(v.x, a);
//     float c = max(v.x, min(v.y,a));
//     return vec2(b, c);
// }

// float vorMap(vec3 p)
// {
//     vec2 v = vec2(5.0);
//     v = vor(v,p,h13(0.96));
//     p.xy*=rot(1.2);
//     v = vor(v,p,h13(0.55));
//     p.yz*=rot(2.);
//     v = vor(v,p,h13(0.718));
//     p.zx*=rot(2.7);
//     v = vor(v,p,h13(0.3));
//     return v.y-v.x; 
// }

// //box sdf
// float box(vec3 p, vec3 b)
// {
//   vec3 q = abs(p)-b;
//   return length(max(q,0.0)) + min(max(q.x,max(q.y,q.z)),0.0);
// }

// float va = 0.;          //voronoi animations
// float rlg;              //global ray length
// bool hitonce = false;   //for tracking complications with the voronoi 

// vec2 map(vec3 p, vec3 n, float iTime)
// {
//     vec2 a = vec2(1);
//     float len = 5.;
//     a.x = box(p, vec3(len, 1., 1.));
//     // a.x-=.3;                                                       // Round Edges
//     // p.xz *= rot(-0.9553155);
//     // p.xz *= rot(-pi/6.);
//     // p.xy *= rot(-pi/6.);
//     p.xz *= rot(-pi/4.);
//     p.xy *= rot(-0.9553155);


//     float breakPartsSize = 0.3; // Smaller val the bigger the size of break parts
//     float breakPartsDist = 0.4; // Smaller val the greter the distance parts take
//     if(hitonce)
//         a.x = max(a.x, -vorMap(vec3(p.x, p.z, rlg + n.z) * breakPartsSize + 3.) + va * breakPartsDist);

//     return a;
// }
// vec3 norm(vec3 p, float iTime)
// {
//     vec2 e= vec2(0.0001, 0);
//     return normalize(   map(p, vec3(0), iTime).x - 
//                             vec3(
//                                 map(p, e.xyy, iTime).x,
//                                 map(p, e.yxy, iTime).x,
//                                 map(p, e.yyx, iTime).x)
//                             );
// }

// vec4 render(vec2 uv, float iTime)
// {
//     vec3 col = vec3(0);
//     uv -= .5;


//     //Calculating the animation for the voronoi crumble
//     float ang = 1.-smoothstep(0.0, .1, length(uv)*iTime*.1);
//     float depth = 2.675; // Smaller val, less depth of breaking parts
//     va = (1.-ang)*depth;
//     // uv*=rot(-pi/6.0); // Rotate to Horizontal axis
//     vec3 ro = vec3(1, 1, 1);

//     //Orthographic target camera
//     vec3 lk = vec3(1, 0, 0);
//     vec3 f = normalize(lk-ro);
//     vec3 r = normalize(cross(vec3(0, 1, 0), f));
//     vec3 rd = f + uv.x*r + uv.y*cross(f, r);
//     ro += ((rd-f)*18.0);
//     rd = f;

//     vec3 p = ro;
//     float rl = 0.;
//     vec2 d= vec2(0);
//     float shad = 0.;
//     float rlh = 0.;
//     float i2 = 0.; 

//     for(float i = 0.; i<STEPS; i++)
//     {   //Spaghetified raymarcher 
//         p = ro + (rd * rl);
//         d = map(p, vec3(0), iTime);
//         rl += d.x;

//         // if((d.x)<0.0001)
//         if((d.x)<0.01)
//         {
//             shad = (i2/STEPS);
//             if(hitonce) break;
//             hitonce = true;
//             rlh = rl;
//         }
//         if(rl>MDIST || (!hitonce && i > STEPS-2.))
//         { d.y = 0.; break; }

//         rlg = rl-rlh;
//         if(hitonce && rlg>3.0) { hitonce = false; i2 = 0.; }  
//         if(hitonce) i2++;
//     }
//     if(d.y>0.0) 
//     {   //Color Surface
//         vec3 n = norm(p, iTime);
//         vec3 r = reflect(rd, n);
//         vec3 ld = normalize(vec3(0, 1, 0));
//         float spec = pow(max(0. , dot(r, ld)), 13.0);

//         #define AO(a,n,p) smoothstep(-a, a, map(p,-n*a, iTime).x)
//         float ao = AO(1.9, n, p) * AO(3., n, p) * AO(7., n, p);

//         if(rlg<0.001){ col *= mix(ao, 1.0, 0.2); }      //Apply AO on the triangle
//         else { col = vec3(0.2-shad); }                  //Color the inside of the crumbled bits 
//         col = pow(col,vec3(0.55));                      // a bit of gamma correction
//     }
//     else{ //Color Background
//         vec3 bg = mix(vec3(0.345, 0.780, 0.988), vec3(0.361, 0.020, 0.839), length(uv));
//         col = bg;
//     }

//     return vec4(col, v_pos.a);  
// }



// void main()
// {
//     float iTime = v_params[2];
//     vec2 res = vec2(v_params[0], v_params[1]);
//     // vec2 uv = ((gl_FragCoord.xy-0.5*res.xy)/res.y) * 2.2;
//     // vec2 uv = ((gl_FragCoord.xy-0.5*res.xy)/res.y);

//     vec2 local = vec2(v_wpos.x, (res.y-v_wpos.y)); // Find local mesh coords(and reverse y)
//     vec2 uv = (gl_FragCoord.xy)/local; // Transform to 0.0-1.0 coord system
//     // vec2 uv = gl_FragCoord.xy/res; // Transform to 0.0-1.0 coord system
//     uv.x -= .5;
//     uv.y -= .5;
//     // uv *= 1.-(gl_FragCoord.xy/v_dim);

//     FragColor = render(uv, iTime);
// }
// `;


