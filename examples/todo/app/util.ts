export const css = (style: { [key: string]: string }): string => {
  const serializePropertyValue = ([prop, value]: [string, string]) =>
    `${prop}: ${value}`;
  const concatWithSemiColon = (a: string, b: string) => `${a}; ${b}`;

  return Object.entries(style)
    .map(serializePropertyValue)
    .reduce(concatWithSemiColon, "");
};
