

export const frag_round_corners_call = '    vec4 color = Stylize();';
export const frag_round_corners = '\
vec4 pos = vec4(.5, .5, .0, .0); \n\
float ScreenH; \n\
float AA;   \n\
vec2 length2(vec4 a) {  \n\
    return vec2(length(a.xy), length(a.zw)); \n\
}  \n\
vec2 rounded_rectangle(vec2 s, float r, float bw) { \n\
    s -= bw +.0002; // Subtract the border \n\
    r = min(r, min(s.x, s.y)); \n\
    s -= r; // Subtract the border-radius \n\
    vec4 d = abs(pos) - s.xyxy; \n\
    vec4 dmin = min(d,0.0); \n\
    vec4 dmax = max(d,0.0); \n\
    vec2 df = max(dmin.xz, dmin.yw) + length2(dmax); \n\
    return (df - r); \n\
} \n\
vec4 Stylize() \n\
{ \n\
   float t = v_uniforms_buffer[2]; \n\ \n\
   // Radius(From 0.01 to 0.35 good values) for rounding corners  \n\
   float uRadius = v_style.x * .008;          \n\
   // Border Width. It is 0.001 for every pixel \n\
   float borderWidth = v_style.y * 0.001;     \n\
   // Border Feather Distance \n\
   float feather = v_style.z;                 \n\
 \n\
   vec2 res = vec2(v_uniforms_buffer[0], v_uniforms_buffer[1]); \n\
   // From 0.3 to 1.2 good values  \n\
   float clarity = 10.4;  \n\
   // float clarity = 1.; // From 0.3 to 1.2 good values  \n\
	ScreenH = min(res.x, res.y)*clarity; \n\
	AA = ScreenH*0.5; \n\
     \n\
   // Transform from screen resolution to mesh resolution \n\
   res.x /= res.x/res.y;                                    \n\
   // Transform to 0.0-1.0 coord space \n\
   vec2 uv = gl_FragCoord.xy/res;                           \n\
   // Transform to meshes local coord space  \n\
   uv -= vec2(v_wpos.x/res.x, 1.-(v_wpos.y/res.y));         \n\
   vec2 dim = vec2(v_dim.x/res.x, v_dim.y/res.y); \n\
 \n\
   pos.xy = uv; \n\
 \n\
   vec2 blur = vec2(0.0, feather * .001); \n\
   vec3 color = vec3(0.0); \n\
    \n\
   vec2 d = rounded_rectangle(dim, mix(0.0, .2, uRadius), 0.); \n\
   vec4 col1 = vec4(0.0, 0.4, 1., 1.); \n\
   vec4 col2 = vec4(0.9, .0, 0.0, 1.); \n\
 \n\
   // Calculate Gradient \n\
   float dist = length(vec2(d.x, 0.1)); \n\
   vec2 p0 = vec2(-dist, 0.0); \n\
   vec2 p1 = vec2(dist, 0.0); \n\
   vec2 pa = pos.xy - p0; \n\
   vec2 ba = p1 - p0; \n\
    \n\
   vec4 src = v_col; \n\
    \n\
   // Calculate alpha (for rounding corners) \n\
   float blend = 1.; \n\
   float dd = d.x - blur.x; \n\
   float wa = clamp(-dd * AA, 0.0, 1.); \n\
   float wb = clamp(-dd / (blur.x+blur.y), 0.0, 1.); \n\
   // float alpha = min(src.a * (wa * wb), blend); \n\
   float alpha = src.a * (wa * wb); \n\
   color += color * (1.0 - alpha) + src.rgb * alpha; \n\
 \n\
   // BORDER \n\
   float bd = (abs(d.x)-borderWidth) - blur.x; \n\
   wa = clamp(-bd * AA, 0.0, 1.0); \n\
   wb = clamp(-bd / (blur.x+blur.y), 0.0, 1.0); \n\
   color += color*vec3(abs(wa * wb)-borderWidth); \n\
 \n\
   // Bevel \n\
   float r = min(uRadius*.17, min(dim.x, dim.y)); \n\
   float f = smoothstep(r, .0, abs(d.x)); \n\
   color = mix(color, pow(color, vec3(2.))*.85, f); \n\
    \n\
   return vec4(color, alpha); \n\
} \n\
';