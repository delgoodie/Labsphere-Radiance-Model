class LampSelector extends Pane {
    constructor(_top, _parent, _id = -1, _classes = {}, _updateValue = () => {}, _d) {
        super(_top, _parent, _id, _classes, _updateValue, {
            width: '22vw',
            height: '40vh',
            top: '45vh',
            left: '30vw',
            draggable: true,
            title: 'Lamp Selector',
            disableDefaultOnCreate: false,
            disableDefaultOnClose: false,
            disableDefaultOnSelect: false,
        });
        this.selectedLamp = '';

        this.update();

        if ('container' in this.classes) $(this.element).addClass(this.classes.container);
    }

    onCreate(_d) {
        this.lamp = document.createElement('div');
        $(this.lamp).addClass('ls-lamp-container');
        $(this.element).append(this.lamp);

        this.type = new Dropdown(this.top, this.element, { container: 'ls-type-container', field: 'ls-type-field', dropdown: 'ls-type-dropdown', dropfield: 'ls-type-dropfield' }, 'Type', Parameter.RIGHT, () => this.update(), { content: ['All', 'QTH Internal', 'QTH External', 'Xenon', 'Plasma'], value: 'All' });

        this.derated = new Toggle(this.top, this.element, { container: 'ls-derated-container', field: 'ls-derated-field', value: 'ls-derated-toggle' }, 'Derated', Parameter.RIGHT, () => this.update(), { content: ['NO', 'YES'], value: 'NO' });

        this.power = new Input(this.top, this.element, { container: 'ls-power-container', field: 'ls-power-field', value: 'ls-power-input' }, 'Power', Parameter.RIGHT, () => this.update(), { value: '' });
    }
    onClose() {}
    onSelect() {
        if (this.selectedLamp != '') {
            this.updateValue(this.selectedLamp);
        }
    }


    update() {
        let content = Object.getOwnPropertyNames(LampData).filter(n => ((LampData[n].type == this.type.val || this.type.val == 'All') && (LampData[n].power == this.power.val || (this.power.val == 0 || this.power.val == ''))) && (!(this.type.val == 'QTH Internal' || this.type.val == 'QTH External') || (n.substring(n.length - 4, n.length) != '2856' && this.derated.val == 'NO' || n.substring(n.length - 4, n.length) == '2856' && this.derated.val == 'YES'))).map(n => ({ text: n }));

        if (content.length == 0) $(this.power.input).css('background-color', 'lightcoral');
        else $(this.power.input).css('background-color', (this.top.darkMode.val ? 'black' : 'white'));
        if (content.length > 5) $(this.lamp.dropcontent).css('height', '30vh');
        else $(this.lamp.dropcontent).css('height', 'auto');
        if (!content.some(l => l.text == this.selectedLamp)) this.selectedLamp = '';

        this.populateLamp({ content: content });
    }

    populateLamp(d) {
        $(this.lamp).empty();
        d.content.forEach(e => {
            let div = document.createElement('div');
            $(div).addClass('ls-lamp-value');
            if (this.selectedLamp == e.text) $(div).addClass('ls-lamp-selected');

            $(div).on('click', function() {
                this.selectedLamp = e.text;
                $(this.lamp).children().removeClass('ls-lamp-selected');
                $(div).addClass('ls-lamp-selected');
            }.bind(this));

            $(div).text(e.text);
            $(this.lamp).append(div);
        });
    }

    toggleDarkMode(s) {
        $(this.element).toggleClass('ls-container-dark', s);
        $(this.title).toggleClass('ls-title-dark', s);
        $(this.close).toggleClass('ls-close-dark', s);
        $(this.select).toggleClass('ls-select-dark', s);
        this.update();
    }
}