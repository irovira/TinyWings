#version 300 es

// This is a fragment shader. If you've opened this file first, please
// open and read lambert.vert.glsl before reading on.
// Unlike the vertex shader, the fragment shader actually does compute
// the shading of geometry. For every pixel in your program's output
// screen, the fragment shader is run for every bit of geometry that
// particular pixel overlaps. By implicitly interpolating the position
// data passed into the fragment shader by the vertex shader, the fragment shader
// can compute what color to apply to its pixel based on things like vertex
// position, light position, and vertex color.
precision highp float;

uniform vec2 u_Screen;
uniform vec2 u_BirdPos;

in vec4 fs_Pos;
out vec4 out_Col;

const float radius = 0.03;
const float pi = 3.14159265358979;

// parameters
// Referencing 2D Procedural terrain texturing from shadertoy
// https://www.shadertoy.com/view/lscGzB
const float gradientAngle = 25.0; // degrees
const vec2 lumSatOffset = vec2(0.1,0.0); // range [-1..1]
const float lumSatAngle = 110.0; // degrees
const float lumSatFactor = 0.4;// range [0..1]
const float NoiseFactor = 0.20; // range [0..1]
const float SmoothStepBase = 0.22; // range[0..0.25]
const float TextureSliceFactor = 0.4; // range [0..1]
const float StrideFactor = -3.1; // range[-inf..+inf]
const float GroundSaturation = 4.0; // range [0..1]

// Converts HSV to RGB so we can properly shade the colors using their RGB values
vec3 hsv2rgb (in vec3 hsv) 
{
    return hsv.z * 5.0 * (1.0 + 0.5 * hsv.y * (cos (6.2832 * (hsv.x + vec3 (0.0, 0.6667, 0.3333))) - 1.0));
}

// Transforms RGB values to HSV so we can tune the texture by HSV
vec3 rgb2hsv(vec3 c)
{
    vec4 K = vec4(0.0, -1.0 / 3.0, 2.0 / 3.0, -1.0);
    vec4 p = mix(vec4(c.bg, K.wz), vec4(c.gb, K.xy), step(c.b, c.g));
    vec4 q = mix(vec4(p.xyw, c.r), vec4(c.r, p.yzx), step(p.x, c.r));

    float d = q.x - min(q.w, q.y);
    float e = 1.0e-10;
    return vec3(abs(q.z + (q.w - q.y) / (6.0 * d + e)), d / (q.x + e), q.x);
}

// Gets a color based on a 2D vector
vec3 baseColor(vec2 uv)
{
	vec3 col = vec3(max(uv.y,0.0) + max(uv.x,0.0),
                    max(-uv.y,0.0) + max(uv.x,0.0),
                    max(-uv.x,0.0));
    return col;
} 

// Used to rotate a screenspace position by an angle. see hueSelection in main()
vec2 rotate(vec2 xy, float angle)
{
    float sn = sin(angle);
    float cs = cos(angle);
    return vec2(xy.x * cs - xy.y * sn, xy.y * cs + xy.x * sn);
}

// Converts degrees to radians
float degToRad(float angle)
{
    return angle * pi * (1.0/180.0);
}

///////

// Used for perlin noise function
vec2 hash22(vec2 p)
{
    p = vec2( dot(p,vec2(127.1,311.7)),
			  dot(p,vec2(269.5,183.3)));
    
    return -1.0 + 2.0 * fract(sin(p)*43758.5453123);
}

// Also used for perlin noise function
float hash21(vec2 p)
{
	float h = dot(p,vec2(127.1,311.7));
	
    return -1.0 + 2.0 * fract(sin(h)*43758.5453123);
}

float perlinNoise(vec2 p)
{
    vec2 pi = floor(p);
    vec2 pf = p - pi;
    
    vec2 w = pf * pf * (3.0 - 2.0 * pf);
    
    return mix(mix(dot(hash22(pi + vec2(0.0, 0.0)), pf - vec2(0.0, 0.0)), 
                   dot(hash22(pi + vec2(1.0, 0.0)), pf - vec2(1.0, 0.0)), w.x), 
               mix(dot(hash22(pi + vec2(0.0, 1.0)), pf - vec2(0.0, 1.0)), 
                   dot(hash22(pi + vec2(1.0, 1.0)), pf - vec2(1.0, 1.0)), w.x),
               w.y);
}

float getTex(float u)
{
    u = mod(u,1.0);
    float v = u - mod(u, (TextureSliceFactor+abs(sin(u*6.15159))*0.01));
    return v-mod(v, 0.1);
}

float getTex2(float u)
{
    float res = 0.0;
    
    for (int t = 0;t<6;t++)
        res += getTex(u+float(t)*0.0011);
    return res/6.0;
}

