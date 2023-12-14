// export const FS_V2DGFX = `#version 300 es

// #define UNIFORM_BUFFER_COUNT 5

// precision mediump float;

// in mediump vec4  v_col;
// in mediump vec2  v_wpos;
// in mediump vec2  v_dim;
// in mediump vec3 v_style;
// in mediump float v_uniforms_buffer[UNIFORM_BUFFER_COUNT];   

// out vec4 frag_color;

// // Global Variables
// float borderWidth;
// float borderFeather;
// float roundness;
// vec4 pos = vec4(0.,0.,0.,0.);

// // undefine if you are running on glslsandbox.com
// #define GLSLSANDBOX

// #ifdef GLSLSANDBOX
// #ifdef GL_ES
// #endif
// // uniform float time;
// uniform vec2 mouse;
// uniform vec2 resolution;
// // #define iTime v_uniforms_buffer[2]

// #define iResolution resolution
// #define iMouse mouse
// #endif

// // interface
// //////////////////////////////////////////////////////////

// // control how source changes are applied
// const int Replace = 0; // default: replace the old source with the new one
// const int Alpha = 1; // alpha-blend the new source on top of the old one
// const int Multiply = 2; // multiply the new source with the old one


// // returns a gradient for 1D graph function f at position x
// #define gradient1D(f,x) (f(x + get_gradient_eps()) - f(x - get_gradient_eps())) / (2.0*get_gradient_eps())
// // returns a gradient for 2D graph function f at position x
// #define gradient2D(f,x) vec2(f(x + vec2(get_gradient_eps(),0.0)) - f(x - vec2(get_gradient_eps(),0.0)),f(x + vec2(0.0,get_gradient_eps())) - f(x - vec2(0.0,get_gradient_eps()))) / (2.0*get_gradient_eps())
// // draws a 1D graph at the current position
// #define graph1D(f) { vec2 pp = get_origin(); graph(pp, f(pp.x), gradient1D(f,pp.x)); }
// // draws a 2D graph at the current position
// #define graph2D(f) { vec2 pp = get_origin(); graph(pp, f(pp), gradient2D(f,pp)); }

// // represents the current drawing context
// // you usually don't need to change anything here
// struct Context {
//     // screen position, query position
//     vec4 position;
//     vec2 shape;
//     vec2 clip;
//     vec2 scale;
//     float line_width;
//     bool premultiply;
//     bool depth_test;
//     vec2 blur;
//     vec4 source;
//     vec2 start_pt;
//     vec2 last_pt;
//     int source_blend;
//     bool has_clip;
//     float source_z;
// };

// // save current stroke width, starting
// // point and blend mode from active context.
// Context _save();
// #define save(name) Context name = _save();
// // restore stroke width, starting point
// // and blend mode to a context previously returned by save()
// // void restore(Context ctx);




// // implementation
// //////////////////////////////////////////////////////////

// vec2 aspect;
// vec2 uv;
// vec2 position;
// vec2 query_position;
// float ScreenH;
// float AA;
// float AAINV;

// //////////////////////////////////////////////////////////
// float det(vec2 a, vec2 b) { return a.x*b.y-b.x*a.y; }
// //////////////////////////////////////////////////////////
// vec3 hue(float hue) {
//     return clamp(abs(mod(hue * 6.0 + vec3(0.0, 4.0, 2.0), 6.0) - 3.0) - 1.0,0.0, 1.0);
// }
// vec3 hsl(float h, float s, float l) {
//     vec3 rgb = hue(h);
//     return l + s * (rgb - 0.5) * (1.0 - abs(2.0 * l - 1.0));
// }
// vec4 hsl(float h, float s, float l, float a) {
//     return vec4(hsl(h,s,l),a);
// }
// //////////////////////////////////////////////////////////
// // init
// #define DEFAULT_SHAPE_V 1e+20
// #define DEFAULT_CLIP_V -1e+20
// #define DEFAULT_DEPTH 1e+30

