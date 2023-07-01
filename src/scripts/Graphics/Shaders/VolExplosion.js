export const FS_VOLUMETRIC_EXPLOSION = `#version 300 es

precision mediump float;

in mediump vec4  v_Col;
in mediump vec2  v_Wpos;
in mediump vec2  v_Dim;
in mediump vec2  u_Res;
in mediump float v_Time;

uniform sampler2D u_Sampler0;

out vec4 FragColor;


#define pi 3.14159265
#define R(p, a) p=cos(a)*p+sin(a)*vec2(p.y, -p.x)

// iq's noise
float noise( in vec3 x )
{
   vec3 p = floor(x); vec3 f = fract(x);
	f = f*f*(3.0-2.0*f);
	vec2 uv = (p.xy+vec2(37.0,17.0)*p.z) + f.xy;
	vec2 rg = textureLod( u_Sampler0, (uv+ 0.5)/256.0, 20.0 ).yx;
	return 1. - 0.82*mix( rg.x, rg.y, f.z );
}

float fbm( vec3 p )
{ return noise(p*.06125)*.5 + noise(p*.125)*.25 + noise(p*.25)*.125 + noise(p*.4)*.2; }

float Sphere( vec3 p, float r )
{ return length(p)-r; }

const float nudge = 4.;	// size of perpendicular vector
float normalizer = 1.0 / sqrt(1.0 + nudge*nudge);	// pythagorean theorem on that perpendicular to maintain scale
float SpiralNoiseC(vec3 p, float time)
{
   // float n = -mod(time * 0.2,-2.); // noise amount
   // float n = -mod(sin(time) * 0.5+.5,-2.); // noise amount
   // float n = -mod(sin(time) * 1.5+1.5,-2.); // noise amount
   float n = -sin(time) * 1.3+1.; // noise amount
   float iter = 2.0;
   for (int i = 0; i < 3; i++)
   {
      // add sin and cos scaled inverse with the frequency
      n += -abs(sin(p.y*iter) + cos(p.x*iter)) / iter;	// abs for a ridged look
      p.xy += vec2(p.y, -p.x) * nudge;        // rotate by adding perpendicular and scaling down
      p.xy *= normalizer;
      p.xz += vec2(p.z, -p.x) * nudge;        // rotate on other axis
      p.xz *= normalizer;
      iter *= 1.733733;                       // increase the frequency
   }
   return n;
}

float VolumetricExplosion(vec3 p, float time)
{
   float final = Sphere(p, 8.);
   final += fbm(p*50.);
   final += SpiralNoiseC(p.zxy*0.4132+333., time)*3.0;///1.25;
   return final;
}

float map(vec3 p, float time) 
{
   // float iMouse = time;
   float iMouse = 1.;
	R(p.xz, iMouse*0.8*pi);
	float VolExplosion = VolumetricExplosion(p/0.5, time)*0.5; // scale
	return VolExplosion;
}

// assign color to the media
vec3 computeColor( float density, float radius )
{
	vec3 result = mix( vec3(1.0,0.9,0.8), vec3(0.4,0.15,0.1), density );
	vec3 colCenter = 7.*vec3(0.8,1.0,1.0);
	vec3 colEdge = 1.5*vec3(0.48,0.53,0.5);
	result *= mix( colCenter, colEdge, min( (radius+.05)/.9, 1.15 ) );
	return result;
}

bool RaySphereIntersect(vec3 org, vec3 dir, out float near, out float far)
{
	float b = dot(dir, org);
	float c = dot(org, org) - 8.;
	float delta = b*b - c;
	if( delta < 0.0) return false;
	float deltasqrt = sqrt(delta);
	near = -b - deltasqrt;
	far = -b + deltasqrt;
	return far > 0.0;
}
vec3 ToneMapFilmicALU(vec3 _color)
{
	_color = (_color * (6.2*_color + vec3(0.5))) / (_color * (6.2 * _color + vec3(1.7)) + vec3(0.06));
	return _color;
}

void main()
{  
   vec2 res = u_Res;
   float time = v_Time;
   float ratio = res.y/res.x;
   res.x *= ratio;
   vec2 uv = v_Dim/res.xy;
   uv *= 9.;
   
   
   float key = .0;
	vec3 rd = normalize(vec3(uv, 1.));
	vec3 ro = vec3(0., 0., -6.+key*1.6);
    
	// ld, td: local, total density. w: weighting factor
	float ld=0., td=0., w=0.;
	// t: length of the ray. d: distance function
	float d=1., t=0.;
   const float h = 0.1;
	vec4 sum = vec4(0.0);
   
   float min_dist=0.0, max_dist=0.0;

   if(RaySphereIntersect(ro, rd, min_dist, max_dist))
   {
       
      t = min_dist*step(t,min_dist);
      
      // raymarch loop
      //for (int i=0; i<56; i++)
      for (int i=0; i<86; i++)
      {
         vec3 pos = ro + t*rd;
   
         // Loop break conditions.
         if(td>0.9 || d<0.12*t || t>10. || sum.a > 0.99 || t>max_dist) break;
         float d = map(pos, time);           // evaluate distance function
         d = abs(d)+0.07;
         //d = d;

         // change this string to control density 
         d = max(d,0.03);
         
         // point light calculations
         vec3 ldst = vec3(0.0)-pos;
         float lDist = max(length(ldst), 0.001);

         // the color of light 
         vec3 lightColor=vec3(1.0,0.5,0.25);
         sum.rgb+=(lightColor/exp(lDist*lDist*lDist*.08)/30.); // bloom
         
         if (d<h) 
         {
            ld = h - d;                                        // compute local density 
            w = (1. - td) * ld;                                // compute weighting factor 
            td += w + 1./200.;                                 // accumulate density
            // vec4 col = vec4( ToneMapFilmicALU(computeColor(td,lDist)), td );
            vec4 col = vec4(computeColor(td,lDist), td );
            sum += sum.a * vec4(sum.rgb, 0.0) * 0.2 / lDist;	// emission
            col.a *= 0.02;                                      // uniform scale density
            col.rgb *= col.a;                                  // colour by alpha
            sum = sum + col*(1.0 - sum.a);                     // alpha blend in contribution
         }
         
         td += 1./70.;
         t += max(d * 0.08 * max(min(length(ldst),d),2.0), 0.01);
      }
      sum = clamp( sum, 0.0, 1.0 );
      sum.xyz = sum.xyz*sum.xyz*3.*(3.0-2.0*sum.xyz);
      // sum.xyz = sum.xyz*sum.xyz*4.;//*(3.0-2.0*sum.xyz);
   }
   

   // FragColor = vec4(sum.xyz,1.0);
   FragColor = vec4(sum.xyz,0.0);

}
`
/** Save */
// export const FS_VOLUMETRIC_EXPLOSION = `#version 300 es
// #define WHITE  vec4(1., 1., 1., 1.)
// #define MAX_NUM_PARAMS_BUFFER 5

