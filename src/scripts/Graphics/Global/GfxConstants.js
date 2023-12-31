"use strict";

const INT_NULL = -1; // For case like 0 index arrays, where the number 0 index cannot be used as null element for a buffer


/* * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * *
* Graphics Constants */


const gfxCtx = {
	gl:null,
	ext:null,
};

const GL = {
    BOUND_PROG_IDX: INT_NULL, // The current bound gl program index
    BOUND_PROG: INT_NULL, // The current bound gl program 
    BOUND_VAO: INT_NULL, // The current bound vertex array  
    BOUND_VBO_IDX: INT_NULL, // The current bound vertex buffer index
    BOUND_VBO: INT_NULL, // The current bound vertex buffer 
    BOUND_TEXTURE_IDX: INT_NULL, // The current bound texture index 
    BOUND_TEXTURE_ID: INT_NULL, // The current bound texture 
    // ACTIVE_TEXTURE_ID: INT_NULL, // The current bound texture index 
};

// SID: Shader Type ID, for creating different g_glPrograms with 
// different vertex and fragment shaders bbbased uppon the input attribbutes, input uniforms and other properties.
const SID = {
	ATTR:{
        COL4: 	               0x1,
        POS2: 	               0x2,
        SCALE2:                0x4,
        TEX2: 	               0x8,
        WPOS_TIME4:            0x20,
        STYLE:                 0x40,
        TIME:                  0x80,
        SDF_PARAMS:            0x100,
        PARAMS1:               0x200,
    },
	INDEXED:                    0x400,
	TEXT_SDF:                   0x800,
    // FX
    FX:{
        FS_PARTICLES:               0x1000,
        FS_FIRE:                    0x2000,
        FS_EXPLOSION_CIRCLE:        0x4000,
        FS_EXPLOSION_SIMPLE:        0x8000,
        FS_VORONOI_EXPLOSION:       0x10000,
        FS_GRADIENT:                0x20000,
        FS_HIGH_TECH:               0x40000,
        FS_CRAMBLE:                 0x80000,
        FS_NOISE:                   0x100000,
        FS_V2DGFX:                  0x200000,
        FS_GLOW:                    0x400000,
        FS_TWIST:                   0x800000,
        FS_VORTEX:                  0x1000000,
        FS_VOLUMETRIC_EXPLOSION:    0x2000000,
        FS_SHADOW:                  0x4000000,
    },
    DEF2:                           0x20000000,
    DEF3:                           0x40000000,
    TEST_SHADER:                    0x400000000,
	
};
let TEST_SHADERS_PROG_IDX = INT_NULL;


/**
 * Global Shader Programs. Not essential, for convinience only.
 * One can pass the SID bellow directly to GlAddMesh(SID) parameter.
 */


/**
 * Must OR the SID with TIME and PARAMS1, in order for the 
 * GlBufferOperations to calculate the vb count correctly.
 */ 
const SID_MIN = 
    (SID.ATTR.COL4 | SID.ATTR.POS2 | SID.ATTR.SCALE2 | SID.ATTR.WPOS_TIME4 | SID.INDEXED | SID.ATTR.TIME);
const SID_DEFAULT = 
    (SID.ATTR.COL4 | SID.ATTR.POS2 | SID.ATTR.SCALE2 | SID.ATTR.WPOS_TIME4 | SID.ATTR.TIME | SID.ATTR.PARAMS1 | SID.ATTR.STYLE | SID.INDEXED);
const SID_DEFAULT_TEXTURE = 
    (SID.ATTR.COL4 | SID.ATTR.POS2 | SID.ATTR.SCALE2 | SID.ATTR.WPOS_TIME4 | SID.INDEXED | SID.ATTR.TEX2);
const SID_DEFAULT_TEXTURE_SDF = 
    (SID.ATTR.COL4 | SID.ATTR.POS2 | SID.ATTR.SCALE2 | SID.ATTR.WPOS_TIME4 | SID.INDEXED | SID.ATTR.TEX2 | SID.TEXT_SDF | SID.ATTR.SDF_PARAMS);
const SID_EXPLOSION = 
    (SID.ATTR.COL4 | SID.ATTR.POS2 | SID.ATTR.WPOS_TIME4 | SID.INDEXED | SID.ATTR.TIME);
const SID_NOISE = 
    (SID.ATTR.COL4 | SID.ATTR.POS2 | SID.ATTR.WPOS_TIME4 | SID.INDEXED | SID.ATTR.TIME | SID.FX.FS_NOISE);
const SID_PARTICLES_TAIL = 
    (SID.ATTR.COL4 | SID.ATTR.POS2 | SID.ATTR.WPOS_TIME4 | SID.INDEXED | SID.ATTR.TIME | SID.ATTR.PARAMS1 | SID.FX.FS_PARTICLES);

