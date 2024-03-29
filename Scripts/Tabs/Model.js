class Model {
    constructor(_top, _parent, _id = -1, _classes = {}, _d) {
        this.top = _top;
        this.parent = _parent;
        this.id = _id;
        this.classes = _classes;
        this.units = _d && 'units' in _d ? _d.units : Calculator.Units.Default;
        this.fixedTrace = Calculator.Trace.Empty();
        this.traceColor = _d ? _d.traceColor : (this.top.darkMode.val ? '#f7941e' : '#1b75bc');
        this.element = document.createElement('div');

        $(document.body).on('darkMode', function (e) { this.toggleDarkMode(e.detail.state); }.bind(this));

        $(this.element).attr('id', this.id);
        $(this.element).addClass('model-container');
        $(this.parent).append(this.element);

        //#region SPECS
        this.specs = document.createElement('div');
        $(this.specs).addClass('model-specs');

        this.name = new Input(this.top, this.specs, { container: 'model-specs-parameter', field: 'model-specs-parameter-field', model: 'model-specs-parameter-field' }, 'Name', Parameter.DOWN, () => {
            this.top.CreateTabList(this.id);
            this.update();
        }, { value: 'Untitled' });

        this.portDiameter = new Input(this.top, this.specs, { container: 'model-specs-parameter', field: 'model-specs-parameter-field', model: 'model-specs-parameter-field' }, 'Port Diameter', Parameter.DOWN, () => {
            if (this.type == 'Helios Model') this.type = 'Helios Model - Modified';
            this.update();
        }, { value: 2 });

        this.portFraction = new Parameter(this.top, this.specs, { container: 'model-specs-parameter', field: 'model-specs-parameter-field' }, 'Port Fraction', Parameter.DOWN, () => { }, { value: '0%' });

        this.sphereDiameter = new Dropdown(this.top, this.specs, { container: 'model-specs-parameter', field: 'model-specs-parameter-field', dropfield: 'model-specs-parameter-field' }, 'Sphere Diameter', Parameter.DOWN, (sD) => {
            this.portCount.val = Calculator.Model.GetNumPorts(sD);
            this.update();
            if (this.type == 'Helios Model') this.type = 'Helios Model - Modified';
        }, { content: [6, 8, 12, 20, 30, 40, 65, 76], value: 8 });

        this.totalPower = new Parameter(this.top, this.specs, { container: 'model-specs-parameter', field: 'model-specs-parameter-field' }, 'Total Power', Parameter.DOWN, () => { }, { value: '0W' });

        this.material = new Dropdown(this.top, this.specs, { container: 'model-specs-parameter', field: 'model-specs-parameter-field', dropfield: 'model-specs-parameter-field' }, 'Material', Parameter.DOWN, () => {
            this.update();
            if (this.type == 'Helios Model') this.type = 'Helios Model - Modified';
        }, { content: ['Spectraflect', 'Permaflect', 'Gold', 'Spectralon'], value: Material.valToKey(0) });

        this.portRatio = new Parameter(this.top, this.specs, { container: 'model-specs-parameter', field: 'model-specs-parameter-field' }, 'Port Ratio', Parameter.DOWN, () => { }, { value: 0 });

        this.portCount = new Input(this.top, this.specs, { container: 'model-specs-parameter', field: 'model-specs-parameter-field', model: 'model-specs-parameter-field' }, 'Port Count', Parameter.DOWN, v => {
            if (this.type == 'Helios Model') this.type = 'Helios Model - Modified';
            this.update();
        }, { value: 2 });

        $(this.element).append(this.specs);
        //#endregion

        this.graph = new Graph(this.top, this.element, { container: 'model-graph-container' },
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
                        $(this.customLoad.element).slideDown(SLIDE_SPEED);
                        break;
                    case 'color':
                        this.traceColor = value;
                        this.update();
                        break;
                    default:
                        console.error('invalid graph action');
                }
            }, { units: this.units, color: this.traceColor, global: this.global });

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

        this.customLoad = new CustomLoader(this.top, this.element, (model) => {
            if ('x' in model) {
                this.type = 'Fixed Model';
                this.fixedTrace = { x: model.x, y: model.y, units: model.units };
                this.model = model;
            } else {
                this.type = 'Helios Model';
                this.model = model;
            }
            this.update();
        });

        this.global = _d && _d.global;
        if (!this.global) this.graph.global.toggle();

        $(window).on('resize', function () { this.update(); }.bind(this));

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
                onQty: [0, 0],
                va: [1, 1]
            });
        }

        if ('container' in this.classes) $(this.element).addClass(this.classes.container);

        this.top.toggleDarkMode(this.top.darkMode.val);
    }

    /**
     * Set model data 
     * material must be string
     */
    set model(mdl) {
        this.name.val = mdl.name || 'Untitled';
        this.portDiameter.val = mdl.portDiameter || 0;
        this.sphereDiameter.val = mdl.sphereDiameter || 0;
        this.material.val = mdl.material ? Material.valToKey(mdl.material) : 'Spectraflect';
        this.portCount.val = mdl.portCount || 0;
        this.lampTable.update({
            lamps: mdl.lamps || [],
            qty: mdl.qty || [],
            onQty: mdl.onQty || [],
            va: mdl.va || [],
        });
    }

    /**
     * creates model object from parameters
     */
    get model() {
        return {
            name: this.name.val,
            portDiameter: this.portDiameter.val,
            sphereDiameter: this.sphereDiameter.val,
            lamps: this.lampTable.lamps,
            qty: this.lampTable.qty,
            onQty: this.lampTable.onQty,
            va: this.lampTable.va,
            material: Material.keyToVal(this.material.val),
            portCount: this.portCount.val,
        }
    }
    /**
     * creates trace object from model
     */
    get trace() {
        if (this.type != 'Fixed Model') {
            let modelTrace = Calculator.Trace.Model(this.model, this.units);
            modelTrace.id = this.id;
            modelTrace.color = this.traceColor; // this.top.darkMode.val ? 'rgba(247, 148, 30, 1)' : 'rgba(27, 117, 188, 1)';
            return modelTrace;
        } else {
            let fixedTrace = Calculator.Trace.Convert(this.fixedTrace, this.units);
            fixedTrace.id = this.id;
            fixedTrace.color = this.traceColor; //this.top.darkMode.val ? 'rgba(247, 148, 30, 1)' : 'rgba(27, 117, 188, 1)';
            return fixedTrace;
        }
    }
    /**
     * invokes reverse model calculation and updates model
     */
    reverse() {
        let model = Calculator.Model.SpectralReverse(this.model, Calculator.Trace.Convert(this.requirements.lowerSpectral, this.units), Calculator.Trace.Convert(this.requirements.upperSpectral, this.units), this.units);
        if (model) {
            this.model = model;
            this.type = 'Calculated Model';
            this.update();
        }
    }
    /**
     * invokes IO.csvDownload and compiles model data
     */
    download() {
        let radiance = 'Radiance (';
        radiance += this.units.radiance == Radiance.MW_CM || this.units.radiance == Radiance.MW_M ? 'mW-' : 'W-';
        radiance += this.units.radiance == Radiance.W_CM || this.units.radiance == Radiance.MW_CM ? 'cm2-' : 'm2-';
        radiance += (this.units.wavelength == Length.NM ? 'nm' : 'um') + '-sr)';
        let rows = [
            ['Wavelength (' + Length.valToKey(this.units.wavelength) + ')', radiance, '', 'Specs', 'Lamps', 'QTY', 'ON QTY', 'VA']
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
        for (let i = 1; i <= this.model.lamps.length; i++) rows[i].push(this.model.qty[i - 1]);
        for (let i = 1; i <= this.model.lamps.length; i++) rows[i].push(this.model.onQty[i - 1]);
        for (let i = 1; i <= this.model.lamps.length; i++) rows[i].push(this.model.va[i - 1]);

        IO.DownloadCSV(rows.map(e => e.join(',')).join('\n'), this.name.val);
    }

    /**
     * updates all data and widgets
     */
    update() {
        this.lampTable.editable = this.type != 'Fixed Model';
        this.lampTable.update(this.portCount.val);

        let trace = this.trace;
        let model = this.model;
        this.units = this.graph.units.get;

        let pf = Calculator.Math.Round(100 * (1 - Calculator.Model.WallFraction(model, this.units)), 2);
        this.portFraction.val = pf + '%';
        this.portRatio.val = Calculator.Math.Round(this.portDiameter.val / this.sphereDiameter.val, 2);
        let tp = 0;
        for (let i = 0; i < this.lampTable.lamps.length; i++) tp += Calculator.Lamp.Specs(this.lampTable.lamps[i]).power * this.lampTable.onQty[i];

        this.totalPower.val = tp + 'W';
        if (this.portRatio.val > .33) $(this.portRatio.text).addClass('model-param-flag');
        else $(this.portRatio.text).removeClass('model-param-flag');

        if (pf > 5) $(this.portFraction.text).addClass('model-param-flag');
        else $(this.portFraction.text).removeClass('model-param-flag');

        if (tp > 500) $(this.totalPower.text).addClass('model-param-flag');
        else $(this.totalPower.text).removeClass('model-param-flag');

        this.requirements.update(model, trace, this.units);
        this.graph.update([trace].concat(this.requirements.traces).concat(this.top.globalTraces.filter(t => t.id != trace.id)), this.units, this.type); //.map(t => Calculator.Trace.Interpolate(t))
        this.output.update(model, this.units);
        this.visual.update(model, this.units);
    }

    /**
     * creates object summary of model
     */
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
            traceColor: this.traceColor,
        }
    }

    /**
     * toggles dark mode given state (s)
     */
    toggleDarkMode(s) {
        $(this.specs).toggleClass('dark1', s);
        $(this.requirements.element).toggleClass('dark1', s);
        this.update();
    }
}