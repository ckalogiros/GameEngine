"use strict";


const INT_NULL = -1; // For case like 0 index arrays, where the number 0 index cannot be used as null element for a buffer

// const MAX_INT = 0x1000000000000000
const MAX_INT = 10000

const MILISEC = 0.001;
const NANOSEC = 0.000001;


function CHECK_ERROR(obj, msg) {
	if (!obj || obj === undefined) {
		console.error('object:', obj, msg)
	}
}

/* * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * *
 * Application Constants 
 */
const PLATFORM = {
	WIN_NT_IMPL: false,
	WIN_PHONE_IMPL: false,
	ANDROID_IMPL: false,
	I_PHONE_IMPL: false,
	BLACK_BERRY_IMPL: false,
}

const STATE = {

	scene:{
		active: null,
		idx: null,
	},

	loop: {
		paused: false,
	},
	
	mesh: {
		hovered: null,
		hoveredId: INT_NULL,
		hoveredIdx: INT_NULL,

		clicked: null,
		clickedId: INT_NULL,
		clickedIdx: INT_NULL,

		grabed: null,
		grabedId: INT_NULL,
		grabedIdx: INT_NULL,
		
		selected: null,
		selectedId: INT_NULL,
		selectedIdx: INT_NULL,

	},
};



let _cnt = 0x1;
const MESH_STATE = {

	IN_HOVER: _cnt <<= 1,
	IN_SCALE: _cnt <<= 1,
	IN_MOVE: _cnt <<= 1,
	
	IS_MOVABLE: _cnt <<= 1,

	CLICKED_MOUSE_L: _cnt <<= 1,
	CLICKED_MOUSE_M: _cnt <<= 1,
	CLICKED_MOUSE_R: _cnt <<= 1,


	Print(mask){

		let str = '';
		if(mask & this.IN_HOVER) str+='IN_HOVER,' 
		if(mask & this.IN_SCALE) str+='IN_SCALE,' 
		if(mask & this.IN_MOVE) str+='IN_MOVE,' 
		if(mask & this.IS_MOVABLE) str+='IS_MOVABLE,' 
		if(mask & this.CLICKED_MOUSE_L) str+='CLICKED_MOUSE_L,' 
		if(mask & this.CLICKED_MOUSE_M) str+='CLICKED_MOUSE_M,' 
		if(mask & this.CLICKED_MOUSE_R) str+='CLICKED_MOUSE_R,' 
		// console.info(str)
	}
};

// _cnt = 0;
// const MESH_EVENT_CLBKS_INDEX_TABLE = {

// 	SLIDER_CHANGE_VALUE: _cnt++,
	
// 	SIZE: _cnt,
// };

_cnt = 0x1;
/**
 * The type of binding of source-target objects,
 * That is what function will be called based on the type or types (many functions). 
 * Used for events like slider-target, where the slider has to call a function
 * OF the target and ON the target.
 */
const BINDING_TYPE = {
	/**
	 * We choose a bit mask for space efficiency.
	 */
	CHANGE_COLOR_RGB: _cnt <<= 1,
	
};


/* * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * *
 * Loaders's Constants 
 */
const CHAR_ARRAY_START_OFFSET = ' '.charCodeAt(0);


/* * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * *
 * Timer's Constants 
 */
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

	COUNT: g_cnt,
};
//  must continue counting from FONTS, as all font textures should be at the
const TEXTURES = {

	SDF_CONSOLAS_LARGE: FONTS.SDF_CONSOLAS_LARGE,
	SDF_CONSOLAS_SMALL: FONTS.SDF_CONSOLAS_SMALL,
	TEST: g_cnt++,

	COUNT: g_cnt,
};

// SDF Font textures names and paths
const RESOURCES_PATH = '/resources';
const FONT_CONSOLAS_SDF_LARGE = 'consolas_sdf_11115w';
const FONT_CONSOLAS_SDF_SMALL = 'consolas_sdf_2048w';
const COMIC_FONT_METRICS_PATH = '../../../../consolas_sdf/metrics/consolas_sdf.txt'

// Textures names and paths
const TEXTURE_TEST = 'msdf';

/* * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * *
 * Meshes  
 */

/**
 * MESH_TYPES: A bitmask to check if a mesh is of a specific type
 */
_cnt = 0x1;
const MESH_TYPES = {
	GEOMETRY2D: _cnt <<= 1,
	TEXT_GEOMETRY2D: _cnt <<= 1,
	GEOMETRY3D: _cnt <<= 1,
	CUBE_GEOMETRY: _cnt <<= 1,

	MATERIAL: _cnt <<= 1,
	FONT_MATERIAL: _cnt <<= 1,

	MESH: _cnt <<= 1,
	TEXT_MESH: _cnt <<= 1,

	WIDGET_TEXT_LABEL: _cnt <<= 1,
	WIDGET_BUTTON: _cnt <<= 1,
	WIDGET_TEXT: _cnt <<= 1,
	WIDGET_TEXT_DYNAMIC: _cnt <<= 1,
	WIDGET_SLIDER: _cnt <<= 1,
	WIDGET_SLIDER_BAR: _cnt <<= 1,
	WIDGET_SLIDER_HANDLE: _cnt <<= 1,
};

