var manager;
var slideSpeed = 300;


$(window).on('load', function() { manager = new Manager(); });
$(window).on('click', function(e) { if (!$(e.target).hasClass('param-dropfield') && !$(e.target).hasClass('param-dropvalue')) $('.param-dropcontent:visible').slideUp(100); });




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