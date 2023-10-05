import * as THREE from "three";
import {gsap} from "gsap/all";
// import ChapterTextMarkup from "./ChapterTextMarkup.js";

const RotationParameters = {
    StartRotation: new THREE.Quaternion(),
    EndQuaternion: new THREE.Quaternion(),
    SlerpResultQuaternion: new THREE.Quaternion(),
    SlerpFactor: 0
};

// let ExhibitFrontPosition = new THREE.Vector3();

class WallNavMesh extends THREE.Mesh {

    constructor(geometry, material, app) {

        super(geometry, material);
        this.app = app;

    }

    NavInteraction(point) {

        // Click-to-look interaction deprecated for 22. Replaced by custom implementation of OrbitControls.

        // RotationParameters.StartRotation.copy(this.app.ViewportCamera.quaternion);

        // this.app.ViewportCamera.lookAt(point);
        // RotationParameters.EndQuaternion.copy(this.app.ViewportCamera.quaternion);

        // gsap.fromTo(RotationParameters, {SlerpFactor: 0},
        //     {
        //         SlerpFactor: 1,
        //         duration: 0.5,
        //         onUpdate: SlerpRotation.bind(this),
        //         ease: "power1.inOut"
        //     }    
        // );
        
        // function SlerpRotation() {
        //     RotationParameters.SlerpResultQuaternion.slerpQuaternions(
        //         RotationParameters.StartRotation,
        //         RotationParameters.EndQuaternion,
        //         RotationParameters.SlerpFactor
        //     );

        //     this.app.ViewportCamera.setRotationFromQuaternion(RotationParameters.SlerpResultQuaternion);

        // }

    }

}

class FloorNavMesh extends THREE.Mesh {

    constructor(geometry, material, app) {

        super(geometry, material);
        this.app = app;

    }

    NavInteraction(point) {

        gsap.to(this.app.ViewportCamera.position, {
            x: point.x,
            y: this.app.CameraHeight,
            z: point.z,
            duration: 1,
            onUpdate: () => { this.app.Gallery.Controls.UpdateCameraOrbit() },
            // onComplete: () => { console.log(this.app.ViewportCamera) }
        });
        
    }

}

class ExhibitNavMesh extends THREE.Mesh {

    constructor(geometry, material, app, special) {

        super(geometry, material);
        this.app = app;
        this.ExhibitContent = special;

    }

    NavInteraction(point) {

        if (this.ExhibitContent.award && !this.ExhibitContent.carousel){
            this.CreateExhibitInfoPanel();
        }
        else if (this.ExhibitContent.type === "nominations") {
            this.CreateNominationsPanel();
        }
        else if (this.ExhibitContent.carousel === true && this.ExhibitContent.type !== "PMI Awards") {
            this.CreateAcademicInfoPanel();
        }
        else if (this.ExhibitContent.carousel === true && this.ExhibitContent.type === "PMI Awards") {
            this.CreatePAIT();
        }

        RotationParameters.StartRotation.copy(this.app.ViewportCamera.quaternion);

        this.app.ViewportCamera.lookAt(point);
        RotationParameters.EndQuaternion.copy(this.app.ViewportCamera.quaternion);

        gsap.fromTo(RotationParameters, {SlerpFactor: 0},
            {
                SlerpFactor: 1,
                duration: 0.5,
                onUpdate: SlerpRotation.bind(this),
                // onComplete: MoveToExhibit.bind(this),
                ease: "power1.inOut"
            }    
        );

        
        function SlerpRotation() {
            RotationParameters.SlerpResultQuaternion.slerpQuaternions(
                RotationParameters.StartRotation,
                RotationParameters.EndQuaternion,
                RotationParameters.SlerpFactor
            );

            this.app.ViewportCamera.setRotationFromQuaternion(RotationParameters.SlerpResultQuaternion);
            this.app.Gallery.Controls.UpdateCameraOrbit();

        }

    }

