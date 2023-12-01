"use strict";

import { GlBindTexture } from "./Buffers/GlBuffers.js";


export function GlCreateTexture(gl, texture, idx, img) {

    texture.texId = gl.TEXTURE0 + idx; // Advance the texture ID to the next. // TODO: Should check for GL_MAX_ALLOWED_TEXTURE_UNITS.
    texture.idx = idx; // Advance the texture ID to the next. // TODO: Should check for GL_MAX_ALLOWED_TEXTURE_UNITS.
    texture.level = 0;
    texture.internalFormat = gl.RGBA;
    texture.srcFormat = gl.RGBA;
    texture.srcType = gl.UNSIGNED_BYTE;
    
    gl.activeTexture(texture.texId);
    texture.tex = gl.createTexture();
    
    if (!texture.tex) alert('Could not create Texture');

    texture.img = img; // Load the font image
    if (!texture.img || texture.img === undefined) alert('Texture not found with getElementById');
    if(DEBUG.TEXTURE) console.log('texture:', texture)

    LoadTexture(gl, texture);
}

export function LoadTexture(gl, texture) {

    texture.img.onload = function(){
        
        GlBindTexture(texture);
        gl.texImage2D(gl.TEXTURE_2D, texture.level, texture.internalFormat,
            texture.srcFormat, texture.srcType, texture.img);

        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST);

        texture.width = texture.img.width;
        texture.height = texture.img.height;

    }
}