// Context _stack;
// vec3 _color = vec3(1);
// float _depth = DEFAULT_DEPTH;
// vec2 get_origin() {return _stack.position.xy;}
// vec2 get_query() {return _stack.position.zw;}
// void set_query(vec2 p) {
//     _stack.position.zw = p;
//     _stack.shape.y = DEFAULT_SHAPE_V;
//     _stack.clip.y = DEFAULT_CLIP_V;
// }
// Context _save() {return _stack;}
// mat3 mat2x3_invert(mat3 s)
// {
//     float d = det(s[0].xy,s[1].xy);
//     d = (d != 0.0)?(1.0 / d):d;
//     return mat3(s[1].y*d, -s[0].y*d, 0.0,-s[1].x*d, s[0].x*d, 0.0,det(s[1].xy,s[2].xy)*d,det(s[2].xy,s[0].xy)*d,1.0);
// }
// void set_matrix(mat3 mtx) {
//     mtx = mat2x3_invert(mtx);
//     _stack.position.xy = (mtx * vec3(position,1.0)).xy;
//     _stack.position.zw = (mtx * vec3(query_position,1.0)).xy;
//     _stack.scale = vec2(length(mtx[0].xy), length(mtx[1].xy));
// }
// void transform(mat3 mtx) {
//     mtx = mat2x3_invert(mtx);
//     _stack.position.xy = (mtx * vec3(_stack.position.xy,1.0)).xy;
//     _stack.position.zw = (mtx * vec3(_stack.position.zw,1.0)).xy;
//     _stack.scale *= vec2(length(mtx[0].xy), length(mtx[1].xy));
// }
// void rotate(float a) {
//     float cs = cos(a), sn = sin(a);
//     transform(mat3(cs, sn, 0.0,-sn, cs, 0.0,0.0, 0.0, 1.0));
// }
// void scale(vec2 s) {transform(mat3(s.x,0.0,0.0,0.0,s.y,0.0,0.0,0.0,1.0));}
// void scale(float sx, float sy) {scale(vec2(sx, sy));}
// void scale(float s) {scale(vec2(s));}
// void translate(vec2 p) {transform(mat3(1.0,0.0,0.0,0.0,1.0,0.0,p.x,p.y,1.0));}
// void translate(float x, float y) { translate(vec2(x,y)); }
// void clear() {
//     _color.rgb = mix(_color.rgb, _stack.source.rgb, _stack.source.a);
//     _depth = (_stack.source.a == 1.0)?_stack.source_z:_depth;
// }
// void add_clip(vec2 d) {
//     d = d / _stack.scale;
//     _stack.clip = max(_stack.clip, d);
//     _stack.has_clip = true;
// }
// void add_field(vec2 d) {
//     d = d / _stack.scale;
//     _stack.shape = min(_stack.shape, d);
// }
// void add_field(float c) {_stack.shape.x = min(_stack.shape.x, c);}
// void new_path() {
//     _stack.shape = vec2(DEFAULT_SHAPE_V);
//     _stack.clip = vec2(DEFAULT_CLIP_V);
//     _stack.has_clip = false;
// }
// void set_blur(float b) {
//     if (b == 0.0) {_stack.blur = vec2(0.0, 1.0);} 
//     else {_stack.blur = vec2(b, 0.0);}
// }
// void write_color(vec4 rgba, float w) {
//     if (_stack.depth_test) {
//         if ((w == 1.0) && (_stack.source_z <= _depth)) {_depth = _stack.source_z;} 
//         else if ((w == 0.0) || (_stack.source_z > _depth)) {return;}
//     }
//     float src_a = w * rgba.a;
//     float dst_a = _stack.premultiply?w:src_a;
//     _color.rgb = _color.rgb * (1.0 - src_a) + rgba.rgb * dst_a;
//     // float dst_a = src_a;
//     // _color.rgb = _color.rgb + rgba.rgb * dst_a;
// }
// void depth_test(bool enable) {_stack.depth_test = enable;}
// void premultiply_alpha(bool enable) {_stack.premultiply = enable;}
// float min_uniform_scale() {return min(_stack.scale.x, _stack.scale.y);}
// float uniform_scale_for_aa() {return min(1.0, _stack.scale.x / _stack.scale.y);}
// float calc_aa_blur(float w) {
//     vec2 blur = _stack.blur;
//     w -= blur.x;
//     float wa = clamp(-w*AA*uniform_scale_for_aa(), 0.0, 1.0);
//     float wb = clamp(-w / blur.x + blur.y, 0.0, 1.0);
// 	return wa * wb;
// }
// void fill_preserve() {
//     write_color(_stack.source, calc_aa_blur(_stack.shape.x));
//     if (_stack.has_clip) {write_color(_stack.source, calc_aa_blur(_stack.clip.x));        }
// }
// void fill() {fill_preserve();new_path();}
// void set_line_width(float w) {_stack.line_width = w;}

