"use strict";

import { VS_GLOW } from "./Glow.js";
import { VS_SHADOW } from "./Shadow.js";
import { VS_TWIST } from "./Twist.js";
import { VertexShaderCreate } from "./CreateShader.js";
import { VS_VORTEX2 } from "./VortexShader.js";

/**
 * Raymarching Implementation
 *      https://www.youtube.com/watch?v=PGtv-dBi2wE
 *      https://www.shadertoy.com/view/XlGBW3
 * 
    float GetDist(vec3 p)
    {
        vec4 sphere = vac4(0,1,6,1); // [x,y,z,radius]
        // distance to the sphere
        float ds = length(p - sphere.xyz) - sphere.w;  // -.w is the radius
        float dp = p.y; // distance to the plane(the ground plane is the camera.y)
        float d = min(ds, dp); // Take the closest distance(either the plane or the sphere)
        return d;
    }

    // Calculate the normal of a surface by drawing a line between to (very close to each other) points
    // on the surface, calculating the slope (the perpendicular to the line)
    vec3 GetNormal(vec3 p) // p is a point on the surface
    {
        vec2 e = vec2(0.01, 0.0)
        float d = GetDist(p);
        vec3 normal = vec3(
            d - GetDist(p - e.xyy),
            d - GetDist(p - e.yxy),
            d - GetDist(p - e.yyx)
        ); 

        return normalize(normal);
    }

    // ro: ray origin. 
    // rd: ray direction
    float RayMarch(vec3 ro, vec3 rd)
    {
        float do = 0; // do: distance origin(The origin changes in each step of the loop) 
        for(int i=0; i<MAX_STEPS; i++)
        {
            // Set the ray origin to be the prev ray origin + the ray distance 
            // to the prev closest point of the surface
            vec3 p = ro + (do*rd);
            
            // Calculate the new distance(from the current ray origin to the new closest to the surface point)
            ds = GetDist(p);

            // Store the current distance as the next origin
            do += ds;
            
            // If we come across a min distance that we declare as a contant
            // OR we pass a max distance, we stop the ray marching
            if(ds < SOME_MINIMUM_SURFACE_DISTANCE || do > SOME_MAX_DISTANCE)
        }
        return do;
    }

 * 
 */

//===================== Orthographic Matrix =====================
// | left-right | 0				| 0							| 0 |
// | 0			| top - bottom	|							| 0 |
// |			|				| zFar - zNear				| 0 |
// |-(r+l)/(r-l)|-(t+b) / (t-b) |-(zFar+zNear)/(zFar-zNear)	| 1 |
// 0.,     cos(1.), -sin(1.), -0.,
// 0.,     sin(1.), cos(1.),  0.,

// mat4 Rotate(float a)
// {
//     float s = sin(a);
//     float c = cos(a);
//     return mat4(
//         1., 0., 0.,0.,
//         0., c, -s, 0.,
//         0., s,  c, 0.,
//         0., 0., 0.,1.
//     );
// }

/**
 * u_Params[0] = Window Width
 * u_Params[1] = Window Height
 */
const VS_DEFAULT = `#version 300 es

#define MAX_NUM_PARAMS_BUFFER 5


// layout (location = 0) in mediump vec4 a_Col;
// layout (location = 1) in mediump vec4 a_WposTime;
// layout (location = 2) in mediump vec4 a_Params1;
// layout (location = 3) in mediump vec2 a_Pos;
// layout (location = 4) in mediump vec2 a_Scale;
// layout (location = 5) in mediump vec3 a_Style;

in mediump vec4 a_WposTime;
in mediump vec4 a_Params1;
in mediump vec2 a_Pos;
in mediump vec2 a_Scale;
in mediump vec3 a_Style;
in mediump vec4 a_Col;

uniform mat4  u_OrthoProj;
uniform mediump float u_Params[MAX_NUM_PARAMS_BUFFER];                  // [0]:WinWidth, [1]:WinHeight, [3]:Time

out mediump vec4 v_Col; 
out mediump vec2 v_Dim; 
out mediump vec2 v_Wpos; 
out mediump float v_Time; 
out mediump vec2 v_Scale; 
out mediump vec3 v_Style; 
out mediump vec2 v_Res; 
out mediump vec4 v_Param1; 
out mediump float v_Params[MAX_NUM_PARAMS_BUFFER];                   
    
void main(void) {
    
    vec2 scaled = a_Pos  * a_Scale;
    gl_Position = u_OrthoProj * vec4(scaled.x + a_WposTime.x, scaled.y + a_WposTime.y, a_WposTime.z, 1.0);
    
    v_Col       = a_Col;
    v_Dim       = abs(a_Pos)* a_Scale;
    v_Wpos      = a_WposTime.xy;
    v_Time      = a_WposTime.w;
    v_Scale     = a_Scale;
    v_Style     = a_Style * v_Scale.x; 
    v_Res       = vec2(u_Params[0], u_Params[1]);
    v_Param1    = a_Params1;
    v_Params    = u_Params;
}
`;

