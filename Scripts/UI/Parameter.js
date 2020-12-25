class Parameter {
    static DOWN = 0;
    static RIGHT = 1;
    constructor(_top, _parent, _classes = {}, _field = '', _direction = Parameter.DOWN, _updateValue = () => {}, d = {}) {
        this.top = _top;
        this.parent = _parent;
        this.classes = _classes;
        this.direction = _direction;
        this.updateValue = _updateValue;

        if ('content' in d) this.content = d.content;

        this.element = document.createElement('div');
        $(document.body).on('darkMode', function(e) { this.toggleDarkMode(e.detail.state); }.bind(this));
        $(this.element).addClass('param-container-' + (this.direction == Parameter.DOWN ? 'down' : 'right'));
        $(this.parent).append(this.element);

        this.field = document.createElement('div');
        $(this.element).on('mouseenter', function() { $(this.fieldElement).addClass('param-focused'); }.bind(this));
        $(this.element).on('mouseleave', function() { $(this.fieldElement).removeClass('param-focused'); }.bind(this));
        $(this.field).text(_field);
        $(this.field).addClass('param-field');
        this.orient(this.field);
        $(this.element).append(this.field);

        this.createOutput(d);

        if ('container' in this.classes) $(this.element).addClass(this.classes.container);
        if ('field' in this.classes) $(this.field).addClass(this.classes.field);
        if ('value' in this.classes) $(this.value).addClass(this.classes.value);
    }

    createOutput(d) {
        this.value = document.createElement('div');
        $(this.value).addClass('param-default');
        $(this.value).text(d.value ? d.value : '');
        this.orient(this.value);
        $(this.element).append(this.value);
    }

    set val(x) {
        $(this.value).text(x);
    }

    get val() {
        return $(this.value).text().match(/[^0-9.]/) ? $(this.value).text() : $(this.value).text() * 1;
    }


    orient(element) {
        switch (this.direction) {
            case Parameter.DOWN:
                $(element).addClass('param-down');
                break;
            case Parameter.RIGHT:
                $(element).addClass('param-right');
                break;
        }
    }

    toggleDarkMode(s) {
        $(this.element).toggleClass('param-container-dark', s);
        if ('darkContainer' in this.classes) $(this.element).toggleClass(this.classes.darkContainer, s);

        $(this.field).toggleClass('param-field-dark', s);
        $(this.value).toggleClass('param-value-dark', s);
    }
}

class Input extends Parameter {
    constructor(_top, _parent, _classes = {}, _field = '', _direction = Parameter.DOWN, _updateValue = () => {}, d = {}) {
        super(_top, _parent, _classes, _field, _direction, _updateValue, d);
    }

    createOutput(d) {
        this.value = document.createElement('input');
        $(this.value).attr('type', 'text');
        $(this.value).addClass('param-input');
        $(this.value).val(d.value ? d.value : '');
        $(this.value).change(function() { this.updateValue(this.value); }.bind(this));
        this.orient(this.value);
        $(this.element).append(this.value);
    }

    set val(x) {
        $(this.value).val(x);
    }

    get val() {
        return $(this.value).val().match(/[^0-9^.]/) ? $(this.value).val() : $(this.value).val() * 1;
    }
}

class Dropdown extends Parameter {
    constructor(_top, _parent, _classes = {}, _field = '', _direction = Parameter.DOWN, _updateValue = () => {}, d = {}) {
        super(_top, _parent, _classes, _field, _direction, _updateValue, d);
        if ('dropdown' in this.classes) $(this.dropdown).addClass(this.classes.dropdown);
        if ('dropcontent' in this.classes) $(this.dropcontent).addClass(this.classes.dropcontent);
    }

    createOutput(d) {
        this.dropdown = document.createElement('div');
        $(this.dropdown).addClass('param-dropdown');
        this.orient(this.dropdown);
        $(this.element).append(this.dropdown);

        this.value = document.createElement('div');
        $(this.value).text(d.value ? d.value : '');
        $(this.value).addClass('param-dropfield');
        $(this.dropdown).append(this.value);


        this.dropcontent = document.createElement('div');
        $(this.dropcontent).addClass('param-dropcontent');
        $(this.dropcontent).hide();
        $(this.dropdown).append(this.dropcontent);

        $(this.dropdown).on('click', function() {
            if ($(this.dropcontent).is(':visible')) $(this.dropcontent).slideUp(100);
            else $(this.dropcontent).slideDown(100);
        }.bind(this));

        this.update(d.content);
    }

    set val(x) {
        $(this.value).text(x);
    }

    get val() {
        return $(this.value).text().match(/[^0-9.]/) ? $(this.value).text() : $(this.value).text() * 1;
    }

    update(content) {
        $(this.dropcontent).empty();
        content.forEach(e => {
            let div = document.createElement('div');
            $(div).addClass('param-dropvalue');
            if ('dropvalue' in this.classes) $(div).addClass(this.classes.dropvalue);
            $(div).on('click', function() {
                $(this.value).text(e);
                this.updateValue(e);
            }.bind(this));
            $(div).text(e);
            $(this.dropcontent).append(div);
        });
    }
}

class Toggle extends Parameter {
    constructor(_top, _parent, _classes = {}, _field = '', _direction = Parameter.DOWN, _updateValue = () => {}, d = {}) {
        super(_top, _parent, _classes, _field, _direction, _updateValue, d);
    }

    createOutput(d) {
        this.toggleIndex = 0;
        this.value = document.createElement('div');
        $(this.value).addClass('param-toggle');
        $(this.value).text(d.value ? d.value : '');

        $(this.value).on('click', function() {
            this.toggleIndex++;
            this.toggleIndex %= this.content.length;
            $(this.value).text(this.content[this.toggleIndex]);
            this.updateValue(this.content[this.toggleIndex]);
        }.bind(this));

        this.orient(this.value);
        $(this.element).append(this.value);
    }

    set val(x) {
        if (this.content.indexOf(x) != -1) this.toggleIndex = this.content.indexOf(x);
        $(this.value).text(x);
    }

    get val() {
        return $(this.value).text().match(/[^0-9.]/) ? $(this.value).text() : $(this.value).text() * 1;
    }

    update(content) {
        this.content = content;
        $(this.value).text(this.content[this.toggleIndex]);
    }
}

class Upload extends Parameter {
    constructor(_top, _parent, _classes = {}, _field = '', _direction = Parameter.DOWN, _updateValue = () => {}, d = {}) {
        super(_top, _parent, _classes, _field, _direction, _updateValue, d);
    }

    createOutput(d) {
        this.value = document.createElement('input');
        $(this.value).attr('type', 'file');
        $(this.value).attr('accept', d.accept);
        $(this.value).addClass('param-toggle');
        $(this.element).append(this.value);
        $(this.value).on('change', d.change);
    }

    set val(x) {
        console.error('can\'t set value of Upload Parameter');
    }

    get val() {
        return $(this.value).val();
    }
}

$(window).on('click', function(e) { if (!$(e.target).hasClass('param-dropfield') && !$(e.target).hasClass('param-dropvalue')) $('.param-dropcontent:visible').slideUp(100); });