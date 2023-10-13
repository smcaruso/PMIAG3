import * as THREE from "three";
import {gsap} from "gsap/all";
import {OrbitControls} from "three/examples/jsm/controls/OrbitControls.js";

// Really should refactor these into a constants class.

let ScreenCursorPosition = new THREE.Vector2;
let StartingCursorPosition = new THREE.Vector2;
let forward = new THREE.Vector3();
let InitialPosition = new THREE.Euler();
let PinchEventCache = new Array();
let PinchingState = false;
let PreviousDiff = -1;
let AppRef;

const ExhibitTooltip = document.querySelector(".titlehover");
const TooltipIcon = document.querySelector(".hovericon");
const TooltipTitle = document.querySelector(".exhibitname");
let CollisionArray = new Array();
const CRdirection = new THREE.Vector3(0, 0, -1);

class PointClickControls {

    constructor(app) {

        AppRef = app;
        
        this.PCRaycaster = app.Raycaster;
        this.Intersections = app.RayIntersections;

        this.CollisionRaycaster = new THREE.Raycaster();
        this.CollisionRaycaster.near = 0;
        this.CollisionRaycaster.far = 1.5;

        this.LookIndicator = new THREE.Object3D();
        this.LookIndicator.name = "Look Cursor Indicator";

        this.MoveIndicator = new THREE.Object3D();
        this.MoveIndicator.name = "Move Cursor Indicator";

        const LookMaterial = new THREE.MeshBasicMaterial({
            color: 0xFF610F,
            depthTest: false,
            // envMap: app.Gallery.SkyCubemap,
            reflectivity: 0.15,
        });

        const MoveMaterial = new THREE.MeshBasicMaterial({
            color: 0x05BFE0,
            depthTest: false,
            // envMap: app.Gallery.SkyCubemap,
            reflectivity: 0.15,
        });

        const ring = new THREE.Mesh(
            new THREE.TorusGeometry(0.35, 0.02, 8, 32), MoveMaterial
        );
        ring.rotateX(Math.PI * -0.5);
        this.MoveIndicator.add(ring);

        // app.Loaders.ModelLoader.load("./models/NavIcons.glb", MakeIndicators.bind(this));

        AppRef.scene.add(this.LookIndicator, this.MoveIndicator);
        app.CanvasElement.addEventListener("pointermove", this.OnPointerMove.bind(this));
        app.CanvasElement.addEventListener("pointerdown", this.OnPointerDown.bind(this));
        app.CanvasElement.addEventListener("pointerup", this.OnPointerUp.bind(this));
        // app.CanvasElement.addEventListener("wheel", this.ZoomInOut.bind(AppRef));

        function MakeIndicators(model) {
            model.scene.children.forEach(ParseModel.bind(this));
            function ParseModel(each) {
                switch (each.name) {
                    case "LookArrow":
                        let NewLook = new THREE.Mesh(each.geometry, LookMaterial);
                        NewLook.rotateY(Math.PI * -0.5);
                        // NewLook.translateY(0.25);
                        NewLook.renderOrder = 1;
                        NewLook.scale.set(1.5, 1.5, 1.5);
                        this.LookIndicator.add(NewLook);
                        break;
                    
                    case "MoveArrow":
                        let NewMove = new THREE.Mesh(each.geometry, MoveMaterial);
                        NewMove.rotateY(Math.PI * -0.5);
                        // NewMove.translateY(0.25);
                        NewMove.renderOrder = 1;
                        NewMove.scale.set(1.5, 1.5, 1.5);
                        this.MoveIndicator.add(NewMove);
                        break;
                    
                }
            }
        }

        this.OrbitControlSystem = new OrbitControls(AppRef.ViewportCamera, AppRef.CanvasElement);
        this.OrbitControlSystem.enableZoom = false;
        // this.OrbitControlSystem.enablePan = false;
        this.OrbitControlSystem.enableDamping = true;
        this.OrbitControlSystem.rotateSpeed = -0.35;
        this.OrbitControlSystem.target = new THREE.Vector3(-4.456, 1.25, 5.25);
          
        this.OrbitControlSystem.addEventListener('end', () => {
            this.UpdateCameraOrbit();
        });

    }

    UpdateCameraOrbit() {

        const forward = new THREE.Vector3;
        AppRef.ViewportCamera.getWorldDirection(forward);
        this.OrbitControlSystem.target.copy(AppRef.ViewportCamera.position).add(forward.normalize());

    }

