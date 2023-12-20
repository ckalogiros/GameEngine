"use strict";

import { Gl_progs_get_group, Gl_progs_get_vb_byidx } from "../../../Graphics/GlProgram";
import { Section } from "../Meshes/Section";
import { Drop_down_set_root, Widget_Dropdown } from "../Meshes/Widgets/Menu/Widget_Dropdown";
import { Widget_Switch } from "../Meshes/Widgets/WidgetButton";
import { Widget_Label } from "../Meshes/Widgets/WidgetLabel";
import { Widget_Dynamic_Text_Mesh } from "../Meshes/Widgets/WidgetText";
import { Scenes_get_root_meshes } from "../../Scenes.js";
import { PerformanceTimersGetCurTime, PerformanceTimersGetFps, PerformanceTimersGetMilisec, _pt2, _pt3, _pt4, _pt5, _pt6, _pt7, _pt8, _pt_fps } from "../../Timers/PerformanceTimers";
import { PerformanceTimerGetFps1sAvg, _fps_1s_avg, _fps_500ms_avg } from "../../Timers/Time";
import { Info_listener_create_event, Info_listener_destroy_event } from "./InfoListeners";
import { Widget_Scroller } from "../Meshes/Widgets/WidgetScroller";



const _font_size = 10;
export function Debug_info_ui_performance(scene) {

   const tr = .5; // Transparency
   const pad = [3, 3];
   const sectionpad = [6, 6];
   const fontsize = _font_size;

   const dp = new Widget_Dropdown('Generic Ui Debug Info', [220, 40, 0], [10, 10], GREY1, TRANSPARENCY(GREY1, tr), WHITE, [18, 3]);
   // const dp = new Widget_Dropdown('Generic +.{) [420, 80, 0]ui_label (!-=.} TEXTURE_PATHS| Widget_Switch(\'on\', \'off\', [0, 0, zindex+2]', [420, 80, 0], [10, 10], GREEN_140_240_10, TRANSPARENCY(BLUE_10_120_220, .6), WHITE, [8, 3]);
   // const dp = new Widget_Dropdown('A', [220, 40, 0], [10, 10], GREEN_140_240_10, TRANSPARENCY(BLUE_10_120_220, .6), WHITE, [8, 3]);
   dp.CreateClickEvent();
   dp.CreateMoveEvent();
   Drop_down_set_root(dp, dp);

   let zindex = dp.geom.pos[2];
   
   /************************************************************************************************************************************************/
   // Performance timers
   {
      const section = new Section(SECTION.HORIZONTAL, sectionpad, [0, 0, zindex+1], [0, 0], TRANSPARENCY(GREY6, tr), 'InfoUi-Timers section');
      
      const enable_ui_timers_label = new Widget_Label('Ui Performance Timers', (ALIGN.HOR_CENTER | ALIGN.VERT_CENTER), [0, 0, zindex+2], fontsize, TRANSPARENCY(BLUE_10_120_220, tr), WHITE, pad, .4, undefined, [2, 3, 2]);
      enable_ui_timers_label.SetName(`InfoUi-Timers label`);
      section.AddItem(enable_ui_timers_label);
      
      const enable_ui_timers_switch = new Widget_Switch('on', 'off', [0, 0, zindex+2], 8, BLUE_10_120_220, WHITE, [2, 3]);
      enable_ui_timers_switch.Bind(Debug_info_create_ui_performance_timers, null, scene);
      enable_ui_timers_switch.SetName(`InfoUi-Timers switch`);
      section.AddItem(enable_ui_timers_switch);

      dp.AddToMenu(section);
   }

   /************************************************************************************************************************************************/
   // Mouse Info
   {
      const section = new Section(SECTION.HORIZONTAL, sectionpad, [0, 0, zindex+1], [0, 0], TRANSPARENCY(GREY6, tr), 'InfoUi-Mouse section');
      section.SetName('InfoUi-Mouse section');

      const label = new Widget_Label('Mouse Info', (ALIGN.HOR_CENTER | ALIGN.VERT_CENTER), [0, 0, zindex+2], fontsize, TRANSPARENCY(BLUE_10_120_220, tr), WHITE, pad, .4, undefined, [2, 3, 2]);
      label.SetName(`InfoUi-Mouse label`);
      section.AddItem(label);

      const ui_switch = new Widget_Switch('on', 'off', [0, 0, zindex+2], 8, BLUE_10_120_220, WHITE, [2, 3]);
      ui_switch.Bind(Debug_info_create_ui_mouse_coords, null, scene);
      ui_switch.SetName(`InfoUi-Mouse switch`);
      section.AddItem(ui_switch);

      dp.AddToMenu(section);
   }

   /************************************************************************************************************************************************/
   // Gfx Info
   {
      const section = new Section(SECTION.HORIZONTAL, sectionpad, [0, 0, zindex+1], [0, 0], TRANSPARENCY(GREY6, tr), 'InfoUi-Gfx section');
      section.SetName('InfoUi-Gfx section');

      const label = new Widget_Label('Gfx Info', (ALIGN.BOTTOM | ALIGN.VERT_CENTER), [0, 0, zindex+2], fontsize, TRANSPARENCY(GREEN_140_240_10, tr), WHITE, pad, .4, undefined, [2, 3, 2]);
      label.SetName(`InfoUi-Gfx label`);
      section.AddItem(label);

      const ui_switch = new Widget_Switch('on', 'off', [0, 0, zindex+2], 8, BLUE_10_120_220, WHITE, [2, 3]);
      ui_switch.Bind(Debug_info_create_gfx_info, null, scene);
      ui_switch.SetName(`InfoUi-Gfx switch`);
      section.AddItem(ui_switch);

      dp.AddToMenu(section);
   }

   /************************************************************************************************************************************************/
   // Mesh Info
   {
      const section = new Section(SECTION.HORIZONTAL, sectionpad, [0, 0, zindex+1], [0, 0], TRANSPARENCY(GREY6, tr), 'InfoUi-Mesh section');
      section.SetName('InfoUi-Mesh section');

      const label = new Widget_Label('Mesh Info', (ALIGN.BOTTOM | ALIGN.VERT_CENTER), [0, 0, zindex+2], fontsize, TRANSPARENCY(GREEN_140_240_10, tr), WHITE, pad, .4, undefined, [2, 3, 2]);
      label.SetName(`InfoUi-Mesh label`);
      section.AddItem(label);

      const ui_switch = new Widget_Switch('on', 'off', [0, 0, zindex+2], 8, BLUE_10_120_220, WHITE, [2, 3]);
      ui_switch.Bind(Debug_info_create_mesh_info, null, scene);
      ui_switch.SetName(`InfoUi-Mesh switch`);
      section.AddItem(ui_switch);

      dp.AddToMenu(section);
   }

   scene.AddWidget(dp, GFX_CTX_FLAGS.PRIVATE);
   dp.Calc(SECTION.EXPAND | SECTION.INHERIT);
   dp.ConstructListeners();

}