    CreateExhibitInfoPanel() {

        let type = "project";
        // if (this.ExhibitContent.type === "Chapter Awards") { type = "indy"}
        if (this.ExhibitContent.type === "Academic & Research Awards") { type = "academic"}

        const ContainerDiv = document.createElement("div");
        ContainerDiv.classList.add("ExhibitInfopanelContainer");

        // Title Bar

        const TitleBar = document.createElement("div")
        TitleBar.classList.add("titlebar");

        const TopSpacer = document.createElement("div");
        TopSpacer.classList.add("topspacer");

        const ProjectType = document.createElement("div");
        ProjectType.classList.add("type", type);
        ProjectType.innerText = this.ExhibitContent.type;

        const AwardTitle = document.createElement("div");
        AwardTitle.classList.add("award");
        AwardTitle.innerText = this.ExhibitContent.award;

        const OpenCloseButton = document.createElement("div");
        OpenCloseButton.classList.add("openclosebutton");
        const OpenCloseLabel = document.createElement("span");
        OpenCloseLabel.innerText = "Scroll";

        const OpenCloseIcon = new Image();
        OpenCloseIcon.src = "./images/open.png"
        OpenCloseButton.append(OpenCloseLabel, OpenCloseIcon);

        TitleBar.append(ProjectType, AwardTitle, OpenCloseButton);

        ContainerDiv.append(TopSpacer, TitleBar);

        // Exhibit Body

        const ExhibitPage = document.createElement("div");
        ExhibitPage.classList.add("exhibitpage", type);

        const LeftColumn = document.createElement("div");
        LeftColumn.classList.add("leftcolumn");

        const LeftStuff = document.createElement("div");
        LeftStuff.classList.add("leftstuff");

        const Status = document.createElement("div");
        Status.classList.add("status");
        Status.innerText = this.ExhibitContent.status;

        if (this.ExhibitContent.sub) {
            Status.innerHTML = `${this.ExhibitContent.status}<span class="subtitle">${this.ExhibitContent.sub}</span>`;
        }

        const AwardTitleSidebar = document.createElement("div");
        AwardTitleSidebar.classList.add("awardtitlesidebar");
        AwardTitleSidebar.innerText = this.ExhibitContent.award;

        const LinksList = document.createElement("ul");
        LinksList.classList.add("linkslist");

        for (let index = 0; index < this.ExhibitContent.linktitles.length; index++) {

            let LinkItem = document.createElement("li");
                LinkItem.classList.add("linkitem");
                LinkItem.innerHTML = `
                    <a href = "${this.ExhibitContent.linkURLs[index]}" target="_blank">
                    ${this.ExhibitContent.linktitles[index]} </a>
                `
            LinksList.appendChild(LinkItem);

        }

        const AudioGuide = document.createElement("div");
        AudioGuide.classList.add("audioguide");

        const AudioGuideTextBox = document.createElement("ul");
        AudioGuideTextBox.classList.add("audiotextbox");

        const AudioGuideHeadline = document.createElement("li");
        AudioGuideHeadline.classList.add("audioheadline");
        AudioGuideHeadline.innerText = "Play Audio Guide";

        const AudioGuideTimestamp = document.createElement("li");
        AudioGuideTimestamp.classList.add("audiotimestamp");

        let total = "0:00";
        let AudioUpdater;

        AudioGuideTimestamp.innerText = "Paused 0:00 / ${total}"

        AudioGuideTextBox.append(AudioGuideHeadline, AudioGuideTimestamp);
        AudioGuide.appendChild(AudioGuideTextBox);

        const AudioFile = new Audio(this.ExhibitContent.voiceover);
        AudioFile.setAttribute("preload","metadata");
        AudioGuide.appendChild(AudioFile);

        const AboutThisAward = document.createElement("div");
        AboutThisAward.classList.add("aboutthisaward");
        AboutThisAward.innerHTML = `
        <span class="aboutheading">About This Award</span>
        <p>${this.ExhibitContent.about}</p>
        `;
        
        AudioFile.addEventListener("loadedmetadata",
            function(event) {
                let minutes = Math.floor(AudioFile.duration / 60);
                let seconds = Math.ceil(AudioFile.duration - minutes * 60);
                let zero = "0";
                if (seconds >= 10) { zero = "" };
                total = `${minutes}:${zero}${seconds}`;
                AudioGuideTimestamp.innerText = `Paused 0:00 / ${total}`;
            }
        );

        LeftStuff.append(Status, AwardTitleSidebar, LinksList, AudioGuide, AboutThisAward);

        if (this.ExhibitContent.team) {

            const TeamList = document.createElement("div");
            TeamList.classList.add("teamlist");
            TeamList.innerText = "Team";

            const TeamMembers = document.createElement("ul");
            
            for (let index = 0; index < this.ExhibitContent.team.length; index++) {

                let MemberItem = document.createElement("li");
                MemberItem.innerText = this.ExhibitContent.team[index];
                TeamMembers.appendChild(MemberItem);

            }

            TeamList.appendChild(TeamMembers);
            LeftStuff.appendChild(TeamList);

        }

        LeftColumn.appendChild(LeftStuff);

        const RightColumn = document.createElement("div");
        RightColumn.classList.add("rightcolumn");

        const ExhibitTitle = document.createElement("div");
        ExhibitTitle.classList.add("title");
        ExhibitTitle.innerText = this.ExhibitContent.title;
        
        const CompanyName = document.createElement("div");

        if (this.ExhibitContent.company) {
            
            CompanyName.classList.add("company");
            CompanyName.innerText = this.ExhibitContent.company;
            
        }  
        
        const LeadVideo = document.createElement("div");

        if (this.ExhibitContent.video) {
            LeadVideo.innerHTML = `
            <video controls playsinline poster="./images/videoposter.png">
                <source src = "${this.ExhibitContent.video}" type = "video/mp4" width="100%" height="100%">
                <p>Your browser doesn't support HTML5 video. Here is a <a href=${this.ExhibitContent.video}>link to the video</a> instead.</p>
            </video>
                `;
        } else if (this.ExhibitContent.leadimage) {
            LeadVideo.innerHTML = `
            <img src="${this.ExhibitContent.leadimage}">
            `;
        }
        
        
        LeadVideo.classList.add("leadvideo");
        const MainText = document.createElement("div");
        MainText.classList.add("maintext");

        for (let index = 0; index < this.ExhibitContent.maintext.length; index++) {

            let paragraph = document.createElement("p");
            paragraph.innerText = this.ExhibitContent.maintext[index];
            MainText.appendChild(paragraph);

        }

        const PhotoGallery = document.createElement("div");
        PhotoGallery.classList.add("photogallery");

        for (let index = 0; index < this.ExhibitContent.photoURLs.length; index++) {

            // <div class = "photo" style="background-image: url(${this.ExhibitContent.photoURLs[index]})">
            // </div>

            let AddPhoto =  document.createElement("div");
            AddPhoto.classList.add("photoitem");
            AddPhoto.innerHTML = `
            <div class = "photoitem">
                <img class = "photo" src="${this.ExhibitContent.photoURLs[index]}">
                <div class = "photonumber">
                    ${index+1} of ${this.ExhibitContent.photoURLs.length}
                </div>
                <p class = "caption">
                    ${this.ExhibitContent.photocaptions[index]}
                </p>
            </div>
            `

            PhotoGallery.appendChild(AddPhoto)

        }

        if (!this.ExhibitContent.video && !this.ExhibitContent.leadimage) {
            RightColumn.append(ExhibitTitle, CompanyName, MainText, PhotoGallery);
        } else {
            RightColumn.append(ExhibitTitle, CompanyName, LeadVideo, MainText, PhotoGallery);
        }
        
        ExhibitPage.append(LeftColumn, RightColumn);
        ContainerDiv.appendChild(ExhibitPage);

        document.body.appendChild(ContainerDiv);
        ResizeVideo();
        
        window.addEventListener('resize', ResizeVideo);
        TopSpacer.addEventListener("pointerup", Exit);
        OpenCloseButton.addEventListener("pointerup", ScrollToTop);
        AwardTitle.addEventListener("pointerup", ScrollToTop);
        ContainerDiv.addEventListener("scroll", ScrollDown);
        AudioGuide.addEventListener("pointerdown", PlayPauseAudio);

        ScrollToTop();

        function Exit(event) {

            ContainerDiv.scroll({
                top: 0,
                behavior: "smooth"
            });
            ContainerDiv.remove();
            
        }

        function ScrollToTop(event) {

            let top = window.innerHeight;

            if (window.innerWidth < 420) {
                top = 0;
            }

            ContainerDiv.scroll({
                top: top,
                behavior: "smooth"
            });

            OpenCloseButton.removeEventListener("pointerup", ScrollToTop);
            OpenCloseLabel.innerText = "Close";
            OpenCloseIcon.src = "./images/close.png";
            OpenCloseButton.addEventListener("pointerup", Exit);
        }

        function ScrollDown(event) {

            let ScrollProgress = ContainerDiv.scrollTop / window.innerHeight;

            if (window.innerWidth > 420) {
                if (ScrollProgress >= 1) {
                    ExhibitPage.style.opacity = 1;
                    ProjectType.style.paddingLeft = "100px";
                } else {
                    ExhibitPage.style.opacity = ScrollProgress;
                    ProjectType.style.paddingLeft = `${150 - (50 * ScrollProgress)}px`;
                }
            }

            if (ContainerDiv.scrollTop >= window.innerHeight) {
                OpenCloseButton.removeEventListener("pointerup", ScrollToTop);
                OpenCloseLabel.innerText = "Close";
                OpenCloseIcon.src = "./images/close.png";
                OpenCloseButton.addEventListener("pointerup", Exit);
            } else if (ContainerDiv.scrollTop < window.innerHeight) {
                OpenCloseButton.removeEventListener("pointerup", Exit);
                OpenCloseLabel.innerText = "Scroll";
                OpenCloseIcon.src = "./images/open.png"
                OpenCloseButton.addEventListener("pointerup", ScrollToTop);
            }
        }

        function ResizeVideo(event) {
            let NewHeight = LeadVideo.clientWidth * 0.5625;
            LeadVideo.style.height = `${NewHeight}px`;
        }

        function PlayPauseAudio(event) {
            let current;
            UpdateTime();
            if (!AudioFile.played || AudioFile.paused) {
                AudioFile.play();
                AudioGuideHeadline.innerText = "Pause Audio Guide";
                AudioGuideTimestamp.innerText = `Playing ${current} / ${total}`;
                AudioUpdater = setInterval(UpdateTime, 1000);
            } else {
                AudioFile.pause();
                clearInterval(AudioUpdater);
                AudioGuideTimestamp.innerText = `Paused ${current} / ${total}`;
                AudioGuideHeadline.innerText = "Play Audio Guide";
            }

            function UpdateTime() {
                let minutes = Math.floor(AudioFile.currentTime / 60);
                let seconds = Math.ceil(AudioFile.currentTime - minutes * 60);
                let zero = "0";
                if (seconds >= 10) { zero = "" };
                current = `${minutes}:${zero}${seconds}`;
                AudioGuideTimestamp.innerText = `Playing ${current} / ${total}`;
            }

        }


    }

