"use strict";

/*******************************************************************************************************************************************************/
// Graphics Globals


const gfxCtx = {
    gl: null,
    ext: null,
};

const GL = {
    BOUND_PROG_IDX: INT_NULL, // The current bound gl program index
    BOUND_PROG: INT_NULL, // The current bound gl program 
    BOUND_VAO: INT_NULL, // The current bound vertex array  
    BOUND_VBO_IDX: INT_NULL, // The current bound vertex buffer index
    BOUND_VBO: INT_NULL, // The current bound vertex buffer 
    BOUND_TEXTURE_IDX: INT_NULL, // The current bound texture index 
    BOUND_TEXTURE_ID: INT_NULL, // The current bound texture 
};

/** Grouping shader programs. Example: group for debug user interface meshes, default group meshes */
const PROGRAMS_GROUPS = {

    DEBUG: {
        IDX: INT_NULL, // The index of the group of programs dedicated for displaing debug info. 
        MASK: 0x1,
    },

    DEFAULT: {
        IDX: INT_NULL, // The default group stores shader programs for 
        MASK: 0x2,
    },

    GetIdxByMask(mask) {
        if (mask & this.DEFAULT.MASK) return this.DEFAULT.IDX;
        else if (mask & this.DEBUG.MASK) return this.DEBUG.IDX;
    },

    /**DEBUG */ GetName(idx){
        if(this.DEBUG.IDX === idx) return 'DEBUG progs group'
        else if(this.DEFAULT.IDX === idx) return 'DEFAULT progs group'
        else return `UNKOWN progs group index. index:${idx}`
    },
}



_cnt = 0x1;
const GFX_CTX_FLAGS = {

    PRIVATE: _cnt <<= 0x1,
    ACTIVE: _cnt <<= 0x1,
    INACTIVE: _cnt <<= 0x1,
}


/**
 * SID: Shader Type ID, for creating different _glPrograms with 
 * different vertex and fragment shaders bbbased uppon the input attribbutes, input uniforms and other properties.
 * Shader creation flags 
 */

let BIT1 = 0x1, BIT2 = 0x1, BIT3 = 0x1, BIT4 = 0x1, BIT5 = 0x1;
const SID = {

    SHAD: {
        INDEXED: BIT1 <<= 1,
        TEXT_SDF: BIT1 <<= 1,
    },

    ATTR: {
        COL4: BIT2 <<= 1,
        POS2: BIT2 <<= 1,
        SCALE2: BIT2 <<= 1,
        TEX2: BIT2 <<= 1,
        WPOS_TIME4: BIT2 <<= 1,
        TIME: BIT2 <<= 1,
        SDF: BIT2 <<= 1,
        PARAMS1: BIT2 <<= 1,
        BORDER: BIT2 <<= 1,
        R_CORNERS: BIT2 <<= 1,
        FEATHER: BIT2 <<= 1,
        POS3: BIT2 <<= 1,
        SCALE3: BIT2 <<= 1,
        COL4_PER_VERTEX: BIT2 <<= 1,
        EMPTY: BIT2 <<= 1,
    },

    UNIF: {
        PROJECTION: 0x1,
        U_BUFFER: 0x2,
        BUFFER_RES: 0x4,
    },

    // FX
    FX: {
        FS_PARTICLES: BIT3 <<= 1,
        FS_FIRE: BIT3 <<= 1,
        FS_EXPLOSION_CIRCLE: BIT3 <<= 1,
        FS_EXPLOSION_SIMPLE: BIT3 <<= 1,
        FS_VORONOI_EXPLOSION: BIT3 <<= 1,
        FS_GRADIENT: BIT3 <<= 1,
        FS_HIGH_TECH: BIT3 <<= 1,
        FS_CRAMBLE: BIT3 <<= 1,
        FS_NOISE: BIT3 <<= 1,
        FS_V2DGFX: BIT3 <<= 1,
        FS_GLOW: BIT3 <<= 1,
        FS_TWIST: BIT3 <<= 1,
        FS_VORTEX: BIT3 <<= 1,
        FS_VOLUMETRIC_EXPLOSION: BIT3 <<= 1,
        FS_SHADOW: BIT3 <<= 1,
    },

    PASS: {
        COL4: BIT4 <<= 1,
        POS2: BIT4 <<= 1,
        DIM2: BIT4 <<= 1,
        TEX2: BIT4 <<= 1,
        WPOS2: BIT4 <<= 1,
        TIME1: BIT4 <<= 1,
        RES2: BIT4 <<= 1,
        STYLE3: BIT4 <<= 1,
        SDF2: BIT4 <<= 1,
        PARAMS1: BIT4 <<= 1,
    },

    DEBUG: false,
    // DEBUG:{
    //     RECT_SHADER: BIT5 <<= 1,
    //     TEXT_SHADER: BIT5 <<= 1,
    // },

    CheckSidMatch(sid1, sid2) {

        if (
            sid1.shad === sid2.shad &&
            sid1.attr === sid2.attr &&
            sid1.unif === sid2.unif &&
            sid1.pass === sid2.pass &&
            sid1.progs_group === sid2.progs_group
        )
            return true;
        return false;
    },

    // Copy(sid) {
    //     this.shad = sid.shad;
    //     this.attr = sid.attr;
    //     this.unif = sid.unif;
    //     this.pass = sid.pass;
    //     this.pass = sid.pass;
    //     this.progs_group = this.progs_group
    // },
};