/************************************************************************************************************************************************/
// Performance timers
export function Debug_info_create_ui_performance_timers(params) {

   const scene = params.params;

   if (DEBUG_INFO.UI_TIMERS.IS_ON) {

      const meshes = Scenes_get_root_meshes(scene.sceneidx);
      const section = meshes.buffer[DEBUG_INFO.UI_TIMERS.IDX];

      DEBUG_INFO.UI_TIMERS.POS = section.geom.pos; // Remember the info's position.
      section.Destroy();

      DEBUG_INFO.UI_TIMERS.IDX = INT_NULL;
      DEBUG_INFO.UI_TIMERS.IS_ON = false;
      return;
   }

   const section = new Section(SECTION.HORIZONTAL, [10, 10], DEBUG_INFO.UI_TIMERS.POS, [0, 0], TRANSPARENCY(GREY1, .4), 'ui performance timers panel');
   section.CreateListenEvent(LISTEN_EVENT_TYPES.MOVE);
   section.SetName('InfoUi-PerformanceTimers section');

   const fontsize = 8;
   let pad = 0;
   let ms = 200;

   { // FPS average
      const timer = new Widget_Dynamic_Text_Mesh('Fps: | Avg:', '0.000', ALIGN.HORIZONTAL, [0, 0, 0], fontsize, BLUE_10_160_220, ORANGE_240_160_10, .5);
      timer.SetDynamicText(`DynamicText ${ms} Timer TimeGetFps`, ms, PerformanceTimersGetFps, _pt_fps); // idx is for use in creating separate time intervals for each dynamic text.
      timer.CreateNewText('| deltaAvg ms:', fontsize, BLUE_10_160_220, [pad * 3, 0], .9);
      timer.CreateNewText('0.000', fontsize, ORANGE_240_160_10, [0, 0], .9);
      timer.SetDynamicText(`DynamicText ${ms} Timer TimeGetDeltaAvg`, ms, PerformanceTimersGetMilisec, _pt_fps)
      
      timer.CreateNewText('| curTime ms:', fontsize, BLUE_10_160_220, [pad * 3, 0], .9);
      timer.CreateNewText('0.000', fontsize, ORANGE_240_160_10, [0, 0], .5);
      timer.SetDynamicText(`DynamicText ${ms} Timer TimeGetTimer`, ms, PerformanceTimersGetCurTime, _pt_fps);
      
      // timer.RenderToDebugGfx();
      section.AddItem(timer);
   }
   { // FPS average 1 second
      ms = 1000;
      const fps1sAvg = new Widget_Dynamic_Text_Mesh('Fps 1sec: | avg:', '0.000', ALIGN.HORIZONTAL, [0, 0, 0], fontsize, BLUE_10_160_220, ORANGE_240_160_10, .5);
      fps1sAvg.SetDynamicText(`DynamicText ${ms} Timer TimeGetFps`, ms, PerformanceTimerGetFps1sAvg, _fps_1s_avg); // idx is for use in creating separate time intervals for each dynamic text.
      fps1sAvg.CreateNewText('| ms:', fontsize, BLUE_10_160_220, [fontsize * 3, 0], .9);
   
      fps1sAvg.CreateNewText('0.000', fontsize, ORANGE_240_160_10, [0, 0], .5);
      fps1sAvg.SetDynamicText(`DynamicText ${ms} Timer TimeGetTimer`, ms, null, _fps_1s_avg); // no need for callback, the '_fps_1s_avg' is already in milisec. 
   
      section.AddItem(fps1sAvg);
   }
   { // FPS average 500 miliseconds
      ms = 500;
      const fps500msAvg = new Widget_Dynamic_Text_Mesh('Fps 500ms: | avg:', '0.000', ALIGN.HORIZONTAL, [0, 0, 0], fontsize, BLUE_10_160_220, ORANGE_240_160_10, .5);
      fps500msAvg.SetDynamicText(`DynamicText ${ms} Timer TimeGetFps`, ms, PerformanceTimerGetFps1sAvg, _fps_500ms_avg); // idx is for use in creating separate time intervals for each dynamic text.
      fps500msAvg.CreateNewText('| ms:', fontsize, BLUE_10_160_220, [fontsize * 3, 0], .9);
   
      fps500msAvg.CreateNewText('0.000', fontsize, ORANGE_240_160_10, [0, 0], .5);
      fps500msAvg.SetDynamicText(`DynamicText ${ms} Timer TimeGetTimer`, ms, null, _fps_500ms_avg);
      section.AddItem(fps500msAvg);
   }
   { // All Timers Update timer
      ms = 500;
      const t = new Widget_Dynamic_Text_Mesh(`All timers(${ms}ms):`, '0.00000', ALIGN.HORIZONTAL, [0, 0, 0], fontsize, BLUE_10_160_220, ORANGE_240_160_10, .5);
      t.SetDynamicText(`DynamicText ${ms} AllTimersUpdate PerformanceTimersGetFps`, ms, PerformanceTimersGetFps, _pt2); // idx is for use in creating separate time intervals for each dynamic text.

      t.CreateNewText('| ms:', fontsize, BLUE_10_160_220, [fontsize * 3, 0], .9);
      t.CreateNewText('0.000', fontsize, ORANGE_240_160_10, [0, 0], .5);
      t.SetDynamicText(`DynamicText ${ms} AllTimersUpdate PerformanceTimersGetMilisec`, ms, PerformanceTimersGetMilisec, _pt2); // idx is for use in creating separate time intervals for each dynamic text.

      section.AddItem(t);
   }
   { // Scene Update timer
      ms = 500;
      const t = new Widget_Dynamic_Text_Mesh(`Scene Update(${ms}ms):`, '0.0000', ALIGN.HORIZONTAL, [0, 0, 0], fontsize, BLUE_10_160_220, ORANGE_240_160_10, .5);
      t.SetDynamicText(`DynamicText ${ms} SceneUpdate PerformanceTimersGetFps`, ms, PerformanceTimersGetFps, _pt3); // idx is for use in creating separate time intervals for each dynamic text.

      t.CreateNewText('| ms:', fontsize, BLUE_10_160_220, [fontsize * 3, 0], .9);
      t.CreateNewText('0.000', fontsize, ORANGE_240_160_10, [0, 0], .5);
      t.SetDynamicText(`DynamicText ${ms} SceneUpdate PerformanceTimersGetMilisec`, ms, PerformanceTimersGetMilisec, _pt3); // idx is for use in creating separate time intervals for each dynamic text.

      section.AddItem(t);
   }
   { // Gl_draw timer
      ms = 500;
      const t = new Widget_Dynamic_Text_Mesh(`Gl_draw Update(${ms}ms):`, '0.0000', ALIGN.HORIZONTAL, [0, 0, 0], fontsize, BLUE_10_160_220, ORANGE_240_160_10, .5);
      t.SetDynamicText(`DynamicText ${ms} GlDrawUpdate PerformanceTimersGetFps`, ms, PerformanceTimersGetFps, _pt4); // idx is for use in creating separate time intervals for each dynamic text.

      t.CreateNewText('| ms:', fontsize, BLUE_10_160_220, [fontsize * 3, 0], .9);
      t.CreateNewText('0.000', fontsize, ORANGE_240_160_10, [0, 0], .5);
      t.SetDynamicText(`DynamicText ${ms} Gl_draw PerformanceTimersGetMilisec`, ms, PerformanceTimersGetMilisec, _pt4); // idx is for use in creating separate time intervals for each dynamic text.

      section.AddItem(t);
   }
   { // Event Listener timer
      ms = 500;
      const t = new Widget_Dynamic_Text_Mesh(`HoverListener Update(${ms}ms):`, '0.0000', ALIGN.HORIZONTAL, [0, 0, 0], fontsize, BLUE_10_160_220, ORANGE_240_160_10, .5);
      t.SetDynamicText(`DynamicText ${ms} HoverListenerUpdate PerformanceTimersGetFps`, ms, PerformanceTimersGetFps, _pt6); // idx is for use in creating separate time intervals for each dynamic text.

      t.CreateNewText('| ms:', fontsize, BLUE_10_160_220, [fontsize * 3, 0], .9);
      t.CreateNewText('0.000', fontsize, ORANGE_240_160_10, [0, 0], .5);
      t.SetDynamicText(`DynamicText ${ms} HoverListener PerformanceTimersGetMilisec`, ms, PerformanceTimersGetMilisec, _pt6); // idx is for use in creating separate time intervals for each dynamic text.

      section.AddItem(t);
   }
   { // Event Listener timer
      ms = 500;
      const t = new Widget_Dynamic_Text_Mesh(`EventListener Update(${ms}ms):`, '0.0000', ALIGN.HORIZONTAL, [0, 0, 0], fontsize, BLUE_10_160_220, ORANGE_240_160_10, .5);
      t.SetDynamicText(`DynamicText ${ms} EventListenerUpdate PerformanceTimersGetFps`, ms, PerformanceTimersGetFps, _pt5); // idx is for use in creating separate time intervals for each dynamic text.

      t.CreateNewText('| ms:', fontsize, BLUE_10_160_220, [fontsize * 3, 0], .9);
      t.CreateNewText('0.000', fontsize, ORANGE_240_160_10, [0, 0], .5);
      t.SetDynamicText(`DynamicText ${ms} EventListener PerformanceTimersGetMilisec`, ms, PerformanceTimersGetMilisec, _pt5); // idx is for use in creating separate time intervals for each dynamic text.

      section.AddItem(t);
   }
   { // MOVE_OLD
      ms = 500;
      const t = new Widget_Dynamic_Text_Mesh(`Move(${ms}ms): `, '00000000', ALIGN.HORIZONTAL, [0, 0, 0], fontsize, BLUE_10_160_220, ORANGE_240_160_10, .5);
      t.SetDynamicText(`DynamicText ${ms} EventListenerUpdate PerformanceTimersGetFps`, ms, PerformanceTimersGetFps, _pt7); // idx is for use in creating separate time intervals for each dynamic text.
      section.AddItem(t);
   }
   { // MOVE_NEW
      ms = 500;
      const t = new Widget_Dynamic_Text_Mesh(`Batch(${ms}ms):`, '00000000', ALIGN.HORIZONTAL, [0, 0, 0], fontsize, BLUE_10_160_220, ORANGE_240_160_10, .5);
      t.SetDynamicText(`DynamicText ${ms} EventListenerUpdate PerformanceTimersGetFps`, ms, PerformanceTimersGetFps, _pt8); // idx is for use in creating separate time intervals for each dynamic text.
      section.AddItem(t);
   }

   // section.RenderToDebugGfx();
   scene.AddWidget(section, GFX_CTX_FLAGS.PRIVATE);
   section.Calc(SECTION.VERTICAL);
   // section.Recalc(SECTION.HORIZONTAL);
   section.Render()
   DEBUG_INFO.UI_TIMERS.IDX = section.idx;
   section.ConstructListeners();


   DEBUG_INFO.UI_TIMERS.IS_ON = true;

}