    CreateAcademicInfoPanel() {

        if (!this.ExhibitContent.carousel) {
            console.error("Wrong data, need Carousel.")
            return;
        };

        const type = "indy";
        let AwardIndex = 0;

        const ContainerDiv = document.createElement("div");
        ContainerDiv.classList.add("ExhibitInfopanelContainer");

        // Title Bar

        const TitleBar = document.createElement("div")
        TitleBar.classList.add("titlebar");

        const TopSpacer = document.createElement("div");
        TopSpacer.classList.add("topspacer");

        const ProjectType = document.createElement("div");
        ProjectType.classList.add("type", type);
        ProjectType.innerText = this.ExhibitContent.type;

        const AwardTitlebar = document.createElement("div");
        AwardTitlebar.classList.add("award");
        AwardTitlebar.innerText = this.ExhibitContent.award;

        const OpenCloseButton = document.createElement("div");
        OpenCloseButton.classList.add("openclosebutton");
        const OpenCloseLabel = document.createElement("span");
        OpenCloseLabel.innerText = "Scroll";

        const OpenCloseIcon = new Image();
        OpenCloseIcon.src = "./images/open.png"
        OpenCloseButton.append(OpenCloseLabel, OpenCloseIcon);

        TitleBar.append(ProjectType, AwardTitlebar, OpenCloseButton);

        ContainerDiv.append(TopSpacer, TitleBar);

        // Exhibit Body

        const ExhibitPage = document.createElement("div");
        ExhibitPage.classList.add("exhibitpage", type);

        const LeftColumn = document.createElement("div");
        LeftColumn.classList.add("leftcolumn");

        const LeftStuff = document.createElement("div");
        LeftStuff.classList.add("leftstuff");

        let AwardName = document.createElement("div");
        AwardName.classList.add("academicaward");
        AwardName.innerText = this.ExhibitContent.awards[AwardIndex].award;

        let winStatus = document.createElement("p");
        winStatus.classList.add("status");
        winStatus.innerText = this.ExhibitContent.awards[AwardIndex].about;

        let LinksList = document.createElement("ul");
        LinksList.classList.add("linkslist");

        for (let index = 0; index < this.ExhibitContent.awards[AwardIndex].linktitles.length; index++) {

            let LinkItem = document.createElement("li");
                LinkItem.classList.add("linkitem");
                LinkItem.innerHTML = `
                    <a href = "${this.ExhibitContent.awards[AwardIndex].linkURLs[index]}" target="_blank">
                    ${this.ExhibitContent.awards[AwardIndex].linktitles[index]} </a>
                `
            LinksList.appendChild(LinkItem);

        }

        const AudioGuide = document.createElement("div");

        AudioGuide.classList.add("audioguide");
        
        const AudioGuideTextBox = document.createElement("ul");
        AudioGuideTextBox.classList.add("audiotextbox");

        const AudioGuideHeadline = document.createElement("li");
        AudioGuideHeadline.classList.add("audioheadline");
        AudioGuideHeadline.innerText = "Play Audio Guide";

        const AudioGuideTimestamp = document.createElement("li");
        AudioGuideTimestamp.classList.add("audiotimestamp");

        let total = "0:00";
        let AudioUpdater;

        AudioGuideTimestamp.innerText = 'Paused 0:00 / ${total}';

        AudioGuideTextBox.append(AudioGuideHeadline, AudioGuideTimestamp);
        AudioGuide.appendChild(AudioGuideTextBox);

        const AudioFile = new Audio(this.ExhibitContent.voiceover);
        AudioFile.setAttribute("preload","metadata");
        AudioGuide.appendChild(AudioFile);
        
        AudioFile.addEventListener("loadedmetadata",
            function(event) {
                let minutes = Math.floor(AudioFile.duration / 60);
                let seconds = Math.ceil(AudioFile.duration - minutes * 60);
                let zero = "0";
                if (seconds >= 10) { zero = "" };
                total = `${minutes}:${zero}${seconds}`;
                AudioGuideTimestamp.innerText = `Paused 0:00 / ${total}`;
            }
        );

        const AboutThisAward = document.createElement("div");
        AboutThisAward.classList.add("aboutthisaward");
        AboutThisAward.innerHTML = `
        <span class="aboutheading">About Chapter Awards</span>
        <p>${this.ExhibitContent.about}</p>
        `;

        let NextButton = document.createElement("div");
        NextButton.classList.add("aanextbutton");
        NextButton.innerHTML = `Next Finalist (${AwardIndex + 1} of ${this.ExhibitContent.awards.length}) <img src="./images/leftarrow.png">`;

        LeftStuff.append(winStatus, AwardName, LinksList, AudioGuide, NextButton, AboutThisAward);
        LeftColumn.appendChild(LeftStuff);

        // Award content

        const RightColumn = document.createElement("div");
        RightColumn.classList.add("rightcolumn");

        let ExhibitTitle = document.createElement("div");
        ExhibitTitle.classList.add("title");
        ExhibitTitle.innerText = this.ExhibitContent.awards[AwardIndex].title;

        const MainText = document.createElement("div");
        MainText.classList.add("maintext");

        // let paragraph = document.createElement("p");
        MainText.innerHTML = ChapterTextMarkup[this.ExhibitContent.awards[AwardIndex].bio];
        // MainText.appendChild(paragraph);

        // const PhotoGallery = document.createElement("div");
        // PhotoGallery.classList.add("photogallery");

        // const AddPhoto =  document.createElement("div");
        // let HeadshotImg = new Image();
        // HeadshotImg.classList.add("photo");
        // HeadshotImg.src = this.ExhibitContent.awards[AwardIndex].headshot;

        // AddPhoto.classList.add("photoitem");
        // AddPhoto.appendChild(HeadshotImg);
        // PhotoGallery.appendChild(AddPhoto);

        RightColumn.append(ExhibitTitle, MainText);
        
        ExhibitPage.append(LeftColumn, RightColumn);
        ContainerDiv.appendChild(ExhibitPage);

        document.body.appendChild(ContainerDiv);
        
        TopSpacer.addEventListener("pointerup", Exit);
        OpenCloseButton.addEventListener("pointerup", ScrollToTop);
        AwardTitlebar.addEventListener("pointerup", ScrollToTop);
        ContainerDiv.addEventListener("scroll", ScrollDown);
        NextButton.addEventListener("pointerup", RotateWinners.bind(this));
        AudioGuide.addEventListener("pointerdown", PlayPauseAudio);

        // setTimeout(() => {
        //     console.log("ok")
        // }, 500)

        function Exit(event) {

            ContainerDiv.scroll({
                top: 0,
                behavior: "smooth"
            });
            ContainerDiv.remove();
            
        }

        function ScrollToTop(event = null) {

            let top = window.innerHeight;

            if (window.innerWidth < 420) {
                top = 0;
            }

            ContainerDiv.scroll({
                top: top,
                behavior: "smooth"
            });

            OpenCloseButton.removeEventListener("pointerup", ScrollToTop);
            OpenCloseLabel.innerText = "Close";
            OpenCloseIcon.src = "./images/close.png"
            OpenCloseButton.addEventListener("pointerup", Exit);
        }

        function ScrollDown(event) {

            let ScrollProgress = ContainerDiv.scrollTop / window.innerHeight;

            if (window.innerWidth > 420) {
                if (ScrollProgress >= 1) {
                    ExhibitPage.style.opacity = 1;
                    ProjectType.style.paddingLeft = "100px";
                } else {
                    ExhibitPage.style.opacity = ScrollProgress;
                    ProjectType.style.paddingLeft = `${150 - (50 * ScrollProgress)}px`;
                }

            }

            if (ContainerDiv.scrollTop >= window.innerHeight) {
                OpenCloseButton.removeEventListener("pointerup", ScrollToTop);
                OpenCloseLabel.innerText = "Close";
                OpenCloseIcon.src = "./images/close.png"
                OpenCloseButton.addEventListener("pointerup", Exit);
            } else if (ContainerDiv.scrollTop < window.innerHeight) {
                OpenCloseButton.removeEventListener("pointerup", Exit);
                OpenCloseLabel.innerText = "Scroll";
                OpenCloseIcon.src = "./images/open.png"
                OpenCloseButton.addEventListener("pointerup", ScrollToTop);
            }
        }

        function PlayPauseAudio(event) {
            let current;
            UpdateTime();
            if (!AudioFile.played || AudioFile.paused) {
                AudioFile.play();
                AudioGuideHeadline.innerText = "Pause Audio Guide";
                AudioGuideTimestamp.innerText = `Playing ${current} / ${total}`;
                AudioUpdater = setInterval(UpdateTime, 1000);
            } else {
                AudioFile.pause();
                clearInterval(AudioUpdater);
                AudioGuideTimestamp.innerText = `Paused ${current} / ${total}`;
                AudioGuideHeadline.innerText = "Play Audio Guide";
            }

            function UpdateTime() {
                let minutes = Math.floor(AudioFile.currentTime / 60);
                let seconds = Math.ceil(AudioFile.currentTime - minutes * 60);
                let zero = "0";
                if (seconds >= 10) { zero = "" };
                current = `${minutes}:${zero}${seconds}`;
                AudioGuideTimestamp.innerText = `Playing ${current} / ${total}`;
            }
        }

        function RotateWinners(event) {

            AwardIndex++;
            if (AwardIndex > (this.ExhibitContent.awards.length - 1)) {
                AwardIndex = 0;
            }

            AwardName.innerText = this.ExhibitContent.awards[AwardIndex].award;
            winStatus.innerText = this.ExhibitContent.awards[AwardIndex].about;
            NextButton.innerHTML = `Next Finalist (${AwardIndex + 1} of ${this.ExhibitContent.awards.length}) <img src="./images/leftarrow.png">`;

            ExhibitTitle.innerText = this.ExhibitContent.awards[AwardIndex].title;
            MainText.innerHTML = ChapterTextMarkup[this.ExhibitContent.awards[AwardIndex].bio];
            // paragraph.innerText = this.ExhibitContent.awards[AwardIndex].bio;
            // HeadshotImg.src = this.ExhibitContent.awards[AwardIndex].headshot;

            LinksList.innerHTML = "";
            
            for (let index = 0; index < this.ExhibitContent.awards[AwardIndex].linktitles.length; index++) {

                let LinkItem = document.createElement("li");
                    LinkItem.classList.add("linkitem");
                    LinkItem.innerHTML = `
                        <a href = "${this.ExhibitContent.awards[AwardIndex].linkURLs[index]}" target="_blank">
                        ${this.ExhibitContent.awards[AwardIndex].linktitles[index]} </a>
                    `
                LinksList.appendChild(LinkItem);
    
            }

            
        }

    }

