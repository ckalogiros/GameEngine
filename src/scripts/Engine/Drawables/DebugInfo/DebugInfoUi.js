"use strict";

import { Gl_progs_get, Gl_progs_get_vb_byidx } from "../../../Graphics/GlProgram";
import { Section } from "../Meshes/Section";
import { Drop_down_set_root, Widget_Dropdown } from "../Meshes/Widgets/Menu/Widget_Dropdown";
import { Widget_Switch } from "../Meshes/Widgets/WidgetButton";
import { Widget_Label } from "../Meshes/Widgets/WidgetLabel";
import { Widget_Dynamic_Text_Mesh } from "../Meshes/Widgets/WidgetText";
import { Gfx_end_session, Gfx_generate_context } from "../../Interfaces/Gfx/GfxContext";
import { Scenes_get_root_meshes, Scenes_store_gfx_to_buffer } from "../../Scenes.js";
import { PerformanceTimersGetCurTime, PerformanceTimersGetFps, PerformanceTimersGetMilisec, _pt_fps } from "../../Timers/PerformanceTimers";
import { PerformanceTimerGetFps1sAvg, _fps_1s_avg, _fps_500ms_avg } from "../../Timers/Time";
import { Info_listener_create_event, Info_listener_destroy_event } from "./InfoListeners";


export function Debug_info_ui_performance(scene) {

   const tr = .5; // Transparency
   const pad = [5, 5];
   const fontsize = 4;

   // the drop down menu to hold the enabling/disabling of the 
   const dp = new Widget_Dropdown('Generic Ui Debug Info', [10, 10, 0], [10, 10], GREY1, TRANSPARENCY(GREY1, tr), WHITE, [8, 3]);
   dp.SetName('InfoUi Root-DP');
   dp.CreateClickEvent()
   
   
   /************************************************************************************************************************************************/
   // Performance timers
   {
      const section = new Section(SECTION.HORIZONTAL, [10, 10], [0, 0, 0], [0, 0], TRANSPARENCY(GREY6, .4), 'InfoUi-Timers section');
      
      const enable_ui_timers_label = new Widget_Label('Ui Performance Timers', (ALIGN.HOR_CENTER | ALIGN.VERT_CENTER), [200, 300, 0], fontsize, TRANSPARENCY(BLUE_10_120_220, .7), WHITE, pad, .4, undefined, [2, 3, 2]);
      enable_ui_timers_label.SetName(`InfoUi-Timers label`);
      section.AddItem(enable_ui_timers_label);
      
      const enable_ui_timers_switch = new Widget_Switch('on', 'off', [Viewport.right - 500, 200, 0], 4.4, BLUE_10_120_220, WHITE, [2, 3]);
      enable_ui_timers_switch.Bind(Debug_info_create_ui_performance_timers, null, scene);
      enable_ui_timers_switch.SetName(`InfoUi-Timers switch`);
      section.AddItem(enable_ui_timers_switch);

      dp.AddToMenu(section);

   }

   /************************************************************************************************************************************************/
   // Mouse Info
   {
      const section = new Section(SECTION.HORIZONTAL, [10, 10], [0, 0, 0], [0, 0], TRANSPARENCY(ORANGE_240_130_10, .4), 'InfoUi-Mouse section');

      const label = new Widget_Label('Mouse Info sds', (ALIGN.HOR_CENTER | ALIGN.VERT_CENTER), [200, 300, 0], fontsize, TRANSPARENCY(BLUE_10_120_220, .5), YELLOW, pad, .4, undefined, [2, 3, 2]);
      label.SetName(`InfoUi-Mouse label`);
      section.AddItem(label);

      const ui_switch = new Widget_Switch('on', 'off', [Viewport.right - 500, 200, 0], 4.4, BLUE_10_120_220, WHITE, [2, 3]);
      ui_switch.Bind(Debug_info_create_ui_mouse_coords, null, scene);
      ui_switch.SetName(`InfoUi-Mouse switch`);
      section.AddItem(ui_switch);

      dp.AddToMenu(section);
   }

   /************************************************************************************************************************************************/
   // Gfx Info
   {
      const section = new Section(SECTION.HORIZONTAL, [10, 10], [0, 0, 0], [0, 0], TRANSPARENCY(GREY6, .4), 'InfoUi-Gfx section');
      // section.sid.attr |= SID.ATTR.COL4_PER_VERTEX;
      // section.mat.col = [WHITE, RED, GREEN, BLUE];
      // section.geom.pos[2] = 2;

      const label = new Widget_Label('Gfx Info', (ALIGN.BOTTOM | ALIGN.VERT_CENTER), [200, 300, 0], fontsize, TRANSPARENCY(GREEN_140_240_10, .9), WHITE, pad, .4, undefined, [2, 3, 2]);
      label.SetName(`InfoUi-Gfx label`);
      section.AddItem(label);

      const ui_switch = new Widget_Switch('on', 'off', [0, 0, 0], 4.4, BLUE_10_120_220, WHITE, [2, 3]);
      ui_switch.Bind(Debug_info_create_gfx_info, null, scene);
      ui_switch.SetName(`InfoUi-Gfx switch`);
      section.AddItem(ui_switch);

      dp.AddToMenu(section);
   }

   scene.AddWidget(dp);
   dp.Calc(SECTION.TOP_DOWN);
   Drop_down_set_root(dp, dp);

}