/************************************************************************************************************************************************/
// Mouse Info

export function Debug_info_create_ui_mouse_coords(params) {

   const scene = params.params;

   if (DEBUG_INFO.UI_MOUSE.IS_ON) {

      const meshes = Scenes_get_root_meshes(scene.sceneidx);
      const section = meshes.buffer[DEBUG_INFO.UI_MOUSE.IDX];

      Info_listener_destroy_event(section.debug_info.evtidx);
      DEBUG_INFO.UI_MOUSE.POS = section.geom.pos; // Remember the info's position.
      section.Destroy();

      DEBUG_INFO.UI_MOUSE.IDX = INT_NULL;
      DEBUG_INFO.UI_MOUSE.IS_ON = false;
      return;
   }

   const section = new Section(SECTION.HORIZONTAL, [3, 3], DEBUG_INFO.UI_MOUSE.POS, [0, 0], TRANSPARENCY(GREY1, .4), 'ui mouse info panel');
   section.CreateListenEvent(LISTEN_EVENT_TYPES.MOVE);
   section.SetName('InfoUi-Mouse section');


   const fontsize = _font_size;

   const infomesh = new Widget_Dynamic_Text_Mesh('Mouse |', 'pos: x:0000, y:0000', ALIGN.HORIZONTAL, [0, 0, 0], fontsize, YELLOW_240_220_10, GREEN_140_240_10, .4);
   infomesh.CreateNewText('| area: x:0000, y:0000', fontsize, GREEN_140_240_10, [10, 10], .9);


   section.AddItem(infomesh);
   
   
   // section.RenderToDebugGfx();
   scene.AddWidget(section, GFX_CTX_FLAGS.PRIVATE);
   // section.Recalc(SECTION.VERTICAL | SECTION.HORIZONTAL);
   section.Recalc(SECTION.VERTICAL);
   section.Render()
   DEBUG_INFO.UI_MOUSE.IDX = section.idx;
   section.ConstructListeners();

   DEBUG_INFO.UI_MOUSE.IS_ON = true;

   // Create an Info listener to update the mouse position ui text
   section.debug_info.evtidx = Info_listener_create_event(INFO_LISTEN_EVENT_TYPE.MOUSE, Debug_info_update_ui_mouse_pos, params, infomesh);

}