// precision mediump float;

// in mediump vec4  v_Col;
// in mediump vec2  v_Wpos;
// in mediump vec2  v_Dim;
// in mediump float v_Time;
// in mediump float v_Params[MAX_NUM_PARAMS_BUFFER];   

// uniform sampler2D u_Sampler0;

// out vec4 FragColor;


// #define pi 3.14159265
// #define R(p, a) p=cos(a)*p+sin(a)*vec2(p.y, -p.x)

// // iq's noise
// float noise( in vec3 x )
// {
//    vec3 p = floor(x); vec3 f = fract(x);
// 	f = f*f*(3.0-2.0*f);
// 	vec2 uv = (p.xy+vec2(37.0,17.0)*p.z) + f.xy;
// 	vec2 rg = textureLod( u_Sampler0, (uv+ 0.5)/256.0, 20.0 ).yx;
// 	return 1. - 0.82*mix( rg.x, rg.y, f.z );
// }

// float fbm( vec3 p )
// { return noise(p*.06125)*.5 + noise(p*.125)*.25 + noise(p*.25)*.125 + noise(p*.4)*.2; }

// float Sphere( vec3 p, float r )
// { return length(p)-r; }

// const float nudge = 4.;	// size of perpendicular vector
// float normalizer = 1.0 / sqrt(1.0 + nudge*nudge);	// pythagorean theorem on that perpendicular to maintain scale
// float SpiralNoiseC(vec3 p, float time)
// {
//    // float n = -mod(time * 0.2,-2.); // noise amount
//    float n = -mod(sin(time) * 0.5+.5,-2.); // noise amount
//    // float n = -mod(sin(time) * 5. +5.,-2.); // noise amount
//    // float n = -mod(4.9 * 0.2,-2.); // noise amount
//    float iter = 2.0;
//    for (int i = 0; i < 6; i++)
//    {
//       // add sin and cos scaled inverse with the frequency
//       n += -abs(sin(p.y*iter) + cos(p.x*iter)) / iter;	// abs for a ridged look
//       p.xy += vec2(p.y, -p.x) * nudge;        // rotate by adding perpendicular and scaling down
//       p.xy *= normalizer;
//       p.xz += vec2(p.z, -p.x) * nudge;        // rotate on other axis
//       p.xz *= normalizer;
//       iter *= 1.733733;                       // increase the frequency
//    }
//    return n;
// }

// float VolumetricExplosion(vec3 p, float time)
// {
//    float final = Sphere(p, 8.);
//    final += fbm(p*50.);
//    final += SpiralNoiseC(p.zxy*0.4132+333., time)*3.0;///1.25;
//    return final;
// }