// void set_line_width_px(float w) {_stack.line_width = w*min_uniform_scale() * AAINV;}
// float get_gradient_eps() {return (1.0 / min_uniform_scale()) * AAINV;}
// vec2 stroke_shape() {return abs(_stack.shape) - _stack.line_width/_stack.scale;}
// void stroke_preserve() {
//     float w = stroke_shape().x;
//     write_color(_stack.source, calc_aa_blur(w));
// }
// void stroke() {stroke_preserve();new_path();}
// vec2 stroke_isolines_shape(float r, float phase) {
//     return abs(fract(_stack.shape/r-phase+0.5)-0.5)*r - _stack.line_width/_stack.scale;
// }
// void stroke_isolines_preserve(float r, float phase) {
//     float w = stroke_isolines_shape(r, phase).x;
//     write_color(_stack.source, calc_aa_blur(w));
// }
// void stroke_isolines_preserve(float r) { stroke_isolines_preserve(r, 0.0); }
// void stroke_isolines_preserve() { stroke_isolines_preserve(0.1); }
// bool in_fill() {return (_stack.shape.y <= 0.0);}
// bool in_stroke() {
//     float w = stroke_shape().y;
//     return (w <= 0.0);
// }
// void set_source_rgba(vec4 c) {
//     c.rgb *= c.rgb;
//     c *= c;
//     if (_stack.source_blend == Multiply) {
//         _stack.source *= c;
//     } 
//     else if (_stack.source_blend == Alpha) {
//     	float src_a = c.a;
//     	float dst_a = _stack.premultiply?1.0:src_a;
// 	    _stack.source =
//             vec4(_stack.source.rgb * (1.0 - src_a) + c.rgb * dst_a,
//                  max(_stack.source.a, c.a));
//     } 
//     else {
//     	_stack.source = c;
//     }
// }
// void set_source_depth(float depth) {_stack.source_z = depth;}
// void set_source_rgba(float r, float g, float b, float a) {set_source_rgba(vec4(r,g,b,a)); }
// void set_source_rgb(vec3 c) {set_source_rgba(vec4(c,1.0));}
// void set_source_rgb(float r, float g, float b) { set_source_rgb(vec3(r,g,b)); }
// void set_source(sampler2D image) {set_source_rgba(texture(image, _stack.position.xy));}
// void set_source_linear_gradient(vec4 color0, vec4 color1, vec2 p0, vec2 p1) {
//     vec2 pa = _stack.position.xy - p0;
//     vec2 ba = p1 - p0;
//     float h = clamp( dot(pa,ba)/dot(ba,ba), 0.0, 1.0 );
//     set_source_rgba(mix(color0, color1, h));
// }
// void set_source_linear_gradient(vec4 color0, vec4 color1) {
//     set_source_rgba(mix(color0, color1, .5));
// }
// void set_source_linear_gradient(vec4 color) {
//     set_source_rgba(color);
// }
// void set_source_linear_gradient(vec3 color0, vec3 color1, vec2 p0, vec2 p1) {
//     set_source_linear_gradient(vec4(color0, 1.0), vec4(color1, 1.0), p0, p1);
// }
// void set_source_radial_gradient(vec4 color0, vec4 color1, vec2 p, float r) {
//     float h = clamp( length(_stack.position.xy - p) / r, 0.0, 1.0 );
//     set_source_rgba(mix(color0, color1, h));
// }

// void set_source_blend_mode(int mode) {_stack.source_blend = mode;}
// vec2 length2(vec4 a) {return vec2(length(a.xy),length(a.zw));}
// vec2 dot2(vec4 a, vec2 b) {return vec2(dot(a.xy,b),dot(a.zw,b));}


// void rounded_rectangle(vec2 s, float r) {
//     s-=borderWidth*2.; // Subtract the border
//     r = min(r, min(s.x, s.y));
//     s -= r; // Subtract the border-radius
//     vec4 d = abs(pos) - s.xyxy;
//     vec4 dmin = min(d,0.0);
//     vec4 dmax = max(d,0.0);
//     vec2 df = max(dmin.xz, dmin.yw) + length2(dmax);
//     add_field(df - r);
// }
// void grid(vec2 size) {
//     vec4 f = abs(fract(_stack.position/size.xyxy+0.5)-0.5)*size.xyxy;
//     add_field(vec2(min(f.x,f.y),min(f.z,f.w)));
// }
// void rings(vec2 p, float r, float phase) {
//     vec4 q = _stack.position - p.xyxy;
//     vec2 f = abs(fract(vec2(length(q.xy),length(q.zw))/r-phase+0.5)-0.5)*r;
//     add_field(f);
// }
// void circle(vec2 p, float r) {
//     vec4 c = _stack.position - p.xyxy;
//     add_field(vec2(length(c.xy),length(c.zw)) - r);
// }
// void circle(float x, float y, float r) { circle(vec2(x,y),r); }
// void circle_px(vec2 p, float r) {circle(p, r/(0.5*ScreenH));}
// void circle_px(float x, float y, float r) {circle_px(vec2(x,y), r);}
// void move_to(vec2 p) {
//     _stack.start_pt = p;
//     _stack.last_pt = p;
// }
// void move_to(float x, float y) { move_to(vec2(x,y)); }

