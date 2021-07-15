var Calculator = {
    Units: {
        /**
         * the default units of any parameter
         */
        Default: {
            length: Length.IN,
            wavelength: Length.NM,
            radiance: Radiance.W_CM,
        },
        /**
         * converts a value from the given units to the desired units
         */
        Convert(val, giv, des) {
            let final = 0;
            switch (giv) {
                case Radiance.W_CM:
                    switch (des) {
                        case Radiance.W_CM:
                            final = val;
                            break;
                        case Radiance.MW_CM:
                            final = val * 1e3;
                            break;
                        case Radiance.W_M:
                            final = val * 1e4;
                            break;
                        case Radiance.MW_M:
                            final = val * 1e7;
                            break;
                        default:
                            console.error('desired unit not found');
                    }
                    break;
                case Radiance.MW_CM:
                    switch (des) {
                        case Radiance.W_CM:
                            final = val * 1e-3;
                            break;
                        case Radiance.MW_CM:
                            final = val;
                            break;
                        case Radiance.W_M:
                            final = val * 1e1;
                            break;
                        case Radiance.MW_M:
                            final = val * 1e4;
                            break;
                        default:
                            console.error('desired unit not found');
                    }
                    break;
                case Radiance.W_M:
                    switch (des) {
                        case Radiance.W_CM:
                            final = val * 1e-4;
                            break;
                        case Radiance.MW_CM:
                            final = val * 1e-1;
                            break;
                        case Radiance.W_M:
                            final = val;
                            break;
                        case Radiance.MW_M:
                            final = val * 1e3;
                            break;
                        default:
                            console.error('desired unit not found');
                    }
                    break;
                case Radiance.MW_M:
                    switch (des) {
                        case Radiance.W_CM:
                            final = val * 1e-7;
                            break;
                        case Radiance.MW_CM:
                            final = val * 1e-4;
                            break;
                        case Radiance.W_M:
                            final = val * 1e-3;
                            break;
                        case Radiance.MW_M:
                            final = val;
                            break;
                        default:
                            console.error('desired unit not found');
                    }
                    break;
                case Length.IN:
                    switch (des) {
                        case Length.IN:
                            final = val;
                            break;
                        case Length.CM:
                            final = val * 2.54;
                            break;
                        case Length.M:
                            final = val * 2.54 / 100;
                            break;
                        case Length.NM:
                            final = val * 2.54 / 100 * 1e9;
                            break;
                        case Length.UM:
                            final = val * 2.54 / 100 * 1e7;
                            break;
                        default:
                            console.error('desired unit not found');
                    }
                    break;
                case Length.CM:
                    switch (des) {
                        case Length.IN:
                            final = val / 2.54;
                            break;
                        case Length.CM:
                            final = val;
                            break;
                        case Length.M:
                            final = val / 100;
                            break;
                        case Length.NM:
                            final = val * 1e7;
                            break;
                        case Length.UM:
                            final = val * 1e5;
                            break;
                        default:
                            console.error('desired unit not found');
                    }
                    break;
                case Length.M:
                    switch (des) {
                        case Length.IN:
                            final = val / 2.54 * 100;
                            break;
                        case Length.CM:
                            final = val * 100;
                            break;
                        case Length.M:
                            final = val;
                            break;
                        case Length.NM:
                            final = val * 1e9;
                            break;
                        case Length.UM:
                            final = val * 1e7;
                            break;
                        default:
                            console.error('desired unit not found');
                    }
                    break;
                case Length.NM:
                    switch (des) {
                        case Length.IN:
                            final = val / 1e7 / 2.54;
                            break;
                        case Length.CM:
                            final = val / 1e7;
                            break;
                        case Length.M:
                            final = val / 1e9;
                            break;
                        case Length.NM:
                            final = val;
                            break;
                        case Length.UM:
                            final = val / 1000;
                    }
                    break;
                case Length.UM:
                    switch (des) {
                        case Length.IN:
                            final = val / 1e5 / 2.54;
                            break;
                        case Length.CM:
                            final = val / 1e5;
                            break;
                        case Length.M:
                            final = val / 1e7;
                            break;
                        case Length.NM:
                            final = val * 1000;
                            break;
                        case Length.UM:
                            final = val;
                            break;
                        default:
                            console.error('desired unit not found');
                    }
                    break;
                default:
                    console.error('given unit not found');
            }
            return Math.round(final * Math.pow(10, sigFigs)) / Math.pow(10, sigFigs);
        }
    },

    Model: {
        /**
         * calculates Blackbody number
         */
        Blackbody(i, blackbody_ON, designed_EB_Power, applied_EB_Temp, designed_EB_Temp) {
            if (blackbody_ON) {
                let y = .25; //wavelength(i);
                let totalPower = 5.67e-8 * Math.pow(applied_EB_Temp, 4);
                let eExponent = (6.63e-34 * 3e+8 / (y * 1.38e-23 * applied_EB_Temp * 1e-6));
                let numeratorConstnants = 2e24 * Math.PI * 6.63e-34 * Math.pow(3e8, 2);
                let applied_EB_Power = designed_EB_Power * Math.pow(applied_EB_Temp / designed_EB_Temp, 4);
                return ((applied_EB_Power / totalPower) * numeratorConstnants) / (Math.pow(y, 5) * Math.pow(Math.E, eExponent) - 1);
            } else return 0;
        },
        /**
         * internmediate blackbody calculation
         */
        ExternalBlackbodyFlux(i, bbData) {
            return Calculator.Model.Blackbody(i, bbData.blackbody_ON, bbData.designed_EB_Power, bbData.applied_EB_Temp, bbData.designed_EB_Temp) * bbData.blackbodyNumber;
        },

        /**
         * internmediate blackbody calculation
         */
        InternalBlackbodyFlux(i, bbData) {
            return Calculator.Model.Blackbody(i, bbData.blackbody_QTH_ON, bbData.designed_EB_Power, bbData.applied_EB_Temp, bbData.designed_EB_Temp) * InternalBlackbodyData.Emmisivity[i] * InternalBlackbodyData.Transmittance[i] * bbData.blackbody_QTH_Number;
        },

        /**
         * calculates sphere area from diameter
         */
        SphereArea(d) {
            return 4 * Math.PI * Math.pow(d / 2, 2);
        },

        /**
         * calcuales wall fraction of model
         */
        WallFraction(mdl, units) {
            let exitArea = Math.PI * Math.pow(Calculator.Units.Convert(mdl.portDiameter, units.length, Length.CM) / 2, 2);
            let sArea = Calculator.Model.SphereArea(Calculator.Units.Convert(mdl.sphereDiameter, units.length, Length.CM));
            let inputPortDiameter = Math.sqrt(mdl.lamps.reduce((sum, l, i) => sum += Math.pow(Calculator.Lamp.Specs(l).portDiameter * mdl.qty[i], 2), 0));
            let inputPortArea = Math.PI * Math.pow((inputPortDiameter * 2.54) / 2, 2);
            return (sArea - exitArea - inputPortArea) / sArea; //fixed
        },

        /**
         * finds reflectance at wavelength from data
         */
        Reflectance(w, mdl, units) {
            let i = Math.round((w - (units.wavelength == Length.NM ? 250 : .25)) * (units.wavelength == Length.NM ? 1 : 1000));
            if (i < 0 || i > 2250) return 0;
            let ref = 0;
            switch (mdl.material) {
                case Material.Spectraflect:
                    ref = ReflectanceData.BaSO4[i];
                    break;
                case Material.Spectralon:
                    ref = ReflectanceData.PTFE[i];
                    break;
                case Material.Gold:
                    ref = ReflectanceData.Gold[i];
                    break;
                case Material.Permaflect:
                    ref = ReflectanceData.Permaflect[i];
            }
            return ref;
        },

        /**
         * calculates spectral radiance at given wavelength
         */
        SpectralRadiance(w, mdl, units) { //inches
            let i = Math.round((w - (units.wavelength == Length.NM ? 250 : .25)) * (units.wavelength == Length.NM ? 1 : 1000));
            let ref = Calculator.Model.Reflectance(w, mdl, units);
            let lampSum = mdl.lamps.reduce((sum, l, index) => sum += Calculator.Lamp.FluxAtIndex(l, i) * mdl.onQty[index] * mdl.va[index], 0);

            let wFraction = Calculator.Model.WallFraction(mdl, units);

            let iBlackbodyFlx = 0;
            let eBlackbodyFlx = 0;
            if (mdl.blackbody != 0) {
                //iBlackbodyFlx = Calculator.internalBlackbodyFlux(i, inpt.blackbody);
                //eBlackbodyFlx = Calculator.externalBlackbodyFlux(i, inpt.blackbody);
            }
            let wcm = (ref * 1 * (lampSum + iBlackbodyFlx + eBlackbodyFlx)) / (Math.PI * Calculator.Model.SphereArea(Calculator.Units.Convert(mdl.sphereDiameter, units.length, Length.CM)) * (1 - ref * wFraction));
            return Calculator.Units.Convert(wcm, Radiance.W_CM, units.radiance);
        },

        /**
         * calculates integral radiance between two wavelengths
         */
        IntegralRadiance(a, b, mdl, units) {
            if (units.wavelength == Length.NM && (a < 250 || b > 2500) || units.wavelength == Length.UM && (a < .25 || b > 2.5)) return 0;
            let increment = (units.wavelength == Length.NM ? 1 : .001);
            let sum = 0;
            sum += Calculator.Model.SpectralRadiance(a, mdl, units) * .5;
            for (let w = a + increment; w < b - increment; w += increment) sum += Calculator.Model.SpectralRadiance(w, mdl, units);
            sum += Calculator.Model.SpectralRadiance(b, mdl, units) * .5;
            return sum * increment;
        },

        /**
         * finds a model given the input requirements
         */
        SpectralReverse(startModel, lt, ut, units) {
            lt = Calculator.Trace.Interpolate(lt);
            ut = Calculator.Trace.Interpolate(ut);
            let model;
            let reset = () => model = {
                name: startModel.name,
                lamps: [],
                portDiameter: startModel.portDiameter,
                sphereDiameter: startModel.sphereDiameter,
                material: startModel.material,
                portCount: startModel.portCount,
                qty: [...new Array(startModel.portCount)].map(_ => 1),
                onQty: [...new Array(startModel.portCount)].map(_ => 1),
                va: [...new Array(startModel.portCount)].map(_ => 1)
            };
            reset();


            let iteration = 0;
            let index = 0;
            let avg = Calculator.Trace.Sum(lt, ut);
            avg.y = avg.y.map(y => y / 2);

            let constant = Math.PI * Calculator.Model.SphereArea(Calculator.Units.Convert(8, Length.IN, Length.CM));
            let predicate = (i, wF) => ReflectanceData.BaSO4[i] / (constant * (1 - ReflectanceData.BaSO4[i] * wF));

            let wl = [];
            let checkWl = lmps => wl.some(l => lmps.every(lmp => l.some(lm => lm == lmp)));
            for (; ;) {
                iteration++;
                if (Calculator.Trace.Between(ut, lt, Calculator.Trace.Model(model))) return model;
                else wl.push(model.lamps.slice());
                if (iteration > 60) {
                    console.error('Spectral Reverse Failed');
                    return model;
                }

                //TARGET FLUX
                let offset = Calculator.Trace.Difference(avg, Calculator.Trace.Model(model));
                let PISA = Math.PI * Calculator.Model.SphereArea(Calculator.Units.Convert(model.sphereDiameter, units.length, Length.CM));
                let targetFlux = offset.y.map((r, i) => {
                    let ref = Calculator.Model.Reflectance(offset.x[i], model, units);
                    return r / ref * PISA * (1 - ref * Calculator.Model.WallFraction(model, units));
                });

                //FIND MINIMIZING LAMP
                let bestLamp, minError;
                Object.getOwnPropertyNames(LampData).forEach((name, i) => {
                    if (checkWl(model.lamps.filter((v, i) => i != index).concat([name]))) return;
                    let error = Calculator.Trace.Error({ x: avg.x, y: targetFlux, units: avg.units }, { x: avg.x, y: FluxData[name], units: avg.units });
                    if (bestLamp !== undefined) {
                        if (error < minError) {
                            minError = error;
                            bestLamp = name;
                        }
                    } else {
                        bestLamp = name;
                        minError = error;
                    }
                });

                model.lamps[index] = bestLamp;
                index = (index + 1) % model.portCount;
            }
        },

        /**
         * previous spectral reverse versions (not used)
         */
        uSpectralReverse(startModel, lt, ut, units) {
            lt = Calculator.Trace.Interpolate(lt);
            ut = Calculator.Trace.Interpolate(ut);
            let model;
            let reset = () => model = {
                name: '',
                lamps: [],
                portDiameter: startModel.portDiameter,
                sphereDiameter: startModel.sphereDiameter,
                material: startModel.material,
                portCount: startModel.portCount,
                qty: [...new Array(startModel.portCount)].map(_ => 1),
                onQty: [...new Array(startModel.portCount)].map(_ => 1),
            };
            reset();


            let iteration = 0;
            let index = 0;
            let avg = Calculator.Trace.Sum(lt, ut);
            avg.y = avg.y.map(y => y / 2);
            let target = avg; //Calculator.Trace.Copy(avg);

            let constant = Math.PI * Calculator.Model.SphereArea(Calculator.Units.Convert(8, Length.IN, Length.CM));
            let predicate = (i, wF) => ReflectanceData.BaSO4[i] / (constant * (1 - ReflectanceData.BaSO4[i] * wF));
            for (; ;) {
                //CHECK FLOW CONDITIONS
                iteration++;
                if (Calculator.Trace.Between(ut, lt, Calculator.Trace.Model(model))) return model;
                if (iteration > 50) {
                    if (target == avg) target = lt;
                    else if (target == lt) target = ut;
                    else if (target == ut) {
                        console.error('Spectral Reverse Failed');
                        return model;
                    }
                    reset();
                    iteration = 0;
                }

                //TARGET FLUX
                let offset = Calculator.Trace.Difference(target, Calculator.Trace.Model(model));
                let PISA = Math.PI * Calculator.Model.SphereArea(Calculator.Units.Convert(model.sphereDiameter, units.length, Length.CM));
                let targetFlux = offset.y.map((r, i) => {
                    let ref = Calculator.Model.Reflectance(offset.x[i], model, units);
                    return r / ref * PISA * (1 - ref * Calculator.Model.WallFraction(model, units));
                });

                //FIND MINIMIZING LAMP
                let bestLamp, minError;
                Object.getOwnPropertyNames(LampData).forEach((name, i) => {
                    let error = Calculator.Trace.Error({ x: target.x, y: targetFlux, units: target.units }, { x: target.x, y: FluxData[name], units: target.units });
                    if (bestLamp !== undefined) {
                        if (error < minError) {
                            minError = error;
                            bestLamp = name;
                        }
                    } else {
                        bestLamp = name;
                        minError = error;
                    }
                });

                model.lamps[index] = bestLamp;
                index = (index + 1) % model.portCount;
            }
        },

        /**
         * previous spectral reverse versions (not used)
         */
        mSpectralReverse(startModel, lt, ut, units) {
            lt = Calculator.Trace.Interpolate(lt);
            ut = Calculator.Trace.Interpolate(ut);

            let model = {
                name: startModel.name,
                lamps: [...new Array(startModel.portCount)].map(_ => 'HIS-010'),
                portDiameter: startModel.portDiameter,
                sphereDiameter: startModel.sphereDiameter,
                material: startModel.material,
                portCount: startModel.portCount,
                qty: [...new Array(startModel.portCount)].map(_ => 1),
                onQty: [...new Array(startModel.portCount)].map(_ => 1),
            };

            let wF = Calculator.Model.WallFraction(model, units) * 1;
            let PISA = Math.PI * Calculator.Model.SphereArea(Calculator.Units.Convert(model.sphereDiameter, units.length, Length.CM));
            let lFlux = lt.y.map((r, i) => {
                let ref = Calculator.Model.Reflectance(lt.x[i], model, units);
                return r / ref * PISA * (1 - ref * wF);
            });
            let uFlux = ut.y.map((r, i) => {
                let ref = Calculator.Model.Reflectance(ut.x[i], model, units);
                return r / ref * PISA * (1 - ref * wF);
            });


            let avg = lFlux.map((l, i) => (l + uFlux[i]) / 2);

            let lampNames = Object.getOwnPropertyNames(LampData);
            let wA = lt.x[0];
            let wB = lt.x[lt.x.length - 1];

            console.log('start model passed', Calculator.Lamp.SumBetween(startModel.lamps, wA, wB).every((f, i) => f >= lFlux[i] && f <= uFlux[i]));

            function rank(iF) {
                let ret = lampNames.slice();
                let sums = ret.map(n => Calculator.Lamp.FluxBetween(n, wA, wB).map((f, i) => f + iF[i]));
                let errors = sums.map(s => Math.sqrt(s.map((f, i) => (avg[i] - f) * (avg[i] - f)).reduce((sum, f) => sum + f, 0)));
                let sorted = false;
                while (!sorted) {
                    sorted = true;
                    for (let i = 1; i < ret.length; i++) {
                        if (sums[i].some((f, i) => f > uFlux[i])) {
                            ret.splice(i, 1);
                            errors.splice(i, 1);
                            sorted = false;
                            break;
                        } else if (errors[i] < errors[i - 1]) {
                            let temp = [ret[i], errors[i]];
                            errors[i] = errors[i - 1];
                            ret[i] = ret[i - 1];
                            ret[i - 1] = temp[0];
                            errors[i - 1] = temp[1];
                            sorted = false;
                        }
                    }
                }
                return ret.filter((_, i) => i < 5);
            }

            function rec(lamps) {
                let iF = Calculator.Lamp.SumBetween(lamps, wA, wB);
                if (iF.every((f, i) => f >= lFlux[i] && f <= uFlux[i])) {
                    console.log('success', lamps);
                    return lamps;
                } else if (lamps.length == model.portCount) {
                    console.log('end condition', lamps);
                    return false;
                }

                let rankedLamps = rank(iF);
                for (let i = 0; i < rankedLamps.length; i++) {
                    let ret = rec([rankedLamps[i], ...lamps]);
                    if (ret) return ret;
                }
                console.log('end of local func')
                return false;
            }

            model.lamps = rec([]) || [];
            console.log('lamps: ', model.lamps);
            while (model.lamps.length < model.portCount) model.lamps.push('Empty');
            return model;

        },

        /**
         * Finds model given inband requirements (not implemented)
         */
        InbandReverse() { },


        /**
         * gives the string according to the index of a port
         */
        IndexToPort(i) {
            switch (i) {
                case 0:
                    return 'A';
                case 1:
                    return 'B';
                case 2:
                    return 'C';
                case 3:
                    return 'D';
                case 4:
                    return 'E';
                case 5:
                    return 'F';
                case 6:
                    return 'G';
                case 7:
                    return 'H';
                case 8:
                    return 'I';
                case 9:
                    return 'J';
                default:
                    return 'I didn\'t know we had this many ports';
            }
        },

        /**
         * returns the number of ports for a given sphere diameter
         */
        GetNumPorts(sD) {
            switch (sD) {
                case 6:
                    return 2;
                case 8:
                    return 2;
                case 12:
                    return 3;
                case 20:
                    return 4;
                case 30:
                    return 6;
                case 40:
                    return 25;
                case 65:
                    return 35;
                case 76:
                    return 45;
                default:
                    return -1;
            }
        },

        /**
         * returns an array of wavelengths according to the given units
         */
        GetWavelength(units) {
            return [...new Array(2250)].map((_, i) => 250 + i).map(w => Calculator.Units.Convert(w, Length.NM, units.wavelength));
        },

        /**
         * thermal calculations (not implemented)
         */
        Thermal(mdl, units) {
            /*
            Heat Input = K
            Lamp Efficiency = K
            Qcond = K
            port frac = K (from model)
            exit port diameter = K
            Coating Internal Diameter = K



            Exit Port Area = pi * (exit port diameter)^2 / 4 * .0254^2

            Sphere Interior Area = pi * (Coating Internal Diameter)^2 * .0254^2


            Inner Wall Temp = 
            Conv Coeff = 


            Radiated Power = (Heat Input) * (1 - (Lamp Efficiency))
            
            Power Into Sphere = (Radiated Power) * (1 - ((Exit Port Area) / (Sphere Interior Area)) * (Nom Ref) / (1 - (Nom Ref) * (1 - (port frac)))

            Qconv = (Convection Coefficient) * (Sphere Exterior Area (m^2)) * ((Outer Temp (C) - (Ambient Temp (C))) 

            Qrad = Math.E * (Sphere Exterior Area (m^2)) * (Stef Bolz Coeff) * (View Factor) * (((Outer Wall Temp) + 273)^4 - (Ambient Temp (in kelvin)^4)


            Qport = if exit port diameter > 0  (Conv Coeff) * (exit port area (m^2)) * ((Inner Wall temp) - (Ambient Temp)) else 0
             energy balance = (power in) - Qconv - Qrad - Qcond - Qport
            */
        }

    },

    Math: {
        /**
         * rounds according to sig figs
         */
        Round(val, figs) {
            return Math.round(val * Math.pow(10, figs)) / Math.pow(10, figs);
        },

        /**
         * calculates CCT from model
         */
        CCT(mdl, units) {
            let x = 0;
            let y = 0;
            let z = 0;
            for (let i = 0; i < 94; i++) {
                let r = Calculator.Model.SpectralRadiance(Calculator.Units.Convert(i * .005 + .36, Length.UM, units.wavelength), mdl, units);
                x += CCTbarData.xBar[i] * r;
                y += CCTbarData.yBar[i] * r;
                z += CCTbarData.zBar[i] * r;
            }
            x /= 200;
            y /= 200;
            z /= 200;

            let u = x == 0 ? 0 : (4 * x) / (x + 15 * y + 3 * z);
            let v = y == 0 ? 0 : (6 * y) / (x + 15 * y + 3 * z);

            let min = CCTData.u[0] * 10;
            let mindex = -1;
            for (let i = 1000; i < 22000; i++)
                if (Math.sqrt(Math.pow(CCTData.u[i - 999] - u, 2) + Math.pow(CCTData.v[i - 999] - v, 2)) < min) {
                    min = Math.sqrt(Math.pow(CCTData.u[i - 999] - u, 2) + Math.pow(CCTData.v[i - 999] - v, 2));
                    mindex = i;
                }
            return mindex;
        },
        /**
         * calculates Candelas from model
         */
        Candelas(mdl, units) {
            return VLambdaData.reduce((sum, vlambda, i) => sum += Calculator.Units.Convert(Calculator.Model.SpectralRadiance(i * (units.wavelength == Length.NM ? 1 : .001) + (units.wavelength == Length.NM ? 250 : .25), mdl, units), units.radiance, Radiance.W_CM) * vlambda * 6830, 0);
        },
        /**
         * calculates Lumens from model
         */
        Lumens(mdl, units) {
            return VLambdaData.reduce((sum, vlambda, i) => sum + mdl.lamps.reduce((lsum, l, j) => lsum + Calculator.Lamp.FluxAtIndex(l, i) * mdl.onQty[j] * mdl.va[j], 0) * Calculator.Math.CBFilter(i) * vlambda, 0) * .683;
        },
        /**
         * calculates FootLamberts from model
         */
        FootLamberts(mdl, units) {
            return Calculator.Math.Candelas(mdl, units) * 0.291885581;
        },
        /**
         * calculates Lux from model
         */
        Lux(mdl, units) {
            return Calculator.Math.Candelas(mdl, units) * Math.PI;
        },
        /**
         * calculates CBFilter from wavelength
         */
        CBFilter(w) {
            return 1;
        },
        /**
         * calculates irradiance between two wavelengths at a given distance from the exit port
         */
        Irradiance(wA, wB, d, mdl, units) {
            return Calculator.Model.IntegralRadiance(wA, wB, mdl, units) * Math.PI * (d == 0 ? 1 : Math.pow(Math.sin(Math.atan(Calculator.Units.Convert(mdl.portDiameter, units.length, Length.M) / (2 * d))), 2));
        },
    },

    Trace: {
        /**
         * tests two traces with a given Test function
         * test function compares y-values at every shared x-value and returns true or false (based on test)
         * if every is true: all tests must return true for Compare to return true
         * else: only one test must return true for Compare to return true  
         */
        Compare(t1, t2, tF = (y1, y2) => y1 == y2, every = true) {
            let passed = every;
            for (let i = 0; i < t1.x.length; i++)
                if (t2.x.indexOf(Calculator.Units.Convert(t1.x[i], t1.units.wavelength, t2.units.wavelength)) != -1) {
                    let y1 = Calculator.Units.Convert(t1.y[i], t1.units.radiance, t2.units.radiance);
                    let y2 = t2.y[t2.x.indexOf(Calculator.Units.Convert(t1.x[i], t1.units.wavelength, t2.units.wavelength))];
                    if (tF(y1, y2)) passed = every ? passed : true;
                    else passed = every ? false : passed;
                }
            return passed;
        },

        /**
         * not used
         */
        Test(t, tF, every = true) {
            return t.y.reduce((passed, y) => every ? (!passed ? false : tF(y)) : (passed ? true : tF(y)), every);
        },
        /**
         * tests if every point on a trace is between an upper trace and lower trace
         */
        Between(ut, lt, trace) {
            return Calculator.Trace.Compare(lt, trace, (y1, y2) => y1 <= y2, true) && Calculator.Trace.Compare(ut, trace, (y1, y2) => y1 >= y2, true);
        },

        /**
         * returns a new trace that is the sum of two traces at every y-value
         */
        Sum(t1, t2) {
            let x = t1.x.filter(w => t2.x.includes(w));
            return { x: x, y: x.map(w => t1.y[t1.x.indexOf(w)] + t2.y[t2.x.indexOf(w)]) };
        },
        /**
         * returns a new trace that is the differences of two traces at every y-value
         */
        Difference(t1, t2) {
            let x = t1.x.filter(w => t2.x.includes(w));
            return { x: x, y: x.map(w => t1.y[t1.x.indexOf(w)] - t2.y[t2.x.indexOf(w)]) };
        },
        /**
         * finds the error between two traces (difference)
         */
        Error(t1, t2) {
            return Math.sqrt(Calculator.Trace.Difference(t1, t2).y.map(y => y * y).reduce((sum, y) => sum + y, 0));
        },

        /**
         * interpolates a trace (given a trace that is not defined at every x-value in its domain, interpolate to define at every x)
         */
        Interpolate(t) {
            let ret = {};
            ret.x = t.x.slice();
            ret.y = t.y.slice();
            ret.name = t.name;
            ret.color = t.color;
            ret.units = t.units;
            ret.x.forEach((_, i) => {
                if (i != t.x.length - 1) {
                    let y = x => (t.y[i + 1] - t.y[i]) / (t.x[i + 1] - t.x[i]) * (x - t.x[i]) + t.y[i];
                    for (let j = t.x[i]; j < t.x[i + 1]; j += t.units.wavelength == Length.NM ? 1 : .001) {
                        ret.x.push(j);
                        ret.y.push(y(j));
                    }
                }
            });
            return Calculator.Trace.Sort(ret);
        },

        /**
         * sorts a trace so that all x-y pairs are in order of their x-value
         */
        Sort(t) {
            let sorted = false;
            let temp = 0;
            while (!sorted) {
                sorted = true;
                for (let i = 1; i < t.x.length; i++) {
                    if (t.x[i - 1] * 1 > t.x[i] * 1) {
                        temp = t.x[i];
                        t.x[i] = t.x[i - 1];
                        t.x[i - 1] = temp;

                        temp = t.y[i];
                        t.y[i] = t.y[i - 1];
                        t.y[i - 1] = temp;
                        sorted = false;
                    }
                }
            }
            return t;
        },

        // creates a trace from a model
        Model(mdl, units = Calculator.Units.Default) {
            let wav = Calculator.Model.GetWavelength(units);
            let wF = Calculator.Model.WallFraction(mdl, units);
            let piSA = Math.PI * Calculator.Model.SphereArea(Calculator.Units.Convert(mdl.sphereDiameter, units.length, Length.CM));
            let ref = mdl.material == Material.Spectraflect ? ReflectanceData.BaSO4 : (mdl.material == Material.Spectralon ? ReflectanceData.PTFE : (mdl.material == Material.Gold ? ReflectanceData.Gold : ReflectanceData.Permaflect));
            return {
                name: mdl.name,
                x: wav,
                y: wav.map((_, i) => {
                    let wcm = (ref[i] * (mdl.lamps.reduce((sum, l, index) => sum += Calculator.Lamp.FluxAtIndex(l, i) * mdl.onQty[index] * mdl.va[index], 0) /* + blackbody flux */)) / (piSA * (1 - ref[i] * wF));
                    return Calculator.Units.Convert(wcm, Radiance.W_CM, units.radiance);
                }),
                units: units,
                color: 'black',
            }
        },

        // creates an empty trace
        Empty() {
            return { name: '', x: [], y: [], units: Calculator.Units.Default, color: 'black' };
        },

        // converts a trace to given units
        Convert(trace, units) {
            return {
                name: 'name' in trace ? trace.name : '',
                x: trace.x.map(x => Calculator.Units.Convert(x, trace.units.wavelength, units.wavelength)),
                y: trace.y.map(y => Calculator.Units.Convert(y, trace.units.radiance, units.radiance)),
                units: units,
                color: 'color' in trace ? trace.color : 'black',
            }
        },

        // copies a trace
        Copy(trace) {
            return {
                x: trace.x.slice(),
                y: trace.y.slice(),
                name: trace.name,
                color: trace.color,
                units: trace.units
            }
        }
    },

    Lamp: {
        // gets flux array of lamp
        Flux(name) {
            if (name in FluxData) return FluxData[name];
            else return Calculator.Lamp.Flux('HIS-010').map(_ => 0);
        },

        // finds the flux between two wavelengths of a given lamp
        FluxBetween(name, wA, wB) {
            let scale = wA >= 250 ? 1 : 1000;
            let shift = wA >= 250 ? 250 : .25;
            if (name in FluxData) return FluxData[name].slice(Math.round((wA - shift) * scale), Math.round((wB - shift) * scale));
            else return Calculator.Lamp.FluxBetween('HIS-010', wA, wB).map(_ => 0);
        },

        // gets the flux of a lamp at a given wavelength
        FluxAtWavelength(name, w) {
            if (name == 'Empty') return 0;
            if (name.substring(0, 11) == 'Custom Lamp') {
                let lmpIndex = name.substring(12, 13);
                return 0;
            }
            return FluxData[name][Math.round((w - (w >= 250 ? 250 : .25)) * (w >= 250 ? 1 : 1000))];
        },

        // gets flux of lamp at given index
        FluxAtIndex(name, i) {
            if (name == 'Empty') return 0;
            if (name.substring(0, 11) == 'Custom Lamp') {
                let lmpIndex = name.substring(12, 13);
                return 0;
            }
            return FluxData[name][i];
        },

        // sums fluxs of lamps
        Sum(lamps) {
            return lamps.reduce((acc, l) => acc.map((a, i) => a + Calculator.Lamp.Flux(l)[i]), Calculator.Lamp.Flux('-'));
        },

        // sums fluxes of lamps between two wavelengths
        SumBetween(lamps, wA, wB) {
            return lamps.reduce((acc, l) => {
                let fB = Calculator.Lamp.FluxBetween(l, wA, wB);
                return acc.map((a, i) => a + fB[i]);
            }, Calculator.Lamp.FluxBetween('-', wA, wB));
        },

        // gets specs of lamp
        Specs(name) {
            if (name in LampData) return LampData[name];
            else return null;
        }
    }
};


