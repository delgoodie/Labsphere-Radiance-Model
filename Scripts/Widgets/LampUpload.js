class LampUpload extends Pane {
    constructor(_top, _parent, _updateValue = () => { }) {
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
    // overriding base class method
    onCreate(_d) {
        this.name = new Input(this.top, this.element, { container: 'lu-param-wide' }, 'Name', Parameter.DOWN, () => { });

        this.type = new Dropdown(this.top, this.element, { container: 'lu-param-wide' }, 'Type', Parameter.DOWN, () => { }, { content: ['QTH Internal', 'QTH External', 'Xenon', 'Plasma', 'Other'] })

        this.portDiameter = new Input(this.top, this.element, { container: 'lu-param-short' }, 'Port Diameter (in)', Parameter.DOWN, () => { });

        this.va = new Toggle(this.top, this.element, { container: 'lu-param-short' }, 'va', Parameter.DOWN, () => { }, { content: ['true', 'false'] });

        this.power = new Input(this.top, this.element, { container: 'lu-param-short' }, 'Power (W)', Parameter.DOWN, () => { });

        this.voltage = new Input(this.top, this.element, { container: 'lu-param-short' }, 'Voltage (V)', Parameter.DOWN, () => { });

        this.description = new Input(this.top, this.element, { container: 'lu-param-wide' }, 'Description', Parameter.DOWN, () => { });

        this.upload = new Upload(this.top, this.element, { container: 'lu-param-wide' }, 'Upload Flux (.xlsx, .xls) (W/nm)', Parameter.DOWN, () => { }, {
            accept: '.xlsx, .xls',
            change: (e) => {
                IO.ParseExcel(e.target.files[0]).then((data) => {
                    if (data.length < 1) return;
                    this.flux = data[0];
                });
            }
        });
    }

    // overriding base class method
    onSelect() {
        this.updateValue({ name: this.name.val, portDiameter: this.portDiameter.val, va: this.va.val, type: this.type.val, power: this.power.val, voltage: this.voltage.val, flux: this.flux });
    }
}