/**
 * For the textures we use a texture atlas.
 * We store all tex coords that the atlas has, in a globally accesible buffer.
 * Each mesh may get it's tex coords from the buffer simply by an index,
 * by storing the buffer's coords index in each mesh.
 * 
 * Implementation.
 *    We use a table(array) that has hardcoded texture coordinates for each texture in the atlas.
 */

const TEXTURE_ATLAS_PATH = '../../../../resources/textures/TextureAtlas_1.png'
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
let _cnt = 0;
const ATLAS_TEX_NAMES = {
	COIN: _cnt++,			// Coin
	PWU_BLL: _cnt++,			// PowUp Balls
	PWU_ENL: _cnt++,			// PowUp Player Enlargment
	PWU_BULLET: _cnt++,			// PowUp Bullet
	PWU_POW_BALL: _cnt++,	// PowUp PowerBall

	GUN: _cnt++,	// Gun
	BULLET: _cnt++,	// Gun

	STAGE_COMPLETE: {
		TEXT:{GOOD: _cnt++,},
		OUTER: _cnt++,	// Stage completed logo - outer ring
		MIDDLE: _cnt++,	// Stage completed logo - middle ring
		INNER: _cnt++,	// Stage completed logo - inner ring
	},

	SIZE: _cnt,
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