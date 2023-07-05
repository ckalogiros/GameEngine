"use strict";

import { GlBindTexture } from "./Buffers/GlBuffers.js";


export class GlTexture {

    tex = null;
    texId = -1;
    idx = -1;
    width = 0;
    height = 0;
    level = -1;
    internalFormat = -1;
    srcFormat = -1;
    srcType = -1;
    img = null;
    imgSrc = '';
    htmlId = '';

};


export let glTextures = {

    texture: [],
    count: 0,
};



export function GlGetTexture(idx) {
    return glTextures.texture[idx];
}


export function GlCreateTexture(htmlId, gl, url) {

    const texture = new GlTexture;

    texture.idx = glTextures.count++;
    glTextures.texture[texture.idx] = texture;
    StoreGlobalTextureIndex(htmlId, texture.idx);

    texture.htmlId = htmlId;
    texture.texId = gl.TEXTURE0 + texture.idx; // Advance the texture ID to the next. TODO: Should check for GL_MAX_ALLOWED_TEXTURE_UNITS.
    texture.level = 0;
    texture.internalFormat = gl.RGBA;
    texture.srcFormat = gl.RGBA;
    texture.srcType = gl.UNSIGNED_BYTE;

    gl.activeTexture(texture.texId);
    GL.BOUND_TEXTURE_ID = texture.texId;
    GL.BOUND_TEXTURE_IDX = texture.idx;
    texture.tex = gl.createTexture();
    if (!texture.tex)
        alert('Could not create Texture');

    if(texture.htmlId !== 'FrameBufferTexture0'){
        const img = document.getElementById(htmlId)
        if (!img) alert('Texture not found whith getElementById');
        texture.img = img
        console.log(img)
        console.log(img.src)
        texture.imgSrc = img.src;
        texture.img.src = img.src;
    }
    LoadTexture(gl, texture);


    return texture;
}

export function LoadTexture(gl, texture) {

    if (texture.imgSrc) {
        // texture.onload = ()=>{

            GlBindTexture(texture);
            gl.texImage2D(gl.TEXTURE_2D, texture.level, texture.internalFormat,
                texture.srcFormat, texture.srcType, texture.img);
    
            gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
            gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
            gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST);
    
            texture.width = texture.img.width;
            texture.height = texture.img.height;
        // }

    }
    else {

        const data = null; // No data yet. (For FrameBuffers).
        const border = 0;
        texture.width = Viewport.width;
        texture.height = Viewport.height;

        GlBindTexture(texture);

        gl.texImage2D(gl.TEXTURE_2D, texture.level, gl.RGBA,
            texture.width, texture.height, border, gl.RGBA, gl.UNSIGNED_BYTE, data);

        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
    }
}

function StoreGlobalTextureIndex(name, idx) {

    // Store the index of the current free element in the array of textures, 
    // to the global variable textures key-value pairs 
    if (name === 'FontConsolasSdf35') {
        Texture.fontConsolasSdf35 = idx;
    }
    else if (name === 'TextureAtlas') {
        Texture.atlas = idx;
    }
    else if (name === 'FrameBufferTexture0') {
        Texture.frameBufferTexture0 = idx;
    }
    else {
        alert('No texture name Exists for the global Texture key-value pair object');
    }
}
















////////////////////////////////////////////////////////////////////////////////////////////////
