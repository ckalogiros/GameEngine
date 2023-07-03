export const FS_HIGH_TECH = `#version 300 es

#define MAX_NUM_PARAMS_BUFFER 5
precision highp float;

in mediump vec4  v_col;
in mediump vec2  v_wpos;
in mediump float v_time;
in mediump vec2  v_dim;
in mediump float v_params[MAX_NUM_PARAMS_BUFFER]; 

out vec4 FragColor;

// by srtuss, 2013

// rotate position around axis
vec2 rotate(vec2 p, float a)
{
	return vec2(p.x * cos(a) - p.y * sin(a), p.x * sin(a) + p.y * cos(a));
}

// 1D random numbers
float rand(float n)
{
    return fract(tan(n) * 43758.5453123);
}

// 2D random numbers
vec2 rand2(in vec2 p)
{
	return fract(vec2(sin(p.x * 591.32 + p.y * 154.077), tan(p.x * 391.32 + p.y * 49.077)));
}

// 1D noise
float noise1(float p)
{
	float fl = floor(p);
	float fc = fract(p);
	return mix(rand(fl), rand(fl + 1.0), fc);
}

// voronoi distance noise, based on iq's articles
float voronoi(in vec2 x)
{
	vec2 p = floor(x);
	vec2 f = fract(x);
	
	vec2 res = vec2(8.0);
	for(int j = -1; j <= 1; j ++)
	{
		for(int i = -1; i <= 1; i ++)
		{
			vec2 b = vec2(i, j);
			vec2 r = vec2(b) - f + rand2(p + b);
			
			// chebyshev distance, one of many ways to do this
			float d = max(abs(r.x), abs(r.y));
			
			if(d < res.x)
			{
				res.y = res.x;
				res.x = d;
			}
			else if(d < res.y)
			{
				res.y = d;
			}
		}
	}
	return res.y - res.x;
}





void main()
{
	float t = v_params[2]*.1;

	vec2 res = vec2(v_params[0], v_params[1]);              // Screen resolution
	res.x /= res.x/res.y;                                   // Transform from screen resolution to mesh resolution
	vec2 uv = gl_FragCoord.xy/res;                          // Transform to 0.0-1.0 coord space
	uv -= vec2(v_wpos.x/res.x, 1.-(v_wpos.y/res.y));        // Transform to meshes local coord space 


   float flicker = noise1(t * 2.0) * 0.8 + 0.4;

	vec2 suv = uv;
	
	
	float v = 0.0;
	
	// that looks highly interesting:
	// v *= (.3 - length(uv) * .8);
	
	
	// a bit of camera movement
	// uv *= .6 + sin(t * 0.1) * 0.4;
	//uv = rotate(uv, sin(t * 0.3) * 1.0);
	uv += t * 0.03;
	
   	
   uv *= 1.6; // Zoom
   uv.x += .2; // Translate to find a nice pattern
	
	// add some noise octaves
	float a = 0.6, f = 1.0;
	
	for(int i = 0; i < 3; i ++) // 4 octaves also look nice, its getting a bit slow though
	{	
		float v1 = voronoi(uv * f + 5.0);
		float v2 = 0.0;
		
		// make the moving electrons-effect for higher octaves
		if(i > 0)
		{
			// of course everything based on voronoi
			v2 = voronoi(uv * f * 0.9 + 0.0 + t);
			
			float va = 0.0, vb = 0.0;
			va = (1.0 - smoothstep(0.0, 0.07, v1));
			vb = (1.0 - smoothstep(0.0, 0.08, v2));
			v += a * pow(va * (0.5 + vb), 2.0);
		}
		
		// make sharp edges
		v1 = (1.0 - smoothstep(0.0, 0.3, v1));
		
		// noise is used as intensity map
		//v2 = a * (noise1(v1 * 5.5 + 0.1));
      //v2 = a * (noise1(v1 * 18.5 + 0.8));
		// v2 = a * (noise1(v1 * 13.5 + 0.1));
		v2 = fract(a * (noise1(v1 * 13.5 + 0.1)));
        
		// octave 0's intensity changes a bit
		// if(i == 0)
		// 	v += v2 * flicker;
		// else
		// 	v += v2;
            
      v += v2;
		
		f *= 3.0;
		a *= 0.6;
	}

	// slight vignetting
	// v *= exp(-0.6 * length(suv)) * 1.2;
	
	// use texture channel0 for color? why not.
	// vec3 cexp = texture(iChannel0, uv * 0.001).xyz * 3.0 + texture(iChannel0, uv * 0.01).xyz;//vec3(1.0, 2.0, 4.0);
	// cexp *= 1.4;
	/*
		BLUE
			0.345, 					0.780, 					0.988
			0.3491902834008097, 	0.7894736842105263, 	1.0

		PURPLE
			0.361, 						0.020, 					0.839
	*/
	// old blueish color set
	// vec3 cexp = vec3(1.0/0.3491902834008097, 1.0/0.7894736842105263, 1.);
	vec3 cexp = vec3(1.0/0.3491902834008097, 1.0/0.2, 1.);
	// vec3 cexp = vec3(6.0, 4.0, 2.5);
	// cexp *= .9;
	// vec3 cexp = vec3(1.0, 1.0, 1.0);
    
	// vec3 col = vec3(pow(v, cexp.x), pow(v, cexp.y), pow(v, cexp.z)) * .5;
	vec3 col = vec3(pow(v, cexp.x), pow(v, cexp.y), pow(v, cexp.z)) ;
	// vec3 col = vec3(fract(v));
	
	FragColor = vec4(col, 1.0);
}
`;

