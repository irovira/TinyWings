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

//*SPRITE STUFF*//
// in vec2 fs_TexCoord;
 
// uniform sampler2D u_Texture;

//*TERRAIN STUFF*//
precision highp float;

uniform vec2 u_Screen;
uniform vec2 u_BirdPos;
uniform vec2 u_ColorScheme;

// controls the thickness and orientation of the stripes
uniform float u_StripeFactor; // range[-10, 10]
// controls number of stripes
uniform float u_TextureSlice; // range [0..1]

in vec4 fs_Pos;
out vec4 out_Col;

const float radius = 0.03;
const float pi = 3.14159265358979;

// parameters
// Referencing 2D Procedural terrain texturing from shadertoy
// https://www.shadertoy.com/view/lscGzB

// angle of the stripes, whether or not they overlap
const float gradientAngle = 100.0; // degrees
// intensity of noise texture on hills
const float NoiseFactor = 0.14; // range [0..1]
// fading of the stripes
const float SmoothStepBase = 0.2; // range[0..0.25]
const float GroundSaturation = 3.0; // range [0..1]

// Converts HSV to RGB so we can properly shade the colors using their RGB values
vec3 hsv2rgb (in vec3 hsv) 
{
    return hsv.z *  (1.0 + 0.5 * hsv.y * (cos (6.2832 * (hsv.x + vec3 (0.0, 0.6667, 0.3333))) - 1.0));
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
    float v = u - mod(u, (u_TextureSlice + abs(sin(u * 6.15159)) * 0.01));
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

// A tamer hill height
float getGroundHeight2(float x) 
{
    return 0.2 * cos(3.0 * x) +  0.1 * cos(6.0 * x);
}

// Gets color of uv coordinate
vec3 getWorldColor(vec2 uv)
{
    vec2 hueSelection = normalize(u_ColorScheme);
    // hueSelection = normalize(vec2(6.0,4.0));

    float c = getTex2(uv.x * 4.0 + uv.y * u_StripeFactor) + 0.2; 
    

    vec3 colPalette=vec3(0.0);
    
    float angles[4];
    angles[0] = 0.0;
	angles[1] = gradientAngle;
    angles[2] = 180.0;
    angles[3] = 180.0 + gradientAngle;
    
    for (int i = 0; i < 4; i++)
    {
        vec2 dir = rotate(hueSelection, degToRad(angles[i]));
		float ifl = float(i);
        vec3 baseColorHSV = rgb2hsv(baseColor(dir));
        colPalette = mix(colPalette, hsv2rgb(vec3(baseColorHSV.r, 0.3,0.6)), smoothstep(SmoothStepBase*ifl, 0.25*ifl, c));
        
    }
    // Adds a bit of saturation
    colPalette = mix(colPalette, vec3(dot(colPalette, vec3(0.299, 0.587, 0.114))), 1.0-GroundSaturation);

    uv.y = 1.0 - uv.y;
    vec2 noisePos = uv;
    float noise = perlinNoise(noisePos * 10.0) + 
                    perlinNoise(noisePos * 20.0) * 0.8 + 
                    perlinNoise(noisePos * 40.0) * 0.6 + 
                    perlinNoise(noisePos * 80.0) * 0.4;
    
    // intensity of noise contribution 
    float intens = max(pow(0.5, (uv.y-0.10) * 9.0), 0.4);
    
    float unoise = noise * NoiseFactor + (1.0 - NoiseFactor);
    
    vec3 recompBase = colPalette * intens * unoise;
    
    // darkness of noise contribution
    vec3 recomp = mix(recompBase, vec3(1.0), max(intens * 0.9 - 1.0, 0.00));

    return recomp;
}

////////////////////////////////////////////////////////
float getHeight(float dist) {
    return 0.2 * sin(10.0 * dist);
}

bool inBird(float x, float y){
    float xdif = abs(-0.5 - x); // Screen position of bird is always -0.5 in the x-direction
    float ydif = abs(u_BirdPos.y - y);
    return xdif * xdif + ydif * ydif < radius * radius;
}

bool inEye(float x, float y){
    float xdif = abs(-0.5 + 0.01 - x); // Screen position of bird is always -0.5 in the x-direction
    float ydif = abs(u_BirdPos.y + 0.01  - y);
    return xdif * xdif + ydif * ydif < 0.01 * 0.01;
}

bool inPupil(float x, float y){
    float xdif = abs(-0.5 + 0.01 - x); // Screen position of bird is always -0.5 in the x-direction
    float ydif = abs(u_BirdPos.y + 0.01  - y);
    return xdif * xdif + ydif * ydif < 0.005 * 0.005;
}

bool inWing(float x, float y){
    float xdif = abs(-0.5 - 0.01 - x); // Screen position of bird is always -0.5 in the x-direction
    float ydif = abs(u_BirdPos.y - 0.01  - y);
    return xdif * xdif + ydif * ydif < 0.02 * 0.02;
}

bool inBeak(float x, float y){
    float xdif = abs(-0.5 + 0.03 - x); // Screen position of bird is always -0.5 in the x-direction
    float ydif = abs(u_BirdPos.y  - y);
    return xdif * xdif + ydif * ydif < 0.01 * 0.01;
}

void main()
{
    //*TERRAIN CODE*//
    float aspect = u_Screen.x / u_Screen.y;
    float sx = fs_Pos.x;
	float sy = fs_Pos.y / aspect;
    
    float fancyHt = getGroundHeight(sx + u_BirdPos.x + 0.5) - 0.3; 
    vec2 hueSelection = normalize(u_ColorScheme);
    // hueSelection = normalize(vec2(4.0,6.0));

    ////////////////////////////////////////////////////////////////
    vec2 uv = vec2(sx, sy);

    // Rotates baseColor
    vec3 colSkyHSV = rgb2hsv(baseColor(rotate(hueSelection, degToRad(-gradientAngle*1.5))));
    vec3 colSky = hsv2rgb(vec3(colSkyHSV.r, 0.2, 0.65)); // scales down saturation and value of the sky
    
    float iTime = u_BirdPos.x;
    
    // float pos1 = uv.x + iTime * 0.3; // parallax
    float pos1 = uv.x + iTime + 0.5; // foreground, moves according to bird
    float pos2 = uv.x + iTime * 0.3; // background, moves slower for parallax
    
    // camHeight controls the up and down motion of the hills
    // float camHeight = (getGroundHeight(iTime + 0.5) + getGroundHeight(iTime + 0.1) + getGroundHeight(iTime + 0.9)) / 3.0 - 0.5;
        
    // float height1 = uv.y + getGroundHeight(pos1) + 0.6;// - camHeight;
    float height1 = uv.y + getGroundHeight(pos1) + 0.8;
    float height2 = uv.y + getGroundHeight(pos2)  + 0.2; //- camHeight * 0.5;
    
    vec3 foregroundCol = getWorldColor(vec2(pos1, height1)); // foreground color 
    vec3 backgroundCol = mix(colSky, getWorldColor(vec2(pos2, height2)), 0.4); // background color

    float pixelSize =  2.0 / u_Screen.y;

    // Smoothstep for the border of the hill
    // background
	vec3 layer1 = mix(colSky, mix(vec3(0.55), backgroundCol, smoothstep(0.0, pixelSize * 2.0, 1.0 - height2)), smoothstep(-pixelSize, 0.0, 1.0-height2));
	// foreground
    vec3 layer2 = mix(vec3(0.2), foregroundCol, smoothstep(0.0, pixelSize * 3.0, 1.0 - height1));

    out_Col = vec4(mix(layer1, layer2, smoothstep(-pixelSize, 0.0, 1.0 - height1)), 1.0);

    if(inBeak(sx,sy)){
        out_Col = vec4(1.0,0.5,0.0,1.0);
    }

    if(inBird(sx,sy)){
        //*SPRITE CODE*// 
        if(inEye(sx,sy)){
            if(inPupil(sx,sy)){
                out_Col = vec4(0.0,0.0,0.0,1.0);
            } else {
                out_Col = vec4(1.0,1.0,1.0,1.0);
            }
                
        } else {
            out_Col = vec4(1.0,0.0,0.0,1.0);
        }
        // out_Col = texture(texture, fs_TexCoord);
        
    }

    if (inWing(sx,sy)){
         out_Col = vec4(1.0,0.3,0.0,1.0);
    }
    

    
    ////////////////////////////////////////////////////////////////

}
