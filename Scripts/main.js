const SERVER_PATH = 'http://localhost:3000';
var manager;
var slideSpeed = 300;
var FluxData = {};
var LampData = {};

$(window).on('load', function() {
    LoadResources().then(() => manager = new Manager());
});
$(window).on('click', function(e) { if (!$(e.target).hasClass('param-dropfield') && !$(e.target).hasClass('param-dropvalue')) $('.param-dropcontent:visible').slideUp(100); });



window.onbeforeunload = function(e) {
    if (manager.wiping) return;
    manager.SaveAll();
    //return ''; //causes 'Are you sure you want to leave?'
}

function CreateElement(_type, _parent, _class, _text) {
    let ret = document.createElement(_type);
    if (_class) $(ret).addClass(_class);
    if (_text) $(ret).text(_text);
    if (_parent) $(_parent).append(ret);
    return ret;
}

async function LoadResources() {
    let promises = [];
    await fetch(SERVER_PATH + '/lamp?name=*', { method: 'GET' }).then(res => res.json().then(json => {
        json.forEach(l => {
            LampData[l.name.replaceAll('_', ' ')] = { portDiameter: l.port_diameter, vaa: l.vaa == 1, type: l.type, power: l.power, voltage: l.voltage };
            promises.push(fetch(SERVER_PATH + '/lamp?name=' + l.name.replaceAll('_', ' '), { method: 'GET' }).then(res => res.json().then(json => FluxData[l.name.replaceAll('_', ' ')] = json.flux)));
        });
    }));
    return Promise.all(promises);
}

/*
Object.getOwnPropertyNames(LampData).forEach((n, i) => {
    if (i != 28) return;
    let flux = {};
    FluxData[n].forEach((f, i) => flux[i + 250] = f);
    var json = JSON.stringify(flux);
    var xhr = new XMLHttpRequest();
    xhr.open("POST", 'http://localhost:3000/lamp?name=' + n + '&portDiameter=' + LampData[n].portDiameter + '&vaa=' + LampData[n].vaa + '&type=' + LampData[n].type + '&power=' + LampData[n].power + '&voltage=' + LampData[n].voltage);
    xhr.setRequestHeader("Content-Type", "application/json");
    console.log(xhr.send(json));
});
*/