/**
 * Global Shader Programs. Not essential, for convinience only.
 * One can pass the SID bellow directly to GlAddMesh(SID) parameter.
 */


/**
 * Must OR the SID with TIME and PARAMS1, in order for the 
 * GlBufferOperations to calculate the vb count correctly.
 */
const SID_DEFAULT = {
    shad: SID.SHAD.INDEXED,
    attr: (SID.ATTR.COL4 | SID.ATTR.POS2 | SID.ATTR.WPOS_TIME4 | SID.ATTR.TIME | SID.ATTR.PARAMS1 | SID.ATTR.STYLE),
    pass: SID.PASS.DIM2,
}
const SID_DEFAULT_TEXTURE = {
    shad: SID.SHAD.INDEXED,
    attr: (SID.ATTR.COL4 | SID.ATTR.POS2 | SID.ATTR.WPOS_TIME4 | SID.ATTR.TEX2),
    pass: SID.PASS.DIM2,
    // pass: 0,
}
const SID_DEFAULT_TEXTURE_SDF = {
    shad: SID.SHAD.INDEXED | SID.SHAD.TEXT_SDF,
    attr: (SID.ATTR.COL4 | SID.ATTR.POS2 | SID.ATTR.WPOS_TIME4 | SID.ATTR.TEX2 | SID.ATTR.SDF),
    pass: SID.PASS.DIM2,
    // pass: 0,
}

/**
 * GL program's indexes
 */
const PROGRAMS = {
    DEBUG_PROGRAM: 0x1,
};


const VS_CRAMBLE_TRIANGLE = 'CrambleTriangle';

// TODO: Create a smaller buffer that ca resize its self
const MAX_VERTEX_BUFFER_COUNT = 256;
const MAX_INDEX_BUFFER_COUNT = 64;
const INDICES_PER_RECT = 6;
const VERTS_PER_RECT = 6;
const VERTS_PER_RECT_INDEXED = 4;

const V_COL_COUNT = 4; // Number of floats for vertex buffer's attribute
const V_POS_COUNT = 2;
const V_SCALE_COUNT = 2;
const V_TEX_COUNT = 2;
const V_WPOS_COUNT = 3;
const V_WPOS_TIME_COUNT = 4; // Use the 4th element for the time attribute 
const V_STYLE_COUNT = 3;
const V_BORDER_WIDTH = 1, V_BORDER_FEATHER = 1, V_ROUND_CORNERS = 1;
const V_TIME_COUNT = 1;
const V_PARAMS1_COUNT = 4;
const V_SDF_COUNT = 2;

// The style's buffer attribute strides(buffer indexes) 
const V_ROUND_CORNER_STRIDE = 0;
const V_BORDER_WIDTH_STRIDE = 1;
const V_BORDER_FEATHER_STRIDE = 2;


const NO_SPECIFIC_GL_BUFFER = INT_NULL;
const GL_VB = {

    // Let the application decide. If a vertex buffer with the same ...
    ANY: 0, // SID exists, it will use it, else it will create a new one.
    NEW: 1, // Create a new vertexBuffer.
    SPECIFIC: 2, // Use specific index of a vertex buffer.
    // Use private vertex buffer. If a private and inactive buffer exists it will use that, ...
    PRIVATE: 3, // ... else it will create a new buffer and render it as private
};

