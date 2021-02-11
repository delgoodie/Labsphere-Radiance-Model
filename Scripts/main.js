const SERVER_PATH = 'http://localhost:3000';
const SLIDE_SPEED = 300;
var FluxData = {};
var LampData = {};

$(window).on('load', function() { IO.LoadResources().then(Manager.Initialize); });

$(window).on('click', function(e) { if (!$(e.target).hasClass('param-dropfield') && !$(e.target).hasClass('param-dropvalue')) $('.param-dropcontent:visible').slideUp(100); });

window.onbeforeunload = function(e) { Manager.Unload(); /*return ''; //causes 'Are you sure you want to leave?'*/ }

function CreateElement(_type, _parent, _class, _text) {
    let ret = document.createElement(_type);
    if (_class) $(ret).addClass(_class);
    if (_text) $(ret).text(_text);
    if (_parent) $(_parent).append(ret);
    return ret;
}