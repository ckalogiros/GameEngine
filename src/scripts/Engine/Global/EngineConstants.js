"use strict";


const INT_NULL = -1; // For case like 0 index arrays, where the number 0 index cannot be used as null element for a buffer

// const MAX_INT = 0x1000000000000000
const MAX_INT = 10000

const MILISEC = 0.001;
const NANOSEC = 0.000001;

const ALL = 0xffff;

const UNCHANGED = 0xffff; // Just a flag, used for checking if a value should change or remain the same.




/*************************************************************************************************/
// Application Constants 
let _cnt = 0x1;
const PLATFORM = {
	WIN_NT_IMPL: false,
	WIN_PHONE_IMPL: false,
	ANDROID_IMPL: false,
	I_PHONE_IMPL: false,
	BLACK_BERRY_IMPL: false,
}




/*************************************************************************************************/
// Engine Constants
const Device = {
	MAX_WIDTH: 1600,
	MAX_HEIGHT: 800,
	width: 0,
	height: 0,
	ratio: 1, // Create same proportions throughout any device. It measures the ratio of the game's build device width and the current device width
}
const VIEWPORT = {
	WIDTH: 0,
	HEIGHT: 0,
	LEFT: 0,
	RIGHT: 0,
	TOP: 0,
	BOTTOM: 0,
	ratio: 0,
	MARGIN: {
		LEFT: 0,
		RIGHT: 0,
		TOP: 0,
		BOTTOM: 0,
	},
};

const STATE = {

	scene: {
		active: null,
		active_idx: null,
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

		SetHovered(mesh) {
			this.hovered = mesh;
			if (!mesh) {
				this.hoveredId = INT_NULL;
				this.hoveredIdx = INT_NULL;
			}
			else {
				this.hoveredId = mesh.id;
				this.hoveredIdx = mesh.idx;
			}
		},
		SetGrabed(mesh) {
			this.grabed = mesh;
			if (!mesh) {
				this.grabedId = INT_NULL;
				this.grabedIdx = INT_NULL;
			}
			else {
				this.grabedId = mesh.id;
				this.grabedIdx = mesh.idx;
			}
		},
		SetClicked(mesh) {
			this.clicked = mesh;
			if (!mesh) {
				this.clickedId = INT_NULL;
				this.clickedIdx = INT_NULL;
			}
			else {
				this.clickedId = mesh.id;
				this.clickedIdx = mesh.idx;
			}
		},
		SetSelected(mesh) {
			this.selected = mesh;
			if (!mesh) {
				this.selectedId = INT_NULL;
				this.selectedIdx = INT_NULL;
			}
			else {
				this.selectedId = mesh.id;
				this.selectedIdx = mesh.idx;
			}
		},
	},

	mouse: {

		activeClickedButtonId: INT_NULL,
	},
};

_cnt = 0x1;
let _cnt2 = 0x1;
const SECTION = {

	VERTICAL: _cnt,
	HORIZONTAL: _cnt <<= 0x1,
	INHERIT: _cnt <<= 0x1,
	EXPAND: _cnt <<= 0x1,
	FIT: _cnt <<= 0x1,
	FOLLOW: _cnt <<= 0x1,

	ITEM_FIT: _cnt <<= 0x1,
	ITEM_RESTRICT: _cnt <<= 0x1,

	NO_ITEMS_CALC: _cnt <<= 0x1,
	TOP_DOWN: _cnt <<= 0x1,

};

