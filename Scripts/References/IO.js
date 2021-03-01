class IO {
    static async ParseExcel(file) { //e.dataTransfer.files[0]   e.target.files[0]
        let promise = new Promise((res, rej) => {
            let fileReader = new FileReader();
            fileReader.readAsBinaryString(file);
            let retData = [];
            fileReader.onload = (event) => {
                let data = event.target.result;
                let workbook = XLSX.read(data, { type: 'binary' });
                workbook.SheetNames.forEach(sheet => {
                    for (let i = 1; true; i++) {
                        if ((String.fromCharCode(64 + i) + '1') in workbook.Sheets[sheet]) {
                            retData.push([]);
                            for (let j = 1; true; j++)
                                if ((String.fromCharCode(64 + i) + j) in workbook.Sheets[sheet])
                                    retData[i - 1].push(workbook.Sheets[sheet][(String.fromCharCode(64 + i) + j)].v);
                                else break;
                        } else break;
                    }
                });
                res(retData);
            }
        });
        return promise;
    }

    static async ParseJSON(file) { //e.dataTransfer.files[0]   e.target.files[0]
        let promise = new Promise((res, rej) => {
            let fileReader = new FileReader();
            fileReader.onload = function(e) { res(JSON.parse(e.target.result)); }
            fileReader.readAsText(file);
        });
        return promise;
    }

    static DownloadJSON(obj, name) {
        let dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(obj));
        let a = document.createElement('a');
        a.setAttribute('href', dataStr);
        a.setAttribute('download', name + '.json');
        document.body.appendChild(a);
        a.click();
        a.remove();
    }

    static DownloadCSV(content, name) {
        let a = document.createElement('a');
        a.setAttribute('download', name + '.csv');
        $(a).attr('href', URL.createObjectURL(new Blob([content], { type: 'text/csv' })));
        $(document.body).append(a);
        a.click();
        a.remove();
    }

    static async LoadResources() {
        let promises = [];
        await fetch(SERVER_PATH + '/lamp?name=*', { method: 'GET' }).then(res => res.json().then(json => {
            json.forEach(l => {
                LampData[l.name.replaceAll('_', ' ')] = { portDiameter: l.port_diameter, vaa: l.vaa == 1, type: l.type, power: l.power, voltage: l.voltage };
                FluxData[l.name.replaceAll('_', ' ')] = l.flux;
            });
        }));
        return Promise.all(promises);
    }

    static LoginUser = async(_username, _password) => fetch(SERVER_PATH + '/user?email=' + _username + '&password=' + _password, { method: 'GET' }).then(res => res.status == 200 ? res.json() : null);


    static CreateUser = async(_username, _password) => fetch(SERVER_PATH + '/user?email=' + _username + '&password=' + _password, { method: 'POST' }).then(() => IO.Login(_username, _password));


    static async ClearUser(_username, _password) {
        var xhr = new XMLHttpRequest();
        xhr.open('PUT', 'http://localhost:3000/user?email=' + _username + '&password=' + _password);
        xhr.setRequestHeader("Content-Type", "application/json");
        xhr.send('');
        location.reload();
    }

    static async SaveUser(_username, _password, _json) {
        _json = JSON.stringify(_json);
        let xhr = new XMLHttpRequest();
        xhr.open('PUT', 'http://localhost:3000/user?email=' + _username + '&password=' + _password);
        xhr.setRequestHeader("Content-Type", "application/json");
        xhr.send(_json);
    }
}


//UPLOAD LAMP DATA

// Object.getOwnPropertyNames(LampData).forEach((n, i) => {
//     let flux = {};
//     FluxData[n].forEach((f, i) => flux[i + 250] = f);
//     flux.portDiameter = LampData[n].portDiameter;
//     flux.vaa = LampData[n].vaa;
//     flux.type = LampData[n].type;
//     flux.power = LampData[n].power;
//     flux.voltage = LampData[n].voltage;
//     var json = JSON.stringify(flux);
//     var xhr = new XMLHttpRequest();
//     xhr.open("POST", 'http://labspheretools.com/lamp?email=wdelgiudice@labsphere.com&password=10639&name=' + n);
//     xhr.setRequestHeader("Content-Type", "application/json");
//     console.log(xhr.send(json));
// });