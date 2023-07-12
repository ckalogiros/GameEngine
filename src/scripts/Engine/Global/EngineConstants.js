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


/* * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * *
 * Texture Constants 
 */
// const TEXTURE_ATLAS_PATH = '../../../../../resources/textures/TextureAtlas_1.png'
const TEXTURE_ATLAS_PATH = '../../../../resources/textures/TextureAtlas_1.png'
// const TEXTURE_ATLAS_PATH = 'resources/textures/TextureAtlas_1.png'
const ATLAS_TEX_WIDTH = 1024;
const ATLAS_TEX_HEIGHT = 1024;

/**
 * Here we name all seperate textures in the atlas texture, 
 * as a constant to be used as an index in a buffer that stores 
 * all texture coordinates for all mesh textures in the atlas.
 * 
 * NOTE:
 * 	In case of hardcoded coordinates, the 'ATLAS_TEX_NAMES' buffer
 * 	and the 'ATLAS_TEX_COORDS' buffer must be 1-1 corespondance,
 * 	that means the index of the texture name buuffer must match the index of the coordinates buffer
 */
let _cnt1 = 0;
const ATLAS_TEX_NAMES = {
	COIN: _cnt1++,			// Coin
	PWU_BLL: _cnt1++,			// PowUp Balls
	PWU_ENL: _cnt1++,			// PowUp Player Enlargment
	PWU_BULLET: _cnt1++,			// PowUp Bullet
	PWU_POW_BALL: _cnt1++,	// PowUp PowerBall

	GUN: _cnt1++,	// Gun
	BULLET: _cnt1++,	// Gun

	STAGE_COMPLETE: {
		TEXT:{GOOD: _cnt1++,},
		OUTER: _cnt1++,	// Stage completed logo - outer ring
		MIDDLE: _cnt1++,	// Stage completed logo - middle ring
		INNER: _cnt1++,	// Stage completed logo - inner ring
	},

	SIZE: _cnt1,
};

/* * * * * * * * * * * * * * * * * * *
 * Atlas texture 0-1 transform
 */
const TEX_TRANS_X = 1 / ATLAS_TEX_WIDTH;
const TEX_TRANS_Y = 1 / ATLAS_TEX_HEIGHT;

/* * * * * * * * * * * * * * * * * * *
 * Atlas texture coordinates
 */
