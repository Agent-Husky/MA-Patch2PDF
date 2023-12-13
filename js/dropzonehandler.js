const dropzone = document.getElementById("drop_zone");
const input = document.getElementById("fileinput");
// click input file field
dropzone.addEventListener('click', function () {
    input.click();
});

// prevent default browser behavior
["drag", "dragstart", "dragend", "dragover", "dragenter", "dragleave", "drop"].forEach(event => {
    dropzone.addEventListener(event, (e) =>{
        e.preventDefault();
        e.stopPropagation();
    });
});

// add visual drag information
dropzone.addEventListener("dragover", () => {
    dropzone.style.backgroundColor = "var(--dropzonehoverbackground)";
});
dropzone.addEventListener("dragleave", () => {
    dropzone.style.backgroundColor = "";
});

function onupload() {
    readFile();
    var filename = input.files[0].name;
    var filename_string = filename.replace(/\.[^/.]+$/, "");
    dropzone.getElementsByTagName("p")[0].innerHTML = filename_string;
    dropzone.style.backgroundColor = "";
}

// catch file drop and add it to input
dropzone.addEventListener("drop", e => {
    e.preventDefault();
    console.log(e);
    let files = e.dataTransfer.files

    if (files.length) {
        input.files = files;
        onupload();
    }
});

// trigger file submission behavior
input.addEventListener("change", (e) => {
    if (e.target.files.length) {
        onupload();
    }
});

function dragOverHandler(ev) {
    // Prevent default behavior (Prevent file from being opened)
    ev.preventDefault();
}
