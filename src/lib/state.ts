import {
	twoline2satrec,
	propagate,
	gstime,
	eciToGeodetic,
	SatRecError,
	type SatRec,
	type EciVec3
} from 'satellite.js';

export const EARTH_RADIUS_KM = 6378.137;
export const EARTH_RADIUS_M = EARTH_RADIUS_KM * 1000;

export interface TLE {
	name: string;
	line1: string;
	line2: string;
}

export class SatelliteState {
	public x = 0;
	public y = 0;
	public z = 0;

	public x2 = 0;
	public y2 = 0;
	public z2 = 0;

	public id: number;
	public name: string;

	public lat = 0;
	public lng = 0;
	public altKm = 0;

	public timestamp = 0;

	private satrec: SatRec;

	public constructor(tle: TLE) {
		this.satrec = twoline2satrec(tle.line1, tle.line2);
		this.id = Number(this.satrec.satnum) || 0;
		this.name = tle.name.trim();
	}

	public propagate(now: Date): boolean {
		const result = propagate(this.satrec, now);

		if (this.satrec.error !== SatRecError.None) {
			return false;
		}

		const gmst = gstime(now);

		const px = result.position.x / EARTH_RADIUS_KM;
		const py = result.position.y / EARTH_RADIUS_KM;
		const pz = result.position.z / EARTH_RADIUS_KM;

		// velocity: km/s → normalized units/s
		const vx = result.velocity.x / EARTH_RADIUS_KM;
		const vy = result.velocity.y / EARTH_RADIUS_KM;
		const vz = result.velocity.z / EARTH_RADIUS_KM;

		const geo = eciToGeodetic(result.position, gmst);
		this.lat = (geo.latitude * 180) / Math.PI;
		this.lng = (geo.longitude * 180) / Math.PI;
		this.altKm = geo.height;

		this.x = px;
		this.y = py;
		this.z = pz;
		this.x2 = vx;
		this.y2 = vy;
		this.z2 = vz;
		this.timestamp = now.getTime();

		return true;
	}

	public speedKmS(): number {
		return Math.hypot(this.x2, this.y2, this.z2) * EARTH_RADIUS_KM;
	}

	public computeOrbitPoints(
		durationMinutes = 90,
		steps = 180
	): Array<{ x: number; y: number; z: number }> {
		const stepMs = (durationMinutes * 60 * 1000) / steps;
		const origin = Date.now();
		const pts: Array<{ x: number; y: number; z: number }> = [];

		for (let i = 0; i < steps; i++) {
			const result = propagate(this.satrec, new Date(origin + i * stepMs));
			const pos = result.position as EciVec3<number> | false;
			if (!pos) continue;
			pts.push({
				x: pos.x / EARTH_RADIUS_KM,
				y: pos.y / EARTH_RADIUS_KM,
				z: pos.z / EARTH_RADIUS_KM
			});
		}
		return pts;
	}
}

export class State {
	public satelliteStates: SatelliteState[] = [];

	public constructor(tles: TLE[]) {
		for (const tle of tles) {
			try {
				const sat = new SatelliteState(tle);
				this.satelliteStates.push(sat);
			} catch {
				// skip TLEs that fail to parse
			}
		}
		this.propagate(new Date());
	}

	public propagate(now: Date) {
		for (const sat of this.satelliteStates) {
			sat.propagate(now);
		}
	}

	*[Symbol.iterator]() {
		for (const sat of this.satelliteStates) {
			// skip sats that never successfully propagated
			if (sat.timestamp !== 0) yield sat;
		}
	}
}