export function Debug_info_update_ui_mouse_pos(params) {

   const target_mesh = params.target_params;
   const m = params.trigger_params.mouse;

   const mp = `pos: x:${m.pos.x}, y:${m.pos.y}`;
   const mpr = `area: x:${m.pos.x - m.click.up.x}, y:${m.pos.y - m.click.up.y}`;

   const mouse_pos_text = target_mesh.children.buffer[0];
   mouse_pos_text.UpdateText(mp)
   const mouse_prev_text = target_mesh.children.buffer[1];
   mouse_prev_text.UpdateText(mpr)

}

 
/************************************************************************************************************************************************/
// Gfx Info

/** DELETE THIS COMMENT
 * Initialize the state with 2 progs and 2 vbs.
 * (should take place after the Gfx Info switch button is pressed).
 * 
 * These dropdown buttons should be update their text,
 * when the info gfx ui structure adds a new dropdown (for any new prog-vb) .
 * Their text just counts the number of attributes added only from the new dps added to self.
 * 
 * 1. New mesh is Rendered.
 * 2. Run an event dispatch.
 * 3. if new vb is created, add the dp.
 * 3.1. if new vb added, update the vb count of self apropriate prog-vb and the dp's text for the prog-vb of the added mesh.
 * 4. else update the meshes dp prog-vb text.
 * 4.1 Update the self dps to account for the extra-less text characters changed in any dp-text.
 */
