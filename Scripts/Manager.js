class Manager {
    constructor(_element = document.body) {
        this.element = _element;
        this.tab = [];
        this.tabContainer;
        this.current = -1;
        this.activeTab = -1;
        this.projects = {};
        this.wiping = false;

        // merge settings into manager, add upload lamp and manual / handbook to settings bar

        //#region SETUP
        this.head = CreateElement('div', this.element, 'manager-header');

        this.body = CreateElement('div', this.element, 'manager-body');

        let logo = document.createElement('div');
        $(logo).on('click', function() { window.location.reload(); });
        $(logo).addClass('manager-logo');
        let img = document.createElement('img');
        $(img).attr('src', 'Resources/Images/logo.jpg');
        $(img).addClass('manager-logo-image');
        $(logo).append(img);
        let span = document.createElement('span');
        $(logo).append(span);
        $(span).text('Web Radiance App');
        $(this.head).append(logo);

        this.projectHeader = CreateElement('div', this.head, 'manager-proj-title');
        $(this.projectHeader).on('click', function() { $(this.projectFolder.element).slideDown(slideSpeed); }.bind(this));
        CreateElement('i', this.projectHeader, 'fas fa-folder manager-proj-folder');
        this.projectTitle = CreateElement('span', this.projectHeader, '', '');

        let settings = CreateElement('div', this.head, 'manager-settings-container');

        this.wipe = new Button(this, settings, 'trash manager-settings-button', Button.ACTION, () => {
            if (!confirm('Wipe all projects?')) return;
            localStorage.clear();
            this.wiping = true;
            window.location.reload();
        }, { tooltip: 'Wipe Memory' });

        this.darkMode = new Button(this, settings, 'moon manager-settings-button', Button.TOGGLE, s => this.toggleDarkMode(s), { state: false, tooltip: ['Light Mode', 'Dark Mode'] });

        this.addLamp = new Button(this, settings, 'lightbulb manager-settings-button', Button.ACTION, () => {});

        this.docs = new Button(this, settings, 'question manager-settings-button', Button.ACTION, () => {});

        this.darkModeEvent = new CustomEvent('darkMode', { bubbles: false, detail: { state: false } });

        this.tabList = document.createElement('ul');
        $(this.tabList).attr('id', 'tab-list');
        $(this.tabList).addClass('tab-bar');
        $(this.head).append(this.tabList);

        this.bigAdd = new Button(this, this.body, 'plus-square manager-big-add' + (this.darkMode.val ? ' dark1' : ''), Button.ACTION, () => this.addTab(undefined, 'Model'));

        let foundStorage = this.retriveLocalStorage();

        this.projectFolder = new ProjectFolder(this, this.element, 432, {}, (action, data, data2) => {
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
        $(this.projectFolder.element).slideDown(slideSpeed);
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
        /*
        Object.getOwnPropertyNames(settingsObj.customLamps).forEach(n => {
            LampData[n] = settingsObj.customLamps[n].lampData;
            FluxData[n] = settingsObj.customLamps[n].fluxData;
        });
        */
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

        $(this.element).toggleClass('body-dark', s);
        $(this.projectHeader).toggleClass('manager-proj-title-dark', s);
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
            customLamps: this.customLamps.val,
        }
        localStorage.setItem('settings', JSON.stringify(settingsObj));
    }

    addCustomLamp(name) {
        this.customLamps[name] = {};
        this.customLamps[name].lampData = LampData[name];
        this.customLamps[name].fluxData = FluxData[name];
    }
}

var manager;
var slideSpeed = 300;
$(window).on('load', function() { manager = new Manager(); });

window.onbeforeunload = function(e) {
    if (manager.wiping) return;
    manager.saveAll();
    //return ''; //causes 'Are you sure you want to leave?'
}

function CreateElement(_type, _parent, _class, _text) {
    let ret = document.createElement(_type);
    if (_class) $(ret).addClass(_class);
    if (_text) $(ret).text(_text);
    if (_parent) $(_parent).append(ret);
    return ret;
}


function justify(text, l) {
    return [...new Array(text.length)].reduce(o => ({ before: o.before.indexOf(' ') != -1 ? o.before.substring(o.before.indexOf(' ') + 1) : '', after: o.after.concat([o.before.substring(0, o.before.indexOf(' ') != -1 ? o.before.indexOf(' ') : o.before.length)]) }), { before: text, after: [] }).after.reduce((acc, v) => acc += v + (acc.length + v.length - acc.lastIndexOf('\n') > l ? '\n' : ' '), '');
}

function justRE(text, l) {
    return [...text.matchAll(/(?<=\s)\w+(?=\s)/g)].map(r => r[0]).reduce((acc, v) => acc += v + (acc.length + v.length - acc.lastIndexOf('\n') > l ? '\n' : ' '), '');
}

//console.log(justRE('a long string of text is justifyable but how will it handle extremelyextralongextreme long words', 10));