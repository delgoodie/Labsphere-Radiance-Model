const SLIDE_SPEED = 300;
const NEWS = [
    "Tab duplicating is now an available by right-clicking on the tab",
    "Lamps that come with VAs will now be tunable through the VA slider in the Lamp Table",
    "Global / local tab status is now saved between sessions an defaults to local",
    "Radiance Models in Excel sheets will now also fill the model metadata if it is provided in the correct format.Format for model data can be found by downloading a model in the bottom right corner of the radiance graph."
];

$(window).on('load', Manager.Initialize);

$(window).on('click', function(e) { if (!$(e.target).hasClass('param-dropfield') && !$(e.target).hasClass('param-dropvalue')) $('.param-dropcontent:visible').slideUp(100); });

window.onbeforeunload = Manager.Unload;

function CreateElement(_type, _parent, _class, _text) {
    let element = document.createElement(_type);
    if (_class) $(element).addClass(_class);
    if (_text) $(element).text(_text);
    if (_parent) $(_parent).append(element);
    return element;
}