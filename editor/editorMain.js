///// SERIALIZED PAGE CONTENT OBJECT

const pageContent = {
    id: 0,
    awardCategory: null,
    titleBarTitle: null,
    awardStatus: null,
    sidebarTitle: null,
    sidebarCategory: null,
    aboutText: null,
    links: [],
    team: [],
    audioGuide: null,
    nextPage: null,
    dupeStatus: false,
    pageTitle: null,
    subtitle: null,
    leadVideo: null,
    leadImage: null,
    description: [],
    images: [],
    creditGrid: []
};

const saveButton = document.querySelector(".save-button");
saveButton.addEventListener("click", click => {
    if (pageContent.id === null) {
        alert("Choose a page ID before saving.");
        return;
    }
    saveDataLocally();
});

///// PAGE ID + MAP OVERLAY

const mapOverlay = {
    showButton: document.querySelector(".map-button"),
    modal: document.querySelector(".map-overlay"),
    setCloseButton: document.querySelector(".modal-close-button"),
    linkInput: document.querySelector(".exhibit-link"),
    hideModalClass: "overlay-hidden"
}

mapOverlay.showButton.addEventListener("click", click => {
    mapOverlay.modal.classList.remove(mapOverlay.hideModalClass);
});

mapOverlay.setCloseButton.addEventListener("click", click => {
    let numericalInputField = mapOverlay.linkInput.value;
    if (numericalInputField.length === 0) {
        alert("Input an ID number.");
        return;
    }
    else if (numericalInputField => 0 && numericalInputField <= 26) {
        mapOverlay.showButton.innerHTML = `
        LINKED TO <span class="exhibit-place-number">${mapOverlay.linkInput.value}</span> Open Map
        `;
    }
    else if (numericalInputField > 26) {
        mapOverlay.showButton.innerHTML = `
        UNLINKED <span class="exhibit-place-number">${mapOverlay.linkInput.value}</span> Open Map
        `;
    }

    checkExistingPageContent(numericalInputField)
    .then(data => {
        if (data && confirm("Found existing content with this ID. Load for editing?")) {
            loadContent(data);
        }
    })

    pageContent.id = numericalInputField;
    mapOverlay.modal.classList.add(mapOverlay.hideModalClass)
    
});

///// HEADER FIELDS

const header = {
    category: document.querySelector("#headerCategory"),
    title: document.querySelector("#headerTitle")
}

///// PAGE SIDEBAR FIELDS

const sidebar = {
    status: document.querySelector("#sidebarStatus"),
    title: document.querySelector("#sidebarTitle"),
    category: document.querySelector("#sidebarCategory"),
    about: document.querySelector("#sidebarAboutText"),
    links: {
        block: document.querySelector("#sidebarLinksBlock"),
        add: document.querySelector("#addLink.block-add-button"),
        proto: document.querySelector(".block-item.sidebar-link"),
        list: []
    },
    team: {
        block: document.querySelector("#sidebarTeamBlock"),
        add: document.querySelector("#addTeam.block-add-button"),
        proto: document.querySelector(".block-item.team-member"),
        list: []
    },
    audioGuide: document.querySelector("#audioGuide"),
    nextPage: document.querySelector("#nextPage")
}

///// MAIN PAGE FIELDS

const page = {
    status: document.querySelector("#mainPageStatus"),
    title: document.querySelector("#pageTitle"),
    subtitle: document.querySelector("#pageSubtitle"),
    leadVideo: document.querySelector("#leadVideo"),
    leadImage: document.querySelector("#leadImage"),
    description: document.querySelector("#descriptionText"),
    images: {
        block: document.querySelector(".image-gallery-block"),
        add: document.querySelector("#addImage.block-add-button"),
        proto: document.querySelector(".block-item.image"),
        list: []
    },
    creditGrid: {
        block: document.querySelector(".credit-grid-block"),
        add: document.querySelector("#addCredit.block-add-button"),
        proto: document.querySelector(".block-item.credit"),
        list: []
    }
}

///// STRUCT UPDATE EVENTS