    CreatePAIT() {

        if (!this.ExhibitContent.carousel) {
            console.error("Wrong data, need Carousel.")
            return;
        };

        const type = "indy";
        let AwardIndex = 0;

        const ContainerDiv = document.createElement("div");
        ContainerDiv.classList.add("ExhibitInfopanelContainer");

        // Title Bar

        const TitleBar = document.createElement("div")
        TitleBar.classList.add("titlebar");

        const TopSpacer = document.createElement("div");
        TopSpacer.classList.add("topspacer");

        const ProjectType = document.createElement("div");
        ProjectType.classList.add("type", type);
        ProjectType.innerText = this.ExhibitContent.type;

        const AwardTitlebar = document.createElement("div");
        AwardTitlebar.classList.add("award");
        AwardTitlebar.innerText = this.ExhibitContent.title;

        const OpenCloseButton = document.createElement("div");
        OpenCloseButton.classList.add("openclosebutton");
        const OpenCloseLabel = document.createElement("span");
        OpenCloseLabel.innerText = "Scroll";

        const OpenCloseIcon = new Image();
        OpenCloseIcon.src = "./images/open.png"
        OpenCloseButton.append(OpenCloseLabel, OpenCloseIcon);

        TitleBar.append(ProjectType, AwardTitlebar, OpenCloseButton);

        ContainerDiv.append(TopSpacer, TitleBar);

        // Exhibit Body

        const ExhibitPage = document.createElement("div");
        ExhibitPage.classList.add("exhibitpage", type);

        const LeftColumn = document.createElement("div");
        LeftColumn.classList.add("leftcolumn");

        const LeftStuff = document.createElement("div");
        LeftStuff.classList.add("leftstuff");

        let leftTitle = document.createElement("div");
        leftTitle.classList.add("academicaward");
        leftTitle.innerText = this.ExhibitContent.awards[AwardIndex].title;

        let aboutText = document.createElement("p");
        aboutText.classList.add("aboutacademicawards");
        aboutText.innerText = this.ExhibitContent.awards[AwardIndex].about;

        let NextButton = document.createElement("div");
        NextButton.classList.add("aanextbutton");
        NextButton.innerHTML = `Next (${AwardIndex + 1} of ${this.ExhibitContent.awards.length}) <img src="./images/leftarrow.png">`;

        LeftStuff.append(leftTitle, aboutText, NextButton);
        LeftColumn.appendChild(LeftStuff);

       // Award content

       const RightColumn = document.createElement("div");
       RightColumn.classList.add("rightcolumn");

       let ExhibitTitle = document.createElement("div");
       ExhibitTitle.classList.add("title");
       ExhibitTitle.innerText = this.ExhibitContent.awards[AwardIndex].title;

       const MainText = document.createElement("div");
       MainText.classList.add("paitContent");
       MainText.innerHTML = this.ExhibitContent.awards[AwardIndex].content;

       RightColumn.append(ExhibitTitle, MainText);
       
       ExhibitPage.append(LeftColumn, RightColumn);
       ContainerDiv.appendChild(ExhibitPage);

       document.body.appendChild(ContainerDiv);
       
       TopSpacer.addEventListener("pointerup", Exit);
       OpenCloseButton.addEventListener("pointerup", ScrollToTop);
       AwardTitlebar.addEventListener("pointerup", ScrollToTop);
       ContainerDiv.addEventListener("scroll", ScrollDown);
       NextButton.addEventListener("pointerup", RotateWinners.bind(this));

       function Exit(event) {

           ContainerDiv.scroll({
               top: 0,
               behavior: "smooth"
           });
           ContainerDiv.remove();
           
       }

       function ScrollToTop(event = null) {

            let top = window.innerHeight;

            if (window.innerWidth < 420) {
                top = 0;
            }

            ContainerDiv.scroll({
               top: top,
               behavior: "smooth"
           });

           OpenCloseButton.removeEventListener("pointerup", ScrollToTop);
           OpenCloseLabel.innerText = "Close";
           OpenCloseIcon.src = "./images/close.png"
           OpenCloseButton.addEventListener("pointerup", Exit);
       }

       function ScrollDown(event) {

           let ScrollProgress = ContainerDiv.scrollTop / window.innerHeight;

           if (window.innerWidth > 420) {
               if (ScrollProgress >= 1) {
                   ExhibitPage.style.opacity = 1;
                   ProjectType.style.paddingLeft = "100px";
               } else {
                   ExhibitPage.style.opacity = ScrollProgress;
                   ProjectType.style.paddingLeft = `${150 - (50 * ScrollProgress)}px`;
               }

           }

           if (ContainerDiv.scrollTop >= window.innerHeight) {
               OpenCloseButton.removeEventListener("pointerup", ScrollToTop);
               OpenCloseLabel.innerText = "Close";
               OpenCloseIcon.src = "./images/close.png"
               OpenCloseButton.addEventListener("pointerup", Exit);
           } else if (ContainerDiv.scrollTop < window.innerHeight) {
               OpenCloseButton.removeEventListener("pointerup", Exit);
               OpenCloseLabel.innerText = "Scroll";
               OpenCloseIcon.src = "./images/open.png"
               OpenCloseButton.addEventListener("pointerup", ScrollToTop);
           }
       }

       function RotateWinners(event) {

           AwardIndex++;
           if (AwardIndex > (this.ExhibitContent.awards.length - 1)) {
               AwardIndex = 0;
           }

           NextButton.innerHTML = `Next (${AwardIndex + 1} of ${this.ExhibitContent.awards.length}) <img src="./images/leftarrow.png">`;

           leftTitle.innerText = this.ExhibitContent.awards[AwardIndex].title;
           aboutText.innerText = this.ExhibitContent.awards[AwardIndex].about;
           ExhibitTitle.innerText = this.ExhibitContent.awards[AwardIndex].title;
           MainText.innerHTML = this.ExhibitContent.awards[AwardIndex].content;
           
       }

    }

