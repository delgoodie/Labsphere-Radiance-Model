class ProjectFolder extends Pane {
    constructor(_top, _parent, _classes = {}, _updateValue = () => {}, _d = { projects: {} }) {
        super(_top, _parent, _classes, _updateValue, {
            width: '30vw',
            height: '50vh',
            top: '25vh',
            left: '35vw',
            draggable: false,
            disableSelect: true,
            title: 'Project Folder',
            disableDefaultOnCreate: false,
            disableDefaultOnClose: true,
            disableDefaultOnSelect: false,
        });

        if ('projects' in _d) this.update(_d.projects);

        if ('container' in this.classes) $(this.element).addClass(this.classes.container);
    }

    onCreate(_d) {
        this.projectList = document.createElement('div');
        $(this.projectList).addClass('proj-list');
        $(this.element).append(this.projectList);

        $(this.projectList).on('drag dragstart dragend dragover dragenter dragleave drop', function(e) {
            e.preventDefault();
            e.stopPropagation();
        }.bind(this));

        $(this.projectList).on('dragover dragenter', function(e) {
            if (e.target == this.projectList) $(this.projectList).addClass(this.top.darkMode.val ? 'proj-droppable proj-droppable-dark' : 'proj-droppable');
        }.bind(this));

        $(this.projectList).on('dragleave dragend drop', function(e) {
            if (e.target == this.projectList) $(this.projectList).removeClass(this.top.darkMode.val ? 'proj-droppable proj-droppable-dark' : 'proj-droppable');
        }.bind(this));

        this.projectList.addEventListener('drop', function(e) {
            e.preventDefault();
            IO.ParseJSON(e.dataTransfer.files[0]).then(data => this.updateValue('upload', data));
        }.bind(this));

        let add = document.createElement('div');
        $(add).addClass('proj-add');
        $(add).text('Create Project');
        $(this.element).append(add);

        $(add).on('click', function() {
            this.updateValue('create');
            let projs = $(this.projectList).children();
            for (let i = projs.length - 1; i >= 0; i--) {
                if ($($(projs[i]).children()[0]).val() == 'New Project') {
                    $($(projs[i]).children()[0]).val('');
                    $($(projs[i]).children()[0]).focus();
                    break;
                }
            }
        }.bind(this));

        let upload = document.createElement('div');
        $(upload).addClass('proj-upload');
        $(upload).text('Upload Project');
        $(this.element).append(upload);


        $(upload).on('click', function(e) {
            e.preventDefault();
            let input = document.createElement('input');
            $(input).attr('type', 'file');
            $(input).attr('accept', '.json');
            $(document.body).append(input);
            $(input).on('change', function(e) {
                e.preventDefault();
                IO.ParseJSON(e.target.files[0]).then(data => this.updateValue('upload', data));
                $(input).remove();
            }.bind(this));

            input.click();
        }.bind(this));
    }

    onClose() {
        if ($(this.projectList).children().length != 0) $(this.element).slideUp(SLIDE_SPEED);
    }

    update(projects) {
        $(this.projectList).empty();
        for (let proj in projects) {
            if (projects[proj].name == undefined) continue;
            let p = document.createElement('div');
            $(p).addClass('proj-value');
            $(this.projectList).append(p);

            let input = CreateElement('input', p, 'proj-input');
            $(input).attr('type', 'text');
            $(input).val(projects[proj].name);

            new Button(this.top, p, 'times proj-icon', Button.ACTION, () => this.updateValue('delete', proj), {});

            new Button(this.top, p, 'file-download proj-icon', Button.ACTION, () => IO.DownloadJSON(projects[proj], projects[proj].name), {});

            $(p).on('click', function() {
                this.updateValue('open', proj);
                $(this.element).slideUp(SLIDE_SPEED);
            }.bind(this));

            $(input).on('click', function(e) { e.stopPropagation(); }.bind(this));
            $(input).on('change', function() { this.updateValue('rename', proj, $(input).val()); }.bind(this));
        }
        this.toggleDarkMode(this.top.darkMode.val);
    }

    toggleDarkMode(s) {
        $(this.projectList).toggleClass('dark1', s);
        $(this.droppable).toggleClass('proj-droppable-dark', s);
        $('.proj-add').toggleClass('dark3', s);
        $('.proj-upload').toggleClass('dark3', s);
        $('.proj-value').toggleClass('dark3', s);
        $('.proj-input').toggleClass('dark3', s);
        $('.proj-icon').toggleClass('dark3', s);
    }
}