_cnt = 0x1;
const MESH_STATE = {

	IN_FOCUS: _cnt <<= 1,
	IN_HOVER: _cnt <<= 1,
	IN_SCALE: _cnt <<= 1,
	IN_MOVE: _cnt <<= 1,
	IN_GRAB: _cnt <<= 1,
	IN_HOVER_COLOR: _cnt <<= 1,

	IS_HOVERABLE: _cnt <<= 1,
	IS_CLICKABLE: _cnt <<= 1,
	IS_MOVABLE: _cnt <<= 1,
	IS_GRABABLE: _cnt <<= 1,
	IS_FAKE_EVENT: _cnt <<= 1,
	IS_FAKE_HOVERABLE: _cnt <<= 1,
	IS_FAKE_CLICKABLE: _cnt <<= 1,
	IS_HOVER_COLORABLE: _cnt <<= 1,

	// CLICKED_MOUSE_L: _cnt <<= 1,
	// CLICKED_MOUSE_M: _cnt <<= 1,
	// CLICKED_MOUSE_R: _cnt <<= 1,

	HAS_POPUP: _cnt <<= 1,

	// CHILDREN_HAVE_CLICK_EVENT: _cnt <<= 1,
	// CHILDREN_HAVE_HOVER_EVENT: _cnt <<= 1,


	Print(mask) {

		let str = '';
		if (mask & this.IN_FOCUS) str += 'IN_FOCUS,'
		if (mask & this.IN_HOVER) str += 'IN_HOVER,'
		if (mask & this.IN_SCALE) str += 'IN_SCALE,'
		if (mask & this.IN_MOVE) str += 'IN_MOVE,'
		if (mask & this.IN_GRAB) str += 'IN_GRAB,'
		if (mask & this.IN_HOVER_COLOR) str += 'IN_HOVER_COLOR,'

		if (mask & this.IS_MOVABLE) str += 'IS_MOVABLE,'
		if (mask & this.IS_GRABABLE) str += 'IS_GRABABLE,'

		if (mask & this.CLICKED_MOUSE_L) str += 'CLICKED_MOUSE_L,'
		if (mask & this.CLICKED_MOUSE_M) str += 'CLICKED_MOUSE_M,'
		if (mask & this.CLICKED_MOUSE_R) str += 'CLICKED_MOUSE_R,'

		if (mask & this.IS_HOVERABLE) str += 'IS_HOVERABLE,'
		if (mask & this.HAS_POPUP) str += 'HAS_POPUP,'
		if (mask & this.IS_HOVER_COLORABLE) str += 'IS_HOVER_COLORABLE,'
		// console.info(str)
	}
};

const MOUSE = {

	BTN_ID: {

		LEFT: 0,
		MIDDLE: 1,
		RIGHT: 2,
	},
};

_cnt = 0x1;
const ALIGN = {

	LEFT: _cnt,
	RIGHT: _cnt <<= 0x1,
	TOP: _cnt <<= 0x1,
	BOTTOM: _cnt <<= 0x1,
	VERT_CENTER: _cnt <<= 0x1,
	HOR_CENTER: _cnt <<= 0x1,

	VERTICAL: _cnt <<= 0x1,
	HORIZONTAL: _cnt <<= 0x1,
}

const POSITION_CENTER = [0, 0, 0]


_cnt = 0x1;
const FLAGS = {

	FALSE: 0,
	TRUE: 1,
	DESTROY: _cnt <<= 0x1,
}


/*************************************************************************************************/
// Loaders's Constants 
const CHAR_ARRAY_START_OFFSET = ' '.charCodeAt(0);
const CHAR_ARRAY_LETTERS_START_OFFSET = 'A'.charCodeAt(0);




/*************************************************************************************************/
// Timer's Constants 
const TIME_INTERVAL_REPEAT_ALWAYS = 9999999999; // Repeat always a time interval clbk function.




/*************************************************************************************************/
// Mesh's Constants 
const OUT_OF_VIEW = 1000; // Out of screen view in pixels




/*************************************************************************************************/
// Events Constants 




/*************************************************************************************************/
// Style Constants  

const STYLE = {

	BORDER: 0,
	R_CORNERS: 1,
	FEATHER: 2,
}

