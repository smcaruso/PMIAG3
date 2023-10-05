import * as THREE from "three";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader.js";
import { FontLoader } from "three/examples/jsm/loaders/FontLoader.js"
import {gsap} from "gsap/all";
import { LobbyEnvironment } from "./LobbyEnvironment.js";
import { GalleryEnvironment } from "./GalleryEnvironment.js";

export class PMIAwardsApp {

    constructor() {

        this.CanvasElement = document.querySelector("canvas.webgl");
        window.addEventListener("resize", this.Resize.bind(this));
        
        this.IntroOverlay = document.querySelector(".intro");
        this.LoadingProgress = 0;
        const LoadingBarElement = document.querySelector(".loadingbar");
        const LoadingText = document.querySelector(".loadingtext");
        this.MenuBar = document.querySelector(".menu");

        this.clock = new THREE.Clock();
        this.CameraHeight = 1.25;

        this.InitThreeScene();
        this.Loaders = this.InitLoaders(LoadingBarElement, LoadingText);

        this.Raycaster = new THREE.Raycaster();
        this.RayIntersections = [];

        this.Lobby = new LobbyEnvironment(this);
        this.Gallery = new GalleryEnvironment(this);

    }

    Resize() {

        this.ViewportCamera.aspect = window.innerWidth / window.innerHeight;
        this.ViewportCamera.updateProjectionMatrix();
        this.renderer.setSize(window.innerWidth, window.innerHeight);

    }

    InitThreeScene() {

        let StartFOV = 75;
        let ScreenRatio = window.innerHeight / window.innerWidth;

        StartFOV += ScreenRatio * 100;
        StartFOV *= 0.54;

        if (StartFOV > 130) {
            StartFOV = 130;
        }

        this.scene = new THREE.Scene();
        this.NavGroup = new THREE.Group();

        this.ViewportCamera = new THREE.PerspectiveCamera(
            StartFOV,
            window.innerWidth / window.innerHeight,
            0.1,
            100
        );
        this.ViewportCamera.name = "Viewport Camera";
        this.ViewportCamera.position.set(-10, 5, -2);
        this.ViewportCamera.StaticPosition = new THREE.Vector3().copy(this.ViewportCamera.position);
        this.ViewportCamera.lookAt(20, 2, 25); // Starting Position and Direction

        this.scene.add(this.ViewportCamera, this.NavGroup);

        this.renderer = new THREE.WebGLRenderer({
            canvas: this.CanvasElement,
            antialias: true
        });

        this.renderer.setSize(window.innerWidth, window.innerHeight);
        this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
        this.renderer.xr.enabled = true;
        this.renderer.shadowMap.type = THREE.BasicShadowMap;
        this.renderer.setClearColor("rgb(255, 255, 255)");
        // this.renderer.outputEncoding = THREE.sRGBEncoding;
        this.renderer.outputColorSpace = THREE.SRGBColorSpace;
        this.renderer.setAnimationLoop(this.RenderLoop.bind(this));

        const fog = new THREE.FogExp2(0xffffff, 1);
        this.scene.fog = fog;        

    }

    InitLoaders(LoadingBarElement, LoadingText) {

        this.LoadingProgress = 0;

        const LoadingManager = new THREE.LoadingManager(
            LoadingComplete.bind(this),
            LoadingProgress,
            LoadingError
        );

        const TextureLoader = new THREE.TextureLoader(LoadingManager);
        const ModelLoader = new GLTFLoader(LoadingManager);
        const CubemapLoader = new THREE.CubeTextureLoader(LoadingManager);
        const threeFontLoader = new FontLoader(LoadingManager);

        function LoadingComplete() {
            
            gsap.to(this.scene.fog, {
                density: 0,
                duration: 3,
                onComplete: LoadingFinished
            });

            function LoadingFinished() {
                
                if (LoadingBarElement && LoadingText) {
                    LoadingBarElement.classList.add("loaded");
                    LoadingBarElement.parentElement.classList.add("loaded");
                    LoadingText.innerText = "Click or tap here to continue.";
                }

            }

        }

        function LoadingProgress(AssetPath, ItemsLoaded, ItemsTotal) {

            let progress = ItemsLoaded / ItemsTotal;
            // console.log(`Loading ${AssetPath}, progress ${progress}`)

            this.LoadingProgress = progress;

            if (LoadingBarElement) {
                LoadingBarElement.style.transform = `scaleX(${progress})`;
            }

        }

        function LoadingError(AssetPath) {

            console.error(`Error loading ${AssetPath}`);

        }

        return {LoadingManager, TextureLoader, ModelLoader, CubemapLoader, threeFontLoader};

    }

    RenderLoop() {
        
        this.renderer.render(this.scene, this.ViewportCamera);
        if (this.Gallery.Controls) {
            this.Gallery.Controls.OrbitControlSystem.update();
        }

    }

