var manager;
var slideSpeed = 300;
// localStorage.clear();
$(window).on('load', function() { manager = new Manager(); });

window.onbeforeunload = function(e) {
    if (manager.wiping) return;
    manager.saveAll();
    //return ''; //causes 'Are you sure you want to leave?'
}

function CreateElement(_type, _parent, _class, _text) {
    let ret = document.createElement(_type);
    if (_class) $(ret).addClass(_class);
    if (_text) $(ret).text(_text);
    if (_parent) $(_parent).append(ret);
    return ret;
}