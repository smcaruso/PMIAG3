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
    byline: null,
    leadVideo: null,
    leadImage: null,
    description: null,
    images: [],
    creditGrid: []
};

const saveButton = document.querySelector(".save-button");
saveButton.addEventListener("click", click => {
    console.log(pageContent);
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
    pageContent.id = numericalInputField;
    mapOverlay.modal.classList.add(mapOverlay.hideModalClass)
});

///// SIDEBAR FIELDS

fetch("../content/page22.json")
    .then( response => {
        return response.json();
    })
    .then( data => {
        console.log(data)
    })