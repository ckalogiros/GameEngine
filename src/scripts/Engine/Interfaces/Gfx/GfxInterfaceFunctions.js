"use strict";

import * as Glop from "../../../Graphics/Buffers/GlBufferOps";
import { Gl_set_vb_show } from "../../../Graphics/GlProgram";

export function GfxSetTex(gfx, uvs){ Glop.GlSetTex(gfx, uvs); }
export function GfxUpdatePosXY(gfx, pos){ Glop.GlSetWposXY(gfx, pos); }

export function Gfx_remove_geometry_from_buffers(gfx, num_faces){ return Glop.Gl_remove_geometry(gfx, num_faces); }
export function Gfx_set_vb_show(progIdx, vbIdx, flag){ Gl_set_vb_show(progIdx, vbIdx, flag); }