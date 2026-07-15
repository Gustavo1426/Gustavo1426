import { normalizeMuscleName, getSynergyKey } from "@/src/shared/modules/training/engines/synergyEngine";

const indirectMultiplier = {
    Biceps: 0.7,
    Triceps: 0.7,
    Ombros: 0.7,
    Gluteos: 0.8,
    Posteriores: 0.8,
    Adutores: 0.5,
    Core: 0.4,
    Panturrilhas: 0
};

class DirectVolumeNeededEngine {

    calculate(
        targetVolume,
        indirectVolume,
        techniqueEquivalent={}
    ){

        let result={};

        for(const rawMuscle in targetVolume){

            const target=
            targetVolume[rawMuscle];

            const normMuscle = normalizeMuscleName(rawMuscle);
            const key = getSynergyKey(normMuscle);

            const multiplier = indirectMultiplier[key] !== undefined ? indirectMultiplier[key] : 1;

            const indirect=
            indirectVolume[rawMuscle] || indirectVolume[normMuscle] || 0;

            const technique=
            techniqueEquivalent[rawMuscle] || techniqueEquivalent[normMuscle] || 0;

            const effectiveIndirect = indirect * multiplier;

            // quanto ainda falta

            let remaining = target - effectiveIndirect - technique;

            // nunca negativo

            remaining = Math.max(
                0,
                remaining
            );

            result[rawMuscle]=
            Number(
                remaining.toFixed(1)
            );

        }

        return result;

    }

}

if (typeof module !== 'undefined' && module.exports) {
    module.exports = DirectVolumeNeededEngine;
}
export default DirectVolumeNeededEngine;
export { DirectVolumeNeededEngine };
