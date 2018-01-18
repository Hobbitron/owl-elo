var fs = require('fs'),
    path = require('path'),
    filePath = path.join('data.txt');

export function getTeamData(teamname) {
    fs.readFile(filePath, { encoding: 'utf-8' }, function(err, data) {
        if (!err) {
            console.log('received data: ' + data);
            response.writeHead(200, { 'Content-Type': 'text/html' });
            response.write(data);
            response.end();
        } else {
            console.log(err);
        }
    });
}