import REST from '../rest.js';

// Endpoint -> MongoDB
export const API_Endpoint = new REST('/mongodb/deals');
export const Pipeline_Endpoint = new REST('/mongodb/pipelines')

// Get Deal Obj Using ID
export async function getDeal(objID) {
    return await API_Endpoint.getByID(objID);
}

export async function getPipeline(pipeline) {
    const Pipelines = await Pipeline_Endpoint.get();
    for (const item of Pipelines) {
        for (const key in item) {
            if (key === pipeline) {
                return item[key];
            }
        }
    }
}

export async function updateStage(obj, stage) {
    let id = obj._id;
    delete obj._id;
    obj.dealstage = stage;
    return await API_Endpoint.put(id, obj);
}