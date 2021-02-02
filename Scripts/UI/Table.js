class Table {
    static get DERIVED() { return 0; }
    static get INPUT() { return 1; }
    static get CUSTOM() { return 2; }
    constructor(_top, _parent, _id = -1, _classes = {}, _headers = [''], _type = Table.DERIVED, _updateValue = () => {}, d = {}) {
        this.top = _top;
        this.parent = _parent;
        this.id = _id;
        this.classes = _classes;
        this.type = _type;
        this.headers = _headers;
        this.updateValue = _updateValue;
        this.values = {};
        this.headers.forEach(h => this.values[h] = []);
        if ('add' in d) this.customAdd = d.add;

        this.element = document.createElement('div');
        $(document.body).on('darkMode', function(e) { this.toggleDarkMode(e.detail.state); }.bind(this));
        $(this.element).addClass('table-container');
        $(this.parent).append(this.element);

        this.table = document.createElement('table');
        $(this.table).addClass('table-table');
        $(this.element).append(this.table);

        this.addButton = CreateElement('div', this.element, 'fas fa-plus lt-add-button');
        $(this.addButton).on('click', function() {
            this.add();
            this.assembleTable();
            this.updateValue(this.values);
        }.bind(this));

        this.removeButton = CreateElement('div', this.element, 'fas fa-minus lt-remove-button');
        $(this.removeButton).on('click', function() {
            this.remove();
            this.assembleTable();
            this.updateValue(this.values);
        }.bind(this));

        this.assembleTable();

        if ('container' in this.classes) $(this.element).addClass(this.classes.container);
    }

    add() {
        if (this.customAdd) this.customAdd(this);
        else
            for (let v in this.values) this.values[v].push(0);
    }

    remove() {
        if (this.customRemove) this.customRemove(this);
        else
            for (let v in this.values) this.values[v].pop();
    }

    update(values, pos) {
        if (values) this.values = values;
        this.assembleTable(pos);
    }

    assembleTable(pos) {
        $(this.table).empty();
        //#region HEADER
        let htr = document.createElement('tr');
        $(htr).addClass('table-row');
        this.headers.forEach(name => {
            let h = document.createElement('th');
            $(h).addClass('table-header');
            if ('header' in this.classes) $(h).addClass(this.classes.header);
            if (this.top.darkMode.val) $(h).addClass('dark3');
            $(h).text(name);
            $(htr).append(h);
        });
        $(this.table).append(htr);
        //#endregion
        let max = this.values[this.headers[0]].length;
        for (let v in this.values)
            if (this.values[v].length > max) max = this.values[v].length;

        let focusedInput;
        for (let i = 0; i < max; i++) {
            let tr = document.createElement('tr');
            $(tr).addClass('table-row');
            $(this.table).append(tr);

            this.headers.forEach((h, c) => {
                let val = document.createElement('td');
                $(val).addClass('table-value');
                if ('value' in this.classes) $(val).addClass(this.classes.value);
                if (this.top.darkMode.val) $(val).addClass('dark1');
                $(tr).append(val);

                if (this.type == Table.DERIVED) {
                    $(val).addClass('table-derived');
                    if (this.values[h].length > i) $(val).text(this.values[h][i]);
                    else $(val).text('empty');
                } else if (this.type == Table.INPUT) {
                    let input = document.createElement('input');
                    $(input).attr('type', 'text');
                    $(input).addClass('table-input');
                    if (this.top.darkMode.val) $(input).addClass('dark1');
                    if (this.values[h].length > i) $(input).val(this.values[h][i]);
                    else $(input).val('');
                    $(val).append(input);
                    $(input).on('change', function(e) {
                        e.preventDefault();
                        e.stopPropagation();
                        this.values[h][i] = $(input).val();
                        this.updateValue(this.values, { row: i + (c + 1 == this.headers.length ? 1 : 0), col: (c + 1) % this.headers.length });
                    }.bind(this));
                    if (pos && pos.row == i && pos.col == c) focusedInput = input;
                }
            });
            $(this.table).append(tr);
        }
        if (focusedInput) focusedInput.focus();
    }

    clear() {
        Object.getOwnPropertyNames(this.values).forEach(n => this.values[n] = []);
    }

    toggleDarkMode(s) {
        $(this.addButton).toggleClass('dark3', s);
        $(this.removeButton).css('color', s ? 'black' : 'white');
    }
}






