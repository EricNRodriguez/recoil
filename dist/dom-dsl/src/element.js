"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.mark = exports.kbd = exports.i = exports.em = exports.dfn = exports.data = exports.code = exports.cite = exports.br = exports.bdo = exports.bdi = exports.b = exports.abbr = exports.a = exports.ul = exports.pre = exports.p = exports.ol = exports.menu = exports.li = exports.hr = exports.figure = exports.figcaption = exports.dt = exports.dl = exports.div = exports.dd = exports.blockquote = exports.section = exports.nav = exports.main = exports.h6 = exports.h5 = exports.h4 = exports.h3 = exports.h2 = exports.h1 = exports.header = exports.footer = exports.aside = exports.article = exports.address = exports.body = exports.title = exports.style = exports.meta = exports.link = exports.head = exports.base = exports.html = void 0;
exports.t = exports.frag = exports.summary = exports.dialog = exports.details = exports.textarea = exports.select = exports.progress = exports.output = exports.option = exports.optgroup = exports.meter = exports.legend = exports.label = exports.input = exports.form = exports.fieldset = exports.datalist = exports.button = exports.tr = exports.thead = exports.th = exports.tfoot = exports.td = exports.tbody = exports.table = exports.colgroup = exports.col = exports.caption = exports.ins = exports.del = exports.wbr = exports.mvar = exports.time = exports.sup = exports.sub = exports.string = exports.span = exports.small = exports.samp = exports.s = exports.ruby = exports.rt = exports.rp = exports.q = void 0;
const dom_1 = require("../../dom");
const utils_1 = require("../../utils");
const util_1 = require("../../dom/src/util");
// prettier-ignore
const createDslElementBuilder = (tag) => {
    return (firstArg, ...remainingChildren) => {
        const adaptedFirstArg = (0, util_1.wrapTextInWNode)(firstArg);
        const adaptedRemainingChildren = remainingChildren.map(util_1.wrapTextInWNode);
        if ((0, utils_1.nullOrUndefined)(adaptedFirstArg)) {
            return (0, dom_1.createElement)(tag, {}, []);
        }
        else if ((0, dom_1.isWNode)(adaptedFirstArg)) {
            return (0, dom_1.createElement)(tag, {}, [adaptedFirstArg, ...adaptedRemainingChildren]);
        }
        else {
            return (0, dom_1.createElement)(tag, adaptedFirstArg, adaptedRemainingChildren);
        }
    };
};
// main root
exports.html = createDslElementBuilder("html");
// document metadata
exports.base = createDslElementBuilder("base");
exports.head = createDslElementBuilder("head");
exports.link = createDslElementBuilder("link");
exports.meta = createDslElementBuilder("meta");
exports.style = createDslElementBuilder("style");
exports.title = createDslElementBuilder("title");
// content sectioning
exports.body = createDslElementBuilder("body");
exports.address = createDslElementBuilder("address");
exports.article = createDslElementBuilder("article");
exports.aside = createDslElementBuilder("aside");
exports.footer = createDslElementBuilder("footer");
exports.header = createDslElementBuilder("header");
exports.h1 = createDslElementBuilder("h1");
exports.h2 = createDslElementBuilder("h2");
exports.h3 = createDslElementBuilder("h3");
exports.h4 = createDslElementBuilder("h4");
exports.h5 = createDslElementBuilder("h5");
exports.h6 = createDslElementBuilder("h6");
exports.main = createDslElementBuilder("main");
exports.nav = createDslElementBuilder("nav");
exports.section = createDslElementBuilder("section");
// text content
exports.blockquote = createDslElementBuilder("blockquote");
exports.dd = createDslElementBuilder("dd");
exports.div = createDslElementBuilder("div");
exports.dl = createDslElementBuilder("dl");
exports.dt = createDslElementBuilder("dt");
exports.figcaption = createDslElementBuilder("figcaption");
exports.figure = createDslElementBuilder("figure");
exports.hr = createDslElementBuilder("hr");
exports.li = createDslElementBuilder("li");
exports.menu = createDslElementBuilder("menu");
exports.ol = createDslElementBuilder("ol");
exports.p = createDslElementBuilder("p");
exports.pre = createDslElementBuilder("pre");
exports.ul = createDslElementBuilder("ul");
// inline text semantics
exports.a = createDslElementBuilder("a");
exports.abbr = createDslElementBuilder("abbr");
exports.b = createDslElementBuilder("b");
exports.bdi = createDslElementBuilder("bdi");
exports.bdo = createDslElementBuilder("bdo");
exports.br = createDslElementBuilder("br");
exports.cite = createDslElementBuilder("cite");
exports.code = createDslElementBuilder("code");
exports.data = createDslElementBuilder("data");
exports.dfn = createDslElementBuilder("dfn");
exports.em = createDslElementBuilder("em");
exports.i = createDslElementBuilder("i");
exports.kbd = createDslElementBuilder("kbd");
exports.mark = createDslElementBuilder("mark");
exports.q = createDslElementBuilder("q");
exports.rp = createDslElementBuilder("rp");
exports.rt = createDslElementBuilder("rt");
exports.ruby = createDslElementBuilder("ruby");
exports.s = createDslElementBuilder("s");
exports.samp = createDslElementBuilder("samp");
exports.small = createDslElementBuilder("small");
exports.span = createDslElementBuilder("span");
exports.string = createDslElementBuilder("strong");
exports.sub = createDslElementBuilder("sub");
exports.sup = createDslElementBuilder("sup");
exports.time = createDslElementBuilder("time");
exports.mvar = createDslElementBuilder("var");
exports.wbr = createDslElementBuilder("wbr");
// demarcating edits
exports.del = createDslElementBuilder("del");
exports.ins = createDslElementBuilder("ins");
// table content
exports.caption = createDslElementBuilder("caption");
exports.col = createDslElementBuilder("col");
exports.colgroup = createDslElementBuilder("colgroup");
exports.table = createDslElementBuilder("table");
exports.tbody = createDslElementBuilder("tbody");
exports.td = createDslElementBuilder("td");
exports.tfoot = createDslElementBuilder("tfoot");
exports.th = createDslElementBuilder("th");
exports.thead = createDslElementBuilder("thead");
exports.tr = createDslElementBuilder("tr");
// forms
exports.button = createDslElementBuilder("button");
exports.datalist = createDslElementBuilder("datalist");
exports.fieldset = createDslElementBuilder("fieldset");
exports.form = createDslElementBuilder("form");
exports.input = createDslElementBuilder("input");
exports.label = createDslElementBuilder("label");
exports.legend = createDslElementBuilder("legend");
exports.meter = createDslElementBuilder("meter");
exports.optgroup = createDslElementBuilder("optgroup");
exports.option = createDslElementBuilder("option");
exports.output = createDslElementBuilder("output");
exports.progress = createDslElementBuilder("progress");
exports.select = createDslElementBuilder("select");
exports.textarea = createDslElementBuilder("textarea");
// interactive
exports.details = createDslElementBuilder("details");
exports.dialog = createDslElementBuilder("dialog");
exports.summary = createDslElementBuilder("summary");
const frag = (...children) => (0, dom_1.createFragment)(children);
exports.frag = frag;
const t = (content) => (0, dom_1.createTextNode)(content);
exports.t = t;
//# sourceMappingURL=element.js.map