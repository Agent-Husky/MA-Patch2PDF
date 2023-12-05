var filecontent;
var filename;

function readFile(){
    const content = document.getElementById("testcontent");
    const [file] = document.querySelector("input[type=file]").files;
    const reader = new FileReader();

    reader.addEventListener(
        "load",
        () => {
        if(file.type === "text/csv"){
            filecontent = parseCSV(reader.result);
        }else if(file.type === "text/xml"){
            filecontent = parseXML(reader.result);
        }
        filename = file.name;
        },
        false,
    );

    if (file) {
        reader.readAsText(file);
    }
}

function parseCSV(csv) {
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
    return data;
}

function parseXML(xml) {
    var data = {};
    parser = new DOMParser();
    xmlDoc = parser.parseFromString(xml,"text/xml");
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
            temp.Position = getPosition(subfixtures);
            temp.Color = subfixtures[0].attributes.color.value;
            data[layer.attributes.name.value].data.push(temp);
        }
    }
    return data;
}

function returnIfDefined(element, appendifdefined = ""){
    return (typeof element !== "undefined")?element.value + appendifdefined:null;
}

function getPatch(subfixtures){
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
    return (address !== 0)?Math.ceil(address/512)+"."+('000' + address%512).slice(-3):null;
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