_cnt = 0x1;
const GFX = {

    // Let the application decide. If a vertex buffer with the same ...
    ANY: _cnt <<= 0x1, // SID exists, it will use it, else it will create a new one.
    NEW: _cnt <<= 0x1, // Create a new vertexBuffer.
    SPECIFIC: _cnt <<= 0x1, // Use specific index of a vertex buffer.
    // Use private vertex buffer. If a private and inactive buffer exists it will use that, ...
    PRIVATE: _cnt <<= 0x1, // ... else it will create a new buffer and render it as private

    STATIC: _cnt <<= 0x1, // Choose a buffer that is going to be updated rarely
    DYNAMIC: _cnt <<= 0x1, // Choose a buffer that is going to be updated every frame
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
        widthIdx: 0,
        heightIdx: 1,
        timeIdx: 2,
        count: 3,
        progIdx: INT_NULL,  // reference to the program
    },
    defaultVertex: { // Uniform buffer indexes to pass default vertex shader params
        widthIdx: cnt1++,
        heightIdx: cnt1++,
        timeIdx: cnt1++,
        mouseXPosIdx: cnt1++,
        mouseYPosIdx: cnt1++,
        count: cnt1,
        progIdx: INT_NULL,  // reference to the program
    },
    sdf: { // Uniform buffer indexes to pass sdf params
        innerIdx: cnt2++,
        outerIdx: cnt2++,
        count: cnt2,
        progIdx: INT_NULL,
    },
    NOISE: {
        widthIdx: 0,
        heightIdx: 1,
        timeIdx: 1,
        dirIdx: 1,
        count: 2,
        progIdx: INT_NULL,  // reference to the program
    },
    GLOW: {
        widthIdx: 0,
        heightIdx: 1,
        glowSize: 2,
        count: 3,
        progIdx: INT_NULL,  // reference to the program
    },
    VORTEX: {
        widthIdx: 0,
        heightIdx: 1,
        radiusIdx: 2,
        count: 3,
        progIdx: INT_NULL,  // reference to the program
    },
    TWIST: {
        widthIdx: 0,
        heightIdx: 1,
        timeIdx: 2,
        dirIdx: 3,
        count: 4,
        progIdx: INT_NULL,  // reference to the program
    },
    particles: { // Uniform buffer indexes to pass default vertex shader params
        widthIdx: cntPart++,
        heightIdx: cntPart++,
        speedIdx: cntPart++,
        count: cntPart,
        progIdx: INT_NULL,  // reference to the program
    },
    CRAMBLE: {
        widthIdx: 0,
        heightIdx: 1,
        timeIdx: 2,
        count: 3,
        progIdx: INT_NULL,  // reference to the program
    },
    VORONOI_EXPLOSION: {
        widthIdx: 0,
        heightIdx: 1,
        timeIdx: 2,
        count: 3,
        progIdx: INT_NULL,  // reference to the program
    },

};

// Store key-value pairs of texture name - texture index(for the global texture array. See GlTextures.js)
// TODO: Create buffers of fonts and farmebuffers
const Texture = {
    atlas: INT_NULL,
    font: INT_NULL,
    frameBufferTexture0: INT_NULL,

    // Current Bound Texture's index(in the texture array. See GlTextures.js). 
    // Only one bound texture is allowed at any time by webGl, so this is a global access
    // to which texture is bound.
    boundTexture: -1,
};


/**
 * UNIFORMS
 */
const UNIF_TYPE = {
    FLOAT: 0x1406, // FLOAT
    FVEC2: 0x8b50, // _VEC2
    FVEC3: 0x8b51, // _VEC3
    FVEC4: 0x8b52, // _VEC4
    MAT2: 0x8b5a, // _MAT2
    MAT3: 0x8b5b, // _MAT3
    MAT4: 0x8b5c, // _MAT4
    INT: 0x8b56, // INT, 
    BOOL: 0x8b53, // BOOL 
    IVEC2: 0x8b57, // _VEC2
    IVEC3: 0x8b58, // _VEC3
    UIVEC4: 0x8b59, // _VEC4

    UINT: 0x1405, // UINT
    UIVEC2: 0x8dc6, // _VEC2
    UIVEC3: 0x8dc7, // _VEC3
    UIVEC4: 0x8dc8, // _VEC4
};

const FLOAT = 4; // 4 Bytes

/* Graphics Constants
 * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * **/
const TRIG = {
    COS: 0,
    SIN: 0,

};

/** Rotation Matrices */
class ROTATION3D {
    RX = [
        1, 0, 0,
        0, TRIG.COS, -TRIG.SIN,
        0, TRIG.SIN, TRIG.COS,
    ];
    RY = [
        TRIG.COS, 0, TRIG.SIN,
        0, 1, 0,
        -TRIG.SIN, 0, TRIG.COS,
    ];
    RZ = [
        TRIG.COS, -TRIG.SIN, 0,
        TRIG.SIN, TRIG.COS, 0,
        0, 0, 1,
    ];

    Set(cos, sin) {

        this.RX[4] = cos;
        this.RX[5] = -sin;
        this.RX[7] = sin;
        this.RX[8] = cos;

        this.RY[0] = cos;
        this.RY[2] = -sin;
        this.RY[6] = sin;
        this.RY[8] = cos;

        this.RZ[0] = cos;
        this.RZ[1] = -sin;
        this.RZ[3] = sin;
        this.RZ[4] = cos;
    }

    SetRX(cos, sin) {
        this.RX[4] = cos;
        this.RX[5] = -sin;
        this.RX[7] = sin;
        this.RX[8] = cos;
    }
    SetRY(cos, sin) {
        this.RY[0] = cos;
        this.RY[2] = -sin;
        this.RY[6] = sin;
        this.RY[8] = cos;
    }
    SetRZ(cos, sin) {
        this.RZ[0] = cos;
        this.RZ[1] = -sin;
        this.RZ[3] = sin;
        this.RZ[4] = cos;
    }
}

const ROT3D = new ROTATION3D();

const RX3D = [
    1, 0, 0,
    0, TRIG.COS, -TRIG.SIN,
    0, TRIG.SIN, TRIG.COS,
];
const RY3D = [
    TRIG.COS, 0, TRIG.SIN,
    0, 1, 0,
    -TRIG.SIN, 0, TRIG.COS,
];
const RZ3D = [
    TRIG.COS, -TRIG.SIN, 0,
    TRIG.SIN, TRIG.COS, 0,
    0, 0, 1,
];