header.category.addEventListener("input", e => pageContent.awardCategory = e.target.value);
header.title.addEventListener("input", e => pageContent.titleBarTitle = e.target.value);
sidebar.status.addEventListener("input", e => pageContent.awardStatus = e.target.value);
sidebar.title.addEventListener("input", e => pageContent.sidebarTitle = e.target.value);
sidebar.category.addEventListener("input", e => pageContent.sidebarCategory = e.target.value);
sidebar.about.addEventListener("input", e => pageContent.aboutText = e.target.value);
sidebar.links.add.addEventListener("click", e => addNewBlock(sidebar.links));
sidebar.links.proto.addEventListener("input", e => updateBlockList(sidebar.links));
sidebar.links.block.addEventListener("mouseleave", e => processBlock(sidebar.links.list, "links"));
sidebar.team.add.addEventListener("click", e => addNewBlock(sidebar.team));
sidebar.team.proto.addEventListener("input", e => updateBlockList(sidebar.team));
sidebar.team.block.addEventListener("mouseleave", e => processTeam(sidebar.team.list))
sidebar.audioGuide.addEventListener("change", e => pageContent.audioGuide = e.target.checked);
sidebar.nextPage.addEventListener("input", e => pageContent.nextPage = e.target.value);
page.status.addEventListener("change", e => pageContent.dupeStatus = e.target.checked);
page.title.addEventListener("input", e => pageContent.pageTitle = e.target.value);
page.subtitle.addEventListener("input", e => pageContent.subtitle = e.target.value);
page.leadVideo.addEventListener("input", e => pageContent.leadVideo = e.target.value);
page.leadImage.addEventListener("input", e => pageContent.leadImage = e.target.value);
page.description.addEventListener("input", e => processDescription(page.description.value));
page.images.add.addEventListener("click", e => addNewBlock(page.images));
page.images.proto.addEventListener("input", e => updateBlockList(page.images));
page.images.block.addEventListener("mouseleave", e => processBlock(page.images.list, "images"));
page.creditGrid.add.addEventListener("click", e => addNewBlock(page.creditGrid));
page.creditGrid.proto.addEventListener("input", e => updateBlockList(page.creditGrid));
page.creditGrid.block.addEventListener("mouseleave", e => processBlock(page.creditGrid.list, "creditGrid"));

function addNewBlock(block) {

    let newBlockItem = block.proto.cloneNode(true);
    newBlockItem.childNodes.forEach( node => node.value = null );

    newBlockItem.addEventListener("input", e => updateBlockList(block));
    block.block.appendChild(newBlockItem);
    return newBlockItem;
}

function updateBlockList(block) {
    block.list = [];
    block.block.childNodes.forEach(node => {
        if (node.classList) {
            if (node.classList.contains("block-item")) {
                node.classList.remove("invalid-entry");
                block.list.push(node)
            }
        }
    });
}

function processBlock(list, destination) {

    pageContent[destination] = [];

    list.forEach(node => {
        let item = {};
        node.childNodes.forEach(childNode => {
            if (childNode.classList && childNode.value !== "") {
                item[childNode.classList[0]] = childNode.value;
            } 
        });
        let validLinkEntry = item.linkUrl !== "" && item.linkLabel !== "" && item.linkUrl !== undefined && item.linkLabel !== undefined;
        let validImageEntry = item.imageFilename !== "" && item.imageCaption !== "" && item.imageFilename !== undefined && item.imageCaption !== undefined;
        let validCreditEntry = item.creditName !== "" && item.creditName !== undefined;
        if (!validLinkEntry && !validImageEntry && !validCreditEntry) { node.classList.add("invalid-entry"); return; };
        pageContent[destination].push(item);
    });
}

function processTeam(list) {
    pageContent.team = [];
    list.forEach(node => {
        let nodeValue = node.childNodes[1].value;
        if (nodeValue.length === 0) { node.remove(); return; }
        pageContent.team.push(node.childNodes[1].value)
    });
}

