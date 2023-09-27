import "./style.css"
import {Page} from "./createPage.js"

const welcomeScreen = document.querySelector(".welcome");
if (window.location.hash) {
  let pageId = window.location.hash.substring(1);
  const page =  new Page(pageId, welcomeScreen, true);
}
else {
  welcomeScreen.parentElement.classList.remove("closed");
}
