function customExportJson(exportPath, table)
    local json = require "json";
    local encoded = json.encode(table);
    local file = io.open(exportPath,'w');
    file:write(encoded);
    file:close();
    return true;
end

local function createdir(path)
    local lfs = require("lfs");
	local f=io.open(path,"r")
	if f~=nil then
		io.close(f)
		return false;
	else
        lfs.mkdir(path);
		return true;
	end
end

local function intoreverseBinary(n)
	local binNum = ""
	if n ~= 0 then
		while n >= 1 do
			if n %2 == 0 then
				binNum = binNum .. "0"
				n = n / 2
			else
				binNum = binNum .. "1"
				n = (n-1)/2
			end
		end
	else
		binNum = "0"
	end
	return binNum
end

local function getDipPatch(revbin)
    local DipString = "";
    for i=1,string.len(revbin) do
        if (string.sub(revbin, i, i) == "1") then
            if(string.len(DipString) ~= 0) then
                DipString = DipString .. "+";
            end
            DipString = DipString .. i;
        end
    end
    return DipString;
end

local function roundTo2Dec(num)
    return (math.floor(num * 100 + 0.5)/100);
end

local function main()
    local data = {};
    local stagetable = {};

    for stagekey, stage in pairs(Patch().Stages:Children()) do
        stagetable[stage.name] = stagekey;
	end
    local drivetable = {};
    local drivelist = {};
    for drivekey, drive in pairs(Root().Temp.DriveCollect:Children()) do
        drivetable[drive.name] = drivekey;
        table.insert(drivelist, drive.name);
    end


    local defaultCommandButtons = {
        {value = 1, name = "OK"},
        {value = 0, name = "Cancel"}
    }
    local inputFields = {
        {name = "Showname", value = Root().manetsocket.showfile, blackFilter = "!?", vkPlugin = "TextInput"},
        {name = "Filename", value = Root().manetsocket.showfile, blackFilter = ".!?/", vkPlugin="TextInput"}
    }

    local selectorButtons = {
        { name="Drive", selectedValue=1, type=1, values=drivetable},
        { name="Stage", selectedValue=1, type=1, values=stagetable}
    }

    local messageTable = {
        icon = "file",
        title = "Patch2PDFExporter",
        commands = defaultCommandButtons,
        inputs = inputFields,
        selectors = selectorButtons
    }
    local inputTable = MessageBox(messageTable);

    if(inputTable.result == 1) then
        local stageindex = inputTable.selectors.Stage;
        local stage = Patch().Stages[stageindex];
        data.Version = "GMA3";
        data.stagename = stage.name;
        local groups = {};
        for groupkey, group in pairs(stage.Fixtures:Children()) do
            if (group.fixturetype.name == "Universal") then
                goto continue;
            end
            groups[group.fixture.name] = {};
            groups[group.fixture.name].Type = "Group";
            groups[group.fixture.name].index = group.index;
            groups[group.fixture.name].FixtureType = group.fixturetype.name;
            local fixtures = {};
            for fixturekey, fixture in pairs(group:Children()) do
                local temp = {};
                temp = {};
                temp.Name = fixture.name;
                temp.Type = "Fixture";
                local temppatch = {};
                for w in string.gmatch(fixture.patch, "%d+.") do
                    local num = w:gsub("%.", "");
                    table.insert(temppatch, num);
                end
                temp.Patch = fixture.patch;
                temp.DipPatch = getDipPatch(intoreverseBinary(tonumber(temppatch[2])))
                temp.FixtureID = fixture.fid;
                temp.FixtureType = fixture.fixturetype.name;
                temp.Position = {
                    x = roundTo2Dec(fixture.posx),
                    y = roundTo2Dec(fixture.posy),
                    z = roundTo2Dec(fixture.posz)
                };
                table.insert(fixtures, temp);
            end
            groups[group.fixture.name].data = fixtures;
            ::continue::
        end
        data.data = groups;

        --Select Drive
        local driveindex = inputTable.selectors.Drive;
        Cmd("Select Drive " .. (driveindex));
        local exportPath = GetPath(Enums.PathType.Library) .. "/../Patch2PDFExport/";
        createdir(exportPath);

        local showname = inputTable.inputs.Showname;

        local filename = inputTable.inputs.Filename:gsub("[/.]", {["/"] = "", ["."] = ""});
        local filePath = exportPath .. filename .. ".json"

        data.showname = showname;
        data.exportTime = os.date("%Y-%m-%dT%H:%M:%S");
        data.HostOS = HostOS();

        --ExportJson(exportPath, data)
        if (customExportJson(filePath, data)) then
            MessageBox(
            {
                title = "Patch was exported to Drive: " .. drivelist[driveindex] .. "\nas: " .. filename .. ".json",
                commands = {{value = 1, name = "Confirm"}}
            }
        )
        end
    else
        Echo("aborted Patch2PDFExporter");
    end

end

return main