let adminFirebase = require("firebase-admin");

const logoForSetting = async () => {
  templateConnectionName = "theme";
  let index = adminFirebase.apps.findIndex(
    (e) => e.name === global.connectionName
  );
  const config = adminFirebase.apps[index].remoteConfig();
  const template = await config.getTemplate();
  const dataValue = JSON.parse(
    template.parameters[`${templateConnectionName}`].defaultValue.value
  );
  if (dataValue?.images?.logo) return dataValue.images.logo;
  else return false;
};
module.exports = logoForSetting;
