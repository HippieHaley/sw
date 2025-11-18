import CryptoJS from 'crypto-js';

const ENCRYPTION_KEY = process.env.ENCRYPTION_KEY || 'default-key-change-in-production';

export const encrypt = (data: string): string => {
  return CryptoJS.AES.encrypt(data, ENCRYPTION_KEY).toString();
};

export const decrypt = (encryptedData: string): string => {
  const bytes = CryptoJS.AES.decrypt(encryptedData, ENCRYPTION_KEY);
  return bytes.toString(CryptoJS.enc.Utf8);
};

export const encryptObject = (obj: any): string => {
  return encrypt(JSON.stringify(obj));
};

export const decryptObject = (encryptedData: string): any => {
  const decrypted = decrypt(encryptedData);
  return JSON.parse(decrypted);
};