// // stroke only
// void line_to(vec2 p) {
//     vec4 pa = _stack.position - _stack.last_pt.xyxy;
//     vec2 ba = p - _stack.last_pt;
//     vec2 h = clamp(dot2(pa, ba)/dot(ba,ba), 0.0, 1.0);
//     vec2 s = sign(pa.xz*ba.y-pa.yw*ba.x);
//     vec2 d = length2(pa - ba.xyxy*h.xxyy);
//     add_field(d);
//     add_clip(d * s);
//     _stack.last_pt = p;
// }

// void line_to(float x, float y) { line_to(vec2(x,y)); }



// //////////////////////////////////////////////////////////
// // DEMO

// void paint(float t, vec2 res) 
// {
//     clear();
    
//     // grid(vec2(1.0/20.0));
//     // set_line_width_px(1.0);
//     // set_source_rgba(vec4(vec3(.2),0.5));
//     // stroke();    


//     // borderWidth = .000;
//     // rotate(radians(t*6.0));
//     vec2 dim = vec2(v_dim.x/res.x, v_dim.y/res.y);
//     // rounded_rectangle(dim, sin(t*.3)*.5+.4);
//     rounded_rectangle(dim, roundness);
    
//     // set_source_linear_gradient(hsl(0.7, 1.0, 0.5, 0.2),hsl(0.9, 1.0, 0.5, 0.9),vec2(-0.3,-0.4),vec2(0.3, 0.4));
//     set_source_linear_gradient(hsl(0.0, 1.0, 1.0, .15));
//     fill_preserve();

//     set_source_linear_gradient(hsl(0.7, 1.0, 0.5, .1), hsl(0.9, 1.0, 0.5, 1.), vec2(-0.3,-0.4),vec2(0.3, 0.4));
//     set_line_width(borderWidth);
//     // set_source_linear_gradient(hsl(0.9, 1.0, 0.5, 1.0),hsl(0.7, 1.0, 0.5, 1.0),vec2(0.3,0.4),vec2(-0.3, -0.4));
//     stroke();
//     // restore(ctx); 
// }

// vec2 init (vec2 fragCoord, vec2 mouse, vec2 resolution) 
// {
// 	aspect = vec2(resolution.x / resolution.y, 1.0);
// 	ScreenH = min(resolution.x, resolution.y);
// 	AA = ScreenH*0.5;
// 	AAINV = 1.0 / AA;
    

//     vec2 res = vec2(v_uniforms_buffer[0], v_uniforms_buffer[1]);              // Screen resolution
//     res.x /= res.x/res.y;                                   // Transform from screen resolution to mesh resolution
//     vec2 uv = gl_FragCoord.xy/res;                          // Transform to 0.0-1.0 coord space
//     uv -= vec2(v_wpos.x/res.x, 1.-(v_wpos.y/res.y));        // Transform to meshes local coord space 
//     vec2 m = mouse / res;
//     pos.xy = uv;

//     position = uv; // 0-1 coordinates
//     query_position = (m*2.0-1.0)*aspect;

//     _stack = Context(
//         vec4(position, query_position),
//         vec2(DEFAULT_SHAPE_V),
//         vec2(DEFAULT_CLIP_V),
//         vec2(1.0),
//         1.0,
//         false,
//         false,
//         vec2(0.0,1.0),
//         vec4(vec3(0.0),1.0),
//         vec2(0.0),
//         vec2(0.0),
//         Replace,
//         false,
//         DEFAULT_DEPTH
//     );

//     return res;
// }

// //////////////////////////////////////////////////////////

// void main() 
// {
//     float t = v_uniforms_buffer[2];
//     vec2 res = vec2(v_uniforms_buffer[0], v_uniforms_buffer[1]);
//     float clarity = 1.8; // The greater, the less blured is the stroke 
//     res = init(gl_FragCoord.xy*1., vec2(1.,1.), res*clarity);

//     roundness = v_style.x* .008;
//     borderWidth = v_style.y * 0.001;
//     borderFeather = v_style.z * .001;

//     paint(t, res);

//     vec3 powe = vec3(1./2.2);
//     frag_color = vec4(pow(_color.rgb, powe), .0);
// }


// `;

// /** Save 1 */
// // export const FS_V2DGFX = `#version 300 es

// // #define UNIFORM_BUFFER_COUNT 5

// // precision mediump float;

// // in mediump vec4  v_col;
// // in mediump vec2  v_wpos;
// // in mediump vec2  v_dim;
// // in mediump vec3 v_style;
// // in mediump float v_uniforms_buffer[UNIFORM_BUFFER_COUNT];   

// // out vec4 frag_color;

