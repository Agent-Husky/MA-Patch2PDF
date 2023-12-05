//TODO: Idee: Option für zusätzlichen Dip Patch
var pdflayercontent;
var temptable;
var dd;

function getbase64(imgsrcid){
    const imgToExport = imgsrcid;
    var canvas = document.createElement('canvas');
    canvas.width = imgToExport.width;
    canvas.height = imgToExport.height;
    canvas.getContext('2d').drawImage(imgToExport,0,0);
    return canvas.toDataURL('image/png');
}

function pdfgen(filedata, filename){
    pdflayercontent = [];
    layerindexes = [];
    Object.values(filedata).forEach(data =>{
        layerindexes.push(data.index);
    });
    layerindexes.sort(function(a, b){return a - b});
    Object.entries(filedata).forEach(entry => {
        const [layer, layervalue] = entry;
        layertable = [];
        layertable[0] = [];
        layertable[0].push({
            text: "Layer: "+layer, bold: true, margin: [0, 10, 0, 3], fontSize: 11
        });
        temptable = {
            layout: "fixturetable",
            table: {
                headerRows: 1,
                widths:[25, 25, 30, "*", 130, 70],
                body:[
                    [{text: "Fix ID", style: "layerTableHeader"}, {text: "Ch ID", style: "layerTableHeader"}, {text: "Patch", style: "layerTableHeader"}, {text: "Fixture Name", style: "layerTableHeader"}, {text: "Fixture Type", style: "layerTableHeader"}, {text: "Position (X|Y|Z)", style: "layerTableHeader"}]
                ]
            },
            fontSize: 9
        };
        tablebody = temptable.table.body;
        Object.entries(layervalue.data).forEach(entry => {
            const[fixture, value] = entry;
            tablebody.push([
                {text: value.FixtureID, alignment: "right"},
                {text: value.ChannelID, alignment: "right"},
                {text: value.Patch, alignment: "right"},
                {text: value.Name, alignment: "left"},
                {text: value.FixtureType, alignment: "left"},
                ((/\.[^/.]+$/).exec(filename)[0] === ".xml" && value.Position.x !== null && value.Position.y !== null && value.Position.z !== null)?
                    {text: "( "+ value.Position.x + " | " + value.Position.y + " | " + value.Position.z + " )", alignment: "left"} :
                    ""
            ]);
        });
        layertable[0].push(temptable);
        pdflayercontent[layerindexes.indexOf(layervalue.index)] = layertable;
    });

    dd = {
        pageMargins: [60,110,60,50],
        header: function() {
            return [{
            columns: [
                {},
                {
                    margin:[0, 0, 0, 0],
                    fit: [150, 40],
                    image: getbase64(document.getElementById("Logo")),
                    alignment:'right'

                }
            ], margin: [20, 20, 20, 0]
            }, {
            canvas: [{ type: 'line', x1: 20, y1: 10, x2: 595-20, y2: 10, lineWidth: 1 }]
            },
            {
                layout: "fileheader",
                table: {
                    widths: ["auto", "auto", "auto", "*"],
                    body:[
                        [{
                        text: "Show:", bold: true
                        
                    }, {
                        text: filename.replace(/\.[^/.]+$/, "")
                    }, {
                        text: "Export Date:", bold: true
                    }, {
                        text: ((/\.[^/.]+$/).exec(filename)[0] === ".xml")?
                            new Date(xmlDoc.getElementsByTagName("Info")[0].attributes.datetime.value).toLocaleString():
                            new Date().toLocaleString()
                    }]
                    ]
                },
                margin: [60, 10, 60, 0],
                fontSize: 11
            }
        ]
        },
        footer: [{
            columns: [
                {},
                {
                    margin: [0, 30, 30, 0],
                    text: [{text: "MA Patch to PDF", bold: true},  {text: " by Jannik Heym"}],
                    fontSize: 8,
                    alignment: "right"
                }]
            
        }],
        content: [{
            layout: "layertable",
            margin: [0,0,0,0],
            table:
            {
                widths: ["*"],
                body: pdflayercontent
            }
        }],
        styles: {
            layerTableHeader: {
                alignment: "left",
                color: "#ffffff"
            }
        }
    }
}

pdfMake.tableLayouts = {
    fileheader: {
        vLineWidth: function (i) {
            if(i!=0 && i!=4){
                    return 0;
            }else{
                return 1;
            }
        },
        paddingLeft: function (i) {
            return i === 0 ? 5 : 0;
        },
        paddingRight: function (i) {
            if(i===1 || i===3){
                return 10;
            }else{
                return 5;
            }
        }
    },
    fixturetable: {
        fillColor: function (rowIndex, node, columnIndex) {
            if(rowIndex === 0){
                return "#707070";
            }else if(rowIndex % 2 === 1){
                return "#dedede";
            }else{
                return null;
            }
        }
    },
    layertable: {
        paddingLeft: function(i, node) { return 0; },
        paddingRight: function(i, node) { return 0; },
        paddingTop: function(i, node) { return 0; },
        paddingBottom: function(i, node) { return 0; },
        vLineWidth: function(i) { return 0 },
        hLineWidth: function(i) { return 0 }
    }
};
