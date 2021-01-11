class LampUpload extends Pane {
    constructor(_top, _parent, _updateValue = () => {}) {
        super(_top, _parent, {}, _updateValue, {
            width: '30vw',
            height: '82vh',
            top: '10vh',
            left: '35vw',
            draggable: false,
            title: 'Lamp Upload',
            disableDefaultOnCreate: false,
            disableDefaultOnClose: false,
            disableDefaultOnSelect: false,
        });
        this.flux = [];
    }
    onCreate(_d) {
        this.name = new Input(this.top, this.element, { container: 'lu-param-wide' }, 'Name', Parameter.DOWN, () => {});

        this.type = new Dropdown(this.top, this.element, { container: 'lu-param-wide' }, 'Type', Parameter.DOWN, () => {}, { content: ['HIS', 'HES', 'Xenon', 'Plasma', 'Other'] })

        this.portDiameter = new Input(this.top, this.element, { container: 'lu-param-short' }, 'Port Diameter (in)', Parameter.DOWN, () => {});

        this.vaa = new Toggle(this.top, this.element, { container: 'lu-param-short' }, 'VAA', Parameter.DOWN, () => {}, { content: ['true', 'false'] });

        this.power = new Input(this.top, this.element, { container: 'lu-param-short' }, 'Power (W)', Parameter.DOWN, () => {});

        this.voltage = new Input(this.top, this.element, { container: 'lu-param-short' }, 'Voltage (V)', Parameter.DOWN, () => {});

        this.description = new Input(this.top, this.element, { container: 'lu-param-wide' }, 'Description', Parameter.DOWN, () => {});

        this.upload = new Upload(this.top, this.element, { container: 'lu-param-wide' }, 'Upload Flux (.xlsx, .xls) (W/nm)', Parameter.DOWN, () => {}, {
            accept: '.xlsx, .xls',
            change: (e) => {
                IO.ParseExcel(e.target.files[0]).then((data) => {
                    if (data.length < 1) return;
                    this.flux = data[0];
                });
            }
        });
    }

    onSelect() {
        this.updateValue({ name: this.name.val, portDiameter: this.portDiameter.val, vaa: this.vaa.val, type: this.type.val, power: this.power.val, voltage: this.voltage.val, flux: this.flux });
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
        $(this.uploadButton).toggleClass('dark3', s);
    }
}