/************************************************************************************************************************************************/
// Performance timers
export function Debug_info_create_ui_performance_timers(params) {

   const scene = params.params;

   if (DEBUG_INFO.UI_TIMERS.IS_ON) {

      const meshes = Scenes_get_root_meshes(scene.sceneidx);
      const section = meshes.buffer[DEBUG_INFO.UI_TIMERS.IDX];

      DEBUG_INFO.UI_TIMERS.POS = section.geom.pos; // Remember the info's position.
      // section.DestroyPrivateGfxRecursive();
      section.Destroy();

      DEBUG_INFO.UI_TIMERS.IDX = INT_NULL;
      DEBUG_INFO.UI_TIMERS.IS_ON = false;
      return;
   }


   const section = new Section(SECTION.HORIZONTAL, [10, 10], DEBUG_INFO.UI_TIMERS.POS, [0, 0], TRANSPARENCY(GREY1, .4), 'ui performance timers panel');
   section.CreateListenEvent(LISTEN_EVENT_TYPES.MOVE, section.OnClick)


   const fontsize = 4;
   let pad = 0;
   let ms = 200;

   const timer = new Widget_Dynamic_Text_Mesh('Fps: | Avg:', '00000', [0, 0, 0], fontsize, BLUE_10_160_220, ORANGE_240_160_10, .5);
   timer.SetDynamicText(`DynamicText ${ms} Timer TimeGetFps`, ms, PerformanceTimersGetFps, _pt_fps); // idx is for use in creating separate time intervals for each dynamic text.

   timer.CreateNewText('| deltaAvg ms:', fontsize, BLUE_10_160_220, [pad * 3, 0], .9);
   timer.CreateNewText('00000', fontsize, ORANGE_240_160_10, [0, 0], .9);
   timer.SetDynamicText(`DynamicText ${ms} Timer TimeGetDeltaAvg`, ms, PerformanceTimersGetMilisec, _pt_fps)

   timer.CreateNewText('| curTime ms:', fontsize, BLUE_10_160_220, [pad * 3, 0], .9);
   timer.CreateNewText('00000', fontsize, ORANGE_240_160_10, [0, 0], .5);
   timer.SetDynamicText(`DynamicText ${ms} Timer TimeGetTimer`, ms, PerformanceTimersGetCurTime, _pt_fps);

   section.AddItem(timer);

   /********************************************************************************************************************************************************************************************************** */

   ms = 1000;
   const fps1sAvg = new Widget_Dynamic_Text_Mesh('Fps 1sec: | avg:', '00000', [0, 0, 0], fontsize, BLUE_10_160_220, ORANGE_240_160_10, .5);
   fps1sAvg.SetDynamicText(`DynamicText ${ms} Timer TimeGetFps`, ms, PerformanceTimerGetFps1sAvg, _fps_1s_avg); // idx is for use in creating separate time intervals for each dynamic text.
   fps1sAvg.CreateNewText('| ms:', fontsize, BLUE_10_160_220, [fontsize * 3, 0], .9);

   fps1sAvg.CreateNewText('00000', fontsize, ORANGE_240_160_10, [0, 0], .5);
   fps1sAvg.SetDynamicText(`DynamicText ${ms} Timer TimeGetTimer`, ms, null, _fps_1s_avg); // no need for callback, the '_fps_1s_avg' is already in milisec. 

   section.AddItem(fps1sAvg);

   /********************************************************************************************************************************************************************************************************** */

   ms = 500;
   const fps500msAvg = new Widget_Dynamic_Text_Mesh('Fps 500ms: | avg:', '00000', [0, 0, 0], fontsize, BLUE_10_160_220, ORANGE_240_160_10, .5);
   fps500msAvg.SetDynamicText(`DynamicText ${ms} Timer TimeGetFps`, ms, PerformanceTimerGetFps1sAvg, _fps_500ms_avg); // idx is for use in creating separate time intervals for each dynamic text.
   fps500msAvg.CreateNewText('| ms:', fontsize, BLUE_10_160_220, [fontsize * 3, 0], .9);

   fps500msAvg.CreateNewText('00000', fontsize, ORANGE_240_160_10, [0, 0], .5);
   fps500msAvg.SetDynamicText(`DynamicText ${ms} Timer TimeGetTimer`, ms, null, _fps_500ms_avg);
   section.AddItem(fps500msAvg);

   scene.AddWidget(section, GFX.PRIVATE);
   section.Recalc(SECTION.VERTICAL | SECTION.HORIZONTAL);
   section.Render()
   DEBUG_INFO.UI_TIMERS.IDX = section.idx;
   Gfx_end_session(true);

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
   section.CreateListenEvent(LISTEN_EVENT_TYPES.MOVE, section.OnClick)


   const fontsize = 4;

   const infomesh = new Widget_Dynamic_Text_Mesh('Mouse |', 'pos: x:0000, y:0000', [0, 0, 0], fontsize, YELLOW_240_220_10, GREEN_140_240_10, .4);
   infomesh.CreateNewText('| area: x:0000, y:0000', fontsize, GREEN_140_240_10, [10, 10], .9);


   section.AddItem(infomesh);


   scene.AddWidget(section, GFX.PRIVATE);
   section.Recalc(SECTION.VERTICAL | SECTION.HORIZONTAL);
   section.Render()
   DEBUG_INFO.UI_MOUSE.IDX = section.idx;
   Gfx_end_session(true);

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
export function Debug_info_create_gfx_info(params) {

   const scene = params.params;

   if (DEBUG_INFO.UI_GFX.IS_ON) {

      const meshes = Scenes_get_root_meshes(scene.sceneidx);
      const section = meshes.buffer[DEBUG_INFO.UI_GFX.IDX];

      Info_listener_destroy_event(section.debug_info.evtidx);
      DEBUG_INFO.UI_GFX.POS = section.geom.pos; // Remember the ui's position.

      section.Destroy();

      DEBUG_INFO.UI_GFX.IDX = INT_NULL; // reference to the scene's mesh buffer
      DEBUG_INFO.UI_GFX.IS_ON = false;
      return;
   }


   const tr = .6;
   const section = new Section(SECTION.VERTICAL, [43, 13], DEBUG_INFO.UI_GFX.POS, [0, 0], TRANSPARENCY(GREY1, .4), 'InfoUi Gfx section');
   section.SetName('InfoUi Gfx section 100')

   const dp = new Widget_Dropdown(`InfoUi Gfx DP`, [0, 0, 0], [10, 10], GREY1, TRANSPARENCY(GREY1, tr), WHITE, [8, 3]);
   dp.SetName('InfoUi Gfx DP');
   dp.type |= MESH_TYPES_DBG.UI_INFO_GFX; // Special recognition of this type, so we skip any infinite loops
   dp.CreateClickEvent();
   
   const progs = Gl_progs_get();
   const count = progs.length;
   for (let i = 0; i < count; i++) {
      
      const dp_pr = new Widget_Dropdown(`prog:${i}`, [200, 400, 0], [10, 10], GREY1, TRANSPARENCY(GREY1, tr), WHITE, [8, 3]);
      dp_pr.SetName(`Program DP:${i}`);
      Object.defineProperty(dp_pr, 'gfxidx', { value: i });
      dp_pr.type |= MESH_TYPES_DBG.UI_INFO_GFX; // Special recognition of this type, so we skip any infinite loops
      
      for (let j = 0; j < progs[i].vertexBufferCount; j++) {
         
         const vb = progs[i].vertexBuffer[j];
         const dp_vb = new Widget_Dropdown(`vb:${j} | count:${vb.count}`, [200, 400, 0], [10, 10], GREY1, TRANSPARENCY(GREY1, tr), WHITE, [8, 3]);
         dp_vb.SetName(`VB DP:${j}`)
         Object.defineProperty(dp_vb, 'gfxidx', { value: j });
         dp_vb.type |= MESH_TYPES_DBG.UI_INFO_GFX; // Special recognition of this type, so we skip any infinite loops
         dp_vb.debug_info.data = {
            progidx: i,
            vbidx: j,
         };
         dp_pr.AddToMenu(dp_vb);
      }

      dp.AddToMenu(dp_pr);
   }
   Drop_down_set_root(dp, dp);
   section.AddItem(dp);

   scene.AddWidget(section, GFX.PRIVATE);
   section.Recalc(SECTION.VERTICAL | SECTION.HORIZONTAL);
   // Create an Info listener to update the mouse position ui text
   section.debug_info.evtidx = Info_listener_create_event(INFO_LISTEN_EVENT_TYPE.GFX.UPDATE, Debug_info_gfx_update, params, section);
   section.Render()
   DEBUG_INFO.UI_GFX.IDX = section.idx;
   Gfx_end_session(true);

   DEBUG_INFO.UI_GFX.IS_ON = true;

}

function Debug_info_gfx_update(params) {

   // console.log(params);

   const tr = .6;
   const progidx = params.trigger_params.progidx;
   const vbidx = params.trigger_params.vbidx;
   const section = params.target_params;
   const dp_ui_gfx = section.children.buffer[0]; 
   let dp_prog = null; 
   let dp_vb = null; 
   
   
   let foundprogidx = INT_NULL;
   // Find if program's dropdown exist
   for(let i=0; i<dp_ui_gfx.menu.children.boundary; i++){
      const pr = dp_ui_gfx.menu.children.buffer[i];
      if(pr.gfxidx === undefined) console.error('Missing prog-gfxidx property for dropdown')
      if(pr.gfxidx === progidx) foundprogidx = i;
   }
   // Find if vb's dropdown exist
   let foundvbidx = INT_NULL;
   if(foundprogidx !== INT_NULL){
      dp_prog = dp_ui_gfx.menu.children.buffer[foundprogidx]; 
      for(let i=0; i<dp_prog.menu.children.boundary; i++){
         const vb = dp_prog.menu.children.buffer[i];
         if(!vb.gfxidx === undefined) console.error('Missing vb-gfxidx  property for dropdown')
         if(vb.gfxidx === vbidx) foundvbidx = i;
      }
   }

   if(foundvbidx !== INT_NULL) dp_vb = dp_prog.menu.children.buffer[foundvbidx]

   
   const vb = Gl_progs_get_vb_byidx(progidx, vbidx);
   
   if(!dp_prog){
      console.log('================== Create program dropdown');
      // // Create program dropdown
      // const new_dp_prog = new Widget_Dropdown(`prog:${progidx} `, [0, 0, 0], [10, 10], GREY1, TRANSPARENCY(GREY1, tr), WHITE, [8, 3]);
      // new_dp_prog.SetName(`prog:${progidx}`);
      // new_dp_prog.type |= MESH_TYPES_DBG.UI_INFO_GFX; // Special recognition of this type, so we skip any infinite loops
      // section.AddToMenu(new_dp_prog);
      // new_dp_prog.GenGfxCtx(GFX.PRIVATE);
      // new_dp_prog.geom.AddToGraphicsBuffer(new_dp_prog.sid, new_dp_prog.gfx, new_dp_prog.name);
      // new_dp_prog.mat.AddToGraphicsBuffer(new_dp_prog.sid, new_dp_prog.gfx);
      // // new_dp_prog.Render();
      
      // // Create vb dropdown
      // const new_dp_vb = new Widget_Dropdown(`vb:${vbidx} | count:${vb.count}`, [0, 0, 0], [10, 10], GREY1, TRANSPARENCY(GREY1, tr), WHITE, [8, 3]);
      // new_dp_vb.SetName(`vb:${vbidx}`);
      // new_dp_vb.type |= MESH_TYPES_DBG.UI_INFO_GFX; // Special recognition of this type, so we skip any infinite loops
      // dp_prog.AddToMenu(new_dp_vb);
      // new_dp_vb.GenGfxCtx(GFX.PRIVATE);
      // new_dp_vb.geom.AddToGraphicsBuffer(new_dp_vb.sid, new_dp_vb.gfx, new_dp_vb.name);
      // new_dp_vb.mat.AddToGraphicsBuffer(new_dp_vb.sid, new_dp_vb.gfx);
      // new_dp_vb.Render();
      
   }else{
      
      // const dp_vb = dp_prog.menu.children.buffer[vbidx];
      if(!dp_vb){
         // Create vb dropdown
         const new_dp_vb = new Widget_Dropdown(`vb:${vbidx} | count:${vb.count}`, [0, 0, 0], [10, 10], GREY1, TRANSPARENCY(GREY1, tr), WHITE, [8, 3]);
         new_dp_vb.SetName(`vb:${vbidx}`);
         Object.defineProperty(new_dp_vb, 'gfxidx', { value: vbidx });
         new_dp_vb.type |= MESH_TYPES_DBG.UI_INFO_GFX; // Special recognition of this type, so we skip any infinite loops
         dp_prog.AddToMenu(new_dp_vb);
         // new_dp_vb.GenGfxCtx(GFX.PRIVATE);
         
         console.log(`================== Create vb dropdown. prog:${progidx} vb:${vbidx} mesh:${new_dp_vb.name}`);
         for(let i=0; i<dp_prog.menu.children.boundary; i++){
            console.log(dp_prog.menu.children.buffer[i].name)
         }
         
         Temp_render(new_dp_vb)

      }else{
         // Update existing prog-vb text info
         console.log(`UPDATE prog:${progidx} vb:${vbidx} mesh:${dp_vb.name}`);
      }
   }
   // section.Recalc();

}
function Temp_render(dp){

   dp.gfx = Gfx_generate_context(dp.sid, dp.sceneidx, dp.geom.num_faces, GFX.PRIVATE);
   Scenes_store_gfx_to_buffer(dp.sceneidx, dp);
   dp.geom.AddToGraphicsBuffer(dp.sid, dp.gfx, dp.name);
   dp.mat.AddToGraphicsBuffer(dp.sid, dp.gfx);
   
   const btn = dp.children.buffer[0];
   btn.GenGfxCtx(GFX.PRIVATE)
   // btn.gfx = Gfx_generate_context(btn.sid, btn.sceneidx, btn.geom.num_faces, GFX.PRIVATE);
   // Scenes_store_gfx_to_buffer(btn.sceneidx, btn);
   btn.geom.AddToGraphicsBuffer(btn.sid, btn.gfx, btn.name);
   btn.mat.AddToGraphicsBuffer(btn.sid, btn.gfx);
   
   const menu = dp.menu;
   for(let i=0; i<menu.children.boundary; i++){
      
      const child = menu.children.buffer[i];
      child.gfx = Gfx_generate_context(child.sid, child.sceneidx, child.geom.num_faces, GFX.PRIVATE);
      Scenes_store_gfx_to_buffer(child.sceneidx, child);
      child.geom.AddToGraphicsBuffer(child.sid, child.gfx, child.name);
      child.mat.AddToGraphicsBuffer(child.sid, child.gfx);

   }
}
function Debug_info_gfx_create_prog(params) {

}
function Debug_info_gfx_create_vb(params) {

}
function Debug_info_gfx_update_vb(params) {
   
}

function Debug_info_update_gfx_info(params) {

   /**
    * Scema:
    * 
    * section  
    *    -> Widget_Dropdown
    *       ->->  Widget_Button
    *             ->->-> Widget_Text
    *             ->->-> Widget_Text
    *       ->->  Section (the menu for displaying the programs buffers)
    *          ->->-> Widget_Dropdown (program 0)
    *             ... Same for Widget_Dropdown. Has 1 button and the menu for all vertex buffers of program 0            
    *          ->->-> Widget_Dropdown (program 0)
    *             ... Same for Widget_Dropdown. Has 1 button and the menu for all vertex buffers of program 1  
    *          .
    *          .
    *          .          
    *          
    * So:   section.children.buffer[0] is the widget dropdown 
    *       section.children.buffer[0].children.buffer[0] --- is the dropdown button
    *       section.children.buffer[0].children.buffer[1] --- is the dropdown menu
    *       section.children.buffer[0].children.buffer[1].children.buffer[0] --- is the dropdown for program[0]
    *       section.children.buffer[0].children.buffer[1].children.buffer[1] --- is the dropdown for program[1]
    *       section.children.buffer[0].children.buffer[1].children.buffer[0].children.buffer[1] --- is the menu for program[0]
    *       section.children.buffer[0].children.buffer[1].children.buffer[1].children.buffer[1] --- is the menu for program[1]
    */

   const tr = .6; // Transparency
   const section = params.target_params;
   // const dp_gfx = section.children.buffer[0];

   const added_gfx = params.trigger_params.added_gfx;
   const progidx = added_gfx.progidx;
   const vbidx = added_gfx.vbidx;

   let dp_prog = section.children.buffer[0].menu.children.buffer[progidx];

   console.log('added_gfx:', added_gfx, 'section:', section)
   console.log('dp_prog:', dp_prog)

   const vb = Gl_progs_get_vb_byidx(progidx, vbidx);

   const new_dp_vb = new Widget_Dropdown(`vb:${vbidx} | count:${vb.count}`, [0, 0, 0], [10, 10], GREY1, TRANSPARENCY(GREY1, tr), WHITE, [8, 3]);
   new_dp_vb.SetName(`vb:${vbidx}`)
   dp_prog.AddToMenu(new_dp_vb);

}

export function Debug_info_render_gfx_info(event_params) {

   /**
      event_params = {
            event_type: EVENT_TYPE,
            Clbk: Clbk,
            source_params: source_params,
            target_params: target_params,
            isActive: true,
         }
   */

   // const ui_gfx_info_section = event_params.target_params;
   // const dp_prog = ui_gfx_info_section.children.buffer[0];
   // if (!dp_prog.isOn) return;

   // const progs_menu = dp_prog.menu;
   // for (let i = 0; i < progs_menu.children.boundary; i++) {

   //    const dp_prog = progs_menu.children.buffer[i];
   //    if (dp_prog.isOn) {

   //       const gathered_gfx_idx = [];
   //       const prog_menu = dp_prog.menu;
   //       for (let j = 0; j < prog_menu.children.boundary; j++) {

   //          const dp_vb = prog_menu.children.buffer[j];
   //          if (!dp_vb.gfx) {

   //             const progidx = prog_menu.children.buffer[0].gfx.prog.idx; // Get the progidx from any prog dropdown menu child. 
   //             const vbidx = prog_menu.children.buffer[0].gfx.vb.idx; // Get the vbidx from any prog dropdown menu child. 
   //             dp_vb.GenGfxCtx(GFX.PRIVATE, [progidx, vbidx]);
   //             Gfx_end_session(true, true);
   //             // dp_vb.Render();
   //             // console.log('prog:', i,  ' vb:', j, ' :', dp_vb.name, ' not inserted')
   //          }

   //       }
   //    }
   // }

   // console.log('------------')

}
