export class Page {

    constructor(id, welcome, fullPage = false) {

        this.data = {};
        this.color = 0;
        this.fullPage = fullPage;
        this.welcome = welcome;

        this.container = document.createElement("div");
        this.container.classList.add("exhibit-infopanel");

        this.titlebar = document.createElement("div")
        this.titlebar.classList.add("titlebar");

        this.pageBody = document.createElement("div");
        this.pageBody.classList.add("exhibitpage");

        this.loadPageContent(id)
        .then(data => {
            if (data) {
                this.data = data;
                // console.log("Creating exhibit page for", this.data);
                this.setColor(data.id);
                this.buildPage(this.data);
                if (welcome) { welcome.parentElement.remove(); }
            } else {

                // replace the welcome page if there is no page to create

                welcome.classList.remove("closed");
                welcome.parentElement.classList.remove("closed");
                
            }
        });

    }

    loadPageContent(id) {
        let filepath = `./content/page${id}.json`;
        return fetch(filepath)
        .then( response => {
            return response.json();
        })
        .then( data => {
            return data;
        })
        .catch(error => {
            console.warn("PAGE: fetch error. Assuming no file found.");
        })
    }

    setColor(id) {
        if (this.color !== 0) return;
        if (id >= 0 && id < 11) { this.color = "blue"; }
        else if (id >= 11 && id < 18) { this.color = "purple"; }
        else if (id >= 18) {this.color = "orange"; }
    }

    buildPage(data) {

        if ( !data.awardCategory && !data.titleBarTitle && !data.pageTitle) {
            console.error("Page can't be built from this data.");
            return;
        }

        this.pageBody.classList.add(this.color);

        this.pageBody.append(this.buildSidebar(data), this.buildMain(data));
        this.container.append(this.buildTitlebar(data), this.pageBody);

        document.body.append(this.container);
        if (this.fullPage) {
            this.container.scroll({
                top: 100,
                behavior: "instant"
            });
        }
        if (data.leadVideo) { this.resizeVideo(this.pageBody.querySelector(".leadvideo")); }
    }

    buildTitlebar(data) {

        if (!this.fullPage) {
            const topSpacer = document.createElement("div");
            topSpacer.classList.add("topspacer");
            topSpacer.addEventListener("pointerup", exit.bind(this));
            this.container.append(topSpacer);
        }

        const category = document.createElement("div");
        category.classList.add("type", this.color);
        category.innerText = data.awardCategory;

        const title = document.createElement("div");
        title.classList.add("award");
        title.innerText = data.titleBarTitle;

        const openCloseButton = document.createElement("div");
        openCloseButton.classList.add("openclosebutton");
        const buttonLabel = document.createElement("span");
        buttonLabel.innerText = "Top";

        const icon = new Image();
        icon.src = "./images/open.png"
        openCloseButton.append(buttonLabel, icon);

        this.titlebar.append(category, title, openCloseButton);
        this.titlebar.addEventListener("pointerup", scrollToTop.bind(this));
        this.container.addEventListener("scroll", scrollDown.bind(this));

        setTimeout( () => { scrollToTop.call(this); }, 25);

        return this.titlebar;

        function scrollToTop(event) {
            let top = window.innerHeight;
            
            if (this.fullPage) {
                top = 100;
                if (window.innerWidth < 440) {
                    top = 0;
                }
            } else if (window.innerWidth < 440) {
                top = 0;
            }

            this.container.scroll({
                top: top,
                behavior: "smooth"
            });

            let isHash = window.location.hash.length > 0;
            if (this.fullPage && !this.data.nextPage || isHash) return;

            openCloseButton.removeEventListener("pointerup", scrollToTop);
            openCloseButton.querySelector("span").innerText = "Close";
            openCloseButton.querySelector("img").src = "./images/close.png";
            openCloseButton.addEventListener("pointerup", exit.bind(this));
        }

        function exit(event) {

            this.container.scroll({
                top: 0,
                behavior: "smooth"
            });
            this.container.remove();
            
        }

        function scrollDown(event) {

            if (this.fullPage) return;

            let ScrollProgress = this.container.scrollTop / window.innerHeight;

            if (window.innerWidth > 440) {
                if (ScrollProgress >= 1) {
                    this.pageBody.style.opacity = 1;
                    category.style.paddingLeft = "100px";
                } else {
                    this.pageBody.style.opacity = ScrollProgress;
                    category.style.paddingLeft = `${150 - (50 * ScrollProgress)}px`;
                }
            }

            if (this.container.scrollTop >= window.innerHeight) {
                openCloseButton.removeEventListener("pointerup", scrollToTop.bind(this));
                openCloseButton.querySelector("span").innerText = "Close";
                openCloseButton.querySelector("img").src = "./images/close.png";
                openCloseButton.addEventListener("pointerup", exit.bind(this));
            } else if (this.container.scrollTop < window.innerHeight) {
                openCloseButton.removeEventListener("pointerup", exit.bind(this));
                openCloseButton.querySelector("span").innerText = "Scroll";
                openCloseButton.querySelector("img").src = "./images/open.png"
                openCloseButton.addEventListener("pointerup", scrollToTop.bind(this));
            }
        }

        

    }

