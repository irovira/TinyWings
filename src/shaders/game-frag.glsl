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

float getHeight(float dist) {
    return 0.2 * sin(10.0 * dist);
}

void main()
{
    float sx = fs_Pos.x;
	float sy = fs_Pos.y;

    float height = getHeight(sx + u_BirdPos.x);

    if (sy > height) {
        out_Col = vec4(0.3, 0.6, 0.9, 1.0);
    } else {
        out_Col = vec4(1.0,0.5,0.0,1.0);
    }

}
