"use strict";


const PLAYER_ENLARGE_ANIMATION_DURATION = 2000; // 2 seconds
const MAX_ANIMATIONS_SIZE = 256;

export class Animation{
    
    animationClbk = null;
    stopAnimationClbk = null;
    params = null;
    inAnimation = false;
    isActive = false;

    // For debuging
    index = 0;
    name = '';

    Create(animationClbk, stopAnimationClbk, params, index, name){
        this.params = params;
        this.animationClbk = animationClbk;
        this.stopAnimationClbk = stopAnimationClbk;
        this.index = index;
        this.name = name;
    }
    Run(){
        this.inAnimation = this.animationClbk(this.params);
    }
    Stop(){
        this.isActive = false;
        this.stopAnimationClbk(this.params);
    }
}

export class Animations{
    animations = [];
    count = 0;
    size = MAX_ANIMATIONS_SIZE;

    constructor(){
        this.Init();
    }

    Init(){
        for(let i=0; i<this.size; i++){
            this.animations[i] = new Animation;
            this.animations[i].Create(null, null, null);
        }
    }
    GetNextFree() {
        for (let i = 0; i < this.size; i++) {
            if (!this.animations[i].isActive) {
                return i;
            }
        }
        return INT_NULL;
    }
    Create(animationClbk, stopAnimationClbk, params, name){
        const freeIdx = this.GetNextFree();
        if(freeIdx !== INT_NULL){
            const anim = this.animations[freeIdx]
            if(anim === undefined)
                console.log()
            anim.Create(animationClbk, stopAnimationClbk, params, this.count, name);
            anim.inAnimation = true; 
            anim.isActive = true; 
            this.count++;
        }
        else{alert('Not enough space for new Animation. At Animations.js:Animations.Create()')}
        return freeIdx;
    }
    Run(){
        if(this.count){
            for(let i=0; i<this.size; i++){
                if(this.animations[i].isActive){
                    if(this.animations[i].inAnimation){
                        this.animations[i].Run();
                    }
                    else{ // Here do stuf if animation stops
                        this.animations[i].Stop();
                        this.count--;
                    }
                }
            }
        }
    }
}

const animations = new Animations;
export function AnimationsGet(){
    return animations;
}





/////////////////////////////////////////////////////////////////////////////////////////////////////

