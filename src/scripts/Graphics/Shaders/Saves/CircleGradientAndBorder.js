export const TEMP = `#version 300 es

#define MAX_NUM_PARAMS_BUFFER 5

precision mediump float;

in mediump vec4  v_col;
in mediump vec2  v_wpos;
in mediump vec2  v_dim;
in mediump float v_params[MAX_NUM_PARAMS_BUFFER];   

out vec4 FragColor;

// Flip v if in the negative half plane defined by r (this works in 3D too)
vec2 flipIfNeg( in vec2 v, in vec2 r )
{
    float k = dot(v,r);
    return (k>0.0) ? v : -v;
}

// Reflect v if in the negative half plane defined by r (this works in 3D too)
vec2 reflIfNeg( in vec2 v, in vec2 r )
{
    float k = dot(v,r);
    return (k>0.0) ? v : v-2.0*r*k;
}

// Clip v if in the negative half plane defined by r (this works in 3D too)
vec2 clipIfNeg( in vec2 v, in vec2 r )
{
    float k = dot(v,r);
    return (k>0.0) ? v : (v-r*k)*inversesqrt(1.0-k*k/dot(v,v));
}

//===============================================================

float sdLine( in vec2 p, in vec2 a, in vec2 b )
{
	vec2 pa = p - a;
	vec2 ba = b - a;
	float h = clamp( dot(pa,ba)/dot(ba,ba), 0.0, 1.0 );
	return length( pa - ba*h );
}

// https://www.shadertoy.com/view/slj3Dd
float sdArrow( in vec2 p, vec2 a, vec2 b, float w1, float w2 )
{
    const float k = 3.0;
	vec2  ba = b - a;
    float l2 = dot(ba,ba);
    float l = sqrt(l2);

    p = p-a;
    p = mat2(ba.x,-ba.y,ba.y,ba.x)*p/l;
    p.y = abs(p.y);
    vec2 pz = p-vec2(l-w2*k,w2);

    vec2 q = p;
    q.x -= clamp( q.x, 0.0, l-w2*k );
    q.y -= w1;
    float di = dot(q,q);

    q = pz;
    q.y -= clamp( q.y, w1-w2, 0.0 );
    di = min( di, dot(q,q) );

    if( p.x<w1 )
    {
    q = p;
    q.y -= clamp( q.y, 0.0, w1 );
    di = min( di, dot(q,q) );
    }

    if( pz.x>0.0 )
    {
    q = pz;
    q -= vec2(k,-1.0)*clamp( (q.x*k-q.y)/(k*k+1.0), 0.0, w2 );
    di = min( di, dot(q,q) );
    }
    
    float si = 1.0;
    float z = l - p.x;
    if( min(p.x,z)>0.0 )
    {
      float h = (pz.x<0.0) ? w1 : z/k;
      if( p.y<h ) si = -1.0;
    }
    return si*sqrt(di);
}

//===============================================================

float line( in vec2 p, in vec2 a, in vec2 b, float w , float e)
{
    return 1.0 - smoothstep( -e, e, sdLine( p, a, b ) - w );
}

float arrow( in vec2 p, in vec2 a, in vec2 b, float w1, float w2, float e )
{
    return 1.0 - smoothstep( -e, e, sdArrow( p, a, b, w1, w2) );
}

//===============================================================

void main()
{
	float t = v_params[2]*.1;

	vec2 res = vec2(v_params[0], v_params[1]);              // Screen resolution
	res.x /= res.x/res.y;                                   // Transform from screen resolution to mesh resolution
	vec2 uv = gl_FragCoord.xy/res;                          // Transform to 0.0-1.0 coord space
	uv -= vec2(v_wpos.x/res.x, 1.-(v_wpos.y/res.y));        // Transform to meshes local coord space 
	vec2 p = uv;
	vec2 q = p;

	float e = 1.0/res.x;

	//float an = (1.0-smoothstep(-0.1,0.1,sin(0.125*6.283185*(1.0/2.0))));
	//float an = (1.0-sin(0.125*6.283185*(1.0/2.0)));
	float an = 122.;

	vec2 r = vec2( sin(an), cos(an) );
	vec2 pe = r.yx*vec2(-1.0,1.0);

	vec3 col = vec3(21,32,43)/255.0;

	float wi = 0.015;
	float s = dot(p,r);
	if( s>-0.122 )
	{
		float r = length(p);
		if( r<0.12 )
		{
			float nr = r/0.12;
			col += 0.25*nr*nr;
		}
		col = mix(col,vec3(0.7), 1.0-smoothstep(-e,e,abs(r-0.12)-wi));
		col += vec3(1.0-smoothstep(-e,e,abs(r-0.12)-wi));
		
	}

	col = mix( col, vec3(0.7), arrow(p, vec2(0.0), r*0.18, wi, 0.01, e) );
	col = mix( col, vec3(0.7), line(p, -0.12*pe, 0.12*pe, wi, e) );

	{
	float an = cos(0.5*6.283185*t);
	vec2 v = vec2( -cos(an), sin(an) )*0.12;
	vec2 f;
	    if( q.x<0.333 ) f = flipIfNeg( v, r );
	else if( q.x<0.666 ) f = reflIfNeg( v, r );
	else                 f = clipIfNeg( v, r );

	col = mix( col, col+0.2, arrow(p, vec2(0.0), v, wi, 5.0*wi, e) );
	col = mix( col, vec3(1.0,0.7,0.2), arrow(p, vec2(0.0), f, wi, 5.0*wi, e) );
	}

	FragColor = vec4( col, 0.5);
}
`;