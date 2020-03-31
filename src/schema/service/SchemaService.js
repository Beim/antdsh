import appconfig from '../../appconfig';
import {message} from "antd";

const defaultUrlPrefix = appconfig['defaultServer']['host'];
const SchemaService = {};

SchemaService.getSchemaInfo = async (gspaceId) => {
  const response = await fetch(`${defaultUrlPrefix}/schema/info?gid=${gspaceId}`, {
    method: 'GET',
    credentials: 'include',
  });
  return response;
};

SchemaService.confirmMatch = async (sid) => {
  const response = await fetch(`${defaultUrlPrefix}/schema/confirm/match`, {
    method: 'POST',
    credentials: 'include',
    headers: {
      'content-type': 'application/json',
    },
    body: JSON.stringify({
      sid,
    }),
  });
  return response;
};

SchemaService.newSchema = async (gid, owl, owlLang, sname) => {
  const response = await fetch(`${defaultUrlPrefix}/schema/new`, {
    method: 'POST',
    credentials: 'include',
    headers: {
      'content-type': 'application/json',
    },
    body: JSON.stringify({
      gid,
      owl,
      owlLang,
      sname,
    }),
  });
  return response;
};

SchemaService.editSchema = async (gid, owl, owlLang, sname) => {
  const response = await fetch(`${defaultUrlPrefix}/schema/edit`, {
    method: 'POST',
    credentials: 'include',
    headers: {
      'content-type': 'application/json',
    },
    body: JSON.stringify({
      gid,
      owl,
      owlLang,
      sname,
    }),
  });
  return response;
};

SchemaService.getSchemaInOwl = async (sid, gid) => {
  const response = await fetch(`${defaultUrlPrefix}/schema/schemainowl?sid=${sid}&gid=${gid}`, {
    method: 'GET',
    credentials: 'include',
  });
  return response;
};

SchemaService.uploadCsvResource = async (formData, sid, gid) => {
  const response = await fetch(`${defaultUrlPrefix}/resource/csv/new?sid=${sid}&gid=${gid}`, {
    method: 'POST',
    credentials: 'include',
    body: formData
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

export default SchemaService;