    buildSidebar(data) {

        const sidebar = document.createElement("div");
        sidebar.classList.add("leftcolumn");

        const sidebarContents = document.createElement("div");
        sidebarContents.classList.add("leftstuff");

        if (data.awardStatus) {

            const status = document.createElement("div");
            status.classList.add("status");
            status.innerText = data.awardStatus;

            sidebarContents.append(status);

        }

        if (data.sidebarTitle) {

            const sidebarTitle = document.createElement("div");
            sidebarTitle.classList.add("awardtitlesidebar");
            sidebarTitle.innerText = data.sidebarTitle;

            sidebarContents.append(sidebarTitle);

        }

        if (data.sidebarCategory) {

            const sidebarCategory = document.createElement("div");
            sidebarCategory.classList.add("awardtitlesidebar");
            sidebarCategory.innerText = data.sidebarCategory;

            sidebarContents.append(sidebarCategory);

        }

        if (data.links.length > 0) {

            const linksList = document.createElement("ul");
            linksList.classList.add("linkslist");

            for (let index = 0; index < data.links.length; index++) {

                let linkItem = document.createElement("li");
                    linkItem.classList.add("linkitem");
                    linkItem.innerHTML = `
                        <a href = "${data.links[index].linkUrl}" target="_blank">
                        ${data.links[index].linkLabel} </a>
                    `
                linksList.appendChild(linkItem);

            }

            sidebarContents.append(linksList);

        }

        if (data.audioGuide) {
            
            const audioGuide = document.createElement("div");
            audioGuide.classList.add("audioguide");
    
            const audioGuideTextBox = document.createElement("ul");
            audioGuideTextBox.classList.add("audiotextbox");
    
            const audioGuideHeadline = document.createElement("li");
            audioGuideHeadline.classList.add("audioheadline");
            audioGuideHeadline.innerText = "Play audio Guide";
    
            const audioGuideTimestamp = document.createElement("li");
            audioGuideTimestamp.classList.add("audiotimestamp");
    
            let total = "0:00";
            let audioUpdater;
    
            audioGuideTimestamp.innerText = "Paused 0:00 / ${total}"
    
            audioGuideTextBox.append(audioGuideHeadline, audioGuideTimestamp);
            audioGuide.appendChild(audioGuideTextBox);
    
            const audioFile = new Audio(`./audioguides/${data.id}.mp3`);
            audioFile.setAttribute("preload","metadata");
            audioGuide.appendChild(audioFile);

            // Audio Guide Events

            audioFile.addEventListener("loadedmetadata", e => {
                let minutes = Math.floor(audioFile.duration / 60);
                let seconds = Math.ceil(audioFile.duration - minutes * 60);
                let zero = "0";
                if (seconds >= 10) { zero = "" };
                total = `${minutes}:${zero}${seconds}`;
                audioGuideTimestamp.innerText = `Paused 0:00 / ${total}`;
            });

            audioGuide.addEventListener("pointerdown", e => {
                let current;
                UpdateTime();
                if (!audioFile.played || audioFile.paused) {
                    audioFile.play();
                    audioGuideHeadline.innerText = "Pause Audio Guide";
                    audioGuideTimestamp.innerText = `Playing ${current} / ${total}`;
                    audioUpdater = setInterval(UpdateTime, 1000);
                } else {
                    audioFile.pause();
                    clearInterval(audioUpdater);
                    audioGuideTimestamp.innerText = `Paused ${current} / ${total}`;
                    audioGuideHeadline.innerText = "Play Audio Guide";
                }
    
                function UpdateTime() {
                    let minutes = Math.floor(audioFile.currentTime / 60);
                    let seconds = Math.ceil(audioFile.currentTime - minutes * 60);
                    let zero = "0";
                    if (seconds >= 10) { zero = "" };
                    current = `${minutes}:${zero}${seconds}`;
                    audioGuideTimestamp.innerText = `Playing ${current} / ${total}`;
                }
    
            });

            sidebarContents.append(audioGuide);

        }

        if (data.aboutText) {

            const aboutText = document.createElement("div");
            aboutText.classList.add("aboutthisaward");
            aboutText.innerHTML = `
            <span class="aboutheading">About This Award</span>
            <p>${data.aboutText}</p>
            `;

            sidebarContents.append(aboutText);

        }

        if (data.team.length > 0) {

            const teamList = document.createElement("div");
            teamList.classList.add("teamlist");
            teamList.innerText = "Team";

            const members = document.createElement("ul");
            
            for (let index = 0; index < data.team.length; index++) {

                let member = document.createElement("li");
                member.innerText = data.team[index];
                members.appendChild(member);

            }

            teamList.appendChild(members);

            sidebarContents.append(teamList);

        }

        if (data.nextPage) {

            let nextButton = document.createElement("div");
            nextButton.classList.add("aanextbutton");
            nextButton.innerHTML = `Next Page <img src="./images/leftarrow.png">`;

            nextButton.addEventListener("pointerup", e => {
                setTimeout( () => { this.container.remove(); }, 25);
                const nextPage = new Page(data.nextPage, this.welcome, true);
                nextPage.color = this.color;
            });

            sidebarContents.append(nextButton);

        }

        sidebar.append(sidebarContents);
        return sidebar;

    }

