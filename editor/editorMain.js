///// SERIALIZED PAGE CONTENT OBJECT

const pageContent = {
    id: null,
    awardCategory: null,
    titleBarTitle: null,
    awardStatus: null,
    sidebarTitle: null,
    links: [],
    audioGuide: null,
    aboutText: null,
    team: [],
    nextPage: null,
    dupeStatus: false,
    pageTitle: null,
    subtitle: null,
    leadVideo: null,
    leadImage: null,
    description: null,
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

///// MULTI-TYPE CONSTRUCTORS

class linkEntry {
    constructor(title, url) {
        this.linkTitle = title;
        this.linkURL = url;
    }
}

class imageEntry {
    constructor(filename, title, text) {
        this.imageFilename = filename;
        this.captionTitle = title;
        this.captionText = text;
    }
}

class creditGridEntry {
    constructor(filename, name, description, location) {
        this.imageFilename = filename;
        this.entryName = name;
        this.description = description;
        this.location = location;
    }
}

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

//// PAGE FIELDS

const _ = new Map();
_.set(pageContent.awardCategory, document.querySelector("#headerCategory"));
_.set(pageContent.titleBarTitle, document.querySelector("#headerTitle"));
_.set(pageContent.awardStatus, document.querySelector("#sidebarStatus"));
_.set(pageContent.sidebarTitle, document.querySelector("#sidebarTitle"));
_.set(pageContent.links, {
    block: document.querySelector("#sidebarLinksBlock"),
    add: document.querySelector("#addLink.block-add-button"),
    proto: document.querySelector(".block-item.sidebar-link")
});
_.set(pageContent.audioGuide, document.querySelector("#audioGuide"));
_.set(pageContent.aboutText, document.querySelector("#sidebarAboutText"));
_.set(pageContent.team, {
    block: document.querySelector("#sidebarTeamBlock"),
    add: document.querySelector("#addTeam.block-add-button"),
    proto: document.querySelector(".block-item.team-member")
});
_.set(pageContent.nextPage, document.querySelector("#nextPage"));
_.set(pageContent.dupeStatus, document.querySelector("#mainPageStatus"));
_.set(pageContent.pageTitle, document.querySelector("#pageTitle"));
_.set(pageContent.subtitle, document.querySelector("#pageSubtitle"));
_.set(pageContent.leadVideo, document.querySelector("#leadVideo"));
_.set(pageContent.leadImage, document.querySelector("#leadImage"));
_.set(pageContent.description, document.querySelector("#descriptionText"));
_.set(pageContent.images,{
    block: document.querySelector(".image-gallery-block"),
    add: document.querySelector("#addImage.block-add-button"),
    proto: document.querySelector(".block-item.image")
});
_.set(pageContent.creditGrid, {
    block: document.querySelector(".credit-grid-block"),
    add: document.querySelector("#addCredit.block-add-button"),
    proto: document.querySelector(".block-item.credit")
});


///// STRUCT UPDATE EVENTS



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
    console.log(data);
}

function saveDataLocally() {
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

/*
// replaced with map:

const header = {
    category: document.querySelector("#headerCategory"),
    title: document.querySelector("#headerTitle")
}

const sidebar = {
    status: document.querySelector("#sidebarStatus"),
    title: document.querySelector("#sidebarTitle"),
    category: document.querySelector("#sidebarCategory"),
    about: document.querySelector("#sidebarAboutText"),
    links: {
        block: document.querySelector("#sidebarLinksBlock"),
        add: document.querySelector("#addLink.block-add-button"),
        proto: document.querySelector(".block-item.sidebar-link")
    },
    team: {
        block: document.querySelector("#sidebarTeamBlock"),
        add: document.querySelector("#addTeam.block-add-button"),
        proto: document.querySelector(".block-item.team-member")
    },
    audioGuide: document.querySelector("#audioGuide"),
    nextPage: document.querySelector("#nextPage")
}
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
        proto: document.querySelector(".block-item.image")
    },
    creditGrid: {
        block: document.querySelector(".credit-grid-block"),
        add: document.querySelector("#addCredit.block-add-button"),
        proto: document.querySelector(".block-item.credit")
    }
}
*/