"use strict";

import { Gl_draw } from "../../Graphics/GlDraw.js";
import { MouseResetDif, MouseResetWheel } from "../Controls/Input/Mouse.js";
import { FpsGet, TimeSample, TimeUpdate } from "../Timers/Time.js";
import { TimersUpdateGlobalTimer } from "../Timers/Timers.js";
import { TimeIntervalsUpdateAll } from "../Timers/TimeIntervals.js";
import {_pt_fps ,_pt2, _pt3, _pt4, _pt8, PerformanceTimersTick, _pt9 } from '../Timers/PerformanceTimers.js'
import { BatchDoNoMerge, BatchDoNoMerge2 } from "../Batch/Batch.js";

/**
 * WebGl
 * 
 * GlDepthFunc Constant Parameters
         gl.NEVER (never pass)
         gl.LESS (pass if the incoming value is less than the depth buffer value)
         gl.EQUAL (pass if the incoming value equals the depth buffer value)
         gl.LEQUAL (pass if the incoming value is less than or equal to the depth buffer value)
         gl.GREATER (pass if the incoming value is greater than the depth buffer value)
         gl.NOTEQUAL (pass if the incoming value is not equal to the depth buffer value)
         gl.GEQUAL (pass if the incoming value is greater than or equal to the depth buffer value)
         gl.ALWAYS (always pass)
 *
 *     
 * GlBlend Constants
         gl.ZERO 	                    Multiplies all colors by 0.
         gl.ONE 	                        Multiplies all colors by 1.
         gl.SRC_COLOR 	                Multiplies all colors by the source colors.
         gl.ONE_MINUS_SRC_COLOR 	        Multiplies all colors by 1 minus each source color.
         gl.DST_COLOR 	                Multiplies all colors by the destination color.
         gl.ONE_MINUS_DST_COLOR 	        Multiplies all colors by 1 minus each destination color.
         gl.SRC_ALPHA 	                Multiplies all colors by the source alpha value.
         gl.ONE_MINUS_SRC_ALPHA 	        Multiplies all colors by 1 minus the source alpha value.
         gl.DST_ALPHA 	                Multiplies all colors by the destination alpha value.
         gl.ONE_MINUS_DST_ALPHA 	        Multiplies all colors by 1 minus the destination alpha value.
         gl.CONSTANT_COLOR 	            Multiplies all colors by a constant color.
         gl.ONE_MINUS_CONSTANT_COLOR 	Multiplies all colors by 1 minus a constant color.
         gl.CONSTANT_ALPHA 	            Multiplies all colors by a constant alpha value.
         gl.ONE_MINUS_CONSTANT_ALPHA 	Multiplies all colors by 1 minus a constant alpha value.
         gl.SRC_ALPHA_SATURATE 	        Multiplies the RGB colors by the smaller of either the source alpha value or the value of 1 minus the destination alpha value. The alpha value is multiplied by 1. 
      
 */


// TODO: Make PLATFORM, Device and VIEWPORT private to Renderer???


export class WebGlRenderer {

   scene;
   // camera;
   canvas;
   gl;
   extensions;
   fpsTimer;

   constructor(scene, camera) {

      this.canvas = document.getElementById("glCanvas");
      this.DeviceSetUp();
      this.Init();

      this.scene = scene;
      scene.SetCamera(camera);
      STATE.scene.active = this.scene;
      STATE.scene.active_idx = this.scene.sceneidx;

      // this.camera = camera;
      // this.camera.Init();
      camera.Init();

      this.fpsTimer = FpsGet();

   }

   Render() {

      if (STATE.loop.paused === false) {
         
         this.scene.camera.UpdateProjectionUniformAll(gfxCtx.gl); // FIXME: Do we need to update the camera uniform every frame????

         TimeUpdate(); 
         _pt_fps.Start();
         
         _pt2.Start();
         TimeIntervalsUpdateAll(); // Update and run callbacks for each interval timer that has been set.
         TimersUpdateGlobalTimer(); // This is a globbal timer, going only forward
         // TimersUpdateTimers();
         // TimersUpdateStepTimers();
         _pt2.Stop();

         // _pt8.Start(); BatchDo(); _pt8.Stop();
         _pt8.Start(); BatchDoNoMerge2(); _pt8.Stop();
         // _pt9.Start(); BatchDoNoMerge(); _pt9.Stop();
         _pt3.Start(); this.scene.OnUpdate(); _pt3.Stop();
         
         _pt4.Start(); Gl_draw(this.gl); _pt4.Stop();
         
         MouseResetDif(.5);
         MouseResetWheel();
         
         _pt_fps.Stop();
         TimeSample()
         this.fpsTimer.Stop();


         PerformanceTimersTick()
      }


   }

