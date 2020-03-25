import appconfig from '../../appconfig';
import {message} from "antd";

const defaultUrlPrefix = appconfig['defaultServer']['host'];
const embeddingService = {};

embeddingService.getAvailabelMethods = async () => {
  const response = await fetch(`${defaultUrlPrefix}/embed/availableMethods`, {
    method: 'GET',
    credentials: 'include',
  });
  if (!response.ok) {
    message.error(JSON.stringify({
      url: response.url,
      status: response.status,
    }));
    return null;
  }
  return await response.json();
};

embeddingService.getAvailableModelsByGid = async (gspaceId) => {
  const response = await fetch(`${defaultUrlPrefix}/embed/models/info?gid=${gspaceId}`, {
    method: 'GET',
    credentials: 'include',
  });
  if (!response.ok) {
    message.error(JSON.stringify({
      url: response.url,
      status: response.status,
    }));
    return null;
  }
  return await response.json();
};

embeddingService.getAvailableModelsParamByGid = async (gspaceId, modelname) => {
  const response = await fetch(`${defaultUrlPrefix}/embed/models/param?gid=${gspaceId}&modelname=${modelname}`, {
    method: 'GET',
    credentials: 'include',
  });
  if (!response.ok) {
    message.error(JSON.stringify({
      url: response.url,
      status: response.status,
    }));
    return null;
  }
  return await response.json();
};

embeddingService.postTrain = async (gid, modelname, serviceId) => {
  const response = await fetch(`${defaultUrlPrefix}/embed/train?gid=${gid}&modelName=${modelname}&serviceId=${serviceId}`, {
    method: 'POST',
    credentials: 'include',
    headers: {
      'content-type': 'application/json',
    },
    body: JSON.stringify({
      gid,
      modelname,
    }),
  });
  if (!response.ok) {
    message.error(JSON.stringify({
      url: response.url,
      status: response.status,
    }));
    return null;
  }
  return await response.json();
};

embeddingService.getTrainServiceInfo = async () => {
  const response = await fetch(`${defaultUrlPrefix}/embed/train/serviceinfo`, {
    method: 'GET',
    credentials: 'include',
  });
  if (!response.ok) {
    message.error(JSON.stringify({
      url: response.url,
      status: response.status,
    }));
    return null;
  }
  return await response.json();
};

export default embeddingService;