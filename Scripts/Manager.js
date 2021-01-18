class Manager {
    constructor(_element = document.body) {
        this.element = _element;
        this.tab = [];
        this.tabContainer;
        this.current = -1;
        this.activeTab = -1;
        this.projects = {};
        this.wiping = false;
        this.customLamps = {};

        this.head = $('.manager-head');
        this.body = $('.manager-body');

        this.projectHeader = CreateElement('div', this.head, 'manager-proj-title');
        $(this.projectHeader).on('click', function() { $(this.projectFolder.element).slideDown(slideSpeed); }.bind(this));
        CreateElement('i', this.projectHeader, 'fas fa-folder manager-proj-folder');
        this.projectTitle = CreateElement('span', this.projectHeader, '', '');

        let settings = CreateElement('div', this.head, 'manager-settings-container');

        this.tools = new Button(this, settings, 'tools manager-settings-button', Button.ACTION, () => {}, { tooltip: 'tools' });

        this.wipe = new Button(this, settings, 'trash manager-settings-button', Button.ACTION, () => {
            if (!confirm('Wipe all projects?')) return;
            localStorage.clear();
            this.wiping = true;
            window.location.reload();
        }, { tooltip: 'Wipe Memory' });

        this.darkMode = new Button(this, settings, 'moon manager-settings-button', Button.TOGGLE, s => this.toggleDarkMode(s), { state: false, tooltip: ['Light Mode', 'Dark Mode'] });

        this.lampUpload = new LampUpload(this, document.body, l => {
            let lampData = { "portDiameter": l.portDiameter, "vaa": l.vaa, "type": l.type, "power": l.power, "voltage": l.voltage };
            LampData[l.name] = lampData;
            FluxData[l.name] = l.flux;
            this.customLamps[l.name] = { lampData: lampData, fluxData: l.flux };
            this.updateAll();
        });

        this.addLamp = new Button(this, settings, 'lightbulb manager-settings-button', Button.ACTION, () => $(this.lampUpload.element).slideDown(slideSpeed), { tooltip: 'Add Custom Lamp' });

        this.docs = new Button(this, settings, 'question manager-settings-button', Button.ACTION, () => window.open('docs.html'), { tooltip: 'Docs' });

        this.darkModeEvent = new CustomEvent('darkMode', { bubbles: false, detail: { state: false } });

        this.tabList = document.createElement('ul');
        $(this.tabList).attr('id', 'tab-list');
        $(this.tabList).addClass('tab-bar');
        $(this.head).append(this.tabList);

        this.bigAdd = new Button(this, this.body, 'plus-square manager-big-add' + (this.darkMode.val ? ' dark1' : ''), Button.ACTION, () => this.addTab(undefined, 'Model'));

        let foundStorage = this.retriveLocalStorage();

        this.projectFolder = new ProjectFolder(this, this.element, {}, (action, data, data2) => {
            if (action == 'open') this.openProject(data);
            else if (action == 'create') this.openProject(this.createProject());
            else if (action == 'upload') {
                this.projects[data.id] = data;
                this.openProject(data.id);
            } else if (action == 'delete') this.deleteProject(data);
            else if (action == 'rename') {
                this.projects[data].name = data2;
                if (this.current == data) $(this.projectTitle).text(data2);
                this.projectFolder.update(this.projects);
            }
            this.projectFolder.update(this.projects);
        }, { projects: this.projects });


        if (foundStorage) this.openProject(localStorage.getItem('current'));
        else $(this.projectFolder.element).slideDown(slideSpeed);

        window.setTimeout(() => $('.splashscreen').slideUp(500), 500);
    }

    get globalTraces() {
        let traces = this.tab.filter(t => t.global).map(t => t.trace);
        traces.forEach(t => t.color = t.color.substring(0, t.color.length - 3) + ', .5)');
        return traces;
    }

    addTab(d, type) {
        if (d === undefined || d === null) {
            let id = 0;
            while (id == 0) {
                id = Math.round(Math.random() * 100000 + 1);
                this.tab.forEach(t => { if (t.id == id) id = 0; });
            }
            if (type == 'Model') this.tab.push(new Model(this, this.body, id, { container: 'tab-content' }));
            else return;
            this.createTabList();
        } else {
            if (d.tabType == 'Model') this.tab.push(new Model(this, this.body, d.id, { container: 'tab-content' }, d));
            else return;
        }
    }

    deleteProject(id) {
        if (!id in this.projects) return;
        $(this.body).children().each(function() { if ($(this).hasClass('tab-panel')) $(this).remove(); });
        delete this.projects[id];
        localStorage.removeItem(id);
        this.projectFolder.update(this.projects);
        if (id == this.current && Object.keys(this.projects).length != 0) this.openProject(Object.keys(this.projects)[0]);
        this.createTabList();
    }

    createProject() {
        let proj = {};
        proj.name = 'New Project';
        proj.activeTab = -1;
        proj.tab = [];
        let id = 0;
        while (id == 0) {
            id = Math.round(Math.random() * 100000 + 1);
            for (let p in this.projects)
                if (p == id) id = 0;
        }
        proj.id = id;
        this.projects[id] = proj;
        localStorage.setItem(id, JSON.stringify(proj));
        this.projectFolder.update(this.projects);
        return id;
    }

    createTabList(id) {
        $(this.tabList).empty();
        this.tab.forEach(t => {
            let li = CreateElement('li', this.tabList);
            $(li).attr('id', t.id);

            CreateElement('span', li, '', t.model.name);

            new Button(this, li, 'times', Button.ACTION, () => this.removeTab(t.id));

            $(li).on('click', function() { this.createTabList(t.id); }.bind(this));

            if (t.id == (id !== undefined && id != 0 ? id : this.tab[this.tab.length - 1].id)) {
                $(t.element).show();
                $(li).addClass(this.darkMode.val ? 'dark2' : 'selected-tab');
                this.activeTab = $(li).attr('id');
            } else {
                $(t.element).hide();
                $(li).css('color', this.darkMode.val ? 'white' : 'black');
                if (this.darkMode.val) $(li).addClass('dark1');
                $(li).css('border', '1px solid white');
                $(li).css('border-bottom', 'none');
            }
        });

        new Button(this, this.tabList, 'plus-square' + (this.darkMode.val ? ' dark1' : ''), Button.ACTION, () => this.addTab(undefined, 'Model'));

        if (this.tab.length != 0) $(this.bigAdd.element).hide();
        else $(this.bigAdd.element).show();
    }

    removeTab(id) {
        localStorage.removeItem(id);
        for (let i = 0; i < this.tab.length; i++)
            if (this.tab[i].id == id) {
                $(this.tab[i].element).hide();
                this.tab.splice(i, 1);
                break;
            }
        this.createTabList();
    }

    clearLocalStorage() {
        localStorage.clear();
    }

    retriveLocalStorage() {
        let settingsObj = JSON.parse(localStorage.getItem('settings'));
        if (!settingsObj) {
            this.darkMode.val = false;
            this.customLamps = {};
            return;
        }
        this.darkMode.val = settingsObj.darkMode;
        this.customLamps = settingsObj.customLamps;
        Object.getOwnPropertyNames(settingsObj.customLamps).forEach(n => {
            LampData[n] = settingsObj.customLamps[n].lampData;
            FluxData[n] = settingsObj.customLamps[n].fluxData;
        });

        this.projects = {};
        let foundStorage = false;
        for (let i = 0; i < localStorage.length; i++) {
            if (localStorage.key(i) == 'settings' || localStorage.key(i) == 'current') continue;
            let obj = JSON.parse(localStorage.getItem(localStorage.key(i)));
            this.projects[localStorage.key(i)] = obj;
            foundStorage = true;
        }

        setTimeout(() => {
            this.toggleDarkMode(this.darkMode.val);
        }, 100);
        return foundStorage;
    }

    openProject(id) {
        this.save();
        this.current = id;
        this.tab.forEach(t => $(t.element).remove());
        this.tab = [];
        this.projects[id].tab.forEach(t => this.addTab(t, 'Model'));
        $(this.projectTitle).text(this.projects[id].name);
        this.createTabList(this.projects[id].activeTab);
    }

    toggleDarkMode(s) {
        this.darkModeEvent.detail.state = s;
        document.body.dispatchEvent(this.darkModeEvent);

        $(this.element).toggleClass('dark1', s);
        $(this.projectHeader).toggleClass('dark2', s);
        this.createTabList();
    }

    updateAll() {
        this.tab.forEach(t => t.update());
    }

    save() {
        if (this.current == -1 || !(this.current in this.projects)) return;
        let proj = {};
        proj.id = this.current;
        proj.name = this.projects[this.current].name;
        proj.activeTab = this.activeTab;
        proj.tab = this.tab.map(t => t.save());
        this.projects[this.current] = proj;
    }

    saveAll() {
        this.save();
        for (let proj in this.projects) localStorage.setItem(proj, JSON.stringify(this.projects[proj]));
        localStorage.setItem('current', this.current);

        let settingsObj = {
            activeProject: this.current,
            darkMode: this.darkMode.val,
            customLamps: this.customLamps,
        }
        localStorage.setItem('settings', JSON.stringify(settingsObj));
    }

    addCustomLamp(name) {
        //this.customLamps[name] = {};
        //this.customLamps[name].lampData = LampData[name];
        //this.customLamps[name].fluxData = FluxData[name];
    }
}