"use strict";

import * as Glop from "../../../Graphics/Buffers/GlBufferOps";

export function GfxSetTex(gfx, uvs){ Glop.GlSetTex(gfx, uvs); }
export function GfxUpdatePosXY(gfx, pos){ Glop.GlSetWposXY(gfx, pos); }