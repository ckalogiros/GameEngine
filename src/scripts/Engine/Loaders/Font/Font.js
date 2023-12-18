"use strict";
import { COMIC_FONT_METRICS } from './ComicFontMetrics.js'

// POTENTIAL_BUG: 
// The font texture buffer is build specificaly for fonts, but it gets the font textures from the application's texture buffer.
// So the indexing is not guarantee to be 1to1 (texture buffer-font buffer).
// It will work only if the font textures in the texture buffer preceding all the regular textures in the texture buffer





// The maximum number of characters for ASCII
const ASCII_NUM_CHARACTERS = '~'.charCodeAt(0) - (' '.charCodeAt(0));
const FONTS_MAX_COUNT = TEXTURES.FONT_COUNT; 

const _fontMetricsBuffer = [];
let _fontMetricsBufferCount = 0;
const _fontsUvMap = [];
const _activeFontTextures = new Int8Array(FONTS_MAX_COUNT); 

function GetNextFreeElem(){
	
	const idx = _fontMetricsBufferCount++;

	if(idx >= FONTS_MAX_COUNT) {
		alert('Fonts buffer overflow. @ Font_load_uvs.js')
	}

	return idx;
}


export function Font_init_fonts_storage_buffer() {

	for (let i = 0; i < FONTS_MAX_COUNT; i++) {

		_activeFontTextures[i] = INT_NULL; // Initialize elements for active font textures
		_fontMetricsBuffer[i] = {
			ch: [],
			size: 0,
			texWidth: 0,
			texHeight: 0,
			advancex: 0, // Start (in pixels) of curr character unti the start of next character(in the texture)
			padding: 0,
			isMonoSpace: 0, // In non monospace fonts, the advancex variable is different from char to char (compare to monospace fonts)
			ratio: 0,
		};

		// New uvMap for every font
		_fontsUvMap[i] = [];
		
		// New font metrics for every character
		const char_metrics = _fontMetricsBuffer[i]; 
		for (let j = 0; j <= ASCII_NUM_CHARACTERS; j++) {
			
			char_metrics.ch[j] = {
				left: 0,
				right: 0,
				top: 0,
				bottom: 0,
				advancex: 0,
				width: 0,
				height: 0,
				// bearingtop: 0,
				// bearingleft: 0,
				ratio: 0, // Ratio width to height, for each character's. Used for non monospace fonts
			};
			// New uv coordinates for everyy character
			_fontsUvMap[i][j] = [0,0,0,0];
		}
	}
}

export function Font_is_loaded(texidx) {
	if (_activeFontTextures[texidx] === INT_NULL) return false;
	return true;
}
export function Font_retrieve_fontidx(texidx) {
	return _activeFontTextures[texidx];
}

/**
 * UV Coordinates Getters
 */
export function FontGetUvCoords(fontIdx, ch) {
	return _fontsUvMap[fontIdx][ch.charCodeAt(0) - CHAR_ARRAY_START_OFFSET]
}
// export function FontGetCharFaceRatio(fontIdx, ch) {
// 	return _fontMetricsBuffer[fontIdx].ch[ch.charCodeAt(0) - CHAR_ARRAY_START_OFFSET].ratio;
// }
export function FontGetFontDimRatio(fontIdx) {
	return _fontMetricsBuffer[fontIdx].ratio;
}
// export function FontGetCharWidth(fontIdx, ch) {
// 	return _fontMetricsBuffer[fontIdx].ch[ch.charCodeAt(0) - CHAR_ARRAY_START_OFFSET].width;
// }
// export function FontGetCharHeight(fontIdx, ch) {
// 	return _fontMetricsBuffer[fontIdx].ch[ch.charCodeAt(0) - CHAR_ARRAY_START_OFFSET].height;
// }
// export function FontGetFaceWidth(fontIdx) {
// 	return _fontMetricsBuffer[fontIdx].advancex;
// }
// export function FontGetFaceHeight(fontIdx) {
// 	return _fontMetricsBuffer[fontIdx].texHeight;
// }