// A funkier hill height
float getGroundHeight(float x)
{
    return sin(x*3.0) * 0.2 + sin(x * 6.17+4740.14) * 0.1 + sin(x * 10.987+19.19) * 0.05 + 0.3;
}

// Gets color of uv coordinate
vec3 getWorldColor(vec2 uv, vec2 hueSelection)
{
    float c = getTex2(uv.x*4.0 + uv.y*StrideFactor)+0.2; 
    
    vec3 colPalette=vec3(0.0);
    
    float angles[4];
    angles[0] = 0.0;
	angles[1] = gradientAngle;
    angles[2] = 180.0;
    angles[3] = 180.0+gradientAngle;
    
    for (int i=0;i<4;i++)
    {
        vec2 dir = rotate(hueSelection, degToRad(angles[i]));
		float ifl = float(i);
        vec3 baseColorHSV = rgb2hsv(baseColor(dir));
        colPalette = mix(colPalette, hsv2rgb(vec3(baseColorHSV.r, 0.3,0.6)), smoothstep(SmoothStepBase*ifl, 0.25*ifl, c));
    }
    colPalette = mix(colPalette, vec3(dot(colPalette, vec3(0.299, 0.587, 0.114))), 1.0-GroundSaturation);
    uv.y = 1.0-uv.y;
    vec2 noisePos = uv;
    float noise = perlinNoise(noisePos*10.0) + perlinNoise(noisePos*20.0)*0.8 + perlinNoise(noisePos*40.0)*0.6 + perlinNoise(noisePos*80.0)*0.4;
    
    float intens = max(pow(0.5, (uv.y-0.10)*9.0), 0.20);
    float unoise = noise*NoiseFactor+(1.0-NoiseFactor);
    
    vec3 recompBase = colPalette*intens*unoise;
    vec3 recomp = mix(recompBase, vec3(1.0), max(intens*0.9-1.0, 0.0));
    return recomp;
}

////////////////////////////////////////////////////////
float getHeight(float dist) {
    return 0.2 * sin(10.0 * dist);
}

bool inBird(float x, float y){
    float xdif = abs(-0.5 - x);
    float ydif = abs(u_BirdPos.y - y);
    return xdif * xdif + ydif * ydif < radius * radius;
}

void main()
{
    float aspect = u_Screen.x / u_Screen.y;
    float sx = fs_Pos.x;
	float sy = fs_Pos.y / aspect;

    float height = getHeight(sx + u_BirdPos.x + 0.5);
    
    float fancyHt = getGroundHeight(sx + u_BirdPos.x + 0.5) - 0.3; 

    ////////////////////////////////////////////////////////////////

	vec2 uv = vec2(fs_Pos.x, fs_Pos.y);
    
	vec2 hueSelection = vec2(1.0,1.0); // random 2D point
    hueSelection = normalize(hueSelection); // normalized

    //  rotates color?
    // baseColor
    vec3 colSkyHSV = rgb2hsv(baseColor(rotate(hueSelection, degToRad(-gradientAngle*1.5))));
    vec3 colSky = hsv2rgb(vec3(colSkyHSV.r, 0.2, 0.65)); // scales down saturation and value of the sky
    
    const float globalTimeFactor = 0.6;

    float iTime = u_BirdPos.x;
    iTime = 0.0;
    
    float pos1 = uv.x + iTime*0.3; // parallax
    float pos2 = uv.x + iTime*0.1; // parallax
    
    // just the camera height?? 
    float camHeight = (getGroundHeight(iTime*0.3 + 0.5) + getGroundHeight(iTime*0.3 + 0.1) + getGroundHeight(iTime*0.3 + 0.9)) / 3.0;
        
    float height1 = uv.y + getGroundHeight(pos1) + 0.6 - camHeight;
    float height2 = uv.y + getGroundHeight(pos2) + 0.0 - camHeight*0.5;
    
    vec3 recomp1 = getWorldColor(vec2(pos1, height1), hueSelection); // foreground
    vec3 recomp2 = mix(colSky, getWorldColor(vec2(pos2, height2), hueSelection), 0.4); // background

    float pixelSize =  aspect;

	vec3 layer1 = mix(colSky, mix(vec3(0.55), recomp2, smoothstep(0.0, pixelSize, 1.0-height2)), smoothstep(-pixelSize, 0.0, 1.0-height2));
	vec3 layer2 = mix(vec3(0.2), recomp1, smoothstep(0.0, pixelSize, 1.0-height1));

    out_Col = vec4(mix(layer1, layer2, smoothstep(-pixelSize, 0.0, 1.0-height1)), 1.0);

    if (sy > fancyHt) {
        out_Col = vec4(0.3, 0.6, 0.9, 1.0);
    } 

    if(inBird(sx,sy)){
        out_Col = vec4(1.0,0.0,0.0,1.0);
    }

    ////////////////////////////////////////////////////////////////

}
