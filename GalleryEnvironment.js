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
                    case "paitIcon":
                        newMesh = new ExhibitNavMesh(
                            child.geometry,
                            Materials[child.name],
                            this.app,
                            // PAITcarousel
                            )
                        break;
                    default:
                        newMesh = new WallNavMesh(child.geometry, Materials[child.name], this.app);
                        break;
                }

                newMesh.rotation.set(child.rotation.x, child.rotation.y, child.rotation.z);
                newMesh.position.set(child.position.x, child.position.y, child.position.z);
                this.NavBuffer.add(newMesh);

            }

        } // end ProcessModel

        // this.CreateExhibitNav();
        this.CreateSubmissionsNav();

    }

    Load() {

        delete this.app.Lobby;

        // initial look vector is set in orbitcontrols.target

        this.app.ViewportCamera.position.set(-4.5, this.app.CameraHeight, 5.3);

        // const GlobalLight = new THREE.AmbientLight(
        //     new THREE.Color("rgb(255,235,235)"),
        //     1
        // );
        // this.GalleryMesh.add(GlobalLight);
        
        this.app.scene.add(this.GalleryMesh);
                
        gsap.to(this.app.scene.fog, {
            density: 0,
            duration: 1,
        });

        this.app.NavGroup.add(this.NavBuffer);

        this.Controls = new PointClickControls(this.app);

        const Menu = document.querySelector(".menu");
        Menu.classList.remove("hidden");

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
            projectGallery: "./textures/gallery/projectGallery.jpg"

        }

        this.Textures = {};
        this.Materials = {};

        Object.keys(TexturePaths).forEach(ProcessTextures.bind(this));

        function ProcessTextures (ObjectKey) {
            this.Textures[ObjectKey] = TextureLoader.load(TexturePaths[ObjectKey]);
            this.Textures[ObjectKey].flipY = false;
            this.Textures[ObjectKey].magFilter = THREE.LinearFilter;
            this.Textures[ObjectKey].encoding = THREE.sRGBEncoding;
            this.Textures[ObjectKey].colorSpace = THREE.SRGBColorSpace;

            this.Materials[ObjectKey]= new THREE.MeshBasicMaterial({
                map: this.Textures[ObjectKey],
                envMap: this.interiorCubeMap,
                reflectivity: 0.005,
                combine: THREE.AddOperation
            });

            if (ObjectKey === "galleryTitleText") {
                this.Materials[ObjectKey].reflectivity = 0.25;
                this.Materials[ObjectKey].combine = THREE.MixOperation;
            }
        }

        return this.Materials;

    }

    CreateExhibitNav() {

        const FrameGeometry = new THREE.PlaneGeometry(1, 1.8);

        // FrameGeometry.rotateZ(Math.PI);

        Object.keys(ExhibitContent).forEach(ProcessExhibits.bind(this));

        function ProcessExhibits(ObjectKey) {

            if (ExhibitContent[ObjectKey].type === "Chapter Awards") {
                this.CreateChapterNav(ExhibitContent[ObjectKey])
                return;
            }

            let ArtTexture = this.app.Loaders.TextureLoader.load(ExhibitContent[ObjectKey].texture);
            ArtTexture.flipY = true;
            ArtTexture.encoding = THREE.sRGBEncoding;

            let ExhibitMaterial = new THREE.MeshBasicMaterial({
                map: ArtTexture,
            });

            let NavMeshItem = new ExhibitNavMesh(
                FrameGeometry, // rectangle
                ExhibitMaterial, // unique artwork per, created above
                this.app, // reference to app for interaction
                ExhibitContent[ObjectKey] // content for interaction
            );

            let awardType = (ExhibitContent[ObjectKey].type === "Project Awards" || ExhibitContent[ObjectKey].type === "PMO Award");

            if (ExhibitContent[ObjectKey].status === "Winner" && awardType) {

                let badgeGeo = new THREE.PlaneGeometry(1.25, 0.375);
                let badgeTexturePath = new String();

                switch (ExhibitContent[ObjectKey].title) {
                    
                    case "Dubai Metro - Route 2020 Project":
                        badgeTexturePath = "./textures/gallery/art/badge-lm.png";
                        break;
                        
                    case "Medical Oxygen Plant (MOP)":
                        badgeTexturePath = "./textures/gallery/art/badge-sm.png";
                        break;
                            
                    case "Dubai Municipality Project Management Office":
                        badgeTexturePath = "./textures/gallery/art/badge-pmo.png";
                        break;
                                
                    case "CDL Rapid Screening Consortium":
                    default:
                        badgeTexturePath = "./textures/gallery/art/badge-poty.png";
                        break;
                }

                let badgeTexture = this.app.Loaders.TextureLoader.load(badgeTexturePath);
                badgeTexture.flipY = true;
                badgeTexture.encoding = THREE.sRGBEncoding;

                let alphaTexture = this.app.Loaders.TextureLoader.load("./textures/gallery/art/badge-alpha.png");
                alphaTexture.flipY = true;
                alphaTexture.encoding = THREE.sRGBEncoding;

                let badgeMaterial = new THREE.MeshBasicMaterial({
                    map: badgeTexture,
                    alphaMap: alphaTexture,
                    transparent: true
                });

                let winnerBadge = new ExhibitNavMesh(
                    badgeGeo,
                    badgeMaterial,
                    this.app,
                    ExhibitContent[ObjectKey]
                );
                winnerBadge.position.set(0, -0.65, 0.35);
                winnerBadge.rotateX(Math.PI * -0.0625);
                NavMeshItem.add(winnerBadge);
            };

            NavMeshItem.position.set(
                ExhibitContent[ObjectKey].position.x,
                ExhibitContent[ObjectKey].position.y,
                -(ExhibitContent[ObjectKey].position.z)
            );

            NavMeshItem.rotation.y = ExhibitContent[ObjectKey].rotation.y;

            NavMeshItem.name = ExhibitContent[ObjectKey].name;

            this.NavBuffer.add(NavMeshItem);

        }
                
        // this.app.scene.add(TestNavMesh)

    }

    CreateChapterNav(ChapterExhibitContent) {

        const FrameGeometry = new THREE.PlaneGeometry(1.9, 1.9);

        let ArtTexture = this.app.Loaders.TextureLoader.load(ChapterExhibitContent.texture);
        let AlphaTexture = this.app.Loaders.TextureLoader.load(ChapterExhibitContent.alpha);
        ArtTexture.flipY = true;
        ArtTexture.encoding = THREE.sRGBEncoding;
        // AlphaTexture.flipY = false;
        AlphaTexture.encoding = THREE.sRGBEncoding;

        let ExhibitMaterial = new THREE.MeshBasicMaterial({
            map: ArtTexture,
            alphaMap: AlphaTexture,
            transparent: true
        });

        let NavMeshItem = new ExhibitNavMesh(
            FrameGeometry, // geo imported from glTF
            ExhibitMaterial, // unique artwork per, created above
            this.app, // reference to app for interaction
            ChapterExhibitContent // content for interaction
        );

        NavMeshItem.position.set(
            ChapterExhibitContent.position.x,
            ChapterExhibitContent.position.y,
            -(ChapterExhibitContent.position.z)
        );

        NavMeshItem.rotation.y = ChapterExhibitContent.rotation.y;

        NavMeshItem.name = ChapterExhibitContent.name;

        this.NavBuffer.add(NavMeshItem);

    }

    CreateSubmissionsNav() {

        const subPageContent = {
            type: "nominations",
        }

        let navTexture = this.app.Loaders.TextureLoader.load("./textures/gallery/art/subs.png");
        navTexture.encoding = THREE.sRGBEncoding;
        const navGeometry = new THREE.PlaneGeometry(2.8, 1.57);
        const navMaterial = new THREE.MeshBasicMaterial({
            map: navTexture
        });

        let navMeshItem = new ExhibitNavMesh(
            navGeometry, navMaterial, this.app, subPageContent
        )

        navMeshItem.position.set(-11.5752, 1.75, 20.9447);
        navMeshItem.rotation.y = Math.PI;
        navMeshItem.name = "SubmissionsPageNav";

        this.NavBuffer.add(navMeshItem);

    }

}