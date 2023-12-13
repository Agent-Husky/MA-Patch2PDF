var filecontent;
var filename;

function readFile(){
    const [file] = document.querySelector("input[type=file]").files;
    const reader = new FileReader();

    reader.addEventListener(
        "load",
        () => {
        if(file.type === "text/csv"){
            filecontent = parseCSV(reader.result, file.name);
        }else if(file.type === "text/xml"){
            parser = new DOMParser();
            xmlDoc = parser.parseFromString(reader.result,"text/xml");
            if (xmlDoc.getElementsByTagName("MA").length > 0 && xmlDoc.getElementsByTagName("MA")[0].attributes.xmlns.value.includes("grandma2")) {
                filecontent = parseMA2XML(xmlDoc, file.name);
            }else if(xmlDoc.getElementsByTagName("GMA3").length > 0){
                // TODO: print error for only supporting custom exporter
            }
        }else if(file.type === "application/json"){
            filecontent = JSON.parse(reader.result);
            if(filecontent.Version != "GMA3") return;
            filecontent.exportTime = new Date(filecontent.exportTime).toLocaleString();
        }
        if(filecontent){
            document.getElementById("pdfgen").style.display = "";
            filename = file.name;
            loadperlayerconfig(filecontent.data);
        }
        },
        false,
    );

    if (file) {
        reader.readAsText(file);
    }
}

