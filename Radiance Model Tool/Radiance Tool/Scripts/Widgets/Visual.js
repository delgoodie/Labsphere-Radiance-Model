class Visual {
    constructor(_top, _parent, _id = -1, _classes = {}) {
        this.top = _top;
        this.parent = _parent;
        this.id = _id;
        this.classes = _classes;

        this.element = document.createElement('div');
        $(document.body).on('darkMode', function (e) { this.toggleDarkMode(e.detail.state); }.bind(this));
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
        this.canvas.width = this.canvas.height;
        this.c = this.canvas.getContext('2d');
    }

    update(mdl, units) {
        let height = this.element.getBoundingClientRect().height;
        let width = this.element.getBoundingClientRect().width;

        $(this.canvas).width(height);
        $(this.canvas).height(height);
        this.canvas.width = height;
        this.canvas.height = height;
        $(this.canvas).css('margin-left', (width - height) * .5);

        //Update Web Path
        $(this.sphere).attr('src', 'http://www.labspheretools.com/resource/sphere-' + mdl.sphereDiameter);

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
        this.c.arc(height * .5 - 5, height * .5, radius * 1.12, 0, Math.PI * 2);
        this.c.fill();

        this.c.fillStyle = 'grey';
        this.c.beginPath();
        this.c.arc(height * .5 - 5, height * .5, radius * 1.07, 0, Math.PI * 2);
        this.c.fill();

        this.c.fillStyle = CCT2Color[(Math.round(Calculator.Math.CCT(mdl, units) / 100) * 100) + ''];
        this.c.beginPath();
        this.c.arc(height * .5 - 5, height * .5, radius, 0, Math.PI * 2);
        this.c.fill();


        //this.HIS();
    }

    HIS() {
        this.rectange({ x: .19 * this.canvas.width, y: .28 * this.canvas.height }, -.9, { x: .12 * this.canvas.width, y: .17 * this.canvas.height }, 'black');
        this.c.beginPath();
        this.c.arc(.19 * this.canvas.width, .28 * this.canvas.height, .06 * this.canvas.width, 0, Math.PI * 2);
        this.c.fill();
    }

    rectange(pos, angle, size, color) {
        this.c.fillStyle = 'red';
        this.c.fillRect(pos.x - 2, pos.y - 2, 4, 4);
        this.c.fillStyle = color;
        this.c.beginPath();
        let short = .5 * size.x;
        let long = Math.hypot(.5 * size.x, size.y);
        this.c.moveTo(pos.x - short * Math.cos(angle + Math.PI), pos.y - short * Math.sin(angle + Math.PI));
        this.c.lineTo(pos.x - short * Math.cos(angle), pos.y - short * Math.sin(angle));
        this.c.lineTo(pos.x - long * Math.cos(angle + Math.atan(size.y / (.5 * size.x))), pos.y - long * Math.sin(angle + Math.atan(size.y / (.5 * size.x))));
        this.c.lineTo(pos.x - long * Math.cos(angle + Math.PI - Math.atan(size.y / (.5 * size.x))), pos.y - long * Math.sin(angle + Math.PI - Math.atan(size.y / (.5 * size.x))));
        this.c.lineTo(pos.x - short * Math.cos(angle + Math.PI), pos.y - short * Math.sin(angle + Math.PI));
        this.c.fill();
    }


    toggleDarkMode(s) {
        $(this.element).toggleClass('dark1', s);
    }
}