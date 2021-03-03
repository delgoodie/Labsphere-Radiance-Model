class Graph {
    constructor(_top, _parent, _classes = {}, _updateValue = () => {}, _d = {}) {
        this.top = _top;
        this.parent = _parent;
        this.classes = _classes;
        this.updateValue = _updateValue;

        this.element = document.createElement('div');
        $(document.body).on('darkMode', function(e) { this.toggleDarkMode(e.detail.state); }.bind(this));
        $(this.element).attr('id', this.id);
        $(this.parent).append(this.element);

        this.graphElement = document.createElement('div');
        $(this.graphElement).addClass('graph');
        $(this.element).append(this.graphElement);

        this.units = new Units(this.top, this.element, 343, { container: 'graph-units' }, (un) => this.updateValue('units', un));
        if (_d && 'units' in _d) this.units.set(_d.units);

        this.download = new Button(this.top, this.element, 'file-download graph-button', Button.ACTION, () => this.updateValue('download'), { tooltip: 'Download' });
        this.load = new Button(this.top, this.element, 'file-upload graph-button', Button.ACTION, () => this.updateValue('model'), { tooltip: 'Load Custom Model' });
        this.reverse = new Button(this.top, this.element, 'calculator graph-button', Button.ACTION, () => this.updateValue('reverse'), { tooltip: 'Calculate Reverse Model' });
        this.global = new Button(this.top, this.element, 'globe graph-button', Button.TOGGLE, s => this.updateValue('global', s), { state: false, tooltip: ['local', 'global'] });
        this.colorPicker = CreateElement('input', this.element, 'graph-button graph-color');
        $(this.colorPicker).attr('type', 'color');
        $(this.colorPicker).val(_d.color ? _d.color : (this.top.darkMode.val ? '#f7941e' : '#1b75bc'));

        $(this.colorPicker).on('change', function() { this.updateValue('color', $(this.colorPicker).val()); }.bind(this));

        if ('container' in this.classes) $(this.element).addClass(this.classes.container);
    }

    update(traces = [], units, title) {
        let data = [];
        let cw = [];
        traces.forEach(t => {
            //_cw.push((this.top.darkMode.val ? 'rgb(247, 148, 30)' : 'rgb(27, 117, 188)'));
            cw.push(t.color ? t.color : 'rgb(247, 148, 30)');
            data.push(Calculator.Trace.Convert(t, units));
        });

        let max = 0;
        data.forEach(d => d.y.forEach(r => { if (r > max) max = r; }));

        let layout = {
            font: {
                family: 'Helvetica',
                color: (this.top.darkMode.val ? 'white' : 'black')
            },
            paper_bgcolor: (this.top.darkMode.val ? 'black' : this.bc),
            plot_bgcolor: (this.top.darkMode.val ? 'black' : this.bc),
            title: title,
            xaxis: {
                title: 'Wavelength ' + ((units.wavelength == Length.NM) ? '(nm)' : '(µm)'),
                dtick: ((units.wavelength == Length.NM) ? 250 : .25),
                tickcolor: (this.top.darkMode.val ? 'white' : 'black'),
                linecolor: (this.top.darkMode.val ? 'white' : 'black'),
                showgrid: false,
            },
            yaxis: {
                title: 'Radiance ' + Radiance.valToKey(units.radiance) + '-' + (units.wavelength == Length.NM ? 'nm' : 'µm') + '-sr',
                tickcolor: (this.top.darkMode.val ? 'white' : 'black'),
                linecolor: (this.top.darkMode.val ? 'white' : 'black'),
                showgrid: false,
            },
            margin: { t: 50, b: 37, l: 60, r: 30 },
            colorway: cw,
            showlegend: true,
            legend: {
                x: 1,
                xanchor: 'right',
                y: 1
            }
        }
        Plotly.newPlot(this.graphElement, data, layout, { displayModeBar: false });
    }

    toggleDarkMode(s) {
        $(this.element).toggleClass('dark1', s);
        if ($(this.colorPicker).val() == '#f7941e' || $(this.colorPicker).val() == '#1b75bc') $(this.colorPicker).val(s ? '#f7941e' : '#1b75bc');
        $(this.colorPicker).css('background-color', s ? 'white' : 'black');
    }
}