   Init() {
      console.log('Initializing Graphics.')

      /** Create Graphics Context */
      this.gl = this.canvas.getContext("webgl2", {
         premultipliedAlpha: false,
         antialias: true,
         // colorSpace: 'srgb',
         // alpha: true,
         // preserveDrawingBuffer: true,
      });
      if (!this.gl) alert('Unable to initialize WebGL.');

      console.log('WebGl version: ', this.gl.getParameter(this.gl.SHADING_LANGUAGE_VERSION));
      console.log('WebGl renderer info: ', this.gl.getParameter(this.gl.RENDERER));


      this.extensions = this.gl.getSupportedExtensions();
      // this.gl.getExtension('OES_standard_derivatives');
      // this.gl.getExtension('EXT_shader_texture_lod');

      this.gl.enable(this.gl.DEPTH_TEST);
      this.gl.depthFunc(this.gl.LEQUAL)
      // this.gl.depthMask(true);

      this.gl.enable(this.gl.BLEND);
      /**
      gl.ZERO 	                        Multiplies all colors by 0.
      gl.ONE 	                        Multiplies all colors by 1.
      gl.SRC_COLOR 	                  Multiplies all colors by the source colors.
      gl.ONE_MINUS_SRC_COLOR 	         Multiplies all colors by 1 minus each source color.
      gl.DST_COLOR 	                  Multiplies all colors by the destination color.
      gl.ONE_MINUS_DST_COLOR 	         Multiplies all colors by 1 minus each destination color.
      gl.SRC_ALPHA 	                  Multiplies all colors by the source alpha value.
      gl.ONE_MINUS_SRC_ALPHA 	         Multiplies all colors by 1 minus the source alpha value.
      gl.DST_ALPHA 	                  Multiplies all colors by the destination alpha value.
      gl.ONE_MINUS_DST_ALPHA 	         Multiplies all colors by 1 minus the destination alpha value.
      gl.CONSTANT_COLOR 	            Multiplies all colors by a constant color.
      gl.ONE_MINUS_CONSTANT_COLOR 	   Multiplies all colors by 1 minus a constant color.
      gl.CONSTANT_ALPHA 	            Multiplies all colors by a constant alpha value.
      gl.ONE_MINUS_CONSTANT_ALPHA 	   Multiplies all colors by 1 minus a constant alpha value.
      gl.SRC_ALPHA_SATURATE 	         Multiplies the RGB colors by the smaller of either the source alpha value or the value of 1 minus the destination alpha value. The alpha value is multiplied by 1. 
      */
     this.gl.blendFunc(this.gl.DST_ALPHA, this.gl.ONE_MINUS_SRC_ALPHA);
     // this.gl.blendFunc(this.gl.SRC_ALPHA, this.gl.ONE_MINUS_SRC_ALPHA);
   //   this.gl.blendFunc(this.gl.SRC_ALPHA, this.gl.ONE_MINUS_DST_ALPHA);
   //   this.gl.blendFunc(this.gl.DST_ALPHA, this.gl.ONE_MINUS_DST_ALPHA);

      // this.gl.blendFunc(this.gl.ONE_MINUS_SRC_ALPHA, this.gl.DST_ALPHA);
      // this.gl.blendFunc(this.gl.ONE_MINUS_DST_ALPHA, this.gl.DST_ALPHA);
      // this.gl.blendFunc(this.gl.ONE_MINUS_SRC_ALPHA, this.gl.SRC_ALPHA);
      // this.gl.blendFunc(this.gl.ONE_MINUS_DST_ALPHA,this.gl.SRC_ALPHA) ;
      

      // this.gl.enable(this.gl.SAMPLE_COVERAGE);
      // this.gl.sampleCoverage(2.2, false);


      DetectHostPlatform();

      gfxCtx.gl = this.gl;
      gfxCtx.ext = this.extensions;


      // Debug some gl info
      var maxTextureSize = this.gl.getParameter(this.gl.MAX_TEXTURE_SIZE);
      console.log("Maximum Texture Size: " + maxTextureSize);
   }

