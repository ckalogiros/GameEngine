"use strict";

import { GlGetPrograms, GlGetVB } from "../../../Graphics/GlProgram";
import { Section } from "../Meshes/Section";
import { Drop_down_set_root, Widget_Drop_Down } from "../Meshes/Widgets/Menu/Widget_Drop_Down";
import { Widget_Switch } from "../Meshes/Widgets/WidgetButton";
import { Widget_Label_Text_Mesh_Menu_Options } from "../Meshes/Widgets/WidgetLabel";
import { Widget_Dynamic_Text_Mesh } from "../Meshes/Widgets/WidgetText";
import { Gfx_end_session } from "../../Interfaces/Gfx/GfxContext";
// import { Scenes_get_children } from "../Scenes";
import { PerformanceTimersGetCurTime, PerformanceTimersGetFps, PerformanceTimersGetMilisec, _pt_fps } from "../../Timers/PerformanceTimers";
import { PerformanceTimerGetFps1sAvg, _fps_1s_avg, _fps_500ms_avg } from "../../Timers/Time";
import { Info_listener_create_event, Info_listener_destroy_event } from "./InfoListeners";


export function Debug_info_ui_performance(scene) {

   const tr = .5; // Transparency
   const pad = [5, 5];
   const fontsize = 4;

   // the drop down menu to hold the enabling/disabling of the 
   const dp = new Widget_Drop_Down('Generic Ui Debug Info', ALIGN.LEFT, [10, 10, 0], [10, 10], GREY1, TRANSPARENCY(GREY1, tr), WHITE, [1, 1], [8, 3]);


   /************************************************************************************************************************************************/
   // Performance timers
   {
      const section = new Section(SECTION.HORIZONTAL, [0, 0], [0, 0, 0], [0, 0], TRANSPARENCY(GREY6, .4), 'ui performance timers panel');

      const enable_ui_timers_label = new Widget_Label_Text_Mesh_Menu_Options('Ui Performance Timers', (ALIGN.HOR_CENTER | ALIGN.VERT_CENTER), [200, 300, 0], fontsize, TRANSPARENCY(BLUE_10_120_220, .0), WHITE, [1, 1], pad, .4, undefined, [2, 3, 2]);
      enable_ui_timers_label.SetName(`ui timers label`);
      section.AddItem(enable_ui_timers_label);

      const enable_ui_timers_switch = new Widget_Switch('on', 'off', [Viewport.right - 500, 200, 0], 4.4, BLUE_10_120_220, WHITE, [2, 3]);
      enable_ui_timers_switch.Bind(Debug_info_create_ui_performance_timers, null, scene);
      enable_ui_timers_switch.SetName(`ui timers switch`);
      section.AddItem(enable_ui_timers_switch);

      dp.AddToMenu(section);

   }

   /************************************************************************************************************************************************/
   // Mouse Info
   {
      const section = new Section(SECTION.HORIZONTAL, [0,0], [0, 0, 0], [0, 0], TRANSPARENCY(GREY6, .4), 'ui performance timers panel');

      const label = new Widget_Label_Text_Mesh_Menu_Options('Mouse Info', (ALIGN.HOR_CENTER | ALIGN.VERT_CENTER), [200, 300, 0], fontsize, TRANSPARENCY(BLUE_10_120_220, .0), WHITE, [1, 1], pad, .4, undefined, [2, 3, 2]);
      label.SetName(`ui mousecoord label`);
      section.AddItem(label);

      const ui_switch = new Widget_Switch('on', 'off', [Viewport.right - 500, 200, 0], 4.4, BLUE_10_120_220, WHITE, [2, 3]);
      ui_switch.Bind(Debug_info_create_ui_mouse_coords, null, scene);
      ui_switch.SetName(`ui mousecoord switch`);
      section.AddItem(ui_switch);

      dp.AddToMenu(section);
   }

   /************************************************************************************************************************************************/
   // Gfx Info
   {
      const section = new Section(SECTION.HORIZONTAL, [0,0], [0, 0, 0], [0, 0], TRANSPARENCY(GREY6, .4), 'ui Gfx info panel');

      const label = new Widget_Label_Text_Mesh_Menu_Options('Gfx Info', (ALIGN.HOR_CENTER | ALIGN.VERT_CENTER), [200, 300, 0], fontsize, TRANSPARENCY(BLUE_10_120_220, .0), WHITE, [1, 1], pad, .4, undefined, [2, 3, 2]);
      label.SetName(`ui gfx label`);
      section.AddItem(label);

      const ui_switch = new Widget_Switch('on', 'off', [Viewport.right - 500, 10, 0], 4.4, BLUE_10_120_220, WHITE, [2, 3]);
      ui_switch.Bind(Debug_info_create_gfx_info, null, scene);
      ui_switch.SetName(`ui gfx switch`);
      section.AddItem(ui_switch);

      dp.AddToMenu(section);
   }


   scene.AddMesh(dp);
   // dp.Init();
   dp.Calc(SECTION.TOP_DOWN);
   Drop_down_set_root(dp, dp);

}