function TRANSPARENCY(col, transparency) {
	return [col[0], col[1], col[2], transparency]
}
const TRANSPARENT = [0.0, 0.0, 0.0, 0.0];
const WHITE = [1.0, 1.0, 1.0, 1.0];
const BLACK_TRANS = [0.0, 0.0, 0.0, .3];
const BLACK = [0.0, 0.0, 0.0, 1.0];
const GREY0 = [0.05, 0.05, 0.05, 1.0];
const GREY1 = [0.1, 0.1, 0.1, 1.0];
const GREY2 = [0.2, 0.2, 0.2, 1.0];
const GREY3 = [0.3, 0.3, 0.3, 1.0];
const GREY4 = [0.4, 0.4, 0.4, 1.0];
const GREY5 = [0.5, 0.5, 0.5, 1.0];
const GREY6 = [0.6, 0.6, 0.6, 1.0];
const GREY7 = [0.7, 0.7, 0.7, 1.0];
const GREY8 = [0.8, 0.8, 0.8, 1.0];
const GREY9 = [0.9, 0.9, 0.9, 1.0];
const GREEN = [0.0, 1.0, 0.0, 1.0];
const GREENL1 = [0.07, 0.9, 0.0, 1.0];
const GREENL2 = [0.1, 0.8, 0.0, 1.0];
const GREENL3 = [0.1, 0.6, 0.0, 1.0];
const GREENL4 = [0.08, 0.2, 0.0, 1.0];
const BLUE = [0.0, 0.0, 1.0, 1.0];
const BLUE_TRANS = [0.0, 0.0, 1.0, .3];
const BLUER1 = [0.0, 0.2, 88.0, 1.0];
const BLUER2 = [0.0, 0.2, 75.0, 1.0];
const BLUER3 = [0.0, 0.2, 6.0, 1.0];
const RED = [1.0, 0.0, 0.0, 1.0];
const RED_TRANS = [1.0, 0.0, 0.0, .3];
const PURPLE = [0.5, 0.0, 1.0, 1.0];
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

const BLUE_A1 = InterpolateRgb(0, 34, 71);
const BLUE_A2 = InterpolateRgb(0, 55, 114  );
const BLUE_A3 = InterpolateRgb(0, 75, 155  );
const BLUE_A4 = InterpolateRgb(0, 100, 206 );
const GREEN_B1 = InterpolateRgb(0, 58, 0);
const GREEN_B2 = InterpolateRgb(0, 94, 0);
const GREEN_B3 = InterpolateRgb(0, 150, 0);
const GREEN_B4 = InterpolateRgb(0, 210, 0);
const ORANGE_B1 = InterpolateRgb(63, 36, 0);
const ORANGE_B2 = InterpolateRgb(114, 65, 0);
const ORANGE_B3 = InterpolateRgb(158, 89, 0);
const ORANGE_B4 = InterpolateRgb(210, 118, 0);
const ORANGE_C1 = InterpolateRgb(63, 48, 0);
const ORANGE_C2 = InterpolateRgb(114, 86, 0);
const ORANGE_C3 = InterpolateRgb(158, 118, 0);
const ORANGE_C4 = InterpolateRgb(210, 158, 0);
const PURPLE_COOL1 = InterpolateRgb(33, 0, 71);
const PURPLE_COOL2 = InterpolateRgb(60, 0, 130);
const PURPLE_COOL3 = InterpolateRgb(88, 0, 188);
const PURPLE_COOL4 = InterpolateRgb(108, 0, 226);
const PURPLE_HOT1 = InterpolateRgb(71, 0, 71);
const PURPLE_HOT2 = InterpolateRgb(130, 0, 130);
const PURPLE_HOT3 = InterpolateRgb(188, 0, 188);
const PURPLE_HOT4 = InterpolateRgb(226, 0, 226);
const PINK1 = InterpolateRgb(71 , 0, 33 	);
const PINK2 = InterpolateRgb(130, 0, 60 	);
const PINK3 = InterpolateRgb(188, 0, 88 	);
const PINK4 = InterpolateRgb(226, 0, 108	);
const RED1 = InterpolateRgb(66 , 0, 12 	);
const RED2 = InterpolateRgb(114, 0, 21 	);
const RED3 = InterpolateRgb(163, 0, 31 	);
const RED4 = InterpolateRgb(220, 0, 40	);
const BLUE_LIGHT = InterpolateRgb(76, 171, 254);
const blue = InterpolateRgb(0.345 * 255, 0.780 * 255, 0.988 * 255)
const bluePurple = InterpolateRgb(0.361 * 255, 0.020 * 255, 0.839 * 255)