// // // Global Variables
// // float borderWidth;
// // float borderFeather;
// // float roundness;
// // vec4 pos = vec4(0.,0.,0.,0.);

// // // undefine if you are running on glslsandbox.com
// // #define GLSLSANDBOX

// // #ifdef GLSLSANDBOX
// // #ifdef GL_ES
// // #endif
// // // uniform float time;
// // uniform vec2 mouse;
// // uniform vec2 resolution;
// // // #define iTime v_uniforms_buffer[2]

// // #define iResolution resolution
// // #define iMouse mouse
// // #endif

// // // interface
// // //////////////////////////////////////////////////////////

// // // control how source changes are applied
// // const int Replace = 0; // default: replace the old source with the new one
// // const int Alpha = 1; // alpha-blend the new source on top of the old one
// // const int Multiply = 2; // multiply the new source with the old one


// // // returns a gradient for 1D graph function f at position x
// // #define gradient1D(f,x) (f(x + get_gradient_eps()) - f(x - get_gradient_eps())) / (2.0*get_gradient_eps())
// // // returns a gradient for 2D graph function f at position x
// // #define gradient2D(f,x) vec2(f(x + vec2(get_gradient_eps(),0.0)) - f(x - vec2(get_gradient_eps(),0.0)),f(x + vec2(0.0,get_gradient_eps())) - f(x - vec2(0.0,get_gradient_eps()))) / (2.0*get_gradient_eps())
// // // draws a 1D graph at the current position
// // #define graph1D(f) { vec2 pp = get_origin(); graph(pp, f(pp.x), gradient1D(f,pp.x)); }
// // // draws a 2D graph at the current position
// // #define graph2D(f) { vec2 pp = get_origin(); graph(pp, f(pp), gradient2D(f,pp)); }

// // // represents the current drawing context
// // // you usually don't need to change anything here
// // struct Context {
// //     // screen position, query position
// //     vec4 position;
// //     vec2 shape;
// //     vec2 clip;
// //     vec2 scale;
// //     float line_width;
// //     bool premultiply;
// //     bool depth_test;
// //     vec2 blur;
// //     vec4 source;
// //     vec2 start_pt;
// //     vec2 last_pt;
// //     int source_blend;
// //     bool has_clip;
// //     float source_z;
// // };

// // // save current stroke width, starting
// // // point and blend mode from active context.
// // Context _save();
// // #define save(name) Context name = _save();
// // // restore stroke width, starting point
// // // and blend mode to a context previously returned by save()
// // // void restore(Context ctx);




// // // implementation
// // //////////////////////////////////////////////////////////

// // vec2 aspect;
// // vec2 uv;
// // vec2 position;
// // vec2 query_position;
// // float ScreenH;
// // float AA;
// // float AAINV;

// // //////////////////////////////////////////////////////////
// // float det(vec2 a, vec2 b) { return a.x*b.y-b.x*a.y; }
// // //////////////////////////////////////////////////////////
// // vec3 hue(float hue) {
// //     return clamp(abs(mod(hue * 6.0 + vec3(0.0, 4.0, 2.0), 6.0) - 3.0) - 1.0,0.0, 1.0);
// // }
// // vec3 hsl(float h, float s, float l) {
// //     vec3 rgb = hue(h);
// //     return l + s * (rgb - 0.5) * (1.0 - abs(2.0 * l - 1.0));
// // }
// // vec4 hsl(float h, float s, float l, float a) {
// //     return vec4(hsl(h,s,l),a);
// // }
// // //////////////////////////////////////////////////////////
// // // init
// // #define DEFAULT_SHAPE_V 1e+20
// // #define DEFAULT_CLIP_V -1e+20
// // #define DEFAULT_DEPTH 1e+30

