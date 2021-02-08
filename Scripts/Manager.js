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
        this.username = '';
        this.password = '';

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
            this.ClearData();
        }, { tooltip: 'Wipe Memory' });

        this.darkMode = new Button(this, settings, 'moon manager-settings-button', Button.TOGGLE, s => this.toggleDarkMode(s), { state: false, tooltip: ['Light Mode', 'Dark Mode'] });

        this.lampUpload = new LampUpload(this, document.body, l => {
            let lampData = { "portDiameter": l.portDiameter, "vaa": l.vaa, "type": l.type, "power": l.power, "voltage": l.voltage };
            LampData[l.name] = lampData;
            FluxData[l.name] = l.flux;
            this.customLamps[l.name] = { lampData: lampData, fluxData: l.flux };
            this.tab.forEach(t => t.update());
        });

        this.addLamp = new Button(this, settings, 'lightbulb manager-settings-button', Button.ACTION, () => $(this.lampUpload.element).slideDown(slideSpeed), { tooltip: 'Add Custom Lamp' });

        this.docs = new Button(this, settings, 'question manager-settings-button', Button.ACTION, () => window.open('docs.html'), { tooltip: 'Docs' });

        this.userPane = new Pane(this, this.element, {}, (action, username, password) => {
            this.username = username;
            this.password = password;
            if (action == 'signin') this.Login();
            else if (action == 'create') this.CreateUser();
        }, {
            width: '25vw',
            height: '30vh',
            left: '37.5vw',
            top: '35vh',
            title: 'Account',
            disableSelect: true,
            draggable: false,
            onCreate: (self) => {
                self.username = new Input(this, self.element, { container: 'manager-user-param' }, 'Username', Parameter.RIGHT, () => {});
                self.password = new Input(this, self.element, { container: 'manager-user-param' }, 'Password', Parameter.RIGHT, () => {});

                self.signin = new Button(this, self.element, 'user manager-user-button', Button.ACTION, () => self.updateValue('signin', self.username.val, self.password.val));
                self.create = new Button(this, self.element, 'user-plus manager-user-button', Button.ACTION, () => self.updateValue('create', self.username.val, self.password.val));

                $(self.element).hide();
            },
        });

        this.changeUser = new Button(this, settings, 'user-circle manager-settings-button', Button.ACTION, () => $(this.userPane.element).slideDown(slideSpeed), { tooltip: 'Change User' });

        this.darkModeEvent = new CustomEvent('darkMode', { bubbles: false, detail: { state: false } });

        this.tabList = document.createElement('ul');
        $(this.tabList).attr('id', 'tab-list');
        $(this.tabList).addClass('tab-bar');
        $(this.head).append(this.tabList);

        this.bigAdd = new Button(this, this.body, 'plus-square manager-big-add' + (this.darkMode.val ? ' dark1' : ''), Button.ACTION, () => this.AddTab(undefined, 'Model'));

        this.projectFolder = new ProjectFolder(this, this.element, {}, (action, data, data2) => {
            if (action == 'open') this.OpenProject(data);
            else if (action == 'create') this.OpenProject(this.CreateProject());
            else if (action == 'upload') {
                this.projects[data.id] = data;
                this.OpenProject(data.id);
            } else if (action == 'delete') this.DeleteProject(data);
            else if (action == 'rename') {
                this.projects[data].name = data2;
                if (this.current == data) $(this.projectTitle).text(data2);
                this.projectFolder.update(this.projects);
            }
            this.projectFolder.update(this.projects);
        });

        if (localStorage.getItem('username')) {
            this.username = localStorage.getItem('username');
            this.password = localStorage.getItem('password');
            this.userPane.username.val = this.username;
            this.userPane.password.val = this.password;
            this.Login().then(() => $('.splashscreen').slideUp(500));
        } else {
            $(this.userPane.element).show();
            $('.splashscreen').slideUp(500);
        }
    }

    get globalTraces() {
        let traces = this.tab.filter(t => t.global).map(t => t.trace);
        traces.forEach(t => t.color += '80');
        return traces;
    }

    OpenProject(id) {
        if (id === undefined) return;
        this.Save();
        this.current = id;
        this.tab.forEach(t => $(t.element).remove());
        this.tab = [];
        this.projects[id].tab.forEach(t => this.AddTab(t, 'Model'));
        $(this.projectTitle).text(this.projects[id].name);
        this.CreateTabList(this.projects[id].activeTab);
    }

    DeleteProject(id) {
        if (!id in this.projects) return;
        $(this.body).children().each(function() { if ($(this).hasClass('tab-panel')) $(this).remove(); });
        delete this.projects[id];
        this.projectFolder.update(this.projects);
        if (id == this.current && Object.keys(this.projects).length != 0) {
            this.OpenProject(Object.keys(this.projects)[0]);
        } else {
            this.current = -1;
        }
    }

    CreateProject() {
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
        this.projectFolder.update(this.projects);
        return id;
    }

    CreateTabList(id) {
        $(this.tabList).empty();
        this.tab.forEach(t => {
            let li = CreateElement('li', this.tabList);
            $(li).attr('id', t.id);

            CreateElement('span', li, '', t.model.name);

            new Button(this, li, 'times', Button.ACTION, () => this.RemoveTab(t.id));

            $(li).on('click', function() {
                this.createTabList(t.id);
                t.update();
            }.bind(this));

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
            if (t.traceColor != '#f7941e' && t.traceColor != '#1b75bc') $(li).css('background-color', t.traceColor);
        });


        new Button(this, this.tabList, 'plus-square' + (this.darkMode.val ? ' dark1' : ''), Button.ACTION, () => this.AddTab(undefined, 'Model'));

        if (this.tab.length != 0) $(this.bigAdd.element).hide();
        else $(this.bigAdd.element).show();
    }

    AddTab(d, type) {
        if (d === undefined || d === null) {
            let id = 0;
            while (id == 0) {
                id = Math.round(Math.random() * 100000 + 1);
                this.tab.forEach(t => { if (t.id == id) id = 0; });
            }
            if (type == 'Model') this.tab.push(new Model(this, this.body, id, { container: 'tab-content' }));
            else return;
            this.CreateTabList();
        } else {
            if (d.tabType == 'Model') this.tab.push(new Model(this, this.body, d.id, { container: 'tab-content' }, d));
            else return;
        }
    }

    RemoveTab(id) {
        for (let i = 0; i < this.tab.length; i++)
            if (this.tab[i].id == id) {
                $(this.tab[i].element).hide();
                this.tab.splice(i, 1);
                break;
            }
        this.CreateTabList();
    }

    ClearData() {
        this.wiping = true;
        var xhr = new XMLHttpRequest();
        xhr.open('PUT', 'http://localhost:3000/user?name=' + this.username + '&password=' + this.password);
        xhr.setRequestHeader("Content-Type", "application/json");
        xhr.send('');
        location.reload();
    }

    async Login() {
        return fetch(SERVER_PATH + '/user?name=' + this.username + '&password=' + this.password, { method: 'GET' }).then(res => {
            if (res.status == 200) {
                res.json().then(json => {
                    json = JSON.parse(json.data);
                    if (json === null) json = {};
                    if (!json.settings) {
                        this.darkMode.val = false;
                        this.customLamps = {};
                    } else {

                        this.darkMode.val = json.settings.darkMode;
                        this.customLamps = json.settings.customLamps;
                        Object.getOwnPropertyNames(json.settings.customLamps).forEach(n => {
                            LampData[n] = json.settings.customLamps[n].lampData;
                            FluxData[n] = json.settings.customLamps[n].fluxData;
                        });
                    }

                    this.projects = {};
                    Object.getOwnPropertyNames(json).forEach(name => {
                        if (name != 'settings' && name != 'current') this.projects[name] = json[name];
                    });

                    if (json['current'] && json['current'] != -1 && json['current'] != 'current') this.OpenProject(json['current']);
                    else $(this.projectFolder.element).slideDown(slideSpeed);

                    this.projectFolder.update(this.projects);
                    $(this.userPane.element).hide();
                });
            } else {
                $(this.userPane.element).show();
            }
        });
    }

    async CreateUser() {
        return fetch(SERVER_PATH + '/user?name=' + this.username + '&password=' + this.password, { method: 'POST' }).then(() => this.Login());
    }

    Save() {
        if (this.current == -1 || !(this.current in this.projects)) return;
        let proj = {};
        proj.id = this.current;
        proj.name = this.projects[this.current].name;
        proj.activeTab = this.activeTab;
        proj.tab = this.tab.map(t => t.save());
        this.projects[this.current] = proj;
    }

    SaveAll() {
        this.Save();
        let json = {};
        for (let proj in this.projects) json[proj] = this.projects[proj];
        let settingsObj = {
            activeProject: this.current,
            darkMode: this.darkMode.val,
            customLamps: this.customLamps,
        }
        json['settings'] = settingsObj;
        json['current'] = this.current;

        json = JSON.stringify(json);
        var xhr = new XMLHttpRequest();
        xhr.open('PUT', 'http://localhost:3000/user?name=' + this.username + '&password=' + this.password);
        xhr.setRequestHeader("Content-Type", "application/json");
        xhr.send(json);

        localStorage.setItem('username', this.username);
        localStorage.setItem('password', this.password);
    }

    toggleDarkMode(s) {
        this.darkModeEvent.detail.state = s;
        document.body.dispatchEvent(this.darkModeEvent);

        $(this.element).toggleClass('dark1', s);
        $(this.projectHeader).toggleClass('dark2', s);
        this.CreateTabList();
        $('#feedback-link').toggleClass('feedback-dark', s);
    }
}