const COLOR_ARRAY = new Array(
	PINK_240_60_160,
	PINK_240_60_200,
	RED_200_10_10,
	GREEN_33_208_40,
	GREEN_60_240_100,
	GREEN_60_240_60,
	GREEN_60_240_60,
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

const COLORS1 = new Array(
	ORANGE_240_130_10,
	PINK_240_60_160,
	GREEN_33_208_40,
	YELLOW_240_220_10,
	BLUE_10_160_220,
	CYAN_10_200_240,
	CYAN_10_230_240,
	YELLOW_240_240_10,
	GREEN_140_240_10,
	BLUE_10_120_220,
	ORANGE_240_160_10,
	CYAN_10_230_180,
	ORANGE_240_75_10,
	RED_200_10_10,
);




/*************************************************************************************************/
const RESOURCES_PATH = '/resources';
let g_cnt = 0;
const TEXTURE_TYPE = {
	TYPE_FONT: 0x1,
	TYPE_TEXTURE: 0x2,
};

// Textures
// Font textures
const FONT_CONSOLAS_SDF_LARGE = 'consolas_sdf_11115w';
const FONT_CONSOLAS_SDF_SMALL = 'consolas_sdf_2048w';
const COMIC_FONT_METRICS_PATH = '../../../../resources/fonts/consolas_sdf/metrics/consolas_sdf35.txt'
const TEST_MSDF_FONT_1 = 'msdf_a_char';
const TEST_MTSDF_FONT_TEST_1024DIM = 'consola_mtsdf_test_1024';
// const TEST_MSDF_FONT_TEST_256DIM = 'consola_msdf_test_256dim';
// const TEST_MSDF_FONT_TEST_512DIM = 'consola_msdf_test_512dim';
// const TEST_MSDF_FONT_TEST_1024DIM = 'consola_msdf_test_1024';
// const TEST_SDF_FONT_TEST_256DIM = 'consola_sdf_test_256dim';
// const TEST_SDF_FONT_TEST_512DIM = 'consola_sdf_test_512dim';
// const TEST_SDF_FONT_TEST_1024DIM = 'consola_sdf_test_1024dim';
// IMPORTANT: Every texture image file above, must be stored to the FONT_PATHS below as shown.
const TEXTURE_PATHS = [
	{
		imgPath: 'fonts/consolas_sdf',
		imgName: TEST_MTSDF_FONT_TEST_1024DIM,
		imgType: 'png',
	},
];
g_cnt = 0;
const TEXTURES = {
	// POTENTIAL_BUG: 
	// IMPORTANT:Font textures MUST precede all other textures
	MSDF_CONSOLAS_1024: g_cnt++,
	FONT_COUNT: g_cnt,

	COUNT: g_cnt,
}



const MENU_FONT_IDX = TEXTURES.MSDF_CONSOLAS_1024; // Set the font for the options menu
const MENU_FONT_SIZE = 4; // Set the font size for the options menu




/*************************************************************************************************/
// Meshes  

// MESH_TYPES_DBG: A bitmask to check if a mesh is of a specific type
_cnt = 0x1;
const MESH_TYPES_DBG = {

	GEOMETRY2D: _cnt <<= 1,
	TEXT_GEOMETRY2D: _cnt <<= 1,
	GEOMETRY3D: _cnt <<= 1,
	CUBE_GEOMETRY: _cnt <<= 1,

	MATERIAL: _cnt <<= 1,
	FONT_MATERIAL: _cnt <<= 1,
	TEXTURE_MATERIAL: _cnt <<= 1,

	MESH: _cnt <<= 1,
	TEXT_MESH: _cnt <<= 1,
	RECT_MESH: _cnt <<= 1,
	PANEL_MESH: _cnt <<= 1,
	SECTION_MESH: _cnt <<= 1,

	WIDGET_GENERIC: _cnt <<= 1,
	WIDGET_TEXT_LABEL: _cnt <<= 1,
	WIDGET_LABEL_TEXT_MESH_MENU_OPTIONS: _cnt <<= 1,
	WIDGET_LABEL_TEXT_MESH_MENU_OPTIONS: _cnt <<= 1,
	WIDGET_BUTTON: _cnt <<= 1,
	WIDGET_SWITCH: _cnt <<= 1,
	WIDGET_TEXT: _cnt <<= 1,
	WIDGET_TEXT_DYNAMIC: _cnt <<= 1,

	WIDGET_SLIDER: _cnt <<= 1,
	WIDGET_SLIDER_BAR: _cnt <<= 1,
	WIDGET_SLIDER_HANDLE: _cnt <<= 1,

	WIDGET_SCROLLER: _cnt <<= 1,
	WIDGET_SCROLLER_BAR: _cnt <<= 1,
	WIDGET_SCROLLER_HANDLE: _cnt <<= 1,

	WIDGET_POP_UP: _cnt <<= 1,
	WIDGET_MENU_BAR: _cnt <<= 1,

	WIDGET_DROP_DOWN: _cnt <<= 1,
	DROP_DOWN_MENU: _cnt <<= 1,

	UI_INFO_GFX: _cnt <<= 1,
	UI_INFO_MESH: _cnt <<= 1,
	SCENE: _cnt <<= 1,
};

function GetMeshNameFromType(type) {

	let meshType = []

	if (type & MESH_TYPES_DBG.GEOMETRY2D) { meshType.push('Geometry2D'); }
	if (type & MESH_TYPES_DBG.TEXT_GEOMETRY2D) { meshType.push('Geometry2D_Text'); }
	if (type & MESH_TYPES_DBG.GEOMETRY3D) { meshType.push('Geometry3D'); }
	if (type & MESH_TYPES_DBG.CUBE_GEOMETRY) { meshType.push('CubeGeometry'); }

	if (type & MESH_TYPES_DBG.MATERIAL) { meshType.push('Material'); }
	if (type & MESH_TYPES_DBG.FONT_MATERIAL) { meshType.push('FontMaterial'); }

	if (type & MESH_TYPES_DBG.MESH) { meshType.push('Mesh'); }
	if (type & MESH_TYPES_DBG.TEXT_MESH) { meshType.push('Text_Mesh'); }
	if (type & MESH_TYPES_DBG.RECT_MESH) { meshType.push('RECT_MESH'); }

	if (type & MESH_TYPES_DBG.SECTION_MESH) { meshType.push('SECTION_MESH'); }

	if (type & MESH_TYPES_DBG.WIDGET_GENERIC) { meshType.push('WIDGET_GENERIC'); }
	if (type & MESH_TYPES_DBG.WIDGET_TEXT_LABEL) { meshType.push('Widget_Label'); }
	if (type & MESH_TYPES_DBG.Widget_Label_Text_Mesh_Menu_Options) { meshType = 'Widget_Label_Text_Mesh_Menu_Options'; }
	if (type & MESH_TYPES_DBG.WIDGET_BUTTON) { meshType.push('Widget_Button'); }
	if (type & MESH_TYPES_DBG.WIDGET_SWITCH) { meshType.push('Widget_Switch'); }
	if (type & MESH_TYPES_DBG.WIDGET_TEXT) { meshType.push('Widget_Text'); }
	if (type & MESH_TYPES_DBG.WIDGET_TEXT_DYNAMIC) { meshType.push('Widget_Dynamic_Text_Mesh'); }
	if (type & MESH_TYPES_DBG.WIDGET_SLIDER) { meshType.push('WIDGET_SLIDER'); }
	if (type & MESH_TYPES_DBG.WIDGET_SLIDER_BAR) { meshType.push('WIDGET_SLIDER_BAR'); }
	if (type & MESH_TYPES_DBG.WIDGET_SLIDER_HANDLE) { meshType.push('WIDGET_SLIDER_HANDLE'); }
	if (type & MESH_TYPES_DBG.WIDGET_POP_UP) { meshType.push('WIDGET_POP_UP'); }

	return meshType;
}

function GetMeshHighOrderNameFromType(type) {

	let meshType = ''

	if (type & MESH_TYPES_DBG.GEOMETRY2D) { meshType = 'GEOMETRY2D'; }
	if (type & MESH_TYPES_DBG.TEXT_GEOMETRY2D) { meshType = 'TEXT_GEOMETRY2D'; }
	if (type & MESH_TYPES_DBG.GEOMETRY3D) { meshType = 'GEOMETRY3D'; }
	if (type & MESH_TYPES_DBG.CUBE_GEOMETRY) { meshType = 'CUBE_GEOMETRY'; }

	if (type & MESH_TYPES_DBG.MATERIAL) { meshType = 'MATERIAL'; }
	if (type & MESH_TYPES_DBG.FONT_MATERIAL) { meshType = 'FONT_MATERIAL'; }

	if (type & MESH_TYPES_DBG.MESH) { meshType = 'MESH'; }
	if (type & MESH_TYPES_DBG.TEXT_MESH) { meshType = 'TEXT_MESH'; }
	if (type & MESH_TYPES_DBG.RECT_MESH) { meshType = 'RECT_MESH'; }

	if (type & MESH_TYPES_DBG.SECTION_MESH) { meshType = 'SECTION_MESH'; }

	if (type & MESH_TYPES_DBG.WIDGET_GENERIC) { meshType = 'WIDGET_GENERIC'; }
	if (type & MESH_TYPES_DBG.WIDGET_TEXT_LABEL) { meshType = 'WIDGET_TEXT_LABEL'; }
	if (type & MESH_TYPES_DBG.WIDGET_LABEL_TEXT_MESH_MENU_OPTIONS) { meshType = 'WIDGET_LABEL_TEXT_MESH_MENU_OPTIONS'; }
	if (type & MESH_TYPES_DBG.WIDGET_BUTTON) { meshType = 'WIDGET_BUTTON'; }
	if (type & MESH_TYPES_DBG.WIDGET_TEXT) { meshType = 'WIDGET_TEXT'; }
	if (type & MESH_TYPES_DBG.WIDGET_TEXT_DYNAMIC) { meshType = 'WIDGET_TEXT_DYNAMIC'; }
	if (type & MESH_TYPES_DBG.WIDGET_SLIDER) { meshType = 'WIDGET_SLIDER'; }
	if (type & MESH_TYPES_DBG.WIDGET_SLIDER_BAR) { meshType = 'WIDGET_SLIDER_BAR'; }
	if (type & MESH_TYPES_DBG.WIDGET_SLIDER_HANDLE) { meshType = 'WIDGET_SLIDER_HANDLE'; }
	if (type & MESH_TYPES_DBG.WIDGET_POP_UP) { meshType = 'WIDGET_POP_UP'; }
	// console.log(MESH_TYPES_DBG.WIDGET_SLIDER);
	return meshType;
}




/*************************************************************************************************/
//  Events  
_cnt = 0x1;
const LISTENERS_FLAGS = {
	ANY_HOVER: _cnt <<= 0x1,
	ANY_CLICK: _cnt <<= 0x1,
	ANY: _cnt <<= 0x1,

	HOVER: _cnt <<= 0x1,
	CLICK: _cnt <<= 0x1,
	ALL: _cnt <<= 0x1,


	mask: 0x0, // the variable to sto
};

_cnt = 0x1;
const LISTEN_EVENT_TYPES = {
	HOVER: _cnt <<= 1,
	CLICK_UP: _cnt <<= 1,
	MOVE: _cnt <<= 1, // MOVE event registers with the CLICK event, no need to create new event in the ListenEvents buffer

	NULL: _cnt <<= 1,
};

_cnt = 0;
/** CAUTION: This is an enum for indexing the Listen_Events class buffer NOT the  Listener_Hover class buffer which is a separate class*/
const LISTEN_EVENT_TYPES_INDEX = {
	HOVER: _cnt++, // HOVER event belongs to another class, that is the Listener_Hover class.
	CLICK: _cnt++,
	// MOVE event registers with the CLICK event, no need to create new event in the ListeEvents buffer.
	SIZE: _cnt,
};

function Listeners_get_event_type_string(event_type_idx) {
	switch (event_type_idx) {
		case LISTEN_EVENT_TYPES_INDEX.HOVER: return 'Hover';
		case LISTEN_EVENT_TYPES_INDEX.CLICK: return 'Click';
	}
}

_cnt = 0x1;
const INFO_LISTEN_EVENT_TYPE = {

	GFX: {
		UPDATE: _cnt <<= 0x1,
		CREATE_PROG: _cnt <<= 0x1,
		CREATE_VB: _cnt <<= 0x1,
		UPDATE_VB: _cnt <<= 0x1,
	},

	GFX2: _cnt <<= 0x1, // For the gfx info mesh that updates from the Renderer loop via time interval

	LISTENERS: _cnt <<= 0x1,
	ALL_MESHES: _cnt <<= 0x1,
	MOUSE: _cnt <<= 0x1,
	MESH: _cnt <<= 0x1,

}
const DEBUG_INFO = {

	UI_TIMERS: {
		IS_ON: false,
		IDX: INT_NULL,
		POS: [280, 800, 0]
	},
	UI_MOUSE: {
		IS_ON: false,
		IDX: INT_NULL,
		POS: [210, 730, 0]
	},
	UI_GFX: {
		IS_ON: false,
		IDX: INT_NULL,
		POS: [340, 13, 0]
	},
	UI_MESH: {
		IS_ON: false,
		IDX: INT_NULL,
		POS: [340, 100, 0]
	},
}




/*************************************************************************************************/
// Debugging. Switching On/Off console.log() in the code.
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

	LISTENERS: true,

	SET_HOVER_TO_ALL_MESHES: false,
	REMOVE_MESH: false,

	GFX: {
		BUFFERS: false,
		ADD_MESH: true,
		REMOVE_MESH: true,
	},

	EVENTS_LISTENERS: {
		WIDGET_DROP_DOWN: false,
	},

	WIGET_DROPDOWN: false,
};



function ERROR_NULL(obj) {
	if (obj === null || obj === undefined || obj === INT_NULL) {
		// console.error('Null ERROR. object:', obj, msg)
		return true;
	}
}

function ERROR_TYPE(obj, type, msg) {
	if ((obj.type & type) === 0) {
		console.error(`Type ERROR. type: ${GetMeshNameFromType(type)}, objectType: ${GetMeshNameFromType(obj.type)}`, msg)
		return true;
	}
}


/***********************************************************************************************************************************************/
// TEMPORARY
const TEMP_TEST_PERFORMANE_COUNTERS = {

	MESH_INFO_UI:{
		 COUNT: 0,
		 MOVE: 0,
		 BATCH_MOVE: 0,
	},
};