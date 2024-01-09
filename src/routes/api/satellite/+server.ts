import * as api from '$lib/server/api' 

let data = {};

const fetchData = async () => {
    try {
        const satellites = await api.getSatellites();
        data = satellites;
    } catch (error) {
        console.error("Failed to get satellite data: ", error); 
    }
}

setInterval(fetchData, 10000);

export async function GET(request) {
    console.log("GET", data);
    return Response.json(
        {
            'body': data
        }
    );
}
