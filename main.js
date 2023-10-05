import "./style.css";
import {Page} from "./createPage.js";
import {PMIAwardsApp} from "./pmiawards.js";

const welcomeScreen = document.querySelector(".welcome");

// Load specific exhibit page if an ID is provided in the URL hash.
if (window.location.hash) {
    let pageId = window.location.hash.substring(1);
    new Page(pageId, welcomeScreen, true);
} else { welcomeScreen.parentElement.classList.remove("closed"); }

(function setupApp() {

    const app = new PMIAwardsApp;
    
    // Catalog Menu:
    
    const Menu = document.querySelector(".menu");
    const MenuIcon = document.querySelector(".menuicon");
    const LoadingBarElement = document.querySelector(".loadingbar");
    const loadingBarAndButton = document.querySelector(".loadingstuff")
    
    let POTYbutton = document.getElementById("01");
    let PMObutton = document.getElementById("02");
    let PFbutton = document.getElementById("03");
    let EJbutton = document.getElementById("04");
    let RLbutton = document.getElementById("05");
    let RAbutton = document.getElementById("06");
    let CAbutton = document.getElementById("07");
    
    let NavTips = document.querySelectorAll(".instructiontext");
    let TipIndex = 0;
    RotateTips();
    let RotationInterval = setInterval(RotateTips, 5250);

    // POTYbutton.addEventListener("pointerup", function() { app.Teleport("poty"); });
    // PMObutton.addEventListener("pointerup", function() { app.Teleport("pmo"); });
    // PFbutton.addEventListener("pointerup", function() { app.Teleport("fellow"); });
    // EJbutton.addEventListener("pointerup", function() { app.Teleport("jenett"); });
    // RLbutton.addEventListener("pointerup", function() { app.Teleport("rising"); });
    // RAbutton.addEventListener("pointerup", function() { app.Teleport("academic"); });
    // CAbutton.addEventListener("pointerup", function() { app.Teleport("chapter"); });

    // MenuIcon.addEventListener("pointerup",
    //     function(event) {
    //         event.stopPropagation();
    //         if (Menu.classList.contains("open")) {
    //             Menu.classList.remove("open");
    //             MenuIcon.src = "./images/menu.png";
    //         }
    //         else {
    //             Menu.classList.add("open");
    //             MenuIcon.src = "./images/close.png";
    //         }
    //     }
    // );
    
    // Intro panel destruction:
    
    // const WelcomePanel = document.querySelector(".welcome");
    
    loadingBarAndButton.addEventListener("pointerup",
        function(event) {
    
            event.stopPropagation();
    
            if (!LoadingBarElement.classList.contains("loaded")) return;
    
            welcomeScreen.classList.add("closed");
            clearInterval(RotationInterval);
            welcomeScreen.parentElement.classList.add("closed");
            setTimeout(
                function() {
                    welcomeScreen.parentElement.remove();
                    if (window.innerWidth < 820) {
                        app.MoveCam("entrymobile");
                    } else {
                        app.MoveCam("entry");
                    }
            }, 750);
            
        }
    );
    
    // Navigation tip rotation
    
    function RotateTips() {
    
        for (let LoopIndex = 0; LoopIndex < NavTips.length; LoopIndex++) {
            if (LoopIndex === TipIndex) {
                NavTips[LoopIndex].style.opacity = "1";
            } else {
                NavTips[LoopIndex].style.opacity = "0";
            }
        }
    
        if (TipIndex === NavTips.length - 1) {
            TipIndex = 0;
        } else {
            TipIndex++;
        }
    
    }

})();