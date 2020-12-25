class CustomLoader extends Pane {
    constructor(_top, _parent, _id = -1, _updateValue = () => {}, _d) {
        super(_top, _parent, _id, { title: 'cl-title' }, _updateValue, {
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

    onCreate(_d) {
        this.type = new Toggle(this.top, this.element, { container: 'cl-type-container', value: 'cl-param-value' }, 'Type', Parameter.DOWN, () => this.update(), { content: ['Measured', 'Modeled', 'Uploaded'], value: 'Modeled' });
        this.family = new Dropdown(this.top, this.element, { container: 'cl-param-container', value: 'cl-param-value' }, 'Family', Parameter.DOWN, () => this.update(), { content: ['A', 'D', 'L', 'S', 'V'], value: 'A' })
        this.sphereDiameter = new Dropdown(this.top, this.element, { container: 'cl-param-container', value: 'cl-param-value' }, 'Sphere Diameter', Parameter.DOWN, () => this.update(), { content: ['All', 8, 12, 20], value: 8 });
        this.choice = new Dropdown(this.top, this.element, { container: 'cl-param-container', value: 'cl-param-value' }, 'Model', Parameter.DOWN, () => {}, { content: [], value: 'Select' });

        this.trace = undefined;
        this.units = new Units(this.top, this.element, 366, { container: 'cl-units' }, () => {});

        this.upload = CreateElement('input', this.element, 'cl-upload');
        $(this.upload).attr('type', 'file');
        $(this.upload).attr('accept', '.xlsx, .xls');

        $(this.upload).on('change', function(e) {
            IO.parseExcel(e.target.files[0]).then((data) => {
                if (data.length < 2) return;
                data[0].shift();
                let name = data[1].shift();
                this.trace = {
                    x: data[0],
                    y: data[1],
                    name: name,
                }
            });
        }.bind(this));
    }

    onSelect() {
        if (this.type.val == 'Modeled' && this.choice.val != 'Select') this.updateValue(HeliosModelData[this.family.val].find(m => m.name == this.choice.val));
        else if (this.type.val == 'Measured' && this.choice.val != 'Select') {
            this.trace = {
                x: Calculator.Model.GetWavelength({ wavelength: Length.NM }),
                y: MeasuredData[this.choice.val + '-m'],
                units: Calculator.Units.Default,
                name: this.choice.val,
            }
            this.trace.y = this.trace.y.map(r => r * .1);
            this.updateValue(this.trace, HeliosModelData[this.family.val].find(m => m.name == this.choice.val));
        } else if (this.type.val == 'Uploaded' && this.trace) {
            this.trace.units = this.units.get;
            this.updateValue(this.trace);
        }
        this.trace = undefined;
        this.upload.value = '';
        this.update();
    }

    update() {
        if (this.type.val == 'Uploaded') this.choice.update([]);
        else this.choice.update(HeliosModelData[this.family.val].filter(m => m.sphereDiameter == this.sphereDiameter.val || this.sphereDiameter.val == 'All').map(m => m.name).filter(m => !this.type.val == 'Measured' || !m.includes('* ')));
        this.choice.val = 'Select';
    }


    toggleDarkMode(s) {
        $(this.element).toggleClass('ls-container-dark', s);
        $(this.title).toggleClass('ls-title-dark', s);
        $(this.close).toggleClass('ls-close-dark', s);
        $(this.select).toggleClass('ls-select-dark', s);
        $(this.upload).toggleClass('dark1', s);
        this.update();
    }
}