const VS_DEFAULT_TEXTURE = `#version 300 es

#define MAX_NUM_PARAMS_BUFFER 5

// layout (location = 0) in vec4 a_Col;
// layout (location = 1) in vec4 a_WposTime;
// layout (location = 2) in vec2 a_Pos;
// layout (location = 3) in vec2 a_Scale;
// layout (location = 4) in vec2 a_Tex;

in vec4 a_Col;
in vec4 a_WposTime;
in vec2 a_Pos;
in vec2 a_Scale;
in vec2 a_Tex;

// In
uniform mat4 u_OrthoProj;
uniform mediump float u_Params[MAX_NUM_PARAMS_BUFFER];                  // [0]:SdfInner, [1]:SdfOuter, [3]?


// Out
out mediump vec4 v_Col; 
out mediump vec2 v_Pos;
out mediump vec2 v_Wpos;
out mediump vec2 v_TexCoord;
out mediump float v_Params[MAX_NUM_PARAMS_BUFFER];

void main(void) 
{
    vec2 scaled = a_Pos * a_Scale;
    gl_Position = u_OrthoProj * vec4(scaled.x + a_WposTime.x, scaled.y + a_WposTime.y, a_WposTime.z, 1.0);

    v_Col = a_Col;
    v_Pos = a_Pos;
    v_Wpos = a_WposTime.xy;
    v_TexCoord = a_Tex;
    v_Params = u_Params;
}
`;

const VS_DEFAULT_TEXTURE_SDF = `#version 300 es

// #define MAX_NUM_PARAMS_BUFFER 5

// layout (location = 0) in vec4 a_Col;
// layout (location = 1) in vec4 a_WposTime;
// layout (location = 2) in vec2 a_Pos;
// layout (location = 3) in vec2 a_Scale;
// layout (location = 4) in vec2 a_Tex;
// layout (location = 5) in vec2 a_Sdf;

in vec4 a_WposTime;
in vec2 a_Pos;
in vec2 a_Scale;
in vec2 a_Tex;
in vec2 a_Sdf;
in vec4 a_Col;

// Uniforms
uniform mat4 u_OrthoProj;
// uniform mediump float u_Params[MAX_NUM_PARAMS_BUFFER];                  // [0]:SdfInner, [1]:SdfOuter, [3]?


// Out
out mediump vec4 v_Col; 
out mediump vec2 v_TexCoord;
out mediump vec2 v_SdfParams;

void main(void) 
{

    vec2 scaled = a_Pos * a_Scale;
    gl_Position = u_OrthoProj * vec4(scaled.x + a_WposTime.x, scaled.y + a_WposTime.y, a_WposTime.z, 1.0);

    v_Col = a_Col;
    v_TexCoord = a_Tex;
    v_SdfParams = a_Sdf;
}
`;

/**
 * The timer used is from an attribute
 */
const VS_EXPLOSION_ATTR_TIMER = `#version 300 es

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



const VS_PARTICLES = `#version 300 es

#define MAX_NUM_PARAMS_BUFFER 3

