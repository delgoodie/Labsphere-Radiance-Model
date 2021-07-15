class CustomLoader extends Pane {
    constructor(_top, _parent, _updateValue = () => { }, _d) {
        super(_top, _parent, { title: 'cl-title' }, _updateValue, {
            width: '30vw',
            height: '50vh',
            left: '35vw',
            top: '25vh',
            title: 'Model Selector',
            disableDefaultOnCreate: false,
            disableDefaultOnClose: false,
            disableDefaultOnSelect: false,
        });

        this.update();

        if ('container' in this.classes) $(this.element).addClass(this.classes.container);
    }

    // overriding base class method
    onCreate(_d) {
        this.type = new Dropdown(this.top, this.element, { container: 'cl-type-container', value: 'cl-param-value' }, 'Type', Parameter.DOWN, () => this.update(), { content: ['Measured', 'Modeled', 'Uploaded', 'Presets'], value: 'Modeled' });
        this.family = new Dropdown(this.top, this.element, { container: 'cl-param-container', value: 'cl-param-value' }, 'Family', Parameter.DOWN, () => this.update(), { content: ['A', 'D', 'L', 'S', 'V'], value: 'A' })
        this.sphereDiameter = new Dropdown(this.top, this.element, { container: 'cl-param-container', value: 'cl-param-value' }, 'Sphere Diameter', Parameter.DOWN, () => this.update(), { content: ['All', 8, 12, 20], value: 8 });
        this.choice = new Dropdown(this.top, this.element, { container: 'cl-param-container', value: 'cl-param-value' }, 'Model', Parameter.DOWN, () => { }, { content: [], value: 'Select' });

        this.model = undefined;
        this.units = new Units(this.top, this.element, 366, { container: 'cl-units' }, () => { });

        this.upload = CreateElement('input', this.element, 'cl-upload');
        $(this.upload).attr('type', 'file');
        $(this.upload).attr('accept', '.xlsx, .xls');

        $(this.upload).on('change', function (e) {
            IO.ParseExcel(e.target.files[0]).then((data) => {
                if (data.length < 2) return;
                data[0].shift();
                let name = data[1].shift();
                this.model = {
                    x: data[0],
                    y: data[1],
                    name: name,
                }
                if (data.length == 8) {
                    this.model.portDiameter = data[3][1];
                    this.model.sphereDiameter = data[3][2];
                    this.model.material = Material.keyToVal(data[3][3]);
                    this.model.lamps = data[4];
                    this.model.lamps.shift();
                    this.model.portCount = this.model.lamps.length;
                    this.model.qty = data[5];
                    this.model.qty.shift();
                    this.model.onQty = data[6];
                    this.model.onQty.shift();
                    this.model.va = data[7];
                    this.model.va.shift();
                }
            });
            this.type.val = 'Uploaded';
        }.bind(this));
    }

    // overriding base class method
    onSelect() {
        if (this.type.val == 'Modeled' && this.choice.val != 'Select') this.updateValue(HeliosModelData[this.family.val].find(m => m.name == this.choice.val));
        else if (this.type.val == 'Measured' && this.choice.val != 'Select') {
            this.model = {
                x: Calculator.Model.GetWavelength({ wavelength: Length.NM }),
                y: MeasuredData[this.choice.val + '-m'],
                units: Calculator.Units.Default,
                name: this.choice.val,
            }
            this.model.y = this.model.y.map(r => r * .1);
            this.model = { ...this.model, ...HeliosModelData[this.family.val].find(m => m.name == this.choice.val) };
            this.updateValue(this.model);
        } else if (this.type.val == 'Uploaded' && this.model) {
            this.model.units = this.units.get;
            this.updateValue(this.model);
        } else if (this.type.val == 'Presets' && this.choice.val != 'Select') {
            let preset = PresetTraces[this.choice.val];
            this.model = {
                x: preset.x.slice(),
                y: preset.y.slice(),
                units: Calculator.Units.Default,
                name: this.choice.val,
            }
            console.log(this.model);
            // this.model.y = this.model.y.map(r => r * .1);
            this.updateValue(this.model);
        }
        this.model = undefined;
        this.upload.value = '';
        this.update();
    }

    // overriding base class method
    update() {
        if (this.type.val == 'Uploaded') this.choice.update([]);
        else if (this.type.val == 'Presets') this.choice.update(Object.keys(PresetTraces));
        else this.choice.update(HeliosModelData[this.family.val].filter(m => m.sphereDiameter == this.sphereDiameter.val || this.sphereDiameter.val == 'All').map(m => m.name).filter(m => !this.type.val == 'Measured' || !m.includes('* ')));
        this.choice.val = 'Select';
    }

    // overriding base class method
    toggleDarkMode(s) {
        $(this.element).toggleClass('dark1', s);
        $(this.title).toggleClass('dark3', s);
        $(this.select).toggleClass('dark3', s);
        $(this.upload).toggleClass('dark1', s);
        this.update();
    }
}