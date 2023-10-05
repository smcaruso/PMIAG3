import * as THREE from "three";
import { TextGeometry } from "three/examples/jsm/geometries/TextGeometry.js"
import {gsap} from "gsap/all";

export class LobbyEnvironment {

    constructor(app) {

        this.AppRef = app;

        const GlobalLight = new THREE.AmbientLight(
            new THREE.Color("rgb(255,235,235)"),
            0.5
        );
        
        const LobbyCubemap = app.Loaders.CubemapLoader.load([
            "./textures/lobby/cubemap/px.jpg",
            "./textures/lobby/cubemap/nx.jpg",
            "./textures/lobby/cubemap/py.jpg",
            "./textures/lobby/cubemap/ny.jpg",
            "./textures/lobby/cubemap/pz.jpg",
            "./textures/lobby/cubemap/nz.jpg"
        ]);
        
        this.LobbyMesh = new THREE.Object3D;
        this.LobbyMesh.name = "Lobby";
        this.LobbyMesh.rotateY(Math.PI);
        this.LobbyMesh.add(GlobalLight);
        
        const Materials = this.DefineMaterials(app.Loaders.TextureLoader, LobbyCubemap);

        app.Loaders.ModelLoader.load("./models/lobby.glb", ProcessModel.bind(this));

        function ProcessModel(model) {
            model.scene.children.forEach(ApplyMaterials.bind(this));
            function ApplyMaterials(child) {
                switch (child.name) {
                    case "EntryPortal":
                        child.material = Materials.EntryPortal;
                        break;

                    case "Ceiling":
                        child.material = Materials.FloorCeiling;
                        break;
                    
                    case "Columns":
                        child.material = Materials.LobbyWalls;
                        break;
                    
                    case "WallLogo":
                        child.material = Materials.Logo;
                        break;
                    
                    case "InnerGalleryWalls":
                        child.material = Materials.InnerGallery;
                        break;

                    case "Floor":
                        child.material = Materials.FloorCeiling;
                        break;

                    case "LobbyWalls":
                        child.material = Materials.LobbyWalls;
                        break;

                    case "VideoScreen":
                        child.material = Materials.OnViewScreen;
                        break;

                    default:
                        console.log(child.name)
                        break;
                }

                this.LobbyMesh.add(child.clone());
            }

        } // model import callback

        app.Loaders.threeFontLoader.load("./fonts/AgrandirBold.json", CreateEntryText.bind(this));
                
        app.scene.add(this.LobbyMesh);
        
        this.ScreenCursorPosition = new THREE.Vector2();

        const EnterButton = document.createElement("div");
        EnterButton.classList.add("enterbutton");
        EnterButton.innerText = "Enter Gallery";
        document.body.appendChild(EnterButton);

        // declare member variables for these functions
        // so the event listener can be removed later:

        this.OnPointerMove = this.PointerReaction.bind(this);
        this.OnPointerUp = this.Unload.bind(this);

        window.addEventListener("pointermove", this.OnPointerMove);
        window.addEventListener("pointerdown", this.OnPointerUp);
        EnterButton.addEventListener("pointerup", this.OnPointerUp);

        function CreateEntryText(font) {

            const geometry = new TextGeometry("Enter Gallery", {
                font: font,
                size: 0.75,
                height: 0.125,
                bevelEnabled: true,
		        bevelThickness: 0.01,
		        bevelSize: 0.025,
		        bevelOffset: 0,
		        bevelSegments: 1
            });

            const material = new THREE.MeshStandardMaterial({
                color: 0x4F17A8,
                envMap: LobbyCubemap,
                envMapIntensity: 2,
                metalness: 1,
                roughness: 0.25,
                opacity: 0,
                transparent: true
            });

            const text = new THREE.Mesh(geometry, material);
            text.position.set(0, 1.25, -12);
            text.name = "InnerGalleryWalls";
            
            this.EntryText = text;
            this.LobbyMesh.add(text);

        }

    }