function parseCSV(csv, filename) {
    var table = {};
    var data = {};
    lines = csv.replace(/\"/g, "").split("\n");
    headers = lines[0].split(";");
    layerlistpos = headers.indexOf("Layer");
    headers[headers.indexOf("Fix ID")] = "FixtureID";
    headers[headers.indexOf("Ch ID")] = "ChannelID";
    layerindex = 1;
    lines.shift();
    lines = lines.filter(function (el) {
        return el != "";
    });
    lines.forEach(function(value, rowindex) {
        rowelements = value.split(";");
        layer = rowelements.splice(layerlistpos, 1);
        temp = {}
        rowelements.forEach(function(value, index) {
            temp[headers[index+1]] = value;
        });
        if(typeof data[layer] === "undefined") {
            data[layer] = {};
            data[layer].index = layerindex++;
        }
        if(typeof data[layer].data === "undefined") data[layer].data = [];
        data[layer].data.push(temp);
    });
    table.showname = filename.replace(/\.[^/.]+$/, "");
    table.exportTime = new Date().toLocaleString();
    table.data = data;
    return table;
}

function parseMA2XML(xmlDoc, filename) {
    var table = {};
    var data = {};
    layers = xmlDoc.getElementsByTagName("Layer");
    for (let layer of layers) {
        if(typeof data[layer] === "undefined"){
            data[layer.attributes.name.value] = {};
            data[layer.attributes.name.value].data = [];
            data[layer.attributes.name.value].index = Number(layer.attributes.index.value);
        }
        fixtures = layer.getElementsByTagName("Fixture");
        for (let fixture of fixtures){
            subfixtures = fixture.getElementsByTagName("SubFixture");
            patch = getPatch(subfixtures);
            if(patch === null) continue;
            temp = {};
            temp.FixtureID = returnIfDefined(fixture.attributes.fixture_id);
            temp.ChannelID = returnIfDefined(fixture.attributes.channel_id, "." + (Number(subfixtures[0].attributes.index.value)+1));
            temp.Name = returnIfDefined(fixture.attributes.name);
            fixtype = fixture.getElementsByTagName("FixtureType")[0];
            temp.FixtureType = returnIfDefined(fixtype.attributes.name);
            temp.Patch = patch;
            temp.DipPatch = getDipPatch(subfixtures);
            temp.Position = getPosition(subfixtures);
            temp.Color = subfixtures[0].attributes.color.value;
            data[layer.attributes.name.value].data.push(temp);
        }
    }
    table.showname = filename.replace(/\.[^/.]+$/, "");
    table.exportTime = new Date(xmlDoc.getElementsByTagName("Info")[0].attributes.datetime.value).toLocaleString();
    table.data = data;
    return table;
}

function parseMA3XML(xmlDoc){
    var data = {};
    layers = xmlDoc.getElementsByTagName("GMA3")[0].children;

    // create 2 lists ( groups and fixtures ) --> fixture children length > 0 --> group else fixture
    for (let layer of layers) {
        if(typeof data[layer] === "undefined"){
            data[layer.attributes.Name.value] = {};
            data[layer.attributes.Name.value].data = [];
            data[layer.attributes.Name.value].index = Number(layer.attributes.FID.value);
        }
        fixtures = layer.getElementsByTagName("Fixture");
        for (let fixture of fixtures){
            subfixtures = fixture.getElementsByTagName("SubFixture");
            console.log(fixture);
            //patch = getPatch(subfixtures);
            patch = fixture.attributes.Patch.value;
            if(patch === null) continue;
            temp = {};
            temp.FixtureID = returnIfDefined(fixture.attributes.FID);
            temp.ChannelID = null;
            //temp.ChannelID = returnIfDefined(fixture.attributes.channel_id, "." + (Number(subfixtures[0].attributes.index.value)+1));
            temp.Name = returnIfDefined(fixture.attributes.name);
            //fixtype = fixture.getElementsByTagName("FixtureType")[0];
            //temp.FixtureType = returnIfDefined(fixtype.attributes.name);
            temp.Patch = patch;
            //temp.DipPatch = getDipPatch(subfixtures);
            temp.Position = getPosition(subfixtures);
            //temp.Color = subfixtures[0].attributes.color.value;
            data[layer.attributes.Name.value].data.push(temp);
        }
    }
    return data;
}

function returnIfDefined(element, appendifdefined = ""){
    return (typeof element !== "undefined")?element.value + appendifdefined:null;
}

function getAddress(subfixtures){
    let address;
    if(subfixtures.length === 1){
        address = Number(subfixtures[0].getElementsByTagName("Address")[0].textContent);
    }else{
        let patches = [];
        for(let subfix of subfixtures){
            patches.push(Number(subfix.getElementsByTagName("Address")[0].textContent));
        }
        address = Math.min(...patches);
    }
    return address;
}

function getPatch(subfixtures){
    let address = getAddress(subfixtures);
    return (address !== 0)?Math.ceil(address/512)+"."+('000' + ((address%(512)===0)?(512):(address%(512)))).slice(-3):null;
}

function getDipPatch(subfixtures){
    let address = getAddress(subfixtures);
    if(address !== 0){
        address = (address%(512)===0)?512:address%(512);
        dips = getAllIndexes((address.toString(2)).split("").reverse(), "1");
        dipstring = "";
        dips.forEach( function (element, index) {
            dipstring += (element + 1);
            dipstring += (index === dips.length-1)?(""):(",");
        })
        return dipstring;
    }else{
        return null;
    }
}

function getMiddle(valueArray){
    sum = valueArray.reduce((a, b) => a + b, 0);
    return Number((sum / valueArray.length).toFixed(2));
}

function getPosition(subfixtures){
    let position = {};
    if(subfixtures.length === 1){
        abspos = subfixtures[0].getElementsByTagName("AbsolutePosition")[0];
        if(typeof abspos !== "undefined"){
            abslocation = abspos.getElementsByTagName("Location")[0];
            position.x = abslocation.attributes.x.value;
            position.y = abslocation.attributes.y.value;
            position.z = abslocation.attributes.z.value;
        }
    }else{
        xarray = [];
        yarray = [];
        zarray = [];
        positions = [];
        for(let subfix of subfixtures){
            abspos = subfix.getElementsByTagName("AbsolutePosition")[0];
            if(typeof abspos !== "undefined"){
                absposattr = abspos.getElementsByTagName("Location")[0].attributes;
                xarray.push(Number(absposattr.x.value));
                yarray.push(Number(absposattr.y.value));
                zarray.push(Number(absposattr.z.value));
            }else{
                continue;
            }
        }
        position.x = getMiddle(xarray);
        position.y = getMiddle(yarray);
        position.z = getMiddle(zarray);
    }
    if(typeof position.x === "undefined") position.x = null;
    if(typeof position.y === "undefined") position.y = null;
    if(typeof position.z === "undefined") position.z = null;
    return position;
}

function getAllIndexes(arr, val) {
    var indexes = [], i;
    for(i = 0; i < arr.length; i++)
        if (arr[i] === val)
            indexes.push(i);
    return indexes;
}

function loadperlayerconfig(filecontent){
    document.getElementById("perlayerconfig").innerHTML = "";
    Object.keys(filecontent).forEach(element => {
        layerdiv = document.createElement("div");
        layerdiv.classList.add("layerconfig");
        layertext = document.createElement("p");
        layertext.innerHTML = element;
        layertext.classList.add("layerconfigheader");
        table = document.createElement("table");
        table.appendChild(document.createElement("tr"));
        table.appendChild(document.createElement("tr"));
        console.log(table);
        tablerows = table.getElementsByTagName("tr");
        defaultTableHeaders.forEach((entry, index) => {
            //create table header element with setting name
            th = document.createElement("th");
            th.innerHTML = entry.name;
            // create table entry element with switch
            td = document.createElement("td");
            label = document.createElement("label");
            label.classList.add("switch");
            chkbx = document.createElement("input");
            chkbx.type = "checkbox";
            chkbx.name = element;
            chkbx.value = index;
            chkbx.checked = entry.enabled;
            label.appendChild(chkbx);
            slider = document.createElement("span");
            slider.classList.add("slider");
            slider.classList.add("round");
            label.appendChild(slider);
            td.appendChild(label);
            // append created elements to according table rows
            tablerows[0].appendChild(th);
            tablerows[1].appendChild(td);
        });
        layerdiv.appendChild(layertext);
        layerdiv.appendChild(table);
        document.getElementById("perlayerconfig").appendChild(layerdiv);
    });
}