const ui_gfx_self_state = {

   dp: null, // the dropdown mesh for displaying the self gfx buffers
   progs:[], // A prog-vb indexes of the real gfx buffers
}

export function Debug_info_create_gfx_info(params) {

   const scene = params.params;

   if (DEBUG_INFO.UI_GFX.IS_ON) {

      const meshes = Scenes_get_root_meshes(scene.sceneidx);
      const dropdown = meshes.buffer[DEBUG_INFO.UI_GFX.IDX];

      Info_listener_destroy_event(dropdown.debug_info.evtidx);
      DEBUG_INFO.UI_GFX.POS = dropdown.geom.pos; // Remember the ui's position.

      dropdown.Destroy();

      DEBUG_INFO.UI_GFX.IDX = INT_NULL; // reference to the scene's mesh buffer
      DEBUG_INFO.UI_GFX.IS_ON = false;

      ui_gfx_self_state.progs = [];

      return;
   }

   const tr = .85;
   const btnpad = [8, 3];
   const dppad = [10, 10];

   const dp = new Widget_Dropdown(`InfoUi Gfx DP`, [350, 20, 0], dppad, GREY1, TRANSPARENCY(GREEN_60_240_100, tr), WHITE, btnpad);
   dp.SetType(MESH_TYPES_DBG.UI_INFO_GFX); // Special recognition of this type, so we skip any infinite loops
   dp.CreateClickEvent();
   dp.CreateMoveEvent();
   Drop_down_set_root(dp, dp);

   ui_gfx_self_state.dp = new Widget_Dropdown(`self-gfx`, [0, 0, 0], dppad, TRANSPARENCY(RED_200_10_10, tr), TRANSPARENCY(GREEN_140_240_10, tr), WHITE, btnpad);
   ui_gfx_self_state.dp.SetType(MESH_TYPES_DBG.UI_INFO_GFX); // Special recognition of this type, so we skip any infinite loops

   const progs = Gl_progs_get_group(PROGRAMS_GROUPS.GetIdxByMask(dp.sid.progs_group));
   const count = progs.count;
   let j = 0;
   for (let i = 0; i < count; i++) {
      
      const dp_pr = new Widget_Dropdown(`prog:${i} | Vb count:${progs.buffer[i].vertexBufferCount}`, [0, 0, 0], dppad, TRANSPARENCY(BLUE_10_120_220, tr), TRANSPARENCY(PURPLE, tr), WHITE, btnpad);
      // dp_pr.SetName(`Program DP:${i}`);
      dp_pr._gfxidx = i;
      dp_pr.SetType(MESH_TYPES_DBG.UI_INFO_GFX); // Special recognition of this type, so we skip any infinite loops
      dp.AddToMenu(dp_pr);

      // Store all self prog-vb indexes for updating its text info on every gfx buffer changes
      ui_gfx_self_state.progs.push({  idx:i, vb:[], });
      
      for (j = 0; j < progs.buffer[i].vertexBufferCount; j++) {
         
         const vb = progs.buffer[i].vb[j];
         if((vb.type & MESH_TYPES_DBG.UI_INFO_GFX) === 0){ // Add as regular vertex buffers all exept the buffers storing the ui_gfx_ dropdowns.
            
            const dp_vb = new Widget_Dropdown(`vb:${j} | count:${vb.count}`, [0, 0, 0], dppad, TRANSPARENCY(ORANGE_240_130_10, tr), TRANSPARENCY(GREY3, tr), WHITE, btnpad);
            dp_vb._gfxidx = j;
            dp_vb.SetType(MESH_TYPES_DBG.UI_INFO_GFX); // Special recognition of this type, so we skip any infinite loops
            dp_vb.debug_info.data = { progidx: i, vbidx: j, };
            
            // Create more info to display
            dp_pr.AddToMenu(dp_vb);
            const infomesh = new Widget_Dynamic_Text_Mesh('isPrivate:', `${vb.isPrivate}`, ALIGN.HORIZONTAL, [0, 0, 0], _font_size, YELLOW_240_220_10, GREEN_140_240_10, .4);
            dp_vb.AddToMenu(infomesh);
            
         }
         else {
            
            const dp_vb = new Widget_Dropdown(`Self prog:${i} vb:${j} | count:${vb.count}`, [0, 0, 0], dppad, TRANSPARENCY(PINK_240_60_160, tr), TRANSPARENCY(GREY3, tr), WHITE, btnpad);
            dp_vb._gfxidx = j;
            dp_vb.SetType(MESH_TYPES_DBG.UI_INFO_GFX); // Special recognition of this type, so we skip any infinite loops
            dp_vb.debug_info.data = { progidx: i, vbidx: j, };
            ui_gfx_self_state.dp.AddToMenu(dp_vb);
            
            ui_gfx_self_state.progs[i].vb.push(j); // We've just created the object for this program index and pushing the vertex buffer index.
            
         }

      }
      
   }
   ui_gfx_self_state.dp._gfxidx = j;
   dp.AddToMenu(ui_gfx_self_state.dp);

   scene.AddWidget(dp, GFX_CTX_FLAGS.PRIVATE);
   dp.Calc();
   dp.Render();
   dp.ConstructListeners();
   
   DEBUG_INFO.UI_GFX.IDX = dp.idx;
   DEBUG_INFO.UI_GFX.IS_ON = true;

}

