var settingsCollapsed = false;
var tabHTML = "&nbsp;&nbsp;";
var autoScroll = true;
var renderOutput = true;
var fileName;

function format(text)
{
    var rows = text
        .replace(/(?:\r\n|\r|\n)/g, '\n')
        .replace(/(?:\t)/g, tabHTML )
        .split("\n");
    var line, letter;

    for( var i = 0, l = rows.length; i < l; i++ )
    {
        line = rows[i];
        letter = 0;

        while( line[letter] == ' ' && letter < line.length )
        {
            letter++;
        }

        rows[i] = tabHTML.repeat(letter)+ line.substr(letter);
    }

    return rows.join("<br />");
}
(function() {
    var socket = io();
    var cache = {};
    var outputContainer = document.getElementById("output-container");
    var output = document.getElementById('output');
    var fileEl = document.getElementById('file_name');
    var modifyTimeEl = document.getElementById('modify_time');
    var toggleSettingsBtn = document.getElementById('collapse_settings_bar');
    var autoScrollCheckbox = document.getElementById('autoScroll');
    var renderOutputCheckbox = document.getElementById('renderOutput');
    var settingsBar = document.getElementById('settings_bar');

    var setSettingsUIState = function(){
        if( settingsCollapsed )
        {
            toggleSettingsBtn.innerHTML= "↓";
            settingsBar.classList.add('collapsed');
        }
        else
        {
            toggleSettingsBtn.innerHTML= "↑";
            settingsBar.classList.remove('collapsed');
        }
    };

    toggleSettingsBtn.addEventListener('click', function(){
        settingsCollapsed = !settingsCollapsed;
        setSettingsUIState();
        localStorage.setItem('settingsCollapsed', settingsCollapsed);
    });

    if( localStorage.getItem('settingsCollapsed') === "true" )
    {
        settingsCollapsed = true;
        setSettingsUIState();
    }
    

    autoScrollCheckbox.addEventListener('change', function() { 
        autoScroll = this.checked;
        localStorage.setItem('autoScroll', this.checked);
    });


    if( localStorage.getItem('autoScroll') === "false" )
    {
        autoScroll = false;
        autoScrollCheckbox.checked = false;
        setTimeout( function(){
            scroll(0, 0);
        }, 500);
    }
    
    renderOutputCheckbox.addEventListener('change', function() { 

        renderOutput = this.checked;
        localStorage.setItem('renderOutput', this.checked);

        if( renderOutput )
        {
            var el = document.createElement("div");
        }
        else
        {
            var el = document.createElement("textarea");
        }
        
        el.id="output";
        
        output.replaceWith(el);
        output = document.getElementById('output');
    });

    if( localStorage.getItem('renderOutput') === "false" )
    {
        renderOutput = false;
        renderOutputCheckbox.checked = false;
    }

    socket.on('update', function (data)
    {
        fileName = data.file;
        if( cache[data.file] && data.content.length >= cache[data.file].content.length )
        {
            console.log("update content", data.file);

            var newData = data.content.substr(cache[data.file].content.length, data.content.length);
            output.innerHTML += format(newData);
            cache[data.file] = data;
        }
        else
        {
            console.log("refresh content", data.file);

            cache[data.file] = data;
            cache[data.file].html = output.innerHTML;

            if( renderOutput )
            {
                output.innerHTML = format(data.content);    
            }
            else
            {
                output.value = data.content;
            }
        }


        if( data.file )
        {
            fileEl.innerHTML = data.file;
        }

        if( data.meta )
        {
            modifyTimeEl.innerHTML = (data.meta.mtime)?data.meta.mtime:data.meta.ctime;
        }

        if(autoScroll)
        {
            scroll(0, output.scrollHeight);
        }
    });
})();
