export const VS_SHADOW = `#version 300 es

#define MAX_NUM_PARAMS_BUFFER 3

layout (location = 0) in mediump vec4 a_Col;
layout (location = 1) in mediump vec4 a_WposTime;
layout (location = 2) in mediump vec2 a_Pos;
layout (location = 3) in mediump vec2 a_Tex;
// layout (location = 3) in mediump vec2 a_Scale;
// layout (location = 4) in mediump vec3 a_Style;

uniform mat4  u_OrthoProj;
uniform mediump float u_Params[MAX_NUM_PARAMS_BUFFER];                  // [0]:WinWidth, [1]:WinHeight, [3]:Time

out mediump vec4 v_Col; 
out mediump vec2 v_Dim; 
out mediump vec2 v_Wpos; 
out mediump float v_Time; 
out mediump vec2 v_TexCoord;
// out mediump float v_Params[MAX_NUM_PARAMS_BUFFER];                   
    
void main(void) {
    
    vec2 scaled = a_Pos;
    gl_Position = u_OrthoProj * vec4(scaled.x + a_WposTime.x, scaled.y + a_WposTime.y, a_WposTime.z, 1.0);
    
    v_Col       = a_Col;
    v_Dim       = abs(a_Pos);
    v_Wpos      = a_WposTime.xy;
    v_Time      = a_WposTime.w;
    v_TexCoord = a_Tex;
    // v_Params    = u_Params;
}

`;

export const FS_SHADOW = `#version 300 es

precision highp float;
out vec4 FragColor;

in mediump vec4  v_Col;
in mediump vec2  v_Wpos;
in mediump float v_Time;
in mediump vec2  v_Dim;
in mediump vec2  v_TexCoord;

uniform sampler2D u_Sampler0;

// in mediump float v_Params[MAX_NUM_PARAMS_BUFFER]; 

#define PI 3.1415926535897932384626433832795
#define PI2 6.283185307179586476925286766559
#define HALHPI 1.5707963267948966192313216916398
#define KERNEL_SIZE 9
#define KER1    1.2, 0.8, -1.2, -0.8, -8., -0.8, -1.2, 0.8, 1.2 
#define NI      1./PI2
#define KER2    NI, NI, NI, NI, -1.1, NI, NI, NI, NI 
#define KER3    1., -1., 1., -1., 2., -1., 1., -1., 1. 
#define KER4    1., -2., 1., -2., 2., -2., 1., -2., 1.  // corners out

float line( in vec2 a, in vec2 b, in vec2 p )
{
	vec2 pa = p - a;
	vec2 ba = b - a;
	float h = clamp( dot(pa,ba)/dot(ba,ba), 0.0, 1.0 );
	return length( pa - ba*h );
}

void main(void) {

    float xdim = v_Dim.x;
    float ydim = v_Dim.y;
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

    float kernel[KERNEL_SIZE] = float[](KER2);

    vec2 p = (-v_Dim + 2.0*gl_FragCoord.xy) / v_Dim.yy;
    // float h = line( vec2(.5, 2.5), vec2(.5,.5), p );
    // float d = 1e20;
    // d = min( d, h );
    float d = length(p);
    // float w = 0.5*fwidth(d); 
    // w *= 1.5; // extra blur

    vec4 col = texture( u_Sampler0, v_TexCoord) * v_Col;
    vec3 c = vec3(0.);
    for(int i = 0; i < KERNEL_SIZE; i++)
        c +=  vec3(texture( u_Sampler0, v_TexCoord + offsets[i])) * v_Col.rgb * kernel[i];

    // float cc = h;
    // col.rgb *= cc;
    // c = mix( vec3(0.0,0.0,0.0), col.rgb, smoothstep(-w,w,d-.32) );
    // c = col.rgb;

    FragColor.rgb = c*2.;
    // FragColor.rgb = c*c*c*4.;
    // FragColor.rgb = c*c*c*8.;
    // FragColor.rgb = c*c*4.;
    // FragColor.rgb = mix( vec3(0.0,0.0,0.0), vec3(c*c*4.), smoothstep(-w,w,d-.32) );;
    // FragColor.rgb = mix( vec3(0.0,0.0,0.0), vec3(c*c*4.), smoothstep(.0,.05, d-.14) );
    // FragColor.rgb = (c*c)+.5;
    // FragColor = col * texture(u_Sampler0, v_TexCoord).a;
    // FragColor = col;
    // FragColor = smoothstep(.0, .3, col) * texture(u_Sampler0, v_TexCoord).a;
    // FragColor = smoothstep(.0, .8, col);

    
    // Create the alpha channel from the current pixel color
    /* 
     * 1. Render transparency only if all colors = 0
     */
    // float a = min(col.r, min(col.g, col.b));
    float a = max(col.r, max(col.g, col.b));
    // if(a <= 0.) FragColor.a = 0.;
    // else{
    //     FragColor.a = (col.r + col.g + col.b) /3.;
    // }
    /* 
     * 2. Render transparency from color average value 
     */
    // FragColor.a = (col.r + col.g + col.b) /3.;
    /* 
     * 3. Render transparency from color value 
     */
    // FragColor.a = max(col.r, max(col.g, col.b));

}

`;