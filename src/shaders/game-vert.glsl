#version 300 es

precision highp float;

in vec4 vs_Pos;
out vec4 fs_Pos;

//*SPRITE STUFF*//
// in vec2 vs_TexCoord;
// in vec2 fs_TexCoord;

void main() {
	//*SPRITE CODE*//
	// fs_TexCoord = vs_TexCoord;
    
    //*TERRAIN CODE*//
	// TODO: Pass relevant info to fragment
	gl_Position = vs_Pos;
	fs_Pos = vs_Pos;
}