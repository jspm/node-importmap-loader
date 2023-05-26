import { getVersion, getLastPart } from "./utils";

/**
 * getPackageNameVersionFromUrl
 * @description a convenience function to get the package name and version from a url
 * @param {string} url
 * @param {boolean} debug
 * @returns {string}
 */
export const getPackageNameVersionFromUrl = (url: string, debug = false) => {
  let urlParts, urlPartsCount, name = '', version = '';
  try {
    urlParts = url.split('@');
    urlPartsCount = urlParts.length;
    if (urlPartsCount === 3) {
      name = `@${urlParts[1]}`;
      version = getVersion(urlParts, 2);
    } else {
      name = getLastPart(getLastPart(urlParts[0], '/'), ':');
      version = getVersion(urlParts, 1);
    }
    return `${name}@${version}`;
  } catch (err) {
    if (debug) console.error(`getPackageNameVersionFromUrl: Failed in getting the package name and version from a url ${err}`);
    return '';
  }
};
