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

        let rect = this.element.getBoundingClientRect();
        this.up = rect.top;
        this.right = rect.right;
        this.width = rect.width;
        this.height = rect.height;

    }

    update(mdl, units) {
        $(this.element).empty();

        this.sphere = document.createElement('img');
        $(this.sphere).attr('id', this.id + '-sphere');
        $(this.sphere).attr('src', 'Resources/Visual/sphere-' + mdl.sphereDiameter + '.png'); //(this.top.darkMode.val) ? 'Resources/Visual/sphere-dark.jpg' : 'Resources/Visual/sphere.jpg');
        $(this.sphere).addClass('visual-sphere');
        $(this.element).append(this.sphere);

        let radius = 0;
        let scale = this.height * 0.04560252836;
        switch (mdl.sphereDiameter) {
            case 8:
                radius = mdl.portDiameter * scale;
                break;
            case 12:
                radius = mdl.portDiameter * scale * 0.652173913;
                break;
            case 20:
                radius = mdl.portDiameter * scale * 0.417391304;
                break;
            default:
                radius = 0;

        }

        this.canvas = document.createElement('canvas');
        $(this.canvas).addClass('visual-canvas');
        this.canvas.width = this.width;
        this.canvas.height = this.height;
        $(this.element).append(this.canvas);
        this.c = this.canvas.getContext('2d');

        this.c.fillStyle = 'black';
        this.c.beginPath();
        this.c.arc(this.width / 2, this.height / 2, radius + 5, 0, Math.PI * 2);
        this.c.fill();

        this.c.fillStyle = CCT2Color[(Math.round(Calculator.Math.CCT(mdl, units) / 100) * 100) + ''];
        this.c.beginPath();
        this.c.arc(this.width / 2, this.height / 2, radius, 0, Math.PI * 2);
        this.c.fill();


        return;
        for (let i = 0; i < mdl.lamps.length; i++) {
            if (mdl.lamps[i].name == 'Empty') continue;
            let lamp = this.getLamp(mdl.sphereDiameter, i, mdl.lamps[i].type);
            let lampElement = document.createElement('img');
            $(lampElement).attr('src', lamp.src);
            $(lampElement).css('transform', 'rotate(' + lamp.a + 'deg)');
            $(lampElement).css('width', '4.5vw');
            $(lampElement).css('height', '11vh');
            $(lampElement).css('position', 'absolute');
            $(lampElement).css('left', lamp.x);
            $(lampElement).css('top', lamp.y);
            $(this.element).append(lampElement);
        }
    }


    toggleDarkMode(s) {
        $(this.element).toggleClass('visual-container-dark', s);
    }

    getLamp(sD, i, type) {
        let aOff = 0;
        let xOff = 0;
        let yOff = 0;
        switch (type) {
            case 'QTH Internal':
                aOff = 50;
                xOff = 0;
                yOff = 0;
                break;
            case 'QTH External':
                aOff = 100;
                xOff = -10;
                yOff = 0;
                break;
        }
        switch (sD) {
            case 8:
                switch (i) {
                    case 0:
                        return {
                            x: this.right + 169 + xOff,
                            y: this.up + 10 + yOff,
                            a: 0 + aOff,
                            src: this.getSrc(type)
                        };
                    case 1:
                        return {
                            x: this.right + 50 + xOff,
                            y: this.up + 50 + yOff,
                            a: -55 + aOff,
                            src: this.getSrc(type)
                        };
                    case 2:
                        return {
                            x: this.right + 45 + xOff,
                            y: this.up + 235 + yOff,
                            a: 235 + aOff,
                            src: this.getSrc(type)
                        };
                    case 3:
                        return {
                            x: this.right + 130 + xOff,
                            y: this.up + 295 + yOff,
                            a: 195 + aOff,
                            src: this.getSrc(type)
                        };
                    case 4:
                        return {
                            x: this.right + 320 + xOff,
                            y: this.up + 145 + yOff,
                            a: 90 + aOff,
                            src: this.getSrc(type)
                        };
                }
                break;
        }
        return {
            x: 0,
            y: 0,
            src: this.getSrc(type)
        }
    }

    getSrc(type) {
        switch (type) {
            case 'QTH Internal':
                return 'Resources/Visual/HIS.png';
            case 'QTH External':
                return 'Resources/Visual/HES.png';
            default:
                return 'Resources/Visual/HIS-300.png';
        }
    }
}