class Pane {
    constructor(_top, _parent, _classes = {}, _updateValue = () => {}, _d = {}) {
        this.top = _top;
        this.parent = _parent;
        this.classes = _classes;
        this.updateValue = _updateValue;

        this.element = document.createElement('div');
        $(document.body).on('darkMode', function(e) {
            this.toggleDarkMode(e.detail.state);
            this.defaultToggleDarkMode(e.detail.state);
        }.bind(this));
        $(this.element).addClass('pane-container');
        if ('width' in _d) $(this.element).css('width', _d.width);
        if ('height' in _d) $(this.element).css('height', _d.height);
        if ('top' in _d) $(this.element).css('top', _d.top);
        if ('left' in _d) $(this.element).css('left', _d.left);
        $(this.parent).append(this.element);
        if ('draggable' in _d && _d.draggable) $(this.element).draggable({});

        if (!'disableDefaultOnCreate' in _d || !_d.disableDefaultOnCreate) this.defaultOnCreate(_d);
        else this.onCreate(_d);

        if ('container' in this.classes) $(this.element).addClass(this.classes.container);
    }

    update() {}

    onCreate(_d) {}
    onClose() {}
    onSelect() {}
    toggleDarkMode(s) {}

    defaultOnCreate(_d) {
        $(this.element).hide();
        if ('update' in _d) this.update = _d.update;
        this.title = document.createElement('div');
        $(this.title).addClass('pane-title');
        if ('title' in _d) $(this.title).text(_d.title);
        else $(this.title).text('Pane');
        $(this.element).append(this.title);

        this.close = new Button(this.top, this.element, 'times pane-close', Button.ACTION, () => {
            this.onClose();
            if ('onClose' in _d) _d.onClose(this);
            if (!'disableDefaultOnClose' in _d || !_d.disableDefaultOnClose) this.defaultOnClose();
        });

        this.onCreate();
        if ('onCreate' in _d) _d.onCreate(this);

        if (!'disableSelect' in _d || !_d.disableSelect) {
            this.select = document.createElement('div');
            $(this.select).addClass('pane-select');
            if ('select' in _d) $(this.select).text(_d.select);
            else $(this.select).text('Select');
            $(this.element).append(this.select);
        }

        if (!'disableSelect' in _d || !_d.disableSelect) {
            $(this.select).on('click', function() {
                this.onSelect();
                if ('onSelect' in _d) _d.onSelect(this);
                if (!'disableDefaultOnSelect' in _d || !_d.disableDefaultOnSelect) this.defaultOnSelect();
            }.bind(this));
        }
    }
    defaultOnClose() {
        $(this.element).slideUp(SLIDE_SPEED);
    }
    defaultOnSelect() {
        $(this.element).slideUp(SLIDE_SPEED);
    }

    defaultToggleDarkMode(s) {
        $(this.element).toggleClass('dark1', s);
        $(this.title).toggleClass('pane-title-dark', s);
        $(this.select).toggleClass('dark3', s);
    }
}