    Teleport(location) {

        let NewLocation = new THREE.Vector3;
        let NewLookDirection = new THREE.Vector3;

        NewLocation.y = this.CameraHeight;
        
        switch (location) {

            case "entry":

                NewLocation.x = 0;
                NewLocation.z = 0;

                NewLookDirection.x = 0;
                NewLookDirection.z = 1000;

                break;

            case "poty":

                this.scene.fog.color.set(0x4F17A8);

                NewLocation.x = -0.74;
                NewLocation.z = -7.25;

                NewLookDirection.x = 5.4;
                NewLookDirection.y = 0.94;
                NewLookDirection.z = 2.4;

                break;
            
            case "pmo":

                this.scene.fog.color.set(0x4F17A8);

                NewLocation.x = -2.17;
                NewLocation.z = 0.1;

                NewLookDirection.x = -6.5;
                NewLookDirection.y = 1.3;
                NewLookDirection.z = 0.33;

                break;

            case "fellow":

                this.scene.fog.color.set(0x4F17A8);

                NewLocation.x = -12.6;
                NewLocation.z = -17.1;

                NewLookDirection.x = -15.5;
                NewLookDirection.y = 1.2;
                NewLookDirection.z = -17.1;

                break;

            case "jenett":

                this.scene.fog.color.set(0x405BFE0);

                NewLocation.x = -11.3;
                NewLocation.z = -22.78;

                NewLookDirection.x = -15.5;
                NewLookDirection.y = 1.1;
                NewLookDirection.z = -23;

                break;

            case "rising":

                this.scene.fog.color.set(0x05BFE0);

                NewLocation.x = -13.15;
                NewLocation.z = -26.41;

                NewLookDirection.x = -7.6;
                NewLookDirection.y = 0.94;
                NewLookDirection.z = -21.58;

                break;

            case "academic":

                this.scene.fog.color.set(0x05BFE0);

                NewLocation.x = -13.34;
                NewLocation.z = 7.3;

                NewLookDirection.x = -7.6;
                NewLookDirection.y = 1.0;
                NewLookDirection.z = 10.1;

                break;

            case "chapter":

                this.scene.fog.color.set(0xFF610F);

                NewLocation.x = -10.33;
                NewLocation.z = 16.2;

                NewLookDirection.x = -15.5;
                NewLookDirection.y = 1.0;
                NewLookDirection.z = 15.0;

                break;

            

        }

        gsap.to(this.scene.fog, {
            density: 1,
            duration: 0.5,
            onComplete: PlaceCamera.bind(this)
        });
        
        this.MenuBar.classList.remove("open");
        this.MenuBar.children[0].src = "./images/menu.png";

        function PlaceCamera() {

            this.ViewportCamera.position.set(
                NewLocation.x,
                NewLocation.y,
                NewLocation.z
            );

            this.ViewportCamera.lookAt(NewLookDirection);
            this.Gallery.Controls.UpdateCameraOrbit();

            gsap.to(this.scene.fog, {
                density: 0,
                duration: 0.5,
            });

        }

    }

    MoveCam(location) {

        let NewLocation = new THREE.Vector3;
        let NewLookDirection = new THREE.Vector3;

        NewLocation.y = this.CameraHeight;
        NewLookDirection.y = 3;
        
        switch (location) {

            case "entry":

                NewLocation.x = 0;
                NewLocation.z = 0;

                NewLookDirection.x = 0;
                NewLookDirection.z = 1000;

                break;

            case "entrymobile":

                NewLocation.x = 3.5;
                NewLocation.z = 6;

                NewLookDirection.x = 0;
                NewLookDirection.z = 1000;

                break;
            
        }

        let StartRotation = new THREE.Euler().copy(this.ViewportCamera.rotation);
        this.ViewportCamera.lookAt(NewLookDirection);

        let EndRotation = new THREE.Euler().copy(this.ViewportCamera.rotation);
        this.ViewportCamera.rotation.copy(StartRotation);

        let EndQuaternion = new THREE.Quaternion();
        EndQuaternion.setFromEuler(EndRotation);

        gsap.to(this.ViewportCamera.quaternion, {
            x: EndQuaternion.x,
            y: EndQuaternion.y,
            z: EndQuaternion.z,
            w: EndQuaternion.w,
            duration: 3,
            ease: "power1.inOut"
        });

        gsap.to(
            this.ViewportCamera.position, {
                x: NewLocation.x,
                y: NewLocation.y,
                z: NewLocation.z,
                duration: 3,
                ease: "power1.inOut",
                onComplete: WriteNewStaticPosition.bind(this)
            }
        );

        function WriteNewStaticPosition() {

            this.ViewportCamera.StaticPosition.copy(NewLocation);
            const EnterButton = document.querySelector(".enterbutton");
            EnterButton.classList.add("show");

        }


    }

}