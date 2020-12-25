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

        this.params = [new Parameter(this.top, this.element, { container: 'output-parameter', dropfield: 'output-param-div', field: 'output-param-div' }, 'CCT', Parameter.DOWN),
            new Parameter(this.top, this.element, { container: 'output-parameter', dropfield: 'output-param-div', field: 'output-param-div' }, 'Lumens', Parameter.DOWN),
            new Parameter(this.top, this.element, { container: 'output-parameter', dropfield: 'output-param-div', field: 'output-param-div' }, 'Candelas', Parameter.DOWN),
            new Parameter(this.top, this.element, { container: 'output-parameter', dropfield: 'output-param-div', field: 'output-param-div' }, 'Foot Lamberts', Parameter.DOWN),
            new Parameter(this.top, this.element, { container: 'output-parameter', dropfield: 'output-param-div', field: 'output-param-div' }, 'Lux', Parameter.DOWN)
        ];

        if ('container' in this.classes) $(this.element).addClass(this.classes.container);
    }

    update(mdl, units) {
        let figs = 0;
        this.params.forEach(p => {
            switch ($(p.field).text()) {
                case 'CCT':
                    p.val = Calculator.Math.Round(Calculator.Math.CCT(mdl, units), figs);
                    break;
                case 'Lumens':
                    p.val = Calculator.Math.Round(Calculator.Math.Lumens(mdl, units), figs);
                    break;
                case 'cd/m2':
                    p.val = Calculator.Math.Round(Calculator.Math.Candelas(mdl, units), figs);
                    break;
                case 'fL':
                    p.val = Calculator.Math.Round(Calculator.Math.FootLamberts(mdl, units), figs);
                    break;
                case 'lux':
                    p.val = Calculator.Math.Round(Calculator.Math.Lux(mdl, units), figs);
                    break;
                default:
                    break;
            }
        });
    }

    toggleDarkMode(s) {
        $(this.element).toggleClass('output-container-dark', s);
    }
}