import * as THREE from "three";
import {gsap} from "gsap/all";
import {PointClickControls} from "./PointControls";
import {WallNavMesh, FloorNavMesh, ExhibitNavMesh} from "./NavMeshes.js"
// import * as ExhibitContent from "./ExhibitContent.js";
// import {PAITcarousel} from "./paitCarousel.js";

export class GalleryEnvironment {

    constructor(app) {

        this.app = app;
        // console.log("Gallery loaded in the background.");
        
        this.interiorCubeMap = app.Loaders.CubemapLoader.load([
            "./textures/gallery/bgcubemap/px.jpg",
            "./textures/gallery/bgcubemap/nx.jpg",
            "./textures/gallery/bgcubemap/py.jpg",
            "./textures/gallery/bgcubemap/ny.jpg",
            "./textures/gallery/bgcubemap/pz.jpg",
            "./textures/gallery/bgcubemap/nz.jpg"
        ]);

        this.GalleryMesh = new THREE.Group();
        this.NavBuffer = new THREE.Group();
        const Materials = this.DefineMaterials(app.Loaders.TextureLoader);

        app.Loaders.ModelLoader.load("./models/gallery.glb", ProcessModel.bind(this));

        function ProcessModel(model) {

            const navMaterial = new THREE.MeshBasicMaterial({
                side: THREE.DoubleSide,
                opacity: 0, 
                transparent: true
            });

            const frameMaterial = new THREE.MeshBasicMaterial({
                opacity: 0.5,
                transparent: true,
                reflectivity: 1
            });

            model.scene.children.forEach(ApplyMaterials.bind(this));

            function ApplyMaterials(child) {

                let newMesh;

                switch (child.name) {
                    case "floorNavMesh":
                        newMesh = new FloorNavMesh(child.geometry, navMaterial, this.app);
                        break;
                    case "frames":
                        newMesh = new WallNavMesh(child.geometry, frameMaterial, this.app);
                        break;
                    case "page14":
                        newMesh = new ExhibitNavMesh(
                            child.geometry,
                            Materials.paitIcon,
                            this.app,
                            child.name
                            )
                        break;
                    case "page2":
                        newMesh = addBadge(Materials.winnerBadgePoTY, this.app);
                        break;
                    case "page3":
                        newMesh = addBadge(Materials.winnerBadgeLMP, this.app);
                        break;
                    case "page7":
                        newMesh = addBadge(Materials.winnerBadgeSMP, this.app);
                        break;
                    case "page9":
                        newMesh = addBadge(Materials.winnerBadgePMO, this.app);
                        break;
                    default:
                        if (child.name.includes("page") && child.name !== "page14") {
                            newMesh = new ExhibitNavMesh(child.geometry, Materials[child.name], this.app, child.name);
                        } else {
                            newMesh = new WallNavMesh(child.geometry, Materials[child.name], this.app);
                        }
                        break;
                }

                function addBadge(badgeMaterial, app) {
                    badgeMaterial.map.flipY = true;
                    let badgeGeo = new THREE.PlaneGeometry(1.25, 0.375);
                    let winnerBadge = new ExhibitNavMesh(
                        badgeGeo,
                        badgeMaterial,
                        app,
                        child.name
                        );
                    winnerBadge.position.set(0.35, -0.65, 0);
                    winnerBadge.rotateY(Math.PI * 0.5);
                    let galleryImage = new ExhibitNavMesh(child.geometry, Materials[child.name], app, child.name);
                    galleryImage.add(winnerBadge);
                    return galleryImage;
                }

                newMesh.rotation.set(child.rotation.x, child.rotation.y, child.rotation.z);
                newMesh.position.set(child.position.x, child.position.y, child.position.z);
                this.NavBuffer.add(newMesh);

            }

        } // end ProcessModel

        // this.CreateExhibitNav();
        // this.CreateSubmissionsNav();

    }

