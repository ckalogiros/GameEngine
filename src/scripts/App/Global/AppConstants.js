"use strict";

const MAX_BALLS_COUNT = 10;


// Counter to increment some member variables(instaed of harcoding incrimental values)
let _cnt2 = 0;

/* * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * *
 * Application's Constants */
const g_state = {
    game: {
        paused: false,
        stageCompleted: false,
    },
    hovered: null,
    mode:{
        powUp:{
            gun: false,
        },
    },
};

const ALIGN = {

    NONE:0x0,
    LEFT: 0x1,
    RIGHT: 0x2,
    TOP: 0x4,
    BOTTOM: 0x8,
    CENTER_HOR: 0x10,
    CENTER_VERT: 0x20,
};

const MENU_BAR_HEIGHT = 0;
const GAME_AREA_TOP = MENU_BAR_HEIGHT * 2;

const Device = {
    MAX_WIDTH: 500,
    MAX_HEIGHT: 800,
    width:  0,
    height: 0,
    ratio: 1, // Create same proportions throughout any device. It measures the ratio of the game's build device width and the current device width
}
const Viewport = {
    width: 0,
    height: 0,
    left: 0,
    right: 0,
    top: 0,
    bottom: 0,
    ratio: 0,
    leftMargin:0,
    topMargin:0,
};

const GAME_STATE = {

};

/** All scenes Names. Must be 1-1 with 'SCENE' object below */
const SCENE_NAME = [
    'Start Menu Scene',
    'Start Stage Scene',
    'Finish Scene',
    'Play Stage Scene',
    'All Scenes',
];

/**
 * This is to create structured indexes for all scenes in the application,
 * and also store the global state of the current active scene() 
 */

_cnt2 = 0;
const SCENE = {
    // none: 0,
    startMenu: _cnt2++,
    startStage: _cnt2++,
    finishStage: _cnt2++,
    stage: _cnt2++,
    
    all: _cnt2++,

    active: { idx: INT_NULL },
};

const STAGE = {
    MENU:{
        WIDTH: INT_NULL,
        HEIGHT: INT_NULL,
        PAD: INT_NULL,
    },
    TOP: 10,

    PADD:{
        LEFT: INT_NULL,
        RIGHT: INT_NULL,
        TOP: INT_NULL,
        BOTTOM: INT_NULL,
    },
};

const FONT = {
    SIZE_RATIO: 1,
};

/**
 * This is used to create structured indexes for all meshes of the application,
 * so that we do not waste calculations on searching for a mesh by name (or any other id) 
 */
_cnt2 = 0;
const APP_MESHES_IDX = {
    background: {
        startMenu: _cnt2++,
        startStage: _cnt2++,
        stage: _cnt2++,
        finishStage: _cnt2++,
        stageMenu: _cnt2++,
        Menu: _cnt2++,
        test: _cnt2++,
    },
    buttons: {
        play: _cnt2++,
        options: _cnt2++,
        start: _cnt2++,
        continue: _cnt2++,
        menuStage: _cnt2++,
        backStage: _cnt2++,
    },
    text: {
        totalScore: _cnt2++, // This is the total score at the stage comleted scene
    },
    
    player: _cnt2++,
    balls: _cnt2++,
    bricks: _cnt2++,
    powUps: _cnt2++,
    gun: _cnt2++,
    bullet: _cnt2++,
    coins: _cnt2++,
    ballProj: _cnt2++,

    ui:{
        score:_cnt2++,
        totalScore:_cnt2++,
        mod:_cnt2++,
        lives:_cnt2++,
        combo:_cnt2++,
        animText:_cnt2++,
        fps:{
            avg:_cnt2++,
            avg1s:_cnt2++,

        }
    }, 
    
    fx: {
        ballProjLine: _cnt2++,
        ballTail: _cnt2++,
        explosions: {
            circle:_cnt2++,
            simple:_cnt2++,
            volumetric: _cnt2++,
        },
        glow:_cnt2++,
        vortex:_cnt2++,
        twist:_cnt2++,
        shadow:_cnt2++,
        particleSystem: {
            ballTail:_cnt2++,
            brickDestruction:_cnt2++,

        },
    },
    StageCompleted:{
        all:   _cnt2++,
        text:   _cnt2++,
        outer:  _cnt2++,
        middle: _cnt2++,
        inner:  _cnt2++,
    },
    framebuffer: _cnt2++,
     
    count: _cnt2
};

