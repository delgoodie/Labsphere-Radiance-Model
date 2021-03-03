class Button {
    static get TOGGLE() { return 0; }
    static get ACTION() { return 1; }
    constructor(_top, _parent, _icon = '', _type = Button.ACTION, _updateValue = (i = false) => {}, _d = {}) {
        this.top = _top;
        this.parent = _parent;
        this.updateValue = _updateValue;
        this.type = _type;

        this.element = CreateElement('i', this.parent, 'fas fa-' + _icon);
        $(document.body).on('darkMode', function(e) { this.toggleDarkMode(e.detail.state); }.bind(this));
        $(this.element).on('click', function(e) {
            e.preventDefault();
            e.stopPropagation();
        });

        if ('tooltip' in _d) {
            this.tooltip = _d.tooltip;
            $(this.element).attr('title', this.getToolTip());
            $(this.element).tooltip({
                classes: {
                    'ui-tooltip': 'ui-button-tooltip'
                }
            });
        }


        switch (this.type) {
            case Button.TOGGLE:
                this.state = _d.state;
                $(this.element).on('click', function(e) { this.toggle(); }.bind(this));
                break;
            case Button.ACTION:
                $(this.element).on('click', function() { this.updateValue(); }.bind(this));
                break;
            case Button.DOWNLOAD:
                this.download = document.createElement('a');
                $(this.download).attr('download', _d.fileName);
                $(this.download).append(this.image);
                $(this.element).on('click', function(e) { this.updateValue(); }.bind(this));
                $(this.element).append(this.download);
                break;
        }
    }

    get val() {
        if (this.type == Button.TOGGLE) return this.state;
        else return undefined;
    }

    set val(x) {
        if (this.type == Button.TOGGLE) {
            this.state = x;
            $(this.element).attr('title', this.getToolTip());
            this.updateValue(this.state);
            if (this.tooltip) $(this.element).tooltip('close');
            $(this.element).css('opacity', this.state ? 1 : .5);
        }
    }

    update(d) {
        if (d && 'filename' in d) {
            $(this.download).attr('download', d.filename);
        }
    }

    getToolTip() {
        if (this.type == Button.TOGGLE) {
            if (this.state) return this.tooltip[0];
            else return this.tooltip[1];
        } else {
            return this.tooltip;
        }
    }

    toggle(s) {
        if (this.type == Button.TOGGLE) {
            this.state = !this.state;
            $(this.element).attr('title', this.getToolTip());
            this.updateValue(this.state);
            if (this.tooltip) $(this.element).tooltip('close');
            $(this.element).css('opacity', this.state ? 1 : .5);
        }
    }

    toggleDarkMode(s) {
        $(this.element).css('color', s ? 'white' : 'black');
    }
}