layout (location = 0) in mediump vec4  a_Col;
layout (location = 1) in mediump vec2  a_Pos;
layout (location = 2) in mediump vec4  a_WposTime;
layout (location = 3) in mediump vec4  a_Params1;

uniform mat4  u_OrthoProj;
uniform float u_Params[MAX_NUM_PARAMS_BUFFER];                 

out mediump vec4  v_Col; 
out mediump vec2  v_Wpos; 
out mediump vec4  v_Params1; 
out mediump vec2  v_Dim; 
out mediump float v_Time; 
out mediump vec2  u_Res; 

void main(void) 
{
    gl_Position = u_OrthoProj * vec4(a_Pos.x + a_WposTime.x, a_Pos.y + a_WposTime.y, a_WposTime.z, 1.0);
    
    v_Col  = a_Col;
    v_Wpos = a_WposTime.xy;
    v_Dim  = abs(a_Pos);
    v_Time = a_WposTime.w;
    v_Params1 = a_Params1;
    u_Res = vec2(u_Params[0], u_Params[1]);
}`;

const VS_CRAMBLE = `#version 300 es

#define MAX_NUM_PARAMS_BUFFER 5

layout (location = 0) in mediump vec4 a_Col;
layout (location = 1) in mediump vec2 a_Pos;
layout (location = 2) in mediump vec2 a_Scale;
layout (location = 3) in mediump vec4 a_WposTime;
layout (location = 4) in mediump vec3 a_Style;


uniform mat4  u_OrthoProj;
uniform mediump float u_Params[MAX_NUM_PARAMS_BUFFER];

out mediump vec4 v_Col; 
out mediump vec2 v_Wpos; 
out mediump vec2 v_Dim; 
out mediump vec2 v_Scale; 
out mediump vec3 v_Style; 
out mediump float v_Params[MAX_NUM_PARAMS_BUFFER];                   
    
void main(void) {
    
    vec2 scaled = a_Pos  * a_Scale;
    gl_Position = u_OrthoProj * vec4(scaled.x + a_WposTime.x, scaled.y + a_WposTime.y, a_WposTime.z, 1.0);
    
    v_Col       = a_Col;
    v_Dim       = abs(a_Pos);
    v_Wpos      = a_WposTime.xy;
    v_Scale     = a_Scale;
    v_Style     = a_Style; 
    v_Params    = u_Params;
}
`;

/**
 * Pass @param sid of @type: SID, to get the correct shader
 */
export function VertexShaderChoose(sid) {

    if (sid & SID.ATTR.STYLE) {
        return VS_DEFAULT;
    }

    // else if (sid & SID.TEST_SHADER) { return VS_VORTEX; }
    else if (sid & SID.TEST_SHADER) { return VS_VORTEX2; }
    // else if (sid & SID.TEST_SHADER) { return VS_EXPLOSION_ATTR_TIMER; }
    else if (sid & SID.ATTR.TEX2 && sid & SID.ATTR.SDF_PARAMS) { 
        return VS_DEFAULT_TEXTURE_SDF; 
    }
    else if (sid & SID.FX.FS_SHADOW) { return VS_SHADOW; }
    else if (sid & SID.ATTR.TEX2) { 
        return VertexShaderCreate(sid);
        // return VS_DEFAULT_TEXTURE; 
    }
    else if (sid & SID.FX.FS_PARTICLES) { return VS_PARTICLES; }
    else if (sid & SID.FX.FS_GLOW) { return VS_GLOW; }
    else if (sid & SID.FX.FS_VORTEX) { return VS_VORTEX2; }
    else if (sid & SID.FX.FS_TWIST) { return VS_TWIST; }
    else if (sid & SID.FX.FS_EXPLOSION_CIRCLE
        || sid & SID.FX.FS_EXPLOSION_SIMPLE
        || sid & SID.FX.FS_VOLUMETRIC_EXPLOSION) {
        return VS_EXPLOSION_ATTR_TIMER;
    }
    else if (sid & SID.FX.FS_CRAMBLE) { return VS_CRAMBLE; }

    alert('No Vertex Shader found with this SID');
}

