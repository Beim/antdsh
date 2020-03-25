import appconfig from '../../appconfig'
import {message} from "antd";

const defaultUrlPrefix = appconfig['defaultServer']['host'];

const consolePageService = {};

consolePageService.getServiceMonitorLogs = async () => {
  const response = await fetch(`${defaultUrlPrefix}/embed/service/monitorlogs`, {
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

consolePageService.getNodeCount = async (gid) => {
  const response = await fetch(`${defaultUrlPrefix}/gspace/nodecount?gspaceid=${gid}`, {
    method: 'GET',
    credentials: 'include',
  });
  if (!response.ok) {
    // message.error(JSON.stringify({
    //   url: response.url,
    //   status: response.status,
    // }));
    return null;
  }
  return await response.json();
};

export default consolePageService;