   DeviceSetUp() {

      // const canvas = document.getElementById("glCanvas");
      Device.width = window.innerWidth;
      Device.height = window.innerHeight;
      console.log('Device width: ', Device.width, ' height: ', Device.height)

      if (Device.width > Device.MAX_WIDTH) {
         this.canvas.width = Device.MAX_WIDTH;
         this.canvas.height = Device.height;
      }
      else {
         this.canvas.width = Device.width;
         this.canvas.height = Device.height;

         // Calculate the correct proportions for all renderables compare to current device
         Device.ratio = Device.width / Device.MAX_WIDTH;
      }
      // Update (global) VIEWPORT object
      VIEWPORT.WIDTH = this.canvas.width;
      VIEWPORT.HEIGHT = this.canvas.height;

      VIEWPORT.LEFT = 0;
      VIEWPORT.RIGHT = this.canvas.width;
      VIEWPORT.TOP = 0;
      VIEWPORT.BOTTOM = this.canvas.height;
      VIEWPORT.centerX = VIEWPORT.LEFT + (VIEWPORT.WIDTH / 2);
      VIEWPORT.centerY = VIEWPORT.TOP + (VIEWPORT.HEIGHT / 2);

      VIEWPORT.ASPECT_RATIO = this.canvas.width / this.canvas.height;
      VIEWPORT.MARGIN.LEFT = (window.innerWidth - VIEWPORT.WIDTH) / 2;
      VIEWPORT.MARGIN.TOP = (window.innerHeight - VIEWPORT.HEIGHT) / 2

      POSITION_CENTER[0] = VIEWPORT.WIDTH/2;
      POSITION_CENTER[1] = VIEWPORT.HEIGHT/2;

   }
}

function DetectHostPlatform() {

   const wn = window.navigator;
   console.debug(wn)

   /** Windows Smartphone
    * Mozilla/5.0 (Windows Phone 10.0; Android 4.2.1; Microsoft; Lumia 950) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/46.0.2486.0 Mobile Safari/537.36 Edge/14.14263
    */
   if (/IEMobile/i.test(wn.userAgent)) {
      PLATFORM.WIN_PHONE_IMPL = true;
      // console.log('-- Windows Phone Platform --')
   }
   else if (/Android/i.test(wn.userAgent)) {
      PLATFORM.ANDROID_IMPL = true;
      console.log('-- Android Phone Platform --')
      // alert('-- Android Phone Platform --')
   }
   else if (/iPhone|iPad|iPod/i.test(wn.userAgent)) {
      PLATFORM.I_PHONE_IMPL = true;
      // console.log('-- Iphone Phone Platform --')
   }
   /** Windows NT
    * Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:109.0) Gecko/20100101 Firefox/114.0 
    */

   // Browser detection
   // https://developer.mozilla.org/en-US/docs/Web/API/Window/navigator
   /**
    * function getBrowserName(userAgent) {
     // The order matters here, and this may report false positives for unlisted browsers.
   
     if (userAgent.includes("Firefox")) {
       // "Mozilla/5.0 (X11; Linux i686; rv:104.0) Gecko/20100101 Firefox/104.0"
       return "Mozilla Firefox";
     } else if (userAgent.includes("SamsungBrowser")) {
       // "Mozilla/5.0 (Linux; Android 9; SAMSUNG SM-G955F Build/PPR1.180610.011) AppleWebKit/537.36 (KHTML, like Gecko) SamsungBrowser/9.4 Chrome/67.0.3396.87 Mobile Safari/537.36"
       return "Samsung Internet";
     } else if (userAgent.includes("Opera") || userAgent.includes("OPR")) {
       // "Mozilla/5.0 (Macintosh; Intel Mac OS X 12_5_1) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/104.0.0.0 Safari/537.36 OPR/90.0.4480.54"
       return "Opera";
     } else if (userAgent.includes("Edge")) {
       // "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/58.0.3029.110 Safari/537.36 Edge/16.16299"
       return "Microsoft Edge (Legacy)";
     } else if (userAgent.includes("Edg")) {
       // "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/104.0.0.0 Safari/537.36 Edg/104.0.1293.70"
       return "Microsoft Edge (Chromium)";
     } else if (userAgent.includes("Chrome")) {
       // "Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/104.0.0.0 Safari/537.36"
       return "Google Chrome or Chromium";
     } else if (userAgent.includes("Safari")) {
       // "Mozilla/5.0 (iPhone; CPU iPhone OS 15_6_1 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/15.6 Mobile/15E148 Safari/604.1"
       return "Apple Safari";
     } else {
       return "unknown";
     }
   }
    */
}


