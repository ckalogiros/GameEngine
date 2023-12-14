"use strict";

import { Gl_texture_unit_create } from "../../../Graphics/GlTextureUnit.js";
import { Font_init_fonts_storage_buffer, Font_is_loaded, FontLoadUvs, FontRetrieveFontIdx } from "../Font/Font.js";
import { ImageLoader } from "../ImageLoader.js";




// const TEXTURES_MAX_COUNT = TEXTURES.COUNT;
const TEXTURES_MAX_COUNT = 2;
const _activeTextures = new Int8Array(TEXTURES_MAX_COUNT);
const _textureBuffer = [];
let _textureBufferCount = 0;
const _uvMapBuffer = [];
let _uvMapBufferCount = 0;

export class Texture {

	TUO = null; // The Graphic's texture unit object.
	tex_unit_id = -1; // Graphic's unique 'unsigned integer' id. 
	// Idx = -1;	// Engine's 
	width = 0;
	height = 0;
	level = -1;
	internalFormat = -1;
	srcFormat = -1;
	srcType = -1;
	img = null;
	imgSrc = '';
	name = '';

};

export function Texture_init_texture_storage_buffer() { // Initialize a buffer to store all the application's textures.

	for (let i = 0; i < TEXTURES_MAX_COUNT; i++) {

		_activeTextures[i] = INT_NULL;
		_textureBuffer[i] = new Texture;
	}

	// Initialize font buffers
	Font_init_fonts_storage_buffer();
}

function Get_next_free_elem() {

	const idx = _textureBufferCount++;

	if (idx >= TEXTURES_MAX_COUNT) {
		alert('Texture buffer overflow. @ Texture.js')
	}

	return idx;
}


export function Texture_get_texture_byidx(idx) {
	return _textureBuffer[idx];
}
function Texture_is_active_check_byidx(idx) {
	if (_activeTextures[idx] === INT_NULL) return false;
	return true;
}
function Texture_get_texture_active_byidx(idx) {
	return _activeTextures[idx];
}
function Texture_retrieve_uvmap_bytexid(texidx) {
	switch(texidx){
		case FONTS.SDF_CONSOLAS_LARGE: 
		case FONTS.SDF_CONSOLAS_SMALL:{
			return FontRetrieveFontIdx(texidx)
		}
	}
}
function Texture_is_texture_font_texture(texidx){
	// return Font_is_loaded(texidx)
	if(texidx >= FONTS.COUNT) return false;
	else return true;
}
function Texture_is_loaded(texidx){
	if(_activeTextures[texidx]) return true;
	else return false;
}



// Texture loading - Generic
/**
 * Search in active textures by index,
 * if not found search in the texture buffer array,
 * if not found: probably console ERROR.
 */
// TODO: we need a direct image path selection from the texidx index
// let count = 0;
export function Texture_load_texture_byidx(texidx, TEX_TYPE) {

	let texture_idx = INT_NULL; 	// The index of the texture, that is stored(upon texture creation) in a buffer.
	let uvmap_idx = INT_NULL; 		// The index of the uv coordinates. All coordinates for all , 

	console.log(_textureBuffer[texidx])
	const is_font_texture = Texture_is_texture_font_texture(texidx)

	if (!(TEX_TYPE & TEXTURE_TYPE.TYPE_FONT)) { // Load/use texture image 

		if(!Texture_is_loaded(texidx)){
			
			const img = ImageLoader.Load(TEXTURE_PATHS[texidx].imgPath, TEXTURE_PATHS[texidx].imgName, TEXTURE_PATHS[texidx].imgType);
			// Load the texture image
			_activeTextures[texidx] = Texture_create_texture(gfxCtx.gl, img, TEXTURE_PATHS[texidx].imgName);
			texture_idx = _activeTextures[texidx];
		}
		else{
			texture_idx = _activeTextures[texidx];
		}

	}
	else { // Load/use font texture image 
		if ( !Font_is_loaded(texidx) ) {

			const img = ImageLoader.Load(FONT_PATHS[texidx].imgPath, FONT_PATHS[texidx].imgName, FONT_PATHS[texidx].imgType);
			// Load the font image
			_activeTextures[texidx] = Texture_create_texture(gfxCtx.gl, img, FONT_PATHS[texidx].imgName);
			texture_idx = _activeTextures[texidx];
			uvmap_idx = FontLoadUvs(texidx);

		}
		else {
			texture_idx = Texture_get_texture_active_byidx(texidx), // The index for the texture
			uvmap_idx = Texture_retrieve_uvmap_bytexid(texidx) // the index for the texture metrics in the font metrics buffer
		}
	}

	return {texidx:texture_idx, uvmapidx:uvmap_idx};
}


export function Texture_create_texture(gl, img, name) {

	const idx = Get_next_free_elem();
	_textureBuffer[idx].name = name;

	Gl_texture_unit_create(gl, _textureBuffer[idx], idx, img);

	GL.BOUND_TEXTURE_UNIT_ID = _textureBuffer[idx].texidx;
	GL.BOUND_TEXTURE_IDX = idx;

	return idx;
}
export function Texture_create_renderbuffer_texture(gl, width, height, name) {

	const idx = Get_next_free_elem();
	_textureBuffer[idx].name = name;

	Gl_texture_unit_create(gl, _textureBuffer[idx], idx, null, width, height);

	GL.BOUND_TEXTURE_UNIT_ID = _textureBuffer[idx].texidx;
	GL.BOUND_TEXTURE_IDX = idx;

	return idx;
}