/************************************************************************************************************************************************/
// Performance timers
export function Debug_info_create_ui_performance_timers(params) {

   const scene = params.params;

   if (DEBUG_INFO.UI_TIMERS.IS_ON) {

      const meshes = Scenes_get_children(scene.sceneidx);
      const mesh = meshes.buffer[DEBUG_INFO.UI_TIMERS.IDX];

      DEBUG_INFO.UI_TIMERS.POS = mesh.geom.defPos; // Remember the info's position.
      mesh.DestroyPrivateGfxRecursive();

      DEBUG_INFO.UI_TIMERS.IDX = INT_NULL;
      DEBUG_INFO.UI_TIMERS.IS_ON = false;
      return;
   }


   const section = new Section(SECTION.HORIZONTAL, [10, 10], DEBUG_INFO.UI_TIMERS.POS, [0, 0], TRANSPARENCY(GREY1, .4), 'ui performance timers panel');
   section.CreateListenEvent(LISTEN_EVENT_TYPES.MOVE, section.OnClick)


   const fontsize = 4;
   let pad = 0;
   let ms = 200;

   const timer = new Widget_Dynamic_Text_Mesh('Fps Avg:', '0000', [0,0,0], fontsize, [1, 1], BLUE_10_160_220, ORANGE_240_160_10, .5);
   timer.SetDynamicText(`DynamicText ${ms} Timer TimeGetFps`, ms, PerformanceTimersGetFps, _pt_fps); // idx is for use in creating separate time intervals for each dynamic text.

   timer.CreateNewText('deltaAvg ms:', fontsize, BLUE_10_160_220, [pad * 3, 0], .9);
   timer.CreateNewText('00000', fontsize, ORANGE_240_160_10, [0, 0], .9);
   timer.SetDynamicText(`DynamicText ${ms} Timer TimeGetDeltaAvg`, ms, PerformanceTimersGetMilisec, _pt_fps)

   timer.CreateNewText('curTime ms:', fontsize, BLUE_10_160_220, [pad * 3, 0], .9);
   timer.CreateNewText('00', fontsize, ORANGE_240_160_10, [0, 0], .5);
   timer.SetDynamicText(`DynamicText ${ms} Timer TimeGetTimer`, ms, PerformanceTimersGetCurTime, _pt_fps);

   section.AddItem(timer);

   /********************************************************************************************************************************************************************************************************** */

   ms = 1000;
   const fps1sAvg = new Widget_Dynamic_Text_Mesh('Fps 1sec avg:', '0000', [0, 0, 0], fontsize, [1, 1], BLUE_10_160_220, ORANGE_240_160_10, .5);
   fps1sAvg.SetDynamicText(`DynamicText ${ms} Timer TimeGetFps`, ms, PerformanceTimerGetFps1sAvg, _fps_1s_avg); // idx is for use in creating separate time intervals for each dynamic text.
   fps1sAvg.CreateNewText('ms:', fontsize, BLUE_10_160_220, [fontsize * 3, 0], .9);

   fps1sAvg.CreateNewText('000000', fontsize, ORANGE_240_160_10, [0, 0], .5);
   fps1sAvg.SetDynamicText(`DynamicText ${ms} Timer TimeGetTimer`, ms, null, _fps_1s_avg); // no need for callback, the '_fps_1s_avg' is already in milisec. 

   section.AddItem(fps1sAvg);

   /********************************************************************************************************************************************************************************************************** */

   ms = 500;
   const fps500msAvg = new Widget_Dynamic_Text_Mesh('Fps 500ms avg:', '000000', [0, 0, 0], fontsize, [1, 1], BLUE_10_160_220, ORANGE_240_160_10, .5);
   fps500msAvg.SetDynamicText(`DynamicText ${ms} Timer TimeGetFps`, ms, PerformanceTimerGetFps1sAvg, _fps_500ms_avg); // idx is for use in creating separate time intervals for each dynamic text.
   fps500msAvg.CreateNewText('ms:', fontsize, BLUE_10_160_220, [fontsize * 3, 0], .9);

   fps500msAvg.CreateNewText('000000', fontsize, ORANGE_240_160_10, [0, 0], .5);
   fps500msAvg.SetDynamicText(`DynamicText ${ms} Timer TimeGetTimer`, ms, null, _fps_500ms_avg);
   section.AddItem(fps500msAvg);

   scene.AddMesh(section, GFX.PRIVATE);
   section.Recalc(SECTION.VERTICAL | SECTION.HORIZONTAL);
   section.AddToGfx()
   DEBUG_INFO.UI_TIMERS.IDX = section.idx;
   Gfx_end_session(true);

   DEBUG_INFO.UI_TIMERS.IS_ON = true;

}