// float map(vec3 p, float time) 
// {
//    // float iMouse = sin(time*1.9)*90.;
//    float iMouse = time;
// 	// R(p.yz, iMouse*0.008*pi);
// 	R(p.xz, iMouse*0.8*pi);
// 	float VolExplosion = VolumetricExplosion(p/0.5, time)*0.5; // scale
// 	return VolExplosion;
// }

// // assign color to the media
// vec3 computeColor( float density, float radius )
// {
// 	vec3 result = mix( vec3(1.0,0.9,0.8), vec3(0.4,0.15,0.1), density );
// 	vec3 colCenter = 7.*vec3(0.8,1.0,1.0);
// 	vec3 colEdge = 1.5*vec3(0.48,0.53,0.5);
// 	result *= mix( colCenter, colEdge, min( (radius+.05)/.9, 1.15 ) );
// 	return result;
// }

// bool RaySphereIntersect(vec3 org, vec3 dir, out float near, out float far)
// {
// 	float b = dot(dir, org);
// 	float c = dot(org, org) - 8.;
// 	float delta = b*b - c;
// 	if( delta < 0.0) return false;
// 	float deltasqrt = sqrt(delta);
// 	near = -b - deltasqrt;
// 	far = -b + deltasqrt;
// 	return far > 0.0;
// }
// vec3 ToneMapFilmicALU(vec3 _color)
// {
// 	// _color = max(vec3(0), _color - vec3(0.004));
// 	_color = (_color * (6.2*_color + vec3(0.5))) / (_color * (6.2 * _color + vec3(1.7)) + vec3(0.06));
// 	return _color;
// }

// void main()
// {  
   
//    vec2 res = vec2(v_Params[0], v_Params[1]);
//    float glowSize = v_Params[2];
//    float time = v_Time;
   
//    float ratio = res.y/res.x;
//    res.x *= ratio;
//    // vec2 uv = gl_FragCoord.xy/res.xy;
//    vec2 uv = v_Dim/res.xy;
//    // uv.x -= .27;
//    // uv.y -= .44;
//    // uv *= sin(time) *1.+4.;
//    uv *= 7.;
   
   
//    float key = .0;
// 	vec3 rd = normalize(vec3(uv, 1.));
// 	vec3 ro = vec3(0., 0., -6.+key*1.6);
    
// 	// ld, td: local, total density. w: weighting factor
// 	float ld=0., td=0., w=0.;
// 	// t: length of the ray. d: distance function
// 	float d=1., t=0.;
//    const float h = 0.1;
// 	vec4 sum = vec4(0.0);
   
//    float min_dist=0.0, max_dist=0.0;

//    if(RaySphereIntersect(ro, rd, min_dist, max_dist))
//    {
       
//       t = min_dist*step(t,min_dist);
      
//       // raymarch loop
//       //for (int i=0; i<56; i++)
//       for (int i=0; i<86; i++)
//       {
//          vec3 pos = ro + t*rd;
   
//          // Loop break conditions.
//          if(td>0.9 || d<0.12*t || t>10. || sum.a > 0.99 || t>max_dist) break;
//          float d = map(pos, time);           // evaluate distance function
//          d = abs(d)+0.07;
//          //d = d;

//          // change this string to control density 
//          d = max(d,0.03);
         
//          // point light calculations
//          vec3 ldst = vec3(0.0)-pos;
//          float lDist = max(length(ldst), 0.001);

//          // the color of light 
//          vec3 lightColor=vec3(1.0,0.5,0.25);
//          sum.rgb+=(lightColor/exp(lDist*lDist*lDist*.08)/30.); // bloom
         
//          if (d<h) 
//          {
//             ld = h - d;                                        // compute local density 
//             w = (1. - td) * ld;                                // compute weighting factor 
//             td += w + 1./200.;                                 // accumulate density
//             // vec4 col = vec4( ToneMapFilmicALU(computeColor(td,lDist)), td );
//             vec4 col = vec4(computeColor(td,lDist), td );
//             sum += sum.a * vec4(sum.rgb, 0.0) * 0.2 / lDist;	// emission
//             col.a *= 0.02;                                      // uniform scale density
//             col.rgb *= col.a;                                  // colour by alpha
//             sum = sum + col*(1.0 - sum.a);                     // alpha blend in contribution
//          }
         
//          td += 1./70.;
//          t += max(d * 0.08 * max(min(length(ldst),d),2.0), 0.01);
//       }
//       sum = clamp( sum, 0.0, 1.0 );
//       sum.xyz = sum.xyz*sum.xyz*(3.0-2.0*sum.xyz);
//    }
   

//    // FragColor = vec4(sum.xyz,0.0);
//    FragColor = vec4(sum.xyz,0.0);

// }
// `