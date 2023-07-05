const FS_DEFAULT2 = `#version 300 es
#define MAX_NUM_PARAMS_BUFFER 5


precision highp float;
out vec4 frag_color;


in mediump vec4 v_col;
in mediump vec2 v_dim;
in mediump vec2 v_wpos;
in mediump vec2 v_Scale;
in mediump vec3 v_style;
in mediump float v_uniforms_buffer[MAX_NUM_PARAMS_BUFFER];                               // [0]:WinWidth, [1]:WinHeight, [3]:Time


vec4 pos = vec4(.5, .5, .0, .0);
vec3 _color = vec3(0.0);
float ScreenH;
float AA;


vec2 length2(vec4 a) {
    return vec2(length(a.xy),length(a.zw));
}
vec2 rounded_rectangle(vec2 s, float r, float bw) {
    s -= bw +.0002; // Subtract the border
    s -= .01; // TEMP: Subtract the shadow
    r = min(r, min(s.x, s.y));
    s -= r; // Subtract the border-radius
    vec4 d = abs(pos) - s.xyxy;
    vec4 dmin = min(d,0.0);
    vec4 dmax = max(d,0.0);
    vec2 df = max(dmin.xz, dmin.yw) + length2(dmax);
    return (df - r);
}

void main(void) 
{
   float t = v_uniforms_buffer[2];
   float uRadius = v_style.x * .008;                    // Radius(From 0.01 to 0.35 good values) for rounding corners
   float borderWidth = v_style.y * 0.001;                  // Border Width. It is 0.001 for every pixel
   float feather = v_style.z;         // Border Feather Distance
   
   

   vec2 res = vec2(v_uniforms_buffer[0], v_uniforms_buffer[1]);
   float clarity = 10.4; // From 0.3 to 1.2 good values 
   // float clarity = 1.; // From 0.3 to 1.2 good values 
   ScreenH = min(res.x, res.y)*clarity;
   AA = ScreenH*0.5;
   
   res.x /= res.x/res.y;                                   // Transform from screen resolution to mesh resolution
   vec2 uv = gl_FragCoord.xy/res;                          // Transform to 0.0-1.0 coord space
   uv -= vec2(v_wpos.x/res.x, 1.-(v_wpos.y/res.y));        // Transform to meshes local coord space 
   vec2 dim = vec2(v_dim.x/res.x, v_dim.y/res.y)*v_Scale;

   pos.xy = uv;

   //////////////////////////////////////////////////////////////////////////////////////////////////////////


   vec2 blur = vec2(0.0, feather * .001);
   vec3 fcol = vec3(0.0);
   
   vec2 d = rounded_rectangle(dim, mix(0.0, .2, uRadius), 0.);
   vec4 col1 = vec4(0.0, 0.4, 1., 1.);
   vec4 col2 = vec4(0.9, .0, 0.0, 1.);

   // Calculate Gradient
   float dist = length(vec2(d.x, 0.1));
   vec2 p0 = vec2(-dist, 0.0);
   vec2 p1 = vec2(dist, 0.0);
   vec2 pa = pos.xy - p0;
   vec2 ba = p1 - p0;
   
   vec4 src = v_col;
   // float h = clamp( dot(pa,ba)/dot(ba,ba), 0.0, 1.0 );
   // vec4 src = mix(col1, col2, h);
   
   // Calculate alpha (for rounding corners)
   float blend = 1.;
   float dd = d.x - blur.x;
   float wa = clamp(-dd * AA, 0.0, 1.);
   float wb = clamp(-dd / (blur.x+blur.y), 0.0, 1.);
   // float alpha = min(src.a * (wa * wb), blend);
   float alpha = src.a * (wa * wb);
   // fcol += fcol * (1.0 - alpha) + src.rgb * alpha;

   // Shadow
   // float specPoint = 1.;
   // float rd = min(uRadius*1.17, min(dim.x, dim.y));
   // float rd = uRadius+1.17;
   // float s = smoothstep(.0, .001, length(uv + specPoint));
	// fcol = mix(fcol, vec3(.01), s) * 25.;
	// alpha = mix(vec3(.0), fcol, s) * 25.;
   // float s = smoothstep(.0, .3, length(d-.1));
   // float s = smoothstep(.0, .07, length(d));
   // float s = smoothstep(.1, .0, length(vec2((uv.x+abs(d.x))*.3, uv.y*1.4)));
   // float s = smoothstep(d.x, .0, length(vec2((uv.x+abs(d.x))*.3, uv.y*1.4)));
   vec2 d2 = ((dim/res)-d);
   float s = smoothstep(d.x, .0, length(vec2((d2.x+abs(d.x))*.3, uv.y*1.4)));
   // float s = smoothstep(.0, .1, length(vec2(d2*.7)));
	fcol = mix(fcol, vec3(.01), s) * 45.;
	// alpha = s * 1.;

   // BORDER
   float bd = (abs(d.x)-borderWidth) - blur.x;
   wa = clamp(-bd * AA, 0.0, 1.0);
   wb = clamp(-bd / (blur.x+blur.y), 0.0, 1.0);
   // fcol += fcol*vec3(abs(wa * wb)-borderWidth);

   // Bevel
   float r = min(uRadius*.17, min(dim.x, dim.y));
   float f = smoothstep(r, .0, abs(d.x));
   // fcol = mix(fcol, pow(fcol, vec3(2.))*.85, f);


   frag_color = vec4(fcol.rgb, alpha);
    // frag_color = vec4(1.);
}
`;