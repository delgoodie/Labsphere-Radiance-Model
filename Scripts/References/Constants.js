const sigFigs = 10;

const ModelType = { CALC: 0, FIXED: 1 };

const TableType = { DERIVED: 0, INPUT: 1 };

const Radiance = {
    W_CM: 32,
    MW_CM: 24,
    W_M: 566,
    MW_M: 432,
    valToKey(val) {
        switch (val) {
            case this.W_CM:
                return 'W/cm' + String.fromCharCode(parseInt('00B2', 16));
            case this.MW_CM:
                return 'mW/cm' + String.fromCharCode(parseInt('00B2', 16));
            case this.W_M:
                return 'W/m' + String.fromCharCode(parseInt('00B2', 16));
            case this.MW_M:
                return 'mW/m' + String.fromCharCode(parseInt('00B2', 16));
            default:
                console.error(val + ' is invalid unit val');
        }
    },
    keyToVal(key) {
        switch (key) {
            case 'W/cm' + String.fromCharCode(parseInt('00B2', 16)):
                return this.W_CM;
            case 'mW/cm' + String.fromCharCode(parseInt('00B2', 16)):
                return this.MW_CM;
            case 'W/m' + String.fromCharCode(parseInt('00B2', 16)):
                return this.W_M;
            case 'mW/m' + String.fromCharCode(parseInt('00B2', 16)):
                return this.MW_M;
            default:
                console.error(key + ' is invalid unit key');
        }
    }
};

const Length = {
    IN: 265,
    CM: 108,
    M: 2,
    NM: 292,
    UM: 492,
    valToKey(val) {
        switch (val) {
            case this.IN:
                return "Inches";
            case this.CM:
                return "Centimeters";
            case this.M:
                return "Meters";
            case this.NM:
                return "Nanometers";
            case this.UM:
                return "Microns";
            default:
                console.error(val + ' is invalid unit val');
        }
    },
    keyToVal(key) {
        switch (key) {
            case "Inches":
                return this.IN;
            case "Centimeters":
                return this.CM;
            case "Meters":
                return this.M;
            case "Nanometers":
                return this.NM;
            case "Microns":
                return this.UM;
            default:
                console.error(key + ' is invalid unit key');
        }
    }
};

const Material = {
    Spectraflect: 0,
    Spectralon: 1,
    Gold: 2,
    Permaflect: 3,
    valToKey(val) {
        switch (val) {
            case 0:
                return 'Spectraflect';
            case 1:
                return 'Spectralon';
            case 2:
                return 'Gold';
            case 3:
                return 'Permaflect';
            default:
                console.error(val + ' is invalid unit val');
        }
    },
    keyToVal(key) {
        switch (key) {
            case 'Spectraflect':
                return 0;
            case 'Spectralon':
                return 1;
            case 'Gold':
                return 2;
            case 'Permaflect':
                return 3;
            default:
                console.error(key + ' is invalid unit key');
        }
    }
};