/*
 lt = Calculator.Trace.Interpolate(lt);
            ut = Calculator.Trace.Interpolate(ut);
            let model;
            let reset = () => model = {
                name: '',
                lamps: [],
                portDiameter: startModel.portDiameter,
                sphereDiameter: startModel.sphereDiameter,
                material: startModel.material,
                portCount: startModel.portCount,
                qty: [...new Array(startModel.portCount)].map(_ => 1),
                onQty: [...new Array(startModel.portCount)].map(_ => 1),
            };
            reset();

            let iteration = 0;
            let index = 0;
            let avg = Calculator.Trace.Sum(lt, ut);
            avg.y = target.y.map(y => y / 2);
            let target = Calculator.Trace.Copy(avg);

            let constant = Math.PI * Calculator.Model.SphereArea(Calculator.Units.Convert(8, Length.IN, Length.CM));
            let predicate = (i, wF) => ReflectanceData.BaSO4[i] / (constant * (1 - ReflectanceData.BaSO4[i] * wF));
            for (;;) {
                //CHECK FLOW CONDITIONS
                iteration++;
                if (Calculator.Trace.Between(ut, lt, Calculator.Trace.Model(model))) return model;
                if (iteration > 10) {
                    if (target == avg) target = lt;
                    else if (target == lt) target = ut;
                    else if (target == ut) {
                        console.error('Spectral Reverse Failed');
                        return model;
                    }
                    reset();
                    iteration = 0;
                }

                //TARGET FLUX
                let offset = Calculator.Trace.Difference(target, Calculator.Trace.Model(model));
                let PISA = Math.PI * Calculator.Model.SphereArea(Calculator.Units.Convert(model.sphereDiameter, units.length, Length.CM));
                let targetFlux = offset.y.map((r, i) => {
                    let ref = Calculator.Model.Reflectance(offset.x[i], model, units);
                    return r / ref * PISA * (1 - ref * Calculator.Model.WallFraction(model, units));
                });

                //FIND MINIMIZING LAMP
                let bestLamp, minError;
                Object.getOwnPropertyNames(LampData).forEach((name, i) => {
                    let error = Calculator.Trace.Error({ x: target.x, y: targetFlux, units: target.units }, { x: target.x, y: FluxData[name], units: target.units });
                    if (bestLamp !== undefined) {
                        if (error < minError) {
                            minError = error;
                            bestLamp = name;
                        }
                    } else {
                        bestLamp = name;
                        minError = error;
                    }
                });

                model.lamps[index] = bestLamp;
                index = (index + 1) % model.portCount;
            }
*/