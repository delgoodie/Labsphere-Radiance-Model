class Requirements {
    constructor(_top, _parent, _id = -1, _classes = {}, _updateValue = () => { }, _d = {}) {
        this.top = _top;
        this.parent = _parent;
        this.id = _id;
        this.classes = _classes;
        this.units = Calculator.Units.Default;
        this.tableFocus = 0;
        this.updateValue = _updateValue;
        this.lowerSpectral = Calculator.Trace.Empty();
        this.upperSpectral = Calculator.Trace.Empty();
        this.bands = [];
        this.inbandPos = null;
        this.specralPos = null;

        this.element = document.createElement('div');
        $(document.body).on('darkMode', function (e) { this.toggleDarkMode(e.detail.state); }.bind(this));
        $(this.parent).append(this.element);
        $(this.element).attr('id', this.id);
        $(this.element).addClass('req-container');

        let bar = CreateElement('div', this.element, 'req-bar');

        //#region INBAND
        let inbandHeader = CreateElement('div', bar, 'req-tab-header', 'In-Band Radiance');
        let inbandContainer = CreateElement('div', this.element, 'req-tab-container');

        let inbandTitle = CreateElement('div', inbandContainer, 'req-tab-title', 'In-Band Table');
        let inbandDelete = CreateElement('i', inbandTitle, 'fas fa-minus-circle req-tab-delete');

        this.inbandTable = new Table(this.top, inbandContainer, 432, { container: 'req-table-container', header: 'req-table-header', value: 'req-table-value' }, ['Wavelength A', 'Wavelength B', 'Required', 'Predicted'], Table.INPUT, (values, pos) => {
            if (pos) this.inbandPos = pos;
            else this.inbandPos = null;
            this.bands = this.tableToBands(values);
            this.updateValue();
        }, {
            add(self) {
                if (self.values['Wavelength A'].length == 0) {
                    self.values['Wavelength A'].push(true ? 250 : .25); //needs fixing
                    self.values['Wavelength B'].push(true ? 500 : .5);
                    self.values['Required'].push(0);
                    self.values['Predicted'].push(0);
                } else {
                    self.values['Wavelength A'].push(self.values['Wavelength B'][self.values['Wavelength B'].length - 1]);
                    self.values['Wavelength B'].push(2 * self.values['Wavelength B'][self.values['Wavelength B'].length - 1] - self.values['Wavelength A'][self.values['Wavelength B'].length - 1]);
                    self.values['Required'].push(self.values['Required'][self.values['Required'].length - 1]);
                    self.values['Predicted'].push(0);
                }
            }
        });

        if ('bands' in _d) {
            let wA = [];
            let wB = [];
            let req = [];
            let pred = [];
            _d.bands.forEach(b => {
                wA.push(b.a);
                wB.push(b.b);
                req.push(b.req);
                pred.push(b.pred);
            });
            this.inbandTable.update({ 'Wavelength A': wA, 'Wavelength B': wB, 'Required': req, 'Predicted': pred });
        }

        $(inbandDelete).on('click', function (e) {
            e.stopPropagation();
            this.inbandTable.clear();
            this.bands = [];
            this.updateValue();
        }.bind(this));
        //#endregion

        //#region IRRADIANCE
        let irradianceHeader = CreateElement('div', bar, 'req-tab-header', 'Irradiance');
        let irradianceContainer = CreateElement('div', this.element, 'req-tab-container');
        let irradianceTitle = CreateElement('div', irradianceContainer, 'req-tab-title', 'Irradiance Calculator');
        let irradianceContent = CreateElement('div', irradianceContainer, 'req-irradiance-content');

        this.irradianceWA = new Input(this.top, irradianceContent, { container: 'req-irradiance-param-container', field: 'req-irradiance-param-field', value: 'req-irradiance-param-value' }, 'Wavelength A', Parameter.RIGHT, () => this.updateValue(), { value: 0 });

        this.irradianceWB = new Input(this.top, irradianceContent, { container: 'req-irradiance-param-container', field: 'req-irradiance-param-field', value: 'req-irradiance-param-value' }, 'Wavelength B', Parameter.RIGHT, () => this.updateValue(), { value: 0 });

        this.irradianceD = new Input(this.top, irradianceContent, { container: 'req-irradiance-param-container', field: 'req-irradiance-param-field', value: 'req-irradiance-param-value' }, 'Distance (m)', Parameter.RIGHT, () => this.updateValue(), { value: 0 });

        this.irradianceR = new Input(this.top, irradianceContent, { container: 'req-irradiance-param-container', field: 'req-irradiance-param-field', value: 'req-irradiance-param-value' }, 'Required', Parameter.RIGHT, () => this.updateValue(), { value: 0 });

        this.irradianceP = new Parameter(this.top, irradianceContent, { container: 'req-irradiance-param-container', field: 'req-irradiance-param-field', value: 'req-irradiance-param-value' }, 'Predicted', Parameter.RIGHT, () => this.updateValue(), { value: 0 });
        //#endregion

        //#region SPECTRAL
        let spectralHeader = CreateElement('div', bar, 'req-tab-header', 'Spectral Radiance');
        let spectralContainer = CreateElement('div', this.element, 'req-tab-container');
        let spectralTitle = CreateElement('div', spectralContainer, 'req-tab-title', 'Spectral Table');
        let spectralDelete = CreateElement('i', spectralTitle, 'fas fa-minus-circle req-tab-delete');

        this.upload = new Pane(this.top, _d.tabElement, {}, (lS, uS) => {
            this.lowerSpectral = lS;
            this.upperSpectral = uS;
            this.updateValue();
        }, {
            width: '25vw',
            height: '30vh',
            left: '37.5vw',
            top: '35vh',
            title: 'Spectral Radiance',
            select: 'Upload',
            draggable: true,
            onCreate: (self) => {
                self.lowerSpectral = Calculator.Trace.Empty();
                self.upperSpectral = Calculator.Trace.Empty();

                self.units = new Units(self.top, self.element, 23423, { container: 'req-upload-units' }, () => { });

                self.upload = document.createElement('input');
                $(self.upload).attr('type', 'file');
                $(self.upload).attr('accept', '.xlsx, .xls');
                $(self.upload).addClass('req-upload');
                $(self.element).append(self.upload);

                $(self.upload).on('change', function (e) {
                    IO.ParseExcel(e.target.files[0]).then(data => {
                        if (data.length < 2) return;
                        data[0].shift();
                        let lSname = data[1].shift();
                        self.lowerSpectral = { name: lSname, x: data[0], y: data[1], units: self.units.get };
                        if (data.length < 3) return;
                        let uSname = data[2].shift();
                        self.upperSpectral = { name: uSname, x: data[0], y: data[2], units: self.units.get };
                    });
                });
            },
            onSelect(self) {
                self.updateValue(self.lowerSpectral, self.upperSpectral);
                self.lowerSpectral = Calculator.Trace.Empty();
                self.upperSpectral = Calculator.Trace.Empty();
                self.upload.value = '';
            }
        });

        let spectralUpload = CreateElement('i', spectralTitle, 'fas fa-file-upload req-tab-upload')

        this.spectralTable = new Table(this.top, spectralContainer, 43, { container: 'req-table-container', header: 'req-table-header', value: 'req-table-value' }, ['Wavelength', 'Lower Tolerance', 'Upper Tolerance'], Table.INPUT, (values, pos) => {
            this.lowerSpectral.x = values['Wavelength'].map(w => Calculator.Units.Convert(w, this.units.wavelength, this.lowerSpectral.units.wavelength));
            this.lowerSpectral.y = values['Lower Tolerance'].map(r => Calculator.Units.Convert(r, this.units.radiance, this.lowerSpectral.units.radiance));

            this.upperSpectral.x = values['Wavelength'].map(w => Calculator.Units.Convert(w, this.units.wavelength, this.upperSpectral.units.wavelength));
            this.upperSpectral.y = values['Upper Tolerance'].map(r => Calculator.Units.Convert(r, this.units.radiance, this.upperSpectral.units.radiance));

            if (pos) this.specralPos = pos;
            else this.specralPos = null;
            this.updateValue();
        }, {
            add(self) {
                if (self.values['Wavelength'].length == 0) {
                    self.values['Wavelength'].push(250);
                    self.values['Lower Tolerance'].push(0);
                    self.values['Upper Tolerance'].push(0);
                } else if (self.values['Wavelength'].length == 1) {
                    self.values['Wavelength'].push(self.values['Wavelength'][0] + 10);
                    self.values['Lower Tolerance'].push(self.values['Lower Tolerance'][0]);
                    self.values['Upper Tolerance'].push(self.values['Upper Tolerance'][0]);
                } else {
                    self.values['Wavelength'].push(2 * self.values['Wavelength'][self.values['Wavelength'].length - 1] - self.values['Wavelength'][self.values['Wavelength'].length - 2]);
                    self.values['Lower Tolerance'].push(self.values['Lower Tolerance'][self.values['Lower Tolerance'].length - 1]);
                    self.values['Upper Tolerance'].push(self.values['Upper Tolerance'][self.values['Upper Tolerance'].length - 1]);
                }
            }
        });

        $(spectralDelete).on('click', function (e) {
            e.stopPropagation();
            this.lowerSpectral.x = [];
            this.lowerSpectral.y = [];
            this.upperSpectral.x = [];
            this.upperSpectral.y = [];
            this.updateValue();
        }.bind(this));
        $(spectralUpload).on('click', function (e) {
            e.stopPropagation();
            $(this.upload.element).slideToggle(SLIDE_SPEED);
        }.bind(this));
        //#endregion

        //#region TAB MANAGMENT
        $(inbandHeader).on('click', function () {
            $(inbandContainer).show();
            $(irradianceContainer).hide();
            $(spectralContainer).hide();
            $(inbandHeader).css('background-color', 'white');
            $(irradianceHeader).css('background-color', 'lightgray');
            $(spectralHeader).css('background-color', 'lightgray');
            $(inbandHeader).css('border-bottom', 'none');
            $(irradianceHeader).css('border-bottom', '1px solid black');
            $(spectralHeader).css('border-bottom', '1px solid black');
        }.bind(this));

        $(irradianceHeader).on('click', function () {
            $(irradianceContainer).show();
            $(inbandContainer).hide();
            $(spectralContainer).hide();
            $(inbandHeader).css('background-color', 'lightgray');
            $(irradianceHeader).css('background-color', 'white');
            $(spectralHeader).css('background-color', 'lightgray');
            $(inbandHeader).css('border-bottom', '1px solid black');
            $(irradianceHeader).css('border-bottom', 'none');
            $(spectralHeader).css('border-bottom', '1px solid black');
        }.bind(this));

        $(spectralHeader).on('click', function () {
            $(spectralContainer).show();
            $(inbandContainer).hide();
            $(irradianceContainer).hide();
            $(inbandHeader).css('background-color', 'lightgray');
            $(irradianceHeader).css('background-color', 'lightgray');
            $(spectralHeader).css('background-color', 'white');
            $(inbandHeader).css('border-bottom', '1px solid black');
            $(irradianceHeader).css('border-bottom', '1px solid black');
            $(spectralHeader).css('border-bottom', 'none');
        }.bind(this));

        $(inbandHeader).css('border-bottom', 'none');
        $(inbandHeader).css('background-color', 'white');
        $(irradianceContainer).hide();
        $(spectralContainer).hide();
        //#endregion

        if ('container' in this.classes) $(this.element).addClass(this.classes.container);
    }

    // gets requirements traces
    get traces() {
        return [Calculator.Trace.Interpolate(this.lowerSpectral), Calculator.Trace.Interpolate(this.upperSpectral), ...this.bands];
    }

    // populates req forms with data
    load(d) {
        if ('upperSpectral' in d) this.upperSpectral = d.upperSpectral;
        if ('lowerSpectral' in d) this.lowerSpectral = d.lowerSpectral;
        if ('bands' in d) {
            let wA = [];
            let wB = [];
            let req = [];
            let pred = [];
            d.bands.forEach(b => {
                wA.push(b.x[0]);
                wB.push(b.x[2]);
                req.push(b.y[1] * (b.x[2] - b.x[0]));
                pred.push(0);
            });
            this.inbandTable.update({ 'Wavelength A': wA, 'Wavelength B': wB, 'Required': req, 'Predicted': pred });
            this.bands = this.tableToBands(this.inbandTable.values);
        }
    }

    update(mdl, trace, units) {
        if (this.units.wavelength != units.wavelength || this.units.radiance != units.radiance || this.units.length != units.length) {
            for (let i = 0; i < this.inbandTable.values['Wavelength A'].length; i++) {
                this.inbandTable.values['Wavelength A'][i] = Calculator.Units.Convert(this.inbandTable.values['Wavelength A'][i], this.units.wavelength, units.wavelength);
                this.inbandTable.values['Wavelength B'][i] = Calculator.Units.Convert(this.inbandTable.values['Wavelength B'][i], this.units.wavelength, units.wavelength);
                this.inbandTable.values['Required'][i] = Calculator.Units.Convert(Calculator.Units.Convert(this.inbandTable.values['Required'][i], this.units.radiance, units.radiance), this.units.wavelength, units.wavelength);
            }
            this.units = { wavelength: units.wavelength, length: units.length, radiance: units.radiance };
            this.bands = this.tableToBands(this.inbandTable.values);
            this.updateValue();
        }

        this.inbandTable.values['Predicted'] = this.inbandTable.values['Predicted'].map((_, i) => Calculator.Math.Round(Calculator.Model.IntegralRadiance(this.inbandTable.values['Wavelength A'][i] * 1, this.inbandTable.values['Wavelength B'][i] * 1, mdl, this.units), 2));
        this.inbandTable.update(null, this.inbandPos);
        this.inbandPos = null;

        this.irradianceP.val = Calculator.Math.Round(Calculator.Math.Irradiance(this.irradianceWA.val, this.irradianceWB.val, this.irradianceD.val, mdl, units), 2);

        this.lowerSpectral.color = Calculator.Trace.Compare(Calculator.Trace.Interpolate(this.lowerSpectral), trace, (y1, y2) => y1 <= y2, true) ? 'rgba(0, 175, 0, 1)' : 'rgba(255, 0, 0, 1)';

        this.upperSpectral.color = Calculator.Trace.Compare(Calculator.Trace.Interpolate(this.upperSpectral), trace, (y1, y2) => y1 >= y2, true) ? 'rgba(0, 175, 0, 1)' : 'rgba(255, 0, 0, 1)';

        this.bands.forEach((b, i) => b.color = this.inbandTable.values['Predicted'][i] >= this.inbandTable.values['Required'][i] ? 'rgba(0, 175, 0, 1)' : 'rgba(255, 0, 0, 1)');

        if (this.irradianceP.val > this.irradianceR.val) $(this.irradianceP.value).css('background-color', 'lightgreen');
        else $(this.irradianceP.value).css('background-color', 'lightcoral');

        this.spectralTable.update({ 'Wavelength': Calculator.Trace.Convert(this.lowerSpectral, this.units).x, 'Lower Tolerance': Calculator.Trace.Convert(this.lowerSpectral, this.units).y, 'Upper Tolerance': Calculator.Trace.Convert(this.upperSpectral, this.units).y }, this.specralPos);
        this.specralPos = null;
    }

    // converts inband radiance table to bands objects
    tableToBands(values) {
        return values['Wavelength A'].map((v, i) => ({
            name: '',
            x: [v, v, values['Wavelength B'][i], values['Wavelength B'][i]],
            y: [0, values['Required'][i] / (values['Wavelength B'][i] - v), values['Required'][i] / (values['Wavelength B'][i] - v), 0],
            units: this.units,
            color: 'black'
        }))
    }

    save() {
        return {
            lowerSpectral: this.lowerSpectral,
            upperSpectral: this.upperSpectral,
            bands: this.bands,
        }
    }

    toggleDarkMode(s) {
        $('.req-tab-title').toggleClass('dark1', s);
        $('.req-tab-header').toggleClass('dark1', s);
    }
}