/************************************************************************************************************************************************/
// Mouse Info
export function Debug_info_create_ui_mouse_coords(params) {

   const scene = params.params;

   if (DEBUG_INFO.UI_MOUSE.IS_ON) {

      const meshes = Scenes_get_children(scene.sceneidx);
      const mesh = meshes.buffer[DEBUG_INFO.UI_MOUSE.IDX];

      Info_listener_destroy_event(mesh.debug_info.evtidx);
      DEBUG_INFO.UI_MOUSE.POS = mesh.geom.defPos; // Remember the info's position.
      mesh.DestroyPrivateGfxRecursive();

      DEBUG_INFO.UI_MOUSE.IDX = INT_NULL;
      DEBUG_INFO.UI_MOUSE.IS_ON = false;
      return;
   }


   const section = new Section(SECTION.HORIZONTAL, [3, 3], DEBUG_INFO.UI_MOUSE.POS, [0, 0], TRANSPARENCY(GREY1, .4), 'ui mouse info panel');
   section.CreateListenEvent(LISTEN_EVENT_TYPES.MOVE, section.OnClick)


   const fontsize = 4;

   const infomesh = new Widget_Dynamic_Text_Mesh('Mouse |', 'pos: x:0000, y:0000', [0, 0, 0], fontsize, [1, 1], YELLOW_240_220_10, GREEN_140_240_10, .4);
   infomesh.CreateNewText('area: x:0000, y:0000', fontsize, GREEN_140_240_10, [10, 10], .9);
   // infomesh.CreateNewText('dif: x:0000, y:0000', fontsize, GREEN_140_240_10, [20, 10], .9);


   section.AddItem(infomesh);


   scene.AddMesh(section, GFX.PRIVATE);
   section.Recalc(SECTION.VERTICAL | SECTION.HORIZONTAL);
   section.AddToGfx()
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
   const mpr = `area: x:${m.pos.x-m.click.up.x}, y:${m.pos.y-m.click.up.y}`;

   const mouse_pos_text = target_mesh.children.buffer[0];
   mouse_pos_text.UpdateTextFromVal(mp)
   const mouse_prev_text = target_mesh.children.buffer[1];
   mouse_prev_text.UpdateTextFromVal(mpr)

}

