const EARTH_RADIUS = 1000000;

const llarToWorld = (lat: number, lng: number, alt: number, rad: number) => {
    const f = 0
    const ls = Math.atan((1 - f) ** 2 * Math.tan(lat));

    let x = rad * Math.cos(ls) * Math.cos(lng) + alt * Math.cos(lat) * Math.cos(lng);
    let y = rad * Math.cos(ls) * Math.sin(lng) + alt * Math.cos(lat) * Math.sin(lng);
    let z = rad * Math.sin(ls) + alt * Math.sin(lat);

    x /= EARTH_RADIUS;
    y /= EARTH_RADIUS;
    z /= EARTH_RADIUS;

    return { x, y, z };
}

export class SatelliteState {
    public x: number;
    public y: number;
    public z: number;

    public x2: number;
    public y2: number;
    public z2: number;

    public id: number;
    public name: string;

    public timestamp: number;
    public updated: boolean;

    public constructor(x: number, y: number, z: number, id: number, name: string, time: number) {
        this.x = x;
        this.y = y;
        this.z = z;

        this.id = id;
        this.name = name;

        this.x2 = 0;
        this.y2 = 0;
        this.z2 = 0;

        this.timestamp = time;
        this.updated = false;
    }

    public updateVelocity(new_x: number, new_y: number, new_z: number, new_timestamp: number) {
        const delta_t = (new_timestamp - this.timestamp) / 100;

        this.x2 = (new_x - this.x) / delta_t;
        this.y2 = (new_y - this.y) / delta_t;
        this.z2 = (new_z - this.z) / delta_t;
        this.timestamp = new_timestamp;

        this.updated = true;
    }
}

export class State {
    public satelliteStates: { [key: number]: SatelliteState };

    public constructor(satellites: any) {
        const st = satellites.above;
        this.satelliteStates = {};

        const timestamp = Date.now();
        st.forEach(satellite => {
            const coord = llarToWorld(satellite.satlat, satellite.satlng, satellite.satalt, EARTH_RADIUS);
            const satelliteState = new SatelliteState(coord.x, coord.y, coord.z, satellite.satid, satellite.satname, timestamp);

            this.satelliteStates[satellite.satid] = satelliteState;
        })
    }

    public updateState(satellites: Object) {
        console.log("Update");

        const timestamp = Date.now();

        satellites.above.forEach(satellite => {
            const coord = llarToWorld(satellite.satlat, satellite.satlng, satellite.satalt, EARTH_RADIUS);

            if (Object.hasOwn(this.satelliteStates, satellite.satid)) {
                this.satelliteStates[satellite.satid].updateVelocity(coord.x, coord.y, coord.z, timestamp);
            }
            else {
                // console.log("Satellite ", satellite.satid, " does not exist");
            }
        });
    }

    *[Symbol.iterator]() {
        for (const [key, value] of Object.entries(this.satelliteStates)) {
            yield value;
        }
    }

}
