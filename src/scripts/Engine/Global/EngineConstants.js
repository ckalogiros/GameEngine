"use strict";




/* * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * *
 * Loaders's Constants 
 */
	const PLATFORM = {
		WIN_NT_IMPL: false,
		WIN_PHONE_IMPL: false,
		ANDROID_IMPL: false,
		I_PHONE_IMPL: false,
		BLACK_BERRY_IMPL: false,
	} 


/* * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * *
 * Loaders's Constants 
 */
const CHAR_ARRAY_START_OFFSET = ' '.charCodeAt(0);


/* * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * *
 * Timer's Constants 
 */
const TIMER_FPS_TIME = 1000;
const TIME_INTERVAL_REPEAT_ALWAYS = 9999999999; // Repeat always a time interval clbk function.




/* * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * *
 * Mesh's Constants 
 */
const SCALE_DEFAULT = [1, 1];
const OUT_OF_VIEW = 1000; // Out of screen view in pixels




/* * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * *
 * Events Constants 
 */
const EVENTS = {
	NONE: 0,
	MOUSE: 1,
}




/* * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * *
 * Style Constants  
 */

const TRANSPARENT = [0.0, 0.0, 0.0, 0.0];
const WHITE = [1.0, 1.0, 1.0, 1.0];
const BLACK = [0.0, 0.0, 0.0, 1.0];
const GREY1 = [0.1, 0.1, 0.1, 1.0];
const GREY2 = [0.2, 0.2, 0.2, 1.0];
const GREY3 = [0.3, 0.3, 0.3, 1.0];
const GREY4 = [0.4, 0.4, 0.4, 1.0];
const GREY5 = [0.5, 0.5, 0.5, 1.0];
const GREY6 = [0.6, 0.6, 0.6, 1.0];
const GREY7 = [0.7, 0.7, 0.7, 1.0];
const GREEN = [0.0, 1.0, 0.0, 1.0];
const GREENL1 = [0.07, 0.9, 0.0, 1.0];
const GREENL2 = [0.1, 0.8, 0.0, 1.0];
const GREENL3 = [0.1, 0.6, 0.0, 1.0];
const GREENL4 = [0.08, 0.2, 0.0, 1.0];
const BLUE = [0.0, 0.0, 1.0, 1.0];
const BLUER1 = [0.0, 0.2, 88.0, 1.0];
const BLUER2 = [0.0, 0.2, 75.0, 1.0];
const BLUER3 = [0.0, 0.2, 6.0, 1.0];
const RED = [1.0, 0.0, 0.0, 1.0];
const YELLOW = [1.0, 1.0, 0.0, 1.0];
const MAGENTA_BLUE = [0.5, 0.0, 1.0, 1.0];
const MAGENTA_RED = [1.0, 0.0, 0.6, 1.0];
const ORANGE = [1.0, 0.5, 0.0, 1.0];
const LIGHT_BLUE = [0.0, 1.0, 1.0, 1.0];
const MAGENTA_BLUE_DARK1 = [0.3, 0.0, 0.7, 1.0];
const MAGENTA_BLUE_DARK2 = [0.2, 0.1, 0.52, 1.0];
const MAGENTA_BLUE_DARK3 = [0.1, 0.1, 0.26, 1.0];

const citf = 1 / 255;
function InterpolateRgb(red, green, blue) {
	return [citf * red, citf * green, citf * blue, 1.0];
}

const PINK_240_60_160 = InterpolateRgb(240, 60, 160);
const PINK_240_60_200 = InterpolateRgb(240, 60, 200);
const RED_200_10_10 = InterpolateRgb(200, 10, 10);
const GREEN_33_208_40 = InterpolateRgb(33, 208, 40);
const GREEN_60_240_100 = InterpolateRgb(60, 240, 100);
const GREEN_60_240_60 = InterpolateRgb(60, 240, 60);
const GREEN_140_240_10 = InterpolateRgb(140, 240, 10);
const BLUE_10_160_220 = InterpolateRgb(10, 160, 220);
const BLUE_10_120_220 = InterpolateRgb(10, 120, 220);
const CYAN_10_200_240 = InterpolateRgb(10, 200, 240);
const CYAN_10_230_240 = InterpolateRgb(10, 230, 240);
const CYAN_10_230_180 = InterpolateRgb(10, 230, 180);
const YELLOW_240_240_10 = InterpolateRgb(240, 240, 10);
const YELLOW_240_220_10 = InterpolateRgb(240, 200, 10);
const ORANGE_240_160_10 = InterpolateRgb(240, 160, 10);
const ORANGE_240_200_10 = InterpolateRgb(240, 200, 10);
const ORANGE_240_130_10 = InterpolateRgb(240, 130, 10);
const ORANGE_240_75_10 = InterpolateRgb(255, 75, 10);
const BLUE_LIGHT = InterpolateRgb(76, 171, 254);
const blue = InterpolateRgb(0.345 * 255, 0.780 * 255, 0.988 * 255)
const bluePurple = InterpolateRgb(0.361 * 255, 0.020 * 255, 0.839 * 255)


const COLOR_ARRAY = new Array(
	PINK_240_60_160, PINK_240_60_200, RED_200_10_10, GREEN_33_208_40, GREEN_60_240_100, GREEN_60_240_60, GREEN_60_240_60,
	GREEN_140_240_10,
	BLUE_10_160_220,
	BLUE_10_120_220,
	CYAN_10_200_240,
	CYAN_10_230_240,
	CYAN_10_230_180,
	YELLOW_240_220_10,
	YELLOW_240_240_10,
	ORANGE_240_75_10,
	ORANGE_240_130_10,
	ORANGE_240_160_10,
);




let g_cnt = 0;
const FONTS = {

	SDF_CONSOLAS_LARGE: g_cnt++,
	SDF_CONSOLAS_SMALL: g_cnt++,

	COUNT:g_cnt,
};
//  must continue counting from FONTS, as all font textures should be at the
const TEXTURES = {
	
	SDF_CONSOLAS_LARGE: FONTS.SDF_CONSOLAS_LARGE,
	SDF_CONSOLAS_SMALL: FONTS.SDF_CONSOLAS_SMALL,
	TEST: g_cnt++,

	COUNT:g_cnt,
};

// SDF Font textures names and paths
const RESOURCES_PATH = '/resources';
const FONT_CONSOLAS_SDF_LARGE = 'consolas_sdf_11115w';
const FONT_CONSOLAS_SDF_SMALL = 'consolas_sdf_2048w';
const COMIC_FONT_METRICS_PATH = '../../../../consolas_sdf/metrics/consolas_sdf.txt'

// Textures names and paths
const TEXTURE_TEST = 'msdf';

/* * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * *
 * Debugging  
 */
const DEBUG = {
	CORE:true,
	MATERIAL: true,
	GEOMETRY: true,
	MESH: true,
	MESH_ALL_UVS: false,
	RECT: true,
	CAMERA: false,

	TEXTURE: false,
	UVS: false,
	
	// Graphics
	WEB_GL: true,
	SHADER_INFO: true,
	SHADERS: true,
};