/**
 * GL program's indexes
 */
const PROGRAM = {
    explosions: INT_NULL,
};


const VS_CRAMBLE_TRIANGLE = 'CrambleTriangle';

// TODO: Create a smaller buffer that ca resize its self
const MAX_VERTEX_BUFFER_COUNT 	= 16000;
const MAX_INDEX_BUFFER_COUNT 	= MAX_VERTEX_BUFFER_COUNT / 2;
const INDICES_PER_RECT 			= 6
const VERTS_PER_RECT 			= 6
const VERTS_PER_RECT_INDEXED 	= 4

const V_COL_COUNT 		     = 4 // Number of floats for vertex buffer's attribute
const V_POS_COUNT 		     = 2 
const V_SCALE_COUNT 	     = 2 
const V_TEX_COUNT 		     = 2 
const V_WPOS_COUNT 		     = 3 
const V_WPOS_TIME_COUNT      = 4 // Use the 4th element for the time attribute 
const V_STYLE_COUNT          = 3 
const V_SDF_PARAMS_COUNT     = 2 
const V_TIME_COUNT           = 1 
const V_PARAMS1_COUNT        = 4 

// The style's buffer attribute strides(buffer indexes) 
const V_ROUND_CORNER_STRIDE	  = 0 
const V_BORDER_WIDTH_STRIDE	  = 1 
const V_BORDER_FEATHER_STRIDE = 2 

// 
const NO_SPECIFIC_GL_BUFFER     = INT_NULL; 
const GL_VB = {
    NEW: 0,
    SPECIFIC: 1,
    ANY: 2,
};

const MAX_RESERVED_BUFFERS = 10;

// Temporary counters to automaticaly calculate indexes
let cnt1 = 0;
let cnt2 = 0;
let cnt3 = 0;
let cnt4 = 0;
let cntPart = 0;
const UNIFORM_PARAMS = {
    WHT: { // Width, Height, Time
        widthIdx:  0,
        heightIdx: 1,
        timeIdx: 2,
        count: 3,
        progIdx: INT_NULL,  // Refference to the program
    },
    defaultVertex: { // Uniform buffer indexes to pass default vertex shader params
        widthIdx:       cnt1++,
        heightIdx:      cnt1++,
        timeIdx:        cnt1++,
        mouseXPosIdx:   cnt1++,
        mouseYPosIdx:   cnt1++,
        count: cnt1,
        progIdx: INT_NULL,  // Refference to the program
    },
    sdf: { // Uniform buffer indexes to pass sdf params
        innerIdx:       cnt2++,
        outerIdx:       cnt2++,
        count:          cnt2,
        progIdx:        INT_NULL, 
    },
    NOISE:{
        widthIdx:  0,
        heightIdx: 1,
        timeIdx: 1,
        dirIdx: 1,
        count: 2,
        progIdx: INT_NULL,  // Refference to the program
    },
    GLOW:{
        widthIdx:  0,
        heightIdx: 1,
        glowSize: 2,
        count: 3,
        progIdx: INT_NULL,  // Refference to the program
    },
    VORTEX:{
        widthIdx:  0,
        heightIdx: 1,
        radiusIdx: 2,
        count: 3,
        progIdx: INT_NULL,  // Refference to the program
    },
    TWIST:{
        widthIdx:  0,
        heightIdx: 1,
        timeIdx: 2,
        dirIdx: 3,
        count: 4,
        progIdx: INT_NULL,  // Refference to the program
    },
    particles: { // Uniform buffer indexes to pass default vertex shader params
        widthIdx:   cntPart++,
        heightIdx:  cntPart++,
        speedIdx:   cntPart++,
        count: cntPart,
        progIdx: INT_NULL,  // Refference to the program
    },
    CRAMBLE:{
        widthIdx:  0,
        heightIdx: 1,
        timeIdx: 2,
        count: 3,
        progIdx: INT_NULL,  // Refference to the program
    },
    VORONOI_EXPLOSION:{
        widthIdx:  0,
        heightIdx: 1,
        timeIdx: 2,
        count: 3,
        progIdx: INT_NULL,  // Refference to the program
    },
    
};

// Store key-value pairs of texture name - texture index(for the global texture array. See GlTextures.js)
const Texture = {
    atlas: INT_NULL,
    fontConsolasSdf35: INT_NULL,
    frameBufferTexture0: INT_NULL,

    // Current Bound Texture's index(in the texture array. See GlTextures.js). 
    // Only one bound texture is allowed at any time by webGl, so this is a global access
    // to which texture is bound.
    boundTexture: -1, 
};




const FLOAT = 4; // 4 Bytes

/* Graphics Constants
 * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * **/