//IMIDIATELY: Font_load_uvs() should be called upon texture creation. Also a name or an index must be passed so we load the correct metrics.
export function Font_load_uvs() {

	const fontIdx = LoadMetrics(_fontMetricsBuffer);
	Create_uv_map(_fontMetricsBuffer[fontIdx], _fontsUvMap[fontIdx]);
	
	_activeFontTextures[fontIdx] = fontIdx; // Font textures and their equivalent metrics have 1to1 indexing.
	return fontIdx;
}

// filePos has memory to continue from where it was the previous time it accessed a file.
const filePos = { start: 0, end: 0, len: 0, line: 0 };
function LoadMetrics(metricsBuffer) {

	const idx = GetNextFreeElem(); // IMPORTANT: This index is the same for: The texture in the texture buffer, the font in the font buffer and the metrics of the font in the metrics buffer. The texture and the font are the SAME FILE.
	const metrics = metricsBuffer[idx];

	const file = { content: '', name: '', pos: filePos, size: 0, };
	file.content = COMIC_FONT_METRICS; // IMIDIATELY: Load the metrics automaticaly (from a buffer of fileNames)
	file.size = file.content.length;


	let size = 0;
	// Get how many characters the font texture has 
	// by retrieving the line: "NumCharacters		:	[94]"
	file.pos = FindWord(file.content, "NumCharacters", file.pos);
	if (file.pos.len) size = FindNextValue(file, "[]");
	size++; // +1 for the ' ' space char

	metrics.size = size;


	file.pos = FindWord(file.content, "Image Width", file.pos);
	if (file.pos.len) {
		metrics.texWidth = FindNextValue(file, "[]");
		// The next val inside [] is the height 
		metrics.texHeight = FindNextValue(file, "[]");
	}

	// In monospace {Only} the advance x is the same for every character
	metrics.advancex = FindNextValue(file, "[]");
	// Space between the characters in the texture font
	metrics.padding = FindNextValue(file, "[]");

	file.pos = FindWord(file.content, "Mono Space", file.pos);
	metrics.isMonoSpace = FindNextValue(file, "[]");
	metrics.ratio = metrics.texHeight / metrics.advancex;

	// For char space character ' '
	metrics.ch[0].left = 0;
	metrics.ch[0].right = 0;
	metrics.ch[0].top = 0;
	metrics.ch[0].bottom = 0;
	metrics.ch[0].width = 0;
	metrics.ch[0].height = 0;
	if (!metrics.isMonoSpace) {
		metrics.ch[0].advancex = metrics.advancex;
		metrics.ch[0].ratio = metrics.texHeight / metrics.ch[0].advancex; // width to height ratio(and not the other way arround)
	}

	// Reset the file's pos
	file.pos.start = 0;

	// Load all property values to character map for each character
	for (let i = 1; i < size; i++) {
		file.pos = FindWord(file.content, "Face Left", file.pos);
		if (file.pos.len)
			metrics.ch[i].left = FindNextValue(file, "[]");

		// Because the file.pos retains the start position
		// we just call FindNextValue() to  get the next val
		metrics.ch[i].right = FindNextValue(file, "[]");
		metrics.ch[i].top = FindNextValue(file, "[]");
		metrics.ch[i].bottom = FindNextValue(file, "[]");
		metrics.ch[i].width = FindNextValue(file, "[]");
		metrics.ch[i].height = FindNextValue(file, "[]");
		metrics.ch[i].bearingleft = FindNextValue(file, "[]");
		metrics.ch[i].bearingtop = FindNextValue(file, "[]");
		if (!metrics.isMonoSpace) {
			metrics.ch[i].advancex = FindNextValue(file, "[]");
			metrics.ch[i].ratio = metrics.ch[i].height / metrics.ch[i].width; // width to height ratio(and not the other way arround)
		}
	}

	if(DEBUG.UVS){ console.log('metrics', metrics); }
	return idx;
}

