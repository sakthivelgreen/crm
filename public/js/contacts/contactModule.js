export const deleteID = (obj) => {
    let res = {};
    res = Object.assign(res, obj);
    delete res._id;
    return res;
}