// export const TEMP = `#version 300 es

// #define MAX_NUM_PARAMS_BUFFER 5

// precision mediump float;

// in mediump vec4  v_col;
// in mediump vec2  v_wpos;
// in mediump vec2  v_dim;
// in mediump float v_params[MAX_NUM_PARAMS_BUFFER];   

// out vec4 FragColor;
// vec2 hash22(vec2 p, float iTime) 
// { 

//     // Faster, but doesn't disperse things quite as nicely as other combinations. :)
//     float n = sin(dot(p, vec2(41, 245)));
//     // float n = sin(dot(p, vec2(41, 289)));
//     return fract(vec2(262144, 32768)*n)*.75 + .25; 

//     // Animated.
//     // p = (vec2(262144, 32768)*n); 
//     p = (vec2(262144, 32768)*n); 
//     return sin( p*6.2831853 + iTime )*.35 + .65;

// }

// float Voronoi(vec2 p, float iTime)
// {

// 	vec2 g = floor(p), o; p -= g;
// 	vec3 d = vec3(1); // 1.4, etc.
//     float r = 0.;

// 	for(int y = -1; y <= 1; y++)
//     {
// 		for(int x = -1; x <= 1; x++)
//         {

// 			o = vec2(x, y);
//             o += hash22(g + o, iTime) - p;

// 			r = dot(o, o);

//             // 1st, 2nd and 3rd nearest squared distances.
//             d.z = max(d.x, max(d.y, min(d.z, r))); // 3rd.
//             d.y = max(d.x, min(d.y, r)); // 2nd.
//             d.x = min(d.x, r); // Closest.

// 		}
// 	}

// 	d = sqrt(d); // Squared distance to distance.

//     // Fabrice's formula.
//     return min(2./(1./max(d.y - d.x, .001) + 1./max(d.z - d.x, .001)), 1.);
//     // Dr2's variation - See "Voronoi Of The Week": https://www.shadertoy.com/view/lsjBz1
//     //return min(smin(d.z, d.y, .2) - d.x, 1.);
// }
// vec2 hMap(vec2 uv, float iTime)
// {

//     // Plain Voronoi value. We're saving it and returning it to use when coloring.
//     // It's a little less tidy, but saves the need for recalculation later.
//     float h = Voronoi(uv*6., iTime);

