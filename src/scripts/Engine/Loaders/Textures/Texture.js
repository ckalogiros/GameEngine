"use strict";

import { Gl_texture_unit_create } from "../../../Graphics/GlTextureUnit.js";
import { Font_create_uvmap } from "../Font/ChlumskyFontMetricsLoader.js";
import { Font_init_fonts_storage_buffer, Font_is_loaded, Font_load_uvs, Font_retrieve_fontidx } from "../Font/Font.js";
import { ImageLoader } from "../ImageLoader.js";




const TEXTURES_MAX_COUNT = TEXTURES.COUNT;
const _textureBuffer = [];
let _textureBufferCount = 0;



function Get_next_free_index() {

	const idx = _textureBufferCount++;

	if (idx >= TEXTURES_MAX_COUNT) {
		alert('Texture buffer overflow. @ Texture.js')
	}
	return idx;
}


function Texture_create_texture(gl, textureid, img, name) {

	const idx = Get_next_free_index();
	_textureBuffer[idx] = Gl_texture_unit_create(gl, textureid, idx, img);
	_textureBuffer[idx].name = name;
	
	return idx;
}


export function Texture_init_texture_storage_buffer() { // Initialize a buffer to store all the application's textures.

	for (let i = 0; i < TEXTURES_MAX_COUNT; i++) {
		_textureBuffer[i] = null;
	}

	// Initialize font buffers
	Font_init_fonts_storage_buffer();
}


export function Texture_get_texture_byidx(idx) {
	return _textureBuffer[idx];
}


function Texture_is_loaded(textureid) {

	for(let i=0; i<_textureBufferCount; i++){
		if(_textureBuffer[i] && _textureBuffer[i].texid === textureid)
			return i
	}
	return INT_NULL;
}


export function Texture_load_texture_byid(textureid, TEX_TYPE) {

	let texture_idx = INT_NULL; 	// The index of the texture, that is stored(upon texture creation) in a buffer.
	let uvmap_idx = INT_NULL; 		// The index of the uv coordinates. All coordinates for all , 

	const texidx = Texture_is_loaded(textureid);

	if (texidx === INT_NULL) {

		const img = ImageLoader.Load(TEXTURE_PATHS[textureid].imgPath, TEXTURE_PATHS[textureid].imgName, TEXTURE_PATHS[textureid].imgType);
		// Load the texture image
		texture_idx = Texture_create_texture(gfxCtx.gl, textureid, img, TEXTURE_PATHS[textureid].imgName);

		if (TEX_TYPE & TEXTURE_TYPE.TYPE_FONT){
			Font_create_uvmap(textureid);

			uvmap_idx = Font_load_uvs();
		}
	}
	else {
		texture_idx = texidx; 
		if (TEX_TYPE & TEXTURE_TYPE.TYPE_FONT)
				uvmap_idx = Font_retrieve_fontidx(texidx);// the index for the texture metrics in the font metrics buffer
	}
	// console.info('_textureBuffer:', _textureBuffer)

	return { texidx: texture_idx, uvmapidx: uvmap_idx };
}


export function Texture_create_renderbuffer_texture(gl, textureid, width, height, name) {
	
	const idx = Get_next_free_index();
	_textureBuffer[idx] = Gl_texture_unit_create(gl, textureid, idx, null, width, height);
	_textureBuffer[idx].name = name;

	return idx;
}