function Debug_info_gfx_update(params) {

   const tr = .6;
   const progidx = params.trigger_params.progidx;
   const vbidx = params.trigger_params.vbidx;
   // const progs_group = params.trigger_params.vbidx;
   const section = params.target_params;
   const dp_ui_gfx = section.children.buffer[0]; 
   // const dp_self = dp_ui_gfx.menu.children.buffer[dp_ui_gfx.menu.children.boundary-1]; 
   // const dp_self = ui_gfx_self_state.dp; 
   let dp_prog = null; 
   let dp_vb = null; 
   
   
   let foundprogidx = INT_NULL;
   // Find if program's dropdown exist
   for(let i=0; i<dp_ui_gfx.menu.children.boundary; i++){
      const pr = dp_ui_gfx.menu.children.buffer[i];
      if(pr._gfxidx === undefined) console.error('Missing prog-gfxidx property for dropdown')
      if(pr._gfxidx === progidx) {
         foundprogidx = i;
         // console.log(`PROGRAM ${progidx} found at ${dp_ui_gfx.name} children:`,  dp_ui_gfx.menu.children.buffer)
         break;
      }
   }
   // Find if vb's dropdown exist
   let foundvbidx = INT_NULL;
   if(foundprogidx !== INT_NULL){
      dp_prog = dp_ui_gfx.menu.children.buffer[foundprogidx]; 
      for(let i=0; i<dp_prog.menu.children.boundary; i++){
         const vb = dp_prog.menu.children.buffer[i];
         if(!vb._gfxidx === undefined) console.error('Missing vb-gfxidx  property for dropdown')
         if(vb._gfxidx === vbidx) {
            foundvbidx = i;
            // console.log(`VERTEX BUFFER ${vbidx} found at ${dp_prog.name} children:`,  dp_prog.menu.children.buffer)
            break;
         }
      }
   }

   if(!dp_prog) console.error('dropdown program not found')
   
   const vb = Gl_progs_get_vb_byidx(progidx, vbidx);
   // /*DEBUG*/const progs = Gl_progs_get_group();
   // console.log(`Debug_info_gfx_update prog:${progidx} vb:${vbidx} vb.count:${vb.count}`);
   if(foundvbidx !== INT_NULL) {

      dp_vb = dp_prog.menu.children.buffer[foundvbidx];
      // console.log(`UPDATE prog:${progidx} vb:${vbidx} mesh:${dp_vb.name} vb.count:${vb.count}`);

      const text = `vb:${vbidx} | ${vb.count}`;
      dp_vb.SetText(text);

      
   } 
   else { // Else no vertex buffer was found, so we create a new ui info dp for the new vertex buffer
      
      // // console.log(`================== Create vb dropdown. prog:${progidx} vb:${vbidx}`);
      // // const parent = (vb.type & MESH_TYPES_DBG.UI_INFO_GFX) ? dp_self : dp_prog;
      // // const parent = (vb.type & MESH_TYPES_DBG.UI_INFO_GFX) ? dp_self : dp_prog;
      // const parent = dp_prog;
      
      // // Create vb dropdown
      // const new_dp_vb = new Widget_Dropdown(`UIDP-vb:${vbidx} | count:${vb.count}`, [0, 0, 0], [10, 10], TRANSPARENCY(YELLOW, tr), TRANSPARENCY(YELLOW, tr), WHITE, [8, 3]);
      // new_dp_vb.SetName(`VB DP:${vbidx}`)
      // new_dp_vb._gfxidx = vbidx;
      // new_dp_vb.SetType(MESH_TYPES_DBG.UI_INFO_GFX); // Special recognition of this type, so we skip any infinite loops
      // new_dp_vb.debug_info.data = { progidx: progidx, vbidx: vbidx, };
      // new_dp_vb.gfx = Gfx_generate_context(new_dp_vb.sid, new_dp_vb.sceneidx, new_dp_vb.geom.num_faces, GFX_CTX_FLAGS.PRIVATE);
      // Scenes_bind_camera_uniforms(new_dp_vb.sceneidx, new_dp_vb);
      // {
      //    // new_dp_vb.SetName(`UIDP-vb:${vbidx}`);
      //    // // Object.defineProperty(new_dp_vb, 'gfxidx', { value: vbidx });
      //    // new_dp_vb._gfxidx = vbidx
      //    // new_dp_vb.type |= MESH_TYPES_DBG.UI_INFO_GFX; // Special recognition of this type, so we skip any infinite loops
      //    // new_dp_vb.gfx = Gfx_generate_context(new_dp_vb.sid, new_dp_vb.sceneidx, new_dp_vb.geom.num_faces, GFX_CTX_FLAGS.PRIVATE);
      //    // Scenes_bind_camera_uniforms(new_dp_vb.sceneidx, new_dp_vb);
      //    // new_dp_vb.gfx.vb.start = Gfx_add_geom_mat_to_vb(new_dp_vb.sid, new_dp_vb.gfx, new_dp_vb.geom, new_dp_vb.mat, new_dp_vb.type & MESH_TYPES_DBG.UI_INFO_GFX, new_dp_vb.name)
      //    // // new_dp_vb.Render();
      // }
      
      // const btn = new_dp_vb.children.buffer[0];
      // btn.GenGfxCtx(GFX_CTX_FLAGS.PRIVATE)
      // Scenes_bind_camera_uniforms(btn.sceneidx, btn);
      // btn.gfx.vb.start = Gfx_add_geom_mat_to_vb(btn.sid, btn.gfx, btn.geom, btn.mat, btn.type & MESH_TYPES_DBG.UI_INFO_GFX, btn.name)
      // Scenes_bind_camera_uniforms(btn.text_mesh.sceneidx, btn.text_mesh);
      // btn.text_mesh.gfx.vb.strt = Gfx_add_geom_mat_to_vb(btn.text_mesh.sid, btn.text_mesh.gfx, btn.text_mesh.geom, btn.text_mesh.mat, btn.type & MESH_TYPES_DBG.UI_INFO_GFX,  btn.text_mesh.name)
      // // new_dp_vb.GenGfxCtx(GFX_CTX_FLAGS.PRIVATE);
      
      // parent.AddToMenu(new_dp_vb);

      // // /**DEBUG*/temp_added.push({
      // //    mesh_name:new_dp_vb.name,
      // //    parent_name:parent.name,
      // //    parent_menu:parent.menu,
      // //    from_gfx:{progidx:progidx, vbidx:vbidx},
      // // });
      // // console.log('---------------- added info:', temp_added);

   }

   UpdateUiGfxSelfText()
}