const ATLAS_ORIG_COOR = {
	COIN: { X: [0, 32], Y: [0, 32] },		// Coins
	PWU_BLL: { X: [32, 64], Y: [0, 32] },	// PowUp Balls
	PWU_ENL: { X: [64, 96], Y: [0, 32] },	// PowUp Player Enlargment
	PWU_BULLET: { X: [96, 128], Y: [0, 32] },	// PowUp Bullet
	PWU_POW_BALL: { X: [128, 160], Y: [0, 32] },	// PowUp PowerBall
	GUN: { X: [], Y: [] },	// Gun
	BULLET: { X: [160, 178], Y: [0, 32] },	// Gun

	STAGE_COMPLETE: {
		TEXT:{
			GOOD: { X: [0, 160], Y: [705, 750] },	// Stage completed logo - Text 'GOOD!'
		},
		OUTER: { X: [0, 273], Y: [751, 1024] },	// Stage completed logo - outer ring
		MIDDLE: { X: [273, 518], Y: [780, 1024] },	// Stage completed logo - middle ring
		INNER: { X: [518, 730], Y: [812, 1024] },	// Stage completed logo - inner ring
	},
};
const ATLAS_TEX_COORDS = [
	[	// 0 Coin
		TEX_TRANS_X * ATLAS_ORIG_COOR.COIN.X[0], TEX_TRANS_X * ATLAS_ORIG_COOR.COIN.X[1], 
		TEX_TRANS_Y * ATLAS_ORIG_COOR.COIN.Y[0], TEX_TRANS_Y * ATLAS_ORIG_COOR.COIN.Y[1]
	],
	[	// 1 PowUp Balls
		TEX_TRANS_X * ATLAS_ORIG_COOR.PWU_BLL.X[0], TEX_TRANS_X * ATLAS_ORIG_COOR.PWU_BLL.X[1], 
		TEX_TRANS_Y * ATLAS_ORIG_COOR.PWU_BLL.Y[0], TEX_TRANS_Y * ATLAS_ORIG_COOR.PWU_BLL.Y[1]
	],
	[	// 2 PowUp Player Enlargment
		TEX_TRANS_X * ATLAS_ORIG_COOR.PWU_ENL.X[0], TEX_TRANS_X * ATLAS_ORIG_COOR.PWU_ENL.X[1], 
		TEX_TRANS_Y * ATLAS_ORIG_COOR.PWU_ENL.Y[0], TEX_TRANS_Y * ATLAS_ORIG_COOR.PWU_ENL.Y[1]
	],
	[	// 3 PowUp Bullet
		TEX_TRANS_X * ATLAS_ORIG_COOR.PWU_BULLET.X[0], TEX_TRANS_X * ATLAS_ORIG_COOR.PWU_BULLET.X[1], 
		TEX_TRANS_Y * ATLAS_ORIG_COOR.PWU_BULLET.Y[0], TEX_TRANS_Y * ATLAS_ORIG_COOR.PWU_BULLET.Y[1]
	],
	[	// 4 PowUp PowerBall
		TEX_TRANS_X * ATLAS_ORIG_COOR.PWU_POW_BALL.X[0], TEX_TRANS_X * ATLAS_ORIG_COOR.PWU_POW_BALL.X[1], 
		TEX_TRANS_Y * ATLAS_ORIG_COOR.PWU_POW_BALL.Y[0], TEX_TRANS_Y * ATLAS_ORIG_COOR.PWU_POW_BALL.Y[1]
	],
	[	// 5 Gun
		TEX_TRANS_X * ATLAS_ORIG_COOR.GUN.X[0], TEX_TRANS_X * ATLAS_ORIG_COOR.GUN.X[1], 
		TEX_TRANS_Y * ATLAS_ORIG_COOR.GUN.Y[0], TEX_TRANS_Y * ATLAS_ORIG_COOR.GUN.Y[1]
	],
	[	// 6 BULLET
		TEX_TRANS_X * ATLAS_ORIG_COOR.BULLET.X[0], TEX_TRANS_X * ATLAS_ORIG_COOR.BULLET.X[1], 
		TEX_TRANS_Y * ATLAS_ORIG_COOR.BULLET.Y[0], TEX_TRANS_Y * ATLAS_ORIG_COOR.BULLET.Y[1]
	],

	[	// Text - Stage-Completed - 'GOOD!'
		TEX_TRANS_X * ATLAS_ORIG_COOR.STAGE_COMPLETE.TEXT.GOOD.X[0], TEX_TRANS_X * ATLAS_ORIG_COOR.STAGE_COMPLETE.TEXT.GOOD.X[1], 
		TEX_TRANS_Y * ATLAS_ORIG_COOR.STAGE_COMPLETE.TEXT.GOOD.Y[0], TEX_TRANS_Y * ATLAS_ORIG_COOR.STAGE_COMPLETE.TEXT.GOOD.Y[1]
	],

	[	// Stage complete MechRing - outer
		TEX_TRANS_X * ATLAS_ORIG_COOR.STAGE_COMPLETE.OUTER.X[0], TEX_TRANS_X * ATLAS_ORIG_COOR.STAGE_COMPLETE.OUTER.X[1], 
		TEX_TRANS_Y * ATLAS_ORIG_COOR.STAGE_COMPLETE.OUTER.Y[0], TEX_TRANS_Y * ATLAS_ORIG_COOR.STAGE_COMPLETE.OUTER.Y[1]
	],
	[	// Stage complete MechRing - middle
		TEX_TRANS_X * ATLAS_ORIG_COOR.STAGE_COMPLETE.MIDDLE.X[0], TEX_TRANS_X * ATLAS_ORIG_COOR.STAGE_COMPLETE.MIDDLE.X[1], 
		TEX_TRANS_Y * ATLAS_ORIG_COOR.STAGE_COMPLETE.MIDDLE.Y[0], TEX_TRANS_Y * ATLAS_ORIG_COOR.STAGE_COMPLETE.MIDDLE.Y[1]
	],
	[	// Stage complete MechRing - inner
		TEX_TRANS_X * ATLAS_ORIG_COOR.STAGE_COMPLETE.INNER.X[0], TEX_TRANS_X * ATLAS_ORIG_COOR.STAGE_COMPLETE.INNER.X[1], 
		TEX_TRANS_Y * ATLAS_ORIG_COOR.STAGE_COMPLETE.INNER.Y[0], TEX_TRANS_Y * ATLAS_ORIG_COOR.STAGE_COMPLETE.INNER.Y[1]
	],
];


// SDF Font Texture Path
// const COMIC_FONT_TEXTURE_PATH = '../../../../consolas_sdf35/consolas_sdf35_2.bmp'
const COMIC_FONT_TEXTURE_PATH = '../../../../resources/fonts/consolas_sdf35/consolas_sdf35.png'
// SDF Font Texture Coordinates Path
const COMIC_FONT_METRICS_PATH = '../../../../consolas_sdf35/metrics/consolas_sdf35.txt'


/* * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * *
 * Debugging  
 */
const DEBUG = {
	WEB_GL: true,
	MATERIAL: true,
	GEOMETRY: true,
	MESH: true,
	RECT: true,
	CAMERA: true,
};