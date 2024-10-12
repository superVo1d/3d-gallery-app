import {
  Component,
  ElementRef,
  Input,
  AfterViewInit,
  OnChanges,
  OnDestroy,
  SimpleChanges,
  ViewChild,
} from '@angular/core';
import * as THREE from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';

export type AnimationType = 'orbit' | 'zoom' | 'pan' | 'flyThrough';

@Component({
  selector: 'app-three-viewer',
  templateUrl: './three-viewer.component.html',
  styleUrls: ['./three-viewer.component.scss'],
})
export class ThreeViewerComponent
  implements AfterViewInit, OnChanges, OnDestroy
{
  @ViewChild('viewer') container: ElementRef | null = null;

  @Input() modelFile: File | null = null; // File input
  @Input() modelUrl: string | null = null; // URL input
  @Input() controlsAvaliable = false;
  @Input() animationType: AnimationType | undefined = 'orbit';

  private renderer!: THREE.WebGLRenderer;
  private scene!: THREE.Scene;
  private camera!: THREE.PerspectiveCamera;
  private controls!: OrbitControls;
  private currentModel: THREE.Object3D | null = null; // Store the current model
  private isAnimating = true; // Tracks if animation is active

  constructor(private el: ElementRef) {}

  private angle = 0;

  orbitCamera(): void {
    const radius = 5; // Distance from the center
    this.angle += 0.01; // Increment angle to rotate
    this.camera.position.x = radius * Math.cos(this.angle);
    this.camera.position.z = radius * Math.sin(this.angle);
    this.camera.lookAt(0, 0, 0); // Always look at the center of the scene
  }

  private flyThroughSpeed = 0.01; // Control speed of the loop
  private loopTime = 0;

  flyThroughCamera(): void {
    this.loopTime += this.flyThroughSpeed;

    const radius = 5; // Define a radius for the loop
    const offsetY = 2; // Vertical offset to avoid too much movement in Y-axis

    // Loop using sin and cos functions for smooth circular motion
    this.camera.position.x = radius * Math.sin(this.loopTime); // Oscillates on X-axis
    this.camera.position.y = offsetY * Math.sin(this.loopTime * 0.5); // Slower Y oscillation
    this.camera.position.z = radius * Math.cos(this.loopTime); // Oscillates on Z-axis

    // Always look at the center of the scene
    this.camera.lookAt(0, 0, 0);
  }

  private panDirection = 1;

  panCamera(): void {
    this.camera.position.x += 0.02 * this.panDirection; // Move left/right
    if (this.camera.position.x > 2 || this.camera.position.x < -2) {
      this.panDirection *= -1; // Reverse direction when hitting bounds
    }
  }

  private zoomDirection = 1;

  zoomCamera(): void {
    this.camera.position.z += 0.05 * this.zoomDirection; // Move closer or further
    if (this.camera.position.z < 2 || this.camera.position.z > 10) {
      this.zoomDirection *= -1; // Reverse direction when hitting bounds
    }
  }

  ngAfterViewInit(): void {
    this.initThree();
    this.animate(); // Start animation loop

    // Listen to window resize
    window.addEventListener('resize', this.onWindowResize.bind(this));
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['animationType']) {
      this.resetCamera();
    }

    // Check if modelFile or modelUrl has changed
    if (changes['modelFile']) {
      if (this.modelFile) {
        this.loadModelFromFile(this.modelFile);
      } else {
        this.clearScene();
      }
    }

    if (changes['modelUrl'] && this.modelUrl) {
      this.loadModelFromUrl(this.modelUrl);
    }
  }

  ngOnDestroy(): void {
    // Remove the resize listener when component is destroyed
    window.removeEventListener('resize', this.onWindowResize.bind(this));
  }

  initThree(): void {
    this.scene = new THREE.Scene();

    const width = this.container?.nativeElement.clientWidth;
    const height = this.container?.nativeElement.clientHeight;
    this.camera = new THREE.PerspectiveCamera(75, width / height, 0.1, 1000);
    this.camera.position.z = 5;

    this.renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    this.renderer.shadowMap.enabled = true;
    this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    this.renderer.setSize(width, height);
    this.container?.nativeElement.appendChild(this.renderer.domElement);

    if (this.controlsAvaliable) {
      this.controls = new OrbitControls(this.camera, this.renderer.domElement);
      this.controls.enableDamping = true;
      this.controls.dampingFactor = 0.25;
      this.controls.enableZoom = true;
    }

    const ambientLight = new THREE.AmbientLight(0xffffff, 1); // Increase intensity
    this.scene.add(ambientLight);

    const directionalLight = new THREE.DirectionalLight(0xffffff, 1); // Increase intensity
    directionalLight.position.set(5, 5, 5); // Adjust position
    this.scene.add(directionalLight);
  }

  onWindowResize(): void {
    // Update camera aspect ratio and renderer size
    const width = this.container?.nativeElement.clientWidth;
    const height = this.container?.nativeElement.clientHeight;

    this.camera.aspect = width / height;
    this.camera.updateProjectionMatrix(); // Notify the camera of the new aspect ratio

    this.renderer.setSize(width, height); // Update renderer size
  }

  loadModelFromUrl(modelUrl: string): void {
    const loader = new GLTFLoader();
    loader.load(
      `http://localhost:3001${modelUrl}`,
      (gltf) => {
        // Clear existing models from the scene if needed
        // this.clearScene();

        this.currentModel = gltf.scene; // Store the current model
        this.currentModel.castShadow = true;
        this.scene.add(this.currentModel);
        this.centerAndScaleModel(this.currentModel);
      },
      undefined,
      (error) => {
        console.error('Error loading model:', error);
      }
    );
  }

  loadModelFromFile(file: File): void {
    const reader = new FileReader();
    reader.onload = (event: any) => {
      const contents = event.target.result;
      const loader = new GLTFLoader();
      loader.parse(contents, '', (gltf) => {
        // Clear existing models from the scene if needed
        // this.clearScene();
        this.currentModel = gltf.scene; // Store the current model
        this.currentModel.castShadow = true;
        this.scene.add(this.currentModel);
        this.centerAndScaleModel(this.currentModel);
      });
    };
    reader.readAsArrayBuffer(file); // Read file as ArrayBuffer
  }

  clearScene(): void {
    if (!this.scene) {
      return;
    }

    while (this.scene.children.length > 0) {
      this.scene.remove(this.scene.children[0]);
    }
  }

  resetCamera(): void {
    this.camera?.position.set(0, 0, 5); // Reset to default position
    this.camera?.rotation.set(0, 0, 0); // Reset rotation
    this.camera?.updateProjectionMatrix(); // Ensure the camera is updated
  }

  centerAndScaleModel(model: THREE.Object3D): void {
    const box = new THREE.Box3().setFromObject(model);
    const size = box.getSize(new THREE.Vector3());
    const maxAxis = Math.max(size.x, size.y, size.z);
    model.scale.multiplyScalar(4.0 / maxAxis); // Normalize size to fit
    box.setFromObject(model);
    const center = box.getCenter(new THREE.Vector3());
    model.position.sub(center); // Center the model
  }

  animate(): void {
    if (!this.isAnimating) {
      return; // Stop the animation if isAnimating is false
    }

    requestAnimationFrame(() => this.animate());

    // Autorotate the current model
    // if (this.currentModel) {
    //   this.currentModel.rotation.y += 0.01; // Rotate around the Y-axis
    // }

    switch (this.animationType) {
      case 'orbit':
        this.orbitCamera();
        break;
      case 'zoom':
        this.zoomCamera();
        break;
      case 'pan':
        this.panCamera();
        break;
      case 'flyThrough':
        this.flyThroughCamera();
        break;
      default:
        this.orbitCamera(); // Fallback to orbit
        break;
    }

    this.controls?.update();
    this.renderer.render(this.scene, this.camera);
  }
}
