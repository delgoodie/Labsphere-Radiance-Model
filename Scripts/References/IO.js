class IO {
    static async ParseExcel(file) { //e.dataTransfer.files[0]   e.target.files[0]
        return new Promise((res, rej) => {
            let fileReader = new FileReader();
            fileReader.readAsBinaryString(file);
            let retData = [];
            fileReader.onload = (event) => {
                let data = event.target.result;
                let workbook = XLSX.read(data, { type: 'binary' });
                workbook.SheetNames.forEach(sheet => {
                    for (let i = 1; true; i++) {
                        if ((String.fromCharCode(64 + i) + '1') in workbook.Sheets[sheet] || (String.fromCharCode(64 + i) + '2') in workbook.Sheets[sheet]) {
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
    }

    static async ParseJSON(file) { //e.dataTransfer.files[0]   e.target.files[0]
        return new Promise((res, rej) => {
            let fileReader = new FileReader();
            fileReader.onload = function(e) { res(JSON.parse(e.target.result)); }
            fileReader.readAsText(file);
        });
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

    static LocalStorage(json) {
        if (json) {
            localStorage.clear();
            localStorage.setItem('data', JSON.stringify(json));
            return json;
        } else return JSON.parse(localStorage.getItem('data'));
    }
}