    Load() {

        delete this.app.Lobby;

        // initial look vector is set in orbitcontrols.target

        this.app.ViewportCamera.position.set(-4.5, this.app.CameraHeight, 5.3);
        
        this.app.scene.add(this.GalleryMesh);
                
        gsap.to(this.app.scene.fog, {
            density: 0,
            duration: 1,
        });

        this.app.NavGroup.add(this.NavBuffer);

        this.Controls = new PointClickControls(this.app);

        const menu = document.querySelector(".menu");
        menu.classList.remove("hidden");

    }

    DefineMaterials(TextureLoader) {


        const TexturePaths = {

            ceilingBlue: "./textures/gallery/ceilingBlue.jpg",
            ceilingOrange: "./textures/gallery/ceilingOrange.jpg",
            ceilingPurple: "./textures/gallery/ceilingPurple.jpg",
            chapterGallery: "./textures/gallery/chapterGallery.jpg",
            floor: "./textures/gallery/floorColor.jpg",
            galleryTitleText: "./textures/gallery/galleryTitleText.jpg",
            paitIcon: "./textures/gallery/paitIcon.jpg",
            peopleGallery: "./textures/gallery/peopleGallery.jpg",
            projectGallery: "./textures/gallery/projectGallery.jpg",
            page1: "./images/galleryimages/1.jpg",
            page2: "./images/galleryimages/2.jpg",
            page3: "./images/galleryimages/3.jpg",
            page4: "./images/galleryimages/4.jpg",
            page5: "./images/galleryimages/5.jpg",
            page6: "./images/galleryimages/6.jpg",
            page7: "./images/galleryimages/7.jpg",
            page8: "./images/galleryimages/8.jpg",
            page9: "./images/galleryimages/9.jpg",
            page10: "./images/galleryimages/10.jpg",
            page11: "./images/galleryimages/11.jpg",
            page12: "./images/galleryimages/12.jpg",
            page13: "./images/galleryimages/13.jpg",
            page15: "./images/galleryimages/15.jpg",
            page16: "./images/galleryimages/16.jpg",
            page17: "./images/galleryimages/17.jpg",
            page18: "./images/galleryimages/18.jpg",
            page19: "./images/galleryimages/19.jpg",
            page20: "./images/galleryimages/20.jpg",
            page21: "./images/galleryimages/21.jpg",
            page22: "./images/galleryimages/22.jpg",
            page23: "./images/galleryimages/23.jpg",
            page24: "./images/galleryimages/24.jpg",
            page25: "./images/galleryimages/25.jpg",
            page26: "./images/galleryimages/26.jpg",
            page27: "./images/galleryimages/27.jpg",
            winnerBadgePoTY: "./textures/gallery/art/badge-poty.png",
            winnerBadgePMO: "./textures/gallery/art/badge-pmo.png",
            winnerBadgeLMP: "./textures/gallery/art/badge-lm.png",
            winnerBadgeSMP: "./textures/gallery/art/badge-sm.png"
        }

        this.Textures = {};
        this.Materials = {};

        Object.keys(TexturePaths).forEach(ProcessTextures.bind(this));

        function ProcessTextures (ObjectKey) {

            this.Textures[ObjectKey] = TextureLoader.load(TexturePaths[ObjectKey]);
            this.Textures[ObjectKey].flipY = false;
            this.Textures[ObjectKey].magFilter = THREE.LinearFilter;
            this.Textures[ObjectKey].colorSpace = THREE.SRGBColorSpace;

            this.Materials[ObjectKey]= new THREE.MeshBasicMaterial({
                map: this.Textures[ObjectKey],
                envMap: this.interiorCubeMap,
                reflectivity: 0.002,
                combine: THREE.MixOperation
            });

            if (ObjectKey === "galleryTitleText") {
                this.Materials[ObjectKey].reflectivity = 0.25;
                this.Materials[ObjectKey].combine = THREE.MixOperation;
                this.Materials[ObjectKey].blending = THREE.AdditiveBlending;
            }
        }

        return this.Materials;

    }

}