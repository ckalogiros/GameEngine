/**
 * SDF Text Rendering Shader
 */
export const frag_sdf_call = '    color *= Sdf(v_sdf.x, v_sdf.y);';
// export const frag_sdf_call = '    vec4 c = Sdf(v_sdf.x, v_sdf.y); color.a *= c.r;';
export const frag_sdf = '\n\
vec4 Sdf(float inner, float outer){\n\
   float b = max(texture(u_sampler0, v_tex_coord).r, max(texture(u_sampler0, v_tex_coord).g, texture(u_sampler0, v_tex_coord).b));\n\
   float pixelDist = 1. - b;\n\
   // float alpha = 1. - smoothstep(.3, .7, pixelDist);\n\
   float alpha = 1. - smoothstep(inner, inner + outer, pixelDist);\n\
   return vec4(alpha);\n\
}\
';

/**
 * MSDF Text Rendering Shader
 */
export const frag_msdf_call = '    color *= Msdf();';
export const frag_msdf = '\n\
\n\
float median(float r, float g, float b) { \n\
    return max(min(r, g), min(max(r, g), b)); \n\
}\n\
\n\
// uniform float pxRange; // set to distance field\'s pixel range \n\
float pxRange = 3.0; // set to distance field\'s pixel range \n\
\n\
float screenPxRange() {\n\
   vec2 unitRange = vec2(pxRange)/vec2(textureSize(u_sampler0, 0));\n\
   vec2 screenTexSize = vec2(1.0)/fwidth(v_tex_coord);\n\
   return max(0.5*dot(unitRange, screenTexSize), 1.0);\n\
}\n\
\n\
float Msdf() { \n\
   vec3 msd = texture(u_sampler0, v_tex_coord).rgb; \n\
   float sd = median(msd.r, msd.g, msd.b); \n\
   float screenPxDistance = screenPxRange()*(sd - 0.5); \n\
   float opacity = clamp(screenPxDistance + 0.5, 0.0, 1.0); \n\
   vec4 bgColor = vec4(.0, .0, 0., .0);\n\
   vec4 fgColor = vec4(1.0, 1., 1., 1.);\n\
   float alpha = opacity; \n\
   return alpha; \n\
} \n\
';

/**
 * Simple Texture Rendering Shader
 */
export const frag_tex = '\n\
   color *= texture( u_sampler0, v_tex_coord);\n\
   color *= texture(u_sampler0, v_tex_coord).a;\n\
';