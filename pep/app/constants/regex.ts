export const HTML_BODY_REGEX = /^.*?<body[^>]*>(.*?)<\/body>.*?$/i;
export const INVALID_ABSTRACT_TAGS = /(<\!DOCTYPE html>|<\/?html>|<\/?body>|<head>.*<\/head>)/gim;
export const INVALID_ABSTRACT_PREVIEW_TAGS = /(<\!DOCTYPE html>|<\/?html>|<\/?body>|<head>.*<\/head>|<img[^>]*>|<arttitle>.*<\/arttitle>)/gim;
