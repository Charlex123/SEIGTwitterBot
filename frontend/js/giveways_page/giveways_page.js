//const ipc = require('electron').ipcRenderer;

//var btn = document.getElementById("btn_valide_giveway")
//var menu = document.getElementById("Settings_menu")
//btn.addEventListener("click", function (event) {console.log("ouverture du S.A.S ...");menu.classList.add("je");
//})

/* slide not needed for now
var slider = document.getElementById("myRange");
var output = document.getElementById("output_slide");
// Update the current slider value (each time you drag the slider handle)
slider.oninput = function() {

  var a=this.value+"% of the bots on the giveway";
    output.innerHTML = a;
}
*/
var btn_croix = document.getElementById("croix_settings");
var menu = document.getElementById("Settings_menu");
var otherCheckbox = document.getElementById("switch2");
var otherText = document.getElementById("hashtagsInput");

btn_croix.addEventListener("click", function (event) {
  console.log("fermeture du S.A.S ...");
  menu.classList.remove("je");
  otherText.classList.remove("zero");
});

otherCheckbox.onchange = function () {
  if (otherCheckbox.checked) {
    otherText.classList.remove("zero");
  } else {
    otherText.classList.add("zero");
  }
};

//
