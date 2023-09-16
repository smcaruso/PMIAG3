///// SERIALIZED PAGE CONTENT OBJECT

const pageContent = {
    id: 0,
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
        proto: document.querySelector(".block-item.image")
    },
    creditGrid: {
        block: document.querySelector(".credit-grid-block"),
        add: document.querySelector("#addCredit.block-add-button"),
        proto: document.querySelector(".block-item.credit")
    }
}

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