function UpdateUiGfxSelfText(){

   const dp_self = ui_gfx_self_state.dp; 
   const progs_group = ui_gfx_self_state.dp; 
   let stride = 0;
   for (let i=0; i<ui_gfx_self_state.progs.length; i++){
      
      const vbidxs = ui_gfx_self_state.progs.buffer[i].vb;
      for (let j=0; j<vbidxs.length; j++){
   
         const vb = Gl_progs_get_vb_byidx(ui_gfx_self_state.progs.buffer[i].idx, vbidxs[j]);
   
         const child = dp_self.menu.children.buffer[stride+j];
         const text = `prog:${ui_gfx_self_state.progs.buffer[i].idx} vb:${vbidxs[j]} | count:${vb.count}`;
         child.SetText(text);
      }
      stride+=vbidxs.length;
   }
}


/************************************************************************************************************************************************/
// Mesh Info

function Debug_info_create_mesh_info(params){

   const scene = params.params;

   if (DEBUG_INFO.UI_MESH.IS_ON) {

      const meshes = Scenes_get_root_meshes(scene.sceneidx);
      const dropdown = meshes.buffer[DEBUG_INFO.UI_MESH.IDX];

      Info_listener_destroy_event(dropdown.debug_info.evtidx);
      DEBUG_INFO.UI_MESH.POS = dropdown.geom.pos; // Remember the ui's position.

      dropdown.Destroy();

      DEBUG_INFO.UI_MESH.IDX = INT_NULL; // reference to the scene's mesh buffer
      DEBUG_INFO.UI_MESH.IS_ON = false;

      ui_gfx_self_state.progs = [];

      return;
   }


   const tr = .45;

   
   const dp = new Widget_Dropdown(`InfoUi Mesh DP`, [600, 20, 0], [10, 10], GREY1, TRANSPARENCY(GREY1, tr), WHITE, [8, 3]);
   dp.SetType(MESH_TYPES_DBG.UI_INFO_MESH); // Special recognition of this type, so we skip any infinite loops
   dp.CreateClickEvent();
   dp.CreateMoveEvent();
   Drop_down_set_root(dp, dp);


   const root_meshes = Scenes_get_root_meshes(STATE.scene.active_idx);

   for (let i=0; i<root_meshes.boundary; i++){

      if(root_meshes.buffer[i]) 
         Debug_info_mesh_add_meshes_as_tree_struct(root_meshes.buffer[i], dp);
   }

   // Create scroller for the ui-mesh info widget
   const scroller = new Widget_Scroller(dp, [100, 300] );
   scroller.CreateListenEvent(LISTEN_EVENT_TYPES.MOVE);

   scene.AddWidget(scroller, GFX_CTX_FLAGS.PRIVATE);
   scroller.Calc();
   scroller.Render();
   scroller.ConstructListeners();
   
   DEBUG_INFO.UI_MESH.IDX = scroller.idx;
   DEBUG_INFO.UI_MESH.IS_ON = true;

   // Create an Info listener to update the mouse position ui text
   // dp.debug_info.evtidx = Info_listener_create_event(INFO_LISTEN_EVENT_TYPE.MESH, Debug_info_mesh_update, params, dp);

}

