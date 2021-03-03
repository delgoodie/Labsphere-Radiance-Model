class Units {
    constructor(_top, _parent, _id = -1, _classes = {}, _updateValue = () => { }) {
        this.top = _top;
        this.parent = _parent;
        this.id = _id;
        this.classes = _classes;
        this.units = { wavelength: Length.NM, radiance: Radiance.W_CM, length: Length.IN };
        this.updateValue = _updateValue;

        this.element = document.createElement('div');
        $(document.body).on('darkMode', function (e) { this.toggleDarkMode(e.detail.state); }.bind(this));
        $(this.element).attr('id', this.id);
        $(this.element).addClass('unit-container');
        $(this.parent).append(this.element);

        let unitHeader = document.createElement('div');
        $(unitHeader).addClass('unit-header fas fa-ruler');
        $(this.element).append(unitHeader);

        this.powerUnit = new Toggle(this.top, this.element, { container: 'unit-param-container', value: 'unit-toggle', field: 'unit-field', darkContainer: 'dark1' }, '', Parameter.RIGHT, () => this.updateValue(this.get), { content: ['W', 'mW'], value: 'W' });

        let divide = document.createElement('div');
        $(divide).addClass('unit-operator');

        $(divide).text('/');
        $(this.element).append(divide);

        this.lengthUnit = new Toggle(this.top, this.element, { container: 'unit-param-container', value: 'unit-toggle', field: 'unit-field', darkContainer: 'dark1' }, '', Parameter.RIGHT, () => this.updateValue(this.get), { content: ['cm', 'm'], value: 'cm' });

        let square = document.createElement('div');
        $(square).text(String.fromCharCode(parseInt('00B2', 16)));
        $(square).addClass('unit-operator');
        $(this.element).append(square);

        this.wavelengthUnit = new Toggle(this.top, this.element, { container: 'unit-param-container', value: 'unit-toggle', field: 'unit-field', darkContainer: 'dark1' }, '', Parameter.RIGHT, () => this.updateValue(this.get), { content: ['nm', 'µm'], value: 'nm' });
        let sr = document.createElement('div');
        $(sr).text('sr');
        $(sr).addClass('unit-operator');
        $(sr).addClass('unit-operator-end');
        $(this.element).append(sr);

        if ('container' in this.classes) $(this.element).addClass(this.classes.container);
    }

    set(u) {
        this.powerUnit.val = (u.radiance == Radiance.W_CM || u.radiance == Radiance.W_M ? 'W' : 'mW');
        this.lengthUnit.val = (u.radiance == Radiance.W_CM || u.radiance == Radiance.MW_CM ? 'cm' : 'm');
        this.wavelengthUnit.val = (u.wavelength == Length.NM ? 'nm' : 'µm');
    }

    get get() {
        return {
            wavelength: (this.wavelengthUnit.val == 'nm' ? Length.NM : Length.UM),
            length: Length.IN,
            radiance: (this.powerUnit.val == 'W' ? (this.lengthUnit.val == 'cm' ? Radiance.W_CM : Radiance.W_M) : (this.lengthUnit.val == 'cm' ? Radiance.MW_CM : Radiance.MW_M))
        }
    }

    toggleDarkMode(s) {
        $('.unit-operator').toggleClass('dark1', s);
        $('.unit-header').toggleClass('dark4', s);
    }
}