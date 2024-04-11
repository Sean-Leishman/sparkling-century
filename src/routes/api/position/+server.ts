import * as api from '$lib/server/api'
import { RequestHandler } from '@sveltejs/kit';

let data = {};

const fetchData = async (satellite: number) => {
    try {
        const satellites = await api.getFuturePositions(satellite);
        data = satellites;
    } catch (error) {
        console.error("Failed to get satellite data: ", error);
    }
}

export async function POST({ request }: RequestHandler) {
    const satellites = await request.json();

    if (satellites.length == 0) {
        return Response.json(
            {
                'body': {}
            }
        );
    }

    console.log(satellites.length)
    for (const satellite of satellites) {
        const id = satellite;
        data[id] = fetchData(satellite)
    }

    return Response.json(
        {
            'body': data
        }
    );
}
