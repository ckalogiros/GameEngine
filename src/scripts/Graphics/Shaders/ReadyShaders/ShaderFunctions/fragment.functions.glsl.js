

export const frag_round_corners_call = '    color = Stylize();';
export const frag_round_corners = '\
vec4 pos = vec4(.0, .0, .0, .0); \n\
float ScreenH; \n\
float AA;   \n\
vec2 length2(vec4 a) {  \n\
    return vec2(length(a.xy), length(a.zw)); \n\
}  \n\
vec2 RoundedRectangle(vec2 dim, float r, float bw) {              \n\
  dim -= bw +.0002; // Subtract the border                        \n\
  r = min(r, min(dim.x, dim.y));                                  \n\
  dim -= r; // Subtract the border-radius                         \n\
  vec4 d = abs(pos) - dim.xyxy;                                   \n\
  vec4 dmin = min(d, 0.0);                                        \n\
  vec4 dmax = max(d, 0.0);                                        \n\
  vec2 df = max(dmin.xz, dmin.yw) + length2(dmax);                \n\
  return (df - r);                                                \n\
}                                                                 \n\
vec4 Stylize()                                                    \n\
{                                                                 \n\
  float t = v_uniforms_buffer[2];                                 \n\
  // Radius(From 0.01 to 0.35 good values) for rounding corners   \n\
  float rCorners = v_rCorners * .008;                             \n\
  float feather = v_border_feather;                               \n\
  \n\
#ifdef UB_HAS_RESOLUTION\n\
  vec2 res = vec2(v_uniforms_buffer[UB_IDX0], v_uniforms_buffer[UB_IDX1]);    \n\
  res.x /= res.x/res.y;                                           \n\
#else \n\
vec2 res = vec2(824., 893.);    \n\
  res.x /= res.x/res.y;                                           \n\
  return vec4(1.); \n\
#endif \n\
  vec2 uv = gl_FragCoord.xy/res;                                  \n\
  uv -= vec2(v_wpos.x/res.x, 1.-(v_wpos.y/res.y));                \n\
  pos.xy = uv;                                                    \n\
  vec2 dim = vec2(v_dim.x/res.x, v_dim.y/res.y);                  \n\
  // dim -= vec2(v_wpos.x/res.x, 1.-(v_wpos.y/res.y));                \n\
  // vec2 dim = vec2(v_dim.x, v_dim.y);                  \n\
  \n\
  // From 0.3 to 1.2 good values                                  \n\
  float clarity = 10.4;                                           \n\
  // float clarity = 1.; // From 0.3 to 1.2 good values           \n\
  ScreenH = min(res.x, res.y)*clarity;                            \n\
  AA = ScreenH*.5;                                                \n\
  \n\
  vec2 blur = vec2(0.0, feather * .001);                          \n\
  \n\
  vec2 d = RoundedRectangle(dim, mix(0.0, .2, rCorners), 0.);     \n\
  \n\
  vec4 src = v_col;                                               \n\
  vec3 color = vec3(0.0);                                         \n\
  \n\
  // Calculate alpha (for rounding corners)                       \n\
  float dd = d.x - blur.x;                                        \n\
  // float dd = min(d.x - blur.x, d.x-rCorners);                   \n\
  // float wa = clamp(-dd * AA, 0.0, 1.);                         \n\
  float wa = 1.;                                                  \n\
  float wb = clamp(-dd / (blur.x+blur.y), 0.0, 1.);                \n\
  float alpha = src.a * (wa * wb);                                \n\
  color += color * (1.0 - alpha) + src.rgb * alpha;               \n\
  \n\
  // BORDER                                                       \n\
  // Border Width. It is 0.001 for every pixel                    \n\
  float borderWidth = v_border_width * 0.001;                      \n\
  float bd = (abs(d.x)-borderWidth) - blur.x;                     \n\
  wa = clamp(-bd * AA, 0.0, 1.0);                                 \n\
  wb = clamp(-bd / (blur.x+blur.y), 0.0, 1.0);                    \n\
  color += color * vec3(abs(wa * wb));              \n\
  // color += vec3(.1,.4,.8) * vec3(abs(wa * wb));              \n\
  // color *= 2.*vec3(abs(wa * wb));              \n\
  \n\
  // Bevel. TODO: Control @colorIntensity for the pow() and @darkness for the mult of the pow() \n\
  // float r = min(rCorners*.17, min(dim.x, dim.y)); \n\
  // // float r = min(.023, min(dim.x, dim.y)); \n\
  // float f = smoothstep(r, .0, abs(d.x)-borderWidth); \n\
  // color = mix(color, pow(color, vec3(1.5))*.85, f); \n\
  \n\
  // if(v_uniforms_buffer[2] > 10.) return vec4(1.); \n\
  return vec4(color, alpha); \n\
  \
  \
  \
  \
  \
  \
  \
  \
  \
  \
  // // Calculate Gradient                                        \n\
  // float dist = length(vec2(d.x, 0.1));                         \n\
  // vec2 p0 = vec2(-dist, 0.0);                                  \n\
  // vec2 p1 = vec2(dist, 0.0);                                   \n\
  // vec2 pa = pos.xy - p0;                                       \n\
  // vec2 ba = p1 - p0;                                           \n\
} \n\
';

