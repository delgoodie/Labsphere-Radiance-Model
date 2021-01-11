class Model {
    constructor(_top, _parent, _id = -1, _classes = {}, _d) {
        this.top = _top;
        this.parent = _parent;
        this.id = _id;
        this.classes = _classes;
        this.units = _d && 'units' in _d ? _d.units : Calculator.Units.Default;
        this.fixedTrace = Calculator.Trace.Empty();
        this.element = document.createElement('div');

        $(document.body).on('darkMode', function(e) { this.toggleDarkMode(e.detail.state); }.bind(this));

        $(this.element).attr('id', this.id);
        $(this.element).addClass('model-container');
        $(this.parent).append(this.element);

        //DOCUMENT FLOW

        //#region SPECS
        this.specs = document.createElement('div');
        $(this.specs).addClass('model-specs');

        this.name = new Input(this.top, this.specs, { container: 'model-specs-parameter', field: 'model-specs-parameter-field', model: 'model-specs-parameter-field' }, 'Name', Parameter.DOWN, () => {
            this.top.createTabList(this.id);
            this.update();
        }, { value: 'Untitled' });

        this.portDiameter = new Input(this.top, this.specs, { container: 'model-specs-parameter', field: 'model-specs-parameter-field', model: 'model-specs-parameter-field' }, 'Port Diameter', Parameter.DOWN, () => {
            if (this.type == 'Helios Model') this.type = 'Helios Model - Modified';
            this.update();
        }, { value: 2 });

        this.portFraction = new Parameter(this.top, this.specs, { container: 'model-specs-parameter', field: 'model-specs-parameter-field' }, 'Port Fraction', Parameter.DOWN, () => {}, { value: '0%' });

        this.sphereDiameter = new Dropdown(this.top, this.specs, { container: 'model-specs-parameter', field: 'model-specs-parameter-field', dropfield: 'model-specs-parameter-field' }, 'Sphere Diameter', Parameter.DOWN, (sD) => {
            this.portCount.val = Calculator.Model.GetNumPorts(sD);
            this.update();
            if (this.type == 'Helios Model') this.type = 'Helios Model - Modified';
        }, { content: [6, 8, 12, 20, 40, 65, 76], value: 8 });

        this.totalPower = new Parameter(this.top, this.specs, { container: 'model-specs-parameter', field: 'model-specs-parameter-field' }, 'Total Power', Parameter.DOWN, () => {}, { value: '0W' });

        this.material = new Dropdown(this.top, this.specs, { container: 'model-specs-parameter', field: 'model-specs-parameter-field', dropfield: 'model-specs-parameter-field' }, 'Material', Parameter.DOWN, () => {
            this.update();
            if (this.type == 'Helios Model') this.type = 'Helios Model - Modified';
        }, { content: ['Spectraflect', 'Permaflect', 'Gold', 'Spectralon'], value: Material.valToKey(0) });

        this.portRatio = new Parameter(this.top, this.specs, { container: 'model-specs-parameter', field: 'model-specs-parameter-field' }, 'Port Ratio', Parameter.DOWN, () => {}, { value: 0 });

        this.portCount = new Input(this.top, this.specs, { container: 'model-specs-parameter', field: 'model-specs-parameter-field', model: 'model-specs-parameter-field' }, 'Port Count', Parameter.DOWN, () => {
            if (this.type == 'Helios Model') this.type = 'Helios Model - Modified';
            this.update();
        }, { value: 2 });

        $(this.element).append(this.specs);
        //#endregion

        this.graph = new Graph(this.top, this.element, 200, { container: 'model-graph-container' },
            (action, value) => {
                switch (action) {
                    case 'units':
                        this.units = value;
                        this.update();
                        break;
                    case 'download':
                        this.download();
                        break;
                    case 'global':
                        this.global = value;
                        break;
                    case 'reverse':
                        this.reverse();
                        break;
                    case 'model':
                        $(this.customLoad.element).slideDown(slideSpeed);
                        break;
                    default:
                        console.error('invalid graph action');
                }
            }, { units: this.units });

        this.requirements = new Requirements(this.top, this.element, 20022, { container: 'model-requirements' }, (d) => {
            this.update();
            if (d && 'wavelength' in d) this.graph.wavelengthUnit.val = d.wavelength;
        }, { tabElement: this.element });

        this.visual = new Visual(this.top, this.element, 2030, { container: 'model-visual-container' });

        this.lampTable = new LampTable(this.top, this.element, { container: 'model-table-container' }, true, false, (d) => {
            if (this.type == 'Helios Model') this.type = 'Helios Model - Modified';
            this.update();
        });

        this.output = new Output(this.top, this.element, 2834, { container: 'model-output-container' }, () => this.update());

        this.customLoad = new CustomLoader(this.top, this.element, (model, specs) => {
            if ('x' in model && specs) {
                this.type = 'Measured Model';
                this.fixedTrace = model;
                this.model = specs;
            } else if ('x' in model) {
                this.type = 'Excel Model'
                this.fixedTrace = model;
            } else {
                this.type = 'Helios Model';
                this.model = model;
            }
            this.update();
        });

        this.global = _d && ('global' in _d) && _d.global;
        this.graph.global.toggle(this.global);

        $(window).on('resize', function() { this.update(); }.bind(this));

        if (_d) {
            this.type = _d.type;
            this.model = _d.model;
            this.fixedTrace = _d.fixedTrace;
            this.units = _d.units;
            this.requirements.load(_d.requirements);
        } else {
            this.type = 'Calculated Model';
            this.lampTable.update({
                lamps: ['Empty', 'Empty'],
                qty: [1, 1],
                onQty: [0, 0]
            });
        }

        if ('container' in this.classes) $(this.element).addClass(this.classes.container);

        this.top.toggleDarkMode(this.top.darkMode.val);
    }

    set model(x) {
        this.name.val = x.name;
        this.portDiameter.val = x.portDiameter;
        this.sphereDiameter.val = x.sphereDiameter;
        this.material.val = Material.valToKey(x.material);
        this.portCount.val = x.portCount;
        this.lampTable.update({
            lamps: x.lamps,
            qty: x.qty,
            onQty: x.onQty,
        });
    }

    get model() {
        return {
            name: this.name.val,
            portDiameter: this.portDiameter.val,
            sphereDiameter: this.sphereDiameter.val,
            lamps: this.lampTable.lamps,
            qty: this.lampTable.qty,
            onQty: this.lampTable.onQty,
            material: Material.keyToVal(this.material.val),
            portCount: this.portCount.val,
        }
    }

    get trace() {
        if (this.type != 'Measured Model' && this.type != 'Excel Model') {
            let modelTrace = Calculator.Trace.Model(this.model, this.units);
            modelTrace.id = this.id;
            modelTrace.color = this.top.darkMode.val ? 'rgba(247, 148, 30, 1)' : 'rgba(27, 117, 188, 1)';
            return modelTrace;
        } else {
            let fixedTrace = Calculator.Trace.Convert(this.fixedTrace, this.units);
            fixedTrace.id = this.id;
            fixedTrace.color = this.top.darkMode.val ? 'rgba(247, 148, 30, 1)' : 'rgba(27, 117, 188, 1)';
            return fixedTrace;
        }
    }

    reverse() {
        let model = Calculator.Model.SpectralReverse(this.model, Calculator.Trace.Convert(this.requirements.lowerSpectral, this.units), Calculator.Trace.Convert(this.requirements.upperSpectral, this.units), this.units);
        if (model) {
            this.model = model;
            this.type = 'Calculated Model';
            this.update();
        }
    }

    download() {
        let rows = [
            ['Wavelength (' + Length.valToKey(this.units.wavelength) + ')', 'Radiance (' + Radiance.valToKey(this.units.radiance) + '-' + (this.units.wavelength == Length.NM ? 'nm' : 'µm') + '-sr)', '', 'Specs', 'Lamps']
        ];
        let trace = this.trace;
        for (let i = 0; i < trace.x.length; i++) rows.push([trace.x[i], trace.y[i]]);
        rows[1].push('Port Diameter');
        rows[2].push('Sphere Diameter');
        rows[3].push('Material');
        rows[4].push('CCT');
        rows[5].push('Lumens');
        rows[6].push('cd/m2');
        rows[7].push('fL');
        rows[8].push('lux');

        rows[1].push(this.portDiameter.val);
        rows[2].push(this.sphereDiameter.val);
        rows[3].push(this.material.val);
        rows[4].push(Calculator.Math.CCT(this.model, this.units));
        rows[5].push(Calculator.Math.Lumens(this.model, this.units));
        rows[6].push(Calculator.Math.Candelas(this.model, this.units));
        rows[7].push(Calculator.Math.FootLamberts(this.model, this.units));
        rows[8].push(Calculator.Math.Lux(this.model, this.units));
        for (let i = 1; i <= this.model.lamps.length; i++) rows[i].push(this.model.lamps[i - 1]);

        IO.DownloadCSV(rows.map(e => e.join(',')).join('\n'), this.name.val);
    }

    update() {
        let trace = this.trace;
        let model = this.model;
        this.units = this.graph.units.get;

        let pf = Calculator.Math.Round(100 * (1 - Calculator.Model.WallFraction(model, this.units)), 2);
        this.portFraction.val = pf + '%';
        this.portRatio.val = Calculator.Math.Round(this.portDiameter.val / this.sphereDiameter.val, 2);
        let tp = 0;
        for (let i = 0; i < this.lampTable.lamps.length; i++) tp += Lamp.getLamp(this.lampTable.lamps[i]).power * this.lampTable.onQty[i];

        this.totalPower.val = tp + 'W';
        if (this.portRatio.val > .33) $(this.portRatio.text).addClass('model-param-flag');
        else $(this.portRatio.text).removeClass('model-param-flag');

        if (pf > 5) $(this.portFraction.text).addClass('model-param-flag');
        else $(this.portFraction.text).removeClass('model-param-flag');

        if (tp > 500) $(this.totalPower.text).addClass('model-param-flag');
        else $(this.totalPower.text).removeClass('model-param-flag');

        this.lampTable.editable = this.type != 'Measured Model' && this.type != 'Excel Model';
        this.lampTable.update(this.portCount.val);
        this.requirements.update(model, trace, this.units);
        this.graph.update([trace].concat(this.requirements.traces.map(t => Calculator.Trace.Interpolate(t))).concat(this.top.globalTraces.filter(t => t.id != trace.id)), this.units, this.type);
        this.output.update(model, this.units);
        this.visual.update(model, this.units);
    }

    save() {
        return {
            id: this.id,
            tabType: 'Model',
            global: this.global,
            model: this.model,
            type: this.type,
            requirements: this.requirements.save(),
            units: this.units,
            fixedTrace: this.fixedTrace,
        }
    }

    toggleDarkMode(s) {
        $(this.specs).toggleClass('dark1', s);
        $(this.requirements.element).toggleClass('dark1', s);
        this.update();
    }
}