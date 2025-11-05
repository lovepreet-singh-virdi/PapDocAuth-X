import Tesseract from "tesseract.js";

export const extractText = async (filePath) => {
  const { data: { text } } = await Tesseract.recognize(filePath, "eng");
  return text.replace(/\s+/g, " ").trim();
};
