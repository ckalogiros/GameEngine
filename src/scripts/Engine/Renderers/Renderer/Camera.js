import { GlProgramUpdateUniformProjectionMatrix } from '../../../Graphics/GlProgram.js';
import { MouseGetPosDif, MouseGetWheel } from '../../Controls/Input/Mouse.js';
import { TimerGetGlobalTimer } from '../../Timers/Timers.js';
import { Matrix4 } from '../../math/Matrix4.js';

/**
 * TODO:
 * 
 * Create a camera enabling system for controling the camera.
 * OnCameraUpdate all the anabled controls must be updated(Matrix arithmetic, translation, rotation, ...etc)
 * Also on camera update we must set the needUpdate of the glProgram that uses the current camera object,
 * so at a later render stage the update of the projection matrix uniform will be updated 
 * in a loop for all programs if needUpdate is true.
 * 
 * 
 */

const DEG2RAD = Math.PI / 180;

let _cnt = 1;
export const CAMERA_CONTROLS = {
	PAN: _cnt++,
	ROTATE: _cnt++,
	ZOOM: _cnt++,

	NONE: 0,
	COUNT: _cnt,
};


export class Camera extends Matrix4 {

	isSet; // To debug if camera has been created properly.
	gfxBuffer; // Store all gl programs that the camera apllies to.
	controller;

	constructor() {
		super();
		this.isSet = false;
		this.controller = {
			controls: new Uint8Array(CAMERA_CONTROLS.COUNT),
			isActive: false,
		}
		this.gfxBuffer = [];
		
	}

	Update(gl) {
		if (DEBUG.CAMERA && !this.isSet) alert('Forget to set Camera. @ Camera.js');

		if(!this.controller.isActive) return; // Skip any proccess if camera controls aren't activated.
		if(this.controller.controls[CAMERA_CONTROLS.PAN]){
			this.Pan();
		}
		if(this.controller.controls[CAMERA_CONTROLS.PAN]){
			this.Zoom();
		}
		if(this.controller.controls[CAMERA_CONTROLS.ROTATE]){
			this.Rotate();
		}

		this.UpdateProjectionUniform(gl);
	}
	UpdateProjectionUniform(gl){
		// Update proj matrix for all gl programs
		const len = this.gfxBuffer.length;
		for(let i=0; i<len; i++){
			GlProgramUpdateUniformProjectionMatrix(gl, this.gfxBuffer[i], this.elements);
		}
	}

	////////////////////////////////////////////////////////////////////////////////////////////////////////
	// Camera controls
	SetControls(which) {
		
		if (Array.isArray(which)) {
			const count = which.length;
			for (let i = 0; i < count; i++) {
				this.controller.controls[which[i]] = true;
				this.controller.isActive = true;
			}
		}
		else {
			this.controller.controls[which] = true;
			this.controller.isActive = true;
		}
	}

	Pan() {
		const mouseDif = MouseGetPosDif();
		mouseDif.x /= Viewport.width / 2;
		mouseDif.y /= Viewport.height / 2;
		this.Translate(mouseDif.x, mouseDif.y, 0);
	}
	Zoom() {
		const mouseWheel = MouseGetWheel();
		this.Translate(0, 0, mouseWheel.delta);
		// console.log(this.elements[14])
	}
	
	////////////////////////////////////////////////////////////////////////////////////////////////////////
	// Matrix transformations
	Translate(x, y, z) {
		super.Translate(x, y, z);
	}
	Rotate(theta){

		const t = TimerGetGlobalTimer();
		theta = t;

		const c = Math.cos(theta), s = Math.sin(theta);
		const Z1 = 0, Z2 = 1, Z3 = 4, Z4 = 5; // Z Axis
		const Y1 = 0, Y2 = 2, Y3 = 8, Y4 = 10; // Y Axis
		const X1 = 5, X2 = 6, X3 = 10, X4 = 11; // X Axis
		this.elements[Z1] *=  c;
		this.elements[Z2] *= -s;
		this.elements[Z3] *=  s;
		this.elements[Z4] *=  c;

		// this.controller.controls[CAMERA_CONTROLS.PAN] = true
		// this.controller.isActive = true;
	}

	StoreProgIdx(progIdx) { // This is the way for a camera to be updated(as a uniform mat4) in all gl programs. 

		// Check if the glVertexBuffer index of the current Mesh is already stored in the buffer.
		let found = false;
		const len = this.gfxBuffer.length;

		for (let i = 0; i < len; i++) {
			if (this.gfxBuffer[i] === progIdx) {
				found = true;
				break;
			}
		}

		// Store it, if not stored.
		if (!found) {
			this.gfxBuffer.push(progIdx);
		}
	}
}

export class CameraOrthographic extends Camera {
	constructor() {
		super();
	}
	Init() {

		const zoom = 1;
		const dx = ( Viewport.width- 0 ) / ( 2 * zoom );
		const dy = ( 0 - Viewport.height ) / ( 2 * zoom );
		const cx = ( Viewport.width + 0 ) / 2;
		const cy = ( 0 + Viewport.height ) / 2;

		let left = cx - dx;
		let right = cx + dx;
		let top = cy + dy;
		let bottom = cy - dy;

		const near = 0, far = 1000;

		this.makeOrthographic( left, right, top, bottom, near, far );
		this.isSet = true;
	}
}
export class CameraPerspective extends Camera {
	constructor() {
		super();
		
	}
	Init() {

		const near = 0.1, far = 2000;
		let top = near * Math.tan( DEG2RAD * 0.5 * 75 ) / 1;
		let height = 2 * top;
		let width = 1 * height;
		let left = - 0.5 * width;

		this.makePerspective( left, left + width, top, top - height, near, far );
		this.isSet = true;
	}

}

export function CameraStoreProgramIdx(progIdx){

}