function Debug_info_mesh_add_meshes_as_tree_struct(mesh, parent){

   const dp_mesh = new Widget_Dropdown(` ${mesh.name}`, [0, 0, 0], [10, 10], TRANSPARENCY(GREEN_140_240_10, .5), GREY1, WHITE, [8, 3]);
   // dp_mesh.SetName(`${mesh.name}`);
   dp_mesh.SetType(MESH_TYPES_DBG.UI_INFO_MESH);
   parent.AddToMenu(dp_mesh);

   for (let i=0; i<mesh.children.boundary; i++){
      
      const child = mesh.children.buffer[i];
      if(child) 
         Debug_info_mesh_add_meshes_as_tree_struct(child, dp_mesh);
   }

}

function Debug_info_mesh_update(params){

   // const root_info_dp = params.target_params;
   // const scene = params.source_params.params;
   // const clicked_mesh = params.source_params.target_mesh;
   // const added_mesh = params.trigger_params
   // const parent = added_mesh.parent ? added_mesh.parent : null 


   // /**
   //  * 1. Find the newly added mesh's parent.
   //  * 2. Find the parent's info mesh dropdown.
   //  *    2.1. If no parent, create new dp at the level of the menu of the root_info_dp
   //  *    2.2. If parent
   //  *       2.2.1. Create new dropdown of the added mesh.
   //  * 4. Add the mesh dp to the menu of the found parent dp
   //  * DONE
   //  */


   // const parent_name = added_mesh.parent ? added_mesh.parent.name : 'null' 
   // console.log( ' root_dp:', root_info_dp.name,  ' clicked_mesh:', clicked_mesh.name,' added mesh:', added_mesh.name)
   // console.log(' Parent: ', parent_name, parent)
   // console.log(' root_info_dp: ', root_info_dp)

   // if(!parent && !(added_mesh.type & MESH_TYPES_DBG.UI_INFO_MESH)){

   //    const dp_mesh = new Widget_Dropdown(` ${added_mesh.name}`, [0, 0, 0], [10, 10], TRANSPARENCY(GREEN_140_240_10, .5), GREY1, WHITE, [8, 3]);
   //    dp_mesh.SetName(`${added_mesh.name}`);
   //    dp_mesh.SetType(MESH_TYPES_DBG.UI_INFO_MESH);
   //    root_info_dp.AddToMenu(dp_mesh);


   //    // dp_mesh.GenGfxCtx(GFX_CTX_FLAGS.PRIVATE);
   //    const gfx_idxs = [root_info_dp.menu.gfx.prog.idx, root_info_dp.menu.gfx.vb.idx];
   //    dp_mesh.GenGfxCtx(GFX_CTX_FLAGS.PRIVATE, gfx_idxs);
   //    // Gfx_add_geom_mat_to_vb(dp_mesh.sid, dp_mesh.gfx, dp_mesh.geom, dp_mesh.mat, dp_mesh.type & MESH_TYPES_DBG.MESH, dp_mesh.name);
   //    dp_mesh.Render();
   //    root_info_dp.Recalc();

   // }

}