// // Context _stack;
// // vec3 _color = vec3(1);
// // float _depth = DEFAULT_DEPTH;
// // vec2 get_origin() {return _stack.position.xy;}
// // vec2 get_query() {return _stack.position.zw;}
// // void set_query(vec2 p) {
// //     _stack.position.zw = p;
// //     _stack.shape.y = DEFAULT_SHAPE_V;
// //     _stack.clip.y = DEFAULT_CLIP_V;
// // }
// // Context _save() {return _stack;}
// // mat3 mat2x3_invert(mat3 s)
// // {
// //     float d = det(s[0].xy,s[1].xy);
// //     d = (d != 0.0)?(1.0 / d):d;
// //     return mat3(s[1].y*d, -s[0].y*d, 0.0,-s[1].x*d, s[0].x*d, 0.0,det(s[1].xy,s[2].xy)*d,det(s[2].xy,s[0].xy)*d,1.0);
// // }
// // void set_matrix(mat3 mtx) {
// //     mtx = mat2x3_invert(mtx);
// //     _stack.position.xy = (mtx * vec3(position,1.0)).xy;
// //     _stack.position.zw = (mtx * vec3(query_position,1.0)).xy;
// //     _stack.scale = vec2(length(mtx[0].xy), length(mtx[1].xy));
// // }
// // void transform(mat3 mtx) {
// //     mtx = mat2x3_invert(mtx);
// //     _stack.position.xy = (mtx * vec3(_stack.position.xy,1.0)).xy;
// //     _stack.position.zw = (mtx * vec3(_stack.position.zw,1.0)).xy;
// //     _stack.scale *= vec2(length(mtx[0].xy), length(mtx[1].xy));
// // }
// // void rotate(float a) {
// //     float cs = cos(a), sn = sin(a);
// //     transform(mat3(cs, sn, 0.0,-sn, cs, 0.0,0.0, 0.0, 1.0));
// // }
// // void scale(vec2 s) {transform(mat3(s.x,0.0,0.0,0.0,s.y,0.0,0.0,0.0,1.0));}
// // void scale(float sx, float sy) {scale(vec2(sx, sy));}
// // void scale(float s) {scale(vec2(s));}
// // void translate(vec2 p) {transform(mat3(1.0,0.0,0.0,0.0,1.0,0.0,p.x,p.y,1.0));}
// // void translate(float x, float y) { translate(vec2(x,y)); }
// // void clear() {
// //     _color.rgb = mix(_color.rgb, _stack.source.rgb, _stack.source.a);
// //     _depth = (_stack.source.a == 1.0)?_stack.source_z:_depth;
// // }
// // void add_clip(vec2 d) {
// //     d = d / _stack.scale;
// //     _stack.clip = max(_stack.clip, d);
// //     _stack.has_clip = true;
// // }
// // void add_field(vec2 d) {
// //     d = d / _stack.scale;
// //     _stack.shape = min(_stack.shape, d);
// // }
// // void add_field(float c) {_stack.shape.x = min(_stack.shape.x, c);}
// // void new_path() {
// //     _stack.shape = vec2(DEFAULT_SHAPE_V);
// //     _stack.clip = vec2(DEFAULT_CLIP_V);
// //     _stack.has_clip = false;
// // }
// // void set_blur(float b) {
// //     if (b == 0.0) {_stack.blur = vec2(0.0, 1.0);} 
// //     else {_stack.blur = vec2(b, 0.0);}
// // }
// // void write_color(vec4 rgba, float w) {
// //     if (_stack.depth_test) {
// //         if ((w == 1.0) && (_stack.source_z <= _depth)) {_depth = _stack.source_z;} 
// //         else if ((w == 0.0) || (_stack.source_z > _depth)) {return;}
// //     }
// //     float src_a = w * rgba.a;
// //     float dst_a = _stack.premultiply?w:src_a;
// //     _color.rgb = _color.rgb * (1.0 - src_a) + rgba.rgb * dst_a;
// //     // float dst_a = src_a;
// //     // _color.rgb = _color.rgb + rgba.rgb * dst_a;
// // }
// // void depth_test(bool enable) {_stack.depth_test = enable;}
// // void premultiply_alpha(bool enable) {_stack.premultiply = enable;}
// // float min_uniform_scale() {return min(_stack.scale.x, _stack.scale.y);}
// // float uniform_scale_for_aa() {return min(1.0, _stack.scale.x / _stack.scale.y);}
// // float calc_aa_blur(float w) {
// //     vec2 blur = _stack.blur;
// //     w -= blur.x;
// //     float wa = clamp(-w*AA*uniform_scale_for_aa(), 0.0, 1.0);
// //     float wb = clamp(-w / blur.x + blur.y, 0.0, 1.0);
// // 	return wa * wb;
// // }
// // void fill_preserve() {
// //     write_color(_stack.source, calc_aa_blur(_stack.shape.x));
// //     if (_stack.has_clip) {write_color(_stack.source, calc_aa_blur(_stack.clip.x));        }
// // }
// // void fill() {fill_preserve();new_path();}
// // void set_line_width(float w) {_stack.line_width = w;}

