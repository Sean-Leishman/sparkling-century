const EARTH_RADIUS = 6378137;

const llarToWorld = (lat, lng, alt, rad) => {
    let f = 0 
    let ls = Math.atan((1-f)**2 * Math.tan(lat));

    let x = rad * Math.cos(ls) * Math.cos(lng) + alt * Math.cos(lat) * Math.cos(lng);
    let y = rad * Math.cos(ls) * Math.sin(lng) + alt * Math.cos(lat) * Math.sin(lng);
    let z = rad * Math.sin(ls) + alt * Math.sin(lat);

    x /= EARTH_RADIUS;
    y /= EARTH_RADIUS;
    z /= EARTH_RADIUS;
 
    return {x, y, z};
}

export class SatelliteState {
    public x: float;
    public y: float;
    public z: float;

    public x2: float;
    public y2: float;
    public z2: float; 

    public id: int;
    public name: string;

    public timestamp: int;

    public constructor(x: float, y: float, z:float, id:int, name:string, time: int){
        this.x = x;
        this.y = y;
        this.z = z;

        this.id = id;
        this.name = name;

        this.x2 = 0;
        this.y2 = 0;
        this.z2 = 0;

        this.timestamp = time
    }

    public updateVelocity(new_x: float, new_y: float, new_z: float, new_timestamp: int) {
        let delta_t = (new_timestamp - this.timestamp) / 1000;

        this.x2 = (new_x - this.x) / delta_t;
        this.y2 = (new_y - this.y) / delta_t;
        this.z2 = (new_z - this.z) / delta_t;
    }
}

export class State {
   public satelliteStates: { [key: int]: SatelliteState};

   public constructor(satellites: Object){
       let st = satellites.above; 
       this.satelliteStates = {};

       let timestamp = Date.now();
       st.forEach(satellite => {
            let coord = llarToWorld(satellite.satlat, satellite.satlng, satellite.satalt, EARTH_RADIUS);
            let satelliteState = new SatelliteState(coord.x, coord.y, coord.z, satellite.satid, satellite.satname, timestamp);

            this.satelliteStates[satellite.satid] = satelliteState;
       })
   }

   public updateState(satellites: Object) {
       let timestamp = Date.now();

        satellites.above.forEach(satellite => {
            let coord = llarToWorld(satellite.satlat, satellite.satlng, satellite.satalt, EARTH_RADIUS);

            if (Object.hasOwn(this.satelliteStates, satellite.satid)) {
                this.satelliteStates[satellite.satid].updateVelocity(coord.x, coord.y, coord.z, timestamp);
            }
            else {
                console.log("Satellite ", satellite.satid, " does not exist");
            }
        });
   }

   *[Symbol.iterator]() {
        for (const [key, value] of Object.entries(this.satelliteStates)) {
            yield value;
        }
   }

}
