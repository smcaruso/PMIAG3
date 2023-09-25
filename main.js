import "./style.css"
import {Page} from "./createPage.js"

const WelcomePanel = document.querySelector(".welcome");
if (window.location.hash) {
  let pageId = window.location.hash.substring(1);
  const page =  new Page(pageId, WelcomePanel);
}
