import {
  Component,
  ElementRef,
  Input,
  OnInit,
  AfterViewInit,
  OnChanges,
  OnDestroy,
  SimpleChanges,
} from '@angular/core';
import * as THREE from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';

@Component({
  selector: 'app-three-viewer',
  templateUrl: './three-viewer.component.html',
  styleUrls: ['./three-viewer.component.scss'],
})
export class ThreeViewerComponent
  implements AfterViewInit, OnChanges, OnDestroy
{
  @Input() modelFile: File | null = null; // File input
  @Input() modelUrl: string | null = null; // URL input
  private renderer!: THREE.WebGLRenderer;
  private scene!: THREE.Scene;
  private camera!: THREE.PerspectiveCamera;
  private controls!: OrbitControls;
  private container!: HTMLElement;
  private currentModel: THREE.Object3D | null = null; // Store the current model

  constructor(private el: ElementRef) {}

  ngAfterViewInit(): void {
    this.container = this.el.nativeElement.querySelector('#viewer');
    this.initThree();
    this.animate(); // Start animation loop

    // Listen to window resize
    window.addEventListener('resize', this.onWindowResize.bind(this));
  }

  ngOnChanges(changes: SimpleChanges): void {
    // Check if modelFile or modelUrl has changed
    if (changes['modelFile'] && this.modelFile) {
      this.loadModelFromFile(this.modelFile);
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

    const width = this.container.clientWidth;
    const height = this.container.clientHeight;
    this.camera = new THREE.PerspectiveCamera(75, width / height, 0.1, 1000);
    this.camera.position.z = 5;

    this.renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    this.renderer.shadowMap.enabled = true;
    this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    this.renderer.setSize(width, height);
    this.container.appendChild(this.renderer.domElement);

    this.controls = new OrbitControls(this.camera, this.renderer.domElement);
    this.controls.enableDamping = true;
    this.controls.dampingFactor = 0.25;
    this.controls.enableZoom = true;

    const ambientLight = new THREE.AmbientLight(0xffffff, 1); // Increase intensity
    this.scene.add(ambientLight);

    const directionalLight = new THREE.DirectionalLight(0xffffff, 1); // Increase intensity
    directionalLight.position.set(5, 5, 5); // Adjust position
    this.scene.add(directionalLight);
  }

  onWindowResize(): void {
    // Update camera aspect ratio and renderer size
    const width = this.container.clientWidth;
    const height = this.container.clientHeight;

    this.camera.aspect = width / height;
    this.camera.updateProjectionMatrix(); // Notify the camera of the new aspect ratio

    this.renderer.setSize(width, height); // Update renderer size
  }

  loadModelFromUrl(modelUrl: string): void {
    const loader = new GLTFLoader();
    loader.load(
      modelUrl,
      (gltf) => {
        // Clear existing models from the scene if needed
        this.clearScene();
        this.currentModel = gltf.scene; // Store the current model
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
        this.currentModel.receiveShadow = true;
        this.scene.add(this.currentModel);
        this.centerAndScaleModel(this.currentModel);
      });
    };
    reader.readAsArrayBuffer(file); // Read file as ArrayBuffer
  }

  clearScene(): void {
    while (this.scene.children.length > 0) {
      this.scene.remove(this.scene.children[0]);
    }
  }

  centerAndScaleModel(model: THREE.Object3D): void {
    const box = new THREE.Box3().setFromObject(model);
    const size = box.getSize(new THREE.Vector3());
    const maxAxis = Math.max(size.x, size.y, size.z);
    model.scale.multiplyScalar(1.0 / maxAxis); // Normalize size to fit
    box.setFromObject(model);
    const center = box.getCenter(new THREE.Vector3());
    model.position.sub(center); // Center the model
  }

  animate(): void {
    requestAnimationFrame(() => this.animate());

    // Autorotate the current model
    if (this.currentModel) {
      this.currentModel.rotation.y += 0.01; // Rotate around the Y-axis
    }

    this.controls.update();
    this.renderer.render(this.scene, this.camera);
  }
}
