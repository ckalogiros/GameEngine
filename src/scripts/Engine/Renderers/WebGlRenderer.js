"use strict";

import { GlRotateX3D, GlRotateXY3D, GlRotateY3D, GlRotateZ3D } from "../../Graphics/Buffers/GlBufferOps.js";
import { GlDraw } from "../../Graphics/GlDraw.js";
import { GlCreateTexture } from "../../Graphics/GlTextures.js";
import { PrintAttributes } from "../../Graphics/Z_Debug/GfxDebug.js";
import { MouseResetDif, MouseResetWheel } from "../Controls/Input/Mouse.js";
import { FpsGet, TimeIntervalsUpdateAll, TimeUpdate, TimersUpdateStepTimers } from "../Timer/Time.js";
import { TimerUpdateGlobalTimers, TimersUpdateTimers } from "../Timer/Timer.js";
import { Matrix4 } from "../math/Matrix4.js";

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


// TODO: Make PLATFORM, Device and Viewport private to Renderer???
// const rotx = new Matrix4();
// const rotz = new Matrix4();
// const tra = new Matrix4();

export class WebGlRenderer {

   scene;
   camera;
   canvas;
   gl;
   extensions;
   fpsTimer;

   constructor(scene, camera) {

      this.canvas = document.getElementById("glCanvas");
      this.DeviceSetUp();
      this.Init();
      
      this.scene = scene;
      scene.UseCamera(camera);

      this.camera = camera;
      this.camera.Set();

      this.fpsTimer = FpsGet();
   }

   Render(mesh) {

      
      // const animations = AnimationsGet();
      // const particles = ParticleSystemGet();
      
      if (g_state.game.paused === false) {
         
         this.fpsTimer.Start();

         TimeUpdate(); // Update the Global Timer (real time, in miliseconds)
         TimeIntervalsUpdateAll(); // Update and run callbacks for each interval timer that has been set.
         
         TimerUpdateGlobalTimers(); // This is a globbal timer, going only forward
         TimersUpdateTimers();
         TimersUpdateStepTimers();
   
         // TODO!!! Update camera uniform if camera needs update 
         this.camera.Update(this.gl)
         this.scene.OnUpdate();
         
         if(mesh){
            // GlRotateZ3D(mesh, this.fpsTimer.cnt*.02);
            // GlRotateY3D(mesh, this.fpsTimer.cnt*.02)
            // GlRotateX3D(mesh, this.fpsTimer.cnt*.02)
            GlRotateXY3D(mesh, this.fpsTimer.cnt*.02)
            
            // GlRotateZ3D(mesh.gfx, mesh.geom.dim, this.fpsTimer.cnt*.02);
            // GlRotateX3D(mesh.gfx, mesh.geom.dim, this.fpsTimer.cnt*.002)
            // GlRotateY3D(mesh.gfx, mesh.geom.dim, this.fpsTimer.cnt*.002)
         }

         // if(this.camera.needsUpdateUniform){
         //    const prog = GlGetProgram(this.scene.gfxBuffer[0].progIdx);
         //    prog.UniformsSetUpdateProjectionMatrix(this.gl, this.camera.elements);
         // }

         //  HandleEvents();
         //  RunAnimations();
         //  animations.Run();
         //  particles.Update();
         //  CheckCollisions();
         //  Update();
         //  OnMouseMove();
         //  ExplosionsUpdate();
   
         GlDraw(this.gl);
         MouseResetDif(.5);
         MouseResetWheel();
         this.fpsTimer.Stop();
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


      this.extensions = this.gl.getSupportedExtensions();
      // this.gl.getExtension('OES_standard_derivatives');
      // this.gl.getExtension('EXT_shader_texture_lod');

      this.gl.enable(this.gl.DEPTH_TEST);
      this.gl.depthFunc(this.gl.LEQUAL)
      this.gl.depthMask(true);
      this.gl.enable(this.gl.BLEND);

      this.gl.blendFunc(this.gl.DST_ALPHA, this.gl.ONE_MINUS_SRC_ALPHA);

      // this.gl.enable(this.gl.SAMPLE_COVERAGE);
      // this.gl.sampleCoverage(2.2, false);

      DetectHostPlatform();

      gfxCtx.gl = this.gl;
      gfxCtx.ext = this.extensions;


      // Debug some gl info
      console.log("gl.RENDERER: " + this.gl.getParameter(this.gl.RENDERER));
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
      // Update (global) Viewport object
      Viewport.width = this.canvas.width;
      Viewport.height = this.canvas.height;

      Viewport.left = 0;
      Viewport.right = this.canvas.width;
      Viewport.top = 0;
      Viewport.bottom = this.canvas.height;
      Viewport.centerX = Viewport.left + (Viewport.width / 2);
      Viewport.centerY = Viewport.top + (Viewport.height / 2);

      Viewport.ratio = this.canvas.width / this.canvas.height;
      Viewport.leftMargin = (window.innerWidth - Viewport.width) / 2;
      Viewport.topMargin = (window.innerHeight - Viewport.height) / 2

   }
}
/**
 * 
 * qwreyuekjsksjkdjfoqk
 */

function DetectHostPlatform() {

   const wn = window.navigator;
   console.log(wn)

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

// function DebubRotationTranslation(){
//    rotz.makeRotationZ(.001)
//    // rotx.makeRotationY(.001)
//    // const rot = rotx.multiply(rotz)
//    // const rot = rotz.multiply(rotx)
//    const rot = rotz
//    // tra.makeTranslation(0, 0, 0)
//    // tra.setPosition(1, 0, 0)
//    const a = rot.multiply(tra)
//    // const a = tra.multiply(rot)
//    // this.camera.camera.multiply(tra)
//    // this.camera.camera.multiply(a)
//    // rot.multiply(tra)
//    // 

//    return a;
// }