function GetMeshType(type) {

	let meshType = []

	if (type & MESH_TYPES.GEOMETRY2D) { meshType.push('Geometry2D'); }
	if (type & MESH_TYPES.TEXT_GEOMETRY2D) { meshType.push('Geometry2D_Text'); }
	if (type & MESH_TYPES.GEOMETRY3D) { meshType.push('Geometry3D'); }
	if (type & MESH_TYPES.CUBE_GEOMETRY) { meshType.push('CubeGeometry'); }

	if (type & MESH_TYPES.MATERIAL) { meshType.push('Material'); }
	if (type & MESH_TYPES.FONT_MATERIAL) { meshType.push('FontMaterial'); }
	
	if (type & MESH_TYPES.MESH) { meshType.push('Mesh'); }
	if (type & MESH_TYPES.TEXT_MESH) { meshType.push('Text_Mesh'); }
	
	if (type & MESH_TYPES.WIDGET_TEXT_LABEL) { meshType.push('Widget_Label_Text_Mesh'); }
	if (type & MESH_TYPES.WIDGET_BUTTON) { meshType.push('Widget_Button_Mesh'); }
	if (type & MESH_TYPES.WIDGET_TEXT) { meshType.push('Widget_Text_Mesh'); }
	if (type & MESH_TYPES.WIDGET_TEXT_DYNAMIC) { meshType.push('Widget_Dynamic_Text_Mesh'); }
	if (type & MESH_TYPES.WIDGET_SLIDER) { meshType.push('WIDGET_SLIDER'); }
	if (type & MESH_TYPES.WIDGET_SLIDER_BAR) { meshType.push('WIDGET_SLIDER_BAR'); }
	if (type & MESH_TYPES.WIDGET_SLIDER_HANDLE) { meshType.push('WIDGET_SLIDER_HANDLE'); }

	return meshType;
}

function GetMeshNameFromType(type) {

	let meshType = ''

	if (type & MESH_TYPES.GEOMETRY2D) { meshType = 'Geometry2D'; }
	if (type & MESH_TYPES.TEXT_GEOMETRY2D) { meshType = 'Geometry2D_Text'; }
	if (type & MESH_TYPES.GEOMETRY3D) { meshType = 'Geometry3D'; }
	if (type & MESH_TYPES.CUBE_GEOMETRY) { meshType = 'CubeGeometry'; }

	if (type & MESH_TYPES.MATERIAL) { meshType = 'Material'; }
	if (type & MESH_TYPES.FONT_MATERIAL) { meshType = 'FontMaterial'; }
	
	if (type & MESH_TYPES.MESH) { meshType = 'Mesh'; }
	if (type & MESH_TYPES.TEXT_MESH) { meshType = 'Text_Mesh'; }
	
	if (type & MESH_TYPES.WIDGET_TEXT_LABEL) { meshType = 'Widget_Label_Text_Mesh'; }
	if (type & MESH_TYPES.WIDGET_BUTTON) { meshType = 'Widget_Button_Mesh'; }
	if (type & MESH_TYPES.WIDGET_TEXT) { meshType = 'Widget_Text_Mesh'; }
	if (type & MESH_TYPES.WIDGET_TEXT_DYNAMIC) { meshType = 'Widget_Dynamic_Text_Mesh'; }
	if (type & MESH_TYPES.WIDGET_SLIDER) { meshType = 'WIDGET_SLIDER'; }
	if (type & MESH_TYPES.WIDGET_SLIDER_BAR) { meshType = 'WIDGET_SLIDER_BAR'; }
	if (type & MESH_TYPES.WIDGET_SLIDER_HANDLE) { meshType = 'WIDGET_SLIDER_HANDLE'; }

	return meshType;
}


/* * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * *
 * Events  
 */
_cnt = 0x1;
const LISTEN_EVENT_TYPES = {
	HOVER: _cnt <<= 1,

	NULL: _cnt <<= 1,
};

function GetListenEventsType(type) {

	if (type & LISTEN_EVENT_TYPES.HOVER) { return 'HOVER'; }
}

_cnt = 0x1;
const DISPATCH_EVENT_TYPES = {
	SCALE_UP_DOWN: _cnt <<= 1,
	DIM_COLOR: _cnt <<= 1,

	EXCLUSIVE: _cnt <<= 1,

	NULL: _cnt <<= 1,
};

function GetDispatchEventsType(type) {

	if (type & DISPATCH_EVENT_TYPES.SCALE_UP_DOWN) { return 'SCALE_UP_DOWN'; }
	if (type & DISPATCH_EVENT_TYPES.DIM_COLOR) { return 'DIM_COLOR'; }
}


/* * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * *
 * Debugging  
 */
const DEBUG = {
	CORE: true,
	MATERIAL: true,
	GEOMETRY: true,
	MESH: true,
	MESH_ALL_UVS: false,
	RECT: false,
	CAMERA: false,

	TEXTURE: false,
	UVS: false,

	// Graphics
	WEB_GL: false,
	SHADER_INFO: false,
	SHADERS: true,

	BINDING_FUNCTIONS: true,
};