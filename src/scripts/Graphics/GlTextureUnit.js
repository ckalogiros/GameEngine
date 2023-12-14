"use strict";



export function Gl_texture_unit_create(gl, texture, idx, img, width=0, height=0) {

    texture.tex_unit_id = gl.TEXTURE0 + idx; // Advance the texture ID to the next. // TODO: Should check for GL_MAX_ALLOWED_TEXTURE_UNITS.
    texture.idx = idx; // Advance the texture ID to the next. // TODO: Should check for GL_MAX_ALLOWED_TEXTURE_UNITS.
    texture.level = 0;
    texture.internalFormat = gl.RGBA;
    texture.srcFormat = gl.RGBA;
    texture.srcType = gl.UNSIGNED_BYTE;
    
    gl.activeTexture(texture.tex_unit_id);
    texture.TUO = gl.createTexture();
    
    if (!texture.TUO) alert('Could not create Texture');

    texture.img = img; // Load the font image

    if(DEBUG.TEXTURE) console.log('texture:', texture)

    if(texture.img){

        if(DEBUG.TEXTURE) console.log('texture:', texture)
        Gl_texture_unit_load(gl, texture);
    }
    else{ // Must set the width and height

        gl.bindTexture(gl.TEXTURE_2D, texture.TUO);
        gl.texImage2D(gl.TEXTURE_2D, texture.level, texture.internalFormat, width, 
                                height, 0, texture.srcFormat, texture.srcType, null);
        
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);

        texture.width = width;
        texture.height = height;
    }

}

export function Gl_texture_unit_load(gl, texture) {

    texture.img.onload = function(){
        
        Gl_texture_unit_bind(gl, texture);
        gl.texImage2D(gl.TEXTURE_2D, texture.level, texture.internalFormat, texture.img.width, 
                        texture.img.height, 0, texture.srcFormat, texture.srcType, texture.img);

        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);

        texture.width = texture.img.width;
        texture.height = texture.img.height;

    }
}

export function Gl_texture_unit_bind(gl, texture) {

    gl.activeTexture(texture.tex_unit_id);
    gl.bindTexture(gl.TEXTURE_2D, texture.TUO);

    GL.BOUND_TEXTURE_UNIT_ID = texture.tex_unit_id; // Update the global GL constant object
    GL.BOUND_TEXTURE_IDX = texture.idx;
    Texture.boundTexture = texture.idx; // Update the global Texture constant object
}
