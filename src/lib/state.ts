const EARTH_RADIUS = 6000; // 63710;

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

const scaleToWorld = (x: number, y: number, z: number) => {
    return { x: x / EARTH_RADIUS, y: y / EARTH_RADIUS, z: z / EARTH_RADIUS };
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

    public stateIndex: number = 0;
    public futureStates: { x: number, y: number, z: number, time: number }[] = [];

    public constructor(x: number, y: number, z: number, id: number, name: string, time: number, futureStates: any) {
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

        this.futureStates = futureStates;
    }

    public updatePosition(new_x: number, new_y: number, new_z: number, time: number) {
        this.x = new_x;
        this.y = new_y;
        this.z = new_z;
        this.timestamp = time;

        this.updated = true;
    }

    public updateVelocity(new_x: number, new_y: number, new_z: number, new_timestamp: number) {
        const delta_t = (new_timestamp - this.timestamp);

        this.x2 = (new_x - this.x) / delta_t;
        this.y2 = (new_y - this.y) / delta_t;
        this.z2 = (new_z - this.z) / delta_t;
        this.timestamp = new_timestamp;

        this.updated = true;
    }

    public updateState(time: number) {
        if (this.stateIndex >= this.futureStates.length) {
            return;
        }

        const stateIndex = this.stateIndex;
        while (time >= this.futureStates[this.stateIndex].time) this.stateIndex++;

        if (this.stateIndex === stateIndex) {
            return;
        }

        console.log("UPDATE");

        const futureState = this.futureStates[this.stateIndex];
        const futureCoord = scaleToWorld(futureState.x, futureState.y, futureState.z);
        this.updatePosition(futureCoord.x, futureCoord.y, futureCoord.z, futureState.time);
    }
}

export class State {
    public satelliteStates: { [key: number]: SatelliteState };

    public constructor(satellites: any) {
        // Satellites has key: satelliteId, value: satelliteData 
        this.satelliteStates = {};

        const timestamp = Date.now();
        Object.entries(satellites).forEach(([key, value]) => {
            const coords = value[0];
            const scaled_coords = scaleToWorld(coords.x, coords.y, coords.z);
            const satelliteState = new SatelliteState(scaled_coords.x, scaled_coords.y, scaled_coords.z, coords.satid, coords.satelliteName, timestamp, value);

            this.satelliteStates[key] = satelliteState;
        })
    }

    public updateState() {
        const timestamp = Date.now();

        Object.entries(this.satelliteStates).forEach(([key, value]) => {
            value.updateState(timestamp);
        });
    }

    *[Symbol.iterator]() {
        for (const [key, value] of Object.entries(this.satelliteStates)) {
            yield value;
        }
    }

}
