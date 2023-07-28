"use strict";

import { GlCreateTexture } from "../../../Graphics/GlTextures.js";
import { FontInitBuffers, FontIsLoaded, FontLoadUvs, FontRetrieveFontIdx } from "../Font/Font.js";
import { ImageLoader } from "../ImageLoader.js";




const TEXTURES_MAX_COUNT = TEXTURES.COUNT;
const _activeTextures = new Int8Array(TEXTURES_MAX_COUNT);
const _textureBuffer = [];
let _textureBufferCount = 0;
const _uvMapBuffer = [];
let _uvMapBufferCount = 0;

export class Texture {

	tex = null;
	texId = -1;
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

export function TextureInitBuffers() {

	for (let i = 0; i < TEXTURES_MAX_COUNT; i++) {

		_activeTextures[i] = INT_NULL;
		_textureBuffer[i] = new Texture;
	}

	// Initialize font buffers
	FontInitBuffers();
}

function GetNextFreeElem() {

	const idx = _textureBufferCount++;

	if (idx >= TEXTURES_MAX_COUNT) {
		alert('Fonts buffer overflow. @ FontLoadUvs.js')
	}

	return idx;
}


export function TextureGetTextureByIdx(idx) {
	return _textureBuffer[idx];
}
export function TextureIsLoaded(texId) {
	if (_activeTextures[texId] === INT_NULL) return false;
	return true;
}
function TextureRetrieveTextureIdx(texId) {
	return _activeTextures[texId];
}
export function TextureRetrieveUvMapIdx(texId) {
	switch(texId){
		case TEXTURES.SDF_CONSOLAS_LARGE: 
		case TEXTURES.SDF_CONSOLAS_SMALL:{
			return FontRetrieveFontIdx(texId)
		}
		case TEXTURES.TEST:{
			return _activeTextures[texId];
		}
	}
}
export function AtlasTextureGetCoords(index) {
	return ATLAS_TEX_COORDS[index];
}


// Texture loading - Generic
export function TextureLoadTexture(texId) {

	const ret = {
		texIdx: INT_NULL, // The index of the texture, that is stored(upon texture creation) in a buffer.
		uvIdx: INT_NULL, // The index of the uv coordinates. All coordinates for all , 
	};

	// if ( !FontIsLoaded(texId) || !TextureIsLoaded(texId) ) {
	if ( !FontIsLoaded(texId) ) {

		switch (texId) {

			case FONTS.SDF_CONSOLAS_LARGE: {

				// Load the font image
				const img = ImageLoader.Load('fonts/consolas_sdf', FONT_CONSOLAS_SDF_LARGE, 'png');
				ret.texIdx = TextureCreateTexture(gfxCtx.gl, img, FONT_CONSOLAS_SDF_LARGE)
				ret.uvIdx = FontLoadUvs(texId);

				break;
			}
			case FONTS.SDF_CONSOLAS_SMALL: {
				// Load the font image
				const img = ImageLoader.Load('fonts/consolas_sdf', FONT_CONSOLAS_SDF_SMALL, 'png');
				ret.texIdx = TextureCreateTexture(gfxCtx.gl, img, FONT_CONSOLAS_SDF_SMALL)
				ret.uvIdx = FontLoadUvs(texId);
				break;
			}
			case TEXTURES.TEST: {
				// Load the texture image
				const img = ImageLoader.Load('textures', TEXTURE_TEST, 'png');
				ret.texIdx = TextureCreateTexture(gfxCtx.gl, img, TEXTURE_TEST)
				ret.uvIdx = TextureLoadUvs(); // If uvs not found, fallback to [0,1] coordinates
				break;
			}
		}
	}
	else {
		ret.texIdx = TextureRetrieveTextureIdx(texId), // The index for the texture
		ret.uvIdx = TextureRetrieveUvMapIdx(texId) // the index for the texture coordinates
	}

	return ret;
}


export function TextureCreateTexture(gl, img, name) {

	const idx = GetNextFreeElem();
	_textureBuffer[idx].name = name;

	GlCreateTexture(gl, _textureBuffer[idx], idx, img);

	GL.BOUND_TEXTURE_ID = _textureBuffer[idx].texId;
	GL.BOUND_TEXTURE_IDX = idx;

	return idx;
}

function TextureLoadUvs() {
	// If uvs from atlas, create uvs
	// Else create default uvs, but only once
	const idx = _uvMapBufferCount++;
	_uvMapBuffer[idx] = [0,1,0,1];
}

