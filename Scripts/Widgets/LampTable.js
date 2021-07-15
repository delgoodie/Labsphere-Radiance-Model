class LampTable {
    constructor(_top, _parent, _classes = {}, _editable, _grayMode, _updateValue = () => { }) {
        this.top = _top;
        this.parent = _parent;
        this.classes = _classes;
        this.updateValue = _updateValue;
        this.selectedPort = 0;
        this.editable = _editable;
        this.lamps = [];
        this.qty = [];
        this.onQty = [];
        this.va = [];
        this.portCount = 0;

        this.element = document.createElement('div');
        $(document.body).on('darkMode', function (e) { this.toggleDarkMode(e.detail.state); }.bind(this));
        $(this.element).attr('id', this.id);
        $(this.element).addClass('lt-container');

        this.lampSelector = new LampSelector(this.top, _parent, {}, (l) => {
            this.lamps[this.selectedPort] = l;
            this.updateValue();
        }, {});
        $(this.lampSelector.element).hide();

        this.table = document.createElement('table');
        $(this.element).append(this.table);

        $(this.parent).append(this.element);
        this.update();

        if ('container' in this.classes) $(this.element).addClass(this.classes.container);
    }

    update(d) {
        this.lampSelector.update();
        if (typeof (d) == 'object') {
            this.lamps = d.lamps;
            this.qty = d.qty;
            this.onQty = d.onQty;
            this.va = d.va;
            this.portCount = d.qty.reduce((s, q) => s + q, 0);
        } else {
            this.portCount = d ? d : 0;
            if (this.portCount <= 5) {
                while (this.portCount != this.lamps.length) {
                    if (this.portCount > this.lamps.length) {
                        this.lamps.push('Empty');
                        this.qty.push(1);
                        this.onQty.push(0);
                        this.va.push(1);
                    } else {
                        this.lamps.pop();
                        this.qty.pop();
                        this.onQty.pop();
                        this.va.pop();
                    }
                }
                this.qty = this.qty.map(q => q == 0 ? 0 : 1);
                this.onQty = this.onQty.map(q => q == 0 ? 0 : 1);
                this.va = this.va.map(v => v == 0 ? 0 : 1);
            }
        }
        $(this.table).empty();
        let useQty = this.portCount > 5;

        //#region HEADER
        let tr = document.createElement('tr');
        $(tr).addClass('lt-row');
        let th = [];
        for (let i = 0; i < 5; i++) {
            th.push(document.createElement('th'));
            $(th[i]).addClass('lt-header');
            if (this.top.darkMode.val) $(th[i]).addClass('dark3');
            if (!this.editable) $(th[i]).addClass('lt-header-gray');
        }

        if (useQty) {
            $(th[0]).text((this.portCount > 1) ? 'Lamps' : 'Lamp');
            $(th[1]).text('QTY ' + this.qty.reduce((s, q) => s + q, 0) + '/' + this.portCount);
            $(th[2]).text('ON QTY');
        } else {
            $(th[0]).text('Port');
            $(th[1]).text((this.portCount > 1) ? 'Lamps' : 'Lamp');
            $(th[2]).text('Status');
        }
        $(th[3]).text('Power');
        $(th[4]).text('VA');

        th.forEach(e => $(tr).append(e));
        $(this.table).append(tr);

        //#endregion

        for (let i = 0; i < this.lamps.length; i++) {
            let tr = document.createElement('tr');
            $(tr).addClass('lt-row');

            let td = [];
            for (let j = 0; j < 5; j++) {
                td.push(document.createElement('td'));
                $(td[j]).addClass('lt-val');
                if (this.top.darkMode.val) $(td[j]).addClass('dark1');
                // if (this.top.settings.grayMode) $(td[j]).addClass('lt-val-gray');
            }
            if (useQty) {
                $(td[0]).text(this.lamps[i]);
                $(td[0]).addClass('lt-lamp');

                let qty = document.createElement('input');
                $(qty).attr('type', 'text');
                $(qty).addClass('lt-qty-input');
                if (this.top.darkMode.val) $(qty).addClass('dark1');
                $(qty).val(this.qty[i]);
                $(td[1]).addClass('lt-qty');
                $(td[1]).append(qty);

                let onQty = document.createElement('input');
                $(onQty).attr('type', 'text');
                $(onQty).addClass('lt-qty-input');
                if (this.top.darkMode.val) $(onQty).addClass('dark1');
                $(onQty).val(this.onQty[i]);
                $(td[2]).addClass('lt-qty');
                $(td[2]).append(onQty);
                $(qty).on('change', function () {
                    if ($(qty).val() * 1 >= 0 && $(qty).val() * 1 != NaN) this.qty[i] = Math.min($(qty).val() * 1, this.portCount - this.qty.reduce((s, q) => s + q, 0) + this.qty[i]);
                    this.updateValue();
                }.bind(this));
                $(onQty).on('change', function () {
                    if ($(onQty).val() * 1 >= 0 && $(onQty).val() * 1 != NaN) this.onQty[i] = Math.min($(onQty).val() * 1, this.qty[i]);
                    this.updateValue();
                }.bind(this));

                if (this.editable) {
                    $(td[0]).on('click', function () {
                        $(this.lampSelector.element).slideDown(SLIDE_SPEED);
                        this.selectedPort = i;
                    }.bind(this));
                }
            } else {
                $(td[0]).text(Calculator.Model.IndexToPort(i));
                $(td[0]).addClass('lt-derived');
                $(td[1]).text(this.lamps[i]);
                $(td[1]).addClass('lt-lamp');

                $(td[2]).addClass('lt-status');
                $(td[2]).toggleClass('lt-status-off', !this.onQty[i] == 1);

                CreateElement('i', td[2], 'lt-status-toggle ' + (this.onQty[i] == 1 ? 'fas fa-toggle-on' : 'fas fa-toggle-off'));

                if (this.editable) {
                    $(td[1]).on('click', function () {
                        $(this.lampSelector.element).slideDown(SLIDE_SPEED);
                        this.selectedPort = i;
                    }.bind(this));
                    $(td[2]).on('click', function () {
                        this.onQty[i] = ($(td[2]).hasClass('lt-status-off') ? 1 : 0);
                        this.updateValue();
                    }.bind(this));
                }
            }

            $(td[3]).text(Calculator.Lamp.Specs(this.lamps[i]).power + 'W');
            $(td[3]).addClass('lt-derived');

            $(td[4]).addClass('lt-va');
            let self = this;
            if (Calculator.Lamp.Specs(this.lamps[i]).va)
                $(CreateElement('div', td[4], 'lt-va-slider')).slider({
                    animate: "fast",
                    min: 0,
                    max: 1,
                    value: this.va[i],
                    step: .01,
                    stop: function () {
                        self.va[i] = $(this).slider('value');
                        self.updateValue();
                    },
                    classes: {
                        "ui-slider": "lt-va-slider-range",
                        "ui-slider-handle": "lt-va-slider-handle"
                    }
                });
            else CreateElement('i', td[4], 'lt-status-toggle fas fa-times');

            td.forEach(e => tr.append(e));
            $(this.table).append(tr);
        }
        if (useQty) {
            let tr = CreateElement('tr', this.table, 'lt-row');
            let add = CreateElement('td', tr, 'fas fa-plus lt-add-button');
            if (this.top.darkMode.val) $(add).addClass('dark3');
            $(add).on('click', function () {
                this.lamps.push('Empty');
                this.qty.push(0);
                this.onQty.push(0);
                this.updateValue();
            }.bind(this));

            [0, 0, 0].forEach(_ => CreateElement('td', tr));

            let remove = CreateElement('td', tr, 'fas fa-minus lt-remove-button');
            if (this.top.darkMode.val) $(remove).css('color', 'black');
            $(tr).append(remove);
            $(remove).on('click', function () {
                this.lamps.pop();
                this.qty.pop();
                this.onQty.pop();
                this.updateValue();
            }.bind(this));

            $(this.table).append(tr);
        }

        //$(this.table).toggleClass('lt-use-qty', useQty);
    }

    // makes lamp table read only (for uploaded plots that are not model driven)
    set gray(s) {
        $(this.element).toggleClass('lt-container-gray', s);
        this.grayMode = s;
        this.editable = !s;
        this.update();
    }

    toggleDarkMode(s) {
        $(this.element).toggleClass('dark1', s);
    }

}