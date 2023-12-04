var filecontent;

function readFile(){
    const content = document.getElementById("testcontent");
    const [file] = document.querySelector("input[type=file]").files;
    const reader = new FileReader();

    reader.addEventListener(
        "load",
        () => {
        // this will then display a text file
        if(file.type === "text/csv"){
            filecontent = parseCSV(reader.result);
        }else if(file.type === "text/xml"){
            filecontent = parseXML(reader.result);
        }
        },
        false,
    );

    if (file) {
        reader.readAsText(file);
    }
}

function parseCSV(csv) {
    var data = {};
    lines = csv.split("\n");
    headers = lines[0].split(";");
    layerlistpos = headers.indexOf("Layer");
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
            temp[headers[index]] = value;
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
            temp = {};
            temp.FixtureID = (typeof fixture.attributes.fixture_id !== "undefined")? fixture.attributes.fixture_id.value : null;
            temp.ChannelID = (typeof fixture.attributes.channel_id !== "undefined")? fixture.attributes.channel_id.value : null;
            temp.Name = (typeof fixture.attributes.name !== "undefined")? fixture.attributes.name.value : null;
            fixtype = fixture.getElementsByTagName("FixtureType")[0];
            temp.FixtureType = (typeof fixtype.attributes.name !== "undefined")? fixtype.attributes.name.value : null;
            subfix = fixture.getElementsByTagName("SubFixture")[0];
            address = subfix.getElementsByTagName("Address")[0].textContent;
            temp.Patch = Math.ceil(address/512)+"."+('000' + address%512).slice(-3);
            abspos = subfix.getElementsByTagName("AbsolutePosition")[0];
            if(typeof abspos !== "undefined"){
                abslocation = abspos.getElementsByTagName("Location")[0];
                temp.Position = {x: abslocation.attributes.x.value, y: abslocation.attributes.y.value, z: abslocation.attributes.z.value};
            }else{
                temp.Position = {x: null, y: null, z: null};
            }
            temp.Color = subfix.attributes.color.value;
            data[layer.attributes.name.value].data.push(temp);
        }
    }
    return data;
}