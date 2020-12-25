class Lamp {
    constructor(_name, _portDiameter, _vaa, _type, _power, _voltage, _description = 0) {
        this.name = _name;
        this.portDiameter = _portDiameter;
        this.vaa = _vaa;
        this.type = _type;
        this.power = _power;
        this.voltage = _voltage;
        if (_description != 0) this.description = _description;
    }

    flux(i) {
        if (this.name == 'Empty') return 0;
        if (this.name.substring(0, 11) == 'Custom Lamp') {
            let lmpIndex = this.name.substring(12, 13);
            return 0; //dim.lampUploads[lmpIndex][i];
        }
        return FluxData[this.name][i];
    }

    static copy(l) {
        return new Lamp(l.name, l.portDiameter, l.vaa, l.type, l.power, l.voltage);
    }

    static empty() {
        return this.getLamp('Empty');
    }

    static getLamp(name) {
        if (name in LampData) return new Lamp(name, LampData[name].portDiameter, LampData[name].vaa, LampData[name].type, LampData[name].power, LampData[name].voltage, ('description' in LampData[name] ? LampData[name].description : 0));
        else console.error('cound not find lamp \'' + name + '\'');
    }

}