class Output {
    constructor(_top, _parent, _id = -1, _classes = {}, _updateValue = () => {}) {
        this.top = _top;
        this.parent = _parent;
        this.id = _id;
        this.classes = _classes;
        this.updateValue = _updateValue;

        this.element = document.createElement('div');
        $(document.body).on('darkMode', function(e) { this.toggleDarkMode(e.detail.state); }.bind(this));
        $(this.element).attr('id', this.id);
        $(this.element).addClass('output-container');
        $(this.parent).append(this.element);

        this.CCT = new Parameter(this.top, this.element, { container: 'output-parameter', value: 'output-param-div', field: 'output-param-div' }, 'CCT', Parameter.DOWN);
        this.Candelas = new Parameter(this.top, this.element, { container: 'output-parameter', value: 'output-param-div', field: 'output-param-div' }, 'Candelas', Parameter.DOWN);
        this.FootLamberts = new Parameter(this.top, this.element, { container: 'output-parameter', value: 'output-param-div', field: 'output-param-div' }, 'Foot Lamberts', Parameter.DOWN);
        this.Lumens = new Parameter(this.top, this.element, { container: 'output-parameter', value: 'output-param-div', field: 'output-param-div' }, 'Lumens', Parameter.DOWN);
        this.Lux = new Parameter(this.top, this.element, { container: 'output-parameter', value: 'output-param-div', field: 'output-param-div' }, 'Lux', Parameter.DOWN)

        if ('container' in this.classes) $(this.element).addClass(this.classes.container);
    }

    update(mdl, units) {
        let figs = 0;

        this.CCT.val = Calculator.Math.Round(Calculator.Math.CCT(mdl, units), figs);

        this.Lumens.val = Calculator.Math.Round(Calculator.Math.Lumens(mdl, units), figs);

        this.Candelas.val = Calculator.Math.Round(Calculator.Math.Candelas(mdl, units), figs);

        this.FootLamberts.val = Calculator.Math.Round(Number.parseFloat(this.Candelas.val) * 0.291885581, figs);

        this.Lux.val = Calculator.Math.Round(Number.parseFloat(this.Candelas.val) * Math.PI, figs);
    }

    toggleDarkMode(s) {
        $(this.element).toggleClass('dark1', s);
    }
}