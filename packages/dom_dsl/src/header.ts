export type HeaderContent = Text;

interface HeaderBuilder {
    (content: HeaderContent): HTMLHeadingElement;
}

const buildHeaderDslHelper = (headerNumber: string): HeaderBuilder => {
    return (content: HeaderContent): HTMLHeadingElement => {
        const element: HTMLHeadingElement = document.createElement(`h${headerNumber}`) as HTMLHeadingElement;

        element.appendChild(content);

        return element;
    };
};

export const h1 = buildHeaderDslHelper("1");
export const h2 = buildHeaderDslHelper("2");
export const h3 = buildHeaderDslHelper("3");
export const h4 = buildHeaderDslHelper("4");
export const h5 = buildHeaderDslHelper("5");
export const h6 = buildHeaderDslHelper("6");


