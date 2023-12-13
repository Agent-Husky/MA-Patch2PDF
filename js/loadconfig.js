let defaultTableHeaders = [];

document.addEventListener("DOMContentLoaded", function(event) {
    fetch('./default_config.json')
        .then((response) => response.json())
        .then((json) => loadConfig(json));
});

function loadConfig(default_config_json){
    logoselector = document.getElementById("logoselector");
    defaultTableHeaders = default_config_json.tableHeaders;
    default_config_json.logos.forEach(logo => {
        var option = document.createElement("option");
        option.value = logo.filePath;
        option.text = logo.displayName;
        logoselector.appendChild(option);
    });
    createSelect();
}