// // void set_line_width_px(float w) {_stack.line_width = w*min_uniform_scale() * AAINV;}
// // float get_gradient_eps() {return (1.0 / min_uniform_scale()) * AAINV;}
// // vec2 stroke_shape() {return abs(_stack.shape) - _stack.line_width/_stack.scale;}
// // void stroke_preserve() {
// //     float w = stroke_shape().x;
// //     write_color(_stack.source, calc_aa_blur(w));
// // }
// // void stroke() {stroke_preserve();new_path();}
// // vec2 stroke_isolines_shape(float r, float phase) {
// //     return abs(fract(_stack.shape/r-phase+0.5)-0.5)*r - _stack.line_width/_stack.scale;
// // }
// // void stroke_isolines_preserve(float r, float phase) {
// //     float w = stroke_isolines_shape(r, phase).x;
// //     write_color(_stack.source, calc_aa_blur(w));
// // }
// // void stroke_isolines_preserve(float r) { stroke_isolines_preserve(r, 0.0); }
// // void stroke_isolines_preserve() { stroke_isolines_preserve(0.1); }
// // bool in_fill() {return (_stack.shape.y <= 0.0);}
// // bool in_stroke() {
// //     float w = stroke_shape().y;
// //     return (w <= 0.0);
// // }
// // void set_source_rgba(vec4 c) {
// //     c.rgb *= c.rgb;
// //     c *= c;
// //     if (_stack.source_blend == Multiply) {
// //         _stack.source *= c;
// //     } 
// //     else if (_stack.source_blend == Alpha) {
// //     	float src_a = c.a;
// //     	float dst_a = _stack.premultiply?1.0:src_a;
// // 	    _stack.source =
// //             vec4(_stack.source.rgb * (1.0 - src_a) + c.rgb * dst_a,
// //                  max(_stack.source.a, c.a));
// //     } 
// //     else {
// //     	_stack.source = c;
// //     }
// // }
// // void set_source_depth(float depth) {_stack.source_z = depth;}
// // void set_source_rgba(float r, float g, float b, float a) {set_source_rgba(vec4(r,g,b,a)); }
// // void set_source_rgb(vec3 c) {set_source_rgba(vec4(c,1.0));}
// // void set_source_rgb(float r, float g, float b) { set_source_rgb(vec3(r,g,b)); }
// // void set_source(sampler2D image) {set_source_rgba(texture(image, _stack.position.xy));}
// // void set_source_linear_gradient(vec4 color0, vec4 color1, vec2 p0, vec2 p1) {
// //     vec2 pa = _stack.position.xy - p0;
// //     vec2 ba = p1 - p0;
// //     float h = clamp( dot(pa,ba)/dot(ba,ba), 0.0, 1.0 );
// //     set_source_rgba(mix(color0, color1, h));
// // }
// // void set_source_linear_gradient(vec4 color0, vec4 color1) {
// //     set_source_rgba(mix(color0, color1, .5));
// // }
// // void set_source_linear_gradient(vec4 color) {
// //     set_source_rgba(color);
// // }
// // void set_source_linear_gradient(vec3 color0, vec3 color1, vec2 p0, vec2 p1) {
// //     set_source_linear_gradient(vec4(color0, 1.0), vec4(color1, 1.0), p0, p1);
// // }
// // void set_source_radial_gradient(vec4 color0, vec4 color1, vec2 p, float r) {
// //     float h = clamp( length(_stack.position.xy - p) / r, 0.0, 1.0 );
// //     set_source_rgba(mix(color0, color1, h));
// // }

// // void set_source_blend_mode(int mode) {_stack.source_blend = mode;}
// // vec2 length2(vec4 a) {return vec2(length(a.xy),length(a.zw));}
// // vec2 dot2(vec4 a, vec2 b) {return vec2(dot(a.xy,b),dot(a.zw,b));}


// // void rounded_rectangle(vec2 s, float r) {
// //     s-=borderWidth*2.; // Subtract the border
// //     r = min(r, min(s.x, s.y));
// //     s -= r; // Subtract the border-radius
// //     vec4 d = abs(pos) - s.xyxy;
// //     vec4 dmin = min(d,0.0);
// //     vec4 dmax = max(d,0.0);
// //     vec2 df = max(dmin.xz, dmin.yw) + length2(dmax);
// //     add_field(df - r);
// // }
// // void grid(vec2 size) {
// //     vec4 f = abs(fract(_stack.position/size.xyxy+0.5)-0.5)*size.xyxy;
// //     add_field(vec2(min(f.x,f.y),min(f.z,f.w)));
// // }
// // void rings(vec2 p, float r, float phase) {
// //     vec4 q = _stack.position - p.xyxy;
// //     vec2 f = abs(fract(vec2(length(q.xy),length(q.zw))/r-phase+0.5)-0.5)*r;
// //     add_field(f);
// // }
// // void circle(vec2 p, float r) {
// //     vec4 c = _stack.position - p.xyxy;
// //     add_field(vec2(length(c.xy),length(c.zw)) - r);
// // }
// // void circle(float x, float y, float r) { circle(vec2(x,y),r); }
// // void circle_px(vec2 p, float r) {circle(p, r/(0.5*ScreenH));}
// // void circle_px(float x, float y, float r) {circle_px(vec2(x,y), r);}
// // void move_to(vec2 p) {
// //     _stack.start_pt = p;
// //     _stack.last_pt = p;
// // }
// // void move_to(float x, float y) { move_to(vec2(x,y)); }

