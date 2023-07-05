"use strict";
import { GlDraw } from '../../Graphics/GlDraw.js'
import { TimerUpdateGlobalTimers, TimersUpdateTimers } from '../Timer/Timer.js';
import { HandleEvents } from '../Events/Events.js';
import { AnimationsGet, RunAnimations } from '../Animations/Animations.js';
import { CheckCollisions, Update } from '../Events/SceneEvents.js';
import { OnMouseMove } from '../Events/MouseEvents.js';
import { GlGetProgram } from '../../Graphics/GlProgram.js';
import { FpsGet, TimeIntervalsUpdateAll, TimeUpdate, TimersUpdateStepTimers } from '../Timer/Time.js';
import { ExplosionsUpdate } from '../Drawables/Fx/Explosions.js';
import { ParticleSystemGet } from '../ParticlesSystem/Particles.js';



const fps = FpsGet();

export function Render() {
    
    TimeUpdate(); // Update the Global Timer (real time, in miliseconds)
    TimeIntervalsUpdateAll(); // Update and run callbacks for each interval timer that has been set.
    fps.Start();
    
    const animations = AnimationsGet();
    const particles = ParticleSystemGet();
    
    if (g_state.game.paused === false) {

        TimerUpdateGlobalTimers(); // This is a globbal timer, going only forward
        TimersUpdateTimers(); 
        TimersUpdateStepTimers();

        HandleEvents();
        RunAnimations();
        animations.Run();
        particles.Update();
        CheckCollisions();
        Update();
        //OnMouseMove();
        ExplosionsUpdate();

        GlDraw();
    }
    
    requestAnimationFrame(Render);
    fps.Stop();
    
}


export function SetUniformParamsTimer(prog, step, index){
    prog.UniformsSetuniformsBufferValue(prog.t, index);
    prog.t += step;
}




let t = 0.0;
let lock_t = true;
const speed = 0.003;
const max = .5;

function TempUpdateCrambleShader(){
    const prog = GlGetProgram(UNIFORM_PARAMS.CRAMBLE.progIdx); 
    prog.UniformsSetuniformsBufferValue(t, UNIFORM_PARAMS.CRAMBLE.timeIdx);
    // if(!lock_t) {t-=speed; if(t<=0)lock_t=true;}
    // else {t+=speed; if(t>=3)lock_t=false;}
    t += speed; 
    if(t > max) t = 0.;
}



let t2 = 0.0;
const speed2 = 0.1;
function TempUpdateVoronoiExplosionShaderTimer(){
    const prog = GlGetProgram(UNIFORM_PARAMS.VORONOI_EXPLOSION.progIdx); 
    prog.UniformsSetuniformsBufferValue(t2, UNIFORM_PARAMS.VORONOI_EXPLOSION.timeIdx);
    // if(!lock_t) {t-=speed; if(t<=0)lock_t=true;}
    // else {t+=speed; if(t>=3)lock_t=false;}
    t2 += speed2; 
    // if(t2 > max) t = 0.;
}



