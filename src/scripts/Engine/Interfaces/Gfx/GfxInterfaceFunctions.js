"use strict";

import * as Glop from "../../../Graphics/Buffers/GlBufferOps";
import { Gl_add_geom_mat_to_vb } from "../../../Graphics/Buffers/GlBuffers";
import { Gl_get_progams_count, Gl_progs_get_prog_byidx, Gl_progs_get_vb_byidx, Gl_progs_set_vb_texidx, Gl_set_vb_show } from "../../../Graphics/GlProgram";

export function GfxSetTex(gfx, uvs){ Glop.GlSetTex(gfx, uvs); }
export function GfxUpdatePosXY(gfx, pos){ Glop.GlSetWposXY(gfx, pos); }
export function Gfx_remove_geometry_with_alpha(gfx, num_faces){ Glop.Gl_remove_geometry_with_alpha(gfx, num_faces); }

export function Gfx_remove_geometry_from_buffers(gfx, num_faces){ return Glop.Gl_remove_geometry(gfx, num_faces); }
export function Gfx_set_vb_show(progIdx, vbIdx, progs_groupidx, flag){ Gl_set_vb_show(progIdx, vbIdx, progs_groupidx, flag); }

export function Gfx_add_geom_mat_to_vb(sid, gfx, geom, mat, vb_type_flag=null, mesh_name, meshidx){ return Gl_add_geom_mat_to_vb(sid, gfx, geom, mat, vb_type_flag, mesh_name, meshidx); }
export function Gfx_progs_set_vb_texidx(progs_groupidx, progidx, vbidx, tbidx){ Gl_progs_set_vb_texidx(progs_groupidx, progidx, vbidx, tbidx); }

export function Gfx_get_progams_count(progs_groupidx){ return Gl_get_progams_count(progs_groupidx); }
export function Gfx_progs_get_vb_byidx(progs_groupidx, progidx, vbidx){ return Gl_progs_get_vb_byidx(progs_groupidx, progidx, vbidx); }
export function Gfx_progs_get_prog_byidx(progs_groupidx, progidx){ return Gl_progs_get_prog_byidx(progs_groupidx, progidx); }