function processDescription(textbox) {
    pageContent.description = [];
    let paragraphs = textbox.split("\n");
    paragraphs.forEach(para => {
        if (para === "") return;
        pageContent.description.push(para);
    });
}

///// DATA HANDLING FUNCTIONS

function checkExistingPageContent(id) {
    let filepath = `../content/page${id}.json`;
    return fetch(filepath)
    .then( response => {
        return response.json();
    })
    .then( data => {
        return data;
    })
    .catch(error => {
        console.warn("EDITOR: fetch error. Assuming no file found.");
    })
}

function loadContent(data) {

    // Sync loaded data with serialized page content
    for (const property in data) { pageContent[property] = data[property]; }

    // Clear previously filled/loaded content blocks
    let blocks = document.querySelectorAll(".block-item");
    blocks.forEach( block => { block.remove(); })
    page.description.value = "";

    // Fill page content fields from loaded data
    header.category.value = data.awardCategory;
    header.title.value = data.titleBarTitle;
    sidebar.status.value = data.awardStatus;
    sidebar.title.value = data.sidebarTitle;
    sidebar.category.value = data.sidebarCategory;
    sidebar.about.value = data.aboutText;
    data.links.forEach(link => {
        let newLinkEntry = addNewBlock(sidebar.links);
        newLinkEntry.childNodes.forEach(node => {
            if (!node.classList) return;
            if (node.classList.contains("linkUrl")) { node.value = link.linkUrl; }
            if (node.classList.contains("linkLabel")) { node.value = link.linkLabel; }
        });
    });
    sidebar.links.proto.remove();
    data.team.forEach(member => {
        let newTeamEntry = addNewBlock(sidebar.team);
        newTeamEntry.childNodes[1].value = member;
    });
    sidebar.team.proto.remove();
    sidebar.audioGuide.checked = data.audioGuide;
    sidebar.nextPage.value = data.nextPage;
    page.status.checked = data.dupeStatus;
    page.title.value = data.pageTitle;
    page.subtitle.value = data.subtitle;
    page.leadVideo.value = data.leadVideo;
    page.leadImage.value = data.leadImage;
    data.description.forEach(para => {
        page.description.value += `${para}\n`
    });
    data.images.forEach(image => {
        let newImageEntry = addNewBlock(page.images);
        newImageEntry.childNodes.forEach(node => {
            if (!node.classList) return;
            if (node.classList.contains("imageFilename")) { node.value = image.imageFilename; }
            if (node.classList.contains("captionTitle")) { node.value = image.captionTitle; }
            if (node.classList.contains("imageCaption")) { node.value = image.imageCaption; }
            if (node.value == "undefined") { node.value = null; }
        });
    });
    page.images.proto.remove();
    data.creditGrid.forEach(credit => {
        let newCreditGridEntry = addNewBlock(page.creditGrid);
        newCreditGridEntry.childNodes.forEach(node => {
            if (!node.classList) return;
            if (node.classList.contains("creditImageFilename")) { node.value = credit.creditImageFilename; }
            if (node.classList.contains("creditName")) { node.value = credit.creditName; }
            if (node.classList.contains("creditDescription")) { node.value = credit.creditDescription; }
            if (node.classList.contains("creditLocation")) { node.value = credit.creditLocation; }
            if (node.value == "undefined") { node.value = null; }
        });
    });
    page.creditGrid.proto.remove();

}

function saveDataLocally() {

    // reprocess complex blocks, mouseleave event may not be captured if tabbed through

    processBlock(sidebar.links.list, "links");
    processTeam(sidebar.team.list);
    processDescription(page.description.value);
    processBlock(page.images.list, "images");
    processBlock(page.creditGrid.list, "creditGrid");
    
    const jsonData = JSON.stringify(pageContent);
    const blob = new Blob([jsonData], {type: "application/json"});
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `page${pageContent.id}.json`;
    link.textContent = "Save + Export Content";
    const hiddenLinkElement = document.body.appendChild(link);
    hiddenLinkElement.click();
    document.body.removeChild(hiddenLinkElement);
    URL.revokeObjectURL(url);

}