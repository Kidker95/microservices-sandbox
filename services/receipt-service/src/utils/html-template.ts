import fs from "fs";
import path from "path";
import Handlebars from "handlebars";
import { ReceiptView } from "../models/types";



class HtmlTemplate {

    public loadTemplate(fileName: string): string {
        const fullPath = path.join(__dirname, "..", "templates", fileName);
        return fs.readFileSync(fullPath, "utf-8")
    }

    private loadSharedCss(): string {
        const sharedPath = path.join(process.cwd(), "..", "..", "infra", "shared", "shared.css");
        return fs.readFileSync(sharedPath, "utf-8");
    }


    public renderReceiptHtml(view: Omit<ReceiptView, "css">): string {
        const templateSoucre = this.loadTemplate("receipt.hbs");
        const sharedCss = this.loadSharedCss();
        const serviceCss = this.loadTemplate("receipt.css");
        const css = `${sharedCss}\n\n${serviceCss}`;


        const template = Handlebars.compile(templateSoucre);

        return template({ ...view, css });
    }
}

export const htmlTemplate = new HtmlTemplate();