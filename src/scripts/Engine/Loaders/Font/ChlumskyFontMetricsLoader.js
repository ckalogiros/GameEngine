"use strict";

import { consola_msdf_test_1024_metrics } from "../../../../../resources/fonts/consolas_sdf/metrics/consola_msdf_test_1024_metrics";


const _font_metrics_buffer = [];
let _font_metrics_buffer_count = 0;

function Font_get_metrics_by_texid(texture_id){
   switch(texture_id){
      case TEXTURES.MSDF_CONSOLAS_1024: return consola_msdf_test_1024_metrics;
      default: alert('NO FONT METRICS FOUND. WRONG TEXID OR TEXTURE NOT ADDED TO THE SWITCH CASE. texture_id:', texture_id);
   }
}

export function Font_create_uvmap(texture_id){

   const json_metrics_object = Font_get_metrics_by_texid(texture_id); 
   _font_metrics_buffer[_font_metrics_buffer_count++] = Parse_json_metrics(json_metrics_object); 
}

export function Parse_json_metrics(json_metrics_object){

   const obj      = JSON.parse(json_metrics_object);
   const atlas    = obj.atlas;
   const glyphs   = obj.glyphs;

   // const size = atlas.size;
   const texture_width = atlas.width;
   const texture_height = atlas.height;

   const m = {
      advance  : 0,
      char     : 0,
      left     : 0,
      right    : 0,
      top      : 0,
      bottom   : 0,
      width    : 0,
      height   : 0,
   }

   const descender   = obj.metrics.descender;
   const ascender    = obj.metrics.ascender;

   const scale = 1.18; // A value that works at aligning the yoffset position for the mtsdf font texture(by Chlumsky) characters.(Probably I am missing something!!)

   const uvmap = [];
   uvmap[0] = [0.0, 0.0, 0.0, 0.0];          // Set for space character
   const plane_bounds = [];
   plane_bounds[0] = {left:0, right:0, top:0, bottom:0, width:0, height:0};   // Set for space character
   const atlas_bounds = [];
   atlas_bounds[0] = {left:0, right:0, top:0, bottom:0, width:0, height:0};   // Set for space character

   let advance = INT_NULL;
   for (let i = 1; i < glyphs.length; i++) {
      
      // m.advance  = glyphs[i].advance * size;
      m.char   = glyphs[i].unicode;
      m.left   = glyphs[i].atlasBounds.left;
      m.right  = glyphs[i].atlasBounds.right;
      m.top    = glyphs[i].atlasBounds.top;
      m.bottom = glyphs[i].atlasBounds.bottom;
      m.width  = m.right - m.left;
      m.height = m.bottom - m.top;
      
      
      // Calculate uvs
      let normalizedU = 1.0 / texture_width;	   // Normalize texture coords to 0-1 values.
      let normalizedV = 1.0 / texture_height;   // Normalize texture coords to 0-1 values.
      
      const U1 = 0, U2 = 1, V1 = 2, V2 = 3;

      uvmap[i] = [0.0, 0.0, 0.0, 0.0]; // Create new array for each character's uv coord.
      uvmap[i][U1] = normalizedU * m.left;
      uvmap[i][U2] = normalizedU * m.right;
      uvmap[i][V1] = normalizedV * m.top;
      uvmap[i][V2] = normalizedV * m.bottom;
      
      // Store
      plane_bounds[i] = {
         left:    glyphs[i].planeBounds.left,
         right:   glyphs[i].planeBounds.right,
         top:     glyphs[i].planeBounds.top,
         bottom:  glyphs[i].planeBounds.bottom,
         width:   glyphs[i].planeBounds.right-glyphs[i].planeBounds.left,
         height:  glyphs[i].planeBounds.bottom-glyphs[i].planeBounds.top,
         yoffset: -((ascender-glyphs[i].planeBounds.top)+(descender-glyphs[i].planeBounds.bottom)) * scale,
      };
      atlas_bounds[i] = {
         left:    m.left,
         right:   m.right,
         top:     m.top,
         bottom:  m.bottom,
         width:   m.width,
         height:  m.height,
      };

   }

   console.log('------------------- metrics:', _font_metrics_buffer)

   return {
      uvmap       : uvmap,
      plane_bounds: plane_bounds,
      atlas_bounds: atlas_bounds,
      texture:{
         type        : obj.atlas.type,
         width       : texture_width, 
         height      : texture_height, 
         line_height : obj.metrics.lineHeight,
         ascender    : obj.metrics.ascender,
         descender   : obj.metrics.descender,
         advance     : advance, // For monospace fonts

      },
   }
}

export function Font_get_char_uv_coords(fontIdx, ch) {
	return _font_metrics_buffer[fontIdx].uvmap[ch.charCodeAt(0) - CHAR_ARRAY_START_OFFSET];
}

export function Font_get_char_plane_bounds(fontIdx, ch) {
	return _font_metrics_buffer[fontIdx].plane_bounds[ch.charCodeAt(0) - CHAR_ARRAY_START_OFFSET];
}

export function Font_get_char_atlas_bounds(fontIdx, ch) {
	return _font_metrics_buffer[fontIdx].atlas_bounds[ch.charCodeAt(0) - CHAR_ARRAY_START_OFFSET];
}

export function Font_get_atlas_texture_metrics(fontIdx) {
	return _font_metrics_buffer[fontIdx].texture;
}

export function Font_get_font_ratio(fontIdx) {
	return _font_metrics_buffer[fontIdx].texture.line_height;
}