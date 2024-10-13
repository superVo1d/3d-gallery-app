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

  @Input() modelFile: File | null = null;
  @Input() modelUrl: string | null = null;
  @Input() controlsAvaliable = false;
  @Input() animationType: AnimationType | undefined = 'orbit';

  private renderer!: THREE.WebGLRenderer;
  private scene!: THREE.Scene;
  private camera!: THREE.PerspectiveCamera;
  private controls!: OrbitControls;
  private currentModel: THREE.Object3D | null = null;
  private isAnimating = true;

  constructor(private el: ElementRef) {}

  private angle = 0;
  private flyThroughSpeed = 0.01;
  private loopTime = 0;
  private panDirection = 1;
  private zoomDirection = 1;

  ngAfterViewInit(): void {
    this.initThree();
    this.animate();

    window.addEventListener('resize', this.onWindowResize.bind(this));

    if (this.controlsAvaliable) {
      this.container?.nativeElement.addEventListener(
        'mousedown',
        this.onCanvasInteract.bind(this),
        false
      );

      this.container?.nativeElement.addEventListener(
        'touchstart',
        this.onCanvasInteract.bind(this),
        false
      );
    }
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['animationType']) {
      this.resetCamera();
    }

    if (changes['modelFile'] && this.modelFile) {
      this.loadModelFromFile(this.modelFile);
    } else if (changes['modelUrl'] && this.modelUrl) {
      this.loadModelFromUrl(this.modelUrl);
    } else if (!this.modelFile && !this.modelUrl) {
      this.clearScene(); // Clear only if no new model is loaded
    }
  }

  ngOnDestroy(): void {
    window.removeEventListener('resize', this.onWindowResize.bind(this));

    this.container?.nativeElement.removeEventListener(
      'mousedown',
      this.onCanvasInteract.bind(this),
      false
    );

    this.container?.nativeElement.removeEventListener(
      'touchstart',
      this.onCanvasInteract.bind(this),
      false
    );
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

    const ambientLight = new THREE.AmbientLight(0xffffff, 1);
    this.scene.add(ambientLight);

    const directionalLight = new THREE.DirectionalLight(0xffffff, 1);
    directionalLight.position.set(5, 5, 5);
    directionalLight.castShadow = true; // Enable shadow casting
    this.scene.add(directionalLight);

    // Add a plane to receive shadows
    const planeGeometry = new THREE.PlaneGeometry(200, 200);
    const planeMaterial = new THREE.ShadowMaterial({ opacity: 0.5 });
    const plane = new THREE.Mesh(planeGeometry, planeMaterial);
    plane.rotation.x = -Math.PI / 2;
    plane.position.y = -1;
    plane.receiveShadow = true;
    this.scene.add(plane);
  }

  onWindowResize(): void {
    const width = this.container?.nativeElement.clientWidth;
    const height = this.container?.nativeElement.clientHeight;

    this.camera.aspect = width / height;
    this.camera.updateProjectionMatrix();

    this.renderer.setSize(width, height);
  }

  loadModelFromUrl(modelUrl: string): void {
    const loader = new GLTFLoader();
    loader.load(
      `http://localhost:3001${modelUrl}`,
      (gltf) => {
        this.clearScene();
        this.currentModel = gltf.scene;
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
        this.clearScene();
        this.currentModel = gltf.scene;
        this.currentModel.castShadow = true;
        this.scene.add(this.currentModel);
        this.centerAndScaleModel(this.currentModel);
      });
    };
    reader.readAsArrayBuffer(file);
  }

  clearScene(): void {
    // Retain only the lighting and plane
    const toRetain = [THREE.AmbientLight, THREE.DirectionalLight, THREE.Mesh];

    if (!this.scene) return;

    this.scene.children = this.scene.children.filter((child) =>
      toRetain.some((type) => child instanceof type)
    );
    this.currentModel = null;
  }

  resetCamera(): void {
    this.camera?.position.set(0, 0, 5);
    this.camera?.rotation.set(0, 0, 0);
    this.camera?.updateProjectionMatrix();
    this.isAnimating = true;
  }

  centerAndScaleModel(model: THREE.Object3D): void {
    const box = new THREE.Box3().setFromObject(model);
    const size = box.getSize(new THREE.Vector3());
    const maxAxis = Math.max(size.x, size.y, size.z);
    model.scale.multiplyScalar(4.0 / maxAxis);
    box.setFromObject(model);
    const center = box.getCenter(new THREE.Vector3());
    model.position.sub(center);
  }

  onCanvasInteract(): void {
    this.isAnimating = false;
  }

  animate(): void {
    requestAnimationFrame(() => this.animate());

    if (this.isAnimating) {
      if (this.currentModel) {
        this.currentModel.rotation.y += 0.01;
      }

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
          this.orbitCamera();
          break;
      }
    }

    this.controls?.update();
    this.renderer.render(this.scene, this.camera);
  }

  orbitCamera(): void {
    const radius = 5;
    this.angle += 0.01;
    this.camera.position.x = radius * Math.cos(this.angle);
    this.camera.position.z = radius * Math.sin(this.angle);
    this.camera.lookAt(0, 0, 0);
  }

  flyThroughCamera(): void {
    this.loopTime += this.flyThroughSpeed;
    const radius = 5;
    const offsetY = 2;
    this.camera.position.x = radius * Math.sin(this.loopTime);
    this.camera.position.y = offsetY * Math.sin(this.loopTime * 0.5);
    this.camera.position.z = radius * Math.cos(this.loopTime);
    this.camera.lookAt(0, 0, 0);
  }

  panCamera(): void {
    this.camera.position.x += 0.02 * this.panDirection;
    if (this.camera.position.x > 2 || this.camera.position.x < -2) {
      this.panDirection *= -1;
    }
  }

  zoomCamera(): void {
    this.camera.position.z += 0.05 * this.zoomDirection;
    if (this.camera.position.z < 2 || this.camera.position.z > 10) {
      this.zoomDirection *= -1;
    }
  }
}