class mTable {
    constructor(_top, _parent, _id = -1, _classes = {}, _headers = [''], _type = Table.DERIVED, _updateValue = () => {}, d = {}) {
        this.top = _top;
        this.parent = _parent;
        this.id = _id;
        this.classes = _classes;
        this.type = _type;
        this.headers = _headers;
        this.updateValue = _updateValue;
        this.values = {};
        this.headers.forEach(h => this.values[h] = []);
        if ('add' in d) this.customAdd = d.add;

        this.element = document.createElement('div');
        $(document.body).on('darkMode', function(e) { this.toggleDarkMode(e.detail.state); }.bind(this));
        $(this.element).addClass('table-container');
        $(this.parent).append(this.element);

        this.table = document.createElement('table');
        $(this.table).addClass('table-table');
        $(this.element).append(this.table);

        this.addButton = CreateElement('div', this.element, 'fas fa-plus lt-add-button');
        $(this.addButton).on('click', function() {
            this.add();
            this.assembleTable();
            this.updateValue(this.values);
        }.bind(this));

        this.removeButton = CreateElement('div', this.element, 'fas fa-minus lt-remove-button');
        $(this.removeButton).on('click', function() {
            this.remove();
            this.assembleTable();
            this.updateValue(this.values);
        }.bind(this));

        this.assembleTable();

        if ('container' in this.classes) $(this.element).addClass(this.classes.container);
    }

    add() {
        if (this.customAdd) this.customAdd(this);
        else
            for (let v in this.values) this.values[v].push(0);
    }

    remove() {
        if (this.customRemove) this.customRemove(this);
        else
            for (let v in this.values) this.values[v].pop();
    }

    update(values, pos) {
        if (values) this.values = values;
        this.assembleTable(pos);
    }

    assembleTable(pos) {
        $(this.table).empty();
        //#region HEADER
        let htr = document.createElement('tr');
        $(htr).addClass('table-row');
        this.headers.forEach(name => {
            let h = document.createElement('th');
            $(h).addClass('table-header');
            if ('header' in this.classes) $(h).addClass(this.classes.header);
            if (this.top.darkMode.val) $(h).addClass('dark3');
            $(h).text(name);
            $(htr).append(h);
        });
        $(this.table).append(htr);
        //#endregion
        let max = this.values[this.headers[0]].length;
        for (let v in this.values)
            if (this.values[v].length > max) max = this.values[v].length;

        let focusedInput;
        for (let i = 0; i < max; i++) {
            let tr = document.createElement('tr');
            $(tr).addClass('table-row');
            $(this.table).append(tr);

            this.headers.forEach((h, c) => {
                let val = document.createElement('td');
                $(val).addClass('table-value');
                if ('value' in this.classes) $(val).addClass(this.classes.value);
                if (this.top.darkMode.val) $(val).addClass('dark1');
                $(tr).append(val);

                if (this.type == Table.DERIVED) {
                    $(val).addClass('table-derived');
                    if (this.values[h].length > i) $(val).text(this.values[h][i]);
                    else $(val).text('empty');
                } else if (this.type == Table.INPUT) {
                    let input = document.createElement('input');
                    $(input).attr('type', 'text');
                    $(input).addClass('table-input');
                    if (this.top.darkMode.val) $(input).addClass('dark1');
                    if (this.values[h].length > i) $(input).val(this.values[h][i]);
                    else $(input).val('');
                    $(val).append(input);
                    $(input).on('change', function(e) {
                        e.preventDefault();
                        e.stopPropagation();
                        this.values[h][i] = $(input).val();
                        this.updateValue(this.values, { row: i + (c + 1 == this.headers.length ? 1 : 0), col: (c + 1) % this.headers.length });
                    }.bind(this));
                    if (pos && pos.row == i && pos.col == c) focusedInput = input;
                }
            });
            $(this.table).append(tr);
        }
        if (focusedInput) focusedInput.focus();
    }

    clear() {
        Object.getOwnPropertyNames(this.values).forEach(n => this.values[n] = []);
    }

    toggleDarkMode(s) {
        $(this.addButton).toggleClass('dark3', s);
        $(this.removeButton).css('color', s ? 'black' : 'white');
    }
}