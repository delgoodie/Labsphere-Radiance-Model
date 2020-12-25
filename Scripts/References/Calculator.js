class Calculator {
    static Units = {
        Default: {
            length: Length.IN,
            wavelength: Length.NM,
            radiance: Radiance.W_CM,
        },
        Convert(val, giv, des) { //Value, given units, desired units --- returns value in desired units
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
    }

    static Model = {
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

        ExternalBlackbodyFlux(i, bbData) {
            return Calculator.Model.Blackbody(i, bbData.blackbody_ON, bbData.designed_EB_Power, bbData.applied_EB_Temp, bbData.designed_EB_Temp) * bbData.blackbodyNumber;
        },

        InternalBlackbodyFlux(i, bbData) {
            return Calculator.Model.Blackbody(i, bbData.blackbody_QTH_ON, bbData.designed_EB_Power, bbData.applied_EB_Temp, bbData.designed_EB_Temp) * InternalBlackbodyData.Emmisivity[i] * InternalBlackbodyData.Transmittance[i] * bbData.blackbody_QTH_Number;
        },

        SphereArea(d) { //diameter
            return 4 * Math.PI * Math.pow(d / 2, 2);
        },

        WallFraction(mdl, units) {
            let exitArea = Math.PI * Math.pow(Calculator.Units.Convert(mdl.portDiameter, units.length, Length.CM) / 2, 2);
            let sArea = Calculator.Model.SphereArea(Calculator.Units.Convert(mdl.sphereDiameter, units.length, Length.CM));
            let inputPortDiameter = Math.sqrt(mdl.lamps.reduce((sum, l, i) => sum += Math.pow(Lamp.getLamp(l).portDiameter * mdl.qty[i], 2), 0));
            let inputPortArea = Math.PI * Math.pow((inputPortDiameter * 2.54) / 2, 2);
            return (sArea - exitArea - inputPortArea) / sArea; //fixed
        },

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

        SpectralRadiance(w, mdl, units) { //inches
            let i = Math.round((w - (units.wavelength == Length.NM ? 250 : .25)) * (units.wavelength == Length.NM ? 1 : 1000));
            let ref = Calculator.Model.Reflectance(w, mdl, units);
            let lampSum = mdl.lamps.reduce((sum, l, index) => sum += Lamp.getLamp(l).flux(i) * mdl.onQty[index], 0);

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

        IntegralRadiance(a, b, mdl, units) {
            if (units.wavelength == Length.NM && (a < 250 || b > 2500) || units.wavelength == Length.UM && (a < .25 || b > 2.5)) return 0;
            let increment = (units.wavelength == Length.NM ? 1 : .001);
            let sum = 0;
            sum += Calculator.Model.SpectralRadiance(a, mdl, units) * .5;
            for (let w = a + increment; w < b - increment; w += increment) sum += Calculator.Model.SpectralRadiance(w, mdl, units);
            sum += Calculator.Model.SpectralRadiance(b, mdl, units) * .5;
            return sum * increment;
        },

        SpectralReverse(pD, sD, mat, lt, ut, units) {
            lt = Calculator.Trace.Interpolate(lt);
            ut = Calculator.Trace.Interpolate(ut);
            let model;
            let reset = () => model = {
                name: '',
                lamps: [],
                portDiameter: pD,
                sphereDiameter: sD,
                material: mat,
                portCount: Calculator.Model.GetNumPorts(sD),
                qty: [...new Array(Calculator.Model.GetNumPorts(sD))].map(_ => 1),
                onQty: [...new Array(Calculator.Model.GetNumPorts(sD))].map(_ => 1),
            };
            reset();

            let iteration = 0;
            let index = 0;
            let target = Calculator.Trace.Sum(lt, ut);
            target.y = target.y.map(y => y / 2);

            let constant = Math.PI * Calculator.Model.SphereArea(Calculator.Units.Convert(8, Length.IN, Length.CM));
            let predicate = (i, wF) => ReflectanceData.BaSO4[i] / (constant * (1 - ReflectanceData.BaSO4[i] * wF));
            while (true) {
                iteration++;
                if (iteration > 5) {
                    if (target != ut && target != lt) target = lt;
                    else if (target == lt) target = ut;
                    else if (target == ut) {
                        console.log('failed');
                        return model;
                    }
                    reset();
                    iteration = 0;
                }
                if (Calculator.Trace.Between(ut, lt, Calculator.Trace.Model(model))) return model;
                else {
                    let bestLamp, minError;
                    let offset = Calculator.Trace.Difference(target, Calculator.Trace.Model(model));
                    let targetFlux = offset.y.map((r, i) => r / Calculator.Model.Reflectance(offset.x[i], model, units) * (Math.PI * Calculator.Model.SphereArea(Calculator.Units.Convert(model.sphereDiameter, units.length, Length.CM)) * (1 - Calculator.Model.Reflectance(offset.x[i], model, units) * Calculator.Model.WallFraction(model, units))));

                    Object.getOwnPropertyNames(LampData).forEach((name, i) => {
                        let error = Calculator.Trace.Error(target, { x: target.x, y: FluxData[name], units: target.units });
                        if (i != 0) {
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

            }
        },

        InbandReverse() {},

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

        GetWavelength(units) {
            return [...new Array(2250)].map((_, i) => 250 + i).map(w => Calculator.Units.Convert(w, Length.NM, units.wavelength));
        },
    }

    static Math = {
        Round(val, figs) {
            return Math.round(val * Math.pow(10, figs)) / Math.pow(10, figs);
        },

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

        Candelas(mdl, units) {
            return VLambdaData.reduce((sum, vlambda, i) => sum += Calculator.Units.Convert(Calculator.Model.SpectralRadiance(i * (units.wavelength == Length.NM ? 1 : .001) + (units.wavelength == Length.NM ? 250 : .25), mdl, units), units.radiance, Radiance.W_CM) * vlambda * 6830, 0);
        },

        Lumens(mdl, units) {
            return VLambdaData.reduce((sum, vlambda, i) => sum += mdl.lamps.reduce((lsum, l, j) => lsum += Lamp.getLamp(l).flux(i) * mdl.onQty[j], 0) * Calculator.Math.CBFilter(i) * vlambda, 0) * .683;
        },

        FootLamberts(mdl, units) {
            return Calculator.Math.Candelas(mdl, units) / 3.426;
        },

        Lux(mdl, units) {
            return Calculator.Math.Candelas(mdl, units) * Math.PI;
        },

        CBFilter(w) {
            return 1;
        },

        Irradiance(wA, wB, d, mdl, units) {
            return Calculator.Model.IntegralRadiance(wA, wB, mdl, units) * Math.PI * (d == 0 ? 1 : Math.pow(Math.sin(Math.atan(Calculator.Units.Convert(mdl.portDiameter, units.length, Length.M) / (2 * d))), 2));
        },
    }

    static Trace = {
        Compare(t1, t2, tF = (y1, y2) => y1 == y2, every = true) {
            let passed = every;
            for (let i = 0; i < t1.x.length; i++)
                if (t2.x.indexOf(t1.x[i]) != -1)
                    if (tF(t2.y[t2.x.indexOf(t1.x[i])], Calculator.Units.Convert(t1.y[i], t1.units.radiance, t2.units.radiance))) passed = every ? false : passed;
                    else passed = every ? passed : true;
            return passed;
        },

        Test(t, tF, every = true) {
            return t.y.reduce((passed, y) => every ? (!passed ? false : tF(y)) : (passed ? true : tF(y)), every);
        },

        Between(ut, lt, trace) {
            // let passed = true;
            // for (let i = 0; i < lt.x.length; i++)
            //     if (trace.x.indexOf(lt.x[i]) != -1 && trace.y[trace.x.indexOf(lt.x[i])] < Calculator.Units.Convert(lt.y[i], lt.units.radiance, trace.units.radiance)) passed = false;
            // for (let i = 0; i < ut.x.length; i++)
            //     if (trace.x.indexOf(ut.x[i]) != -1 && trace.y[trace.x.indexOf(ut.x[i])] > Calculator.Units.Convert(ut.y[i], ut.units.radiance, trace.units.radiance)) passed = false;
            // return passed;
            return Calculator.Trace.Compare(lt, trace, (y1, y2) => y1 < y2, true) && Calculator.Trace.Compare(ut, trace, (y1, y2) => y1 > y2, true);
        },

        Sum(t1, t2) {
            return { x: t1.x.filter(w => t2.x.includes(w)), y: t1.x.filter(w => t2.x.includes(w)).map(w => t1.y[t1.x.indexOf(w)] + t2.y[t2.x.indexOf(w)]) };
        },

        Difference(t1, t2) {
            return { x: t1.x.filter(w => t2.x.includes(w)), y: t1.x.filter(w => t2.x.includes(w)).map(w => t1.y[t1.x.indexOf(w)] - t2.y[t2.x.indexOf(w)]) };
        },

        Error(t1, t2) {
            return Math.sqrt(Calculator.Trace.Difference(t1, t2).y.map(y => y * y).reduce((sum, y) => sum + y, 0));
        },

        Interpolate(t) { //DOESNT WORK FOR µm
            t.x = t.x.map(x => Math.round(x));
            let temp = { x: [], y: [] };
            t.x.forEach((_, i) => {
                if (i != t.x.length - 1) {
                    let y = x => (t.y[i + 1] - t.y[i]) / (t.x[i + 1] - t.x[i]) * (x - t.x[i]) + t.y[i];
                    for (let j = t.x[i]; j < t.x[i + 1]; j++) {
                        temp.x.push(j);
                        temp.y.push(y(j));
                    }
                }
            });
            t.x = t.x.concat(temp.x);
            t.y = t.y.concat(temp.y);
            return Calculator.Trace.Sort(t);
        },

        Sort(t) {
            let sorted = false;
            while (!sorted) {
                sorted = true;
                for (let i = 1; i < t.x.length; i++) {
                    if (t.x[i - 1] * 1 > t.x[i] * 1) {
                        let tempX = t.x[i];
                        t.x[i] = t.x[i - 1];
                        t.x[i - 1] = tempX;

                        let tempY = t.y[i];
                        t.y[i] = t.y[i - 1];
                        t.y[i - 1] = tempY;
                        sorted = false;
                    }
                }
            }
            return t;
        },

        Model(mdl, units = Calculator.Units.Default) {
            return {
                name: mdl.name,
                x: Calculator.Model.GetWavelength(units),
                y: Calculator.Model.GetWavelength(units).map((_, i) => {
                    let ref = mdl.material == Material.Spectraflect ? ReflectanceData.BaSO4[i] : (mdl.material == Material.Spectralon ? ReflectanceData.PTFE[i] : (mdl.material == Material.Gold ? ReflectanceData.Gold[i] : ReflectanceData.Permaflect[i]));

                    let wcm = (ref * (mdl.lamps.reduce((sum, l, index) => sum += Lamp.getLamp(l).flux(i) * mdl.onQty[index], 0) /* + blackbody flux */ )) / (Math.PI * Calculator.Model.SphereArea(Calculator.Units.Convert(mdl.sphereDiameter, units.length, Length.CM)) * (1 - ref * Calculator.Model.WallFraction(mdl, units)));
                    return Calculator.Units.Convert(wcm, Radiance.W_CM, units.radiance);
                }),
                units: units,
                color: 'black',
            }
        },

        Empty() {
            return { name: '', x: [], y: [], units: Calculator.Units.Default, color: 'black' };
        },

        Convert(trace, units) {
            return {
                name: 'name' in trace ? trace.name : '',
                x: trace.x.map(x => Calculator.Units.Convert(x, trace.units.wavelength, units.wavelength)),
                y: trace.y.map(y => Calculator.Units.Convert(y, trace.units.radiance, units.radiance)),
                units: units,
                color: 'color' in trace ? trace.color : 'black',
            }
        },
    }
}