    CreateNominationsPanel() {
        
        const type = "indy";

        const ContainerDiv = document.createElement("div");
        ContainerDiv.classList.add("ExhibitInfopanelContainer");

        // Title Bar

        const TitleBar = document.createElement("div")
        TitleBar.classList.add("titlebar");

        const TopSpacer = document.createElement("div");
        TopSpacer.classList.add("topspacer");

        const ProjectType = document.createElement("div");
        ProjectType.classList.add("type", type);
        ProjectType.innerText = "PMI Awards";

        const AwardTitlebar = document.createElement("div");
        AwardTitlebar.classList.add("award");
        AwardTitlebar.innerText = "Call for 2023 Nominations";

        const OpenCloseButton = document.createElement("div");
        OpenCloseButton.classList.add("openclosebutton");
        const OpenCloseLabel = document.createElement("span");
        OpenCloseLabel.innerText = "Scroll";

        const OpenCloseIcon = new Image();
        OpenCloseIcon.src = "./images/open.png"
        OpenCloseButton.append(OpenCloseLabel, OpenCloseIcon);

        TitleBar.append(ProjectType, AwardTitlebar, OpenCloseButton);

        ContainerDiv.append(TopSpacer, TitleBar);

        // Exhibit Body

        const ExhibitPage = document.createElement("div");
        ExhibitPage.classList.add("exhibitpage", type);

        const LeftColumn = document.createElement("div");
        LeftColumn.classList.add("leftcolumn");

        const LeftStuff = document.createElement("div");
        LeftStuff.classList.add("leftstuff");

        LeftColumn.appendChild(LeftStuff);

        // Award content

        const RightColumn = document.createElement("div");
        RightColumn.classList.add("rightcolumn");

        let ExhibitTitle = document.createElement("div");
        ExhibitTitle.classList.add("title");
        ExhibitTitle.innerText = "";

        const LeadVideo = document.createElement("div");
        const SecondVideo = document.createElement("div");

        LeadVideo.innerHTML = `
            <video controls playsinline poster="./images/videoposter.png">
                <source src = "./videos/nominations.mp4" type = "video/mp4" width="100%" height="100%">
                <p>Your browser doesn't support HTML5 video. Here is a <a href="./videos/nominations.mp4">link to the video</a> instead.</p>
            </video>
        `;

        SecondVideo.innerHTML = `
        <video controls playsinline poster="./images/videoposter.png">
            <source src = "./videos/PMI_Illuminate_Recap.mp4" type = "video/mp4" width="100%" height="100%">
            <p>Your browser doesn't support HTML5 video. Here is a <a href="./videos/PMI_Illuminate_Recap.mp4">link to the video</a> instead.</p>
        </video>
    `;

        LeadVideo.classList.add("leadvideo");
        SecondVideo.classList.add("leadvideo");

        const MainText = document.createElement("div");
        MainText.classList.add("maintext");
        MainText.innerHTML = `
        <p>The PMI Awards are our industry's crowning achievement. Honor award-worthy project professionals, teams, and world-changing projects now at <a href="https://pmi.org/about/awards">pmi.org/about/awards.</a>.</p>
        `;

        const SecondText = document.createElement("div");
        SecondText.classList.add("maintext");
        SecondText.innerHTML = `
        <p>Watch video from "ILLUMINATE!" — our 2022 PMI Awards celebration in Las Vegas.</p>
        `;

        RightColumn.append(LeadVideo, MainText, SecondVideo, SecondText);
        
        ExhibitPage.append(LeftColumn, RightColumn);
        ContainerDiv.appendChild(ExhibitPage);

        document.body.appendChild(ContainerDiv);
        ResizeVideo();

        // Navigation
        
        TopSpacer.addEventListener("pointerup", Exit);
        OpenCloseButton.addEventListener("pointerup", ScrollToTop);
        AwardTitlebar.addEventListener("pointerup", ScrollToTop);
        ContainerDiv.addEventListener("scroll", ScrollDown);
        NextButton.addEventListener("pointerup", RotateWinners.bind(this));

        function Exit(event) {

            ContainerDiv.scroll({
                top: 0,
                behavior: "smooth"
            });
            ContainerDiv.remove();

        }

        function ScrollToTop(event = null) {

            let top = window.innerHeight;

            if (window.innerWidth < 420) {
                top = 0;
            }

            ContainerDiv.scroll({
                top: top,
                behavior: "smooth"
            });

            OpenCloseButton.removeEventListener("pointerup", ScrollToTop);
            OpenCloseLabel.innerText = "Close";
            OpenCloseIcon.src = "./images/close.png"
            OpenCloseButton.addEventListener("pointerup", Exit);
       }    

        function ScrollDown(event) {

               let ScrollProgress = ContainerDiv.scrollTop / window.innerHeight;

               if (window.innerWidth > 420) {
                   if (ScrollProgress >= 1) {
                       ExhibitPage.style.opacity = 1;
                       ProjectType.style.paddingLeft = "100px";
                   } else {
                       ExhibitPage.style.opacity = ScrollProgress;
                       ProjectType.style.paddingLeft = `${150 - (50 * ScrollProgress)}px`;
                   }

               }

               if (ContainerDiv.scrollTop >= window.innerHeight) {
                   OpenCloseButton.removeEventListener("pointerup", ScrollToTop);
                   OpenCloseLabel.innerText = "Close";
                   OpenCloseIcon.src = "./images/close.png"
                   OpenCloseButton.addEventListener("pointerup", Exit);
               } else if (ContainerDiv.scrollTop < window.innerHeight) {
                   OpenCloseButton.removeEventListener("pointerup", Exit);
                   OpenCloseLabel.innerText = "Scroll";
                   OpenCloseIcon.src = "./images/open.png"
                   OpenCloseButton.addEventListener("pointerup", ScrollToTop);
               }
        }

        function ResizeVideo(event) {
            let NewHeight = LeadVideo.clientWidth * 0.5625;
            LeadVideo.style.height = `${NewHeight}px`;
            SecondVideo.style.height = `${NewHeight}px`;
        }

    }

}

export {WallNavMesh, FloorNavMesh, ExhibitNavMesh}