/************************************************************************************************************************************************/
// Gfx Info
export function Debug_info_create_gfx_info(params) {

   const scene = params.params;

   if (DEBUG_INFO.UI_GFX.IS_ON) {

      const meshes = Scenes_get_children(scene.sceneidx);
      const mesh = meshes.buffer[DEBUG_INFO.UI_GFX.IDX];

      Info_listener_destroy_event(mesh.debug_info.evtidx);
      DEBUG_INFO.UI_GFX.POS = mesh.geom.defPos; // Remember the ui's position.
      mesh.DestroyPrivateGfxRecursive();
      // mesh.Destroy();

      DEBUG_INFO.UI_GFX.IDX = INT_NULL; // Refference to the scene's mesh buffer
      DEBUG_INFO.UI_GFX.IS_ON = false;
      return;
   }


   const tr = .6;
   const section = new Section(SECTION.VERTICAL, [3, 3], DEBUG_INFO.UI_GFX.POS, [0, 0], TRANSPARENCY(GREY1, .4), 'ui gfx info panel');
   // section.CreateListenEvent(LISTEN_EVENT_TYPES.MOVE, section.OnClick)
   
   const dp = new Widget_Drop_Down(`Gfx Info`, ALIGN.LEFT, [200, 400, 0], [10, 10], GREY1, TRANSPARENCY(GREY1, tr), WHITE, [1, 1], [8, 3]);
   dp.SetName('Gfx Info DP')
   
   const progs = GlGetPrograms();
   const count = progs.length;
   for (let i=0; i<count; i++){
      
      const dp_pr = new Widget_Drop_Down(`prog:${i}`, ALIGN.LEFT, [200, 400, 0], [10, 10], GREY1, TRANSPARENCY(GREY1, tr), WHITE, [1, 1], [8, 3]);
      dp_pr.SetName(`Program DP:${i}`)
      // dp_pr.CreateListenEvent(LISTEN_EVENT_TYPES.MOVE, section.OnClick);
      
      for (let j=0; j<progs[i].vertexBufferCount; j++){
         
         const vb = progs[i].vertexBuffer[j];
         const dp_vb = new Widget_Drop_Down(`vb:${j} | count:${vb.count}`, ALIGN.LEFT, [200, 400, 0], [10, 10], GREY1, TRANSPARENCY(GREY1, tr), WHITE, [1, 1], [8, 3]);
         dp_vb.SetName(`VB DP:${j}`)
         dp_vb.debug_info.data = {
            progidx: i,
            vbidx: j,
         };
         dp_vb.CreateListenEvent(LISTEN_EVENT_TYPES.HOVER);
         dp_vb.StateEnable(MESH_STATE.IS_HOVER_COLORABLE);
         dp_pr.AddToMenu(dp_vb);
      }

      dp.AddToMenu(dp_pr);
   }
   Drop_down_set_root(dp, dp);
   section.AddItem(dp);

   scene.AddMesh(section, GFX.PRIVATE);
   section.Recalc(SECTION.VERTICAL | SECTION.HORIZONTAL);
   section.AddToGfx()
   DEBUG_INFO.UI_GFX.IDX = section.idx;
   Gfx_end_session(true);

   DEBUG_INFO.UI_GFX.IS_ON = true;

   // Create an Info listener to update the mouse position ui text
   section.debug_info.evtidx = Info_listener_create_event(INFO_LISTEN_EVENT_TYPE.GFX, Debug_info_update_gfx_info, params, section);
}

export function Debug_info_update_gfx_info(params) {

   /**
    * Scema:
    * 
    * section  
    *    -> Widget_Drop_Down
    *       ->->  Widget_Button
    *             ->->-> Widget_Text
    *             ->->-> Widget_Text
    *       ->->  Section (the menu for displaying the programs buffers)
    *          ->->-> Widget_Drop_Down (program 0)
    *             ... Same for Widget_Drop_Down. Has 1 button and the menu for all vertex buffers of program 0            
    *          ->->-> Widget_Drop_Down (program 0)
    *             ... Same for Widget_Drop_Down. Has 1 button and the menu for all vertex buffers of program 1  
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
   const dp_gfx = section.children.buffer[0];

   const added_gfx = params.trigger_params.added_gfx;
   const progidx = added_gfx.progidx;
   const vbidx = added_gfx.vbidx;

   let dp_prog = null;


   if(progidx === 0){
      // dp_prog = section.children.buffer[0].children.buffer[1].children.buffer[0];
      dp_prog = section.children.buffer[0].menu.children.buffer[0];
   }
   else if(progidx === 1){
      dp_prog = section.children.buffer[0].menu.children.buffer[1];
   }

   console.log('added_gfx:', added_gfx, 'section:', section)
   console.log('dp_prog:', dp_prog)

   const vb = GlGetVB(progidx, vbidx);
   
   const new_dp_vb = new Widget_Drop_Down(`vb:${vbidx} | count:${vb.count}`, ALIGN.LEFT, [200, 400, 0], [10, 10], GREY1, TRANSPARENCY(GREY1, tr), WHITE, [1, 1], [8, 3]);
   dp_prog.AddToMenu(new_dp_vb)

}