// // // stroke only
// // void line_to(vec2 p) {
// //     vec4 pa = _stack.position - _stack.last_pt.xyxy;
// //     vec2 ba = p - _stack.last_pt;
// //     vec2 h = clamp(dot2(pa, ba)/dot(ba,ba), 0.0, 1.0);
// //     vec2 s = sign(pa.xz*ba.y-pa.yw*ba.x);
// //     vec2 d = length2(pa - ba.xyxy*h.xxyy);
// //     add_field(d);
// //     add_clip(d * s);
// //     _stack.last_pt = p;
// // }

// // void line_to(float x, float y) { line_to(vec2(x,y)); }



// // //////////////////////////////////////////////////////////
// // // DEMO

// // void paint(float t, vec2 res) 
// // {
// //     clear();
    
// //     // grid(vec2(1.0/20.0));
// //     // set_line_width_px(1.0);
// //     // set_source_rgba(vec4(vec3(.2),0.5));
// //     // stroke();    


// //     // borderWidth = .000;
// //     // rotate(radians(t*6.0));
// //     vec2 dim = vec2(v_dim.x/res.x, v_dim.y/res.y);
// //     // rounded_rectangle(dim, sin(t*.3)*.5+.4);
// //     rounded_rectangle(dim, roundness);
    
// //     // set_source_linear_gradient(hsl(0.7, 1.0, 0.5, 0.2),hsl(0.9, 1.0, 0.5, 0.9),vec2(-0.3,-0.4),vec2(0.3, 0.4));
// //     set_source_linear_gradient(hsl(0.0, 1.0, 1.0, .15));
// //     fill_preserve();

// //     // set_source_linear_gradient(hsl(0.7, 1.0, 0.5, .1), hsl(0.9, 1.0, 0.5, 1.), vec2(-0.3,-0.4),vec2(0.3, 0.4));
// //     set_line_width(0.0);
// //     // set_source_linear_gradient(hsl(0.9, 1.0, 0.5, 1.0),hsl(0.7, 1.0, 0.5, 1.0),vec2(0.3,0.4),vec2(-0.3, -0.4));
// //     stroke();
// //     // restore(ctx); 
// // }

// // vec2 init (vec2 fragCoord, vec2 mouse, vec2 resolution) 
// // {
// // 	aspect = vec2(resolution.x / resolution.y, 1.0);
// // 	ScreenH = min(resolution.x, resolution.y);
// // 	AA = ScreenH*0.5;
// // 	AAINV = 1.0 / AA;
    

// //     vec2 res = vec2(v_uniforms_buffer[0], v_uniforms_buffer[1]);              // Screen resolution
// //     res.x /= res.x/res.y;                                   // Transform from screen resolution to mesh resolution
// //     vec2 uv = gl_FragCoord.xy/res;                          // Transform to 0.0-1.0 coord space
// //     uv -= vec2(v_wpos.x/res.x, 1.-(v_wpos.y/res.y));        // Transform to meshes local coord space 
// //     vec2 m = mouse / res;
// //     pos.xy = uv;

// //     position = uv; // 0-1 coordinates
// //     query_position = (m*2.0-1.0)*aspect;

// //     _stack = Context(
// //         vec4(position, query_position),
// //         vec2(DEFAULT_SHAPE_V),
// //         vec2(DEFAULT_CLIP_V),
// //         vec2(1.0),
// //         1.0,
// //         false,
// //         false,
// //         vec2(0.0,1.0),
// //         vec4(vec3(0.0),1.0),
// //         vec2(0.0),
// //         vec2(0.0),
// //         Replace,
// //         false,
// //         DEFAULT_DEPTH
// //     );

// //     return res;
// // }

// // //////////////////////////////////////////////////////////

// // void main() 
// // {
// //     float t = v_uniforms_buffer[2];
// //     vec2 res = vec2(v_uniforms_buffer[0], v_uniforms_buffer[1]);
// //     float clarity = 1.8; // The greater, the less blured is the stroke 
// //     res = init(gl_FragCoord.xy*1., vec2(1.,1.), res*clarity);

// //     roundness = v_style.x* .008;
// //     borderWidth = v_style.y * 0.001;
// //     borderFeather = v_style.z * .001;

// //     paint(t, res);

// //     vec3 powe = vec3(1./2.2);
// //     frag_color = vec4(pow(_color.rgb, powe), .0);
// // }


// // `;

