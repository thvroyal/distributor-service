const axios = require('axios');

async function pandoReq(id) {
  try {
    const postData = {
      projectID: id,
    };

    const res = await axios.post('http://localhost:5500/api/createProject', postData);
    return res.data;
  } catch (error) {
    throw new Error();
  }
}

module.exports = { pandoReq };