//     // Adding some bordering and returning the result as the height map value.
//     float c = smoothstep(0., fwidth(h)*2., h - .09)*h;
//     c += (1.-smoothstep(0., fwidth(h)*3., h - .22))*c*.5; 

//     // Returning the rounded border Voronoi, and the straight Voronoi values.
//     return vec2(c, h);
// }

// float Rect(vec2 p, vec2 size, float t) 
// {
//    vec2 d = abs(p) - size; 
// 	float pix = length(max(d, vec2(0))-sin(t) )+ min(max(d.x, d.y), 0.0);
// 	return pix;
// }

// void main()
// {
//    float t = v_params[2]*.1;
//    vec2 dim = v_dim;                                       // Mesh Dimentions
//    dim /= (min(dim.x, dim.y) / max(dim.x, dim.y))*1.5;     // Mesh Dimentions
//    vec2 uv = (gl_FragCoord.xy)/dim;                         // Transform to 0.0-1.0 coord space
//    uv -= v_wpos/dim;                                       // Transform to meshes local coord space 
//    // uv*=sin(t);

// 	float len = length(uv);
// 	// vec3 col = mix(vec3(0.345, 0.780, 0.988), vec3(0.361, 0.020, 0.839), fract(len*1.));
// 	// vec3 col = mix(vec3(0.345, 0.780, 0.988), vec3(0.361, 0.020, 0.839), len);
// 	vec3 col = vec3(0.2, 0.7, 0.8);


// 	float rect1 = (Rect(fract(vec2(uv.x-.0, uv.y-.0)), vec2(.7, .1), t));
//    // float pixel = fract((1. - smoothstep(.0, 0.05, rect1)))*.5;
//    float pixel = ((1. - smoothstep(.0, 0.05, rect1)));
//    // float pixel = ((smoothstep(.0, 0.05, rect1)));
//    // float pixel = ((smoothstep(.0, 0.4, rect1)));


// 	float d = (smoothstep(.2, .9, fract(len*1.)));

// 	// float c = abs(fract((len*5.) * 1.-t)); // GOOD! fract(len*x), x denoting the number of circles to divide to.
// 	// float c = len*(1.-t);
// 	// float c = (1.-t);
// 	// float c = (t);
// 	// vec2 c = abs(len * fract(1.-t)); // GOOD!
// 	// float c = abs(fract(len) * (1.-t)); // GOOD!
// 	float c = abs((len*d)); // GOOD!
// 	// vec2 c = vec2(len*d);
// 	// vec2 c = hMap(uv, t);

//    // col += (1. - col)*(1.-smoothstep(0., fwidth(col.x)*3., col.x - .62))*col.y; // Highlighting the border.
//    // col += (col)*(1.-smoothstep(0., fwidth(c.y)*3., c.y - .22))*c.x*.2; // Highlighting the border.
//    // col += (1. - col)*(1.-smoothstep(0., fwidth(c.y*8.), c.y - .2)); // Highlighting the border.
// 	// col += vec3(c); // Highlighting the border.

// 	// col += vec3(d); // Highlighting the border.
// 	col += vec3(pixel)*1.; // Highlighting the border.
// 	// col += vec3(pixel*c)*.1; // Highlighting the border.