    OnPointerMove(event) {

        if (!AppRef) return;

        // Pinch detection:

        for (let index = 0; index < PinchEventCache.length; index++) {
            if (event.pointerId == PinchEventCache[index].pointerId) {
                PinchEventCache[index] = event;
                break;
            }
        }

        if (PinchEventCache.length == 2) {
            let CurrentDiff = Math.abs(PinchEventCache[0].clientY - PinchEventCache[1].clientY);

            if (PreviousDiff > 0) {
                if (CurrentDiff > PreviousDiff) {
                    PinchZoom(-0.2);
                }
                if (CurrentDiff < PreviousDiff) {
                    PinchZoom(0.2);
                }
                PinchingState = true;
            }
            PreviousDiff = CurrentDiff;
            return;
        }

        function PinchZoom(direction) {

            if (   AppRef.ViewportCamera.position.x > 7
                || AppRef.ViewportCamera.position.x < -7.5
                || AppRef.ViewportCamera.position.z < -3.5
                || AppRef.ViewportCamera.position.z > 26) {

                    CRdirection.x = 0;
                    CRdirection.y = -.5;
                    CRdirection.z = 2;
                    
                    AppRef.ViewportCamera.localToWorld(CRdirection);
                    AppRef.Controls.CollisionRaycaster.set(AppRef.ViewportCamera.position, CRdirection.normalize());
                    AppRef.Controls.CollisionRaycaster.intersectObject(AppRef.scene, true, CollisionArray);
            
                    if (CollisionArray.length > 0) {
            
                    direction = Math.abs(direction);

                    }
            }

            forward.x = 0;
            forward.y = 0;
            forward.z = direction;
            AppRef.ViewportCamera.localToWorld(forward);
    
            gsap.to(AppRef.ViewportCamera.position, {
                x: forward.x,
                z: forward.z,
                duration: 0.25
            });

        }

        // Raycast:

        ScreenCursorPosition.x = (event.clientX / window.innerWidth) * 2 - 1;
        ScreenCursorPosition.y = -(event.clientY / window.innerHeight) * 2 + 1;

        this.PCRaycaster.setFromCamera(ScreenCursorPosition, AppRef.ViewportCamera);

        this.Intersections.length = 0;
        this.PCRaycaster.intersectObject(AppRef.NavGroup, true, this.Intersections);

        if (this.Intersections.length === 0) {
            this.MoveIndicator.visible = false;
            this.LookIndicator.visible = false;
            document.body.style.cursor = 'default';
            return;
        }

        switch(this.Intersections[0].object.constructor.name) {

            case "ExhibitNavMesh":
                this.MoveIndicator.visible = false;
                this.LookIndicator.visible = false;
                document.body.style.cursor = 'pointer';
                this.HoverPortrait(this.Intersections[0].object);
                break;
            
            case "WallNavMesh":
                // this.LookIndicator.visible = true;
                // this.MoveIndicator.visible = false;
                // this.LookIndicator.position.set(
                //     this.Intersections[0].point.x,
                //     this.Intersections[0].point.y,
                //     this.Intersections[0].point.z
                // );
                // this.LookIndicator.lookAt(AppRef.ViewportCamera.position.x, this.Intersections[0].point.y, AppRef.ViewportCamera.position.z);
                // document.body.style.cursor = 'none';
                this.ClearHoverStates();
                document.body.style.cursor = 'grab';
                break;

            case "FloorNavMesh":
                this.MoveIndicator.visible = true;
                this.LookIndicator.visible = false;
                this.MoveIndicator.position.set(
                    this.Intersections[0].point.x,
                    this.Intersections[0].point.y,
                    this.Intersections[0].point.z
                );
                this.MoveIndicator.lookAt(AppRef.ViewportCamera.position.x, this.Intersections[0].point.y, AppRef.ViewportCamera.position.z);
                document.body.style.cursor = 'none';
                this.ClearHoverStates();
                break;

            default:
                this.MoveIndicator.visible = false;
                this.LookIndicator.visible = false;
                document.body.style.cursor = 'default';
                this.ClearHoverStates();

        }

    }

    OnPointerDown(event) {
        
        this.OnPointerMove(event);
        PinchEventCache.push(event);
        StartingCursorPosition.x = event.clientX;
        StartingCursorPosition.y = event.clientY;
                
    }
    
    OnPointerUp(event) {

        
        PinchEventCache = [];
        PreviousDiff = -1;
        
        if (PinchingState === true && event.isPrimary) {
            PinchingState = false;
            return;
        }
        
        if (this.Intersections.length === 0) return;
        
        let downUpDiff = new THREE.Vector2(event.clientX, event.clientY).distanceTo(StartingCursorPosition);
        
        if (event.isPrimary && downUpDiff < 10) {
            this.Intersections[0].object.NavInteraction(this.Intersections[0].point);
            ExhibitTooltip.classList.add("hidden");
            TooltipIcon.classList.remove("project");
            TooltipIcon.classList.remove("indy");
            TooltipIcon.classList.remove("academic");
        }
        

    }

