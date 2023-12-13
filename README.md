# MA-Patch2PDF

## Usage
### General

Due to cross-site scripting, one is sadly unable to fetch local config files.
For this reason, it is necessary to host a (local) web server to use the ```default_config.json```.

Just start the web server, load the file, select the fields you want to list for each layer/group and hit ```Open PDF```

For Mac, the [Simple Web Server](https://apps.apple.com/de/app/simple-web-server/id1625925255?mt=12) has proven to be quite reliable.

### MA2

From MA2 you simply go to ```Patch & Fixture Schedule```, select the layers you want, and hit ```Export```.<br>
XML files support additional information in comparison to CSV such as positions, export-time etc.

### MA3

Due to changes in the exported XML file structure, MA3 is only supported in combination with the here also available Exporter Plugin.<br>
The tables are being separated by Group fixtures.


### Adding your own logo

To add your own Logo to the selector, copy your image to the ```include``` directory and open ```default_config.json``` with a text editor of your choice.<br>
Copy and paste one of the already existing blocks and edit it according to your logo, like the following:
```
{
  "displayName": "Your_Logo_Name",
  "filePath": "./include/your_logo_filename.png"
},
```

### Changing default config

To edit the default configuration, open ```default_config.json``` with a text editor of your choice.<br>
Under ```tableHeaders``` are all selectable table elements listed. Every Element consists of multiple attributes such as ```enabled```, ```name``` and ```width```.<br>
To change the default switch state, change the attribute ```enabled``` to ```true``` to enable it by default and ```false``` for the opposite.<br> 
To change the name of the table header, edit the attribute ```name```.<br>
Do the same to edit the row width with the attribute ```width```.


## Development

You are free to contribute to this little project by either providing suggestions or even developing yourself.<br>
I recommend using VS Code with Live Server to instantly see changes without having to reload.


Have fun with this little tool.