    buildMain(data) {
    
        const mainContents = document.createElement("div");
        mainContents.classList.add("rightcolumn");

        if (data.dupeStatus) {
            // do nothing
        }

        if (data.pageTitle) {

            const exhibitTitle = document.createElement("div");
            exhibitTitle.classList.add("title");
            exhibitTitle.innerText = data.pageTitle;

            mainContents.append(exhibitTitle);

        }

        if (data.subtitle) {

            const subtitle = document.createElement("div");
            subtitle.classList.add("company");
            subtitle.innerText = data.subtitle;

            mainContents.append(subtitle);

        }

        if (data.leadVideo) {

            const leadVideo = document.createElement("div");
            leadVideo.innerHTML = `
            <video controls playsinline poster="./images/videoposter.png">
                <source src = "./video/${data.leadVideo}" type = "video/mp4" width="100%" height="100%">
                <p>Your browser doesn't support HTML5 video. Here is a <a href=${data.leadVideo}>link to the video</a> instead.</p>
            </video>
            `;

            leadVideo.classList.add("leadvideo");
            window.addEventListener("resize", e => { this.resizeVideo(leadVideo) });

            mainContents.append(leadVideo);

        }

        if (data.leadImage) {
            const leadImage = document.createElement("div");
            leadImage.classList.add("chapterlogo");
            leadImage.innerHTML = `<img src="./images/pageimages/${data.leadImage}">`;
            mainContents.append(leadImage);
        }

        if (data.description.length > 0) {

            const descriptionText = document.createElement("div");
            descriptionText.classList.add("maintext");
    
            data.description.forEach( line => {
                let paragraph = document.createElement("p");
                paragraph.innerText = line;
                descriptionText.appendChild(paragraph);
            });

            mainContents.append(descriptionText);

        }

        if (data.images.length > 0) {

            const imageGallery = document.createElement("div");
            imageGallery.classList.add("photogallery");
    
            for (let index = 0; index < data.images.length; index++) {
    
                let imageBlock =  document.createElement("div");
                imageBlock.classList.add("photoitem");

                let image = document.createElement("img");
                image.classList.add("photo");
                image.src = `./images/pageimages/${data.images[index].imageFilename}`;

                let numberTab = document.createElement("div");
                numberTab.classList.add("photonumber");
                numberTab.innerText =  `${index+1} of ${data.images.length}`;

                imageBlock.append(image, numberTab);

                if (data.images[index].captionTitle) {
                    let captionTitle = document.createElement("p");
                    captionTitle.classList.add("caption", "title");
                    captionTitle.innerText = data.images[index].captionTitle;
                    imageBlock.append(captionTitle);
                }

                if (data.images[index].imageCaption) {
                    let imageCaption = document.createElement("p");
                    imageCaption.classList.add("caption");
                    imageCaption.innerText = data.images[index].imageCaption;
                    imageBlock.append(imageCaption);
                }

                imageGallery.appendChild(imageBlock)
    
            }

            mainContents.append(imageGallery);

        }

        if (data.creditGrid.length > 0) {

            const creditGrid = document.createElement("div");
            creditGrid.classList.add("credit-area");

            data.creditGrid.forEach(credit => {

                const creditBlock = document.createElement("div");
                creditBlock.classList.add("teamster");

                if (credit.creditImageFilename) {
                    const creditImage = document.createElement("img");
                    creditImage.classList.add("photo");
                    creditImage.src = `/images/pageimages/${credit.creditImageFilename}`;
                    creditBlock.append(creditImage);
                }

                const innerBlock = document.createElement("div");
                innerBlock.classList.add("textbox");

                const name = document.createElement("div");
                name.classList.add("name");
                name.innerText = credit.creditName;
                innerBlock.append(name);

                if (credit.creditDescription) {
                    const description = document.createElement("div");
                    description.classList.add("company");
                    description.innerText = credit.creditDescription;
                    innerBlock.append(description);
                }

                if (credit.creditLocation) {
                    const location = document.createElement("div");
                    location.classList.add("location");
                    location.innerText = credit.creditLocation;
                    innerBlock.append(location);
                }

                creditBlock.append(innerBlock);
                creditGrid.append(creditBlock);

            });

            mainContents.append(creditGrid);

        }

        return mainContents;

    }

    resizeVideo(videoElement) {

        let newHeight = videoElement.clientWidth * 0.5625;
        videoElement.style.height = `${newHeight}px`;

    }

}