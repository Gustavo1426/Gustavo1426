import { normalizeMuscleName } from "./synergyEngine";

class PriorityAdjustmentEngine {

    calculate(volumeData, priorities){
        let adjusted = { ...volumeData };
        
        // Normalize priorities keys for robust comparison
        const getPriorityLevel = (muscle) => {
            const norm = normalizeMuscleName(muscle);
            for (const key in priorities) {
                if (normalizeMuscleName(key) === norm) {
                    return priorities[key];
                }
            }
            return "normal";
        };

        const totalOriginalVolume = Object.values(volumeData).reduce((sum: number, v: any) => sum + v, 0) as number;
        if (totalOriginalVolume === 0) return adjusted;

        // Group muscles
        const highPriority = [];
        const mediumPriority = [];
        const normalMuscles = [];
        const lowPriority = [];

        for (const muscle in volumeData) {
            const level = getPriorityLevel(muscle);
            if (level === "alta") {
                highPriority.push(muscle);
            } else if (level === "media") {
                mediumPriority.push(muscle);
            } else if (level === "baixa") {
                lowPriority.push(muscle);
            } else {
                normalMuscles.push(muscle);
            }
        }

        // If no high or medium priority, return copy
        if (highPriority.length === 0 && mediumPriority.length === 0) {
            return adjusted;
        }

        // Define target gains
        let totalGainNeeded = 0;
        const gains = {};
        highPriority.forEach(m => {
            gains[m] = 3; // "Movimentação máxima: 3 séries"
            totalGainNeeded += 3;
        });
        mediumPriority.forEach(m => {
            gains[m] = 1.5;
            totalGainNeeded += 1.5;
        });

        // We can only deduct from non-priority muscles (normal or low).
        // Let's gather non-priority muscles and see how much they can contribute.
        const reducibleMuscles = [];
        normalMuscles.forEach(m => {
            reducibleMuscles.push({ name: m, weight: 1.0 }); // normal weight
        });
        lowPriority.forEach(m => {
            reducibleMuscles.push({ name: m, weight: 1.5 }); // low priority can be reduced more
        });

        if (reducibleMuscles.length === 0) {
            return adjusted; // nothing to reduce
        }

        // Let's find out the total pool of reducible volume.
        let totalReduciblePool = 0;
        reducibleMuscles.forEach(item => {
            const currentVol = volumeData[item.name] || 0;
            // Can reduce up to 3 series, without going below 0
            const maxReduce = Math.min(3, currentVol);
            item.maxReduce = maxReduce;
            totalReduciblePool += maxReduce;
        });

        // Scale gains if we don't have enough reducible volume
        let actualTotalToShift = Math.min(totalGainNeeded, totalReduciblePool);
        if (actualTotalToShift === 0) {
            return adjusted;
        }

        // Distribute the reduction among reducible muscles
        let remainingToDeduct = actualTotalToShift;
        const deductions = {};
        reducibleMuscles.forEach(item => {
            deductions[item.name] = 0;
        });

        const totalWeight = reducibleMuscles.reduce((sum, item) => sum + item.weight * item.maxReduce, 0);
        if (totalWeight > 0) {
            reducibleMuscles.forEach(item => {
                const share = (item.weight * item.maxReduce / totalWeight) * actualTotalToShift;
                const actualDeduct = Math.min(item.maxReduce, share);
                deductions[item.name] = actualDeduct;
                remainingToDeduct -= actualDeduct;
            });
        }

        // Clean up any remaining minor difference
        if (Math.abs(remainingToDeduct) > 0.01) {
            for (const item of reducibleMuscles) {
                const diff = remainingToDeduct;
                const potentialDeduct = deductions[item.name] + diff;
                if (potentialDeduct >= 0 && potentialDeduct <= item.maxReduce) {
                    deductions[item.name] = potentialDeduct;
                    remainingToDeduct = 0;
                    break;
                }
            }
        }

        // Distribute gains to high and medium priority muscles
        let remainingToGain = actualTotalToShift;
        const actualGains = {};
        const totalGainShares = totalGainNeeded;
        for (const m in gains) {
            const share = (gains[m] / totalGainShares) * actualTotalToShift;
            actualGains[m] = share;
            remainingToGain -= share;
        }

        if (Math.abs(remainingToGain) > 0.01) {
            for (const m in gains) {
                const diff = remainingToGain;
                actualGains[m] += diff;
                remainingToGain = 0;
                break;
            }
        }

        // Apply gains and deductions
        for (const m in actualGains) {
            adjusted[m] = (volumeData[m] || 0) + actualGains[m];
        }
        for (const m in deductions) {
            adjusted[m] = Math.max(0, (volumeData[m] || 0) - deductions[m]);
        }

        // Round values to 1 decimal place and make sure total sum matches perfectly!
        let currentSum = 0;
        const keys = Object.keys(adjusted);
        keys.forEach(k => {
            adjusted[k] = Math.round(adjusted[k] * 10) / 10;
            currentSum += adjusted[k];
        });

        const diff = totalOriginalVolume - currentSum;
        if (Math.abs(diff) > 0.01 && keys.length > 0) {
            const targetKey = highPriority[0] || keys[0];
            adjusted[targetKey] = parseFloat((adjusted[targetKey] + diff).toFixed(1));
        }

        // Ensure 1 decimal place parsing
        for (const m in adjusted) {
            adjusted[m] = parseFloat(adjusted[m].toFixed(1));
        }

        return adjusted;
    }

}

if (typeof module !== 'undefined' && module.exports) {
    module.exports = PriorityAdjustmentEngine;
}
export default PriorityAdjustmentEngine;
export { PriorityAdjustmentEngine };
