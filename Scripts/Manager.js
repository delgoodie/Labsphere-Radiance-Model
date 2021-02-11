var Manager = {
    tab: [],
    current: -1,
    activeTab: -1,
    projects: {},
    wiping: false,
    customLamps: {},
    username: '',
    password: '',


    Initialize() {
        Manager.head = $('.manager-head');
        Manager.body = $('.manager-body');
        Manager.projectHeader = CreateElement('div', Manager.head, 'manager-proj-title');
        $(Manager.projectHeader).on('click', function() { $(Manager.projectFolder.element).slideDown(SLIDE_SPEED); }.bind(Manager));
        CreateElement('i', Manager.projectHeader, 'fas fa-folder manager-proj-folder');
        Manager.projectTitle = CreateElement('span', Manager.projectHeader, '', '');

        let settings = CreateElement('div', Manager.head, 'manager-settings-container');

        Manager.tools = new Button(Manager, settings, 'tools manager-settings-button', Button.ACTION, () => {}, { tooltip: 'tools' });

        Manager.wipe = new Button(Manager, settings, 'trash manager-settings-button', Button.ACTION, () => {
            if (!confirm('Wipe all projects?')) return;
            IO.ClearUser(Manager.username, Manager.password).then(location.reload);
        }, { tooltip: 'Wipe Memory' });

        Manager.darkMode = new Button(Manager, settings, 'moon manager-settings-button', Button.TOGGLE, s => Manager.toggleDarkMode(s), { state: false, tooltip: ['Light Mode', 'Dark Mode'] });

        Manager.lampUpload = new LampUpload(Manager, document.body, l => {
            let lampData = { "portDiameter": l.portDiameter, "vaa": l.vaa, "type": l.type, "power": l.power, "voltage": l.voltage };
            LampData[l.name] = lampData;
            FluxData[l.name] = l.flux;
            Manager.customLamps[l.name] = { lampData: lampData, fluxData: l.flux };
            Manager.tab.forEach(t => t.update());
        });

        Manager.addLamp = new Button(Manager, settings, 'lightbulb manager-settings-button', Button.ACTION, () => $(Manager.lampUpload.element).slideDown(SLIDE_SPEED), { tooltip: 'Add Custom Lamp' });

        Manager.docs = new Button(Manager, settings, 'question manager-settings-button', Button.ACTION, () => window.open('docs.html'), { tooltip: 'Docs' });

        Manager.userPane = new Pane(Manager, document.body, {}, (action, username, password) => {
            Manager.username = username;
            Manager.password = password;
            if (action == 'signin') IO.LoginUser(Manager.username, Manager.password).then(json => Manager.ParseLogin(json));
            else if (action == 'create') IO.CreateUser(Manager.username, Manager.password).then(json => Manager.ParseLogin(json));
        }, {
            width: '25vw',
            height: '30vh',
            left: '37.5vw',
            top: '35vh',
            title: 'Account',
            disableSelect: true,
            draggable: false,
            onCreate: (self) => {
                self.username = new Input(Manager, self.element, { container: 'manager-user-param' }, 'Username', Parameter.RIGHT, () => {});
                self.password = new Input(Manager, self.element, { container: 'manager-user-param' }, 'Password', Parameter.RIGHT, () => {});

                self.signin = new Button(Manager, self.element, 'user manager-user-button', Button.ACTION, () => self.updateValue('signin', self.username.val, self.password.val));
                self.create = new Button(Manager, self.element, 'user-plus manager-user-button', Button.ACTION, () => self.updateValue('create', self.username.val, self.password.val));

                $(self.element).hide();
            },
        });

        console.log(Manager.userPane);

        Manager.changeUser = new Button(Manager, settings, 'user-circle manager-settings-button', Button.ACTION, () => $(Manager.userPane.element).slideDown(SLIDE_SPEED), { tooltip: 'Change User' });

        Manager.darkModeEvent = new CustomEvent('darkMode', { bubbles: false, detail: { state: false } });

        Manager.tabList = document.createElement('ul');
        $(Manager.tabList).attr('id', 'tab-list');
        $(Manager.tabList).addClass('tab-bar');
        $(Manager.head).append(Manager.tabList);

        Manager.bigAdd = new Button(Manager, Manager.body, 'plus-square manager-big-add' + (Manager.darkMode.val ? ' dark1' : ''), Button.ACTION, () => Manager.AddTab(undefined, 'Model'));

        Manager.projectFolder = new ProjectFolder(Manager, document.body, {}, (action, data, data2) => {
            if (action == 'open') Manager.OpenProject(data);
            else if (action == 'create') Manager.OpenProject(Manager.CreateProject());
            else if (action == 'upload') {
                Manager.projects[data.id] = data;
                Manager.OpenProject(data.id);
            } else if (action == 'delete') Manager.DeleteProject(data);
            else if (action == 'rename') {
                Manager.projects[data].name = data2;
                if (Manager.current == data) $(Manager.projectTitle).text(data2);
                Manager.projectFolder.update(Manager.projects);
            }
            Manager.projectFolder.update(Manager.projects);
        });

        if (localStorage.getItem('username')) {
            Manager.username = localStorage.getItem('username');
            Manager.password = localStorage.getItem('password');
            Manager.userPane.username.val = Manager.username;
            Manager.userPane.password.val = Manager.password;
            IO.LoginUser(Manager.username, Manager.password).then(json => {
                Manager.ParseLogin(json);
                $('.splashscreen').slideUp(500)
            });
        } else {
            $(Manager.userPane.element).show();
            $('.splashscreen').slideUp(500);
        }
    },

    get globalTraces() {
        let traces = Manager.tab.filter(t => t.global).map(t => t.trace);
        traces.forEach(t => t.color += '80');
        return traces;
    },

    OpenProject(id) {
        if (id === undefined) return;
        Manager.LocalSave();
        Manager.current = id;
        Manager.tab.forEach(t => $(t.element).remove());
        Manager.tab = [];
        Manager.projects[id].tab.forEach(t => Manager.AddTab(t, 'Model'));
        $(Manager.projectTitle).text(Manager.projects[id].name);
        Manager.CreateTabList(Manager.projects[id].activeTab);
    },

    DeleteProject(id) {
        if (!id in Manager.projects) return;
        $(Manager.body).children().each(function() { if ($(Manager).hasClass('tab-panel')) $(Manager).remove(); });
        delete Manager.projects[id];
        Manager.projectFolder.update(Manager.projects);
        if (id == Manager.current && Object.keys(Manager.projects).length != 0) {
            Manager.OpenProject(Object.keys(Manager.projects)[0]);
        } else {
            Manager.current = -1;
        }
    },

    CreateProject() {
        let proj = {};
        proj.name = 'New Project';
        proj.activeTab = -1;
        proj.tab = [];
        let id = 0;
        while (id == 0) {
            id = Math.round(Math.random() * 100000 + 1);
            for (let p in Manager.projects)
                if (p == id) id = 0;
        }
        proj.id = id;
        Manager.projects[id] = proj;
        Manager.projectFolder.update(Manager.projects);
        return id;
    },

    CreateTabList(id) {
        $(Manager.tabList).empty();
        Manager.tab.forEach(t => {
            let li = CreateElement('li', Manager.tabList);
            $(li).attr('id', t.id);

            CreateElement('span', li, '', t.model.name);

            new Button(Manager, li, 'times', Button.ACTION, () => Manager.RemoveTab(t.id));

            $(li).on('click', function() {
                Manager.CreateTabList(t.id);
                t.update();
            }.bind(Manager));

            if (t.id == (id !== undefined && id != 0 ? id : Manager.tab[Manager.tab.length - 1].id)) {
                $(t.element).show();
                $(li).addClass(Manager.darkMode.val ? 'dark2' : 'selected-tab');
                Manager.activeTab = $(li).attr('id');
            } else {
                $(t.element).hide();
                $(li).css('color', Manager.darkMode.val ? 'white' : 'black');
                if (Manager.darkMode.val) $(li).addClass('dark1');
                $(li).css('border', '1px solid white');
                $(li).css('border-bottom', 'none');
            }
            if (t.traceColor != '#f7941e' && t.traceColor != '#1b75bc') $(li).css('background-color', t.traceColor);
        });


        new Button(Manager, Manager.tabList, 'plus-square' + (Manager.darkMode.val ? ' dark1' : ''), Button.ACTION, () => Manager.AddTab(undefined, 'Model'));

        if (Manager.tab.length != 0) $(Manager.bigAdd.element).hide();
        else $(Manager.bigAdd.element).show();
    },

    AddTab(d, type) {
        if (d === undefined || d === null) {
            let id = 0;
            while (id == 0) {
                id = Math.round(Math.random() * 100000 + 1);
                Manager.tab.forEach(t => { if (t.id == id) id = 0; });
            }
            if (type == 'Model') Manager.tab.push(new Model(Manager, Manager.body, id, { container: 'tab-content' }));
            else return;
            Manager.CreateTabList();
        } else {
            if (d.tabType == 'Model') Manager.tab.push(new Model(Manager, Manager.body, d.id, { container: 'tab-content' }, d));
            else return;
        }
    },

    RemoveTab(id) {
        for (let i = 0; i < Manager.tab.length; i++)
            if (Manager.tab[i].id == id) {
                $(Manager.tab[i].element).hide();
                Manager.tab.splice(i, 1);
                break;
            }
        Manager.CreateTabList();
    },

    ParseLogin(json) {
        if (json == null) {
            json = {};
            $(Manager.userPane.element).show();
        }

        if (!json.settings) {
            Manager.darkMode.val = false;
            Manager.customLamps = {};
        } else {
            Manager.darkMode.val = json.settings.darkMode;
            Manager.customLamps = json.settings.customLamps;
            Object.getOwnPropertyNames(json.settings.customLamps).forEach(n => {
                LampData[n] = json.settings.customLamps[n].lampData;
                FluxData[n] = json.settings.customLamps[n].fluxData;
            });
        }

        Manager.projects = {};
        Object.getOwnPropertyNames(json).forEach(name => {
            if (name != 'settings' && name != 'current') Manager.projects[name] = json[name];
        });

        if (json['current'] && json['current'] != -1 && json['current'] != 'current') Manager.OpenProject(json['current']);
        else $(Manager.projectFolder.element).slideDown(SLIDE_SPEED);

        Manager.projectFolder.update(Manager.projects);
        $(Manager.userPane.element).hide();
    },

    LocalSave() {
        if (Manager.current == -1 || !(Manager.current in Manager.projects)) return;
        let proj = {};
        proj.id = Manager.current;
        proj.name = Manager.projects[Manager.current].name;
        proj.activeTab = Manager.activeTab;
        proj.tab = Manager.tab.map(t => t.save());
        Manager.projects[Manager.current] = proj;
    },

    ServerSave() {
        Manager.LocalSave();
        let json = {};
        for (let proj in Manager.projects) json[proj] = Manager.projects[proj];
        let settingsObj = {
            activeProject: Manager.current,
            darkMode: Manager.darkMode.val,
            customLamps: Manager.customLamps,
        }
        json['settings'] = settingsObj;
        json['current'] = Manager.current;

        IO.SaveUser(Manager.username, Manager.password, json);

        localStorage.setItem('username', Manager.username);
        localStorage.setItem('password', Manager.password);
    },

    Unload() {
        if (!Manager.wiping) Manager.ServerSave();
    },

    toggleDarkMode(s) {
        Manager.darkModeEvent.detail.state = s;
        document.body.dispatchEvent(Manager.darkModeEvent);

        $(document.body).toggleClass('dark1', s);
        $(Manager.projectHeader).toggleClass('dark2', s);
        Manager.CreateTabList();
        $('#feedback-link').toggleClass('feedback-dark', s);
    },
}