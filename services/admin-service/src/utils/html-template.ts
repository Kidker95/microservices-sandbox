import fs from "fs";
import path from "path";
import Handlebars from "handlebars";
import { DashboardViewModel } from "../models/types";



class HtmlTemplate {

    private registerHelpers(): void {
        // dateTime formated
        Handlebars.registerHelper("formatTime", (iso: string) => {
            if (!iso) return "";
            const date = new Date(iso);
    
            return date.toLocaleTimeString("en-GB", {
                hour: "2-digit",
                minute: "2-digit",
                second: "2-digit"
            });
        });

        // for runtime 
        Handlebars.registerHelper("formatDuration", (seconds: number) => {
            if (typeof seconds !== "number" || Number.isNaN(seconds)) return "";
        
            const s = Math.max(0, Math.floor(seconds));
            const h = Math.floor(s / 3600);
            const m = Math.floor((s % 3600) / 60);
            const sec = s % 60;
        
            if (h > 0) return `${h}h ${m}m ${sec}s`;
            if (m > 0) return `${m}m ${sec}s`;
            return `${sec}s`;
        });

        Handlebars.registerHelper("rtClass", (ms?: number) => {
            if (typeof ms !== "number" || Number.isNaN(ms)) return "rt-unknown";
            if (ms >= 200) return "rt-slow";
            if (ms >= 50) return "rt-medium";
            return "rt-fast";
        });
        
    }
    

    public loadTemplate(fileName: string): string {
        const distPath = path.join(process.cwd(), "dist", "templates", fileName);
        const srcPath = path.join(process.cwd(), "src", "templates", fileName);
    
        const fullPath = fs.existsSync(distPath) ? distPath : srcPath;
        return fs.readFileSync(fullPath, "utf-8");
    }
    

    public renderAdminPanel(view:DashboardViewModel): string {
        this.registerHelpers();
        const templateSoucre = this.loadTemplate("admin.hbs");
        const css = this.loadTemplate("admin.css");

        const template = Handlebars.compile(templateSoucre);
        
        return template({...view, css});
    }
}

export const htmlTemplate = new HtmlTemplate();