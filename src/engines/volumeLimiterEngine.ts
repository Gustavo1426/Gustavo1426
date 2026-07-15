import { mapNameToMuscleGroup } from "./exerciseEngine";

class VolumeLimiterEngine {

    enforce(workout,targetVolume){

        let accumulated={};

        let filteredExercises=[];

        workout.exercises.forEach(ex=>{

            const muscle = ex.primaryMuscle || ex.muscleGroup || mapNameToMuscleGroup(ex.name) || "Outros";

            accumulated[muscle] ??= 0;

            const current=
            accumulated[muscle];

            let limitVal = targetVolume ? targetVolume[muscle] : 999;
            if (limitVal && typeof limitVal === 'object') {
                limitVal = limitVal.total;
            }
            const limit = (limitVal !== undefined) ? limitVal : 999;

            // espaço restante

            const remaining=
            limit-current;

            if(remaining<=0){

                return;

            }

            // ajusta séries se passar do teto
            const sets = ex.series !== undefined ? ex.series : (ex.sets !== undefined ? ex.sets : 0);

            let chosenSets = sets;
            if(chosenSets>remaining){

                chosenSets=remaining;
                if (ex.series !== undefined) ex.series = chosenSets;
                if (ex.sets !== undefined) ex.sets = chosenSets;

            }

            accumulated[muscle]+=chosenSets;

            filteredExercises.push(ex);

        });

        return{

            exercises:filteredExercises,
            accumulated

        };

    }

}

if (typeof module !== 'undefined' && module.exports) {
    module.exports = VolumeLimiterEngine;
}
export default VolumeLimiterEngine;
export { VolumeLimiterEngine };
