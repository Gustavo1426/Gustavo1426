class RemainingVolumeEngine{

calculate(
targetVolume,
indirectVolume
){

const remaining={};

for(
const muscle in targetVolume
){

const target=
targetVolume[muscle];

const indirect=
indirectVolume[muscle]||0;

remaining[muscle]=
Math.max(
0,
target-indirect
);

}

return remaining;

}

}

if (typeof module !== 'undefined' && module.exports) {
    module.exports = RemainingVolumeEngine;
}
export default RemainingVolumeEngine;
export { RemainingVolumeEngine };