/** Ball */
const BALL = {
    Z_INDEX: 18,
    RADIUS: 12,
    MAX_COUNT: 10,
    POWERBALL_RADIUS: 16,
    MAX_AMT: 7.2,
    MIN_AMT: -7.2,
    HIT:{
        XDIR:0, // Ball's on brick hit direction
        YDIR:0,
        LEFT_DIR: 0,
        TOP_DIR: 0,
        HIT_ACCEL: 1.05, //1.15,
        CORNER_HIT_ACCEL: 1.15, //1.4,
    },
    YX_SPEED_RATIO: 1.3,
    RADIUS_TWO_THIRDS: 0,
    MODE: {
        powerBall: false,
    },
    DIR:{X:1, Y:1}, // Ball's current direction
    SIGN: 0,

};

/** Player */
const PLAYER = {
    Z_INDEX:6,
    XPOS: 0,
    YPOS: 0,
    PREV_XPOS:0,
    WIDTH: 80,
    HEIGHT: 10,
    STYLE: {
        ROUNDNESS:8,
        BORDER:5,
        FEATHER:2,
    }
};
/** Brick */
const BRICK = {
    Z_INDEX:3,
    MAX_COUNT: 1500,
    
    // WIDTH: 32,
    // HEIGHT: 16,
    WIDTH: 10,
    HEIGHT: 5,
    // WIDTH: 46,
    // HEIGHT: 28,
    PAD: 0,

    ROUNDNESS:20,
    BORDER:0,
    // FEATHER:1.6,
    FEATHER:2.,

};

const POW_UP = {
    Z_INDEX:10,
    WIDTH: 16,
    HEIGHT: 16,
    STYLE: {
        ROUNDNESS:8,
        BORDER:0,
        FEATHER:2.8,
    }
}
const GUN = {
    Z_INDEX:16,
    WIDTH: 10,
    HEIGHT: 10,
}
const BULLET = {
    Z_INDEX:17,
    SPEED: 15,
    // WIDTH: 4,
    // HEIGHT: 10,
    WIDTH: 6,
    HEIGHT: 17,
}

const COIN = {
    Z_INDEX:11,
    WIDTH: 16,
    HEIGHT: 16,
    STYLE: {
        ROUNDNESS:8,
        BORDER:0,
        FEATHER:2.8,
    }
}

_cnt2 = 0;
const UI_TEXT = {
    Z_INDEX:15,
    FONT_SIZE: 6,
    SCORE: _cnt2++,
    TOTAL_SCORE: _cnt2++,
    SCORE_MOD: _cnt2++,
    LIVES: _cnt2++,
    COMBO: _cnt2++,
    FPS: {
        AVG:_cnt2++,
        AVG_1S:_cnt2++,
        WORST_FPS:_cnt2++,
        WORST_AVG:_cnt2++,
    },

    LEN: _cnt2,
}

const EXPLOSIONS = {
    Z_INDEX:8,
}
const PARTICLES = {
    Z_INDEX:5,
}
const GLOW = {
    Z_INDEX:5,
}
const VORTEX = {
    Z_INDEX:2,
}
const TWIST = {
    Z_INDEX:16,
}
_cnt2 = 0;
const STAGE_COMPLETE = {
    TEXT:{
        idx: _cnt2++,
        Z_INDEX:20,
    },
    OUTER:{
        idx: _cnt2++,
        Z_INDEX:20,
    },
    MIDDLE:{
        idx: _cnt2++,
        Z_INDEX:20,
    },
    INNER:{
        idx: _cnt2++,
        Z_INDEX:20,
    },
};
_cnt2 = 0;
// const PARTICLE_SYSTEM = {
//     // Z_INDEX:20,
//     recomendedVbCount: BALL.MAX_COUNT,
// };

_cnt2 = 0;
const FRAMEBUFFERS_IDX = {
    buffer0: _cnt2++,
};

//** These are static indexes for all ui text */
// const UI_TEXT = {
//     SCORE: _cnt2++,
//     TOTAL_SCORE: _cnt2++,
//     SCORE_MOD: _cnt2++,
//     LIVES: _cnt2++,
// };


/* Application's Constants
 * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * **/



