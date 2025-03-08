import CryptoJS from "crypto-js";

export const encrypt = ({ payload, signature }) => {
  return CryptoJS.AES.encrypt(payload, signature).toString();
};

export const decrypt = ({ payload, signature }) => {
  return CryptoJS.AES.decrypt(payload, signature).toString(CryptoJS.enc.Utf8);
};
