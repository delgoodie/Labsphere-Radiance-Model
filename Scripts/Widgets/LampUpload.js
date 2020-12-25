class LampUpload {
    constructor(_top, _parent, _id = -1, _classes = {}, _updateValue = () => {}) {
        this.top = _top;
        this.parent = _parent;
        this.id = _id;
        this.classes = _classes;
        this.flux = [];
        this.updateValue = _updateValue;

        this.element = document.createElement('div');
        $(document.body).on('darkMode', function(e) { this.toggleDarkMode(e.detail.state); }.bind(this));
        $(this.parent).append(this.element);
        $(this.element).attr('id', this.id);
        $(this.element).addClass('lu-container');

        this.name = new Input(this.top, this.element, 238, { container: 'lu-param-wide' }, 'Name', Parameter.DOWN, () => {});

        this.portDiameter = new Input(this.top, this.element, 6486, { container: 'lu-param-short' }, 'Port Diameter (in)', Parameter.DOWN, () => {});

        this.type = new Dropdown(this.top, this.element, 6486, { container: 'lu-param-short' }, 'Type', Parameter.DOWN, () => {}, { content: [{ text: 'HIS', value: 'HIS' }, { text: 'HES', value: 'HES' }, { text: 'Xenon', value: 'Xenon' }, { text: 'Plasma', value: 'Plasma' }, { text: 'Other', value: 'Other' }] })

        this.vaa = new Toggle(this.top, this.element, 6486, { container: 'lu-param-short' }, 'VAA', Parameter.DOWN, () => {}, { content: [{ text: 'true', value: true }, { text: 'false', value: false }] });

        this.power = new Input(this.top, this.element, 353, { container: 'lu-param-short' }, 'Power (W)', Parameter.DOWN, () => {});

        this.description = new Input(this.top, this.element, 238, { container: 'lu-param-wide' }, 'Description', Parameter.DOWN, () => {});


        this.upload = new Upload(this.top, this.element, 238, { container: 'lu-param-wide' }, 'Upload Flux (.xlsx, .xls) (W/nm)', Parameter.DOWN, () => {}, {
            accept: '.xlsx, .xls',
            change: (e) => {
                IO.parseExcel(e.target.files[0]).then((data) => {
                    if (data.length < 1) return;
                    this.flux = data[0];
                });
            }
        });
        $(this.uploadButton).on('click', function() {
            this.addLamp();
        }.bind(this));

        this.uploadButton = document.createElement('div');
        $(this.uploadButton).addClass('lu-button');
        $(this.uploadButton).text('Upload');
        $(this.element).append(this.uploadButton);

        $(this.uploadButton).on('click', function() { this.addLamp() }.bind(this));

        if ('container' in this.classes) $(this.element).addClass(this.classes.container);
    }

    addLamp() {
        if (this.flux.length == 0) return;
        LampData[this.name.val] = { "portDiameter": this.portDiameter.val * 1, "vaa": this.vaa.val == 'true', "type": this.type.val, "power": this.power.val, "voltage": 0, "description": this.description.val };
        FluxData[this.name.val] = this.flux;
        this.top.settings.addCustomLamp(this.name.val);
        alert('Successfully loaded ' + this.name.val);

        this.name.val = '';
        this.portDiameter.val = '';
        this.type.val = '';
        this.vaa.val = 'false';
        this.power.val = '';
        this.description.val = '';
        this.updateValue();
    }

    update() {}

    toggleDarkMode(s) {
        $(this.uploadButton).toggleClass('lu-button-dark', s);
    }
}