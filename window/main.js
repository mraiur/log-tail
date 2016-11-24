var tabHTML = "&nbsp;&nbsp;";

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
    var output = document.getElementById('output');
    var fileEl = document.getElementById('file_name');
    var modifyTimeEl = document.getElementById('modify_time');

    var socket = io();
    var cache = {};

    socket.on('update', function (data)
    {
        if( cache[data.file] && cache[data.file].meta.ctime == data.meta.ctime )
        {
            var newData = data.content.substr(cache[data.file].length, data.content.length);
            output.innerHTML += format(newData);
        }
        else
        {
            output.innerHTML = format(data.content);
            cache[data.file] = data;
            cache[data.file].html = output.innerHTML;
        }

        if( data.file )
        {
            fileEl.innerHTML = data.file;
        }

        if( data.meta )
        {
            modifyTimeEl.innerHTML = (data.meta.mtime)?data.meta.mtime:data.meta.ctime;
        }

        scroll(0, output.scrollHeight);
    });
})();