// #version 300 es
// #define UNIFORM_BUFFER_COUNT 5
// // Fragment Shader
// precision mediump float;
// out vec4 frag_color;
// in vec4 v_col;
// in vec2 v_dim;
// in vec2 v_wpos;
// in float v_border_width;
// in float v_rCorners;
// in float v_border_feather;
// in float v_uniforms_buffer[5];
// vec4 pos = vec4(.5, .5, .0, .0); 
// float ScreenH; 
// float AA;   
// vec2 length2(vec4 a) {  
//     return vec2(length(a.xy), length(a.zw)); 
// }  
// vec2 RoundedRectangle(vec2 s, float r, float bw) {               
//     s -= bw +.0002; // Subtract the border                        
//     r = min(r, min(s.x, s.y));                                    
//     s -= r; // Subtract the border-radius                         
//     vec4 d = abs(pos) - s.xyxy;                                   
//     vec4 dmin = min(d,0.0);                                       
//     vec4 dmax = max(d,0.0);                                       
//     vec2 df = max(dmin.xz, dmin.yw) + length2(dmax);              
//     return (df - r);                                              
// }                                                                 
// vec4 Stylize()                                                    
// {                                                                 
//   float t = v_uniforms_buffer[2];                                 
//   // Radius(From 0.01 to 0.35 good values) for rounding corners   
//   //  float rCorners = v_rCorners * .008;                           
//   float rCorners = 10. * .008;                                     
//   // Border Feather Distance                                      
//    float feather = v_border_feather;                                  
//   // float feather = 5.;                                             
  
//   vec2 res = vec2(v_uniforms_buffer[0], v_uniforms_buffer[1]);    
//   res.x /= res.x/res.y;                                           
//   vec2 uv = gl_FragCoord.xy/res;                                  
//   uv -= vec2(v_wpos.x/res.x, 1.-(v_wpos.y/res.y));                
//   vec2 dim = vec2(v_dim.x/res.x, v_dim.y/res.y);                  
//   pos.xy = uv;                                                    
  
//   // From 0.3 to 1.2 good values                                  
//   float clarity = 10.4;                                           
//   // float clarity = 1.; // From 0.3 to 1.2 good values           
//   ScreenH = min(res.x, res.y)*clarity;                            
//   AA = ScreenH*.5;                                                
  
//   vec2 blur = vec2(0.0, feather * .001);                          
  
//   vec2 d = RoundedRectangle(dim, mix(0.0, .2, rCorners), 0.);     
  
//   vec4 src = v_col;                                               
//   vec3 color = vec3(0.0);                                         
  
//   // Calculate alpha (for rounding corners)                       
//   float dd = d.x - blur.x;                                        
//   // float dd = min(d.x - blur.x, d.x-rCorners);                   
//   // float wa = clamp(-dd * AA, 0.0, 1.);                         
//   float wa = 1.;                                                  
//   float wb = clamp(-dd / (blur.x+blur.y), 0.0, 1.);                
//   float alpha = src.a * (wa * wb);                                
//   color += color * (1.0 - alpha) + src.rgb * alpha;               
  
//   // BORDER                                                       
//   // Border Width. It is 0.001 for every pixel                    
//   //  float borderWidth = v_border_width * 0.001;                      
//   float borderWidth = 6. * 0.001;                                 
//   float bd = (abs(d.x)-borderWidth) - blur.x;                     
//   wa = clamp(-bd * AA, 0.0, 1.0);                                 
//   wb = clamp(-bd / (blur.x+blur.y), 0.0, 1.0);                    
//   color += color * vec3(abs(wa * wb) - borderWidth);              
  
//   // Bevel. TODO: Control @colorIntensity for the pow() and @darkness for the mult of the pow() 
//   // float r = min(rCorners*.17, min(dim.x, dim.y)); 
//   float r = min(.023, min(dim.x, dim.y)); 
//   float f = smoothstep(r, .0, abs(d.x)-borderWidth); 
//   color = mix(color, pow(color, vec3(1.5))*.85, f); 
  
//   // if(v_uniforms_buffer[2] > 10.) return vec4(1.); 
//   return vec4(color, alpha); 
//                       // // Calculate Gradient                                        
//   // float dist = length(vec2(d.x, 0.1));                         
//   // vec2 p0 = vec2(-dist, 0.0);                                  
//   // vec2 p1 = vec2(dist, 0.0);                                   
//   // vec2 pa = pos.xy - p0;                                       
//   // vec2 ba = p1 - p0;                                           
// } 

// void main(void) 
// {
//     vec4 color = Stylize();
//     frag_color = vec4(color);
// }