    DefineMaterials(TextureLoader, cubemap) {

        const TexturePaths = {

            EntryPortalColor: "./textures/lobby/EntryPortalColor.jpg",
            EntryPortalRoughness: "./textures/lobby/EntryPortalRoughness.jpg",
            FloorCeilingColor: "./textures/lobby/FloorCeilingColor.jpg",
            FloorCeilingRoughness: "./textures/lobby/FloorCeilingRoughness.jpg",
            InnerGalleryColor: "./textures/lobby/InnerGalleryColor.jpg",
            InnerGalleryRoughness: "./textures/lobby/InnerGalleryRoughness.png",
            LobbyWallsColor: "./textures/lobby/LobbyWallsColor.jpg",
            LobbyWallsRoughness: "./textures/lobby/LobbyWallsRoughness.jpg",
            LogoColor: "./textures/lobby/LogoColor.jpg",
            OnViewScreen: "./textures/lobby/OnViewScreen.png"

        }

        this.Textures = {};
        this.Materials = {};

        Object.keys(TexturePaths).forEach(ProcessTextures.bind(this));

        function ProcessTextures (ObjectKey) {
            this.Textures[ObjectKey] = TextureLoader.load(TexturePaths[ObjectKey]);
            this.Textures[ObjectKey].flipY = false;
            this.Textures[ObjectKey].colorSpace = THREE.SRGBColorSpace;
        }

        this.Materials.EntryPortal = new THREE.MeshStandardMaterial({
            map: this.Textures.EntryPortalColor,
            roughnessMap: this.Textures.EntryPortalRoughness
        });

        this.Materials.FloorCeiling = new THREE.MeshStandardMaterial({
            map: this.Textures.FloorCeilingColor,
            roughnessMap: this.Textures.FloorCeilingRoughness,
        });

        this.Materials.InnerGallery = new THREE.MeshStandardMaterial({
            map: this.Textures.InnerGalleryColor,
            roughnessMap: this.Textures.InnerGalleryRoughness,
            emissive: 0x4F17A8,
            emissiveIntensity: 0
        });
        
        this.Materials.LobbyWalls = new THREE.MeshStandardMaterial({
            map: this.Textures.LobbyWallsColor,
            // roughnessMap: this.Textures.LobbyWallsRoughness,
        });

        this.Materials.Logo = new THREE.MeshStandardMaterial({
            // map: this.Textures.LogoColor
            color: 0x000000
        });
        
        this.Materials.OnViewScreen = new THREE.MeshStandardMaterial({
            map: this.Textures.OnViewScreen,
            emissiveMap: this.Textures.OnViewScreen,
            emissive: 0xffffff,
            emissiveIntensity: 0.5,
            roughness: 0.1
        });

        Object.keys(this.Materials).forEach(SetMaterialConstants.bind(this));

        function SetMaterialConstants(ObjectKey) {
            this.Materials[ObjectKey].envMap = cubemap;
            this.Materials[ObjectKey].envMapIntensity = 1.25;
        }

        return this.Materials;

    }

    PointerReaction(event) {
            
        // Camera reaction:

        let app = this.AppRef;
        
        if (gsap.isTweening(app.ViewportCamera.position) || gsap.isTweening(app.ViewportCamera.quaternion) ) return;
        
        this.ScreenCursorPosition.x = (event.clientX / window.innerWidth) * 2 - 1;
        this.ScreenCursorPosition.y = -(event.clientY / window.innerHeight) * 2 + 1;

        app.ViewportCamera.position.x = app.ViewportCamera.StaticPosition.x + (this.ScreenCursorPosition.x * 0.05);
        app.ViewportCamera.position.y = app.ViewportCamera.StaticPosition.y + (this.ScreenCursorPosition.y * 0.05);

        // Inner gallery hover:

        if (app.ViewportCamera.StaticPosition.x === -10) return;

        app.Raycaster.setFromCamera(this.ScreenCursorPosition, app.ViewportCamera);

        app.RayIntersections.length = 0;
        app.Raycaster.intersectObject(this.LobbyMesh, true, app.RayIntersections);

        if (app.RayIntersections.length === 0 || app.RayIntersections[0].object.name != "InnerGalleryWalls") {

            gsap.killTweensOf(this.Materials.InnerGallery);
            
            gsap.to(this.Materials.InnerGallery, {
                emissiveIntensity: 0,
                duration: 0.5
            });

            gsap.to(this.EntryText.material, {
                opacity: 0,
                duration: 0.5
            });

            if (this.EntryText.position.y > 1.25) {
                gsap.to(this.EntryText.position, {
                    y: 1.25,
                    duration: 0.5
                });
            }

            document.body.style.cursor = "default";

            return;
            
        }
        
        else if (app.RayIntersections.length > 0 || app.RayIntersections[0].object.name === "InnerGalleryWalls") {

            gsap.killTweensOf(this.Materials.InnerGallery);
            gsap.killTweensOf(this.EntryText);

            gsap.to(this.Materials.InnerGallery, {
                emissiveIntensity: 0.5,
                duration: 1
            });

            gsap.to(this.EntryText.material, {
                opacity: 1,
                duration: 0.5
            });
            
            gsap.to(this.EntryText.position, {
                y: 1.5,
                duration: 0.5
            });

            document.body.style.cursor = "pointer";

        }

    }

    Unload(event) {

        let force = false;
        if (event.target) {
            if (event.target.className === "enterbutton show") {
                force = true;
                event.target.remove();
            }
        }

        this.PointerReaction(event);

        let CorrectIntersection = false;

        if (this.AppRef.RayIntersections.length !== 0) {
            if (this.AppRef.RayIntersections[0].object.name === "InnerGalleryWalls") {
                CorrectIntersection = true;
            }
        }

        if (!force && !CorrectIntersection) {
            return;
        }
        
        window.removeEventListener("pointermove", this.OnPointerMove);
        window.removeEventListener("pointerdown", this.OnPointerUp);
        document.body.style.cursor = "default";

        gsap.to(this.AppRef.scene.fog, {
            density: 1,
            duration: 1,
            onComplete: ClearScene.bind(this)
        });

        function ClearScene() {

            this.AppRef.scene.children.forEach(
                function(each) {

                    if (each.name != "Lobby") return;
                    else if (each.name === "Lobby") {
                        // each.traverse(TraverseScene);
                        each.parent.remove(each);
                    }

                }

            );
            this.AppRef.Gallery.Load(); // add gallery to scene

        }

        Object.keys(this).forEach(DeleteAll.bind(this)); // clear the object

        function DeleteAll(ObjectKey) {
            if (ObjectKey === "AppRef") return;
            delete this[ObjectKey];
        }
       
    }

}