    ZoomInOut(event) {

        let factor = -2;

        if (event.deltaY > 0) {
            factor = 2;
        }

        CRdirection.x = 0;
        CRdirection.y = -.5;
        CRdirection.z = factor;
        
        this.ViewportCamera.localToWorld(CRdirection);
        this.Controls.CollisionRaycaster.set(this.ViewportCamera.position, CRdirection.normalize());
        this.Controls.CollisionRaycaster.intersectObject(this.scene, true, CollisionArray);

        if (CollisionArray.length > 0) {

                InitialPosition = this.ViewportCamera.position.clone();
                this.ViewportCamera.translateZ(factor * -0.5);
                let NewX = this.ViewportCamera.position.x;
                let NewZ = this.ViewportCamera.position.z;
                this.ViewportCamera.position.set(InitialPosition.x, InitialPosition.y, InitialPosition.z);

                gsap.to(this.ViewportCamera.position, {
                    x: NewX,
                    z: NewZ,
                    duration: 1
                });

            CollisionArray = [];
            return;
        }

        forward.x = 0;
        forward.y = 0;
        forward.z = event.deltaY * 0.005;
        this.ViewportCamera.localToWorld(forward);

        gsap.to(this.ViewportCamera.position, {
            x: forward.x,
            z: forward.z,
            duration: 0.25
        });

    }

    HoverPortrait(NavMesh) {
        
        if (NavMesh.scale.x > 1.0) return;

        gsap.to(NavMesh.scale, {
            x: 1.05,
            y: 1.05,
            z: 1.05,
            duration: 0.25
        });

        let status = "";
        let title = "";

        switch (NavMesh.index) {

            case "1":
                title = "About the PMI Awards";
                TooltipIcon.src = "./images/glyph01w.png";
                TooltipIcon.classList.add("project");
                FillToolText();
                break;

            case "2":
            case "3":
            case "4":
            case "5":
            case "6":
            case "7":
                status = "Finalist";
                title = "PMI Project of the Year Award";
                TooltipIcon.src = "./images/glyph04w.png";
                TooltipIcon.classList.add("project");
                FillToolText();
                break;

            case "8":
            case "9":
            case "10":
                status = "Finalist";
                title = "PMO of the Year Award";
                TooltipIcon.src = "./images/glyph02w.png";
                TooltipIcon.classList.add("project");
                FillToolText();
                break;

            case "11":
            case "12":
            case "13":
                status = "Recipient";
                title = "PMI Fellow Award";
                TooltipIcon.src = "./images/glyph06w.png";
                TooltipIcon.classList.add("people");
                FillToolText();
                break;
            
            case "14":
                    title = "Meet the 2023 Evaluators";
                    TooltipIcon.classList.add("people");
                    FillToolText();
                    break;

            case "15":
                status = "Winner";
                title = "PMI Eric Jenett Project Management Excellence Award";
                TooltipIcon.src = "./images/glyph04w.png";
                TooltipIcon.classList.add("people");
                FillToolText();
                break;

            case "16":
            case "17":
                status = "Finalist";
                title = "PMI Rising Leader Award";
                TooltipIcon.src = "./images/glyph03w.png";
                TooltipIcon.classList.add("people");
                FillToolText();
                break;
            
            case "18":
                title = "Chapter Leadership Impact Award";
                TooltipIcon.src = "./images/glyph05w.png";
                TooltipIcon.classList.add("academic");
                FillToolText();
                break;
            
            case "19":
            case "20":
            case "21":
                title = "Chapter Awards";
                TooltipIcon.src = "./images/glyph05w.png";
                TooltipIcon.classList.add("academic");
                FillToolText();
                break;
            
            case "22":
                title = "Kerzner Award";
                TooltipIcon.src = "./images/glyph06w.png";
                TooltipIcon.classList.add("academic");
                FillToolText();
                break;

            case "23":
            case "24":
            case "25":
            case "26":
            case "27":
                title = "Research & Academic Awards";
                TooltipIcon.src = "./images/glyph06w.png";
                TooltipIcon.classList.add("academic");
                FillToolText();
                break;

            default:
                TooltipIcon.src = "./images/glyph07.png";
                TooltipTitle.innerText = "2023 PMI Awards";
                break;

        }

        function FillToolText() {
            TooltipTitle.innerHTML = `
            <span class="status">${status}</span>${title}
            `;
        }

        ExhibitTooltip.classList.remove("hidden");

    }

    ClearHoverStates() {

        AppRef.NavGroup.traverse(ResetScale);
        ExhibitTooltip.classList.add("hidden");
        TooltipIcon.classList.remove("project");
        TooltipIcon.classList.remove("indy");
        TooltipIcon.classList.remove("academic");
        
        function ResetScale(item) {
            if (item.constructor.name !== "ExhibitNavMesh") return;
            
            gsap.to(item.scale, {
                x: 1,
                y: 1,
                z: 1,
                duration: 0.25
            });
        }

    }

}

export {PointClickControls}