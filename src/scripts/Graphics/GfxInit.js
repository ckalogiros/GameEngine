"use strict";
import { GfxCreatePrograms } from './GfxCreateProgram.js';
import { GlCreateTexture } from './GlTextures.js'
// For Debuging
import * as dbg from './Z_Debug/GfxDebug.js'



export function GfxInitGraphics() {

    console.log('Initializing Graphics.')

    const canvas = document.getElementById("glCanvas");

    /** Create Graphics Context */
    gfxCtx.gl = canvas.getContext("webgl2", {
        premultipliedAlpha: false,
        antialias: true,
        // colorSpace: 'srgb',
        // alpha: true,
        // preserveDrawingBuffer: true,
    });

    console.log('WebGl version: ', gfxCtx.gl.getParameter(gfxCtx.gl.SHADING_LANGUAGE_VERSION));
    // alert(`WebGl version: ${gfxCtx.gl.getParameter(gfxCtx.gl.SHADING_LANGUAGE_VERSION)}`, );
    if (!gfxCtx.gl)
        alert('Unable to initialize WebGL.');


    // gfxCtx.ext = gfxCtx.gl.getSupportedExtensions();
    // gfxCtx.gl.getExtension('OES_standard_derivatives');
    // gfxCtx.gl.getExtension('EXT_shader_texture_lod');

    /* * * * * GlDepthFunc Constant Parameters
    gl.NEVER (never pass)
    gl.LESS (pass if the incoming value is less than the depth buffer value)
    gl.EQUAL (pass if the incoming value equals the depth buffer value)
    gl.LEQUAL (pass if the incoming value is less than or equal to the depth buffer value)
    gl.GREATER (pass if the incoming value is greater than the depth buffer value)
    gl.NOTEQUAL (pass if the incoming value is not equal to the depth buffer value)
    gl.GEQUAL (pass if the incoming value is greater than or equal to the depth buffer value)
    gl.ALWAYS (always pass)
    */
    gfxCtx.gl.enable(gfxCtx.gl.DEPTH_TEST);
    gfxCtx.gl.depthFunc(gfxCtx.gl.LEQUAL)
    gfxCtx.gl.depthMask(true);
    gfxCtx.gl.enable(gfxCtx.gl.BLEND);
    /* * * * * GlBlend Constants
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
    // gfxCtx.gl.blendFunc(gfxCtx.gl.SRC_ALPHA, gfxCtx.gl.ONE_MINUS_SRC_ALPHA );
    gfxCtx.gl.blendFunc(gfxCtx.gl.DST_ALPHA, gfxCtx.gl.ONE_MINUS_SRC_ALPHA);
    // gfxCtx.gl.blendFunc(gfxCtx.gl.SRC_ALPHA, gfxCtx.gl.ONE_MINUS_DST_ALPHA);
    // gfxCtx.gl.blendFunc(gfxCtx.gl.DST_ALPHA, gfxCtx.gl.ONE_MINUS_DST_ALPHA);
    // gfxCtx.gl.blendFunc(gfxCtx.gl.ONE, gfxCtx.gl.ONE);

    // gfxCtx.gl.enable(gfxCtx.gl.SAMPLE_COVERAGE);
    // gfxCtx.gl.sampleCoverage(2.2, false);

    // const progs = GfxCreatePrograms(gfxCtx.gl);
    dbg.PrintAttributes(gfxCtx.gl);

    // TODO: the texture images initialization as GlTextures should be called elsewhere
    GlCreateTexture('FontConsolasSdf35', gfxCtx.gl, COMIC_FONT_TEXTURE_PATH);
    GlCreateTexture('TextureAtlas', gfxCtx.gl, TEXTURE_ATLAS_PATH);

    var maxTextureSize = gfxCtx.gl.getParameter(gfxCtx.gl.MAX_TEXTURE_SIZE);
    console.log("Maximum Texture Size: " + maxTextureSize);
    // alert("Maximum Texture Size: " + maxTextureSize);
    DetectPlatform();
}

function DetectPlatform(){

    const temp = window.navigator;
    console.log(temp)
    // alert(temp.userAgent);
    // const y = /IEMobile/i.test(navigator.userAgent);
    // console.log(y);

    /** Windows Smartphone
     * Mozilla/5.0 (Windows Phone 10.0; Android 4.2.1; Microsoft; Lumia 950) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/46.0.2486.0 Mobile Safari/537.36 Edge/14.14263
     */
    if(/IEMobile/i.test(window.navigator.userAgent)){
        PLATFORM.WIN_PHONE_IMPL = true;
        // console.log('-- Windows Phone Platform --')
    }
    else if(/Android/i.test(window.navigator.userAgent)){
        PLATFORM.ANDROID_IMPL = true;
        console.log('-- Android Phone Platform --')
        // alert('-- Android Phone Platform --')
    }
    else if(/iPhone|iPad|iPod/i.test(window.navigator.userAgent)){
        PLATFORM.I_PHONE_IMPL = true;
        // console.log('-- Iphone Phone Platform --')
    }
    /** Windows NT
     * Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:109.0) Gecko/20100101 Firefox/114.0 
     */


    // var isMobile = {
    //     Windows: function() {
    //         return /IEMobile/i.test(navigator.userAgent);
    //     },
    //     Android: function() {
    //         return /Android/i.test(navigator.userAgent);
    //     },
    //     BlackBerry: function() {
    //         return /BlackBerry/i.test(navigator.userAgent);
    //     },
    //     iOS: function() {
    //         return /iPhone|iPad|iPod/i.test(navigator.userAgent);
    //     },
    //     any: function() {
    //         return (isMobile.Android() || isMobile.BlackBerry() || isMobile.iOS() || isMobile.Windows());
    //     }
    // };
}

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