function Create_uv_map(metrics, uvmap) {

	let transormedU = 1.0 / metrics.texWidth;	// Transform to 0-1 coords
	if (metrics.advancex % 2) {
		metrics.advancex++;
		transormedU = 1.0 / (metrics.texWidth);	// Deal with odd width. 
	}

	let transormedV = 1.0 / metrics.texHeight;	// Transform to 0-1 coords
	if (metrics.texHeight % 2) {
		metrics.texHeight++;
		transormedV = 1.0 / (metrics.texHeight);	// Deal with odd width. 
	}

	const U1 = 0, U2 = 1, V1 = 2, V2 = 3;
	// const uvmap = [];
	for (let j = 0; j < metrics.size; j++) {

		const uv = metrics.ch[j]; // Get a characters pixel position in the font texture.

		// and store them to the uvmap
		uvmap[j] = [0.0, 0.0, 0.0, 0.0]; //  Create new array for each character
		uvmap[j][U1] = transormedU * uv.left;
		uvmap[j][U2] = transormedU * uv.right;

		let scalex = (metrics.advancex - uv.width) / 2;
		uvmap[j][U1] -= transormedU * scalex;
		uvmap[j][U2] += transormedU * scalex;

		uvmap[j][V1] = 0;
		uvmap[j][V2] = 1;

		if (metrics.texHeight % 2)
			uvmap[j][V1] += transormedV;
	}

	if(DEBUG.UVS){ console.log('uvmap:', uvmap); }
	
	return uvmap;
}

/*
	 Finds text between delimiters, in a string buffer.
*/
function FindNextValue(file, delim) {
	/**
	 * pos reference's indexes in the string buffer.
	 * 		pos.start:   the start index of the searched text in the string buffer
	 * 		pos.end:     the end index of the searched text in the string buffer
	 * 		pos.len:     the length of the searched text in the string buffer
	 * 		pos.line:    the line of the searched text in the string buffer
	 */
	let pos = file.pos;

	// Cash values
	const data = file.content;
	let i = file.pos.start;

	// Find first delim
	while (data[i++] != delim[0]) {
		if (data[i] == '\n')
			file.pos.line++;
		if (i >= file.size) {
			console.error("Delimiter does not exist. Returning");
			return -1;
		}
	}
	pos.start = i;

	// Store to "charval" whatever lies in between the two delimiter characters
	let charval = '';
	let k = 0;
	while (data[i] != delim[1]) {
		charval += data[i];
		pos.len++;
		i++; k++;
		if (i >= file.size) {
			console.error("No value found. Reached the end of file.");
		}
	}
	pos.end = i - 1;

	// Store the "charval's" position (in the string buffer) to file.pos object
	file.pos.start = pos.start;
	file.pos.end = pos.end;
	file.pos.len = pos.len;

	// Convert String to Number
	let val = 0;
	for (i = 0; i < k; i++)
		val = val * 10 + (charval[i] - '0');

	return val;
}

function FindWord(file, word, pos) {

	const wordpos = { start: -1, end: -1, len: 0, line: -1 };
	const wordlen = word.length;
	
	let line = pos.line;
	let i = pos.start;
	
	const filelen = file.length;
	while (i <= filelen) {

		let k = 0;
		if (file[i] == '\n') line++;

		if (file[i] == word[k]) {

			wordpos.start = i;
			wordpos.len = 0;
			i++; k++;

			while (file[i] == word[k]) {

				wordpos.len++;
				if (k >= wordlen - 1) {
					wordpos.line = line;
					wordpos.len++;
					wordpos.end = i + 1;
					return wordpos;
				}
				i++; k++;
			}
		}
		i++;
	}
	return wordpos;
}




  