var Manager = {
    tab: [],
    activeTab: -1,
    activeProject: -1,
    projects: {},
    wiping: false,
    customLamps: {},


    Initialize() {
        Manager.head = $('.manager-head');
        Manager.body = $('.manager-body');
        Manager.projectHeader = CreateElement('div', Manager.head, 'manager-proj-title');
        $(Manager.projectHeader).on('click', function() { $(Manager.projectFolder.element).slideDown(SLIDE_SPEED); });
        CreateElement('i', Manager.projectHeader, 'fas fa-folder manager-proj-folder');
        Manager.projectTitle = CreateElement('span', Manager.projectHeader, '', '');

        let settings = CreateElement('div', Manager.head, 'manager-settings-container');

        Manager.tools = new Button(Manager, settings, 'tools manager-settings-button', Button.ACTION, () => {}, { tooltip: 'Tools' });

        Manager.wipe = new Button(Manager, settings, 'trash manager-settings-button', Button.ACTION, () => {
            if (!confirm('Wipe all projects?')) return;
            Manager.wiping = true;
            location.reload();
        }, { tooltip: 'Wipe Memory' });

        Manager.darkMode = new Button(Manager, settings, 'moon manager-settings-button', Button.TOGGLE, s => Manager.toggleDarkMode(s), { state: false, tooltip: ['Light Mode', 'Dark Mode'] });

        Manager.lampUpload = new LampUpload(Manager, document.body, l => {
            let lampData = { "portDiameter": l.portDiameter, "va": l.va, "type": l.type, "power": l.power, "voltage": l.voltage };
            LampData[l.name] = lampData;
            FluxData[l.name] = l.flux;
            Manager.customLamps[l.name] = { lampData: lampData, fluxData: l.flux };
            Manager.tab.forEach(t => t.update());
        });

        Manager.addLamp = new Button(Manager, settings, 'lightbulb manager-settings-button', Button.ACTION, () => $(Manager.lampUpload.element).slideDown(SLIDE_SPEED), { tooltip: 'Add Custom Lamp' });

        Manager.docs = new Button(Manager, settings, 'question manager-settings-button', Button.ACTION, () => window.open('/docs.html'), { tooltip: 'Docs' });

        Manager.darkModeEvent = new CustomEvent('darkMode', { bubbles: false, detail: { state: false } });

        Manager.news = new Pane(Manager, document.body, {}, () => {}, {
            width: '40vw',
            height: '85vh',
            left: '30vw',
            top: '5vh',
            title: 'Updates',
            select: 'Close',
            draggable: false,
            onCreate: (self) => {
                $(self.link).attr('href', 'mailto:wdelgiudice@labsphere.com');
                self.news = CreateElement('ul', self.element, 'manager-news');
                NEWS.forEach(n => CreateElement('li', self.news, 'manager-news-li', n));
                self.feedback = CreateElement('div', self.element, 'manager-user-create', 'For feedback and feature requests email ');
                self.link = CreateElement('a', self.feedback, '', 'wdelgiudice@labsphere.com');
                $(self.link).attr('href', 'mailto:wdelgiudice@labsphere.com');
                $(self.element).hide();
            },
        });

        Manager.tabList = document.createElement('ul');
        $(Manager.tabList).attr('id', 'tab-list');
        $(Manager.tabList).addClass('tab-bar');
        $(Manager.head).append(Manager.tabList);

        Manager.bigAdd = new Button(Manager, Manager.body, 'plus-square manager-big-add' + (Manager.darkMode.val ? ' dark1' : ''), Button.ACTION, () => Manager.AddTab());

        $('.splashscreen').slideUp(500);
        $(Manager.news.element).slideDown(500);

        let json = IO.LocalStorage();
        if (json && Object.keys(json) != 0) {
            Manager.projects = json.projects;
            Manager.darkMode.val = json.settings.darkMode;
            Manager.customLamps = json.settings.customLamps;
            Manager.activeProject = json.settings.activeProject;
            Object.getOwnPropertyNames(json.settings.customLamps).forEach(n => {
                LampData[n] = json.settings.customLamps[n].lampData;
                FluxData[n] = json.settings.customLamps[n].fluxData;
            });
        } else {
            Manager.darkMode.val = false;
            Manager.customLamps = {};
            Manager.activeProject = -1;
            $(Manager.projectFolder.element).slideDown(SLIDE_SPEED);
        }

        Manager.projectFolder = new ProjectFolder(Manager, document.body, {}, (action, data, data2) => {
            if (action == 'open') Manager.OpenProject(data);
            else if (action == 'create') Manager.OpenProject(Manager.CreateProject());
            else if (action == 'upload') {
                Manager.projects[data.id] = data;
                Manager.OpenProject(data.id);
            } else if (action == 'delete') Manager.DeleteProject(data);
            else if (action == 'rename') {
                Manager.projects[data].name = data2;
                if (Manager.activeProject == data) $(Manager.projectTitle).text(data2);
                Manager.projectFolder.update(Manager.projects);
            }
            Manager.projectFolder.update(Manager.projects);
        });
        Manager.projectFolder.update(Manager.projects);
        Manager.OpenProject(Manager.activeProject);
    },

    get globalTraces() {
        let traces = Manager.tab.filter(t => t.global).map(t => t.trace);
        traces.forEach(t => t.color += '80');
        return traces;
    },

    OpenProject(id) {
        if (id === undefined || id == -1) return;
        if (Manager.activeProject != -1 && id != Manager.activeProject) Manager.LocalSave();
        Manager.activeProject = id;
        Manager.tab.forEach(t => $(t.element).remove());
        Manager.tab = [];
        Manager.projects[id].tab.forEach(t => Manager.AddTab(t));
        $(Manager.projectTitle).text(Manager.projects[id].name);
        Manager.CreateTabList(Manager.projects[id].activeTab);
    },

    DeleteProject(id) {
        if (!id in Manager.projects) return;
        $(Manager.body).children().each(function() { if ($(Manager).hasClass('tab-panel')) $(Manager).remove(); });
        delete Manager.projects[id];
        Manager.projectFolder.update(Manager.projects);
        if (id == Manager.activeProject && Object.keys(Manager.projects).length != 0) {
            Manager.OpenProject(Object.keys(Manager.projects)[0]);
        } else {
            Manager.activeProject = -1;
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

            $(li).on('click', function(e) {
                Manager.CreateTabList(t.id);
                t.update();
            });

            $(li).on('contextmenu', function(e) {
                e.preventDefault();
                let dup = t.save();
                dup.id = 0
                while (dup.id == 0) {
                    dup.id = Math.round(Math.random() * 100000 + 1);
                    Manager.tab.forEach(t => { if (t.id == dup.id) dup.id = 0; });
                }
                Manager.AddTab(dup);
            });

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


        new Button(Manager, Manager.tabList, 'plus-square' + (Manager.darkMode.val ? ' dark1' : ''), Button.ACTION, () => Manager.AddTab());

        if (Manager.tab.length != 0) $(Manager.bigAdd.element).hide();
        else $(Manager.bigAdd.element).show();
    },

    AddTab(d) {
        if (d === undefined || d === null) {
            let id = 0;
            while (id == 0) {
                id = Math.round(Math.random() * 100000 + 1);
                Manager.tab.forEach(t => { if (t.id == id) id = 0; });
            }
            Manager.CreateTabList(Manager.tab.push(new Model(Manager, Manager.body, id, { container: 'tab-content' })).id);

        } else Manager.CreateTabList(Manager.tab.push(new Model(Manager, Manager.body, d.id, { container: 'tab-content' }, d)).id);
        return Manager.tab[Manager.tab.length - 1];
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

    LocalSave() {
        if (Manager.activeProject == -1 || !(Manager.activeProject in Manager.projects)) return;
        let proj = {};
        proj.id = Manager.activeProject;
        proj.name = Manager.projects[Manager.activeProject].name;
        proj.activeTab = Manager.activeTab;
        proj.tab = Manager.tab.map(t => t.save());
        Manager.projects[Manager.activeProject] = proj;
    },

    ExitSave() {
        Manager.LocalSave();
        IO.LocalStorage({
            settings: {
                activeProject: Manager.activeProject,
                darkMode: Manager.darkMode.val,
                customLamps: Manager.customLamps
            },
            projects: Manager.projects //Object.keys(Manager.projects).map(k => Manager.projects[k])
        });
    },

    Unload() {
        return !Manager.wiping ? Manager.ExitSave() : IO.LocalStorage({});
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