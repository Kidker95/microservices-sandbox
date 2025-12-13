import fs from "fs";
import path from "path";
import Handlebars from "handlebars";
import { ReceiptView } from "../models/types";



class HtmlTemplate {

    public loadTemplate(fileName: string): string {
        const fullPath = path.join(__dirname, "..", "templates", fileName);
        return fs.readFileSync(fullPath,"utf-8")
    }

    public renderReceiptHtml(view:Omit<ReceiptView,"css">): string {
        const templateSoucre = this.loadTemplate("receipt.hbs");
        const css = this.loadTemplate("receipt.css");

        const template = Handlebars.compile(templateSoucre);
        
        return template({...view, css});
    }
}

export const htmlTemplate = new HtmlTemplate();