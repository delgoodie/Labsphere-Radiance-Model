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
            fileReader.onload = function (e) { res(JSON.parse(e.target.result)); }
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

    static async LoadResources(_email, _password) {
        let promises = [];
        await fetch(`http://www.labspheretools.com/lamp?email=${_email}&password=${_password}&name=*`, { method: 'GET' }).then(res => res.json().then(json => {
            json.forEach(l => {
                LampData[l.name.replaceAll('_', ' ')] = { portDiameter: l.port_diameter, va: l.va == 1, type: l.type, power: l.power, voltage: l.voltage };
                FluxData[l.name.replaceAll('_', ' ')] = l.flux;
            });
        }));
        return Promise.all(promises);
    }
    //Update Web Path
    static async LoginUser(_email, _password) {
        return fetch(`http://www.labspheretools.com/user?email=${_email}&password=${_password}`, { method: 'GET' }).then(res => res.status == 200 ? res.json() : null);
    }

    static async ClearUser(_email, _password) {
        navigator.sendBeacon(`http://www.labspheretools.com/user?email=${_email}&password=${_password}`, '{}')
    }

    static SaveUser(_email, _password, _json) {
        navigator.sendBeacon(`http://www.labspheretools.com/user?email=${_email}&password=${_password}`, JSON.stringify(_json))
    }
}