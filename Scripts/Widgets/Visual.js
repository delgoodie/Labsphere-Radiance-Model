class Visual {
    constructor(_top, _parent, _id = -1, _classes = {}) {
        this.top = _top;
        this.parent = _parent;
        this.id = _id;
        this.classes = _classes;

        this.element = document.createElement('div');
        $(document.body).on('darkMode', function(e) { this.toggleDarkMode(e.detail.state); }.bind(this));
        $(this.element).attr('id', this.id);
        $(this.element).addClass('visual-container');
        if ('container' in this.classes) $(this.element).addClass(this.classes.container);
        $(this.parent).append(this.element);

        let sphereContainer = CreateElement('div', this.element, 'visual-sphere-container');

        this.sphere = document.createElement('img');
        $(this.sphere).addClass('visual-sphere');
        $(sphereContainer).append(this.sphere);

        this.canvas = document.createElement('canvas');
        $(this.canvas).addClass('visual-canvas');
        $(this.element).append(this.canvas);
        this.c = this.canvas.getContext('2d');
    }

    update(mdl, units) {
        let width = this.element.getBoundingClientRect().width;
        let height = this.element.getBoundingClientRect().height;

        this.canvas.width = width;
        this.canvas.height = height;

        $(this.sphere).attr('src', 'Resources/Visual/sphere-' + mdl.sphereDiameter + '.png'); //(this.top.darkMode.val) ? 'Resources/Visual/sphere-dark.jpg' : 'Resources/Visual/sphere.jpg');

        let radius = 0;
        let scale = height * 0.04560252836;
        switch (mdl.sphereDiameter) {
            case 8:
                radius = mdl.portDiameter * scale * 1.25;
                break;
            case 12:
                radius = mdl.portDiameter * scale * 0.815217391;
                break;
            case 20:
                radius = mdl.portDiameter * scale * 0.490434782;
                break;
            default:
                radius = 0;
        }

        this.c.clearRect(0, 0, this.canvas.width, this.canvas.height);

        this.c.fillStyle = 'black';
        this.c.beginPath();
        this.c.arc(width / 2, height / 2, radius + 3, 0, Math.PI * 2);
        this.c.fill();

        this.c.fillStyle = CCT2Color[(Math.round(Calculator.Math.CCT(mdl, units) / 100) * 100) + ''];
        this.c.beginPath();
        this.c.arc(width / 2, height / 2, radius, 0, Math.PI * 2);
        this.c.fill();
    }


    toggleDarkMode(s) {
        $(this.element).toggleClass('dark1', s);
    }
}