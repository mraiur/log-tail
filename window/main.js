function format(text){
    return text.replace(/(?:\r\n|\r|\n)/g, '<br />');
}
(function() {
    var output = document.getElementById('output');
    var socket = io();
    var cache = {};

    socket.on('update', function (data) {
        if( cache[data.file] ) {
            var newData = data.content.substr(cache[data.file].length, data.content.length);
            output.innerHTML += format(newData);
        }
        else
        {
            output.innerHTML = format(data.content);
        }
        cache[data.file] = data.content;
        scroll(0, output.scrollHeight);
    });
})();