//    FragColor = vec4(col, 1.);
// 	float alpha = .7;
//    // FragColor = vec4(col*alpha, alpha);
// }
// `;
export const TEMP = `#version 300 es

#define MAX_NUM_PARAMS_BUFFER 5

precision mediump float;

in mediump vec4  v_col;
in mediump vec2  v_wpos;
in mediump vec2  v_dim;
in mediump float v_params[MAX_NUM_PARAMS_BUFFER];   

out vec4 FragColor;

//===============================================================

float sdLine( in vec2 p, in vec2 a, in vec2 b )
{
	vec2 pa = p - a;
	vec2 ba = b - a;
	float h = clamp( dot(pa,ba)/dot(ba,ba), 0.0, 1.0 );
	return length( pa - ba*h );
	// return length( pa - ba );
}

float line( in vec2 p, in vec2 a, in vec2 b, float w , float e)
{
    return 1.0 - smoothstep( -e, e, sdLine( p, a, b ) - w );
}

float Rect(vec2 p, vec2 size)
{
   vec2 d = abs(p) - size; 
	float pix = length(max(d, vec2(0))) + min(max(d.x, d.y), 0.0);
	return pix;
}


//===============================================================

void main()
{
	float t = v_params[2]*.1;

	vec2 res = vec2(v_params[0], v_params[1]);              // Screen resolution
	res.x /= res.x/res.y;                                   // Transform from screen resolution to mesh resolution
	vec2 uv = gl_FragCoord.xy/res;                          // Transform to 0.0-1.0 coord space
	uv -= vec2(v_wpos.x/res.x, 1.-(v_wpos.y/res.y));        // Transform to meshes local coord space 
	
	vec2 dim = v_dim;                                       // Mesh Dimentions
	dim /= (min(dim.x, dim.y) / max(dim.x, dim.y));     // Mesh Dimentions
	// vec2 uv = (gl_FragCoord.xy)/dim;                         // Transform to 0.0-1.0 coord space
	// uv -= v_wpos/dim;                                       // Transform to meshes local coord space 
	
	vec2 p = uv;
	
	vec3 col = vec3(0);
	// float e = 1.0/dim.x;
	float e = 1.0/res.x;
	vec2 r = vec2(0., 0.);
	vec2 pe = r.yx * vec2(-1.,1.);

	
	float bw = 0.004; // Border Width
	float d = 0.1; // Border Distance


	float s = dot(uv,r);
	if( s>-0.3 )
	{
		float r = length(uv);
		if( r<d )
		{
			// Circle
			float nr = r/d;
			// float nr = smoothstep(1., .6, (r/d)-bw);
			// col += .4*nr*nr*nr;
		}
		
		// col += mix(col,vec3(1.), 1.0-smoothstep(-e, e, abs(r-(d+bw-.001))-bw));
		// col += mix(col,vec3(0.7), 1.0-smoothstep(-e, e, abs(r-.11)-bw));
		// col += vec3(1.0-smoothstep(-e,e,abs(r-d)-bw));
		
	}

	
	// Rect
	// vec2 size = vec2(.1, .1);
	vec2 size = v_dim/res *.7;
	// vec2 size = dim *0.5;
	vec2 dd = abs(uv) - size; 
	float rect1 = length(max(dd, vec2(.0))) + min(max(dd.x, dd.y), 0.);
	// float rect1 = length(max(dd, vec2(0))) + min(max(dd.x/dd.x, dd.y/dd.y), 0.0);
	// rect1 += abs(uv.x)*abs(uv.y);
	// rect1 *= (abs(uv.x)+abs(uv.y))*3.2;
	// rect1 += uv.x*uv.y;
	float pixel = 1. - smoothstep(.0, 0.025, rect1);
	// pixel *= (abs(uv.x)+.01+abs(uv.y)+.01)*2.2;
	// pixel *= (max(abs(uv.x)+abs(uv.y), 0.)) + min(max(abs(uv.x), abs(uv.y)), 0.0)*2.2;
	col += vec3(pixel*.5);
	// vec2 temp = 1.0-smoothstep(-e,e,abs(uv-dd)-bw);
	// col.x += temp.x;
	// col.y += temp.y;


	// col = mix( col, vec3(0.7), line(uv, -d*pe, d*pe, bw, e) );
	// col = mix( col, vec3(0.7), line(uv, -d*pe, d*pe, .05, e) );
	// col += line(uv, -d*pe, d*pe, bw, .04);
	// col += line(uv, -.2*pe, .2*pe, .1, .04);

	float alpha = max(col.r, max(col.g, col.b));
	// FragColor = vec4(col, alpha);
	// FragColor = vec4(col*alpha, 1.-alpha);
	FragColor = vec4(col, .5);
}
`;